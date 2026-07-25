import type { Student } from "@/app/admin/courses/new/types";

export function parseStudentCSV(text: string): Student[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) {
    throw new Error("CSV file is empty or contains only headers");
  }

  const header = lines[0].split(",").map((h) => h.replace(/"/g, "").trim());
  const cols = ["User Name", "First Name", "Last Name"];
  const indices = cols.map((col) => header.indexOf(col));

  if (indices.includes(-1)) {
    throw new Error(
      `Missing columns: ${cols.filter((_, i) => indices[i] === -1).join(", ")}`
    );
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
      const userName = clean(uIdx);
      const firstName = clean(fIdx);
      const lastName = clean(lIdx);

      return {
        id: crypto.randomUUID(),
        email: `${userName}@mail.gvsu.edu`,
        full_name: `${firstName} ${lastName}`.trim(),
        role: "student",
        status: null,
        created_at: null,
        updated_at: null,
      } satisfies Student;
    });
}
