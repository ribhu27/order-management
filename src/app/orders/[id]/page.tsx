import { OrderStatusView } from "@/components/OrderStatusView";

// This page's content is inherently live (client-polled order status), so it
// can't produce a meaningful static shell — opt it out of prerendering.
export const instant = false;

export default async function OrderStatusPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OrderStatusView id={id} />;
}
