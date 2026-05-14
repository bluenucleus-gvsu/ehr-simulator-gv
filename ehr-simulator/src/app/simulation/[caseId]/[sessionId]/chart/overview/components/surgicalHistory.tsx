"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import StyledTitle from "./styledTitle";
import { buildChartDataFromCaseRow } from "@/app/simulation/[caseId]/[sessionId]/chart/components/chartData";
import { useSimulationCase } from "@/context/SimulationCaseContext";

const SurgicalHistory = () => {
  const { caseBundle } = useSimulationCase();
  const chartData = buildChartDataFromCaseRow(
    (caseBundle?.caseRow as Record<string, unknown> | null | undefined) ?? null,
  );

  if (!chartData || Object.keys(chartData).length === 0) {
    return (
      <Card className="relative col-span-1 pt-2 overflow-hidden h-fit gap-3">
        <StyledTitle color="bg-sky-200" firstLetter="S" secondLetter="urgical History" />
        <p className="px-4 text-sm text-muted-foreground">No data exists</p>
      </Card>
    );
  }

  const items = chartData.surgicalHistory.value.length
    ? chartData.surgicalHistory.value
    : ["No surgical history recorded"];

  return (
    <Card className="relative col-span-1 pt-2 overflow-hidden h-fit gap-3">
      <StyledTitle color="bg-sky-200" firstLetter="S" secondLetter="urgical History" />
      <CardContent className="px-4 space-y-1">
        {items.map((line, idx) => (
          <div key={`${idx}-${line}`} className="group">
            <p className="text-sm">{line}</p>
            <Separator className="bg-sky-200" />
          </div>
        ))}
      </CardContent>
      <div className="absolute bottom-0 bg-sky-200 w-full h-3" />
    </Card>
  );
};

export default SurgicalHistory;
