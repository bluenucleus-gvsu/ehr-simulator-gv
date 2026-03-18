-- Student-written clinical notes
CREATE table if NOT exists editable_clinical_documents (
  id uuid primary key DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL references cases(id) ON DELETE CASCADE,
  case_session_id uuid NOT NULL references case_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL references users(id) ON DELETE SET NULL,
  group_id uuid NOT NULL references groups(id) ON DELETE CASCADE,
  
  is_in_presim BOOLEAN NOT NULL DEFAULT TRUE,
  category clinical_doc_category_type NOT NULL,
  specialty TEXT NOT NULL,
  author TEXT NOT NULL, 
  time_offset integer NOT NULL,
  doc_text TEXT NOT NULL,

  created_at timestamptz DEFAULT now()
);

-- export interface ClinicalNote {
--   title: string;
--   author: string;
--   specialty: string;
--   timeOffset: number;
--   excludedFromPresim: boolean;
--   content: string;
-- }

-- 
CREATE VIEW all_clinical_documents AS
SELECT 
  id, 
  case_id,
  case_session_id as NULL,
  is_in_presim,
  category,
  specialty,
  author,
  time_offset,
  doc_text 
  'template_document' as source_type
FROM clinical_documents

UNION ALL

SELECT 
  id, 
  case_id,
  case_session_id,
  is_in_presim,
  category,
  specialty,
  author,
  time_offset,
  doc_text 
  'student_document' as source_type
FROM editable_clinical_documents;