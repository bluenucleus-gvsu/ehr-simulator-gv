import { FlexSheetData } from "@/lib/flexSheet/flexSheetTypes";
import { Database } from "@/../database.types";

export type FlexSheetSection = Database['public']['Enums']['flexsheet_section_type'];

export const FlexSheetSection = {
  VITALS: "vitals",
  VITALS_OVERVIEW: 'vitals_overview',
  INPUT: "input",
  OUTPUT: "output",
  QBL: "quantified_blood_loss",
  BASE_PAIN: "base_pain",
  FACES_PAIN: "faces_pain",
  GENERAL_APPEARANCE: 'general_appearance',
  PSYCHOSOCIAL: 'psychosocial',
  HEENT: 'heent',
  NEURO: 'neuro',
  INTEGUMENT: 'integument',
  CARDIAC: 'cardiac',
  RESPIRATORY: 'respiratory',
  WOUND: "wound",
  GI: 'gi',
  MUSCULOSKELETAL: "musculoskeletal",
  GENTIOURINARY: "genitourinary",
  REPRODUCTIVE: "reproductive",
  FETAL: "fetal",
  IV_1: "iv_1",
  IV_2: "iv_2",
  NURSING_CARE: "nursing_care",
  BRADEN: "braden",
  CIWA: "ciwa",
  MORSE: "morse",
  PAINAD: "painad",
  PHQ9: 'phq9',
  CSSRS: 'cssrs'
} as const;

export type FlexSheetSections = Record<FlexSheetSection, readonly FlexSheetData[]>;

export const vitalSignOverviewRows: readonly FlexSheetData[] = [
  {
    id: "hr",
    field: "HR",
    componentType: "input",
    normalRange: { low: 60, high: 100 }
  },
  {
    id: "bp",
    field: "BP",
    componentType: "input"
  },
  {
    id: "mean_arterial_pressure",
    field: "MAP",
    componentType: "input"
  },
  {
    id: "rr",
    field: "RR",
    componentType: "input",
    normalRange: { low: 12, high: 20 }
  },
  {
    id: "temp",
    field: "Temp (°C)",
    componentType: "input",
    normalRange: { low: 36.6, high: 38 }
  },
  {
    id: "spo2",
    field: "SpO2 (%)",
    componentType: "input",
    normalRange: { low: 95, high: 100 }
  },
  {
    id: "weight_kg",
    field: "Weight (kg)",
    componentType: "input",
  }
];

export const vitalSignRows: readonly FlexSheetData[] = [
  {
    id: "vitalSignsTitle",
    field: "Vital Signs",
    componentType: "static",
    rowType: "titleRow"
  },
  {
    id: "hr",
    field: "HR",
    componentType: "input",
    normalRange: { low: 60, high: 100 }
  },
  {
    id: "hr_source",
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
    id: "bp",
    field: "BP",
    componentType: "input"
  },
  {
    id: "bp_source",
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
    id: "bp_position",
    field: "BP Position",
    componentType: "assessmentselect",
    chartingOptions: [
      { subsetId: "Sitting", label: "Sitting" },
      { subsetId: "Semifowler's", label: "Semifowler's" },
      { subsetId: "Standing", label: "Standing" },
      { subsetId: "Supine", label: "Supine" },
      { subsetId: "Prone", label: "Prone" },
    ],
  },
  {
    id: "mean_arterial_pressure",
    field: "MAP",
    componentType: "input"
  },
  {
    id: "rr",
    field: "RR",
    componentType: "input",
    normalRange: { low: 12, high: 20 }
  },
  {
    id: "temp",
    field: "Temp (°C)",
    componentType: "input",
    normalRange: { low: 36.6, high: 38 }
  },
  {
    id: "temp_source",
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
    id: "spo2",
    field: "SpO2 (%)",
    componentType: "input",
    normalRange: { low: 95, high: 100 }
  },
  {
    id: "oxygen_device",
    field: "Oxygen Device",
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
    id: 'supplemental_o2_rate',
    field: "Supplemental O2 Rate (Lpm)",
    componentType: "input",
  },
  {
    id: "weight_kg",
    field: "Weight (kg)",
    componentType: "input",
  }
];

export const inputRows: readonly FlexSheetData[] = [
  {
    id: "intakeTitle",
    field: "Intake",
    componentType: "static",
    rowType: "titleRow",
  },
  {
    id: "intake_selections",
    field: "Intake Fields",
    componentType: "checkboxlist",
    assessmentSubsets: [
      { subsetId: "oral_intake_ml", label: "Oral" },
      { subsetId: "iv_intake_ml", label: "Intravenous" },
      { subsetId: "enteral_intake_ml", label: "Parenteral Nutrition" },
      { subsetId: "parenteral_intake_ml", label: "Enteral Nutrition" },
    ]
  },
  {
    id: "oral_intake_ml",
    field: "Oral (mL)",
    componentType: "input",
    hideable: true,
  },
  {
    id: "iv_intake_ml",
    field: "Intravenous (mL)",
    componentType: "input",
    hideable: true,
  },
  {
    id: "enteral_intake_ml",
    field: "Enteral Nutrition (mL)",
    componentType: "input",
    hideable: true,
  },
  {
    id: "parenteral_intake_ml",
    field: "Parenteral Nutrition (mL)",
    componentType: "input",
    hideable: true,
  }
]

