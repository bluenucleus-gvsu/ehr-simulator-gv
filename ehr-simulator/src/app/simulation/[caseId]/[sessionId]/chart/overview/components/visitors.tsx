'use client'

import { Phone } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import StyledTitle from "./styledTitle"
import { buildChartDataFromCaseRow } from "@/app/simulation/[caseId]/[sessionId]/chart/components/chartData"
import { useSimulationCase } from "@/context/SimulationCaseContext"

const Visitors = () => {
  const { caseBundle } = useSimulationCase()
  const chartData = buildChartDataFromCaseRow((caseBundle?.caseRow as Record<string, unknown> | null | undefined) ?? null)

  if (!chartData || Object.keys(chartData).length === 0) {
    return (
      <Card className="relative col-span-1 pt-2 overflow-hidden h-fit gap-3">
        <StyledTitle color="bg-red-200" firstLetter="C" secondLetter="ontacts" />
        <p>No contact info</p>
      </Card>
    )
  }

  const contactItems = chartData.supportPersons.value.length
    ? chartData.supportPersons.value
    : [{ name: "No contact on file", relationship: "N/A", phone: "N/A" }]

  return (
    <Card className="relative pt-2 overflow-hidden h-fit gap-3">
      <StyledTitle color="bg-lime-200" firstLetter="C" secondLetter="ontacts" />
      <CardContent className="grid gap-4 px-8">
        {contactItems.map((person, index) => {
          return (
            <div key={`${person.name}-${index}`} className="flex flex-col w-full items-start gap-1">
              <p className="text-md font-medium leading-none">{person.name}</p>
              <div className="flex pl-2 gap-3">
                <p className="text-sm text-neutral-500 tracking-tight">Relationship:</p>
                <p className="text-neutral-500 text-sm">{person.relationship}</p>
              </div>
              <div className="flex items-center pl-2 gap-2">
                <Phone size={14} color="#737373" />
                <p className="text-sm text-neutral-500 tracking-tight">{person.phone}</p>
              </div>
            </div>
          )
        })}
      </CardContent>
      <div className="absolute bottom-0 bg-lime-200 w-full h-3"></div>

    </Card>
  )
}

export default Visitors
