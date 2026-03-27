"use client";

import { Card, CardContent } from "@/components/ui/card"
import StyledTitle from "./styledTitle"
import { useSimulationCase } from "@/context/SimulationCaseContext"

type DbOrder = {
  category?: string | null;
  title?: string | null;
}

const Nutrition = () => {
  const { caseBundle } = useSimulationCase();
  const dbOrders = (caseBundle?.orders ?? []) as DbOrder[];
  const dietOrders = dbOrders.filter((order) => {
    const normalized = (order.category ?? "").toLowerCase();
    return normalized === "diet" || normalized === "nutrition";
  });

  return (
    <Card className="relative col-span-1 pt-2 overflow-hidden h-fit gap-3">
      <StyledTitle color="bg-sky-200" firstLetter="N" secondLetter="utrition" />
      <CardContent className="grid gap-2 px-4">
        {dietOrders.length === 0 && (
          <div className="flex flex-col gap-1 pl-2">
            <div className="flex gap-3">
              <p className="text-md font-light tracking-tight">Diet:</p>
              <p className="text-md tracking-tight">N/A</p>
            </div>
            <p className="text-xs text-neutral-500">
              To show a diet here, add an order in Case Builder → Orders with category <span className="font-medium">Diet</span>; the order title appears as the diet.
            </p>
          </div>
        )}
        {dietOrders.map((order, index) => (
          <div key={`${order.category}-${index}`} className="flex pl-2 gap-3">
            <p className="text-md  font-light tracking-tight">Diet:</p>
            <p className=" text-md tracking-tight">{order.title ?? "N/A"}</p>
          </div>
        ))}
      </CardContent>
      <div className="absolute bottom-0 bg-sky-200 w-full h-3"></div>
    </Card>
  )
}

export default Nutrition