const outputRows: readonly FlexSheetData[] = [
  {
    id: "outputTitle",
    field: "Output",
    componentType: "static",
    rowType: "titleRow",
  },
  {
    id: "output_selections",
    field: "Output Fields",
    componentType: "checkboxlist",
    assessmentSubsets: [
      { subsetId: "urine_output_ml", label: "Urine" },
      { subsetId: "urine_occurrence", label: "Urine Occurrence" },
      { subsetId: "emesis_output_ml", label: "Emesis" },
      { subsetId: "emesis_occurrence", label: "Emesis Occurrence" },
      { subsetId: "stool_output_ml", label: "Stool" },
      { subsetId: "stool_occurrence", label: "Stool Occurrence" },
      { subsetId: "wound_output_ml", label: "Wound Drainage" },
      { subsetId: "enteral_output_ml", label: "Enteral Output" },
    ]
  },
  {
    id: "urine_output_ml",
    field: "Urine (mL)",
    componentType: "input",
    hideable: true,
  },
  {
    id: "urine_occurrence",
    field: "Urine Occurrence",
    componentType: "input",
    hideable: true,
  },
  {
    id: "emesis_output_ml",
    field: "Emesis (mL)",
    componentType: "input",
    hideable: true,
  },
  {
    id: "emesis_occurrence",
    field: "Emesis Occurrence",
    componentType: "input",
    hideable: true,
  },
  {
    id: "stool_output_ml",
    field: "Stool (mL)",
    componentType: "input",
    hideable: true,
  },
  {
    id: "stool_occurrence",
    field: "Stool Occurrence",
    componentType: "input",
    hideable: true,
  },
  {
    id: "wound_output_ml",
    field: "Wound Drainage (mL)",
    componentType: "input",
    hideable: true,
  },
  {
    id: "enteral_output_ml",
    field: "Enteral Output",
    componentType: "input",
    hideable: true,
  }
];

const basePainRows: readonly FlexSheetData[] = [
  {
    id: "painTitle",
    field: "Pain",
    componentType: "static",
    rowType: "titleRow",
  },
  {
    id: "pain_numeric_scale",
    field: "Numeric Rating",
    componentType: "input",
  },
  {
    id: "pain_location",
    field: "Location",
    componentType: "input",
  },
  {
    id: "pain_characteristics",
    field: "Characteristics",
    componentType: "input",
  },
  {
    id: "pain_alleviating_factors",
    field: "Alleviating Factors",
    componentType: "input",
  },
  {
    id: "pain_aggravating_factors",
    field: "Aggravating Factors",
    componentType: "input",
  },
  {
    id: "pain_interventions",
    field: "Interventions",
    componentType: "input",
  }
]

const facesPainRows: readonly FlexSheetData[] = [
  {
    id: "faces_pain_scale",
    field: "Faces Pain Scale",
    componentType: "assessmentselect",
    chartingOptions: [
      { subsetId: "0", label: "0" },
      { subsetId: "2", label: "2" },
      { subsetId: "4", label: "4" },
      { subsetId: "6", label: "6" },
      { subsetId: "8", label: "8" },
      { subsetId: "10", label: "10" },
    ]
  }
]

const generalAppearanceRows: readonly FlexSheetData[] = [
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
    id: "general_appearance_selections",
    field: "General Appearance",
    componentType: "checkboxlist",
    assessmentSubsets: [
      { subsetId: "WDL", label: "WDL" },
      { subsetId: "WDL_except:", label: "WDL, except:" },
      { subsetId: "appearance", label: "Appearance" },
      { subsetId: "safety_check", label: "Safety Checks" },
    ]
  },
  {
    id: "appearance",
    field: "Appearance",
    componentType: "input",
    hideable: true,
  },
  {
    id: "safety_check",
    field: "Safety Check",
    componentType: "input",
    hideable: true,
  }
];

