export interface SamplePrescription {
  id: string;
  title: string;
  doctor: string;
  specialty: string;
  hospital: string;
  patientName: string;
  patientAge: number;
  date: string;
  diagnosis: string;
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }[];
  rawPrescriptionText: string;
}

export const SAMPLE_PRESCRIPTIONS: SamplePrescription[] = [
  {
    id: 'rx-respiratory',
    title: 'Acute Bronchitis & Wheeze Prescription',
    doctor: 'Dr. Sarah Mitchell, MD, FCCP',
    specialty: 'Pulmonary & Critical Care Medicine',
    hospital: 'Apex Medical Center, Dept. of Pulmonology',
    patientName: 'John Davis',
    patientAge: 42,
    date: '2026-08-14',
    diagnosis: 'Acute Bronchitis with Bronchospasm',
    medications: [
      {
        name: 'Amoxicillin',
        dosage: '500 mg Capsule',
        frequency: 'TID (3 times daily)',
        duration: '7 Days',
        instructions: 'Take with full glass of water after food'
      },
      {
        name: 'Salbutamol (Albuterol)',
        dosage: '100 mcg Inhaler',
        frequency: '2 puffs PRN (every 4-6 hours)',
        duration: '14 Days',
        instructions: 'Use spacer device when wheezing or short of breath'
      },
      {
        name: 'Cetirizine',
        dosage: '10 mg Tablet',
        frequency: 'OD (Once daily at night)',
        duration: '10 Days',
        instructions: 'Take 30 mins before sleep'
      }
    ],
    rawPrescriptionText: `APEX MEDICAL CENTER - DEPARTMENT OF PULMONOLOGY
Dr. Sarah Mitchell, MD, FCCP (Reg: MED-882194)
Patient: John Davis (M/42)    Date: 14-Aug-2026
Dx: Acute Bronchitis with Mild Bronchospasm

Rx:
1. Cap. Amoxicillin 500mg - 1 cap TID x 7 days (p.c.)
2. Inh. Salbutamol 100mcg - 2 puffs PRN q4-6h x 14 days
3. Tab. Cetirizine 10mg - 1 tab HS x 10 days
4. Tab. Paracetamol 650mg - 1 tab SOS for temp > 100.4 F

Advice: Steam inhalation twice daily, drink warm water, avoid cold beverages. Review in 1 week if cough persists.
Signed: Dr. S. Mitchell`
  },
  {
    id: 'rx-cardio-metabolic',
    title: 'Hypertension & Diabetes Prescription',
    doctor: 'Dr. Robert Langdon, MD, FACC',
    specialty: 'Cardiovascular & Internal Medicine',
    hospital: 'St. Jude Heart Institute',
    patientName: 'Elena Rostova',
    patientAge: 56,
    date: '2026-09-02',
    diagnosis: 'Essential Hypertension Stage 2 + Type 2 Diabetes Mellitus',
    medications: [
      {
        name: 'Amlodipine',
        dosage: '5 mg Tablet',
        frequency: 'OD (Once daily)',
        duration: '30 Days',
        instructions: 'Take every morning at 8:00 AM'
      },
      {
        name: 'Metformin',
        dosage: '500 mg Tablet',
        frequency: 'BID (Twice daily)',
        duration: '30 Days',
        instructions: 'Take with breakfast and dinner'
      },
      {
        name: 'Atorvastatin',
        dosage: '10 mg Tablet',
        frequency: 'OD (Once daily at night)',
        duration: '30 Days',
        instructions: 'Take after dinner at bedtime'
      }
    ],
    rawPrescriptionText: `ST. JUDE HEART INSTITUTE
Dr. Robert Langdon, MD, FACC
Patient: Elena Rostova (F/56)    Date: 02-Sep-2026
Diagnosis: Stage 2 Hypertension & Type 2 DM

Rx:
1. Tab. Amlodipine 5mg - 1-0-0 x 30 days (Morning after breakfast)
2. Tab. Metformin 500mg - 1-0-1 x 30 days (With meals)
3. Tab. Atorvastatin 10mg - 0-0-1 x 30 days (Bedtime)

Notes: Strict salt restriction (<2g/day). Fasting and Post-prandial blood sugar tracking weekly. Repeat lipid profile in 8 weeks.`
  },
  {
    id: 'rx-gerd-gastro',
    title: 'Gastroenteritis & Acid Reflux Prescription',
    doctor: 'Dr. Michael Chen, MD, FACG',
    specialty: 'Gastroenterology',
    hospital: 'Metropolitan Digestive Health Clinic',
    patientName: 'Carlos Hernandez',
    patientAge: 31,
    date: '2026-09-18',
    diagnosis: 'Erosive Reflux Esophagitis & Gastric Dyspepsia',
    medications: [
      {
        name: 'Omeprazole',
        dosage: '20 mg Capsule',
        frequency: 'OD (Once daily before food)',
        duration: '14 Days',
        instructions: 'Take 30 minutes before morning breakfast'
      },
      {
        name: 'Ondansetron',
        dosage: '4 mg Tablet',
        frequency: 'TID (3 times daily PRN)',
        duration: '3 Days',
        instructions: 'Take when experiencing nausea'
      },
      {
        name: 'ORS Electrolytes',
        dosage: '1 Sachet in 1 Liter water',
        frequency: 'Frequent sips throughout the day',
        duration: '3 Days',
        instructions: 'Hydrate well'
      }
    ],
    rawPrescriptionText: `METROPOLITAN DIGESTIVE HEALTH CLINIC
Dr. Michael Chen, MD, FACG
Patient: Carlos Hernandez (M/31)    Date: 18-Sep-2026
Diagnosis: Acute Gastric Dyspepsia / GERD

Rx:
1. Cap. Omeprazole 20mg - 1 cap daily a.c. (before breakfast) x 14 days
2. Tab. Ondansetron 4mg - 1 tab TID PRN for nausea x 3 days
3. Sachet ORS - Dilute in 1L water, drink freely for hydration

Advice: Avoid spicy, oily food, caffeine, and carbonated beverages. Do not lie down within 2 hours after meals.`
  }
];
