# FreshEats — Order Management

An Order Management feature for a food delivery app: browse a menu, build a cart,
check out with delivery details, and track order status in (simulated) real time.

Built for the RaftLabs Sr Full Stack Developer assessment.

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
  sync. The front-end polls every 3s, so the UI reflects the computed status
  "in real time" without WebSockets/SSE infrastructure.
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
not guaranteed to stay warm or share memory across invocations, so orders can
disappear between requests once the instance recycles. For this assessment
that's an acceptable, explicitly-documented tradeoff given the time box; a
production version would swap `lib/store.ts` for a real store (Postgres,
Redis/Upstash, etc.) — every other module only depends on the functions
`store.ts` exports, so that's a one-file change.

## Testing

32 tests across the stack, run with `npm test`:

- **`lib/status.test.ts`** — status transitions at each time boundary, and
  that `delivered` is terminal.
- **`lib/validation.test.ts`** — required fields, unknown menu items, bad
  quantities, invalid phone numbers, whitespace trimming.
- **`lib/store.test.ts`** — order creation, totals, lookup by id, list
  ordering.
- **`app/api/**/*.test.ts`** — route handlers exercised directly (POST/GET),
  covering success, validation failures (400), malformed JSON (400), and
  not-found (404).
- **`components/*.test.tsx`** — cart interactions (add/increment/decrement)
  and the status stepper's visual states.

Two real bugs were caught by this suite while building it (see commit
history): a sort-order tie when two orders share a millisecond timestamp, and
cart state leaking between tests via `localStorage` not being cleared.

## Deployment

Deploy as a standard Next.js app:

```bash
vercel        # or: netlify deploy
```

No environment variables are required.

## Use of AI

This project was built with Claude Code (Anthropic), used for:

- Scaffolding (`create-next-app`) and dependency setup.
- Generating the initial implementation of each module (types, store,
  validation, API routes, components, pages) from a short spec I reviewed
  and adjusted line by line.
- Writing the test suite alongside the implementation, then **using failing
  tests to find and fix two real bugs** (see Testing section above) rather
  than just generating tests that happened to pass.
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
