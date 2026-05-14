"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { markSessionInProgress } from "@/actions/simulation";
import { getAssignedSimulationLifecycle } from "@/utils/assignedSimulationLifecycle";
import { isTesterModeClient } from "@/utils/testerMode";
import { setTesterSessionStatus } from "@/utils/testerLocalStore";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type ProfileAssignmentEntry = {
  id: string;
  caseId: string;
  sessionId: string | null;
  name: string | null;
  simTime: string | null;
  presimTime: string | null;
  courseLabel: string;
};

type Props = {
  assignments: ProfileAssignmentEntry[];
};

const CHART_OVERVIEW = "chart/overview";

async function goToSimulation(
  router: ReturnType<typeof useRouter>,
  opts: { caseId: string; sessionId: string | null; isStartingSim: boolean },
  onStartingActiveSession?: (sessionId: string) => void
) {
  const { caseId, sessionId, isStartingSim } = opts;
  if (!sessionId) {
    toast.error("Session is still being generated. Please try again later.");
    return;
  }

  if (isStartingSim) {
    onStartingActiveSession?.(sessionId);
    if (isTesterModeClient()) {
      setTesterSessionStatus(sessionId, "in progress");
    }
    const { success } = await markSessionInProgress(sessionId);
    if (!success) {
      toast.error("Failed to update session status, but proceeding anyway.");
    }
  }

  router.push(`/simulation/${caseId}/${sessionId}/${CHART_OVERVIEW}`);
}

export default function ProfileSimulationEntryButtons({ assignments }: Props) {
  const router = useRouter();
  const [presimPickerOpen, setPresimPickerOpen] = useState(false);
  const [activePickerOpen, setActivePickerOpen] = useState(false);
  const [startingSessionId, setStartingSessionId] = useState<string | null>(null);

  const enriched = assignments.map((a) => ({
    ...a,
    lifecycle: getAssignedSimulationLifecycle({
      simTime: a.simTime,
      presimTime: a.presimTime,
    }),
  }));

  const presimEntries = enriched.filter((a) => a.lifecycle.availability === "presim");
  const activeEntries = enriched.filter((a) => a.lifecycle.availability === "active");

  const handlePresimPrimaryClick = () => {
    if (presimEntries.length === 0) return;
    if (presimEntries.length === 1) {
      const a = presimEntries[0];
      void goToSimulation(router, { caseId: a.caseId, sessionId: a.sessionId, isStartingSim: false });
      return;
    }
    setPresimPickerOpen(true);
  };

  const handleActivePrimaryClick = () => {
    if (activeEntries.length === 0) return;
    if (activeEntries.length === 1) {
      const a = activeEntries[0];
      void goToSimulation(router, { caseId: a.caseId, sessionId: a.sessionId, isStartingSim: true }, setStartingSessionId);
      return;
    }
    setActivePickerOpen(true);
  };

  const pickPresim = (a: (typeof presimEntries)[number]) => {
    void goToSimulation(router, { caseId: a.caseId, sessionId: a.sessionId, isStartingSim: false });
    setPresimPickerOpen(false);
  };

  const pickActive = (a: (typeof activeEntries)[number]) => {
    void goToSimulation(router, { caseId: a.caseId, sessionId: a.sessionId, isStartingSim: true }, setStartingSessionId);
    setActivePickerOpen(false);
  };

  const isStartingActive = startingSessionId !== null;

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="default" disabled={presimEntries.length === 0} onClick={handlePresimPrimaryClick}>
          Enter Presim
        </Button>
        <Button
          type="button"
          variant="default"
          disabled={activeEntries.length === 0 || isStartingActive}
          onClick={handleActivePrimaryClick}
        >
          {isStartingActive ? "Starting…" : "Enter Active Sim"}
        </Button>
      </div>

      <Dialog open={presimPickerOpen} onOpenChange={setPresimPickerOpen}>
        <DialogContent showCloseButton>
          <DialogHeader>
            <DialogTitle>Choose a pre-simulation</DialogTitle>
            <DialogDescription>Select which assigned case you want to open in pre-sim mode.</DialogDescription>
          </DialogHeader>
          <ul className="flex max-h-[min(60vh,24rem)] flex-col gap-2 overflow-y-auto pr-1">
            {presimEntries.map((a) => (
              <li key={`${a.id}:${a.sessionId ?? "none"}`}>
                <button
                  type="button"
                  disabled={!a.sessionId}
                  onClick={() => pickPresim(a)}
                  className="w-full rounded-md border border-slate-200 bg-white p-3 text-left text-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <div className="font-medium">{a.name ?? "Untitled simulation"}</div>
                  <div className="text-muted-foreground text-xs">{a.courseLabel}</div>
                  {!a.sessionId ? (
                    <div className="text-muted-foreground mt-1 text-xs">Session not ready yet.</div>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>

      <Dialog open={activePickerOpen} onOpenChange={setActivePickerOpen}>
        <DialogContent showCloseButton>
          <DialogHeader>
            <DialogTitle>Choose an active simulation</DialogTitle>
            <DialogDescription>Select which assigned case you want to enter as the live simulation.</DialogDescription>
          </DialogHeader>
          <ul className="flex max-h-[min(60vh,24rem)] flex-col gap-2 overflow-y-auto pr-1">
            {activeEntries.map((a) => (
              <li key={`${a.id}:${a.sessionId ?? "none"}`}>
                <button
                  type="button"
                  disabled={!a.sessionId || isStartingActive}
                  onClick={() => pickActive(a)}
                  className="w-full rounded-md border border-slate-200 bg-white p-3 text-left text-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <div className="font-medium">{a.name ?? "Untitled simulation"}</div>
                  <div className="text-muted-foreground text-xs">{a.courseLabel}</div>
                  {!a.sessionId ? (
                    <div className="text-muted-foreground mt-1 text-xs">Session not ready yet.</div>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </>
  );
}
