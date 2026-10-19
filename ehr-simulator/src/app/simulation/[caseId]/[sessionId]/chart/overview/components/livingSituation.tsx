"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import StyledTitle from "./styledTitle"
import { useSimulationCase } from "@/context/SimulationCaseContext"


const LivingSituation = () => {
  const { caseBundle } = useSimulationCase()
  if (!caseBundle) return null

  const situations = caseBundle.caseRow.living_situation
  const rows = situations ? situations : ["No living situation recorded"]

  return (
    <Card className="relative col-span-1 pt-2 overflow-hidden h-fit gap-3">
      <StyledTitle color="bg-amber-200" firstLetter="L" secondLetter="iving Situation" />
      <CardContent className="px-4 space-y-1">
        {rows.length > 0 ? (rows.map((item, idx) => (
          <div key={`${idx}-${item}`} className="group">
            <p className="text-sm">{item}</p>
            <Separator className="bg-amber-200" />
          </div>))) : (
          <>
            <p className="text-sm">No living situation recorded</p>
            <Separator className="bg-amber-200" />
          </>
        )}
      </CardContent>
      <div className="absolute bottom-0 bg-amber-200 w-full h-3"></div>
    </Card>
  )
}

export default LivingSituation
