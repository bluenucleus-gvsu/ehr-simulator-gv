---------------------------------------------------------------
-- Cast all fields as text for consistency. 
-- Rename ambiguous columns:
--    * assessment tool fields are prefixed by their tool name
--    * A field's units are included in its name
--    * A field's body system is prefixed when a collision occurs
--      Ex: urine --> urine_outpt_ml to disambugate between urine_color,
--        urine_occurrence, urine_odor, etc.
-- Add missing and requested FlexSheet Columns
-- Update all_documentation_results View with new fields
---------------------------------------------------------------

DROP VIEW IF EXISTS all_documentation_results;

ALTER TABLE documentation_results 
  DROP CONSTRAINT IF EXISTS documentation_results_nausea_vomiting_check,
  DROP CONSTRAINT IF EXISTS documentation_results_tremor_check,
  DROP CONSTRAINT IF EXISTS documentation_results_paroxysmal_sweats_check,
  DROP CONSTRAINT IF EXISTS documentation_results_anxiety_check,
  DROP CONSTRAINT IF EXISTS documentation_results_agitation_check,
  DROP CONSTRAINT IF EXISTS documentation_results_tactile_disturbances_check,
  DROP CONSTRAINT IF EXISTS documentation_results_visual_disturbances_check,
  DROP CONSTRAINT IF EXISTS documentation_results_headache_check,
  DROP CONSTRAINT IF EXISTS documentation_results_orientation2_check,
  DROP CONSTRAINT IF EXISTS documentation_results_history_of_falling_check,
  DROP CONSTRAINT IF EXISTS documentation_results_secondary_diagnosis_check,
  DROP CONSTRAINT IF EXISTS documentation_results_ambulatory_aid_check,
  DROP CONSTRAINT IF EXISTS documentation_results_iv_therapy_heparin_lock_check,
  DROP CONSTRAINT IF EXISTS documentation_results_fall_risk_gait_check,
  DROP CONSTRAINT IF EXISTS documentation_results_mental_status_check,
  DROP CONSTRAINT IF EXISTS documentation_results_sensory_perception_check,
  DROP CONSTRAINT IF EXISTS documentation_results_moisture_check,
  DROP CONSTRAINT IF EXISTS documentation_results_activity_check,
  DROP CONSTRAINT IF EXISTS documentation_results_mobility_check,
  DROP CONSTRAINT IF EXISTS documentation_results_nutrition_check,
  DROP CONSTRAINT IF EXISTS documentation_results_friction_and_shear_check,
  DROP CONSTRAINT IF EXISTS documentation_results_breathing_independent_of_vocalizati_check,
  DROP CONSTRAINT IF EXISTS documentation_results_negative_vocalization_check,
  DROP CONSTRAINT IF EXISTS documentation_results_facial_expression_check,
  DROP CONSTRAINT IF EXISTS documentation_results_body_language_check,
  DROP CONSTRAINT IF EXISTS documentation_results_consolability_check,

  ALTER COLUMN nausea_vomiting TYPE TEXT USING nausea_vomiting::text,
  ALTER COLUMN tremor TYPE TEXT USING tremor::text,
  ALTER COLUMN paroxysmal_sweats TYPE TEXT USING paroxysmal_sweats::text,
  ALTER COLUMN anxiety TYPE TEXT USING anxiety::text,
  ALTER COLUMN agitation TYPE TEXT USING agitation::text,
  ALTER COLUMN tactile_disturbances TYPE TEXT USING tactile_disturbances::text,
  ALTER COLUMN visual_disturbances TYPE TEXT USING visual_disturbances::text,
  ALTER COLUMN headache TYPE TEXT USING headache::text,
  ALTER COLUMN orientation2 TYPE TEXT USING orientation2::text,
  ALTER COLUMN history_of_falling TYPE TEXT USING history_of_falling::text,
  ALTER COLUMN secondary_diagnosis TYPE TEXT USING secondary_diagnosis::text,
  ALTER COLUMN ambulatory_aid TYPE TEXT USING ambulatory_aid::text,
  ALTER COLUMN iv_therapy_heparin_lock TYPE TEXT USING iv_therapy_heparin_lock::text,
  ALTER COLUMN fall_risk_gait TYPE TEXT USING fall_risk_gait::text,
  ALTER COLUMN mental_status TYPE TEXT USING mental_status::text,
  ALTER COLUMN sensory_perception TYPE TEXT USING sensory_perception::text,
  ALTER COLUMN moisture TYPE TEXT USING moisture::text,
  ALTER COLUMN activity TYPE TEXT USING activity::text,
  ALTER COLUMN mobility TYPE TEXT USING mobility::text,
  ALTER COLUMN nutrition TYPE TEXT USING nutrition::text,
  ALTER COLUMN friction_and_shear TYPE TEXT USING friction_and_shear::text,
  ALTER COLUMN breathing_independent_of_vocalization TYPE TEXT USING breathing_independent_of_vocalization::text,
  ALTER COLUMN negative_vocalization TYPE TEXT USING negative_vocalization::text,
  ALTER COLUMN facial_expression TYPE TEXT USING facial_expression::text,
  ALTER COLUMN body_language TYPE TEXT USING body_language::text,
  ALTER COLUMN consolability TYPE TEXT USING consolability::text,
  
  DROP COLUMN IF EXISTS integument_status;
  

