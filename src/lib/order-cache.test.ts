import { beforeEach, describe, expect, it } from "vitest";
import { cacheOrder, getCachedOrder } from "./order-cache";
import { Order } from "./types";

const order: Order = {
  id: "order-1",
  items: [{ menuItemId: "lemonade", name: "Fresh Lemonade", price: 3.49, quantity: 1 }],
  customer: { name: "Jane Doe", address: "123 Main St", phone: "555-123-4567" },
  total: 3.49,
  status: "received",
  createdAt: Date.now(),
};

beforeEach(() => {
  localStorage.clear();
});

describe("order-cache", () => {
  it("returns undefined for an order that was never cached", () => {
    expect(getCachedOrder("missing")).toBeUndefined();
  });

  it("round-trips a cached order by id", () => {
    cacheOrder(order);
    expect(getCachedOrder(order.id)).toEqual(order);
  });

  it("keeps multiple cached orders independently", () => {
    const other: Order = { ...order, id: "order-2" };
    cacheOrder(order);
    cacheOrder(other);
    expect(getCachedOrder(order.id)?.id).toBe("order-1");
    expect(getCachedOrder(other.id)?.id).toBe("order-2");
  });

  it("overwrites a previously cached order with the same id", () => {
    cacheOrder(order);
    cacheOrder({ ...order, total: 99 });
    expect(getCachedOrder(order.id)?.total).toBe(99);
  });
});
