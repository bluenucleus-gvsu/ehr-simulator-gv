import { TESTER_MODE_TTL_MS } from "@/utils/testerMode";

type TesterStorePayload = {
  notes: Record<string, unknown[]>;
  medAdministrations: Record<string, unknown[]>;
  documentationRows: Record<string, unknown[]>;
  sessionStatus: Record<string, string>;
  courses: Record<string, unknown>;
  cases: Record<string, unknown>;
  sectionAssignments: Record<string, Record<string, unknown>>;
  caseDrafts: Record<string, unknown>;
  courseDrafts: Record<string, unknown>;
};

type TesterStoreEnvelope = {
  createdAt: number;
  lastTouchedAt: number;
  expiresAt: number;
  payload: TesterStorePayload;
};

const TESTER_LOCAL_STORE_KEY = "ehr_tester_local_store_v1";

const emptyPayload = (): TesterStorePayload => ({
  notes: {},
  medAdministrations: {},
  documentationRows: {},
  sessionStatus: {},
  courses: {},
  cases: {},
  sectionAssignments: {},
  caseDrafts: {},
  courseDrafts: {},
});

function now() {
  return Date.now();
}

function readEnvelope(): TesterStoreEnvelope | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(TESTER_LOCAL_STORE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as TesterStoreEnvelope;
    if (!parsed?.expiresAt || parsed.expiresAt < now()) {
      window.localStorage.removeItem(TESTER_LOCAL_STORE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeEnvelope(payload: TesterStorePayload) {
  if (typeof window === "undefined") return;
  const timestamp = now();
  const envelope: TesterStoreEnvelope = {
    createdAt: readEnvelope()?.createdAt ?? timestamp,
    lastTouchedAt: timestamp,
    expiresAt: timestamp + TESTER_MODE_TTL_MS,
    payload,
  };
  window.localStorage.setItem(TESTER_LOCAL_STORE_KEY, JSON.stringify(envelope));
}

function appendRecord<T>(bucket: keyof TesterStorePayload, key: string, value: T) {
  const envelope = readEnvelope();
  const payload = envelope?.payload ?? emptyPayload();
  const existing = (payload[bucket] as Record<string, T[]>)[key] ?? [];
  (payload[bucket] as Record<string, T[]>)[key] = [...existing, value];
  writeEnvelope(payload);
}

export function clearTesterLocalStore() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TESTER_LOCAL_STORE_KEY);
}

export function appendTesterNote(sessionKey: string, note: unknown) {
  appendRecord("notes", sessionKey, note);
}

export function appendTesterMedicationAdministrations(sessionKey: string, administrations: unknown[]) {
  const envelope = readEnvelope();
  const payload = envelope?.payload ?? emptyPayload();
  payload.medAdministrations[sessionKey] = administrations;
  writeEnvelope(payload);
}

export function appendTesterDocumentationRows(sessionKey: string, rows: unknown[]) {
  const envelope = readEnvelope();
  const payload = envelope?.payload ?? emptyPayload();
  payload.documentationRows[sessionKey] = rows;
  writeEnvelope(payload);
}

export function setTesterSessionStatus(sessionId: string, status: string) {
  const envelope = readEnvelope();
  const payload = envelope?.payload ?? emptyPayload();
  payload.sessionStatus[sessionId] = status;
  writeEnvelope(payload);
}

export function getTesterNotes(sessionKey: string): unknown[] {
  return readEnvelope()?.payload.notes?.[sessionKey] ?? [];
}

export function getTesterMedicationAdministrations(sessionKey: string): unknown[] {
  return readEnvelope()?.payload.medAdministrations?.[sessionKey] ?? [];
}

export function getTesterDocumentationRows(sessionKey: string): unknown[] {
  return readEnvelope()?.payload.documentationRows?.[sessionKey] ?? [];
}

export function getTesterSessionStatus(sessionId: string): string | null {
  return readEnvelope()?.payload.sessionStatus?.[sessionId] ?? null;
}

export function upsertTesterCourse(course: { id: string } & Record<string, unknown>) {
  const envelope = readEnvelope();
  const payload = envelope?.payload ?? emptyPayload();
  payload.courses[course.id] = course;
  writeEnvelope(payload);
}

export function getTesterCourses<T = Record<string, unknown>>(): T[] {
  return Object.values(readEnvelope()?.payload.courses ?? {}) as T[];
}

export function upsertTesterCase(simCase: { id: string } & Record<string, unknown>) {
  const envelope = readEnvelope();
  const payload = envelope?.payload ?? emptyPayload();
  payload.cases[simCase.id] = simCase;
  writeEnvelope(payload);
}

export function getTesterCases<T = Record<string, unknown>>(): T[] {
  return Object.values(readEnvelope()?.payload.cases ?? {}) as T[];
}

export function upsertTesterSectionAssignment(
  courseId: string,
  assignment: { id: string } & Record<string, unknown>,
) {
  const envelope = readEnvelope();
  const payload = envelope?.payload ?? emptyPayload();
  const byCourse = payload.sectionAssignments[courseId] ?? {};
  byCourse[assignment.id] = assignment;
  payload.sectionAssignments[courseId] = byCourse;
  writeEnvelope(payload);
}

export function removeTesterSectionAssignment(courseId: string, assignmentId: string) {
  const envelope = readEnvelope();
  const payload = envelope?.payload ?? emptyPayload();
  const byCourse = { ...(payload.sectionAssignments[courseId] ?? {}) };
  delete byCourse[assignmentId];
  payload.sectionAssignments[courseId] = byCourse;
  writeEnvelope(payload);
}

export function getTesterSectionAssignments<T = Record<string, unknown>>(courseId: string): T[] {
  return Object.values(readEnvelope()?.payload.sectionAssignments?.[courseId] ?? {}) as T[];
}

export function getAllTesterSectionAssignments<T = Record<string, unknown>>(): T[] {
  const byCourse = readEnvelope()?.payload.sectionAssignments ?? {};
  return Object.values(byCourse).flatMap((courseAssignments) =>
    Object.values(courseAssignments),
  ) as T[];
}

export function setTesterCaseDraft(caseId: string, draft: Record<string, unknown>) {
  const envelope = readEnvelope();
  const payload = envelope?.payload ?? emptyPayload();
  payload.caseDrafts[caseId] = draft;
  writeEnvelope(payload);
}

export function getTesterCaseDraft<T = Record<string, unknown>>(caseId: string): T | null {
  return (readEnvelope()?.payload.caseDrafts?.[caseId] as T) ?? null;
}

export function setTesterCourseDraft(courseId: string, draft: Record<string, unknown>) {
  const envelope = readEnvelope();
  const payload = envelope?.payload ?? emptyPayload();
  payload.courseDrafts[courseId] = draft;
  writeEnvelope(payload);
}

export function getTesterCourseDraft<T = Record<string, unknown>>(courseId: string): T | null {
  return (readEnvelope()?.payload.courseDrafts?.[courseId] as T) ?? null;
}