ALTER TABLE editable_documentation_results
  DROP CONSTRAINT IF EXISTS editable_documentation_results_nausea_vomiting_check,
  DROP CONSTRAINT IF EXISTS editable_documentation_results_tremor_check,
  DROP CONSTRAINT IF EXISTS editable_documentation_results_paroxysmal_sweats_check,
  DROP CONSTRAINT IF EXISTS editable_documentation_results_anxiety_check,
  DROP CONSTRAINT IF EXISTS editable_documentation_results_agitation_check,
  DROP CONSTRAINT IF EXISTS editable_documentation_results_tactile_disturbances_check,
  DROP CONSTRAINT IF EXISTS editable_documentation_results_visual_disturbances_check,
  DROP CONSTRAINT IF EXISTS editable_documentation_results_headache_check,
  DROP CONSTRAINT IF EXISTS editable_documentation_results_orientation2_check,
  DROP CONSTRAINT IF EXISTS editable_documentation_results_history_of_falling_check,
  DROP CONSTRAINT IF EXISTS editable_documentation_results_secondary_diagnosis_check,
  DROP CONSTRAINT IF EXISTS editable_documentation_results_ambulatory_aid_check,
  DROP CONSTRAINT IF EXISTS editable_documentation_results_iv_therapy_heparin_lock_check,
  DROP CONSTRAINT IF EXISTS editable_documentation_results_fall_risk_gait_check,
  DROP CONSTRAINT IF EXISTS editable_documentation_results_mental_status_check,
  DROP CONSTRAINT IF EXISTS editable_documentation_results_sensory_perception_check,
  DROP CONSTRAINT IF EXISTS editable_documentation_results_moisture_check,
  DROP CONSTRAINT IF EXISTS editable_documentation_results_activity_check,
  DROP CONSTRAINT IF EXISTS editable_documentation_results_mobility_check,
  DROP CONSTRAINT IF EXISTS editable_documentation_results_nutrition_check,
  DROP CONSTRAINT IF EXISTS editable_documentation_results_friction_and_shear_check,
  DROP CONSTRAINT IF EXISTS editable_documentation_resul_breathing_independent_of_voc_check,
  DROP CONSTRAINT IF EXISTS editable_documentation_results_negative_vocalization_check,
  DROP CONSTRAINT IF EXISTS editable_documentation_results_facial_expression_check,
  DROP CONSTRAINT IF EXISTS editable_documentation_results_body_language_check,
  DROP CONSTRAINT IF EXISTS editable_documentation_results_consolability_check,

  ALTER COLUMN nausea_vomiting TYPE TEXT USING nausea_vomiting::text,
  ALTER COLUMN tremor TYPE TEXT USING tremor::text,
  ALTER COLUMN paroxysmal_sweats TYPE TEXT USING paroxysmal_sweats::text,
  ALTER COLUMN anxiety TYPE TEXT USING anxiety::text,
  ALTER COLUMN agitation TYPE TEXT USING agitation::text,
  ALTER COLUMN tactile_disturbances TYPE TEXT USING tactile_disturbances::text,
  ALTER COLUMN visual_disturbances TYPE TEXT USING visual_disturbances::text,
  ALTER COLUMN headache TYPE TEXT USING headache::text,
  ALTER COLUMN orientation2 TYPE TEXT USING orientation2::text,
  ALTER COLUMN history_of_falling TYPE TEXT USING history_of_falling::text,
  ALTER COLUMN secondary_diagnosis TYPE TEXT USING secondary_diagnosis::text,
  ALTER COLUMN ambulatory_aid TYPE TEXT USING ambulatory_aid::text,
  ALTER COLUMN iv_therapy_heparin_lock TYPE TEXT USING iv_therapy_heparin_lock::text,
  ALTER COLUMN fall_risk_gait TYPE TEXT USING fall_risk_gait::text,
  ALTER COLUMN mental_status TYPE TEXT USING mental_status::text,
  ALTER COLUMN sensory_perception TYPE TEXT USING sensory_perception::text,
  ALTER COLUMN moisture TYPE TEXT USING moisture::text,
  ALTER COLUMN activity TYPE TEXT USING activity::text,
  ALTER COLUMN mobility TYPE TEXT USING mobility::text,
  ALTER COLUMN nutrition TYPE TEXT USING nutrition::text,
  ALTER COLUMN friction_and_shear TYPE TEXT USING friction_and_shear::text,
  ALTER COLUMN breathing_independent_of_vocalization TYPE TEXT USING breathing_independent_of_vocalization::text,
  ALTER COLUMN negative_vocalization TYPE TEXT USING negative_vocalization::text,
  ALTER COLUMN facial_expression TYPE TEXT USING facial_expression::text,
  ALTER COLUMN body_language TYPE TEXT USING body_language::text,
  ALTER COLUMN consolability TYPE TEXT USING consolability::text,

  DROP COLUMN IF EXISTS integument_status;
  
