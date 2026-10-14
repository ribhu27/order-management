import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MenuItemCard } from "./MenuItemCard";
import { CartProvider } from "./CartContext";
import { MENU_ITEMS } from "@/lib/menu-data";

const item = MENU_ITEMS[0];

beforeEach(() => {
  localStorage.clear();
});

function renderCard() {
  return render(
    <CartProvider>
      <MenuItemCard item={item} />
    </CartProvider>,
  );
}

describe("MenuItemCard", () => {
  it("shows name, description, and price", () => {
    renderCard();
    expect(screen.getByText(item.name)).toBeInTheDocument();
    expect(screen.getByText(item.description)).toBeInTheDocument();
    expect(screen.getByText(`$${item.price.toFixed(2)}`)).toBeInTheDocument();
  });

  it("switches from an 'Add to cart' button to a quantity stepper once added", async () => {
    const user = userEvent.setup();
    renderCard();

    expect(screen.getByRole("button", { name: /add to cart/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /add to cart/i }));

    expect(screen.getByTestId(`quantity-${item.id}`)).toHaveTextContent("1");
    expect(screen.queryByRole("button", { name: /add to cart/i })).not.toBeInTheDocument();
  });

  it("increments and decrements quantity", async () => {
    const user = userEvent.setup();
    renderCard();

    await user.click(screen.getByRole("button", { name: /add to cart/i }));
    await user.click(screen.getByRole("button", { name: new RegExp(`increase quantity of ${item.name}`, "i") }));

    expect(screen.getByTestId(`quantity-${item.id}`)).toHaveTextContent("2");

    await user.click(screen.getByRole("button", { name: new RegExp(`decrease quantity of ${item.name}`, "i") }));
    expect(screen.getByTestId(`quantity-${item.id}`)).toHaveTextContent("1");
  });
});
