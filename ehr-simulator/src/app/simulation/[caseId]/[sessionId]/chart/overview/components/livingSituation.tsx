"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import StyledTitle from "./styledTitle"
import { useSimulationCase } from "@/context/SimulationCaseContext"

function toStringList(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.map((item) => String(item ?? "").trim()).filter(Boolean)
  }
  const single = String(raw ?? "").trim()
  return single ? [single] : []
}

const LivingSituation = () => {
  const { caseBundle } = useSimulationCase()
  const situations = toStringList(caseBundle?.caseRow?.living_situation)
  const rows = situations.length ? situations : ["No living situation recorded"]

  return (
    <Card className="relative col-span-1 pt-2 overflow-hidden h-fit gap-3">
      <StyledTitle color="bg-amber-200" firstLetter="L" secondLetter="iving Situation" />
      <CardContent className="px-4 space-y-1">
        {rows.map((item, idx) => (
          <div key={`${idx}-${item}`} className="group">
            <p className="text-sm">{item}</p>
            <Separator className="bg-amber-200" />
          </div>
        ))}
      </CardContent>
      <div className="absolute bottom-0 bg-amber-200 w-full h-3"></div>
    </Card>
  )
}

export default LivingSituation
