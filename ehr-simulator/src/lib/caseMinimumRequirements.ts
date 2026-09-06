type CaseMinimumRequirementFields = {
  first_name?: string | null;
  last_name?: string | null;
  description?: string | null;
  date_of_birth?: string | null;
};

function hasText(value: string | null | undefined): boolean {
  return Boolean(value?.trim());
}

export function caseMeetsMinimumRequirements(
  simCase: CaseMinimumRequirementFields,
): boolean {
  return hasText(simCase.first_name)
    && hasText(simCase.last_name)
    && hasText(simCase.description)
    && hasText(simCase.date_of_birth);
}
