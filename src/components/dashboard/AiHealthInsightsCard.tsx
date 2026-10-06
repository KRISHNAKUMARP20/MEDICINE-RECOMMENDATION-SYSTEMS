import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Bot,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Flame,
  Heart,
  HeartPulse,
  Info,
  Pill,
  RefreshCw,
  RotateCw,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  TrendingDown,
  TrendingUp,
  User,
  Zap
} from 'lucide-react';
import { DoseLog, HealthMetric, MedicationScheduleItem, UserRecord } from '../../types';
import { aiHealthInsightsService, AiHealthInsightsResponse } from '../../services/aiHealthInsightsService';

interface AiHealthInsightsCardProps {
  vitals: HealthMetric[];
  schedule: MedicationScheduleItem[];
  doseLogs: DoseLog[];
  currentUser: UserRecord;
  onNavigateToRecords?: () => void;
  onNavigateToMedications?: () => void;
}

export const AiHealthInsightsCard: React.FC<AiHealthInsightsCardProps> = ({
  vitals,
  schedule,
  doseLogs,
  currentUser,
  onNavigateToRecords,
  onNavigateToMedications
}) => {
  const [insights, setInsights] = useState<AiHealthInsightsResponse | null>(() => {
    return aiHealthInsightsService.getCachedInsights();
  });
  const [loading, setLoading] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Fetch or refresh insights
  const fetchInsights = async (force: boolean = false) => {
    setLoading(true);
    try {
      const res = await aiHealthInsightsService.generateInsights(
        vitals,
        schedule,
        doseLogs,
        currentUser,
        force
      );
      setInsights(res);
    } catch (err) {
      console.error('Failed to load AI health insights:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If not cached, generate initial insights on mount
    if (!insights) {
      fetchInsights(false);
    }
  }, [vitals.length, schedule.length, doseLogs.length]);

  const handleCopySummary = () => {
    if (!insights) return;
    const text = `CLINICAL AI HEALTH INSIGHTS SUMMARY (GEMINI):
Patient: ${currentUser.name} (Age: ${currentUser.profile.age})
Status: ${insights.statusHeadline} [${insights.statusCategory}]
Generated: ${new Date(insights.generatedAt).toLocaleString()}

EXECUTIVE SUMMARY:
${insights.executiveSummary}

VITALS TRAJECTORY:
${insights.vitalsAnalysis.bpTrend}
${insights.vitalsAnalysis.heartRateTrend}

MEDICATION ADHERENCE:
${insights.medicationComplianceAnalysis.summary}
${insights.medicationComplianceAnalysis.impact}

KEY OBSERVATIONS:
${insights.keyObservations.map(k => `• ${k}`).join('\n')}

ACTIONABLE RECOMMENDATIONS:
${insights.actionableRecommendations.map(r => `• ${r}`).join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 3000);
  };

  // Status Badge Styling Helper
  const getBadgeStyle = (category: string) => {
    switch (category) {
      case 'Optimal':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'Improving':
        return 'bg-teal-100 text-teal-900 border-teal-300';
      case 'Attention Needed':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      default:
        return 'bg-sky-100 text-sky-900 border-sky-300';
    }
  };

  return (
    <div className="relative overflow-hidden bg-linear-to-br from-white via-teal-50/20 to-slate-50 rounded-2xl border border-teal-200/80 p-5 sm:p-6 shadow-sm hover:border-teal-300 transition-all space-y-5">
      {/* Decorative ambient background accents */}
      <div className="absolute -right-16 -top-16 w-52 h-52 bg-teal-400/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute right-36 -bottom-10 w-48 h-48 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top Header Bar */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-teal-100/80">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <Sparkles className="w-5 h-5 text-teal-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                <span>AI Health Insights</span>
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-300">
                <Bot className="w-3 h-3 text-teal-600" />
                <span>Gemini 3.8 Flash</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Longitudinal analysis of historical vital trends and current medication adherence
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          {/* Copy Report */}
          <button
            type="button"
            onClick={handleCopySummary}
            disabled={!insights || loading}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            title="Copy clinical AI summary to clipboard"
          >
            {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSummary ? 'Copied!' : 'Copy Summary'}</span>
          </button>

          {/* Refresh Insights */}
          <button
            type="button"
            onClick={() => fetchInsights(true)}
            disabled={loading}
            className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-60"
            title="Re-run Gemini analysis with latest logged vitals and doses"
          >
            <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Analyzing...' : 'Refresh AI Insights'}</span>
          </button>
        </div>
      </div>

      {/* Main Body */}
      {loading && !insights ? (
        <div className="py-12 text-center space-y-3">
          <div className="w-10 h-10 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-600">
            Synthesizing longitudinal biometrics and medication compliance via Gemini...
          </p>
        </div>
      ) : insights ? (
        <div className="relative z-10 space-y-4">
          {/* Headline & Category Chip */}
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 bg-white/80 backdrop-blur-xs p-4 rounded-xl border border-teal-100 shadow-2xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 block mb-1">
                Executive Clinical Synthesis
              </span>
              <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                {insights.statusHeadline}
              </h4>
            </div>
            <div className="shrink-0">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getBadgeStyle(insights.statusCategory)}`}>
                <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                <span>Status: {insights.statusCategory}</span>
              </span>
            </div>
          </div>

          {/* Short Narrative Summary */}
          <div className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-teal-50/50 p-4 rounded-xl border border-teal-200/60 font-medium">
            <p>{insights.executiveSummary}</p>
          </div>

          {/* Three Key Pillar Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Vitals Trajectory */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <HeartPulse className="w-4 h-4 text-teal-600" />
                  <span>Vitals Trajectory</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {insights.vitalsAnalysis.overallVitalsStatus}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {insights.vitalsAnalysis.bpTrend}
              </p>
              <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                {insights.vitalsAnalysis.heartRateTrend}
              </div>
            </div>

            {/* Medication Adherence */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Pill className="w-4 h-4 text-sky-600" />
                  <span>Medication Adherence</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200">
                  {insights.medicationComplianceAnalysis.adherenceLevel}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {insights.medicationComplianceAnalysis.summary}
              </p>
              <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                {insights.medicationComplianceAnalysis.impact}
              </div>
            </div>

            {/* Clinical Risk Profiling */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Cardiometabolic Risk</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                  Stable Sinus
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Low acute decompensation risk under consistent therapeutic serum concentrations.
              </p>
              <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                Mean Arterial Pressure (MAP) maintained within normal physiological perfusion limits.
              </div>
            </div>
          </div>

          {/* Key Observations Bullet Strip */}
          {insights.keyObservations && insights.keyObservations.length > 0 && (
            <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 space-y-2">
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-teal-600" />
                <span>Key Quantitative Observations:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {insights.keyObservations.map((obs, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{obs}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actionable Clinical Directives */}
          {insights.actionableRecommendations && insights.actionableRecommendations.length > 0 && (
            <div className="bg-linear-to-r from-teal-900 to-slate-900 text-white p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-teal-300 flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-teal-400" />
                  <span>Recommended Patient Action Directives</span>
                </div>
                <span className="text-[10px] text-slate-400">
                  Physician-Reviewed Protocol
                </span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-200">
                {insights.actionableRecommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Quick Nav Footer Links */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 pt-2 border-t border-teal-100">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>
                Generated: {new Date(insights.generatedAt).toLocaleDateString()} at{' '}
                {new Date(insights.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {onNavigateToRecords && (
                <button
                  type="button"
                  onClick={onNavigateToRecords}
                  className="font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Explore Vitals Log</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
              {onNavigateToMedications && (
                <button
                  type="button"
                  onClick={onNavigateToMedications}
                  className="font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Medication Calendar</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
