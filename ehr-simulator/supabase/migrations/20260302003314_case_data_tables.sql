CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE type code_status_type as enum ('Full', 'DNR', 'Partial');
CREATE type insurance_type as enum ('Medicare', 'Medicaid', 'Private');

-- =========================================
-- Safety Alerts
-- =========================================
CREATE TABLE IF NOT EXISTS safety_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO safety_alerts (name) VALUES
  ('Seizure Risk'),
  ('Aspiration Risk'),
  ('Bleeding Precautions'),
  ('NPO Status'),
  ('Suicide / Self-Harm Risk'),
  ('Violence / Aggression Risk'),
  ('Elopement Risk'),
  ('Restraint Order Active'),
  ('Continuous Observation'),
  ('Hearing Impaired'),
  ('Vision Impaired'),
  ('High Risk for Falls'),
  ('Orthostatic Hypotension Risk'),
  ('Confused / Impulsive Behavior'),
  ('Delirium / Cognitive Impairment Risk'),
  ('Head Injury Precautions'),
  ('Increased Intracranial Pressure (ICP) Precautions'),
  ('IV Line / Central Line / PICC in Place'),
  ('Tracheostomy / Airway Precautions'),
  ('Chest Tube Precautions'),
  ('Pacemaker / ICD Precautions'),
  ('Anticoagulant Therapy - Bleeding Precautions'),
  ('Pressure Injury Risk (Braden <18)'),
  ('Immunocompromised Precautions'),
  ('Chemotherapy Precautions / Cytotoxic Drugs'),
  ('Advanced Directive on File'),
  ('Court-Ordered Observation / Police Hold')
ON CONFLICT (name) DO NOTHING;

-- =========================================
-- Isolation Precautions
-- =========================================
CREATE TABLE IF NOT EXISTS isolation_precautions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO isolation_precautions (name) VALUES
  ('Contact'),
  ('Contact-Enteric'),
  ('Airborne'),
  ('Neutropenic'),
  ('Droplet'),
  ('None')
ON CONFLICT (name) DO NOTHING;

-- =========================================
-- Relationship Status (Patient)
-- =========================================
CREATE TABLE IF NOT EXISTS relationship_statuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO relationship_statuses (name) VALUES
  ('Single'),
  ('Married'),
  ('Divorced'),
  ('Engaged'),
  ('Widowed'),
  ('Separated'),
  ('Domestic Partner'),
  ('Unknown / Undetermined')
ON CONFLICT (name) DO NOTHING;

-- =========================================
-- Family Relationship Types
-- =========================================
CREATE TABLE IF NOT EXISTS relationship_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO relationship_types (name) VALUES
  ('Mother'),
  ('Father'),
  ('Brother'),
  ('Sister'),
  ('Paternal Grandmother'),
  ('Paternal Grandfather'),
  ('Paternal Aunt'),
  ('Paternal Uncle'),
  ('Paternal Cousin'),
  ('Maternal Grandmother'),
  ('Maternal Grandfather'),
  ('Maternal Aunt'),
  ('Maternal Uncle'),
  ('Maternal Cousin')
ON CONFLICT (name) DO NOTHING;

-- =========================================
-- Cases - Parent Table for all Cases
-- =========================================
CREATE table if NOT exists public.cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text not NULL,
  description text,

  first_name text NOT NULL,
  last_name text NOT NULL,
  date_of_birth date,
  code_status code_status_type NOT NULL,
  height_ft numeric,
  height_in numeric,
  weight_kg numeric,
  isolation_precautions_id uuid REFERENCES isolation_precautions(id),
  language text,
  insurance insurance_type,
  employment text,
  relationship_status_id uuid REFERENCES relationship_statuses(id),
  religion text,
  requires_interpreter boolean NOT NULL DEFAULT false,

  admitting_diagnosis text,
  attending_provider text, 
  inpatient_duration_days integer check (inpatient_duration_days >= 0),
  -- timestamptz doesn't work because of unknown date
  time_of_admission time, 

  medical_history text[] DEFAULT '{}',
  surgical_history text[] DEFAULT '{}',
  allergies text[] DEFAULT '{}',
  social_habits text[] DEFAULT '{}',
  living_situation text[] DEFAULT '{}',

  case_creation_complete boolean NOT NULL DEFAULT FALSE,
  updated_at timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- =========================================
