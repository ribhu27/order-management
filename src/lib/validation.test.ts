import { describe, expect, it } from "vitest";
import { validateCreateOrderInput } from "./validation";

const validCustomer = { name: "Jane Doe", address: "123 Main St", phone: "555-123-4567" };
const validItems = [{ menuItemId: "margherita-pizza", quantity: 2 }];

describe("validateCreateOrderInput", () => {
  it("accepts a well-formed order", () => {
    const result = validateCreateOrderInput({ items: validItems, customer: validCustomer });
    expect(result.valid).toBe(true);
  });

  it("rejects a non-object body", () => {
    const result = validateCreateOrderInput("not an object");
    expect(result.valid).toBe(false);
  });

  it("rejects an empty items array", () => {
    const result = validateCreateOrderInput({ items: [], customer: validCustomer });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.join(" ")).toMatch(/non-empty array/);
    }
  });

  it("rejects items with an unknown menuItemId", () => {
    const result = validateCreateOrderInput({
      items: [{ menuItemId: "does-not-exist", quantity: 1 }],
      customer: validCustomer,
    });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.join(" ")).toMatch(/does not exist/);
    }
  });

  it("rejects a non-positive or non-integer quantity", () => {
    const zero = validateCreateOrderInput({
      items: [{ menuItemId: "margherita-pizza", quantity: 0 }],
      customer: validCustomer,
    });
    const fractional = validateCreateOrderInput({
      items: [{ menuItemId: "margherita-pizza", quantity: 1.5 }],
      customer: validCustomer,
    });
    expect(zero.valid).toBe(false);
    expect(fractional.valid).toBe(false);
  });

  it("rejects a missing customer", () => {
    const result = validateCreateOrderInput({ items: validItems });
    expect(result.valid).toBe(false);
  });

  it("rejects a short name, short address, and invalid phone", () => {
    const result = validateCreateOrderInput({
      items: validItems,
      customer: { name: "J", address: "St", phone: "abc" },
    });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors).toHaveLength(3);
    }
  });

  it("trims whitespace from valid customer fields", () => {
    const result = validateCreateOrderInput({
      items: validItems,
      customer: { name: "  Jane Doe  ", address: "  123 Main St  ", phone: " 555-123-4567 " },
    });
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data.customer.name).toBe("Jane Doe");
    }
  });
});
