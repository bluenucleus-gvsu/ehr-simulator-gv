export type SimulationAvailability = "not_available" | "presim" | "active" | "completed";

export interface AssignedSimulationLifecycleInput {
  simTime?: string | null;
  presimTime?: string | null;
  sessionStatus?: string | null;
  hasSessionStarted?: boolean;
  now?: Date;
}

export interface AssignedSimulationLifecycle {
  availability: SimulationAvailability;
  simDate: Date | null;
  presimDate: Date | null;
  isPastScheduled: boolean;
}

const COMPLETED_STATUS = "completed";

export function getAssignedSimulationLifecycle(input: AssignedSimulationLifecycleInput): AssignedSimulationLifecycle {
  const now = input.now ?? new Date();
  const simDate = input.simTime ? new Date(input.simTime) : null;
  const presimDate = input.presimTime ? new Date(input.presimTime) : null;
  const sessionStatus = input.sessionStatus?.toLowerCase() ?? null;
  const hasSessionStarted = Boolean(input.hasSessionStarted);

  if (sessionStatus === COMPLETED_STATUS) {
    return {
      availability: "completed",
      simDate,
      presimDate,
      isPastScheduled: Boolean(simDate && simDate < now),
    };
  }

  if (hasSessionStarted) {
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
