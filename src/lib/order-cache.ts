import { Order } from "./types";

const STORAGE_KEY = "order-management.orders";

/**
 * Client-side cache of orders the current browser has placed, keyed by id.
 *
 * Why this exists: order *status* is a pure function of `createdAt` (see
 * status.ts), so once a browser has the static order fields (items,
 * customer, total, createdAt), it never needs the server again to keep
 * showing a live-advancing status — it can recompute `computeStatus`
 * locally. That makes the order-status page resilient to the in-memory
 * store (store.ts) losing the order between requests, which happens in
 * practice on serverless hosts when a cold instance replaces the one that
 * held it in memory.
 */
function readAll(): Record<string, Order> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function cacheOrder(order: Order): void {
  try {
    const all = readAll();
    all[order.id] = order;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // ignore unavailable storage (private browsing, quota, etc.)
  }
}

export function getCachedOrder(id: string): Order | undefined {
  return readAll()[id];
}
