import { beforeEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "./route";
import { createOrder, __resetStoreForTests } from "@/lib/store";

const customer = { name: "Jane Doe", address: "123 Main St", phone: "555-123-4567" };

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe("GET /api/orders/[id]", () => {
  beforeEach(() => {
    __resetStoreForTests();
  });

  it("returns the order when found", async () => {
    const order = createOrder({ items: [{ menuItemId: "lemonade", quantity: 1 }], customer });

    const res = await GET(new NextRequest("http://localhost"), makeParams(order.id));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.order.id).toBe(order.id);
  });

  it("returns 404 when the order does not exist", async () => {
    const res = await GET(new NextRequest("http://localhost"), makeParams("missing-id"));
    expect(res.status).toBe(404);
  });
});
