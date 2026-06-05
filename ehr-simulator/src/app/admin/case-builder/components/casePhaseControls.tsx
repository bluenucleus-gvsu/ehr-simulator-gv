"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateCasePhaseCount } from "@/actions/case_builder/updateCasePhaseCount";
import { useFormContext } from "@/context/FormContext";
import { MAX_CASE_PHASES } from "@/lib/casePhases";
import type { PhaseRestoreChoice } from "@/lib/caseBuilder/phaseCacheOps";
import { isTesterModeClient } from "@/utils/testerMode";
import { PhaseRestoreDialog } from "./phaseRestoreDialog";

/** Max phases allowed for this case (set next to Save). Phase switching lives on each Orders/Labs/MAR tab. */
export function CasePhaseControls() {
  const { caseId, phaseCount, applyPhaseCountChange, getPhasesWithSavedData } = useFormContext();

  const [draftCount, setDraftCount] = useState(String(phaseCount));
  const [isUpdating, setIsUpdating] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [phasesToRestore, setPhasesToRestore] = useState<number[]>([]);

  useEffect(() => {
    setDraftCount(String(phaseCount));
  }, [phaseCount]);

  const commitCount = async (
    parsed: number,
    resolutions: Record<number, PhaseRestoreChoice> = {},
  ) => {
    setIsUpdating(true);
    try {
      if (caseId && !isTesterModeClient()) {
        await updateCasePhaseCount(caseId, parsed);
      }
      applyPhaseCountChange(parsed, resolutions);
      toast.success(`This case allows up to ${parsed} phase${parsed === 1 ? "" : "s"}.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update phase count.");
    } finally {
      setIsUpdating(false);
      setRestoreDialogOpen(false);
      setPendingCount(null);
      setPhasesToRestore([]);
    }
  };

  const handleUpdateCount = async () => {
    const parsed = Number(draftCount);
    if (!Number.isFinite(parsed) || parsed < 1 || parsed > MAX_CASE_PHASES) {
      toast.error(`Enter a number between 1 and ${MAX_CASE_PHASES}.`);
      return;
    }

    if (parsed === phaseCount) return;

    if (parsed > phaseCount) {
      const saved = getPhasesWithSavedData(phaseCount + 1, parsed);
      if (saved.length > 0) {
        setPendingCount(parsed);
        setPhasesToRestore(saved);
        setRestoreDialogOpen(true);
        return;
      }
    }

    await commitCount(parsed);
  };

  const handleRestoreConfirm = (resolutions: Record<number, PhaseRestoreChoice>) => {
    if (pendingCount !== null) {
      void commitCount(pendingCount, resolutions);
    }
  };

  const handleRestoreCancel = () => {
    setRestoreDialogOpen(false);
    setPendingCount(null);
    setPhasesToRestore([]);
    setDraftCount(String(phaseCount));
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 shadow-sm">
        <Label htmlFor="phase-count-input" className="text-[11px] font-medium text-slate-600 shrink-0">
          Max phases
        </Label>
        <Input
          id="phase-count-input"
          type="number"
          min={1}
          max={MAX_CASE_PHASES}
          value={draftCount}
          onChange={(e) => setDraftCount(e.target.value)}
          className="h-7 w-14 bg-white text-xs px-2"
          title="Maximum number of phases faculty can create on Orders, Labs, and MAR tabs"
        />
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="h-7 text-xs px-2"
          disabled={isUpdating}
          onClick={handleUpdateCount}
        >
          {isUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : "Update"}
        </Button>
      </div>

      <PhaseRestoreDialog
        open={restoreDialogOpen}
        phases={phasesToRestore}
        onConfirm={handleRestoreConfirm}
        onCancel={handleRestoreCancel}
      />
    </>
  );
}
