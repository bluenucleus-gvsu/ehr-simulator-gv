import { LabTableData } from '@/app/simulation/[caseId]/[sessionId]/chart/labs/components/labsData';
import { Database } from "../../database.types";

export type LabResultInsert = Database['public']['Tables']['lab_results']['Insert'];

type LabFormPayload = {
  data: LabTableData[]
  timePoints: number[]
  timePointsInPreSim: Set<number>
}

type TransformedLabsPayload = {
  labResults: LabResultInsert[]
}

export function timeColumnCell(row: Record<string | number | symbol, unknown>, offset: number): unknown {
  const fromNum = row[offset];
  if (fromNum !== undefined && fromNum !== null) return fromNum;
  const fromStr = row[String(offset)];
  if (fromStr !== undefined && fromStr !== null) return fromStr;
  return undefined;
}

export function transformLabTableToSchema(
  caseId: string,
  payload: LabFormPayload
): TransformedLabsPayload {
  const { data, timePoints, timePointsInPreSim } = payload

  const labResults: LabResultInsert[] = timePoints.map((timePoint) => {
    const baseRow: LabResultInsert = {
      case_id: caseId,
      time_offset: timePoint,
      is_in_presim: timePointsInPreSim.has(timePoint),
    }

    for (const row of data) {
      if (row.rowType !== "results") continue

      const cellValue = row[timePoint]

      const columnName = row.id;

      if (columnName) {
        /// TODO: This is workaround, update mappings above to satisfy type checking
        ;; (baseRow[columnName as keyof LabResultInsert] as string | null) =
          cellValue === "" || cellValue == null ? null : String(cellValue);
      }
    }

    return baseRow
  })

  return {
    labResults,
  }
}
