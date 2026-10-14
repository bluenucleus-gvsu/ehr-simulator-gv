"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { markSessionInProgress } from "@/actions/simulation";
import type { CaseSessionAvailability } from "@/utils/assignedSimulationLifecycle";
import CaseCardField from "@/app/user/components/CaseCardField";

type AssignedCaseCardProps = {
  id: string;
  caseId: string | null;
  sessionId: string | null;
  availability?: CaseSessionAvailability;
  name?: string | null;
  simTime?: string | null;
  presimTime?: string | null;
  groupMembers?: string[];
};

export default function AssignedCaseCard({
  id,
  caseId,
  sessionId,
  availability = "upcoming",
  name,
  simTime,
  presimTime,
  groupMembers = [],
}: AssignedCaseCardProps) {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);

  const simDate = simTime ? new Date(simTime) : null;
  const presimDate = presimTime ? new Date(presimTime) : null;
  const isActive = availability === "active";
  const isPresim = availability === "presim";
  const isUpcoming = availability === "upcoming";
  const isUnavailable = !caseId;

  const handleRoute = async (pathSuffix: string, isStartingSim: boolean = false) => {
    if (!sessionId) {
      toast.error("Session is still being generated. Please try again later.");
      return;
    }

    if (!caseId) {
      toast.error("This case is no longer available.");
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
    <div
      data-testid="case-card"
      data-session-id={sessionId ?? undefined}
      className="border rounded-md p-4 pt-3 bg-white shadow-sm flex items-center justify-between"
    >
      <div>
        <div className="font-semibold text-lg pb-2">{name ?? "Untitled Simulation"}</div>
        <CaseCardField label="Sim">{simDate ? simDate.toLocaleString() : "TBD"}</CaseCardField>
        {presimDate
          ? <CaseCardField label="Pre-sim">{presimDate.toLocaleString()}</CaseCardField>
          : null}
        <CaseCardField label="Group">
          {groupMembers.length ? groupMembers.join(", ") : "No members"}
        </CaseCardField>
        {isUpcoming && presimDate ? (
          <div className="text-slate-800 pt-2">
            Pre-sim opens {presimDate.toLocaleString()}
          </div>
        ) : null}
      </div>

      <div className="ml-4 flex items-center gap-2">
        {isUnavailable ? (
          <button
            className="px-3 py-1 text-sm bg-slate-500 text-white rounded opacity-80 cursor-not-allowed"
            disabled
            aria-label={`Case ${name ?? id} is unavailable`}
          >
            Case unavailable
          </button>
        ) : isActive ? (
          <button
            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            onClick={() => handleRoute('chart/overview', true)}
            disabled={isStarting}
            aria-label={`Start simulation ${name ?? id}`}
          >
            {isStarting ? "Loading..." : "Enter Active Simulation"}
          </button>
        ) : isPresim ? (
          <button
            className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
            onClick={() => handleRoute('chart/overview', false)}
            aria-label={`View pre-sim chart for ${name ?? id}`}
          >
            Enter Pre-Sim Mode
          </button>
        ) : (
          <button
            className="px-3 py-1 text-sm bg-slate-500 text-white rounded opacity-80 cursor-not-allowed"
            disabled
            aria-label={`Simulation ${name ?? id} not available yet`}
          >
            Not available yet
          </button>
        )}
      </div>
    </div>
  );
}
