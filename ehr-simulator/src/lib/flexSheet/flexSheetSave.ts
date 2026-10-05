import { StudentDatabaseDocumentation, upsertDocumentationRows } from "@/actions/simulation";
import { FlexSheetData } from "./flexSheetTypes";

export function coerceValueForSave(
  raw: unknown,
): string | number | null {
  if (raw === "" || raw === undefined || raw === null) return null;

  if (Array.isArray(raw)) {
    return raw.length ? raw.join(",") : null;
  }
  return String(raw);
}

export async function saveFlexSheetData({
  caseId,
  sessionId,
  userId,
  groupId,
  data,
  dirtyColumns,
}: {
  caseId: string;
  sessionId: string;
  userId: string;
  groupId: string;
  data: FlexSheetData[];
  dirtyColumns: Set<string>;
}) {
  const dirtyTimeOffsets = Array.from(dirtyColumns);

  const payload = dirtyTimeOffsets.map((timeOffset) => {
    const dbRecord: StudentDatabaseDocumentation = {
      case_id: caseId,
      case_session_id: sessionId,
      user_id: userId,
      group_id: groupId,
      time_offset: Number(timeOffset),
      is_in_presim: false,
    };

    data.forEach((row) => {
      const isDataRow = row.componentType !== "static" && row.componentType !== "totalScoreRow";
      if (isDataRow && row.id) {
        const cellValue = row[timeOffset];
        (dbRecord as Record<string, unknown>)[row.id] = coerceValueForSave(cellValue);
      }
    });

    return dbRecord;
  });

  const { error } = await upsertDocumentationRows(payload);
  if (error) throw error;
}