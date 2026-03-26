import { getMinutes } from "date-fns";
export interface chartingOptions {
  subsetId: string;
  label: string;
};


export interface FlexSheetData {
  id: string;
  field: string;
  componentType: 'input' | 'assessmentselect' | 'static' | 'checkboxlist' | 'totalScoreRow' | 'static';
  rowType?: string;
  chartingOptions?: chartingOptions[];
  wdlDescription?: { assessment: string, description: string }[];
  normalRange?: { low: number, high: number },
  hideable?: boolean,
  hideableId?: string,
  assessmentSubsets?: { subsetId: string, label: string }[];
  toolName?: string;
  [key: string]: string | string[] | number | boolean | undefined | { subsetId: string, label: string }[] | { low: number, high: number } | { assessment: string, description: string }[];
};

// an array of all numeric time offsets is needed because tanstack table needs to iterate through them to display each time column
// a time offset is either derived from the prefined data (numeric keys) or generated dynamically to fall exactly on the hour (1300, 1400, etc.)
// negative time is in the present, prefined charting data's postive time is in the past, could flip for clarity
export const getAllTimeOffsets = (simulationNow: number) => {

  const minutesPastTheHour = getMinutes(simulationNow)
  const dynamicTimeOffsets = Array.from({ length: 4 }, (_, index) => {
    const temp = minutesPastTheHour - (60 * index)
    return temp
  })

  const predefinedTimeOffsets = Object.keys(predefinedVitalsData2).map(Number)

  const allTimeOffsets = [... new Set([...dynamicTimeOffsets, ...predefinedTimeOffsets])];

  return allTimeOffsets.sort((a, b) => b - a)
};

export const generateInitialChartingData = (allTimeOffsets: number[]): FlexSheetData[] => {
  const generatedData: FlexSheetData[] = []

  flexSheetTemplate.forEach(templateRow => {
    const newRow: FlexSheetData = {
      id: templateRow.id,
      field: templateRow.field,
      componentType: templateRow.componentType,
      rowType: templateRow.rowType,
      ...(templateRow.chartingOptions && { chartingOptions: templateRow.chartingOptions }),
      ...(templateRow.normalRange && { normalRange: templateRow.normalRange }),
      ...(templateRow.hideable && { hideable: templateRow.hideable }),
      ...(templateRow.hideableId && { hideableId: templateRow.hideableId }),
      ...(templateRow.assessmentSubsets && { assessmentSubsets: templateRow.assessmentSubsets }),
      ...(templateRow.wdlDescription && { wdlDescription: templateRow.wdlDescription }),
      ...(templateRow.toolName && { toolName: templateRow.toolName })
    };

    let hasPrefinedValue = false;

    // if a predefined value exists at the corresping time offset for a specific row (HR, BP, etc), assign it to the row with time offset as the key 
    allTimeOffsets.forEach(offset => {
      const predefinedValue = predefinedVitalsData2[offset]?.[templateRow.id]
      if (predefinedValue) {
        hasPrefinedValue = true;
      }
      newRow[offset] = predefinedValue
    });

    // if a hideable row has a predefined value, the row should be displayed 
    if (hasPrefinedValue) {
      newRow.hideable = false;
    } else {
      newRow.hideable = templateRow.hideable !== undefined ? templateRow.hideable : false;
    }

    generatedData.push(newRow)
  });
  return generatedData
};


type PredefinedVitalsEvent = {
  [field: string]: string;
};

// Type for the main data object, keyed by the minute offset
type PredefinedDataByTime = {
  [timeOffset: number]: PredefinedVitalsEvent;
};

export const predefinedVitalsData2: PredefinedDataByTime = {
  120: {
    "hrInput": "88",
    "hrSourceSelect": "Radial",
    "bpInput": "124/72",
    "bpSourceSelect": "Left upper arm",
    "rrInput": "20",
    "tempInput": "36.8",
    "tempSourceSelect": "Oral",
    "spo2Input": "98"
  },
  90: { // Data from 90 minutes ago
    "hrInput": "112",
    "hrSourceSelect": "Monitor",
    "bpInput": "112/68",
    "bpSourceSelect": "Left upper arm",
    "rrInput": "21",
    "tempInput": "37.4",
    "tempSourceSelect": "Oral",
    "spo2Input": "91",
    "painInput": "2",
    "weightKgInput": "76.4 kg",
    "lungSoundsInput": "Clear",
    "heartSoundsInput": "S1, S2. No mumur noted",
    "extremitiesInput": "+2 pitting edema in BLE"
  },
  5: { // Data from 5 minutes ago
    "hrInput": "121",
    "hrSourceSelect": "Monitor",
    "bpInput": "92/58",
    "bpSourceSelect": "Left upper arm",
    "rrInput": "28",
    "spo2Input": "91",
  }
};