const psychosocialRows: readonly FlexSheetData[] = [
  {
    id: "psychosocialAssessmentTitle",
    field: "Psychosocial Assessment",
    componentType: "static",
    rowType: "titleRow",
    wdlDescription: [
      {
        assessment: "Mental Status",
        description: "Patient is awake, responsive, communicative, and socially appropriate, functioning within normal cognitive and emotional parameters."
      },
      {
        assessment: "Mood & Affect",
        description: "Appropriate, consistent with situation. Speech coherent, hygiene appropriate, denies suicidal/homicidal ideation."
      }
    ]

  },
  {
    id: "psychosocial_selections",
    field: "Psychosocial Status",
    componentType: "checkboxlist",
    assessmentSubsets: [
      { subsetId: "WDL", label: "WDL" },
      { subsetId: "WDL_except:", label: "WDL, except:" },
      { subsetId: "mood_and_affect", label: "Mood & Affect" },
      { subsetId: "mental_status", label: "Mental Status" },

    ]
  },
  {
    id: "mental_status",
    field: "Mental Status",
    componentType: "input",
    hideable: true,
  },
  {
    id: "mood_and_affect",
    field: "Mood & Affect",
    componentType: "input",
    hideable: true,
  },
];

const heentRows: readonly FlexSheetData[] = [
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
    id: "heent_selections",
    field: "HEENT Status",
    componentType: "checkboxlist",
    assessmentSubsets: [
      { subsetId: "WDL", label: "WDL" },
      { subsetId: "WDL_except:", label: "WDL, except:" },
      { subsetId: "head_and_scalp", label: "Head & Scalp" },
      { subsetId: "eyes", label: "Eyes" },
      { subsetId: "ears", label: "Ears" },
      { subsetId: "nose", label: "Nose" },
      { subsetId: "mouth_and_throat", label: "Mouth & Throat" },
    ]
  },
  {
    id: "head_and_scalp",
    field: "Head & Scalp",
    componentType: "input",
    hideable: true,
  },
  {
    id: "eyes",
    field: "Eyes",
    componentType: "input",
    hideable: true,
  },
  {
    id: "ears",
    field: "Ears",
    componentType: "input",
    hideable: true,
  },
  {
    id: "nose",
    field: "Nose",
    componentType: "input",
    hideable: true,
  },
  {
    id: "mouth_and_throat",
    field: "Mouth & Throat",
    componentType: "input",
    hideable: true,
  }
];

const neuroRows: readonly FlexSheetData[] = [
  {
    id: "neurologicalAssessmentTitle",
    field: "Neurological Assessment",
    componentType: "static",
    rowType: "titleRow",
    wdlDescription: [
      { assessment: "Level of Consciousness", description: "Patient is fully conscious and attentive. Exhibits purposeful interaction and follows complex commands without delay." },
      { assessment: "Orientation", description: "Alert and oriented × 4, follows commands." },
      { assessment: "Pupils", description: "Pupils are Equal, Round, and Reactive to Light and Accommodation (PERRLA)." },
      { assessment: "Speech", description: "Speech clear and coherent." },
      { assessment: "Sensation", description: "Sensation is intact and symmetrical to light touch, pain, and temperature across all extremitites." },
      { assessment: "Motor Function", description: "Gross motor functioning intact." }
    ]
  },
  {
    id: "neuro_selections",
    field: "Neurological Status",
    componentType: "checkboxlist",
    assessmentSubsets: [
      { subsetId: "WDL", label: "WDL" },
      { subsetId: "WDL_except:", label: "WDL, except:" },
      { subsetId: "level_of_consciousness", label: "Level of Consciousness" },
      { subsetId: "orientation", label: "Orientation" },
      { subsetId: "pupils", label: "Pupils" },
      { subsetId: "speech", label: "Speech" },
      { subsetId: "neuro_sensation", label: "Sensation" },
      { subsetId: "motor_function", label: "Motor Function" }
    ]
  },
  {
    id: "level_of_consciousness",
    field: "Level of Consciousness",
    componentType: "assessmentselect",
    hideable: true,
    chartingOptions: [
      { subsetId: "Alert", label: "Alert" },
      { subsetId: "Lethargic", label: "Lethargic" },
      { subsetId: "Obtunded", label: "Obtunded" },
      { subsetId: "Stuporous", label: "Stuporous" },
      { subsetId: "Comatose", label: "Comatose" },
    ],
  },
  {
    id: "orientation",
    field: "Orientation",
    componentType: "input",
    hideable: true,
  },
  {
    id: "pupils",
    field: "Pupils",
    componentType: "input",
    hideable: true,
  },
  {
    id: "speech",
    field: "Speech",
    componentType: "input",
    hideable: true,
  },
  {
    id: "neuro_sensation",
    field: "Sensation",
    componentType: "input",
    hideable: true,
  },
  {
    id: "motor_function",
    field: "Motor Function",
    componentType: "input",
    hideable: true,
  }
];

const integumentRows: readonly FlexSheetData[] = [
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
    id: "integument_selections",
    field: "Integument Status",
    componentType: "checkboxlist",
    assessmentSubsets: [
      { subsetId: "WDL", label: "WDL" },
      { subsetId: "WDL_except:", label: "WDL, except:" },
      { subsetId: "skin", label: "Skin" },
      { subsetId: "hair_and_nails", label: "Hair & Nails" },
      { subsetId: "turgor", label: "Turgor" },
      { subsetId: "wound", label: "Wound" }
    ]
  },
  {
    id: "skin",
    field: "Skin",
    componentType: "input",
    hideable: true,
  },
  {
    id: "hair_and_nails",
    field: "Hair & Nails",
    componentType: "input",
    hideable: true,
  },
  {
    id: "turgor",
    field: "Turgor",
    componentType: "input",
    hideable: true,
  },
  {
    id: "wound",
    field: "Wound",
    componentType: "input",
    hideable: true,
  }
];

