"use client";

import type { FlexSheetData } from "./flexSheetData";

type DocumentationRow = {
  time_offset?: number | null;
  [key: string]: unknown;
};

const DOC_COLUMN_BY_ROW_ID: Record<string, string> = {
  hrInput: "hr",
  hrSourceSelect: "hr_source",
  bpInput: "bp",
  bpSourceSelect: "bp_source",
  rrInput: "rr",
  tempInput: "temp",
  tempSourceSelect: "temp_source",
  spo2Input: "spo2",
  weightKgInput: "weight_kg",
  oralIntake: "oral",
  ivIntakeInput: "intravenous",
  enteralNutritionInput: "enteral_nutrition",
  parenteralNutritionInput: "parenteral_nutrition",
  urineInput: "urine",
  emesisInput: "emesis",
  stoolInput: "stool",
  woundDrainageInput: "wound_drainage",
  enteralDrainageInput: "enteral_output",
  painNumeric: "pain",
  appearanceInput: "appearance",
  safetyCheckInput: "safety_check",
  moodAffectInput: "mood_and_affect",
  headScalpInput: "head_and_scalp",
  eyesInput: "eyes",
  earsInput: "ears",
  noseInput: "nose",
  mouthThroatInput: "mouth_and_throat",
  neurologicalOrientationInput: "orientation",
  speechInput: "speech",
  motorFunctionInput: "motor_function",
  skinInput: "skin",
  hairNailsInput: "hair_and_nails",
  turgorInput: "turgor",
  woundInput: "wound",
  heartSoundsInput: "heart_sounds",
  extremitiesInput: "extremities",
  jugularDistentionInput: "jugular_distention",
  chestAppearanceInput: "chest_appearance",
  lungSoundsInput: "lung_sounds",
  abdomenInput: "abdomen",
  bowelSoundsInput: "bowel_sounds",
  nauseaInput: "nausea",
  extremityRomInput: "extremity_rom",
  musculoskeletalGaitInput: "gait",
  voidingInput: "voiding",
  ivSiteInput: "iv_site",
  ivTypeInput: "iv_type",
  ivLocationInput: "iv_location",
  nursingCareProvidedInput: "nursing_care_provided",
  ciwaArNauseaVomitingSelect: "nausea_vomiting",
  ciwaArTremorSelect: "tremor",
  ciwaArParoxysmalSweatsSelect: "paroxysmal_sweats",
  ciwaArAnxietySelect: "anxiety",
  ciwaArAgitationSelect: "agitation",
  ciwaArTactileDisturbancesSelect: "tactile_disturbances",
  ciwaArVisualDisturbancesSelect: "visual_disturbances",
  ciwaArHeadacheSelect: "headache",
  ciwaArOrientationSelect: "orientation2",
  morseHistoryOfFallingSelect: "history_of_falling",
  morseSecondaryDiagnosisSelect: "secondary_diagnosis",
  morseAmbulatoryAidSelect: "ambulatory_aid",
  morseIvTherapySelect: "iv_therapy_heparin_lock",
  morseGaitSelect: "fall_risk_gait",
  morseMentalStatusSelect: "mental_status",
  bradenSensoryPerceptionSelect: "sensory_perception",
  bradenMoistureSelect: "moisture",
  bradenActivitySelect: "activity",
  bradenMobilitySelect: "mobility",
  bradenNutritionSelect: "nutrition",
  bradenFrictionAndShearSelect: "friction_and_shear",
  painadBreathingSelect: "breathing_independent_of_vocalization",
  painadNegativeVocalizationSelect: "negative_vocalization",
  painadFacialExpressionSelect: "facial_expression",
  painadBodyLanguageSelect: "body_language",
  painadConsolabilitySelect: "consolability",
};

function asCellString(value: unknown): string {
  if (value == null) return "";
  return String(value);
}

/** Legacy flex row ids (e.g. hrInput) → documentation_results columns; otherwise row id is the column name. */
export function resolveDocumentationDbColumn(rowId: string): string {
  return DOC_COLUMN_BY_ROW_ID[rowId] ?? rowId;
}

/** Integer columns on editable_documentation_results (must match DB schema). */
const INTEGER_DOCUMENTATION_COLUMNS = new Set<string>([
  "nausea_vomiting",
  "tremor",
  "paroxysmal_sweats",
  "anxiety",
  "agitation",
  "tactile_disturbances",
  "visual_disturbances",
  "headache",
  "orientation2",
  "history_of_falling",
  "secondary_diagnosis",
  "ambulatory_aid",
  "iv_therapy_heparin_lock",
  "fall_risk_gait",
  "mental_status",
  "sensory_perception",
  "moisture",
  "activity",
  "mobility",
  "nutrition",
  "friction_and_shear",
  "breathing_independent_of_vocalization",
  "negative_vocalization",
  "facial_expression",
  "body_language",
  "consolability",
]);

/** Coerce flex cell values to types Postgres accepts (avoids 22P02 on integer columns). */
export function coerceDocumentationValueForPersist(
  dbColumn: string,
  raw: unknown,
): string | number | null {
  if (raw === "" || raw === undefined || raw === null) return null;
  if (INTEGER_DOCUMENTATION_COLUMNS.has(dbColumn)) {
    const n = typeof raw === "number" && Number.isFinite(raw) ? raw : parseInt(String(raw), 10);
    return Number.isFinite(n) ? n : null;
  }
  if (Array.isArray(raw)) {
    return raw.length ? String(raw[0]) : null;
  }
  return String(raw);
}

export function buildChartingRowsFromBundle(
  documentationResults: DocumentationRow[] | null | undefined,
  template: FlexSheetData[],
): { rows: FlexSheetData[]; timeOffsets: number[]; timePointsInPreSim: Set<number>; visibleItems: Set<string> } {
  const docs = documentationResults ?? [];
  const timeOffsets = Array.from(
    new Set(
      docs
        .map((row) => row.time_offset)
        .filter((offset): offset is number => typeof offset === "number"),
    ),
  ).sort((a, b) => b - a);
  const timePointsInPreSim = new Set(
    docs
      .filter((row) => Boolean(row?.is_in_presim))
      .map((row) => Number(row.time_offset))
      .filter((offset) => Number.isFinite(offset)),
  );

  const fallbackOffsets = timeOffsets.length > 0 ? timeOffsets : [0];
  const docByOffset = new Map<number, DocumentationRow>();
  for (const row of docs) {
    if (typeof row.time_offset === "number") {
      docByOffset.set(row.time_offset, row);
    }
  }

  const visibleItems = new Set<string>();
  const rows = template.map((templateRow) => {
    const nextRow: FlexSheetData = { ...templateRow };
    let hasValue = false;
    const mappedColumn = resolveDocumentationDbColumn(templateRow.id);

    for (const offset of fallbackOffsets) {
      const docRow = docByOffset.get(offset);
      const value = asCellString(docRow?.[mappedColumn]);
      nextRow[offset] = value;
      if (value !== "") hasValue = true;
    }

    if (templateRow.hideable) {
      nextRow.hideable = !hasValue;
      if (hasValue) visibleItems.add(templateRow.field);
    }

    return nextRow;
  });

  return { rows, timeOffsets: fallbackOffsets, timePointsInPreSim, visibleItems };
}