export const flexSheetTemplate: FlexSheetData[] = [
  {
    id: "vitalSignsTitle",
    field: "Vital Signs",
    componentType: "static",
    rowType: "titleRow"
  },
  {
    id: "hrInput",
    field: "HR",
    componentType: "input",
    normalRange: { low: 60, high: 100 }
  },
  {
    id: "hrSourceSelect",
    field: "HR Source",
    componentType: "assessmentselect",
    chartingOptions: [
      { subsetId: "Apical", label: "Apical" },
      { subsetId: "Brachial", label: "Brachial" },
      { subsetId: "Dorsalis pedis", label: "Dorsalis pedis" },
      { subsetId: "Femoral", label: "Femoral" },
      { subsetId: "Monitor", label: "Monitor" },
      { subsetId: "Popliteal", label: "Popliteal" },
      { subsetId: "Radial", label: "Radial" },
    ]
  },
  {
    id: "bpInput",
    field: "BP",
    componentType: "input"
  },
  {
    id: "bpSourceSelect",
    field: "BP Source",
    componentType: "assessmentselect",
    chartingOptions: [
      { subsetId: "Left upper arm", label: "Left upper arm" },
      { subsetId: "Right upper arm", label: "Right upper arm" },
      { subsetId: "Left lower arm", label: "Left lower arm" },
      { subsetId: "Right lower arm", label: "Right lower arm" },
      { subsetId: "Left thigh", label: "Left thigh" },
      { subsetId: "Right thigh", label: "Right thigh" },
      { subsetId: "Left lower leg", label: "Left lower leg" },
      { subsetId: "Right lower leg", label: "Right lower leg" },
      { subsetId: "Arterial line", label: "Arterial line" },
      { subsetId: "Other", label: "Other" },
    ],
  },
  {
    id: "rrInput",
    field: "RR",
    componentType: "input",
    normalRange: { low: 12, high: 20 }
  },
  {
    id: "tempInput",
    field: "Temp",
    componentType: "input",
    normalRange: { low: 36.6, high: 37.2 }
  },
  {
    id: "tempSourceSelect",
    field: "Temp Source",
    componentType: "assessmentselect",
    chartingOptions: [
      { subsetId: "Oral", label: "Oral" },
      { subsetId: "Axillary", label: "Axillary" },
      { subsetId: "Rectal", label: "Rectal" },
      { subsetId: "Tympanic", label: "Tympanic" },
      { subsetId: "Temporal", label: "Temporal" },
      { subsetId: "Bladder", label: "Bladder" },
      { subsetId: "Other", label: "Other" },
    ]
  },
  {
    id: "spo2Input",
    field: "SpO2",
    componentType: "input",
    normalRange: { low: 95, high: 100 }
  },
  {
    id: "o2SourceSelect",
    field: "O2 Source",
    componentType: "assessmentselect",
    chartingOptions: [
      { subsetId: "Room Air", label: "Room Air" },
      { subsetId: "Nasal Cannula", label: "Nasal Cannula" },
      { subsetId: "Non-Rebreather Mask", label: "Non-Rebreather Mask" },
      { subsetId: "Venturi Mask", label: "Venturi Mask" },
      { subsetId: "High-Flow Nasal Cannula", label: "High-Flow Nasal Cannula" },
      { subsetId: "Tracheostomy Collar", label: "Tracheostomy Collar" },
      { subsetId: "Simple Mask", label: "Simple Mask" },
    ]
  },
  {
    id: "weightKgInput",
    field: "Weight (kg)",
    componentType: "input",
  },
  {
    id: "intakeTitle",
    field: "Intake",
    componentType: "static",
    rowType: "titleRow",
  },
  {
    id: "intakeCheckbox",
    field: "Intake Fields",
    componentType: "checkboxlist",
    assessmentSubsets: [
      { subsetId: "Oral", label: "Oral" },
      { subsetId: "Intravenous", label: "Intravenous" },
      { subsetId: "Parenteral Nutrition", label: "Parenteral Nutrition" },
      { subsetId: "Enteral Nutrition", label: "Enteral Nutrition" },
    ]
  },
  {
    id: "oralIntake",
    field: "Oral",
    componentType: "input",
    hideable: true,
    hideableId: "Oral",
  },
  {
    id: "ivIntakeInput",
    field: "Intravenous",
    componentType: "input",
    hideable: true,
    hideableId: "Intravenous",

  },
  {
    id: "enteralNutritionInput",
    field: "Enteral Nutrition",
    componentType: "input",
    hideable: true,
    hideableId: "Enteral Nutrition",
  },
  {
    id: "parenteralNutritionInput",
    field: "Parenteral Nutrition",
    componentType: "input",
    hideable: true,
    hideableId: "Parenteral Nutrition",
  },
  {
    id: "outputTitle",
    field: "Output",
    componentType: "static",
    rowType: "titleRow",
  },
  {
    id: "outputCheckbox",
    field: "Output Fields",
    componentType: "checkboxlist",
    assessmentSubsets: [
      { subsetId: "ioUrine", label: "Urine" },
      { subsetId: "ioEmesis", label: "Emesis" },
      { subsetId: "ioStool", label: "Stool" },
      { subsetId: "Wound Drainage", label: "Wound Drainage" },
      { subsetId: "Enteral Output", label: "Enteral Output" },
    ]
  },
  {
    id: "urineInput",
    field: "Urine",
    componentType: "input",
    hideable: true,
    hideableId: "ioUrine"
  },
  {
    id: "emesisInput",
    field: "Emesis",
    componentType: "input",
    hideable: true,
    hideableId: "ioEmesis"
  },
  {
    id: "stoolInput",
    field: "Stool",
    componentType: "input",
    hideable: true,
    hideableId: "ioStool"
  },
  {
    id: "woundDrainageInput",
    field: "Wound Drainage",
    componentType: "input",
    hideable: true,
    hideableId: "Wound Drainage"
  },
  {
    id: "enteralDrainageInput",
    field: "Enteral Output",
    componentType: "input",
    hideable: true,
    hideableId: "Enteral Output"
  },
  {
    id: "painTitle",
    field: "Pain",
    componentType: "static",
    rowType: "titleRow",
  },
  {
    id: "painNumeric",
    field: "Numeric Rating",
    componentType: "input",
  },
  {
    id: "painLocation",
    field: "Location",
    componentType: "input",
  },
  {
    id: "painCharacteristics",
    field: "Characteristics",
    componentType: "input",
  },
  {
    id: "painAlleviatingFactors",
    field: "Alleviating Factors",
    componentType: "input",
  },
  {
    id: "painAggravatingFactors",
    field: "Aggravating Factors",
    componentType: "input",
  },
  {
    id: "painInterventions",
    field: "Interventions",
    componentType: "input",
  },
  {
    id: "generalAppearanceTitle",
    field: "General Appearance",
    componentType: "static",
    rowType: "titleRow",
    wdlDescription: [
      { assessment: "General Appeareance", description: "Patient appears their stated age, A&O × 4, no acute distress and is cooperative." },
      { assessment: "Safety", description: "call-light within reach, bed lowest/locked, side‑rails appropriate, room clutter‑free, non-slip socks applied, personal belongings in reach, bed alarm on" }
    ]
  },
  {
    id: "generalAppearanceCheckbox",
    field: "General Appearance",
    componentType: "checkboxlist",
    assessmentSubsets: [
      { subsetId: "WDL", label: "WDL" },
      { subsetId: "WDL, except:", label: "WDL, except:" },
      { subsetId: "Appearance", label: "Appearance" },
      { subsetId: "Safety Checks", label: "Safety Checks" },
    ]
  },
  {
    id: "appearanceInput",
    field: "Appearance",
    componentType: "input",
    hideable: true,
    hideableId: "Appearance"
  },
  {
    id: "safetyCheckInput",
    field: "Safety Check",
    componentType: "input",
    hideable: true,
    hideableId: "Safety Checks"
  },
  {
    id: "psychosocialAssessmentTitle",
    field: "Psychosocial Assessment",
    componentType: "static",
    rowType: "titleRow",
    wdlDescription: [
      {
        assessment: "Mood & Affect",
        description: "Appropriate, consistent with situation. Speech coherent, hygiene appropriate, denies suicidal/homicidal ideation."
      },
    ]

  },
  {
    id: "psychosocialStatusCheckbox",
    field: "Psychosocial Status",
    componentType: "checkboxlist",
    assessmentSubsets: [
      { subsetId: "WDL", label: "WDL" },
      { subsetId: "WDL, except:", label: "WDL, except:" },
      { subsetId: "Mood & Affect", label: "Mood & Affect" },
    ]
  },
  {
    id: "moodAffectInput",
    field: "Mood & Affect",
    componentType: "input",
    hideable: true,
    hideableId: "Mood & Affect"
  },
  {
    id: "heentAssessmentTitle",
    field: "HEENT Assessment",
    componentType: "static",
    rowType: "titleRow",
    wdlDescription: [
      { assessment: "Head & Scalp", description: "Normocephalic, no lesions or tenderness" },
      { assessment: "Eyes", description: "Conjunctivae pink, sclera white, pupils equal/reactive (PERRLA), follows light/objects" },
      { assessment: "Ears", description: "No drainage, gross hearing intact" },
      { assessment: "Nose", description: "Nares patent, no drainage, no deformities" },
      { assessment: "Mouth & Throat", description: "Mucous membranes pink and moist, no lesions or odor, uvula midline" },
    ]
  },
  {
    id: "heentStatusCheckbox",
    field: "HEENT Status",
    componentType: "checkboxlist",
    assessmentSubsets: [
      { subsetId: "WDL", label: "WDL" },
      { subsetId: "WDL, except:", label: "WDL, except:" },
      { subsetId: "Head & Scalp", label: "Head & Scalp" },
      { subsetId: "Eyes", label: "Eyes" },
      { subsetId: "Ears", label: "Ears" },
      { subsetId: "Nose", label: "Nose" },
      { subsetId: "Mouth & Throat", label: "Mouth & Throat" },
    ]
  },
  {
    id: "headScalpInput",
    field: "Head & Scalp",
    componentType: "input",
    hideable: true,
    hideableId: "Head & Scalp"
  },
  {
    id: "eyesInput",
    field: "Eyes",
    componentType: "input",
    hideable: true,
    hideableId: "Eyes"
  },
  {
    id: "earsInput",
    field: "Ears",
    componentType: "input",
    hideable: true,
    hideableId: "Ears"
  },
  {
    id: "noseInput",
    field: "Nose",
    componentType: "input",
    hideable: true,
    hideableId: "Nose"
  },
  {
    id: "mouthThroatInput",
    field: "Mouth & Throat",
    componentType: "input",
    hideable: true,
    hideableId: "Mouth & Throat"
  },
  {
    id: "neurologicalAssessmentTitle",
    field: "Neurological Assessment",
    componentType: "static",
    rowType: "titleRow",
    wdlDescription: [
      { assessment: "Orientation", description: "Alert and oriented × 4, follows commands." },
      { assessment: "Speech", description: "Speech clear and coherent." },
      { assessment: "Motor Function", description: "Gross motor functioning intact." }
    ]
  },
  {
    id: "neurologicalStatusCheckbox",
    field: "Neurological Status", // Corrected field name
    componentType: "checkboxlist",
    assessmentSubsets: [
      { subsetId: "WDL", label: "WDL" },
      { subsetId: "WDL, except:", label: "WDL, except:" },
      { subsetId: "Orientation", label: "Orientation" },
      { subsetId: "Speech", label: "Speech" },
      { subsetId: "Motor Function", label: "Motor Function" }
    ]
  },
  {
    id: "neurologicalOrientationInput",
    field: "Orientation",
    componentType: "input",
    hideable: true,
    hideableId: "Orientation"
  },
  {
    id: "speechInput",
    field: "Speech",
    componentType: "input",
    hideable: true,
    hideableId: "Speech"
  },
  {
    id: "motorFunctionInput",
    field: "Motor Function",
    componentType: "input",
    hideable: true,
    hideableId: "Motor Function"
  },
  {
    id: "integumentaryAssessmentTitle",
    field: "Integumentary Assessment",
    componentType: "static",
    rowType: "titleRow",
    wdlDescription: [
      { assessment: "Skin", description: "Warm, dry, intact, uniform color appropriate for race, no rashes or swelling. No signs of inflammation, breakdown, or pressure injury" },
      { assessment: "Hair & Skin", description: "Normal distribution; nails smooth; no clubbing or abnormalities, cap refill < 2 seconds" },
      { assessment: "Turgor", description: "Brisk recoil." }
    ]
  },
  {
    id: "integumentStatusCheckbox",
    field: "Integument Status",
    componentType: "checkboxlist",
    assessmentSubsets: [
      { subsetId: "WDL", label: "WDL" },
      { subsetId: "WDL, except:", label: "WDL, except:" },
      { subsetId: "Skin", label: "Skin" },
      { subsetId: "Hair & Nails", label: "Hair & Nails" },
      { subsetId: "Turgor", label: "Turgor" },
      { subsetId: "Wound", label: "Wound" }
    ]
  },
  {
    id: "skinInput",
    field: "Skin",
    componentType: "input",
    hideable: true,
    hideableId: "Skin"
  },
  {
    id: "hairNailsInput",
    field: "Hair & Nails",
    componentType: "input",
    hideable: true,
    hideableId: "Hair & Nails"
  },
  {
    id: "turgorInput",
    field: "Turgor",
    componentType: "input",
    hideable: true,
    hideableId: "Turgor"
  },
  {
    id: "woundInput",
    field: "Wound",
    componentType: "input",
    hideable: true,
    hideableId: "Wound"
  },
  {
    id: "cardiovascularAssessmentTitle",
    field: "Cardiovascular Assessment",
    componentType: "static",
    rowType: "titleRow",
    wdlDescription: [
      { assessment: "Heart Sounds", description: "Regular rate (60-100 bpm) & rhythm, S1/S2 audible, no murmurs/rubs/gallops." },
      { assessment: "Extremities", description: "Pulses 2+ bilaterally (radial, dorsalis pedis), cap refill < 2 seconds, no edema, uniform color." },
      { assessment: "Jugular Distention", description: "No venous jugular distention." }
    ]
  },
  {
    id: "cardiovascularStatusCheckbox",
    field: "Cardiovascular Status",
    componentType: "checkboxlist",
    assessmentSubsets: [
      { subsetId: "WDL", label: "WDL" },
      { subsetId: "WDL, except:", label: "WDL, except:" },
      { subsetId: "Heart Sounds", label: "Heart Sounds" },
      { subsetId: "Extremities", label: "Extremities" },
      { subsetId: "Jugular Distention", label: "Jugular Distention" },
    ]
  },
  {
    id: "heartSoundsInput",
    field: "Heart Sounds",
    componentType: "input",
    hideable: true,
    hideableId: "Heart Sounds"
  },
  {
    id: "extremitiesInput",
    field: "Extremities",
    componentType: "input",
    hideable: true,
    hideableId: "Extremities"
  },
  {
    id: "jugularDistentionInput",
    field: "Jugular Distention",
    componentType: "input",
    hideable: true,
    hideableId: "Jugular Distention"
  },
  {
    id: "respiratoryAssessmentTitle",
    field: "Respiratory Assessment",
    componentType: "static",
    rowType: "titleRow",
    wdlDescription: [
      { assessment: "Chest Appearance", description: "Chest expansion symmetric, respirations non-labored, regular rate, no accessory muscle use." },
      { assessment: "Lung Sounds", description: "Breath sounds clear bilaterally (anterior/posterior/lateral), no adventitious sounds (crackles, wheezes, rhonchi)." }
    ]
  },
  {
    id: "respiratoryStatusCheckbox",
    field: "Respiratory Status",
    componentType: "checkboxlist",
    assessmentSubsets: [
      { subsetId: "WDL", label: "WDL" },
      { subsetId: "WDL, except:", label: "WDL, except:" },
      { subsetId: "Chest Appearance", label: "Chest Appearance" },
      { subsetId: "Lung Sounds", label: "Lung Sounds" },
    ]
  },
  {
    id: "chestAppearanceInput",
    field: "Chest Appearance",
    componentType: "input",
    hideable: true,
    hideableId: "Chest Appearance"
  },
  {
    id: "lungSoundsInput",
    field: "Lung Sounds",
    componentType: "input",
    hideable: true,
    hideableId: "Lung Sounds"
  },
  {
    id: "giAssessmentTitle",
    field: "GI Assessment",
    componentType: "static",
    rowType: "titleRow",
    wdlDescription: [
      { assessment: "Abdomen", description: "Soft, non-tender, non-distended. No masses or guarding, no visible scars or lesions." },
      { assessment: "Bowel Sounds", description: "Present and active in all four quadrants." },
      { assessment: "Nausea", description: "No nausea, vomiting, or diarrhea." }
    ]
  },
  {
    id: "giStatusCheckbox",
    field: "GI Status",
    componentType: "checkboxlist",
    assessmentSubsets: [
      { subsetId: "WDL", label: "WDL" },
      { subsetId: "WDL, except:", label: "WDL, except:" },
      { subsetId: "Abdomen", label: "Abdomen" },
      { subsetId: "Bowel Sounds", label: "Bowel Sounds" },
      { subsetId: "Nausea", label: "Bowel Sounds" }
    ]
  },
  {
    id: "abdomenInput",
    field: "Abdomen",
    componentType: "input",
    hideable: true,
    hideableId: "Abdomen"
  },
  {
    id: "bowelSoundsInput",
    field: "Bowel Sounds",
    componentType: "input",
    hideable: true,
    hideableId: "Bowel Sounds"
  },
  {
    id: "nauseaInput",
    field: "Nausea",
    componentType: "input",
    hideable: true,
    hideableId: "Nausea"
  },
  {
    id: "musculoskeletalAssessmentTitle",
    field: "Musculoskeletal Assessment",
    componentType: "static",
    rowType: "titleRow",
    wdlDescription: [
      { assessment: "ROM", description: "Full active and passive in all joints, strength 5/5 bilaterally." },
      { assessment: "Gait", description: "Gait steady, ambulates independently" }
    ]
  },
  {
    id: "musculoskeletalStatusCheckbox",
    field: "Musculoskeletal Status",
    componentType: "checkboxlist",
    assessmentSubsets: [
      { subsetId: "WDL", label: "WDL" },
      { subsetId: "WDL, except:", label: "WDL, except:" },
      { subsetId: "Extremity ROM", label: "Extremity ROM" },
      { subsetId: "Gait", label: "Gait" },
    ]
  },
  {
    id: "extremityRomInput",
    field: "Extremity ROM",
    componentType: "input",
    hideable: true,
    hideableId: "Extremity ROM"
  },
  {
    id: "musculoskeletalGaitInput",
    field: "Gait",
    componentType: "input",
    hideable: true,
    hideableId: "Gait"
  },
  {
    id: "genitourinaryAssessmentTitle",
    field: "Genitourinary Assessment",
    componentType: "static",
    rowType: "titleRow",
    wdlDescription: [
      { assessment: "Voiding", description: "Without pain, burning, or urgency. No new incontinence." },
      { assessment: "Urine", description: "Clear, yellow, absent of odor." }
    ]
  },
  {
    id: "genitourinaryStatusCheckbox",
    field: "Genitourinary Status",
    componentType: "checkboxlist",
    assessmentSubsets: [
      { subsetId: "WDL", label: "WDL" },
      { subsetId: "WDL, except:", label: "WDL, except:" },
      { subsetId: "Voiding", label: "Voiding" },
      { subsetId: "Urine", label: "Urine" },
    ]
  },
  {
    id: "voidingInput",
    field: "Voiding",
    componentType: "input",
    hideable: true,
    hideableId: "Voiding"
  },
  {
    id: "urineInput",
    field: "Urine",
    componentType: "input",
    hideable: true,
    hideableId: "Urine"
  },
  {
    id: "ivAssessmentTitle",
    field: "IV Assessment",
    componentType: "static",
    rowType: "titleRow"
  },
  {
    id: "ivSiteInput",
    field: "IV Site",
    componentType: "input"
  },
  {
    id: "ivTypeInput",
    field: "IV Type",
    componentType: "input"
  },
  {
    id: "ivLocationInput",
    field: "IV Location",
    componentType: 'input'
  },
  {
    id: "nursingCareTitle",
    field: "Nursing Care",
    componentType: "static",
    rowType: "titleRow"
  },
  {
    id: "nursingCareProvidedInput",
    field: "Nursing Care Provided",
    componentType: "input"
  },

  {
    id: "assessmentToolsTitle",
    field: "Assessment Tools",
    componentType: "static",
    rowType: "titleRow"
  },
  {
    id: "additionalToolsCheckbox",
    field: "Additional Tools",
    componentType: "checkboxlist",
    assessmentSubsets: [
      { subsetId: "CIWA-Ar", label: "CIWA-Ar" },
      { subsetId: "Morse Fall Risk", label: "Morse Fall Risk" },
      { subsetId: "Braden Scale", label: "Braden Scale" },
      { subsetId: "PAINAD", label: "PAINAD" }
    ]
  },
  {
    id: "ciwaArSectionTitle",
    field: "CIWA-Ar",
    componentType: "static",
    rowType: "titleRow",
    hideable: true,
    hideableId: "CIWA-Ar"
  },
  {
    id: "ciwaArNauseaVomitingSelect",
    field: "Nausea & Vomiting",
    componentType: "assessmentselect",
    chartingOptions: [
      { subsetId: "0", label: "0 - No nausea or vomitting" },
      { subsetId: "1", label: "1 - Mild nausea with no vomiting" },
      { subsetId: "2", label: "2" },
      { subsetId: "3", label: "3" },
      { subsetId: "4", label: "4 - Intermittent nausea with no vomiting" },
      { subsetId: "5", label: "5" },
      { subsetId: "6", label: "6" },
      { subsetId: "7", label: "7 - Constant nausea, frequent dry heaves and vomiting" }
    ],
    hideable: true,
    hideableId: "CIWA-Ar",
    toolName: "CIWA-Ar"
  },
  {
    id: "ciwaArTremorSelect",
    field: "Tremor",
    componentType: "assessmentselect",
    chartingOptions: [
      { subsetId: "0", label: "0 - No tremor" },
      { subsetId: "1", label: "1 - Not visible, but can be felt fingertip to fingertip" },
      { subsetId: "2", label: "2" },
      { subsetId: "3", label: "3" },
      { subsetId: "4", label: "4 - Moderate, with patient's arms extended" },
      { subsetId: "5", label: "5" },
      { subsetId: "6", label: "6" },
      { subsetId: "7", label: "7 - Severe, even with arms not extended" }
    ],
    hideable: true,
    hideableId: "CIWA-Ar",
    toolName: "CIWA-Ar"
  },
  {
    id: "ciwaArParoxysmalSweatsSelect",
    field: "Paroxysmal Sweats",
    componentType: "assessmentselect",
    chartingOptions: [
      { subsetId: "0", label: "0 - No sweat visible" },
      { subsetId: "1", label: "1 - Barely perceptible sweating, palms moist" },
      { subsetId: "2", label: "2" },
      { subsetId: "3", label: "3" },
      { subsetId: "4", label: "4 - Beads of sweat obvious on forehead" },
      { subsetId: "5", label: "5" },
      { subsetId: "6", label: "6" },
      { subsetId: "7", label: "7 - Drenching sweats" }
    ],
    hideable: true,
    hideableId: "CIWA-Ar",
    toolName: "CIWA-Ar"
  },
  {
    id: "ciwaArAnxietySelect",
    field: "Anxiety",
    componentType: "assessmentselect",
    chartingOptions: [
      { subsetId: "0", label: "0 - No anxiety, at ease" },
      { subsetId: "1", label: "1 - Mildly anxious" },
      { subsetId: "2", label: "2" },
      { subsetId: "3", label: "3" },
      { subsetId: "4", label: "4 - Moderately anxious, or guarded, so anxiety is inferred" },
      { subsetId: "5", label: "5" },
      { subsetId: "6", label: "6" },
      { subsetId: "7", label: "7 - Equivalent to acute panic states" }
    ],
    hideable: true,
    hideableId: "CIWA-Ar",
    toolName: "CIWA-Ar"
  },
  {
    id: "ciwaArAgitationSelect",
    field: "Agitation",
    componentType: "assessmentselect",
    chartingOptions: [
      { subsetId: "0", label: "0 - Normal activity" },
      { subsetId: "1", label: "1 - Somewhat more than normal activity" },
      { subsetId: "2", label: "2" },
      { subsetId: "3", label: "3" },
      { subsetId: "4", label: "4  - Moderately fidgety and restless" },
      { subsetId: "5", label: "5" },
      { subsetId: "6", label: "6" },
      { subsetId: "7", label: "7 - Paces back and forth during most of the interview, or constantly thrashes about" }
    ],
    hideable: true,
    hideableId: "CIWA-Ar",
    toolName: "CIWA-Ar"
  },
  {
    id: "ciwaArTactileDisturbancesSelect",
    field: "Tactile Disturbances",
    componentType: "assessmentselect",
    chartingOptions: [
      { subsetId: "0", label: "0 - None" },
      { subsetId: "1", label: "1 - Very mild itching, pins and needles, burning, or numbness" },
      { subsetId: "2", label: "2 - Mild itching, pins and needles, burning, or numbness" },
      { subsetId: "3", label: "3 - Moderate itching, pins and needles, burning, or numbness" },
      { subsetId: "4", label: "4 - Moderately severe hallucinations" },
      { subsetId: "5", label: "5 - Severe hallucinations" },
      { subsetId: "6", label: "6 - Extremely severe hallucinations" },
      { subsetId: "7", label: "7 - Continuous hallucinations" }
    ],
    hideable: true,
    hideableId: "CIWA-Ar",
    toolName: "CIWA-Ar"
  },
  {
    id: "ciwaArVisualDisturbancesSelect",
    field: "Visual Disturbances",
    componentType: "assessmentselect",
    chartingOptions: [
      { subsetId: "0", label: "0 - Not present" },
      { subsetId: "1", label: "1 - Very mild sensitivity" },
      { subsetId: "2", label: "2" },
      { subsetId: "3", label: "3" },
      { subsetId: "4", label: "4 - Moderately severe hallucinations" },
      { subsetId: "5", label: "5" },
      { subsetId: "6", label: "6" },
      { subsetId: "7", label: "7 - Continuous hallucinations" }
    ],
    hideable: true,
    hideableId: "CIWA-Ar",
    toolName: "CIWA-Ar"
  },
  {
    id: "ciwaArHeadacheSelect",
    field: "Headache",
    componentType: "assessmentselect",
    chartingOptions: [
      { subsetId: "0", label: "0 - Not Present" },
      { subsetId: "1", label: "1 - Very mild" },
      { subsetId: "2", "label": "2" },
      { subsetId: "3", "label": "3" },
      { subsetId: "4", label: "4 - Moderately severe" },
      { subsetId: "5", "label": "5" },
      { subsetId: "6", "label": "6" },
      { subsetId: "7", label: "7 - Extremely severe" }
    ],
    hideable: true,
    hideableId: "CIWA-Ar",
    toolName: "CIWA-Ar"
  },
  {
    id: "ciwaArOrientationSelect",
    field: "Orientation",
    componentType: "assessmentselect",
    chartingOptions: [
      { subsetId: "0", label: "0 - Oriented, can do serial additions" },
      { subsetId: "1", label: "1 - Cannot do serial additions or is uncertain about date" },
      { subsetId: "2", label: "2 - Disoriented for date by no more than 2 calendar days" },
      { subsetId: "3", label: "3 - Disoriented for date by more than 2 calendar days" },
      { subsetId: "4", label: "4 - Disoriented to place or person" },
    ],
    hideable: true,
    hideableId: "CIWA-Ar",
    toolName: "CIWA-Ar"
  },
  {
    id: "morseFallRiskTitle",
    field: "Morse Fall Risk",
    componentType: "static",
    rowType: "titleRow",
    hideable: true,
    hideableId: "Morse Fall Risk"
  },
  {
    id: "morseHistoryOfFallingSelect",
    field: "History of Falling",
    componentType: "assessmentselect",
    chartingOptions: [
      { subsetId: "0", label: "0 - No falls" },
      { subsetId: "25", label: "25 - Has fallen within 3 months" },
    ],
    hideable: true,
    hideableId: "Morse Fall Risk",
    toolName: "Morse Fall Risk"

  },
  {
    id: "morseSecondaryDiagnosisSelect",
    field: "Secondary Diagnosis",
    componentType: "assessmentselect",
    chartingOptions: [
      { subsetId: "0", label: "0 - No" },
      { subsetId: "15", label: "15 - Yes" },
    ],
    hideable: true,
    hideableId: "Morse Fall Risk",
    toolName: "Morse Fall Risk"

  },
  {
    id: "morseAmbulatoryAidSelect",
    field: "Ambulatory Aid",
    componentType: "assessmentselect",
    chartingOptions: [
      { subsetId: "0", label: "0 - Bedrest/nurse assist" },
      { subsetId: "15", label: "15 - Crutches/cane/walker" },
      { subsetId: "25", label: "25 - Clutches furniture or support" }
    ],
    hideable: true,
    hideableId: "Morse Fall Risk",
    toolName: "Morse Fall Risk"
  },
  {
    id: "morseIvTherapySelect",
    field: "IV Therapy/Heparin Lock",
    componentType: "assessmentselect",
    chartingOptions: [
      { subsetId: "0", label: "0 - No" },
      { subsetId: "20", label: "20 - Yes" },
    ],
    hideable: true,
    hideableId: "Morse Fall Risk",
    toolName: "Morse Fall Risk"

  },
  {
    id: "morseGaitSelect",
    field: "Gait",
    componentType: "assessmentselect",
    chartingOptions: [
      { subsetId: "0", label: "0 - Normal/Bedrest/Wheelchair" },
      { subsetId: "10", label: "10 - Weak" },
      { subsetId: "20", label: "20 - Impaired" }
    ],
    hideable: true,
    hideableId: "Morse Fall Risk",
    toolName: "Morse Fall Risk"

  },
  {
    id: "morseMentalStatusSelect",
    field: "Mental Status",
    componentType: "assessmentselect",
    chartingOptions: [
      { subsetId: "0", label: "0 - Oriented to own abilities" },
      { subsetId: "15", label: "15 - Overestimates or forgets limitations" },
    ],
    hideable: true,
    hideableId: "Morse Fall Risk",
    toolName: "Morse Fall Risk"
  },
  {
    id: "bradenScaleTitle",
    field: "Braden Scale",
    componentType: "static",
    rowType: "titleRow",
    hideable: true,
    hideableId: "Braden Scale",

  },
  {
    id: "bradenSensoryPerceptionSelect",
    field: "Sensory Perception",
    componentType: "assessmentselect",
    chartingOptions: [
      { subsetId: "1", label: "1 - Completely Limited" },
      { subsetId: "2", label: "2 - Very Limited" },
      { subsetId: "3", label: "3 - Slightly Limited" },
      { subsetId: "4", label: "4 - No Impairment" },
    ],
    hideable: true,
    hideableId: "Braden Scale",
    toolName: "Braden Scale"

  },
  {
    id: "bradenMoistureSelect",
    field: "Moisture",
    componentType: "assessmentselect",
    chartingOptions: [
      { subsetId: "1", label: "1 - Constantly Moist" },
      { subsetId: "2", label: "2 - Very Moist" },
      { subsetId: "3", label: "3 - Occasionally Moist" },
      { subsetId: "4", label: "4 - Rarely Moist" },
    ],
    hideable: true,
    hideableId: "Braden Scale",
    toolName: "Braden Scale"

  },
  {
    id: "bradenActivitySelect",
    field: "Activity",
    componentType: "assessmentselect",
    chartingOptions: [
      { subsetId: "1", label: "1 - Bedfast" },
      { subsetId: "2", label: "2 - Chairfast" },
      { subsetId: "3", label: "3 - Walks Occasionally." },
      { subsetId: "4", label: "4 - Walks Frequently" },
    ],
    hideable: true,
    hideableId: "Braden Scale",
    toolName: "Braden Scale"

  },
  {
    id: "bradenMobilitySelect",
    field: "Mobility",
    componentType: "assessmentselect",
    chartingOptions: [
      { subsetId: "1", label: "1 - Completely Immobile" },
      { subsetId: "2", label: "2 - Very Limited" },
      { subsetId: "3", label: "3 - Slightly Limited" },
      { subsetId: "4", label: "4 - No Limitations" },
    ],
    hideable: true,
    hideableId: "Braden Scale",
    toolName: "Braden Scale"

  },
  {
    id: "bradenNutritionSelect",
    field: "Nutrition",
    componentType: "assessmentselect",
    chartingOptions: [
      { subsetId: "1", label: "1 - Very Poor" },
      { subsetId: "2", label: "2 - Probably Inadequate" },
      { subsetId: "3", label: "3 - Adequate" },
      { subsetId: "4", label: "4 - Excellent" },
    ],
    hideable: true,
    hideableId: "Braden Scale",
    toolName: "Braden Scale"

  },
  {
    id: "bradenFrictionAndShearSelect",
    field: "Friction and Shear",
    componentType: "assessmentselect",
    chartingOptions: [
      { subsetId: "1", label: "1 - Problem" },
      { subsetId: "2", label: "2 - Potential Problem" },
      { subsetId: "3", label: "3 - No Apparent Problem" },
    ],
    hideable: true,
    hideableId: "Braden Scale",
    toolName: "Braden Scale"
  },
  {
    id: "painadTitle",
    field: "PAINAD",
    componentType: "static",
    rowType: "titleRow",
    hideable: true,
    hideableId: "PAINAD",
  },
  {
    id: "painadBreathingSelect",
    field: "Breathing",
    componentType: "assessmentselect",
    chartingOptions: [
      { subsetId: "0", label: "0 - Normal" },
      { subsetId: "1", label: "1 - Occasional labored breathing, short periods of hyperventilation" },
      { subsetId: "2", label: "2 - Noisy labored breathing, long periods of hyperventilation, Cheyne-Stokes" },
    ],
    hideable: true,
    hideableId: "PAINAD",
    toolName: "PAINAD"
  },
  {
    id: "painadNegativeVocalizationSelect",
    field: "Negative Vocalization",
    componentType: "assessmentselect",
    chartingOptions: [
      { subsetId: "0", label: "0 - None" },
      { subsetId: "1", label: "1 - Occasional moan or groan, low-level speech with a negative or disapproving quality" },
      { subsetId: "2", label: "2 - Repeated troubled calling out, loud moaning or groaning, crying" },
    ],
    hideable: true,
    hideableId: "PAINAD",
    toolName: "PAINAD"
  },
  {
    id: "painadFacialExpressionSelect",
    field: "Facial Expression",
    componentType: "assessmentselect",
    chartingOptions: [
      { subsetId: "0", label: "0 - Smiling or inexpressive" },
      { subsetId: "1", label: "1 - Sad, frightened, frown" },
      { subsetId: "2", label: "2 - Facial grimacing" },
    ],
    hideable: true,
    hideableId: "PAINAD",
    toolName: "PAINAD"
  },
  {
    id: "painadBodyLanguageSelect",
    field: "Body Language",
    componentType: "assessmentselect",
    chartingOptions: [
      { subsetId: "0", label: "0 - Relaxed" },
      { subsetId: "1", label: "1 - Tense, distressed pacing, fidgeting" },
      { subsetId: "2", label: "2 - Rigid, fists clenched, knees pulled up or pushing away, striking out" },
    ],
    hideable: true,
    hideableId: "PAINAD",
    toolName: "PAINAD"
  },
  {
    id: "painadConsolabilitySelect",
    field: "Consolability",
    componentType: "assessmentselect",
    chartingOptions: [
      { subsetId: "0", label: "0 - No need to console" },
      { subsetId: "1", label: "1 - Distracted or reassured by voice or touch" },
      { subsetId: "2", label: "2 - Unable to console, distract, or reassure" },
    ],
    hideable: true,
    hideableId: "PAINAD",
    toolName: "PAINAD"
  },
];