const cardiacRows: readonly FlexSheetData[] = [
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
    id: "cardiovascular_selections",
    field: "Cardiovascular Status",
    componentType: "checkboxlist",
    assessmentSubsets: [
      { subsetId: "WDL", label: "WDL" },
      { subsetId: "WDL_except", label: "WDL, except:" },
      { subsetId: "heart_sounds", label: "Heart Sounds" },
      { subsetId: "cardiac_extremities", label: "Extremities" },
      { subsetId: "jugular_distention", label: "Jugular Distention" },
    ]
  },
  {
    id: "heart_sounds",
    field: "Heart Sounds",
    componentType: "input",
    hideable: true,
  },
  {
    id: "cardiac_extremities",
    field: "Extremities",
    componentType: "input",
    hideable: true,
  },
  {
    id: "jugular_distention",
    field: "Jugular Distention",
    componentType: "input",
    hideable: true,
  }
];

const woundRows: readonly FlexSheetData[] = [
  {
    id: "woundAssessmentTitle",
    field: "Wound Assessment",
    componentType: "static",
    rowType: "titleRow",
  },
  {
    id: "wound_location",
    field: "Wound Location",
    componentType: "input",
  },
  {
    id: "wound_type",
    field: "Wound Type",
    componentType: "input",
  },
  {
    id: "wound_dimensions",
    field: "Wound Dimensions (cm)",
    componentType: "input",
  },
  {
    id: "wound_bed",
    field: "Wound Bed",
    componentType: "input",
  },
  {
    id: "wound_exudate",
    field: "Wound Exudate",
    componentType: "input",
  },
  {
    id: "periwound_skin",
    field: "Periwound Skin",
    componentType: "input",
  },
  {
    id: "primary_wound_dressing",
    field: "Primary Dressing",
    componentType: "input",
  },
  {
    id: "secondary_wound_dressing",
    field: "Secondary Dressing",
    componentType: "input",
  },
  {
    id: "wound_stage",
    field: "Wound Stage",
    componentType: "input",
  }
];

const respiratoryRows: FlexSheetData[] = [
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
    id: "respiratory_selections",
    field: "Respiratory Status",
    componentType: "checkboxlist",
    assessmentSubsets: [
      { subsetId: "WDL", label: "WDL" },
      { subsetId: "WDL_except:", label: "WDL, except:" },
      { subsetId: "chest_appearance", label: "Chest Appearance" },
      { subsetId: "lung_sounds", label: "Lung Sounds" },
    ]
  },
  {
    id: "chest_appearance",
    field: "Chest Appearance",
    componentType: "input",
    hideable: true,
  },
  {
    id: "lung_sounds",
    field: "Lung Sounds",
    componentType: "input",
    hideable: true,
  },
];

const giRows: readonly FlexSheetData[] = [
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
    id: "gi_selections",
    field: "GI Status",
    componentType: "checkboxlist",
    assessmentSubsets: [
      { subsetId: "WDL", label: "WDL" },
      { subsetId: "WDL_except:", label: "WDL, except:" },
      { subsetId: "abdomen", label: "Abdomen" },
      { subsetId: "bowel_sounds", label: "Bowel Sounds" },
      { subsetId: "gi_symptoms", label: "GI Symptoms" }
    ]
  },
  {
    id: "abdomen",
    field: "Abdomen",
    componentType: "input",
    hideable: true,
  },
  {
    id: "bowel_sounds",
    field: "Bowel Sounds",
    componentType: "input",
    hideable: true,
  },
  {
    id: "gi_symptoms",
    field: "GI Symptoms",
    componentType: "input",
    hideable: true,
  }
];

const musculoskeletalRows: readonly FlexSheetData[] = [
  {
    id: "musculoskeletalAssessmentTitle",
    field: "Musculoskeletal Assessment",
    componentType: "static",
    rowType: "titleRow",
    wdlDescription: [
      { assessment: "Muscle Strength", description: "Patient demonstrates 5/5 strength in all major muscle groups. Muscle tone is firm and symmetrical." },
      { assessment: "ROM", description: "Full active and passive in all joints, strength 5/5 bilaterally." },
      { assessment: "Gait", description: "Gait steady, ambulates independently" }
    ]
  },
  {
    id: "musculoskeletal_selections",
    field: "Musculoskeletal Status",
    componentType: "checkboxlist",
    assessmentSubsets: [
      { subsetId: "WDL", label: "WDL" },
      { subsetId: "WDL_except:", label: "WDL, except:" },
      { subsetId: "muscle_strength", label: "Muscle Strength" },
      { subsetId: "extremity_rom", label: "Extremity ROM" },
      { subsetId: "gait", label: "Gait" },
    ]
  },
  {
    id: "muscle_strength",
    field: "Muscle Strength",
    componentType: "input",
    hideable: true,
  },
  {
    id: "extremity_rom",
    field: "Extremity ROM",
    componentType: "input",
    hideable: true,
  },
  {
    id: "gait",
    field: "Gait",
    componentType: "input",
    hideable: true,
  }
];

