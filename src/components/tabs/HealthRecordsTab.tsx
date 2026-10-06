import React, { useState } from 'react';
import {
  Activity,
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Download,
  FileDown,
  FileSpreadsheet,
  FileText,
  Heart,
  History,
  Pill,
  Plus,
  Printer,
  Scale,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Trash2,
  TrendingUp,
  User,
  Users,
  Zap
} from 'lucide-react';
import { HealthMetric, PatientProfile, PredictionResult, PrescriptionScanResult, UserRecord } from '../../types';
import { LabReportAnalyzerSection } from '../healthRecords/LabReportAnalyzerSection';
import { VitalsHistoricalTrendChart } from '../healthRecords/VitalsHistoricalTrendChart';
import { WeeklyVitalsAgeComparisonChart } from '../healthRecords/WeeklyVitalsAgeComparisonChart';
import { CircadianVitalsHeatmap } from '../healthRecords/CircadianVitalsHeatmap';
import { BmiCalculatorUtility } from '../healthRecords/BmiCalculatorUtility';
import { ClinicalProgressNoteModal } from '../healthRecords/ClinicalProgressNoteModal';
import { PatientPdfReportService } from '../../services/pdfReportService';
import { storageService } from '../../services/storageService';

interface HealthRecordsTabProps {
  currentUser: UserRecord;
  onUpdateUser: (user: UserRecord) => void;
  predictions: PredictionResult[];
  prescriptions: PrescriptionScanResult[];
  vitals: HealthMetric[];
  onAddVital: (vital: HealthMetric) => void;
  onSelectPrediction: (pred: PredictionResult) => void;
  onNavigateToDoctorPortal?: () => void;
}

