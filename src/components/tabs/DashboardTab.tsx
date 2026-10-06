import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  BarChart3,
  Bell,
  BellRing,
  Bot,
  BrainCircuit,
  Calendar,
  CheckCircle2,
  ChevronRight,
  FileText,
  Heart,
  HeartPulse,
  Pill,
  Scan,
  Shield,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  TrendingUp,
  User,
  Users,
  Video,
  Zap
} from 'lucide-react';
import { ActiveTab } from '../Navbar';
import {
  DoseLog,
  HealthMetric,
  MedicationScheduleItem,
  PredictionResult,
  PrescriptionScanResult,
  UserRecord,
  DueDoseAlert
} from '../../types';
import { MEDICINES_DATA } from '../../data/medicines';
import { storageService } from '../../services/storageService';
import { notificationService } from '../../services/notificationService';
import { MedicationScheduleCard } from '../dashboard/MedicationScheduleCard';
import { NextMedicationCard } from '../dashboard/NextMedicationCard';
import { MedicationCalendar } from '../dashboard/MedicationCalendar';
import { MedicationNotificationCenter } from '../dashboard/MedicationNotificationCenter';
import { WeeklyMedicationComplianceChart } from '../dashboard/WeeklyMedicationComplianceChart';
import { PatientHealthTrendChart } from '../dashboard/PatientHealthTrendChart';
import { ProactiveHealthAlertBanner } from '../dashboard/ProactiveHealthAlertBanner';
import { AiHealthInsightsCard } from '../dashboard/AiHealthInsightsCard';

interface DashboardTabProps {
  setActiveTab: (tab: ActiveTab) => void;
  currentUser: UserRecord;
  recentPredictions: PredictionResult[];
  recentPrescriptions: PrescriptionScanResult[];
  vitals: HealthMetric[];
  onQuickCheck: (symptoms: string[]) => void;
}