interface AssessmentToolCategories {
  name: string,
  scoringOptions: { rating: string, description: string }[]
}

interface ScoreInterpretation {
  result: string
  range: string,
  description: string,
  action?: string
}

export interface AssessmentTool {
  name: string,
  categories: AssessmentToolCategories[],
  maxScore?: string,
  interpretations?: ScoreInterpretation[]
}


export const assessmentTools: AssessmentTool[] = [
  {
    name: "CIWA-Ar",
    categories: [
      {
        name: "Nausea & Vomitting",
        scoringOptions: [
          { rating: "0", description: "No nausea or vomitting" },
          { rating: "1", description: "Mild nausea with no vomiting" },
          { rating: "4", description: "Intermittent nausea with no vomiting" },
          { rating: "7", description: "Constant nausea, frequent dry heaves and vomiting" }
        ]
      },
      {
        name: "Tremor",
        scoringOptions: [
          { rating: "0", description: "No tremor" },
          { rating: "1", description: "Not visible, but can be felt fingertip to fingertip" },
          { rating: "4", description: "Moderate, with patient's arms extended" },
          { rating: "7", description: "Severe, even with arms not extended" }
        ]
      },
      {
        name: "Paroxysmal Sweats",
        scoringOptions: [
          { rating: "0", description: "No sweat visible" },
          { rating: "1", description: "Barely perceptible sweating, palms moist" },
          { rating: "4", description: "Beads of sweat obvious on forehead" }, // Scores 2, 3, 5, 6 are often implied intermediate steps
          { rating: "7", description: "Drenching sweats" },
        ],
      },
      {
        name: "Anxiety",
        scoringOptions: [
          { rating: "0", description: "No anxiety, at ease" },
          { rating: "1", description: "Mildly anxious" },
          { rating: "4", description: "Moderately anxious, or guarded, so anxiety is inferred" }, // Scores 2, 3, 5, 6 are often implied intermediate steps
          { rating: "7", description: "Equivalent to acute panic states as seen in severe delirium or acute schizophrenic reactions" },
        ],
      },
      {
        name: "Agitation",
        scoringOptions: [
          { rating: "0", description: "Normal activity" },
          { rating: "1", description: "Somewhat more than normal activity" },
          { rating: "4", description: "Moderately fidgety and restless" }, // Scores 2, 3, 5, 6 are often implied intermediate steps
          { rating: "7", description: "Paces back and forth during most of the interview, or constantly thrashes about" },
        ],
      },
      {
        name: "Tactile Disturbances",
        scoringOptions: [
          { rating: "0", description: "None" },
          { rating: "1", description: "Very mild itching, pins and needles, burning, or numbness" },
          { rating: "2", description: "Mild itching, pins and needles, burning, or numbness" },
          { rating: "3", description: "Moderate itching, pins and needles, burning, or numbness" },
          { rating: "4", description: "Moderately severe hallucinations" },
          { rating: "5", description: "Severe hallucinations" },
          { rating: "6", description: "Extremely severe hallucinations" },
          { rating: "7", description: "Continuous hallucinations" },
        ],
      },
      {
        name: "Auditory Disturbances",
        scoringOptions: [
          { rating: "0", description: "Not present" },
          { rating: "1", description: "Very mild harshness or ability to frighten" },
          { rating: "2", description: "Mild harshness or ability to frighten" },
          { rating: "3", description: "Moderate harshness or ability to frighten" },
          { rating: "4", description: "Moderately severe hallucinations" },
          { rating: "5", description: "Severe hallucinations" },
          { rating: "6", description: "Extremely severe hallucinations" },
          { rating: "7", description: "Continuous hallucinations" },
        ],
      },
      {
        name: "Visual Disturbances",
        scoringOptions: [
          { rating: "0", description: "Not present" },
          { rating: "1", description: "Very mild sensitivity" },
          { rating: "2", description: "Mild sensitivity" },
          { rating: "3", description: "Moderate sensitivity" },
          { rating: "4", description: "Moderately severe hallucinations" },
          { rating: "5", description: "Severe hallucinations" },
          { rating: "6", description: "Extremely severe hallucinations" },
          { rating: "7", description: "Continuous hallucinations" },
        ],
      },
      {
        name: "Headache, Fullness in Head",
        scoringOptions: [
          { rating: "0", description: "Not Present" },
          { rating: "1", description: "Very mild" },
          { rating: "2", description: "Mild" },
          { rating: "3", description: "Moderate" },
          { rating: "4", description: "Moderately severe" },
          { rating: "5", description: "Severe" },
          { rating: "6", description: "Very severe" },
          { rating: "7", description: "Extremely severe" },
        ],
      },
      {
        name: "Orientation and Clouding of Sensorium",
        scoringOptions: [
          { rating: "0", description: "Oriented, can do serial additions" },
          { rating: "1", description: "Cannot do serial additions or is uncertain about date" },
          { rating: "2", description: "Disoriented for date by no more than 2 calendar days" },
          { rating: "3", description: "Disoriented for date by more than 2 calendar days" },
          { rating: "4", description: "Disoriented to place or person" },
        ],
      },
    ],
    maxScore: "67",
    interpretations: [
      { result: "Mild", range: "0-9", description: "Minimal symptoms" },
      { result: "Moderate", range: "10-15", description: "Moderate symptoms" },
      { result: "Severe", range: "16+", description: "Severe symptoms requiring medical attention" }
    ]
  },
  {
    name: "Morse Fall Risk",
    categories: [
      {
        name: "History of Falling",
        scoringOptions: [
          { rating: "0", description: "No falls" },
          { rating: "25", description: "Has fallen in past 3 months." }
        ]
      },
      {
        name: "Secondary Diagnosis",
        scoringOptions: [
          { rating: "0", description: "Yes" },
          { rating: "15", description: "No" }
        ]
      },
      {
        name: "Ambulatory Aid",
        scoringOptions: [
          { rating: "0", description: "Bed rest/nurse assist" },
          { rating: "15", description: "Crutches/cane/walker" },
          { rating: "25", description: "Clutches furniture or support" }
        ]
      },
      {
        name: "IV Inserted",
        scoringOptions: [
          { rating: "0", description: "Yes" },
          { rating: "20", description: "No" }
        ]
      },
      {
        name: "Gait/Transferring",
        scoringOptions: [
          { rating: "0", description: "Normal/bedrest/immobile" },
          { rating: "10", description: "Weak" },
          { rating: "20", description: "Impaired" }
        ]
      },
      {
        name: "Mental Status",
        scoringOptions: [
          { rating: "0", description: "Oriented to own ability" },
          { rating: "15", description: "Forgets limitations" }
        ]
      }
    ],
    interpretations: [
      { result: "No Risk", range: "0-24", description: "Minimal symptoms" },
      { result: "Low Risk", range: "25-50", description: "Moderate symptoms" },
      { result: "High Risk", range: "≥51", description: "Severe symptoms requiring medical attention" }
    ]
  },
  {
    name: "Braden Scale",
    categories: [
      {
        name: "Sensory Perception",
        scoringOptions: [
          { rating: "1", description: "Completely Limited: Unresponsive to painful stimuli; limited ability to feel pain over most of body." },
          { rating: "2", description: "Very Limited: Responds only to painful stimuli; cannot communicate discomfort except by moaning/restlessness; sensory impairment over half of body." },
          { rating: "3", description: "Slightly Limited: Responds to verbal commands but cannot always communicate discomfort or need to be turned; sensory impairment in 1 or 2 extremities." },
          { rating: "4", description: "No Impairment: Responds to verbal commands; no sensory deficit limiting ability to feel or voice pain/discomfort." },
        ],
      },
      {
        name: "Moisture",
        scoringOptions: [
          { rating: "1", description: "Constantly Moist: Skin kept moist almost constantly by perspiration, urine, etc.; dampness detected every time patient is moved or turned." },
          { rating: "2", description: "Very Moist: Skin is often, but not always, moist; linen must be changed at least once a shift." },
          { rating: "3", description: "Occasionally Moist: Skin is occasionally moist, requiring an extra linen change approximately once a day." },
          { rating: "4", description: "Rarely Moist: Skin is usually dry; linen only requires changing at routine intervals." },
        ],
      },
      {
        name: "Activity",
        scoringOptions: [
          { rating: "1", description: "Bedfast: Confined to bed." },
          { rating: "2", description: "Chairfast: Ability to walk severely limited or non-existent; cannot bear own weight and/or must be assisted into chair/wheelchair." },
          { rating: "3", description: "Walks Occasionally: Walks occasionally during day, but for very short distances, with or without assistance; spends majority of each shift in bed or chair." },
          { rating: "4", description: "Walks Frequently: Walks outside the room at least twice a day and inside room at least once every 2 hours during waking hours." },
        ],
      },
      {
        name: "Mobility",
        scoringOptions: [
          { rating: "1", description: "Completely Immobile: Does not make even slight changes in body or extremity position without assistance." },
          { rating: "2", description: "Very Limited: Makes occasional slight changes in body or extremity position but unable to make frequent or significant changes independently." },
          { rating: "3", description: "Slightly Limited: Makes frequent though slight changes in body or extremity position independently." },
          { rating: "4", description: "No Limitations: Makes major and frequent changes in position without assistance." },
        ],
      },
      {
        name: "Nutrition",
        scoringOptions: [
          { rating: "1", description: "Very Poor: Never eats a complete meal; rarely eats more than 1/3 of any food offered; eats 2 servings or less of protein per day; takes fluids poorly; does not take a liquid dietary supplement; OR is NPO and/or maintained on clear liquids or IVs for more than 5 days." },
          { rating: "2", description: "Probably Inadequate: Rarely eats a complete meal and generally eats only about 1/2 of any food offered; protein intake includes only 3 servings of meat or dairy products per day; occasionally will take a dietary supplement; OR receives less than optimum amount of liquid diet or tube feeding." },
          { rating: "3", description: "Adequate: Eats over half of most meals; eats a total of 4 servings of protein each day; occasionally will refuse a meal, but will usually take a supplement if offered; OR is on a tube feeding or TPN regimen which probably meets most of nutritional needs." },
          { rating: "4", description: "Excellent: Eats most of every meal; never refuses a meal; usually eats a total of 4 or more servings of protein per day; occasionally eats between meals; does not require supplementation." },
        ],
      },
      {
        name: "Friction and Shear",
        scoringOptions: [
          { rating: "1", description: "Problem: Requires moderate to maximum assistance in moving; complete lifting without sliding against sheets is impossible; frequently slides down in bed or chair, requiring frequent repositioning with maximum assistance; spasticity, contractures, or agitation lead to almost constant friction." },
          { rating: "2", description: "Potential Problem: Moves feebly or requires minimum assistance; during a move, skin probably slides to some extent against sheets, chair, restraints, or other devices; maintains relatively good position in chair or bed most of the time but occasionally slides down." },
          { rating: "3", description: "No Apparent Problem: Moves in bed and in chair independently and has sufficient muscle strength to lift up completely during move; maintains good position in bed or chair at all times." },
        ],
      },
    ],
    maxScore: "23", // Max score for Braden Scale is 23
    interpretations: [
      { result: "No Risk", range: "19-23", description: "Patients are unlikely to develop skin breakdown." },
      { result: "Mild Risk", range: "15-18", description: "Patients demonstrate some risk factors for developing bedsores." },
      { result: "Moderate Risk", range: "13-14", description: "Extra attention should be given; consider environmental safety and balance exercises." },
      { result: "High Risk", range: "10-12", description: "Requires additional equipment and frequent repositioning." },
      { result: "Severe Risk", range: "6-9", description: "At very high risk for skin breakdown; frequent monitoring is essential." },
    ]
  },
  {
    name: "PAINAD",
    categories: [
      {
        name: "Breathing (Independent of Vocalization)",
        scoringOptions: [
          { rating: "0", description: "Normal" },
          { rating: "1", description: "Occasional labored breathing, short periods of hyperventilation" },
          { rating: "2", description: "Noisy labored breathing, long periods of hyperventilation, Cheyne-Stokes" },
        ],
      },
      {
        name: "Negative Vocalization",
        scoringOptions: [
          { rating: "0", description: "None" },
          { rating: "1", description: "Occasional moan or groan, low-level speech with a negative or disapproving quality" },
          { rating: "2", description: "Repeated troubled calling out, loud moaning or groaning, crying" },
        ],
      },
      {
        name: "Facial Expression",
        scoringOptions: [
          { rating: "0", description: "Smiling or inexpressive" },
          { rating: "1", description: "Sad, frightened, frown" },
          { rating: "2", description: "Facial grimacing" },
        ],
      },
      {
        name: "Body Language",
        scoringOptions: [
          { rating: "0", description: "Relaxed" },
          { rating: "1", description: "Tense, distressed pacing, fidgeting" },
          { rating: "2", description: "Rigid, fists clenched, knees pulled up or pushing away, striking out" },
        ],
      },
      {
        name: "Consolability",
        scoringOptions: [
          { rating: "0", description: "No need to console" },
          { rating: "1", description: "Distracted or reassured by voice or touch" },
          { rating: "2", description: "Unable to console, distract, or reassure" },
        ],
      },
    ],
    maxScore: "10", // Max score for PAINAD Scale is 10 (5 categories * 2 points/category)
    interpretations: [
      { result: "Mild Pain", range: "1-3", description: "Possible mild discomfort." },
      { result: "Moderate Pain", range: "4-6", description: "Likely moderate pain, consider intervention." },
      { result: "Severe Pain", range: "7-10", description: "Severe pain, requires immediate attention and intervention." },
    ]
  }
];

