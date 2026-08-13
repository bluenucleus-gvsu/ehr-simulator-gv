import {
  FlexSheetSection
} from "@/app/simulation/[caseId]/[sessionId]/chart/charting/components/flexSheetSections";

export interface chartingOptions {
  subsetId: string;
  label: string;
};

export interface FlexSheetData {
  id: string;
  field: string;
  componentType: 'input' | 'assessmentselect' | 'static' | 'checkboxlist' | 'totalScoreRow' | 'static';
  rowType?: string;
  chartingOptions?: chartingOptions[];
  wdlDescription?: { assessment: string, description: string }[];
  normalRange?: { low: number, high: number },
  hideable?: boolean,
  assessmentSubsets?: { subsetId: string, label: string }[];
  toolId?: string;
  [key: string]: string | string[] | number | boolean | undefined | { subsetId: string, label: string }[] | { low: number, high: number } | { assessment: string, description: string }[];
};

interface AssessmentToolCategories {
  name: string,
  scoringOptions: { rating: string, description: string }[]
}

interface ScoreInterpretation {
  result: string
  range: string,
  description: string,
  action?: string
}

export interface AssessmentToolGuide {
  name: string,
  categories: AssessmentToolCategories[],
  maxScore?: string,
  interpretations?: ScoreInterpretation[]
}

// This set represents the FlexSheet template selections made by an admin in the Case Builder.
// In the future, these values would be fetched from Supabase, but this requires new forms
// in the case builder to allow admin to make FlexSheet template selections.
export const tempSelectionSet = new Set<FlexSheetSection>([
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
  FlexSheetSection.MUSCULOSKELETAL,
  FlexSheetSection.GENTIOURINARY,
  FlexSheetSection.IV_1,
  FlexSheetSection.IV_2,
  FlexSheetSection.NURSING_CARE,
  FlexSheetSection.CIWA,
]);