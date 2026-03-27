import { readFileSync } from "node:fs";
import { join } from "node:path";

import { createClient } from "@supabase/supabase-js";

import { saveCaseData } from "../src/actions/case_builder/caseBuilder";
import { CaseSection } from "../src/lib/saveCase";
import { defaultOrders, type DemographicFormData, type HistoryFormData } from "../src/utils/form";
import { labTemplate, type ImagingData, type LabTableData } from "../src/app/simulation/[sessionId]/chart/labs/components/labsData";
import { flexSheetTemplate, type FlexSheetData } from "../src/app/simulation/[sessionId]/chart/charting/components/flexSheetData";
import type { ClinicalNote } from "../src/app/simulation/[sessionId]/chart/notes/components/notesData";
import type { MedAdministrationInstance } from "../src/app/simulation/[sessionId]/chart/mar/components/marData";

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

function buildRealisticLabs(): { data: LabTableData[]; visibleItems: string[] } {
  const rows = labTemplate.map((r) => ({ ...r })) as LabTableData[];

  const setLab = (field: string, t: number, value: string | number | ImagingData) => {
    const row = rows.find((r) => r.field === field);
    if (!row) return;
    row[t] = value;
  };

  // t=480 (8h before), t=240 (4h before), t=0 (now)
  setLab("Sodium", 480, "130");
  setLab("Sodium", 240, "128");
  setLab("Sodium", 0, "126");

  setLab("Potassium", 480, "4.1");
  setLab("Potassium", 240, "3.8");
  setLab("Potassium", 0, "3.5");

  setLab("Chlorine", 480, "98");
  setLab("Chlorine", 240, "95");
  setLab("Chlorine", 0, "93");

  setLab("BUN", 480, "24");
  setLab("BUN", 240, "29");
  setLab("BUN", 0, "33");

  setLab("Creatinine", 480, "1.1");
  setLab("Creatinine", 240, "1.2");
  setLab("Creatinine", 0, "1.4");

  setLab("Glucose", 480, "142");
  setLab("Glucose", 240, "156");
  setLab("Glucose", 0, "168");

  setLab("CO2", 480, "24");
  setLab("CO2", 240, "22");
  setLab("CO2", 0, "20");

  setLab("Lactate", 480, "1.6");
  setLab("Lactate", 240, "2.1");
  setLab("Lactate", 0, "2.8");

  setLab("WBC", 480, "12.8");
  setLab("WBC", 240, "15.6");
  setLab("WBC", 0, "18.4");

  setLab("Hemoglobin", 480, "13.8");
  setLab("Hemoglobin", 240, "13.5");
  setLab("Hemoglobin", 0, "13.2");

  setLab("Platelets", 480, "256");
  setLab("Platelets", 240, "242");
  setLab("Platelets", 0, "231");

  setLab("CRP", 480, "38");
  setLab("CRP", 240, "62");
  setLab("CRP", 0, "88");

  setLab("Procalcitonin", 480, "0.32");
  setLab("Procalcitonin", 240, "0.68");
  setLab("Procalcitonin", 0, "1.12");

  setLab("pH", 0, "7.33");
  setLab("pCO2", 0, "48");
  setLab("HCO3", 0, "23");
  setLab("O2 Sat.", 0, "91");

  setLab("XR Chest", 0, {
    displayName: "XR Chest Portable AP",
    technique: "Single portable AP chest radiograph",
    findings: [
      { region: "Right lower lobe", description: "Patchy airspace opacity, increased from prior exam" },
      { region: "Pleura", description: "Small right pleural effusion" },
    ],
    impressions: [
      "Right lower lobe pneumonia",
      "Small right pleural effusion",
    ],
    isCritical: false,
  } satisfies ImagingData);

  return { data: rows, visibleItems: ["XR Chest"] };
}

