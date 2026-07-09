"use client";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { Simulation, Course} from "../lib/types";

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

// ─── Main Faculty Courses View ────────────────────────────────────────────────
export default function FacultyCoursesView({ courses }: { courses: Course[] }) {
  const { user } = useUser();
  const router  = useRouter();
  const activeCourses = courses.filter((c) => c.active);
  const inactiveCourses = courses.filter((c) => !c.active);

  const renderSimulationCard = (
    sim: Simulation,
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
              onClick={() => router.push(`/faculty/${user.id}/${sim.id}`)}
              className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
            >
              Enter Simulation
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
                renderSimulationCard(sim)
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
