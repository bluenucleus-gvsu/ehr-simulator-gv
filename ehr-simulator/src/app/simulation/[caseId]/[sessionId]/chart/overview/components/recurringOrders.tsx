
'use client'

import { Tooltip } from "@/components/ui/tooltip"
import { Card, CardContent } from "@/components/ui/card"
import { Info } from "lucide-react"
import { TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import StyledTitle from "./styledTitle"
import { useSimulationCase } from "@/context/SimulationCaseContext"
import { useSimSessionContext } from "@/context/SimSessionContext"
import { isVisibleForSimulationPhase } from "@/lib/simulationPhaseVisibility"

type DbOrder = {
  id?: string
  category?: string | null
  title?: string | null
  details?: string | null
  is_important?: boolean | null
  is_in_presim?: boolean | null
  phase?: number | null
}

/** Match categories the same way as `chart/orders/page.tsx` */
function categoryMatches(category: string, section: "nursing" | "respiratory" | "diet" | "laboratory" | "consult" | "medication"): boolean {
  const c = category.trim().toLowerCase()
  switch (section) {
    case "nursing":
      return c === "nursing"
    case "respiratory":
      return c === "respiratory"
    case "laboratory":
      return c === "laboratory" || c === "lab" || c === "labs"
    case "consult":
      return c === "consult"
    default:
      return false
  }
}

const SECTIONS: { key: "nursing" | "respiratory" | "diet" | "laboratory" | "consult" | "medication"; label: string }[] = [
  { key: "nursing", label: "Nursing" },
  { key: "respiratory", label: "Respiratory" },
  { key: "laboratory", label: "Labs" },
  { key: "consult", label: "Consults" },
]

const RecurringOrders = () => {
  const { caseBundle } = useSimulationCase()
  const { isPresim, currentPhase } = useSimSessionContext()
  const orders = (caseBundle?.orders ?? []) as DbOrder[]
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
          {SECTIONS.map(({ key, label }) => {
            const rows = important.filter((o) => categoryMatches(o.category ?? "", key))
            return (
              <div key={key} className="flex flex-col gap-2 w-full">
                <p className="text-sm font-medium leading-none">{label}</p>
                {rows.map((order) => (
                  <div
                    key={order.id ?? `${key}-${order.title}-${order.details}`}
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
                {rows.length === 0 ? (
                  <p className="pl-2 text-xs text-neutral-400">No important {label.toLowerCase()} orders.</p>
                ) : null}
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
