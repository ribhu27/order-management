"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Order } from "@/lib/types";
import { OrderStatusStepper } from "@/components/OrderStatusStepper";

const POLL_INTERVAL_MS = 3000;

export function OrderStatusView({ id }: { id: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${id}`, { cache: "no-store" });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(data.error ?? "Order not found.");
          return;
        }
        setOrder(data.order);
      } catch {
        if (!cancelled) setError("Could not reach the server.");
      }
    }

    fetchOrder();
    const interval = setInterval(fetchOrder, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [id]);

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-lg font-medium">{error}</p>
        <Link href="/" className="rounded-full bg-orange-500 px-5 py-2 text-sm font-medium text-white hover:bg-orange-600">
          Back to menu
        </Link>
      </div>
    );
  }

  if (!order) {
    return <p className="py-16 text-center text-neutral-500">Loading order...</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-2">
        <h1 className="text-xl font-bold">Order status</h1>
        <p className="text-sm text-neutral-500">
          Order #{order.id.slice(0, 8)} · Placed{" "}
          {new Date(order.createdAt).toLocaleTimeString()}
        </p>
      </section>

      <section className="rounded-xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-neutral-900">
        <OrderStatusStepper status={order.status} />
        <p className="mt-4 text-xs text-neutral-400">
          This page refreshes automatically every few seconds.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Order details</h2>
        <ul className="flex flex-col divide-y divide-black/10 rounded-xl border border-black/10 bg-white dark:divide-white/10 dark:border-white/10 dark:bg-neutral-900">
          {order.items.map((item) => (
            <li key={item.menuItemId} className="flex items-center justify-between p-4">
              <span>
                {item.quantity} × {item.name}
              </span>
              <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between rounded-xl border border-black/10 bg-white p-4 font-semibold dark:border-white/10 dark:bg-neutral-900">
          <span>Total</span>
          <span>${order.total.toFixed(2)}</span>
        </div>
      </section>

      <section className="flex flex-col gap-2 text-sm text-neutral-600 dark:text-neutral-400">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Delivering to
        </h2>
        <p>{order.customer.name}</p>
        <p>{order.customer.address}</p>
        <p>{order.customer.phone}</p>
      </section>

      <Link href="/" className="text-sm font-medium text-orange-600 hover:underline">
        ← Back to menu
      </Link>
    </div>
  );
}