--------------------------------------------------------------------------------------
-- Rename documentation_results column names so more fields can be unambiguously added  
--------------------------------------------------------------------------------------
ALTER TABLE IF EXISTS documentation_results RENAME COLUMN oral TO oral_intake_ml;        
ALTER TABLE IF EXISTS documentation_results RENAME COLUMN intravenous TO iv_intake_ml;
ALTER TABLE IF EXISTS documentation_results RENAME COLUMN enteral_nutrition TO enteral_intake_ml;
ALTER TABLE IF EXISTS documentation_results RENAME COLUMN parenteral_nutrition TO parenteral_intake_ml;
ALTER TABLE IF EXISTS documentation_results RENAME COLUMN wound_drainage TO wound_output_ml;
ALTER TABLE IF EXISTS documentation_results RENAME COLUMN enteral_output TO enteral_output_ml;
ALTER TABLE IF EXISTS documentation_results RENAME COLUMN urine TO urine_output_ml;
ALTER TABLE IF EXISTS documentation_results RENAME COLUMN stool TO stool_occurrence;
ALTER TABLE IF EXISTS documentation_results RENAME COLUMN emesis TO emesis_output_ml;       
ALTER TABLE IF EXISTS documentation_results RENAME COLUMN pain TO pain_numeric_scale;      
ALTER TABLE IF EXISTS documentation_results RENAME COLUMN extremities TO cardiac_extremities;
ALTER TABLE IF EXISTS documentation_results RENAME COLUMN nausea TO gi_symptoms;
ALTER TABLE IF EXISTS documentation_results RENAME COLUMN iv_site TO iv_site_1;
ALTER TABLE IF EXISTS documentation_results RENAME COLUMN iv_location TO iv_location_1;
ALTER TABLE IF EXISTS documentation_results RENAME COLUMN iv_type TO iv_type_1;

