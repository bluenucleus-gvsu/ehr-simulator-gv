"use client";
import React, { useState } from "react";
import FeedbackModal from "./FeedbackModal";

export type Member = {
  id: string;
  name: string;
};

export type Group = {
  id: string;
  name: string;
  members: Member[];
};

export type Simulation = {
  id: string;
  caseName: string;
  simTime: string;
  groups: Group[];
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

  const handleSubmit = (key: string, feedback: string) => {
    setSubmittedFeedback((prev) => ({ ...prev, [key]: feedback }));
    console.log(`[DUMMY] Feedback submitted for "${key}":`, feedback);
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
