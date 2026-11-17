import { routes } from "@/lib/routes";

export type CaseBuilderStep = {
  path: string;
  label: string;
};

export const CASE_BUILDER_STEPS: CaseBuilderStep[] = [
  { path: routes.admin.caseBuilder.form.getHref("demographics"), label: "Demographics" },
  { path: routes.admin.caseBuilder.form.getHref("history"), label: "History" },
  { path: routes.admin.caseBuilder.form.getHref("notes"), label: "Notes" },
  { path: routes.admin.caseBuilder.form.getHref("orders"), label: "Orders" },
  { path: routes.admin.caseBuilder.form.getHref("table-template"), label: "FlexSheet Template" },
  { path: routes.admin.caseBuilder.form.getHref("labs"), label: "Labs" },
  { path: routes.admin.caseBuilder.form.getHref("charting"), label: "Charting" },
  { path: routes.admin.caseBuilder.form.getHref("intake-output"), label: "I/O" },
  { path: routes.admin.caseBuilder.form.getHref("medications"), label: "Med orders" },
  { path: routes.admin.caseBuilder.form.getHref("medication-administrations"), label: "MAR" },
  { path: routes.admin.caseBuilder.form.getHref("media"), label: "Media" },
  { path: routes.admin.caseBuilder.form.getHref("review"), label: "Review" },
];
