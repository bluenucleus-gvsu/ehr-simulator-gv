"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { BellRing, ClipboardList, FileText, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSimSessionContext } from "@/context/SimSessionContext";
import { useSimulationCase } from "@/context/SimulationCaseContext";
import {
  buildSimulationPhaseUpdateSummary,
  type SimulationPhaseUpdateSummary,
  type SimulationUpdateSectionKey,
} from "@/lib/simulationPhaseUpdates";

const tabHrefByKey: Record<SimulationUpdateSectionKey, string> = {
  orders: "orders",
  notes: "notes",
  mar: "mar",
};

const sectionIconByKey: Record<SimulationUpdateSectionKey, typeof ClipboardList> = {
  orders: ClipboardList,
  notes: FileText,
  mar: Pill,
};

export default function PhaseUpdateDialog() {
  const router = useRouter();
  const params = useParams();
  const { caseBundle } = useSimulationCase();
  const { currentPhase, isPresim, loading } = useSimSessionContext();
  const [isOpen, setIsOpen] = useState(false);
  const [summary, setSummary] = useState<SimulationPhaseUpdateSummary | null>(null);
  const previousPhaseRef = useRef<number | null>(null);

  const routeBase = useMemo(() => {
    const caseId = params?.caseId;
    const sessionId = params?.sessionId;
    if (typeof caseId !== "string" || typeof sessionId !== "string") return null;
    return `/simulation/${caseId}/${sessionId}/chart`;
  }, [params]);

  useEffect(() => {
    if (loading) return;

    if (previousPhaseRef.current == null) {
      previousPhaseRef.current = currentPhase;
      return;
    }

    const previousPhase = previousPhaseRef.current;
    if (previousPhase === currentPhase) return;

    previousPhaseRef.current = currentPhase;

    if (isPresim ?? true) return;

    const nextSummary = buildSimulationPhaseUpdateSummary(caseBundle, previousPhase, currentPhase);
    setSummary(nextSummary);
    setIsOpen(true);
  }, [caseBundle, currentPhase, isPresim, loading]);

  const handleNavigate = (section: SimulationUpdateSectionKey) => {
    if (!routeBase) return;
    setIsOpen(false);
    router.push(`${routeBase}/${tabHrefByKey[section]}`);
  };

  if (!summary) return null;

  const movingBack = summary.fromPhase > summary.toPhase

  if (movingBack) return(
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-xl bg-white">
        <DialogHeader className="gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <BellRing className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl text-red-600">
                Moving back to Phase {summary.toPhase}!
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-600">
                Be aware some information may not be present from Phase {summary.fromPhase}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" onClick={() => setIsOpen(false)}>
            Continue Simulation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-xl bg-white">
        <DialogHeader className="gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <BellRing className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl text-slate-900">
                Phase {summary.toPhase}
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-600">
                Review the newly released information for this active simulation phase.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-3">
          {summary.hasAnyNewData ? (
            summary.sections.map((section) => {
              const Icon = sectionIconByKey[section.key];
              return (
                <div
                  key={section.key}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <Icon className="h-4 w-4 text-slate-600" />
                      <span>{section.label}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{section.summary}</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="ml-4 shrink-0 bg-white"
                    onClick={() => handleNavigate(section.key)}
                  >
                    Open {section.label}
                  </Button>
                </div>
              );
            })
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-600">
              Phase {summary.toPhase} is now active. No new Orders, Notes, or MAR items were released in this phase.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" onClick={() => setIsOpen(false)}>
            Continue Simulation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
