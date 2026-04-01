"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation"; // Use Next.js router
import { markSessionInProgress } from "@/actions/simulation"; // Adjust import path

type Props = {
  id: string;
  caseId: string;
  sessionId: string | null;
  name?: string | null;
  simTime?: string | null;
  presimTime?: string | null;
  groupMembers?: string[];
};

export default function AssignedCaseCard({ id, caseId, sessionId, name, simTime, presimTime, groupMembers = [] }: Props) {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false); // Add a loading state

  const now = new Date();
  const sim = simTime ? new Date(simTime) : null;
  const presim = presimTime ? new Date(presimTime) : null;

  // Three states based on both dates:
  // 1. presim_time hasn't arrived yet (or no dates) → Not Available
  // 2. presim_time passed, sim_time is future        → View Case Report (highlighted)
  // 3. sim_time is today                             → Start Simulation (highlighted)

  const isSimDay = sim
    ? sim.getFullYear() === now.getFullYear() && sim.getMonth() === now.getMonth() && sim.getDate() === now.getDate()
    : false;

  const isPresimPhase = sim && sim > now && presim ? presim <= now : false;
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
      </div>

      <div className="ml-4 flex items-center gap-2">
        {isSimDay && !isPresimPhase ? (
          <button
            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            // Pass `true` here to trigger the server action!
            onClick={() => handleRoute('chart/overview', true)}
            disabled={isStarting}
            aria-label={`Start simulation ${name ?? id}`}
          >
            {isStarting ? "Loading..." : "Start Simulation"}
          </button>
        ) : isPresimPhase ? (
          <button
            className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
            // Pass `false` (or nothing) so it just routes to the case report without updating the status
            onClick={() => handleRoute('chart/overview', false)}
            aria-label={`View pre-sim chart for ${name ?? id}`}
          >
            View Pre-Sim Chart
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


