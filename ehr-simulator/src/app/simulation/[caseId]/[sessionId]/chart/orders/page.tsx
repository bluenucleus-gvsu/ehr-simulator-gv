"use client"

import { useMemo } from "react"
import OrdersTable from "./components/ordersTable"
import { useSimulationCase } from "@/context/SimulationCaseContext"
import { useSimSessionContext } from "@/context/SimSessionContext"
import { isVisibleInSim } from "@/lib/faculty/itemRelease"
import { BundleMedOrder, Order, OrderTitleColumn, OrderTitleRow } from "@/lib/orders"

const createHeaderNames = (title: string) => ({
  title,
  details: "Details",
  status: "Status",
  provider: "Ordering Provider",
});

function orderRowFromMedicationOrder(row: BundleMedOrder): OrderTitleRow {
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
    parts.push(strength ? `Dose: ${row.dose} (${strength} per unit)` : `Dose ${row.dose}`);
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
    provider: (row.ordering_provider ?? "").trim() || "N/A",
  };
}

const OrdersPage = () => {
  const { caseBundle } = useSimulationCase();
  const { isPresim, releasedItems } = useSimSessionContext();
  const dbOrders: Order[] = caseBundle?.orders ?? [];
  const releasedOrders = releasedItems.order_releases;
  const releasedMedOrders = releasedItems.medication_order_releases;
  const releasedOrderIds = useMemo(
    () => new Set(releasedOrders.keys()),
    [releasedOrders],
  );
  const releasedMedOrderIds = useMemo(
    () => new Set(releasedMedOrders.keys()),
    [releasedMedOrders],
  );

  const filterByCategory = (categoryNames: string[]) => {
    const lookup = new Set(categoryNames.map((name) => name.toLowerCase()));
    return dbOrders
      .filter((order) =>
        isVisibleInSim(
          { id: order.id, phase: order.phase, isInPresim: order.is_in_presim },
          Boolean(isPresim),
          releasedOrderIds,
        ),
      )
      .filter((order) => lookup.has(order.category.toLowerCase()));
  };

  const nursingData = filterByCategory(["Nursing"]);
  const respiratoryData = filterByCategory(["Respiratory"]);
  const dietData = filterByCategory(["Diet", "Nutrition"]);
  const laboratoryData = filterByCategory(["Laboratory", "Lab", "Labs"]);
  const imagingData = filterByCategory(["Imaging"]);
  const consultData = filterByCategory(["Consult"]);
  const medicationData = ((caseBundle?.medicationOrders ?? []) as BundleMedOrder[])
    .filter((order) =>
      isVisibleInSim(
        { id: order.id ?? "", phase: order.phase ?? 1, isInPresim: order.is_in_presim },
        Boolean(isPresim),
        releasedMedOrderIds,
      ),
    )
    .map(orderRowFromMedicationOrder);

  const orderColumns: OrderTitleColumn[] = ["details", "status", "provider"]

  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-4 overflow-hidden bg-gray-100 px-2 pt-4">
      <div className="flex min-h-0 flex-1 w-full flex-col gap-4 overflow-y-auto rounded-tl-lg border border-gray-300 px-2 py-3 inset-shadow-sm">
        <OrdersTable color="bg-blue-300" columnNames={orderColumns} headerNames={createHeaderNames("Nursing")} data={nursingData} />
        {respiratoryData.length > 0 && (
          <OrdersTable color="bg-lime-200" columnNames={orderColumns} headerNames={createHeaderNames("Respiratory")} data={respiratoryData} />
        )}
        {imagingData.length > 0 && (
          <OrdersTable color="bg-rose-200" columnNames={orderColumns} headerNames={createHeaderNames("Imaging")} data={imagingData} />
        )}
        {dietData.length > 0 && (
          <OrdersTable color="bg-emerald-200" columnNames={orderColumns} headerNames={createHeaderNames("Diet")} data={dietData} />
        )}
        {medicationData.length > 0 && (
          <OrdersTable color="bg-red-300" columnNames={orderColumns} headerNames={createHeaderNames("Medications")} data={medicationData} />
        )}
        {laboratoryData.length > 0 && (
          <OrdersTable color="bg-fuchsia-200" columnNames={orderColumns} headerNames={createHeaderNames("Laboratory")} data={laboratoryData} />
        )}
        {consultData.length > 0 && (
          <OrdersTable color="bg-yellow-200" columnNames={orderColumns} headerNames={createHeaderNames("Consults")} data={consultData} />
        )}
      </div>
    </div>
  )
}

export default OrdersPage
