import { describe, expect, it } from "vitest";
import { GET } from "./route";
import { MENU_ITEMS } from "@/lib/menu-data";

describe("GET /api/menu", () => {
  it("returns the full menu", async () => {
    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.items).toHaveLength(MENU_ITEMS.length);
    expect(body.items[0]).toMatchObject({ id: expect.any(String), name: expect.any(String) });
  });
});
