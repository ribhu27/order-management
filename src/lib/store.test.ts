import { beforeEach, describe, expect, it } from "vitest";
import { createOrder, getOrderById, listOrders, __resetStoreForTests } from "./store";

const customer = { name: "Jane Doe", address: "123 Main St", phone: "555-123-4567" };

describe("order store", () => {
  beforeEach(() => {
    __resetStoreForTests();
  });

  it("creates an order with a computed total and 'received' status", () => {
    const order = createOrder({
      items: [{ menuItemId: "margherita-pizza", quantity: 2 }],
      customer,
    });

    expect(order.id).toBeTruthy();
    expect(order.status).toBe("received");
    expect(order.items).toEqual([
      { menuItemId: "margherita-pizza", name: "Margherita Pizza", price: 9.99, quantity: 2 },
    ]);
    expect(order.total).toBeCloseTo(19.98, 2);
  });

  it("sums totals across multiple distinct items", () => {
    const order = createOrder({
      items: [
        { menuItemId: "margherita-pizza", quantity: 1 },
        { menuItemId: "lemonade", quantity: 2 },
      ],
      customer,
    });

    expect(order.total).toBeCloseTo(9.99 + 3.49 * 2, 2);
  });

  it("retrieves a created order by id", () => {
    const created = createOrder({ items: [{ menuItemId: "lemonade", quantity: 1 }], customer });
    const fetched = getOrderById(created.id);
    expect(fetched?.id).toBe(created.id);
  });

  it("returns undefined for an unknown id", () => {
    expect(getOrderById("not-a-real-id")).toBeUndefined();
  });

  it("lists orders most-recent first", () => {
    const first = createOrder({ items: [{ menuItemId: "lemonade", quantity: 1 }], customer });
    const second = createOrder({ items: [{ menuItemId: "lemonade", quantity: 1 }], customer });

    const orders = listOrders();
    expect(orders[0].id).toBe(second.id);
    expect(orders[1].id).toBe(first.id);
  });
});
