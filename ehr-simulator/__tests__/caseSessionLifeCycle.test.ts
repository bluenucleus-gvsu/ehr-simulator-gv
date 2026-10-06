import { describe, expect, it } from "vitest";
import {
  ARCHIVE_WINDOW_HOURS,
  getCaseSessionAvailability,
  isPastArchiveWindow,
} from "@/utils/assignedSimulationLifecycle";
import {
  SESSION_STATUS,
  normalizeSessionStatus,
  isTerminalSessionStatus,
  resolveAssignmentStatus,
} from "@/utils/sessionStatus";

const NOW = new Date("2026-10-03T12:00:00.000Z");
const hoursAgo = (h: number) => new Date(NOW.getTime() - h * 60 * 60 * 1000).toISOString();
const hoursFromNow = (h: number) => new Date(NOW.getTime() + h * 60 * 60 * 1000).toISOString();

describe("getCaseSessionAvailability", () => {
  it("terminal statuses win outright regardless of schedule", () => {
    // Even a far-future sim time must stay terminal once staff closed it.
    expect(getCaseSessionAvailability(hoursFromNow(48), hoursFromNow(72), "completed", NOW)).toBe("completed");
    expect(getCaseSessionAvailability(hoursFromNow(48), hoursFromNow(72), "archived", NOW)).toBe("archived");
  });

  it("in progress is active regardless of sim time", () => {
    expect(getCaseSessionAvailability(hoursFromNow(1), hoursFromNow(2), "in progress", NOW)).toBe("active");
    expect(getCaseSessionAvailability(hoursAgo(30 * 24), hoursAgo(30 * 24 + 1), "in progress", NOW)).toBe("active");
  });

  it("assigned with sim time reached is active (no entry cutoff)", () => {
    expect(getCaseSessionAvailability(hoursAgo(1), hoursAgo(25), "assigned", NOW)).toBe("active");
  });

  it("assigned with pre-sim window open but sim not reached is presim", () => {
    expect(getCaseSessionAvailability(hoursFromNow(1), hoursAgo(1), "assigned", NOW)).toBe("presim");
  });

  it("assigned with pre-sim window not open is upcoming", () => {
    expect(getCaseSessionAvailability(hoursFromNow(2), hoursFromNow(1), "assigned", NOW)).toBe("upcoming");
  });

  it("handles null/invalid schedule values defensively", () => {
    expect(getCaseSessionAvailability(null, null, "assigned", NOW)).toBe("upcoming");
    expect(getCaseSessionAvailability(null, null, null, NOW)).toBe("upcoming");
    expect(getCaseSessionAvailability("not-a-date", "also-bad", "assigned", NOW)).toBe("upcoming");
    // Invalid sim time must not shortcut into active when presim is open.
    expect(getCaseSessionAvailability("not-a-date", hoursAgo(1), "assigned", NOW)).toBe("presim");
  });

  it("normalizes status casing and whitespace", () => {
    expect(getCaseSessionAvailability(hoursAgo(1), hoursAgo(25), "In Progress", NOW)).toBe("active");
    expect(getCaseSessionAvailability(hoursFromNow(48), hoursFromNow(72), "COMPLETED", NOW)).toBe("completed");
  });
});

describe("isPastArchiveWindow", () => {
  it("is false before sim_time + ARCHIVE_WINDOW_HOURS", () => {
    const simTime = hoursAgo(ARCHIVE_WINDOW_HOURS - 1);
    expect(isPastArchiveWindow(simTime, NOW)).toBe(false);
  });

  it("is true after sim_time + ARCHIVE_WINDOW_HOURS", () => {
    const simTime = hoursAgo(ARCHIVE_WINDOW_HOURS + 1);
    expect(isPastArchiveWindow(simTime, NOW)).toBe(true);
  });

  it("uses ARCHIVE_WINDOW_HOURS = 24", () => {
    expect(ARCHIVE_WINDOW_HOURS).toBe(24);
  });

  it("is false for null or invalid sim_time", () => {
    expect(isPastArchiveWindow(null, NOW)).toBe(false);
    expect(isPastArchiveWindow(undefined, NOW)).toBe(false);
    expect(isPastArchiveWindow("not-a-date", NOW)).toBe(false);
  });
});


describe("sessionStatus helpers", () => {
  it("normalizeSessionStatus accepts the four lifecycle values and rejects the rest", () => {
    for (const value of Object.values(SESSION_STATUS)) {
      expect(normalizeSessionStatus(value)).toBe(value);
    }
    expect(normalizeSessionStatus("  ASSIGNED  ")).toBe("assigned");
    expect(normalizeSessionStatus("unassigned")).toBeNull();
    expect(normalizeSessionStatus("garbage")).toBeNull();
    expect(normalizeSessionStatus(null)).toBeNull();
    expect(normalizeSessionStatus(undefined)).toBeNull();
  });

  it("isTerminalSessionStatus marks only completed and archived", () => {
    expect(isTerminalSessionStatus("completed")).toBe(true);
    expect(isTerminalSessionStatus("archived")).toBe(true);
    expect(isTerminalSessionStatus("assigned")).toBe(false);
    expect(isTerminalSessionStatus("in progress")).toBe(false);
    expect(isTerminalSessionStatus(null)).toBe(false);
  });

  it("resolveAssignmentStatus: archived wins over completed", () => {
    expect(resolveAssignmentStatus(["completed", "archived", "completed"])).toBe("archived");
  });

  it("resolveAssignmentStatus: uniformly completed is completed", () => {
    expect(resolveAssignmentStatus(["completed", "completed"])).toBe("completed");
  });

  it("resolveAssignmentStatus: any non-terminal status means no assignment-level terminal state", () => {
    expect(resolveAssignmentStatus(["completed", "assigned"])).toBeNull();
    expect(resolveAssignmentStatus(["in progress"])).toBeNull();
  });

  it("resolveAssignmentStatus: empty input is null", () => {
    expect(resolveAssignmentStatus([])).toBeNull();
    expect(resolveAssignmentStatus([null, undefined])).toBeNull();
  });
});
