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

export function buildChartingRowsFromBundle(
  documentationResults: DocumentationRow[] | null | undefined,
  template: FlexSheetData[],
): { rows: FlexSheetData[]; timeOffsets: number[] } {
  const docs = documentationResults ?? [];
  const timeOffsets = Array.from(
    new Set(
      docs
        .map((row) => row.time_offset)
        .filter((offset): offset is number => typeof offset === "number"),
    ),
  ).sort((a, b) => b - a);

  const fallbackOffsets = timeOffsets.length > 0 ? timeOffsets : [0];
  const docByOffset = new Map<number, DocumentationRow>();
  for (const row of docs) {
    if (typeof row.time_offset === "number") {
      docByOffset.set(row.time_offset, row);
    }
  }

  const rows = template.map((templateRow) => {
    const nextRow: FlexSheetData = { ...templateRow };
    let hasValue = false;
    const mappedColumn = DOC_COLUMN_BY_ROW_ID[templateRow.id];

    if (mappedColumn) {
      for (const offset of fallbackOffsets) {
        const docRow = docByOffset.get(offset);
        const value = asCellString(docRow?.[mappedColumn]);
        nextRow[offset] = value;
        if (value !== "") hasValue = true;
      }
    } else {
      for (const offset of fallbackOffsets) {
        nextRow[offset] = "";
      }
    }

    if (templateRow.hideable) {
      nextRow.hideable = !hasValue;
    }

    return nextRow;
  });

  return { rows, timeOffsets: fallbackOffsets };
}
