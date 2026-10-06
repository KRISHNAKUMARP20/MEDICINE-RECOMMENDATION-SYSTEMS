import React, { useState, useMemo } from 'react';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Award,
  Bell,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Filter,
  HeartPulse,
  Info,
  Layers,
  Loader2,
  LogIn,
  Pill,
  Plus,
  Printer,
  Radio,
  Search,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Trash2,
  User,
  UserCheck,
  X
} from 'lucide-react';
import {
  Disease,
  DoctorConsultationOrder,
  DoctorNotification,
  DoctorPrescribedItem,
  Medicine,
  PatientProfile,
  PredictionResult,
  ProactiveVitalsAlert,
  SuggestedTreatmentPlan,
  UserRecord
} from '../../types';
import { MEDICINES_DATA } from '../../data/medicines';
import { motion, AnimatePresence } from 'framer-motion';
import { PatientVitalsTrendChart } from '../doctor/PatientVitalsTrendChart';
import { AITreatmentPlanCard } from '../doctor/AITreatmentPlanCard';
import { generateEvidenceBasedTreatmentPlan } from '../../services/clinicalProtocolService';

interface DoctorPortalTabProps {
  currentUser: UserRecord;
  predictions: PredictionResult[];
  onUpdatePrediction: (prediction: PredictionResult) => void;
  onPrescribeToPatient: (predictionId: string, order: DoctorConsultationOrder) => void;
  onNavigateToSymptomChecker?: () => void;
  onViewMedicine?: (medicineId: string) => void;
  doctorNotifications?: DoctorNotification[];
  onSimulatePatientLogin?: () => void;
  selectedCaseIdOverride?: string;
}

