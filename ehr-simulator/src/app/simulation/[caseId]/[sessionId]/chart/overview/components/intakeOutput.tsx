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
import { format } from "date-fns"
import CardSkeleton from "./cardSkeleton"
import { useState } from "react"

const chartData = [
  { timeId: "day1-morning", startTime: "0000", endTime: "1159", intake: 886, output: 400 },
  { timeId: "day1-evening", startTime: "1200", endTime: "2359", intake: 405, output: 290 },
  { timeId: "day2-morning", startTime: "0000", endTime: "1159", intake: 837, output: 420 },
  { timeId: "day2-evening", startTime: "1200", endTime: "2359", intake: 730, output: 390 },
]

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

interface TickPayload {
  value: string; // We know this maps to timeId, which is a string
  index?: number;
  offset?: number;
}
interface CustomTickProps {
  x?: number;
  y?: number;
  payload?: TickPayload;
}

export function IntakeOutput() {
  const [simStartTime] = useState(new Date().getTime())

  if (!simStartTime) {
    return (
      <Card className="relative col-span-1 pt-2 overflow-hidden h-fit gap-3">
        <StyledTitle color="bg-sky-200" firstLetter="I" secondLetter="ntake/Output" />
        <CardSkeleton />
      </Card>
    )
  }


  const MultiLineTick = (props: CustomTickProps) => {
    const { x, y, payload } = props;

    if (!payload || !payload.value) return null;
    const row = chartData.find(row => row.timeId === payload.value)
    if (!row) return null;

    const displayDate = format(simStartTime, "MM/dd")
    return (
      <text
        x={x}
        y={y}
        textAnchor="middle"
        fill="#666"
        fontSize="11"
        className="recharts-text recharts-cartesian-axis-tick-value"
      >
        <tspan fill="black" x={x} dy={'0.6em'}>{displayDate}</tspan>
        <tspan x={x} dy="1.1em">{row?.startTime} -</tspan>
        <tspan x={x} dy="1.1em">{row?.endTime}</tspan>
      </text>
    );
  };

  return (
    <Card className="relative col-span-1 pt-2 overflow-hidden h-fit gap-3">
      <StyledTitle color="bg-sky-200" firstLetter="I" secondLetter="ntake/Output" />
      <CardContent className="grid gap-2 px-4">
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <YAxis
              axisLine={false}
              tickLine={false}
              unit="mL"
            />
            <XAxis
              dataKey="timeId"
              tickLine={false}
              tickMargin={6}
              axisLine={false}
              tick={(props => <MultiLineTick {...props} />)}
              height={35}
              interval={0}
            />
            <ChartTooltip content={<ChartTooltipContent label={undefined} payload={[]} coordinate={{ x: 0, y: 0 }} accessibilityLayer hideLabel active={false} />} />
            <ChartLegend className="text-xs pt-3 text-neutral-700" content={<ChartLegendContent payload={[]} />} />
            <Bar
              dataKey="output"
              stackId="a"
              fill="#fef08a"
              radius={[0, 0, 4, 4]}
            />
            <Bar
              dataKey="intake"
              stackId="a"
              fill="#bae6fd"
              radius={[4, 4, 0, 0]}
            />

          </BarChart>
        </ChartContainer>
      </CardContent>
      <div className="absolute bottom-0 bg-sky-200 w-full h-3"></div>
    </Card>
  )
}