function buildRealisticCharting(): FlexSheetData[] {
  const rows = flexSheetTemplate.map((r) => ({ ...r })) as FlexSheetData[];

  const setById = (id: string, t: number, value: string | string[]) => {
    const row = rows.find((r) => r.id === id);
    if (!row) return;
    row[String(t)] = value;
  };

  setById("hrInput", 480, "96");
  setById("hrInput", 240, "104");
  setById("hrInput", 0, "112");
  setById("rrInput", 480, "20");
  setById("rrInput", 240, "24");
  setById("rrInput", 0, "28");
  setById("bpInput", 480, "126/78");
  setById("bpInput", 240, "118/72");
  setById("bpInput", 0, "108/68");
  setById("bpSourceSelect", 480, "Right upper arm");
  setById("bpSourceSelect", 240, "Right upper arm");
  setById("bpSourceSelect", 0, "Right upper arm");
  setById("tempInput", 480, "37.8");
  setById("tempInput", 240, "38.3");
  setById("tempInput", 0, "38.7");
  setById("tempSourceSelect", 480, "Oral");
  setById("tempSourceSelect", 240, "Oral");
  setById("tempSourceSelect", 0, "Oral");
  setById("spo2Input", 480, "94");
  setById("spo2Input", 240, "92");
  setById("spo2Input", 0, "89");
  setById("hrSourceSelect", 480, "Monitor");
  setById("hrSourceSelect", 240, "Monitor");
  setById("hrSourceSelect", 0, "Monitor");
  setById("o2SourceSelect", 480, "Nasal Cannula");
  setById("o2SourceSelect", 240, "Nasal Cannula");
  setById("o2SourceSelect", 0, "Nasal Cannula");
  setById("weightKgInput", 480, "84.5");
  setById("weightKgInput", 240, "84.2");
  setById("weightKgInput", 0, "84");

  // I/O fields
  setById("oralIntake", 480, "300");
  setById("oralIntake", 240, "220");
  setById("oralIntake", 0, "120");
  setById("ivIntakeInput", 480, "800");
  setById("ivIntakeInput", 240, "600");
  setById("ivIntakeInput", 0, "350");
  setById("urineOutputMlInput", 480, "450");
  setById("urineOutputMlInput", 240, "300");
  setById("urineOutputMlInput", 0, "180");
  setById("urineSampleDescriptionInput", 0, "Amber, concentrated");
  setById("stoolInput", 240, "1");
  setById("stoolInput", 0, "0");

  // Pain
  setById("painNumeric", 0, "6");
  setById("painNumeric", 240, "5");
  setById("painLocation", 0, "Right lower chest");
  setById("painCharacteristics", 0, "Sharp with deep inspiration");
  setById("painAlleviatingFactors", 0, "Rest, splinting chest with pillow");
  setById("painAggravatingFactors", 0, "Coughing and deep breaths");
  setById("painInterventions", 0, "Repositioning, PRN analgesic, breathing coaching");

  // General / psychosocial
  setById("appearanceInput", 0, "Appears fatigued, mildly diaphoretic");
  setById("safetyCheckInput", 0, "Bed low/locked, call light in reach, non-slip socks on");
  setById("moodAffectInput", 0, "Anxious about breathing but cooperative");

  // HEENT / neuro
  setById("headScalpInput", 0, "Normocephalic, atraumatic");
  setById("eyesInput", 0, "PERRLA, sclera anicteric");
  setById("earsInput", 0, "No drainage");
  setById("noseInput", 0, "Nasal cannula in place, nares patent");
  setById("mouthThroatInput", 0, "Mucous membranes dry");
  setById("neurologicalOrientationInput", 0, "A&O x4");
  setById("speechInput", 0, "Clear, full sentences");
  setById("motorFunctionInput", 0, "Moves all extremities, generalized weakness");

  // Integumentary / cardio / respiratory
  setById("skinInput", 0, "Warm, slightly flushed, no pressure injury");
  setById("hairNailsInput", 0, "Cap refill < 2 sec");
  setById("turgorInput", 0, "Mildly decreased");
  setById("heartSoundsInput", 0, "Regular rate/rhythm, no murmur");
  setById("extremitiesInput", 0, "No edema, peripheral pulses 2+");
  setById("jugularDistentionInput", 0, "No JVD");
  setById("chestAppearanceInput", 0, "Mild tachypnea with accessory muscle use");
  setById("lungSoundsInput", 0, "Crackles RLL, diminished breath sounds at right base");

  // GI / MSK / GU
  setById("abdomenInput", 0, "Soft, non-tender");
  setById("bowelSoundsInput", 0, "Present in all quadrants");
  setById("nauseaInput", 0, "Denies nausea/vomiting");
  setById("extremityRomInput", 0, "Mild dyspnea on exertion with ambulation");
  setById("musculoskeletalGaitInput", 0, "Unsteady when fatigued, assist x1");
  setById("voidingInput", 0, "Urine amber, output mildly reduced");

  // IV / nursing care
  setById("ivSiteInput", 0, "Clean, dry, intact");
  setById("ivTypeInput", 0, "20g peripheral IV");
  setById("ivLocationInput", 0, "Left forearm");
  setById("nursingCareProvidedInput", 0, "Oxygen titrated, incentive spirometry coaching, fever management");

  // Assessment tools
  setById("morseHistoryOfFallingSelect", 0, "25");
  setById("morseSecondaryDiagnosisSelect", 0, "15");
  setById("morseAmbulatoryAidSelect", 0, "15");
  setById("morseIvTherapySelect", 0, "20");
  setById("morseGaitSelect", 0, "10");
  setById("morseMentalStatusSelect", 0, "0");

  setById("bradenSensoryPerceptionSelect", 0, "3");
  setById("bradenMoistureSelect", 0, "3");
  setById("bradenActivitySelect", 0, "3");
  setById("bradenMobilitySelect", 0, "3");
  setById("bradenNutritionSelect", 0, "2");
  setById("bradenFrictionAndShearSelect", 0, "2");

  return rows;
}

