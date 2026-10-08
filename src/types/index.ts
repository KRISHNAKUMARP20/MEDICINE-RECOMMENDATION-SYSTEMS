export interface Symptom {
  id: string;
  name: string;
  displayName: string;
  category: 'General' | 'Head & Neurological' | 'Respiratory' | 'Cardiovascular' | 'Gastrointestinal' | 'Musculoskeletal' | 'Dermatological' | 'Urological & Reproductive';
  severityWeight: number; // 1 to 5
  description: string;
}

export interface Disease {
  id: string;
  name: string;
  icd10: string;
  category: string;
  specialist: string;
  urgency: 'Low' | 'Medium' | 'High' | 'Emergency';
  description: string;
  primarySymptoms: string[]; // symptom ids
  secondarySymptoms: string[]; // symptom ids
  recommendedMedicines: {
    medicineId: string;
    type: 'Primary' | 'Secondary' | 'Supportive';
    dosage: string;
    duration: string;
    instructions: string;
  }[];
  precautions: string[];
  dietaryAdvice: string[];
  lifestyleAdvice: string[];
  emergencySigns: string[];
}

export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  brandNames: string[];
  drugClass: string;
  prescriptionRequired: boolean; // OTC or Rx
  standardDosage: {
    adult: string;
    pediatric?: string;
    frequency: string;
    timing: 'Before meals' | 'After meals' | 'With food' | 'Anytime';
  };
  indications: string[];
  contraindications: string[];
  commonSideEffects: string[];
  severeSideEffects: string[];
  pregnancyCategory: 'A' | 'B' | 'C' | 'D' | 'X';
  drugInteractions: {
    interactsWith: string;
    severity: 'Mild' | 'Moderate' | 'Severe' | 'Contraindicated';
    description: string;
  }[];
  substitutes: string[];
  priceRange: string;
  form: 'Tablet' | 'Capsule' | 'Syrup' | 'Inhaler' | 'Injection' | 'Ointment' | 'Drops';
}

export interface PatientProfile {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  weightKg?: number;
  heightCm?: number;
  bloodType?: string;
  isPregnant?: boolean;
  hasRenalDisease?: boolean;
  hasHepaticDisease?: boolean;
  knownAllergies: string[];
  currentMedications: string[];
  chronicConditions?: string[];
  activeSymptoms?: string[];
  healthGoals?: string[];
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  onboardingCompleted?: boolean;
  onboardingCompletedAt?: string;
}

