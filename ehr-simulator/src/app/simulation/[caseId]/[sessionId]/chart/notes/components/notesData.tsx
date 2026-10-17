export interface ClinicalNote {
  title: string;
  author: string;
  specialty: string;
  /** Authored display offset (minutes relative to sim start; negative = pre-sim). NULL/undefined = release-live (staged). */
  timeOffset: number | null;
  excludedFromPresim: boolean;
  content: string;
  phase?: number;
  label?: string | null;
}
