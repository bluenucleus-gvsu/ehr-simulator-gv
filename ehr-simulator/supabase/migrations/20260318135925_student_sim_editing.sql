CREATE TABLE IF NOT EXISTS editable_clinical_documents (
  id uuid primary key DEFAULT gen_random_uuid(),
  case_session_id uuid NOT NULL references case_session(id) ON DELETE CASCADE,
  user_id uuid NOT NULL references user(id) ON DELETE SET NULL;
  group_id uuid NOT NULL references groups(id) ON DELETE SET NULL;
  
  is_in_presim BOOLEAN NOT NULL DEFAULT FALSE,
  time_offset INT NOT NULL;
  category clinical_doc_category_type NOT NULL,
  specialty TEXT NOT NULL,
  author TEXT NOT NULL, 
  content TEXT,
  -- doc_type TEXT NOT NULL CHECK (doc_type IN ('soap', 'free_text')),

  data JSONB NOT NULL DEFAULT '{}'::jsonb,

  created_at timestamptz DEFAULT now()
);

CREATE VIEW note_types_view AS
SELECT unnest(enum_range(NULL::clinical_doc_category_type)) AS note_type;

-- export interface ClinicalNote {
--   title: string;
--   author: string;
--   specialty: string;
--   timeOffset: number;
--   excludedFromPresim: boolean;
--   content: string;
-- }