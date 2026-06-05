"use client";

import { useEffect, useRef, useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useSimulationCase } from "@/context/SimulationCaseContext";
import { useSimSessionContext } from "@/context/SimSessionContext";
import {
  phaseAdvanceAlertDescription,
  phaseAdvanceAlertTitle,
  SIM_PHASE_UPDATED_TABS,
} from "@/lib/simPhases";

/**
 * Shown when faculty advances `case_sessions.current_phase` during active simulation.
 * Visible on any chart tab (global overlay).
 */
export default function PhaseAdvanceAlert() {
  const { phaseContext } = useSimulationCase();
  const { isPresim, loading: sessionLoading } = useSimSessionContext();
  const [open, setOpen] = useState(false);
  const [alertPhase, setAlertPhase] = useState<number | null>(null);
  const previousPhaseRef = useRef<number | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (sessionLoading) return;
    if (!phaseContext.isMultiPhase) return;
    if (isPresim ?? true) return;

    const current = phaseContext.currentPhase;

    if (!initializedRef.current) {
      initializedRef.current = true;
      previousPhaseRef.current = current;
      return;
    }

    const previous = previousPhaseRef.current ?? current;
    if (current > previous) {
      setAlertPhase(current);
      setOpen(true);
    }
    previousPhaseRef.current = current;
  }, [
    phaseContext.currentPhase,
    phaseContext.isMultiPhase,
    isPresim,
    sessionLoading,
  ]);

  if (!alertPhase) return null;

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>{phaseAdvanceAlertTitle(alertPhase)}</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3 text-sm leading-relaxed">
            <span className="block">{phaseAdvanceAlertDescription(alertPhase)}</span>
            <span className="block rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700">
              Check: {SIM_PHASE_UPDATED_TABS.join(" · ")}
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => setOpen(false)}>Got it</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
