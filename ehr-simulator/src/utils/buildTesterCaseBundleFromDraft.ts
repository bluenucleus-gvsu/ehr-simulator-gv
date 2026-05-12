import type { CaseBundle } from "@/actions/case_builder/getCase";
import type {
  ImagingData,
  LabTableData,
  MicrobiologyReportData,
} from "@/app/simulation/[caseId]/[sessionId]/chart/labs/components/labsData";
import type { ClinicalNote } from "@/app/simulation/[caseId]/[sessionId]/chart/notes/components/notesData";
import type { OrderType } from "@/app/simulation/[caseId]/[sessionId]/chart/orders/components/orderData";
import type { MedAdministrationInstance } from "@/app/simulation/[caseId]/[sessionId]/chart/mar/components/marData";
import type { FlexSheetData } from "@/app/simulation/[caseId]/[sessionId]/chart/charting/components/flexSheetData";
import { transformLabTableToSchema } from "@/lib/labTypes";
import { resolveDocumentationDbColumn } from "@/app/simulation/[caseId]/[sessionId]/chart/charting/components/chartingFromBundle";
import type {
  DemographicFormData,
  HistoryFormData,
  IntakeOutputFormData,
  MedOrderFormData,
} from "@/utils/form";
import { months } from "@/utils/form";
import { getTesterCaseDraft } from "@/utils/testerLocalStore";
import { timeColumnCell } from "@/utils/timeColumnCell";
import { allMedications } from "@/app/simulation/[caseId]/[sessionId]/chart/mar/components/marData";

type TesterCaseDraftBlob = {
  demographics?: DemographicFormData;
  history?: HistoryFormData;
  notes?: ClinicalNote[];
  orders?: OrderType[];
  labs?: {
    data?: LabTableData[];
    timePoints?: number[];
    timePointsInPreSim?: unknown;
    visibleItems?: unknown;
  };
  charting?: {
    data?: FlexSheetData[];
    timePoints?: number[];
    timePointsInPreSim?: unknown;
    visibleItems?: unknown;
  };
  intakeOutput?: IntakeOutputFormData[];
  medOrders?: MedOrderFormData;
  medAdministrationInstances?: MedAdministrationInstance[];
};

function ensureNumberSet(raw: unknown): Set<number> {
  if (raw instanceof Set) return raw as Set<number>;
  if (!Array.isArray(raw)) return new Set();
  const out = new Set<number>();
  for (const v of raw) {
    const n = Number(v);
    if (Number.isFinite(n)) out.add(n);
  }
  return out;
}

function ensureStringSet(raw: unknown): Set<string> {
  if (raw instanceof Set) return raw as Set<string>;
  if (!Array.isArray(raw)) return new Set();
  const out = new Set<string>();
  for (const v of raw) {
    if (typeof v === "string" && v) out.add(v);
  }
  return out;
}

