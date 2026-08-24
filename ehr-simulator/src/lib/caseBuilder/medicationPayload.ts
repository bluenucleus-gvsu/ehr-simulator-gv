export function normalizeOptionalNumericInput(value: unknown): number | null {
  if (value == null) return null;
  if (typeof value === "string" && value.trim() === "") return null;

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
}
