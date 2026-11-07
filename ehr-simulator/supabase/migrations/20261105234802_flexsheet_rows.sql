ALTER TABLE IF EXISTS documentation_results
  ADD COLUMN IF NOT EXISTS membranes text,
  ADD COLUMN IF NOT EXISTS rupture_of_membranes text,
  ADD COLUMN IF NOT EXISTS fluid_color text,
  ADD COLUMN IF NOT EXISTS fundal_consistency text,
  ADD COLUMN IF NOT EXISTS fundal_placement text,
  ADD COLUMN IF NOT EXISTS fundal_height text,
  ADD COLUMN IF NOT EXISTS lochia text,

  ADD COLUMN IF NOT EXISTS fhr_baseline text,
  ADD COLUMN IF NOT EXISTS fhr_variability text,
  ADD COLUMN IF NOT EXISTS fhr_acceleration text,
  ADD COLUMN IF NOT EXISTS fhr_decelerations text,
  ADD COLUMN IF NOT EXISTS contraction_frequency text,
  ADD COLUMN IF NOT EXISTS contraction_duration text,
  ADD COLUMN IF NOT EXISTS contraction_strength text,

  ADD COLUMN IF NOT EXISTS quantified_blood_loss text;


ALTER TABLE IF EXISTS editable_documentation_results
  ADD COLUMN IF NOT EXISTS membranes text,
  ADD COLUMN IF NOT EXISTS rupture_of_membranes text,
  ADD COLUMN IF NOT EXISTS fluid_color text,
  ADD COLUMN IF NOT EXISTS fundal_consistency text,
  ADD COLUMN IF NOT EXISTS fundal_placement text,
  ADD COLUMN IF NOT EXISTS fundal_height text,
  ADD COLUMN IF NOT EXISTS lochia text,

  ADD COLUMN IF NOT EXISTS fhr_baseline text,
  ADD COLUMN IF NOT EXISTS fhr_variability text,
  ADD COLUMN IF NOT EXISTS fhr_acceleration text,
  ADD COLUMN IF NOT EXISTS fhr_decelerations text,
  ADD COLUMN IF NOT EXISTS contraction_frequency text,
  ADD COLUMN IF NOT EXISTS contraction_duration text,
  ADD COLUMN IF NOT EXISTS contraction_strength text,

  ADD COLUMN IF NOT EXISTS quantified_blood_loss text;


ALTER TYPE flexsheet_section_type ADD VALUE IF NOT EXISTS 'reproductive';
ALTER TYPE flexsheet_section_type ADD VALUE IF NOT EXISTS 'fetal';
ALTER TYPE flexsheet_section_type ADD VALUE IF NOT EXISTS 'quantified_blood_loss';


DROP VIEW IF EXISTS all_documentation_results;
