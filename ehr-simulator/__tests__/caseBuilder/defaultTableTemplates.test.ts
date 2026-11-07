import { describe, expect, it } from "vitest";

import { CaseSpecialty } from "@/lib/flexSheet/flexSheetTemplate";
import { FlexSheetSection } from "@/lib/flexSheet/flexSheetSections";
import {
  resolveInitialSections,
  specialtyDefaultSections,
} from "@/lib/caseBuilder/defaultTableTemplates";

function asSet(sections: FlexSheetSection[]): Set<FlexSheetSection> {
  return new Set(sections);
}

describe("resolveInitialSections", () => {
  it("derives defaults from the current specialty when nothing is saved", () => {
    const result = resolveInitialSections([], CaseSpecialty.OB);
    expect(asSet(result)).toEqual(asSet(specialtyDefaultSections[CaseSpecialty.OB]));
  });

  it("re-derives from the new specialty when the saved template is untouched med-surg defaults", () => {
    const result = resolveInitialSections(
      specialtyDefaultSections[CaseSpecialty.MED_SURG],
      CaseSpecialty.OB,
    );
    expect(asSet(result)).toEqual(asSet(specialtyDefaultSections[CaseSpecialty.OB]));
  });

  it("re-derives from the new specialty when the saved template matches any specialty's defaults", () => {
    const result = resolveInitialSections(
      specialtyDefaultSections[CaseSpecialty.MENTAL_HEALTH],
      CaseSpecialty.PUBLIC_HEALTH,
    );
    expect(asSet(result)).toEqual(asSet(specialtyDefaultSections[CaseSpecialty.PUBLIC_HEALTH]));
  });

  it("re-derives the same defaults when the saved template matches the current specialty", () => {
    const result = resolveInitialSections(
      specialtyDefaultSections[CaseSpecialty.OB],
      CaseSpecialty.OB,
    );
    expect(asSet(result)).toEqual(asSet(specialtyDefaultSections[CaseSpecialty.OB]));
  });

  it("keeps a customized saved template even when the specialty changed", () => {
    const customized = [
      ...specialtyDefaultSections[CaseSpecialty.MED_SURG],
      FlexSheetSection.FETAL,
    ];
    const result = resolveInitialSections(customized, CaseSpecialty.OB);
    expect(asSet(result)).toEqual(asSet(customized));
  });

  it("keeps a saved template that matches no specialty's defaults", () => {
    const custom = [FlexSheetSection.VITALS, FlexSheetSection.CIWA, FlexSheetSection.BRADEN];
    const result = resolveInitialSections(custom, CaseSpecialty.OB);
    expect(asSet(result)).toEqual(asSet(custom));
  });

  it("is order-insensitive when comparing the saved template to specialty defaults", () => {
    const shuffled = [...specialtyDefaultSections[CaseSpecialty.MED_SURG]].reverse();
    const result = resolveInitialSections(shuffled, CaseSpecialty.OB);
    expect(asSet(result)).toEqual(asSet(specialtyDefaultSections[CaseSpecialty.OB]));
  });
});
