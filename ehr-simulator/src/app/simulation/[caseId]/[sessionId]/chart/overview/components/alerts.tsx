"use client"

import { Card, CardContent } from "@/components/ui/card"
import StyledTitle from "./styledTitle"
import { useSimulationCase } from "@/context/SimulationCaseContext"

const Alerts = () => {
  const { caseBundle } = useSimulationCase();
  const alertNames = caseBundle?.safetyAlerts?.length
    ? caseBundle.safetyAlerts.map((row) => row?.safety_alert?.name ?? "N/A")
    : ["N/A"];

  return (
    <Card className="relative col-span-2 pt-2 overflow-hidden h-fit gap-3">
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