import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { createClient } from "@supabase/supabase-js";

import { saveCaseData } from "../src/actions/case_builder/caseBuilder";
import { CaseSection } from "../src/lib/saveCase";
import {
  type DemographicFormData,
  type HistoryFormData,
  type IntakeOutputFormData,
} from "../src/utils/form";
import { labTemplate, type ImagingData, type LabTableData, type MicrobiologyReportData } from "../src/app/simulation/[caseId]/[sessionId]/chart/labs/components/labsData";
import { flexSheetTemplate, type FlexSheetData } from "../src/app/simulation/[caseId]/[sessionId]/chart/charting/components/flexSheetData";
import type { ClinicalNote } from "../src/app/simulation/[caseId]/[sessionId]/chart/notes/components/notesData";
import type { MedAdministrationInstance, MedicationOrder } from "../src/app/simulation/[caseId]/[sessionId]/chart/mar/components/marData";
import { defaultOrders } from "../src/utils/form";

/** Minute offsets used for labs + documentation (earlier → more recent). */
const CHART_TIME_POINTS = [480, 240, 0] as const;

function loadEnvLocal() {
  const envPath = join(process.cwd(), ".env.local");
  const raw = readFileSync(envPath, "utf8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx <= 0) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

const LAB_VALUES: Record<string, string> = {
  Sodium: "126",
  Potassium: "3.5",
  Chloride: "93",
  BUN: "33",
  Creatinine: "1.4",
  Glucose: "168",
  CO2: "20",
  Calcium: "8.7",
  Lactate: "2.8",
  HbA1c: "7.4",
  RBC: "4.32",
  Hemoglobin: "13.2",
  Hematocrit: "39.4",
  MCV: "91.2",
  MCH: "30.6",
  MCHC: "33.5",
  WBC: "18.4",
  Neutrophils: "85",
  Lymphocytes: "9",
  Monocytes: "5",
  Eosinophils: "0.5",
  Basophils: "0.5",
  Platelets: "231",
  Troponin: "0.02",
  CKMB: "1.4",
  Myoglobin: "61",
  BNP: "148",
  "D-Dimer": "420",
  Procalcitonin: "1.12",
  AST: "34",
  ALT: "29",
  ALP: "102",
  "Total Bilirubin": "0.8",
  Albumin: "3.2",
  Ammonia: "28",
  pH: "7.33",
  "O2 Sat.": "91",
  pCO2: "48",
  pO2: "34",
  HCO3: "23",
  "Specific Gravity": "1.028",
  "Urine pH": "5.5",
  Protein: "Trace",
  "Urine Glucose": "Negative",
  Ketones: "Negative",
  "Leukocyte Esterase": "Negative",
  Nitrites: "Negative",
  Blood: "Negative",
  PT: "12.8",
  PTT: "31",
  INR: "1.0",
  CRP: "88",
  ESR: "48",
  TSH: "1.2",
  "Free T3": "2.8",
  "Free T4": "1.1",
  "Total Cholesterol": "162",
  "HDL Cholesterol": "42",
  "LDL Cholesterol": "94",
  Triglycerides: "131",
  Magnesium: "1.7",
  Phosphate: "3.1",
  Amylase: "58",
  Lipase: "36",
};

const DOC_VALUES: Record<string, string> = {
  HR: "112",
  "HR Source": "Monitor",
  BP: "108/68",
  "BP Source": "Right upper arm",
  RR: "28",
  Temp: "38.7",
  "Temp Source": "Oral",
  SpO2: "89",
  "SpO2 Source": "Nasal Cannula",
  "Weight (kg)": "84",
  Oral: "120",
  Intravenous: "350",
  "Enteral Nutrition": "0",
  "Parenteral Nutrition": "0",
  "Urine (mL)": "180",
  Emesis: "0",
  Stool: "0",
  "Wound Drainage": "0",
  "Enteral Output": "0",
  "Numeric Rating": "6",
  Location: "Right lower chest",
  Characteristics: "Sharp pleuritic discomfort",
  "Alleviating Factors": "Rest, splinting with pillow",
  "Aggravating Factors": "Coughing, deep inspiration",
  Interventions: "Repositioning, coaching, PRN medication",
  Appearance: "Fatigued, mildly diaphoretic, ill-appearing but cooperative",
  "Safety Check": "Bed low/locked, call light in reach, side rails up x2",
  "Mood & Affect": "Anxious about breathing, appropriate interaction",
  "Head & Scalp": "Normocephalic, atraumatic",
  Eyes: "PERRLA, no icterus",
  Ears: "No drainage, hearing grossly intact",
  Nose: "Nasal cannula in place, nares patent",
  "Mouth & Throat": "Mucous membranes dry, no lesions",
  Orientation: "Alert and oriented x4",
  Speech: "Clear and coherent",
  "Motor Function": "Generalized weakness, moves all extremities",
  Skin: "Warm, flushed, intact",
  "Hair & Nails": "Cap refill < 2 sec, nails intact",
  Turgor: "Mildly decreased",
  Wound: "No open wounds",
  "Heart Sounds": "Regular rhythm, tachycardic, no murmur",
  Extremities: "No edema, pulses 2+ bilaterally",
  "Jugular Distention": "No JVD",
  "Chest Appearance": "Tachypneic with mild accessory muscle use",
  "Lung Sounds": "Crackles right base, diminished RLL",
  Abdomen: "Soft, non-tender, non-distended",
  "Bowel Sounds": "Active x4",
  Nausea: "Denies nausea/vomiting",
  "Extremity ROM": "Full ROM but activity limited by dyspnea",
  Gait: "Unsteady when fatigued, assist x1",
  Voiding: "Amber urine, output mildly reduced",
  "IV Site": "Clean, dry, intact",
  "IV Type": "20g peripheral IV",
  "IV Location": "Left forearm",
  "Nursing Care Provided": "Oxygen titration, pulmonary hygiene, fever management, safety monitoring",
  "Nausea & Vomiting": "1",
  Tremor: "0",
  "Paroxysmal Sweats": "1",
  Anxiety: "2",
  Agitation: "1",
  "Tactile Disturbances": "0",
  "Visual Disturbances": "0",
  Headache: "1",
  "History of Falling": "25",
  "Secondary Diagnosis": "15",
  "Ambulatory Aid": "15",
  "IV Therapy/Heparin Lock": "20",
  "Gait Score": "10",
  "Mental Status": "0",
  "Sensory Perception": "3",
  Moisture: "3",
  Activity: "3",
  Mobility: "3",
  Nutrition: "2",
  "Friction and Shear": "2",
  Breathing: "1",
  "Negative Vocalization": "0",
  "Facial Expression": "1",
  "Body Language": "1",
  Consolability: "0",
};

function labValueForField(field: string, timeIndex: number): string {
  const base = LAB_VALUES[field] ?? "1";
  const num = parseFloat(base);
  if (!Number.isNaN(num) && Number.isFinite(num)) {
    const factor = 1 - timeIndex * 0.025;
    return (num * factor).toFixed(2);
  }
  return base;
}

function docValueForField(field: string, raw: string, timeIndex: number): string {
  if (field === "HR" && /^\d+$/.test(raw)) {
    return String(Math.max(55, parseInt(raw, 10) - timeIndex * 4));
  }
  if (field === "RR" && /^\d+$/.test(raw)) {
    return String(Math.max(12, parseInt(raw, 10) - timeIndex * 2));
  }
  if (field === "SpO2" && /^\d+$/.test(raw)) {
    return String(Math.min(100, parseInt(raw, 10) + timeIndex * 2));
  }
  if (field === "Numeric Rating" && /^\d+$/.test(raw)) {
    return String(Math.max(0, parseInt(raw, 10) - timeIndex));
  }
  return raw;
}

function buildLabs(timePoints: number[]) {
  const data = labTemplate.map((row) => {
    const next: LabTableData = { ...row };
    for (let i = 0; i < timePoints.length; i++) {
      const tp = timePoints[i];
      if (row.rowType === "results") {
        next[tp] = labValueForField(row.field, i);
      }
      if (row.rowType === "imaging") {
        next[tp] = {
          displayName: row.field,
          technique: "Standard imaging protocol performed without complication",
          findings: [
            {
              region: "Primary region",
              description: `Findings for ${row.field} (time offset ${tp} min): abnormality described for simulation testing.`,
            },
          ],
          impressions: [`Impression for ${row.field} — offset ${tp} min`],
          isCritical: false,
        } satisfies ImagingData;
      }
      if (row.rowType === "microbiology") {
        next[tp] = {
          sampleType: row.field.includes("Blood") ? "Blood" : "Specimen",
          appearance: "Cloudy",
          microscopy: "Moderate WBCs noted",
          location: row.field,
          cultureResults: "Growth of Streptococcus pneumoniae",
          sensitivity: "Sensitive to ceftriaxone and levofloxacin",
          comments: `Mock microbiology report for ${row.field} (${tp} min)`,
          reporter: "Lab Tech A. Nguyen",
          isCritical: false,
        } satisfies MicrobiologyReportData;
      }
    }
    return next;
  });

  const visibleItems = data.filter((x) => x.hideable).map((x) => x.field);
  return { data, visibleItems };
}

function buildDocumentation(timePoints: number[]) {
  return flexSheetTemplate.map((row) => {
    const next: FlexSheetData = { ...row };
    if (row.componentType === "input" || row.componentType === "assessmentselect") {
      for (let i = 0; i < timePoints.length; i++) {
        const tp = timePoints[i];
        const key = String(tp);
        const mapped = DOC_VALUES[row.field];
        if (mapped != null) {
          next[key] = docValueForField(row.field, mapped, i);
        } else if (row.componentType === "assessmentselect" && row.chartingOptions?.[0]) {
          next[key] = row.chartingOptions[0].subsetId;
        } else if (row.componentType === "input") {
          next[key] = "WDL";
        }
      }
    }
    return next;
  });
}

function buildIntakeOutput(): IntakeOutputFormData[] {
  return [
    { blockId: 1, intake: 420, output: 380 },
    { blockId: 2, intake: 510, output: 440 },
    { blockId: 3, intake: 475, output: 395 },
    { blockId: 4, intake: 360, output: 290 },
  ];
}

function buildMedicationOrdersAndAdmins(): {
  orders: MedicationOrder[];
  administrations: MedAdministrationInstance[];
} {
  const orderNs = randomUUID();
  const orderApap = randomUUID();
  const orderPip = randomUUID();
  const orderIns = randomUUID();

  const orders: MedicationOrder[] = [
    {
      id: orderNs,
      medicationId: "medNormalSaline09Iv",
      frequency: "CONTINUOUS",
      priority: "Routine",
      instructions: "75 mL/hr after initial bolus",
      indication: "IV fluid maintenance and resuscitation",
      orderingProvider: "Dr. Maya Reynolds, MD",
      infusionRate: 75,
      dose: 1000,
      visibleInPresim: true,
    },
    {
      id: orderApap,
      medicationId: "medAcetaminophenOral650",
      frequency: "Q6H",
      priority: "PRN",
      indication: "Fever and mild pain",
      orderingProvider: "Dr. Maya Reynolds, MD",
      dose: 650,
      visibleInPresim: true,
    },
    {
      id: orderPip,
      medicationId: "medPiperacillinTazobactamIV",
      frequency: "Q6H",
      priority: "Routine",
      instructions: "Infuse over 30 minutes",
      indication: "Empiric antibiotic therapy",
      orderingProvider: "Dr. Maya Reynolds, MD",
      dose: 3.375,
      visibleInPresim: true,
    },
    {
      id: orderIns,
      medicationId: "medInsulinGlargineSc",
      frequency: "QD",
      priority: "Routine",
      indication: "Basal glycemic management",
      orderingProvider: "Dr. Maya Reynolds, MD",
      dose: 24,
      visibleInPresim: true,
    },
  ];

  const administrations: MedAdministrationInstance[] = [
    {
      medicationOrderId: orderNs,
      administratorId: "S. Patel, RN",
      adminTimeMinuteOffset: -240,
      status: "Given",
      notes: "1L fluid bolus completed",
      administeredDose: 1000,
      visibleInPresim: true,
    },
    {
      medicationOrderId: orderApap,
      administratorId: "S. Patel, RN",
      adminTimeMinuteOffset: -60,
      status: "Given",
      notes: "Given for fever and discomfort",
      administeredDose: 650,
      visibleInPresim: true,
    },
    {
      medicationOrderId: orderPip,
      administratorId: "S. Patel, RN",
      adminTimeMinuteOffset: 0,
      status: "Due",
      notes: "Next antibiotic dose due now",
      administeredDose: 3.375,
      visibleInPresim: true,
    },
    {
      medicationOrderId: orderIns,
      administratorId: "S. Patel, RN",
      adminTimeMinuteOffset: -30,
      status: "Given",
      notes: "Basal insulin per home regimen",
      administeredDose: 24,
      visibleInPresim: true,
    },
  ];

  return { orders, administrations };
}

async function seedChartSections(caseId: string) {
  const timePoints = [...CHART_TIME_POINTS];
  const labs = buildLabs(timePoints);
  const documentation = buildDocumentation(timePoints);
  const intakeOutput = buildIntakeOutput();
  const meds = buildMedicationOrdersAndAdmins();

  await saveCaseData({
    payload: {
      data: labs.data,
      timePoints,
      timePointsInPreSim: timePoints,
      visibleItems: labs.visibleItems,
    },
    section: CaseSection.LABS,
    caseId,
  });
  await saveCaseData({
    payload: {
      data: documentation,
      timePoints,
      timePointsInPreSim: timePoints,
    },
    section: CaseSection.DOCUMENTATION,
    caseId,
  });
  await saveCaseData({
    payload: intakeOutput,
    section: CaseSection.INTAKE_OUTPUT,
    caseId,
  });
  await saveCaseData({
    payload: { orders: meds.orders, administrations: meds.administrations },
    section: CaseSection.MEDICATION_ORDERS,
    caseId,
  });
}

async function runCreateFullMockCase() {
  loadEnvLocal();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");

  const demographics: DemographicFormData = {
    DOBDay: "03",
    DOBMonth: "February",
    admissionDateOffest: "3",
    admissionTime: "07:15",
    admittingDiagnosis: "Severe community-acquired pneumonia with acute hypoxemic respiratory failure",
    age: "72",
    attendingProviderName: "Maya Reynolds",
    attendingProviderTitle: "MD",
    codeStatus: "Full",
    dosingWeight: "79",
    employment: "Retired bus driver",
    firstName: "Eleanor",
    heightFeet: "5",
    heightInches: "6",
    insurance: "Medicare",
    language: "English",
    needsInterpreter: false,
    lastName: `Hart-${stamp.slice(-4)}`,
    precautions: "Droplet",
    relationshipStatus: "Widowed",
    religion: "Methodist",
    summary:
      "72-year-old female admitted with fever, productive cough, pleuritic chest pain, worsening dyspnea, and hypoxemia. Clinical course concerning for severe CAP with early sepsis physiology.",
    contact: "Daniel Hart",
    contactRelationship: "Son",
  };

  const created = await saveCaseData({
    payload: demographics,
    section: CaseSection.DEMOGRAPHICS,
    caseId: undefined,
  });

  const caseId = created?.id as string;
  if (!caseId) throw new Error("Failed to create new mock case");

  const history: HistoryFormData & { socialHabits: string[] } = {
    medicalHistory: [
      "COPD",
      "Hypertension",
      "Type 2 diabetes mellitus",
      "Hyperlipidemia",
      "Chronic kidney disease stage 3",
      "GERD",
    ],
    surgicalHistory: [
      "Cholecystectomy (2012)",
      "Left total knee arthroplasty (2018)",
      "Cataract extraction (2020)",
    ],
    familyHistory: [
      { relation: "Mother", condition: "Heart failure" },
      { relation: "Father", condition: "Coronary artery disease" },
      { relation: "Sister", condition: "Type 2 diabetes mellitus" },
    ],
    socialHistory: [
      "Former smoker (35 pack-years, quit 8 years ago)",
      "Lives alone with close family support",
      "Occasional wine use",
    ],
    socialHabits: [
      "Former smoker (35 pack-years, quit 8 years ago)",
      "Occasional wine use",
    ],
    livingSituation: [
      "Lives alone in single-story home",
      "Uses cane for long distances",
      "Independent with most ADLs",
    ],
    allergies: [
      "Penicillin (rash)",
      "Codeine (nausea)",
      "Sulfa drugs (hives)",
    ],
    alerts: [
      "High Risk for Falls - Morse score > 45",
      "Aspiration Risk",
      "Bleeding Precautions",
      "Advanced Directive on File",
    ],
  };

  const notes: ClinicalNote[] = [
    {
      title: "Admission Note",
      category: "Admission",
      author: "Dr. Maya Reynolds",
      specialty: "Internal Medicine",
      timeOffset: 360,
      content: "<p>Admitted with progressive dyspnea, fever, productive cough, and hypoxemia. Chest imaging concerning for multifocal pneumonia. Started on oxygen, IV fluids, and empiric antibiotics.</p>",
      excludedFromPresim: false,
    },
    {
      title: "History & Physical Note",
      category: "History & Physical",
      author: "Dr. Maya Reynolds",
      specialty: "Internal Medicine",
      timeOffset: 300,
      content: "<p>Ill-appearing female with tachypnea, crackles over right lower lung field, dry mucous membranes, and pleuritic chest discomfort. Plan for pulmonary hygiene, monitoring, and serial labs.</p>",
      excludedFromPresim: false,
    },
    {
      title: "Consult Note",
      category: "Consult",
      author: "Dr. Henry Cole",
      specialty: "Pulmonology",
      timeOffset: 180,
      content: "<p>Pulmonary consulted for worsening oxygen requirement. Recommend escalation of respiratory support if saturation remains below goal, repeat imaging, and aggressive secretion clearance.</p>",
      excludedFromPresim: false,
    },
    {
      title: "Progress Note",
      category: "Progress",
      author: "Dr. Maya Reynolds",
      specialty: "Internal Medicine",
      timeOffset: 90,
      content: "<p>Persistent tachycardia and rising inflammatory markers. Patient remains alert but fatigued. Continue current antibiotic coverage and trend lactate.</p>",
      excludedFromPresim: false,
    },
    {
      title: "Nursing Note",
      category: "Nursing",
      author: "S. Patel, RN",
      specialty: "Nursing",
      timeOffset: 30,
      content: "<p>Patient instructed on incentive spirometry and energy conservation. Oxygen maintained via nasal cannula. Reports pain with cough but resting comfortably after interventions.</p>",
      excludedFromPresim: false,
    },
  ];

  const orders = [
    ...defaultOrders,
    {
      category: "Laboratory",
      title: "Blood Cultures x2",
      status: "Active",
      details: "Draw from two sites before next antibiotic dose if possible.",
      orderingProvider: "Dr. Maya Reynolds, MD",
      important: true,
      visibleInPresim: true,
    },
    {
      category: "Respiratory",
      title: "ABG now",
      status: "Active",
      details: "Obtain ABG now for worsening oxygenation.",
      orderingProvider: "Dr. Maya Reynolds, MD",
      important: true,
      visibleInPresim: true,
    },
    {
      category: "Medication",
      title: "Ceftriaxone 1 g IV q24h",
      status: "Active",
      details: "Empiric CAP coverage.",
      orderingProvider: "Dr. Maya Reynolds, MD",
      important: true,
      visibleInPresim: true,
    },
    {
      category: "Medication",
      title: "Azithromycin 500 mg IV daily",
      status: "Active",
      details: "Atypical CAP coverage.",
      orderingProvider: "Dr. Maya Reynolds, MD",
      important: true,
      visibleInPresim: true,
    },
  ];

  await saveCaseData({ payload: history, section: CaseSection.HISTORY, caseId });
  await saveCaseData({ payload: notes, section: CaseSection.CLINICAL_DOCUMENTS, caseId });
  await saveCaseData({ payload: orders, section: CaseSection.ORDERS, caseId });
  await seedChartSections(caseId);

  const counts = await fetchCaseSectionCounts(supabase, caseId);

  console.log(JSON.stringify({
    success: true,
    caseId,
    caseName: created.name,
    counts,
  }, null, 2));
}

async function fetchCaseSectionCounts(supabase: ReturnType<typeof createClient>, caseId: string) {
  const [
    notes,
    ordersCount,
    lab_results,
    imaging_reports,
    microbiology_reports,
    documentation_results,
    medication_orders,
    medication_administrations,
  ] = await Promise.all([
    supabase.from("clinical_documents").select("*", { count: "exact", head: true }).eq("case_id", caseId),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("case_id", caseId),
    supabase.from("lab_results").select("*", { count: "exact", head: true }).eq("case_id", caseId),
    supabase.from("imaging_reports").select("*", { count: "exact", head: true }).eq("case_id", caseId),
    supabase.from("microbiology_reports").select("*", { count: "exact", head: true }).eq("case_id", caseId),
    supabase.from("documentation_results").select("*", { count: "exact", head: true }).eq("case_id", caseId),
    supabase.from("medication_orders").select("*", { count: "exact", head: true }).eq("case_id", caseId),
    supabase.from("medication_administrations").select("*", { count: "exact", head: true }).eq("case_id", caseId),
  ]);

  return {
    notes: notes.count,
    orders: ordersCount.count,
    lab_results: lab_results.count,
    imaging_reports: imaging_reports.count,
    microbiology_reports: microbiology_reports.count,
    documentation_results: documentation_results.count,
    medication_orders: medication_orders.count,
    medication_administrations: medication_administrations.count,
  };
}

async function enrichExistingCase(caseId: string) {
  loadEnvLocal();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  await seedChartSections(caseId);
  const counts = await fetchCaseSectionCounts(supabase, caseId);
  console.log(JSON.stringify({ success: true, caseId, mode: "enrich", counts }, null, 2));
}

async function main() {
  const enrichArg = process.argv[2] === "--enrich" ? process.argv[3] : null;
  if (enrichArg) {
    await enrichExistingCase(enrichArg);
    return;
  }

  await runCreateFullMockCase();
}

main().catch((error) => {
  console.error("Failed to create full mock case:", error);
  process.exit(1);
});
