"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import StyledTitle from "./styledTitle";
import { useSimulationCase } from "@/context/SimulationCaseContext";
import {
  buildMarFromCaseBundle,
  countDueAdministrations,
  countMarOrdersByCategory,
} from "@/app/simulation/[caseId]/[sessionId]/chart/mar/components/marFromBundle";

const MarSnapshot = () => {
  const { caseBundle } = useSimulationCase();

  const { counts, dueCount, medLines } = useMemo(() => {
    const model = buildMarFromCaseBundle(caseBundle ?? null);
    const counts = countMarOrdersByCategory(model.medicationOrders);
    const dueCount = countDueAdministrations(model.administrations);
    const medLines = model.medicationOrders.map((order) => {
      const med = model.medsById[order.medicationId];
      const name = med?.genericName?.trim() || order.medicationId;
      return { id: order.id, name };
    });
    return { counts, dueCount, medLines };
  }, [caseBundle]);

  return (
    <Card className="relative col-span-1 pt-2 overflow-hidden h-fit gap-3">
      <StyledTitle color="bg-red-200" firstLetter="M" secondLetter="AR Snapshot" />
      <CardContent className="px-4 space-y-2 pb-4">
        <div className="text-xs text-neutral-700 space-y-1 border border-red-200 rounded-xl p-3 bg-white/80">
          <p>
            <span className="font-medium text-neutral-900">Scheduled:</span>{" "}
            <span>{counts.scheduled}</span>
          </p>
          <p>
            <span className="font-medium text-neutral-900">PRN:</span>{" "}
            <span>{counts.prn}</span>
          </p>
          <p>
            <span className="font-medium text-neutral-900">Continuous:</span>{" "}
            <span>{counts.continuous}</span>
          </p>
          <p>
            <span className="font-medium text-neutral-900">Due now:</span>{" "}
            <span>{dueCount}</span>
          </p>
        </div>
        <div className="h-28 w-full border border-red-200 rounded-xl overflow-y-auto px-3 py-2 bg-white/60">
          {medLines.length === 0 ? (
            <p className="text-xs text-neutral-500">No active medication lines for this case.</p>
          ) : (
            <ul className="text-xs text-neutral-700 space-y-1 list-disc pl-4">
              {medLines.map((line) => (
                <li key={line.id}>{line.name}</li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
      <div className="absolute bottom-0 bg-red-200 w-full h-3" />
    </Card>
  );
};

export default MarSnapshot;
