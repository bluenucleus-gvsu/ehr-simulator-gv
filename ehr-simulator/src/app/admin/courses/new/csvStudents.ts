import type { Student } from "./types";

export const GVSU_EMAIL_DOMAIN = "@mail.gvsu.edu";

export function studentFromCsvFields(
  userName: string,
  firstName: string,
  lastName: string
): Student {
  return {
    id: crypto.randomUUID(),
    email: `${userName}${GVSU_EMAIL_DOMAIN}`,
    full_name: `${firstName} ${lastName}`.trim(),
    role: "student",
    status: null,
    created_at: null,
    updated_at: null,
  };
}

/** Parse roster CSV with columns: User Name, First Name, Last Name. */
export function parseStudentCSV(text: string): Student[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) throw new Error("CSV file is empty or contains only headers");
  const header = lines[0].split(",").map((h) => h.replace(/"/g, "").trim());
  const cols = ["User Name", "First Name", "Last Name"] as const;
  const indices = cols.map((col) => header.indexOf(col));
  if (indices.includes(-1)) {
    throw new Error(`Missing columns: ${cols.filter((_, i) => indices[i] === -1).join(", ")}`);
  }
  const [uIdx, fIdx, lIdx] = indices;
  return lines
    .slice(1)
    .filter((line) => line.trim())
    .map((line) => {
      const values: string[] = [];
      let current = "";
      let inQuotes = false;
      for (const char of line) {
        if (char === '"') inQuotes = !inQuotes;
        else if (char === "," && !inQuotes) {
          values.push(current.trim());
          current = "";
        } else current += char;
      }
      values.push(current.trim());
      const clean = (idx: number) => values[idx]?.replace(/"/g, "") || "";
      return studentFromCsvFields(clean(uIdx), clean(fIdx), clean(lIdx));
    });
}