export const tempFlexSheetData: FlexSheetData[] = [
  {
    "id": "vitalSignsTitle",
    "field": "Vital Signs",
    "componentType": "static",
    "rowType": "titleRow",
    "hideable": false
  },
  {
    "90": "112",
    "10000": "88",
    "id": "hrInput",
    "field": "HR",
    "componentType": "input",
    "normalRange": {
      "low": 60,
      "high": 100
    },
    "hideable": false
  },
  {
    "90": "Monitor",
    "10000": "Radial",
    "id": "hrSourceSelect",
    "field": "HR Source",
    "componentType": "assessmentselect",
    "chartingOptions": [
      {
        "subsetId": "Apical",
        "label": "Apical"
      },
      {
        "subsetId": "Brachial",
        "label": "Brachial"
      },
      {
        "subsetId": "Dorsalis pedis",
        "label": "Dorsalis pedis"
      },
      {
        "subsetId": "Femoral",
        "label": "Femoral"
      },
      {
        "subsetId": "Monitor",
        "label": "Monitor"
      },
      {
        "subsetId": "Popliteal",
        "label": "Popliteal"
      },
      {
        "subsetId": "Radial",
        "label": "Radial"
      }
    ],
    "hideable": false
  },
  {
    "90": "112/68",
    "10000": "124/72",
    "id": "bpInput",
    "field": "BP",
    "componentType": "input",
    "hideable": false
  },
  {
    "90": "Left upper arm",
    "10000": "Left upper arm",
    "id": "bpSourceSelect",
    "field": "BP Source",
    "componentType": "assessmentselect",
    "chartingOptions": [
      {
        "subsetId": "Left upper arm",
        "label": "Left upper arm"
      },
      {
        "subsetId": "Right upper arm",
        "label": "Right upper arm"
      },
      {
        "subsetId": "Left lower arm",
        "label": "Left lower arm"
      },
      {
        "subsetId": "Right lower arm",
        "label": "Right lower arm"
      },
      {
        "subsetId": "Left thigh",
        "label": "Left thigh"
      },
      {
        "subsetId": "Right thigh",
        "label": "Right thigh"
      },
      {
        "subsetId": "Left lower leg",
        "label": "Left lower leg"
      },
      {
        "subsetId": "Right lower leg",
        "label": "Right lower leg"
      },
      {
        "subsetId": "Arterial line",
        "label": "Arterial line"
      },
      {
        "subsetId": "Other",
        "label": "Other"
      }
    ],
    "hideable": false
  },
  {
    "90": "21",
    "10000": "20",
    "id": "rrInput",
    "field": "RR",
    "componentType": "input",
    "normalRange": {
      "low": 12,
      "high": 20
    },
    "hideable": false
  },
  {
    "90": "37.4",
    "10000": "36.8",
    "id": "tempInput",
    "field": "Temp",
    "componentType": "input",
    "normalRange": {
      "low": 36.6,
      "high": 37.2
    },
    "hideable": false
  },
  {
    "90": "Oral",
    "10000": "Oral",
    "id": "tempSourceSelect",
    "field": "Temp Source",
    "componentType": "assessmentselect",
    "chartingOptions": [
      {
        "subsetId": "Oral",
        "label": "Oral"
      },
      {
        "subsetId": "Axillary",
        "label": "Axillary"
      },
      {
        "subsetId": "Rectal",
        "label": "Rectal"
      },
      {
        "subsetId": "Tympanic",
        "label": "Tympanic"
      },
      {
        "subsetId": "Temporal",
        "label": "Temporal"
      },
      {
        "subsetId": "Bladder",
        "label": "Bladder"
      },
      {
        "subsetId": "Other",
        "label": "Other"
      }
    ],
    "hideable": false
  },
  {
    "90": "91",
    "10000": "98",
    "id": "spo2Input",
    "field": "SpO2",
    "componentType": "input",
    "normalRange": {
      "low": 95,
      "high": 100
    },
    "hideable": false
  },
  {
    "90": "2",
    "id": "painInput",
    "field": "Pain",
    "componentType": "input",
    "hideable": false
  },
  {
    "90": "76.4 kg",
    "id": "weightKgInput",
    "field": "Weight (kg)",
    "componentType": "input",
    "hideable": false
  },
  {
    "id": "intakeTitle",
    "field": "Intake",
    "componentType": "static",
    "rowType": "titleRow",
    "hideable": false
  },
  {
    "id": "intakeCheckbox",
    "field": "Intake Fields",
    "componentType": "checkboxlist",
    "assessmentSubsets": [
      {
        "subsetId": "Oral",
        "label": "Oral"
      },
      {
        "subsetId": "Intravenous",
        "label": "Intravenous"
      },
      {
        "subsetId": "Parenteral Nutrition",
        "label": "Parenteral Nutrition"
      },
      {
        "subsetId": "Enteral Nutrition",
        "label": "Enteral Nutrition"
      }
    ],
    "hideable": false
  },
  {
    "id": "oralIntake",
    "field": "Oral",
    "componentType": "input",
    "hideable": true,
    "hideableId": "Oral"
  },
  {
    "id": "ivIntakeInput",
    "field": "Intravenous",
    "componentType": "input",
    "hideable": true,
    "hideableId": "Intravenous"
  },
  {
    "id": "enteralNutritionInput",
    "field": "Enteral Nutrition",
    "componentType": "input",
    "hideable": true,
    "hideableId": "Enteral Nutrition"
  },
  {
    "id": "parenteralNutritionInput",
    "field": "Parenteral Nutrition",
    "componentType": "input",
    "hideable": true,
    "hideableId": "Parenteral Nutrition"
  },
  {
    "id": "outputTitle",
    "field": "Output",
    "componentType": "static",
    "rowType": "titleRow",
    "hideable": false
  },
  {
    "id": "outputCheckbox",
    "field": "Output Fields",
    "componentType": "checkboxlist",
    "assessmentSubsets": [
      {
        "subsetId": "ioUrine",
        "label": "Urine"
      },
      {
        "subsetId": "ioEmesis",
        "label": "Emesis"
      },
      {
        "subsetId": "ioStool",
        "label": "Stool"
      },
      {
        "subsetId": "Wound Drainage",
        "label": "Wound Drainage"
      },
      {
        "subsetId": "Enteral Output",
        "label": "Enteral Output"
      }
    ],
    "hideable": false
  },
  {
    "id": "urineInput",
    "field": "Urine",
    "componentType": "input",
    "hideable": true,
    "hideableId": "ioUrine"
  },
  {
    "id": "emesisInput",
    "field": "Emesis",
    "componentType": "input",
    "hideable": true,
    "hideableId": "ioEmesis"
  },
  {
    "id": "stoolInput",
    "field": "Stool",
    "componentType": "input",
    "hideable": true,
    "hideableId": "ioStool"
  },
  {
    "id": "woundDrainageInput",
    "field": "Wound Drainage",
    "componentType": "input",
    "hideable": true,
    "hideableId": "Wound Drainage"
  },
  {
    "id": "enteralDrainageInput",
    "field": "Enteral Output",
    "componentType": "input",
    "hideable": true,
    "hideableId": "Enteral Output"
  },
  {
    "id": "generalAppearanceTitle",
    "field": "General Appearance",
    "componentType": "static",
    "rowType": "titleRow",
    "wdlDescription": [
      {
        "assessment": "General Appeareance",
        "description": "Patient appears their stated age, A&O × 4, no acute distress and is cooperative."
      },
      {
        "assessment": "Safety",
        "description": "call-light within reach, bed lowest/locked, side‑rails appropriate, room clutter‑free, non-slip socks applied, personal belongings in reach, bed alarm on"
      }
    ],
    "hideable": false
  },
  {
    "id": "generalAppearanceCheckbox",
    "field": "General Appearance",
    "componentType": "checkboxlist",
    "assessmentSubsets": [
      {
        "subsetId": "WDL",
        "label": "WDL"
      },
      {
        "subsetId": "WDL, except:",
        "label": "WDL, except:"
      },
      {
        "subsetId": "Appearance",
        "label": "Appearance"
      },
      {
        "subsetId": "Safety Checks",
        "label": "Safety Checks"
      }
    ],
    "hideable": false
  },
  {
    "id": "appearanceInput",
    "field": "Appearance",
    "componentType": "input",
    "hideable": true,
    "hideableId": "Appearance"
  },
  {
    "id": "safetyCheckInput",
    "field": "Safety Check",
    "componentType": "input",
    "hideable": true,
    "hideableId": "Safety Checks"
  },
  {
    "id": "psychosocialAssessmentTitle",
    "field": "Psychosocial Assessment",
    "componentType": "static",
    "rowType": "titleRow",
    "wdlDescription": [
      {
        "assessment": "Mood & Affect",
        "description": "Appropriate, consistent with situation. Speech coherent, hygiene appropriate, denies suicidal/homicidal ideation."
      }
    ],
    "hideable": false
  },
  {
    "id": "psychosocialStatusCheckbox",
    "field": "Psychosocial Status",
    "componentType": "checkboxlist",
    "assessmentSubsets": [
      {
        "subsetId": "WDL",
        "label": "WDL"
      },
      {
        "subsetId": "WDL, except:",
        "label": "WDL, except:"
      },
      {
        "subsetId": "Mood & Affect",
        "label": "Mood & Affect"
      }
    ],
    "hideable": false
  },
  {
    "id": "moodAffectInput",
    "field": "Mood & Affect",
    "componentType": "input",
    "hideable": true,
    "hideableId": "Mood & Affect"
  },
  {
    "id": "heentAssessmentTitle",
    "field": "HEENT Assessment",
    "componentType": "static",
    "rowType": "titleRow",
    "wdlDescription": [
      {
        "assessment": "Head & Scalp",
        "description": "Normocephalic, no lesions or tenderness"
      },
      {
        "assessment": "Eyes",
        "description": "Conjunctivae pink, sclera white, pupils equal/reactive (PERRLA), follows light/objects"
      },
      {
        "assessment": "Ears",
        "description": "No drainage, gross hearing intact"
      },
      {
        "assessment": "Nose",
        "description": "Nares patent, no drainage, no deformities"
      },
      {
        "assessment": "Mouth & Throat",
        "description": "Mucous membranes pink and moist, no lesions or odor, uvula midline"
      }
    ],
    "hideable": false
  },
  {
    "id": "heentStatusCheckbox",
    "field": "HEENT Status",
    "componentType": "checkboxlist",
    "assessmentSubsets": [
      {
        "subsetId": "WDL",
        "label": "WDL"
      },
      {
        "subsetId": "WDL, except:",
        "label": "WDL, except:"
      },
      {
        "subsetId": "Head & Scalp",
        "label": "Head & Scalp"
      },
      {
        "subsetId": "Eyes",
        "label": "Eyes"
      },
      {
        "subsetId": "Ears",
        "label": "Ears"
      },
      {
        "subsetId": "Nose",
        "label": "Nose"
      },
      {
        "subsetId": "Mouth & Throat",
        "label": "Mouth & Throat"
      }
    ],
    "hideable": false
  },
  {
    "id": "headScalpInput",
    "field": "Head & Scalp",
    "componentType": "input",
    "hideable": true,
    "hideableId": "Head & Scalp"
  },
  {
    "id": "eyesInput",
    "field": "Eyes",
    "componentType": "input",
    "hideable": true,
    "hideableId": "Eyes"
  },
  {
    "id": "earsInput",
    "field": "Ears",
    "componentType": "input",
    "hideable": true,
    "hideableId": "Ears"
  },
  {
    "id": "noseInput",
    "field": "Nose",
    "componentType": "input",
    "hideable": true,
    "hideableId": "Nose"
  },
  {
    "id": "mouthThroatInput",
    "field": "Mouth & Throat",
    "componentType": "input",
    "hideable": true,
    "hideableId": "Mouth & Throat"
  },
  {
    "id": "neurologicalAssessmentTitle",
    "field": "Neurological Assessment",
    "componentType": "static",
    "rowType": "titleRow",
    "wdlDescription": [
      {
        "assessment": "Orientation",
        "description": "Alert and oriented × 4, follows commands."
      },
      {
        "assessment": "Speech",
        "description": "Speech clear and coherent."
      },
      {
        "assessment": "Motor Function",
        "description": "Gross motor functioning intact."
      }
    ],
    "hideable": false
  },
  {
    "id": "neurologicalStatusCheckbox",
    "field": "Neurological Status",
    "componentType": "checkboxlist",
    "assessmentSubsets": [
      {
        "subsetId": "WDL",
        "label": "WDL"
      },
      {
        "subsetId": "WDL, except:",
        "label": "WDL, except:"
      },
      {
        "subsetId": "Orientation",
        "label": "Orientation"
      },
      {
        "subsetId": "Speech",
        "label": "Speech"
      },
      {
        "subsetId": "Motor Function",
        "label": "Motor Function"
      }
    ],
    "hideable": false
  },
  {
    "id": "neurologicalOrientationInput",
    "field": "Orientation",
    "componentType": "input",
    "hideable": true,
    "hideableId": "Orientation"
  },
  {
    "id": "speechInput",
    "field": "Speech",
    "componentType": "input",
    "hideable": true,
    "hideableId": "Speech"
  },
  {
    "id": "motorFunctionInput",
    "field": "Motor Function",
    "componentType": "input",
    "hideable": true,
    "hideableId": "Motor Function"
  },
  {
    "id": "integumentaryAssessmentTitle",
    "field": "Integumentary Assessment",
    "componentType": "static",
    "rowType": "titleRow",
    "wdlDescription": [
      {
        "assessment": "Skin",
        "description": "Warm, dry, intact, uniform color appropriate for race, no rashes or swelling. No signs of inflammation, breakdown, or pressure injury"
      },
      {
        "assessment": "Hair & Skin",
        "description": "Normal distribution; nails smooth; no clubbing or abnormalities, cap refill < 2 seconds"
      },
      {
        "assessment": "Turgor",
        "description": "Brisk recoil."
      }
    ],
    "hideable": false
  },
  {
    "id": "integumentStatusCheckbox",
    "field": "Integument Status",
    "componentType": "checkboxlist",
    "assessmentSubsets": [
      {
        "subsetId": "WDL",
        "label": "WDL"
      },
      {
        "subsetId": "WDL, except:",
        "label": "WDL, except:"
      },
      {
        "subsetId": "Skin",
        "label": "Skin"
      },
      {
        "subsetId": "Hair & Nails",
        "label": "Hair & Nails"
      },
      {
        "subsetId": "Turgor",
        "label": "Turgor"
      },
      {
        "subsetId": "Wound",
        "label": "Wound"
      }
    ],
    "hideable": false
  },
  {
    "id": "skinInput",
    "field": "Skin",
    "componentType": "input",
    "hideable": true,
    "hideableId": "Skin"
  },
  {
    "id": "hairNailsInput",
    "field": "Hair & Nails",
    "componentType": "input",
    "hideable": true,
    "hideableId": "Hair & Nails"
  },
  {
    "id": "turgorInput",
    "field": "Turgor",
    "componentType": "input",
    "hideable": true,
    "hideableId": "Turgor"
  },
  {
    "id": "woundInput",
    "field": "Wound",
    "componentType": "input",
    "hideable": true,
    "hideableId": "Wound"
  },
  {
    "id": "cardiovascularAssessmentTitle",
    "field": "Cardiovascular Assessment",
    "componentType": "static",
    "rowType": "titleRow",
    "wdlDescription": [
      {
        "assessment": "Heart Sounds",
        "description": "Regular rate (60-100 bpm) & rhythm, S1/S2 audible, no murmurs/rubs/gallops."
      },
      {
        "assessment": "Extremities",
        "description": "Pulses 2+ bilaterally (radial, dorsalis pedis), cap refill < 2 seconds, no edema, uniform color."
      },
      {
        "assessment": "Jugular Distention",
        "description": "No venous jugular distention."
      }
    ],
    "hideable": false
  },
  {
    "id": "cardiovascularStatusCheckbox",
    "field": "Cardiovascular Status",
    "componentType": "checkboxlist",
    "assessmentSubsets": [
      {
        "subsetId": "WDL",
        "label": "WDL"
      },
      {
        "subsetId": "WDL, except:",
        "label": "WDL, except:"
      },
      {
        "subsetId": "Heart Sounds",
        "label": "Heart Sounds"
      },
      {
        "subsetId": "Extremities",
        "label": "Extremities"
      },
      {
        "subsetId": "Jugular Distention",
        "label": "Jugular Distention"
      }
    ],
    "hideable": false
  },
  {
    "90": "S1, S2. No mumur noted",
    "id": "heartSoundsInput",
    "field": "Heart Sounds",
    "componentType": "input",
    "hideable": false,
    "hideableId": "Heart Sounds"
  },
  {
    "90": "+2 pitting edema in BLE",
    "id": "extremitiesInput",
    "field": "Extremities",
    "componentType": "input",
    "hideable": false,
    "hideableId": "Extremities"
  },
  {
    "id": "jugularDistentionInput",
    "field": "Jugular Distention",
    "componentType": "input",
    "hideable": true,
    "hideableId": "Jugular Distention"
  },
  {
    "id": "respiratoryAssessmentTitle",
    "field": "Respiratory Assessment",
    "componentType": "static",
    "rowType": "titleRow",
    "wdlDescription": [
      {
        "assessment": "Chest Appearance",
        "description": "Chest expansion symmetric, respirations non-labored, regular rate, no accessory muscle use."
      },
      {
        "assessment": "Lung Sounds",
        "description": "Breath sounds clear bilaterally (anterior/posterior/lateral), no adventitious sounds (crackles, wheezes, rhonchi)."
      }
    ],
    "hideable": false
  },
  {
    "id": "respiratoryStatusCheckbox",
    "field": "Respiratory Status",
    "componentType": "checkboxlist",
    "assessmentSubsets": [
      {
        "subsetId": "WDL",
        "label": "WDL"
      },
      {
        "subsetId": "WDL, except:",
        "label": "WDL, except:"
      },
      {
        "subsetId": "Chest Appearance",
        "label": "Chest Appearance"
      },
      {
        "subsetId": "Lung Sounds",
        "label": "Lung Sounds"
      }
    ],
    "hideable": false
  },
  {
    "id": "chestAppearanceInput",
    "field": "Chest Appearance",
    "componentType": "input",
    "hideable": true,
    "hideableId": "Chest Appearance"
  },
  {
    "90": "Clear",
    "id": "lungSoundsInput",
    "field": "Lung Sounds",
    "componentType": "input",
    "hideable": false,
    "hideableId": "Lung Sounds"
  },
  {
    "id": "giAssessmentTitle",
    "field": "GI Assessment",
    "componentType": "static",
    "rowType": "titleRow",
    "wdlDescription": [
      {
        "assessment": "Abdomen",
        "description": "Soft, non-tender, non-distended. No masses or guarding, no visible scars or lesions."
      },
      {
        "assessment": "Bowel Sounds",
        "description": "Present and active in all four quadrants."
      },
      {
        "assessment": "Nausea",
        "description": "No nausea, vomiting, or diarrhea."
      }
    ],
    "hideable": false
  },
  {
    "id": "giStatusCheckbox",
    "field": "GI Status",
    "componentType": "checkboxlist",
    "assessmentSubsets": [
      {
        "subsetId": "WDL",
        "label": "WDL"
      },
      {
        "subsetId": "WDL, except:",
        "label": "WDL, except:"
      },
      {
        "subsetId": "Abdomen",
        "label": "Abdomen"
      },
      {
        "subsetId": "Bowel Sounds",
        "label": "Bowel Sounds"
      },
      {
        "subsetId": "Nausea",
        "label": "Bowel Sounds"
      }
    ],
    "hideable": false
  },
  {
    "id": "abdomenInput",
    "field": "Abdomen",
    "componentType": "input",
    "hideable": true,
    "hideableId": "Abdomen"
  },
  {
    "id": "bowelSoundsInput",
    "field": "Bowel Sounds",
    "componentType": "input",
    "hideable": true,
    "hideableId": "Bowel Sounds"
  },
  {
    "id": "nauseaInput",
    "field": "Nausea",
    "componentType": "input",
    "hideable": true,
    "hideableId": "Nausea"
  },
  {
    "id": "musculoskeletalAssessmentTitle",
    "field": "Musculoskeletal Assessment",
    "componentType": "static",
    "rowType": "titleRow",
    "wdlDescription": [
      {
        "assessment": "ROM",
        "description": "Full active and passive in all joints, strength 5/5 bilaterally."
      },
      {
        "assessment": "Gait",
        "description": "Gait steady, ambulates independently"
      }
    ],
    "hideable": false
  },
  {
    "id": "musculoskeletalStatusCheckbox",
    "field": "Musculoskeletal Status",
    "componentType": "checkboxlist",
    "assessmentSubsets": [
      {
        "subsetId": "WDL",
        "label": "WDL"
      },
      {
        "subsetId": "WDL, except:",
        "label": "WDL, except:"
      },
      {
        "subsetId": "Extremity ROM",
        "label": "Extremity ROM"
      },
      {
        "subsetId": "Gait",
        "label": "Gait"
      }
    ],
    "hideable": false
  },
  {
    "id": "extremityRomInput",
    "field": "Extremity ROM",
    "componentType": "input",
    "hideable": true,
    "hideableId": "Extremity ROM"
  },
  {
    "id": "musculoskeletalGaitInput",
    "field": "Gait",
    "componentType": "input",
    "hideable": true,
    "hideableId": "Gait"
  },
  {
    "id": "genitourinaryAssessmentTitle",
    "field": "Genitourinary Assessment",
    "componentType": "static",
    "rowType": "titleRow",
    "wdlDescription": [
      {
        "assessment": "Voiding",
        "description": "Without pain, burning, or urgency. No new incontinence."
      },
      {
        "assessment": "Urine",
        "description": "Clear, yellow, absent of odor."
      }
    ],
    "hideable": false
  },
  {
    "id": "genitourinaryStatusCheckbox",
    "field": "Genitourinary Status",
    "componentType": "checkboxlist",
    "assessmentSubsets": [
      {
        "subsetId": "WDL",
        "label": "WDL"
      },
      {
        "subsetId": "WDL, except:",
        "label": "WDL, except:"
      },
      {
        "subsetId": "Voiding",
        "label": "Voiding"
      },
      {
        "subsetId": "Urine",
        "label": "Urine"
      }
    ],
    "hideable": false
  },
  {
    "id": "voidingInput",
    "field": "Voiding",
    "componentType": "input",
    "hideable": true,
    "hideableId": "Voiding"
  },
  {
    "id": "urineInput",
    "field": "Urine",
    "componentType": "input",
    "hideable": true,
    "hideableId": "Urine"
  },
  {
    "id": "ivAssessmentTitle",
    "field": "IV Assessment",
    "componentType": "static",
    "rowType": "titleRow",
    "hideable": false
  },
  {
    "id": "ivSiteInput",
    "field": "IV Site",
    "componentType": "input",
    "hideable": false
  },
  {
    "id": "ivTypeInput",
    "field": "IV Type",
    "componentType": "input",
    "hideable": false
  },
  {
    "id": "ivLocationInput",
    "field": "IV Location",
    "componentType": "input",
    "hideable": false
  },
  {
    "id": "nursingCareTitle",
    "field": "Nursing Care",
    "componentType": "static",
    "rowType": "titleRow",
    "hideable": false
  },
  {
    "id": "nursingCareProvidedInput",
    "field": "Nursing Care Provided",
    "componentType": "input",
    "hideable": false
  },
  {
    "id": "assessmentToolsTitle",
    "field": "Assessment Tools",
    "componentType": "static",
    "rowType": "titleRow",
    "hideable": false
  },
  {
    "id": "additionalToolsCheckbox",
    "field": "Additional Tools",
    "componentType": "checkboxlist",
    "assessmentSubsets": [
      {
        "subsetId": "CIWA-Ar",
        "label": "CIWA-Ar"
      },
      {
        "subsetId": "Morse Fall Risk",
        "label": "Morse Fall Risk"
      },
      {
        "subsetId": "Braden Scale",
        "label": "Braden Scale"
      },
      {
        "subsetId": "PAINAD",
        "label": "PAINAD"
      }
    ],
    "hideable": false
  },
  {
    "id": "ciwaArSectionTitle",
    "field": "CIWA-Ar",
    "componentType": "static",
    "rowType": "titleRow",
    "hideable": true,
    "hideableId": "CIWA-Ar"
  },
  {
    "id": "ciwaArNauseaVomitingSelect",
    "field": "Nausea & Vomiting",
    "componentType": "assessmentselect",
    "chartingOptions": [
      {
        "subsetId": "0",
        "label": "0 - No nausea or vomitting"
      },
      {
        "subsetId": "1",
        "label": "1 - Mild nausea with no vomiting"
      },
      {
        "subsetId": "2",
        "label": "2"
      },
      {
        "subsetId": "3",
        "label": "3"
      },
      {
        "subsetId": "4",
        "label": "4 - Intermittent nausea with no vomiting"
      },
      {
        "subsetId": "5",
        "label": "5"
      },
      {
        "subsetId": "6",
        "label": "6"
      },
      {
        "subsetId": "7",
        "label": "7 - Constant nausea, frequent dry heaves and vomiting"
      }
    ],
    "hideable": true,
    "hideableId": "CIWA-Ar",
    "toolName": "CIWA-Ar"
  },
  {
    "id": "ciwaArTremorSelect",
    "field": "Tremor",
    "componentType": "assessmentselect",
    "chartingOptions": [
      {
        "subsetId": "0",
        "label": "0 - No tremor"
      },
      {
        "subsetId": "1",
        "label": "1 - Not visible, but can be felt fingertip to fingertip"
      },
      {
        "subsetId": "2",
        "label": "2"
      },
      {
        "subsetId": "3",
        "label": "3"
      },
      {
        "subsetId": "4",
        "label": "4 - Moderate, with patient's arms extended"
      },
      {
        "subsetId": "5",
        "label": "5"
      },
      {
        "subsetId": "6",
        "label": "6"
      },
      {
        "subsetId": "7",
        "label": "7 - Severe, even with arms not extended"
      }
    ],
    "hideable": true,
    "hideableId": "CIWA-Ar",
    "toolName": "CIWA-Ar"
  },
  {
    "id": "ciwaArParoxysmalSweatsSelect",
    "field": "Paroxysmal Sweats",
    "componentType": "assessmentselect",
    "chartingOptions": [
      {
        "subsetId": "0",
        "label": "0 - No sweat visible"
      },
      {
        "subsetId": "1",
        "label": "1 - Barely perceptible sweating, palms moist"
      },
      {
        "subsetId": "2",
        "label": "2"
      },
      {
        "subsetId": "3",
        "label": "3"
      },
      {
        "subsetId": "4",
        "label": "4 - Beads of sweat obvious on forehead"
      },
      {
        "subsetId": "5",
        "label": "5"
      },
      {
        "subsetId": "6",
        "label": "6"
      },
      {
        "subsetId": "7",
        "label": "7 - Drenching sweats"
      }
    ],
    "hideable": true,
    "hideableId": "CIWA-Ar",
    "toolName": "CIWA-Ar"
  },
  {
    "id": "ciwaArAnxietySelect",
    "field": "Anxiety",
    "componentType": "assessmentselect",
    "chartingOptions": [
      {
        "subsetId": "0",
        "label": "0 - No anxiety, at ease"
      },
      {
        "subsetId": "1",
        "label": "1 - Mildly anxious"
      },
      {
        "subsetId": "2",
        "label": "2"
      },
      {
        "subsetId": "3",
        "label": "3"
      },
      {
        "subsetId": "4",
        "label": "4 - Moderately anxious, or guarded, so anxiety is inferred"
      },
      {
        "subsetId": "5",
        "label": "5"
      },
      {
        "subsetId": "6",
        "label": "6"
      },
      {
        "subsetId": "7",
        "label": "7 - Equivalent to acute panic states"
      }
    ],
    "hideable": true,
    "hideableId": "CIWA-Ar",
    "toolName": "CIWA-Ar"
  },
  {
    "id": "ciwaArAgitationSelect",
    "field": "Agitation",
    "componentType": "assessmentselect",
    "chartingOptions": [
      {
        "subsetId": "0",
        "label": "0 - Normal activity"
      },
      {
        "subsetId": "1",
        "label": "1 - Somewhat more than normal activity"
      },
      {
        "subsetId": "2",
        "label": "2"
      },
      {
        "subsetId": "3",
        "label": "3"
      },
      {
        "subsetId": "4",
        "label": "4  - Moderately fidgety and restless"
      },
      {
        "subsetId": "5",
        "label": "5"
      },
      {
        "subsetId": "6",
        "label": "6"
      },
      {
        "subsetId": "7",
        "label": "7 - Paces back and forth during most of the interview, or constantly thrashes about"
      }
    ],
    "hideable": true,
    "hideableId": "CIWA-Ar",
    "toolName": "CIWA-Ar"
  },
  {
    "id": "ciwaArTactileDisturbancesSelect",
    "field": "Tactile Disturbances",
    "componentType": "assessmentselect",
    "chartingOptions": [
      {
        "subsetId": "0",
        "label": "0 - None"
      },
      {
        "subsetId": "1",
        "label": "1 - Very mild itching, pins and needles, burning, or numbness"
      },
      {
        "subsetId": "2",
        "label": "2 - Mild itching, pins and needles, burning, or numbness"
      },
      {
        "subsetId": "3",
        "label": "3 - Moderate itching, pins and needles, burning, or numbness"
      },
      {
        "subsetId": "4",
        "label": "4 - Moderately severe hallucinations"
      },
      {
        "subsetId": "5",
        "label": "5 - Severe hallucinations"
      },
      {
        "subsetId": "6",
        "label": "6 - Extremely severe hallucinations"
      },
      {
        "subsetId": "7",
        "label": "7 - Continuous hallucinations"
      }
    ],
    "hideable": true,
    "hideableId": "CIWA-Ar",
    "toolName": "CIWA-Ar"
  },
  {
    "id": "ciwaArVisualDisturbancesSelect",
    "field": "Visual Disturbances",
    "componentType": "assessmentselect",
    "chartingOptions": [
      {
        "subsetId": "0",
        "label": "0 - Not present"
      },
      {
        "subsetId": "1",
        "label": "1 - Very mild sensitivity"
      },
      {
        "subsetId": "2",
        "label": "2"
      },
      {
        "subsetId": "3",
        "label": "3"
      },
      {
        "subsetId": "4",
        "label": "4 - Moderately severe hallucinations"
      },
      {
        "subsetId": "5",
        "label": "5"
      },
      {
        "subsetId": "6",
        "label": "6"
      },
      {
        "subsetId": "7",
        "label": "7 - Continuous hallucinations"
      }
    ],
    "hideable": true,
    "hideableId": "CIWA-Ar",
    "toolName": "CIWA-Ar"
  },
  {
    "id": "ciwaArHeadacheSelect",
    "field": "Headache",
    "componentType": "assessmentselect",
    "chartingOptions": [
      {
        "subsetId": "0",
        "label": "0 - Not Present"
      },
      {
        "subsetId": "1",
        "label": "1 - Very mild"
      },
      {
        "subsetId": "2",
        "label": "2"
      },
      {
        "subsetId": "3",
        "label": "3"
      },
      {
        "subsetId": "4",
        "label": "4 - Moderately severe"
      },
      {
        "subsetId": "5",
        "label": "5"
      },
      {
        "subsetId": "6",
        "label": "6"
      },
      {
        "subsetId": "7",
        "label": "7 - Extremely severe"
      }
    ],
    "hideable": true,
    "hideableId": "CIWA-Ar",
    "toolName": "CIWA-Ar"
  },
  {
    "id": "ciwaArOrientationSelect",
    "field": "Orientation",
    "componentType": "assessmentselect",
    "chartingOptions": [
      {
        "subsetId": "0",
        "label": "0 - Oriented, can do serial additions"
      },
      {
        "subsetId": "1",
        "label": "1 - Cannot do serial additions or is uncertain about date"
      },
      {
        "subsetId": "2",
        "label": "2 - Disoriented for date by no more than 2 calendar days"
      },
      {
        "subsetId": "3",
        "label": "3 - Disoriented for date by more than 2 calendar days"
      },
      {
        "subsetId": "4",
        "label": "4 - Disoriented to place or person"
      }
    ],
    "hideable": true,
    "hideableId": "CIWA-Ar",
    "toolName": "CIWA-Ar"
  },
  {
    "id": "morseFallRiskTitle",
    "field": "Morse Fall Risk",
    "componentType": "static",
    "rowType": "titleRow",
    "hideable": true,
    "hideableId": "Morse Fall Risk"
  },
  {
    "id": "morseHistoryOfFallingSelect",
    "field": "History of Falling",
    "componentType": "assessmentselect",
    "chartingOptions": [
      {
        "subsetId": "0",
        "label": "0 - No falls"
      },
      {
        "subsetId": "25",
        "label": "25 - Has fallen within 3 months"
      }
    ],
    "hideable": true,
    "hideableId": "Morse Fall Risk",
    "toolName": "Morse Fall Risk"
  },
  {
    "id": "morseSecondaryDiagnosisSelect",
    "field": "Secondary Diagnosis",
    "componentType": "assessmentselect",
    "chartingOptions": [
      {
        "subsetId": "0",
        "label": "0 - No"
      },
      {
        "subsetId": "15",
        "label": "15 - Yes"
      }
    ],
    "hideable": true,
    "hideableId": "Morse Fall Risk",
    "toolName": "Morse Fall Risk"
  },
  {
    "id": "morseAmbulatoryAidSelect",
    "field": "Ambulatory Aid",
    "componentType": "assessmentselect",
    "chartingOptions": [
      {
        "subsetId": "0",
        "label": "0 - Bedrest/nurse assist"
      },
      {
        "subsetId": "15",
        "label": "15 - Crutches/cane/walker"
      },
      {
        "subsetId": "25",
        "label": "25 - Clutches furniture or support"
      }
    ],
    "hideable": true,
    "hideableId": "Morse Fall Risk",
    "toolName": "Morse Fall Risk"
  },
  {
    "id": "morseIvTherapySelect",
    "field": "IV Therapy/Heparin Lock",
    "componentType": "assessmentselect",
    "chartingOptions": [
      {
        "subsetId": "0",
        "label": "0 - No"
      },
      {
        "subsetId": "20",
        "label": "20 - Yes"
      }
    ],
    "hideable": true,
    "hideableId": "Morse Fall Risk",
    "toolName": "Morse Fall Risk"
  },
  {
    "id": "morseGaitSelect",
    "field": "Gait",
    "componentType": "assessmentselect",
    "chartingOptions": [
      {
        "subsetId": "0",
        "label": "0 - Normal/Bedrest/Wheelchair"
      },
      {
        "subsetId": "10",
        "label": "10 - Weak"
      },
      {
        "subsetId": "20",
        "label": "20 - Impaired"
      }
    ],
    "hideable": true,
    "hideableId": "Morse Fall Risk",
    "toolName": "Morse Fall Risk"
  },
  {
    "id": "morseMentalStatusSelect",
    "field": "Mental Status",
    "componentType": "assessmentselect",
    "chartingOptions": [
      {
        "subsetId": "0",
        "label": "0 - Oriented to own abilities"
      },
      {
        "subsetId": "15",
        "label": "15 - Overestimates or forgets limitations"
      }
    ],
    "hideable": true,
    "hideableId": "Morse Fall Risk",
    "toolName": "Morse Fall Risk"
  },
  {
    "id": "bradenScaleTitle",
    "field": "Braden Scale",
    "componentType": "static",
    "rowType": "titleRow",
    "hideable": true,
    "hideableId": "Braden Scale"
  },
  {
    "id": "bradenSensoryPerceptionSelect",
    "field": "Sensory Perception",
    "componentType": "assessmentselect",
    "chartingOptions": [
      {
        "subsetId": "1",
        "label": "1 - Completely Limited"
      },
      {
        "subsetId": "2",
        "label": "2 - Very Limited"
      },
      {
        "subsetId": "3",
        "label": "3 - Slightly Limited"
      },
      {
        "subsetId": "4",
        "label": "4 - No Impairment"
      }
    ],
    "hideable": true,
    "hideableId": "Braden Scale",
    "toolName": "Braden Scale"
  },
  {
    "id": "bradenMoistureSelect",
    "field": "Moisture",
    "componentType": "assessmentselect",
    "chartingOptions": [
      {
        "subsetId": "1",
        "label": "1 - Constantly Moist"
      },
      {
        "subsetId": "2",
        "label": "2 - Very Moist"
      },
      {
        "subsetId": "3",
        "label": "3 - Occasionally Moist"
      },
      {
        "subsetId": "4",
        "label": "4 - Rarely Moist"
      }
    ],
    "hideable": true,
    "hideableId": "Braden Scale",
    "toolName": "Braden Scale"
  },
  {
    "id": "bradenActivitySelect",
    "field": "Activity",
    "componentType": "assessmentselect",
    "chartingOptions": [
      {
        "subsetId": "1",
        "label": "1 - Bedfast"
      },
      {
        "subsetId": "2",
        "label": "2 - Chairfast"
      },
      {
        "subsetId": "3",
        "label": "3 - Walks Occasionally."
      },
      {
        "subsetId": "4",
        "label": "4 - Walks Frequently"
      }
    ],
    "hideable": true,
    "hideableId": "Braden Scale",
    "toolName": "Braden Scale"
  },
  {
    "id": "bradenMobilitySelect",
    "field": "Mobility",
    "componentType": "assessmentselect",
    "chartingOptions": [
      {
        "subsetId": "1",
        "label": "1 - Completely Immobile"
      },
      {
        "subsetId": "2",
        "label": "2 - Very Limited"
      },
      {
        "subsetId": "3",
        "label": "3 - Slightly Limited"
      },
      {
        "subsetId": "4",
        "label": "4 - No Limitations"
      }
    ],
    "hideable": true,
    "hideableId": "Braden Scale",
    "toolName": "Braden Scale"
  },
  {
    "id": "bradenNutritionSelect",
    "field": "Nutrition",
    "componentType": "assessmentselect",
    "chartingOptions": [
      {
        "subsetId": "1",
        "label": "1 - Very Poor"
      },
      {
        "subsetId": "2",
        "label": "2 - Probably Inadequate"
      },
      {
        "subsetId": "3",
        "label": "3 - Adequate"
      },
      {
        "subsetId": "4",
        "label": "4 - Excellent"
      }
    ],
    "hideable": true,
    "hideableId": "Braden Scale",
    "toolName": "Braden Scale"
  },
  {
    "id": "bradenFrictionAndShearSelect",
    "field": "Friction and Shear",
    "componentType": "assessmentselect",
    "chartingOptions": [
      {
        "subsetId": "1",
        "label": "1 - Problem"
      },
      {
        "subsetId": "2",
        "label": "2 - Potential Problem"
      },
      {
        "subsetId": "3",
        "label": "3 - No Apparent Problem"
      }
    ],
    "hideable": true,
    "hideableId": "Braden Scale",
    "toolName": "Braden Scale"
  },
  {
    "id": "painadTitle",
    "field": "PAINAD",
    "componentType": "static",
    "rowType": "titleRow",
    "hideable": true,
    "hideableId": "PAINAD"
  },
  {
    "id": "painadBreathingSelect",
    "field": "Breathing (Independent of Vocalization)",
    "componentType": "assessmentselect",
    "chartingOptions": [
      {
        "subsetId": "0",
        "label": "0 - Normal"
      },
      {
        "subsetId": "1",
        "label": "1 - Occasional labored breathing, short periods of hyperventilation"
      },
      {
        "subsetId": "2",
        "label": "2 - Noisy labored breathing, long periods of hyperventilation, Cheyne-Stokes"
      }
    ],
    "hideable": true,
    "hideableId": "PAINAD",
    "toolName": "PAINAD"
  },
  {
    "id": "painadNegativeVocalizationSelect",
    "field": "Negative Vocalization",
    "componentType": "assessmentselect",
    "chartingOptions": [
      {
        "subsetId": "0",
        "label": "0 - None"
      },
      {
        "subsetId": "1",
        "label": "1 - Occasional moan or groan, low-level speech with a negative or disapproving quality"
      },
      {
        "subsetId": "2",
        "label": "2 - Repeated troubled calling out, loud moaning or groaning, crying"
      }
    ],
    "hideable": true,
    "hideableId": "PAINAD",
    "toolName": "PAINAD"
  },
  {
    "id": "painadFacialExpressionSelect",
    "field": "Facial Expression",
    "componentType": "assessmentselect",
    "chartingOptions": [
      {
        "subsetId": "0",
        "label": "0 - Smiling or inexpressive"
      },
      {
        "subsetId": "1",
        "label": "1 - Sad, frightened, frown"
      },
      {
        "subsetId": "2",
        "label": "2 - Facial grimacing"
      }
    ],
    "hideable": true,
    "hideableId": "PAINAD",
    "toolName": "PAINAD"
  },
  {
    "id": "painadBodyLanguageSelect",
    "field": "Body Language",
    "componentType": "assessmentselect",
    "chartingOptions": [
      {
        "subsetId": "0",
        "label": "0 - Relaxed"
      },
      {
        "subsetId": "1",
        "label": "1 - Tense, distressed pacing, fidgeting"
      },
      {
        "subsetId": "2",
        "label": "2 - Rigid, fists clenched, knees pulled up or pushing away, striking out"
      }
    ],
    "hideable": true,
    "hideableId": "PAINAD",
    "toolName": "PAINAD"
  },
  {
    "id": "painadConsolabilitySelect",
    "field": "Consolability",
    "componentType": "assessmentselect",
    "chartingOptions": [
      {
        "subsetId": "0",
        "label": "0 - No need to console"
      },
      {
        "subsetId": "1",
        "label": "1 - Distracted or reassured by voice or touch"
      },
      {
        "subsetId": "2",
        "label": "2 - Unable to console, distract, or reassure"
      }
    ],
    "hideable": true,
    "hideableId": "PAINAD",
    "toolName": "PAINAD"
  }
]