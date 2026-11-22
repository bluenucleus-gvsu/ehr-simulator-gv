import { routes } from "@/lib/routes";

export type CaseBuilderStep = {
  path: string;
  label: string;
};

export const CASE_BUILDER_STEPS: CaseBuilderStep[] = [
  { path: routes.workspace.caseBuilder.form.getHref("demographics"), label: "Demographics" },
  { path: routes.workspace.caseBuilder.form.getHref("history"), label: "History" },
  { path: routes.workspace.caseBuilder.form.getHref("notes"), label: "Notes" },
  { path: routes.workspace.caseBuilder.form.getHref("orders"), label: "Orders" },
  { path: routes.workspace.caseBuilder.form.getHref("table-template"), label: "FlexSheet Template" },
  { path: routes.workspace.caseBuilder.form.getHref("labs"), label: "Labs" },
  { path: routes.workspace.caseBuilder.form.getHref("charting"), label: "Charting" },
  { path: routes.workspace.caseBuilder.form.getHref("intake-output"), label: "I/O" },
  { path: routes.workspace.caseBuilder.form.getHref("medications"), label: "Med orders" },
  { path: routes.workspace.caseBuilder.form.getHref("medication-administrations"), label: "MAR" },
  { path: routes.workspace.caseBuilder.form.getHref("media"), label: "Media" },
  { path: routes.workspace.caseBuilder.form.getHref("review"), label: "Review" },
];
