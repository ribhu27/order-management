"use client";

import { MenuItem } from "@/lib/types";
import { useCart } from "./CartContext";

const CATEGORY_GRADIENTS: Record<string, string> = {
  Pizza: "from-amber-100 to-orange-200 dark:from-amber-950 dark:to-orange-900",
  Burgers: "from-yellow-100 to-amber-200 dark:from-yellow-950 dark:to-amber-900",
  Salads: "from-lime-100 to-green-200 dark:from-lime-950 dark:to-green-900",
  Sides: "from-orange-100 to-red-200 dark:from-orange-950 dark:to-red-900",
  Drinks: "from-sky-100 to-cyan-200 dark:from-sky-950 dark:to-cyan-900",
};

export function MenuItemCard({ item }: { item: MenuItem }) {
  const { items, addItem, setQuantity } = useCart();
  const cartItem = items.find((i) => i.menuItemId === item.id);
  const gradient = CATEGORY_GRADIENTS[item.category] ?? "from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700";

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm dark:border-white/10 dark:bg-neutral-900">
      <div
        className={`flex h-40 w-full items-center justify-center bg-gradient-to-br ${gradient}`}
        aria-hidden="true"
      >
        <span className="text-6xl">{item.emoji}</span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold">{item.name}</h3>
          <span className="whitespace-nowrap font-semibold text-orange-600">
            ${item.price.toFixed(2)}
          </span>
        </div>
        <p className="flex-1 text-sm text-neutral-600 dark:text-neutral-400">
          {item.description}
        </p>

        {cartItem ? (
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-3 rounded-full border border-black/10 px-3 py-1 dark:border-white/10">
              <button
                type="button"
                aria-label={`Decrease quantity of ${item.name}`}
                onClick={() => setQuantity(item.id, cartItem.quantity - 1)}
                className="h-6 w-6 rounded-full text-lg leading-none hover:bg-black/5 dark:hover:bg-white/10"
              >
                −
              </button>
              <span data-testid={`quantity-${item.id}`} className="w-4 text-center text-sm font-medium">
                {cartItem.quantity}
              </span>
              <button
                type="button"
                aria-label={`Increase quantity of ${item.name}`}
                onClick={() => setQuantity(item.id, cartItem.quantity + 1)}
                className="h-6 w-6 rounded-full text-lg leading-none hover:bg-black/5 dark:hover:bg-white/10"
              >
                +
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => addItem(item.id)}
            className="mt-2 rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            Add to cart
          </button>
        )}
      </div>
    </div>
  );
}
