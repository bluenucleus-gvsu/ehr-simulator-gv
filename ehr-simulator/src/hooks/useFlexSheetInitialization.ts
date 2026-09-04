import { useMemo } from "react";
import { buildFlexSheetTemplate } from "@/lib/flexSheet/flexSheetTemplate";
import { buildAssessmentToolGuide } from "@/lib/flexSheet/assessmentToolGuides";
import { CaseBundle } from "@/actions/case_builder/getCase";
import { buildChartingRowsFromBundle } from "@/lib/flexSheet/flexSheetRowGenerator";
import { DatabaseDocumentation } from "@/actions/simulation";

export function useFlexSheetInitialization(
  caseBundle: CaseBundle | null,
  documentation: DatabaseDocumentation[]
) {
  const { chartingSections, caseSpecialty } = useMemo(() => {
    const sections = caseBundle?.caseRow.flexsheet_sections;

    return {
      chartingSections: new Set(sections ?? []),
      caseSpecialty: caseBundle?.caseRow.case_specialty ?? null,
    };
  }, [caseBundle]);

  const flexSheetTemplate = useMemo(
    () => buildFlexSheetTemplate(caseSpecialty, chartingSections),
    [chartingSections, caseSpecialty]
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