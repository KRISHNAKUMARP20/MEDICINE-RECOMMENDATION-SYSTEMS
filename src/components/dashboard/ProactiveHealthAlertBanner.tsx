import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Bell,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Heart,
  HeartPulse,
  Info,
  Radio,
  Send,
  ShieldAlert,
  Stethoscope,
  X,
  Zap
} from 'lucide-react';
import { HealthMetric, ProactiveVitalsAlert, UserRecord } from '../../types';
import { proactiveVitalsAlertService } from '../../services/proactiveVitalsAlertService';
import { storageService } from '../../services/storageService';

interface ProactiveHealthAlertBannerProps {
  vitals: HealthMetric[];
  currentUser: UserRecord;
  onNavigateToDoctorPortal?: () => void;
  onVitalsUpdated?: () => void;
}

export const ProactiveHealthAlertBanner: React.FC<ProactiveHealthAlertBannerProps> = ({
  vitals,
  currentUser,
  onNavigateToDoctorPortal,
  onVitalsUpdated
}) => {
  const [alerts, setAlerts] = useState<ProactiveVitalsAlert[]>([]);
  const [escalatingId, setEscalatingId] = useState<string | null>(null);
  const [escalatedFeedback, setEscalatedFeedback] = useState<Record<string, string>>({});
  const [isExpanded, setIsExpanded] = useState(true);
  const [showSimulator, setShowSimulator] = useState(false);

  // Evaluate vitals whenever vitals prop changes or an alert state event occurs
  const refreshAlerts = () => {
    const evaluated = proactiveVitalsAlertService.evaluateVitals(vitals);
    setAlerts(evaluated);
  };

  useEffect(() => {
    refreshAlerts();

    const handleAlertChange = () => {
      refreshAlerts();
    };

    window.addEventListener('medassist:vitals-alert-changed', handleAlertChange);
    window.addEventListener('medassist:vitals-updated', handleAlertChange);

    return () => {
      window.removeEventListener('medassist:vitals-alert-changed', handleAlertChange);
      window.removeEventListener('medassist:vitals-updated', handleAlertChange);
    };
  }, [vitals]);

  // Handle escalating an alert directly to DoctorPortalTab
  const handleEscalate = async (alert: ProactiveVitalsAlert) => {
    setEscalatingId(alert.id);
    try {
      proactiveVitalsAlertService.escalateToDoctor(alert, currentUser);
      setEscalatedFeedback(prev => ({
        ...prev,
        [alert.id]: 'Dispatched to Dr. Sarah Mitchell, MD on Doctor Portal'
      }));
      refreshAlerts();
    } catch (e) {
      console.error('Failed to escalate alert', e);
    } finally {
      setEscalatingId(null);
    }
  };

  // Handle dismiss
  const handleDismiss = (alertId: string) => {
    proactiveVitalsAlertService.dismissAlert(alertId);
    refreshAlerts();
  };

  // Quick Simulation Test Triggers
  const handleSimulateSpike = (type: 'bp_stage2' | 'bp_crisis' | 'tachycardia' | 'hyperglycemia' | 'reset') => {
    const currentList = storageService.getVitals();
    const today = new Date().toISOString().slice(0, 10);

    if (type === 'reset') {
      const resetList: HealthMetric[] = [
        { id: `vital_${Date.now() - 4 * 86400000}`, date: '2026-09-22', bloodPressureSys: 120, bloodPressureDia: 78, bloodSugar: 94, heartRate: 72, temperature: 98.4, weight: 71.8 },
        { id: `vital_${Date.now() - 2 * 86400000}`, date: '2026-09-24', bloodPressureSys: 118, bloodPressureDia: 78, bloodSugar: 93, heartRate: 70, temperature: 98.2, weight: 71.6 },
        { id: `vital_${Date.now()}`, date: today, bloodPressureSys: 120, bloodPressureDia: 78, bloodSugar: 92, heartRate: 71, temperature: 98.4, weight: 71.4 }
      ];
      storageService.saveVitals(resetList);
    } else {
      let metric: HealthMetric;
      if (type === 'bp_crisis') {
        metric = {
          id: `vital_spike_${Date.now()}`,
          date: today,
          bloodPressureSys: 184,
          bloodPressureDia: 116,
          heartRate: 98,
          bloodSugar: 104,
          temperature: 98.6,
          weight: 72.0,
          notes: 'Test: Simulated Hypertensive Crisis'
        };
      } else if (type === 'bp_stage2') {
        metric = {
          id: `vital_spike_${Date.now()}`,
          date: today,
          bloodPressureSys: 152,
          bloodPressureDia: 96,
          heartRate: 88,
          bloodSugar: 98,
          temperature: 98.6,
          weight: 71.8,
          notes: 'Test: Simulated Stage 2 HTN Elevation'
        };
      } else if (type === 'tachycardia') {
        metric = {
          id: `vital_spike_${Date.now()}`,
          date: today,
          bloodPressureSys: 130,
          bloodPressureDia: 84,
          heartRate: 118,
          bloodSugar: 95,
          temperature: 99.2,
          weight: 71.5,
          notes: 'Test: Marked Resting Tachycardia'
        };
      } else {
        metric = {
          id: `vital_spike_${Date.now()}`,
          date: today,
          bloodPressureSys: 128,
          bloodPressureDia: 82,
          heartRate: 76,
          bloodSugar: 198,
          temperature: 98.4,
          weight: 71.6,
          notes: 'Test: Severe Hyperglycemia'
        };
      }
      storageService.addVital(metric);
    }

    if (onVitalsUpdated) {
      onVitalsUpdated();
    }
  };

  const hasCritical = alerts.some(a => a.severity === 'critical');

  return (
    <div className="space-y-3">
      {/* Active Proactive Alert Cards */}
      {alerts.length > 0 && (
        <div
          className={`rounded-2xl border-2 transition-all shadow-md overflow-hidden ${
            hasCritical
              ? 'border-rose-500 bg-linear-to-r from-rose-50 via-rose-50/90 to-red-50'
              : 'border-amber-400 bg-linear-to-r from-amber-50 via-orange-50/80 to-amber-50'
          }`}
        >
          {/* Header Bar */}
          <div
            className={`px-5 py-3.5 flex items-center justify-between gap-3 text-white ${
              hasCritical ? 'bg-rose-700' : 'bg-linear-to-r from-amber-600 to-orange-600'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white shrink-0">
                {hasCritical ? (
                  <AlertOctagon className="w-5 h-5 animate-pulse" />
                ) : (
                  <ShieldAlert className="w-5 h-5" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black tracking-wide uppercase px-2 py-0.5 rounded bg-black/20">
                    Proactive Clinical Alert Service
                  </span>
                  <span className="text-xs font-semibold text-white/90">
                    {alerts.length} Metric Hazard{alerts.length > 1 ? 's' : ''} Detected
                  </span>
                </div>
                <h3 className="font-bold text-sm sm:text-base leading-tight mt-0.5">
                  {hasCritical
                    ? 'Critical Physiological Excursion: Immediate Doctor Review Recommended'
                    : 'Health Metric Trend Warning: Safe Clinical Range Exceeded'}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer text-xs flex items-center gap-1 font-semibold"
              >
                <span>{isExpanded ? 'Collapse' : 'Expand Details'}</span>
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Alert Body List */}
          {isExpanded && (
            <div className="p-5 space-y-4">
              {alerts.map(alert => {
                const isEscalated = alert.status === 'escalated_to_doctor';
                const feedbackMsg = escalatedFeedback[alert.id];

                return (
                  <div
                    key={alert.id}
                    className={`rounded-xl p-4.5 border transition-all ${
                      alert.severity === 'critical'
                        ? 'bg-white border-rose-300 shadow-xs'
                        : 'bg-white border-amber-200 shadow-xs'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      {/* Left: Metric Data & Clinical Details */}
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                              alert.severity === 'critical'
                                ? 'bg-rose-600 text-white'
                                : 'bg-amber-500 text-slate-950 font-bold'
                            }`}
                          >
                            {alert.severity === 'critical' ? 'CRITICAL SPIKE' : 'RANGE WARNING'}
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            {alert.title}
                          </span>
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">
                            Current: <strong>{alert.currentValue}</strong>
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Target Safe Limit: <strong className="text-emerald-700">{alert.safeRange}</strong>
                          </span>
                        </div>

                        <p className="text-xs text-slate-700 leading-relaxed font-medium">
                          {alert.message}
                        </p>

                        {/* Clinical Suggestion Directive Box */}
                        <div className="p-3 rounded-lg bg-teal-50/80 border border-teal-200 text-xs space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-teal-900">
                            <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                            <span>Evidence-Based Clinical Suggestion:</span>
                          </div>
                          <p className="text-teal-800 leading-relaxed">
                            {alert.clinicalSuggestion}
                          </p>
                        </div>

                        {/* Escalated Feedback Banner */}
                        {feedbackMsg && (
                          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 font-semibold">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span>{feedbackMsg}</span>
                            </div>
                            {onNavigateToDoctorPortal && (
                              <button
                                type="button"
                                onClick={onNavigateToDoctorPortal}
                                className="text-[11px] font-bold text-emerald-800 underline hover:text-emerald-950 cursor-pointer"
                              >
                                View in Doctor Portal →
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Right: Actions (Doctor Escalation & Dismiss) */}
                      <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 self-stretch md:self-auto justify-end">
                        <button
                          type="button"
                          onClick={() => handleEscalate(alert)}
                          disabled={isEscalated || escalatingId === alert.id}
                          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer ${
                            isEscalated
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                              : alert.severity === 'critical'
                              ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30'
                              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30'
                          }`}
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>
                            {isEscalated
                              ? '✓ Sent to Doctor Portal'
                              : escalatingId === alert.id
                              ? 'Transmitting...'
                              : 'Transmit to Doctor Portal'}
                          </span>
                        </button>

                        <div className="flex items-center gap-2">
                          {onNavigateToDoctorPortal && isEscalated && (
                            <button
                              type="button"
                              onClick={onNavigateToDoctorPortal}
                              className="flex-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold text-center transition-colors cursor-pointer"
                            >
                              Doctor Review Workstation →
                            </button>
                          )}

                          {alert.severity !== 'critical' && (
                            <button
                              type="button"
                              onClick={() => handleDismiss(alert.id)}
                              className="px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-600 text-xs transition-colors cursor-pointer"
                              title="Dismiss non-critical reminder"
                            >
                              Dismiss
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Simulator / Evaluator Testing Bar */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
            <Radio className="w-3.5 h-3.5 text-teal-600" />
          </div>
          <div>
            <span className="font-bold text-slate-800 block">
              Proactive Alert Testing & Simulation Engine
            </span>
            <span className="text-[11px] text-slate-500">
              Test how sudden blood pressure spikes or vital excursions trigger immediate proactive alerts and dispatch to Doctor Portal.
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleSimulateSpike('bp_stage2')}
            className="px-2.5 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold transition-colors cursor-pointer text-[11px]"
            title="Inject 152/96 mmHg Stage 2 HTN"
          >
            + Test BP Spike (152/96)
          </button>
          <button
            type="button"
            onClick={() => handleSimulateSpike('bp_crisis')}
            className="px-2.5 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-900 font-semibold transition-colors cursor-pointer text-[11px]"
            title="Inject 184/116 mmHg Crisis"
          >
            + Test BP Crisis (184/116)
          </button>
          <button
            type="button"
            onClick={() => handleSimulateSpike('tachycardia')}
            className="px-2.5 py-1.5 rounded-lg bg-orange-100 hover:bg-orange-200 text-orange-900 font-semibold transition-colors cursor-pointer text-[11px]"
            title="Inject 118 BPM Tachycardia"
          >
            + Test HR (118 BPM)
          </button>
          <button
            type="button"
            onClick={() => handleSimulateSpike('reset')}
            className="px-2.5 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-semibold transition-colors cursor-pointer text-[11px]"
            title="Reset to 120/78 Normal BP"
          >
            Reset to Normal (120/78)
          </button>
        </div>
      </div>
    </div>
  );
};
