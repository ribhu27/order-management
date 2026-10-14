import { getMenuItemById } from "./menu-data";

export type CreateOrderInput = {
  items?: unknown;
  customer?: unknown;
};

export type ValidatedOrderInput = {
  items: { menuItemId: string; quantity: number }[];
  customer: { name: string; address: string; phone: string };
};

export type ValidationResult =
  | { valid: true; data: ValidatedOrderInput }
  | { valid: false; errors: string[] };

const PHONE_REGEX = /^[0-9+()\-.\s]{7,20}$/;

export function validateCreateOrderInput(body: unknown): ValidationResult {
  const errors: string[] = [];

  if (typeof body !== "object" || body === null) {
    return { valid: false, errors: ["Request body must be a JSON object."] };
  }

  const { items, customer } = body as CreateOrderInput;

  const validatedItems: { menuItemId: string; quantity: number }[] = [];
  if (!Array.isArray(items) || items.length === 0) {
    errors.push("`items` must be a non-empty array.");
  } else {
    items.forEach((raw, index) => {
      if (typeof raw !== "object" || raw === null) {
        errors.push(`items[${index}] must be an object.`);
        return;
      }
      const { menuItemId, quantity } = raw as {
        menuItemId?: unknown;
        quantity?: unknown;
      };
      if (typeof menuItemId !== "string" || !menuItemId) {
        errors.push(`items[${index}].menuItemId is required.`);
        return;
      }
      if (!getMenuItemById(menuItemId)) {
        errors.push(`items[${index}].menuItemId "${menuItemId}" does not exist.`);
        return;
      }
      if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1) {
        errors.push(`items[${index}].quantity must be a positive integer.`);
        return;
      }
      validatedItems.push({ menuItemId, quantity });
    });
  }

  let validatedCustomer: ValidatedOrderInput["customer"] | null = null;
  if (typeof customer !== "object" || customer === null) {
    errors.push("`customer` is required.");
  } else {
    const { name, address, phone } = customer as {
      name?: unknown;
      address?: unknown;
      phone?: unknown;
    };
    if (typeof name !== "string" || name.trim().length < 2) {
      errors.push("customer.name must be at least 2 characters.");
    }
    if (typeof address !== "string" || address.trim().length < 5) {
      errors.push("customer.address must be at least 5 characters.");
    }
    if (typeof phone !== "string" || !PHONE_REGEX.test(phone.trim())) {
      errors.push("customer.phone must be a valid phone number.");
    }
    if (errors.length === 0) {
      validatedCustomer = {
        name: (name as string).trim(),
        address: (address as string).trim(),
        phone: (phone as string).trim(),
      };
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: { items: validatedItems, customer: validatedCustomer! },
  };
}
