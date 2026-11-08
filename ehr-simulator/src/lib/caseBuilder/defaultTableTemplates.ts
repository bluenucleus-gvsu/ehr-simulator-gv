import { FlexSheetSection } from "../flexSheet/flexSheetSections";
import { CaseSpecialty } from "../flexSheet/flexSheetTemplate";

export const flexSheetSectionNameMap: Partial<Record<FlexSheetSection, string>> = {
  [FlexSheetSection.VITALS]: 'Vital Signs',
  [FlexSheetSection.INPUT]: 'Input Rows',
  [FlexSheetSection.OUTPUT]: 'Output Rows',
  [FlexSheetSection.QBL]: "Quantified Blood Loss",
  [FlexSheetSection.BASE_PAIN]: 'Numeric Pain Scale and Descriptors',
  [FlexSheetSection.FACES_PAIN]: 'Faces Pain Scale',
  [FlexSheetSection.GENERAL_APPEARANCE]: 'General Appearance',
  [FlexSheetSection.PSYCHOSOCIAL]: 'Psychosocial Assessment',
  [FlexSheetSection.FETAL]: 'Fetal Assessment',
  [FlexSheetSection.REPRODUCTIVE]: 'Reproductive Assessment',
  [FlexSheetSection.HEENT]: 'HEENT Assessment',
  [FlexSheetSection.NEURO]: 'Neurological Assessment',
  [FlexSheetSection.INTEGUMENT]: 'Integumentary Assessment',
  [FlexSheetSection.CARDIAC]: 'Cardiovascular Assessment',
  [FlexSheetSection.RESPIRATORY]: 'Respiratory Assessment',
  [FlexSheetSection.WOUND]: 'Wound Assessment',
  [FlexSheetSection.GI]: 'GI Assessment',
  [FlexSheetSection.GENTIOURINARY]: 'GU Assessment',
  [FlexSheetSection.MUSCULOSKELETAL]: 'Musculoskeletal Assessment',
  [FlexSheetSection.IV_1]: 'Peripheral IV 1',
  [FlexSheetSection.IV_2]: 'Peripheral IV 2',
  [FlexSheetSection.NURSING_CARE]: 'Nursing Care',
  [FlexSheetSection.BRADEN]: 'Braden Scale',
  [FlexSheetSection.CIWA]: 'CIWA-Ar Scale',
  [FlexSheetSection.MORSE]: 'Morse Fall Scale',
  [FlexSheetSection.PAINAD]: 'PAINAD Scale',
  [FlexSheetSection.PHQ9]: "PHQ-9 Scale",
  [FlexSheetSection.CSSRS]: "C-SSRS Scale"
};

const defaultMedSurgSections = [
  FlexSheetSection.VITALS,
  FlexSheetSection.INPUT,
  FlexSheetSection.OUTPUT,
  FlexSheetSection.BASE_PAIN,
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
  FlexSheetSection.NURSING_CARE,
]

const defaultObSections = [
  FlexSheetSection.VITALS,
  FlexSheetSection.INPUT,
  FlexSheetSection.OUTPUT,
  FlexSheetSection.QBL,
  FlexSheetSection.BASE_PAIN,
  FlexSheetSection.GENERAL_APPEARANCE,
  FlexSheetSection.PSYCHOSOCIAL,
  FlexSheetSection.FETAL,
  FlexSheetSection.REPRODUCTIVE,
  FlexSheetSection.HEENT,
  FlexSheetSection.NEURO,
  FlexSheetSection.INTEGUMENT,
  FlexSheetSection.CARDIAC,
  FlexSheetSection.RESPIRATORY,
  FlexSheetSection.GI,
  FlexSheetSection.GENTIOURINARY,
  FlexSheetSection.MUSCULOSKELETAL,
  FlexSheetSection.IV_1,
  FlexSheetSection.NURSING_CARE,
]

const defaultMentalHealthSections = [
  FlexSheetSection.VITALS,
  FlexSheetSection.BASE_PAIN,
  FlexSheetSection.GENERAL_APPEARANCE,
  FlexSheetSection.PSYCHOSOCIAL,
  FlexSheetSection.HEENT,
  FlexSheetSection.NEURO,
  FlexSheetSection.INTEGUMENT,
  FlexSheetSection.NURSING_CARE,
  FlexSheetSection.PHQ9,
  FlexSheetSection.CSSRS
]

const defaultPublicHealthSections = [
  FlexSheetSection.VITALS,
  FlexSheetSection.BASE_PAIN,
  FlexSheetSection.GENERAL_APPEARANCE,
  FlexSheetSection.PSYCHOSOCIAL,
  FlexSheetSection.HEENT,
  FlexSheetSection.NEURO,
  FlexSheetSection.INTEGUMENT,
  FlexSheetSection.CARDIAC,
  FlexSheetSection.RESPIRATORY,
  FlexSheetSection.GI,
  FlexSheetSection.GENTIOURINARY,
  FlexSheetSection.MUSCULOSKELETAL,
  FlexSheetSection.NURSING_CARE,
]

export const specialtyDefaultSections: Record<CaseSpecialty, FlexSheetSection[]> = {
  [CaseSpecialty.MED_SURG]: defaultMedSurgSections,
  [CaseSpecialty.OB]: defaultObSections,
  [CaseSpecialty.MENTAL_HEALTH]: defaultMentalHealthSections,
  [CaseSpecialty.PUBLIC_HEALTH]: defaultPublicHealthSections
}

function setsEqual(a: Set<FlexSheetSection>, b: Set<FlexSheetSection>): boolean {
  return a.size === b.size && [...a].every((value) => b.has(value));
}

export function resolveInitialSections(
  savedSections: FlexSheetSection[],
  currentSpecialty: CaseSpecialty,
): FlexSheetSection[] {
  if (savedSections.length === 0) {
    return specialtyDefaultSections[currentSpecialty];
  }

  const saved = new Set(savedSections);
  const matchesASpecialtysDefaults = (Object.values(CaseSpecialty) as CaseSpecialty[])
    .some((specialty) => setsEqual(new Set(specialtyDefaultSections[specialty]), saved));

  return matchesASpecialtysDefaults ? specialtyDefaultSections[currentSpecialty] : savedSections;
}