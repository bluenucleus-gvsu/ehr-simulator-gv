import { describe, expect, it } from "vitest";

import {
  getResultStatus,
  LabSeverityLevel,
} from "@/app/simulation/[caseId]/[sessionId]/chart/labs/components/labsData";

const potassium = { low: 3.5, high: 5.0 };
const criticalPotassium = { low: 3.0, high: 6.0 };

describe("getResultStatus", () => {
  it("returns NORMAL for values inside the normal range", () => {
    expect(getResultStatus("4.2", potassium, criticalPotassium)).toBe(LabSeverityLevel.NORMAL);
    expect(getResultStatus("3.5", potassium, criticalPotassium)).toBe(LabSeverityLevel.NORMAL);
    expect(getResultStatus("5.0", potassium, criticalPotassium)).toBe(LabSeverityLevel.NORMAL);
  });

  it("returns ABNORMAL for values above or below the normal range", () => {
    expect(getResultStatus("5.4", potassium, criticalPotassium)).toBe(LabSeverityLevel.ABNORMAL);
    expect(getResultStatus("3.2", potassium, criticalPotassium)).toBe(LabSeverityLevel.ABNORMAL);
  });

  it("returns CRITICAL for values beyond the critical range", () => {
    expect(getResultStatus("6.8", potassium, criticalPotassium)).toBe(LabSeverityLevel.CRITICAL);
    expect(getResultStatus("2.1", potassium, criticalPotassium)).toBe(LabSeverityLevel.CRITICAL);
  });

  it("treats the critical range bounds as abnormal, not critical", () => {
    expect(getResultStatus("3.0", potassium, criticalPotassium)).toBe(LabSeverityLevel.ABNORMAL);
    expect(getResultStatus("6.0", potassium, criticalPotassium)).toBe(LabSeverityLevel.ABNORMAL);
  });

  it("gives critical range precedence over the normal range", () => {
    expect(getResultStatus("6.5", potassium, criticalPotassium)).toBe(LabSeverityLevel.CRITICAL);
    expect(getResultStatus("2.5", potassium, criticalPotassium)).toBe(LabSeverityLevel.CRITICAL);
  });

  it("classifies with only a normal range", () => {
    expect(getResultStatus("135", { low: 135, high: 145 }, undefined)).toBe(LabSeverityLevel.NORMAL);
    expect(getResultStatus("120", { low: 135, high: 145 }, undefined)).toBe(LabSeverityLevel.ABNORMAL);
  });

  it("classifies with only a critical range", () => {
    expect(getResultStatus("5.5", undefined, criticalPotassium)).toBe(LabSeverityLevel.NORMAL);
    expect(getResultStatus("6.5", undefined, criticalPotassium)).toBe(LabSeverityLevel.CRITICAL);
  });

  it("returns NORMAL for numeric values with no ranges", () => {
    expect(getResultStatus("7.35", undefined, undefined)).toBe(LabSeverityLevel.NORMAL);
    expect(getResultStatus("-5", undefined, undefined)).toBe(LabSeverityLevel.NORMAL);
  });

  it("parses decimal and negative string values", () => {
    expect(getResultStatus("7.35", { low: 7.35, high: 7.45 }, undefined)).toBe(LabSeverityLevel.NORMAL);
    expect(getResultStatus("-0.5", { low: 0, high: 1 }, undefined)).toBe(LabSeverityLevel.ABNORMAL);
  });

  it("returns null for non-numeric and blank values", () => {
    expect(getResultStatus("O+", undefined, undefined)).toBeNull();
    expect(getResultStatus("", potassium, undefined)).toBeNull();
    expect(getResultStatus("<0.1", undefined, undefined)).toBeNull();
    expect(getResultStatus("trace", undefined, undefined)).toBeNull();
  });
});