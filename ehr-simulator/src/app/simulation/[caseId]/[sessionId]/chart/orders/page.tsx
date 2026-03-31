"use client"

import OrdersTable from "./components/ordersTable"
import {
  nursingHeaderNames,
  respHeaderNames,
  medHeaderNames,
  laboratoryHeaderNames,
  consultHeaderNames,
  MedOrderData,
} from "./components/orderData"
import { nursingOrders, respiratoryOrders, consultOrders, laboratoryOrders } from "./components/orderData"


// import { Skeleton } from "@/components/ui/skeleton"
import { getMedDose } from "../mar/components/marHelpers"
import { allMedications, AllMedicationTypes, medicationOrders } from "../mar/components/marData"

const OrdersPage = () => {

  const medLookup = allMedications.reduce<Record<string, AllMedicationTypes>>((acc, med) => {
    acc[med.id] = med
    return acc;
  }, {})

  const medData = medicationOrders.map(order => {
    const brandName = medLookup[order.medicationId].brandName ? `(${medLookup[order.medicationId].brandName})` : ''
    const dose = getMedDose(medLookup[order.medicationId], order)
    return (
      {
        title: `${medLookup[order.medicationId].genericName} ${brandName}`,
        route: medLookup[order.medicationId].route,
        dose: dose,
        frequency: order.frequency,
        priority: order.priority,
        administrationInstructions: order.instructions ? order.instructions : '',
        orderingProvider: order.orderingProvider
      } as MedOrderData
    )
  })


  // arrays for tanstack table to iterate over to build columns 
  const orderColumns = ["details", "status", "orderingProvider"]
  const medOrderColumns = ["dose", "route", "frequency", "priority", "administrationInstructions", "orderingProvider"]

  // if (isLoading || isFetching) {
  //   return (
  //     <div className="flex flex-col h-full w-full pt-16 bg-gray-100 justify-start items-center gap-6">
  //       <Skeleton className="w-5/6 h-16 rounded-xl bg-gray-200" />
  //       <Skeleton className="w-5/6 h-8 rounded-xl bg-gray-200" />
  //       <Skeleton className="w-5/6 h-8 rounded-xl bg-gray-200" />
  //       <Skeleton className="w-5/6 h-8 rounded-xl bg-gray-200" />
  //       <Skeleton className="w-5/6 h-8 rounded-xl bg-gray-200" />
  //     </div>
  //   );
  // }


  return (
    <div className="px-2 pt-4 w-full h-[calc(100vh-4rem)] flex flex-col gap-4 justify-start items-center bg-gray-100 overflow-y-auto">
      <div className="flex w-full h-full flex-col gap-4 px-2 py-3 overflow-y-auto border border-gray-300 rounded-tl-lg inset-shadow-sm">
        <OrdersTable color="bg-blue-300" columnNames={orderColumns} headerNames={nursingHeaderNames} data={nursingOrders} />
        <OrdersTable color="bg-red-300" columnNames={medOrderColumns} headerNames={medHeaderNames} data={medData} />
        <OrdersTable color="bg-lime-200" columnNames={orderColumns} headerNames={respHeaderNames} data={respiratoryOrders} />
        <OrdersTable color="bg-fuchsia-200" columnNames={orderColumns} headerNames={laboratoryHeaderNames} data={laboratoryOrders} />
        <OrdersTable color="bg-yellow-200" columnNames={orderColumns} headerNames={consultHeaderNames} data={consultOrders} />
      </div>
    </div>
  )
}

export default OrdersPage