-- CIWA
ALTER TABLE IF EXISTS documentation_results RENAME COLUMN nausea_vomiting TO ciwa_nausea_vomiting;
ALTER TABLE IF EXISTS documentation_results RENAME COLUMN tremor TO ciwa_tremor;
ALTER TABLE IF EXISTS documentation_results RENAME COLUMN paroxysmal_sweats TO ciwa_sweats;
ALTER TABLE IF EXISTS documentation_results RENAME COLUMN anxiety TO ciwa_anxiety;
ALTER TABLE IF EXISTS documentation_results RENAME COLUMN agitation TO ciwa_agitation;
ALTER TABLE IF EXISTS documentation_results RENAME COLUMN tactile_disturbances TO ciwa_tactile;
ALTER TABLE IF EXISTS documentation_results RENAME COLUMN visual_disturbances TO ciwa_visual;
ALTER TABLE IF EXISTS documentation_results RENAME COLUMN headache TO ciwa_headache;
ALTER TABLE IF EXISTS documentation_results RENAME COLUMN orientation2 TO ciwa_orientation;
-- Morse Fall Risk
ALTER TABLE IF EXISTS documentation_results RENAME COLUMN history_of_falling TO morse_fall_history;
ALTER TABLE IF EXISTS documentation_results RENAME COLUMN secondary_diagnosis TO morse_secondary_diagnosis;
ALTER TABLE IF EXISTS documentation_results RENAME COLUMN ambulatory_aid TO morse_ambulatory_aid;
ALTER TABLE IF EXISTS documentation_results RENAME COLUMN iv_therapy_heparin_lock TO morse_iv;
ALTER TABLE IF EXISTS documentation_results RENAME COLUMN fall_risk_gait TO morse_gait;
ALTER TABLE IF EXISTS documentation_results RENAME COLUMN mental_status TO morse_mental_status;
-- Braden Skin
ALTER TABLE IF EXISTS documentation_results RENAME COLUMN sensory_perception TO braden_sensory_perception;
ALTER TABLE IF EXISTS documentation_results RENAME COLUMN moisture TO braden_moisture;
ALTER TABLE IF EXISTS documentation_results RENAME COLUMN activity TO braden_activity;
ALTER TABLE IF EXISTS documentation_results RENAME COLUMN mobility TO braden_mobility;
ALTER TABLE IF EXISTS documentation_results RENAME COLUMN nutrition TO braden_nutrition;
ALTER TABLE IF EXISTS documentation_results RENAME COLUMN friction_and_shear TO braden_friction_and_shear;
-- PAINAD
ALTER TABLE IF EXISTS documentation_results RENAME COLUMN facial_expression TO painad_facial_expression;
ALTER TABLE IF EXISTS documentation_results RENAME COLUMN body_language TO painad_body_language;
ALTER TABLE IF EXISTS documentation_results RENAME COLUMN consolability TO painad_consolability;
ALTER TABLE IF EXISTS documentation_results RENAME COLUMN breathing_independent_of_vocalization TO painad_breathing;
ALTER TABLE IF EXISTS documentation_results RENAME COLUMN negative_vocalization TO painad_negative_vocalization;

