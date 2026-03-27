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
  [key: string | number]: string | number | boolean | undefined | object | ImagingData | MicrobiologyReportData | LabCellValue;
}

export const labTemplate: LabTableData[] = [
  {
    field: "Metabolic",
    unit: "",
    rowType: "divider",
  },
  {
    field: "Sodium",
    unit: "(mEq/L)",
    rowType: "results",
    normalRange: { low: 135, high: 145 },
  },
  {
    field: "Potassium",
    unit: "(mEq/L)",
    rowType: "results",
    normalRange: { low: 3.5, high: 5.0 },
    criticalRange: { low: 3.0, high: 6.0 },
  },
  {
    field: "Chloride",
    unit: "(mEq/L)",
    rowType: "results",
    normalRange: { low: 95, high: 105 },

  },
  {
    field: "BUN",
    unit: "(mg/dL)",
    rowType: "results",
    normalRange: { low: 7, high: 20 },

  },
  {
    field: "Creatinine",
    unit: "(mg/dL)",
    rowType: "results",
    normalRange: { low: 0.6, high: 1.2 },

  },
  {
    field: "Glucose",
    unit: "(mg/dL)",
    rowType: "results",
    normalRange: { low: 70, high: 100 },
  },
  {
    field: "CO2",
    unit: "(mEq/L)",
    rowType: "results",
    normalRange: { low: 23, high: 30 },

  },
  {
    field: "Calcium",
    unit: "(mg/dL)",
    rowType: "results",
    normalRange: { low: 8.5, high: 10.5 },

  },
  {
    field: "Lactate",
    unit: "(mmol/L)",
    rowType: "results",
    normalRange: { low: 0.5, high: 1.0 },
  },
  {
    field: "HbA1c",
    unit: "%",
    rowType: "results",
    normalRange: { low: 4.0, high: 5.6 },
  },
  {
    field: "Hematology",
    unit: "",
    rowType: "divider",
  },
  {
    field: "RBC",
    unit: "(10⁶/µL)",
    rowType: "results",
    normalRange: { low: 4.0, high: 6.0 },

  },
  {
    field: "Hemoglobin",
    unit: "(g/dL)",
    rowType: "results",
    normalRange: { low: 12.0, high: 17.5 },

  },
  {
    field: "Hematocrit",
    unit: "(%)",
    rowType: "results",
    normalRange: { low: 36, high: 54 },

  },
  {
    field: "MCV",
    unit: "(fL)",
    rowType: "results",
    normalRange: { low: 80, high: 100 },

  },
  {
    field: "MCH",
    unit: "(pg)", // Picograms
    rowType: "results",
    normalRange: { low: 27, high: 33 },

  },
  {
    field: "MCHC",
    unit: "(g/dL)",
    rowType: "results",
    normalRange: { low: 32, high: 36 },

  },
  {
    field: "WBC",
    unit: "(10³/µL)",
    rowType: "results",
    normalRange: { low: 4.5, high: 11.0 },

  },
  {
    field: 'Neutrophils',
    unit: '%',
    rowType: 'results',
    normalRange: { low: 55, high: 70 }
  },
  {
    field: 'Lymphocytes',
    unit: '%',
    rowType: 'results',
    normalRange: { low: 20, high: 40 }
  },
  {
    field: 'Monocytes',
    unit: '%',
    rowType: 'results',
    normalRange: { low: 2, high: 8 }
  },
  {
    field: 'Eosinophils',
    unit: '%',
    rowType: 'results',
    normalRange: { low: 1, high: 4 }
  },
  {
    field: 'Basophils',
    unit: '%',
    rowType: 'results',
    normalRange: { low: 0.5, high: 1 }
  },
  {
    field: "Platelets",
    unit: "(10³/µL)",
    rowType: "results",
    normalRange: { low: 150, high: 450 },

  },
  {
    field: "Cardiac",
    unit: "",
    rowType: "divider",
  },
  {
    field: "Troponin",
    unit: "(ng/mL)",
    rowType: "results",
    normalRange: { low: 0, high: 0.04 },

  },
  {
    field: "CKMB",
    unit: "(ng/mL)",
    rowType: "results",
    normalRange: { low: 0, high: 3 },

  },
  {
    field: "Myoglobin",
    unit: "(ng/mL)",
    rowType: "results",
    normalRange: { low: 0, high: 85 },

  },
  {
    field: "BNP",
    unit: "pg/mL",
    rowType: "results",
    normalRange: { low: 0, high: 100 },
  },
  {
    field: "D-Dimer",
    unit: "ng/mL",
    rowType: "results",
    normalRange: { low: 0, high: 500 },
  },
  {
    field: "Procalcitonin",
    unit: "ng/mL",
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
    unit: "(IU/L)",
    rowType: "results",
    normalRange: { low: 10, high: 40 },

  },
  {
    field: "ALT",
    unit: "(IU/L)",
    rowType: "results",
    normalRange: { low: 7, high: 56 },

  },
  {
    field: "ALP",
    unit: "(IU/L)",
    rowType: "results",
    normalRange: { low: 40, high: 120 },

  },
  {
    field: "Total Bilirubin",
    unit: "(mg/dL)",
    rowType: "results",
    normalRange: { low: 0.1, high: 1.2 },

  },
  {
    field: "Albumin",
    unit: "(g/dL)",
    rowType: "results",
    normalRange: { low: 3.5, high: 5.0 },

  },
  {
    field: "Ammonia",
    unit: "(mcg/dL)", // Common unit for Ammonia
    rowType: "results",
    normalRange: { low: 15, high: 45 }
  },
  {
    field: "Blood Gas",
    unit: "",
    rowType: "divider",
  },
  {
    field: "pH",
    unit: "", // pH is unitless
    rowType: "results",
    normalRange: { low: 7.35, high: 7.45 },

  },
  {
    field: "O2 Sat.",
    unit: "%", // pH is unitless
    rowType: "results",
    normalRange: { low: 95, high: 101 },

  },
  {
    field: "pCO2",
    unit: "(mmHg)",
    rowType: "results",
    normalRange: { low: 40, high: 50 },

  },
  {
    field: "pO2",
    unit: "(mmHg)",
    rowType: "results",
    normalRange: { low: 30, high: 40 },

  },
  {
    field: "HCO3",
    unit: "(mEq/L)",
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
    unit: "", // Unitless
    rowType: "results",
    normalRange: { low: 1.005, high: 1.030 },

  },
  {
    field: "Urine pH",
    unit: "", // Unitless
    rowType: "results",
    normalRange: { low: 4.5, high: 8.0 },

  },
  {
    field: "Protein",
    unit: "",
    rowType: "results",

  },
  {
    field: "Urine Glucose",
    unit: "", // Often reported as negative/positive
    rowType: "results",

  },
  {
    field: "Ketones",
    unit: "", // Often reported as negative/positive
    rowType: "results",


  },
  {
    field: "Leukocyte Esterase",
    unit: "", // Often reported as negative/positive
    rowType: "results",

  },
  {
    field: "Nitrites",
    unit: "", // Often reported as negative/positive
    rowType: "results",

  },
  {
    field: "Blood",
    unit: "", // Often reported as negative/positive
    rowType: "results",

  },
  {
    field: "Coagulation",
    unit: "",
    rowType: "divider",
  },
  {
    field: "PT",
    unit: "(sec)",
    rowType: "results",
    normalRange: { low: 11.0, high: 13.5 },

  },
  {
    field: "PTT",
    unit: "(sec)",
    rowType: "results",
    normalRange: { low: 25, high: 35 },

  },
  {
    field: "INR",
    unit: "", // Unitless
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
    unit: "(mg/L)",
    rowType: "results",
    normalRange: { low: 0, high: 10 },
  },
  {
    field: "ESR",
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
    unit: "(mIU/L)",
    rowType: "results",
    normalRange: { low: 0.4, high: 4.0 },
  },
  {
    field: "Free T3",
    unit: "(pg/mL)",
    rowType: "results",
    normalRange: { low: 2.3, high: 4.2 },
  },
  {
    field: "Free T4",
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
    unit: "(mg/dL)",
    rowType: "results",
    normalRange: { low: 125, high: 200 },

  },
  {
    field: "HDL Cholesterol",
    unit: "(mg/dL)",
    rowType: "results",
    normalRange: { low: 40, high: 60 },
  },
  {
    field: "LDL Cholesterol",
    unit: "(mg/dL)",
    rowType: "results",
    normalRange: { low: 0, high: 100 },

  },
  {
    field: "Triglycerides",
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
    unit: "(mEq/L)",
    rowType: "results",
    normalRange: { low: 1.5, high: 2.5 },

  },
  {
    field: "Phosphate",
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
    unit: "(U/L)",
    rowType: "results",
    normalRange: { low: 25, high: 125 },
  },
  {
    field: "Lipase",
    unit: "(U/L)",
    rowType: "results",
    normalRange: { low: 0, high: 160 },
  },
  {
    field: "Imaging",
    unit: "",
    rowType: "divider",
  },
  {
    field: "CT R. Foot",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "CT Head w/o Contrast",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "CT Head w/ Contrast",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "CT Neck w/ Contrast",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "CT Orbits w/o Contrast",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "CT Sinuses w/o Contrast",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "CT Chest w/ Contrast",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "CT Chest w/o Contrast",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "CT Abdomen/Pelvis w/o Contrast",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "CT Abdomen/Pelvis w/ Contrast",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "CT C-Spine",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "CT T-Spine",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "CT L-Spine",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "CT L. Foot",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "CT R. Ankle",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "CT L. Ankle",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "CT R. Knee",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "CT L. Knee",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "MRI Brain w/o Contrast",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "MRI Brain w/ and w/o Contrast",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "MRI C-Spine",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "MRI T-Spine",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "MRI L-Spine",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "MRI R. Shoulder",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "MRI L. Shoulder",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "MRI R. Knee",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "MRI L. Knee",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "MRI Abdomen w/ and w/o Contrast",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "US Renal",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "US RUQ (Gallbladder/Liver)",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "US Appendix",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "US Pelvic",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "US Scrotal",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "US Thyroid",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "US Carotid Doppler",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "US Venous Doppler Bil. U/E",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "US Venous Doppler Bil. L/E ",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "US Echocardiogram (TTE)",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "US Echocardiogram (TEE)",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "XR Chest",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "XR Abdomen",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "XR C-Spine",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "XR T-Spine",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "XR L-Spine",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "XR R. Shoulder",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "XR L. Shoulder",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "XR R. Clavicle",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "XR L. Clavicle",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "XR R. Humerus",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "XR L. Humerus",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "XR R. Elbow",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "XR L. Elbow",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "XR R. Forearm",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "XR L. Forearm",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "XR R. Wrist",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "XR L. Wrist",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "XR R. Hand",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "XR L. Hand",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "XR Pelvis",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "XR R. Hip",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "XR L. Hip",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "XR R. Femur",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "XR L. Femur",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "XR R. Knee",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "XR L. Knee",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "XR R. Tib/Fib",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "XR L. Tib/Fib",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "XR R. Ankle",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "XR L. Ankle",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "XR R. Foot",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "XR L. Foot",
    unit: "",
    rowType: "imaging",
    hideable: true
  },
  {
    field: "Microbiology",
    unit: "",
    rowType: "divider",
  },
  {
    field: "Wound Culture",
    unit: "",
    rowType: "microbiology",
    hideable: true

  },
  {
    field: "Urine Culture",
    unit: "",
    rowType: "microbiology",
    hideable: true
  },
  {
    field: "Stool Culture",
    unit: "",
    rowType: "microbiology",
    hideable: true
  },
  {
    field: "Sputum Culture",
    unit: "",
    rowType: "microbiology",
    hideable: true
  },
  {
    field: "CSF Culture",
    unit: "",
    rowType: "microbiology",
    hideable: true
  },
  {
    field: "Blood Culture",
    unit: "",
    rowType: "microbiology",
    hideable: true
  },
];

