import { FlexSheetData } from "@/app/simulation/[caseId]/[sessionId]/chart/charting/components/flexSheetData";
import { LabTableData } from "@/app/simulation/[caseId]/[sessionId]/chart/labs/components/labsData";
import { AllMedicationTypes, MedAdministrationInstance, MedicationOrder } from "@/app/simulation/[caseId]/[sessionId]/chart/mar/components/marData";
import { ClinicalNote } from "@/app/simulation/[caseId]/[sessionId]/chart/notes/components/notesData";
import { OrderType } from "@/app/simulation/[caseId]/[sessionId]/chart/orders/components/orderData";

export interface DemographicFormData {
  DOBDay: string;
  DOBMonth: string;
  admissionDateOffest: string;
  admissionTime: string;
  admittingDiagnosis: string;
  age: string;
  attendingProviderName: string;
  attendingProviderTitle: string;
  codeStatus: string;
  dosingWeight: string;
  employment: string;
  firstName: string;
  heightFeet: string;
  heightInches: string;
  insurance: string;
  language: string;
  needsInterpreter: boolean;
  lastName: string;
  precautions: string;
  relationshipStatus: string;
  religion: string;
  summary: string;
  contact: string;
  contactRelationship: string;
  contactPhone: string;
  case_photo_url: string | null;
}

export interface HistoryFormData {
  medicalHistory: string[]
  surgicalHistory: string[]
  allergies: string[]
  socialHistory: string[]
  livingSituation: string[]
  alerts: string[]
  familyHistory: { relation: string, condition: string }[]
}

export interface TableFormData<T> {
  data: T[];
  timePoints: number[];
  timePointsInPreSim: Set<number>;
  visibleItems?: Set<string>;
}

export interface ChartingFormData {
  data: FlexSheetData[];
  timePoints: number[];
  timePointsInPresim: Set<number>
}

export interface IntakeOutputFormData {
  blockId: number,
  intake: number,
  output: number
}

export interface MedOrderFormData {
  createdOrders: MedicationOrder[];
  selectedMeds: AllMedicationTypes[];
}

export interface MediaImageData {
  id: string;
  previewUrl: string;
  file?: File;
  storagePath?: string;
}

export interface FormBlob {
  demographics: DemographicFormData;
  history: HistoryFormData;
  notes: ClinicalNote[];
  orders: OrderType[];
  labs: TableFormData<LabTableData>;
  charting: TableFormData<FlexSheetData>;
  intakeOutput: IntakeOutputFormData[];
  medOrders: MedOrderFormData;
  medAdministrationInstances: MedAdministrationInstance[];
  media: MediaImageData[];
}

export type CompleteFormType = DemographicFormData | HistoryFormData | ClinicalNote[] | OrderType[] | TableFormData<FlexSheetData | LabTableData> | IntakeOutputFormData[] | MedOrderFormData | MedAdministrationInstance[] | MediaImageData[]

export const formatTimeOffset = (minuteOffset: number) => {
  const minutesInDay = 1440;
  const minutesInHour = 60;

  const days = Math.ceil(minuteOffset / minutesInDay);
  const remainingMinutesAfterDays = minuteOffset % minutesInDay;
  const hours = Math.ceil(remainingMinutesAfterDays / minutesInHour);
  const minutes = remainingMinutesAfterDays % minutesInHour;

  return { days, hours, minutes };
}

export const nursingAlerts = [
  "Seizure Risk",
  "Aspiration Risk",
  "Bleeding Precautions",
  "NPO Status",
  "Suicide / Self-Harm Risk",
  "Violence / Aggression Risk",
  "Elopement Risk",
  "Restraint Order Active",
  "Continuous Observation",
  "Hearing Impaired",
  "Vision Impaired",
  "High Risk for Falls - Morse score > 45",
  "Orthostatic Hypotension Risk",
  "Confused / Impulsive Behavior",
  "Delirium / Cognitive Impairment Risk",
  "Head Injury Precautions",
  "Increased Intracranial Pressure (ICP) Precautions",
  "IV Line / Central Line / PICC in Place",
  "Tracheostomy / Airway Precautions",
  "Chest Tube Precautions",
  "Pacemaker / ICD Precautions",
  "Anticoagulant Therapy - Bleeding Precautions",
  "Pressure Injury Risk (Braden <18)",
  "Immunocompromised Precautions",
  "Chemotherapy Precautions / Cytotoxic Drugs",
  "Advanced Directive on File",
  "Court-Ordered Observation / Police Hold",
];

export const categories = [
  "Admission",
  "Consent",
  "Consult",
  "Discharge",
  "History & Physical",
  "Nursing",
  "Post-op",
  "Pre-op",
  "Progress",
  "Rapid Response",
  "Telehealth"
];

export const specialties = [
  "Cardiology",
  "Care Management",
  "Critical Care",
  "Dermatology",
  "ENT",
  "Emergency Medicine",
  "Family Medicine",
  "Gastroenterology",
  "General Surgery",
  "Geriatrics",
  "Hematology",
  "Infectious Disease",
  "Internal Medicine",
  "Neurology",
  "Nursing",
  "Obstetrics",
  "Occupational Therapy",
  "Oncology",
  "Orthopedics",
  "Pathology",
  "Pediatrics",
  "Physical Therapy",
  "Psychiatry",
  "Pulmonology",
  "Radiology",
  "Respiratory Therapy",
  "SLP",
  "Social Work",
  "Spiritual Care",
  "Urology"
];