------------------------------------------------------------------------------
-- Perform same renaming for editable_documentation_results  
------------------------------------------------------------------------------
ALTER TABLE IF EXISTS editable_documentation_results RENAME COLUMN oral TO oral_intake_ml;
ALTER TABLE IF EXISTS editable_documentation_results RENAME COLUMN intravenous TO iv_intake_ml;
ALTER TABLE IF EXISTS editable_documentation_results RENAME COLUMN enteral_nutrition TO enteral_intake_ml;
ALTER TABLE IF EXISTS editable_documentation_results RENAME COLUMN parenteral_nutrition TO parenteral_intake_ml;
ALTER TABLE IF EXISTS editable_documentation_results RENAME COLUMN wound_drainage TO wound_output_ml;
ALTER TABLE IF EXISTS editable_documentation_results RENAME COLUMN enteral_output TO enteral_output_ml;
ALTER TABLE IF EXISTS editable_documentation_results RENAME COLUMN urine TO urine_output_ml;
ALTER TABLE IF EXISTS editable_documentation_results RENAME COLUMN stool TO stool_occurrence;
ALTER TABLE IF EXISTS editable_documentation_results RENAME COLUMN emesis TO emesis_output_ml;
ALTER TABLE IF EXISTS editable_documentation_results RENAME COLUMN pain TO pain_numeric_scale;   
ALTER TABLE IF EXISTS editable_documentation_results RENAME COLUMN extremities TO cardiac_extremities;
ALTER TABLE IF EXISTS editable_documentation_results RENAME COLUMN nausea TO gi_symptoms;
ALTER TABLE IF EXISTS editable_documentation_results RENAME COLUMN iv_site TO iv_site_1;
ALTER TABLE IF EXISTS editable_documentation_results RENAME COLUMN iv_location TO iv_location_1;
ALTER TABLE IF EXISTS editable_documentation_results RENAME COLUMN iv_type TO iv_type_1;
-- CIWA
ALTER TABLE IF EXISTS editable_documentation_results RENAME COLUMN nausea_vomiting TO ciwa_nausea_vomiting;
ALTER TABLE IF EXISTS editable_documentation_results RENAME COLUMN tremor TO ciwa_tremor;
ALTER TABLE IF EXISTS editable_documentation_results RENAME COLUMN paroxysmal_sweats TO ciwa_sweats;
ALTER TABLE IF EXISTS editable_documentation_results RENAME COLUMN anxiety TO ciwa_anxiety;
ALTER TABLE IF EXISTS editable_documentation_results RENAME COLUMN agitation TO ciwa_agitation;
ALTER TABLE IF EXISTS editable_documentation_results RENAME COLUMN tactile_disturbances TO ciwa_tactile;
ALTER TABLE IF EXISTS editable_documentation_results RENAME COLUMN visual_disturbances TO ciwa_visual;
ALTER TABLE IF EXISTS editable_documentation_results RENAME COLUMN headache TO ciwa_headache;
ALTER TABLE IF EXISTS editable_documentation_results RENAME COLUMN orientation2 TO ciwa_orientation;
-- Morse Fall Risk
ALTER TABLE IF EXISTS editable_documentation_results RENAME COLUMN history_of_falling TO morse_fall_history;
ALTER TABLE IF EXISTS editable_documentation_results RENAME COLUMN secondary_diagnosis TO morse_secondary_diagnosis;
ALTER TABLE IF EXISTS editable_documentation_results RENAME COLUMN ambulatory_aid TO morse_ambulatory_aid;
ALTER TABLE IF EXISTS editable_documentation_results RENAME COLUMN iv_therapy_heparin_lock TO morse_iv;
ALTER TABLE IF EXISTS editable_documentation_results RENAME COLUMN fall_risk_gait TO morse_gait;
ALTER TABLE IF EXISTS editable_documentation_results RENAME COLUMN mental_status TO morse_mental_status;
-- Braden Skin
ALTER TABLE IF EXISTS editable_documentation_results RENAME COLUMN sensory_perception TO braden_sensory_perception;
ALTER TABLE IF EXISTS editable_documentation_results RENAME COLUMN moisture TO braden_moisture;
ALTER TABLE IF EXISTS editable_documentation_results RENAME COLUMN activity TO braden_activity;
ALTER TABLE IF EXISTS editable_documentation_results RENAME COLUMN mobility TO braden_mobility;
ALTER TABLE IF EXISTS editable_documentation_results RENAME COLUMN nutrition TO braden_nutrition;
ALTER TABLE IF EXISTS editable_documentation_results RENAME COLUMN friction_and_shear TO braden_friction_and_shear;
-- PAINAD
ALTER TABLE IF EXISTS editable_documentation_results RENAME COLUMN facial_expression TO painad_facial_expression;
ALTER TABLE IF EXISTS editable_documentation_results RENAME COLUMN body_language TO painad_body_language;
ALTER TABLE IF EXISTS editable_documentation_results RENAME COLUMN consolability TO painad_consolability;
ALTER TABLE IF EXISTS editable_documentation_results RENAME COLUMN breathing_independent_of_vocalization TO painad_breathing;
ALTER TABLE IF EXISTS editable_documentation_results RENAME COLUMN negative_vocalization TO painad_negative_vocalization;

