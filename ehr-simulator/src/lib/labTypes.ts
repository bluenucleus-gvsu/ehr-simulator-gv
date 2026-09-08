import { timeColumnCell } from "@/utils/timeColumnCell";
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
      data: {},
    }

    for (const row of data) {
      if (!row.id) continue

      const cellValue = timeColumnCell(row as unknown as Record<string | number | symbol, unknown>, timePoint)

      if (row.rowType === "results") {
        const columnName = row.id;

        if (columnName) {
          /// TODO: This is workaround, update mappings above to satisfy type checking
          ;; (baseRow[columnName as keyof LabResultInsert] as string | null) =
            cellValue === "" || cellValue == null ? null : String(cellValue);
        } else {
          const currentData = (baseRow.data as Record<string, any>) || {};
          const currentUnstructured = (currentData.unstructured as Record<string, any>) || {};

          baseRow.data = {
            ...currentData,
            unstructured: {
              ...currentUnstructured,
              [row.id]: cellValue ?? null,
            },
          }
        }
      }

    }
    return baseRow
  })

  return {
    labResults,
  }
}
