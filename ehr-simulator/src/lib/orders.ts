import type { Database } from "../../database.types";

/** `orders` row as read from the database (all columns are NOT NULL). */
export type Order = Database["public"]["Tables"]["orders"]["Row"];

/** `orders` row shape for case-builder form state and saves. */
export type OrderInsert = Database["public"]["Tables"]["orders"]["Insert"];

/** `orders` row shape for case-builder form state and saves (case_id is supplied at save time). */
export type OrderFormRow = Omit<OrderInsert, "case_id">;

export type OrderCategory =
  | "Nursing"
  | "Respiratory"
  | "Laboratory"
  | "Consult"
  | "Diet"
  | "Imaging"
  | "Medication";

export const ORDER_CATEGORIES: OrderCategory[] = [
  "Nursing",
  "Respiratory",
  "Laboratory",
  "Consult",
  "Diet",
  "Imaging",
  "Medication",
];

/** View model for the chart's orders table; plain `Order` rows pass through directly, medication orders get mapped. */
export type OrderTitleRow = { title: string } & Record<OrderTitleColumn, string>;

/** Column ids rendered by OrdersTable (everything except the pinned title column). */
export type OrderTitleColumn = "details" | "status" | "provider";

/** `medication_orders` rows from case bundle (may include joined `medications`). */
export type BundleMedOrder = {
  id?: string | null;
  dose?: number | null;
  frequency?: string | null;
  priority?: string | null;
  indication?: string | null;
  instructions?: string | null;
  ordering_provider?: string | null;
  infusion_rate?: number | null;
  is_in_presim?: boolean;
  phase?: number | null;
  medications?: {
    generic_name?: string | null;
    brand_name?: string | null;
    strength?: number | null;
    strength_unit?: string | null;
  } | null;
};


export const statusColor = (status: string) => {
  switch (status) {
    case "Completed": return null;
    case "Active": return "bg-green-500";
    case "Held": return "bg-amber-400";
    case "Discontinued": return "bg-gray-400";
  }
}