"use client";

import { Card, CardContent } from "@/components/ui/card"
import StyledTitle from "./styledTitle"
import { useSimulationCase } from "@/context/SimulationCaseContext"

const Nutrition = () => {
  const { caseBundle } = useSimulationCase();
  const dbOrders = caseBundle?.orders ?? [];
  const dietOrders = dbOrders.filter((order) => {
    const normalized = (order.category ?? "").toLowerCase();
    return normalized === "diet";
  });

  if (dietOrders.length == 0) return null;

  return (
    <Card className="relative col-span-1 pt-2 overflow-hidden h-fit gap-3">
      <StyledTitle color="bg-sky-200" firstLetter="N" secondLetter="utrition" />
      <CardContent className="grid gap-2 px-4">

        {dietOrders.map((order, index) => (
          <div key={`${order.category}-${index}`} className="grid grid-cols-2 pl-2 gap-3">
            {order.details === "" ?
              (
                <p className="text-md tracking-tight">{order.title}:</p>
              ) : (
                <>
                  <p className="text-md tracking-tight">{order.title}:</p>
                  <p className="text-md font-light tracking-tight">{order.details}</p>
                </>
              )}
          </div>
        ))}
      </CardContent>
      <div className="absolute bottom-0 bg-sky-200 w-full h-3"></div>
    </Card>
  )
}

export default Nutrition