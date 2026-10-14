import { OrderStatus, ORDER_STATUS_SEQUENCE } from "./types";

/**
 * How long (ms) an order spends in each non-terminal status before advancing.
 * Kept short so the "real-time" simulation is visible within a short demo/video.
 */
export const STATUS_DURATIONS_MS: Record<Exclude<OrderStatus, "delivered">, number> = {
  received: 10_000,
  preparing: 20_000,
  out_for_delivery: 20_000,
};

/**
 * Derives the current order status purely from elapsed time since creation.
 * This keeps status "live" without needing a background job/timer: every
 * read recomputes the right answer, which is safe across server restarts
 * and serverless cold starts as long as `createdAt` is known.
 */
export function computeStatus(createdAt: number, now: number = Date.now()): OrderStatus {
  const elapsed = now - createdAt;

  let cumulative = 0;
  for (const status of ORDER_STATUS_SEQUENCE) {
    if (status === "delivered") {
      return "delivered";
    }
    cumulative += STATUS_DURATIONS_MS[status];
    if (elapsed < cumulative) {
      return status;
    }
  }

  return "delivered";
}

export function isTerminalStatus(status: OrderStatus): boolean {
  return status === "delivered";
}
