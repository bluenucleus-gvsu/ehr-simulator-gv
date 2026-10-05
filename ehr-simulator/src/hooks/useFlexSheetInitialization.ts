import { useMemo } from "react";
import { buildTableTemplate } from "@/lib/flexSheet/flexSheetTemplate";
import { buildAssessmentToolGuide } from "@/lib/flexSheet/assessmentToolGuides";
import { CaseBundle } from "@/actions/case_builder/getCase";
import { buildChartingRowsFromBundle } from "@/lib/flexSheet/flexSheetRowGenerator";
import { DatabaseDocumentation } from "@/actions/simulation";

export function useFlexSheetInitialization(
  caseBundle: CaseBundle | null,
  documentation: DatabaseDocumentation[]
) {
  const chartingSections = useMemo(() => {
    return caseBundle?.caseRow.flexsheet_sections ?? [];
  }, [caseBundle]);

  const flexSheetTemplate = useMemo(
    () => buildTableTemplate(new Set(chartingSections)),
    [chartingSections]
  );

  const initialCharting = useMemo(
    () => buildChartingRowsFromBundle(documentation, flexSheetTemplate),
    [documentation, flexSheetTemplate]
  );

  const assessmentToolGuides = useMemo(() => {
    return buildAssessmentToolGuide(chartingSections);
  }, [chartingSections]);

  return {
    initialCharting,
    assessmentToolGuides,
  };
}