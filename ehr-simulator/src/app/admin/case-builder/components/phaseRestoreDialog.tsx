"use client";

import { useEffect, useState } from "react";

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
import { Label } from "@/components/ui/label";
import { PhaseBadge } from "./phaseBadge";
import type { PhaseRestoreChoice } from "@/lib/caseBuilder/phaseCacheOps";
import { cn } from "@/lib/utils";

type PhaseRestoreDialogProps = {
  open: boolean;
  phases: number[];
  onConfirm: (resolutions: Record<number, PhaseRestoreChoice>) => void;
  onCancel: () => void;
};

export function PhaseRestoreDialog({
  open,
  phases,
  onConfirm,
  onCancel,
}: PhaseRestoreDialogProps) {
  const [choices, setChoices] = useState<Record<number, PhaseRestoreChoice>>({});

  useEffect(() => {
    if (!open) return;
    const initial: Record<number, PhaseRestoreChoice> = {};
    for (const p of phases) initial[p] = "carry";
    setChoices(initial);
  }, [open, phases]);

  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>How should expanded phases load?</AlertDialogTitle>
          <AlertDialogDescription>
            These phases still have saved data from before the phase count was lowered. By default,
            each phase copies from the phase before it (Phase 3 gets Phase 2&apos;s content, etc.).
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-2">
          {phases.map((p) => (
            <div
              key={p}
              className="rounded-lg border border-slate-200 bg-slate-50/80 p-3 space-y-2"
            >
              <PhaseBadge phase={p} size="sm" />
              <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="radio"
                    name={`phase-restore-${p}`}
                    checked={choices[p] === "carry"}
                    onChange={() => setChoices((c) => ({ ...c, [p]: "carry" }))}
                    className="accent-slate-800"
                  />
                  Copy from Phase {p - 1}
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="radio"
                    name={`phase-restore-${p}`}
                    checked={choices[p] === "restore"}
                    onChange={() => setChoices((c) => ({ ...c, [p]: "restore" }))}
                    className="accent-slate-800"
                  />
                  Use saved Phase {p} data
                </label>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <Label className="text-xs text-slate-500 w-full">Apply to all</Label>
          <button
            type="button"
            className={cn("text-xs rounded-md border px-2 py-1 hover:bg-slate-100")}
            onClick={() => {
              const all: Record<number, PhaseRestoreChoice> = {};
              for (const p of phases) all[p] = "carry";
              setChoices(all);
            }}
          >
            All copy from previous
          </button>
          <button
            type="button"
            className="text-xs rounded-md border px-2 py-1 hover:bg-slate-100"
            onClick={() => {
              const all: Record<number, PhaseRestoreChoice> = {};
              for (const p of phases) all[p] = "restore";
              setChoices(all);
            }}
          >
            All use saved
          </button>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => onConfirm(choices)}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
