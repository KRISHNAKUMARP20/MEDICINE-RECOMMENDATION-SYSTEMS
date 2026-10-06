import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Check,
  ChevronDown,
  Filter,
  HeartPulse,
  Info,
  Mic,
  Pill,
  Plus,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Trash2,
  User,
  Volume2,
  X,
  Zap
} from 'lucide-react';
import { SYMPTOMS_DATA, SYMPTOM_CATEGORIES } from '../../data/symptoms';
import { ML_MODELS_BENCHMARKS } from '../../data/mlModelsData';
import {
  MedicationSafetyReport,
  PatientProfile,
  PredictionResult,
  Symptom,
  TriagePriorityAssessment,
  TriageUrgencyLevel,
  UserRecord
} from '../../types';
import { runDiseasePrediction, SymptomInput } from '../../services/mlPredictionService';
import { medicationSafetyService } from '../../services/medicationSafetyService';
import { triagePriorityService, VitalsInputContext } from '../../services/triagePriorityService';
import { storageService } from '../../services/storageService';
import { TriagePriorityIndicator } from '../symptom/TriagePriorityIndicator';
import { PredictionResultModal } from './PredictionResultModal';
import { VoiceSymptomModal } from '../voice/VoiceSymptomModal';

interface SymptomCheckerTabProps {
  currentUser: UserRecord;
  onSavePrediction: (pred: PredictionResult) => void;
  initialSymptoms?: string[];
  onViewMedicine?: (medicineId: string) => void;
  onNavigateToDoctorPortal?: () => void;
}

