import { DatabaseDocumentationInsert } from "@/actions/simulation";
import { FlexSheetData } from "@/app/simulation/[caseId]/[sessionId]/chart/charting/components/flexSheetData";

export type DocumentationFormPayload = {
  data: FlexSheetData[]
  timePoints: number[]
  timePointsInPreSim: Set<number>
}

export type TransformedDocumentationPayload = {
  documentationResults: DatabaseDocumentationInsert[]
}

export function transformDocumentationTableToSchema(
  caseId: string,
  payload: DocumentationFormPayload
): DatabaseDocumentationInsert[] {
  const { data, timePoints, timePointsInPreSim } = payload

  const documentationResults: DatabaseDocumentationInsert[] = timePoints.map((timePoint) => {

    const baseRow: DatabaseDocumentationInsert = {
      case_id: caseId,
      is_in_presim: timePointsInPreSim.has(timePoint),
      time_offset: timePoint,
    }

    for (const row of data) {
      const isDataRow = row.componentType !== 'static' && row.componentType !== 'totalScoreRow';

      if (isDataRow && row.id) {
        const cellValue = row[timePoint];

        let formattedValue = cellValue;
        if (Array.isArray(cellValue)) {
          formattedValue = cellValue.join(',');
        }
        // the value of row.id comes from the id of each object in flexSheetTemplate
        // the id must match the corresponding col in the database
        (baseRow as Record<string, any>)[row.id] = formattedValue !== '' && formattedValue !== undefined ? formattedValue : null;
      }
    }

    return baseRow
  })

  return documentationResults
}
