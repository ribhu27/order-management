import { beforeEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "./route";
import { __resetStoreForTests } from "@/lib/store";

function postRequest(body: unknown) {
  return new NextRequest("http://localhost/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validBody = {
  items: [{ menuItemId: "margherita-pizza", quantity: 1 }],
  customer: { name: "Jane Doe", address: "123 Main St", phone: "555-123-4567" },
};

describe("/api/orders", () => {
  beforeEach(() => {
    __resetStoreForTests();
  });

  describe("POST", () => {
    it("creates an order and returns 201", async () => {
      const res = await POST(postRequest(validBody));
      const body = await res.json();

      expect(res.status).toBe(201);
      expect(body.order.id).toBeTruthy();
      expect(body.order.status).toBe("received");
    });

    it("returns 400 with details for invalid input", async () => {
      const res = await POST(postRequest({ items: [], customer: {} }));
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.error).toBe("Validation failed");
      expect(body.details.length).toBeGreaterThan(0);
    });

    it("returns 400 for malformed JSON", async () => {
      const req = new NextRequest("http://localhost/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{not json",
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });
  });

  describe("GET", () => {
    it("lists created orders", async () => {
      await POST(postRequest(validBody));
      const res = await GET();
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.orders).toHaveLength(1);
    });
  });
});