const reproductiveRows: readonly FlexSheetData[] = [
  {
    id: "reproductive_assessment",
    field: "Reproductive Assessment",
    componentType: "static",
    rowType: "titleRow",
  },
  {
    id: "membranes",
    field: "Membranes",
    componentType: "input",
    hideable: false,
  },
  {
    id: "rupture_of_membranes",
    field: "Rupture of Membranes",
    componentType: "input",
    hideable: false,
  },
  {
    id: "fluid_color",
    field: "Fluid Color",
    componentType: "input",
    hideable: false,
  },
  {
    id: "fundal_consistency",
    field: "Fundal Consistency",
    componentType: "input",
    hideable: false,
  },
  {
    id: "fundal_placement",
    field: "Fundal Placement",
    componentType: "input",
    hideable: false,
  },
  {
    id: "fundal_height",
    field: "Fundal Height",
    componentType: "input",
    hideable: false,
  },
  {
    id: "lochia",
    field: "Lochia",
    componentType: "input",
    hideable: false,
  },
]

const fetalRows: readonly FlexSheetData[] = [
  {
    id: "fetal_assessment",
    field: "Fetal Assessment",
    componentType: "static",
    rowType: "titleRow",
  },
  {
    id: "fhr_baseline",
    field: "Baseline",
    componentType: "input",
    normalRange: { low: 110, high: 160 },
    hideable: false,
  },
  {
    id: "fhr_variability",
    field: "Variability",
    componentType: "input",
    hideable: false,
  },
  {
    id: "fhr_acceleration",
    field: "Acceleration",
    componentType: "input",
    hideable: false,
  },
  {
    id: "fhr_decelerations",
    field: "Decelerations",
    componentType: "input",
    hideable: false,
  },
  {
    id: "contraction_frequency",
    field: "Contraction Frequency",
    componentType: "input",
    hideable: false,
  },
  {
    id: "contraction_duration",
    field: "Contraction Duration",
    componentType: "input",
    hideable: false,
  },
  {
    id: "contraction_strength",
    field: "Contraction Strength",
    componentType: "input",
    hideable: false,
  },
]

const quantifiedBloodLossRow: readonly FlexSheetData[] = [
  {
    id: "quantified_blood_loss",
    field: "QBL (mL)",
    componentType: "input",
    hideable: false,
  },
];

const genitourinaryRows: readonly FlexSheetData[] = [
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
    id: "genitourinary_selections",
    field: "Genitourinary Status",
    componentType: "checkboxlist",
    assessmentSubsets: [
      { subsetId: "WDL", label: "WDL" },
      { subsetId: "WDL_except:", label: "WDL, except:" },
      { subsetId: "voiding", label: "Voiding" },
      { subsetId: "urine_description", label: "Urine" },
    ]
  },
  {
    id: "voiding",
    field: "Voiding",
    componentType: "input",
    hideable: true,
  },
  {
    id: "urine_description",
    field: "Urine",
    componentType: "input",
    hideable: true,
  }
];

const ivRows1: readonly FlexSheetData[] = [
  {
    id: "ivAssessmentTitle",
    field: "IV Assessment #1",
    componentType: "static",
    rowType: "titleRow"
  },
  {
    id: "iv_site_1",
    field: "IV Site",
    componentType: "input"
  },
  {
    id: "iv_type_1",
    field: "IV Type",
    componentType: "input"
  },
  {
    id: "iv_location_1",
    field: "IV Location",
    componentType: 'input'
  }
];

const ivRows2: readonly FlexSheetData[] = [
  {
    id: "ivAssessmentTitle",
    field: "IV Assessment #2",
    componentType: "static",
    rowType: "titleRow"
  },
  {
    id: "iv_site_2",
    field: "IV Site",
    componentType: "input"
  },
  {
    id: "iv_type_2",
    field: "IV Type",
    componentType: "input"
  },
  {
    id: "iv_location_2",
    field: "IV Location",
    componentType: 'input'
  }
];

const nursingCareRows: readonly FlexSheetData[] = [
  {
    id: "nursingCareTitle",
    field: "Nursing Care",
    componentType: "static",
    rowType: "titleRow"
  },
  {
    id: "nursing_care_provided",
    field: "Nursing Care Provided",
    componentType: "input"
  }
];

