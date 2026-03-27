"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import StyledTitle from "./styledTitle"
import { useMemo } from "react"
import { useSimulationCase } from "@/context/SimulationCaseContext"
import { intakeOutputBlocksFromCaseRow } from "@/utils/form"

const chartConfig = {
  intake: {
    label: "Intake",
    color: "#bae6fd",
  },
  output: {
    label: "Output",
    color: "#fef08a",
  },
} satisfies ChartConfig

type ChartRow = { timeId: string; blockLabel: string; intake: number; output: number }

interface TickPayload {
  value: string
  index?: number
  offset?: number
}
interface CustomTickProps {
  x?: number
  y?: number
  payload?: TickPayload
}

export function IntakeOutput() {
  const { caseBundle } = useSimulationCase()

  const chartData = useMemo<ChartRow[]>(() => {
    const blocks = intakeOutputBlocksFromCaseRow(caseBundle?.caseRow?.intake_output_blocks)
    return blocks.map((b) => ({
      timeId: `block-${b.blockId}`,
      blockLabel: `Block ${b.blockId}`,
      intake: b.intake,
      output: b.output,
    }))
  }, [caseBundle?.caseRow?.intake_output_blocks])

  const roundedMax = useMemo(() => {
    const max = Math.max(
      ...chartData.map((r) => r.intake),
      ...chartData.map((r) => r.output),
      100,
    )
    return Math.max(100, Math.ceil(max / 100) * 100)
  }, [chartData])

  const MultiLineTick = (props: CustomTickProps) => {
    const { x, y, payload } = props

    if (!payload?.value) return null
    const row = chartData.find((r) => r.timeId === payload.value)
    if (!row) return null

    const blockNum = Number(row.timeId.replace("block-", ""))
    const tag =
      blockNum === 1 ? "Earliest" : blockNum === 4 ? "Most recent" : ""

    return (
      <text
        x={x}
        y={y}
        textAnchor="middle"
        fill="#666"
        fontSize="11"
        className="recharts-text recharts-cartesian-axis-tick-value"
      >
        <tspan fill="black" x={x} dy="0.6em">
          {row.blockLabel}
        </tspan>
        {tag ? (
          <tspan x={x} dy="1.1em" fontSize="10">
            {tag}
          </tspan>
        ) : null}
      </text>
    )
  }

  return (
    <Card className="relative col-span-1 pt-2 overflow-hidden h-fit gap-3">
      <StyledTitle color="bg-sky-200" firstLetter="I" secondLetter="ntake/Output" />
      <CardContent className="grid gap-2 px-4">
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <BarChart accessibilityLayer data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 32 }}>
            <CartesianGrid vertical={false} />
            <YAxis
              axisLine={false}
              tickLine={false}
              unit=" mL"
              domain={[0, roundedMax]}
            />
            <XAxis
              dataKey="timeId"
              tickLine={false}
              tickMargin={6}
              axisLine={false}
              tick={(props) => <MultiLineTick {...props} />}
              height={48}
              interval={0}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend className="text-xs pt-3 text-neutral-700" content={<ChartLegendContent />} />
            <Bar dataKey="output" stackId="a" fill="#fef08a" radius={[0, 0, 4, 4]} />
            <Bar dataKey="intake" stackId="a" fill="#bae6fd" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <div className="absolute bottom-0 bg-sky-200 w-full h-3"></div>
    </Card>
  )
}
