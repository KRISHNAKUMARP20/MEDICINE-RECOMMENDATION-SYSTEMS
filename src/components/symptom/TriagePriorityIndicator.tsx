import React, { useState } from 'react';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Heart,
  HeartPulse,
  Info,
  PhoneCall,
  RefreshCw,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Sparkles,
  Stethoscope,
  Zap
} from 'lucide-react';
import { TriagePriorityAssessment, TriageUrgencyLevel, UserRecord } from '../../types';
import { VitalsInputContext } from '../../services/triagePriorityService';

interface TriagePriorityIndicatorProps {
  assessment: TriagePriorityAssessment;
  vitals: VitalsInputContext;
  onUpdateVitals: (updated: VitalsInputContext) => void;
  onRefreshGeminiTriage: () => void;
  isEvaluatingWithGemini: boolean;
  currentUser: UserRecord;
  onTransmitToDoctor?: () => void;
  symptomCount: number;
}

export const TriagePriorityIndicator: React.FC<TriagePriorityIndicatorProps> = ({
  assessment,
  vitals,
  onUpdateVitals,
  onRefreshGeminiTriage,
  isEvaluatingWithGemini,
  currentUser,
  onTransmitToDoctor,
  symptomCount
}) => {
  const [isVitalsDrawerOpen, setIsVitalsDrawerOpen] = useState(false);
  const [isRationaleExpanded, setIsRationaleExpanded] = useState(true);

  // Quick Vitals Presets for Instant Testing
  const handleApplyPreset = (preset: 'normal' | 'borderline' | 'urgent' | 'crisis') => {
    if (preset === 'normal') {
      onUpdateVitals({
        bloodPressureSys: 120,
        bloodPressureDia: 80,
        heartRate: 72,
        temperature: 98.6,
        bloodSugar: 95,
        oxygenSaturation: 98,
        respiratoryRate: 16
      });
    } else if (preset === 'borderline') {
      onUpdateVitals({
        bloodPressureSys: 138,
        bloodPressureDia: 88,
        heartRate: 86,
        temperature: 99.4,
        bloodSugar: 125,
        oxygenSaturation: 97,
        respiratoryRate: 18
      });
    } else if (preset === 'urgent') {
      onUpdateVitals({
        bloodPressureSys: 154,
        bloodPressureDia: 96,
        heartRate: 112,
        temperature: 101.8,
        bloodSugar: 195,
        oxygenSaturation: 95,
        respiratoryRate: 22
      });
    } else {
      // crisis
      onUpdateVitals({
        bloodPressureSys: 185,
        bloodPressureDia: 118,
        heartRate: 134,
        temperature: 103.2,
        bloodSugar: 280,
        oxygenSaturation: 90,
        respiratoryRate: 28
      });
    }
  };

  const isEmergency = assessment.urgencyLevel === 'Emergency';
  const isUrgent = assessment.urgencyLevel === 'Urgent';

  return (
    <div
      className={`rounded-2xl border-2 transition-all shadow-md overflow-hidden ${
        isEmergency
          ? 'border-rose-600 bg-linear-to-br from-rose-50 via-red-50/80 to-rose-50'
          : isUrgent
          ? 'border-amber-400 bg-linear-to-br from-amber-50 via-orange-50/70 to-amber-50'
          : 'border-emerald-400 bg-linear-to-br from-emerald-50 via-teal-50/60 to-emerald-50'
      }`}
    >
      {/* Top Triage Banner */}
      <div
        className={`px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white ${
          isEmergency
            ? 'bg-rose-700'
            : isUrgent
            ? 'bg-linear-to-r from-amber-600 to-orange-600'
            : 'bg-linear-to-r from-emerald-700 to-teal-700'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0 shadow-sm">
            {isEmergency ? (
              <AlertOctagon className="w-6 h-6 animate-pulse" />
            ) : isUrgent ? (
              <AlertTriangle className="w-6 h-6" />
            ) : (
              <ShieldCheck className="w-6 h-6" />
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-black/25">
                AI Clinical Triage Engine
              </span>
              <span className="text-xs font-bold text-white/90">
                Emergency Severity Index: ESI Level {assessment.esiScore}
              </span>
              {assessment.source === 'gemini' && (
                <span className="text-[10px] font-bold text-teal-200 bg-teal-900/60 px-2 py-0.5 rounded flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Gemini 3.8 Flash</span>
                </span>
              )}
            </div>
            <h3 className="font-black text-base sm:text-lg leading-tight mt-0.5">
              {assessment.priorityLabel}
            </h3>
          </div>
        </div>

        {/* Right Header Status Badges */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-white/80 block">Time to Care</span>
            <span className="font-bold text-xs bg-white/20 px-2.5 py-0.5 rounded-full inline-block">
              {assessment.timeframeToCare}
            </span>
          </div>

          <button
            type="button"
            onClick={onRefreshGeminiTriage}
            disabled={isEvaluatingWithGemini}
            className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer text-xs flex items-center gap-1 font-semibold"
            title="Re-run AI triage evaluation with Gemini API"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isEvaluatingWithGemini ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">AI Sync</span>
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-5 space-y-4">
        {/* Chief Risk Statement */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-start gap-2.5">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                isEmergency
                  ? 'bg-rose-100 text-rose-700'
                  : isUrgent
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Primary Clinical Assessment
              </span>
              <p className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                {assessment.chiefRiskFactor}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-500 font-medium">Setting:</span>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                isEmergency
                  ? 'bg-rose-100 text-rose-900 border border-rose-300'
                  : isUrgent
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              }`}
            >
              {assessment.recommendedCareSetting}
            </span>
          </div>
        </div>

        {/* Clinical Rationale & Red Flags (Collapsible) */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
              <Bot className="w-4 h-4 text-teal-600" />
              <span>AI Triage Clinical Rationale & Multimodal Correlation:</span>
            </div>
            <button
              type="button"
              onClick={() => setIsRationaleExpanded(!isRationaleExpanded)}
              className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 cursor-pointer"
            >
              <span>{isRationaleExpanded ? 'Hide' : 'Show Details'}</span>
              {isRationaleExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {isRationaleExpanded && (
            <div className="space-y-3 text-xs">
              <p className="text-slate-700 leading-relaxed font-medium">
                {assessment.clinicalRationale}
              </p>

              {/* Vitals Impact Note */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] flex items-start gap-2">
                <HeartPulse className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800">
                    Vitals Impact ({assessment.vitalSignsImpact.status}):{' '}
                  </span>
                  <span className="text-slate-600">{assessment.vitalSignsImpact.details}</span>
                </div>
              </div>

              {/* Red Flags List */}
              {assessment.redFlagsIdentified.length > 0 && (
                <div>
                  <span className="font-bold text-slate-700 text-[11px] block mb-1">
                    Red-Flag Safety Triggers Detected:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {assessment.redFlagsIdentified.map((flag, idx) => (
                      <span
                        key={idx}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          isEmergency
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-amber-100 text-amber-900 border border-amber-200'
                        }`}
                      >
                        ⚠️ {flag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Directives */}
              <div className="pt-1">
                <span className="font-bold text-slate-700 text-[11px] block mb-1">
                  Required Clinical Directives:
                </span>
                <ul className="list-disc list-inside space-y-1 text-slate-600 font-medium">
                  {assessment.suggestedActionDirectives.map((directive, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {directive}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Current Vitals Consideration Strip & Editor Drawer */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-600" />
              <span className="font-bold text-xs text-slate-900">
                Patient Vitals Evaluated in this Triage Check
              </span>
              <span className="text-[10px] text-slate-400">
                (Influences priority with {symptomCount} symptom{symptomCount !== 1 ? 's' : ''})
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsVitalsDrawerOpen(!isVitalsDrawerOpen)}
              className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{isVitalsDrawerOpen ? 'Close Vitals Editor' : 'Adjust Vitals / Test Spikes'}</span>
            </button>
          </div>

          {/* Vitals Summary Pill Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] text-slate-400 block font-medium">Blood Pressure</span>
              <span className="font-mono font-bold text-slate-900">
                {vitals.bloodPressureSys}/{vitals.bloodPressureDia}{' '}
                <span className="text-[10px] text-slate-400 font-normal">mmHg</span>
              </span>
            </div>

            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] text-slate-400 block font-medium">Heart Rate</span>
              <span className="font-mono font-bold text-slate-900">
                {vitals.heartRate}{' '}
                <span className="text-[10px] text-slate-400 font-normal">BPM</span>
              </span>
            </div>

            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] text-slate-400 block font-medium">Body Temp</span>
              <span className="font-mono font-bold text-slate-900">
                {vitals.temperature}{' '}
                <span className="text-[10px] text-slate-400 font-normal">°F</span>
              </span>
            </div>

            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] text-slate-400 block font-medium">Blood Glucose</span>
              <span className="font-mono font-bold text-slate-900">
                {vitals.bloodSugar}{' '}
                <span className="text-[10px] text-slate-400 font-normal">mg/dL</span>
              </span>
            </div>

            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-400 block font-medium">Oxygen (SpO2)</span>
              <span className="font-mono font-bold text-slate-900">
                {vitals.oxygenSaturation || 98}%
              </span>
            </div>
          </div>

          {/* Interactive Vitals Adjuster Drawer */}
          {isVitalsDrawerOpen && (
            <div className="pt-3 border-t border-slate-200 space-y-3 animate-fadeIn">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-slate-700">
                  Quick Triage Testing Presets:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('normal')}
                    className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors cursor-pointer"
                  >
                    Normal (120/80, 72)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('borderline')}
                    className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors cursor-pointer"
                  >
                    Pre-HTN (138/88, 86)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('urgent')}
                    className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition-colors cursor-pointer"
                  >
                    Stage 2 / Fever (154/96, 101.8°F)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('crisis')}
                    className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-300 transition-colors cursor-pointer"
                  >
                    Crisis (185/118, 134 BPM)
                  </button>
                </div>
              </div>

              {/* Sliders / Inputs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    Systolic BP ({vitals.bloodPressureSys} mmHg)
                  </label>
                  <input
                    type="range"
                    min="80"
                    max="220"
                    value={vitals.bloodPressureSys}
                    onChange={(e) =>
                      onUpdateVitals({
                        ...vitals,
                        bloodPressureSys: parseInt(e.target.value, 10)
                      })
                    }
                    className="w-full accent-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    Diastolic BP ({vitals.bloodPressureDia} mmHg)
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="140"
                    value={vitals.bloodPressureDia}
                    onChange={(e) =>
                      onUpdateVitals({
                        ...vitals,
                        bloodPressureDia: parseInt(e.target.value, 10)
                      })
                    }
                    className="w-full accent-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    Heart Rate ({vitals.heartRate} BPM)
                  </label>
                  <input
                    type="range"
                    min="40"
                    max="180"
                    value={vitals.heartRate}
                    onChange={(e) =>
                      onUpdateVitals({
                        ...vitals,
                        heartRate: parseInt(e.target.value, 10)
                      })
                    }
                    className="w-full accent-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    Temperature ({vitals.temperature}°F)
                  </label>
                  <input
                    type="range"
                    min="96.0"
                    max="105.0"
                    step="0.2"
                    value={vitals.temperature}
                    onChange={(e) =>
                      onUpdateVitals({
                        ...vitals,
                        temperature: parseFloat(e.target.value)
                      })
                    }
                    className="w-full accent-teal-600"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Immediate Escalation Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="text-xs text-slate-500">
            {isEmergency ? (
              <span className="text-rose-700 font-bold flex items-center gap-1">
                <AlertOctagon className="w-4 h-4 shrink-0" />
                <span>Life-threatening alert: Urgent emergency dispatch is indicated.</span>
              </span>
            ) : isUrgent ? (
              <span className="text-amber-800 font-bold flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Same-day clinical appointment or urgent care visit advised.</span>
              </span>
            ) : (
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Stable physiological presentation: outpatient monitoring suitable.</span>
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isEmergency && (
              <a
                href="tel:911"
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/30 transition-all cursor-pointer animate-bounce"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call Emergency (911)</span>
              </a>
            )}

            {onTransmitToDoctor && (
              <button
                type="button"
                onClick={onTransmitToDoctor}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send to Doctor Portal</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
