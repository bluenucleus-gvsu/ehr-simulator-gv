"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation"; // Use Next.js router
import { markSessionInProgress } from "@/actions/simulation"; // Adjust import path
import { getAssignedSimulationLifecycle } from "@/utils/assignedSimulationLifecycle";

type Props = {
  id: string;
  caseId: string;
  sessionId: string | null;
  sessionStatus?: string | null;
  name?: string | null;
  simTime?: string | null;
  presimTime?: string | null;
  groupMembers?: string[];
};

export default function AssignedCaseCard({
  id,
  caseId,
  sessionId,
  sessionStatus,
  name,
  simTime,
  presimTime,
  groupMembers = [],
}: Props) {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false); // Add a loading state

  const lifecycle = getAssignedSimulationLifecycle({
    simTime,
    presimTime,
    sessionStatus,
  });
  const sim = lifecycle.simDate;
  const presim = lifecycle.presimDate;
  const isActivePhase = lifecycle.availability === "active";
  const isPresimPhase = lifecycle.availability === "presim";
  const isCompletedPhase = lifecycle.availability === "completed";
  const handleRoute = async (pathSuffix: string, isStartingSim: boolean = false) => {
    if (!sessionId) {
      toast.error("Session is still being generated. Please try again later.");
      return;
    }

    if (isStartingSim) {
      setIsStarting(true);
      const { success } = await markSessionInProgress(sessionId);

      if (!success) {
        toast.error("Failed to update session status, but proceeding anyway.");
      }
    }

    // Navigate to the chart
    router.push(`/simulation/${caseId}/${sessionId}/${pathSuffix}`);
  };

  return (
    <div className="border rounded-md p-3 bg-white shadow-sm flex items-center justify-between">
      <div>
        <div className="font-semibold">{name ?? "Untitled Simulation"}</div>
        {sim
          ? <div className="text-sm text-muted-foreground">Sim: {sim.toLocaleString()}</div>
          : <div className="text-sm text-muted-foreground">Sim: TBD</div>}
        {presim
          ? <div className="text-sm text-muted-foreground">Pre-sim: {presim.toLocaleString()}</div>
          : null}
        <div className="text-sm text-muted-foreground">
          Group: {groupMembers.length ? groupMembers.join(", ") : "No members"}
        </div>
        {isActivePhase ? (
          <div className="text-xs font-medium text-green-700">Mode: Active Simulation</div>
        ) : isPresimPhase ? (
          <div className="text-xs font-medium text-indigo-700">Mode: Pre-Sim</div>
        ) : isCompletedPhase ? (
          <div className="text-xs font-medium text-slate-600">Mode: Simulation ended</div>
        ) : null}
      </div>

      <div className="ml-4 flex items-center gap-2">
        {isActivePhase ? (
          <button
            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            // Pass `true` here to trigger the server action!
            onClick={() => handleRoute('chart/overview', true)}
            disabled={isStarting}
            aria-label={`Start simulation ${name ?? id}`}
          >
            {isStarting ? "Loading..." : "Enter Active Simulation"}
          </button>
        ) : isPresimPhase ? (
          <button
            className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
            // Pass `false` (or nothing) so it just routes to the case report without updating the status
            onClick={() => handleRoute('chart/overview', false)}
            aria-label={`View pre-sim chart for ${name ?? id}`}
          >
            Enter Pre-Sim Mode
          </button>
        ) : isCompletedPhase ? (
          <button
            type="button"
            className="px-3 py-1 text-sm bg-slate-600 text-white rounded hover:bg-slate-700"
            onClick={() => handleRoute("chart/overview", false)}
            aria-label={`Open chart for ${name ?? id}`}
          >
            Open chart
          </button>
        ) : (
          <button
            className="px-3 py-1 text-sm bg-slate-500 text-white rounded opacity-80 cursor-not-allowed"
            disabled
            aria-label={`Simulation ${name ?? id} not available`}
          >
            Not Available
          </button>
        )}
      </div>
    </div>
  );
}
