UPDATE public.cases
SET flexsheet_sections = ARRAY[
  'vitals', 'input', 'output', 'base_pain', 'faces_pain', 'general_appearance',
  'psychosocial', 'heent', 'neuro', 'integument', 'cardiac', 'respiratory', 'wound',
  'gi', 'musculoskeletal', 'genitourinary', 'iv_1', 'nursing_care', 'ciwa'
]::public.flexsheet_section_type[];