import { NextRequest, NextResponse } from "next/server";
import { createOrder, listOrders } from "@/lib/store";
import { validateCreateOrderInput } from "@/lib/validation";

export async function GET() {
  return NextResponse.json({ orders: listOrders() });
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const result = validateCreateOrderInput(body);
  if (!result.valid) {
    return NextResponse.json({ error: "Validation failed", details: result.errors }, { status: 400 });
  }

  const order = createOrder(result.data);
  return NextResponse.json({ order }, { status: 201 });
}
