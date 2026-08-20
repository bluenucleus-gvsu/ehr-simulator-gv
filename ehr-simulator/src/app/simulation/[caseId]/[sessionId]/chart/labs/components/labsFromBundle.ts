"use client";

import { LAB_FIELD_TO_COLUMN, type LabResultInsert } from "@/lib/labTypes";
import type { LabTableData, ImagingData, MicrobiologyReportData } from "./labsData";

type DbLabResult = {
  id?: string | null;
  time_offset?: number | null;
  [key: string]: unknown;
};

type DbImagingReport = {
  lab_id?: string | null;
  name?: string | null;
  technique?: string | null;
  findings?: unknown;
  impressions?: string[] | null;
  is_critical?: boolean | null;
};

type DbMicrobiologyReport = {
  lab_id?: string | null;
  name?: string | null;
  sample_type?: string | null;
  appearance?: string | null;
  microscopy?: string | null;
  location?: string | null;
  culture_results?: string | null;
  sensitivity?: string | null;
  comments?: string | null;
  reporter?: string | null;
  is_critical?: string | boolean | null;
};

type BundleLike = {
  labResults?: DbLabResult[];
  imagingReports?: DbImagingReport[];
  microbiologyReports?: DbMicrobiologyReport[];
} | null;

function toDisplayValue(value: unknown): string {
  if (value == null || value === "") return "";
  return String(value);
}

function normalizeFindings(findings: unknown): { region: string; description: string }[] {
  if (Array.isArray(findings)) {
    return findings
      .map((entry) => {
        const row = entry as { region?: unknown; description?: unknown };
        return {
          region: String(row.region ?? "Findings"),
          description: String(row.description ?? ""),
        };
      })
      .filter((entry) => entry.description.trim().length > 0);
  }

  if (findings && typeof findings === "object") {
    return Object.entries(findings as Record<string, unknown>)
      .map(([region, description]) => ({
        region,
        description: String(description ?? ""),
      }))
      .filter((entry) => entry.description.trim().length > 0);
  }

  if (typeof findings === "string" && findings.trim().length > 0) {
    return [{ region: "Findings", description: findings }];
  }

  return [];
}

function hasRenderableValue(value: unknown): boolean {
  if (typeof value === "string") return value.trim().length > 0;
  if (value && typeof value === "object") return Object.keys(value as object).length > 0;
  return Boolean(value);
}

function toIsCritical(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.toLowerCase();
    return normalized === "true" || normalized === "critical" || normalized === "yes";
  }
  return false;
}

export function buildLabRowsFromBundle(
  bundle: BundleLike,
  template: LabTableData[],
): { rows: LabTableData[]; timePoints: number[], timePointsInPresim: number[] } {
  const labResults = bundle?.labResults ?? [];
  const imagingReports = bundle?.imagingReports ?? [];
  const microbiologyReports = bundle?.microbiologyReports ?? [];

  const timePoints = Array.from(
    new Set(
      labResults
        .map((row) => row.time_offset)
        .filter((offset): offset is number => typeof offset === "number"),
    ),
  ).sort((a, b) => a - b);

  const timePointsInPresim = Array.from(new Set(
    labResults
      .filter((row) => Boolean(row?.is_in_presim))
      .map((row) => Number(row.time_offset))
  )).sort((a, b) => a - b);;

  const labByOffset = new Map<number, DbLabResult>();
  const labOffsetById = new Map<string, number>();
  for (const lab of labResults) {
    if (typeof lab.time_offset === "number") {
      labByOffset.set(lab.time_offset, lab);
    }
    if (lab.id && typeof lab.time_offset === "number") {
      labOffsetById.set(lab.id, lab.time_offset);
    }
  }

  const imagingByOffsetAndName = new Map<string, DbImagingReport>();
  for (const report of imagingReports) {
    if (!report.lab_id || !report.name) continue;
    const offset = labOffsetById.get(report.lab_id);
    if (typeof offset !== "number") continue;
    imagingByOffsetAndName.set(`${offset}|${report.name}`, report);
  }

  const microbiologyByOffsetAndName = new Map<string, DbMicrobiologyReport>();
  for (const report of microbiologyReports) {
    if (!report.lab_id || !report.name) continue;
    const offset = labOffsetById.get(report.lab_id);
    if (typeof offset !== "number") continue;
    microbiologyByOffsetAndName.set(`${offset}|${report.name}`, report);
  }

  const rows = template
    .map((templateRow) => {
      const nextRow: LabTableData = {
        field: templateRow.field,
        rowType: templateRow.rowType,
        unit: templateRow.unit,
        normalRange: templateRow.normalRange,
        criticalRange: templateRow.criticalRange,
        hideable: templateRow.hideable,
      };

      if (templateRow.rowType === "results") {
        const mappedColumn = LAB_FIELD_TO_COLUMN[templateRow.field] as keyof LabResultInsert | undefined;
        for (const offset of timePoints) {
          const source = labByOffset.get(offset);
          const unstructured = source?.data && typeof source.data === "object"
            ? (source.data as { unstructured?: Record<string, unknown> }).unstructured
            : undefined;
          const value = mappedColumn
            ? source?.[mappedColumn as string]
            : unstructured?.[templateRow.field];
          nextRow[offset] = toDisplayValue(value);
        }
      }

      if (templateRow.rowType === "imaging") {
        for (const offset of timePoints) {
          const report = imagingByOffsetAndName.get(`${offset}|${templateRow.field}`);
          if (!report) {
            nextRow[offset] = {};
            continue;
          }
          const mapped: ImagingData = {
            displayName: report.name ?? templateRow.field,
            technique: report.technique ?? "N/A",
            findings: normalizeFindings(report.findings),
            impressions: report.impressions ?? [],
            isCritical: Boolean(report.is_critical),
          };
          nextRow[offset] = mapped;
        }
      }

      if (templateRow.rowType === "microbiology") {
        for (const offset of timePoints) {
          const report = microbiologyByOffsetAndName.get(`${offset}|${templateRow.field}`);
          if (!report) {
            nextRow[offset] = {};
            continue;
          }
          const mapped: MicrobiologyReportData = {
            sampleType: report.sample_type ?? report.name ?? "N/A",
            appearance: report.appearance ?? "N/A",
            microscopy: report.microscopy ?? "N/A",
            location: report.location ?? undefined,
            cultureResults: report.culture_results ?? "N/A",
            sensitivity: report.sensitivity ?? "N/A",
            comments: report.comments ?? "N/A",
            reporter: report.reporter ?? "N/A",
            isCritical: toIsCritical(report.is_critical),
          };
          nextRow[offset] = mapped;
        }
      }

      return nextRow;
    })
    .filter((row) => {
      if (!row.hideable) return true;
      return timePoints.some((offset) => hasRenderableValue(row[offset]));
    });

  return { rows, timePoints, timePointsInPresim };
}
