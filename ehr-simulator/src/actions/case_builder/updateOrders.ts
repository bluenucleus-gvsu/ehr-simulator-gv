"use server"

import type { SupabaseClient } from "@supabase/supabase-js";
import type { OrderFormRow } from "@/lib/orders";

export async function updateOrders(
  supabase: SupabaseClient,
  orders: OrderFormRow[],
  caseId: string,
) {
  const { error } = await supabase.rpc("case_builder_replace_orders", {
    p_case_id: caseId,
    p_rows: orders,
  });

  if (error) {
    throw new Error(error.message);
  }
  return orders;
}
