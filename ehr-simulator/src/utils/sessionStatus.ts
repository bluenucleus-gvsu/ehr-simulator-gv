export const SESSION_STATUS = {
  Assigned: "assigned",
  InProgress: "in progress",
  Completed: "completed",
  Archived: "archived",
} as const;

export type SessionStatusValue = (typeof SESSION_STATUS)[keyof typeof SESSION_STATUS];

export type SessionStatus = SessionStatusValue | null;

export const TERMINAL_SESSION_STATUSES: ReadonlySet<SessionStatusValue> = new Set([
  SESSION_STATUS.Completed,
  SESSION_STATUS.Archived,
]);

export function normalizeSessionStatus(status: string | null | undefined): SessionStatusValue | null {
  const value = (status ?? "").trim().toLowerCase();
  return (Object.values(SESSION_STATUS) as readonly string[]).includes(value)
    ? (value as SessionStatusValue)
    : null;
}

export function isTerminalSessionStatus(status: string | null | undefined): boolean {
  const normalized = normalizeSessionStatus(status);
  return normalized !== null && TERMINAL_SESSION_STATUSES.has(normalized);
}

export function resolveAssignmentStatus(
  statuses: (string | null | undefined)[],
): "archived" | "completed" | null {
  const normalized = statuses
    .map(normalizeSessionStatus)
    .filter((status): status is SessionStatusValue => status !== null);

  if (normalized.length === 0) {
    return null;
  }

  if (normalized.includes(SESSION_STATUS.Archived)) {
    return SESSION_STATUS.Archived;
  }

  if (normalized.every((status) => status === SESSION_STATUS.Completed)) {
    return SESSION_STATUS.Completed;
  }

  return null;
}
