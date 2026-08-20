export function caseBuilderPath(path: string, caseId?: string | null): string {
  if (!caseId) return path;
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}caseId=${encodeURIComponent(caseId)}`;
}
