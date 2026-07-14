"use client"

import OrdersTable from "./components/ordersTable"
import { useSimulationCase } from "@/context/SimulationCaseContext"
import { useSimSessionContext } from "@/context/SimSessionContext"
import { isVisibleForSimulationPhase } from "@/lib/simulationPhaseVisibility"

type DbOrder = {
  category?: string | null;
  title?: string | null;
  details?: string | null;
  status?: string | null;
  provider?: string | null;
  is_important?: boolean | null;
  is_in_presim?: boolean | null;
  phase?: number | null;
}

type OrderRow = {
  title: string;
  details: string;
  status: string;
  orderingProvider: string;
  isImportant: boolean;
}

/** `medication_orders` rows from case bundle (may include joined `medications`). */
type BundleMedOrder = {
  dose?: number | null;
  frequency?: string | null;
  priority?: string | null;
  indication?: string | null;
  instructions?: string | null;
  ordering_provider?: string | null;
  infusion_rate?: number | null;
  is_in_presim?: boolean | null;
  phase?: number | null;
  medications?: {
    generic_name?: string | null;
    brand_name?: string | null;
    strength?: number | null;
    strength_unit?: string | null;
  } | null;
};

function orderRowFromMedicationOrder(row: BundleMedOrder): OrderRow {
  const med = row.medications;
  const generic = (med?.generic_name ?? "").trim() || "Medication";
  const brand = (med?.brand_name ?? "").trim();
  const title = brand ? `${generic} (${brand})` : generic;

  const strength =
    med?.strength != null && med?.strength_unit
      ? `${med.strength} ${med.strength_unit}`
      : "";
  const parts: string[] = [];
  if (row.dose != null) {
    parts.push(strength ? `Dose ${row.dose} (${strength} per unit)` : `Dose ${row.dose}`);
  }
  if (row.frequency) parts.push(`Frequency: ${row.frequency}`);
  if (row.indication?.trim()) parts.push(row.indication.trim());
  if (row.instructions?.trim()) parts.push(row.instructions.trim());
  if (row.infusion_rate != null && row.infusion_rate > 0) {
    parts.push(`Infusion: ${row.infusion_rate}`);
  }
  const details = parts.length ? parts.join(" · ") : "N/A";

  const priority = String(row.priority ?? "").trim();
  const status = priority || "Ordered";

  return {
    title,
    details,
    status,
    orderingProvider: (row.ordering_provider ?? "").trim() || "N/A",
    isImportant: priority === "STAT" || priority === "NOW",
  };
}

const createHeaderNames = (title: string) => ({
  title,
  details: "Details",
  status: "Status",
  orderingProvider: "Ordering Provider",
});

const OrdersPage = () => {
  const { caseBundle } = useSimulationCase();
  const { isPresim, currentPhase } = useSimSessionContext();
  const dbOrders = (caseBundle?.orders ?? []) as DbOrder[];

  const normalizeOrder = (order: DbOrder): OrderRow => ({
    title: order.title ?? "N/A",
    details: order.details ?? "N/A",
    status: order.status ?? "N/A",
    orderingProvider: order.provider ?? "N/A",
    isImportant: Boolean(order.is_important),
  });

  const filterByCategory = (categoryNames: string[]) => {
    const lookup = new Set(categoryNames.map((name) => name.toLowerCase()));
    return dbOrders
      .filter((order) =>
        isVisibleForSimulationPhase({
          isPresim: Boolean(isPresim),
          isVisibleInPresim: order.is_in_presim,
          releasePhase: order.phase,
          currentPhase,
        }),
      )
      .filter((order) => lookup.has((order.category ?? "").toLowerCase()))
      .map(normalizeOrder);
  };

  const nursingData = filterByCategory(["Nursing"]);
  const respiratoryData = filterByCategory(["Respiratory"]);
  const dietData = filterByCategory(["Diet", "Nutrition"]);
  const laboratoryData = filterByCategory(["Laboratory", "Lab", "Labs"]);
  const consultData = filterByCategory(["Consult"]);
  const medicationDataFromClinicalOrders = filterByCategory(["Medication", "Medications"]);
  const medicationDataFromMedOrders = ((caseBundle?.medicationOrders ?? []) as BundleMedOrder[])
    .filter((order) =>
      isVisibleForSimulationPhase({
        isPresim: Boolean(isPresim),
        isVisibleInPresim: order.is_in_presim,
        releasePhase: order.phase,
        currentPhase,
      }),
    )
    .map(orderRowFromMedicationOrder);
  const medicationData = [...medicationDataFromClinicalOrders, ...medicationDataFromMedOrders];

  const orderColumns = ["details", "status", "orderingProvider"]

  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-4 overflow-hidden bg-gray-100 px-2 pt-4">
      <div className="flex min-h-0 flex-1 w-full flex-col gap-4 overflow-y-auto rounded-tl-lg border border-gray-300 px-2 py-3 inset-shadow-sm">
        <OrdersTable color="bg-blue-300" columnNames={orderColumns} headerNames={createHeaderNames("Nursing")} data={nursingData} />
        <OrdersTable color="bg-lime-200" columnNames={orderColumns} headerNames={createHeaderNames("Respiratory")} data={respiratoryData} />
        <OrdersTable color="bg-emerald-200" columnNames={orderColumns} headerNames={createHeaderNames("Diet")} data={dietData} />
        <OrdersTable color="bg-red-300" columnNames={orderColumns} headerNames={createHeaderNames("Medications")} data={medicationData} />
        <OrdersTable color="bg-fuchsia-200" columnNames={orderColumns} headerNames={createHeaderNames("Laboratory")} data={laboratoryData} />
        <OrdersTable color="bg-yellow-200" columnNames={orderColumns} headerNames={createHeaderNames("Consults")} data={consultData} />
      </div>
    </div>
  )
}

export default OrdersPage
