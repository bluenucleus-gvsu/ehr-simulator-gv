-- Student-written clinical notes
CREATE table if NOT exists editable_clinical_documents (
  id uuid primary key DEFAULT gen_random_uuid(),
  -- remove change back to cases before commit
  case_id uuid NOT NULL references case_data(id) ON DELETE CASCADE,
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

-- Both pre-existing and new student-written documents
CREATE VIEW all_clinical_documents AS
SELECT 
  id, 
  case_id,
  NULL::uuid as case_session_id,
  is_in_presim, 
  category,
  specialty,
  author,
  time_offset,
  doc_text, 
  'case_document' as source_type
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
  doc_text, 
  'student_document' as source_type
FROM editable_clinical_documents;

-- Student Medication Administrations
CREATE TABLE IF NOT EXISTS student_medication_administrations (
  case_id uuid NOT NULL references cases(id) ON DELETE CASCADE,
  case_session_id uuid NOT NULL references case_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL references users(id) ON DELETE SET NULL,
  group_id uuid NOT NULL references groups(id) ON DELETE CASCADE,

  medication_id text,
  administrator text,
  time_offset integer NOT NULL,
  status text,
  notes text,
  administered_dose numeric,
  is_in_presim BOOLEAN NOT NULL DEFAULT TRUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Both pre-existing and student medication administrations
CREATE VIEW all_medication_administrations AS 
  SELECT (
    case_id,
    NULL::uuid as case_session_id,
    medication_id,
    administrator,
    time_offset,
    status,
    notes,
    administered_dose,
    is_in_presim,
    'case_administration' as source_type    
  ) FROM medication_administrations

  UNION ALL

  SELECT (
    case_id,
    case_session_id,
    medication_id,
    administrator,
    time_offset,
    status,
    notes,
    administered_dose,
    is_in_presim,
    'student_administrations' as source_type  
  ) FROM student_medication_administrations;


CREATE table if NOT EXISTS editable_documentation_results (
  id uuid primary key DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL references cases(id) ON DELETE CASCADE,
  case_session_id uuid NOT NULL references case_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL references users(id) ON DELETE SET NULL,
  group_id uuid NOT NULL references groups(id) ON DELETE CASCADE,  
  
  is_in_presim BOOLEAN NOT NULL DEFAULT FALSE,
  time_offset integer NOT NULL,

  hr text,
  hr_source text,
  bp text,
  bp_source text,
  rr text,
  temp text, 
  temp_source text,
  spo2 text,
  pain text,
  weight_kg text,
  oral text,
  intravenous text,
  enteral_nutrition text,
  parenteral_nutrition text,
  urine text,
  emesis text,
  stool text,
  wound_drainage text,
  enteral_output text,
  appearance text,
  safety_check text,
  mood_and_affect text,
  head_and_scalp text,
  eyes text,
  ears text,
  nose text,
  mouth_and_throat text,
  orientation text,
  speech text,
  motor_function text,
  integument_status text,
  skin text,
  hair_and_nails text,
  turgor text,
  wound text,
  heart_sounds text,
  extremities text,
  jugular_distention text,
  chest_appearance text,
  lung_sounds text,
  abdomen text,
  bowel_sounds text,
  nausea text,
  extremity_rom text,
  gait text,
  voiding text,
  iv_site text,
  iv_type text,
  iv_location text,
  nursing_care_provided text,
  nausea_vomiting integer CHECK (nausea_vomiting BETWEEN 0 AND 7),
  tremor integer CHECK (tremor BETWEEN 0 AND 7),
  paroxysmal_sweats integer CHECK (paroxysmal_sweats BETWEEN 0 AND 7),

  anxiety integer CHECK (anxiety BETWEEN 0 AND 7),

  agitation integer CHECK (agitation BETWEEN 0 AND 7),

  tactile_disturbances smallint CHECK (tactile_disturbances BETWEEN 0 AND 7),
  visual_disturbances smallint CHECK (visual_disturbances BETWEEN 0 AND 7),
  headache smallint CHECK (headache BETWEEN 0 AND 7),
  orientation2 smallint CHECK (orientation2 BETWEEN 0 AND 4),
  history_of_falling smallint CHECK (history_of_falling IN (0, 25)),
  secondary_diagnosis smallint CHECK (secondary_diagnosis IN (0, 15)),
  ambulatory_aid smallint CHECK (ambulatory_aid IN (0, 15, 25)),
  iv_therapy_heparin_lock smallint CHECK (iv_therapy_heparin_lock IN (0, 20)),
  fall_risk_gait smallint CHECK (fall_risk_gait IN (0, 10, 20)),
  mental_status integer CHECK (mental_status IN (0, 15)),
  sensory_perception smallint CHECK (sensory_perception IN (1, 2, 3, 4)),
  moisture smallint CHECK (moisture IN (1, 2, 3, 4)),
  activity smallint CHECK (activity IN (1, 2, 3, 4)),
  mobility smallint CHECK (mobility IN (1, 2, 3, 4)),
  nutrition smallint CHECK (nutrition IN (1, 2, 3, 4)),
  friction_and_shear smallint CHECK (friction_and_shear IN (1, 2, 3)),
  breathing_independent_of_vocalization smallint CHECK (breathing_independent_of_vocalization IN (0, 1, 2)),
  negative_vocalization smallint CHECK (negative_vocalization IN (0, 1, 2)),
  facial_expression smallint CHECK (facial_expression IN (0, 1, 2)),
  body_language smallint CHECK (body_language IN (0, 1, 2)),
  consolability smallint CHECK (consolability IN (0, 1, 2)),
  created_at timestamptz NOT NULL DEFAULT now()
);


-- remove before commit
alter table case_data add column if not exists description TEXT;
alter table case_data add column if not exists age INTEGER;
alter table case_data add column if not exists first_name TEXT;
alter table case_data add column if not exists last_name TEXT;
alter table case_data add column if not exists code_status TEXT;
alter table case_data add column if not exists admitting_diagnosis TEXT;
