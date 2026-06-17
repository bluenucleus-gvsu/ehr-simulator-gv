"use server"

import { SupabaseClient } from "@supabase/supabase-js";
import { transformLabTableToSchema } from "@/lib/labTypes";
import { LabResultInsert, ImagingReportDraft, MicrobiologyReportDraft } from "@/lib/labTypes";

export async function updateLabs(
  supabase: SupabaseClient,
  payload: any,
  caseId: string,
  phase: number = 1,
) {
  const { labResults, imagingReports, microbiologyReports } = transformLabTableToSchema(
    caseId,
    {
      data: payload.data ?? [],
      timePoints: payload.timePoints ?? [],
      timePointsInPreSim: new Set(payload.timePointsInPreSim ?? []),
      visibleItems: new Set(payload.visibleItems ?? []),
    },
    phase,
  );

  const hasLabRows = labResults.length > 0;
  const hasImaging = imagingReports.length > 0;
  const hasMicro = microbiologyReports.length > 0;
  if (!hasLabRows && !hasImaging && !hasMicro) {
    return;
  }

  await deleteLabsForPhase(supabase, caseId, phase);
  const savedLabs = await saveLabs(supabase, labResults, phase);

  const labIdByOffset = new Map(
    (savedLabs ?? []).map((lab) => [
      `${lab.case_id}|${phase}|${lab.time_offset}`,
      lab.id,
    ]),
  );
  const savedLabIds = (savedLabs ?? []).map((x) => x.id);

  await deleteImagingReports(supabase, savedLabIds);
  const imagingRows = constructImagingRows(imagingReports, labIdByOffset, phase);
  await saveImagingReports(supabase, imagingRows);

  await deleteMicrobiologyReports(supabase, savedLabIds);
  const microbiologyRows = constructMicrobiologyRows(microbiologyReports, labIdByOffset, phase);
  await saveMicrobiologyReports(supabase, microbiologyRows);
}

async function deleteLabsForPhase(supabase: SupabaseClient, caseId: string, phase: number) {
  const { data: existing, error: fetchErr } = await supabase
    .from("lab_results")
    .select("id")
    .eq("case_id", caseId)
    .eq("phase", phase);

  if (fetchErr) throw new Error(fetchErr.message);

  const labIds = (existing ?? []).map((r) => r.id);
  if (labIds.length > 0) {
    await deleteImagingReports(supabase, labIds);
    await deleteMicrobiologyReports(supabase, labIds);
  }

  const { error: delErr } = await supabase
    .from("lab_results")
    .delete()
    .eq("case_id", caseId)
    .eq("phase", phase);

  if (delErr) throw new Error(delErr.message);
}

async function saveLabs(supabase: SupabaseClient, labResults: LabResultInsert[], phase: number) {
  const rows = labResults.map((r) => ({ ...r, phase }));
  if (rows.length === 0) return [];

  const { data: savedLabs, error: LabErr } = await supabase
    .from("lab_results")
    .upsert(rows, {
      onConflict: "case_id, phase, time_offset",
    })
    .select("id, case_id, time_offset, phase");

  if (LabErr) {
    throw new Error(LabErr.message);
  }
  return savedLabs;
}

function constructImagingRows(
  imagingReports: ImagingReportDraft[],
  labIdByOffset: Map<string, string>,
  phase: number,
) {
  return imagingReports.map((report) => {
    const key = `${report.case_id}|${phase}|${report.time_offset}`;
    const labId = labIdByOffset.get(key);

    if (!labId) {
      throw new Error(`No matching lab_result found for imaging report ${report.name}`);
    }

    return {
      case_id: report.case_id,
      lab_id: labId,
      name: report.name,
      technique: report.raw.technique ?? "",
      findings: report.raw.findings ?? {},
      impressions: report.raw.impressions ?? [],
      is_critical: report.raw.isCritical ?? false,
    };
  });
}

async function deleteImagingReports(supabase: SupabaseClient, labIds: string[]) {
  if (labIds.length === 0) return;
  const { error: delErr } = await supabase
    .from("imaging_reports")
    .delete()
    .in("lab_id", labIds);
  if (delErr) throw new Error(delErr.message);
}

async function saveImagingReports(supabase: SupabaseClient, imagingRows: any[]) {
  if (imagingRows.length > 0) {
    const { error: imagingError } = await supabase
      .from("imaging_reports")
      .insert(imagingRows);
    if (imagingError) throw new Error(imagingError.message);
  }
}

function constructMicrobiologyRows(
  microbiologyReports: MicrobiologyReportDraft[],
  labIdByOffset: Map<string, string>,
  phase: number,
) {
  return microbiologyReports.map((report) => {
    const key = `${report.case_id}|${phase}|${report.time_offset}`;
    const labId = labIdByOffset.get(key);

    if (!labId) {
      throw new Error(`No matching lab_result found for microbiology report ${report.name}`);
    }

    return {
      case_id: report.case_id,
      lab_id: labId,
      name: report.name,
      sample_type: report.raw.sampleType || report.name,
      appearance: report.raw.appearance,
      microscopy: report.raw.microscopy,
      location: report.raw.location,
      culture_results: report.raw.cultureResults,
      sensitivity: report.raw.sensitivity,
      comments: report.raw.comments,
      reporter: report.raw.reporter,
      is_critical: report.raw.isCritical,
    };
  });
}

async function deleteMicrobiologyReports(supabase: SupabaseClient, labIds: string[]) {
  if (labIds.length === 0) return;
  const { error: delErr } = await supabase
    .from("microbiology_reports")
    .delete()
    .in("lab_id", labIds);
  if (delErr) throw new Error(delErr.message);
}

async function saveMicrobiologyReports(supabase: SupabaseClient, microbiologyRows: any[]) {
  if (microbiologyRows.length > 0) {
    const { error: microbiologyError } = await supabase
      .from("microbiology_reports")
      .insert(microbiologyRows);
    if (microbiologyError) throw new Error(microbiologyError.message);
  }
}
