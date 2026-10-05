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

export const LabSeverityLevel = {
  NORMAL: 'normal',
  ABNORMAL: 'abnormal',
  CRITICAL: 'critical'
} as const;

export type LabSeverityLevel = typeof LabSeverityLevel[keyof typeof LabSeverityLevel] | null;

export type LabCellValue = string;
type LabThreshold = { low: number, high: number }

// dataset to be used by tanstack table
export interface LabTableData {
  field: string;
  rowType: "divider" | "results" | "imaging" | "microbiology";
  unit?: string;
  normalRange?: LabThreshold;
  criticalRange?: LabThreshold;
  hideable?: boolean;
  visibleInPresim?: boolean;
  id?: string;
  [key: string | number]: string | number | boolean | undefined | LabThreshold;
}

export function getResultStatus(
  initialValue: string,
  normalRange: { low: number; high: number } | undefined,
  criticalRange: { low: number; high: number } | undefined,
): LabSeverityLevel {
  const numericValue = parseFloat(initialValue);

  if (isNaN(numericValue)) {
    return null;
  }
  if (criticalRange && (numericValue < criticalRange.low || numericValue > criticalRange.high)) {
    return LabSeverityLevel.CRITICAL;
  }
  if (normalRange && (numericValue < normalRange.low || numericValue > normalRange.high)) {
    return LabSeverityLevel.ABNORMAL;
  }
  return LabSeverityLevel.NORMAL;
}

