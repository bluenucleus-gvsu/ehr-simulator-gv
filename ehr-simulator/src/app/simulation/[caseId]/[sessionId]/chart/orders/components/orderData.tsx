export interface OrderType {
  category?: "Nursing" | "Respiratory" | "Laboratory" | "Consult" | "Diet" | "Medication"
  title: string
  details: string
  status: string;
  orderingProvider: string
  important?: boolean,
  visibleInPresim: boolean
  phase?: number
  [key: string]: string | boolean | number | undefined;

}

export const nursingOrders: OrderType[] = [
  {
    category: 'Nursing',
    title: "Activity: As Tolerated",
    details: "Encourage patient activity as tolerated. Assist with ambulation as needed.",
    status: "Active",
    orderingProvider: "Dr. Chen, MD",
    important: true,
    visibleInPresim: true
  },
  {
    category: 'Nursing',
    title: "Fall Risk Precautions",
    details: "Implement standard fall risk protocol. Ensure bed in low position and call light within reach.",
    status: "Active",
    orderingProvider: "Dr. Chen, MD",
    important: true,
    visibleInPresim: true
  },
  {
    category: 'Nursing',
    title: "Cardiac Monitoring",
    details: "Acute Electrolyte imbalance",
    status: "Active",
    orderingProvider: "Dr. Chen, MD",
    important: true,
    visibleInPresim: true
  },
  {
    category: 'Nursing',
    title: "Q2Hr Turns",
    details: "Reposition patient every two hours",
    status: "Active",
    orderingProvider: "Dr. Chen, MD",
    important: true,
    visibleInPresim: true
  },

  {
    category: 'Nursing',
    title: "Insert and Maintain IV",
    details: "",
    status: "Active",
    orderingProvider: "Dr. Chen, MD",
    important: true,
    visibleInPresim: true
  },

  {
    category: 'Nursing',
    title: "Vital Signs Monitoring (q4h)",
    details: "Monitor BP, HR, RR, Temp, SpO₂ every 4 hours. Notify provider for Temp > 38.0°C (100.4°F), Systolic BP > 160 mmHg or < 100 mmHg, HR > 110 bpm or < 50 bpm.",
    status: "Active",
    orderingProvider: "Dr. Chen, MD",
    important: true,
    visibleInPresim: true
  },
  {
    category: 'Nursing',
    title: "Orthostatic Vitals",
    details: "Document BP & HR with patient supine, sitting, standing. Perform daily.",
    status: "Active",
    orderingProvider: "Dr. Chen, MD",
    important: true,
    visibleInPresim: true
  },
  {
    category: 'Nursing',
    title: "Intake & Output",
    details: "Document I&O every 8 hours.",
    status: "Active",
    orderingProvider: "Dr. Chen, MD",
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
    category: 'Respiratory',
    title: "Oxygen Therapy",
    details: "Titrate oxygen via nasal cannula to maintain SpO₂ ≥ 95%.",
    status: "Active",
    orderingProvider: "Dr. Chen, MD",
    important: true,
    visibleInPresim: true
  },
  {
    category: 'Respiratory',
    title: "Incentive Spirometry",
    details: "Instruct patient to use incentive spirometer 10 times per hour while awake. Document effort and results",
    status: "Active",
    orderingProvider: "Dr. Chen, MD",
    important: false,
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
    orderingProvider: "Dr. Chen, MD",
    important: true,
    visibleInPresim: true
  },
  {
    category: 'Laboratory',
    title: "Complete Blood Count (CBC)",
    status: "Active",
    details: "Collect Complete Blood Count (CBC).",
    orderingProvider: "Dr. Chen, MD",
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
  {
    category: 'Consult',
    title: "Physical Therapy Consult",
    details: "Evaluate and treat for functional mobility, strength, and safe transfer recommendations.",
    status: "Active",
    orderingProvider: "Dr. Chen, MD",
    important: false,
    visibleInPresim: true
  },
  {
    category: 'Consult',
    title: "Occupational Therapy Consult",
    details: "Evaluate and treat for activities of daily living (ADLs), adaptive equipment needs, and upper extremity function.",
    status: "Active",
    orderingProvider: "Dr. Chen, MD",
    important: false,
    visibleInPresim: true
  }
]