export const cssrsRows: FlexSheetData[] = [
  {
    id: "cssrs_assessment",
    field: "C-SSRS",
    componentType: "static",
    rowType: "titleRow",
  },
  {
    id: "cssrs_1",
    field: "1. Suicidal thoughts",
    componentType: "input",
  },
  {
    id: "cssrs_2",
    field: "2. Suicidal ideation",
    componentType: "input",
  },
  {
    id: "cssrs_3",
    field: "3. Presence of plan",
    componentType: "input",
  },
  {
    id: "cssrs_4",
    field: "4. Active ideation",
    componentType: "input",
  },
  {
    id: "cssrs_5",
    field: "5. Active planning",
    componentType: "input",
  },
  {
    id: "cssrs_6",
    field: "6. Active attempt",
    componentType: "input",
  },
]

export const ciwaAssessmentTool: FlexSheetData[] = [
  {
    id: "ciwaArSectionTitle",
    field: "CIWA-Ar",
    componentType: "static",
    rowType: "titleRow",
    toolId: FlexSheetSection.CIWA
  },
  {
    id: "ciwa_nausea_vomiting",
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
    toolId: FlexSheetSection.CIWA
  },
  {
    id: "ciwa_tremor",
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
    toolId: FlexSheetSection.CIWA
  },
  {
    id: "ciwa_sweats",
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
    toolId: FlexSheetSection.CIWA
  },
  {
    id: "ciwa_anxiety",
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
    toolId: FlexSheetSection.CIWA
  },
  {
    id: "ciwa_agitation",
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
    toolId: FlexSheetSection.CIWA
  },
  {
    id: "ciwa_tactile",
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
    toolId: FlexSheetSection.CIWA
  },
  {
    id: "ciwa_visual",
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
    toolId: FlexSheetSection.CIWA
  },
  {
    id: "ciwa_headache",
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
    toolId: FlexSheetSection.CIWA
  },
  {
    id: "ciwa_orientation",
    field: "Orientation",
    componentType: "assessmentselect",
    chartingOptions: [
      { subsetId: "0", label: "0 - Oriented, can do serial additions" },
      { subsetId: "1", label: "1 - Cannot do serial additions or is uncertain about date" },
      { subsetId: "2", label: "2 - Disoriented for date by no more than 2 calendar days" },
      { subsetId: "3", label: "3 - Disoriented for date by more than 2 calendar days" },
      { subsetId: "4", label: "4 - Disoriented to place or person" },
    ],
    toolId: FlexSheetSection.CIWA
  }
];

export const morseAssessmentTool: FlexSheetData[] = [
  {
    id: "morseFallRiskTitle",
    field: "Morse Fall Risk",
    componentType: "static",
    rowType: "titleRow",
    toolId: FlexSheetSection.MORSE,
  },
  {
    id: "morse_fall_history",
    field: "History of Falling",
    componentType: "assessmentselect",
    chartingOptions: [
      { subsetId: "0", label: "0 - No falls" },
      { subsetId: "25", label: "25 - Has fallen within 3 months" },
    ],
    toolId: FlexSheetSection.MORSE
  },
  {
    id: "morse_secondary_diagnosis",
    field: "Secondary Diagnosis",
    componentType: "assessmentselect",
    chartingOptions: [
      { subsetId: "0", label: "0 - No" },
      { subsetId: "15", label: "15 - Yes" },
    ],
    toolId: FlexSheetSection.MORSE
  },
  {
    id: "morse_ambulatory_aid",
    field: "Ambulatory Aid",
    componentType: "assessmentselect",
    chartingOptions: [
      { subsetId: "0", label: "0 - Bedrest/nurse assist" },
      { subsetId: "15", label: "15 - Crutches/cane/walker" },
      { subsetId: "25", label: "25 - Clutches furniture or support" }
    ],
    toolId: FlexSheetSection.MORSE
  },
  {
    id: "morse_iv",
    field: "IV Therapy/Heparin Lock",
    componentType: "assessmentselect",
    chartingOptions: [
      { subsetId: "0", label: "0 - No" },
      { subsetId: "20", label: "20 - Yes" },
    ],
    toolId: FlexSheetSection.MORSE
  },
  {
    id: "morse_gait",
    field: "Gait",
    componentType: "assessmentselect",
    chartingOptions: [
      { subsetId: "0", label: "0 - Normal/Bedrest/Wheelchair" },
      { subsetId: "10", label: "10 - Weak" },
      { subsetId: "20", label: "20 - Impaired" }
    ],
    toolId: FlexSheetSection.MORSE

  },
  {
    id: "morse_mental_status",
    field: "Mental Status",
    componentType: "assessmentselect",
    chartingOptions: [
      { subsetId: "0", label: "0 - Oriented to own abilities" },
      { subsetId: "15", label: "15 - Overestimates or forgets limitations" },
    ],
    toolId: FlexSheetSection.MORSE
  }
];

