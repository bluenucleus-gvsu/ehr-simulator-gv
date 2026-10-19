"use server"

import type { SupabaseClient } from "@supabase/supabase-js"
import { createCaseBuilderAdminClient } from "@/actions/case_builder/adminClient"
import { assertUuid } from "@/lib/caseBuilder/validation"

const BUCKET = "case-profile-photos"
const MAX_FILE_SIZE = 5 * 1024 * 1024
const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
}

export async function saveCasePhoto(caseId: string, file: File) {
  assertUuid(caseId, "Case ID")
  const extension = EXTENSIONS[file.type]
  if (!extension) throw new Error("Unsupported image type.")
  if (file.size > MAX_FILE_SIZE) throw new Error("The image must be 5 MB or smaller.")

  const supabase = await createCaseBuilderAdminClient()
  const { data: existingCase, error: existingCaseError } = await supabase
    .from("cases")
    .select("case_photo_url")
    .eq("id", caseId)
    .single()
  if (existingCaseError) throw new Error(existingCaseError.message)

  const path = `${caseId}/${crypto.randomUUID()}.${extension}`
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false })
  if (uploadError) throw new Error(uploadError.message)

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path)
  const { error: updateError } = await supabase
    .from("cases")
    .update({ case_photo_url: urlData.publicUrl })
    .eq("id", caseId)

  if (updateError) {
    await supabase.storage.from(BUCKET).remove([path])
    throw new Error(updateError.message)
  }

  await removePhotoObject(supabase, existingCase.case_photo_url)
  return urlData.publicUrl
}

export async function removeCasePhoto(caseId: string) {
  assertUuid(caseId, "Case ID")
  const supabase = await createCaseBuilderAdminClient()
  const { data: existingCase, error: existingCaseError } = await supabase
    .from("cases")
    .select("case_photo_url")
    .eq("id", caseId)
    .single()
  if (existingCaseError) throw new Error(existingCaseError.message)

  const { error: updateError } = await supabase
    .from("cases")
    .update({ case_photo_url: null })
    .eq("id", caseId)
  if (updateError) throw new Error(updateError.message)

  await removePhotoObject(supabase, existingCase.case_photo_url)
}

async function removePhotoObject(supabase: SupabaseClient, url: string | null) {
  if (!url) return
  const marker = `/object/public/${BUCKET}/`
  const markerIndex = url.indexOf(marker)
  if (markerIndex === -1) return
  const path = decodeURIComponent(url.slice(markerIndex + marker.length))
  if (path) await supabase.storage.from(BUCKET).remove([path])
}