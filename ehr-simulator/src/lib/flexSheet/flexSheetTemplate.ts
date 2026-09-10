import { addRows, FlexSheetSection } from "@/lib/flexSheet/flexSheetSections";
import { Database } from "@/../database.types";
import { FlexSheetData } from "./flexSheetTypes";

export const CaseSpecialty = {
  MED_SURG: "med_surg",
  OB: "ob",
  MENTAL_HEALTH: "mental_health",
  PUBLIC_HEALTH: "public_health",
} as const;

export type CaseSpecialty = Database['public']['Enums']['case_specialty_type'];

function buildMedSurgTemplate(selections: Set<string>) {
  const allAvailableMedSurgSections = [
    FlexSheetSection.VITALS,
    FlexSheetSection.INPUT,
    FlexSheetSection.OUTPUT,
    FlexSheetSection.BASE_PAIN,
    FlexSheetSection.FACES_PAIN,
    FlexSheetSection.GENERAL_APPEARANCE,
    FlexSheetSection.PSYCHOSOCIAL,
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
    FlexSheetSection.BRADEN,
    FlexSheetSection.CIWA,
    FlexSheetSection.MORSE,
    FlexSheetSection.PAINAD
  ];

  const customTemplate = allAvailableMedSurgSections
    .filter(section => selections.has(section))
    .flatMap(section => addRows(section));

  return customTemplate
}

// Simple template for Vital Sign card in Overview tab
export function buildOverviewTemplate() {
  return addRows(FlexSheetSection.VITALS_OVERVIEW);
}


export function buildFlexSheetTemplate(specialty: CaseSpecialty | null, selections: Set<string>) {
  let template: FlexSheetData[] = [];

  if (!specialty) {
    return template
  }
  switch (specialty) {
    case CaseSpecialty.MED_SURG:
      template = buildMedSurgTemplate(selections);
      break;
    case CaseSpecialty.OB:
      //template = assembleObTemplate(toolSelections);
      break;
    case CaseSpecialty.MENTAL_HEALTH:
      //template = assembleMentalHealthTemplate(toolSelections);
      break;
    case CaseSpecialty.PUBLIC_HEALTH:
      // template = assemblePublicHealthTemplate(toolSelections);
      break;
  }

  return template;
}