export interface DoctorPrescribedItem {
  id: string;
  medicineId: string;
  medicineName: string;
  genericName?: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface DoctorConsultationOrder {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  clinicalNotes: string;
  prescribedMedicines: DoctorPrescribedItem[];
  status: 'pending_review' | 'prescribed' | 'fulfilled';
  prescribedAt: string;
  licenseNumber?: string;
}

export interface ProactiveVitalsAlert {
  id: string;
  metric: 'blood_pressure' | 'heart_rate' | 'blood_sugar' | 'weight' | 'temperature';
  metricLabel: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  currentValue: string;
  safeRange: string;
  message: string;
  clinicalSuggestion: string;
  trendDescription?: string;
  timestamp: string;
  status: 'active' | 'escalated_to_doctor' | 'dismissed' | 'reviewed';
  doctorReviewId?: string;
}

export interface DoctorNotification {
  id: string;
  type: 'patient_login' | 'symptom_submitted' | 'urgent_triage' | 'vitals_alert';
  title: string;
  message: string;
  patientId: string;
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  timestamp: string;
  read: boolean;
  caseId?: string;
  symptoms?: string[];
  urgency?: 'Low' | 'Medium' | 'High' | 'Emergency';
  vitalsAlert?: ProactiveVitalsAlert;
}

export type TriageUrgencyLevel = 'Routine' | 'Urgent' | 'Emergency';

export interface TriagePriorityAssessment {
  urgencyLevel: TriageUrgencyLevel;
  esiScore: number; // 1 to 5 (Emergency Severity Index)
  priorityLabel: string;
  badgeColor: 'emerald' | 'amber' | 'rose' | 'red';
  chiefRiskFactor: string;
  clinicalRationale: string;
  recommendedCareSetting: string;
  timeframeToCare: string;
  vitalSignsImpact: {
    status: 'Normal' | 'Borderline' | 'Abnormal' | 'Critical';
    details: string;
  };
  redFlagsIdentified: string[];
  suggestedActionDirectives: string[];
  evaluatedAt: string;
  source?: 'gemini' | 'clinical_rule_engine';
}

export interface PredictionResult {
  id: string;
  timestamp: string;
  patientId?: string;
  patientName?: string;
  patientAge?: number;
  patientGender?: string;
  inputSymptoms: {
    symptomId: string;
    severity: 'Mild' | 'Moderate' | 'Severe';
    durationDays: number;
  }[];
  modelUsed: 'Random Forest' | 'Decision Tree' | 'Naive Bayes' | 'K-Nearest Neighbors' | 'Ensemble Weighted';
  predictedDisease: Disease;
  confidence: number; // 0 to 100%
  differentialDiagnoses: {
    disease: Disease;
    probability: number;
    matchingSymptoms: string[];
  }[];
  recommendedMedicines: {
    medicine: Medicine;
    role: 'Primary' | 'Secondary' | 'Supportive';
    dosage: string;
    duration: string;
    notes: string;
    safetyWarnings: string[];
  }[];
  redFlagWarnings: string[];
  specialistRecommendation: string;
  dietAndLifestyle: {
    precautions: string[];
    diet: string[];
    lifestyle: string[];
  };
  doctorOrder?: DoctorConsultationOrder;
  safetyAudit?: MedicationSafetyReport;
  triageAssessment?: TriagePriorityAssessment;
}

export interface AllergyConflict {
  medicineId: string;
  medicineName: string;
  allergy: string;
  severity: 'Critical' | 'Severe' | 'Moderate';
  mechanism: string;
  recommendedAlternative: string;
}

export interface MedicationInteractionConflict {
  recommendedMedicine: string;
  currentMedicine: string;
  severity: 'Severe' | 'Moderate' | 'Mild';
  clinicalEffect: string;
  mechanism: string;
  recommendation: string;
}

export interface DuplicateTherapyConflict {
  medicine: string;
  currentMedicine: string;
  therapeuticClass: string;
  warning: string;
}

export interface OrganCaution {
  medicineName: string;
  condition: string;
  severity: 'High' | 'Moderate';
  recommendation: string;
}

export interface MedicationSafetyReport {
  hasConflicts: boolean;
  hasCriticalAllergy: boolean;
  hasSevereInteraction: boolean;
  allergyConflicts: AllergyConflict[];
  interactionConflicts: MedicationInteractionConflict[];
  duplicateConflicts: DuplicateTherapyConflict[];
  organCautions: OrganCaution[];
  totalWarningsCount: number;
  summaryText: string;
  timestamp: string;
}

export interface ExtractedPrescriptionMedication {
  medicineName: string;
  matchedMedicine?: Medicine;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  timing: string;
  confidence: number;
  potentialInteractions?: string[];
}

export interface PrescriptionScanResult {
  id: string;
  timestamp: string;
  imageUrl?: string;
  doctorName?: string;
  clinicName?: string;
  patientName?: string;
  date?: string;
  diagnosisNotes?: string;
  medications: ExtractedPrescriptionMedication[];
  rawText: string;
  warnings: string[];
}

export interface MLModelMetrics {
  name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number;
  trainingTimeSec: number;
  description: string;
  pros: string[];
  cons: string[];
  hyperparameters: Record<string, string | number>;
  confusionMatrix: number[][]; // 5x5 key sample matrix
  matrixLabels: string[];
  architecture?: string;
  badge?: string;
  role?: string;
  isChampion?: boolean;
}

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
  createdAt: string;
  profile: PatientProfile;
}

export interface HealthMetric {
  id: string;
  date: string;
  bloodPressureSys: number;
  bloodPressureDia: number;
  bloodSugar: number; // mg/dL
  heartRate: number; // bpm
  temperature: number; // °F
  weight: number; // kg
  notes?: string;
}

