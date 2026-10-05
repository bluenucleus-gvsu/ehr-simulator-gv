import { SESSION_STATUS, normalizeSessionStatus } from "@/utils/sessionStatus";

export type CaseSessionAvailability =
  | "upcoming"   // assigned, pre-sim window not open yet
  | "presim"     // assigned, pre-sim window open (view-only chart)
  | "active"     // in progress, or assigned with sim time reached (active sim is enterable)
  | "completed"  // terminal
  | "archived";  // terminal

export const ARCHIVE_WINDOW_HOURS = 24;
const ARCHIVE_WINDOW_MS = ARCHIVE_WINDOW_HOURS * 60 * 60 * 1000;

export function isPastArchiveWindow(simTime: string | null | undefined, now?: Date): boolean {
  if (!simTime) return false;
  const simMs = new Date(simTime).getTime();
  if (!Number.isFinite(simMs)) return false;
  return (now ?? new Date()).getTime() > simMs + ARCHIVE_WINDOW_MS;
}

export function getCaseSessionAvailability(
  simTime: string | null | undefined,
  presimTime: string | null | undefined,
  status: string | null | undefined,
  now?: Date
): CaseSessionAvailability {
  const nowMs = (now ?? new Date()).getTime();
  const simMs = simTime ? new Date(simTime).getTime() : null;
  const presimMs = presimTime ? new Date(presimTime).getTime() : null;
  const sessionStatus = normalizeSessionStatus(status);

  // Completed: staff has explicity marked as completed.
  if (sessionStatus === SESSION_STATUS.Completed) {
    return "completed";
  }
  // Archived: admin have explicitly marked case_session as archived or > ARCHIVE_WINDOW_HOURS have past since sim_time.
  if (sessionStatus === SESSION_STATUS.Archived) {
    return "archived";
  }

  // Active: in progress, or an assigned session whose sim time has arrived.
  if (sessionStatus === SESSION_STATUS.InProgress || (simMs != null && simMs <= nowMs)) {
    return "active";
  }

  // Pre-sim: an assigned session whose view-only window has opened.
  if (presimMs != null && presimMs <= nowMs) {
    return "presim";
  }

  // Upcoming: assigned, pre-sim window not open yet.
  return "upcoming";
}
