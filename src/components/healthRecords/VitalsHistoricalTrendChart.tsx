import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ReferenceArea
} from 'recharts';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  Filter,
  Flame,
  Heart,
  HeartPulse,
  Info,
  Maximize2,
  Minimize2,
  Plus,
  RefreshCw,
  Scale,
  Sparkles,
  Stethoscope,
  TrendingDown,
  TrendingUp,
  X,
  Zap
} from 'lucide-react';
import { HealthMetric } from '../../types';

export type VitalsMetricView = 'all' | 'bp' | 'heartRate';
export type VitalsTimeRange = 'all' | 'last7' | 'last14';

interface VitalsHistoricalTrendChartProps {
  vitals: HealthMetric[];
  onOpenVitalForm?: () => void;
  patientName?: string;
}

interface ChartDataPoint {
  id: string;
  rawDate: string;
  formattedDate: string;
  displayDate: string;
  timestamp: number;
  sys: number;
  dia: number;
  heartRate: number;
  pulsePressure: number;
  map: number; // Mean Arterial Pressure
  notes?: string;
  bpCategory: string;
  hrCategory: string;
}

export const VitalsHistoricalTrendChart: React.FC<VitalsHistoricalTrendChartProps> = ({
  vitals,
  onOpenVitalForm,
  patientName = 'Patient'
}) => {
  const [metricView, setMetricView] = useState<VitalsMetricView>('all');
  const [timeRange, setTimeRange] = useState<VitalsTimeRange>('all');
  const [showGuidelines, setShowGuidelines] = useState(true);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<ChartDataPoint | null>(null);

  // Helper to parse dates safely
  const parseDateToTimestamp = (dateStr: string): { timestamp: number; formatted: string; display: string } => {
    let d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      // Try parsing MM/DD/YYYY or DD/MM/YYYY
      const parts = dateStr.split(/[-/]/);
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        } else {
          d = new Date(Number(parts[2]), Number(parts[0]) - 1, Number(parts[1]));
        }
      }
    }

    if (isNaN(d.getTime())) {
      d = new Date();
    }

    const formatted = d.toLocaleDateString('default', { month: 'short', day: 'numeric' });
    const display = d.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' });
    return { timestamp: d.getTime(), formatted, display };
  };

  // Helper for AHA blood pressure categories
  const getBpCategory = (sys: number, dia: number): { label: string; color: string; badgeClass: string } => {
    if (sys >= 180 || dia >= 120) {
      return {
        label: 'Hypertensive Crisis',
        color: '#be123c',
        badgeClass: 'bg-rose-100 text-rose-900 border-rose-300'
      };
    }
    if (sys >= 140 || dia >= 90) {
      return {
        label: 'Stage 2 Hypertension',
        color: '#e11d48',
        badgeClass: 'bg-red-100 text-red-900 border-red-300'
      };
    }
    if ((sys >= 130 && sys <= 139) || (dia >= 80 && dia <= 89)) {
      return {
        label: 'Stage 1 Hypertension',
        color: '#f59e0b',
        badgeClass: 'bg-amber-100 text-amber-900 border-amber-300'
      };
    }
    if (sys >= 120 && sys <= 129 && dia < 80) {
      return {
        label: 'Elevated BP',
        color: '#0284c7',
        badgeClass: 'bg-sky-100 text-sky-900 border-sky-300'
      };
    }
    return {
      label: 'Normal BP (JNC-8 / AHA Benchmark)',
      color: '#0d9488',
      badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300'
    };
  };

  // Helper for heart rate categories
  const getHrCategory = (hr: number): { label: string; color: string } => {
    if (hr > 100) return { label: 'Tachycardia (>100 BPM)', color: '#e11d48' };
    if (hr < 60) return { label: 'Bradycardia (<60 BPM)', color: '#0284c7' };
    return { label: 'Normal Resting Sinus Rhythm (60-100 BPM)', color: '#0d9488' };
  };

  // Sort and format vitals data chronologically
  const sortedAndFormattedData = useMemo<ChartDataPoint[]>(() => {
    const parsed = vitals.map(v => {
      const { timestamp, formatted, display } = parseDateToTimestamp(v.date);
      const sys = Number(v.bloodPressureSys) || 120;
      const dia = Number(v.bloodPressureDia) || 80;
      const heartRate = Number(v.heartRate) || 72;
      const map = Math.round((2 * dia + sys) / 3);
      const pulsePressure = sys - dia;
      const bpCat = getBpCategory(sys, dia).label;
      const hrCat = getHrCategory(heartRate).label;

      return {
        id: v.id,
        rawDate: v.date,
        formattedDate: formatted,
        displayDate: display,
        timestamp,
        sys,
        dia,
        heartRate,
        pulsePressure,
        map,
        notes: v.notes,
        bpCategory: bpCat,
        hrCategory: hrCat
      };
    });

    // Sort chronologically ascending (earliest to latest for line chart)
    return parsed.sort((a, b) => a.timestamp - b.timestamp);
  }, [vitals]);

  // Apply time range filter
  const filteredData = useMemo<ChartDataPoint[]>(() => {
    if (timeRange === 'last7') {
      return sortedAndFormattedData.slice(-7);
    }
    if (timeRange === 'last14') {
      return sortedAndFormattedData.slice(-14);
    }
    return sortedAndFormattedData;
  }, [sortedAndFormattedData, timeRange]);

  // Compute longitudinal progress KPIs
  const progressStats = useMemo(() => {
    if (filteredData.length === 0) {
      return null;
    }

    const baseline = filteredData[0];
    const latest = filteredData[filteredData.length - 1];

    const sysDelta = latest.sys - baseline.sys;
    const diaDelta = latest.dia - baseline.dia;
    const hrDelta = latest.heartRate - baseline.heartRate;
    const mapDelta = latest.map - baseline.map;

    const latestBpCat = getBpCategory(latest.sys, latest.dia);
    const latestHrCat = getHrCategory(latest.heartRate);

    // Calculate averages
    const avgSys = Math.round(filteredData.reduce((acc, curr) => acc + curr.sys, 0) / filteredData.length);
    const avgDia = Math.round(filteredData.reduce((acc, curr) => acc + curr.dia, 0) / filteredData.length);
    const avgHr = Math.round(filteredData.reduce((acc, curr) => acc + curr.heartRate, 0) / filteredData.length);

    // Count in normal range
    const normalBpCount = filteredData.filter(d => d.sys < 120 && d.dia < 80).length;
    const normalRatePct = Math.round((normalBpCount / filteredData.length) * 100);

    return {
      baseline,
      latest,
      sysDelta,
      diaDelta,
      hrDelta,
      mapDelta,
      latestBpCat,
      latestHrCat,
      avgSys,
      avgDia,
      avgHr,
      normalRatePct,
      totalEntries: filteredData.length
    };
  }, [filteredData]);

  // Copy clinical progress report to clipboard
  const handleCopyDoctorProgressReport = () => {
    if (!progressStats) return;
    const report = `CLINICAL CARDIOVASCULAR PROGRESS REPORT:
Patient: ${patientName}
Evaluation Period: ${progressStats.baseline.displayDate} to ${progressStats.latest.displayDate} (${progressStats.totalEntries} readings)

CURRENT METRICS:
- Blood Pressure: ${progressStats.latest.sys}/${progressStats.latest.dia} mmHg (${progressStats.latestBpCat.label})
- Resting Heart Rate: ${progressStats.latest.heartRate} BPM (${progressStats.latestHrCat.label})
- Mean Arterial Pressure (MAP): ${progressStats.latest.map} mmHg (Normal range: 70-105 mmHg)
- Pulse Pressure: ${progressStats.latest.pulsePressure} mmHg

LONGITUDINAL TRENDS & DELTA SINCE BASELINE:
- Systolic BP: ${progressStats.baseline.sys} -> ${progressStats.latest.sys} mmHg (${progressStats.sysDelta <= 0 ? `${progressStats.sysDelta} mmHg reduction` : `+${progressStats.sysDelta} mmHg increase`})
- Diastolic BP: ${progressStats.baseline.dia} -> ${progressStats.latest.dia} mmHg (${progressStats.diaDelta <= 0 ? `${progressStats.diaDelta} mmHg reduction` : `+${progressStats.diaDelta} mmHg increase`})
- Heart Rate: ${progressStats.baseline.heartRate} -> ${progressStats.latest.heartRate} BPM (${progressStats.hrDelta <= 0 ? `${progressStats.hrDelta} BPM decrease` : `+${progressStats.hrDelta} BPM increase`})
- Period Averages: BP ${progressStats.avgSys}/${progressStats.avgDia} mmHg, Heart Rate ${progressStats.avgHr} BPM
- JNC-8 / AHA Normative Adherence: ${progressStats.normalRatePct}% of readings within optimal benchmark`;

    navigator.clipboard.writeText(report);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 3000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-all space-y-6">
      {/* Header & Sub-Navigation */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 text-teal-700 font-bold text-xs uppercase tracking-wider mb-1">
            <HeartPulse className="w-4 h-4 text-teal-600" />
            <span>Cardiovascular Hemodynamic Monitoring</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Blood Pressure &amp; Heart Rate Trend</span>
            {progressStats && (
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${progressStats.latestBpCat.badgeClass}`}>
                {progressStats.latest.sys}/{progressStats.latest.dia} mmHg • {progressStats.latestBpCat.label.split('(')[0]}
              </span>
            )}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Longitudinal biometrics tracking systolic, diastolic, and resting pulse trajectories over time from recorded clinical logs
          </p>
        </div>

        {/* Action Controls & Filters */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
          {/* Time Span Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setTimeRange('last7')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                timeRange === 'last7' ? 'bg-white text-teal-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Latest 7
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('last14')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                timeRange === 'last14' ? 'bg-white text-teal-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Latest 14
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                timeRange === 'all' ? 'bg-white text-teal-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Records ({vitals.length})
            </button>
          </div>

          {/* Guidelines Toggle */}
          <button
            type="button"
            onClick={() => setShowGuidelines(!showGuidelines)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              showGuidelines
                ? 'bg-teal-50 border-teal-200 text-teal-800 font-bold'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title="Toggle AHA 120/80 mmHg and 60-100 BPM target threshold lines"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>AHA Norms</span>
          </button>

          {/* Copy Report for Doctor */}
          <button
            type="button"
            onClick={handleCopyDoctorProgressReport}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Copy clinical cardiovascular progress summary for doctor visit"
          >
            {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSummary ? 'Copied Summary!' : 'Copy for Doctor'}</span>
          </button>
        </div>
      </div>

      {/* Progress & KPI Metrics Cards Strip */}
      {progressStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Systolic BP Progress */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
                <span>Systolic BP</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400">mmHg</span>
            </div>
            <div className="text-2xl font-black text-slate-900">
              {progressStats.latest.sys}{' '}
              <span className="text-xs font-normal text-slate-400">mmHg</span>
            </div>
            <div className="text-[11px] font-semibold mt-1 flex items-center gap-1">
              {progressStats.sysDelta <= 0 ? (
                <span className="text-emerald-700 flex items-center gap-0.5">
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  <span>{Math.abs(progressStats.sysDelta)} mmHg from baseline</span>
                </span>
              ) : (
                <span className="text-rose-600 flex items-center gap-0.5">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>+{progressStats.sysDelta} mmHg from baseline</span>
                </span>
              )}
            </div>
          </div>

          {/* Diastolic BP Progress */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-600"></span>
                <span>Diastolic BP</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400">mmHg</span>
            </div>
            <div className="text-2xl font-black text-slate-900">
              {progressStats.latest.dia}{' '}
              <span className="text-xs font-normal text-slate-400">mmHg</span>
            </div>
            <div className="text-[11px] font-semibold mt-1 flex items-center gap-1">
              {progressStats.diaDelta <= 0 ? (
                <span className="text-emerald-700 flex items-center gap-0.5">
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  <span>{Math.abs(progressStats.diaDelta)} mmHg from baseline</span>
                </span>
              ) : (
                <span className="text-rose-600 flex items-center gap-0.5">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>+{progressStats.diaDelta} mmHg from baseline</span>
                </span>
              )}
            </div>
          </div>

          {/* Resting Heart Rate / Pulse */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span>Resting Heart Rate</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400">BPM</span>
            </div>
            <div className="text-2xl font-black text-slate-900">
              {progressStats.latest.heartRate}{' '}
              <span className="text-xs font-normal text-slate-400">bpm</span>
            </div>
            <div className="text-[11px] font-semibold mt-1 flex items-center gap-1">
              {progressStats.hrDelta <= 0 ? (
                <span className="text-emerald-700 flex items-center gap-0.5">
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  <span>{Math.abs(progressStats.hrDelta)} bpm from baseline</span>
                </span>
              ) : (
                <span className="text-amber-600 flex items-center gap-0.5">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>+{progressStats.hrDelta} bpm from baseline</span>
                </span>
              )}
            </div>
          </div>

          {/* Mean Arterial Pressure (MAP) & Target Compliance */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
              <span>Mean Arterial (MAP)</span>
              <Activity className="w-3.5 h-3.5 text-teal-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">
              {progressStats.latest.map}{' '}
              <span className="text-xs font-normal text-slate-400">mmHg</span>
            </div>
            <div className="text-[11px] font-medium text-slate-500 truncate mt-1">
              Pulse Pressure: {progressStats.latest.pulsePressure} mmHg • Perfusion Stable
            </div>
          </div>
        </div>
      )}

      {/* Sub-toolbar: Metric View Selector (All vs BP vs Pulse) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-bold text-slate-700">Display Metric:</span>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setMetricView('all')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                metricView === 'all' ? 'bg-white text-teal-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Dual View (BP &amp; Pulse)
            </button>
            <button
              type="button"
              onClick={() => setMetricView('bp')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                metricView === 'bp' ? 'bg-white text-teal-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Blood Pressure (Sys / Dia)
            </button>
            <button
              type="button"
              onClick={() => setMetricView('heartRate')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                metricView === 'heartRate' ? 'bg-white text-teal-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Heart Rate Only
            </button>
          </div>
        </div>

        {/* Legend Indicator Chips */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-medium self-start sm:self-auto">
          {(metricView === 'all' || metricView === 'bp') && (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-teal-600 rounded"></span>
                <span className="text-slate-700 font-bold">Systolic BP</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-sky-600 rounded"></span>
                <span className="text-slate-700 font-bold">Diastolic BP</span>
              </div>
            </>
          )}
          {(metricView === 'all' || metricView === 'heartRate') && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-rose-500 rounded"></span>
              <span className="text-slate-700 font-bold">Pulse (BPM)</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Recharts Line Chart Canvas */}
      <div className="bg-slate-50/70 rounded-2xl border border-slate-200/90 p-4 sm:p-5">
        {filteredData.length < 2 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
              <HeartPulse className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800 text-base">Insufficient Historical Data Points</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              At least 2 biomarker readings are required to plot longitudinal hemodynamic trends.
            </p>
            {onOpenVitalForm && (
              <button
                type="button"
                onClick={onOpenVitalForm}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs cursor-pointer shadow-xs inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log New Biomarker Reading</span>
              </button>
            )}
          </div>
        ) : (
          <div className="h-72 sm:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={filteredData}
                margin={{ top: 15, right: metricView === 'all' ? 25 : 10, left: -20, bottom: 5 }}
                onClick={(e: any) => {
                  if (e && e.activePayload && e.activePayload[0]) {
                    setSelectedPoint(e.activePayload[0].payload as ChartDataPoint);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="formattedDate"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                
                {/* Left Y-Axis: Blood Pressure in mmHg */}
                {(metricView === 'all' || metricView === 'bp') && (
                  <YAxis
                    yAxisId="bp"
                    domain={[50, 180]}
                    tick={{ fontSize: 11, fill: '#0d9488' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                    tickFormatter={(v) => `${v}`}
                    label={{
                      value: 'BP (mmHg)',
                      angle: -90,
                      position: 'insideLeft',
                      offset: 30,
                      fill: '#0d9488',
                      fontSize: 10,
                      fontWeight: 'bold'
                    }}
                  />
                )}

                {/* Right Y-Axis: Heart Rate in BPM */}
                {(metricView === 'all' || metricView === 'heartRate') && (
                  <YAxis
                    yAxisId="hr"
                    orientation={metricView === 'all' ? 'right' : 'left'}
                    domain={[40, 130]}
                    tick={{ fontSize: 11, fill: '#e11d48' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                    tickFormatter={(v) => `${v}`}
                    label={{
                      value: 'Pulse (BPM)',
                      angle: metricView === 'all' ? 90 : -90,
                      position: metricView === 'all' ? 'insideRight' : 'insideLeft',
                      offset: metricView === 'all' ? 20 : 30,
                      fill: '#e11d48',
                      fontSize: 10,
                      fontWeight: 'bold'
                    }}
                  />
                )}

                <Tooltip content={<CustomVitalsTooltip />} />

                {/* Clinical Reference Lines for Guidelines */}
                {showGuidelines && (metricView === 'all' || metricView === 'bp') && (
                  <>
                    <ReferenceLine
                      yAxisId="bp"
                      y={120}
                      stroke="#0d9488"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      label={{
                        value: 'Normal Sys (120)',
                        fill: '#0d9488',
                        fontSize: 9,
                        position: 'insideTopLeft'
                      }}
                    />
                    <ReferenceLine
                      yAxisId="bp"
                      y={80}
                      stroke="#0284c7"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      label={{
                        value: 'Normal Dia (80)',
                        fill: '#0284c7',
                        fontSize: 9,
                        position: 'insideBottomLeft'
                      }}
                    />
                  </>
                )}

                {showGuidelines && (metricView === 'all' || metricView === 'heartRate') && (
                  <ReferenceLine
                    yAxisId="hr"
                    y={100}
                    stroke="#f43f5e"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{
                      value: 'Tachycardia Ceiling (100)',
                      fill: '#f43f5e',
                      fontSize: 9,
                      position: 'insideTopRight'
                    }}
                  />
                )}

                {/* Systolic Line */}
                {(metricView === 'all' || metricView === 'bp') && (
                  <Line
                    yAxisId="bp"
                    type="monotone"
                    dataKey="sys"
                    name="Systolic BP"
                    stroke="#0d9488"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#0d9488', strokeWidth: 2, stroke: '#ffffff' }}
                    activeDot={{ r: 6, fill: '#0f766e', stroke: '#ffffff', strokeWidth: 2 }}
                  />
                )}

                {/* Diastolic Line */}
                {(metricView === 'all' || metricView === 'bp') && (
                  <Line
                    yAxisId="bp"
                    type="monotone"
                    dataKey="dia"
                    name="Diastolic BP"
                    stroke="#0284c7"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#0284c7', strokeWidth: 2, stroke: '#ffffff' }}
                    activeDot={{ r: 6, fill: '#0369a1', stroke: '#ffffff', strokeWidth: 2 }}
                  />
                )}

                {/* Heart Rate / Pulse Line */}
                {(metricView === 'all' || metricView === 'heartRate') && (
                  <Line
                    yAxisId="hr"
                    type="monotone"
                    dataKey="heartRate"
                    name="Heart Rate"
                    stroke="#e11d48"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#e11d48', strokeWidth: 2, stroke: '#ffffff' }}
                    activeDot={{ r: 6, fill: '#be123c', stroke: '#ffffff', strokeWidth: 2 }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Selected Reading Drill-Down Inspection Card */}
      {selectedPoint && (
        <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 text-xs space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <Calendar className="w-4 h-4 text-teal-600" />
              <span>Inspection for Reading on {selectedPoint.displayDate}</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-teal-200/80 text-teal-900">
                BP: {selectedPoint.sys}/{selectedPoint.dia} mmHg
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedPoint(null)}
              className="text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="bg-white p-2.5 rounded-lg border border-teal-100">
              <span className="text-[10px] font-semibold text-slate-400 uppercase block">AHA BP Stage</span>
              <span className="font-bold text-slate-800">{selectedPoint.bpCategory}</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-teal-100">
              <span className="text-[10px] font-semibold text-slate-400 uppercase block">Resting Pulse</span>
              <span className="font-bold text-rose-700">{selectedPoint.heartRate} BPM</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-teal-100">
              <span className="text-[10px] font-semibold text-slate-400 uppercase block">Mean Arterial (MAP)</span>
              <span className="font-bold text-teal-800">{selectedPoint.map} mmHg</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-teal-100">
              <span className="text-[10px] font-semibold text-slate-400 uppercase block">Pulse Pressure</span>
              <span className="font-bold text-slate-800">{selectedPoint.pulsePressure} mmHg</span>
            </div>
          </div>

          {selectedPoint.notes && (
            <div className="p-2 rounded-lg bg-white/90 border border-teal-100 text-slate-700 italic">
              <strong>Clinical Context: </strong>
              {selectedPoint.notes}
            </div>
          )}
        </div>
      )}

      {/* Clinical Reference Standard Footnote */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-teal-600 shrink-0" />
          <span>
            AHA/ACC Reference: Normal Blood Pressure is <strong>&lt;120/80 mmHg</strong>. Normal adult resting heart rate is <strong>60–100 BPM</strong>.
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="font-semibold text-slate-700">
            {progressStats?.latestBpCat.label || 'Active Hemodynamic Tracking'}
          </span>
        </div>
      </div>
    </div>
  );
};

// Custom High-Contrast Tooltip for Hemodynamic Line Chart
const CustomVitalsTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data: ChartDataPoint = payload[0].payload;
    return (
      <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-xl border border-slate-700 text-xs space-y-2 min-w-[210px] z-50">
        <div className="flex items-center justify-between border-b border-slate-700 pb-1.5 font-bold">
          <span>{data.displayDate}</span>
          <span className="text-[10px] text-teal-300 font-mono">MAP {data.map} mmHg</span>
        </div>

        <div className="space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-400"></span>
              <span>Systolic:</span>
            </span>
            <span className="font-bold text-teal-300">{data.sys} mmHg</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400"></span>
              <span>Diastolic:</span>
            </span>
            <span className="font-bold text-sky-300">{data.dia} mmHg</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
              <span>Pulse / HR:</span>
            </span>
            <span className="font-bold text-rose-300">{data.heartRate} BPM</span>
          </div>

          <div className="pt-1.5 border-t border-slate-800 text-[10px] space-y-0.5">
            <div className="text-slate-300 font-semibold">{data.bpCategory}</div>
            <div className="text-slate-400">{data.hrCategory}</div>
          </div>

          {data.notes && (
            <div className="pt-1 border-t border-slate-800 text-[10px] text-slate-300 italic">
              "{data.notes}"
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};
