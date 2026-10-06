import {
  ClinicalDatasetSyncStats,
  ClinicalDiseaseRecord,
  ClinicalSymptomRecord,
  DoctorNotification,
  DoseLog,
  HealthMetric,
  LabReportAnalysisResult,
  MedicationScheduleItem,
  PatientProfile,
  PredictionResult,
  PrescriptionScanResult,
  ProactiveVitalsAlert,
  UserRecord
} from '../types';

const STORAGE_KEYS = {
  PREDICTIONS: 'medassist_predictions_v1',
  PRESCRIPTIONS: 'medassist_prescriptions_v1',
  VITALS: 'medassist_vitals_v1',
  USER: 'medassist_current_user_v1',
  ACTIVE_MEDICATIONS: 'medassist_active_meds_v1',
  MEDICATION_SCHEDULE: 'medassist_medication_schedule_v1',
  DOSE_LOGS: 'medassist_dose_logs_v1',
  NOTIFICATION_SETTINGS: 'medassist_notification_settings_v1',
  CLINICAL_DISEASES: 'medassist_clinical_diseases_v1',
  CLINICAL_SYMPTOMS: 'medassist_clinical_symptoms_v1',
  CLINICAL_SYNC_STATS: 'medassist_clinical_sync_stats_v1',
  DOCTOR_NOTIFICATIONS: 'medassist_doctor_notifications_v1',
  LAB_REPORTS: 'medassist_lab_reports_v1'
};

const DEFAULT_SCHEDULE: MedicationScheduleItem[] = [
  {
    id: 'sched-amox',
    medicineId: 'amoxicillin',
    medicineName: 'Amoxicillin',
    dosage: '500mg (1 Capsule)',
    times: ['08:00', '14:00', '20:00'],
    timing: 'After meals',
    instructions: 'Take with a full glass of water. Complete complete 7-day course.',
    active: true,
    color: 'teal',
    prescribedBy: 'Dr. Sarah Mitchell, MD'
  },
  {
    id: 'sched-para',
    medicineId: 'paracetamol',
    medicineName: 'Paracetamol',
    dosage: '650mg (1 Tablet)',
    times: ['09:00', '21:00'],
    timing: 'After meals',
    instructions: 'Take for pain or fever relief. Do not exceed 4000mg in 24 hours.',
    active: true,
    color: 'emerald',
    prescribedBy: 'Dr. Sarah Mitchell, MD'
  },
  {
    id: 'sched-cetirizine',
    medicineId: 'cetirizine',
    medicineName: 'Cetirizine',
    dosage: '10mg (1 Tablet)',
    times: ['21:30'],
    timing: 'At bedtime',
    instructions: 'Take at night for allergic rhinitis/urticaria symptoms.',
    active: true,
    color: 'sky',
    prescribedBy: 'General Clinic'
  }
];

const DEFAULT_PROFILE: PatientProfile = {
  name: 'Alex Johnson',
  age: 38,
  gender: 'male',
  weightKg: 72,
  heightCm: 175,
  isPregnant: false,
  hasRenalDisease: false,
  hasHepaticDisease: false,
  knownAllergies: ['Penicillin'],
  currentMedications: ['paracetamol']
};

