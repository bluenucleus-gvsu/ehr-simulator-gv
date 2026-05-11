"use server"

import type { SupabaseClient } from "@supabase/supabase-js";

type ClinicalDocCategoryType =
  | "Admission"
  | "Consent"
  | "Consult"
  | "Discharge"
  | "History & Physical"
  | "Nursing"
  | "Post-op"
  | "Pre-op"
  | "Progress"
  | "Rapid Response"
  | "Telehealth";

type ClinicalNoteInput = {
  title?: string;
  category?: string;
  author: string;
  specialty: string;
  timeOffset: number;
  content: string;
  excludedFromPresim?: boolean;
  docType?: "soap" | "free_text";
};

const VALID_CATEGORIES: ClinicalDocCategoryType[] = [
  "Admission",
  "Consent",
  "Consult",
  "Discharge",
  "History & Physical",
  "Nursing",
  "Post-op",
  "Pre-op",
  "Progress",
  "Rapid Response",
  "Telehealth",
];

function normalizeCategory(note: ClinicalNoteInput): ClinicalDocCategoryType {
  if (note.category && VALID_CATEGORIES.includes(note.category as ClinicalDocCategoryType)) {
    return note.category as ClinicalDocCategoryType;
  }

  const titleWithoutSuffix = (note.title ?? "").replace(/\s+Note$/i, "").trim();

  if (VALID_CATEGORIES.includes(titleWithoutSuffix as ClinicalDocCategoryType)) {
    return titleWithoutSuffix as ClinicalDocCategoryType;
  }

  return "Progress";
}

export async function updateClinicalDocuments(
  supabase: SupabaseClient,
  notes: ClinicalNoteInput[],
  caseId: string
) {
  if (!caseId) throw new Error("Case ID is required");
  const { error: deleteErr } = await supabase
    .from("clinical_documents")
    .delete()
    .eq("case_id", caseId);

  if (deleteErr) {
    throw new Error(deleteErr.message);
  }

  if (notes.length === 0) return [];

  const rows = notes.map((note) => ({
    case_id: caseId,
    is_in_presim: !note.excludedFromPresim,
    category: normalizeCategory(note),
    specialty: note.specialty?.trim(),
    author: note.author?.trim() || "Unknown",
    time_offset: Number(note.timeOffset) || 0,
    doc_text: note.content ?? "<p></p>",
  }));

  const { data, error } = await supabase
    .from("clinical_documents")
    .insert(rows)
    .select("*");

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

