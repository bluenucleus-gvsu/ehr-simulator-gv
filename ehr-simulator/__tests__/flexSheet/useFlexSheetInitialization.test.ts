import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useFlexSheetInitialization } from "@/hooks/useFlexSheetInitialization";
import { buildTableTemplate } from "@/lib/flexSheet/flexSheetTemplate";
import { FlexSheetSection } from "@/lib/flexSheet/flexSheetSections";
import type { CaseBundle } from "@/actions/case_builder/getCase";
import type { DatabaseDocumentation } from "@/actions/simulation";

function bundleWithSections(sections: FlexSheetSection[]): CaseBundle {
  return { caseRow: { flexsheet_sections: sections } } as unknown as CaseBundle;
}

function doc(overrides: Record<string, unknown> = {}): DatabaseDocumentation {
  return { time_offset: 0, is_in_presim: false, ...overrides } as DatabaseDocumentation;
}

function render(
  sections: FlexSheetSection[],
  documentation: DatabaseDocumentation[] = [],
  caseBundle: CaseBundle | null = null,
) {
  const bundle = caseBundle ?? bundleWithSections(sections);
  return renderHook(() => useFlexSheetInitialization(bundle, documentation)).result.current;
}

describe("useFlexSheetInitialization", () => {
  it("builds the charting rows from the selected sections", () => {
    const sections = [FlexSheetSection.VITALS, FlexSheetSection.INPUT, FlexSheetSection.CIWA];
    const { initialCharting } = render(sections);

    const expectedIds = buildTableTemplate(new Set(sections)).map((row) => row.id);
    expect(initialCharting.rows.map((row) => row.id)).toEqual(expectedIds);
    expect(initialCharting.timeOffsets).toEqual([0]);
  });

  it("maps documentation values into the template rows per offset", () => {
    const { initialCharting } = render(
      [FlexSheetSection.VITALS],
      [doc({ time_offset: 0, hr: "72" }), doc({ time_offset: 60, hr: "84" })],
    );

    const hr = initialCharting.rows.find((row) => row.id === "hr");
    expect(hr?.[0]).toBe("72");
    expect(hr?.[60]).toBe("84");
    expect(initialCharting.timeOffsets).toEqual([0, 60]);
  });

  it("derives sorted unique timeOffsets and the presim set from documentation", () => {
    const { initialCharting } = render(
      [FlexSheetSection.VITALS],
      [
        doc({ time_offset: 60, is_in_presim: true }),
        doc({ time_offset: 0, is_in_presim: false }),
        doc({ time_offset: 60, is_in_presim: true }),
      ],
    );

    expect(initialCharting.timeOffsets).toEqual([0, 60]);
    expect(initialCharting.timeOffsetsInPreSim).toEqual(new Set([60]));
  });

  it("falls back to offset 0 with empty cells when there is no documentation", () => {
    const { initialCharting } = render([FlexSheetSection.VITALS], []);

    expect(initialCharting.timeOffsets).toEqual([0]);
    expect(initialCharting.rows.length).toBeGreaterThan(0);
    expect(initialCharting.rows.every((row) => row[0] === "")).toBe(true);
  });

  it("handles empty sections and a null caseBundle without crashing", () => {
    const empty = render([]);
    expect(empty.initialCharting.rows).toEqual([]);

    const nullBundle = renderHook(() => useFlexSheetInitialization(null, [])).result.current;
    expect(nullBundle.initialCharting.rows).toEqual([]);
    expect(nullBundle.initialCharting.timeOffsets).toEqual([0]);
  });

  it("includes only the selected assessment tool guides and tags tool rows", () => {
    const { initialCharting, assessmentToolGuides } = render([
      FlexSheetSection.CIWA,
      FlexSheetSection.BRADEN,
    ]);

    expect(assessmentToolGuides.map((guide) => guide.id).sort()).toEqual(["braden", "ciwa"]);

    const toolRows = initialCharting.rows.filter((row) => row.toolId);
    expect(toolRows.length).toBeGreaterThan(0);
    expect(toolRows.every((row) => row.toolId === "ciwa" || row.toolId === "braden")).toBe(true);

    const noTools = render([FlexSheetSection.VITALS]);
    expect(noTools.assessmentToolGuides).toEqual([]);
  });
});