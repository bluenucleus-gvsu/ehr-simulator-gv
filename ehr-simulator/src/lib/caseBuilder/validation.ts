import { FlexSheetSection } from "../flexSheet/flexSheetSections";
import { CaseSection, type CaseSection as CaseSectionValue } from "@/lib/caseSections";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function fail(message: string): never {
  throw new Error(`Invalid case-builder data: ${message}`);
}

function record(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail(`${label} must be an object.`);
  return value as Record<string, unknown>;
}

function array(value: unknown, label: string): unknown[] {
  if (!Array.isArray(value)) fail(`${label} must be an array.`);
  return value;
}

function requiredString(value: unknown, label: string): string {
  if (typeof value !== "string" || !value.trim()) fail(`${label} is required.`);
  return value.trim();
}

function finiteNumber(value: unknown, label: string): number {
  const parsed = typeof value === "string" && value.trim() === "" ? NaN : Number(value);
  if (!Number.isFinite(parsed)) fail(`${label} must be a number.`);
  return parsed;
}

export function assertUuid(value: unknown, label = "ID"): asserts value is string {
  if (typeof value !== "string" || !UUID_PATTERN.test(value)) fail(`${label} must be a UUID.`);
}

function assertPhase(value: unknown, label: string, phaseCount = 10): number {
  const phase = finiteNumber(value ?? 1, label);
  if (!Number.isInteger(phase) || phase < 1 || phase > phaseCount) {
    fail(`${label} must be a whole number from 1 to ${phaseCount}.`);
  }
  return phase;
}

function assertValidValue(value: unknown[], label: string, mapping: Record<string, string>) {
  const validValues = new Set(Object.values(mapping));

  value.forEach((value, index) => {
    if (typeof value !== "string" || !validValues.has(value)) {
      fail(`${label}[${index}] is an invalid value`)
    }
  })

}

function validateTablePayload(value: unknown, label: string): void {
  const payload = record(value, label);
  array(payload.data, `${label}.data`);
  const timePoints = array(payload.timePoints, `${label}.timePoints`);
  const offsets = timePoints.map((offset, index) => finiteNumber(offset, `${label}.timePoints[${index}]`));
  if (new Set(offsets).size !== offsets.length) fail(`${label} contains duplicate time offsets.`);
  if (payload.timePointsInPreSim !== undefined) {
    array(payload.timePointsInPreSim, `${label}.timePointsInPreSim`)
      .forEach((offset, index) => finiteNumber(offset, `${label}.timePointsInPreSim[${index}]`));
  }
}

function validateLabPayload(value: unknown, label: string): void {
  const payload = record(value, label);
  array(payload.data, `${label}.data`);
  const columns = array(payload.columns, `${label}.columns`);
  const fixedOffsets = new Set<number>();
  columns.forEach((columnValue, index) => {
    const column = record(columnValue, `${label}.columns[${index}]`);
    requiredString(column.id, `${label}.columns[${index}].id`);
    const columnLabel = `${label}.columns[${index}]`;
    const phase = assertPhase(column.phase, `${columnLabel}.phase`);
    if (column.is_in_presim === true && phase > 1) {
      fail(`${columnLabel} cannot be in pre-sim when marked as faculty-release.`);
    }
    if (column.time_offset === null || column.time_offset === undefined) {
      if (phase === 1) {
        fail(`${columnLabel} has no time offset; Phase 1 items must have a time offset.`);
      }
      return;
    }
    if (phase > 1) {
      fail(`${columnLabel} is faculty-released (phase > 1) and cannot have a time offset.`);
    }
    const offset = finiteNumber(column.time_offset, `${columnLabel}.time_offset`);
    if (fixedOffsets.has(offset)) fail(`${label} contains duplicate time offsets.`);
    fixedOffsets.add(offset);
  });
}

