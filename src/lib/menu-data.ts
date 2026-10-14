import { MenuItem } from "./types";

export const MENU_ITEMS: MenuItem[] = [
  {
    id: "margherita-pizza",
    name: "Margherita Pizza",
    description: "Classic pizza with fresh mozzarella, tomato sauce, and basil.",
    price: 9.99,
    image: "https://picsum.photos/seed/margherita-pizza/400/300",
    category: "Pizza",
  },
  {
    id: "pepperoni-pizza",
    name: "Pepperoni Pizza",
    description: "Loaded with pepperoni and mozzarella on a crisp crust.",
    price: 11.49,
    image: "https://picsum.photos/seed/pepperoni-pizza/400/300",
    category: "Pizza",
  },
  {
    id: "classic-cheeseburger",
    name: "Classic Cheeseburger",
    description: "Beef patty, cheddar, lettuce, tomato, and house sauce.",
    price: 8.49,
    image: "https://picsum.photos/seed/cheeseburger/400/300",
    category: "Burgers",
  },
  {
    id: "veggie-burger",
    name: "Veggie Burger",
    description: "Grilled veggie patty with avocado and chipotle mayo.",
    price: 7.99,
    image: "https://picsum.photos/seed/veggie-burger/400/300",
    category: "Burgers",
  },
  {
    id: "caesar-salad",
    name: "Caesar Salad",
    description: "Crisp romaine, parmesan, croutons, and Caesar dressing.",
    price: 6.99,
    image: "https://picsum.photos/seed/caesar-salad/400/300",
    category: "Salads",
  },
  {
    id: "loaded-fries",
    name: "Loaded Fries",
    description: "Crispy fries topped with cheese, bacon bits, and scallions.",
    price: 5.49,
    image: "https://picsum.photos/seed/loaded-fries/400/300",
    category: "Sides",
  },
  {
    id: "chocolate-shake",
    name: "Chocolate Shake",
    description: "Rich and creamy chocolate milkshake.",
    price: 4.49,
    image: "https://picsum.photos/seed/chocolate-shake/400/300",
    category: "Drinks",
  },
  {
    id: "lemonade",
    name: "Fresh Lemonade",
    description: "Hand-squeezed lemonade over ice.",
    price: 3.49,
    image: "https://picsum.photos/seed/lemonade/400/300",
    category: "Drinks",
  },
];

export function getMenuItemById(id: string): MenuItem | undefined {
  return MENU_ITEMS.find((item) => item.id === id);
}