----------------------------------------------------------------------------
-- Add missing documentation_results and editable_documentation_results cols
----------------------------------------------------------------------------
ALTER TABLE IF EXISTS documentation_results
  ADD COLUMN IF NOT EXISTS mean_arterial_pressure text,
  ADD COLUMN IF NOT EXISTS bp_position text,
  ADD COLUMN IF NOT EXISTS urine_occurrence text,
  ADD COLUMN IF NOT EXISTS stool_output_ml text,
  ADD COLUMN IF NOT EXISTS emesis_occurrence text,
  ADD COLUMN IF NOT EXISTS level_of_consciousness text,
  ADD COLUMN IF NOT EXISTS pupils text,
  ADD COLUMN IF NOT EXISTS neuro_sensation text,
  ADD COLUMN IF NOT EXISTS muscle_strength text,
  ADD COLUMN IF NOT EXISTS mental_status text,
  ADD COLUMN IF NOT EXISTS wound_location text,
  ADD COLUMN IF NOT EXISTS wound_type text,
  ADD COLUMN IF NOT EXISTS wound_dimensions text,
  ADD COLUMN IF NOT EXISTS wound_bed text,
  ADD COLUMN IF NOT EXISTS wound_exudate text,
  ADD COLUMN IF NOT EXISTS periwound_skin text,
  ADD COLUMN IF NOT EXISTS primary_wound_dressing text,
  ADD COLUMN IF NOT EXISTS secondary_wound_dressing text,
  ADD COLUMN IF NOT EXISTS wound_stage text,
  ADD COLUMN IF NOT EXISTS iv_site_2 text,
  ADD COLUMN IF NOT EXISTS iv_location_2 text,
  ADD COLUMN IF NOT EXISTS iv_type_2 text,
  ADD COLUMN IF NOT EXISTS faces_pain_scale text;

ALTER TABLE IF EXISTS editable_documentation_results
  ADD COLUMN IF NOT EXISTS mean_arterial_pressure text,
  ADD COLUMN IF NOT EXISTS bp_position text,
  ADD COLUMN IF NOT EXISTS urine_occurrence text,
  ADD COLUMN IF NOT EXISTS stool_output_ml text,
  ADD COLUMN IF NOT EXISTS emesis_occurrence text,
  ADD COLUMN IF NOT EXISTS level_of_consciousness text,
  ADD COLUMN IF NOT EXISTS pupils text,
  ADD COLUMN IF NOT EXISTS neuro_sensation text,
  ADD COLUMN IF NOT EXISTS muscle_strength text,
  ADD COLUMN IF NOT EXISTS mental_status text,
  ADD COLUMN IF NOT EXISTS wound_location text,
  ADD COLUMN IF NOT EXISTS wound_type text,
  ADD COLUMN IF NOT EXISTS wound_dimensions text,
  ADD COLUMN IF NOT EXISTS wound_bed text,
  ADD COLUMN IF NOT EXISTS wound_exudate text,
  ADD COLUMN IF NOT EXISTS periwound_skin text,
  ADD COLUMN IF NOT EXISTS primary_wound_dressing text,
  ADD COLUMN IF NOT EXISTS secondary_wound_dressing text,
  ADD COLUMN IF NOT EXISTS wound_stage text,
  ADD COLUMN IF NOT EXISTS iv_site_2 text,
  ADD COLUMN IF NOT EXISTS iv_location_2 text,
  ADD COLUMN IF NOT EXISTS iv_type_2 text,
  ADD COLUMN IF NOT EXISTS faces_pain_scale text;

