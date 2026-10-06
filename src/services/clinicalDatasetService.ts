import {
  ClinicalDatasetSyncStats,
  ClinicalDiseaseRecord,
  ClinicalSymptomRecord,
  NormalizedMedicationItem,
  Symptom
} from '../types';
import { REPOSITORY_DATASETS, KAGGLE_DATASET_METADATA } from '../data/rawDatasets';
import { StorageService } from './storageService';

// ==========================================
// Clinical Ontology & Coding Mapping Tables
// ==========================================

interface ClinicalOntologyMetadata {
  officialName: string;
  icd10: string;
  snomedCt: string;
  category: string;
  specialist: string;
  urgency: 'Low' | 'Medium' | 'High' | 'Emergency';
  emergencySigns: string[];
}

const CLINICAL_ONTOLOGY_REGISTRY: Record<string, ClinicalOntologyMetadata> = {
  'fungal infection': {
    officialName: 'Cutaneous Fungal Infection (Tinea / Dermatomycosis)',
    icd10: 'B36.9',
    snomedCt: '276222008',
    category: 'Dermatological Diseases',
    specialist: 'Dermatologist / General Physician',
    urgency: 'Low',
    emergencySigns: ['Rapidly spreading cellulitis', 'High fever with blister purulence', 'Facial or periorbital involvement']
  },
  'allergy': {
    officialName: 'Allergic Reaction (Hypersensitivity Disorder)',
    icd10: 'T78.40',
    snomedCt: '418038007',
    category: 'Immunology & Allergy',
    specialist: 'Allergist / Immunologist',
    urgency: 'Low',
    emergencySigns: ['Angioedema of lips, tongue or throat', 'Audible inspiratory stridor or wheeze', 'Anaphylactic hypotension']
  },
  'gerd': {
    officialName: 'Gastroesophageal Reflux Disease (GERD)',
    icd10: 'K21.9',
    snomedCt: '235595009',
    category: 'Gastroenterology',
    specialist: 'Gastroenterologist',
    urgency: 'Medium',
    emergencySigns: ['Crushing substernal pain radiating to left arm/jaw', 'Progressive dysphagia or food impaction', 'Coffee-ground hematemesis']
  },
  'chronic cholestasis': {
    officialName: 'Chronic Intrahepatic / Extrahepatic Cholestasis',
    icd10: 'K71.0',
    snomedCt: '7223000',
    category: 'Hepatology & Gastroenterology',
    specialist: 'Hepatologist / Gastroenterologist',
    urgency: 'Medium',
    emergencySigns: ['Acute hepatic encephalopathy or confusion', 'Ascites with bacterial peritonitis', 'Upper GI variceal hemorrhage']
  },
  'drug reaction': {
    officialName: 'Adverse Drug Reaction / Cutaneous Drug Eruption',
    icd10: 'T88.7',
    snomedCt: '281647001',
    category: 'Clinical Pharmacology & Dermatology',
    specialist: 'Allergist / Dermatologist / ER Physician',
    urgency: 'High',
    emergencySigns: ['Mucosal sloughing (Stevens-Johnson / TEN warning)', 'Systemic hypotension or anaphylaxis', 'Facial edema with wheezing']
  },
  'peptic ulcer diseae': {
    officialName: 'Peptic Ulcer Disease (Gastric / Duodenal Ulcer)',
    icd10: 'K27.9',
    snomedCt: '13200003',
    category: 'Gastroenterology',
    specialist: 'Gastroenterologist',
    urgency: 'Medium',
    emergencySigns: ['Sudden rigid peritonitis (perforation)', 'Melena (tarry black stools)', 'Massive hematemesis with shock']
  },
  'aids': {
    officialName: 'Acquired Immunodeficiency Syndrome (Stage 3 HIV)',
    icd10: 'B20',
    snomedCt: '62479008',
    category: 'Infectious Disease',
    specialist: 'Infectious Disease Specialist',
    urgency: 'High',
    emergencySigns: ['Severe respiratory failure (PJP pneumonia)', 'Cryptococcal meningitis (altered mentation/stiff neck)', 'Severe neutropenic sepsis']
  },
  'diabetes': {
    officialName: 'Diabetes Mellitus (Type 2 / Metabolic Dysregulation)',
    icd10: 'E11.9',
    snomedCt: '44054006',
    category: 'Endocrinology & Metabolism',
    specialist: 'Endocrinologist / Diabetologist',
    urgency: 'Medium',
    emergencySigns: ['Diabetic Ketoacidosis (Kussmaul breathing, fruity breath)', 'Hyperosmolar hyperglycemic state (lethargy)', 'Blood glucose > 400 mg/dL']
  },
  'gastroenteritis': {
    officialName: 'Acute Infectious Gastroenteritis (Enterocolitis)',
    icd10: 'A09',
    snomedCt: '25374005',
    category: 'Gastroenterology & Infectious Diseases',
    specialist: 'Gastroenterologist / Family Physician',
    urgency: 'Medium',
    emergencySigns: ['Severe dehydration with anuria > 12 hours', 'Persistent involuntary emesis preventing oral fluids', 'High fever with bloody dysentery']
  },
  'bronchial asthma': {
    officialName: 'Bronchial Asthma (Acute / Chronic Hyperresponsiveness)',
    icd10: 'J45.909',
    snomedCt: '195967001',
    category: 'Pulmonology',
    specialist: 'Pulmonologist / Allergist',
    urgency: 'High',
    emergencySigns: ['Inability to speak complete sentences in one breath', 'Silent chest on auscultation (life-threatening)', 'Cyanosis of lips or nail beds']
  },
  'hypertension': {
    officialName: 'Essential (Primary) Systemic Hypertension',
    icd10: 'I10',
    snomedCt: '38341003',
    category: 'Cardiology',
    specialist: 'Cardiologist / Internist',
    urgency: 'Medium',
    emergencySigns: ['Hypertensive crisis (BP > 180/120 mmHg)', 'Acute focal neurological deficit', 'Chest pain or pulmonary edema']
  },
  'migraine': {
    officialName: 'Migraine with / without Aura (Neurovascular Cephalalgia)',
    icd10: 'G43.909',
    snomedCt: '37796009',
    category: 'Neurology',
    specialist: 'Neurologist',
    urgency: 'Medium',
    emergencySigns: ['"Thunderclap" headache reaching max intensity in 1 minute', 'Unilateral motor hemiplegia', 'Papilledema or loss of vision']
  },
  'cervical spondylosis': {
    officialName: 'Cervical Spondylosis (Degenerative Cervical Spine Disease)',
    icd10: 'M47.812',
    snomedCt: '202720008',
    category: 'Rheumatology & Orthopedics',
    specialist: 'Orthopedic Spine Specialist / Neurologist',
    urgency: 'Low',
    emergencySigns: ['Cervical myelopathy (gait ataxia, dropping objects)', 'Bowel or bladder sphincter incontinence', 'Lhermitte sign electric shock sensation']
  },
  'paralysis (brain hemorrhage)': {
    officialName: 'Acute Hemorrhagic Stroke / Intracranial Hemorrhage',
    icd10: 'I61.9',
    snomedCt: '274100004',
    category: 'Neurology & Emergency Medicine',
    specialist: 'Stroke Neurologist / Neurosurgeon',
    urgency: 'Emergency',
    emergencySigns: ['Sudden hemiplegia / facial droop / arm weakness', 'Acute dysphasia or expressive aphasia', 'Depressed level of consciousness / coma']
  },
  'jaundice': {
    officialName: 'Clinical Jaundice (Hyperbilirubinemia / Hepatic Dysfunction)',
    icd10: 'R17',
    snomedCt: '18165001',
    category: 'Hepatology & Gastroenterology',
    specialist: 'Hepatologist / Gastroenterologist',
    urgency: 'Medium',
    emergencySigns: ['Acute liver failure with asterixis flapping tremor', 'Ascites with spontaneous bacterial peritonitis', 'Bilirubin > 15 mg/dL with coagulopathy']
  },
  'malaria': {
    officialName: 'Malaria (Plasmodium falciparum / vivax Infection)',
    icd10: 'B54',
    snomedCt: '61462000',
    category: 'Infectious & Tropical Diseases',
    specialist: 'Infectious Disease Specialist',
    urgency: 'High',
    emergencySigns: ['Cerebral malaria (seizures, altered sensorium)', 'Blackwater fever (cola-colored intravascular hemolysis)', 'Severe metabolic acidosis (respiratory distress)']
  },
  'chicken pox': {
    officialName: 'Varicella (Chickenpox / Primary VZV Infection)',
    icd10: 'B01.9',
    snomedCt: '38907003',
    category: 'Infectious Diseases & Pediatrics',
    specialist: 'Pediatrician / Infectious Disease Specialist',
    urgency: 'Low',
    emergencySigns: ['Varicella pneumonia with tachypnea and hemoptysis', 'Cerebellar ataxia or encephalitis', 'Secondary bacterial necrotizing fasciitis']
  },
  'dengue': {
    officialName: 'Dengue Fever / Severe Dengue (Dengue Hemorrhagic Fever)',
    icd10: 'A90',
    snomedCt: '38362002',
    category: 'Infectious & Tropical Diseases',
    specialist: 'Infectious Disease Specialist / Critical Care',
    urgency: 'High',
    emergencySigns: ['Dengue shock syndrome (narrow pulse pressure < 20 mmHg)', 'Mucosal hemorrhage (epistaxis, GI bleeding)', 'Platelet count dropping below 20,000/mcL']
  },
  'typhoid': {
    officialName: 'Typhoid Fever (Salmonella enterica serovar Typhi)',
    icd10: 'A01.0',
    snomedCt: '4834000',
    category: 'Infectious Diseases & Gastroenterology',
    specialist: 'Infectious Disease Specialist',
    urgency: 'High',
    emergencySigns: ['Ileal perforation with acute peritonitis', 'Typhoid encephalopathy with muttering delirium', 'Intestinal hemorrhage in 3rd week']
  },
  'hepatitis a': {
    officialName: 'Acute Viral Hepatitis A',
    icd10: 'B15.9',
    snomedCt: '40468003',
    category: 'Hepatology',
    specialist: 'Hepatologist / Gastroenterologist',
    urgency: 'Medium',
    emergencySigns: ['Fulminant hepatic necrosis', 'Prolonged INR > 2.0 with encephalopathy', 'Intractable nausea with severe hypoglycemia']
  },
  'hepatitis b': {
    officialName: 'Viral Hepatitis B (Acute / Chronic Infection)',
    icd10: 'B16.9',
    snomedCt: '66071002',
    category: 'Hepatology & Infectious Diseases',
    specialist: 'Hepatologist',
    urgency: 'Medium',
    emergencySigns: ['Decompensated cirrhosis with bleeding varices', 'Hepatorenal syndrome', 'Acute flare with marked jaundice']
  },
  'hepatitis c': {
    officialName: 'Chronic Viral Hepatitis C',
    icd10: 'B18.2',
    snomedCt: '50711007',
    category: 'Hepatology & Infectious Diseases',
    specialist: 'Hepatologist / Infectious Disease Specialist',
    urgency: 'Medium',
    emergencySigns: ['Hepatocellular carcinoma signs', 'Spontaneous bacterial peritonitis', 'Portal hypertension ascites']
  },
  'hepatitis d': {
    officialName: 'Viral Hepatitis D (Delta Virus Superinfection)',
    icd10: 'B17.0',
    snomedCt: '24982006',
    category: 'Hepatology',
    specialist: 'Hepatologist',
    urgency: 'Medium',
    emergencySigns: ['Accelerated hepatic decompensation', 'Coagulopathy refractory to Vitamin K', 'Hepatic encephalopathy']
  },
  'hepatitis e': {
    officialName: 'Viral Hepatitis E',
    icd10: 'B17.2',
    snomedCt: '77294002',
    category: 'Hepatology',
    specialist: 'Hepatologist',
    urgency: 'Medium',
    emergencySigns: ['Fulminant hepatic failure in 3rd trimester of pregnancy', 'Severe jaundice with metabolic collapse', 'Renal impairment']
  },
  'alcoholic hepatitis': {
    officialName: 'Alcoholic Hepatitis (Acute Alcohol-Induced Steatohepatitis)',
    icd10: 'K70.1',
    snomedCt: '61977001',
    category: 'Hepatology & Addiction Medicine',
    specialist: 'Hepatologist / Critical Care',
    urgency: 'High',
    emergencySigns: ['Maddrey Discriminant Function > 32', 'Overt encephalopathy or asterixis', 'Systemic inflammatory response syndrome (SIRS)']
  },
  'tuberculosis': {
    officialName: 'Pulmonary / Extrapulmonary Tuberculosis (Mycobacterial)',
    icd10: 'A15.0',
    snomedCt: '56717001',
    category: 'Pulmonology & Infectious Diseases',
    specialist: 'Pulmonologist / Infectious Disease Specialist',
    urgency: 'High',
    emergencySigns: ['Massive hemoptysis (> 200 mL/24h)', 'Tension pneumothorax from cavitary rupture', 'Tuberculous meningitis']
  },
  'common cold': {
    officialName: 'Acute Viral Rhinopharyngitis (Common Cold)',
    icd10: 'J00',
    snomedCt: '82272006',
    category: 'General Medicine & Otolaryngology',
    specialist: 'Primary Care Physician',
    urgency: 'Low',
    emergencySigns: ['Secondary bacterial pneumonia', 'Persistent stridor or severe throat pain with drooling', 'Fever > 103°F lasting > 5 days']
  },
  'pneumonia': {
    officialName: 'Community-Acquired / Bacterial Pneumonia',
    icd10: 'J18.9',
    snomedCt: '233604007',
    category: 'Pulmonology & Critical Care',
    specialist: 'Pulmonologist / Hospitalist',
    urgency: 'High',
    emergencySigns: ['Oxygen saturation SpO2 < 90% on room air', 'CURB-65 score >= 3 (Confusion, BUN, RR, BP)', 'Septic shock / hemodynamic collapse']
  },
  'dimorphic hemmorhoids(piles)': {
    officialName: 'Internal & External Hemorrhoidal Disease',
    icd10: 'K64.9',
    snomedCt: '77744000',
    category: 'Colorectal Surgery & Proctology',
    specialist: 'Colorectal Surgeon / Proctologist',
    urgency: 'Low',
    emergencySigns: ['Strangulated or thrombosed hemorrhoid with severe necrosis', 'Continuous brisk arterial rectal bleeding with syncope', 'Perianal abscess']
  },
  'heart attack': {
    officialName: 'Acute Myocardial Infarction (STEMI / NSTEMI)',
    icd10: 'I21.9',
    snomedCt: '22298006',
    category: 'Cardiology & Emergency Medicine',
    specialist: 'Interventional Cardiologist / Emergency Physician',
    urgency: 'Emergency',
    emergencySigns: ['Crushing retrosternal chest pain radiating to neck/jaw/left arm', 'Diaphoresis with cardiogenic shock', 'Ventricular fibrillation / cardiac arrest']
  },
  'varicose veins': {
    officialName: 'Chronic Venous Insufficiency & Lower Extremity Varicose Veins',
    icd10: 'I83.90',
    snomedCt: '12856003',
    category: 'Vascular Surgery',
    specialist: 'Vascular Surgeon / Phlebologist',
    urgency: 'Low',
    emergencySigns: ['Acute rupture of varicosity with profuse bleeding', 'Phlegmasia cerulea dolens or acute DVT', 'Active deep venous stasis ulcer infection']
  },
  'hypothyroidism': {
    officialName: 'Primary Hypothyroidism (Hashimoto Thyroiditis)',
    icd10: 'E03.9',
    snomedCt: '40930008',
    category: 'Endocrinology',
    specialist: 'Endocrinologist',
    urgency: 'Low',
    emergencySigns: ['Myxedema coma (hypothermia, severe bradycardia, hypoventilation)', 'Pericardial effusion with tamponade', 'Profound unresponsiveness']
  },
  'hyperthyroidism': {
    officialName: 'Hyperthyroidism / Thyrotoxicosis (Graves Disease)',
    icd10: 'E05.90',
    snomedCt: '34486009',
    category: 'Endocrinology',
    specialist: 'Endocrinologist',
    urgency: 'Medium',
    emergencySigns: ['Thyroid storm (hyperpyrexia, tachydysrhythmia, delirium)', 'Atrial fibrillation with rapid ventricular response', 'High-output heart failure']
  },
  'hypoglycemia': {
    officialName: 'Acute Hypoglycemia (Neuroglycopenic Crisis)',
    icd10: 'E16.2',
    snomedCt: '302866003',
    category: 'Endocrinology & Emergency Medicine',
    specialist: 'Endocrinologist / Emergency Physician',
    urgency: 'Medium',
    emergencySigns: ['Neuroglycopenic seizures', 'Coma / loss of consciousness with glucose < 40 mg/dL', 'Severe unresponsiveness refractory to oral carbs']
  },
  'osteoarthristis': {
    officialName: 'Osteoarthritis (Degenerative Joint Disease)',
    icd10: 'M19.90',
    snomedCt: '396275006',
    category: 'Rheumatology & Orthopedics',
    specialist: 'Rheumatologist / Orthopedic Surgeon',
    urgency: 'Low',
    emergencySigns: ['Acute septic arthritis superinfection (hot, swollen joint with fever)', 'Severe neurovascular compromise from osteophyte', 'Complete joint instability']
  },
  'arthritis': {
    officialName: 'Inflammatory Arthritis (Rheumatoid / Seronegative)',
    icd10: 'M13.9',
    snomedCt: '3723001',
    category: 'Rheumatology',
    specialist: 'Rheumatologist',
    urgency: 'Low',
    emergencySigns: ['Systemic vasculitis with digital gangrene', 'C1-C2 atlantoaxial subluxation with cord compression', 'Severe acute flare with constitutional fever']
  },
  '(vertigo) paroymsal  positional vertigo': {
    officialName: 'Benign Paroxysmal Positional Vertigo (BPPV)',
    icd10: 'H81.10',
    snomedCt: '232288001',
    category: 'Otolaryngology & Neurology',
    specialist: 'ENT Specialist / Neuro-otologist',
    urgency: 'Low',
    emergencySigns: ['Central vertigo with vertical nystagmus or ataxia', 'Concomitant hearing loss with severe facial weakness', 'Signs of cerebellar stroke']
  },
  'acne': {
    officialName: 'Acne Vulgaris (Pilosebaceous Inflammatory Dermatosis)',
    icd10: 'L70.0',
    snomedCt: '11381005',
    category: 'Dermatology',
    specialist: 'Dermatologist',
    urgency: 'Low',
    emergencySigns: ['Acne fulminans with fever and osteolytic lesions', 'Severe secondary facial cellulitis', 'Cavernous sinus thrombosis signs']
  },
  'urinary tract infection': {
    officialName: 'Urinary Tract Infection (Acute Cystitis / Pyelonephritis)',
    icd10: 'N39.0',
    snomedCt: '68566005',
    category: 'Urology & Nephrology',
    specialist: 'Urologist / Nephrologist',
    urgency: 'Medium',
    emergencySigns: ['Acute urosepsis (rigors, hypotension, altered mental status)', 'Severe costovertebral flank pain with high-grade pyrexia', 'Anuria from obstructive stone']
  },
  'psoriasis': {
    officialName: 'Psoriasis Vulgaris (Plaque / Guttate Psoriasis)',
    icd10: 'L40.9',
    snomedCt: '9014002',
    category: 'Dermatology & Rheumatology',
    specialist: 'Dermatologist / Rheumatologist',
    urgency: 'Low',
    emergencySigns: ['Erythrodermic psoriasis (> 90% body surface area affected)', 'Generalized pustular psoriasis of von Zumbusch with fever', 'High output cardiac failure from exfoliation']
  },
  'impetigo': {
    officialName: 'Impetigo Contagiosa (Bacterial Epidermal Pyoderma)',
    icd10: 'L01.0',
    snomedCt: '48277006',
    category: 'Dermatology & Pediatrics',
    specialist: 'Dermatologist / Pediatrician',
    urgency: 'Low',
    emergencySigns: ['Post-streptococcal glomerulonephritis (cola-colored urine)', 'Staphylococcal scalded skin syndrome (widespread bullae)', 'Facial cellulitis involving orbital tissues']
  }
};

