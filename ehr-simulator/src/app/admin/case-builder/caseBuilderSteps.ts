export const CASE_BUILDER_BASE = "/admin/case-builder/form";

export type CaseBuilderStep = {
  path: string;
  label: string;
};

export const CASE_BUILDER_STEPS: CaseBuilderStep[] = [
  { path: `${CASE_BUILDER_BASE}/demographics`, label: "Demographics" },
  { path: `${CASE_BUILDER_BASE}/history`, label: "History" },
  { path: `${CASE_BUILDER_BASE}/notes`, label: "Notes" },
  { path: `${CASE_BUILDER_BASE}/orders`, label: "Orders" },
  { path: `${CASE_BUILDER_BASE}/labs`, label: "Labs" },
  { path: `${CASE_BUILDER_BASE}/charting`, label: "Charting" },
  { path: `${CASE_BUILDER_BASE}/intake-output`, label: "I/O" },
  { path: `${CASE_BUILDER_BASE}/medications`, label: "Med orders" },
  { path: `${CASE_BUILDER_BASE}/medication-administrations`, label: "MAR" },
  { path: `${CASE_BUILDER_BASE}/media`, label: "Media"},
  { path: `${CASE_BUILDER_BASE}/review`, label: "Review" },
];
