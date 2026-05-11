"use server"

import { SupabaseClient } from "@supabase/supabase-js";
import { transformLabTableToSchema } from "@/lib/labTypes";
import { LabResultInsert, ImagingReportDraft, MicrobiologyReportDraft } from "@/lib/labTypes";

export async function updateLabs(
  supabase: SupabaseClient,
  payload: any,
  caseId: string,
) {
  const { labResults, imagingReports, microbiologyReports } = transformLabTableToSchema(caseId, {
    data: payload.data ?? [],
    timePoints: payload.timePoints ?? [],
    timePointsInPreSim: new Set(payload.timePointsInPreSim ?? []),
    visibleItems: new Set(payload.visibleItems ?? []),
  })

  await deleteLabs(supabase, caseId, payload.timePoints)
  const savedLabs = await saveLabs(supabase, labResults)

  const labIdByOffset = new Map(
    (savedLabs ?? []).map(lab => [
      `${lab.case_id}|${lab.time_offset}`,
      lab.id,
    ])
  )
  const savedLabIds = (savedLabs ?? []).map(x => x.id)

  await deleteImagingReports(supabase, savedLabIds)
  const imagingRows = constructImagingRows(imagingReports, labIdByOffset)
  await saveImagingReports(supabase, imagingRows)

  await deleteMicrobiologyReports(supabase, savedLabIds)
  const microbiologyRows = constructMicrobiologyRows(microbiologyReports, labIdByOffset)
  await saveMicrobiologyReports(supabase, microbiologyRows)
}

async function deleteLabs(supabase: SupabaseClient, caseId: string, timePoints: number[]) {
  const { error: delErr } = await supabase
    .from("lab_results")
    .delete()
    .eq("case_id", caseId)
    .not("time_offset", "in", `(${timePoints.join(",")})`)
  if (delErr) throw delErr
}

async function saveLabs(supabase: SupabaseClient, labResults: LabResultInsert[]) {
  const { data: savedLabs, error: LabErr } = await supabase
    .from("lab_results")
    .upsert(labResults, {
      onConflict: "case_id, time_offset",
    })
    .select("id, case_id, time_offset")
  if (LabErr) {
    console.error("error saving lab results", LabErr)
    return
  }
  return savedLabs
}

function constructImagingRows(imagingReports: ImagingReportDraft[], labIdByOffset: Map<string, string>) {
  return imagingReports.map(report => {
    const key = `${report.case_id}|${report.time_offset}`
    const labId = labIdByOffset.get(key)

    if (!labId) {
      throw new Error(`No matching lab_result found for imaging report ${report.name}`)
    }

    return {
      case_id: report.case_id,
      lab_id: labId,
      name: report.name,
      technique: report.raw.technique ?? "",
      findings: report.raw.findings ?? {},
      impressions: report.raw.impressions ?? [],
      is_critical: report.raw.isCritical ?? false,
    }
  })
}

async function deleteImagingReports(supabase: SupabaseClient, labIds: string[]) {
  const { error: delErr } = await supabase
    .from("imaging_reports")
    .delete()
    .in("lab_id", labIds)
  if (delErr) throw delErr
}

async function saveImagingReports(supabase: SupabaseClient, imagingRows: any[]) {
  if (imagingRows.length > 0) {
    const { error: imagingError } = await supabase
      .from("imaging_reports")
      .insert(imagingRows)
    if (imagingError) throw new Error(imagingError.message)
  }
}

function constructMicrobiologyRows(microbiologyReports: MicrobiologyReportDraft[], labIdByOffset: Map<string, string>) {
  return microbiologyReports.map(report => {
    const key = `${report.case_id}|${report.time_offset}`
    const labId = labIdByOffset.get(key)

    if (!labId) {
      throw new Error(`No matching lab_result found for imaging report ${report.name}`)
    }

    return {
      case_id: report.case_id,
      lab_id: labId,
      name: report.name,
      sample_type: report.raw.sampleType,
      appearance: report.raw.appearance,
      microscopy: report.raw.microscopy,
      location: report.raw.location,
      culture_results: report.raw.cultureResults,
      sensitivity: report.raw.sensitivity,
      comments: report.raw.comments,
      reporter: report.raw.reporter,
      is_critical: report.raw.isCritical,
    }
  })
}

async function deleteMicrobiologyReports(supabase: SupabaseClient, labIds: string[]) {
  const { error: delErr } = await supabase
    .from("microbiology_reports")
    .delete()
    .in("lab_id", labIds)
  if (delErr) throw delErr
}

async function saveMicrobiologyReports(supabase: SupabaseClient, microbiologyRows: any[]) {
  if (microbiologyRows.length > 0) {
    const { error: microbiologyError } = await supabase
      .from("microbiology_reports")
      .insert(microbiologyRows)
    if (microbiologyError) throw new Error(microbiologyError.message)
  }
}
