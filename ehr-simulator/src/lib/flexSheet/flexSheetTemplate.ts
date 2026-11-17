import { addRows, FlexSheetSection } from "@/lib/flexSheet/flexSheetSections";
import { Database } from "@/../database.types";

export const CaseSpecialty = {
  MED_SURG: "med_surg",
  OB: "ob",
  MENTAL_HEALTH: "mental_health",
  PUBLIC_HEALTH: "public_health",
} as const;

export type CaseSpecialty = Database['public']['Enums']['case_specialty_type'];

export function buildTableTemplate(selections: Set<FlexSheetSection>) {
  // The ordering of sections in this array is intentional; it determines 
  // the FlexSheet layout. Do not change unless you understand the nursing 
  // implications of your decision.
  const allTableSections = [
    FlexSheetSection.VITALS,
    FlexSheetSection.INPUT,
    FlexSheetSection.OUTPUT,
    FlexSheetSection.QBL,
    FlexSheetSection.BASE_PAIN,
    FlexSheetSection.FACES_PAIN,
    FlexSheetSection.GENERAL_APPEARANCE,
    FlexSheetSection.PSYCHOSOCIAL,
    FlexSheetSection.REPRODUCTIVE,
    FlexSheetSection.FETAL,
    FlexSheetSection.HEENT,
    FlexSheetSection.NEURO,
    FlexSheetSection.INTEGUMENT,
    FlexSheetSection.CARDIAC,
    FlexSheetSection.RESPIRATORY,
    FlexSheetSection.WOUND,
    FlexSheetSection.GI,
    FlexSheetSection.GENTIOURINARY,
    FlexSheetSection.MUSCULOSKELETAL,
    FlexSheetSection.IV_1,
    FlexSheetSection.IV_2,
    FlexSheetSection.NURSING_CARE,
    FlexSheetSection.PHQ9,
    FlexSheetSection.CSSRS,
    FlexSheetSection.BRADEN,
    FlexSheetSection.CIWA,
    FlexSheetSection.MORSE,
    FlexSheetSection.PAINAD
  ];

  const customTemplate = allTableSections
    .filter(section => selections.has(section))
    .flatMap(section => addRows(section));

  return customTemplate
}

// Simple template for Vital Sign card in Overview tab
export function buildOverviewTemplate() {
  return addRows(FlexSheetSection.VITALS_OVERVIEW);
}
