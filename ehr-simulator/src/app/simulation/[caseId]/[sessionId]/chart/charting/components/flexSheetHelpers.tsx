import { FlexSheetData } from "./flexSheetData";

const bpThresholds = {
  diastolic: { low: 60, high: 120 },
  systolic: { low: 90, high: 180 }
}

export function getAlertFlag(
  rowOriginal: FlexSheetData,
  value: string,
  componentType: string
): boolean {
  if (!value || componentType != 'input') {
    return false
  }

  if (rowOriginal.id === 'bpInput') {
    const [systolicStr, diastolicStr] = value.split('/');
    const systolic = parseFloat(systolicStr)
    const diastolic = parseFloat(diastolicStr)

    let diaAlert = false;
    let sysAlert = false;

    if (!isNaN(systolic)) {
      sysAlert = systolic < bpThresholds.systolic.low || systolic > bpThresholds.systolic.high;
      diaAlert = diastolic < bpThresholds.diastolic.low || diastolic > bpThresholds.diastolic.high;

      return sysAlert || diaAlert
    }
  }
  const normalRange = rowOriginal?.normalRange;
  if (normalRange) {
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
      return numericValue < normalRange.low || numericValue > normalRange.high;
    }
  }

  return false;
}