export const StorageService = {
  getCurrentUser(): UserRecord {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    const defaultUser: UserRecord = {
      id: 'usr_default',
      name: 'Alex Johnson',
      email: 'alex.johnson@health.org',
      role: 'patient',
      createdAt: '2026-01-15T09:00:00Z',
      profile: DEFAULT_PROFILE
    };
    this.saveCurrentUser(defaultUser);
    return defaultUser;
  },

  saveCurrentUser(user: UserRecord): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save user', e);
    }
  },

  getPredictions(): PredictionResult[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PREDICTIONS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    const initialCases = this.getInitialPatientCases();
    this.saveAllPredictions(initialCases);
    return initialCases;
  },

  getInitialPatientCases(): PredictionResult[] {
    return [
      {
        id: 'pred-case-alex-001',
        timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        patientId: 'patient-alex-1',
        patientName: 'Alex Johnson',
        patientAge: 38,
        patientGender: 'Male',
        inputSymptoms: [
          { symptomId: 'fever', severity: 'Severe', durationDays: 3 },
          { symptomId: 'chills', severity: 'Moderate', durationDays: 2 },
          { symptomId: 'sweating', severity: 'Mild', durationDays: 2 },
          { symptomId: 'headache', severity: 'Moderate', durationDays: 3 }
        ],
        modelUsed: 'Random Forest',
        predictedDisease: {
          id: 'malaria',
          name: 'Malaria',
          icd10: 'B50 - B54',
          category: 'Infectious & Parasitic Diseases',
          specialist: 'Infectious Disease Specialist / General Physician',
          urgency: 'High',
          description: 'A life-threatening mosquito-borne infectious disease caused by Plasmodium parasites, characterized by cyclical high-grade paroxysms of fever, chills, and sweating.',
          primarySymptoms: ['fever', 'chills', 'sweating', 'headache', 'fatigue'],
          secondarySymptoms: ['nausea', 'vomiting', 'muscle_aches', 'loss_of_appetite', 'pale_skin'],
          recommendedMedicines: [
            { medicineId: 'artemether_lumefantrine', type: 'Primary', dosage: '4 tablets initially, then at 8, 24, 36, 48, and 60 hours', duration: '3 Days', instructions: 'Take with fatty foods or milk to enhance drug absorption.' },
            { medicineId: 'paracetamol', type: 'Supportive', dosage: '650mg every 6 hours PRN', duration: '3-5 Days', instructions: 'For controlling high fever spikes and headache.' }
          ],
          precautions: ['Sleep under insecticide-treated bed nets', 'Undergo thin/thick blood smear', 'Stay well hydrated'],
          dietaryAdvice: ['Drink coconut water, clear broths', 'High calorie easily digestible meals'],
          lifestyleAdvice: ['Strict bed rest', 'Keep room well ventilated'],
          emergencySigns: ['Altered consciousness', 'Extreme respiratory distress', 'Persistent vomiting']
        },
        confidence: 96.8,
        differentialDiagnoses: [
          {
            disease: {
              id: 'dengue',
              name: 'Dengue Fever',
              icd10: 'A90',
              category: 'Arboviral Infections',
              specialist: 'Infectious Disease Specialist',
              urgency: 'High',
              description: 'Mosquito-borne viral disease presenting with sudden high fever, retro-orbital pain, and severe myalgia.',
              primarySymptoms: ['fever', 'headache', 'joint_pain', 'muscle_aches', 'rash'],
              secondarySymptoms: ['nausea', 'vomiting', 'fatigue', 'swollen_glands'],
              recommendedMedicines: [],
              precautions: [],
              dietaryAdvice: [],
              lifestyleAdvice: [],
              emergencySigns: []
            },
            probability: 18.4,
            matchingSymptoms: ['fever', 'headache']
          }
        ],
        recommendedMedicines: [],
        redFlagWarnings: ['High fever > 103°F (39.4°C) with persistent rigors requires immediate blood smear test.'],
        specialistRecommendation: 'Infectious Disease Specialist / General Physician',
        dietAndLifestyle: {
          precautions: ['Sleep under insecticide-treated bed nets', 'Avoid standing water nearby'],
          diet: ['Frequent oral rehydration fluids', 'Light nutritious soups'],
          lifestyle: ['Complete bed rest until afebrile for 48 hours']
        },
        doctorOrder: undefined // Pending doctor review & prescription!
      },
      {
        id: 'pred-case-elena-002',
        timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
        patientId: 'patient-elena-2',
        patientName: 'Elena Rostova',
        patientAge: 29,
        patientGender: 'Female',
        inputSymptoms: [
          { symptomId: 'fever', severity: 'Severe', durationDays: 4 },
          { symptomId: 'abdominal_pain', severity: 'Moderate', durationDays: 3 },
          { symptomId: 'fatigue', severity: 'Moderate', durationDays: 4 },
          { symptomId: 'loss_of_appetite', severity: 'Moderate', durationDays: 3 }
        ],
        modelUsed: 'Ensemble Weighted',
        predictedDisease: {
          id: 'typhoid',
          name: 'Typhoid Fever (Enteric Fever)',
          icd10: 'A01.0',
          category: 'Infectious Diseases',
          specialist: 'Infectious Disease Specialist / Gastroenterologist',
          urgency: 'High',
          description: 'Systemic bacterial infection caused by Salmonella enterica serotype Typhi, transmitted via contaminated food or water.',
          primarySymptoms: ['fever', 'headache', 'abdominal_pain', 'fatigue', 'loss_of_appetite'],
          secondarySymptoms: ['constipation', 'diarrhea', 'weakness'],
          recommendedMedicines: [],
          precautions: [],
          dietaryAdvice: [],
          lifestyleAdvice: [],
          emergencySigns: []
        },
        confidence: 94.5,
        differentialDiagnoses: [],
        recommendedMedicines: [],
        redFlagWarnings: ['Prolonged step-ladder fever pattern with severe abdominal tenderness.'],
        specialistRecommendation: 'Infectious Disease Specialist / Gastroenterologist',
        dietAndLifestyle: {
          precautions: ['Strict water sanitation', 'Hand hygiene'],
          diet: ['Boiled water only', 'Bland soft foods'],
          lifestyle: ['Rest and isolation from food prep']
        },
        doctorOrder: undefined // Pending doctor prescription!
      },
      {
        id: 'pred-case-marcus-003',
        timestamp: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
        patientId: 'patient-marcus-3',
        patientName: 'Marcus Vance',
        patientAge: 52,
        patientGender: 'Male',
        inputSymptoms: [
          { symptomId: 'heartburn', severity: 'Severe', durationDays: 7 },
          { symptomId: 'chest_pain', severity: 'Mild', durationDays: 3 },
          { symptomId: 'nausea', severity: 'Mild', durationDays: 2 }
        ],
        modelUsed: 'Random Forest',
        predictedDisease: {
          id: 'gerd',
          name: 'Gastroesophageal Reflux Disease (GERD)',
          icd10: 'K21.9',
          category: 'Gastroenterology',
          specialist: 'Gastroenterologist',
          urgency: 'Medium',
          description: 'Chronic mucosal damage caused by stomach acid persistently rising into the esophagus.',
          primarySymptoms: ['heartburn', 'chest_pain', 'nausea'],
          secondarySymptoms: ['cough', 'hoarseness'],
          recommendedMedicines: [],
          precautions: [],
          dietaryAdvice: [],
          lifestyleAdvice: [],
          emergencySigns: []
        },
        confidence: 97.2,
        differentialDiagnoses: [],
        recommendedMedicines: [],
        redFlagWarnings: [],
        specialistRecommendation: 'Gastroenterologist',
        dietAndLifestyle: {
          precautions: ['Do not lie down within 3 hours after meals'],
          diet: ['Avoid acidic citrus, coffee, and fried foods'],
          lifestyle: ['Elevate head of bed 15-20cm']
        },
        doctorOrder: {
          id: 'rx-order-marcus-991',
          doctorId: 'doc-sarah-mitchell',
          doctorName: 'Dr. Sarah Mitchell, MD',
          doctorSpecialty: 'Internal Medicine & Gastroenterology',
          clinicalNotes: 'Typical reflux presentation without dysphagia or gastrointestinal bleeding. Initiated first-line proton pump inhibitor therapy. Review in 14 days.',
          prescribedMedicines: [
            {
              id: 'item-1',
              medicineId: 'omeprazole',
              medicineName: 'Omeprazole 20mg Delayed-Release Capsule',
              genericName: 'Omeprazole',
              dosage: '20mg (1 capsule)',
              frequency: 'Once Daily (QD) before breakfast',
              duration: '14 Days',
              instructions: 'Swallow whole with water 30-60 minutes before morning breakfast.'
            }
          ],
          status: 'prescribed',
          prescribedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
          licenseNumber: 'MD-88492'
        }
      }
    ];
  },

  savePrediction(prediction: PredictionResult): void {
    const list = this.getPredictions();
    list.unshift(prediction);
    try {
      localStorage.setItem(STORAGE_KEYS.PREDICTIONS, JSON.stringify(list.slice(0, 50)));
    } catch (e) {
      console.error('Failed to save prediction', e);
    }
  },

  updatePrediction(prediction: PredictionResult): void {
    const list = this.getPredictions();
    const idx = list.findIndex(p => p.id === prediction.id);
    if (idx >= 0) {
      list[idx] = prediction;
    } else {
      list.unshift(prediction);
    }
    try {
      localStorage.setItem(STORAGE_KEYS.PREDICTIONS, JSON.stringify(list));
    } catch (e) {
      console.error('Failed to update prediction', e);
    }
  },

  saveAllPredictions(predictions: PredictionResult[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PREDICTIONS, JSON.stringify(predictions));
    } catch (e) {
      console.error('Failed to save all predictions', e);
    }
  },

  getPrescriptions(): PrescriptionScanResult[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRESCRIPTIONS);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    return [];
  },

  savePrescription(scan: PrescriptionScanResult): void {
    const list = this.getPrescriptions();
    list.unshift(scan);
    try {
      localStorage.setItem(STORAGE_KEYS.PRESCRIPTIONS, JSON.stringify(list.slice(0, 30)));
    } catch (e) {
      console.error('Failed to save prescription', e);
    }
  },

  getVitals(): HealthMetric[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.VITALS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length >= 6) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    // Default initial clinical progress history (8 data points tracking longitudinal improvement)
    const initialVitals: HealthMetric[] = [
      { id: 'v1', date: '2026-09-12', bloodPressureSys: 136, bloodPressureDia: 88, bloodSugar: 108, heartRate: 84, temperature: 98.8, weight: 73.8, notes: 'Baseline intake evaluation' },
      { id: 'v2', date: '2026-09-14', bloodPressureSys: 132, bloodPressureDia: 86, bloodSugar: 104, heartRate: 80, temperature: 98.6, weight: 73.4, notes: 'Started low-sodium regimen' },
      { id: 'v3', date: '2026-09-16', bloodPressureSys: 128, bloodPressureDia: 84, bloodSugar: 99, heartRate: 78, temperature: 98.5, weight: 73.0, notes: 'Morning check after 30min walk' },
      { id: 'v4', date: '2026-09-18', bloodPressureSys: 125, bloodPressureDia: 82, bloodSugar: 97, heartRate: 76, temperature: 98.4, weight: 72.5, notes: 'Blood pressure stabilizing' },
      { id: 'v5', date: '2026-09-20', bloodPressureSys: 124, bloodPressureDia: 80, bloodSugar: 96, heartRate: 74, temperature: 98.4, weight: 72.2, notes: 'Prescription adherence regular' },
      { id: 'v6', date: '2026-09-22', bloodPressureSys: 121, bloodPressureDia: 79, bloodSugar: 94, heartRate: 72, temperature: 98.3, weight: 71.8, notes: 'Target range approached' },
      { id: 'v7', date: '2026-09-24', bloodPressureSys: 119, bloodPressureDia: 78, bloodSugar: 93, heartRate: 70, temperature: 98.2, weight: 71.6, notes: 'Optimal resting sinus rhythm' },
      { id: 'v8', date: '2026-09-26', bloodPressureSys: 120, bloodPressureDia: 78, bloodSugar: 92, heartRate: 71, temperature: 98.4, weight: 71.4, notes: 'Current check-in: JNC-8 target achieved' }
    ];
    this.saveVitals(initialVitals);
    return initialVitals;
  },

  saveVitals(vitals: HealthMetric[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.VITALS, JSON.stringify(vitals));
      window.dispatchEvent(new CustomEvent('medassist:vitals-updated', { detail: vitals }));
    } catch (e) {
      console.error('Failed to save vitals', e);
    }
  },

  addVital(vital: HealthMetric): void {
    const list = this.getVitals();
    list.push(vital);
    this.saveVitals(list);
  },

  getActiveMedications(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_MEDICATIONS);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    return ['paracetamol', 'cetirizine'];
  },

  saveActiveMedications(meds: string[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_MEDICATIONS, JSON.stringify(meds));
    } catch (e) {
      console.error('Failed to save active medications', e);
    }
  },

  // Convenience aliases for flexible call styles
  getUserProfile(): UserRecord {
    return this.getCurrentUser();
  },
  saveUserProfile(user: UserRecord): void {
    this.saveCurrentUser(user);
  },
  getHealthMetrics(): HealthMetric[] {
    return this.getVitals();
  },
  saveHealthMetric(metric: HealthMetric): void {
    this.addVital(metric);
  },

  // Lab Reports
  getLabReports(): LabReportAnalysisResult[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LAB_REPORTS);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    return [];
  },

  saveLabReport(report: LabReportAnalysisResult): void {
    const list = this.getLabReports();
    const existingIdx = list.findIndex(r => r.id === report.id);
    if (existingIdx >= 0) {
      list[existingIdx] = report;
    } else {
      list.unshift(report);
    }
    try {
      localStorage.setItem(STORAGE_KEYS.LAB_REPORTS, JSON.stringify(list.slice(0, 30)));
      window.dispatchEvent(new CustomEvent('medassist:lab-reports-updated', { detail: report }));
    } catch (e) {
      console.error('Failed to save lab report', e);
    }
  },

  deleteLabReport(reportId: string): void {
    const list = this.getLabReports().filter(r => r.id !== reportId);
    try {
      localStorage.setItem(STORAGE_KEYS.LAB_REPORTS, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('medassist:lab-reports-updated'));
    } catch (e) {
      console.error('Failed to delete lab report', e);
    }
  },

  // Medication Schedule
  getMedicationSchedule(): MedicationScheduleItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEDICATION_SCHEDULE);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    this.saveMedicationSchedule(DEFAULT_SCHEDULE);
    return DEFAULT_SCHEDULE;
  },

  saveMedicationSchedule(items: MedicationScheduleItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.MEDICATION_SCHEDULE, JSON.stringify(items));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('medassist:schedule-updated', { detail: items }));
      }
    } catch (e) {
      console.error('Failed to save medication schedule', e);
    }
  },

  addOrUpdateScheduleItem(item: MedicationScheduleItem): void {
    const list = this.getMedicationSchedule();
    const existingIndex = list.findIndex(i => i.id === item.id || i.medicineName.toLowerCase() === item.medicineName.toLowerCase());
    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...item };
    } else {
      list.push(item);
    }
    this.saveMedicationSchedule(list);
  },

  deleteScheduleItem(id: string): void {
    const list = this.getMedicationSchedule();
    const filtered = list.filter(i => i.id !== id);
    this.saveMedicationSchedule(filtered);
  },

  // Dose Compliance Logs
  getDoseLogs(): DoseLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DOSE_LOGS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    // Generate realistic initial adherence logs for the last 14 days
    const schedule = this.getMedicationSchedule();
    const seeded = this.generateInitialLogs(schedule);
    this.saveDoseLogs(seeded);
    return seeded;
  },

  generateInitialLogs(schedule: MedicationScheduleItem[]): DoseLog[] {
    const logs: DoseLog[] = [];
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDate = now.getDate();

    // Past 14 days
    for (let day = Math.max(1, currentDate - 14); day < currentDate; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      schedule.filter(s => s.active).forEach(item => {
        item.times.forEach(t => {
          // 92% realistic adherence (skip only one night slot every ~7 days)
          const isMissed = day % 7 === 0 && t === '20:00';
          if (!isMissed) {
            logs.push({
              id: `seed-log-${day}-${item.id}-${t.replace(':', '')}`,
              scheduleId: item.id,
              medicineName: item.medicineName,
              scheduledTime: t,
              takenAt: `${dateStr}T${t}:00.000Z`,
              date: dateStr,
              status: 'taken'
            });
          }
        });
      });
    }

    // Today: morning doses taken
    const todayStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(currentDate).padStart(2, '0')}`;
    schedule.filter(s => s.active).forEach(item => {
      item.times.forEach(t => {
        const [h] = t.split(':').map(Number);
        if (h <= 9) {
          logs.push({
            id: `seed-log-today-${item.id}-${t.replace(':', '')}`,
            scheduleId: item.id,
            medicineName: item.medicineName,
            scheduledTime: t,
            takenAt: `${todayStr}T${t}:10.000Z`,
            date: todayStr,
            status: 'taken'
          });
        }
      });
    });

    return logs;
  },

  saveDoseLogs(logs: DoseLog[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.DOSE_LOGS, JSON.stringify(logs));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('medassist:dose-updated', { detail: logs }));
      }
    } catch (e) {
      console.error('Failed to save dose logs', e);
    }
  },

  logDoseTaken(scheduleId: string, medicineName: string, scheduledTime: string, targetDate?: string): DoseLog {
    const logs = this.getDoseLogs();
    const target = targetDate || new Date().toISOString().split('T')[0];

    // Check if already logged for this time on target date
    const existingIndex = logs.findIndex(
      l => l.scheduleId === scheduleId && l.scheduledTime === scheduledTime && l.date === target
    );

    const newLog: DoseLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      scheduleId,
      medicineName,
      scheduledTime,
      takenAt: new Date().toISOString(),
      date: target,
      status: 'taken'
    };

    if (existingIndex >= 0) {
      logs[existingIndex] = newLog;
    } else {
      logs.push(newLog);
    }

    this.saveDoseLogs(logs);
    return newLog;
  },

  toggleDose(
    scheduleId: string,
    medicineName: string,
    scheduledTime: string,
    date: string
  ): { taken: boolean; log?: DoseLog } {
    const logs = this.getDoseLogs();
    const existingIndex = logs.findIndex(
      l => l.scheduleId === scheduleId && l.scheduledTime === scheduledTime && l.date === date
    );

    if (existingIndex >= 0 && logs[existingIndex].status === 'taken') {
      // Toggle off -> remove log
      const updated = logs.filter((_, idx) => idx !== existingIndex);
      this.saveDoseLogs(updated);
      return { taken: false };
    } else {
      // Toggle on -> create taken log
      const newLog: DoseLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        scheduleId,
        medicineName,
        scheduledTime,
        takenAt: new Date().toISOString(),
        date,
        status: 'taken'
      };
      const updated = existingIndex >= 0
        ? logs.map((l, i) => i === existingIndex ? newLog : l)
        : [...logs, newLog];
      this.saveDoseLogs(updated);
      return { taken: true, log: newLog };
    }
  },

  isDoseTakenOnDate(scheduleId: string, scheduledTime: string, date: string): boolean {
    const logs = this.getDoseLogs();
    return logs.some(
      l => l.scheduleId === scheduleId && l.scheduledTime === scheduledTime && l.date === date && l.status === 'taken'
    );
  },

  isDoseTakenToday(scheduleId: string, scheduledTime: string): boolean {
    const today = new Date().toISOString().split('T')[0];
    const logs = this.getDoseLogs();
    return logs.some(
      l => l.scheduleId === scheduleId && l.scheduledTime === scheduledTime && l.date === today && l.status === 'taken'
    );
  },

  getTodayDoseLogs(): DoseLog[] {
    const today = new Date().toISOString().split('T')[0];
    return this.getDoseLogs().filter(l => l.date === today);
  },

  // Notification Preferences
  getNotificationPreferences(): { browserEnabled: boolean; soundEnabled: boolean } {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATION_SETTINGS);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    return { browserEnabled: true, soundEnabled: true };
  },

  saveNotificationPreferences(prefs: { browserEnabled: boolean; soundEnabled: boolean }): void {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATION_SETTINGS, JSON.stringify(prefs));
    } catch (e) {
      console.error('Failed to save notification preferences', e);
    }
  },

  // ==========================================
  // Clinical Datasets Local Database Storage
  // ==========================================

  getClinicalDiseases(): ClinicalDiseaseRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CLINICAL_DISEASES);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to read clinical diseases from storage', e);
    }
    return [];
  },

  saveClinicalDiseases(diseases: ClinicalDiseaseRecord[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CLINICAL_DISEASES, JSON.stringify(diseases));
      window.dispatchEvent(new CustomEvent('medassist:clinical-diseases-updated', { detail: { count: diseases.length } }));
    } catch (e) {
      console.error('Failed to save clinical diseases', e);
    }
  },

  getClinicalSymptoms(): ClinicalSymptomRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CLINICAL_SYMPTOMS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to read clinical symptoms from storage', e);
    }
    return [];
  },

  saveClinicalSymptoms(symptoms: ClinicalSymptomRecord[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CLINICAL_SYMPTOMS, JSON.stringify(symptoms));
      window.dispatchEvent(new CustomEvent('medassist:clinical-symptoms-updated', { detail: { count: symptoms.length } }));
    } catch (e) {
      console.error('Failed to save clinical symptoms', e);
    }
  },

  getClinicalSyncStats(): ClinicalDatasetSyncStats | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CLINICAL_SYNC_STATS);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    return null;
  },

  saveClinicalSyncStats(stats: ClinicalDatasetSyncStats): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CLINICAL_SYNC_STATS, JSON.stringify(stats));
      window.dispatchEvent(new CustomEvent('medassist:clinical-sync-updated', { detail: stats }));
    } catch (e) {
      console.error('Failed to save clinical sync stats', e);
    }
  },

  exportClinicalDatabase(): {
    diseases: ClinicalDiseaseRecord[];
    symptoms: ClinicalSymptomRecord[];
    stats: ClinicalDatasetSyncStats | null;
    exportedAt: string;
  } {
    return {
      diseases: this.getClinicalDiseases(),
      symptoms: this.getClinicalSymptoms(),
      stats: this.getClinicalSyncStats(),
      exportedAt: new Date().toISOString()
    };
  },

  // ==========================================
  // Direct Doctor Notifications for Patient Login & Activity
  // ==========================================

  getDoctorNotifications(): DoctorNotification[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DOCTOR_NOTIFICATIONS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }

    // Default seeded notifications so Doctor sees realistic live triage arrivals
    const initialNotifications: DoctorNotification[] = [
      {
        id: 'notif-login-alex-001',
        type: 'patient_login',
        title: 'Patient Online & Logged In',
        message: 'Alex Johnson (38yo Male) logged into the patient portal and initiated consultation triage.',
        patientId: 'patient-alex-1',
        patientName: 'Alex Johnson',
        patientAge: 38,
        patientGender: 'Male',
        timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(), // 12 mins ago
        read: false,
        caseId: 'pred-case-alex-001',
        symptoms: ['Fever', 'Chills', 'Sweating', 'Headache'],
        urgency: 'High'
      },
      {
        id: 'notif-login-emily-002',
        type: 'patient_login',
        title: 'Patient Online & Logged In',
        message: 'Emily Davis (45yo Female) signed into patient workstation. Chronic hypertension follow-up.',
        patientId: 'patient-emily-2',
        patientName: 'Emily Davis',
        patientAge: 45,
        patientGender: 'Female',
        timestamp: new Date(Date.now() - 48 * 60 * 1000).toISOString(),
        read: true,
        caseId: 'pred-case-emily-002',
        symptoms: ['Chest Tightness', 'Headache', 'Dizziness'],
        urgency: 'Medium'
      }
    ];

    this.saveAllDoctorNotifications(initialNotifications);
    return initialNotifications;
  },

  saveAllDoctorNotifications(notifications: DoctorNotification[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.DOCTOR_NOTIFICATIONS, JSON.stringify(notifications));
    } catch (e) {
      console.error('Failed to save doctor notifications', e);
    }
  },

  notifyDoctorOfPatientLogin(patient: UserRecord): DoctorNotification {
    const notifications = this.getDoctorNotifications();
    const newNotification: DoctorNotification = {
      id: `notif-login-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type: 'patient_login',
      title: '🟢 Patient Logged In Direct Alert',
      message: `Patient ${patient.name} (${patient.profile.age}yo, ${patient.profile.gender}) just logged into MedAssist. Ready for physician consultation & Rx review.`,
      patientId: patient.id,
      patientName: patient.name,
      patientAge: patient.profile.age,
      patientGender: patient.profile.gender,
      timestamp: new Date().toISOString(),
      read: false,
      urgency: 'High'
    };

    const updated = [newNotification, ...notifications.slice(0, 49)];
    this.saveAllDoctorNotifications(updated);

    // Dispatch DOM event for instant reactive UI notification across all components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('medassist:doctor-notification', {
          detail: { notification: newNotification, allNotifications: updated }
        })
      );
    }

    return newNotification;
  },

  notifyDoctorOfPatientSymptomSubmission(pred: PredictionResult): DoctorNotification {
    const notifications = this.getDoctorNotifications();
    const newNotification: DoctorNotification = {
      id: `notif-symptom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type: 'symptom_submitted',
      title: `⚡ New Clinical Triage: ${pred.predictedDisease?.name || 'Symptom Case'}`,
      message: `Patient ${pred.patientName || 'Anonymous'} reported ${pred.inputSymptoms.length} symptoms with predicted ${pred.predictedDisease?.name || 'condition'}. Awaiting doctor authorization.`,
      patientId: pred.patientId || 'patient-current',
      patientName: pred.patientName || 'Current Patient',
      patientAge: pred.patientAge,
      patientGender: pred.patientGender,
      timestamp: new Date().toISOString(),
      read: false,
      caseId: pred.id,
      symptoms: pred.inputSymptoms.map(s => s.symptomId),
      urgency: pred.predictedDisease?.urgency || 'High'
    };

    const updated = [newNotification, ...notifications.slice(0, 49)];
    this.saveAllDoctorNotifications(updated);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('medassist:doctor-notification', {
          detail: { notification: newNotification, allNotifications: updated }
        })
      );
    }

    return newNotification;
  },

  notifyDoctorOfVitalsAlert(alert: ProactiveVitalsAlert, patient: UserRecord): DoctorNotification {
    const notifications = this.getDoctorNotifications();
    const newNotification: DoctorNotification = {
      id: `notif-vitals-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type: 'vitals_alert',
      title: `⚡ Proactive Vitals Alert: ${alert.title}`,
      message: `Patient ${patient.name} (${patient.profile.age}yo) flagged ${alert.metricLabel}: ${alert.currentValue} exceeding safe limit (${alert.safeRange}). Doctor review requested.`,
      patientId: patient.id,
      patientName: patient.name,
      patientAge: patient.profile.age,
      patientGender: patient.profile.gender,
      timestamp: new Date().toISOString(),
      read: false,
      urgency: alert.severity === 'critical' ? 'Emergency' : 'High',
      vitalsAlert: alert
    };

    const updated = [newNotification, ...notifications.slice(0, 49)];
    this.saveAllDoctorNotifications(updated);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('medassist:doctor-notification', {
          detail: { notification: newNotification, allNotifications: updated }
        })
      );
    }

    return newNotification;
  },

  markDoctorNotificationAsRead(id: string): void {
    const notifications = this.getDoctorNotifications();
    const updated = notifications.map(n => (n.id === id ? { ...n, read: true } : n));
    this.saveAllDoctorNotifications(updated);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('medassist:doctor-notification-updated', { detail: { allNotifications: updated } })
      );
    }
  },

  markAllDoctorNotificationsAsRead(): void {
    const notifications = this.getDoctorNotifications();
    const updated = notifications.map(n => ({ ...n, read: true }));
    this.saveAllDoctorNotifications(updated);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('medassist:doctor-notification-updated', { detail: { allNotifications: updated } })
      );
    }
  },

  clearDoctorNotifications(): void {
    this.saveAllDoctorNotifications([]);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('medassist:doctor-notification-updated', { detail: { allNotifications: [] } })
      );
    }
  }
};

export const storageService = StorageService;
