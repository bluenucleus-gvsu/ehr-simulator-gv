"use client"

import { Card, CardContent } from "@/components/ui/card"
import StyledTitle from "./styledTitle"
import { Separator } from "@/components/ui/separator"
import { useSimulationCase } from "@/context/SimulationCaseContext"

function relationshipName(raw: unknown): string {
  if (Array.isArray(raw)) {
    const first = raw[0] as { name?: string } | undefined
    return first?.name ?? "N/A"
  }
  if (raw && typeof raw === "object") {
    return (raw as { name?: string }).name ?? "N/A"
  }
  return "N/A"
}

const FamilyHistory = () => {
  const { caseBundle } = useSimulationCase();
  const familyHistoryRows = caseBundle?.familyHistory?.length
    ? caseBundle.familyHistory.map((row) => ({
      member: relationshipName(row?.relationship),
      condition: row?.condition ?? "N/A",
    }))
    : [{ member: "N/A", condition: "N/A" }];
  return (
    <Card className="relative col-span-1 pt-2 overflow-hidden h-fit gap-3">
      <StyledTitle color="bg-lime-200" firstLetter="F" secondLetter="amily History" />
      <CardContent className="px-4 space-y-1">
        <div className="flex flex-col gap-1 w-full">
          {familyHistoryRows.map((row, index) => (
            <div key={`${row.member}-${index}`} className="group">
              <div className="flex w-full pb-1">
                <p className="text-sm flex-1 pr-2 font-light text-nowrap">{row.member}:</p>
                <p className="text-sm w-full">{row.condition}</p>
              </div>
              <Separator className="bg-lime-200 group-last:bg-transparent" />
            </div>
          ))}
        </div>
      </CardContent>
      <div className="absolute bottom-0 bg-lime-200 w-full h-3"></div>
    </Card>
  )
}

export default FamilyHistory