-----------------------------------------------------
-- Update existing records for former 'Nausea' column
-----------------------------------------------------
UPDATE documentation_results
  SET gi_symptoms = 'intermittent nausea'
  WHERE gi_symptoms IS NOT null;

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
    hr, hr_source, bp, bp_source, mean_arterial_pressure, bp_position, rr, temp, temp_source, spo2, supplemental_o2_rate, 
    oxygen_device, pain_numeric_scale, weight_kg, oral_intake_ml, iv_intake_ml, enteral_intake_ml, parenteral_intake_ml, 
    urine_output_ml, emesis_output_ml, stool_occurrence, wound_output_ml, enteral_output_ml, urine_occurrence, 
    stool_output_ml, emesis_occurrence, 
    
    -- Assessments
    appearance, safety_check, mood_and_affect, head_and_scalp, eyes, ears, nose, mouth_and_throat, 
    orientation, speech, motor_function, skin, hair_and_nails, turgor, wound, 
    heart_sounds, cardiac_extremities, jugular_distention, chest_appearance, lung_sounds, abdomen, bowel_sounds, 
    gi_symptoms, extremity_rom, gait, voiding, iv_site_1, iv_type_1, iv_location_1, iv_site_2, iv_type_2, iv_location_2,
    nursing_care_provided, level_of_consciousness, pupils, neuro_sensation, muscle_strength, mental_status, 
    wound_location, wound_type, wound_dimensions, wound_bed, wound_exudate, periwound_skin, primary_wound_dressing, 
    secondary_wound_dressing, wound_stage, urine_description, pain_location, pain_characteristics, pain_alleviating_factors
    pain_aggravating_factors, pain_interventions, faces_pain_scale,
    
    -- Scales & Scores
    ciwa_nausea_vomiting, ciwa_tremor, ciwa_sweats, ciwa_anxiety, ciwa_agitation, ciwa_tactile, 
    ciwa_visual, ciwa_headache, ciwa_orientation, morse_fall_history, morse_secondary_diagnosis, 
    morse_ambulatory_aid, morse_iv, morse_gait, morse_mental_status, braden_sensory_perception, 
    braden_moisture, braden_activity, braden_mobility, braden_nutrition, braden_friction_and_shear, painad_breathing, 
    painad_negative_vocalization, painad_facial_expression, painad_body_language, painad_consolability,

    -- Assessment Selections
    general_appearance_selections, psychosocial_selections, heent_selections, neuro_selections, integument_selections,
    cardiovascular_selections, respiratory_selections, musculoskeletal_selections, genitourinary_selections, 
    assessment_tool_selections, gi_selections, intake_selections, output_selections,

    created_at,
    'case_documentation' as source_type    
  FROM documentation_results

  UNION ALL

  -- Student Documentation
  SELECT
    id,
    case_id,
    case_session_id,
    user_id,
    group_id,
    is_in_presim,
    time_offset,
    
    -- Vitals & I/O
    hr, hr_source, bp, bp_source, mean_arterial_pressure, bp_position, rr, temp, temp_source, spo2, supplemental_o2_rate, 
    oxygen_device, pain_numeric_scale, weight_kg, oral_intake_ml, iv_intake_ml, enteral_intake_ml, parenteral_intake_ml, 
    urine_output_ml, emesis_output_ml, stool_occurrence, wound_output_ml, enteral_output_ml, urine_occurrence, 
    stool_output_ml, emesis_occurrence, 
    
    -- Assessments
    appearance, safety_check, mood_and_affect, head_and_scalp, eyes, ears, nose, mouth_and_throat, 
    orientation, speech, motor_function, skin, hair_and_nails, turgor, wound, 
    heart_sounds, cardiac_extremities, jugular_distention, chest_appearance, lung_sounds, abdomen, bowel_sounds, 
    gi_symptoms, extremity_rom, gait, voiding, iv_site_1, iv_type_1, iv_location_1, iv_site_2, iv_type_2, iv_location_2,
    nursing_care_provided, level_of_consciousness, pupils, neuro_sensation, muscle_strength, mental_status, 
    wound_location, wound_type, wound_dimensions, wound_bed, wound_exudate, periwound_skin, primary_wound_dressing, 
    secondary_wound_dressing, wound_stage, urine_description, pain_location, pain_characteristics, pain_alleviating_factors
    pain_aggravating_factors, pain_interventions, faces_pain_scale,
    
    -- Scales & Scores
    ciwa_nausea_vomiting, ciwa_tremor, ciwa_sweats, ciwa_anxiety, ciwa_agitation, ciwa_tactile, 
    ciwa_visual, ciwa_headache, ciwa_orientation, morse_fall_history, morse_secondary_diagnosis, 
    morse_ambulatory_aid, morse_iv, morse_gait, morse_mental_status, braden_sensory_perception, 
    braden_moisture, braden_activity, braden_mobility, braden_nutrition, braden_friction_and_shear, painad_breathing, 
    painad_negative_vocalization, painad_facial_expression, painad_body_language, painad_consolability,

    -- Assessment Selections
    general_appearance_selections, psychosocial_selections, heent_selections, neuro_selections, integument_selections,
    cardiovascular_selections, respiratory_selections, musculoskeletal_selections, genitourinary_selections, 
    assessment_tool_selections, gi_selections, intake_selections, output_selections,
    
    created_at,
    'student_documentation' as source_type  
  FROM editable_documentation_results;

