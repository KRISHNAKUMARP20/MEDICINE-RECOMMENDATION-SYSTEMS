import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Award,
  Bot,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Clock,
  ExternalLink,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  HeartPulse,
  Info,
  Layers,
  Pill,
  Plus,
  RefreshCw,
  Search,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Trash2,
  Upload,
  User,
  X,
  Zap
} from 'lucide-react';
import { LabAnomaly, LabReportAnalysisResult, LabTestItem, PatientProfile, UserRecord } from '../../types';
import { labReportService, SAMPLE_LAB_PRESETS } from '../../services/labReportService';
import { storageService } from '../../services/storageService';

interface LabReportAnalyzerSectionProps {
  currentUser: UserRecord;
  onNavigateToDoctorPortal?: () => void;
}

export const LabReportAnalyzerSection: React.FC<LabReportAnalyzerSectionProps> = ({
  currentUser,
  onNavigateToDoctorPortal
}) => {
  const [labText, setLabText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<LabReportAnalysisResult | null>(null);
  const [savedReports, setSavedReports] = useState<LabReportAnalysisResult[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'anomalies_only'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [escalatedStatus, setEscalatedStatus] = useState<string | null>(null);
  const [viewRawText, setViewRawText] = useState(false);

  // Load saved reports from storage
  useEffect(() => {
    setSavedReports(labReportService.getSavedReports());

    const handleUpdate = () => {
      setSavedReports(labReportService.getSavedReports());
    };

    window.addEventListener('medassist:lab-reports-updated', handleUpdate);
    return () => {
      window.removeEventListener('medassist:lab-reports-updated', handleUpdate);
    };
  }, []);

  // Handle Preset selection
  const handleSelectPreset = (sampleText: string) => {
    setLabText(sampleText);
    setErrorMsg(null);
  };

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setLabText(content);
      }
    };

    reader.onerror = () => {
      setErrorMsg('Failed to read the uploaded lab report file. Please paste the report text directly.');
    };

    // If text-like file, read as text
    if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.csv') || file.name.endsWith('.json')) {
      reader.readAsText(file);
    } else {
      // Read as text or inform user
      reader.readAsText(file);
    }
  };

  // Execute Analysis
  const handleRunAnalysis = async () => {
    if (!labText.trim()) {
      setErrorMsg('Please paste or upload laboratory test results text first.');
      return;
    }

    setErrorMsg(null);
    setIsAnalyzing(true);
    setEscalatedStatus(null);

    try {
      const result = await labReportService.analyzeReport(labText, currentUser.profile);
      setCurrentAnalysis(result);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to analyze lab report. Please check input text format.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Transmit to Doctor Portal
  const handleEscalateToDoctor = (report: LabReportAnalysisResult) => {
    const notif = storageService.notifyDoctorOfVitalsAlert(
      {
        id: `lab-notif-${report.id}`,
        metric: 'blood_pressure', // general metric type
        metricLabel: 'Laboratory Panel',
        severity: report.riskLevel === 'Critical' ? 'critical' : 'warning',
        title: `Lab Report: ${report.reportTitle} (${report.anomalies.length} Anomalies)`,
        currentValue: `${report.anomalies.length} Flagged Tests`,
        safeRange: 'Clinical Reference Ranges',
        message: report.summaryAgainstProfile,
        clinicalSuggestion: report.clinicalRecommendations[0] || 'Review lab anomalies against patient profile.',
        timestamp: report.reportDate,
        status: 'escalated_to_doctor'
      },
      currentUser
    );

    setEscalatedStatus('Report transmitted to Dr. Sarah Mitchell, MD on Doctor Portal.');
  };

  // Delete a report
  const handleDeleteReport = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    labReportService.deleteReport(id);
    if (currentAnalysis?.id === id) {
      setCurrentAnalysis(null);
    }
  };

  // Unique categories for filter
  const testCategories = ['All', ...Array.from(new Set(currentAnalysis?.tests.map(t => t.category) || []))];

  const filteredTests = currentAnalysis?.tests.filter(t => {
    const matchesAnomaly = filterMode === 'all' || t.status !== 'Normal';
    const matchesCat = categoryFilter === 'All' || t.category === categoryFilter;
    return matchesAnomaly && matchesCat;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Patient Profile Context Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-teal-400 font-bold text-xs uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>AI Pathology & Anomaly Cross-Reference Engine</span>
            </div>
            <h3 className="text-xl font-bold tracking-tight">
              Biomarker Analysis for {currentUser.name}
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Uploaded lab tests are analyzed using Gemini 3.8 Flash and mapped directly against this patient's clinical baseline.
            </p>
          </div>

          {/* Patient Profile Pill Summary */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 font-medium">
              Age: <strong className="text-teal-300">{currentUser.profile.age}</strong> ({currentUser.profile.gender})
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 font-medium">
              Renal Disease: <strong className={currentUser.profile.hasRenalDisease ? 'text-amber-400' : 'text-emerald-400'}>{currentUser.profile.hasRenalDisease ? 'Flagged' : 'None'}</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 font-medium">
              Allergies: <strong className="text-rose-300">{currentUser.profile.knownAllergies?.join(', ') || 'None recorded'}</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 font-medium">
              Current Meds: <strong className="text-sky-300">{currentUser.profile.currentMedications?.join(', ') || 'None'}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Input & Upload Panel */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-teal-600" />
              <span>Upload or Paste Laboratory Test Report</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Paste printed results, digital EHR lab exports, or select an abnormal clinical demonstration preset.
            </p>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
            <span className="text-xs font-semibold text-slate-400 pr-1">Presets:</span>
            {SAMPLE_LAB_PRESETS.map(preset => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset.sampleText)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 transition-colors cursor-pointer"
                title={preset.description}
              >
                {preset.title.split(' - ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Text Area Input */}
        <div className="relative">
          <textarea
            value={labText}
            onChange={(e) => setLabText(e.target.value)}
            placeholder="Paste raw laboratory report text here (e.g. Glucose: 118 mg/dL, Creatinine: 1.6 mg/dL, ALT: 72 U/L, WBC: 13.8 10^3/uL)..."
            rows={7}
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-800 outline-hidden focus:border-teal-500 focus:bg-white transition-all shadow-inner leading-relaxed resize-y"
          />

          {labText && (
            <button
              type="button"
              onClick={() => setLabText('')}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 bg-slate-200/80 hover:bg-slate-200 p-1 rounded-lg text-xs cursor-pointer"
              title="Clear text"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Action Controls & File Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer border border-slate-200">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Report File (.txt, .csv)</span>
              <input
                type="file"
                accept=".txt,.csv,.json,.pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <span className="text-[11px] text-slate-400">
              {labText.trim().length > 0 ? `${labText.trim().split('\n').length} lines loaded` : 'No file selected'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleRunAnalysis}
            disabled={isAnalyzing || !labText.trim()}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
              isAnalyzing || !labText.trim()
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/30 hover:scale-[1.01]'
            }`}
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Pathology Engine Analyzing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Analyze Lab Report with Gemini API</span>
              </>
            )}
          </button>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Analysis Results Display */}
      {currentAnalysis && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fadeIn space-y-6 p-6">
          {/* Header Metadata Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-teal-100 text-teal-800">
                  {currentAnalysis.panelType}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {currentAnalysis.laboratoryName} • {currentAnalysis.reportDate}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mt-1">
                {currentAnalysis.reportTitle}
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Triage Status</span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                  currentAnalysis.riskLevel === 'Critical'
                    ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                    : currentAnalysis.riskLevel === 'High'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : currentAnalysis.riskLevel === 'Moderate'
                    ? 'bg-blue-100 text-blue-900 border border-blue-300'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}>
                  {currentAnalysis.riskLevel === 'Critical' ? <AlertOctagon className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  <span>{currentAnalysis.riskLevel} Risk</span>
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleEscalateToDoctor(currentAnalysis)}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                title="Transmit this analysis to the Doctor Portal"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Transmit to Doctor</span>
              </button>
            </div>
          </div>

          {escalatedStatus && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{escalatedStatus}</span>
              </div>
              {onNavigateToDoctorPortal && (
                <button
                  type="button"
                  onClick={onNavigateToDoctorPortal}
                  className="font-bold underline hover:text-emerald-950 cursor-pointer"
                >
                  View in Doctor Portal →
                </button>
              )}
            </div>
          )}

          {/* Synthesis Against Patient Profile */}
          <div className="rounded-2xl border-2 border-teal-500 bg-linear-to-br from-teal-50/90 via-white to-sky-50/50 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-black text-sm text-teal-950">
                <Bot className="w-4 h-4 text-teal-700" />
                <span>Gemini API Anomaly Synthesis Against Patient Profile</span>
              </div>
              <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                {currentAnalysis.modelUsed}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
              {currentAnalysis.summaryAgainstProfile}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-600">
              <span>Tests Parsed: <strong>{currentAnalysis.tests.length}</strong></span>
              <span>•</span>
              <span className="text-rose-700 font-bold">
                Anomalies Detected: <strong>{currentAnalysis.anomalies.length}</strong>
              </span>
              <span>•</span>
              <span>Profile Factors Evaluated: <strong>Age, Gender, Renal/Hepatic, Allergies, Medications</strong></span>
            </div>
          </div>

          {/* Key Anomalies Grid */}
          {currentAnalysis.anomalies.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  <span>Key Anomalies & Profile Correlations ({currentAnalysis.anomalies.length})</span>
                </h4>
                <span className="text-xs text-slate-400">Cross-referenced with patient conditions & medications</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {currentAnalysis.anomalies.map((anomaly, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border transition-all ${
                      anomaly.severity === 'critical'
                        ? 'bg-rose-50/80 border-rose-300'
                        : 'bg-amber-50/80 border-amber-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div>
                        <h5 className="font-bold text-sm text-slate-900 leading-tight">
                          {anomaly.testName}
                        </h5>
                        <div className="text-xs font-mono font-bold mt-0.5 text-slate-700">
                          Observed: <span className={anomaly.severity === 'critical' ? 'text-rose-700' : 'text-amber-800'}>{anomaly.observedValue}</span>
                          <span className="text-slate-400 font-normal ml-1">({anomaly.referenceRange})</span>
                        </div>
                      </div>

                      <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded ${
                        anomaly.severity === 'critical'
                          ? 'bg-rose-600 text-white'
                          : 'bg-amber-200 text-amber-900'
                      }`}>
                        {anomaly.severity}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-snug mb-2 font-medium">
                      {anomaly.anomalyDescription}
                    </p>

                    {/* Specific Profile Correlation Box */}
                    <div className="p-2.5 rounded-lg bg-white/90 border border-slate-200/80 text-[11px] space-y-1">
                      <div className="font-bold text-teal-900 flex items-center gap-1">
                        <User className="w-3 h-3 text-teal-600" />
                        <span>Profile Impact Analysis:</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">
                        {anomaly.profileCorrelation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full Analyte Breakdown Table */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-teal-600" />
                <span>Extracted Biomarker Panel Results ({filteredTests.length})</span>
              </h4>

              <div className="flex flex-wrap items-center gap-2">
                {/* Category Filter */}
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 cursor-pointer"
                >
                  {testCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                {/* Status Toggle */}
                <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setFilterMode('all')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      filterMode === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    All Tests ({currentAnalysis.tests.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterMode('anomalies_only')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      filterMode === 'anomalies_only' ? 'bg-white text-rose-800 font-bold shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    Anomalies Only ({currentAnalysis.anomalies.length})
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                  <tr>
                    <th className="py-2.5 px-3">Analyte Name</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Observed Value</th>
                    <th className="py-2.5 px-3">Standard Reference</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Clinical Significance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTests.map((test) => {
                    const isHigh = test.status.includes('High');
                    const isLow = test.status.includes('Low');
                    const isNormal = test.status === 'Normal';

                    return (
                      <tr
                        key={test.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          !isNormal ? 'bg-amber-50/20' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          {test.testName}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">
                          {test.category}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold">
                          <span className={
                            test.status.includes('Critical') ? 'text-rose-700 font-extrabold' :
                            isHigh ? 'text-amber-700' :
                            isLow ? 'text-sky-700' : 'text-slate-800'
                          }>
                            {test.value}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">
                          {test.referenceRange}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            test.status.includes('Critical')
                              ? 'bg-rose-600 text-white'
                              : isHigh
                              ? 'bg-amber-100 text-amber-800'
                              : isLow
                              ? 'bg-sky-100 text-sky-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {test.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 max-w-xs truncate" title={test.clinicalSignificance}>
                          {test.clinicalSignificance || 'Standard clinical reference parameter'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Clinical Directives & Recommendations */}
          <div className="bg-slate-50 rounded-xl p-4.5 border border-slate-200 text-xs space-y-2">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-teal-600" />
              <span>Evidence-Based Clinical Next Steps</span>
            </h4>
            <ul className="list-disc list-inside space-y-1 text-slate-700 font-medium">
              {currentAnalysis.clinicalRecommendations.map((rec, i) => (
                <li key={i} className="leading-relaxed">{rec}</li>
              ))}
            </ul>
          </div>

          {/* Raw Text Accordion Toggle */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setViewRawText(!viewRawText)}
              className="text-xs text-slate-400 hover:text-slate-600 underline cursor-pointer"
            >
              {viewRawText ? 'Hide Raw Uploaded Text' : 'View Raw Uploaded Text'}
            </button>
            {viewRawText && (
              <pre className="mt-2 p-3 rounded-lg bg-slate-100 font-mono text-[11px] text-slate-700 overflow-x-auto whitespace-pre-wrap">
                {currentAnalysis.rawText}
              </pre>
            )}
          </div>
        </div>
      )}

      {/* Previously Analyzed Lab Reports History */}
      {savedReports.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Clock className="w-4.5 h-4.5 text-teal-600" />
              <span>Archived Lab Diagnostic Reports ({savedReports.length})</span>
            </h4>
            <span className="text-xs text-slate-400">Stored in encrypted electronic medical record</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {savedReports.map(rep => (
              <div
                key={rep.id}
                onClick={() => setCurrentAnalysis(rep)}
                className={`p-4 rounded-xl border transition-all cursor-pointer group flex flex-col justify-between ${
                  currentAnalysis?.id === rep.id
                    ? 'border-teal-500 bg-teal-50/40 ring-2 ring-teal-200'
                    : 'border-slate-200 bg-white hover:border-teal-300 hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                      {rep.panelType}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteReport(rep.id, e)}
                      className="text-slate-300 hover:text-rose-500 p-1 rounded cursor-pointer"
                      title="Delete saved report"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h5 className="font-bold text-sm text-slate-900 group-hover:text-teal-700 transition-colors leading-tight">
                    {rep.reportTitle}
                  </h5>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {rep.reportDate} • {rep.laboratoryName || 'Diagnostic Lab'}
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className={`font-bold ${rep.anomalies.length > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {rep.anomalies.length} Anomaly{rep.anomalies.length !== 1 ? 's' : ''}
                  </span>
                  <span className="text-teal-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1 font-semibold text-[11px]">
                    <span>View Analysis</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
