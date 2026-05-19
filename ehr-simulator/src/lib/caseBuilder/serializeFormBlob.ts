import type { FormBlob } from "@/utils/form";

/** Server actions cannot receive `Set`; normalize after context/overlay merge. */
export function toNumberSet(value: unknown): Set<number> {
  if (value instanceof Set) return value;
  if (Array.isArray(value)) {
    return new Set(value.map((v) => Number(v)).filter((n) => Number.isFinite(n)));
  }
  return new Set<number>();
}

export function toStringSet(value: unknown): Set<string> {
  if (value instanceof Set) return value;
  if (Array.isArray(value)) {
    return new Set(value.filter((v): v is string => typeof v === "string"));
  }
  return new Set<string>();
}

export function labsPersistPayload(labs: FormBlob["labs"]) {
  const timePoints = labs.timePoints?.length ? labs.timePoints : [0];
  return {
    data: labs.data,
    timePoints,
    timePointsInPreSim: Array.from(toNumberSet(labs.timePointsInPreSim)),
    visibleItems: Array.from(toStringSet(labs.visibleItems)),
  };
}

export function documentationPersistPayload(charting: FormBlob["charting"]) {
  const timePoints = charting.timePoints?.length ? charting.timePoints : [0];
  return {
    data: charting.data,
    timePoints,
    timePointsInPreSim: Array.from(toNumberSet(charting.timePointsInPreSim)),
  };
}

/** Same shape as Review → Submit Case JSON archive. */
export function fullCasePayloadForBlob(data: FormBlob) {
  return {
    demographics: data.demographics,
    history: data.history,
    notes: data.notes,
    orders: data.orders,
    labs: {
      data: data.labs.data,
      timePoints: data.labs.timePoints?.length ? data.labs.timePoints : [0],
      timePointsInPreSim: Array.from(toNumberSet(data.labs.timePointsInPreSim)),
      visibleItems: Array.from(toStringSet(data.labs.visibleItems)),
    },
    charting: {
      data: data.charting.data,
      timePoints: data.charting.timePoints?.length ? data.charting.timePoints : [0],
      timePointsInPreSim: Array.from(toNumberSet(data.charting.timePointsInPreSim)),
      visibleItems: data.charting.visibleItems
        ? Array.from(toStringSet(data.charting.visibleItems))
        : undefined,
    },
    inputOutput: data.intakeOutput,
    medicationOrders: data.medOrders,
    medicationAdministrations: data.medAdministrationInstances,
  };
}

export function extractErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === "object" && "message" in err) {
    const msg = (err as { message?: unknown }).message;
    if (typeof msg === "string" && msg.trim()) return msg;
  }
  return "Save failed.";
}
