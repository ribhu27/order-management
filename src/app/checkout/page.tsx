"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/components/CartContext";
import { MENU_ITEMS } from "@/lib/menu-data";
import { cacheOrder } from "@/lib/order-cache";

type FormState = {
  name: string;
  address: string;
  phone: string;
};

const INITIAL_FORM: FormState = { name: "", address: "", phone: "" };

export default function CheckoutPage() {
  const router = useRouter();
  const { items, setQuantity, removeItem, clear } = useCart();
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const lineItems = useMemo(
    () =>
      items
        .map((item) => {
          const menuItem = MENU_ITEMS.find((m) => m.id === item.menuItemId);
          if (!menuItem) return null;
          return { ...item, menuItem };
        })
        .filter((v): v is { menuItemId: string; quantity: number; menuItem: (typeof MENU_ITEMS)[number] } => v !== null),
    [items],
  );

  const total = lineItems.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(({ menuItemId, quantity }) => ({ menuItemId, quantity })),
          customer: form,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors(data.details ?? [data.error ?? "Something went wrong."]);
        return;
      }

      cacheOrder(data.order);
      clear();
      router.push(`/orders/${data.order.id}`);
    } catch {
      setErrors(["Could not reach the server. Please try again."]);
    } finally {
      setSubmitting(false);
    }
  }

  if (lineItems.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-lg font-medium">Your cart is empty.</p>
        <Link href="/" className="rounded-full bg-orange-500 px-5 py-2 text-sm font-medium text-white hover:bg-orange-600">
          Browse the menu
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_1fr]">
      <section className="flex flex-col gap-4">
        <h1 className="text-xl font-bold">Your cart</h1>
        <ul className="flex flex-col divide-y divide-black/10 rounded-xl border border-black/10 bg-white dark:divide-white/10 dark:border-white/10 dark:bg-neutral-900">
          {lineItems.map(({ menuItemId, quantity, menuItem }) => (
            <li key={menuItemId} className="flex items-center justify-between gap-4 p-4">
              <div className="flex-1">
                <p className="font-medium">{menuItem.name}</p>
                <p className="text-sm text-neutral-500">${menuItem.price.toFixed(2)} each</p>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-black/10 px-3 py-1 dark:border-white/10">
                <button
                  type="button"
                  aria-label={`Decrease quantity of ${menuItem.name}`}
                  onClick={() => setQuantity(menuItemId, quantity - 1)}
                  className="h-6 w-6 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
                >
                  −
                </button>
                <span className="w-4 text-center text-sm font-medium">{quantity}</span>
                <button
                  type="button"
                  aria-label={`Increase quantity of ${menuItem.name}`}
                  onClick={() => setQuantity(menuItemId, quantity + 1)}
                  className="h-6 w-6 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
                >
                  +
                </button>
              </div>
              <button
                type="button"
                onClick={() => removeItem(menuItemId)}
                className="text-sm text-red-500 hover:underline"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between rounded-xl border border-black/10 bg-white p-4 font-semibold dark:border-white/10 dark:bg-neutral-900">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-bold">Delivery details</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-neutral-900">
          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="text-sm font-medium">
              Full name
            </label>
            <input
              id="name"
              required
              minLength={2}
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="rounded-lg border border-black/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-orange-500 dark:border-white/15"
              placeholder="Jane Doe"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="address" className="text-sm font-medium">
              Delivery address
            </label>
            <input
              id="address"
              required
              minLength={5}
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              className="rounded-lg border border-black/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-orange-500 dark:border-white/15"
              placeholder="123 Main St, Springfield"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="phone" className="text-sm font-medium">
              Phone number
            </label>
            <input
              id="phone"
              required
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="rounded-lg border border-black/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-orange-500 dark:border-white/15"
              placeholder="(555) 123-4567"
            />
          </div>

          {errors.length > 0 && (
            <ul className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
              {errors.map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Placing order..." : `Place order · $${total.toFixed(2)}`}
          </button>
        </form>
      </section>
    </div>
  );
}
