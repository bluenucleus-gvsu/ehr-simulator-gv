export interface ImagingData {
  displayName: string;
  technique: string;
  findings: {
    region: string,
    description: string
  }[];
  impressions: string[];
  isCritical: boolean | 'indeterminate';

}

export interface MicrobiologyReportData {
  sampleType: string;
  appearance: string;
  microscopy: string;
  location?: string;
  cultureResults: string;
  sensitivity: string;
  comments: string;
  reporter: string;
  isCritical: boolean | 'indeterminate';
}

export type LabCellValue = string | ImagingData | MicrobiologyReportData;

// dataset to be used by tanstack table
export interface LabTableData {
  field: string;
  rowType: "divider" | "results" | "imaging" | "microbiology";
  unit?: string;
  normalRange?: { low: number, high: number };
  criticalRange?: { low: number, high: number };
  hideable?: boolean;
  visibleInPresim?: boolean;
  dbColumn?: string;
  [key: string | number]: string | number | boolean | undefined | object | ImagingData | MicrobiologyReportData | LabCellValue;
}

export function getResultStatus(
  initialValue: string,
  normalRange: { low: number; high: number } | undefined,
  criticalRange: { low: number; high: number } | undefined,
) {
  const numericValue = parseFloat(initialValue);

  if (isNaN(numericValue)) {
    return "invalid";
  }
  if (criticalRange && (numericValue < criticalRange.low || numericValue > criticalRange.high)) {
    return "critical";
  }
  if (normalRange && (numericValue < normalRange.low || numericValue > normalRange.high)) {
    return "abnormal";
  }
  return "normal";
}

