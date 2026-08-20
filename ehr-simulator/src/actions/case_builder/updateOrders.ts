"use server"

import type { SupabaseClient } from "@supabase/supabase-js";
import type { OrderType } from "@/app/simulation/[caseId]/[sessionId]/chart/orders/components/orderData";

export async function updateOrders(
  supabase: SupabaseClient,
  orders: OrderType[],
  caseId: string,
) {

  const rows = orders.map((order) => ({
    category: order.category,
    title: order.title,
    details: order.details,
    status: order.status,
    provider: order.orderingProvider,
    is_important: order.important,
    is_in_presim: order.visibleInPresim,
    phase: Number(order.phase ?? 1),
  }));

  const { error } = await supabase.rpc("case_builder_replace_orders", {
    p_case_id: caseId,
    p_rows: rows,
  });

  if (error) {
    throw new Error(error.message);
  }
  return rows;
}
