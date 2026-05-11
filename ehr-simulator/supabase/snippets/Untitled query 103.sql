SELECT column_name
  FROM information_schema.columns
  WHERE table_schema = 'public' 
    AND table_name = 'documentation_results'  
    AND column_name = 'urine_occurrence';

select urine_description from documentation_results;

INSERT INTO documentation_results (
  "id", "case_id", "is_in_presim", "time_offset", "hr", "hr_source", "bp", "bp_source", 
  "rr", "temp", "temp_source", "spo2", "pain_numeric_scale", "weight_kg", "oral_intake_ml", 
  "iv_intake_ml", "enteral_intake_ml", "parenteral_intake_ml", "urine_output_ml", 
  "emesis_output_ml", "stool_output_ml", "wound_output_ml", "enteral_output_ml", 
  "appearance", "safety_check", "mood_and_affect", "head_and_scalp", "eyes", "ears", 
  "nose", "mouth_and_throat", "orientation", "speech", "motor_function", "skin", 
  "hair_and_nails", "turgor", "wound", "heart_sounds", "cardiac_extremities", 
  "jugular_distention", "chest_appearance", "lung_sounds", "abdomen", "bowel_sounds", 
  "nausea", "extremity_rom", "gait", "voiding", "iv_site", "iv_type", "iv_location", 
  "nursing_care_provided", "ciwa_nausea_vomiting", "ciwa_tremor", "ciwa_sweats", 
  "ciwa_anxiety", "ciwa_agitation", "ciwa_tactile", "ciwa_visual", "ciwa_headache", 
  "ciwa_orientation", "morse_fall_history", "morse_secondary_diagnosis", "morse_ambulatory_aid", 
  "morse_iv", "morse_gait", "morse_mental_status", "braden_sensory_perception", 
  "braden_moisture", "braden_activity", "braden_mobility", "braden_nutrition", 
  "braden_friction_and_shear", "painad_breathing", "painad_negative_vocalization", 
  "painad_facial_expression", "painad_body_language", "painad_consolability", 
  "created_at", "spo2_source", "pain_location", "pain_characteristics", "pain_alleviating_factors", 
  "pain_aggravating_factors", "pain_interventions", "urine_description", "mean_arterial_pressure", 
  "bp_position", "urine_occurrence", "stool_occurrence", "emesis_occurrence", 
  "level_of_consciousness", "pupils", "neuro_sensation", "muscle_strength", 
  "mental_status", "gi_symptoms"
) VALUES 
    ('040ef9a8-14a7-4e60-aa6b-a0847cb5f782', 'e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d', 'true', '-180', '85', 'Monitor', '122/80', 'Right upper arm', '16', '37.2', 'Oral', '99%', '3', '78.5', '240', '100', '0', '0', '350', '0', '0', '0', '0', 'Resting comfortably', 'Call light in reach, bed low', 'Calm, cooperative', 'Normocephalic, atraumatic', 'PERRLA', 'No drainage', 'Clear, no lesions', 'Moist mucous membranes', 'Alert and oriented x4', 'Clear, distinct', 'Moves all extremities well', 'Warm, dry, intact', 'Clean, normal distribution', 'Good, elastic', 'None present', 'Regular rate and rhythm', 'Warm, 2+ pulses bilaterally', 'Flat', 'Symmetrical expansion', 'Clear bilaterally', 'Soft, non-tender', 'Normoactive x4 quadrants', 'None', 'Full ROM', 'Steady', 'Spontaneous, unassisted', 'Clean, dry, intact', 'Peripheral', 'Right forearm', 'Assessed vitals, provided water', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '20', '0', '0', '4', '4', '4', '4', '4', '3', '0', '0', '0', '0', '0', '2026-04-18 01:22:14.42574+00', 'Room air', 'Lower back', 'Dull ache', 'Repositioning', 'Movement', 'Repositioned, offered ice', 'Clear, yellow', '94', 'Supine', '1', '0', '0', 'Alert', 'Equal, round, reactive', 'Intact bilaterally', '5/5 bilaterally', 'Baseline', 'None');
