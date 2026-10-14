"use client";

import Link from "next/link";
import { useCart } from "./CartContext";

export function Header() {
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-10 border-b border-black/10 bg-white/90 backdrop-blur dark:border-white/10 dark:bg-black/80">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          🍔 FreshEats
        </Link>
        <Link
          href="/checkout"
          className="relative flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-600"
        >
          Cart
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-xs font-bold text-orange-600">
            {totalItems}
          </span>
        </Link>
      </div>
    </header>
  );
}