export const SymptomCheckerTab: React.FC<SymptomCheckerTabProps> = ({
  currentUser,
  onSavePrediction,
  initialSymptoms,
  onViewMedicine,
  onNavigateToDoctorPortal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSymptoms, setSelectedSymptoms] = useState<SymptomInput[]>(() => {
    if (initialSymptoms && initialSymptoms.length > 0) {
      return initialSymptoms.map(id => ({
        symptomId: id,
        severity: 'Moderate',
        durationDays: 3
      }));
    }
    // Default initial demonstration symptoms
    return [
      { symptomId: 'fever', severity: 'Severe', durationDays: 3 },
      { symptomId: 'chills', severity: 'Moderate', durationDays: 2 },
      { symptomId: 'sweating', severity: 'Mild', durationDays: 2 }
    ];
  });

  const [selectedModel, setSelectedModel] = useState<
    'Random Forest' | 'Ensemble Weighted'
  >('Ensemble Weighted');

  // Patient custom profile overrides
  const [patientAge, setPatientAge] = useState(currentUser.profile.age || 38);
  const [patientGender, setPatientGender] = useState<'male' | 'female' | 'other'>(currentUser.profile.gender || 'male');
  const [isPregnant, setIsPregnant] = useState(currentUser.profile.isPregnant || false);
  const [hasRenalDisease, setHasRenalDisease] = useState(currentUser.profile.hasRenalDisease || false);
  const [hasHepaticDisease, setHasHepaticDisease] = useState(currentUser.profile.hasHepaticDisease || false);

  // User's knownAllergies and currentMedications for cross-referencing
  const [knownAllergies, setKnownAllergies] = useState<string[]>(() =>
    currentUser.profile.knownAllergies?.length ? [...currentUser.profile.knownAllergies] : ['Penicillin']
  );
  const [currentMedications, setCurrentMedications] = useState<string[]>(() =>
    currentUser.profile.currentMedications?.length ? [...currentUser.profile.currentMedications] : ['paracetamol']
  );
  const [allergyInput, setAllergyInput] = useState('');
  const [medicationInput, setMedicationInput] = useState('');

  // Immediate Safety Warning State
  const [immediateSafetyWarning, setImmediateSafetyWarning] = useState<MedicationSafetyReport | null>(null);
  const [showWarningDetails, setShowWarningDetails] = useState(true);

  const handleAddAllergy = (allergyName: string) => {
    const trimmed = allergyName.trim();
    if (!trimmed) return;
    if (!knownAllergies.some(a => a.toLowerCase() === trimmed.toLowerCase())) {
      setKnownAllergies(prev => [...prev, trimmed]);
    }
    setAllergyInput('');
  };

  const handleRemoveAllergy = (allergyName: string) => {
    setKnownAllergies(prev => prev.filter(a => a.toLowerCase() !== allergyName.toLowerCase()));
  };

  const handleAddCurrentMed = (medName: string) => {
    const trimmed = medName.trim();
    if (!trimmed) return;
    if (!currentMedications.some(m => m.toLowerCase() === trimmed.toLowerCase())) {
      setCurrentMedications(prev => [...prev, trimmed]);
    }
    setMedicationInput('');
  };

  const handleRemoveCurrentMed = (medName: string) => {
    setCurrentMedications(prev => prev.filter(m => m.toLowerCase() !== medName.toLowerCase()));
  };

  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  // Vitals State for Triage Assessment
  const [currentVitals, setCurrentVitals] = useState<VitalsInputContext>(() => {
    const list = storageService.getVitals();
    const latest = list && list.length > 0 ? list[list.length - 1] : null;
    return {
      bloodPressureSys: latest?.bloodPressureSys || 120,
      bloodPressureDia: latest?.bloodPressureDia || 80,
      heartRate: latest?.heartRate || 72,
      temperature: latest?.temperature || 98.6,
      bloodSugar: latest?.bloodSugar || 95,
      oxygenSaturation: 98,
      respiratoryRate: 16,
      weight: latest?.weight || 70
    };
  });

  // Triage Priority Assessment State
  const [triageAssessment, setTriageAssessment] = useState<TriagePriorityAssessment>(() => {
    return triagePriorityService.evaluateLocal(
      selectedSymptoms,
      {
        bloodPressureSys: 120,
        bloodPressureDia: 80,
        heartRate: 72,
        temperature: 98.6,
        bloodSugar: 95,
        oxygenSaturation: 98,
        respiratoryRate: 16
      },
      {
        age: patientAge,
        gender: patientGender,
        isPregnant,
        hasRenalDisease,
        hasHepaticDisease,
        knownAllergies,
        currentMedications
      }
    );
  });
  const [isEvaluatingWithGemini, setIsEvaluatingWithGemini] = useState(false);

  // Automatically update local triage priority whenever symptoms, vitals, or patient profile changes
  useEffect(() => {
    const patientContext: Partial<PatientProfile> = {
      age: patientAge,
      gender: patientGender,
      isPregnant,
      hasRenalDisease,
      hasHepaticDisease,
      knownAllergies,
      currentMedications
    };
    const assessment = triagePriorityService.evaluateLocal(selectedSymptoms, currentVitals, patientContext);
    setTriageAssessment(assessment);
  }, [
    selectedSymptoms,
    currentVitals,
    patientAge,
    patientGender,
    isPregnant,
    hasRenalDisease,
    hasHepaticDisease,
    knownAllergies,
    currentMedications
  ]);

  // Handle explicit AI Gemini Triage Sync
  const handleRefreshGeminiTriage = async () => {
    setIsEvaluatingWithGemini(true);
    try {
      const patientContext: Partial<PatientProfile> = {
        age: patientAge,
        gender: patientGender,
        isPregnant,
        hasRenalDisease,
        hasHepaticDisease,
        knownAllergies,
        currentMedications
      };
      const result = await triagePriorityService.evaluateWithGemini(selectedSymptoms, currentVitals, patientContext);
      setTriageAssessment(result);
    } catch (err) {
      console.error('Gemini triage refresh error:', err);
    } finally {
      setIsEvaluatingWithGemini(false);
    }
  };

  const handleTransmitTriageToDoctor = () => {
    storageService.notifyDoctorOfVitalsAlert(
      {
        id: `triage-escalate-${Date.now()}`,
        metric: 'blood_pressure',
        metricLabel: 'Clinical Triage Priority',
        severity: triageAssessment.urgencyLevel === 'Emergency' ? 'critical' : 'warning',
        title: `Triage Priority: ${triageAssessment.priorityLabel} (${triageAssessment.urgencyLevel})`,
        currentValue: `${selectedSymptoms.length} Symptoms, BP ${currentVitals.bloodPressureSys}/${currentVitals.bloodPressureDia} mmHg, HR ${currentVitals.heartRate} BPM`,
        safeRange: 'Stable / Outpatient',
        message: `${triageAssessment.chiefRiskFactor}. ${triageAssessment.clinicalRationale}`,
        clinicalSuggestion: triageAssessment.suggestedActionDirectives[0] || 'Urgent physician evaluation.',
        timestamp: new Date().toISOString(),
        status: 'escalated_to_doctor'
      },
      currentUser
    );

    if (onNavigateToDoctorPortal) {
      onNavigateToDoctorPortal();
    }
  };

  // Handle adding voice-dictated symptoms
  const handleApplyVoiceSymptoms = (newSymptoms: SymptomInput[]) => {
    setSelectedSymptoms(prev => {
      const existingMap = new Map(prev.map(s => [s.symptomId, s]));
      newSymptoms.forEach(newSym => {
        existingMap.set(newSym.symptomId, newSym);
      });
      return Array.from(existingMap.values());
    });
  };

  // Filter symptoms based on search and category
  const filteredSymptoms = SYMPTOMS_DATA.filter(sym => {
    const matchesSearch =
      sym.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sym.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sym.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || sym.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const isSelected = (symId: string) => {
    return selectedSymptoms.some(s => s.symptomId === symId);
  };

  const toggleSymptom = (symId: string) => {
    if (isSelected(symId)) {
      setSelectedSymptoms(prev => prev.filter(s => s.symptomId !== symId));
    } else {
      setSelectedSymptoms(prev => [
        ...prev,
        { symptomId: symId, severity: 'Moderate', durationDays: 3 }
      ]);
    }
  };

  const updateSeverity = (symId: string, severity: 'Mild' | 'Moderate' | 'Severe') => {
    setSelectedSymptoms(prev =>
      prev.map(s => (s.symptomId === symId ? { ...s, severity } : s))
    );
  };

  const updateDuration = (symId: string, durationDays: number) => {
    setSelectedSymptoms(prev =>
      prev.map(s => (s.symptomId === symId ? { ...s, durationDays } : s))
    );
  };

  const removeSymptom = (symId: string) => {
    setSelectedSymptoms(prev => prev.filter(s => s.symptomId !== symId));
  };

  const clearAllSymptoms = () => {
    setSelectedSymptoms([]);
    setErrorMsg(null);
  };

  const handleRunPrediction = () => {
    if (selectedSymptoms.length === 0) {
      setErrorMsg('Please select at least 1 symptom to perform a clinical diagnosis.');
      return;
    }
    setErrorMsg(null);
    setIsAnalyzing(true);

    setTimeout(() => {
      try {
        const patientContext: PatientProfile = {
          ...currentUser.profile,
          age: patientAge,
          gender: patientGender,
          isPregnant,
          hasRenalDisease,
          hasHepaticDisease,
          knownAllergies,
          currentMedications
        };

        const result = runDiseasePrediction(selectedSymptoms, selectedModel, patientContext);

        // Explicitly execute service layer cross-reference against newly recommended medications
        const safetyReport = medicationSafetyService.crossReference({
          recommendedMedicines: result.recommendedMedicines,
          knownAllergies,
          currentMedications,
          patientProfile: patientContext
        });

        const enrichedResult: PredictionResult = {
          ...result,
          patientId: currentUser.id,
          patientName: currentUser.name,
          patientAge,
          patientGender,
          safetyAudit: safetyReport,
          triageAssessment,
          doctorOrder: undefined // Transmitted to Doctor consultation queue!
        };
        setPredictionResult(enrichedResult);
        onSavePrediction(enrichedResult);

        // Immediate Warning: Alert user as soon as an interaction or allergy conflict is detected!
        if (safetyReport.hasConflicts) {
          setImmediateSafetyWarning(safetyReport);
          setShowWarningDetails(true);
        } else {
          setImmediateSafetyWarning(null);
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'An error occurred during model inference.');
      } finally {
        setIsAnalyzing(false);
      }
    }, 450); // slight smooth calculation delay
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-teal-700 font-bold text-xs uppercase tracking-wider mb-1">
            <HeartPulse className="w-4 h-4" />
            <span>Multi-Model Clinical Diagnostic Suite</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Symptom Checker & Triage</h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Select patient symptoms, adjust clinical severity and durations, and execute ML classification algorithms.
          </p>
        </div>

        {/* Model Selector Bar */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-1.5 rounded-xl shrink-0">
          <span className="text-xs font-semibold text-slate-500 pl-2">Engine:</span>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value as any)}
            className="bg-white border border-slate-200 rounded-lg text-xs font-bold text-teal-900 px-3 py-1.5 outline-hidden cursor-pointer shadow-2xs"
          >
            <option value="Ensemble Weighted">Ensemble Weighted (97.4% Acc - Champion)</option>
            <option value="Random Forest">Random Forest (96.8% Acc - Forest)</option>
          </select>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs sm:text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* AI-Driven Triage Priority Urgency Indicator */}
      <TriagePriorityIndicator
        assessment={triageAssessment}
        vitals={currentVitals}
        onUpdateVitals={setCurrentVitals}
        onRefreshGeminiTriage={handleRefreshGeminiTriage}
        isEvaluatingWithGemini={isEvaluatingWithGemini}
        currentUser={currentUser}
        onTransmitToDoctor={handleTransmitTriageToDoctor}
        symptomCount={selectedSymptoms.length}
      />

      {/* Immediate Medication Interaction & Allergy Warning Alert Banner */}
      {immediateSafetyWarning && immediateSafetyWarning.hasConflicts && (
        <div className="rounded-2xl border-2 border-rose-500 bg-rose-50/95 p-5 sm:p-6 shadow-md transition-all animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-rose-600 text-white">
                    Immediate Safety Guard Warning
                  </span>
                  <span className="text-xs font-bold text-rose-900">
                    {immediateSafetyWarning.totalWarningsCount} Safety Conflict{immediateSafetyWarning.totalWarningsCount > 1 ? 's' : ''} Detected
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-rose-950 mt-1">
                  Contraindication & Adverse Interaction Alert
                </h3>
                <p className="text-xs sm:text-sm text-rose-800 mt-1 leading-relaxed">
                  {immediateSafetyWarning.summaryText}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setShowWarningDetails(!showWarningDetails)}
                className="px-3 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-900 text-xs font-bold transition-colors cursor-pointer"
              >
                {showWarningDetails ? 'Hide Breakdown' : 'Show Breakdown'}
              </button>
              {predictionResult && (
                <button
                  type="button"
                  onClick={() => setPredictionResult(predictionResult)}
                  className="px-3.5 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
                >
                  View Clinical Summary →
                </button>
              )}
            </div>
          </div>

          {/* Expanded Breakdown */}
          {showWarningDetails && (
            <div className="mt-4 pt-4 border-t border-rose-200 space-y-3">
              {/* Allergy Conflicts */}
              {immediateSafetyWarning.allergyConflicts.map((ac, idx) => (
                <div key={`allergy-card-${idx}`} className="bg-white rounded-xl p-4 border border-rose-300 shadow-2xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-700 text-white">
                        Documented Allergy Conflict
                      </span>
                      <span className="font-bold text-slate-900 text-sm">{ac.medicineName}</span>
                      <span className="text-xs text-rose-600 font-semibold">vs Documented Allergy: {ac.allergy}</span>
                    </div>
                    <span className="text-xs font-bold text-rose-700">Severity: {ac.severity}</span>
                  </div>
                  <p className="text-xs text-slate-700 mt-1.5 leading-relaxed">
                    <strong>Mechanism:</strong> {ac.mechanism}
                  </p>
                  <div className="mt-2 text-xs text-emerald-900 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                    <strong>Recommended Safe Alternative:</strong> {ac.recommendedAlternative}
                  </div>
                </div>
              ))}

              {/* Drug-Drug Interactions */}
              {immediateSafetyWarning.interactionConflicts.map((ic, idx) => (
                <div key={`interaction-card-${idx}`} className="bg-white rounded-xl p-4 border border-amber-300 shadow-2xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-600 text-white">
                        Drug-Drug Collision
                      </span>
                      <span className="font-bold text-slate-900 text-sm">{ic.recommendedMedicine}</span>
                      <span className="text-xs text-slate-500">↔ Current Medication:</span>
                      <span className="font-bold text-slate-900 text-xs">{ic.currentMedicine}</span>
                    </div>
                    <span className={`text-xs font-bold ${ic.severity === 'Severe' ? 'text-rose-600' : 'text-amber-700'}`}>
                      {ic.severity} Severity
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 mt-1.5 leading-relaxed">
                    <strong>Adverse Clinical Effect:</strong> {ic.clinicalEffect}
                  </p>
                  <div className="mt-2 text-xs text-amber-950 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                    <strong>Clinical Action:</strong> {ic.recommendation}
                  </div>
                </div>
              ))}

              {/* Duplicate Therapies */}
              {immediateSafetyWarning.duplicateConflicts.map((dc, idx) => (
                <div key={`dup-card-${idx}`} className="bg-white rounded-xl p-3.5 border border-purple-200 text-xs text-purple-900">
                  <div className="flex items-center gap-2 font-bold mb-1">
                    <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-black bg-purple-100 text-purple-800">
                      Duplicate Therapy
                    </span>
                    <span>{dc.medicine} with active {dc.currentMedicine}</span>
                  </div>
                  <p className="text-slate-600">{dc.warning}</p>
                </div>
              ))}

              {/* Organ Cautions */}
              {immediateSafetyWarning.organCautions.map((oc, idx) => (
                <div key={`organ-card-${idx}`} className="bg-white rounded-xl p-3.5 border border-blue-200 text-xs text-blue-900">
                  <div className="font-bold mb-0.5">Organ Caution: {oc.condition} ({oc.medicineName})</div>
                  <p className="text-slate-600">{oc.recommendation}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Grid: Left = Symptom Library, Right = Selected & Patient Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Symptom Catalog (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-teal-600" />
              <span>Symptom Directory ({SYMPTOMS_DATA.length} Standardized Features)</span>
            </h3>
            <span className="text-xs text-slate-400">Click to select/unselect</span>
          </div>

          {/* Search Box & Voice Dictation Button */}
          <div className="flex items-center gap-2 mb-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search symptoms (e.g., fever, cough, chest pain, itching)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-teal-500 outline-hidden transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Voice Dictation Microphone Button */}
            <button
              type="button"
              onClick={() => setIsVoiceModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200/80 font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs hover:shadow-xs cursor-pointer shrink-0 group"
              title="Describe symptoms verbally using microphone (Web Speech API)"
            >
              <Mic className="w-4 h-4 text-teal-600 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Voice Dictation</span>
            </button>
          </div>

          {/* Voice Prompt Hint */}
          <div className="mb-3 px-3 py-2 rounded-xl bg-linear-to-r from-teal-50/70 via-slate-50 to-emerald-50/70 border border-teal-100 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2 truncate">
              <div className="w-5 h-5 rounded-md bg-teal-600 text-white flex items-center justify-center shrink-0">
                <Mic className="w-3 h-3" />
              </div>
              <span className="truncate text-[11px] sm:text-xs">
                Describe symptoms by voice: <em>"high fever, chills, and headache for 3 days"</em>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsVoiceModalOpen(true)}
              className="text-teal-700 hover:text-teal-900 font-bold text-[11px] shrink-0 cursor-pointer ml-2 hover:underline"
            >
              Speak Now →
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 no-scrollbar">
            {SYMPTOM_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-teal-600 text-white shadow-2xs font-semibold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Symptom Chips List */}
          <div className="flex-1 overflow-y-auto max-h-[460px] pr-1 space-y-1.5">
            {filteredSymptoms.map((sym) => {
              const active = isSelected(sym.id);
              return (
                <div
                  key={sym.id}
                  onClick={() => toggleSymptom(sym.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                    active
                      ? 'bg-teal-50/80 border-teal-500 shadow-2xs'
                      : 'bg-slate-50/60 hover:bg-white hover:border-slate-300 border-slate-200/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold transition-colors ${
                        active
                          ? 'bg-teal-600 text-white'
                          : 'border border-slate-300 group-hover:border-teal-400 bg-white'
                      }`}
                    >
                      {active ? <Check className="w-3.5 h-3.5" /> : null}
                    </div>
                    <div>
                      <div className="font-semibold text-xs sm:text-sm text-slate-800 flex items-center gap-2">
                        <span>{sym.displayName}</span>
                        {sym.severityWeight >= 4 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-700">
                            High Priority
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">
                        {sym.description}
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-400 font-medium px-2 py-0.5 rounded bg-slate-100 hidden sm:inline-block">
                    {sym.category}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Symptoms, Patient Context & Run Analysis (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Selected Symptoms Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
                <h3 className="font-bold text-slate-900 text-sm">
                  Active Clinical Inputs ({selectedSymptoms.length})
                </h3>
              </div>
              {selectedSymptoms.length > 0 && (
                <button
                  onClick={clearAllSymptoms}
                  className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {selectedSymptoms.length === 0 ? (
              <div className="text-center py-8 px-4 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <HeartPulse className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <div className="text-xs font-semibold text-slate-600">No symptoms selected</div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Pick symptoms from the catalog on the left to configure severity and duration.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                {selectedSymptoms.map((input) => {
                  const symMeta = SYMPTOMS_DATA.find(s => s.id === input.symptomId);
                  return (
                    <div
                      key={input.symptomId}
                      className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-slate-50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-slate-800 text-xs">
                          {symMeta?.displayName || input.symptomId}
                        </span>
                        <button
                          onClick={() => removeSymptom(input.symptomId)}
                          className="text-slate-400 hover:text-rose-600 p-0.5 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <label className="text-slate-400 block mb-0.5">Severity</label>
                          <select
                            value={input.severity}
                            onChange={(e) => updateSeverity(input.symptomId, e.target.value as any)}
                            className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 font-medium text-slate-700 outline-hidden"
                          >
                            <option value="Mild">Mild</option>
                            <option value="Moderate">Moderate</option>
                            <option value="Severe">Severe</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-slate-400 block mb-0.5">Duration (Days)</label>
                          <input
                            type="number"
                            min="1"
                            max="60"
                            value={input.durationDays}
                            onChange={(e) => updateDuration(input.symptomId, parseInt(e.target.value) || 1)}
                            className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 font-medium text-slate-700 outline-hidden"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Patient Context & Contraindication Filter */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-1.5">
              <User className="w-4 h-4 text-teal-600" />
              <span>Patient Profile & Safety Filters</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs mb-3">
              <div>
                <label className="text-slate-500 block mb-1">Patient Age</label>
                <input
                  type="number"
                  value={patientAge}
                  onChange={(e) => setPatientAge(parseInt(e.target.value) || 30)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-slate-500 block mb-1">Biological Gender</label>
                <select
                  value={patientGender}
                  onChange={(e) => setPatientGender(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Checkbox safety flags */}
            <div className="space-y-2 text-xs text-slate-700 border-t border-slate-100 pt-3">
              {patientGender === 'female' && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPregnant}
                    onChange={(e) => setIsPregnant(e.target.checked)}
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span>Pregnant / Lactating (Filter Teratogens Cat D/X)</span>
                </label>
              )}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasRenalDisease}
                  onChange={(e) => setHasRenalDisease(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span>History of Chronic Kidney Disease (Renal dose check)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasHepaticDisease}
                  onChange={(e) => setHasHepaticDisease(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span>Hepatic Impairment / Liver Disease (Hepatotoxicity warning)</span>
              </label>
            </div>

            {/* Documented Known Allergies Section */}
            <div className="border-t border-slate-100 pt-3 mt-3">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                  <span>Documented Known Allergies</span>
                </label>
                <span className="text-[10px] text-slate-400 font-medium">Cross-referenced</span>
              </div>

              {/* Tag chips */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {knownAllergies.length === 0 ? (
                  <span className="text-xs text-slate-400 italic">No allergies recorded</span>
                ) : (
                  knownAllergies.map(allergy => (
                    <span
                      key={allergy}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200 text-xs font-semibold"
                    >
                      <span>{allergy}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAllergy(allergy)}
                        className="text-rose-500 hover:text-rose-700 cursor-pointer font-bold text-[11px]"
                        title={`Remove ${allergy}`}
                      >
                        ✕
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Add Allergy Input */}
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="Add allergy (e.g. Sulfa, Aspirin)..."
                  value={allergyInput}
                  onChange={(e) => setAllergyInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddAllergy(allergyInput);
                    }
                  }}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs outline-hidden focus:bg-white focus:border-rose-400"
                />
                <button
                  type="button"
                  onClick={() => handleAddAllergy(allergyInput)}
                  className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer transition-colors"
                >
                  + Add
                </button>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-1 mt-1.5 text-[10px] text-slate-500">
                <span className="text-slate-400">Presets:</span>
                {['Penicillin', 'Sulfa', 'Aspirin', 'Opioids'].map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleAddAllergy(preset)}
                    className="hover:text-rose-600 underline cursor-pointer"
                  >
                    +{preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Current Active Medications Section */}
            <div className="border-t border-slate-100 pt-3 mt-3">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Pill className="w-3.5 h-3.5 text-teal-600" />
                  <span>Current Active Medications</span>
                </label>
                <span className="text-[10px] text-slate-400 font-medium">Drug-drug guard</span>
              </div>

              {/* Tag chips */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {currentMedications.length === 0 ? (
                  <span className="text-xs text-slate-400 italic">No current medications</span>
                ) : (
                  currentMedications.map(med => (
                    <span
                      key={med}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200 text-xs font-semibold capitalize"
                    >
                      <span>{med}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCurrentMed(med)}
                        className="text-teal-600 hover:text-teal-800 cursor-pointer font-bold text-[11px]"
                        title={`Remove ${med}`}
                      >
                        ✕
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Add Medication Input */}
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="Add current med (e.g. losartan, ibuprofen)..."
                  value={medicationInput}
                  onChange={(e) => setMedicationInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCurrentMed(medicationInput);
                    }
                  }}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs outline-hidden focus:bg-white focus:border-teal-400"
                />
                <button
                  type="button"
                  onClick={() => handleAddCurrentMed(medicationInput)}
                  className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold cursor-pointer transition-colors"
                >
                  + Add
                </button>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-1 mt-1.5 text-[10px] text-slate-500">
                <span className="text-slate-400">Presets:</span>
                {['paracetamol', 'ibuprofen', 'losartan', 'metformin', 'amoxicillin'].map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleAddCurrentMed(preset)}
                    className="hover:text-teal-700 underline cursor-pointer capitalize"
                  >
                    +{preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Cross-Reference Status Footer */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-emerald-700 font-semibold bg-emerald-50/60 p-2 rounded-lg">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Safety Guard Active</span>
              </span>
              <span className="text-[10px] text-slate-500">
                Allergy & Drug-Drug Audit
              </span>
            </div>
          </div>

          {/* Action Trigger Button */}
          <button
            onClick={handleRunPrediction}
            disabled={isAnalyzing || selectedSymptoms.length === 0}
            className="w-full py-3.5 px-6 rounded-xl bg-linear-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-teal-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isAnalyzing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Executing {selectedModel} Inference...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Run Diagnostic & Medicine Triage</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Modal Result Pop-up */}
      {predictionResult && (
        <PredictionResultModal
          result={predictionResult}
          onClose={() => setPredictionResult(null)}
          onViewMedicine={onViewMedicine}
        />
      )}

      {/* Voice Dictation Web Speech Modal */}
      <VoiceSymptomModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onApplySymptoms={handleApplyVoiceSymptoms}
        onSetSearchQuery={(q) => setSearchQuery(q)}
        existingSymptomIds={selectedSymptoms.map(s => s.symptomId)}
      />
    </div>
  );
};
