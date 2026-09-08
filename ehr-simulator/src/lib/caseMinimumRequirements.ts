type CaseMinimumRequirementFields = {
  first_name?: string | null;
  last_name?: string | null;
  description?: string | null;
  age?: number | null;
};

export function hasText(value: string | null | undefined): boolean {
  return Boolean(value?.trim());
}

function hasValidNumber(value: number | null | undefined): boolean {
  return typeof value === "number" && Number.isFinite(value);
}

export function caseMeetsMinimumRequirements(
  simCase: CaseMinimumRequirementFields,
): boolean {
  return (
    hasText(simCase.first_name) &&
    hasText(simCase.last_name) &&
    hasText(simCase.description) &&
    hasValidNumber(simCase.age)
  );
}