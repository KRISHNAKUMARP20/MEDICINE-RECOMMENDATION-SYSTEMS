import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  LineChart,
  Line,
  AreaChart,
  Area,
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
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Heart,
  HeartPulse,
  Info,
  Maximize2,
  Minimize2,
  Plus,
  Scale,
  ShieldCheck,
  Stethoscope,
  TrendingDown,
  TrendingUp,
  X,
  Zap
} from 'lucide-react';
import { HealthMetric, UserRecord } from '../../types';
import { storageService } from '../../services/storageService';

export type MetricViewMode = 'all' | 'bp' | 'heartRate' | 'weight' | 'glucose';

interface PatientHealthTrendChartProps {
  vitals: HealthMetric[];
  currentUser?: UserRecord;
  onAddVital?: (vital: HealthMetric) => void;
  onNavigateToRecords?: () => void;
}

export const PatientHealthTrendChart: React.FC<PatientHealthTrendChartProps> = ({
  vitals,
  currentUser,
  onAddVital,
  onNavigateToRecords
}) => {
  const [selectedMetric, setSelectedMetric] = useState<MetricViewMode>('bp');
  const [timeRange, setTimeRange] = useState<'7d' | '14d' | '30d' | 'all'>('all');
  const [chartType, setChartType] = useState<'area' | 'line'>('area');
  const [showQuickLogModal, setShowQuickLogModal] = useState(false);
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');

  // Quick Log Form State
  const [newDate, setNewDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [newSys, setNewSys] = useState('120');
  const [newDia, setNewDia] = useState('80');
  const [newHR, setNewHR] = useState('72');
  const [newWeight, setNewWeight] = useState('71.5');
  const [newSugar, setNewSugar] = useState('95');
  const [newTemp, setNewTemp] = useState('98.6');
  const [newNotes, setNewNotes] = useState('');

  // Sort and filter vitals chronologically
  const sortedVitals = useMemo(() => {
    return [...vitals].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [vitals]);

  const filteredVitals = useMemo(() => {
    if (timeRange === 'all' || sortedVitals.length <= 1) return sortedVitals;
    const now = new Date().getTime();
    const days = timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : 30;
    const cutoff = now - days * 24 * 3600 * 1000;
    const filtered = sortedVitals.filter(v => new Date(v.date).getTime() >= cutoff);
    return filtered.length > 0 ? filtered : sortedVitals;
  }, [sortedVitals, timeRange]);

  // Formatted chart points
  const chartData = useMemo(() => {
    return filteredVitals.map(v => {
      const weightVal = weightUnit === 'kg' ? v.weight : Math.round(v.weight * 2.20462 * 10) / 10;
      const d = new Date(v.date);
      const shortDate = isNaN(d.getTime())
        ? v.date
        : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      // Mean Arterial Pressure (MAP) = (2 * DBP + SBP) / 3
      const map = Math.round((2 * v.bloodPressureDia + v.bloodPressureSys) / 3);
      // Pulse Pressure = SBP - DBP
      const pulsePressure = v.bloodPressureSys - v.bloodPressureDia;

      return {
        id: v.id,
        rawDate: v.date,
        date: shortDate,
        systolic: v.bloodPressureSys,
        diastolic: v.bloodPressureDia,
        map,
        pulsePressure,
        heartRate: v.heartRate,
        weight: weightVal,
        bloodSugar: v.bloodSugar,
        temperature: v.temperature,
        notes: v.notes
      };
    });
  }, [filteredVitals, weightUnit]);

  // Statistical calculations
  const stats = useMemo(() => {
    if (chartData.length === 0) {
      return {
        latestSys: 120,
        latestDia: 80,
        sysDelta: 0,
        latestHR: 72,
        hrDelta: 0,
        latestWeight: 70,
        weightDelta: 0,
        latestSugar: 95,
        sugarDelta: 0,
        avgHR: 72,
        avgSys: 120,
        avgDia: 80,
        avgWeight: 70
      };
    }

    const first = chartData[0];
    const latest = chartData[chartData.length - 1];

    const sysDelta = latest.systolic - first.systolic;
    const hrDelta = latest.heartRate - first.heartRate;
    const weightDelta = Math.round((latest.weight - first.weight) * 10) / 10;
    const sugarDelta = latest.bloodSugar - first.bloodSugar;

    const sumSys = chartData.reduce((acc, c) => acc + c.systolic, 0);
    const sumDia = chartData.reduce((acc, c) => acc + c.diastolic, 0);
    const sumHR = chartData.reduce((acc, c) => acc + c.heartRate, 0);
    const sumWeight = chartData.reduce((acc, c) => acc + c.weight, 0);

    return {
      latestSys: latest.systolic,
      latestDia: latest.diastolic,
      sysDelta,
      latestHR: latest.heartRate,
      hrDelta,
      latestWeight: latest.weight,
      weightDelta,
      latestSugar: latest.bloodSugar,
      sugarDelta,
      avgHR: Math.round(sumHR / chartData.length),
      avgSys: Math.round(sumSys / chartData.length),
      avgDia: Math.round(sumDia / chartData.length),
      avgWeight: Math.round((sumWeight / chartData.length) * 10) / 10
    };
  }, [chartData]);

  // Clinical JNC-8 Blood Pressure Assessment
  const bpAssessment = useMemo(() => {
    const sys = stats.latestSys;
    const dia = stats.latestDia;
    if (sys < 120 && dia < 80) {
      return { label: 'Optimal / Normal', color: 'emerald', desc: 'JNC-8 & ACC/AHA Target Achieved' };
    } else if (sys <= 129 && dia < 80) {
      return { label: 'Elevated BP', color: 'amber', desc: 'Lifestyle intervention recommended' };
    } else if (sys <= 139 || dia <= 89) {
      return { label: 'Stage 1 HTN', color: 'orange', desc: 'Monitor and review medication' };
    } else {
      return { label: 'Stage 2 HTN', color: 'rose', desc: 'Clinical evaluation required' };
    }
  }, [stats.latestSys, stats.latestDia]);

  // Handle Quick Log Submit
  const handleSubmitVital = (e: React.FormEvent) => {
    e.preventDefault();
    const weightParsed = parseFloat(newWeight) || 70;
    const finalWeightKg = weightUnit === 'kg' ? weightParsed : Math.round((weightParsed / 2.20462) * 10) / 10;

    const metric: HealthMetric = {
      id: `vital_${Date.now()}`,
      date: newDate,
      bloodPressureSys: parseInt(newSys, 10) || 120,
      bloodPressureDia: parseInt(newDia, 10) || 80,
      heartRate: parseInt(newHR, 10) || 72,
      bloodSugar: parseInt(newSugar, 10) || 95,
      temperature: parseFloat(newTemp) || 98.6,
      weight: finalWeightKg,
      notes: newNotes.trim() ? newNotes.trim() : undefined
    };

    if (onAddVital) {
      onAddVital(metric);
    } else {
      storageService.addVital(metric);
    }

    setShowQuickLogModal(false);
    setNewNotes('');
  };

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-xl border border-slate-700 text-xs min-w-[200px] z-50">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <span className="font-bold text-teal-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{dataPoint.rawDate || label}</span>
            </span>
            <span className="text-[10px] text-slate-400">Entry #{dataPoint.id?.slice(-4) || ''}</span>
          </div>

          <div className="space-y-1.5">
            {(selectedMetric === 'all' || selectedMetric === 'bp') && (
              <div className="flex items-center justify-between">
                <span className="text-slate-300 flex items-center gap-1">
                  <Heart className="w-3 h-3 text-rose-400" />
                  <span>Blood Pressure:</span>
                </span>
                <span className="font-bold font-mono text-rose-300">
                  {dataPoint.systolic}/{dataPoint.diastolic} <span className="text-[10px] text-slate-400 font-normal">mmHg</span>
                </span>
              </div>
            )}

            {(selectedMetric === 'all' || selectedMetric === 'heartRate') && (
              <div className="flex items-center justify-between">
                <span className="text-slate-300 flex items-center gap-1">
                  <HeartPulse className="w-3 h-3 text-emerald-400" />
                  <span>Heart Rate:</span>
                </span>
                <span className="font-bold font-mono text-emerald-300">
                  {dataPoint.heartRate} <span className="text-[10px] text-slate-400 font-normal">BPM</span>
                </span>
              </div>
            )}

            {(selectedMetric === 'all' || selectedMetric === 'weight') && (
              <div className="flex items-center justify-between">
                <span className="text-slate-300 flex items-center gap-1">
                  <Scale className="w-3 h-3 text-amber-400" />
                  <span>Body Weight:</span>
                </span>
                <span className="font-bold font-mono text-amber-300">
                  {dataPoint.weight} <span className="text-[10px] text-slate-400 font-normal">{weightUnit}</span>
                </span>
              </div>
            )}

            {(selectedMetric === 'all' || selectedMetric === 'glucose') && (
              <div className="flex items-center justify-between">
                <span className="text-slate-300 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-sky-400" />
                  <span>Fasting Glucose:</span>
                </span>
                <span className="font-bold font-mono text-sky-300">
                  {dataPoint.bloodSugar} <span className="text-[10px] text-slate-400 font-normal">mg/dL</span>
                </span>
              </div>
            )}

            {dataPoint.notes && (
              <div className="pt-2 mt-2 border-t border-slate-800 text-[11px] text-slate-400 italic">
                "{dataPoint.notes}"
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-700 font-bold text-xs uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4 text-teal-600" />
            <span>Interactive Health Progress Tracking & Recharts Analytics</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Patient Health Metric Trends Over Time
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Continuous longitudinal tracking of weight, blood pressure, and heart rate with clinical reference zones.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Unit Toggle for Weight */}
          {selectedMetric === 'weight' && (
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setWeightUnit('kg')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  weightUnit === 'kg' ? 'bg-white text-teal-900 shadow-2xs font-bold' : 'text-slate-600'
                }`}
              >
                kg
              </button>
              <button
                type="button"
                onClick={() => setWeightUnit('lbs')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  weightUnit === 'lbs' ? 'bg-white text-teal-900 shadow-2xs font-bold' : 'text-slate-600'
                }`}
              >
                lbs
              </button>
            </div>
          )}

          {/* Time Range Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setTimeRange('7d')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                timeRange === '7d' ? 'bg-white text-teal-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              7D
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('14d')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                timeRange === '14d' ? 'bg-white text-teal-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              14D
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('30d')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                timeRange === '30d' ? 'bg-white text-teal-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              30D
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('all')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                timeRange === 'all' ? 'bg-white text-teal-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Time
            </button>
          </div>

          {/* Chart Display Style Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setChartType('area')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                chartType === 'area' ? 'bg-white text-teal-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Shaded Area Chart"
            >
              Area
            </button>
            <button
              type="button"
              onClick={() => setChartType('line')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                chartType === 'line' ? 'bg-white text-teal-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Clean Line Chart"
            >
              Line
            </button>
          </div>

          {/* Quick Log Button */}
          <button
            type="button"
            onClick={() => setShowQuickLogModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Vitals</span>
          </button>
        </div>
      </div>

      {/* Metric Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setSelectedMetric('bp')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            selectedMetric === 'bp'
              ? 'bg-rose-50 text-rose-800 border-2 border-rose-400 shadow-2xs'
              : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <Heart className="w-4 h-4 text-rose-500" />
          <span>Blood Pressure (Sys / Dia)</span>
          <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-white border border-rose-200 text-rose-700">
            {stats.latestSys}/{stats.latestDia} mmHg
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedMetric('heartRate')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            selectedMetric === 'heartRate'
              ? 'bg-emerald-50 text-emerald-800 border-2 border-emerald-400 shadow-2xs'
              : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <HeartPulse className="w-4 h-4 text-emerald-500" />
          <span>Heart Rate (Pulse)</span>
          <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-white border border-emerald-200 text-emerald-700">
            {stats.latestHR} BPM
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedMetric('weight')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            selectedMetric === 'weight'
              ? 'bg-amber-50 text-amber-800 border-2 border-amber-400 shadow-2xs'
              : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <Scale className="w-4 h-4 text-amber-500" />
          <span>Body Weight</span>
          <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-white border border-amber-200 text-amber-700">
            {stats.latestWeight} {weightUnit}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedMetric('glucose')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            selectedMetric === 'glucose'
              ? 'bg-sky-50 text-sky-800 border-2 border-sky-400 shadow-2xs'
              : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <Zap className="w-4 h-4 text-sky-500" />
          <span>Blood Sugar</span>
          <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-white border border-sky-200 text-sky-700">
            {stats.latestSugar} mg/dL
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedMetric('all')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            selectedMetric === 'all'
              ? 'bg-teal-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>All Metrics Overlay</span>
        </button>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Blood Pressure KPI */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium">Blood Pressure</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              bpAssessment.color === 'emerald' ? 'bg-emerald-100 text-emerald-800' :
              bpAssessment.color === 'amber' ? 'bg-amber-100 text-amber-800' :
              bpAssessment.color === 'orange' ? 'bg-orange-100 text-orange-800' :
              'bg-rose-100 text-rose-800'
            }`}>
              {bpAssessment.label}
            </span>
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-900 flex items-baseline gap-1">
            <span>{stats.latestSys}/{stats.latestDia}</span>
            <span className="text-[11px] font-normal text-slate-500">mmHg</span>
          </div>
          <div className="text-[11px] mt-1 text-slate-500 flex items-center gap-1">
            {stats.sysDelta <= 0 ? (
              <span className="text-emerald-600 font-semibold flex items-center">
                <ArrowDownRight className="w-3 h-3" />
                {Math.abs(stats.sysDelta)} mmHg vs start
              </span>
            ) : (
              <span className="text-rose-600 font-semibold flex items-center">
                <ArrowUpRight className="w-3 h-3" />
                +{stats.sysDelta} mmHg vs start
              </span>
            )}
          </div>
        </div>

        {/* Heart Rate KPI */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium">Heart Rate</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
              Sinus Rhythm
            </span>
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-900 flex items-baseline gap-1">
            <span>{stats.latestHR}</span>
            <span className="text-[11px] font-normal text-slate-500">BPM</span>
          </div>
          <div className="text-[11px] mt-1 text-slate-500">
            Avg: <strong className="text-slate-700">{stats.avgHR} BPM</strong> (Target: 60-100)
          </div>
        </div>

        {/* Weight Progress KPI */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium">Body Weight</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900">
              {stats.weightDelta <= 0 ? 'Progress' : 'Tracked'}
            </span>
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-900 flex items-baseline gap-1">
            <span>{stats.latestWeight}</span>
            <span className="text-[11px] font-normal text-slate-500">{weightUnit}</span>
          </div>
          <div className="text-[11px] mt-1 text-slate-500 flex items-center gap-1">
            {stats.weightDelta <= 0 ? (
              <span className="text-emerald-600 font-semibold flex items-center">
                <ArrowDownRight className="w-3 h-3" />
                {Math.abs(stats.weightDelta)} {weightUnit} overall
              </span>
            ) : (
              <span className="text-amber-600 font-semibold flex items-center">
                <ArrowUpRight className="w-3 h-3" />
                +{stats.weightDelta} {weightUnit} overall
              </span>
            )}
          </div>
        </div>

        {/* Glucose KPI */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium">Blood Sugar</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-100 text-sky-800">
              Fasting
            </span>
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-900 flex items-baseline gap-1">
            <span>{stats.latestSugar}</span>
            <span className="text-[11px] font-normal text-slate-500">mg/dL</span>
          </div>
          <div className="text-[11px] mt-1 text-slate-500">
            Euglycemic range (&lt; 100 mg/dL)
          </div>
        </div>
      </div>

      {/* Main Recharts Visualization Canvas */}
      <div className="h-72 sm:h-80 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {selectedMetric === 'bp' ? (
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="sysGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="diaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <YAxis
                domain={[60, 160]}
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
                unit=" mmHg"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} iconType="circle" />

              {/* JNC-8 Target Threshold Reference Lines */}
              <ReferenceLine y={120} stroke="#10b981" strokeDasharray="4 4" label={{ value: 'Normal SBP (120)', position: 'insideTopRight', fill: '#059669', fontSize: 10 }} />
              <ReferenceLine y={80} stroke="#0ea5e9" strokeDasharray="4 4" label={{ value: 'Normal DBP (80)', position: 'insideBottomRight', fill: '#0284c7', fontSize: 10 }} />
              <ReferenceLine y={140} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: 'Stage 1 HTN (140)', position: 'insideTopLeft', fill: '#e11d48', fontSize: 10 }} />

              {chartType === 'area' ? (
                <>
                  <Area
                    type="monotone"
                    dataKey="systolic"
                    name="Systolic BP (mmHg)"
                    stroke="#f43f5e"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#sysGradient)"
                    activeDot={{ r: 6, stroke: '#f43f5e', strokeWidth: 2, fill: '#ffffff' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="diastolic"
                    name="Diastolic BP (mmHg)"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#diaGradient)"
                    activeDot={{ r: 6, stroke: '#6366f1', strokeWidth: 2, fill: '#ffffff' }}
                  />
                </>
              ) : (
                <>
                  <Line
                    type="monotone"
                    dataKey="systolic"
                    name="Systolic BP (mmHg)"
                    stroke="#f43f5e"
                    strokeWidth={2.5}
                    dot={{ r: 4, stroke: '#f43f5e', strokeWidth: 2, fill: '#ffffff' }}
                    activeDot={{ r: 6, fill: '#f43f5e' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="diastolic"
                    name="Diastolic BP (mmHg)"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    dot={{ r: 4, stroke: '#6366f1', strokeWidth: 2, fill: '#ffffff' }}
                    activeDot={{ r: 6, fill: '#6366f1' }}
                  />
                </>
              )}
            </ComposedChart>
          ) : selectedMetric === 'heartRate' ? (
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="hrGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <YAxis
                domain={[50, 110]}
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
                unit=" BPM"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} iconType="circle" />

              {/* Resting Normal Heart Rate Zone (60 - 100 BPM) */}
              <ReferenceArea y1={60} y2={100} fill="#10b981" fillOpacity={0.06} />
              <ReferenceLine y={60} stroke="#10b981" strokeDasharray="4 4" label={{ value: 'Lower Sinus Limit (60)', position: 'insideBottomRight', fill: '#059669', fontSize: 10 }} />
              <ReferenceLine y={100} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Tachycardia Threshold (100)', position: 'insideTopRight', fill: '#d97706', fontSize: 10 }} />

              {chartType === 'area' ? (
                <Area
                  type="monotone"
                  dataKey="heartRate"
                  name="Resting Heart Rate (BPM)"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#hrGradient)"
                  activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#ffffff' }}
                />
              ) : (
                <Line
                  type="monotone"
                  dataKey="heartRate"
                  name="Resting Heart Rate (BPM)"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 4, stroke: '#10b981', strokeWidth: 2, fill: '#ffffff' }}
                  activeDot={{ r: 6, fill: '#10b981' }}
                />
              )}
            </ComposedChart>
          ) : selectedMetric === 'weight' ? (
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <YAxis
                domain={['auto', 'auto']}
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
                unit={` ${weightUnit}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} iconType="circle" />

              {chartType === 'area' ? (
                <Area
                  type="monotone"
                  dataKey="weight"
                  name={`Body Weight (${weightUnit})`}
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#weightGradient)"
                  activeDot={{ r: 6, stroke: '#f59e0b', strokeWidth: 2, fill: '#ffffff' }}
                />
              ) : (
                <Line
                  type="monotone"
                  dataKey="weight"
                  name={`Body Weight (${weightUnit})`}
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={{ r: 4, stroke: '#f59e0b', strokeWidth: 2, fill: '#ffffff' }}
                  activeDot={{ r: 6, fill: '#f59e0b' }}
                />
              )}
            </ComposedChart>
          ) : selectedMetric === 'glucose' ? (
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="sugarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <YAxis
                domain={[70, 140]}
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
                unit=" mg/dL"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} iconType="circle" />

              <ReferenceLine y={100} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Fasting Impaired (100)', position: 'insideTopRight', fill: '#d97706', fontSize: 10 }} />
              <ReferenceLine y={126} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: 'Diabetic Threshold (126)', position: 'insideTopLeft', fill: '#e11d48', fontSize: 10 }} />

              <Area
                type="monotone"
                dataKey="bloodSugar"
                name="Fasting Blood Glucose (mg/dL)"
                stroke="#0ea5e9"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#sugarGradient)"
                activeDot={{ r: 6, stroke: '#0ea5e9', strokeWidth: 2, fill: '#ffffff' }}
              />
            </ComposedChart>
          ) : (
            // Combined Multi-Metric Normalized Overview
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <YAxis
                yAxisId="bp"
                domain={[60, 160]}
                tick={{ fontSize: 10, fill: '#64748b' }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <YAxis
                yAxisId="weight"
                orientation="right"
                domain={['auto', 'auto']}
                tick={{ fontSize: 10, fill: '#64748b' }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} iconType="circle" />

              <Line
                yAxisId="bp"
                type="monotone"
                dataKey="systolic"
                name="Sys BP (mmHg)"
                stroke="#f43f5e"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                yAxisId="bp"
                type="monotone"
                dataKey="diastolic"
                name="Dia BP (mmHg)"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                yAxisId="bp"
                type="monotone"
                dataKey="heartRate"
                name="Heart Rate (BPM)"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                yAxisId="weight"
                type="monotone"
                dataKey="weight"
                name={`Weight (${weightUnit})`}
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 3 }}
              />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Clinical Progress Summary Note & Guidelines Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
          <span>
            {selectedMetric === 'bp' && 'Clinical Guideline: ACC/AHA 2017 & JNC-8 guideline targets systolic <120 and diastolic <80 mmHg.'}
            {selectedMetric === 'heartRate' && 'Normal sinus rhythm resting pulse is 60-100 BPM for adults.'}
            {selectedMetric === 'weight' && `Progress: ${Math.abs(stats.weightDelta)} ${weightUnit} ${stats.weightDelta <= 0 ? 'lost' : 'gained'} over tracked period.`}
            {selectedMetric === 'glucose' && 'ADA guidelines define fasting glucose <100 mg/dL as normal euglycemia.'}
            {selectedMetric === 'all' && 'Showing synchronized longitudinal vitals overlay with dual y-axis scaling.'}
          </span>
        </div>

        {onNavigateToRecords && (
          <button
            type="button"
            onClick={onNavigateToRecords}
            className="font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>Full Health Records History</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Modal for Quick Logging Vitals */}
      {showQuickLogModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-fadeIn">
            <div className="bg-teal-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-800 text-teal-300 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Log Patient Vitals</h3>
                  <p className="text-xs text-teal-200">Record updated biometric measurements</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowQuickLogModal(false)}
                className="text-teal-300 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitVital} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Observation Date</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-teal-500 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Systolic BP (mmHg)</label>
                  <input
                    type="number"
                    value={newSys}
                    onChange={e => setNewSys(e.target.value)}
                    placeholder="120"
                    min="60"
                    max="240"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-teal-500 font-mono font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Diastolic BP (mmHg)</label>
                  <input
                    type="number"
                    value={newDia}
                    onChange={e => setNewDia(e.target.value)}
                    placeholder="80"
                    min="40"
                    max="160"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-teal-500 font-mono font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Heart Rate (BPM)</label>
                  <input
                    type="number"
                    value={newHR}
                    onChange={e => setNewHR(e.target.value)}
                    placeholder="72"
                    min="30"
                    max="220"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-teal-500 font-mono font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Body Weight ({weightUnit})</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newWeight}
                    onChange={e => setNewWeight(e.target.value)}
                    placeholder="70"
                    min="20"
                    max="300"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-teal-500 font-mono font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fasting Glucose (mg/dL)</label>
                  <input
                    type="number"
                    value={newSugar}
                    onChange={e => setNewSugar(e.target.value)}
                    placeholder="95"
                    min="40"
                    max="500"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-teal-500 font-mono font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Temperature (°F)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newTemp}
                    onChange={e => setNewTemp(e.target.value)}
                    placeholder="98.6"
                    min="90"
                    max="108"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-teal-500 font-mono font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clinical Notes (Optional)</label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                  placeholder="e.g. Post morning walk, felt energetic"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-teal-500 text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowQuickLogModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
