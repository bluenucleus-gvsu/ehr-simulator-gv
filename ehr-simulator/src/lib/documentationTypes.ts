import { DatabaseDocumentationInsert } from "@/actions/simulation";
import { FlexSheetData } from "@/app/simulation/[caseId]/[sessionId]/chart/charting/components/flexSheetData";
import {
  coerceDocumentationValueForPersist,
  resolveDocumentationDbColumn,
} from "@/lib/documentationColumns";

export type DocumentationFormPayload = {
  data: FlexSheetData[];
  timePoints: number[];
  timePointsInPreSim: Set<number>;
};

export type TransformedDocumentationPayload = {
  documentationResults: DatabaseDocumentationInsert[];
};

export function transformDocumentationTableToSchema(
  caseId: string,
  payload: DocumentationFormPayload,
): DatabaseDocumentationInsert[] {
  const { data, timePoints, timePointsInPreSim } = payload;

  return timePoints.map((timePoint) => {
    const baseRow: DatabaseDocumentationInsert = {
      case_id: caseId,
      is_in_presim: timePointsInPreSim.has(timePoint),
      time_offset: timePoint,
    };

    for (const row of data) {
      const isDataRow =
        row.componentType !== "static" && row.componentType !== "totalScoreRow";

      if (isDataRow && row.id) {
        const cellValue = row[timePoint];
        const dbColumn = resolveDocumentationDbColumn(row.id);
        (baseRow as Record<string, unknown>)[dbColumn] =
          coerceDocumentationValueForPersist(dbColumn, cellValue);
      }
    }

    return baseRow;
  });
}
