import { FlexSheetSection } from "@/lib/flexSheet/flexSheetSections";

export interface ChartingOptions {
  subsetId: string;
  label: string;
};

export interface FlexSheetData {
  id: string;
  field: string;
  componentType: 'input' | 'assessmentselect' | 'static' | 'checkboxlist' | 'totalScoreRow' | 'static';
  rowType?: string;
  chartingOptions?: ChartingOptions[];
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
  id: FlexSheetSection,
  name: string,
  categories: AssessmentToolCategories[],
  maxScore?: string,
  interpretations?: ScoreInterpretation[]
}

export type FlexSheetPayload = {
  data: FlexSheetData[];
  timePoints: number[];
  timePointsInPreSim: Set<number>;
};