// ==========================================
// Anatomical System Classification for Symptoms
// ==========================================

const ANATOMICAL_CATEGORY_MAP: Record<string, Symptom['category']> = {
  // Head & Neurological
  headache: 'Head & Neurological',
  dizziness: 'Head & Neurological',
  spinning_movements: 'Head & Neurological',
  loss_of_balance: 'Head & Neurological',
  unsteadiness: 'Head & Neurological',
  loss_of_smell: 'Head & Neurological',
  slurred_speech: 'Head & Neurological',
  altered_sensorium: 'Head & Neurological',
  lack_of_concentration: 'Head & Neurological',
  visual_disturbances: 'Head & Neurological',
  blurred_and_distorted_vision: 'Head & Neurological',
  depression: 'Head & Neurological',
  irritability: 'Head & Neurological',
  anxiety: 'Head & Neurological',
  mood_swings: 'Head & Neurological',
  restlessness: 'Head & Neurological',
  coma: 'Head & Neurological',
  weakness_of_one_body_side: 'Head & Neurological',

  // Respiratory
  continuous_sneezing: 'Respiratory',
  cough: 'Respiratory',
  breathlessness: 'Respiratory',
  phlegm: 'Respiratory',
  throat_irritation: 'Respiratory',
  sinus_pressure: 'Respiratory',
  runny_nose: 'Respiratory',
  congestion: 'Respiratory',
  patches_in_throat: 'Respiratory',
  mucoid_sputum: 'Respiratory',
  rusty_sputum: 'Respiratory',
  blood_in_sputum: 'Respiratory',

  // Cardiovascular
  chest_pain: 'Cardiovascular',
  fast_heart_rate: 'Cardiovascular',
  palpitations: 'Cardiovascular',
  prominent_veins_on_calf: 'Cardiovascular',
  swollen_blood_vessels: 'Cardiovascular',

  // Gastrointestinal & Hepatic
  stomach_pain: 'Gastrointestinal',
  acidity: 'Gastrointestinal',
  ulcers_on_tongue: 'Gastrointestinal',
  vomiting: 'Gastrointestinal',
  indigestion: 'Gastrointestinal',
  nausea: 'Gastrointestinal',
  loss_of_appetite: 'Gastrointestinal',
  constipation: 'Gastrointestinal',
  abdominal_pain: 'Gastrointestinal',
  diarrhoea: 'Gastrointestinal',
  acute_liver_failure: 'Gastrointestinal',
  swelling_of_stomach: 'Gastrointestinal',
  pain_during_bowel_movements: 'Gastrointestinal',
  pain_in_anal_region: 'Gastrointestinal',
  bloody_stool: 'Gastrointestinal',
  irritation_in_anus: 'Gastrointestinal',
  passage_of_gases: 'Gastrointestinal',
  belly_pain: 'Gastrointestinal',
  stomach_bleeding: 'Gastrointestinal',
  distention_of_abdomen: 'Gastrointestinal',

  // Dermatological
  itching: 'Dermatological',
  skin_rash: 'Dermatological',
  nodal_skin_eruptions: 'Dermatological',
  yellowish_skin: 'Dermatological',
  yellowing_of_eyes: 'Dermatological',
  redness_of_eyes: 'Dermatological',
  red_spots_over_body: 'Dermatological',
  dischromic_patches: 'Dermatological',
  pus_filled_pimples: 'Dermatological',
  blackheads: 'Dermatological',
  scurring: 'Dermatological',
  skin_peeling: 'Dermatological',
  silver_like_dusting: 'Dermatological',
  small_dents_in_nails: 'Dermatological',
  inflammatory_nails: 'Dermatological',
  blister: 'Dermatological',
  red_sore_around_nose: 'Dermatological',
  yellow_crust_ooze: 'Dermatological',
  brittle_nails: 'Dermatological',
  internal_itching: 'Dermatological',

  // Urological & Reproductive
  burning_micturition: 'Urological & Reproductive',
  spotting_urination: 'Urological & Reproductive',
  dark_urine: 'Urological & Reproductive',
  yellow_urine: 'Urological & Reproductive',
  bladder_discomfort: 'Urological & Reproductive',
  foul_smell_of_urine: 'Urological & Reproductive',
  continuous_feel_of_urine: 'Urological & Reproductive',
  polyuria: 'Urological & Reproductive',
  abnormal_menstruation: 'Urological & Reproductive',

  // Musculoskeletal
  joint_pain: 'Musculoskeletal',
  muscle_wasting: 'Musculoskeletal',
  back_pain: 'Musculoskeletal',
  weakness_in_limbs: 'Musculoskeletal',
  neck_pain: 'Musculoskeletal',
  cramps: 'Musculoskeletal',
  knee_pain: 'Musculoskeletal',
  hip_joint_pain: 'Musculoskeletal',
  muscle_weakness: 'Musculoskeletal',
  stiff_neck: 'Musculoskeletal',
  swelling_joints: 'Musculoskeletal',
  movement_stiffness: 'Musculoskeletal',
  muscle_pain: 'Musculoskeletal',
  painful_walking: 'Musculoskeletal'
};

