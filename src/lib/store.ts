import { getMenuItemById } from "./menu-data";
import { computeStatus } from "./status";
import { Order, OrderLineItem, Customer } from "./types";
import { ValidatedOrderInput } from "./validation";

/**
 * In-memory order store. Kept on `globalThis` so it survives Next.js dev
 * server hot-reloads (which otherwise re-evaluate this module and wipe
 * module-level state). This is intentionally simple per the assessment
 * spec ("in-memory or a simple database"); swapping in a real database
 * would mean replacing this file only — callers only see the functions
 * below.
 */
type OrderStore = Map<string, Order>;

const globalForStore = globalThis as unknown as {
  __orderStore?: OrderStore;
  __orderSequence?: Map<string, number>;
  __orderSeqCounter?: number;
};

function getStore(): OrderStore {
  if (!globalForStore.__orderStore) {
    globalForStore.__orderStore = new Map();
  }
  return globalForStore.__orderStore;
}

/** Monotonic insertion order, used as a sort tiebreaker when `createdAt` timestamps collide. */
function getSequenceMap(): Map<string, number> {
  if (!globalForStore.__orderSequence) {
    globalForStore.__orderSequence = new Map();
  }
  return globalForStore.__orderSequence;
}

function nextSequence(orderId: string): void {
  globalForStore.__orderSeqCounter = (globalForStore.__orderSeqCounter ?? 0) + 1;
  getSequenceMap().set(orderId, globalForStore.__orderSeqCounter);
}

function buildLineItems(items: ValidatedOrderInput["items"]): OrderLineItem[] {
  return items.map(({ menuItemId, quantity }) => {
    const menuItem = getMenuItemById(menuItemId);
    if (!menuItem) {
      throw new Error(`Unknown menu item: ${menuItemId}`);
    }
    return {
      menuItemId,
      name: menuItem.name,
      price: menuItem.price,
      quantity,
    };
  });
}

export function createOrder(input: ValidatedOrderInput): Order {
  const lineItems = buildLineItems(input.items);
  const total = lineItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const order: Order = {
    id: crypto.randomUUID(),
    items: lineItems,
    customer: input.customer as Customer,
    total: Math.round(total * 100) / 100,
    status: "received",
    createdAt: Date.now(),
  };

  getStore().set(order.id, order);
  nextSequence(order.id);
  return order;
}

/** Returns the order with its status freshly computed from elapsed time. */
export function getOrderById(id: string): Order | undefined {
  const order = getStore().get(id);
  if (!order) return undefined;
  return { ...order, status: computeStatus(order.createdAt) };
}

export function listOrders(): Order[] {
  const sequence = getSequenceMap();
  return Array.from(getStore().values())
    .sort((a, b) => {
      if (b.createdAt !== a.createdAt) return b.createdAt - a.createdAt;
      return (sequence.get(b.id) ?? 0) - (sequence.get(a.id) ?? 0);
    })
    .map((order) => ({ ...order, status: computeStatus(order.createdAt) }));
}

/** Test-only helper to reset state between test cases. */
export function __resetStoreForTests(): void {
  getStore().clear();
  getSequenceMap().clear();
  globalForStore.__orderSeqCounter = 0;
}
