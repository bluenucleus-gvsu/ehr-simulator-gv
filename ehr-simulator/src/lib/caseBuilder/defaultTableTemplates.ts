import { FlexSheetSection } from "../flexSheet/flexSheetSections";
import { CaseSpecialty } from "../flexSheet/flexSheetTemplate";

export const flexSheetSectionNameMap: Partial<Record<FlexSheetSection, string>> = {
  [FlexSheetSection.VITALS]: 'Vital Signs',
  [FlexSheetSection.INPUT]: 'Input Rows',
  [FlexSheetSection.OUTPUT]: 'Output Rows',
  [FlexSheetSection.BASE_PAIN]: 'Numeric Pain Scale and Descriptors',
  [FlexSheetSection.FACES_PAIN]: 'Faces Pain Scale',
  [FlexSheetSection.GENERAL_APPEARANCE]: 'General Appearance',
  [FlexSheetSection.PSYCHOSOCIAL]: 'Psychosocial Assessment',
  [FlexSheetSection.HEENT]: 'HEENT',
  [FlexSheetSection.NEURO]: 'Neurological',
  [FlexSheetSection.INTEGUMENT]: 'Integumentary',
  [FlexSheetSection.CARDIAC]: 'Cardiovascular',
  [FlexSheetSection.RESPIRATORY]: 'Respiratory',
  [FlexSheetSection.WOUND]: 'Wound Assessment',
  [FlexSheetSection.GI]: 'Gastrointestinal',
  [FlexSheetSection.GENTIOURINARY]: 'Genitourinary',
  [FlexSheetSection.MUSCULOSKELETAL]: 'Musculoskeletal',
  [FlexSheetSection.IV_1]: 'Peripheral IV 1',
  [FlexSheetSection.IV_2]: 'Peripheral IV 2',
  [FlexSheetSection.NURSING_CARE]: 'Nursing Care',
  [FlexSheetSection.BRADEN]: 'Braden Scale',
  [FlexSheetSection.CIWA]: 'CIWA-Ar Scale',
  [FlexSheetSection.MORSE]: 'Morse Fall Scale',
  [FlexSheetSection.PAINAD]: 'PAINAD Scale',
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
  FlexSheetSection.IV_1,
  FlexSheetSection.NURSING_CARE,
  // Add OB specific sections as needed
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