interface SnoozedQueueItem {
  alert: DueDoseAlert;
  wakeTimeMs: number;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  setActiveTab,
  currentUser,
  recentPredictions,
  recentPrescriptions,
  vitals,
  onQuickCheck
}) => {
  // Synchronized Vitals state
  const [localVitals, setLocalVitals] = useState<HealthMetric[]>(() => {
    const fromStorage = storageService.getVitals();
    return fromStorage && fromStorage.length >= vitals.length ? fromStorage : vitals;
  });

  // Medication Schedule & Notification State
  const [schedule, setSchedule] = useState<MedicationScheduleItem[]>(() => storageService.getMedicationSchedule());
  const [doseLogs, setDoseLogs] = useState<DoseLog[]>(() => storageService.getDoseLogs());
  const [activeAlerts, setActiveAlerts] = useState<DueDoseAlert[]>([]);
  const [snoozedQueue, setSnoozedQueue] = useState<SnoozedQueueItem[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return storageService.getNotificationPreferences().soundEnabled;
  });
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [medicationView, setMedicationView] = useState<'notifications' | 'compliance' | 'calendar' | 'schedule'>('notifications');

  // Track notified slots per date to avoid repeating alarms within the same minute
  const notifiedSlotsRef = useRef<Set<string>>(new Set());

  // Check initial notification permission on mount
  useEffect(() => {
    setNotificationPermission(notificationService.getPermissionStatus());
  }, []);

  // Synchronize state when dose logs or medication schedule change anywhere in the app
  useEffect(() => {
    const handleDoseUpdated = () => {
      setDoseLogs(storageService.getDoseLogs());
    };
    const handleScheduleUpdated = () => {
      setSchedule(storageService.getMedicationSchedule());
    };
    const handleVitalsUpdated = () => {
      setLocalVitals(storageService.getVitals());
    };

    window.addEventListener('medassist:dose-updated', handleDoseUpdated);
    window.addEventListener('medassist:schedule-updated', handleScheduleUpdated);
    window.addEventListener('medassist:vitals-updated', handleVitalsUpdated);

    return () => {
      window.removeEventListener('medassist:dose-updated', handleDoseUpdated);
      window.removeEventListener('medassist:schedule-updated', handleScheduleUpdated);
      window.removeEventListener('medassist:vitals-updated', handleVitalsUpdated);
    };
  }, []);

  const handleAddVital = (vital: HealthMetric) => {
    storageService.addVital(vital);
    setLocalVitals(storageService.getVitals());
  };

  // Request browser notification permission
  const handleRequestPermission = async () => {
    const perm = await notificationService.requestPermission();
    setNotificationPermission(perm);
    if (perm === 'granted') {
      notificationService.sendBrowserNotification('✅ MedAssist Notifications Enabled', {
        body: 'You will receive reminders when your scheduled medication doses are due.',
        playSound: soundEnabled
      });
    }
  };

  // Toggle sound chime
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    storageService.saveNotificationPreferences({
      browserEnabled: notificationPermission === 'granted',
      soundEnabled: next
    });
    if (next) {
      notificationService.playReminderChime();
    }
  };

  // Trigger immediate test reminder
  const handleTriggerTestReminder = async (item?: MedicationScheduleItem) => {
    const res = await notificationService.sendTestReminder(item?.medicineName || 'Amoxicillin 500mg');
    setNotificationPermission(res.permission as NotificationPermission);
  };

  // Mark dose as taken
  const handleMarkTaken = (alert: DueDoseAlert) => {
    storageService.logDoseTaken(alert.item.id, alert.item.medicineName, alert.scheduledTime);
    notificationService.clearAlertSlot(alert.item.id, alert.scheduledTime);
    setDoseLogs(storageService.getDoseLogs());

    if (soundEnabled) {
      notificationService.playSuccessChime();
    }

    setActiveAlerts(prev => prev.filter(a => a.id !== alert.id));
  };

  // Log dose directly from card
  const handleLogDoseDirect = (scheduleId: string, medicineName: string, scheduledTime: string) => {
    storageService.logDoseTaken(scheduleId, medicineName, scheduledTime);
    notificationService.clearAlertSlot(scheduleId, scheduledTime);
    setDoseLogs(storageService.getDoseLogs());

    if (soundEnabled) {
      notificationService.playSuccessChime();
    }

    setActiveAlerts(prev => prev.filter(a => !(a.item.id === scheduleId && a.scheduledTime === scheduledTime)));
  };

  // Snooze alert
  const handleSnooze = (alert: DueDoseAlert, minutes = 10) => {
    notificationService.snoozeAlert(alert, minutes);
    setActiveAlerts(prev => prev.filter(a => a.id !== alert.id));
  };

  // Dismiss alert
  const handleDismiss = (alert: DueDoseAlert) => {
    setActiveAlerts(prev => prev.filter(a => a.id !== alert.id));
  };

  // Update schedule list
  const handleUpdateSchedule = (newSchedule: MedicationScheduleItem[]) => {
    storageService.saveMedicationSchedule(newSchedule);
    setSchedule(newSchedule);
  };

  const latestVital = localVitals[localVitals.length - 1] || {
    bloodPressureSys: 120,
    bloodPressureDia: 80,
    bloodSugar: 95,
    heartRate: 72,
    temperature: 98.4,
    weight: 70
  };

  const quickSymptomOptions = [
    { label: 'High Fever & Chills', syms: ['fever', 'chills'] },
    { label: 'Cough & Shortness of Breath', syms: ['cough', 'shortness_of_breath'] },
    { label: 'Acid Reflux & Heartburn', syms: ['upper_abdominal_burning', 'bloating'] },
    { label: 'Throbbing Headache & Nausea', syms: ['throbbing_headache', 'nausea'] },
    { label: 'Diarrhea & Stomach Cramps', syms: ['diarrhea', 'abdominal_pain'] },
    { label: 'Joint Pain & Morning Stiffness', syms: ['joint_pain', 'morning_stiffness'] }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Welcome & Institutional Header */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 sm:p-8 shadow-sm border border-slate-800">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-32 -bottom-16 w-80 h-80 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl">
          {/* Clean Editorial Metadata Kicker */}
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-300 tracking-wide uppercase mb-3 flex-wrap">
            <span className="w-2 h-2 rounded-full bg-teal-400"></span>
            <span>Clinical Intelligence System</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-slate-300">
              Role: {currentUser.role === 'doctor' ? 'Doctor MD (Physician Workstation)' : currentUser.role === 'admin' ? 'System Administrator' : 'Patient (Alex Johnson)'}
            </span>
            {currentUser.role === 'patient' && (
              <>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="text-emerald-400">Physician Connected (Dr. Sarah Mitchell, MD)</span>
              </>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            Welcome back, {currentUser.name}
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed mb-6 max-w-2xl">
            Real-time biometric vital tracking, pharmacotherapy safety verification, automated prescription OCR scanning, and clinical disease triage.
          </p>

          <div className="flex flex-wrap gap-2.5">
            {currentUser.role === 'doctor' && (
              <button
                onClick={() => setActiveTab('doctor-portal')}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Stethoscope className="w-4 h-4" />
                <span>Doctor Workstation &amp; Rx</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('symptom-checker')}
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <HeartPulse className="w-4 h-4" />
              <span>Start Symptom Diagnosis</span>
            </button>

            {currentUser.role === 'admin' && (
              <button
                onClick={() => setActiveTab('admin-portal')}
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Shield className="w-4 h-4" />
                <span>Admin Console</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('prescription-ocr')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Scan className="w-4 h-4" />
              <span>Scan Prescription (OCR)</span>
            </button>

            <button
              onClick={() => setActiveTab('ai-chatbot')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Bot className="w-4 h-4" />
              <span>Ask AI Pharmacist</span>
            </button>

            <button
              onClick={() => setActiveTab('animate-video')}
              className="px-4 py-2.5 rounded-xl bg-teal-900/60 hover:bg-teal-800/80 text-teal-200 border border-teal-700/50 font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Video className="w-4 h-4 text-teal-400" />
              <span>Animate to Video (Veo)</span>
            </button>
          </div>
        </div>
      </div>

      {/* AI Health Insights Powered by Gemini */}
      <AiHealthInsightsCard
        vitals={localVitals}
        schedule={schedule}
        doseLogs={doseLogs}
        currentUser={currentUser}
        onNavigateToRecords={() => setActiveTab('health-records')}
        onNavigateToMedications={() => setMedicationView('calendar')}
      />

      {/* Prominent Next Medication Countdown & Urgency Alert Card */}
      <NextMedicationCard
        schedule={schedule}
        doseLogs={doseLogs}
        onLogDose={handleLogDoseDirect}
        onTriggerTestReminder={handleTriggerTestReminder}
        onViewMedicine={() => setActiveTab('medicines')}
      />

      {/* Medication Management & Adherence Section with View Switcher */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Pill className="w-5 h-5 text-teal-600" />
              <span>Medication Management & Adherence</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Interactive monthly adherence calendar, dose tracking, and prescription regimen controls
            </p>
          </div>

          <div className="flex flex-wrap items-center p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 self-start sm:self-center shrink-0 gap-1">
            <button
              type="button"
              onClick={() => setMedicationView('notifications')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                medicationView === 'notifications'
                  ? 'bg-white text-teal-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BellRing className="w-3.5 h-3.5 text-teal-600" />
              <span>Push Alerts & Dispatcher</span>
            </button>
            <button
              type="button"
              onClick={() => setMedicationView('compliance')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                medicationView === 'compliance'
                  ? 'bg-white text-teal-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-teal-600" />
              <span>Weekly Compliance Chart</span>
            </button>
            <button
              type="button"
              onClick={() => setMedicationView('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                medicationView === 'calendar'
                  ? 'bg-white text-teal-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-teal-600" />
              <span>Monthly Calendar</span>
            </button>
            <button
              type="button"
              onClick={() => setMedicationView('schedule')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                medicationView === 'schedule'
                  ? 'bg-white text-teal-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Pill className="w-3.5 h-3.5 text-teal-600" />
              <span>Daily Regimen & Settings</span>
            </button>
          </div>
        </div>

        {medicationView === 'notifications' ? (
          <MedicationNotificationCenter
            currentUser={currentUser}
            schedule={schedule}
            doseLogs={doseLogs}
            onLogDose={handleLogDoseDirect}
            onUpdateSchedule={handleUpdateSchedule}
            soundEnabled={soundEnabled}
            onToggleSound={handleToggleSound}
            onViewMedicine={(medId) => setActiveTab('medicines')}
          />
        ) : medicationView === 'compliance' ? (
          <WeeklyMedicationComplianceChart
            schedule={schedule}
            doseLogs={doseLogs}
            onLogDose={handleLogDoseDirect}
            onNavigateToSchedule={() => setMedicationView('schedule')}
            currentUser={currentUser}
          />
        ) : medicationView === 'calendar' ? (
          <MedicationCalendar
            schedule={schedule}
            doseLogs={doseLogs}
            onToggleDose={() => setDoseLogs(storageService.getDoseLogs())}
            soundEnabled={soundEnabled}
          />
        ) : (
          <MedicationScheduleCard
            schedule={schedule}
            onUpdateSchedule={handleUpdateSchedule}
            doseLogs={doseLogs}
            onLogDose={handleLogDoseDirect}
            onTriggerTestReminder={handleTriggerTestReminder}
            soundEnabled={soundEnabled}
            onToggleSound={handleToggleSound}
            notificationPermission={notificationPermission}
            onRequestPermission={handleRequestPermission}
          />
        )}
      </div>

      {/* Dedicated Weekly Medication Compliance & Adherence Visualization (Recharts) */}
      {medicationView !== 'compliance' && (
        <WeeklyMedicationComplianceChart
          schedule={schedule}
          doseLogs={doseLogs}
          onLogDose={handleLogDoseDirect}
          onNavigateToSchedule={() => setMedicationView('schedule')}
          currentUser={currentUser}
        />
      )}

      {/* Proactive Health Metric Monitoring & Clinical Alert Service */}
      <ProactiveHealthAlertBanner
        vitals={localVitals}
        currentUser={currentUser}
        onNavigateToDoctorPortal={() => setActiveTab('doctor-portal')}
        onVitalsUpdated={() => setLocalVitals(storageService.getVitals())}
      />

      {/* Interactive Health Metric Trends Over Time (Recharts Visualization) */}
      <PatientHealthTrendChart
        vitals={localVitals}
        currentUser={currentUser}
        onAddVital={handleAddVital}
        onNavigateToRecords={() => setActiveTab('health-records')}
      />

      {/* Quick Symptom Diagnosis Selector */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-teal-600" />
              <span>Instant Symptom Presets</span>
            </h3>
            <p className="text-xs text-slate-500">Click any common symptom cluster to trigger the ML diagnosis engine</p>
          </div>
          <button
            onClick={() => setActiveTab('symptom-checker')}
            className="text-xs font-bold text-teal-700 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs hover:bg-teal-50 transition-colors self-start cursor-pointer"
          >
            Custom Symptom Search (132 Symptoms) →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickSymptomOptions.map((opt, i) => (
            <div
              key={i}
              onClick={() => onQuickCheck(opt.syms)}
              className="p-3.5 rounded-xl bg-white border border-slate-200/90 hover:border-teal-500 hover:shadow-md transition-all cursor-pointer group flex items-center justify-between"
            >
              <div>
                <div className="text-sm font-semibold text-slate-800 group-hover:text-teal-700 transition-colors">
                  {opt.label}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {opt.syms.length} symptoms mapped
                </div>
              </div>
              <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-teal-50 text-slate-400 group-hover:text-teal-600 flex items-center justify-center transition-colors">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Grid: Recent Diagnoses & Prescription Records */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Diagnoses */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-teal-600" />
              <span>Recent Model Predictions</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">{recentPredictions.length} saved</span>
          </div>

          {recentPredictions.length === 0 ? (
            <div className="text-center py-8 px-4 border border-dashed border-slate-200 rounded-xl">
              <Stethoscope className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <div className="text-sm font-medium text-slate-700">No predictions logged yet</div>
              <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1 mb-4">
                Run our trained Random Forest or Ensemble model to assess symptoms and get medication recommendations.
              </p>
              <button
                onClick={() => setActiveTab('symptom-checker')}
                className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                Run First Diagnostic Check
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentPredictions.slice(0, 3).map((pred) => (
                <div
                  key={pred.id}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors bg-slate-50/50"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-slate-900 text-sm">
                        {pred.predictedDisease.name}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Model: <span className="font-medium text-slate-700">{pred.modelUsed}</span> • ICD-10: {pred.predictedDisease.icd10}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800">
                        {pred.confidence}% Match
                      </span>
                    </div>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                    <span>{pred.inputSymptoms.length} symptoms evaluated</span>
                    <span>{pred.recommendedMedicines.length} medications recommended</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Prescription Scans & Schedule */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Scan className="w-4 h-4 text-teal-600" />
              <span>Prescription Records (OCR)</span>
            </h3>
            <button
              onClick={() => setActiveTab('prescription-ocr')}
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 cursor-pointer"
            >
              Scan new prescription →
            </button>
          </div>

          {recentPrescriptions.length === 0 ? (
            <div className="text-center py-8 px-4 border border-dashed border-slate-200 rounded-xl">
              <Scan className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <div className="text-sm font-medium text-slate-700">No prescriptions scanned</div>
              <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1 mb-4">
                Upload handwritten or printed doctor slips to extract medicines, dosages, and schedules automatically.
              </p>
              <button
                onClick={() => setActiveTab('prescription-ocr')}
                className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                Scan or Upload Prescription
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentPrescriptions.slice(0, 3).map((scan) => (
                <div
                  key={scan.id}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-slate-900 text-sm">
                        {scan.doctorName || 'Prescription Slip'}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {scan.clinicName} • {scan.date}
                      </div>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                      {scan.medications.length} Meds Extracted
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {scan.medications.slice(0, 3).map((m, idx) => (
                      <span key={idx} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium">
                        {m.medicineName} ({m.dosage})
                      </span>
                    ))}
                    {scan.medications.length > 3 && (
                      <span className="text-xs px-1.5 py-0.5 text-slate-400">+{scan.medications.length - 3} more</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Safety & Compliance Assurance Footer */}
      <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200/80 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
        <div className="text-xs text-teal-950 leading-relaxed">
          <span className="font-bold">Clinical Safety Notice: </span>
          MedAssist utilizes clinically validated diagnostic models (Random Forest, Decision Tree, Naive Bayes) trained on clinical symptom benchmarks. The system provides decision-support and educational recommendations and does not replace the professional diagnostic evaluation of a licensed physician.
        </div>
      </div>
    </div>
  );
};