-- Safety Alerts Join Table
-- * Store many-to-many relationships between cases and safety alerts
-- * Each relationship references the safety_alerts lookup table.
-- =========================================
CREATE TABLE IF NOT EXISTS case_safety_alerts (
  case_id uuid NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  safety_alert_id uuid NOT NULL REFERENCES safety_alerts(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (case_id, safety_alert_id)
);

CREATE INDEX IF NOT EXISTS idx_case_safety_alerts_case_id
  ON case_safety_alerts(case_id);

CREATE INDEX IF NOT EXISTS idx_case_safety_alerts_alert_id
  ON case_safety_alerts(safety_alert_id);

-- =========================================
-- Case Family History
-- =========================================
CREATE table if NOT exists case_family_history (
  id uuid primary key DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL references cases(id) ON DELETE CASCADE,
  relationship_id uuid NOT NULL REFERENCES relationship_types(id),
  condition text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- =========================================
-- Clinical Documents
-- =========================================
CREATE type clinical_doc_category_type as enum ('Admission', 'Consent', 'Consult', 'Discharge', 'History & Physical', 'Nursing', 'Post-op', 'Pre-op', 'Progress', 'Rapid Response', 'Telehealth');
CREATE table if NOT exists clinical_documents (
  id uuid primary key DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL references cases(id) ON DELETE CASCADE,
  is_in_presim BOOLEAN NOT NULL DEFAULT TRUE,
  category clinical_doc_category_type NOT NULL,
  specialty TEXT NOT NULL,
  author TEXT NOT NULL, 
  time_offset integer NOT NULL,
  doc_text TEXT NOT NULL,

  created_at timestamptz DEFAULT now()
);


-- =========================================
-- Orders
-- =========================================
CREATE table if NOT EXISTS orders (
  id uuid primary key DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL references cases(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  details TEXT NOT NULL,
  status TEXT NOT NULL,
  provider TEXT NOT NULL,
  is_important BOOLEAN NOT NULL DEFAULT FALSE,
  is_in_presim BOOLEAN NOT NULL DEFAULT TRUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =========================================
-- Lab Results
-- =========================================
CREATE table if NOT EXISTS lab_results (
  id uuid primary key DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL references cases(id) ON DELETE CASCADE,
  time_offset integer NOT NULL,
  is_in_presim BOOLEAN NOT NULL DEFAULT TRUE,

  sodium numeric,
  potassium numeric,
  chloride numeric,
  bun numeric,
  creatinine numeric,
  glucose numeric,
  co2 numeric,
  calcium numeric,
  lactate numeric,

  rbc numeric,
  wbc numeric,
  platelets numeric,
  hemoglobin numeric,
  hematocrit numeric,
  mcv numeric,
  mch numeric,
  mchc numeric,

  troponin numeric,
  ckmb numeric,
  myoglobin numeric,

  ast numeric,
  alt numeric,
  alp numeric,
  total_bilirubin numeric,
  albumin numeric,
  ammonia numeric,

  pco2 numeric,
  po2 numeric,
  hco3 numeric,

  specific_gravity numeric,
  urine_ph numeric,
  protein text,
  urine_glucose text,
  ketones text,
  leukocyte_esterase text,
  nitrites text,
  blood text,

  pt numeric,
  ptt numeric,

  crp numeric,
  esr numeric,
  tsh numeric,
  free_t3 numeric,
  free_t4 numeric,

  total_cholesterol numeric,
  hdl_cholesterol numeric,
  ldl_cholesterol numeric,
  triglycerides numeric,

  magnesium numeric,
  phosphate numeric,

  amylase numeric,
  lipase numeric,

  data JSONB NOT NULL DEFAULT '{}'::jsonb,

  CONSTRAINT lab_results_case_id_time_offset_key UNIQUE (case_id, time_offset),
  created_at timestamptz NOT NULL DEFAULT now()
); 

-- =========================================
-- Imaging Reports
-- =========================================
CREATE table if NOT EXISTS imaging_reports (
  id uuid primary key DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL references cases(id) ON DELETE CASCADE,
  lab_id uuid NOT NULL references lab_results(id) ON DELETE CASCADE,
  name text NOT NULL,
  technique text NOT NULL,
  findings jsonb NOT NULL DEFAULT '{}'::jsonb,
  impressions text[] NOT NULL DEFAULT '{}',
  is_critical BOOLEAN NOT NULL DEFAULT FALSE,

  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE table if NOT EXISTS microbiology_reports (
  id uuid primary key DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL references cases(id) ON DELETE CASCADE,
  lab_id uuid NOT NULL references lab_results(id) ON DELETE CASCADE,
  name text NOT NULL,

  sample_type text NOT NULL,
  appearance text NOT NULL,
  microscopy text NOT NULL,
  location text,
  culture_results text NOT NULL,
  sensitivity text NOT NULL,
  comments text NOT NULL,
  reporter text NOT NULL, 
  is_critical text ,

  created_at timestamptz NOT NULL DEFAULT now()
);

-- =========================================
-- Documentation Results
-- =========================================
CREATE table if NOT EXISTS documentation_results (
  id uuid primary key DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL references cases(id) ON DELETE CASCADE,
  is_in_presim BOOLEAN NOT NULL DEFAULT TRUE,
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

CREATE TABLE IF NOT EXISTS medication_administrations (
  case_id uuid NOT NULL references cases(id) ON DELETE CASCADE,
  medication_id text,
  administrator text,
  time_offset integer NOT NULL,
  status text,
  notes text,
  administered_dose numeric,
  is_in_presim BOOLEAN NOT NULL DEFAULT TRUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =========================================
-- Indexing
-- =========================================
