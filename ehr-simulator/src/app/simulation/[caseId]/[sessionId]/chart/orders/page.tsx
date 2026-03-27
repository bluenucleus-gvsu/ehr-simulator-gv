"use client"

import OrdersTable from "./components/ordersTable"
import { useSimulationCase } from "@/context/SimulationCaseContext"

type DbOrder = {
  category?: string | null;
  title?: string | null;
  details?: string | null;
  status?: string | null;
  provider?: string | null;
}

type OrderRow = {
  title: string;
  details: string;
  status: string;
  orderingProvider: string;
}

const createHeaderNames = (title: string) => ({
  title,
  details: "Details",
  status: "Status",
  orderingProvider: "Ordering Provider",
});

const OrdersPage = () => {
  const { caseBundle } = useSimulationCase();
  const dbOrders = (caseBundle?.orders ?? []) as DbOrder[];

  const normalizeOrder = (order: DbOrder): OrderRow => ({
    title: order.title ?? "N/A",
    details: order.details ?? "N/A",
    status: order.status ?? "N/A",
    orderingProvider: order.provider ?? "N/A",
  });

  const filterByCategory = (categoryNames: string[]) => {
    const lookup = new Set(categoryNames.map((name) => name.toLowerCase()));
    return dbOrders
      .filter((order) => lookup.has((order.category ?? "").toLowerCase()))
      .map(normalizeOrder);
  };

  const nursingData = filterByCategory(["Nursing"]);
  const respiratoryData = filterByCategory(["Respiratory"]);
  const dietData = filterByCategory(["Diet", "Nutrition"]);
  const laboratoryData = filterByCategory(["Laboratory", "Lab", "Labs"]);
  const consultData = filterByCategory(["Consult"]);
  const medicationData = filterByCategory(["Medication", "Medications"]);

  const orderColumns = ["details", "status", "orderingProvider"]

  return (
    <div className="px-2 pt-4 w-full h-[calc(100vh-4rem)] flex flex-col gap-4 justify-start items-center bg-gray-100 overflow-y-auto">
      <div className="flex w-full h-full flex-col gap-4 px-2 py-3 overflow-y-auto border border-gray-300 rounded-tl-lg inset-shadow-sm">
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