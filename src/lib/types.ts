export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  /** A representative emoji, used instead of stock photography (see menu-data.ts). */
  emoji: string;
  category: string;
};

export type OrderStatus =
  | "received"
  | "preparing"
  | "out_for_delivery"
  | "delivered";

export const ORDER_STATUS_SEQUENCE: OrderStatus[] = [
  "received",
  "preparing",
  "out_for_delivery",
  "delivered",
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  received: "Order Received",
  preparing: "Preparing",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
};

export type OrderLineItem = {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
};

export type Customer = {
  name: string;
  address: string;
  phone: string;
};

export type Order = {
  id: string;
  items: OrderLineItem[];
  customer: Customer;
  total: number;
  status: OrderStatus;
  createdAt: number;
};

export type CartItem = {
  menuItemId: string;
  quantity: number;
};
