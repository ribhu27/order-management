"use client";

import Image from "next/image";
import { MenuItem } from "@/lib/types";
import { useCart } from "./CartContext";

export function MenuItemCard({ item }: { item: MenuItem }) {
  const { items, addItem, setQuantity } = useCart();
  const cartItem = items.find((i) => i.menuItemId === item.id);

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm dark:border-white/10 dark:bg-neutral-900">
      <div className="relative h-40 w-full bg-neutral-100 dark:bg-neutral-800">
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="(max-width: 768px) 100vw, 300px"
          className="object-cover"
          unoptimized
        />
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
