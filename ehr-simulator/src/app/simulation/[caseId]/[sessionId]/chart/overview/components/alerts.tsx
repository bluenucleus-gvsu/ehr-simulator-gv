"use client"

import { Card, CardContent } from "@/components/ui/card"
import StyledTitle from "./styledTitle"
import { useSimulationCase } from "@/context/SimulationCaseContext"

function alertName(raw: unknown): string {
  if (Array.isArray(raw)) {
    const first = raw[0] as { name?: string } | undefined
    return first?.name ?? "N/A"
  }
  if (raw && typeof raw === "object") {
    return (raw as { name?: string }).name ?? "N/A"
  }
  return "N/A"
}

const Alerts = () => {
  const { caseBundle } = useSimulationCase();
  const alertNames = caseBundle?.safetyAlerts?.length
    ? caseBundle.safetyAlerts.map((row) => alertName(row?.safety_alert))
    : [];

  if (alertNames.length === 0) return null;
  return (
    <Card className="relative max-w-full min-w-0 gap-3 overflow-hidden pt-2 h-fit">
      <StyledTitle color="bg-yellow-200" firstLetter="A" secondLetter="lerts" />
      <CardContent className="">
        <div className="flex flex-col gap-4">
          {alertNames.map((alertName, index) => (
            <div key={`${alertName}-${index}`} className="bg-yellow-200 p-2 rounded-r-lg rounded-bl-lg">
              <p className="font-medium">{alertName}</p>
            </div>
          ))}
        </div>
      </CardContent>
      <div className="absolute bottom-0 bg-yellow-200 w-full h-3"></div>
    </Card>
  )
}

export default Alerts