export class ClinicalDatasetService {
  private static instance: ClinicalDatasetService;

  private constructor() {
    // Auto-seed on first instantiate if database is empty
    this.ensureDatabaseInitialized();
  }

  public static getInstance(): ClinicalDatasetService {
    if (!ClinicalDatasetService.instance) {
      ClinicalDatasetService.instance = new ClinicalDatasetService();
    }
    return ClinicalDatasetService.instance;
  }

  // ==========================================
  // Ingestion & Normalization Core Logic
  // ==========================================

  /**
   * Parse a raw CSV text into an array of object records based on headers
   */
  public parseCSVToRecords(csvText: string): Record<string, string>[] {
    const lines = csvText.trim().split('\n').filter(l => l.trim().length > 0);
    if (lines.length === 0) return [];

    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headers = parseLine(lines[0]);
    const records: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseLine(lines[i]);
      const record: Record<string, string> = {};
      headers.forEach((h, idx) => {
        record[h] = values[idx] || '';
      });
      records.push(record);
    }
    return records;
  }

  /**
   * Parse Python string representation of arrays: "['item1', 'item2']"
   */
  public parsePythonList(rawString: string): string[] {
    if (!rawString) return [];
    try {
      const cleaned = rawString.trim();
      if (cleaned.startsWith('[') && cleaned.endsWith(']')) {
        // Strip outer brackets and split by comma accounting for single quotes
        const inner = cleaned.slice(1, -1);
        const matches = inner.match(/'([^']+)'/g);
        if (matches) {
          return matches.map(m => m.replace(/^'|'$/g, '').trim());
        }
        return inner.split(',').map(s => s.replace(/['"]/g, '').trim()).filter(Boolean);
      }
    } catch {
      // fallback
    }
    return [rawString];
  }

  /**
   * Generate slug ID from disease name
   */
  public generateId(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[()]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  /**
   * Look up ontology metadata for a given disease string
   */
  private getOntology(rawName: string): ClinicalOntologyMetadata {
    const key = rawName.toLowerCase().trim();
    if (CLINICAL_ONTOLOGY_REGISTRY[key]) {
      return CLINICAL_ONTOLOGY_REGISTRY[key];
    }
    // Partial substring lookup
    for (const regKey of Object.keys(CLINICAL_ONTOLOGY_REGISTRY)) {
      if (key.includes(regKey) || regKey.includes(key)) {
        return CLINICAL_ONTOLOGY_REGISTRY[regKey];
      }
    }
    // Fallback default
    return {
      officialName: rawName.trim(),
      icd10: 'R69',
      snomedCt: '404684003',
      category: 'General Clinical Medicine',
      specialist: 'General Physician / Internist',
      urgency: 'Medium',
      emergencySigns: ['Severe acute respiratory distress', 'Hemodynamic instability', 'Rapid loss of consciousness']
    };
  }

  /**
   * Extracts symptom binary associations from Kaggle Testing.csv & Training_sample.csv
   */
  private extractSymptomProfiles(): Map<string, { primary: string[]; secondary: string[] }> {
    const map = new Map<string, { primary: string[]; secondary: string[] }>();
    const testingFile = REPOSITORY_DATASETS.find(d => d.filename === 'Testing.csv');
    if (!testingFile) return map;

    const lines = testingFile.content.trim().split('\n');
    if (lines.length < 2) return map;

    const headers = lines[0].split(',').map(h => h.trim());
    const symptomHeaders = headers.slice(0, -1);

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map(p => p.trim());
      const diseaseName = parts[parts.length - 1];
      if (!diseaseName) continue;

      const activeSymptoms: string[] = [];
      for (let j = 0; j < symptomHeaders.length; j++) {
        if (parts[j] === '1') {
          activeSymptoms.push(symptomHeaders[j].toLowerCase().replace(/\s+/g, '_'));
        }
      }

      const primary = activeSymptoms.slice(0, Math.ceil(activeSymptoms.length / 2));
      const secondary = activeSymptoms.slice(Math.ceil(activeSymptoms.length / 2));

      map.set(diseaseName.toLowerCase().trim(), { primary, secondary });
    }

    return map;
  }

  /**
   * Normalizes all raw Kaggle datasets into high-fidelity professional clinical records
   */
  public normalizeAllDatasets(): {
    diseases: ClinicalDiseaseRecord[];
    symptoms: ClinicalSymptomRecord[];
    stats: ClinicalDatasetSyncStats;
  } {
    const descriptionsCsv = REPOSITORY_DATASETS.find(d => d.filename === 'symptom_Description.csv')?.content || '';
    const precautionsCsv = REPOSITORY_DATASETS.find(d => d.filename === 'symptom_precaution.csv')?.content || '';
    const medicationsCsv = REPOSITORY_DATASETS.find(d => d.filename === 'medications.csv')?.content || '';
    const dietsCsv = REPOSITORY_DATASETS.find(d => d.filename === 'diets.csv')?.content || '';
    const workoutsCsv = REPOSITORY_DATASETS.find(d => d.filename === 'workout.csv')?.content || '';
    const severityCsv = REPOSITORY_DATASETS.find(d => d.filename === 'Symptom-severity.csv')?.content || '';

    // 1. Parse Symptoms & Calibrate Severity
    const symptomSeverityRecords = this.parseCSVToRecords(severityCsv);
    const symptoms: ClinicalSymptomRecord[] = symptomSeverityRecords.map(rec => {
      const standardKey = (rec.Symptom || rec.symptom || '').toLowerCase().trim();
      const rawWeight = parseInt(rec.weight || rec.severity || '3', 10);
      const clinicalWeight = isNaN(rawWeight) ? 3 : Math.min(7, Math.max(1, rawWeight));

      let severityLevel: ClinicalSymptomRecord['severityLevel'] = 'Moderate';
      if (clinicalWeight >= 7) severityLevel = 'Critical';
      else if (clinicalWeight >= 5) severityLevel = 'Severe';
      else if (clinicalWeight <= 2) severityLevel = 'Mild';

      const anatomicalCategory: Symptom['category'] = ANATOMICAL_CATEGORY_MAP[standardKey] || 'General';
      const displayName = standardKey
        .split('_')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

      return {
        id: standardKey,
        standardKey,
        name: standardKey,
        displayName,
        category: anatomicalCategory,
        anatomicalCategory,
        severityWeight: Math.min(5, Math.max(1, Math.round(clinicalWeight * (5 / 7)))), // 1-5 scale for legacy
        clinicalWeight, // 1-7 scale for Kaggle professional scale
        severityLevel,
        icd10Reference: `R${(10 + (clinicalWeight * 3)).toFixed(1)}`,
        description: `Clinical indicator of ${anatomicalCategory.toLowerCase()} acuity with standardized severity rating ${clinicalWeight}/7 (${severityLevel}).`
      };
    });

    // 2. Parse Raw Disease Tables
    const descRecords = this.parseCSVToRecords(descriptionsCsv);
    const precRecords = this.parseCSVToRecords(precautionsCsv);
    const medRecords = this.parseCSVToRecords(medicationsCsv);
    const dietRecords = this.parseCSVToRecords(dietsCsv);
    const workoutRecords = this.parseCSVToRecords(workoutsCsv);

    const symptomProfiles = this.extractSymptomProfiles();

    // Map by normalized disease key
    const precautionsMap = new Map<string, string[]>();
    precRecords.forEach(p => {
      const key = (p.Disease || '').toLowerCase().trim();
      const precs: string[] = [];
      if (p.Precaution_1) precs.push(p.Precaution_1);
      if (p.Precaution_2) precs.push(p.Precaution_2);
      if (p.Precaution_3) precs.push(p.Precaution_3);
      if (p.Precaution_4) precs.push(p.Precaution_4);
      precautionsMap.set(key, precs);
    });

    const medicationsMap = new Map<string, string[]>();
    medRecords.forEach(m => {
      const key = (m.Disease || '').toLowerCase().trim();
      const list = this.parsePythonList(m.Medication || '');
      medicationsMap.set(key, list);
    });

    const dietsMap = new Map<string, string[]>();
    dietRecords.forEach(d => {
      const key = (d.Disease || '').toLowerCase().trim();
      const list = this.parsePythonList(d.Diet || '');
      dietsMap.set(key, list);
    });

    const workoutsMap = new Map<string, string[]>();
    workoutRecords.forEach(w => {
      const key = (w.Disease || '').toLowerCase().trim();
      const list = this.parsePythonList(w.Workout || '');
      workoutsMap.set(key, list);
    });

    // 3. Assemble Normalized Clinical Disease Records
    const timestamp = new Date().toISOString();
    const diseases: ClinicalDiseaseRecord[] = descRecords.map(rec => {
      const rawName = (rec.Disease || '').trim();
      const key = rawName.toLowerCase();
      const id = this.generateId(rawName);
      const ontology = this.getOntology(rawName);

      const description = rec.Description || 'No detailed clinical pathology description available.';
      const precautions = precautionsMap.get(key) || [
        'Consult with licensed healthcare provider',
        'Follow prescribed clinical management plan',
        'Maintain hydration and nutritional support',
        'Monitor for worsening symptoms'
      ];
      const rawMeds = medicationsMap.get(key) || ['Supportive pharmacotherapy as directed by physician'];
      const dietaryAdvice = dietsMap.get(key) || ['Balanced nutrient-rich diet', 'Adequate fluid intake'];
      const lifestyleAdvice = workoutsMap.get(key) || ['Adequate physical rest', 'Avoid strenuous overexertion'];

      const symptomProfile = symptomProfiles.get(key) || {
        primary: ['fatigue', 'high_fever'],
        secondary: ['headache', 'malaise']
      };

      // Transform raw drug strings into NormalizedMedicationItem
      const normalizedMedicationsList: NormalizedMedicationItem[] = rawMeds.map((drug, index) => {
        const isPrimary = index === 0;
        return {
          drugName: drug,
          dosage: isPrimary ? 'Standard adult therapeutic dose' : 'Adjunctive / PRN as indicated',
          type: isPrimary ? 'Primary' : index === 1 ? 'Secondary' : 'Supportive',
          frequency: 'Per clinician prescription',
          timing: 'With or after meals',
          instructions: `Administer ${drug} per standard medical guidance for ${ontology.officialName}.`
        };
      });

      // Transform for legacy Disease interface compatibility
      const recommendedMedicines = normalizedMedicationsList.map((m, idx) => ({
        medicineId: this.generateId(m.drugName),
        type: (m.type || 'Primary') as 'Primary' | 'Secondary' | 'Supportive',
        dosage: m.dosage,
        duration: idx === 0 ? '5-7 Days' : 'As needed',
        instructions: m.instructions || ''
      }));

      // Calculate data completeness quality score (0 to 100)
      let score = 70;
      if (ontology.icd10 && ontology.icd10 !== 'R69') score += 10;
      if (ontology.snomedCt) score += 5;
      if (precautions.length >= 4) score += 5;
      if (normalizedMedicationsList.length >= 2) score += 5;
      if (symptomProfile.primary.length > 0) score += 5;

      return {
        id,
        rawName,
        officialName: ontology.officialName,
        name: ontology.officialName,
        icd10: ontology.icd10,
        snomedCt: ontology.snomedCt,
        category: ontology.category,
        specialist: ontology.specialist,
        urgency: ontology.urgency,
        urgencyLevel: ontology.urgency,
        description,
        precautions,
        dietaryAdvice,
        lifestyleAdvice,
        emergencySigns: ontology.emergencySigns,
        primarySymptoms: symptomProfile.primary,
        secondarySymptoms: symptomProfile.secondary,
        recommendedMedicines,
        normalizedMedicationsList,
        dataQualityScore: Math.min(100, score),
        lastNormalizedAt: timestamp,
        sourceDataset: KAGGLE_DATASET_METADATA.kaggleSlug
      };
    });

    const totalPrecautions = diseases.reduce((acc, d) => acc + d.precautions.length, 0);
    const totalMedications = diseases.reduce((acc, d) => acc + d.normalizedMedicationsList.length, 0);

    const stats: ClinicalDatasetSyncStats = {
      version: '2026.1-PRO-KAGGLE',
      totalDiseases: diseases.length,
      totalSymptoms: symptoms.length,
      totalPrecautions,
      totalMedications,
      lastSyncTimestamp: timestamp,
      syncStatus: 'synced',
      integrityCheck: diseases.length === 41 && symptoms.length === 132,
      sourceUrl: KAGGLE_DATASET_METADATA.url,
      recordsImported: diseases.length + symptoms.length
    };

    return { diseases, symptoms, stats };
  }

  /**
   * Syncs and persists the normalized clinical datasets into browser local storage
   */
  public async syncAndPersistToLocalDatabase(force: boolean = false): Promise<{
    success: boolean;
    stats: ClinicalDatasetSyncStats;
    error?: string;
  }> {
    try {
      const existingStats = StorageService.getClinicalSyncStats();
      if (!force && existingStats && existingStats.syncStatus === 'synced') {
        return { success: true, stats: existingStats };
      }

      const { diseases, symptoms, stats } = this.normalizeAllDatasets();

      StorageService.saveClinicalDiseases(diseases);
      StorageService.saveClinicalSymptoms(symptoms);
      StorageService.saveClinicalSyncStats(stats);

      return { success: true, stats };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown normalization error';
      console.error('Failed to sync clinical datasets to local database', err);
      return {
        success: false,
        stats: {
          version: '2026.1-ERR',
          totalDiseases: 0,
          totalSymptoms: 0,
          totalPrecautions: 0,
          totalMedications: 0,
          lastSyncTimestamp: new Date().toISOString(),
          syncStatus: 'error',
          integrityCheck: false,
          sourceUrl: KAGGLE_DATASET_METADATA.url,
          recordsImported: 0
        },
        error: errorMsg
      };
    }
  }

  /**
   * Ensures the local clinical database is seeded with normalized data on first load
   */
  public ensureDatabaseInitialized(): void {
    const existing = StorageService.getClinicalDiseases();
    if (!existing || existing.length === 0) {
      this.syncAndPersistToLocalDatabase(true);
    }
  }

  /**
   * Retrieve normalized clinical diseases from local storage (or normalize on-the-fly)
   */
  public getNormalizedDiseases(): ClinicalDiseaseRecord[] {
    const fromDb = StorageService.getClinicalDiseases();
    if (fromDb && fromDb.length > 0) {
      return fromDb;
    }
    const { diseases } = this.normalizeAllDatasets();
    StorageService.saveClinicalDiseases(diseases);
    return diseases;
  }

  /**
   * Retrieve normalized clinical symptoms
   */
  public getNormalizedSymptoms(): ClinicalSymptomRecord[] {
    const fromDb = StorageService.getClinicalSymptoms();
    if (fromDb && fromDb.length > 0) {
      return fromDb;
    }
    const { symptoms } = this.normalizeAllDatasets();
    StorageService.saveClinicalSymptoms(symptoms);
    return symptoms;
  }

  /**
   * Retrieve current sync metadata
   */
  public getSyncStats(): ClinicalDatasetSyncStats {
    const fromDb = StorageService.getClinicalSyncStats();
    if (fromDb) return fromDb;
    const { stats } = this.normalizeAllDatasets();
    StorageService.saveClinicalSyncStats(stats);
    return stats;
  }

  /**
   * Clinical search engine across disease names, ICD-10, SNOMED, and clinical descriptions
   */
  public searchClinicalRecords(query: string): ClinicalDiseaseRecord[] {
    const q = query.toLowerCase().trim();
    if (!q) return this.getNormalizedDiseases();

    return this.getNormalizedDiseases().filter(d =>
      d.officialName.toLowerCase().includes(q) ||
      d.rawName.toLowerCase().includes(q) ||
      d.icd10.toLowerCase().includes(q) ||
      d.snomedCt.toLowerCase().includes(q) ||
      d.category.toLowerCase().includes(q) ||
      d.specialist.toLowerCase().includes(q) ||
      d.description.toLowerCase().includes(q) ||
      d.primarySymptoms.some(s => s.toLowerCase().includes(q))
    );
  }

  /**
   * Export database as JSON, SQL INSERT script, or CSV bundle
   */
  public exportDatabase(format: 'json' | 'sql' | 'csv'): string {
    const diseases = this.getNormalizedDiseases();
    const symptoms = this.getNormalizedSymptoms();
    const stats = this.getSyncStats();

    if (format === 'json') {
      return JSON.stringify({
        schemaVersion: '1.0.0',
        standards: ['ICD-10-CM', 'SNOMED-CT', 'WHO'],
        datasetSource: KAGGLE_DATASET_METADATA.url,
        syncStats: stats,
        diseases,
        symptoms
      }, null, 2);
    }

    if (format === 'sql') {
      const diseaseInserts = diseases.map(d => {
        const escapeSql = (s: string) => s.replace(/'/g, "''");
        return `INSERT INTO clinical_diseases (id, official_name, icd10, snomed_ct, category, specialist, urgency_level, description) VALUES ('${escapeSql(d.id)}', '${escapeSql(d.officialName)}', '${escapeSql(d.icd10)}', '${escapeSql(d.snomedCt)}', '${escapeSql(d.category)}', '${escapeSql(d.specialist)}', '${d.urgencyLevel}', '${escapeSql(d.description)}') ON CONFLICT (id) DO UPDATE SET icd10 = EXCLUDED.icd10;`;
      }).join('\n');

      const symptomInserts = symptoms.map(s => {
        const escapeSql = (str: string) => str.replace(/'/g, "''");
        return `INSERT INTO clinical_symptoms (id, standard_key, display_name, category, clinical_weight, severity_level) VALUES ('${escapeSql(s.id)}', '${escapeSql(s.standardKey)}', '${escapeSql(s.displayName)}', '${escapeSql(s.anatomicalCategory || s.category || 'General')}', ${s.clinicalWeight}, '${s.severityLevel}') ON CONFLICT (id) DO NOTHING;`;
      }).join('\n');

      return `-- ==========================================
-- MedAssist Clinical Medical Database Schema & Seed Script
-- Standards: WHO ICD-10-CM, SNOMED-CT
-- Source: ${KAGGLE_DATASET_METADATA.title}
-- Generated At: ${new Date().toISOString()}
-- ==========================================

${diseaseInserts}

${symptomInserts}
`;
    }

    // CSV format: Flattened master disease table
    const headers = [
      'id',
      'official_name',
      'raw_kaggle_name',
      'icd10',
      'snomed_ct',
      'category',
      'urgency_level',
      'specialist',
      'precautions_count',
      'medications_count',
      'primary_symptoms'
    ];

    const rows = diseases.map(d => [
      `"${d.id}"`,
      `"${d.officialName.replace(/"/g, '""')}"`,
      `"${d.rawName.replace(/"/g, '""')}"`,
      `"${d.icd10}"`,
      `"${d.snomedCt}"`,
      `"${d.category}"`,
      `"${d.urgencyLevel}"`,
      `"${d.specialist}"`,
      d.precautions.length,
      d.normalizedMedicationsList.length,
      `"${d.primarySymptoms.join('; ')}"`
    ].join(','));

    return [headers.join(','), ...rows].join('\n');
  }
}

export const clinicalDatasetService = ClinicalDatasetService.getInstance();
