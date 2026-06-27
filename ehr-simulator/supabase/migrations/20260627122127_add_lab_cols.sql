ALTER TABLE IF EXISTS lab_results
  ADD COLUMN IF NOT EXISTS blood_type text,
  ADD COLUMN IF NOT EXISTS rh_factor text,
  ADD COLUMN IF NOT EXISTS inr text,
  ADD COLUMN IF NOT EXISTS bnp text,
  ADD COLUMN IF NOT EXISTS hba1c text,
  ADD COLUMN IF NOT EXISTS d_dimer text,
  ADD COLUMN IF NOT EXISTS procal text,
  ADD COLUMN IF NOT EXISTS basophils text,
  ADD COLUMN IF NOT EXISTS monocytes text,
  ADD COLUMN IF NOT EXISTS eosinophils text,
  ADD COLUMN IF NOT EXISTS lymphocytes text,
  ADD COLUMN IF NOT EXISTS neutrophils text,


  ADD COLUMN IF NOT EXISTS art_pco2 text,
  ADD COLUMN IF NOT EXISTS art_po2 text,
  ADD COLUMN IF NOT EXISTS art_ph  text,
  ADD COLUMN IF NOT EXISTS art_so2 text,


  ADD COLUMN IF NOT EXISTS ven_ph text,
  ADD COLUMN IF NOT EXISTS ven_so2 text;


ALTER TABLE IF EXISTS lab_results RENAME COLUMN pco2 TO ven_pco2;
ALTER TABLE IF EXISTS lab_results RENAME COLUMN po2 TO ven_po2;
ALTER TABLE IF EXISTS lab_results RENAME COLUMN co2 TO total_co2;
ALTER TABLE IF EXISTS lab_results RENAME COLUMN blood TO urine_blood;
ALTER TABLE IF EXISTS lab_results RENAME COLUMN protein TO urine_protein;