---------------------------------------------------
-- Add enums for custom FlexSheet template creation
---------------------------------------------------
CREATE TYPE case_specialty_type AS ENUM ('med_surg', 'ob', 'mental_health', 'public_health');

CREATE TYPE flexsheet_section_type AS ENUM (
  'vitals',
  'vitals_overview',
  'input', 
  'output', 
  'base_pain', 
  'faces_pain', 
  'general_appearance', 
  'psychosocial', 
  'heent', 
  'neuro', 
  'integument', 
  'cardiac', 
  'respiratory', 
  'wound', 
  'gi', 
  'musculoskeletal', 
  'genitourinary', 
  'iv_1', 
  'iv_2', 
  'nursing_care',
  'braden',
  'morse',
  'ciwa',
  'painad'
);

ALTER TABLE cases
  ADD COLUMN IF NOT EXISTS flexsheet_sections flexsheet_section_type[],
  ADD COLUMN IF NOT EXISTS case_specialty case_specialty_type;

-- Back fill cases with default med-surg template
UPDATE cases 
  SET flexsheet_sections = ARRAY[
    'vitals', 'input', 'output', 'base_pain', 'faces_pain', 'general_appearance',
    'psychosocial', 'heent', 'neuro', 'integument', 'cardiac', 'respiratory', 'wound',
    'gi', 'musculoskeletal', 'genitourinary', 'iv_1', 'nursing_care', 'ciwa'
  ]::flexsheet_section_type[];

UPDATE cases 
  SET case_specialty = 'med_surg';

ALTER TABLE cases
  ALTER COLUMN case_specialty SET NOT NULL,
  ALTER COLUMN flexsheet_sections SET DEFAULT '{}'::flexsheet_section_type[];