export const bradenAssessmentTool: FlexSheetData[] = [
  {
    id: "bradenSkinScale",
    field: "Braden Scale",
    componentType: "static",
    rowType: "titleRow",
    toolId: FlexSheetSection.BRADEN
  },
  {
    id: "braden_sensory_perception",
    field: "Sensory Perception",
    componentType: "assessmentselect",
    chartingOptions: [
      { subsetId: "1", label: "1 - Completely Limited" },
      { subsetId: "2", label: "2 - Very Limited" },
      { subsetId: "3", label: "3 - Slightly Limited" },
      { subsetId: "4", label: "4 - No Impairment" },
    ],
    toolId: FlexSheetSection.BRADEN
  },
  {
    id: "braden_moisture",
    field: "Moisture",
    componentType: "assessmentselect",
    chartingOptions: [
      { subsetId: "1", label: "1 - Constantly Moist" },
      { subsetId: "2", label: "2 - Very Moist" },
      { subsetId: "3", label: "3 - Occasionally Moist" },
      { subsetId: "4", label: "4 - Rarely Moist" },
    ],
    toolId: FlexSheetSection.BRADEN
  },
  {
    id: "braden_activity",
    field: "Activity",
    componentType: "assessmentselect",
    chartingOptions: [
      { subsetId: "1", label: "1 - Bedfast" },
      { subsetId: "2", label: "2 - Chairfast" },
      { subsetId: "3", label: "3 - Walks Occasionally." },
      { subsetId: "4", label: "4 - Walks Frequently" },
    ],
    toolId: FlexSheetSection.BRADEN
  },
  {
    id: "braden_mobility",
    field: "Mobility",
    componentType: "assessmentselect",
    chartingOptions: [
      { subsetId: "1", label: "1 - Completely Immobile" },
      { subsetId: "2", label: "2 - Very Limited" },
      { subsetId: "3", label: "3 - Slightly Limited" },
      { subsetId: "4", label: "4 - No Limitations" },
    ],
    toolId: FlexSheetSection.BRADEN
  },
  {
    id: "braden_nutrition",
    field: "Nutrition",
    componentType: "assessmentselect",
    chartingOptions: [
      { subsetId: "1", label: "1 - Very Poor" },
      { subsetId: "2", label: "2 - Probably Inadequate" },
      { subsetId: "3", label: "3 - Adequate" },
      { subsetId: "4", label: "4 - Excellent" },
    ],
    toolId: FlexSheetSection.BRADEN

  },
  {
    id: "braden_friction_and_shear",
    field: "Friction and Shear",
    componentType: "assessmentselect",
    chartingOptions: [
      { subsetId: "1", label: "1 - Problem" },
      { subsetId: "2", label: "2 - Potential Problem" },
      { subsetId: "3", label: "3 - No Apparent Problem" },
    ],
    toolId: FlexSheetSection.BRADEN
  }
];

export const painadAssessmentTool: FlexSheetData[] = [
  {
    id: "painadTitle",
    field: "PAINAD",
    componentType: "static",
    rowType: "titleRow",
    toolId: FlexSheetSection.PAINAD
  },
  {
    id: "painad_breathing",
    field: "Breathing",
    componentType: "assessmentselect",
    chartingOptions: [
      { subsetId: "0", label: "0 - Normal" },
      { subsetId: "1", label: "1 - Occasional labored breathing, short periods of hyperventilation" },
      { subsetId: "2", label: "2 - Noisy labored breathing, long periods of hyperventilation, Cheyne-Stokes" },
    ],
    toolId: FlexSheetSection.PAINAD
  },
  {
    id: "painad_negative_vocalization",
    field: "Negative Vocalization",
    componentType: "assessmentselect",
    chartingOptions: [
      { subsetId: "0", label: "0 - None" },
      { subsetId: "1", label: "1 - Occasional moan or groan, low-level speech with a negative or disapproving quality" },
      { subsetId: "2", label: "2 - Repeated troubled calling out, loud moaning or groaning, crying" },
    ],
    toolId: FlexSheetSection.PAINAD
  },
  {
    id: "painad_facial_expression",
    field: "Facial Expression",
    componentType: "assessmentselect",
    chartingOptions: [
      { subsetId: "0", label: "0 - Smiling or inexpressive" },
      { subsetId: "1", label: "1 - Sad, frightened, frown" },
      { subsetId: "2", label: "2 - Facial grimacing" },
    ],
    toolId: FlexSheetSection.PAINAD
  },
  {
    id: "painad_body_language",
    field: "Body Language",
    componentType: "assessmentselect",
    chartingOptions: [
      { subsetId: "0", label: "0 - Relaxed" },
      { subsetId: "1", label: "1 - Tense, distressed pacing, fidgeting" },
      { subsetId: "2", label: "2 - Rigid, fists clenched, knees pulled up or pushing away, striking out" },
    ],
    toolId: FlexSheetSection.PAINAD
  },
  {
    id: "painad_consolability",
    field: "Consolability",
    componentType: "assessmentselect",
    chartingOptions: [
      { subsetId: "0", label: "0 - No need to console" },
      { subsetId: "1", label: "1 - Distracted or reassured by voice or touch" },
      { subsetId: "2", label: "2 - Unable to console, distract, or reassure" },
    ],
    toolId: FlexSheetSection.PAINAD
  }
]