export const relationshipStatuses = [
  "Married",
  "Single",
  "Divorced",
  "Engaged",
  "Widowed",
  "Separated",
  "Domestic Partner",
  "Unknown / Undetermined"
]

export const precautions = [
  "Contact",
  "Contact-Enteric",
  "Airbourne",
  "Droplet",
  "Neutropenic",
  "None"
]

export const codeStatuses = [
  "Full",
  "DNR",
  "Partial"
]

export const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
]

export const days = Array.from({ length: 31 }, (_, i) => i + 1);

export const insuranceOptions = [
  "Medicare",
  "Medicaid",
  "Private"
]

export const defaultIoData = [
  { blockId: 1, intake: 0, output: 0 },
  { blockId: 2, intake: 0, output: 0 },
  { blockId: 3, intake: 0, output: 0 },
  { blockId: 4, intake: 0, output: 0 }
]

/** Normalize `cases.intake_output_blocks` jsonb for the case builder / sim. */
export function intakeOutputBlocksFromCaseRow(raw: unknown): IntakeOutputFormData[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    return defaultIoData.map((b) => ({ ...b }))
  }
  const byBlock = new Map<number, { intake: number; output: number }>()
  for (const row of raw) {
    if (!row || typeof row !== "object") continue
    const o = row as Record<string, unknown>
    const blockId = Number(o.blockId)
    if (!Number.isFinite(blockId)) continue
    byBlock.set(blockId, {
      intake: Number(o.intake) || 0,
      output: Number(o.output) || 0,
    })
  }
  return [1, 2, 3, 4].map((blockId) => ({
    blockId,
    intake: byBlock.get(blockId)?.intake ?? 0,
    output: byBlock.get(blockId)?.output ?? 0,
  }))
}

export const defaultOrders: OrderType[] = [
  {
    category: 'Laboratory',
    title: "Basic Metabolic Panel (BMP)",
    status: "Active",
    details: "Collect Basic Metabolic Panel (BMP).",
    orderingProvider: "Dr. John Smith, MD",
    important: true,
    visibleInPresim: true
  },
  {
    category: 'Laboratory',
    title: "Complete Blood Count (CBC)",
    status: "Active",
    details: "Collect Complete Blood Count (CBC).",
    orderingProvider: "Dr. John Smith, MD",
    important: true,
    visibleInPresim: true
  },
  {
    important: false,
    category: 'Respiratory',
    title: "Oxygen Therapy",
    details: "Administer oxygen via nasal cannula at 2 L/min. Titrate to maintain SpO₂ ≥ 92%.",
    status: "Active",
    orderingProvider: "Dr. Azzedine Habz",
    visibleInPresim: true
  },
  {
    important: false,
    category: 'Respiratory',
    title: "Incentive Spirometry",
    details: "Instruct patient to use incentive spirometer 10 times per hour while awake. Document effort and results",
    status: "Active",
    orderingProvider: "Dr. Azzedine Habz",
    visibleInPresim: true
  },
  {
    category: 'Nursing',
    title: "Vital Signs Monitoring (q4h)",
    status: "Active",
    details: "Monitor BP, HR, RR, Temp, SpO₂ every 4 hours. Notify provider for Temp > 38.0°C (100.4°F), Systolic BP > 160 mmHg or < 100 mmHg, HR > 110 bpm or < 50 bpm.",
    orderingProvider: "Dr. John Smith, MD",
    important: true,
    visibleInPresim: true
  },
  {
    category: 'Nursing',
    title: "Insert and Maintain IV",
    status: "Active",
    details: "",
    orderingProvider: "Dr. John Smith, MD",
    important: true,
    visibleInPresim: true
  },
  {
    category: 'Nursing',
    title: "Blood Glucose Monitoring (ACHS)",
    status: "Active",
    details: "Monitor blood glucose before meals and at bedtime (ACHS). Notify provider for blood glucose < 70 mg/dL or > 300 mg/dL.",
    orderingProvider: "Dr. John Smith, MD",
    important: true,
    visibleInPresim: true
  },
  {
    category: 'Nursing',
    title: "Activity: As Tolerated",
    status: "Active",
    details: "Encourage patient activity as tolerated. Assist with ambulation as needed.",
    orderingProvider: "Dr. John Smith, MD",
    important: false,
    visibleInPresim: true

  },
  {
    important: false,
    category: 'Nursing',
    title: "Fall Risk Precautions",
    status: "Active",
    details: "Implement standard fall risk protocol. Ensure bed in low position and call light within reach.",
    orderingProvider: "Dr. John Smith, MD",
    visibleInPresim: true
  },
  {
    important: false,
    category: 'Nursing',
    title: "General Diet",
    status: "Active",
    details: "No Restrictions",
    orderingProvider: "Dr. John Smith, MD",
    visibleInPresim: true
  },
];

export const soapTemplateNote = `
  <h2><u>Subjective</u></h2>
  <p></p><h2><u>Objective</u></h2>
  <p></p><h2><u>Assessment</u></h2>
  <p></p><h2><u>Plan</u></h2>
  <p></p>
`
