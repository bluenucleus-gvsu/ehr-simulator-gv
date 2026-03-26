"use client";
import React from "react";

type Props = {
  id: string;
  name?: string | null;
  simTime?: string | null;    // ISO - when the simulation starts
  presimTime?: string | null; // ISO - when case report becomes available
  groupMembers?: string[];
};

export default function AssignedCaseCard({ id, name, simTime, presimTime, groupMembers = [] }: Props) {
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
  const isPresimPhase = !isSimDay && sim && sim > now && presim ? presim <= now : false;

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
        {isSimDay ? (
          <button
            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
            onClick={() => (window.location.href = `/simulation/${id}/chart/overview`)}
            aria-label={`Start simulation ${name ?? id}`}
          >
            Start Simulation
          </button>
        ) : isPresimPhase ? (
          <button
            className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
            onClick={() => (window.location.href = `/simulation/${id}/presim`)}
            aria-label={`View pre-sim chart for ${name ?? id}`}
          >
            View Case Report
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
