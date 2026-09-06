export interface ClinicalNote {
  title: string;
  author: string;
  specialty: string;
  timeOffset: number;
  excludedFromPresim: boolean;
  content: string;
  phase?: number;
}
