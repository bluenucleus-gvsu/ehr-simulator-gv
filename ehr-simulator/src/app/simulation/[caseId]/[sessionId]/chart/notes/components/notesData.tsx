export interface ClinicalNote {
  title: string;
  author: string;
  specialty: string;
  timeOffset: number;
  excludedFromPresim: boolean;
  content: string;
}

export const sampleNotes: ClinicalNote[] = [
  {
    title: "Admission Note",
    author: "Dr. Chen",
    specialty: "Emergency Medicine",
    timeOffset: 3000,
    content: `
      <p><strong>Chief Complaint:</strong> “Vomiting and diarrhea for several days, feeling dizzy.”</p>

      <p><strong>History of Present Illness:</strong> 72-year-old male presenting after returning from a cruise 3 days ago. Reports persistent nausea, vomiting, and watery diarrhea since returning home. States he has been unable to tolerate solid food and has had minimal oral intake. Reports dizziness when standing and significant fatigue. Denies chest pain or shortness of breath. No blood in stool. Stool pathogen studies pending.</p>

      <p><strong>Past Medical History:</strong> Hypertension, GERD</p>

      <p><strong>Medications:</strong></p>
      <ul class="list-disc ml-6">
        <li>Lisinopril 10 mg daily</li>
        <li>Omeprazole 20 mg daily</li>
      </ul>

      <p><strong>Allergies:</strong> No known drug allergies</p>

      <h2><u>Physical Examination</u></h2>
      <ul class="list-disc ml-6">
        <li><strong>General:</strong> Appears fatigued, mildly dehydrated</li>
        <li><strong>Neuro:</strong> Alert and oriented ×3</li>
        <li><strong>HEENT:</strong> Dry mucous membranes</li>
        <li><strong>Cardiac:</strong> Regular rate and rhythm</li>
        <li><strong>Respiratory:</strong> Clear breath sounds bilaterally</li>
        <li><strong>Abdomen:</strong> Soft, mild diffuse tenderness, hyperactive bowel sounds</li>
        <li><strong>Skin:</strong> Warm, decreased turgor</li>
      </ul>

      <p><strong>ED Vital Signs:</strong> T: 37.6°C | HR: 90 | BP: 116/70 | RR: 18 | SpO₂: 96% RA</p>

      <p><strong>ED Laboratory Results:</strong></p>
      <ul class="list-disc ml-6">
        <li>Na⁺ 125 mEq/L</li>
        <li>K⁺ 3.7 mEq/L</li>
        <li>Cl⁻ 94 mEq/L</li>
        <li>BUN 25 mg/dL</li>
        <li>Creatinine 1.1 mg/dL</li>
        <li>WBC 11,000 /µL</li>
        <li>Lactic acid 1.3 mmol/L</li>
      </ul>

      <p><strong>ED Treatment Provided:</strong></p>
      <ul class="list-disc ml-6">
        <li>1 L Normal Saline IV bolus</li>
        <li>Ondansetron 4 mg IV for nausea</li>
        <li>Basic metabolic panel and CBC obtained</li>
        <li>Patient monitored for several hours</li>
      </ul>

      <h2><u>Assessment</u></h2>
      <p>Hyponatremia and dehydration likely secondary to gastrointestinal illness. Patient stable but symptomatic with dizziness and electrolyte imbalance.</p>

      <h2><u>Plan</u></h2>
      <p>Admit to medical-surgical floor for IV fluids, electrolyte monitoring, and observation.</p>
    `,
    excludedFromPresim: false
  },
  {
    title: "Progress Note",
    author: "Dr. Adler",
    specialty: "Internal Medicine",
    timeOffset: 2880,
    content: `
      <h2><u>Subjective</u></h2>
      <p>Patient presented with 3 days of nausea, vomiting, and diarrhea following return from cruise. Reports dizziness, fatigue, and poor oral intake.</p>

      <h2><u>Objective</u></h2>
      <ul class="list-disc ml-6">
        <li>Vitals: T 37.2°C, HR 88, BP 118/72, RR 18, SpO₂ 97% RA</li>
        <li>Dry mucous membranes, skin tenting noted</li>
        <li>Alert and oriented ×3</li>
        <li>Abdomen soft, slightly tender, hyperactive bowel sounds</li>
        <li>Na⁺ 125 mEq/L, K⁺ 3.7 mEq/L</li>
        <li>BUN 25 mg/dL, Creatinine 1.1 mg/dL</li>
        <li>WBC 11,000/µL</li>
        <li>Lactic acid 1.3 mmol/L</li>
      </ul>

      <h2><u>Assessment</u></h2>
      <p>Hyponatremia likely secondary to fluid losses. Mild dehydration. Hemodynamically stable.</p>

      <h2><u>Plan</u></h2>
      <ol class="list-decimal ml-6">
        <li>Start NS 75 mL/hr.</li>
        <li>Advance diet as tolerated.</li>
        <li>Monitor electrolytes every AM.</li>
        <li>Fall precautions for dizziness.</li>
        <li>PT/OT evaluation due to weakness.</li>
      </ol>
    `,
    excludedFromPresim: false
  },
  {
    title: "Nursing Note",
    author: "Jane Smith RN",
    specialty: "Nursing",
    timeOffset: 2520,
    content: `
      <p><strong>Assessment:</strong> Patient awake, alert, cooperative. Complains of fatigue and mild dizziness on standing. Mucous membranes dry. Skin warm and slightly flushed.</p>

      <p><strong>Vital Signs:</strong> T 37.6, HR 92, BP 114/70, RR 20, SpO₂ 96% RA.</p>

      <p><strong>Interventions:</strong></p>
      <ul class="list-disc ml-6">
        <li>Encouraged fluids.</li>
        <li>Assisted patient to bathroom with standby assistance.</li>
        <li>Noted concentrated urine.</li>
        <li>Notified physician of continued dizziness upon standing.</li>
      </ul>

      <p><strong>Response:</strong> Patient tolerated interventions; continued monitoring planned.</p>
    `,
    excludedFromPresim: false
  },
  {
    title: "Consult Note",
    author: "Mark LeGrande, PT",
    specialty: "Physical Therapy",
    timeOffset: 2400,
    content: `
      <h2><u>Subjective</u></h2>
      <p>Patient reports “feeling weak” and slightly dizzy when standing.</p>

      <h2><u>Objective</u></h2>
      <p><strong>Transfers:</strong> required minimal assistance.</p>
      <p><strong>Gait:</strong> unsteady initially.</p>
      <p><strong>Orthostatic vitals during session:</strong></p>
      <ul class="list-disc ml-6">
        <li>Supine BP 116/74 → standing BP 102/68</li>
        <li>HR increased from 90 to 104</li>
        <li>Patient reported lightheadedness</li>
      </ul>

      <h2><u>Assessment</u></h2>
      <p>Orthostatic hypotension likely related to dehydration. Activity limited due to dizziness.</p>

      <h2><u>Plan</u></h2>
      <p>Recommend short sessions only; re-evaluate in 24–48 hours. Encourage slow positional changes.</p>
    `,
    excludedFromPresim: false
  },
  {
    title: "Progress Note",
    author: "Dr. David Adler",
    specialty: "Internal Medicine",
    timeOffset: 1380,
    content: `
      <h2><u>Subjective</u></h2>
      <p>Patient “feels warm” and reports worsening fatigue and nausea overnight. Appetite poor.</p>

      <h2><u>Objective</u></h2>
      <ul class="list-disc ml-6">
        <li>Vitals: T 38.1, HR 104, BP 102/62, RR 22, SpO₂ 95%</li>
        <li>Skin warm, flushed</li>
        <li>Urine output decreasing over past 12 hours</li>
        <li>Mild confusion noted when answering questions</li>
        <li>Na⁺ 129</li>
        <li>BUN 28, Creatinine 1.2</li>
        <li>WBC 13,500 (neutrophils 78%)</li>
        <li>Lactic acid 1.7 (upper end of normal)</li>
      </ul>

      <h2><u>Assessment</u></h2>
      <p>New fever with rising WBC and worsening fatigue → concern for developing infection. Electrolytes showing continued dehydration. Mentation slightly altered.</p>

      <h2><u>Plan</u></h2>
      <ol class="list-decimal ml-6">
        <li>Monitor vitals Q4 hours.</li>
        <li>Encourage PO intake.</li>
        <li>Repeat labs in AM.</li>
        <li>Consider infectious workup if fever persists &gt;24 hours.</li>
        <li>Continue maintenance IV fluids.</li>
      </ol>
    `,
    excludedFromPresim: false
  },
  {
    title: "Nursing Note",
    author: "Derrick Williams, RN",
    specialty: "Nursing",
    timeOffset: 960,
    content: `
      <p><strong>Assessment:</strong> Patient restless but cooperative. Skin warm, flushed. Mucous membranes remain dry. Slight confusion—incorrectly reported date once. Complains of “feeling hot.”</p>

      <p><strong>Vital Signs:</strong> T 38.4, HR 110, BP 96/58, RR 22, SpO₂ 94% RA.</p>

      <p><strong>Physical Findings:</strong></p>
      <ul class="list-disc ml-6">
        <li>Cap refill 3–4 sec</li>
        <li>Urine output 150 mL over last 4 hours</li>
        <li>Lungs clear but diminished at bases</li>
      </ul>

      <p>Cooling measures applied. Notified physician of hypotension and mental status change. Provided oral fluids; patient tolerated small amounts. Physician aware; will reassess.</p>
    `,
    excludedFromPresim: false
  },
  {
    title: "Consult Note",
    author: "Susan Bower, OT",
    specialty: "Occupational Therapy",
    timeOffset: 960,
    content: `
      <h2><u>Subjective</u></h2>
      <p>Patient states: “I feel weaker today.”</p>

      <h2><u>Objective</u></h2>
      <ul class="list-disc ml-6">
        <li>Difficulty maintaining balance while sitting and standing.</li>
        <li>Increasing fatigue with minimal activity.</li>
        <li>Orthostatic symptoms persist: BP drop from 108/66 sitting → 94/60 standing</li>
      </ul>

      <h2><u>Assessment</u></h2>
      <p>Reduced functional tolerance. Potential early infection contributing to increased fatigue.</p>

      <h2><u>Plan</u></h2>
      <p>Hold therapy until vital signs stabilize.</p>
    `,
    excludedFromPresim: false
  },
  {
    title: "Nursing Note",
    author: "Barbara Gifford, RN",
    specialty: "Nursing",
    timeOffset: 240,
    content: `
      <p><strong>Assessment:</strong> Patient lethargic, responds slowly to questions. Skin hot and flushed. Continues to report weakness and “feeling off.” Mucous membranes dry.</p>

      <p><strong>Vital Signs:</strong> T 39.0, HR 118, BP 90/56, RR 24, SpO₂ 93%.</p>

      <p><strong>Concerns:</strong></p>
      <ul class="list-disc ml-6">
        <li>Urine output only 80 mL since midnight.</li>
        <li>Patient increasingly confused.</li>
        <li>Tachycardia and hypotension worsening.</li>
      </ul>

      <p><strong>Actions:</strong> Notified physician, applied cool compresses, encouraged oral fluids but patient unable to tolerate.</p>
    `,
    excludedFromPresim: false
  }
]
