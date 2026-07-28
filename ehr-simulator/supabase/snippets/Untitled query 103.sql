SELECT 
  medications.id, 
  generic_name, 
  brand_name, 
  is_variable_dose, 
  strength, 
  name, 
  strength_unit, 
  route 
FROM medications 
INNER JOIN dispense_units ON medications.dispense_unit_id = dispense_units.id 
ORDER BY generic_name;