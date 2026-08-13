export function coerceDocumentationValueForPersist(
  raw: unknown,
): string | number | null {
  if (raw === "" || raw === undefined || raw === null) return null;

  if (Array.isArray(raw)) {
    return raw.length ? raw.join(",") : null;
  }

  return String(raw);
}
