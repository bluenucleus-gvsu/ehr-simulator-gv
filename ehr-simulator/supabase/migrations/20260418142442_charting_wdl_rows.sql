--------------------------------------------------
-- New columns for WDL documentations
--------------------------------------------------
ALTER TABLE IF EXISTS documentation_results 
  ADD COLUMN IF NOT EXISTS general_appearance_selections TEXT,
  ADD COLUMN IF NOT EXISTS psychosocial_selections TEXT,
  ADD COLUMN IF NOT EXISTS heent_selections TEXT,
  ADD COLUMN IF NOT EXISTS neuro_selections TEXT,
  ADD COLUMN IF NOT EXISTS integument_selections TEXT,
  ADD COLUMN IF NOT EXISTS cardiovascular_selections TEXT,
  ADD COLUMN IF NOT EXISTS respiratory_selections TEXT,
  ADD COLUMN IF NOT EXISTS gi_selections TEXT,
  ADD COLUMN IF NOT EXISTS musculoskeletal_selections TEXT,
  ADD COLUMN IF NOT EXISTS genitourinary_selections TEXT,
  ADD COLUMN IF NOT EXISTS assessment_tool_selections TEXT,
  ADD COLUMN IF NOT EXISTS intake_selections TEXT,
  ADD COLUMN IF NOT EXISTS output_selections TEXT;

ALTER TABLE IF EXISTS editable_documentation_results 
  ADD COLUMN IF NOT EXISTS general_appearance_selections TEXT,
  ADD COLUMN IF NOT EXISTS psychosocial_selections TEXT,
  ADD COLUMN IF NOT EXISTS heent_selections TEXT,
  ADD COLUMN IF NOT EXISTS neuro_selections TEXT,
  ADD COLUMN IF NOT EXISTS integument_selections TEXT,
  ADD COLUMN IF NOT EXISTS cardiovascular_selections TEXT,
  ADD COLUMN IF NOT EXISTS respiratory_selections TEXT,
  ADD COLUMN IF NOT EXISTS gi_selections TEXT,
  ADD COLUMN IF NOT EXISTS musculoskeletal_selections TEXT,
  ADD COLUMN IF NOT EXISTS genitourinary_selections TEXT,
  ADD COLUMN IF NOT EXISTS assessment_tool_selections TEXT,
  ADD COLUMN IF NOT EXISTS intake_selections TEXT,
  ADD COLUMN IF NOT EXISTS output_selections TEXT;

----------------------------------------------------------
-- Update all_documentation_results to include new columns
----------------------------------------------------------
DROP VIEW IF EXISTS all_documentation_results;  
CREATE OR REPLACE VIEW all_documentation_results AS 
  -- Base Case Documentation 
  SELECT 
    id,
    case_id,
    NULL::uuid as case_session_id,
    NULL::uuid as user_id,
    NULL::uuid as group_id,
    is_in_presim,
    time_offset,
    
    -- Vitals & I/O
    hr, hr_source, bp, bp_source, rr, temp, temp_source, spo2, spo2_source, pain, weight_kg,
    oral, intravenous, enteral_nutrition, parenteral_nutrition, urine, emesis, stool, wound_drainage, enteral_output,
    
    -- Assessments
    appearance, safety_check, mood_and_affect, head_and_scalp, eyes, ears, nose, mouth_and_throat, 
    orientation, speech, motor_function, integument_status, skin, hair_and_nails, turgor, wound, 
    heart_sounds, extremities, jugular_distention, chest_appearance, lung_sounds, abdomen, bowel_sounds, 
    nausea, extremity_rom, gait, voiding, iv_site, iv_type, iv_location, nursing_care_provided,
    
    -- Scales & Scores
    nausea_vomiting, tremor, paroxysmal_sweats, anxiety, agitation, tactile_disturbances, 
    visual_disturbances, headache, orientation2, history_of_falling, secondary_diagnosis, 
    ambulatory_aid, iv_therapy_heparin_lock, fall_risk_gait, mental_status, sensory_perception, 
    moisture, activity, mobility, nutrition, friction_and_shear, breathing_independent_of_vocalization, 
    negative_vocalization, facial_expression, body_language, consolability,
    
    -- Assessment Selections
    general_appearance_selections, psychosocial_selections, heent_selections, neuro_selections, integument_selections,
    cardiovascular_selections, respiratory_selections, musculoskeletal_selections, genitourinary_selections, 
    assessment_tool_selections, gi_selections, intake_selections, output_selections,
    created_at,
    'case_documentation' as source_type    
  FROM documentation_results

  UNION ALL

  -- Student Documentation (Live Session)
  SELECT
    id,
    case_id,
    case_session_id,
    user_id,
    group_id,
    is_in_presim,
    time_offset,
    
    -- Vitals & I/O
    hr, hr_source, bp, bp_source, rr, temp, temp_source, spo2, spo2_source, pain, weight_kg,
    oral, intravenous, enteral_nutrition, parenteral_nutrition, urine, emesis, stool, wound_drainage, enteral_output,
    
    -- Assessments
    appearance, safety_check, mood_and_affect, head_and_scalp, eyes, ears, nose, mouth_and_throat, 
    orientation, speech, motor_function, integument_status, skin, hair_and_nails, turgor, wound, 
    heart_sounds, extremities, jugular_distention, chest_appearance, lung_sounds, abdomen, bowel_sounds, 
    nausea, extremity_rom, gait, voiding, iv_site, iv_type, iv_location, nursing_care_provided,
    
    -- Scales & Scores
    nausea_vomiting, tremor, paroxysmal_sweats, anxiety, agitation, tactile_disturbances, 
    visual_disturbances, headache, orientation2, history_of_falling, secondary_diagnosis, 
    ambulatory_aid, iv_therapy_heparin_lock, fall_risk_gait, mental_status, sensory_perception, 
    moisture, activity, mobility, nutrition, friction_and_shear, breathing_independent_of_vocalization, 
    negative_vocalization, facial_expression, body_language, consolability,

    -- Assessment Selections
    general_appearance_selections, psychosocial_selections, heent_selections, neuro_selections, integument_selections,
    cardiovascular_selections, respiratory_selections, musculoskeletal_selections, genitourinary_selections, 
    assessment_tool_selections, gi_selections, intake_selections, output_selections,
    
    created_at,
    'student_documentation' as source_type  
  FROM editable_documentation_results;

-- Set time_offset of case_data to negative if in past, positive if in future
UPDATE editable_documentation_results 
SET time_offset = time_offset * -1
WHERE time_offset < 0;

UPDATE documentation_results
SET time_offset = time_offset * -1
WHERE time_offset > 0;

UPDATE clinical_documents
SET time_offset = time_offset * -1
WHERE time_offset > 0;

UPDATE editable_clinical_documents
SET time_offset = time_offset * -1
WHERE time_offset < 0;

UPDATE lab_results
SET time_offset = time_offset * -1
WHERE time_offset > 0;