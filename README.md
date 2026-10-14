# FreshEats — Order Management

An Order Management feature for a food delivery app: browse a menu, build a cart,
check out with delivery details, and track order status in (simulated) real time.

Built for the RaftLabs Sr Full Stack Developer assessment.

**Live app:** https://order-management-ugru.vercel.app
**Repo:** https://github.com/ribhu27/order-management

## Stack

- **Next.js 16** (App Router, TypeScript) — a single app provides both the
  React front-end and the REST API (via Route Handlers), satisfying the
  assessment's "React with Vite or Next.js" + "REST API" requirements with one
  deployable unit.
- **Tailwind CSS 4** for styling.
- **Vitest + React Testing Library** for tests (TDD).
- In-memory data store (see [Data persistence](#data-persistence-tradeoff) below).

## Getting started

```bash
npm install
npm run dev       # http://localhost:3000
npm test          # run the test suite once
npm run test:watch
npm run build && npm start   # production build
```

## Feature walkthrough

1. **Menu (`/`)** — food items grouped by category, each with name, description,
   price, and image. "Add to cart" turns into a quantity stepper per item.
2. **Checkout (`/checkout`)** — review cart, adjust quantities, enter delivery
   details (name, address, phone). Client- and server-side validation.
3. **Order status (`/orders/[id]`)** — a stepper showing
   Received → Preparing → Out for Delivery → Delivered, polling the API every
   3 seconds so the status visibly advances without a page refresh.

## Architecture

```
src/
  lib/
    types.ts         shared domain types (MenuItem, Order, OrderStatus, ...)
    menu-data.ts      seed menu data + lookup helper
    status.ts         pure function: elapsed time -> OrderStatus
    validation.ts      input validation for order creation
    store.ts           in-memory persistence (createOrder, getOrderById, listOrders)
  app/
    page.tsx                   menu page (server component)
    checkout/page.tsx          cart + delivery form (client component)
    orders/[id]/page.tsx       server shell -> OrderStatusView (client)
    api/
      menu/route.ts            GET /api/menu
      orders/route.ts          GET/POST /api/orders
      orders/[id]/route.ts     GET /api/orders/:id
  components/          Header, MenuItemCard, CartContext, OrderStatusStepper, OrderStatusView
```

**Design choices:**

- **Status as a pure function of time** (`lib/status.ts`): rather than mutating
  order status with a background timer, `computeStatus(createdAt, now)` derives
  the status on every read. This is trivially unit-testable (pass in fake
  timestamps, no fake timers / sleeps needed) and safe under concurrent
  requests or process restarts — there's no stateful "ticker" to get out of
  sync. Because it's pure, the **client can compute it too**: `OrderStatusView`
  ticks a local clock every second and recomputes status from a cached
  `createdAt`, independent of the network. This is what makes the status page
  resilient to the in-memory store losing an order (see below) — status
  keeps advancing correctly even if the server-side record is gone, because
  the browser already has everything `computeStatus` needs. The view still
  syncs with `GET /api/orders/:id` every 5s on a best-effort basis to pick up
  genuinely server-side state.
- **Validation is a separate, pure module** (`lib/validation.ts`) so it's unit
  tested directly, independent of the HTTP layer, and reused identically by
  the route handler.
- **The REST API and the page that renders the menu both read from the same
  `menu-data.ts` module** — the home page imports it directly (fast SSR, no
  self-fetch over HTTP), while `/api/menu` exposes the same data as a REST
  endpoint for any other client. Order creation/retrieval always goes through
  the API, since that's genuinely request-scoped state.

### Data persistence tradeoff

Orders are kept in an in-memory `Map`, pinned to `globalThis` so it survives
Next.js dev-server hot reloads. This matches the assessment's "in-memory or a
simple database" option and keeps the whole app a single deployable Next.js
project.

**Caveat for serverless hosting (Vercel/Netlify):** serverless functions are
not guaranteed to stay warm or share memory across invocations. This isn't
hypothetical — testing the deployed app in a real browser showed the order
status page returning 404 within ~10 seconds of placing an order, because a
fresh Lambda instance with an empty store handled the next poll.

The fix (`lib/order-cache.ts`): the browser that places an order caches the
full order object in `localStorage` the moment the create-order API responds,
and `OrderStatusView` prefers that cache whenever the server 404s instead of
treating a missing server record as "order not found." Combined with
client-side status computation (above), this makes the one flow the
assessment actually exercises — place an order, watch its status — correct
regardless of server-side memory loss. The real gap it doesn't close: opening
an order link fresh (a different browser/device, or this one with storage
cleared) still depends on the server still holding that order. A production
version would close that gap by swapping `lib/store.ts` for a real store
(Postgres, Redis/Upstash, etc.) — every other module only depends on the
functions `store.ts` exports, so that's a one-file change.

## Testing

39 tests across the stack, run with `npm test`:

- **`lib/status.test.ts`** — status transitions at each time boundary, and
  that `delivered` is terminal.
- **`lib/validation.test.ts`** — required fields, unknown menu items, bad
  quantities, invalid phone numbers, whitespace trimming.
- **`lib/store.test.ts`** — order creation, totals, lookup by id, list
  ordering.
- **`lib/order-cache.test.ts`** — the localStorage cache round-trips and
  isolates multiple orders.
- **`app/api/**/*.test.ts`** — route handlers exercised directly (POST/GET),
  covering success, validation failures (400), malformed JSON (400), and
  not-found (404).
- **`components/*.test.tsx`** — cart interactions (add/increment/decrement),
  the status stepper's visual states, and `OrderStatusView`'s fallback to a
  cached order when the server 404s.

Several real bugs were caught by this suite and by testing the deployed app
in an actual browser (see commit history), not just by generating tests that
happened to pass:

- A sort-order tie when two orders share a millisecond timestamp.
- Cart state leaking between tests via `localStorage` not being cleared.
- The order-status page going to "Order not found" ~10s after placing an
  order **in production** — the in-memory store doesn't survive a serverless
  cold start. Caught by driving the live Vercel deployment with a headless
  browser end-to-end, not by the unit/component suite, since that's an
  infrastructure behavior no in-process test can see. Fixed per the
  [Data persistence tradeoff](#data-persistence-tradeoff) section above.

## Deployment

Deployed on Vercel at https://order-management-ugru.vercel.app, connected to
this repo's `master` branch (pushes redeploy automatically). No environment
variables are required.

```bash
vercel --prod   # redeploy manually if needed
```

## Use of AI

This project was built with Claude Code (Anthropic), used for:

- Scaffolding (`create-next-app`) and dependency setup.
- Generating the initial implementation of each module (types, store,
  validation, API routes, components, pages) from a short spec I reviewed
  and adjusted line by line.
- Writing the test suite alongside the implementation, then **using failing
  tests to find and fix real bugs** (see Testing section above) rather than
  just generating tests that happened to pass.
- After deploying, **driving the live app with a headless browser**
  (Playwright) through the actual user flow — browse, add to cart, checkout,
  watch order status — rather than stopping at "the build succeeded." That
  caught the in-memory-store-on-serverless bug above, which no unit or
  component test could have: it only shows up against the real deployment,
  over real time, through real HTTP. Passing tests and a clean build are not
  the same claim as "the feature works," and this project treats them
  differently.
- Diagnosing and fixing a Next.js 16-specific build error (Cache Components'
  static-shell prerendering validation on a dynamic, client-polled route) by
  reading the framework's own bundled docs rather than guessing from
  pre-training knowledge, since this Next.js version postdates it.

## Possible next steps

- Swap the in-memory store for Postgres/Redis for durability across
  serverless invocations.
- Replace polling with Server-Sent Events for lower-latency status updates.
- Add an admin view to manually advance/override order status.
- Replace `picsum.photos` placeholder images with real menu photography and
  move them to `next/image`'s optimized (non-`unoptimized`) path.
