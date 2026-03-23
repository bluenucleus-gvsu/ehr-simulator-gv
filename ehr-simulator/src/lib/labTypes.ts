import { ImagingData } from "@/app/simulation/[caseId]/[sessionId]/chart/labs/components/labsData";
import { LabTableData } from '@/app/simulation/[caseId]/[sessionId]/chart/labs/components/labsData';
import { MicrobiologyReportData } from "@/app/simulation/[caseId]/[sessionId]/chart/labs/components/labsData";

export type LabResultInsert = {
  case_id: string
  time_offset: number
  is_in_presim: boolean

  sodium?: number | null
  potassium?: number | null
  chloride?: number | null
  bun?: number | null
  creatinine?: number | null
  glucose?: number | null
  co2?: number | null
  calcium?: number | null
  lactate?: number | null

  rbc?: number | null
  wbc?: number | null
  platelets?: number | null
  hemoglobin?: number | null
  hematocrit?: number | null
  mcv?: number | null
  mch?: number | null
  mchc?: number | null

  troponin?: number | null
  ckmb?: number | null
  myoglobin?: number | null

  ast?: number | null
  alt?: number | null
  alp?: number | null
  total_bilirubin?: number | null
  albumin?: number | null
  ammonia?: number | null

  pco2?: number | null
  po2?: number | null
  hco3?: number | null

  specific_gravity?: number | null
  urine_ph?: number | null
  protein?: string | null
  urine_glucose?: string | null
  ketones?: string | null
  leukocyte_esterase?: string | null
  nitrites?: string | null
  blood?: string | null

  pt?: number | null
  ptt?: number | null

  crp?: number | null
  esr?: number | null
  tsh?: number | null
  free_t3?: number | null
  free_t4?: number | null

  total_cholesterol?: number | null
  hdl_cholesterol?: number | null
  ldl_cholesterol?: number | null
  triglycerides?: number | null

  magnesium?: number | null
  phosphate?: number | null
  amylase?: number | null
  lipase?: number | null

  data?: Record<string, unknown>
}

export type ImagingReportDraft = {
  case_id: string
  time_offset: number
  name: string
  raw: ImagingData
}

export type MicrobiologyReportDraft = {
  case_id: string
  time_offset: number
  name: string
  raw: MicrobiologyReportData
}

export const LAB_FIELD_TO_COLUMN: Record<string, keyof LabResultInsert> = {
  "Sodium": "sodium",
  "Potassium": "potassium",
  "Chlorine": "chloride",
  "BUN": "bun",
  "Creatinine": "creatinine",
  "Glucose": "glucose",
  "CO2": "co2",
  "Calcium": "calcium",
  "Lactate": "lactate",
  "RBC": "rbc",
  "WBC": "wbc",
  "Platelets": "platelets",
  "Hemoglobin": "hemoglobin",
  "Hematocrit": "hematocrit",
  "MCV": "mcv",
  "MCH": "mch",
  "MCHC": "mchc",
  "Troponin": "troponin",
  "CKMB": "ckmb",
  "Myoglobin": "myoglobin",
  "AST": "ast",
  "ALT": "alt",
  "ALP": "alp",
  "Total Bilirubin": "total_bilirubin",
  "Albumin": "albumin",
  "Ammonia": "ammonia",
  "pCO2": "pco2",
  "pO2": "po2",
  "HCO3": "hco3",
  "Specific Gravity": "specific_gravity",
  "Urine pH": "urine_ph",
  "Protein": "protein",
  "Urine Glucose": "urine_glucose",
  "Ketones": "ketones",
  "Leukocyte Esterase": "leukocyte_esterase",
  "Nitrites": "nitrites",
  "Blood": "blood",
  "PT": "pt",
  "PTT": "ptt",
  "CRP": "crp",
  "ESR": "esr",
  "TSH": "tsh",
  "Free T3": "free_t3",
  "Free T4": "free_t4",
  "Total Cholesterol": "total_cholesterol",
  "HDL Cholesterol": "hdl_cholesterol",
  "LDL Cholesterol": "ldl_cholesterol",
  "Triglycerides": "triglycerides",
  "Magnesium": "magnesium",
  "Phosphate": "phosphate",
  "Amylase": "amylase",
  "Lipase": "lipase",
}

type LabFormPayload = {
  data: LabTableData[]
  timePoints: number[]
  timePointsInPreSim: Set<number>
  visibleItems?: Set<string>
}

type TransformedLabsPayload = {
  labResults: LabResultInsert[]
  imagingReports: ImagingReportDraft[]
  microbiologyReports: MicrobiologyReportDraft[]
}

function parseNumeric(value: unknown): number | null {
  if (value === "" || value == null) return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

export function transformLabTableToSchema(
  caseId: string,
  payload: LabFormPayload
): TransformedLabsPayload {
  const { data, timePoints, timePointsInPreSim } = payload

  const imagingReports: ImagingReportDraft[] = []
  const microbiologyReports: MicrobiologyReportDraft[] = []

  // 
  const labResults: LabResultInsert[] = timePoints.map((timePoint) => {
    const baseRow: LabResultInsert = {
      case_id: caseId,
      time_offset: timePoint,
      is_in_presim: timePointsInPreSim.has(timePoint),
      data: {},
    }

    for (const row of data) {
      if (row.rowType === "divider") continue

      const cellValue = row[timePoint]

      if (row.rowType === "results") {
        const columnName = LAB_FIELD_TO_COLUMN[row.field]

        if (columnName) {
          /// TODO: This is workaround, update mappings above to satisfy type checking
          ; (baseRow[columnName] as number | null | undefined) = parseNumeric(cellValue)
        } else {
          baseRow.data = {
            ...(baseRow.data ?? {}),
            unstructured: {
              ...(((baseRow.data ?? {}) as any).unstructured ?? {}),
              [row.field]: cellValue ?? null,
            },
          }
        }
      }
      else if (row.rowType === "imaging" && cellValue) {
        imagingReports.push({
          case_id: caseId,
          time_offset: timePoint,
          name: row.field,
          raw: cellValue as ImagingData,
        })
      }
      else if (row.rowType === "microbiology" && cellValue) {
        microbiologyReports.push({
          case_id: caseId,
          time_offset: timePoint,
          name: row.field,
          raw: cellValue as MicrobiologyReportData,
        })
      }

    }
    return baseRow
  })

  return {
    labResults,
    imagingReports,
    microbiologyReports,
  }
}
