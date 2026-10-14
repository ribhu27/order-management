"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { CartItem, MenuItem } from "@/lib/types";

const STORAGE_KEY = "order-management.cart";

type CartContextValue = {
  items: CartItem[];
  addItem: (menuItemId: string) => void;
  removeItem: (menuItemId: string) => void;
  setQuantity: (menuItemId: string, quantity: number) => void;
  clear: () => void;
  totalItems: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // One-time hydration from localStorage on mount: localStorage isn't
    // available during SSR, so this can't be a lazy useState initializer
    // without risking a server/client markup mismatch.
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from an external store (localStorage) on mount
      if (stored) setItems(JSON.parse(stored));
    } catch {
      // ignore malformed/unavailable storage
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore storage write failures (e.g. private browsing)
    }
  }, [items, hydrated]);

  const addItem = useCallback((menuItemId: string) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.menuItemId === menuItemId);
      if (existing) {
        return prev.map((item) =>
          item.menuItemId === menuItemId
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { menuItemId, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((menuItemId: string) => {
    setItems((prev) => prev.filter((item) => item.menuItemId !== menuItemId));
  }, []);

  const setQuantity = useCallback((menuItemId: string, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) {
        return prev.filter((item) => item.menuItemId !== menuItemId);
      }
      return prev.map((item) =>
        item.menuItemId === menuItemId ? { ...item, quantity } : item,
      );
    });
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const value = useMemo(
    () => ({ items, addItem, removeItem, setQuantity, clear, totalItems }),
    [items, addItem, removeItem, setQuantity, clear, totalItems],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}

export function cartTotal(items: CartItem[], menuItems: MenuItem[]): number {
  return items.reduce((sum, item) => {
    const menuItem = menuItems.find((m) => m.id === item.menuItemId);
    return sum + (menuItem ? menuItem.price * item.quantity : 0);
  }, 0);
}
