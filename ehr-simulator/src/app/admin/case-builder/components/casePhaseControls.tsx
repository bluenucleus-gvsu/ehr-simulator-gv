"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteCasePhasesAbove } from "@/actions/case_builder/deleteCasePhaseData";
import { updateCasePhaseCount } from "@/actions/case_builder/updateCasePhaseCount";
import { useFormContext } from "@/context/FormContext";
import { MAX_CASE_PHASES } from "@/lib/casePhases";
import { isTesterModeClient } from "@/utils/testerMode";

/** Max phases allowed for this case (set next to Save). Phase switching lives on each Orders/Labs/MAR tab. */
export function CasePhaseControls() {
  const { caseId, phaseCount, applyPhaseCountChange } = useFormContext();

  const [draftCount, setDraftCount] = useState(String(phaseCount));
  const [isUpdating, setIsUpdating] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState<number | null>(null);

  useEffect(() => {
    setDraftCount(String(phaseCount));
  }, [phaseCount]);

  const commitCount = async (parsed: number) => {
    setIsUpdating(true);
    try {
      if (parsed < phaseCount && caseId && !isTesterModeClient()) {
        await deleteCasePhasesAbove(caseId, parsed);
      }
      if (caseId && !isTesterModeClient()) {
        await updateCasePhaseCount(caseId, parsed);
      }
      applyPhaseCountChange(parsed);
      toast.success(`This case allows up to ${parsed} phase${parsed === 1 ? "" : "s"}.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update phase count.");
    } finally {
      setIsUpdating(false);
      setConfirmOpen(false);
      setPendingCount(null);
    }
  };

  const handleUpdateCount = () => {
    const parsed = Number(draftCount);
    if (!Number.isFinite(parsed) || parsed < 1 || parsed > MAX_CASE_PHASES) {
      toast.error(`Enter a number between 1 and ${MAX_CASE_PHASES}.`);
      return;
    }

    if (parsed === phaseCount) return;

    if (parsed < phaseCount) {
      setPendingCount(parsed);
      setConfirmOpen(true);
      return;
    }

    void commitCount(parsed);
  };

  const handleConfirmDecrease = () => {
    if (pendingCount !== null) {
      void commitCount(pendingCount);
    }
  };

  const handleCancelDecrease = () => {
    setConfirmOpen(false);
    setPendingCount(null);
    setDraftCount(String(phaseCount));
  };

  const removedPhases =
    pendingCount !== null && pendingCount < phaseCount
      ? Array.from({ length: phaseCount - pendingCount }, (_, i) => pendingCount + 1 + i)
      : [];

  return (
    <>
      <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5">
        <Label htmlFor="phase-count-input" className="text-xs font-medium text-slate-600 whitespace-nowrap">
          Max phases
        </Label>
        <Input
          id="phase-count-input"
          type="number"
          min={1}
          max={MAX_CASE_PHASES}
          value={draftCount}
          onChange={(e) => setDraftCount(e.target.value)}
          className="h-8 w-14 bg-white text-center text-sm px-1"
          title="Maximum number of phases faculty can create on Orders, Labs, and MAR tabs"
        />
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="h-8 px-3 text-xs"
          disabled={isUpdating}
          onClick={handleUpdateCount}
        >
          {isUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : "Update"}
        </Button>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={(open) => !open && handleCancelDecrease()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove extra phases?</AlertDialogTitle>
            <AlertDialogDescription>
              Lowering the max to {pendingCount} will delete saved data for phase
              {removedPhases.length === 1 ? "" : "s"}{" "}
              {removedPhases.length > 0 ? removedPhases.join(", ") : ""}. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDecrease}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDecrease}>Remove phases</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