function estimatedIsoDobFromDemographics(d?: DemographicFormData): string {
  if (!d) return "";
  const monthIdx = months.indexOf(d.DOBMonth);
  const day = Number(d.DOBDay);
  const age = Number.parseInt(String(d.age), 10);
  const refYear = new Date().getFullYear();
  const inferredYear =
    Number.isFinite(age) && age > 0 && age < 120 ? refYear - age : refYear - 35;
  if (monthIdx < 0 || !Number.isFinite(day) || day < 1 || day > 31) {
    return Number.isFinite(age) && age > 0 && age < 120
      ? `${inferredYear}-06-15`
      : "";
  }
  const month = monthIdx + 1;
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${inferredYear}-${mm}-${dd}`;
}

function caseRowFromTesterDraft(caseId: string, draft?: TesterCaseDraftBlob | null) {
  const d = draft?.demographics;
  const h = draft?.history;

  const attending = [d?.attendingProviderTitle, d?.attendingProviderName].filter(Boolean).join(" ");

  const row: Record<string, unknown> = {
    id: caseId,
    first_name: d?.firstName ?? "",
    last_name: d?.lastName ?? "",
    date_of_birth: estimatedIsoDobFromDemographics(d),
    description: d?.summary ?? "",
    admitting_diagnosis: d?.admittingDiagnosis ?? "",
    inpatient_duration_days: Number(d?.admissionDateOffest ?? 0) || 0,
    time_of_admission: d?.admissionTime ?? "",
    attending_provider: attending,
    code_status: d?.codeStatus ?? "",
    weight_kg: d?.dosingWeight ? Number(d.dosingWeight) : null,
    height_ft: d?.heightFeet ? Number(d.heightFeet) : null,
    height_in: d?.heightInches ? Number(d.heightInches) : null,
    insurance: d?.insurance ?? "",
    language: d?.language ?? "",
    requires_interpreter: Boolean(d?.needsInterpreter),
    religion: d?.religion ?? "",
    employment: d?.employment ?? "",
    emergency_contact_name: d?.contact ?? "",
    emergency_contact_relationship: d?.contactRelationship ?? "",
    emergency_contact_phone: d?.contactPhone ?? "",
    medical_history: h?.medicalHistory ?? [],
    surgical_history: h?.surgicalHistory ?? [],
    allergies: h?.allergies ?? [],
    social_habits: h?.socialHistory ?? [],
    living_situation: h?.livingSituation ?? [],
    intake_output_blocks: draft?.intakeOutput ?? [],
  };

  if (d?.precautions) {
    row.isolation_precautions = { id: "", name: d.precautions };
  }
  if (d?.relationshipStatus) {
    row.relationship_status = { id: "", name: d.relationshipStatus };
  }

  return row;
}

function catalogMedication(catalogId: string) {
  return allMedications.find((m) => m.id === catalogId);
}

function embeddedDbMedShape(catalog: (typeof allMedications)[number] | undefined) {
  if (!catalog) return null;
  return {
    generic_name: catalog.genericName,
    route: catalog.route,
    strength: catalog.strength,
  };
}

function buildDocumentationResultsFromDraft(
  charting?: TesterCaseDraftBlob["charting"],
): Record<string, unknown>[] {
  if (!charting?.data || !Array.isArray(charting.data)) return [];
  const timePoints =
    Array.isArray(charting.timePoints) && charting.timePoints.length > 0
      ? charting.timePoints
      : [0];
  const preSim = ensureNumberSet(charting.timePointsInPreSim);

  return timePoints.map((offset) => {
    const row: Record<string, unknown> = {
      time_offset: offset,
      is_in_presim: preSim.has(offset),
    };
    for (const item of charting.data ?? []) {
      const key = resolveDocumentationDbColumn(item.id);
      const value = timeColumnCell(item as Record<string | number | symbol, unknown>, offset);
      if (value !== undefined && value !== null && value !== "") {
        row[key] = value;
      }
    }
    return row;
  });
}

/**
 * Hydrates a CaseBundle for simulations opened from tester-local cases when no DB rows exist.
 * Safe to call only from the browser (reads localStorage).
 */
export function buildTesterCaseBundleFromDraft(caseId: string): CaseBundle {
  const draft = getTesterCaseDraft<TesterCaseDraftBlob>(caseId);

  const caseRow = caseRowFromTesterDraft(caseId, draft);

  const labsPayload = draft?.labs;
  let labResults: Record<string, unknown>[] = [];
  let imagingReports: Record<string, unknown>[] = [];
  let microbiologyReports: Record<string, unknown>[] = [];

  if (
    labsPayload &&
    typeof labsPayload === "object" &&
    Array.isArray(labsPayload.data)
  ) {
    const normalized = transformLabTableToSchema(caseId, {
      data: labsPayload.data,
      timePoints:
        Array.isArray(labsPayload.timePoints) && labsPayload.timePoints.length
          ? labsPayload.timePoints
          : [0],
      timePointsInPreSim: ensureNumberSet(labsPayload.timePointsInPreSim),
      visibleItems: ensureStringSet(labsPayload.visibleItems),
    });

    labResults = normalized.labResults.map((lr, i) => {
      const syntheticId = `tester-lab-${caseId}-${lr.time_offset}-${i}`;
      return { ...lr, id: syntheticId };
    });

    const labIdByOffset = new Map<number, string>();
    for (const lr of labResults) {
      const off = lr.time_offset as number;
      const id = String(lr.id ?? "");
      if (typeof off === "number" && id) labIdByOffset.set(off, id);
    }

    imagingReports = normalized.imagingReports.map((rep) => {
      const imaging = rep.raw as ImagingData;
      return {
        lab_id: labIdByOffset.get(rep.time_offset) ?? null,
        name: rep.name,
        technique: imaging?.technique ?? "N/A",
        findings:
          Array.isArray(imaging?.findings) && imaging.findings.length > 0
            ? imaging.findings.reduce(
                (acc, f) => ({ ...acc, [f.region]: f.description }),
                {} as Record<string, string>,
              )
            : null,
        impressions: imaging?.impressions ?? [],
        is_critical: Boolean(
          imaging?.isCritical === true ||
            (typeof imaging?.isCritical === "string" &&
              imaging.isCritical.toLowerCase().includes("critical")),
        ),
      };
    });

    microbiologyReports = normalized.microbiologyReports.map((rep) => {
      const mb = rep.raw as MicrobiologyReportData;
      return {
        lab_id: labIdByOffset.get(rep.time_offset) ?? null,
        name: rep.name,
        sample_type: mb?.sampleType ?? rep.name ?? "N/A",
        appearance: mb?.appearance ?? "N/A",
        microscopy: mb?.microscopy ?? "N/A",
        location: mb?.location ?? null,
        culture_results: mb?.cultureResults ?? "N/A",
        sensitivity: mb?.sensitivity ?? "N/A",
        comments: mb?.comments ?? "N/A",
        reporter: mb?.reporter ?? "N/A",
        is_critical:
          mb?.isCritical === true ||
          (typeof mb?.isCritical === "string" && mb.isCritical.toLowerCase().includes("critical"))
            ? "true"
            : "false",
      };
    });
  }

  const safetyAlerts =
    draft?.history?.alerts?.map((name) => ({
      safety_alert: { id: "", name },
    })) ?? [];

  const familyHistory =
    draft?.history?.familyHistory?.map((row) => ({
      condition: row.condition,
      relationship: row.relation ? { id: "", name: row.relation } : null,
    })) ?? [];

  const clinicalDocuments =
    draft?.notes?.map((note) => ({
      id: crypto.randomUUID(),
      case_id: caseId,
      case_session_id: null,
      is_in_presim: !note.excludedFromPresim,
      category: note.title || "Admission",
      specialty: note.specialty,
      author: note.author,
      time_offset: note.timeOffset,
      doc_text: note.content,
      source_type: "case_document",
    })) ?? [];

  const medicationOrders =
    draft?.medOrders?.createdOrders?.map((o) => {
      const cat = catalogMedication(o.medicationId);
      return {
        id: o.id,
        medication_id: o.medicationId,
        frequency: o.frequency,
        priority: o.priority || "Routine",
        instructions: o.instructions ?? null,
        indication: o.indication,
        ordering_provider: o.orderingProvider,
        infusion_rate: o.infusionRate != null ? String(o.infusionRate) : null,
        dose: o.dose,
        is_in_presim: o.visibleInPresim,
        medications: embeddedDbMedShape(cat),
      };
    }) ?? [];

  const medicationAdministrations =
    draft?.medAdministrationInstances?.map((a) => ({
      medication_order_id: a.medicationOrderId,
      medication_id: "",
      administrator: "",
      time_offset: a.adminTimeMinuteOffset,
      status: a.status,
      notes: a.notes ?? null,
      administered_dose: a.administeredDose,
      is_in_presim: a.visibleInPresim,
    })) ?? [];

  const documentationResults = buildDocumentationResultsFromDraft(draft?.charting);

  return {
    caseRow,
    safetyAlerts,
    familyHistory,
    clinicalDocuments,
    orders: draft?.orders ?? [],
    labResults: labResults as CaseBundle["labResults"],
    imagingReports,
    microbiologyReports,
    documentationResults,
    medicationAdministrations,
    medicationOrders,
  };
}

function overlayCaseRow(serverRow: unknown, draftRow: unknown): CaseBundle["caseRow"] {
  const base =
    serverRow && typeof serverRow === "object" ? { ...(serverRow as Record<string, unknown>) } : {};
  const overlay = draftRow && typeof draftRow === "object" ? (draftRow as Record<string, unknown>) : {};
  for (const [key, value] of Object.entries(overlay)) {
    if (value === undefined || value === null) continue;
    if (typeof value === "string" && value.trim() === "") continue;
    if (Array.isArray(value) && value.length === 0) continue;
    base[key] = value;
  }
  return base as CaseBundle["caseRow"];
}

function documentationRowsHaveClinicalValues(rows: unknown[]): boolean {
  for (const raw of rows) {
    if (!raw || typeof raw !== "object") continue;
    const doc = raw as Record<string, unknown>;
    for (const [key, val] of Object.entries(doc)) {
      if (key === "time_offset" || key === "is_in_presim" || key === "case_id" || key === "id") {
        continue;
      }
      if (val !== undefined && val !== null && val !== "") return true;
    }
  }
  return false;
}

/**
 * Tester case builder data lives in localStorage; the same case id may still exist in Supabase
 * with sparse children rows. Prefer non-empty draft slices over the server bundle.
 */
export function mergeTesterCaseBundlePreferDraft(
  draftBundle: CaseBundle,
  server: CaseBundle | null,
): CaseBundle {
  if (!server) return draftBundle;

  const documentationResults = documentationRowsHaveClinicalValues(draftBundle.documentationResults)
    ? draftBundle.documentationResults
    : server.documentationResults;

  return {
    caseRow: overlayCaseRow(server.caseRow, draftBundle.caseRow),
    safetyAlerts:
      draftBundle.safetyAlerts.length > 0 ? draftBundle.safetyAlerts : server.safetyAlerts,
    familyHistory:
      draftBundle.familyHistory.length > 0 ? draftBundle.familyHistory : server.familyHistory,
    clinicalDocuments: [...(server.clinicalDocuments ?? []), ...(draftBundle.clinicalDocuments ?? [])],
    orders:
      Array.isArray(draftBundle.orders) && draftBundle.orders.length > 0
        ? draftBundle.orders
        : server.orders,
    labResults:
      Array.isArray(draftBundle.labResults) && draftBundle.labResults.length > 0
        ? draftBundle.labResults
        : server.labResults,
    imagingReports:
      Array.isArray(draftBundle.imagingReports) && draftBundle.imagingReports.length > 0
        ? draftBundle.imagingReports
        : server.imagingReports,
    microbiologyReports:
      Array.isArray(draftBundle.microbiologyReports) && draftBundle.microbiologyReports.length > 0
        ? draftBundle.microbiologyReports
        : server.microbiologyReports,
    documentationResults,
    medicationAdministrations:
      Array.isArray(draftBundle.medicationAdministrations) &&
      draftBundle.medicationAdministrations.length > 0
        ? draftBundle.medicationAdministrations
        : server.medicationAdministrations,
    medicationOrders:
      Array.isArray(draftBundle.medicationOrders) && draftBundle.medicationOrders.length > 0
        ? draftBundle.medicationOrders
        : server.medicationOrders,
  };
}
