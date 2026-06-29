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

  const phaseHint =
    activePhase > 1
      ? `Editing Phase ${activePhase}. Changes save when you switch phases or continue.`
      : "Start in Phase 1. Changes save when you switch phases or continue.";

  return (
    <div className="w-full shrink-0 border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-2.5 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 shrink-0 sm:w-28">
            Phase
          </p>
          <div className="flex flex-wrap items-center gap-2 sm:flex-1">
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
                "h-8 min-w-[5.25rem] px-3 text-sm font-semibold border-2 transition-colors",
                isActive
                  ? cn(style.badge, "shadow-sm ring-2 ring-slate-300/80")
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
              "h-8 gap-1.5 border-2 border-dashed px-3 font-semibold",
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
            className="h-8 gap-1.5 border-2 border-red-200 px-3 text-red-700 hover:bg-red-50 font-semibold"
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
        </div>
        <p className="text-xs leading-relaxed text-slate-500 sm:pl-32">
          {phaseHint}
        </p>
      </div>
    </div>
  );
}
