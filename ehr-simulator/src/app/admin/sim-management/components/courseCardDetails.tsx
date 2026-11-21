import { useRouter } from "next/navigation";
import { Simulation } from "@/lib/sim-management";
import { useUser } from "@/context/UserContext";
import { routes } from "@/lib/routes";

interface CourseCardDetailsProps {
  simSession: Simulation
}

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

const CourseCardDetails = ({ simSession }: CourseCardDetailsProps) => {
  const router = useRouter();
  const { user } = useUser();

  const today = isToday(simSession.simTime);
  const past = isPast(simSession.simTime);

  return (
    <div
      key={simSession.id}
      className="border rounded-md p-3 bg-white shadow-sm flex items-center justify-between"
    >
      <div>
        <div className="font-semibold text-sm">{simSession.caseName}</div>
        <div className="text-xs text-muted-foreground mt-0.5">
          {today
            ? "Today · " + formatSimTime(simSession.simTime)
            : formatSimTime(simSession.simTime)}
        </div>
        <div className="text-xs text-muted-foreground">
          {simSession.groups.length} group{simSession.groups.length !== 1 ? "s" : ""} ·{" "}
          {simSession.groups.reduce((acc, g) => acc + g.members.length, 0)} students
        </div>
      </div>

      <div className="ml-4 shrink-0">
        {today ? (
          <button
            onClick={() => user && router.push(routes.admin["sim-management"].section.getHref(simSession.id))}
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

export default CourseCardDetails;