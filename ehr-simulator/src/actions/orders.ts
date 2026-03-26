"use server"

import { createClient } from "@supabase/supabase-js"
import { Database } from "../../database.types"
import { revalidatePath } from "next/cache"
import { ActionResponse } from "@/actions/cases"

export type OrderRow = Database['public']['Tables']['orders']['Row']
export type OrderInsert = Database['public']['Tables']['orders']['Insert']

export async function getOrdersForCase(caseId: string): Promise<ActionResponse<OrderRow[]>> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('case_id', caseId)
    .order('created_at')

  if (error) return { success: false, message: 'Failed to fetch orders.', error }
  return { success: true, message: 'ok', data: data as OrderRow[] }
}

export async function replaceOrders(
  caseId: string,
  orders: Omit<OrderInsert, 'case_id'>[]
): Promise<ActionResponse> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error: deleteError } = await supabase
    .from('orders')
    .delete()
    .eq('case_id', caseId)

  if (deleteError) return { success: false, message: 'Failed to clear orders.', error: deleteError }

  if (orders.length === 0) return { success: true, message: 'Orders cleared.' }

  const { error: insertError } = await supabase
    .from('orders')
    .insert(orders.map(o => ({ ...o, case_id: caseId })))

  if (insertError) return { success: false, message: 'Failed to insert orders.', error: insertError }

  revalidatePath('/admin/cases')
  return { success: true, message: 'Orders saved.' }
}