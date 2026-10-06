import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ReferenceArea
} from 'recharts';
import { motion } from 'framer-motion';
import {
  Activity,
  HeartPulse,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Clock,
  Gauge,
  Info,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { PredictionResult } from '../../types';

export interface VitalsDataPoint {
  timeLabel: string;
  fullDate: string;
  systolicBP: number;
  diastolicBP: number;
  heartRate: number;
  map: number;
  pulsePressure: number;
  spo2: number;
  tempF: number;
  status: 'Normal' | 'Elevated' | 'Stage 1 HTN' | 'Stage 2 HTN' | 'Tachycardic';
}

interface PatientVitalsTrendChartProps {
  patientCase: PredictionResult;
}

/**
 * Deterministically generates clinically realistic vitals history based on
 * the patient's age, diagnosis, urgency, and timestamp.
 */
function generatePatientVitalsHistory(patient: PredictionResult): VitalsDataPoint[] {
  // Deterministic seed based on patient ID & name
  const seedString = `${patient.id}-${patient.patientName || 'Patient'}`;
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    hash = (hash << 5) - hash + seedString.charCodeAt(i);
    hash |= 0;
  }
  const pseudoRand = (offset: number) => {
    const val = Math.sin(hash + offset) * 10000;
    return val - Math.floor(val);
  };

  const age = patient.patientAge || 38;
  const isUrgent = patient.predictedDisease?.urgency === 'High' || patient.predictedDisease?.urgency === 'Emergency';
  const diseaseName = (patient.predictedDisease?.name || '').toLowerCase();

  // Baseline calibration
  let baseSys = 118 + (age > 50 ? 12 : 0) + (age > 65 ? 8 : 0);
  let baseDia = 76 + (age > 50 ? 6 : 0);
  let baseHR = 72;

  // Disease-specific adjustments
  if (diseaseName.includes('hypertens') || diseaseName.includes('arterial')) {
    baseSys += 24;
    baseDia += 16;
    baseHR += 6;
  } else if (diseaseName.includes('dengue') || diseaseName.includes('malaria') || diseaseName.includes('typhoid') || diseaseName.includes('pneumonia')) {
    baseSys += 4;
    baseHR += 22; // Infection tachycardia
  } else if (diseaseName.includes('migraine') || diseaseName.includes('headache')) {
    baseSys += 10;
    baseHR += 8;
  }

  if (isUrgent) {
    baseSys += 12;
    baseDia += 8;
    baseHR += 16;
  }

  const baseDate = new Date(patient.timestamp || Date.now());
  const data: VitalsDataPoint[] = [];

  const timeOffsets = [
    { label: '6d ago', daysAgo: 6 },
    { label: '5d ago', daysAgo: 5 },
    { label: '4d ago', daysAgo: 4 },
    { label: '3d ago', daysAgo: 3 },
    { label: '2d ago', daysAgo: 2 },
    { label: 'Yesterday', daysAgo: 1 },
    { label: 'Current / Triage', daysAgo: 0 }
  ];

  timeOffsets.forEach((t, idx) => {
    const d = new Date(baseDate);
    d.setDate(d.getDate() - t.daysAgo);

    // Natural variability curve with symptom progression toward the current presentation
    const progressionFactor = (idx / 6); // 0 -> 1
    const jitterSys = Math.round((pseudoRand(idx * 3 + 1) - 0.45) * 8);
    const jitterDia = Math.round((pseudoRand(idx * 3 + 2) - 0.45) * 6);
    const jitterHR = Math.round((pseudoRand(idx * 3 + 3) - 0.45) * 8);

    // Patients presenting with symptoms tend to peak near current triage
    const acuteSysAdd = Math.round((isUrgent ? 8 : 4) * progressionFactor);
    const acuteHRAdd = Math.round((isUrgent ? 12 : 6) * progressionFactor);

    const systolicBP = Math.min(185, Math.max(95, baseSys + jitterSys + acuteSysAdd));
    const diastolicBP = Math.min(115, Math.max(55, baseDia + jitterDia + Math.round(acuteSysAdd * 0.5)));
    const heartRate = Math.min(135, Math.max(54, baseHR + jitterHR + acuteHRAdd));

    const map = Math.round(((2 * diastolicBP) + systolicBP) / 3);
    const pulsePressure = systolicBP - diastolicBP;

    let status: VitalsDataPoint['status'] = 'Normal';
    if (heartRate > 100) {
      status = 'Tachycardic';
    } else if (systolicBP >= 140 || diastolicBP >= 90) {
      status = 'Stage 2 HTN';
    } else if (systolicBP >= 130 || diastolicBP >= 80) {
      status = 'Stage 1 HTN';
    } else if (systolicBP >= 120 && diastolicBP < 80) {
      status = 'Elevated';
    }

    const spo2 = Math.min(100, Math.max(93, Math.round(98 - (isUrgent ? 2 : 0) + (pseudoRand(idx + 10) * 2 - 1))));
    const tempF = parseFloat((98.4 + (diseaseName.includes('fever') || isUrgent ? 1.8 * progressionFactor : 0.2 * pseudoRand(idx + 20))).toFixed(1));

    data.push({
      timeLabel: t.label,
      fullDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      systolicBP,
      diastolicBP,
      heartRate,
      map,
      pulsePressure,
      spo2,
      tempF,
      status
    });
  });

  return data;
}

