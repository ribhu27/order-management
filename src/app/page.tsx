import { MENU_ITEMS } from "@/lib/menu-data";
import { MenuItemCard } from "@/components/MenuItemCard";

export default function HomePage() {
  const categories = Array.from(new Set(MENU_ITEMS.map((item) => item.category)));

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h1 className="text-2xl font-bold tracking-tight">Order your favorites</h1>
        <p className="mt-1 text-neutral-600 dark:text-neutral-400">
          Browse the menu, add items to your cart, and check out in a few taps.
        </p>
      </section>

      {categories.map((category) => (
        <section key={category} className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">{category}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MENU_ITEMS.filter((item) => item.category === category).map((item) => (
              <MenuItemCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
