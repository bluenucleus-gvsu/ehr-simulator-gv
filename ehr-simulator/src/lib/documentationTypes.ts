import { FlexSheetData } from "@/app/simulation/[caseId]/[sessionId]/chart/charting/components/flexSheetData";

export type DocumentationResultInsert = {
  case_id: string
  is_in_presim: boolean
  time_offset: number

  hr?: string | null
  hr_source?: string | null
  bp?: string | null
  bp_source?: string | null
  rr?: string | null
  temp?: string | null
  temp_source?: string | null
  spo2?: string | null
  pain?: string | null
  weight_kg?: string | null
  oral?: string | null
  intravenous?: string | null
  enteral_nutrition?: string | null
  parenteral_nutrition?: string | null
  urine?: string | null
  emesis?: string | null
  stool?: string | null
  wound_drainage?: string | null
  enteral_output?: string | null
  appearance?: string | null
  safety_check?: string | null
  mood_and_affect?: string | null
  head_and_scalp?: string | null
  eyes?: string | null
  ears?: string | null
  nose?: string | null
  mouth_and_throat?: string | null
  orientation?: string | null
  speech?: string | null
  motor_function?: string | null
  integument_status?: string | null
  skin?: string | null
  hair_and_nails?: string | null
  turgor?: string | null
  wound?: string | null
  heart_sounds?: string | null
  extremities?: string | null
  jugular_distention?: string | null
  chest_appearance?: string | null
  lung_sounds?: string | null
  abdomen?: string | null
  bowel_sounds?: string | null
  nausea?: string | null
  extremity_rom?: string | null
  gait?: string | null
  voiding?: string | null
  iv_site?: string | null
  iv_type?: string | null
  iv_location?: string | null
  nursing_care_provided?: string | null

  nausea_vomiting?: number | null
  tremor?: number | null
  paroxysmal_sweats?: number | null
  anxiety?: number | null
  agitation?: number | null
  tactile_disturbances?: number | null
  visual_disturbances?: number | null
  headache?: number | null
  orientation2?: number | null
  history_of_falling?: number | null
  secondary_diagnosis?: number | null
  ambulatory_aid?: number | null
  iv_therapy_heparin_lock?: number | null
  fall_risk_gait?: number | null
  mental_status?: number | null
  sensory_perception?: number | null
  moisture?: number | null
  activity?: number | null
  mobility?: number | null
  nutrition?: number | null
  friction_and_shear?: number | null
  breathing_independent_of_vocalization?: number | null
  negative_vocalization?: number | null
  facial_expression?: number | null
  body_language?: number | null
  consolability?: number | null
}

export const DOCUMENTATION_FIELD_TO_COLUMN: Record<string, keyof DocumentationResultInsert> = {
  "HR": "hr",
  "HR Source": "hr_source",
  "BP": "bp",
  "BP Source": "bp_source",
  "RR": "rr",
  "Temp": "temp",
  "Temp Source": "temp_source",
  "SpO2": "spo2",
  "Pain": "pain",
  "Weight (kg)": "weight_kg",
  "Oral": "oral",
  "Intravenous": "intravenous",
  "Enteral Nutrition": "enteral_nutrition",
  "Parenteral Nutrition": "parenteral_nutrition",
  "Urine": "urine",
  "Emesis": "emesis",
  "Stool": "stool",
  "Wound Drainage": "wound_drainage",
  "Enteral Output": "enteral_output",
  "Appearance": "appearance",
  "Safety Check": "safety_check",
  "Mood and Affect": "mood_and_affect",
  "Head and Scalp": "head_and_scalp",
  "Eyes": "eyes",
  "Ears": "ears",
  "Nose": "nose",
  "Mouth and Throat": "mouth_and_throat",
  "Orientation": "orientation",
  "Speech": "speech",
  "Motor Function": "motor_function",
  "Integument Status": "integument_status",
  "Skin": "skin",
  "Hair and Nails": "hair_and_nails",
  "Turgor": "turgor",
  "Wound": "wound",
  "Heart Sounds": "heart_sounds",
  "Extremities": "extremities",
  "Jugular Distention": "jugular_distention",
  "Chest Appearance": "chest_appearance",
  "Lung Sounds": "lung_sounds",
  "Abdomen": "abdomen",
  "Bowel Sounds": "bowel_sounds",
  "Nausea": "nausea",
  "Extremity ROM": "extremity_rom",
  "Gait": "gait",
  "Voiding": "voiding",
  "IV Site": "iv_site",
  "IV Type": "iv_type",
  "IV Location": "iv_location",
  "Nursing Care Provided": "nursing_care_provided",

  "Nausea/Vomiting": "nausea_vomiting",
  "Tremor": "tremor",
  "Paroxysmal Sweats": "paroxysmal_sweats",
  "Anxiety": "anxiety",
  "Agitation": "agitation",
  "Tactile Disturbances": "tactile_disturbances",
  "Visual Disturbances": "visual_disturbances",
  "Headache": "headache",
  "Orientation2": "orientation2",
  "History of Falling": "history_of_falling",
  "Secondary Diagnosis": "secondary_diagnosis",
  "Ambulatory Aid": "ambulatory_aid",
  "IV Therapy/Heparin Lock": "iv_therapy_heparin_lock",
  "Fall Risk Gait": "fall_risk_gait",
  "Mental Status": "mental_status",
  "Sensory Perception": "sensory_perception",
  "Moisture": "moisture",
  "Activity": "activity",
  "Mobility": "mobility",
  "Nutrition": "nutrition",
  "Friction and Shear": "friction_and_shear",
  "Breathing Independent of Vocalization": "breathing_independent_of_vocalization",
  "Negative Vocalization": "negative_vocalization",
  "Facial Expression": "facial_expression",
  "Body Language": "body_language",
  "Consolability": "consolability",
}

export type DocumentationFormPayload = {
  data: FlexSheetData[]
  timePoints: number[]
  timePointsInPreSim: Set<number>
}

export type TransformedDocumentationPayload = {
  documentationResults: DocumentationResultInsert[]
}

const INTEGER_FIELDS = new Set<keyof DocumentationResultInsert>([
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
])

function parseOptionalInteger(value: unknown): number | null {
  if (value === "" || value == null) return null
  const n = Number(value)
  return Number.isInteger(n) ? n : null
}

function parseOptionalText(value: unknown): string | null {
  if (value === "" || value == null) return null
  if (Array.isArray(value)) return value.join(", ")
  return String(value)
}

export function transformDocumentationTableToSchema(
  caseId: string,
  payload: DocumentationFormPayload
): TransformedDocumentationPayload {
  const { data, timePoints, timePointsInPreSim } = payload

  const documentationResults: DocumentationResultInsert[] = timePoints.map((timePoint) => {

    const baseRow: DocumentationResultInsert = {
      case_id: caseId,
      is_in_presim: timePointsInPreSim.has(timePoint),
      time_offset: timePoint,
    }

    for (const row of data) {
      if (row.componentType === "static") continue
      if (row.componentType === "totalScoreRow") continue
      if (!row.field) continue

      const columnName = DOCUMENTATION_FIELD_TO_COLUMN[row.field]
      if (!columnName) continue

      const cellValue = row[String(timePoint)]

      if (INTEGER_FIELDS.has(columnName)) {
        ; (baseRow[columnName] as number | null | undefined) = parseOptionalInteger(cellValue)
      } else {
        ; (baseRow[columnName] as string | null | undefined) = parseOptionalText(cellValue)
      }
    }

    return baseRow
  })

  return { documentationResults }
}