export const labTemplate: LabTableData[] = [
  {
    field: "Metabolic",
    unit: "",
    rowType: "divider",
  },
  {
    field: "Sodium",
    dbColumn: "sodium",
    unit: "(mEq/L)",
    rowType: "results",
    normalRange: { low: 135, high: 145 },
  },
  {
    field: "Potassium",
    dbColumn: "potassium",
    unit: "(mEq/L)",
    rowType: "results",
    normalRange: { low: 3.5, high: 5.0 },
    criticalRange: { low: 3.0, high: 6.0 },
  },
  {
    field: "Chloride",
    dbColumn: "chloride",
    unit: "(mEq/L)",
    rowType: "results",
    normalRange: { low: 95, high: 105 },
  },
  {
    field: "BUN",
    dbColumn: "bun",
    unit: "(mg/dL)",
    rowType: "results",
    normalRange: { low: 7, high: 20 },
  },
  {
    field: "Creatinine",
    dbColumn: "creatinine",
    unit: "(mg/dL)",
    rowType: "results",
    normalRange: { low: 0.6, high: 1.2 },
  },
  {
    field: "Glucose",
    dbColumn: "glucose",
    unit: "(mg/dL)",
    rowType: "results",
    normalRange: { low: 70, high: 100 },
  },
  {
    field: "CO2",
    dbColumn: "total_co2",
    unit: "(mEq/L)",
    rowType: "results",
    normalRange: { low: 23, high: 30 },
  },
  {
    field: "Calcium",
    dbColumn: "calcium",
    unit: "(mg/dL)",
    rowType: "results",
    normalRange: { low: 8.5, high: 10.5 },
  },
  {
    field: "Lactate",
    dbColumn: "lactate",
    unit: "(mmol/L)",
    rowType: "results",
    normalRange: { low: 0.5, high: 1.0 },
    hideable: true

  },
  {
    field: "HbA1c",
    dbColumn: "hba1c",
    unit: "%",
    rowType: "results",
    normalRange: { low: 4.0, high: 5.6 },
    hideable: true
  },
  {
    field: "Hematology",
    unit: "",
    rowType: "divider",
  },
  {
    field: "RBC",
    dbColumn: "rbc",
    unit: "(10⁶/µL)",
    rowType: "results",
    normalRange: { low: 4.0, high: 6.0 },
  },
  {
    field: "Hemoglobin",
    dbColumn: "hemoglobin",
    unit: "(g/dL)",
    rowType: "results",
    normalRange: { low: 12.0, high: 17.5 },
  },
  {
    field: "Hematocrit",
    dbColumn: "hematocrit",
    unit: "(%)",
    rowType: "results",
    normalRange: { low: 36, high: 54 },
  },
  {
    field: "MCV",
    dbColumn: "mcv",
    unit: "(fL)",
    rowType: "results",
    normalRange: { low: 80, high: 100 },
  },
  {
    field: "MCH",
    dbColumn: "mch",
    unit: "(pg)",
    rowType: "results",
    normalRange: { low: 27, high: 33 },
  },
  {
    field: "MCHC",
    dbColumn: "mchc",
    unit: "(g/dL)",
    rowType: "results",
    normalRange: { low: 32, high: 36 },
  },
  {
    field: "WBC",
    dbColumn: "wbc",
    unit: "(10³/µL)",
    rowType: "results",
    normalRange: { low: 4.5, high: 11.0 },
  },
  {
    field: 'Neutrophils',
    dbColumn: 'neutrophils',
    unit: '%',
    rowType: 'results',
    normalRange: { low: 55, high: 70 },
    hideable: true
  },
  {
    field: 'Lymphocytes',
    dbColumn: 'lymphocytes',
    unit: '%',
    rowType: 'results',
    normalRange: { low: 20, high: 40 },
    hideable: true
  },
  {
    field: 'Monocytes',
    dbColumn: 'monocytes',
    unit: '%',
    rowType: 'results',
    normalRange: { low: 2, high: 8 },
    hideable: true
  },
  {
    field: 'Eosinophils',
    dbColumn: 'eosinophils',
    unit: '%',
    rowType: 'results',
    normalRange: { low: 1, high: 4 },
    hideable: true
  },
  {
    field: 'Basophils',
    dbColumn: 'basophils',
    unit: '%',
    rowType: 'results',
    normalRange: { low: 0.5, high: 1 },
    hideable: true
  },
  {
    field: "Platelets",
    dbColumn: "platelets",
    unit: "(10³/µL)",
    rowType: "results",
    normalRange: { low: 150, high: 450 },
  },
  {
    field: "Blood Type",
    dbColumn: "blood_type",
    unit: "",
    rowType: "results",
    hideable: true
  },
  {
    field: "Rh Factor",
    dbColumn: "rh_factor",
    unit: "",
    rowType: "results",
    hideable: true
  },
  {
    field: "Cardiac",
    unit: "",
    rowType: "divider",
  },
  {
    field: "Troponin",
    dbColumn: "troponin",
    unit: "(ng/mL)",
    rowType: "results",
    normalRange: { low: 0, high: 0.04 },
  },
  {
    field: "CKMB",
    dbColumn: "ckmb",
    unit: "(ng/mL)",
    rowType: "results",
    normalRange: { low: 0, high: 3 },
    hideable: true

  },
  {
    field: "Myoglobin",
    dbColumn: "myoglobin",
    unit: "(ng/mL)",
    rowType: "results",
    normalRange: { low: 0, high: 85 },
    hideable: true

  },
  {
    field: "BNP",
    dbColumn: "bnp",
    unit: "(pg/mL)",
    rowType: "results",
    normalRange: { low: 0, high: 100 },
  },
  {
    field: "D-Dimer",
    dbColumn: "d_dimer",
    unit: "(ng/mL)",
    rowType: "results",
    normalRange: { low: 0, high: 500 },
  },
  {
    field: "Procalcitonin",
    dbColumn: "procal",
    unit: "(ng/mL)",
    rowType: "results",
    normalRange: { low: 0.0, high: 0.15 },
    hideable: true

  },
  {
    field: "Hepatology",
    unit: "",
    rowType: "divider",
  },
  {
    field: "AST",
    dbColumn: "ast",
    unit: "(IU/L)",
    rowType: "results",
    normalRange: { low: 10, high: 40 },
  },
  {
    field: "ALT",
    dbColumn: "alt",
    unit: "(IU/L)",
    rowType: "results",
    normalRange: { low: 7, high: 56 },
  },
  {
    field: "ALP",
    dbColumn: "alp",
    unit: "(IU/L)",
    rowType: "results",
    normalRange: { low: 40, high: 120 },
  },
  {
    field: "Total Bilirubin",
    dbColumn: "total_bilirubin",
    unit: "(mg/dL)",
    rowType: "results",
    normalRange: { low: 0.1, high: 1.2 },
  },
  {
    field: "Albumin",
    dbColumn: "albumin",
    unit: "(g/dL)",
    rowType: "results",
    normalRange: { low: 3.5, high: 5.0 },
  },
  {
    field: "Ammonia",
    dbColumn: "ammonia",
    unit: "(mcg/dL)",
    rowType: "results",
    normalRange: { low: 15, high: 45 }
  },
  {
    field: "Blood Gases",
    unit: "",
    rowType: "divider",
  },
  {
    field: "pH (Arterial)",
    dbColumn: "art_ph",
    unit: "",
    rowType: "results",
    normalRange: { low: 7.35, high: 7.45 },
    hideable: true

  },
  {
    field: "O2 Sat. (Arterial)",
    dbColumn: "art_so2",
    unit: "(%)",
    rowType: "results",
    normalRange: { low: 95, high: 100 },
    hideable: true

  },
  {
    field: "pCO2 (Arterial)",
    dbColumn: "art_pco2",
    unit: "mmHg",
    rowType: "results",
    normalRange: { low: 35, high: 45 },
    hideable: true

  },
  {
    field: "pO2 (Arterial)",
    dbColumn: "art_po2",
    unit: "(mmHg)",
    rowType: "results",
    normalRange: { low: 75, high: 100 },
    hideable: true

  },
  {
    field: "pH (Venous)",
    dbColumn: "ven_ph",
    unit: "",
    rowType: "results",
    normalRange: { low: 7.31, high: 7.41 },
    hideable: true

  },
  {
    field: "O2 Sat. (Venous)",
    dbColumn: "ven_so2",
    unit: "(%)",
    rowType: "results",
    normalRange: { low: 60, high: 80 },
    hideable: true

  },
  {
    field: "pCO2 (Venous)",
    dbColumn: "ven_pco2",
    unit: "(mmHg)",
    rowType: "results",
    normalRange: { low: 41, high: 51 },
    hideable: true

  },
  {
    field: "pO2 (Venous)",
    dbColumn: "ven_po2",
    unit: "(mmHg)",
    rowType: "results",
    normalRange: { low: 30, high: 40 },
    hideable: true

  },
  {
    field: "HCO3",
    dbColumn: "hco3",
    unit: "mEq/L",
    rowType: "results",
    normalRange: { low: 22, high: 29 },
    hideable: true

  },
  {
    field: "Urinalysis",
    unit: "",
    rowType: "divider",
  },
  {
    field: "Specific Gravity",
    dbColumn: "specific_gravity",
    unit: "",
    rowType: "results",
    normalRange: { low: 1.005, high: 1.030 },
  },
  {
    field: "Urine pH",
    dbColumn: "urine_ph",
    unit: "",
    rowType: "results",
    normalRange: { low: 4.5, high: 8.0 },
  },
  {
    field: "Protein",
    dbColumn: "urine_protein",
    unit: "",
    rowType: "results",
  },
  {
    field: "Urine Glucose",
    dbColumn: "urine_glucose",
    unit: "",
    rowType: "results",
  },
  {
    field: "Ketones",
    dbColumn: "ketones",
    unit: "",
    rowType: "results",
  },
  {
    field: "Leukocyte Esterase",
    dbColumn: "leukocyte_esterase",
    unit: "",
    rowType: "results",
  },
  {
    field: "Nitrites",
    dbColumn: "nitrites",
    unit: "",
    rowType: "results",
  },
  {
    field: "Blood",
    dbColumn: "urine_blood",
    unit: "",
    rowType: "results",
  },
  {
    field: "Coagulation",
    unit: "",
    rowType: "divider",
  },
  {
    field: "PT",
    dbColumn: "pt",
    unit: "(sec)",
    rowType: "results",
    normalRange: { low: 11.0, high: 13.5 },
  },
  {
    field: "PTT",
    dbColumn: "ptt",
    unit: "(sec)",
    rowType: "results",
    normalRange: { low: 25, high: 35 },
  },
  {
    field: "INR",
    dbColumn: "inr",
    unit: "",
    rowType: "results",
    normalRange: { low: 0.8, high: 1.1 },
  },
  {
    field: "Inflammatory Markers",
    unit: "",
    rowType: "divider",
  },
  {
    field: "CRP",
    dbColumn: "crp",
    unit: "(mg/L)",
    rowType: "results",
    normalRange: { low: 0, high: 10 },
  },
  {
    field: "ESR",
    dbColumn: "esr",
    unit: "(mm/hr)",
    rowType: "results",
    normalRange: { low: 0, high: 20 },
  },
  {
    field: "Thyroid Function",
    unit: "",
    rowType: "divider",
  },
  {
    field: "TSH",
    dbColumn: "tsh",
    unit: "(mIU/L)",
    rowType: "results",
    normalRange: { low: 0.4, high: 4.0 },
  },
  {
    field: "Free T3",
    dbColumn: "free_t3",
    unit: "(pg/mL)",
    rowType: "results",
    normalRange: { low: 2.3, high: 4.2 },
  },
  {
    field: "Free T4",
    dbColumn: "free_t4",
    unit: "(ng/dL)",
    rowType: "results",
    normalRange: { low: 0.8, high: 1.8 },
  },
  {
    field: "Lipid Panel",
    unit: "",
    rowType: "divider",
  },
  {
    field: "Total Cholesterol",
    dbColumn: "total_cholesterol",
    unit: "(mg/dL)",
    rowType: "results",
    normalRange: { low: 125, high: 200 },
  },
  {
    field: "HDL Cholesterol",
    dbColumn: "hdl_cholesterol",
    unit: "(mg/dL)",
    rowType: "results",
    normalRange: { low: 40, high: 60 },
  },
  {
    field: "LDL Cholesterol",
    dbColumn: "ldl_cholesterol",
    unit: "(mg/dL)",
    rowType: "results",
    normalRange: { low: 0, high: 100 },
  },
  {
    field: "Triglycerides",
    dbColumn: "triglycerides",
    unit: "(mg/dL)",
    rowType: "results",
    normalRange: { low: 0, high: 150 },
  },
  {
    field: "Additional Electrolytes",
    unit: "",
    rowType: "divider",
  },
  {
    field: "Magnesium",
    dbColumn: "magnesium",
    unit: "(mEq/L)",
    rowType: "results",
    normalRange: { low: 1.5, high: 2.5 },
  },
  {
    field: "Phosphate",
    dbColumn: "phosphate",
    unit: "(mg/dL)",
    rowType: "results",
    normalRange: { low: 2.5, high: 4.5 },
  },
  {
    field: "Pancreatic Enzymes",
    unit: "",
    rowType: "divider",
  },
  {
    field: "Amylase",
    dbColumn: "amylase",
    unit: "(U/L)",
    rowType: "results",
    normalRange: { low: 25, high: 125 },
  },
  {
    field: "Lipase",
    dbColumn: "lipase",
    unit: "(U/L)",
    rowType: "results",
    normalRange: { low: 0, high: 160 },
  },
];

