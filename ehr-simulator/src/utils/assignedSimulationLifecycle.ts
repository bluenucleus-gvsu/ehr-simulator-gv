export type SimulationAvailability = "not_available" | "presim" | "active" | "completed";

export interface AssignedSimulationLifecycleInput {
  simTime?: string | null;
  presimTime?: string | null;
  /** `case_sessions.status` from the database (e.g. assigned, in progress). */
  sessionStatus?: string | null;
  now?: Date;
}

export interface AssignedSimulationLifecycle {
  availability: SimulationAvailability;
  simDate: Date | null;
  presimDate: Date | null;
  isPastScheduled: boolean;
}

/** After scheduled sim start, students may still join as "active" for this long. */
const POST_SIM_JOIN_WINDOW_MS = 48 * 60 * 60 * 1000; // 2 days

export function getAssignedSimulationLifecycle(input: AssignedSimulationLifecycleInput): AssignedSimulationLifecycle {
  const now = input.now ?? new Date();
  const simDate = input.simTime ? new Date(input.simTime) : null;
  const presimDate = input.presimTime ? new Date(input.presimTime) : null;
  const sessionStatus = input.sessionStatus?.trim().toLowerCase() ?? null;

  const simMs = simDate && Number.isFinite(simDate.getTime()) ? simDate.getTime() : null;
  const profileWindowEndMs = simMs != null ? simMs + POST_SIM_JOIN_WINDOW_MS : null;
  const isPastJoinWindow = profileWindowEndMs != null && now.getTime() > profileWindowEndMs;

  if (sessionStatus === "completed" || sessionStatus === "archived") {
    return {
      availability: "completed",
      simDate,
      presimDate,
      isPastScheduled: Boolean(simDate && simDate < now),
    };
  }

  if (isPastJoinWindow) {
    if (sessionStatus === "in progress") {
      return {
        availability: "completed",
        simDate,
        presimDate,
        isPastScheduled: true,
      };
    }
    return {
      availability: "not_available",
      simDate,
      presimDate,
      isPastScheduled: true,
    };
  }

  if (sessionStatus === "in progress") {
    return {
      availability: "active",
      simDate,
      presimDate,
      isPastScheduled: Boolean(simDate && simDate < now),
    };
  }

  if (simDate && simDate <= now) {
    return {
      availability: "active",
      simDate,
      presimDate,
      isPastScheduled: true,
    };
  }

  if (presimDate && presimDate <= now) {
    return {
      availability: "presim",
      simDate,
      presimDate,
      isPastScheduled: false,
    };
  }

  return {
    availability: "not_available",
    simDate,
    presimDate,
    isPastScheduled: Boolean(simDate && simDate < now),
  };
}
