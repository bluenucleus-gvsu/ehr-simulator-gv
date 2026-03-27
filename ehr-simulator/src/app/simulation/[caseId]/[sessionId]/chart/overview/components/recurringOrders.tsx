
'use client'

import { Tooltip } from "@/components/ui/tooltip"
import { Card, CardContent } from "@/components/ui/card"
import { Info } from "lucide-react"
import { TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import StyledTitle from "./styledTitle"
import { useSimulationCase } from "@/context/SimulationCaseContext"

type DbOrder = {
  category?: string | null;
  title?: string | null;
  details?: string | null;
  is_important?: boolean | null;
}

const RecurringOrders = () => {

  // if (isLoading || (isFetching && !data)) {
  //   return (
  //     <Card className="relative col-span-1 pt-2 overflow-hidden h-fit gap-3">
  //       <StyledTitle color="bg-sky-200" firstLetter="R" secondLetter="ecurring Orders" />
  //       <CardSkeleton />
  //     </Card>
  //   )
  // }

  // return (
  //   <Card className="relative col-span-1 pt-2 overflow-hidden h-fit gap-3">
  //     <StyledTitle color="bg-red-200" firstLetter="A" secondLetter="ctive Problems" />
  //     <p>Failed to load data</p>
  //   </Card>
  // )


  // if (!data || Object.keys(data).length === 0) {
  //   return (
  //     <Card className="relative col-span-1 pt-2 overflow-hidden h-fit gap-3">
  //       <StyledTitle color="bg-red-200" firstLetter="A" secondLetter="ctive Problems" />
  //       <p>No data exists</p>
  //     </Card>
  //   )
  // }
  const { caseBundle } = useSimulationCase();
  const dbOrders = (caseBundle?.orders ?? []) as DbOrder[];
  const importantOrders = dbOrders.filter((order) => Boolean(order.is_important));
  const nursingOrders = importantOrders.filter((order) => (order.category ?? "").toLowerCase() === "nursing");
  const laboratoryOrders = importantOrders.filter((order) => {
    const normalized = (order.category ?? "").toLowerCase();
    return normalized === "laboratory" || normalized === "lab" || normalized === "labs";
  });

  return (
    <Card className="relative col-span-1 pt-2 overflow-hidden h-fit gap-3">
      <StyledTitle color="bg-sky-200" firstLetter="R" secondLetter="ecurring Orders" />
      <CardContent className="grid gap-4 px-8">
        <div className="flex flex-col w-full items-start gap-1">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium leading-none">Nursing</p>
            {nursingOrders.length === 0 && (
              <div className="flex pl-2 gap-3 items-center">
                <p className="text-xs text-neutral-500 tracking-tight">N/A</p>
              </div>
            )}
            {nursingOrders.map((order, index) => (
              <div key={`${order.title}-${index}`} className="flex pl-2 gap-3 items-center">
                <p className="text-xs text-neutral-500 tracking-tight">{order.title ?? "N/A"}</p>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info size={14} color="#d1d5db" />
                    </TooltipTrigger>
                    <TooltipContent className="w-fit">
                      <p className="max-w-120  text-wrap">{order.details ?? "N/A"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            ))}

            <p className="text-sm font-medium leading-none">Labs</p>
            {laboratoryOrders.length === 0 && (
              <div className="flex pl-2 gap-3 items-center">
                <p className="text-xs text-neutral-500 tracking-tight">N/A</p>
              </div>
            )}
            {laboratoryOrders.map((order, index) => (
              <div key={`${order.title}-${index}`} className="flex pl-2 gap-3 items-center">
                <p className="text-xs text-neutral-500 tracking-tight">{order.title ?? "N/A"}</p>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info size={14} color="#d1d5db" />
                    </TooltipTrigger>
                    <TooltipContent className="w-fit">
                      <p className="max-w-120  text-wrap">{order.details ?? "N/A"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <div className="absolute bottom-0 bg-sky-200 w-full h-3"></div>
    </Card>
  )
}

export default RecurringOrders