const phq9Options =
  [
    { subsetId: "0", label: "0 - Not at all" },
    { subsetId: "1", label: "1 - Several days" },
    { subsetId: "2", label: "2 - More than half the days" },
    { subsetId: "3", label: "3 - Nearly every day" },
  ];

export const phq9AssessmentTool: FlexSheetData[] = [
  {
    id: "phq9_tool",
    field: "PHQ-9",
    componentType: "static",
    rowType: "titleRow",
    toolId: FlexSheetSection.PHQ9
  },
  {
    id: "phq9_1",
    field: "1. Interest or Pleasure",
    componentType: "assessmentselect",
    chartingOptions: phq9Options,
    toolId: FlexSheetSection.PHQ9
  },
  {
    id: "phq9_2",
    field: "2. Down or Depressed",
    componentType: "assessmentselect",
    chartingOptions: phq9Options,
    toolId: FlexSheetSection.PHQ9
  },
  {
    id: "phq9_3",
    field: "3. Sleep",
    componentType: "assessmentselect",
    chartingOptions: phq9Options,
    toolId: FlexSheetSection.PHQ9
  },
  {
    id: "phq9_4",
    field: "4. Tired",
    componentType: "assessmentselect",
    chartingOptions: phq9Options,
    toolId: FlexSheetSection.PHQ9
  },
  {
    id: "phq9_5",
    field: "5. Appetite",
    componentType: "assessmentselect",
    chartingOptions: phq9Options,
    toolId: FlexSheetSection.PHQ9
  },
  {
    id: "phq9_6",
    field: "6. Self-Perception",
    componentType: "assessmentselect",
    chartingOptions: phq9Options,
    toolId: FlexSheetSection.PHQ9
  },
  {
    id: "phq9_7",
    field: "7. Concentration",
    componentType: "assessmentselect",
    chartingOptions: phq9Options,
    toolId: FlexSheetSection.PHQ9
  },
  {
    id: "phq9_8",
    field: "8. Slow or restless",
    componentType: "assessmentselect",
    chartingOptions: phq9Options,
    toolId: FlexSheetSection.PHQ9
  },
  {
    id: "phq9_9",
    field: "9. Suicidal ideation",
    componentType: "assessmentselect",
    chartingOptions: phq9Options,
    toolId: FlexSheetSection.PHQ9
  }
];

export const flexSheetSections: FlexSheetSections = {
  [FlexSheetSection.VITALS]: vitalSignRows,
  [FlexSheetSection.VITALS_OVERVIEW]: vitalSignOverviewRows,
  [FlexSheetSection.INPUT]: inputRows,
  [FlexSheetSection.OUTPUT]: outputRows,
  [FlexSheetSection.QBL]: quantifiedBloodLossRow,
  [FlexSheetSection.BASE_PAIN]: basePainRows,
  [FlexSheetSection.FACES_PAIN]: facesPainRows,
  [FlexSheetSection.GENERAL_APPEARANCE]: generalAppearanceRows,
  [FlexSheetSection.PSYCHOSOCIAL]: psychosocialRows,
  [FlexSheetSection.REPRODUCTIVE]: reproductiveRows,
  [FlexSheetSection.FETAL]: fetalRows,
  [FlexSheetSection.HEENT]: heentRows,
  [FlexSheetSection.NEURO]: neuroRows,
  [FlexSheetSection.INTEGUMENT]: integumentRows,
  [FlexSheetSection.CARDIAC]: cardiacRows,
  [FlexSheetSection.RESPIRATORY]: respiratoryRows,
  [FlexSheetSection.WOUND]: woundRows,
  [FlexSheetSection.GI]: giRows,
  [FlexSheetSection.MUSCULOSKELETAL]: musculoskeletalRows,
  [FlexSheetSection.GENTIOURINARY]: genitourinaryRows,
  [FlexSheetSection.IV_1]: ivRows1,
  [FlexSheetSection.IV_2]: ivRows2,
  [FlexSheetSection.NURSING_CARE]: nursingCareRows,
  [FlexSheetSection.BRADEN]: bradenAssessmentTool,
  [FlexSheetSection.CIWA]: ciwaAssessmentTool,
  [FlexSheetSection.MORSE]: morseAssessmentTool,
  [FlexSheetSection.PAINAD]: painadAssessmentTool,
  [FlexSheetSection.PHQ9]: phq9AssessmentTool,
  [FlexSheetSection.CSSRS]: cssrsRows,
};

export function addRows(section: FlexSheetSection): FlexSheetData[] {
  return [...flexSheetSections[section]];
}