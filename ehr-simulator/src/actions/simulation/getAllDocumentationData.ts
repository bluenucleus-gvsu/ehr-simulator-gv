'use server'

import { createClient } from "@supabase/supabase-js";
import { Database } from "../../../database.types";
import { ActionResponse } from "../cases";
import { resolvePreviewSessionId } from "@/lib/faculty/itemRelease";

type CaseDocumentationRow = Database['public']['Tables']['documentation_results']['Row'];
type StudentDocumentationRow = Database['public']['Tables']['editable_documentation_results']['Row'];

export type DocumentationRow = CaseDocumentationRow & {
  case_session_id: string | null;
  user_id: string | null;
  group_id: string | null;
  source_type: string;
};

function mergeDocumentationRows(
  caseRows: CaseDocumentationRow[] | null | undefined,
  studentRows: StudentDocumentationRow[] | null | undefined,
): DocumentationRow[] {
  return [
    ...(caseRows ?? []).map((row): DocumentationRow => ({
      ...row,
      case_session_id: null,
      user_id: null,
      group_id: null,
      source_type: 'case_documentation',
    })),
    ...(studentRows ?? []).map((row): DocumentationRow => ({
      ...row,
      source_type: 'student_documentation',
    })),
  ];
}

export async function getAllDocumentationData(
  caseId: string,
  sessionId: string,
): Promise<ActionResponse<DocumentationRow[]>> {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const session = resolvePreviewSessionId(sessionId);

  const [caseDocsRes, studentDocsRes] = await Promise.all([
    supabase
      .from('documentation_results')
      .select('*')
      .eq('case_id', caseId),
    supabase
      .from('editable_documentation_results')
      .select('*')
      .eq('case_id', caseId)
      .eq('case_session_id', session),
  ]);

  if (caseDocsRes.error || studentDocsRes.error) {
    return {
      success: false,
      message: 'Failed to retrieve documentation results.',
      error: caseDocsRes.error ?? studentDocsRes.error ?? undefined,
    }
  }

  return {
    success: true,
    data: mergeDocumentationRows(caseDocsRes.data, studentDocsRes.data),
    message: 'Successfully retrieved documentation results.'
  }
}
