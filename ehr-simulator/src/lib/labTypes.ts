import { LabTableData } from '@/app/simulation/[caseId]/[sessionId]/chart/labs/components/labsData';
import { Database } from "../../database.types";
import { LabResultsRow } from '@/actions/case_builder/getCase';
import { type SimReleaseItem } from '@/lib/faculty/itemRelease';

export type LabResultInsert = Database['public']['Tables']['lab_results']['Insert'];

export type LabColumn = Pick<
  LabResultsRow,
  "id" | "time_offset" | "is_in_presim" | "phase" | "label"
>;

export function toSimReleaseItem(column: LabColumn): SimReleaseItem {
  return {
    id: column.id,
    phase: column.phase,
    isInPresim: column.is_in_presim,
  };
}

type LabFormPayload = {
  data: LabTableData[]
  columns: LabColumn[]
}

type TransformedLabsPayload = {
  labResults: LabResultInsert[]
}

export function transformLabTableToSchema(
  caseId: string,
  payload: LabFormPayload
): TransformedLabsPayload {
  const { data, columns } = payload

  const labResults: LabResultInsert[] = columns.map((column) => {
    const baseRow: LabResultInsert = {
      case_id: caseId,
      time_offset: column.time_offset,
      is_in_presim: column.is_in_presim,
      phase: column.phase,
      label: column.label?.trim() || null,
    }

    for (const row of data) {
      if (row.rowType !== "results") continue

      const cellValue = row[column.id];
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
