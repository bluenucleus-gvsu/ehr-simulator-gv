
'use client'

import { Tooltip } from "@/components/ui/tooltip"
import { Card, CardContent } from "@/components/ui/card"
import { Info } from "lucide-react"
import { TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import StyledTitle from "./styledTitle"
import { useSimulationCase } from "@/context/SimulationCaseContext"
import { useSimSessionContext } from "@/context/SimSessionContext"
import { isVisibleForSimulationPhase } from "@/lib/simulationPhaseVisibility"
import { DatabaseOrder } from "@/actions/case_builder/getCase"
import { OrderType } from "../../orders/components/orderData"

const ORDER_CATEGORIES: OrderType["category"][] = ["Nursing", "Respiratory", "Laboratory", "Consult", "Diet", "Medication"]

const RecurringOrders = () => {
  const { caseBundle } = useSimulationCase()
  const { isPresim, currentPhase } = useSimSessionContext()
  const orders = (caseBundle?.orders ?? []) as DatabaseOrder[]
  const important = orders.filter((order) =>
    order.is_important &&
    isVisibleForSimulationPhase({
      isPresim: Boolean(isPresim),
      isVisibleInPresim: order.is_in_presim,
      releasePhase: order.phase,
      currentPhase,
    }),
  )

  return (
    <Card className="relative col-span-1 pt-2 overflow-hidden h-fit gap-3">
      <StyledTitle color="bg-sky-200" firstLetter="R" secondLetter="ecurring Orders" />
      <CardContent className="grid gap-4 px-8">
        <div className="flex flex-col w-full items-start gap-3">
          {ORDER_CATEGORIES.map((category, i) => {
            const rows = important.filter((o) => o.category === category)

            if (rows.length === 0) return null

            return (
              <div key={i} className="flex flex-col gap-2 w-full">
                <p className="text-sm font-medium leading-none">{category}</p>
                {rows.map((order) => (
                  <div
                    key={order.id ?? `${order.title}-${order.details}`}
                    className="flex pl-2 gap-3 items-center"
                  >
                    <p className="text-xs text-neutral-500 tracking-tight">{order.title ?? "Untitled Order"}</p>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info size={14} color="#d1d5db" />
                        </TooltipTrigger>
                        <TooltipContent className="w-fit">
                          <p className="max-w-120 text-wrap">{order.details ?? "No details"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </CardContent>
      <div className="absolute bottom-0 bg-sky-200 w-full h-3"></div>
    </Card>
  )
}

export default RecurringOrders
