import { describe, expect, it } from "vitest";
import { FlexSheetSection, flexSheetSections } from "@/lib/flexSheet/flexSheetSections";
import { buildOverviewTemplate, buildTableTemplate } from "@/lib/flexSheet/flexSheetTemplate";

describe("buildTableTemplate", () => {
  it("returns an empty array for an empty selection", () => {
    expect(buildTableTemplate(new Set())).toEqual([]);
  });

  it("returns exactly the selected section's rows, in order", () => {
    expect(buildTableTemplate(new Set([FlexSheetSection.VITALS])))
      .toEqual([...flexSheetSections[FlexSheetSection.VITALS]]);
  });

  it("orders sections by the canonical template order, not set insertion order", () => {
    expect(
      buildTableTemplate(new Set([
        FlexSheetSection.INPUT,
        FlexSheetSection.VITALS,
        FlexSheetSection.OUTPUT,
      ])),
    ).toEqual([
      ...flexSheetSections[FlexSheetSection.VITALS],
      ...flexSheetSections[FlexSheetSection.INPUT],
      ...flexSheetSections[FlexSheetSection.OUTPUT],
    ]);
  });

  it("ignores vitals_overview, which is not a template section", () => {
    expect(buildTableTemplate(new Set([FlexSheetSection.VITALS_OVERVIEW]))).toEqual([]);
  });

  it("includes every supported section exactly ONCE when all are selected", () => {
    const allSections = Object.values(FlexSheetSection)
      .filter((section) => section !== FlexSheetSection.VITALS_OVERVIEW);

    const result = buildTableTemplate(new Set(allSections));

    expect(result).toHaveLength(
      allSections.reduce((total, section) => total + flexSheetSections[section].length, 0),
    );

    const ids = result.map((row) => row.id);
    allSections.forEach((section) => {
      flexSheetSections[section].forEach((row) => {
        expect(ids).toContain(row.id);
      });
    });
  });

  it("tags assessment tool rows with their toolId so their scores can be dynamically calculated", () => {
    const result = buildTableTemplate(new Set([FlexSheetSection.CIWA]));

    expect(result.length).toBeGreaterThan(0);
    expect(result.filter((row) => row.toolId).every((row) => row.toolId === "ciwa")).toBe(true);
  });

  it("never adds totalScoreRow rows (they are derived at render time)", () => {
    const result = buildTableTemplate(new Set([
      FlexSheetSection.CIWA,
      FlexSheetSection.MORSE,
      FlexSheetSection.BRADEN,
      FlexSheetSection.PAINAD,
    ]));

    expect(result.every((row) => row.componentType !== "totalScoreRow")).toBe(true);
  });
});

describe("buildOverviewTemplate", () => {
  it("returns the vitals overview rows", () => {
    expect(buildOverviewTemplate()).toEqual([
      ...flexSheetSections[FlexSheetSection.VITALS_OVERVIEW],
    ]);
  });

  it("contains the seven overview fields with no title row", () => {
    const ids = buildOverviewTemplate().map((row) => row.id);
    expect(ids).toEqual(["hr", "bp", "mean_arterial_pressure", "rr", "temp", "spo2", "weight_kg"]);
    expect(buildOverviewTemplate().every((row) => !row.rowType)).toBe(true);
  });

  it("is independent of selections and returns a distinct array per call", () => {
    const first = buildOverviewTemplate();
    const second = buildOverviewTemplate();

    expect(first).toEqual(second);
    expect(first).not.toBe(second);
  });

  it("preserves normalRange used by the alert flag logic", () => {
    const hr = buildOverviewTemplate().find((row) => row.id === "hr");
    expect(hr?.normalRange).toEqual({ low: 60, high: 100 });
  });
});