export const labTemplate: LabTableData[] = [
  {
    field: "Metabolic",
    unit: "",
    rowType: "divider",
  },
  {
    field: "Sodium",
    id: "sodium",
    unit: "(mEq/L)",
    rowType: "results",
    normalRange: { low: 135, high: 145 },
  },
  {
    field: "Potassium",
    id: "potassium",
    unit: "(mEq/L)",
    rowType: "results",
    normalRange: { low: 3.5, high: 5.0 },
    criticalRange: { low: 3.0, high: 6.0 },
  },
  {
    field: "Chloride",
    id: "chloride",
    unit: "(mEq/L)",
    rowType: "results",
    normalRange: { low: 95, high: 105 },
  },
  {
    field: "BUN",
    id: "bun",
    unit: "(mg/dL)",
    rowType: "results",
    normalRange: { low: 7, high: 20 },
  },
  {
    field: "Creatinine",
    id: "creatinine",
    unit: "(mg/dL)",
    rowType: "results",
    normalRange: { low: 0.6, high: 1.2 },
  },
  {
    field: "Glucose",
    id: "glucose",
    unit: "(mg/dL)",
    rowType: "results",
    normalRange: { low: 70, high: 100 },
  },
  {
    field: "CO2",
    id: "total_co2",
    unit: "(mEq/L)",
    rowType: "results",
    normalRange: { low: 23, high: 30 },
  },
  {
    field: "Calcium",
    id: "calcium",
    unit: "(mg/dL)",
    rowType: "results",
    normalRange: { low: 8.5, high: 10.5 },
  },
  {
    field: "Lactate",
    id: "lactate",
    unit: "(mmol/L)",
    rowType: "results",
    normalRange: { low: 0.5, high: 1.0 },
    hideable: true

  },
  {
    field: "HbA1c",
    id: "hba1c",
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
    id: "rbc",
    unit: "(10⁶/µL)",
    rowType: "results",
    normalRange: { low: 4.0, high: 6.0 },
  },
  {
    field: "Hemoglobin",
    id: "hemoglobin",
    unit: "(g/dL)",
    rowType: "results",
    normalRange: { low: 12.0, high: 17.5 },
  },
  {
    field: "Hematocrit",
    id: "hematocrit",
    unit: "(%)",
    rowType: "results",
    normalRange: { low: 36, high: 54 },
  },
  {
    field: "MCV",
    id: "mcv",
    unit: "(fL)",
    rowType: "results",
    normalRange: { low: 80, high: 100 },
  },
  {
    field: "MCH",
    id: "mch",
    unit: "(pg)",
    rowType: "results",
    normalRange: { low: 27, high: 33 },
  },
  {
    field: "MCHC",
    id: "mchc",
    unit: "(g/dL)",
    rowType: "results",
    normalRange: { low: 32, high: 36 },
  },
  {
    field: "WBC",
    id: "wbc",
    unit: "(10³/µL)",
    rowType: "results",
    normalRange: { low: 4.5, high: 11.0 },
  },
  {
    field: 'Neutrophils',
    id: 'neutrophils',
    unit: '(%)',
    rowType: 'results',
    normalRange: { low: 55, high: 70 },
  },
  {
    field: 'Lymphocytes',
    id: 'lymphocytes',
    unit: '(%)',
    rowType: 'results',
    normalRange: { low: 20, high: 40 },
  },
  {
    field: 'Monocytes',
    id: 'monocytes',
    unit: '(%)',
    rowType: 'results',
    normalRange: { low: 2, high: 8 },
  },
  {
    field: 'Eosinophils',
    id: 'eosinophils',
    unit: '(%)',
    rowType: 'results',
    normalRange: { low: 1, high: 4 },
  },
  {
    field: 'Basophils',
    id: 'basophils',
    unit: '(%)',
    rowType: 'results',
    normalRange: { low: 0, high: 1 },
  },
  {
    field: "Platelets",
    id: "platelets",
    unit: "(10³/µL)",
    rowType: "results",
    normalRange: { low: 150, high: 450 },
  },
  {
    field: "Blood Type",
    id: "blood_type",
    unit: "",
    rowType: "results",
  },
  {
    field: "Rh Factor",
    id: "rh_factor",
    unit: "",
    rowType: "results",
  },
  {
    field: "Cardiac",
    unit: "",
    rowType: "divider",
  },
  {
    field: "Troponin",
    id: "troponin",
    unit: "(ng/mL)",
    rowType: "results",
    normalRange: { low: 0, high: 0.04 },
  },
  {
    field: "CKMB",
    id: "ckmb",
    unit: "(ng/mL)",
    rowType: "results",
    normalRange: { low: 0, high: 3 },

  },
  {
    field: "Myoglobin",
    id: "myoglobin",
    unit: "(ng/mL)",
    rowType: "results",
    normalRange: { low: 0, high: 85 },

  },
  {
    field: "BNP",
    id: "bnp",
    unit: "(pg/mL)",
    rowType: "results",
    normalRange: { low: 0, high: 100 },
  },
  {
    field: "D-Dimer",
    id: "d_dimer",
    unit: "(ng/mL)",
    rowType: "results",
    normalRange: { low: 0, high: 500 },
  },
  {
    field: "Procalcitonin",
    id: "procal",
    unit: "(ng/mL)",
    rowType: "results",
    normalRange: { low: 0.0, high: 0.15 },

  },
  {
    field: "Hepatology",
    unit: "",
    rowType: "divider",
  },
  {
    field: "AST",
    id: "ast",
    unit: "(IU/L)",
    rowType: "results",
    normalRange: { low: 10, high: 40 },
  },
  {
    field: "ALT",
    id: "alt",
    unit: "(IU/L)",
    rowType: "results",
    normalRange: { low: 7, high: 56 },
  },
  {
    field: "ALP",
    id: "alp",
    unit: "(IU/L)",
    rowType: "results",
    normalRange: { low: 40, high: 120 },
  },
  {
    field: "Total Bilirubin",
    id: "total_bilirubin",
    unit: "(mg/dL)",
    rowType: "results",
    normalRange: { low: 0.1, high: 1.2 },
  },
  {
    field: "Albumin",
    id: "albumin",
    unit: "(g/dL)",
    rowType: "results",
    normalRange: { low: 3.5, high: 5.0 },
  },
  {
    field: "Ammonia",
    id: "ammonia",
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
    id: "art_ph",
    unit: "",
    rowType: "results",
    normalRange: { low: 7.35, high: 7.45 },

  },
  {
    field: "O2 Sat. (Arterial)",
    id: "art_so2",
    unit: "(%)",
    rowType: "results",
    normalRange: { low: 95, high: 100 },

  },
  {
    field: "pCO2 (Arterial)",
    id: "art_pco2",
    unit: "mmHg",
    rowType: "results",
    normalRange: { low: 35, high: 45 },

  },
  {
    field: "pO2 (Arterial)",
    id: "art_po2",
    unit: "(mmHg)",
    rowType: "results",
    normalRange: { low: 75, high: 100 },

  },
  {
    field: "pH (Venous)",
    id: "ven_ph",
    unit: "",
    rowType: "results",
    normalRange: { low: 7.31, high: 7.41 },

  },
  {
    field: "O2 Sat. (Venous)",
    id: "ven_so2",
    unit: "(%)",
    rowType: "results",
    normalRange: { low: 60, high: 80 },

  },
  {
    field: "pCO2 (Venous)",
    id: "ven_pco2",
    unit: "(mmHg)",
    rowType: "results",
    normalRange: { low: 41, high: 51 },

  },
  {
    field: "pO2 (Venous)",
    id: "ven_po2",
    unit: "(mmHg)",
    rowType: "results",
    normalRange: { low: 30, high: 40 },

  },
  {
    field: "HCO3",
    id: "hco3",
    unit: "mEq/L",
    rowType: "results",
    normalRange: { low: 22, high: 29 },

  },
  {
    field: "Urinalysis",
    unit: "",
    rowType: "divider",
  },
  {
    field: "Specific Gravity",
    id: "specific_gravity",
    unit: "",
    rowType: "results",
    normalRange: { low: 1.005, high: 1.030 },
  },
  {
    field: "Urine pH",
    id: "urine_ph",
    unit: "",
    rowType: "results",
    normalRange: { low: 4.5, high: 8.0 },
  },
  {
    field: "Protein",
    id: "urine_protein",
    unit: "",
    rowType: "results",
  },
  {
    field: "Urine Glucose",
    id: "urine_glucose",
    unit: "",
    rowType: "results",
  },
  {
    field: "Ketones",
    id: "ketones",
    unit: "",
    rowType: "results",
  },
  {
    field: "Leukocyte Esterase",
    id: "leukocyte_esterase",
    unit: "",
    rowType: "results",
  },
  {
    field: "Nitrites",
    id: "nitrites",
    unit: "",
    rowType: "results",
  },
  {
    field: "Blood",
    id: "urine_blood",
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
    id: "pt",
    unit: "(sec)",
    rowType: "results",
    normalRange: { low: 11.0, high: 13.5 },
  },
  {
    field: "PTT",
    id: "ptt",
    unit: "(sec)",
    rowType: "results",
    normalRange: { low: 25, high: 35 },
  },
  {
    field: "INR",
    id: "inr",
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
    id: "crp",
    unit: "(mg/L)",
    rowType: "results",
    normalRange: { low: 0, high: 10 },
  },
  {
    field: "ESR",
    id: "esr",
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
    id: "tsh",
    unit: "(mIU/L)",
    rowType: "results",
    normalRange: { low: 0.4, high: 4.0 },
  },
  {
    field: "Free T3",
    id: "free_t3",
    unit: "(pg/mL)",
    rowType: "results",
    normalRange: { low: 2.3, high: 4.2 },
  },
  {
    field: "Free T4",
    id: "free_t4",
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
    id: "total_cholesterol",
    unit: "(mg/dL)",
    rowType: "results",
    normalRange: { low: 125, high: 200 },
  },
  {
    field: "HDL Cholesterol",
    id: "hdl_cholesterol",
    unit: "(mg/dL)",
    rowType: "results",
    normalRange: { low: 40, high: 60 },
  },
  {
    field: "LDL Cholesterol",
    id: "ldl_cholesterol",
    unit: "(mg/dL)",
    rowType: "results",
    normalRange: { low: 0, high: 100 },
  },
  {
    field: "Triglycerides",
    id: "triglycerides",
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
    id: "magnesium",
    unit: "(mg/dL)",
    rowType: "results",
    normalRange: { low: 1.7, high: 2.2 },
  },
  {
    field: "Phosphate",
    id: "phosphate",
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
    id: "amylase",
    unit: "(U/L)",
    rowType: "results",
    normalRange: { low: 25, high: 125 },
  },
  {
    field: "Lipase",
    id: "lipase",
    unit: "(U/L)",
    rowType: "results",
    normalRange: { low: 0, high: 160 },
  },
];