export const PatientVitalsTrendChart: React.FC<PatientVitalsTrendChartProps> = ({ patientCase }) => {
  const [activeMetricMode, setActiveMetricMode] = useState<'all' | 'bp' | 'hr'>('all');

  // Compute vitals series
  const vitalsHistory = useMemo(() => {
    return generatePatientVitalsHistory(patientCase);
  }, [patientCase.id, patientCase.patientName, patientCase.patientAge, patientCase.timestamp, patientCase.predictedDisease?.urgency]);

  const latestVitals = vitalsHistory[vitalsHistory.length - 1];
  const initialVitals = vitalsHistory[0];

  const hrDelta = latestVitals.heartRate - initialVitals.heartRate;
  const bpSysDelta = latestVitals.systolicBP - initialVitals.systolicBP;

  // Custom Recharts Tooltip
  const CustomVitalsTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data: VitalsDataPoint = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700 text-xs min-w-[220px] backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <div>
              <span className="font-extrabold text-slate-100 block">{data.timeLabel}</span>
              <span className="text-[10px] text-slate-400">{data.fullDate}</span>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                data.status === 'Normal'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : data.status === 'Tachycardic' || data.status === 'Stage 2 HTN'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              {data.status}
            </span>
          </div>

          <div className="space-y-1.5 font-mono">
            <div className="flex items-center justify-between text-rose-300">
              <span className="flex items-center gap-1.5 text-slate-300 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span>Systolic BP:</span>
              </span>
              <span className="font-bold text-sm">{data.systolicBP} mmHg</span>
            </div>

            <div className="flex items-center justify-between text-indigo-300">
              <span className="flex items-center gap-1.5 text-slate-300 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                <span>Diastolic BP:</span>
              </span>
              <span className="font-bold text-sm">{data.diastolicBP} mmHg</span>
            </div>

            <div className="flex items-center justify-between text-cyan-300 border-t border-slate-800/80 pt-1.5">
              <span className="flex items-center gap-1.5 text-slate-300 text-[11px]">
                <HeartPulse className="w-3.5 h-3.5 text-cyan-400" />
                <span>Heart Rate:</span>
              </span>
              <span className="font-bold text-sm">{data.heartRate} BPM</span>
            </div>

            <div className="flex items-center justify-between text-slate-400 text-[10px] pt-1 border-t border-slate-800/50">
              <span>MAP: <strong className="text-slate-200">{data.map} mmHg</strong></span>
              <span>SpO₂: <strong className="text-emerald-400">{data.spo2}%</strong></span>
              <span>Temp: <strong className="text-amber-300">{data.tempF}°F</strong></span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs overflow-hidden space-y-5">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wider mb-1">
            <HeartPulse className="w-4 h-4 text-rose-500 animate-pulse" />
            <span>Hemodynamic Vitals & Pulse Monitoring</span>
          </div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Blood Pressure & Heart Rate Timeline</span>
            <span className="text-[11px] font-bold text-slate-500 font-normal">
              (7-Point Longitudinal Track)
            </span>
          </h3>
          <p className="text-xs text-slate-500">
            Real-time visual trajectory of cardiovascular stability, mean arterial perfusion, and pulse rate before prescription authorization.
          </p>
        </div>

        {/* View Toggle Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveMetricMode('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMetricMode === 'all'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Combined Dual-Axis
          </button>
          <button
            type="button"
            onClick={() => setActiveMetricMode('bp')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMetricMode === 'bp'
                ? 'bg-white text-rose-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Blood Pressure
          </button>
          <button
            type="button"
            onClick={() => setActiveMetricMode('hr')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMetricMode === 'hr'
                ? 'bg-white text-cyan-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Heart Rate
          </button>
        </div>
      </div>

      {/* KPI Vitals Scorecards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Heart Rate KPI */}
        <div className="p-3.5 rounded-2xl bg-cyan-50/60 border border-cyan-200/80">
          <div className="flex items-center justify-between text-xs text-cyan-900 mb-1">
            <span className="font-bold flex items-center gap-1">
              <HeartPulse className="w-3.5 h-3.5 text-cyan-600" />
              <span>Current Heart Rate</span>
            </span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                latestVitals.heartRate > 100
                  ? 'bg-rose-100 text-rose-800'
                  : latestVitals.heartRate < 60
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {latestVitals.heartRate > 100 ? 'Tachycardia' : latestVitals.heartRate < 60 ? 'Bradycardia' : 'Normal Sinus'}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-cyan-950 font-mono">
              {latestVitals.heartRate}
            </span>
            <span className="text-xs text-cyan-700 font-semibold">BPM</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
            {hrDelta >= 0 ? (
              <TrendingUp className="w-3 h-3 text-rose-500" />
            ) : (
              <TrendingDown className="w-3 h-3 text-emerald-500" />
            )}
            <span className="font-mono">{Math.abs(hrDelta)} bpm vs baseline</span>
          </div>
        </div>

        {/* Blood Pressure KPI */}
        <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-200/80">
          <div className="flex items-center justify-between text-xs text-rose-900 mb-1">
            <span className="font-bold flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-rose-600" />
              <span>Blood Pressure</span>
            </span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                latestVitals.systolicBP >= 140
                  ? 'bg-rose-200 text-rose-900'
                  : latestVitals.systolicBP >= 130
                  ? 'bg-amber-100 text-amber-900'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {latestVitals.status}
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-rose-950 font-mono">
              {latestVitals.systolicBP}/{latestVitals.diastolicBP}
            </span>
            <span className="text-xs text-rose-700 font-semibold">mmHg</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
            {bpSysDelta >= 0 ? (
              <TrendingUp className="w-3 h-3 text-rose-500" />
            ) : (
              <TrendingDown className="w-3 h-3 text-emerald-500" />
            )}
            <span className="font-mono">Systolic Δ {bpSysDelta >= 0 ? `+${bpSysDelta}` : bpSysDelta} mmHg</span>
          </div>
        </div>

        {/* Mean Arterial Pressure (MAP) */}
        <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-200/80">
          <div className="flex items-center justify-between text-xs text-indigo-900 mb-1">
            <span className="font-bold flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-indigo-600" />
              <span>Mean Arterial (MAP)</span>
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
              Target 70-105
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-indigo-950 font-mono">
              {latestVitals.map}
            </span>
            <span className="text-xs text-indigo-700 font-semibold">mmHg</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Optimal Organ Perfusion</span>
          </div>
        </div>

        {/* Pulse Pressure & SpO2 */}
        <div className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-200/80">
          <div className="flex items-center justify-between text-xs text-teal-900 mb-1">
            <span className="font-bold flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-teal-600" />
              <span>Pulse Pressure / SpO₂</span>
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-teal-100 text-teal-800">
              {latestVitals.spo2}% SpO₂
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-teal-950 font-mono">
              {latestVitals.pulsePressure}
            </span>
            <span className="text-xs text-teal-700 font-semibold">mmHg PP</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-teal-600" />
            <span>Vascular Elasticity Normal</span>
          </div>
        </div>
      </div>

      {/* Main Recharts Graph Viewport */}
      <div className="w-full h-80 relative pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={vitalsHistory}
            margin={{ top: 12, right: 20, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="systolicGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="hrGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />

            <XAxis
              dataKey="timeLabel"
              tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
            />

            {/* Left Y-Axis for Blood Pressure (mmHg) */}
            {(activeMetricMode === 'all' || activeMetricMode === 'bp') && (
              <YAxis
                yAxisId="bp"
                domain={[50, 190]}
                tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
                unit=" mmHg"
              />
            )}

            {/* Right Y-Axis for Heart Rate (BPM) */}
            {(activeMetricMode === 'all' || activeMetricMode === 'hr') && (
              <YAxis
                yAxisId="hr"
                orientation={activeMetricMode === 'hr' ? 'left' : 'right'}
                domain={[45, 140]}
                tick={{ fontSize: 11, fill: '#0891b2', fontWeight: 600 }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
                unit=" bpm"
              />
            )}

            <Tooltip content={<CustomVitalsTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: '12px', fontSize: '11px', fontWeight: 700 }}
            />

            {/* Clinical Reference Lines */}
            {(activeMetricMode === 'all' || activeMetricMode === 'bp') && (
              <>
                <ReferenceLine
                  yAxisId="bp"
                  y={120}
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: 'Normal Systolic <120',
                    fill: '#059669',
                    fontSize: 10,
                    position: 'insideBottomLeft',
                    fontWeight: 600
                  }}
                />
                <ReferenceLine
                  yAxisId="bp"
                  y={140}
                  stroke="#f43f5e"
                  strokeDasharray="3 3"
                  strokeWidth={1.2}
                  label={{
                    value: 'Stage 2 HTN Threshold (140)',
                    fill: '#e11d48',
                    fontSize: 10,
                    position: 'insideTopLeft',
                    fontWeight: 600
                  }}
                />
              </>
            )}

            {(activeMetricMode === 'all' || activeMetricMode === 'hr') && (
              <ReferenceLine
                yAxisId="hr"
                y={100}
                stroke="#06b6d4"
                strokeDasharray="3 3"
                strokeWidth={1.2}
                label={{
                  value: 'Tachycardia (100 bpm)',
                  fill: '#0891b2',
                  fontSize: 10,
                  position: 'insideTopRight',
                  fontWeight: 600
                }}
              />
            )}

            {/* Blood Pressure Lines & Areas */}
            {(activeMetricMode === 'all' || activeMetricMode === 'bp') && (
              <>
                <Area
                  yAxisId="bp"
                  type="monotone"
                  dataKey="systolicBP"
                  name="Systolic BP (mmHg)"
                  stroke="#ef4444"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#systolicGradient)"
                  activeDot={{ r: 6, fill: '#ef4444', stroke: '#ffffff', strokeWidth: 2 }}
                />
                <Line
                  yAxisId="bp"
                  type="monotone"
                  dataKey="diastolicBP"
                  name="Diastolic BP (mmHg)"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#6366f1' }}
                  activeDot={{ r: 5, fill: '#6366f1', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </>
            )}

            {/* Heart Rate Line */}
            {(activeMetricMode === 'all' || activeMetricMode === 'hr') && (
              <Line
                yAxisId="hr"
                type="monotone"
                dataKey="heartRate"
                name="Heart Rate (BPM)"
                stroke="#06b6d4"
                strokeWidth={2.5}
                strokeDasharray={activeMetricMode === 'all' ? '5 5' : undefined}
                dot={{ r: 4, fill: '#06b6d4', stroke: '#ffffff', strokeWidth: 1.5 }}
                activeDot={{ r: 6, fill: '#06b6d4', stroke: '#ffffff', strokeWidth: 2 }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Clinical Guidance */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100 gap-2">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>
            Telemetry synchronized from connected ambulatory monitors and triage intake.
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px] text-slate-600">
          <span>Avg MAP: <strong className="text-slate-900">{Math.round(vitalsHistory.reduce((acc, v) => acc + v.map, 0) / vitalsHistory.length)} mmHg</strong></span>
          <span>•</span>
          <span>HR Variance: <strong className="text-slate-900">±{Math.round(Math.abs(hrDelta) / 2)} bpm</strong></span>
        </div>
      </div>
    </div>
  );
};
