"use client";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { Simulation, Course } from "@/actions/faculty";
import { resolveAssignmentStatus } from "@/utils/sessionStatus";
import { isToday as checkIsToday, isPast as checkIsPast, format, parseISO } from "date-fns";

function isToday(dateStr: string | null | undefined) {
  if (!dateStr) return false;
  return checkIsToday(parseISO(dateStr));
}

function isPast(dateStr: string | null | undefined) {
  if (!dateStr) return false;
  return checkIsPast(parseISO(dateStr));
}

export function formatSimTime(dateStr: string | null | undefined) {
  if (!dateStr) return "TBD";
  const date = parseISO(dateStr);
  if (!Number.isFinite(date.getTime())) return "TBD";
  return format(date, "MMM d, yyyy, h:mm a");
}

function SimulationCard({ sim, userId }: { sim: Simulation; userId?: string }) {
  const router = useRouter();

  const today = isToday(sim.simTime);
  const past = isPast(sim.simTime);
  const terminal = resolveAssignmentStatus(sim.groups.map((g) => g.sessionStatus));

  return (
    <div
      data-testid="simulation-card"
      data-assignment-id={sim.id}
      className="border rounded-md p-3 bg-white shadow-sm flex items-center justify-between"
    >
      <div>
        <div className="font-semibold text-sm">{sim.caseName}</div>
        <div className="text-xs text-muted-foreground mt-0.5">
          {today ? "Today · " + formatSimTime(sim.simTime) : formatSimTime(sim.simTime)}
        </div>
        <div className="text-xs text-muted-foreground">
          {sim.groups.length} group{sim.groups.length !== 1 ? "s" : ""} ·{" "}
          {sim.groups.reduce((acc, g) => acc + g.members.length, 0)} students
        </div>
      </div>

      <div className="ml-4 shrink-0">
        {terminal === "archived" ? (
          <span className="px-3 py-1.5 text-xs bg-slate-100 text-slate-500 rounded-md">Archived</span>
        ) : terminal === "completed" ? (
          <span className="px-3 py-1.5 text-xs bg-slate-100 text-slate-500 rounded-md">Completed</span>
        ) : today ? (
          <button
            disabled={!userId}
            onClick={() => userId && router.push(`/faculty/${userId}/${sim.id}`)}
            className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 font-medium disabled:opacity-50"
          >
            Enter Simulation
          </button>
        ) : past ? (
          <span className="px-3 py-1.5 text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded-md">Past due</span>
        ) : (
          <span className="px-3 py-1.5 text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded-md">Upcoming</span>
        )}
      </div>
    </div>
  );
}

function CourseItem({ course, userId }: { course: Course; userId?: string }) {
  return (
    <li className="py-2 px-3 rounded border border-transparent hover:border-slate-200">
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
              section.simulations.map((sim) => (
                <SimulationCard key={sim.id} sim={sim} userId={userId} />
              ))
            )}
          </div>
        </details>
      ))}
    </li>
  );
}

export default function FacultyCoursesView({ courses }: { courses: Course[] }) {
  const { user } = useUser();
  const activeCourses = courses.filter((c) => c.active);
  const inactiveCourses = courses.filter((c) => !c.active);

  return (
    <section className="space-y-4">
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-3">Active Courses</h3>
        {activeCourses.length === 0 ? (
          <div className="text-sm text-muted-foreground">No active courses.</div>
        ) : (
          <ul className="space-y-4">
            {activeCourses.map((course) => (
              <CourseItem key={course.id} course={course} userId={user?.id} />
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-3">Inactive Courses</h3>
        {inactiveCourses.length === 0 ? (
          <div className="text-sm text-muted-foreground">No inactive courses.</div>
        ) : (
          <ul className="space-y-4">
            {inactiveCourses.map((course) => (
              <CourseItem key={course.id} course={course} userId={user?.id} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
