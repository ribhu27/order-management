"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Order } from "@/lib/types";
import { computeStatus } from "@/lib/status";
import { cacheOrder, getCachedOrder } from "@/lib/order-cache";
import { OrderStatusStepper } from "@/components/OrderStatusStepper";

const SYNC_INTERVAL_MS = 5000;
const TICK_INTERVAL_MS = 1000;

export function OrderStatusView({ id }: { id: string }) {
  const [orderData, setOrderData] = useState<Order | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [notFound, setNotFound] = useState(false);
  const hasDataRef = useRef(false);

  useEffect(() => {
    // Re-sync local state when `id` changes (e.g. navigating directly
    // between two order-status pages) rather than showing stale data.
    hasDataRef.current = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting view state for a new `id`, not a cascading update
    setOrderData(null);
    setNotFound(false);

    const cached = getCachedOrder(id);
    if (cached) {
      hasDataRef.current = true;
      setOrderData(cached);
    }

    let cancelled = false;

    async function sync() {
      try {
        const res = await fetch(`/api/orders/${id}`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (cancelled) return;
          hasDataRef.current = true;
          setOrderData(data.order);
          cacheOrder(data.order);
          setNotFound(false);
          return;
        }
      } catch {
        // network error: fall through to the "do we have anything?" check below
      }
      // The order may simply be missing from the server's in-memory store
      // (e.g. a serverless cold start recycled it) - only show "not found"
      // if we never had data for it from anywhere, cache included.
      if (!cancelled && !hasDataRef.current) {
        setNotFound(true);
      }
    }

    sync();
    const syncInterval = setInterval(sync, SYNC_INTERVAL_MS);
    const tickInterval = setInterval(() => setNow(Date.now()), TICK_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(syncInterval);
      clearInterval(tickInterval);
    };
  }, [id]);

  if (notFound) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-lg font-medium">Order not found.</p>
        <Link href="/" className="rounded-full bg-orange-500 px-5 py-2 text-sm font-medium text-white hover:bg-orange-600">
          Back to menu
        </Link>
      </div>
    );
  }

  if (!orderData) {
    return <p className="py-16 text-center text-neutral-500">Loading order...</p>;
  }

  const status = computeStatus(orderData.createdAt, now);

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-2">
        <h1 className="text-xl font-bold">Order status</h1>
        <p className="text-sm text-neutral-500">
          Order #{orderData.id.slice(0, 8)} · Placed{" "}
          {new Date(orderData.createdAt).toLocaleTimeString()}
        </p>
      </section>

      <section className="rounded-xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-neutral-900">
        <OrderStatusStepper status={status} />
        <p className="mt-4 text-xs text-neutral-400">
          This page updates automatically as the order progresses.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Order details</h2>
        <ul className="flex flex-col divide-y divide-black/10 rounded-xl border border-black/10 bg-white dark:divide-white/10 dark:border-white/10 dark:bg-neutral-900">
          {orderData.items.map((item) => (
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
          <span>${orderData.total.toFixed(2)}</span>
        </div>
      </section>

      <section className="flex flex-col gap-2 text-sm text-neutral-600 dark:text-neutral-400">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Delivering to
        </h2>
        <p>{orderData.customer.name}</p>
        <p>{orderData.customer.address}</p>
        <p>{orderData.customer.phone}</p>
      </section>

      <Link href="/" className="text-sm font-medium text-orange-600 hover:underline">
        ← Back to menu
      </Link>
    </div>
  );
}
