export interface OrderType {
  category?: "Nursing" | "Respiratory" | "Laboratory" | "Consult" | "Diet"
  title: string
  details: string
  status: string;
  orderingProvider: string
  important?: boolean,
  visibleInPresim: boolean
  [key: string]: string | boolean | undefined;

}

export const nursingOrders: OrderType[] = [
  {
    category: 'Nursing',
    title: "Vital Signs Monitoring (q4h)",
    status: "Active",
    details: "Monitor BP, HR, RR, Temp, SpO₂ every 4 hours. Notify provider for Temp > 38.0°C (100.4°F), Systolic BP > 160 mmHg or < 100 mmHg, HR > 110 bpm or < 50 bpm.",
    orderingProvider: "Dr. John Smith, MD",
    important: true,
    visibleInPresim: true
  },
  {
    category: 'Nursing',
    title: "Blood Glucose Monitoring (ACHS)",
    status: "Active",
    details: "Monitor blood glucose before meals and at bedtime (ACHS). Notify provider for blood glucose < 70 mg/dL or > 300 mg/dL.",
    orderingProvider: "Dr. John Smith, MD",
    important: true,
    visibleInPresim: true
  },
  {
    category: 'Nursing',
    title: "Activity: As Tolerated",
    status: "Active",
    details: "Encourage patient activity as tolerated. Assist with ambulation as needed.",
    orderingProvider: "Dr. John Smith, MD",
    important: false,
    visibleInPresim: true

  },
  {
    important: false,

    category: 'Nursing',
    title: "Fall Risk Precautions",
    status: "Active",
    details: "Implement standard fall risk protocol. Ensure bed in low position and call light within reach.",
    orderingProvider: "Dr. John Smith, MD",
    visibleInPresim: true
  },
  {
    important: false,

    category: 'Nursing',
    title: "Contact Precautions for MRSA",
    status: "Active",
    details: "Gown and gloves with all room entry. Use dedicated patient equipment. Strict hand hygiene.",
    orderingProvider: "Dr. John Smith, MD",
    visibleInPresim: true
  },
  {
    important: true,

    category: 'Nursing',
    title: "Right Great Toe Wound Care",
    status: "Active",
    details: "Daily dressing change with normal saline (NS) wound cleansing and application of sterile dry dressing. Apply topical antimicrobial per wound care protocol. Monitor for signs of infection (increased redness, drainage, odor).",
    orderingProvider: "Dr. John Smith, MD",
    visibleInPresim: true
  },
  {
    important: false,

    category: 'Nursing',
    title: "Diabetic Diet",
    status: "Active",
    details: "Provide consistent carbohydrate diabetic diet. Encourage fluid intake unless contraindicated.",
    orderingProvider: "Dr. John Smith, MD",
    visibleInPresim: true
  },
  {
    category: 'Nursing',
    title: "Patient Education",
    status: "Active",
    details: "Educate patient on diabetes management, wound care, and MRSA precautions.",
    orderingProvider: "Dr. John Smith, MD",
    important: true,
    visibleInPresim: true
  },
];

export const nursingHeaderNames: OrderType = {
  title: "Nursing",
  details: "Details",
  status: "Status",
  orderingProvider: "Ordering Provider",
  visibleInPresim: true
}


export interface MedOrderData {
  title: string;
  dose: string;
  route: string;
  frequency: string;
  priority: string;
  administrationInstructions: string;
  orderingProvider: string;
  [key: string]: string;
}

export const medHeaderNames: MedOrderData = {
  title: "Medication",
  dose: "Dose",
  route: "Route",
  frequency: "Frequency",
  priority: "Priority",
  administrationInstructions: "Administration Instructions",
  orderingProvider: "Ordering Provider"
}

export const respiratoryOrders: OrderType[] = [
  {
    important: false,
    category: 'Respiratory',
    title: "Oxygen Therapy",
    details: "Administer oxygen via nasal cannula at 2 L/min. Titrate to maintain SpO₂ ≥ 92%.",
    status: "Active",
    orderingProvider: "Dr. Chen",
    visibleInPresim: true
  },
  {
    important: false,
    category: 'Respiratory',
    title: "Incentive Spirometry",
    details: "Instruct patient to use incentive spirometer 10 times per hour while awake. Document effort and results",
    status: "Active",
    orderingProvider: "Dr. Azzedine Habz",
    visibleInPresim: true
  },
];

export const respHeaderNames: OrderType = {
  title: "Respiratory",
  details: "Details",
  status: "Status",
  orderingProvider: "Ordering Provider",
  visibleInPresim: true
}



export const laboratoryOrders: OrderType[] = [
  {
    category: 'Laboratory',
    title: "Basic Metabolic Panel (BMP)",
    status: "Active",
    details: "Collect Basic Metabolic Panel (BMP).",
    orderingProvider: "Dr. John Smith, MD",
    important: true,
    visibleInPresim: true
  },
  {
    category: 'Laboratory',
    title: "Complete Blood Count (CBC)",
    status: "Active",
    details: "Collect Complete Blood Count (CBC).",
    orderingProvider: "Dr. John Smith, MD",
    important: true,
    visibleInPresim: true
  }
]

export const laboratoryHeaderNames: OrderType = {
  title: "Laboratory",
  details: "Details",
  status: "Status",
  orderingProvider: "Ordering Provider",
  visibleInPresim: true
}

export const consultHeaderNames: OrderType = {
  title: "Consults",
  details: "Details",
  status: "Status",
  orderingProvider: "Ordering Provider",
  visibleInPresim: true
}

export const consultOrders: OrderType[] = [
]


