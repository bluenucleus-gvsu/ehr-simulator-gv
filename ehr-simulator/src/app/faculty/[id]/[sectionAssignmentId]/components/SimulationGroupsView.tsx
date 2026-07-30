"use client";

import { useState, useMemo } from "react";
import FeedbackModal from "@/app/faculty/components/FeedbackModal";
import { FeedbackTarget, ActiveSimView } from "@/app/faculty/lib/types";
import { updateCurrentPhase } from "@/actions/simulation";
import { useRouter } from "next/navigation";
import AdvanceAlertDialog from "./AdvanceAlertDialog";

function formatSimTime(dateStr: string) {
  return new Date(dateStr).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// ─── Simulation Groups View ───────────────────────────────────────────────────
export default function SimulationGroupsView({
  activeSimView,
}: {
  activeSimView: ActiveSimView;
}) {
  const router = useRouter();

  const { simulation, courseName, sectionName } = activeSimView;
  const [feedbackTarget, setFeedbackTarget] = useState<FeedbackTarget | null>(null);
  const [submittedFeedback, setSubmittedFeedback] = useState<Record<string, string>>({});

  const phases = simulation.phaseCount; 
  const maxPhasesPerRow = 5; 

  const sortedGroups = useMemo(() => {
    return [...simulation.groups].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" })
    );
  }, [simulation.groups]);

  const initialPhases = simulation.groups.reduce((acc, group) => {
    acc[group.id] = group.currentPhase;
    return acc;
  }, {} as Record<string, number>);

  const [groupPhase, setGroupPhase] = useState<Record<string, number>>(initialPhases);
  const [phaseDialog, setPhaseDialog] = useState(false);
  const [pendingPhaseGroup, setPendingPhaseGroup] = useState<{ id: string; name: string } | null>(null);

  const handleSubmit = (key: string, feedback: string) => {
    setSubmittedFeedback((prev) => ({ ...prev, [key]: feedback }));
    console.log(`[DUMMY] Feedback submitted for "${key}":`, feedback);
  };

  const handlePhaseAdvancement = (id: string, name: string, currentPhase: number) => {
    if (currentPhase < phases) {
      setPendingPhaseGroup({ id, name });
      setPhaseDialog(true);
    }
  };

  const confirmPhaseAdvancement = async () => {
    if (!pendingPhaseGroup) return;

    // 2. Safely grab the specific group's unique caseSessionId
    const group = simulation.groups.find((g) => g.id === pendingPhaseGroup.id);
    const sessionId = group?.caseSessionId;
    const currentPhaseNumber = groupPhase[pendingPhaseGroup.id] || 1;
    const updatedPhase = currentPhaseNumber + 1;

    if (sessionId) {
      const response = await updateCurrentPhase(updatedPhase, sessionId);

      if (response?.error) {
        console.error("Failed to advance phase", response);
      } else {
        // 3. Update the local state seamlessly on success
        setGroupPhase((prev) => ({
          ...prev,
          [pendingPhaseGroup.id]: updatedPhase,
        }));
      }
    } else {
      console.error("No valid case session ID found for this group.");
    }

    setPhaseDialog(false);
    setPendingPhaseGroup(null);
  };

  const cancelPhaseAdvancement = () => {
    setPhaseDialog(false);
    setPendingPhaseGroup(null);
  };

  return (
    <div className="space-y-4">
      {/* Back button + breadcrumb */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
        >
          ← Back to courses
        </button>
        <span className="text-slate-400 text-sm">/</span>
        <span className="text-sm text-slate-600">
          {courseName} – {sectionName}
        </span>
      </div>

      {/* Simulation header */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <span className="text-green-700 text-lg">▶</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold">{simulation.caseName}</h2>
            <p className="text-sm text-muted-foreground">
              Simulation in progress · {formatSimTime(simulation.simTime)}
            </p>
          </div>
        </div>
      </div>

      {/* Groups */}
      <h3 className="text-base font-semibold px-1">Assigned Groups</h3>
      <div className="grid gap-4 md:grid-cols-2">
        {sortedGroups.map((group) => {
          const groupFeedbackKey = `group:${group.id}`;
          const hasGroupFeedback = !!submittedFeedback[groupFeedbackKey];

          // Use local state for the phase
          const currentPhase = groupPhase[group.id] ?? group.currentPhase;

          const phaseRows = Array.from(
            { length: Math.ceil(phases / maxPhasesPerRow) },
            (_, rowIndex) => {
              const start = rowIndex * maxPhasesPerRow + 1;
              const rowLength = Math.min(maxPhasesPerRow, phases - rowIndex * maxPhasesPerRow);
              return Array.from({ length: rowLength }, (_, idx) => start + idx);
            }
          );

          return (
            <div key={group.id} className="bg-white rounded-lg shadow p-4 space-y-3">
              {/* Group header */}
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-slate-800">{group.name}</h4>
                <button
                  onClick={() =>
                    setFeedbackTarget({
                      kind: "group",
                      groupId: group.id,
                      groupName: group.name,
                    })
                  }
                  className={`px-3 py-1 text-xs rounded-md font-medium ${
                    hasGroupFeedback
                      ? "bg-green-50 text-green-700 border border-green-300"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                  disabled={true}
                >
                  {hasGroupFeedback ? "✓ Group Feedback Given" : "Give Group Feedback"}
                </button>
              </div>

              {/* Members */}
              <ul className="divide-y divide-slate-100">
                {group.members.map((member) => {
                  const memberFeedbackKey = `member:${member.id}`;
                  const hasMemberFeedback = !!submittedFeedback[memberFeedbackKey];
                  return (
                    <li key={member.id} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-600">
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </div>
                        <span className="text-sm text-slate-700">{member.name}</span>
                      </div>
                      <button
                        onClick={() =>
                          setFeedbackTarget({
                            kind: "individual",
                            studentId: member.id,
                            studentName: member.name,
                            groupName: group.name,
                          })
                        }
                        className={`px-2 py-1 text-xs rounded-md font-medium ${
                          hasMemberFeedback
                            ? "bg-green-50 text-green-700 border border-green-300"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                        disabled={true}
                      >
                        {hasMemberFeedback ? "✓ Feedback Given" : "Give Feedback"}
                      </button>
                    </li>
                  );
                })}
              </ul>
              <hr />
              
              {/* Group Footer for Phase Change */}
              <div className="flex flex-wrap items-center gap-4 py-2">
                <div className="flex-1 min-w-[18rem] space-y-1">
                  {phaseRows.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex flex-wrap items-center">
                      {row.map((phaseIndex, idx) => (
                        <button
                          key={phaseIndex}
                          onClick={() => phaseIndex === currentPhase + 1 ? handlePhaseAdvancement(group.id, group.name, currentPhase) : null}
                          style={{
                            clipPath:
                              idx === 0
                                ? "polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%)"
                                : "polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%, 10px 50%)",
                            marginLeft: idx === 0 ? "0" : "-10px",
                            zIndex: phaseIndex,
                          }}
                          className={`relative px-4 py-1.5 text-sm font-medium text-white ${
                            phaseIndex < currentPhase
                              ? "bg-green-500"
                              : phaseIndex === currentPhase
                              ? "bg-blue-500"
                              : "bg-slate-300"
                          }`}
                        >
                          P{phaseIndex}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handlePhaseAdvancement(group.id, group.name, currentPhase)}
                  disabled={currentPhase >= phases}
                  className="shrink-0 rounded-md bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  Next Phase
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Feedback modal */}
      {feedbackTarget && (
        <FeedbackModal
          title={
            feedbackTarget.kind === "group"
              ? `Group Feedback – ${feedbackTarget.groupName}`
              : `Individual Feedback – ${feedbackTarget.studentName}`
          }
          onClose={() => setFeedbackTarget(null)}
          onSubmit={(text) => {
            const key =
              feedbackTarget.kind === "group"
                ? `group:${feedbackTarget.groupId}`
                : `member:${feedbackTarget.studentId}`;
            handleSubmit(key, text);
          }}
        />
      )}

      {/* Next Phase Alert Dialog */}
      <AdvanceAlertDialog
        phaseDialog={phaseDialog}
        pendingPhaseGroup={pendingPhaseGroup}
        cancelPhaseAdvancement={cancelPhaseAdvancement}
        confirmPhaseAdvancement={confirmPhaseAdvancement}
      />

    </div>
  );
}
