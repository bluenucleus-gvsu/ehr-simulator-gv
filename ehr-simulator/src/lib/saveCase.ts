export const CaseSection = {
  DEMOGRAPHICS: "DEMOGRAPHICS",
  HISTORY: "HISTORY",
  CLINICAL_DOCUMENTS: "CLINICAL_DOCUMENTS",
  ORDERS: "ORDERS",
  LABS: "LABS",
  DOCUMENTATION: "DOCUMENTATION",
  MEDICATION_ORDERS: "MEDICATION_ORDERS",
} as const;

export type CaseSection = typeof CaseSection[keyof typeof CaseSection];
