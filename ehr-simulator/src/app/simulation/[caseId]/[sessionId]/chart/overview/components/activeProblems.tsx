'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import StyledTitle from "./styledTitle"
import { buildChartDataFromCaseRow } from "@/app/simulation/[caseId]/[sessionId]/chart/components/chartData"
import { useSimulationCase } from "@/context/SimulationCaseContext"

const ActiveProblems = () => {
  const { caseBundle } = useSimulationCase()
  const chartData = buildChartDataFromCaseRow((caseBundle?.caseRow as Record<string, unknown> | null | undefined) ?? null)

  if (!chartData || Object.keys(chartData).length === 0) {
    return (
      <Card className="relative col-span-1 pt-2 overflow-hidden h-fit gap-3">
        <StyledTitle color="bg-red-200" firstLetter="A" secondLetter="ctive Problems" />
        <p>No data exists</p>
      </Card>
    )
  }

  const pmh = chartData.pmh.value.length ? chartData.pmh.value : ["No active problems recorded"];

  return (
    <Card className="relative col-span-1 pt-2 overflow-hidden h-fit gap-3">
      <StyledTitle color="bg-red-200" firstLetter="A" secondLetter="ctive Problems" />
      <CardContent className="px-4 space-y-1">
        {pmh.map(problem => {
          return (
            <div key={problem} className="group">
              <p className="text-sm">{problem}</p>
              <Separator className="bg-red-200" />
            </div>
          )
        })}
      </CardContent>
      <div className="absolute bottom-0 bg-red-200 w-full h-3"></div>
    </Card>
  )
}

export default ActiveProblems