export interface ScheduledTimeSlot {
  time: string; // HH:mm (24-hour, e.g. "08:00")
  label?: string; // e.g. "Morning", "Afternoon", "Night"
}

export interface MedicationScheduleItem {
  id: string;
  medicineId: string;
  medicineName: string;
  dosage: string;
  times: string[]; // HH:mm format, e.g. ["08:00", "14:00", "20:00"]
  timing: 'Before meals' | 'After meals' | 'With food' | 'Anytime' | string;
  instructions: string;
  active: boolean;
  color?: string; // tailwind color token or hex
  prescribedBy?: string;
}

export interface DoseLog {
  id: string;
  scheduleId: string;
  medicineName: string;
  scheduledTime: string; // "08:00"
  takenAt: string; // ISO string
  date: string; // "YYYY-MM-DD"
  status: 'taken' | 'skipped' | 'snoozed';
}

export interface DueDoseAlert {
  id: string;
  item: MedicationScheduleItem;
  scheduledTime: string;
  formattedTime: string;
  triggeredAt: Date;
  isTest?: boolean;
}

export interface TreatmentPlanRecommendedMed {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  rationale: string;
  category?: string;
}

export interface ClinicalProtocolItem {
  protocolName: string;
  guideline: string;
  recommendedActions: string[];
}

export interface SuggestedTreatmentPlan {
  summary: string;
  hemodynamicAssessment: string;
  primaryClinicalProtocols: ClinicalProtocolItem[];
  recommendedMedications: TreatmentPlanRecommendedMed[];
  nonPharmacologicalInterventions: string[];
  redFlagWarnings: string[];
  followUpTimeline: string;
  generatedAt: string;
  modelUsed?: string;
  symptomImageUrl?: string;
}

// ==========================================
// Professional-Grade Clinical Dataset Schemas
// ==========================================

export interface NormalizedMedicationItem {
  drugName: string;
  dosage: string;
  frequency?: string;
  timing?: string;
  instructions?: string;
  type?: 'Primary' | 'Secondary' | 'Supportive';
}

export interface ClinicalDiseaseRecord extends Disease {
  rawName: string;
  officialName: string;
  snomedCt: string;
  urgencyLevel: 'Low' | 'Medium' | 'High' | 'Emergency';
  dataQualityScore: number;
  lastNormalizedAt: string;
  sourceDataset: string;
  normalizedMedicationsList: NormalizedMedicationItem[];
}

export interface ClinicalSymptomRecord extends Symptom {
  standardKey: string;
  anatomicalCategory?: string;
  clinicalWeight: number; // 1 to 7 from Kaggle
  severityLevel: 'Mild' | 'Moderate' | 'Severe' | 'Critical';
  icd10Reference: string;
}

export interface ClinicalDatasetSyncStats {
  version: string;
  totalDiseases: number;
  totalSymptoms: number;
  totalPrecautions: number;
  totalMedications: number;
  lastSyncTimestamp: string;
  syncStatus: 'synced' | 'pending' | 'custom' | 'error';
  integrityCheck: boolean;
  sourceUrl: string;
  recordsImported: number;
}

// ==========================================
// Lab Report Analysis & Biometric Schemas
// ==========================================

export interface LabTestItem {
  id: string;
  testName: string;
  category: string;
  value: string;
  numericValue?: number;
  unit: string;
  referenceRange: string;
  status: 'Normal' | 'High' | 'Low' | 'Critical High' | 'Critical Low' | 'Abnormal';
  clinicalSignificance?: string;
}

export interface LabAnomaly {
  testName: string;
  observedValue: string;
  referenceRange: string;
  severity: 'mild' | 'moderate' | 'critical';
  anomalyDescription: string;
  profileCorrelation: string;
}

export interface LabReportAnalysisResult {
  id: string;
  reportTitle: string;
  reportDate: string;
  laboratoryName?: string;
  panelType: string;
  rawText: string;
  tests: LabTestItem[];
  anomalies: LabAnomaly[];
  summaryAgainstProfile: string;
  clinicalRecommendations: string[];
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  doctorReviewRecommended: boolean;
  analyzedAt: string;
  modelUsed: string;
}