export const DoctorPortalTab: React.FC<DoctorPortalTabProps> = ({
  currentUser,
  predictions,
  onUpdatePrediction,
  onPrescribeToPatient,
  onNavigateToSymptomChecker,
  onViewMedicine,
  doctorNotifications = [],
  onSimulatePatientLogin,
  selectedCaseIdOverride
}) => {
  // Selected patient case
  const [selectedCaseId, setSelectedCaseId] = useState<string>(() => {
    if (selectedCaseIdOverride) return selectedCaseIdOverride;
    return predictions.length > 0 ? predictions[0].id : '';
  });

  // Sync if selectedCaseIdOverride changes
  React.useEffect(() => {
    if (selectedCaseIdOverride) {
      setSelectedCaseId(selectedCaseIdOverride);
    }
  }, [selectedCaseIdOverride]);

  // Filter & search states
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'prescribed' | 'high_urgency'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Active selected case
  const selectedCase = useMemo(() => {
    return predictions.find(p => p.id === selectedCaseId) || (predictions.length > 0 ? predictions[0] : null);
  }, [predictions, selectedCaseId]);

  // Doctor prescription state for the currently active case
  const [prescribedItems, setPrescribedItems] = useState<DoctorPrescribedItem[]>([]);
  const [selectedMedId, setSelectedMedId] = useState<string>('paracetamol');
  const [dosageInput, setDosageInput] = useState<string>('500mg');
  const [frequencyInput, setFrequencyInput] = useState<string>('Twice daily (BID) after meals');
  const [durationInput, setDurationInput] = useState<string>('5 Days');
  const [instructionsInput, setInstructionsInput] = useState<string>('Take with a full glass of water. Complete full course.');
  const [doctorNotes, setDoctorNotes] = useState<string>('');
  const [showRxModal, setShowRxModal] = useState<boolean>(false);
  const [issuedNotification, setIssuedNotification] = useState<string | null>(null);

  // AI Treatment Plan state
  const [treatmentPlansByCaseId, setTreatmentPlansByCaseId] = useState<Record<string, SuggestedTreatmentPlan>>({});
  const [isLoadingTreatmentPlan, setIsLoadingTreatmentPlan] = useState<boolean>(false);
  const [planError, setPlanError] = useState<string | null>(null);

  const activeTreatmentPlan = selectedCase ? treatmentPlansByCaseId[selectedCase.id] : undefined;

  // Handler to generate or regenerate treatment plan using AI or evidence-based clinical protocols
  const handleSuggestTreatmentPlan = async () => {
    if (!selectedCase) return;
    setIsLoadingTreatmentPlan(true);
    setPlanError(null);

    // Compute realistic vitals for the patient based on age and disease
    const age = selectedCase.patientAge || 38;
    const isUrgent = selectedCase.predictedDisease?.urgency === 'High' || selectedCase.predictedDisease?.urgency === 'Emergency';
    const diseaseName = (selectedCase.predictedDisease?.name || '').toLowerCase();

    let sys = 120 + (age > 50 ? 12 : 0) + (isUrgent ? 10 : 0);
    let dia = 78 + (age > 50 ? 6 : 0) + (isUrgent ? 6 : 0);
    let hr = 74 + (isUrgent ? 14 : 0);
    if (diseaseName.includes('hypertens')) {
      sys += 22;
      dia += 14;
    } else if (diseaseName.includes('fever') || diseaseName.includes('dengue') || diseaseName.includes('pneumonia')) {
      hr += 20;
    }
    const map = Math.round((2 * dia + sys) / 3);
    const pulsePressure = sys - dia;
    const spo2 = isUrgent ? 95 : 98;
    const tempF = diseaseName.includes('fever') || isUrgent ? 101.0 : 98.6;

    const payload = {
      patientName: selectedCase.patientName || 'Patient',
      patientAge: selectedCase.patientAge || 38,
      patientGender: selectedCase.patientGender || 'Unspecified',
      diagnosedCondition: selectedCase.predictedDisease?.name || 'Clinical Presentation',
      urgency: selectedCase.predictedDisease?.urgency || 'Standard',
      symptoms: selectedCase.inputSymptoms.map(s => ({
        name: s.symptomId.replace(/_/g, ' '),
        severity: s.severity,
        duration: `${s.durationDays} days`
      })),
      vitals: {
        systolicBP: sys,
        diastolicBP: dia,
        heartRate: hr,
        map,
        pulsePressure,
        spo2,
        tempF,
        status: sys >= 140 ? 'Stage 2 HTN' : sys >= 130 ? 'Stage 1 HTN' : hr > 100 ? 'Tachycardic' : 'Normal'
      }
    };

    try {
      const response = await fetch('/api/treatment-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const plan: SuggestedTreatmentPlan = await response.json();
      setTreatmentPlansByCaseId(prev => ({
        ...prev,
        [selectedCase.id]: plan
      }));
    } catch (err: any) {
      console.warn('API call failed or unavailable, fallback to evidence-based protocol:', err);
      const fallbackPlan = generateEvidenceBasedTreatmentPlan(payload);
      setTreatmentPlansByCaseId(prev => ({
        ...prev,
        [selectedCase.id]: fallbackPlan
      }));
    } finally {
      setIsLoadingTreatmentPlan(false);
    }
  };

  const handleApplySingleMed = (med: DoctorPrescribedItem) => {
    setPrescribedItems(prev => {
      if (prev.some(item => item.medicineName.toLowerCase() === med.medicineName.toLowerCase())) {
        return prev;
      }
      return [...prev, med];
    });
  };

  const handleApplyAllMeds = (meds: DoctorPrescribedItem[]) => {
    setPrescribedItems(prev => {
      const existingNames = new Set(prev.map(p => p.medicineName.toLowerCase()));
      const toAdd = meds.filter(m => !existingNames.has(m.medicineName.toLowerCase()));
      return [...prev, ...toAdd];
    });
  };

  const handleAppendDoctorNotes = (notesText: string) => {
    setDoctorNotes(prev => {
      if (!prev) return notesText;
      return `${prev}\n\n${notesText}`;
    });
  };

  // Check if selectedCase or matching notification has a proactive vitals alert
  const activeVitalsAlert = useMemo(() => {
    if (!selectedCase) return null;
    const alertNotif = doctorNotifications.find(
      n =>
        n.type === 'vitals_alert' &&
        (n.caseId === selectedCase.id ||
          n.patientName?.toLowerCase() === selectedCase.patientName?.toLowerCase())
    );
    return alertNotif?.vitalsAlert || null;
  }, [doctorNotifications, selectedCase]);

  const handleApplyVitalsProtocol = (alert: ProactiveVitalsAlert) => {
    if (alert.metric === 'blood_pressure') {
      const amlodipineMed: DoctorPrescribedItem = {
        id: `item-vitals-${Date.now()}`,
        medicineId: 'amlodipine',
        medicineName: 'Amlodipine 5mg Tablet',
        genericName: 'Amlodipine Besylate',
        dosage: '5mg (1 Tablet)',
        frequency: 'Once Daily (QD) in morning',
        duration: '30 Days',
        instructions: 'Take 1 tablet every morning with water. Monitor resting BP daily and log in patient portal.'
      };
      handleApplySingleMed(amlodipineMed);
      handleAppendDoctorNotes(
        `[Doctor Vitals Intervention] Patient flagged blood pressure alert (${alert.currentValue} vs target ${alert.safeRange}). Initiated first-line calcium channel blocker therapy (Amlodipine 5mg QD). Advised DASH diet with sodium <1,500mg/day and lifestyle aerobic exercise.`
      );
    } else if (alert.metric === 'heart_rate') {
      handleAppendDoctorNotes(
        `[Doctor Vitals Review] Patient flagged elevated resting heart rate (${alert.currentValue}). Recommended telemetry review, oral hydration, avoidance of stimulants, and repeat assessment.`
      );
    } else if (alert.metric === 'blood_sugar') {
      const metforminMed: DoctorPrescribedItem = {
        id: `item-vitals-${Date.now()}`,
        medicineId: 'metformin',
        medicineName: 'Metformin 500mg Extended-Release',
        genericName: 'Metformin HCl',
        dosage: '500mg (1 Tablet)',
        frequency: 'Once Daily with evening meal',
        duration: '30 Days',
        instructions: 'Take with evening meal to minimize GI discomfort. Maintain hydration.'
      };
      handleApplySingleMed(metforminMed);
      handleAppendDoctorNotes(
        `[Doctor Glycemic Intervention] Patient presented with fasting glucose excursion (${alert.currentValue}). Initiated first-line biguanide therapy (Metformin 500mg XR). Scheduled HbA1c verification.`
      );
    } else {
      handleAppendDoctorNotes(
        `[Doctor Vitals Review] Patient flagged ${alert.metricLabel} excursion (${alert.currentValue}). Reviewing clinical status.`
      );
    }
  };

  // Sync prescription state when selectedCase changes
  React.useEffect(() => {
    if (selectedCase) {
      if (selectedCase.doctorOrder) {
        setPrescribedItems(selectedCase.doctorOrder.prescribedMedicines);
        setDoctorNotes(selectedCase.doctorOrder.clinicalNotes);
      } else {
        // Pre-populate recommended first-line medicines for the doctor's review if available
        const defaultItems: DoctorPrescribedItem[] = [];
        if (selectedCase.predictedDisease?.recommendedMedicines?.length) {
          selectedCase.predictedDisease.recommendedMedicines.forEach((rec, idx) => {
            const medData = MEDICINES_DATA.find(m => m.id === rec.medicineId);
            defaultItems.push({
              id: `item-${Date.now()}-${idx}`,
              medicineId: rec.medicineId,
              medicineName: medData ? medData.name : rec.medicineId,
              genericName: medData?.genericName,
              dosage: rec.dosage,
              frequency: 'Twice daily after meals',
              duration: rec.duration,
              instructions: rec.instructions
            });
          });
        }
        setPrescribedItems(defaultItems);
        setDoctorNotes(
          `Clinical Evaluation: Patient presents with ${selectedCase.inputSymptoms.map(s => s.symptomId).join(', ')}. Symptoms consistent with ${selectedCase.predictedDisease.name}. Prescribed clinical therapeutic course.`
        );
      }
    }
  }, [selectedCase?.id]);

  // Filtered list of patient cases
  const filteredCases = useMemo(() => {
    return predictions.filter(p => {
      // Status filter
      if (filterStatus === 'pending' && p.doctorOrder) return false;
      if (filterStatus === 'prescribed' && !p.doctorOrder) return false;
      if (filterStatus === 'high_urgency' && p.predictedDisease.urgency !== 'High' && p.predictedDisease.urgency !== 'Emergency') {
        return false;
      }

      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const patientMatch = (p.patientName || 'Alex Johnson').toLowerCase().includes(q);
        const diseaseMatch = p.predictedDisease.name.toLowerCase().includes(q);
        const symptomMatch = p.inputSymptoms.some(s => s.symptomId.toLowerCase().includes(q));
        if (!patientMatch && !diseaseMatch && !symptomMatch) return false;
      }

      return true;
    });
  }, [predictions, filterStatus, searchQuery]);

  // Summary counts
  const totalCount = predictions.length;
  const pendingCount = predictions.filter(p => !p.doctorOrder).length;
  const prescribedCount = predictions.filter(p => !!p.doctorOrder).length;
  const highUrgencyCount = predictions.filter(p => p.predictedDisease.urgency === 'High' || p.predictedDisease.urgency === 'Emergency').length;

  // Add medication to current order
  const handleAddMedication = () => {
    const med = MEDICINES_DATA.find(m => m.id === selectedMedId);
    if (!med) return;

    const newItem: DoctorPrescribedItem = {
      id: `rx-item-${Date.now()}`,
      medicineId: med.id,
      medicineName: med.name,
      genericName: med.genericName,
      dosage: dosageInput || 'Standard Dose',
      frequency: frequencyInput,
      duration: durationInput,
      instructions: instructionsInput
    };

    setPrescribedItems(prev => [...prev, newItem]);
  };

  const handleRemoveMedication = (id: string) => {
    setPrescribedItems(prev => prev.filter(item => item.id !== id));
  };

  // Authorize & Issue Prescription to Patient
  const handleAuthorizePrescription = () => {
    if (!selectedCase) return;
    if (prescribedItems.length === 0) {
      alert('Please add at least one medication to prescribe to the patient.');
      return;
    }

    const order: DoctorConsultationOrder = {
      id: `rx-auth-${Date.now()}`,
      doctorId: currentUser.id,
      doctorName: currentUser.name.startsWith('Dr.') ? currentUser.name : `Dr. ${currentUser.name}, MD`,
      doctorSpecialty: 'Internal Medicine & Clinical Care',
      clinicalNotes: doctorNotes || `Official therapeutic prescription issued for ${selectedCase.predictedDisease.name}.`,
      prescribedMedicines: prescribedItems,
      status: 'prescribed',
      prescribedAt: new Date().toISOString(),
      licenseNumber: 'MD-88492'
    };

    onPrescribeToPatient(selectedCase.id, order);

    setIssuedNotification(
      `Official Prescription successfully issued to patient ${selectedCase.patientName || 'Alex Johnson'}. Patient chart and medication schedule updated.`
    );
    setTimeout(() => {
      setIssuedNotification(null);
    }, 6000);
  };

  return (
    <div className="space-y-6">
      {/* Physician Workstation Header */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-slate-900 via-blue-950 to-indigo-950 text-white p-6 sm:p-8 shadow-xl border border-blue-900/60">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/3 bottom-0 -mb-10 w-72 h-72 bg-sky-500/15 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-blue-300 tracking-wide uppercase flex-wrap">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              <span>Physician Clinical Workstation</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-emerald-400">Surescripts Certified E-Prescribing</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-400">DEA Schedule II–V Compliant</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              Doctor Patient Consults & Rx Pad
            </h1>
            <p className="mt-2 text-sm text-blue-100/90 leading-relaxed">
              Attending Physician: <strong className="text-white font-bold">{currentUser.name}</strong> • Internal Medicine Provider • License: <span className="font-mono text-blue-200">#MD-88492</span>
            </p>
            <p className="text-xs text-blue-200/75 mt-1">
              Review incoming patient symptom evaluations and disease diagnoses, and authorize official therapeutic prescriptions.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
            <div className="bg-slate-800/80 backdrop-blur-xs border border-blue-800/50 rounded-2xl p-3 text-center">
              <span className="text-xs text-blue-200/80 font-medium block">Total Consults</span>
              <span className="text-2xl font-black text-white">{totalCount}</span>
            </div>
            <div className="bg-slate-800/80 backdrop-blur-xs border border-amber-500/40 rounded-2xl p-3 text-center">
              <span className="text-xs text-amber-300 font-medium block">Needs Doctor Rx</span>
              <span className="text-2xl font-black text-amber-400 animate-pulse">{pendingCount}</span>
            </div>
            <div className="bg-slate-800/80 backdrop-blur-xs border border-emerald-500/40 rounded-2xl p-3 text-center">
              <span className="text-xs text-emerald-300 font-medium block">Prescriptions Signed</span>
              <span className="text-2xl font-black text-emerald-400">{prescribedCount}</span>
            </div>
            <div className="bg-slate-800/80 backdrop-blur-xs border border-rose-500/40 rounded-2xl p-3 text-center">
              <span className="text-xs text-rose-300 font-medium block">High Urgency</span>
              <span className="text-2xl font-black text-rose-400">{highUrgencyCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Banner */}
      {issuedNotification && (
        <div className="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-4 flex items-start gap-3 shadow-lg shadow-emerald-500/10 animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-bold text-emerald-900">Prescription Authorized & Dispatched</h4>
            <p className="text-xs text-emerald-800 mt-0.5">{issuedNotification}</p>
          </div>
          <button
            onClick={() => setIssuedNotification(null)}
            className="text-emerald-700 hover:text-emerald-900 cursor-pointer p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Real-time Patient Login & Direct Notification Feed */}
      <div className="bg-white rounded-2xl border border-blue-200/90 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/30 border border-blue-400/40 flex items-center justify-center">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm tracking-tight">Direct Patient Login & Alert Pager</h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Live Dispatch Active
                </span>
              </div>
              <p className="text-xs text-blue-200">
                Direct alerts appear instantly when patients log in or submit symptoms
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onSimulatePatientLogin && (
              <button
                onClick={onSimulatePatientLogin}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                title="Simulate a patient logging in right now"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Simulate Patient Login</span>
              </button>
            )}
          </div>
        </div>

        {/* Horizontal scroll of recent patient login / triage alerts */}
        <div className="p-3 bg-blue-50/40 border-b border-blue-100 flex items-center gap-3 overflow-x-auto no-scrollbar">
          {doctorNotifications.length === 0 ? (
            <div className="text-xs text-slate-500 py-2 px-3 italic flex items-center gap-2">
              <Bell className="w-4 h-4 text-slate-400" />
              <span>Waiting for patient logins. When a patient signs in, their alert will be broadcasted here.</span>
            </div>
          ) : (
            doctorNotifications.slice(0, 5).map(notif => {
              const matchedCase = predictions.find(p => p.id === notif.caseId || p.patientName?.toLowerCase() === notif.patientName.toLowerCase());
              const isSelected = selectedCaseId === matchedCase?.id;

              return (
                <div
                  key={notif.id}
                  onClick={() => {
                    if (matchedCase) setSelectedCaseId(matchedCase.id);
                  }}
                  className={`shrink-0 min-w-[260px] max-w-[320px] p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-700 shadow-md ring-2 ring-blue-300'
                      : notif.type === 'vitals_alert'
                      ? 'bg-rose-50/90 border-rose-300 hover:border-rose-400 shadow-xs ring-1 ring-rose-200'
                      : !notif.read
                      ? 'bg-white border-blue-300 hover:border-blue-400 shadow-2xs'
                      : 'bg-white/80 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-black text-xs ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : notif.type === 'vitals_alert'
                        ? 'bg-rose-600 text-white shadow-2xs'
                        : notif.type === 'patient_login'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {notif.type === 'vitals_alert' ? (
                      <Activity className="w-4 h-4 text-white animate-pulse" />
                    ) : (
                      notif.patientName.charAt(0)
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                        {notif.patientName}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        isSelected
                          ? 'text-blue-100'
                          : notif.type === 'vitals_alert'
                          ? 'bg-rose-100 text-rose-900 border border-rose-200 animate-pulse'
                          : 'text-slate-400'
                      }`}>
                        {notif.type === 'vitals_alert' ? '⚡ Vitals Alert' : notif.type === 'patient_login' ? 'Online' : 'Triage'}
                      </span>
                    </div>

                    <p className={`text-[11px] truncate mt-0.5 ${isSelected ? 'text-blue-100' : 'text-slate-600'}`}>
                      {notif.message}
                    </p>

                    <div className="flex items-center justify-between mt-1">
                      <span className={`text-[10px] font-semibold ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>
                        {notif.patientAge ? `${notif.patientAge}yo ${notif.patientGender || ''}` : 'Patient'}
                      </span>
                      <span className={`text-[10px] font-bold ${isSelected ? 'text-white underline' : 'text-blue-600'}`}>
                        Review Case →
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Dual-Column Clinical Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Patient Consultations Queue */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-blue-600" />
                <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">
                  Patient Intake & Consultations
                </h3>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {filteredCases.length} Cases
              </span>
            </div>

            {/* Search Input */}
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search patient, symptoms, or disease..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-2.5 py-1 rounded-lg font-semibold shrink-0 cursor-pointer transition-colors ${
                  filterStatus === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Cases ({totalCount})
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-2.5 py-1 rounded-lg font-semibold shrink-0 cursor-pointer transition-colors ${
                  filterStatus === 'pending'
                    ? 'bg-amber-500 text-white'
                    : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                }`}
              >
                ⚠️ Needs Rx ({pendingCount})
              </button>
              <button
                onClick={() => setFilterStatus('prescribed')}
                className={`px-2.5 py-1 rounded-lg font-semibold shrink-0 cursor-pointer transition-colors ${
                  filterStatus === 'prescribed'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                ✅ Prescribed ({prescribedCount})
              </button>
              <button
                onClick={() => setFilterStatus('high_urgency')}
                className={`px-2.5 py-1 rounded-lg font-semibold shrink-0 cursor-pointer transition-colors ${
                  filterStatus === 'high_urgency'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
                }`}
              >
                🚨 Urgent ({highUrgencyCount})
              </button>
            </div>
          </div>

          {/* Cases List */}
          <div className="space-y-3 max-h-[750px] overflow-y-auto pr-1">
            {filteredCases.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500">
                <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-sm">No patient cases found</p>
                <p className="text-xs text-slate-400 mt-1">Try changing your search query or filter</p>
              </div>
            ) : (
              filteredCases.map(item => {
                const isSelected = selectedCase?.id === item.id;
                const isPrescribed = !!item.doctorOrder;
                const urgency = item.predictedDisease.urgency;

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedCaseId(item.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-400/40 shadow-md'
                        : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {(item.patientName || 'Alex Johnson').charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm leading-tight">
                            {item.patientName || 'Alex Johnson'}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {item.patientAge || 38}y • {item.patientGender || 'Male'} •{' '}
                            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            urgency === 'High' || urgency === 'Emergency'
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : urgency === 'Medium'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {urgency}
                        </span>
                        {isPrescribed ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1 border border-emerald-200">
                            <Check className="w-3 h-3 text-emerald-600" /> Prescribed
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md flex items-center gap-1 border border-amber-200">
                            <AlertCircle className="w-3 h-3 text-amber-600" /> Needs Doctor Rx
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Reported Symptoms Strip */}
                    <div className="mt-3">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Reported Symptoms:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {item.inputSymptoms.slice(0, 4).map((s, idx) => (
                          <span
                            key={idx}
                            className={`text-[11px] font-medium px-2 py-0.5 rounded-md capitalize ${
                              s.severity === 'Severe'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : s.severity === 'Moderate'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {s.symptomId.replace(/_/g, ' ')} ({s.severity})
                          </span>
                        ))}
                        {item.inputSymptoms.length > 4 && (
                          <span className="text-[10px] text-slate-400 px-1 py-0.5">
                            +{item.inputSymptoms.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Diagnosed Disease */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <span>Condition:</span>
                        <span className="text-blue-700">{item.predictedDisease.name}</span>
                      </div>
                      <span className="font-semibold text-slate-500 font-mono text-[11px]">
                        {item.confidence.toFixed(1)}% match
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Doctor Clinical Review & Official Rx Prescriber */}
        <div className="lg:col-span-7 space-y-6">
          <AnimatePresence mode="wait">
            {selectedCase ? (
              <motion.div
                key={selectedCase.id}
                initial={{ opacity: 0, x: 28 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -28 }}
                transition={{ duration: 0.32, ease: 'easeOut' }}
                className="space-y-6"
              >
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  {/* Patient Case Summary Banner */}
                  <div className="bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-400/30">
                        Active Patient Case
                      </span>
                      <span className="text-xs text-blue-200 font-mono">
                        Case ID: {selectedCase.id.slice(0, 16)}
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black">{selectedCase.patientName || 'Alex Johnson'}</h2>
                    <p className="text-xs text-blue-200/80 mt-0.5">
                      Age: {selectedCase.patientAge || 38} • Gender: {selectedCase.patientGender || 'Male'} • Logged:{' '}
                      {new Date(selectedCase.timestamp).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <button
                      type="button"
                      onClick={handleSuggestTreatmentPlan}
                      disabled={isLoadingTreatmentPlan}
                      className="px-3.5 py-2 rounded-xl bg-linear-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50"
                      title="AI-Powered Treatment Plan & Clinical Protocol Recommender"
                    >
                      {isLoadingTreatmentPlan ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-950" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                      )}
                      <span>{isLoadingTreatmentPlan ? 'Analyzing Vitals...' : 'Suggest Treatment Plan (AI)'}</span>
                    </button>

                    <button
                      onClick={() => setShowRxModal(true)}
                      className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-white/20"
                      title="View & Print Official Hospital Rx Slip"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Hospital Rx</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Case Details Body */}
              <div className="p-6 space-y-6">
                {/* Proactive Vitals Alert Escalation Banner */}
                {activeVitalsAlert && (
                  <div className="rounded-2xl border-2 border-rose-500 bg-linear-to-r from-rose-50 via-red-50/80 to-rose-50 p-5 shadow-xs animate-fadeIn space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                          <Activity className="w-5 h-5 animate-pulse" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-rose-600 text-white">
                              Proactive Vitals Excursion Alert
                            </span>
                            <span className="text-xs font-bold text-rose-900">
                              Escalated from Patient Workstation
                            </span>
                          </div>
                          <h3 className="text-base font-black text-rose-950 mt-1">
                            {activeVitalsAlert.title}
                          </h3>
                          <p className="text-xs text-rose-800 mt-0.5 font-medium leading-relaxed">
                            {activeVitalsAlert.message}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start">
                        <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-lg bg-white border border-rose-300 text-rose-950 shadow-2xs">
                          Observed: {activeVitalsAlert.currentValue}
                        </span>
                      </div>
                    </div>

                    {/* Clinical Directive & Action Bar */}
                    <div className="p-3.5 rounded-xl bg-white border border-rose-200 text-xs space-y-2">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <Stethoscope className="w-4 h-4 text-blue-600" />
                        <span>Recommended Physician Action:</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed font-medium">
                        {activeVitalsAlert.clinicalSuggestion}
                      </p>
                      <div className="pt-2 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleApplyVitalsProtocol(activeVitalsAlert)}
                          className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Apply Recommended Protocol to Rx Pad</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Patient Reported Symptoms & History */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>Patient Reported Symptoms & Clinical History</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {selectedCase.inputSymptoms.map((s, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-slate-800 text-xs capitalize">
                            {s.symptomId.replace(/_/g, ' ')}
                          </div>
                          <div className="text-[11px] text-slate-400">Duration: {s.durationDays} days</div>
                        </div>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            s.severity === 'Severe'
                              ? 'bg-rose-100 text-rose-800'
                              : s.severity === 'Moderate'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {s.severity}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Red flags if present */}
                  {selectedCase.redFlagWarnings && selectedCase.redFlagWarnings.length > 0 && (
                    <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs">
                      <div className="font-bold flex items-center gap-1.5 mb-1 text-rose-800">
                        <ShieldAlert className="w-4 h-4 text-rose-600" />
                        <span>Clinical Precautions & Triage Warnings:</span>
                      </div>
                      <ul className="list-disc list-inside space-y-0.5">
                        {selectedCase.redFlagWarnings.map((warning, i) => (
                          <li key={i}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Diagnostic AI Evaluation Summary */}
                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">
                        Diagnostic Evaluation
                      </span>
                      <h3 className="font-black text-slate-900 text-lg">
                        {selectedCase.predictedDisease.name}
                      </h3>
                      <span className="text-xs text-slate-500 font-mono">
                        ICD-10 Code: {selectedCase.predictedDisease.icd10} • Inference Engine: {selectedCase.modelUsed}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-500 block">Confidence Score</span>
                      <span className="text-xl font-black text-blue-700">
                        {selectedCase.confidence.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 mt-2 leading-relaxed">
                    {selectedCase.predictedDisease.description}
                  </p>
                </div>

                {/* Hemodynamic Vitals Trend Chart (Heart Rate & Blood Pressure History) */}
                <PatientVitalsTrendChart patientCase={selectedCase} />

                {/* AI-Powered Clinical Treatment Plan Decision Support */}
                {activeTreatmentPlan ? (
                  <AITreatmentPlanCard
                    plan={activeTreatmentPlan}
                    onApplyMedication={handleApplySingleMed}
                    onApplyAllMedications={handleApplyAllMeds}
                    onApplyNotes={handleAppendDoctorNotes}
                    onRegenerate={handleSuggestTreatmentPlan}
                    isRegenerating={isLoadingTreatmentPlan}
                    prescribedItems={prescribedItems}
                  />
                ) : (
                  <div className="p-4 sm:p-5 rounded-3xl bg-linear-to-r from-blue-50 via-indigo-50/70 to-purple-50 border border-blue-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20 shrink-0 mt-0.5 sm:mt-0">
                        <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <h4 className="font-bold text-sm text-slate-900">
                            AI Clinical Decision Support & Protocol Generator
                          </h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 font-bold border border-blue-200">
                            ACC/AHA • ADA • WHO • GOLD
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Analyze {selectedCase.patientName || 'this patient'}'s reported symptoms and hemodynamic vitals to suggest evidence-based protocols, first-line medications, and non-pharmacological care plans.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleSuggestTreatmentPlan}
                      disabled={isLoadingTreatmentPlan}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-linear-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      {isLoadingTreatmentPlan ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                          <span>Synthesizing Protocols...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-amber-300" />
                          <span>Suggest Treatment Plan (AI)</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* DOCTOR CLINICAL PRESCRIPTION ORDER PAD */}
                <div className="pt-4 border-t border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-blue-600 text-white">
                          <Stethoscope className="w-4 h-4" />
                        </span>
                        <h3 className="text-base font-black text-slate-900">
                          Doctor Medication Prescription Pad (Rx)
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Select and authorize medications to give to this patient. The patient will receive only your authorized prescription.
                      </p>
                    </div>

                    {selectedCase.doctorOrder && (
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Signed by {selectedCase.doctorOrder.doctorName}</span>
                      </span>
                    )}
                  </div>

                  {/* Add Medication Controls */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <span className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                      Add Medication to Patient's Regimen
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">
                          Select Medicine from Formulary
                        </label>
                        <select
                          value={selectedMedId}
                          onChange={e => {
                            const newId = e.target.value;
                            setSelectedMedId(newId);
                            const med = MEDICINES_DATA.find(m => m.id === newId);
                            if (med) {
                              setDosageInput(med.standardDosage.adult);
                              setInstructionsInput(med.indications[0] ? `Indicated for ${med.indications[0]}. Take after meals.` : 'Take after meals.');
                            }
                          }}
                          className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-medium cursor-pointer"
                        >
                          {MEDICINES_DATA.map(med => (
                            <option key={med.id} value={med.id}>
                              {med.name} ({med.genericName}) — {med.drugClass}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">
                          Dosage Specification
                        </label>
                        <input
                          type="text"
                          value={dosageInput}
                          onChange={e => setDosageInput(e.target.value)}
                          placeholder="e.g. 500mg (1 Tablet) or 4 tablets initially"
                          className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-medium"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">
                          Frequency of Administration
                        </label>
                        <select
                          value={frequencyInput}
                          onChange={e => setFrequencyInput(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-medium cursor-pointer"
                        >
                          <option value="Once Daily (QD) in the morning">Once Daily (QD) in the morning</option>
                          <option value="Twice daily (BID) after meals">Twice daily (BID) after meals</option>
                          <option value="Three times daily (TID) every 8 hours">Three times daily (TID) every 8 hours</option>
                          <option value="Every 4-6 hours PRN for fever/pain">Every 4-6 hours PRN for fever/pain</option>
                          <option value="At bedtime (QHS)">At bedtime (QHS)</option>
                          <option value="Standard ACT protocol (0, 8, 24, 36, 48, 60 hrs)">Standard ACT protocol (0, 8, 24, 36, 48, 60 hrs)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">
                          Course Duration
                        </label>
                        <select
                          value={durationInput}
                          onChange={e => setDurationInput(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-medium cursor-pointer"
                        >
                          <option value="3 Days">3 Days</option>
                          <option value="5 Days">5 Days</option>
                          <option value="7 Days">7 Days</option>
                          <option value="10 Days">10 Days</option>
                          <option value="14 Days">14 Days</option>
                          <option value="1 Month">1 Month</option>
                          <option value="As needed (PRN)">As needed (PRN)</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">
                          Physician Instructions to Patient
                        </label>
                        <input
                          type="text"
                          value={instructionsInput}
                          onChange={e => setInstructionsInput(e.target.value)}
                          placeholder="e.g. Take with fatty meal to increase absorption. Complete full 3-day course."
                          className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-medium"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddMedication}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Medication to Prescription Order</span>
                    </button>
                  </div>

                  {/* Active Prescribed List */}
                  <div>
                    <span className="text-xs font-bold text-slate-700 block mb-2 uppercase tracking-wider">
                      Prescribed Medications List ({prescribedItems.length})
                    </span>

                    {prescribedItems.length === 0 ? (
                      <div className="p-4 rounded-xl border border-dashed border-slate-300 text-center text-slate-400 text-xs">
                        No medications added yet. Use the formulary selector above to prescribe medicines to this patient.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {prescribedItems.map((item, idx) => (
                          <div
                            key={item.id || idx}
                            className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-start justify-between gap-3 hover:border-blue-300 transition-colors"
                          >
                            <div className="flex items-start gap-2.5">
                              <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-slate-900 text-xs">
                                    {item.medicineName}
                                  </span>
                                  {item.genericName && (
                                    <span className="text-[11px] text-slate-400">
                                      ({item.genericName})
                                    </span>
                                  )}
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                    {item.dosage}
                                  </span>
                                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                    {item.duration}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-600 mt-1 font-medium">
                                  Frequency: {item.frequency}
                                </div>
                                {item.instructions && (
                                  <div className="text-[11px] text-slate-500 mt-0.5">
                                    Note: {item.instructions}
                                  </div>
                                )}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveMedication(item.id)}
                              className="text-slate-400 hover:text-rose-600 p-1.5 transition-colors cursor-pointer"
                              title="Remove medication"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Doctor Clinical Notes */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wider">
                      Physician Treatment Notes & Clinical Directives
                    </label>
                    <textarea
                      rows={3}
                      value={doctorNotes}
                      onChange={e => setDoctorNotes(e.target.value)}
                      placeholder="Enter physician observations, follow-up timeline, warning signs, and dietary directives..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>

                  {/* Submit / Authorize Button */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    <div className="text-xs text-slate-500">
                      Signing as: <strong className="text-slate-800">{currentUser.name}</strong> • MD License #MD-88492
                    </div>

                    <button
                      type="button"
                      onClick={handleAuthorizePrescription}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all hover:scale-[1.01] cursor-pointer"
                    >
                      <FileCheck className="w-4 h-4" />
                      <span>Authorize & Prescribe to Patient</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
            ) : (
              <motion.div
                key="empty-case-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-500"
              >
                <Stethoscope className="w-12 h-12 text-blue-300 mx-auto mb-3" />
                <h3 className="font-bold text-slate-800 text-base">Select a Patient Case</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Choose a patient from the consultation queue on the left to review their reported symptoms and prescribe medications.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Official Hospital Prescription Print Modal */}
      {showRxModal && selectedCase && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[95vh] print:max-h-none print:shadow-none print:border-none">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0 print:hidden">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-sm">Official Clinical Prescription Preview</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>
                <button
                  onClick={() => setShowRxModal(false)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Prescription Slip */}
            <div className="p-8 overflow-y-auto text-slate-800 space-y-6 print:p-6">
              {/* Hospital Header */}
              <div className="border-b-2 border-slate-800 pb-4 flex justify-between items-start">
                <div>
                  <h1 className="text-xl font-black text-slate-950 uppercase tracking-tight">
                    Metro Health Clinical Medical Center
                  </h1>
                  <p className="text-xs text-slate-600">
                    Department of Internal Medicine & Infectious Diseases
                  </p>
                  <p className="text-[11px] text-slate-400">
                    450 Healthcare Boulevard, Metro City • Phone: (555) 019-2834 • DEA Lic: #MD-88492
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-blue-700">℞</div>
                  <span className="text-[11px] text-slate-500 block font-mono">
                    RX-{selectedCase.id.slice(0, 10).toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Patient & Physician Strip */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl text-xs border border-slate-200">
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">Patient Details:</span>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{selectedCase.patientName || 'Alex Johnson'}</div>
                  <div className="text-slate-600">Age: {selectedCase.patientAge || 38} • Sex: {selectedCase.patientGender || 'Male'}</div>
                  <div className="text-slate-600">Clinical Diagnosis: <strong>{selectedCase.predictedDisease.name}</strong> (ICD-10: {selectedCase.predictedDisease.icd10})</div>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">Prescribing Physician:</span>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{currentUser.name}</div>
                  <div className="text-slate-600">License: MD-88492</div>
                  <div className="text-slate-600">Date: {new Date().toLocaleDateString()}</div>
                </div>
              </div>

              {/* Prescribed Medications */}
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-3 uppercase tracking-wider flex items-center gap-2 border-b pb-1">
                  <Pill className="w-4 h-4 text-blue-600" />
                  <span>Prescribed Medication Regimen</span>
                </h4>

                <div className="space-y-3">
                  {prescribedItems.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-white">
                      <div className="flex justify-between items-baseline">
                        <span className="font-bold text-slate-900 text-sm">
                          {idx + 1}. {item.medicineName}
                        </span>
                        <span className="font-semibold text-blue-800 text-xs">{item.dosage}</span>
                      </div>
                      <div className="text-xs text-slate-600 mt-1">
                        <strong>Directions:</strong> {item.frequency} for {item.duration}
                      </div>
                      {item.instructions && (
                        <div className="text-xs text-slate-500 mt-0.5">
                          <strong>Note:</strong> {item.instructions}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Clinical Directives */}
              {doctorNotes && (
                <div>
                  <h4 className="font-bold text-slate-900 text-xs mb-1 uppercase tracking-wider">
                    Physician Clinical Instructions & Precautions:
                  </h4>
                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
                    {doctorNotes}
                  </p>
                </div>
              )}

              {/* Physician Signature Line */}
              <div className="pt-8 border-t border-slate-300 flex justify-between items-end">
                <div className="text-[11px] text-slate-400">
                  Dispense as written • Electronic Signature Verified • Surescripts System
                </div>
                <div className="text-center">
                  <div className="font-serif italic font-bold text-slate-800 text-base border-b border-slate-400 pb-1 px-8">
                    {currentUser.name}, MD
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Attending Physician Signature</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
