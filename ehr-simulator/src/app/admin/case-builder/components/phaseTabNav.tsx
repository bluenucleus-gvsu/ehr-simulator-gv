"use client";

import { useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
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
    deleteScopePhase,
  } = usePhaseTab(scope);

  const [busy, setBusy] = useState(false);

  if (phaseCount <= 1) return null;

  const canCreateNext = highestInitializedPhase < phaseCount;
  const nextPhaseNum = highestInitializedPhase + 1;
  const canDeletePhase =
    activePhase > 1 && activePhase === highestInitializedPhase && !busy;

  const runPhaseAction = async (action: () => Promise<unknown>, savedMessage?: string) => {
    setBusy(true);
    try {
      await action();
      if (savedMessage) toast.success(savedMessage);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Phase update failed.");
    } finally {
      setBusy(false);
    }
  };

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
              disabled={busy}
              className={cn(
                "h-9 min-w-[88px] text-sm font-semibold border-2 transition-all",
                isActive
                  ? cn(style.badge, "ring-2 ring-offset-2 ring-slate-400 scale-105")
                  : cn(style.selectTrigger, "hover:opacity-90"),
              )}
              onClick={() =>
                void runPhaseAction(
                  () => switchActivePhase(p),
                  `Phase ${p} — all changes saved.`,
                )
              }
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
            disabled={busy}
            className={cn(
              "h-9 gap-1 border-2 border-dashed font-semibold",
              getPhaseStyle(nextPhaseNum).selectTrigger,
            )}
            onClick={() =>
              void runPhaseAction(
                () => createNextPhase(),
                `Phase ${nextPhaseNum} created — previous phases saved.`,
              )
            }
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Phase {nextPhaseNum}
          </Button>
        ) : null}

        {canDeletePhase ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={busy}
            className="h-9 gap-1 border-2 border-red-200 text-red-700 hover:bg-red-50 font-semibold"
            onClick={() =>
              void runPhaseAction(async () => {
                const ok = await deleteScopePhase();
                if (ok) toast.success(`Phase ${activePhase} deleted.`);
              })
            }
          >
            <Trash2 className="h-4 w-4" />
            Delete Phase {activePhase}
          </Button>
        ) : null}
      </div>
      {activePhase > 1 ? (
        <p className="text-xs text-slate-500 text-center max-w-lg">
          Editing Phase {activePhase}. All phases save automatically when you switch, create a new phase, or continue.
        </p>
      ) : (
        <p className="text-xs text-slate-500 text-center max-w-lg">
          Start in Phase 1. Changes save when you switch phases, add a phase, or click Continue.
        </p>
      )}
    </div>
  );
}
