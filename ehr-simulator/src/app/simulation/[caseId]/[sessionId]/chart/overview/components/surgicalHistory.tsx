"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import StyledTitle from "./styledTitle";
import { useSimulationCase } from "@/context/SimulationCaseContext";

const SurgicalHistory = () => {
  const { caseBundle } = useSimulationCase();

  if (!caseBundle) {
    return null
  }

  const surgicalHistory = caseBundle.caseRow.surgical_history ?? [];

  return (
    <Card className="relative col-span-1 pt-2 overflow-hidden h-fit gap-3">
      <StyledTitle color="bg-sky-200" firstLetter="S" secondLetter="urgical History" />
      <CardContent className="px-4 space-y-1">
        {surgicalHistory.length > 0 ? (
          surgicalHistory.map((line, idx) => (
            <div key={`${idx}-${line}`} className="group">
              <p className="text-sm">{line}</p>
              <Separator className="bg-sky-200" />
            </div>
          ))
        ) : (
          <>
            <p className="text-sm">No surgical history recorded</p>
            <Separator className="bg-sky-200" />
          </>
        )}
      </CardContent>
      <div className="absolute bottom-0 bg-sky-200 w-full h-3" />
    </Card>
  );
};

export default SurgicalHistory;