export function assertValidSaveRequest(
  section: CaseSectionValue,
  payloadValue: unknown,
  caseId?: string | null,
): void {
  if (section !== CaseSection.DEMOGRAPHICS) assertUuid(caseId, "Case ID");

  switch (section) {
    case CaseSection.DEMOGRAPHICS: {
      if (caseId) assertUuid(caseId, "Case ID");
      const payload = record(payloadValue, "demographics");
      requiredString(payload.firstName, "First name");
      requiredString(payload.lastName, "Last name");
      requiredString(payload.summary, "Case summary");
      const codeStatus = requiredString(payload.codeStatus, "Code status");
      if (!["Full", "DNR", "Partial"].includes(codeStatus)) fail("Code status is not recognized.");
      const age = finiteNumber(payload.age, "Age");
      if (!Number.isInteger(age) || age < 0 || age > 120) fail("Age must be from 0 to 120.");
      assertPhase(payload.phaseCount ?? 1, "Phase count");
      return;
    }
    case CaseSection.HISTORY: {
      const payload = record(payloadValue, "history");
      ["medicalHistory", "surgicalHistory", "allergies", "socialHistory", "livingSituation", "alerts", "familyHistory"]
        .forEach((key) => array(payload[key], `history.${key}`));
      return;
    }
    case CaseSection.CLINICAL_DOCUMENTS:
      array(payloadValue, "notes").forEach((noteValue, index) => {
        const note = record(noteValue, `notes[${index}]`);
        requiredString(note.author, `notes[${index}].author`);
        requiredString(note.content, `notes[${index}].content`);
        const phase = assertPhase(note.phase, `notes[${index}].phase`);
        if (note.timeOffset === null || note.timeOffset === undefined) {
          if (phase === 1) {
            fail(`notes[${index}] has no time offset; Phase 1 notes must have a time offset.`);
          }
        } else {
          if (phase > 1) {
            fail(`notes[${index}] is staged (phase > 1) and cannot carry a time offset.`);
          }
          finiteNumber(note.timeOffset, `notes[${index}].timeOffset`);
        }
      });
      return;
    case CaseSection.ORDERS:
      array(payloadValue, "orders").forEach((orderValue, index) => {
        const order = record(orderValue, `orders[${index}]`);
        requiredString(order.title, `orders[${index}].title`);
        requiredString(order.category, `orders[${index}].category`);
        const phase = assertPhase(order.phase, `orders[${index}].phase`);
        if (phase > 1 && order.visibleInPresim === true) {
          fail(`orders[${index}] cannot be in pre-sim when marked as faculty-release.`);
        }
      });
      return;
    case CaseSection.TABLE_TEMPLATE:
      assertValidValue(array(payloadValue, "tableTemplate"), 'tableTemplate', FlexSheetSection)
      return
    case CaseSection.LABS:
      validateLabPayload(payloadValue, "labs");
      return;
    case CaseSection.DOCUMENTATION:
      validateTablePayload(payloadValue, "charting");
      return;
    case CaseSection.INTAKE_OUTPUT:
      array(payloadValue, "intake/output").forEach((blockValue, index) => {
        const block = record(blockValue, `intake/output[${index}]`);
        finiteNumber(block.blockId, `intake/output[${index}].blockId`);
        finiteNumber(block.intake, `intake/output[${index}].intake`);
        finiteNumber(block.output, `intake/output[${index}].output`);
      });
      return;
    case CaseSection.MEDICATION_ORDERS: {
      const payload = record(payloadValue, "medications");
      const orders = array(payload.orders, "medications.orders");
      const orderIds = new Set<string>();
      orders.forEach((orderValue, index) => {
        const order = record(orderValue, `medications.orders[${index}]`);
        assertUuid(order.id, `medications.orders[${index}].id`);
        assertUuid(order.medicationId, `medications.orders[${index}].medicationId`);
        requiredString(order.frequency, `medications.orders[${index}].frequency`);
        requiredString(order.priority, `medications.orders[${index}].priority`);
        const phase = assertPhase(order.phase, `medications.orders[${index}].phase`);
        if (phase > 1 && order.is_in_presim === true) {
          fail(`medications.orders[${index}] cannot be in pre-sim when set for faculty-release.`);
        }
        orderIds.add(order.id);
      });
      array(payload.administrations, "medications.administrations").forEach((adminValue, index) => {
        const admin = record(adminValue, `medications.administrations[${index}]`);
        assertUuid(admin.medicationOrderId, `medications.administrations[${index}].medicationOrderId`);
        if (!orderIds.has(admin.medicationOrderId)) {
          fail(`medications.administrations[${index}] references an order that is not being saved.`);
        }
        finiteNumber(admin.adminTimeMinuteOffset, `medications.administrations[${index}].adminTimeMinuteOffset`);
        finiteNumber(admin.administeredDose, `medications.administrations[${index}].administeredDose`);
        assertPhase(admin.phase, `medications.administrations[${index}].phase`);
      });
      return;
    }
    case CaseSection.MEDIA:
      array(Array.isArray(payloadValue) ? payloadValue : [payloadValue], "media").forEach((item, index) => {
        if (typeof item === "string") {
          requiredString(item, `media[${index}]`);
          return;
        }
        const image = record(item, `media[${index}]`);
        if (!image.previewUrl && !image.file && !image.storagePath) {
          fail(`media[${index}] must contain a URL, file, or storage path.`);
        }
      });
      return;
    default:
      fail(`Unknown section: ${String(section)}`);
  }
}
