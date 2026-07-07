import { ImagingData } from "@/app/simulation/[caseId]/[sessionId]/chart/labs/components/labsData";
import { timeColumnCell } from "@/utils/timeColumnCell";
import { LabTableData } from '@/app/simulation/[caseId]/[sessionId]/chart/labs/components/labsData';
import { MicrobiologyReportData } from "@/app/simulation/[caseId]/[sessionId]/chart/labs/components/labsData";
import { Database } from "../../database.types";

export type LabResultInsert = Database['public']['Tables']['lab_results']['Insert'];

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


type LabFormPayload = {
  data: LabTableData[]
  timePoints: number[]
  timePointsInPreSim: Set<number>
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

      const cellValue = timeColumnCell(row as unknown as Record<string | number | symbol, unknown>, timePoint)

      if (row.rowType === "results") {
        const columnName = row.dbColumn;

        if (columnName) {
          /// TODO: This is workaround, update mappings above to satisfy type checking
          ; (baseRow[columnName as keyof LabResultInsert] as number | null | undefined) = parseNumeric(cellValue)
        } else {
          const currentData = (baseRow.data as Record<string, any>) || {};
          const currentUnstructured = (currentData.unstructured as Record<string, any>) || {};

          baseRow.data = {
            ...currentData,
            unstructured: {
              ...currentUnstructured,
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
