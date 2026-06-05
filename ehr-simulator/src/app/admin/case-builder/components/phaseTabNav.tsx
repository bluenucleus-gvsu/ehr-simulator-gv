"use client";

import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { usePhaseTab } from "@/context/FormContext";
import type { PhaseTabScope } from "@/lib/casePhases";
import { getPhaseStyle } from "@/lib/caseBuilder/phaseStyles";
import { cn } from "@/lib/utils";

type PhaseTabNavProps = {
  scope: PhaseTabScope;
};

/**
 * Per-tab phase navigation: Phase 1..N buttons plus "Create Phase N+1".
 * Each Orders / Labs / Med Orders / MAR tab maintains its own phase progression.
 */
export function PhaseTabNav({ scope }: PhaseTabNavProps) {
  const {
    phaseCount,
    activePhase,
    highestInitializedPhase,
    switchActivePhase,
    createNextPhase,
  } = usePhaseTab(scope);

  if (phaseCount <= 1) return null;

  const canCreateNext = highestInitializedPhase < phaseCount;
  const nextPhaseNum = highestInitializedPhase + 1;

  return (
    <div className="flex flex-col items-center gap-2 border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
        Simulation phase
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {Array.from({ length: highestInitializedPhase }, (_, i) => i + 1).map((p) => {
          const style = getPhaseStyle(p);
          const isActive = activePhase === p;
          return (
            <Button
              key={p}
              type="button"
              size="sm"
              variant={isActive ? "default" : "outline"}
              className={cn(
                "h-9 min-w-[88px] text-sm font-semibold border-2 transition-all",
                isActive
                  ? cn(style.badge, "ring-2 ring-offset-2 ring-slate-400 scale-105")
                  : cn(style.selectTrigger, "hover:opacity-90"),
              )}
              onClick={() => switchActivePhase(p)}
            >
              Phase {p}
            </Button>
          );
        })}

        {canCreateNext ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className={cn(
              "h-9 gap-1 border-2 border-dashed font-semibold",
              getPhaseStyle(nextPhaseNum).selectTrigger,
            )}
            onClick={() => {
              const ok = createNextPhase();
              if (ok) {
                toast.success(
                  `Phase ${nextPhaseNum} created with data copied from Phase ${nextPhaseNum - 1}.`,
                );
              }
            }}
          >
            <Plus className="h-4 w-4" />
            Phase {nextPhaseNum}
          </Button>
        ) : null}
      </div>
      {activePhase > 1 ? (
        <p className="text-xs text-slate-500 text-center max-w-lg">
          Editing Phase {activePhase}. Changes here apply to this phase only.
        </p>
      ) : (
        <p className="text-xs text-slate-500 text-center max-w-lg">
          Start in Phase 1, then use the next phase button when the patient progresses.
        </p>
      )}
    </div>
  );
}
