"use client";
import React, { useState } from "react";
import FeedbackModal from "./FeedbackModal";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { updateCurrentPhase } from "@/actions/simulation";
export type Member = {
  id: string;
  name: string;
};

export type Group = {
  id: string;
  name: string;
  caseSessionId?: string | null;
  members: Member[];
};

export type Simulation = {
  id: string;
  caseName: string;
  phaseCount: number;
  simTime: string;
  groups: Group[];
  sessionId?: string | null;
  caseSessionIds?: string[];
};

export type Section = {
  id: string;
  name: string;
  simulations: Simulation[];
};

export type Course = {
  id: string;
  code: string;
  name: string;
  active: boolean;
  sections: Section[];
};

type FeedbackTarget =
  | { kind: "group"; groupId: string; groupName: string }
  | { kind: "individual"; studentId: string; studentName: string; groupName: string };

type ActiveSimView = {
  simulation: Simulation;
  courseName: string;
  sectionName: string;
};

function isToday(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function isPast(dateStr: string) {
  return new Date(dateStr) < new Date();
}

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
function SimulationGroupsView({
  activeSimView,
  onBack,
}: {
  activeSimView: ActiveSimView;
  onBack: () => void;
}) {
  const { simulation, courseName, sectionName } = activeSimView;
  const [feedbackTarget, setFeedbackTarget] = useState<FeedbackTarget | null>(null);
  const [submittedFeedback, setSubmittedFeedback] = useState<Record<string, string>>({});

  // Core Alert Dialog and Phase Change Variables
  const phases = simulation.phaseCount; // Number of total phases, found in cases table
  const maxPhasesPerRow = 5; // Max number of phases in one row for UI

  const [groupPhase, setGroupPhase] = useState<Record<string, number>>({}); // List of groups and their phase they are on
  const [phaseDialog, setPhaseDialog] = useState(false);   // Phase Change Dialog Check
  const [pendingPhaseGroup, setPendingPhaseGroup] = useState<{id: string; name:string } | null>(null); // Phase Group Dialog Pending for updating phase

  // Handle Feedback submit button
  const handleSubmit = (key: string, feedback: string) => {
    setSubmittedFeedback((prev) => ({ ...prev, [key]: feedback }));
    console.log(`[DUMMY] Feedback submitted for "${key}":`, feedback);
  };

  // Handle 'Next Phase' Button click
  const handlePhaseAdvancement = (id: string, name: string, currentPhase: number) => {

    // Check if current phase is not over the total phases amount
    if (currentPhase <= phases) {
      setPendingPhaseGroup({id, name}) // Set this group to pending
      setPhaseDialog(true) // And display the AlertDialog
    }

    // May want error handling...
  };

  // Confirm AlertDialog Action
  const confirmPhaseAdvancement = async () => {
    if (!pendingPhaseGroup) return; 

    // Get sessionId
    const group = simulation.groups.find((g) => g.id === pendingPhaseGroup.id);
    const sessionId = group?.caseSessionId ?? simulation.sessionId;
    const updatedPhase = (groupPhase[pendingPhaseGroup.id] ?? 1) + 1

    // If sessionId is present, advance using updateCurrentPhase
    if (sessionId) {

        const response = await updateCurrentPhase(updatedPhase, sessionId)

        if(response.error){
          console.error('Failed to set complete', response)
        }
      }
      else{
        // If there is not sessionId, close the dialog and remove pending status
        setPhaseDialog(false);
        setPendingPhaseGroup(null);

        // May want alternative Alter Dialog or error message...
        return;
      }
        // Set the groupPhase to the updated phase number
        setGroupPhase((prev) => ({
          ...prev,
          [pendingPhaseGroup.id]: updatedPhase,
        }))

        // Close the dialog and remove pending status
        setPhaseDialog(false);
        setPendingPhaseGroup(null);
    
    };

  // Cancel AlertDialog Action
  const cancelPhaseAdvancement = () => {
    setPhaseDialog(false);
    setPendingPhaseGroup(null);
  };

  return (
    <div className="space-y-4">
      {/* Back button + breadcrumb */}
      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
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
        {simulation.groups.map((group) => {
          const groupFeedbackKey = `group:${group.id}`;
          const hasGroupFeedback = !!submittedFeedback[groupFeedbackKey];

          // Test Data
          const currentPhase = groupPhase[group.id] ?? 1; // Get the current phase or just 1
          
          // Creating Array to iterate over phases
          const phaseRows = Array.from(
            { length: Math.ceil(phases / maxPhasesPerRow) },
            (_, rowIndex) => {
              const start = rowIndex * maxPhasesPerRow + 1;
              const rowLength = Math.min(maxPhasesPerRow, phases - rowIndex * maxPhasesPerRow);
              return Array.from({ length: rowLength }, (_, idx) => start + idx);
            }
          );

          return (
            <div
              key={group.id}
              className="bg-white rounded-lg shadow p-4 space-y-3"
            >
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
                    <li
                      key={member.id}
                      className="flex items-center justify-between py-2"
                    >
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
                      >
                        {hasMemberFeedback ? "✓ Feedback Given" : "Give Feedback"}
                      </button>
                    </li>
                  );
                })}
              </ul>
              {/* Group Footer for Phase Change */}
              <hr />
              <div className="flex flex-wrap items-center gap-4 py-2">
                <div className="flex-1 min-w-[18rem] space-y-1">
                  {phaseRows.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex flex-wrap items-center">
                      {row.map((phaseIndex, idx) => (
                        <div
                          key={phaseIndex}
                          style={{
                            clipPath:
                              idx === 0
                               // Using clipPath to create the Phase Layout... [Pn> >Pn+1>...
                                ? 'polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%)'
                                : 'polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%, 10px 50%)',
                            // Set the margin for the first to zero
                            marginLeft: idx === 0 ? '0' : '-10px',
                            zIndex: phaseIndex,
                          }}
                          // Core colors for Current phase, Completed phase, and Not Yet There phase.
                          className={`relative px-4 py-1.5 text-sm font-medium text-white ${
                            phaseIndex < currentPhase
                              ? 'bg-green-500'
                              : phaseIndex === currentPhase
                              ? 'bg-blue-500'
                              : 'bg-slate-300'
                          }`}
                        >
                          P{phaseIndex}
                        </div>
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
      <AlertDialog open={phaseDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Advance {pendingPhaseGroup? pendingPhaseGroup.name : ""} to the Next Phase</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to advance {pendingPhaseGroup? pendingPhaseGroup.name : ""} to the next phase? 
              You can not go back after advancing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelPhaseAdvancement}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmPhaseAdvancement}>
              Advance
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
        
      </AlertDialog>
    </div>
  );
}

// ─── Main Faculty Courses View ────────────────────────────────────────────────
export default function FacultyCoursesView({ courses }: { courses: Course[] }) {
  const [activeSimView, setActiveSimView] = useState<ActiveSimView | null>(null);

  if (activeSimView) {
    return (
      <SimulationGroupsView
        activeSimView={activeSimView}
        onBack={() => setActiveSimView(null)}
      />
    );
  }

  const activeCourses = courses.filter((c) => c.active);
  const inactiveCourses = courses.filter((c) => !c.active);

  const renderSimulationCard = (
    sim: Simulation,
    course: Course,
    section: Section
  ) => {
    const today = isToday(sim.simTime);
    const past = isPast(sim.simTime);

    return (
      <div
        key={sim.id}
        className="border rounded-md p-3 bg-white shadow-sm flex items-center justify-between"
      >
        <div>
          <div className="font-semibold text-sm">{sim.caseName}</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {today
              ? "Today · " + formatSimTime(sim.simTime)
              : formatSimTime(sim.simTime)}
          </div>
          <div className="text-xs text-muted-foreground">
            {sim.groups.length} group{sim.groups.length !== 1 ? "s" : ""} ·{" "}
            {sim.groups.reduce((acc, g) => acc + g.members.length, 0)} students
          </div>
        </div>

        <div className="ml-4 shrink-0">
          {today ? (
            <button
              onClick={() =>
                setActiveSimView({
                  simulation: sim,
                  courseName: `${course.code} – ${course.name}`,
                  sectionName: section.name,
                })
              }
              className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
            >
              Start Simulation
            </button>
          ) : past ? (
            <span className="px-3 py-1.5 text-xs bg-slate-100 text-slate-500 rounded-md">
              Completed
            </span>
          ) : (
            <span className="px-3 py-1.5 text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded-md">
              Upcoming
            </span>
          )}
        </div>
      </div>
    );
  };

  const renderCourse = (course: Course) => (
    <li
      key={course.id}
      className="py-2 px-3 rounded border border-transparent hover:border-slate-200"
    >
      <div className="font-medium mb-2">
        {course.code}
        {course.code && course.name ? " – " : ""}
        {course.name}
      </div>

      {course.sections.map((section) => (
        <details key={section.id} className="mb-2 bg-slate-50 p-2 rounded">
          <summary className="cursor-pointer font-medium text-sm">{section.name}</summary>
          <div className="mt-2 space-y-2">
            {section.simulations.length === 0 ? (
              <div className="text-sm text-muted-foreground">No simulations scheduled.</div>
            ) : (
              section.simulations.map((sim) =>
                renderSimulationCard(sim, course, section)
              )
            )}
          </div>
        </details>
      ))}
    </li>
  );

  return (
    <section className="space-y-4">
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-3">Active Courses</h3>
        {activeCourses.length === 0 ? (
          <div className="text-sm text-muted-foreground">No active courses.</div>
        ) : (
          <ul className="space-y-4">{activeCourses.map(renderCourse)}</ul>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-3">Inactive Courses</h3>
        {inactiveCourses.length === 0 ? (
          <div className="text-sm text-muted-foreground">No inactive courses.</div>
        ) : (
          <ul className="space-y-4">{inactiveCourses.map(renderCourse)}</ul>
        )}
      </div>
    </section>
  );
}