async function resolveCaseId(client: any, maybeCaseId: string | undefined) {
  if (maybeCaseId) return maybeCaseId;
  const { data, error } = await client
    .from("cases")
    .select("id")
    .order("created_at", { ascending: false })
    .eq("name", "Case Robert Martinez")
    .limit(1)
    .single();
  if (error || !data?.id) throw new Error(`Could not resolve target case id: ${error?.message ?? "unknown"}`);
  return data.id;
}

async function main() {
  loadEnvLocal();

  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const argCaseId = process.argv[2];
  const caseId = await resolveCaseId(client, argCaseId);

  const demographics: DemographicFormData = {
    DOBDay: "14",
    DOBMonth: "October",
    admissionDateOffest: "2",
    admissionTime: "09:30",
    admittingDiagnosis: "Community-acquired pneumonia with hypoxemia and sepsis concern",
    age: "68",
    attendingProviderName: "Aisha Khan",
    attendingProviderTitle: "MD",
    codeStatus: "Full",
    dosingWeight: "84",
    employment: "Retired electrician",
    firstName: "Robert",
    heightFeet: "5",
    heightInches: "10",
    insurance: "Medicare",
    language: "English",
    needsInterpreter: false,
    lastName: "Martinez",
    precautions: "Droplet",
    relationshipStatus: "Married",
    religion: "Catholic",
    summary:
      "68-year-old male admitted with worsening dyspnea, productive cough, fever, and fatigue. Progressive hypoxemia despite low-flow oxygen with concern for severe CAP.",
    contact: "Elena Martinez",
    contactRelationship: "Spouse",
    contactPhone: "(555) 123-4567",
  };

  const history: HistoryFormData & { socialHabits: string[] } = {
    medicalHistory: ["Hypertension", "Type 2 diabetes mellitus", "COPD", "Hyperlipidemia"],
    surgicalHistory: ["Appendectomy (2008)", "Right cataract extraction (2019)"],
    familyHistory: [
      { relation: "Father", condition: "Coronary artery disease" },
      { relation: "Mother", condition: "Type 2 diabetes mellitus" },
    ],
    socialHistory: ["Former smoker (40 pack-years, quit 5 years ago)", "Occasional alcohol use"],
    socialHabits: ["Former smoker (40 pack-years, quit 5 years ago)", "Occasional alcohol use"],
    livingSituation: ["Lives with spouse in single-story home", "Independent with ADLs at baseline"],
    allergies: ["Penicillin (rash)"],
    alerts: ["High Risk for Falls - Morse score > 45", "Aspiration Risk"],
  };

  const notes: ClinicalNote[] = [
    {
      title: "Admission Note",
      author: "Dr. Aisha Khan",
      specialty: "Internal Medicine",
      timeOffset: 360,
      content:
        "<p>Admitted for worsening shortness of breath, productive cough, and fever. Initial chest imaging concerning for right lower lobe infiltrate. Started empiric antibiotics and supplemental oxygen.</p>",
      excludedFromPresim: false,
    },
    {
      title: "Progress Note",
      author: "Dr. Aisha Khan",
      specialty: "Internal Medicine",
      timeOffset: 120,
      content:
        "<p>Persistent tachypnea and rising oxygen requirement overnight. WBC and lactate trending up. Continue close respiratory monitoring, repeat labs, and maintain IV fluids.</p>",
      excludedFromPresim: false,
    },
    {
      title: "Nursing Note",
      author: "Jamie Lee, RN",
      specialty: "Nursing",
      timeOffset: 30,
      content:
        "<p>Patient alert and oriented x4, reports pleuritic right-sided chest pain 6/10 with coughing. SpO2 improved from 89% to 93% on 3L NC. Encouraged incentive spirometry use and repositioning.</p>",
      excludedFromPresim: false,
    },
  ];

  const customOrders = [
    ...defaultOrders,
    {
      category: "Respiratory",
      title: "ABG now",
      status: "Active",
      details: "Obtain arterial blood gas now and repeat in 6 hours if clinically indicated.",
      orderingProvider: "Dr. Aisha Khan, MD",
      important: true,
      visibleInPresim: true,
    },
    {
      category: "Laboratory",
      title: "Blood Cultures x2",
      status: "Active",
      details: "Draw blood cultures from two separate sites before next antibiotic dose if possible.",
      orderingProvider: "Dr. Aisha Khan, MD",
      important: true,
      visibleInPresim: true,
    },
  ];

  const timePoints = [480, 240, 0];
  const labs = buildRealisticLabs();
  const chartingData = buildRealisticCharting();

  const medAdministrations: MedAdministrationInstance[] = [
    {
      id: crypto.randomUUID(),
      medicationOrderId: "medNormalSaline09Iv",
      administratorId: "Jamie Lee RN",
      adminTimeMinuteOffset: -180,
      status: "Given",
      notes: "1L bolus completed.",
      administeredDose: 1000,
      visibleInPresim: true,
    },
    {
      id: crypto.randomUUID(),
      medicationOrderId: "medAcetaminophenOral650",
      administratorId: "Jamie Lee RN",
      adminTimeMinuteOffset: -60,
      status: "Given",
      notes: "Given for fever and discomfort.",
      administeredDose: 650,
      visibleInPresim: true,
    },
    {
      id: crypto.randomUUID(),
      medicationOrderId: "medPiperacillinTazobactamIV",
      administratorId: "Jamie Lee RN",
      adminTimeMinuteOffset: 0,
      status: "Due",
      notes: "Next scheduled antibiotic dose due.",
      administeredDose: 3.375,
      visibleInPresim: true,
    },
  ];

  await saveCaseData({ payload: demographics, section: CaseSection.DEMOGRAPHICS, caseId });
  await saveCaseData({ payload: history, section: CaseSection.HISTORY, caseId });
  await saveCaseData({ payload: notes, section: CaseSection.CLINICAL_DOCUMENTS, caseId });
  await saveCaseData({ payload: customOrders, section: CaseSection.ORDERS, caseId });
  await saveCaseData(
    {
      payload: {
        data: labs.data,
        timePoints,
        timePointsInPreSim: [480, 240, 0],
        visibleItems: labs.visibleItems,
      },
      section: CaseSection.LABS,
      caseId,
    }
  );
  await saveCaseData(
    {
      payload: {
        data: chartingData,
        timePoints,
        timePointsInPreSim: [480, 240, 0],
      },
      section: CaseSection.DOCUMENTATION,
      caseId,
    }
  );
  // updateMedications currently does not await internal DB calls; persist meds directly for deterministic test data.
  await client.from("medication_administrations").delete().eq("case_id", caseId);
  const medicationRows = medAdministrations.map((m) => ({
    case_id: caseId,
    medication_id: m.medicationOrderId,
    administrator: m.administratorId,
    time_offset: m.adminTimeMinuteOffset,
    status: m.status,
    notes: m.notes ?? "",
    administered_dose: m.administeredDose,
    is_in_presim: m.visibleInPresim,
  }));
  const { error: medInsertError } = await client.from("medication_administrations").insert(medicationRows);
  if (medInsertError) {
    throw new Error(`Failed to insert medication administrations: ${medInsertError.message}`);
  }

  const [labsCount, docsCount, ordersCount, notesCount, medsCount] = await Promise.all([
    client.from("lab_results").select("*", { count: "exact", head: true }).eq("case_id", caseId),
    client.from("documentation_results").select("*", { count: "exact", head: true }).eq("case_id", caseId),
    client.from("orders").select("*", { count: "exact", head: true }).eq("case_id", caseId),
    client.from("clinical_documents").select("*", { count: "exact", head: true }).eq("case_id", caseId),
    client.from("medication_administrations").select("*", { count: "exact", head: true }).eq("case_id", caseId),
  ]);

  console.log(
    JSON.stringify(
      {
        success: true,
        caseId,
        counts: {
          lab_results: labsCount.count ?? 0,
          documentation_results: docsCount.count ?? 0,
          orders: ordersCount.count ?? 0,
          clinical_documents: notesCount.count ?? 0,
          medication_administrations: medsCount.count ?? 0,
        },
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error("Failed to populate case with realistic values:", error);
  process.exit(1);
});

