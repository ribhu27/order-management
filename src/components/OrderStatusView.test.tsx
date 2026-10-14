import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { OrderStatusView } from "./OrderStatusView";
import { cacheOrder } from "@/lib/order-cache";
import { Order } from "@/lib/types";

const order: Order = {
  id: "order-1",
  items: [{ menuItemId: "lemonade", name: "Fresh Lemonade", price: 3.49, quantity: 2 }],
  customer: { name: "Jane Doe", address: "123 Main St", phone: "555-123-4567" },
  total: 6.98,
  status: "received",
  createdAt: Date.now(),
};

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("OrderStatusView", () => {
  it("renders order details from the server when the fetch succeeds", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ order }),
      }),
    );

    render(<OrderStatusView id={order.id} />);

    expect(await screen.findByText("Order status")).toBeInTheDocument();
    expect(screen.getByText(/2 × Fresh Lemonade/)).toBeInTheDocument();
  });

  it("falls back to the locally cached order when the server 404s", async () => {
    cacheOrder(order);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: "Order not found" }),
      }),
    );

    render(<OrderStatusView id={order.id} />);

    // Should show the cached order rather than "Order not found", since the
    // in-memory server store can legitimately lose orders (serverless cold
    // starts) while the browser that placed the order still knows about it.
    expect(await screen.findByText("Order status")).toBeInTheDocument();
    expect(screen.queryByText("Order not found.")).not.toBeInTheDocument();
  });

  it("shows 'Order not found' when there is neither a server record nor a cached one", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: "Order not found" }),
      }),
    );

    render(<OrderStatusView id="unknown-order" />);

    await waitFor(() => expect(screen.getByText("Order not found.")).toBeInTheDocument());
  });
});