export const HealthRecordsTab: React.FC<HealthRecordsTabProps> = ({
  currentUser,
  onUpdateUser,
  predictions,
  prescriptions,
  vitals,
  onAddVital,
  onSelectPrediction,
  onNavigateToDoctorPortal
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'vitals' | 'heatmap' | 'bmi' | 'lab-reports' | 'diagnoses' | 'prescriptions' | 'profile'>('vitals');
  const [vitalsChartMode, setVitalsChartMode] = useState<'weekly-norms' | 'chronological' | 'heatmap'>('weekly-norms');

  // New vital state
  const [bpSys, setBpSys] = useState('120');
  const [bpDia, setBpDia] = useState('80');
  const [glucose, setGlucose] = useState('95');
  const [heartRate, setHeartRate] = useState('72');
  const [temperature, setTemperature] = useState('98.6');
  const [weight, setWeight] = useState('70');
  const [notes, setNotes] = useState('');

  // Profile editing
  const [profileName, setProfileName] = useState(currentUser.name);
  const [profileAge, setProfileAge] = useState(currentUser.profile.age);
  const [profileHeight, setProfileHeight] = useState(currentUser.profile.heightCm || 175);
  const [profileRole, setProfileRole] = useState<'patient' | 'doctor' | 'admin'>(currentUser.role);
  const [allergiesText, setAllergiesText] = useState(currentUser.profile.knownAllergies.join(', '));
  const [profileSaved, setProfileSaved] = useState(false);

  // PDF Generation State
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isGeneratingProgressNote, setIsGeneratingProgressNote] = useState(false);
  const [progressNoteModalOpen, setProgressNoteModalOpen] = useState(false);
  const [pdfSuccessMessage, setPdfSuccessMessage] = useState<string | null>(null);

  const handleDownloadPdfSummary = () => {
    setIsGeneratingPdf(true);
    setPdfSuccessMessage(null);
    try {
      const activeMedications = storageService.getMedicationSchedule();
      PatientPdfReportService.generatePdf({
        currentUser,
        vitals,
        predictions,
        prescriptions,
        activeMedications
      });
      setPdfSuccessMessage(`Clinical Visit Summary PDF generated for ${currentUser.name}! The document has been downloaded.`);
      setTimeout(() => {
        setPdfSuccessMessage(null);
      }, 5000);
    } catch (err: any) {
      console.error('Failed to generate PDF summary:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadProgressNote = () => {
    setIsGeneratingProgressNote(true);
    setPdfSuccessMessage(null);
    try {
      const activeMedications = storageService.getMedicationSchedule();
      PatientPdfReportService.generateClinicalProgressNotePdf({
        currentUser,
        vitals,
        predictions,
        prescriptions,
        activeMedications,
        physicianName: 'Dr. Sarah Mitchell, MD',
        clinicName: 'MedAssist Academic Health System'
      });
      setPdfSuccessMessage(`Official Clinical Progress Note (SOAP format PDF) exported successfully for ${currentUser.name}! Document downloaded.`);
      setTimeout(() => {
        setPdfSuccessMessage(null);
      }, 5000);
    } catch (err: any) {
      console.error('Failed to generate Progress Note PDF:', err);
    } finally {
      setIsGeneratingProgressNote(false);
    }
  };

  // Sync state if currentUser changes from outside
  React.useEffect(() => {
    setProfileName(currentUser.name);
    setProfileAge(currentUser.profile.age);
    setProfileHeight(currentUser.profile.heightCm || 175);
    setProfileRole(currentUser.role);
    setAllergiesText(currentUser.profile.knownAllergies.join(', '));
  }, [currentUser]);

  const handleSaveVital = (e: React.FormEvent) => {
    e.preventDefault();
    const newMetric: HealthMetric = {
      id: `vital_${Date.now()}`,
      date: new Date().toLocaleDateString(),
      bloodPressureSys: parseInt(bpSys) || 120,
      bloodPressureDia: parseInt(bpDia) || 80,
      bloodSugar: parseInt(glucose) || 95,
      heartRate: parseInt(heartRate) || 72,
      temperature: parseFloat(temperature) || 98.6,
      weight: parseFloat(weight) || 70,
      notes: notes || undefined
    };

    onAddVital(newMetric);
    setNotes('');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const allergies = allergiesText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    onUpdateUser({
      ...currentUser,
      role: profileRole,
      name: profileName,
      profile: {
        ...currentUser.profile,
        age: profileAge,
        heightCm: profileHeight,
        knownAllergies: allergies
      }
    });

    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-700 font-bold text-xs uppercase tracking-wider mb-1">
            <History className="w-4 h-4" />
            <span>Electronic Medical Record & Audit History</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Patient Health History & Vitals</h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Maintain personal biometric logs, review past AI diagnoses, and manage allergy profiles.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setProgressNoteModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs hover:shadow-sm transition-all cursor-pointer self-start md:self-auto"
            title="Preview & Export SOAP Clinical Progress Note PDF"
          >
            <FileText className="w-4 h-4 text-teal-400" />
            <span>Progress Note (PDF)</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPdfSummary}
            disabled={isGeneratingPdf}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs hover:shadow-sm transition-all cursor-pointer self-start md:self-auto"
            title="Download comprehensive clinical PDF visit summary"
          >
            {isGeneratingPdf ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4" />
                <span>Visit Summary (PDF)</span>
              </>
            )}
          </button>

          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start md:self-auto text-xs font-semibold">
            <button
              onClick={() => setActiveSubTab('vitals')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeSubTab === 'vitals' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Vitals & Logs
            </button>
            <button
              onClick={() => setActiveSubTab('heatmap')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'heatmap' ? 'bg-white text-teal-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-teal-600" />
              <span>24h Heatmap</span>
            </button>
            <button
              onClick={() => setActiveSubTab('bmi')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'bmi' ? 'bg-white text-teal-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Scale className="w-3.5 h-3.5 text-teal-600" />
              <span>BMI Calculator</span>
            </button>
            <button
              onClick={() => setActiveSubTab('lab-reports')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'lab-reports' ? 'bg-white text-teal-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Lab Reports (AI)</span>
            </button>
            <button
              onClick={() => setActiveSubTab('diagnoses')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeSubTab === 'diagnoses' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Past Diagnoses ({predictions.length})
            </button>
            <button
              onClick={() => setActiveSubTab('prescriptions')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeSubTab === 'prescriptions' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Prescriptions ({prescriptions.length})
            </button>
            <button
              onClick={() => setActiveSubTab('profile')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeSubTab === 'profile' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Patient Profile
            </button>
          </div>
        </div>
      </div>

      {/* Clinical Encounter Preparation & Doctor Summary Banner */}
      <div className="bg-linear-to-r from-teal-950 via-slate-900 to-slate-900 text-white rounded-2xl p-5 shadow-sm border border-teal-800/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-teal-400 font-bold text-xs uppercase tracking-wider">
              <Printer className="w-4 h-4 text-teal-300" />
              <span>Clinical Encounter Preparation</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Export Printable Clinical Visit Summary (PDF)
            </h3>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Generate a physician-ready clinical document consolidating your biometric vitals logs ({vitals.length} recorded), active prescriptions, latest AI symptom predictions ({predictions.length}), and allergy audit. Formatted for print or digital sharing during in-person and telehealth consultations.
            </p>

            {/* Quick Metrics Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
              <span className="px-2 py-0.5 rounded-md bg-white/10 text-teal-200 border border-teal-400/20 font-medium">
                Vitals Logs: <strong className="text-white">{vitals.length}</strong>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white/10 text-teal-200 border border-teal-400/20 font-medium">
                Diagnoses: <strong className="text-white">{predictions.length}</strong>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white/10 text-teal-200 border border-teal-400/20 font-medium">
                Active Regimen: <strong className="text-white">{storageService.getMedicationSchedule().filter(m => m.active !== false).length} Meds</strong>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white/10 text-teal-200 border border-teal-400/20 font-medium">
                Allergies: <strong className="text-white">{currentUser.profile.knownAllergies?.length || 0} Documented</strong>
              </span>
            </div>
          </div>

          <div className="shrink-0 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setProgressNoteModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4 text-teal-300" />
              <span>Preview SOAP Note</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadProgressNote}
              disabled={isGeneratingProgressNote}
              className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              {isGeneratingProgressNote ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Building Note...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  <span>Export Progress Note (PDF)</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadPdfSummary}
              disabled={isGeneratingPdf}
              className="px-4 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-teal-500/40 text-teal-300 font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              {isGeneratingPdf ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-teal-300 border-t-transparent rounded-full animate-spin" />
                  <span>Building...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  <span>Visit Summary (PDF)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {pdfSuccessMessage && (
          <div className="mt-3.5 p-3 rounded-xl bg-teal-800/60 border border-teal-400/50 text-teal-200 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-teal-300 shrink-0" />
            <span className="font-medium">{pdfSuccessMessage}</span>
          </div>
        )}
      </div>

      {/* Subtab: Vitals */}
      {activeSubTab === 'vitals' && (
        <div className="space-y-6">
          {/* Chart View Switcher: Weekly Norms vs Chronological Readings */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2 pl-2">
              <Activity className="w-4 h-4 text-teal-600" />
              <span className="text-xs font-bold text-slate-800">Biometric Visualization Engine:</span>
            </div>
            <div className="flex flex-wrap items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs text-xs font-semibold">
              <button
                type="button"
                onClick={() => setVitalsChartMode('weekly-norms')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  vitalsChartMode === 'weekly-norms'
                    ? 'bg-teal-600 text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Weekly Averages vs. Age Norms</span>
              </button>
              <button
                type="button"
                onClick={() => setVitalsChartMode('chronological')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  vitalsChartMode === 'chronological'
                    ? 'bg-teal-600 text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>All Chronological Logs</span>
              </button>
              <button
                type="button"
                onClick={() => setVitalsChartMode('heatmap')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  vitalsChartMode === 'heatmap'
                    ? 'bg-teal-600 text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-amber-300" />
                <span>24-Hour Diurnal Heatmap (Recharts)</span>
              </button>
            </div>
          </div>

          {/* Conditional Multi-Line Chart: Weekly vs Age Norms, Chronological, or 24-Hour Heatmap */}
          {vitalsChartMode === 'heatmap' ? (
            <CircadianVitalsHeatmap
              vitals={vitals}
              currentUser={currentUser}
              onOpenVitalForm={() => {
                const el = document.getElementById('log-vital-form-card');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />
          ) : vitalsChartMode === 'weekly-norms' ? (
            <WeeklyVitalsAgeComparisonChart
              vitals={vitals}
              currentUser={currentUser}
              onOpenVitalForm={() => {
                const el = document.getElementById('log-vital-form-card');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />
          ) : (
            <VitalsHistoricalTrendChart
              vitals={vitals}
              patientName={currentUser.name}
              onOpenVitalForm={() => {
                const el = document.getElementById('log-vital-form-card');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />
          )}

          {/* Quick Anthropometric BMI Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Anthropometric BMI Status</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {(Number((vitals && vitals.length > 0 ? vitals[vitals.length - 1]?.weight : null) || currentUser.profile.weightKg || 72) / Math.pow((currentUser.profile.heightCm || 175) / 100, 2)).toFixed(1)} kg/m² • Normal Weight
                  </span>
                </h4>
                <p className="text-xs text-slate-500">
                  Height: <strong>{currentUser.profile.heightCm || 175} cm</strong> • Recorded Weight: <strong>{(vitals && vitals.length > 0 ? vitals[vitals.length - 1]?.weight : null) || currentUser.profile.weightKg || 72} kg</strong>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveSubTab('bmi')}
              className="px-3.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold border border-teal-200 flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
            >
              <span>Open Color-Coded BMI Gauge</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* New Vital Entry Form (5 cols) */}
            <div id="log-vital-form-card" className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4 text-teal-600" />
                <span>Log New Health Biomarkers</span>
              </h3>

            <form onSubmit={handleSaveVital} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-500 font-semibold block mb-1">Blood Pressure (Systolic)</label>
                  <input
                    type="number"
                    value={bpSys}
                    onChange={(e) => setBpSys(e.target.value)}
                    placeholder="120"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-500 font-semibold block mb-1">BP (Diastolic)</label>
                  <input
                    type="number"
                    value={bpDia}
                    onChange={(e) => setBpDia(e.target.value)}
                    placeholder="80"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-500 font-semibold block mb-1">Blood Glucose (mg/dL)</label>
                  <input
                    type="number"
                    value={glucose}
                    onChange={(e) => setGlucose(e.target.value)}
                    placeholder="95"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
                  />
                </div>
                <div>
                  <label className="text-slate-500 font-semibold block mb-1">Heart Rate (BPM)</label>
                  <input
                    type="number"
                    value={heartRate}
                    onChange={(e) => setHeartRate(e.target.value)}
                    placeholder="72"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-500 font-semibold block mb-1">Temperature (°F)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    placeholder="98.6"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
                  />
                </div>
                <div>
                  <label className="text-slate-500 font-semibold block mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="70"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-500 font-semibold block mb-1">Notes / Context (Optional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Post-exercise, fasting morning reading"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-colors cursor-pointer shadow-xs mt-2"
              >
                Record Health Biomarkers
              </button>
            </form>
          </div>

          {/* Vitals History Table (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h3 className="font-bold text-slate-900 text-base mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-600" />
              <span>Biometric Trend Log</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">BP (mmHg)</th>
                    <th className="py-2.5 px-3">Glucose</th>
                    <th className="py-2.5 px-3">Pulse</th>
                    <th className="py-2.5 px-3">Temp</th>
                    <th className="py-2.5 px-3">Weight</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {vitals.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 text-slate-500">{v.date}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">
                        {v.bloodPressureSys}/{v.bloodPressureDia}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">{v.bloodSugar} mg/dL</td>
                      <td className="py-2.5 px-3 text-slate-700">{v.heartRate} bpm</td>
                      <td className="py-2.5 px-3 text-slate-700">{v.temperature}°F</td>
                      <td className="py-2.5 px-3 text-slate-700">{v.weight} kg</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Subtab: Dedicated 24-Hour Diurnal Heatmap View */}
      {activeSubTab === 'heatmap' && (
        <div className="space-y-6">
          <CircadianVitalsHeatmap
            vitals={vitals}
            currentUser={currentUser}
            onOpenVitalForm={() => {
              setActiveSubTab('vitals');
              setTimeout(() => {
                const el = document.getElementById('log-vital-form-card');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
          />
        </div>
      )}

      {/* Subtab: BMI Calculator & Color-Coded Gauge */}
      {activeSubTab === 'bmi' && (
        <BmiCalculatorUtility
          currentUser={currentUser}
          onUpdateUser={onUpdateUser}
          vitals={vitals}
        />
      )}

      {/* Subtab: Lab Reports & AI Anomaly Parser */}
      {activeSubTab === 'lab-reports' && (
        <LabReportAnalyzerSection
          currentUser={currentUser}
          onNavigateToDoctorPortal={onNavigateToDoctorPortal}
        />
      )}

      {/* Subtab: Diagnoses */}
      {activeSubTab === 'diagnoses' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h3 className="font-bold text-slate-900 text-base mb-4">
            Diagnostic Inference Audit Trail ({predictions.length} Total)
          </h3>

          {predictions.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              No historical predictions logged yet. Run the Symptom Checker to generate clinical reports.
            </div>
          ) : (
            <div className="space-y-3">
              {predictions.map((pred) => (
                <div
                  key={pred.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-teal-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{pred.predictedDisease.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold">
                        {pred.confidence}% Match
                      </span>
                      <span className="text-xs text-slate-400 font-mono">ICD-10: {pred.predictedDisease.icd10}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Engine: <strong>{pred.modelUsed}</strong> • {new Date(pred.timestamp).toLocaleString()} • {pred.inputSymptoms.length} Symptoms Evaluated
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectPrediction(pred)}
                    className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold cursor-pointer self-start sm:self-auto"
                  >
                    View Full Clinical Report →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Subtab: Prescriptions */}
      {activeSubTab === 'prescriptions' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h3 className="font-bold text-slate-900 text-base mb-4">
            Scanned Prescriptions Archive ({prescriptions.length})
          </h3>

          {prescriptions.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              No prescription slips recorded yet. Upload a prescription image via the Prescription OCR tab.
            </div>
          ) : (
            <div className="space-y-4">
              {prescriptions.map((scan) => (
                <div key={scan.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{scan.doctorName}</h4>
                      <p className="text-xs text-slate-500">{scan.clinicName} • Date: {scan.date}</p>
                    </div>
                    <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                      {scan.medications.length} Medications
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {scan.medications.map((m, mIdx) => (
                      <div key={mIdx} className="p-2 bg-white rounded-lg border border-slate-200 text-xs">
                        <span className="font-bold text-slate-800">{m.medicineName}</span>
                        <div className="text-[11px] text-slate-500">{m.dosage} • {m.frequency}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Subtab: Patient Profile */}
      {activeSubTab === 'profile' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-xl">
          <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-teal-600" />
            <span>Update Clinical Patient Profile</span>
          </h3>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Assigned Account Role</label>
              <select
                value={profileRole}
                onChange={(e) => {
                  const newRole = e.target.value as 'patient' | 'doctor' | 'admin';
                  setProfileRole(newRole);
                  if (newRole === 'doctor' && profileName === 'Alex Johnson') {
                    setProfileName('Dr. Sarah Mitchell, MD');
                  } else if (newRole === 'admin' && profileName === 'Alex Johnson') {
                    setProfileName('Admin Supervisor');
                  }
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium cursor-pointer"
              >
                <option value="patient">👤 Patient (Alex Johnson)</option>
                <option value="doctor">🩺 Doctor MD (Dr. Sarah Mitchell, MD)</option>
                <option value="admin">🛡️ System Admin (Admin Supervisor)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-600 font-semibold block mb-1">Full Legal Name</label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-600 font-semibold block mb-1">Patient Age</label>
                <input
                  type="number"
                  value={profileAge}
                  onChange={(e) => setProfileAge(parseInt(e.target.value) || 30)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
                />
              </div>
              <div>
                <label className="text-slate-600 font-semibold block mb-1">Height (cm)</label>
                <input
                  type="number"
                  value={profileHeight}
                  onChange={(e) => setProfileHeight(parseInt(e.target.value) || 175)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-600 font-semibold block mb-1">
                Known Drug Allergies (Comma-separated)
              </label>
              <input
                type="text"
                value={allergiesText}
                onChange={(e) => setAllergiesText(e.target.value)}
                placeholder="e.g. Penicillin, Sulfa, Aspirin"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Any medicine containing these allergens will be flagged with a critical contraindication banner during recommendation.
              </span>
            </div>

            <button
              type="submit"
              className="py-2.5 px-6 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              Update Patient Record
            </button>

            {profileSaved && (
              <span className="text-xs font-semibold text-emerald-600 ml-3">
                Profile updated successfully!
              </span>
            )}
          </form>
        </div>
      )}

      {/* Clinical Progress Note SOAP Modal Dialog */}
      <ClinicalProgressNoteModal
        isOpen={progressNoteModalOpen}
        onClose={() => setProgressNoteModalOpen(false)}
        currentUser={currentUser}
        vitals={vitals}
        predictions={predictions}
        prescriptions={prescriptions}
      />
    </div>
  );
};
