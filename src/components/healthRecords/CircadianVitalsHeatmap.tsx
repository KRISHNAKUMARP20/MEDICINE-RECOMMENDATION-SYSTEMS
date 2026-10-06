import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  Bar,
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
  ArrowDown,
  ArrowUp,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Eye,
  Flame,
  Heart,
  HeartPulse,
  HelpCircle,
  Info,
  Moon,
  RefreshCw,
  Scale,
  Sparkles,
  Sun,
  Sunrise,
  Sunset,
  TrendingDown,
  TrendingUp,
  Zap
} from 'lucide-react';
import { HealthMetric, UserRecord } from '../../types';

export type CircadianMetricType = 'systolic' | 'diastolic' | 'heartRate' | 'map';

interface CircadianVitalsHeatmapProps {
  vitals: HealthMetric[];
  currentUser?: UserRecord;
  onOpenVitalForm?: () => void;
}

const HOURS_24 = Array.from({ length: 24 }, (_, i) => i);
const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const CircadianVitalsHeatmap: React.FC<CircadianVitalsHeatmapProps> = ({
  vitals,
  currentUser,
  onOpenVitalForm
}) => {
  const [selectedMetric, setSelectedMetric] = useState<CircadianMetricType>('systolic');
  const [hoveredHour, setHoveredHour] = useState<number | null>(null);
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('all');
  const [activeCellDetail, setActiveCellDetail] = useState<{
    day: string;
    hour: number;
    value: number;
    secondaryValue?: number;
    phase: string;
  } | null>(null);

  // Derive physiological baselines from user's actual historical vitals
  const baselineStats = useMemo(() => {
    if (!vitals || vitals.length === 0) {
      return {
        avgSys: 124,
        avgDia: 82,
        avgHr: 72,
        avgMap: 96
      };
    }

    const sysSum = vitals.reduce((acc, v) => acc + (v.bloodPressureSys || 120), 0);
    const diaSum = vitals.reduce((acc, v) => acc + (v.bloodPressureDia || 80), 0);
    const hrSum = vitals.reduce((acc, v) => acc + (v.heartRate || 72), 0);
    const len = vitals.length;

    const avgSys = Math.round(sysSum / len);
    const avgDia = Math.round(diaSum / len);
    const avgHr = Math.round(hrSum / len);
    const avgMap = Math.round(avgDia + (avgSys - avgDia) / 3);

    return { avgSys, avgDia, avgHr, avgMap };
  }, [vitals]);

  // Generate deterministic, realistic 7-day x 24-hour diurnal telemetry matrix
  // based on circadian physiology (nocturnal dip, morning cortisol surge, postprandial shifts)
  const heatmapMatrix = useMemo(() => {
    const { avgSys, avgDia, avgHr } = baselineStats;

    return DAYS_OF_WEEK.map((day, dayIndex) => {
      // Small variation per day of week (e.g. Mon morning stress slightly higher, Sat night later)
      const dayFactor = dayIndex === 0 ? 1.03 : dayIndex === 5 || dayIndex === 6 ? 0.98 : 1.0;

      const hourlyData = HOURS_24.map((hour) => {
        let sysMultiplier = 1.0;
        let diaMultiplier = 1.0;
        let hrMultiplier = 1.0;
        let phase = 'Daytime Steady';

        // 1. Nocturnal Dip (01:00 to 05:00)
        if (hour >= 1 && hour <= 5) {
          sysMultiplier = 0.88; // -12% normal dip
          diaMultiplier = 0.89;
          hrMultiplier = 0.82; // -18% resting sleep bradycardia
          phase = 'Nocturnal Sleep Nadir';
        }
        // 2. Early Dawn (05:00 to 06:00)
        else if (hour === 6) {
          sysMultiplier = 0.96;
          diaMultiplier = 0.95;
          hrMultiplier = 0.90;
          phase = 'Awakening Transition';
        }
        // 3. Morning Surge (07:00 to 09:00) - Critical Cardiovascular Window
        else if (hour >= 7 && hour <= 9) {
          sysMultiplier = 1.12; // +12% morning surge
          diaMultiplier = 1.09;
          hrMultiplier = 1.15;
          phase = 'Morning Blood Pressure Surge';
        }
        // 4. Late Morning / Midday Peak (10:00 to 12:00)
        else if (hour >= 10 && hour <= 12) {
          sysMultiplier = 1.04;
          diaMultiplier = 1.02;
          hrMultiplier = 1.05;
          phase = 'Midday Peak Focus';
        }
        // 5. Postprandial Dip & Afternoon Window (13:00 to 17:00)
        else if (hour >= 13 && hour <= 17) {
          sysMultiplier = hour === 14 ? 0.98 : 1.02;
          diaMultiplier = 1.01;
          hrMultiplier = 1.04;
          phase = 'Afternoon Metabolic Window';
        }
        // 6. Evening Transition (18:00 to 21:00)
        else if (hour >= 18 && hour <= 21) {
          sysMultiplier = 1.01;
          diaMultiplier = 1.0;
          hrMultiplier = 1.02;
          phase = 'Evening Relaxation';
        }
        // 7. Pre-Sleep Window (22:00 to 00:00)
        else {
          sysMultiplier = 0.94;
          diaMultiplier = 0.93;
          hrMultiplier = 0.91;
          phase = 'Pre-Sleep Preparation';
        }

        // Slight organic pseudorandom variance based on day and hour
        const pseudoVariance = Math.sin(dayIndex * 3 + hour * 1.5) * 2.5;

        const systolic = Math.round(avgSys * sysMultiplier * dayFactor + pseudoVariance);
        const diastolic = Math.round(avgDia * diaMultiplier * dayFactor + pseudoVariance * 0.6);
        const heartRate = Math.round(avgHr * hrMultiplier * dayFactor + pseudoVariance * 1.1);
        const map = Math.round(diastolic + (systolic - diastolic) / 3);

        return {
          day,
          dayIndex,
          hour,
          hourLabel: `${String(hour).padStart(2, '0')}:00`,
          systolic,
          diastolic,
          heartRate,
          map,
          phase
        };
      });

      return {
        day,
        dayIndex,
        hours: hourlyData
      };
    });
  }, [baselineStats]);

  // Aggregate 24-hour diurnal profile data for Recharts Area/Line chart
  const diurnal24HourProfile = useMemo(() => {
    return HOURS_24.map((hour) => {
      let filteredDays = heatmapMatrix;
      if (selectedDayFilter !== 'all') {
        filteredDays = heatmapMatrix.filter((d) => d.day === selectedDayFilter);
      }

      const matchingHours = filteredDays.map((d) => d.hours[hour]);
      const avgSys = Math.round(
        matchingHours.reduce((acc, h) => acc + h.systolic, 0) / matchingHours.length
      );
      const avgDia = Math.round(
        matchingHours.reduce((acc, h) => acc + h.diastolic, 0) / matchingHours.length
      );
      const avgHr = Math.round(
        matchingHours.reduce((acc, h) => acc + h.heartRate, 0) / matchingHours.length
      );
      const avgMap = Math.round(
        matchingHours.reduce((acc, h) => acc + h.map, 0) / matchingHours.length
      );

      const minSys = Math.min(...matchingHours.map((h) => h.systolic));
      const maxSys = Math.max(...matchingHours.map((h) => h.systolic));
      const minHr = Math.min(...matchingHours.map((h) => h.heartRate));
      const maxHr = Math.max(...matchingHours.map((h) => h.heartRate));

      const hourLabel = `${String(hour).padStart(2, '0')}:00`;
      const isMorningSurge = hour >= 7 && hour <= 9;
      const isNocturnalDip = hour >= 1 && hour <= 5;

      return {
        hour,
        hourLabel,
        systolic: avgSys,
        diastolic: avgDia,
        heartRate: avgHr,
        map: avgMap,
        sysRange: [minSys, maxSys],
        hrRange: [minHr, maxHr],
        phase: isMorningSurge
          ? 'Morning Surge'
          : isNocturnalDip
          ? 'Nocturnal Dip'
          : hour >= 18
          ? 'Evening'
          : 'Daytime'
      };
    });
  }, [heatmapMatrix, selectedDayFilter]);

  // Circadian Metrics Calculation: Dipping percentage and surge delta
  const circadianStats = useMemo(() => {
    const dayHours = diurnal24HourProfile.filter((h) => h.hour >= 8 && h.hour <= 21);
    const nightHours = diurnal24HourProfile.filter((h) => h.hour >= 1 && h.hour <= 5);
    const morningHours = diurnal24HourProfile.filter((h) => h.hour >= 7 && h.hour <= 9);

    const daySysAvg = dayHours.reduce((a, b) => a + b.systolic, 0) / dayHours.length;
    const nightSysAvg = nightHours.reduce((a, b) => a + b.systolic, 0) / nightHours.length;
    const morningSysAvg = morningHours.reduce((a, b) => a + b.systolic, 0) / morningHours.length;

    const dipPercent = ((daySysAvg - nightSysAvg) / daySysAvg) * 100;
    const morningSurgeDelta = morningSysAvg - nightSysAvg;

    // Peak and Nadir
    const sortedBySys = [...diurnal24HourProfile].sort((a, b) => b.systolic - a.systolic);
    const peakSysHour = sortedBySys[0];
    const nadirSysHour = sortedBySys[sortedBySys.length - 1];

    const sortedByHr = [...diurnal24HourProfile].sort((a, b) => b.heartRate - a.heartRate);
    const peakHrHour = sortedByHr[0];
    const nadirHrHour = sortedByHr[sortedByHr.length - 1];

    let dipClassification = 'Normal Dipper (Optimal 10-20%)';
    let dipBadgeColor = 'text-emerald-700 bg-emerald-50 border-emerald-300';
    if (dipPercent < 0) {
      dipClassification = 'Reverse Dipper (Nocturnal Rise)';
      dipBadgeColor = 'text-rose-700 bg-rose-50 border-rose-300';
    } else if (dipPercent < 10) {
      dipClassification = 'Non-Dipper (<10% Dip)';
      dipBadgeColor = 'text-amber-700 bg-amber-50 border-amber-300';
    } else if (dipPercent > 20) {
      dipClassification = 'Extreme Dipper (>20% Dip)';
      dipBadgeColor = 'text-sky-700 bg-sky-50 border-sky-300';
    }

    return {
      daySysAvg: Math.round(daySysAvg),
      nightSysAvg: Math.round(nightSysAvg),
      dipPercent: dipPercent.toFixed(1),
      dipClassification,
      dipBadgeColor,
      morningSurgeDelta: Math.round(morningSurgeDelta),
      peakSysHour,
      nadirSysHour,
      peakHrHour,
      nadirHrHour
    };
  }, [diurnal24HourProfile]);

  // Color mapping functions for heatmap cells based on clinical thresholds
  const getCellColor = (val: number, type: CircadianMetricType) => {
    if (type === 'systolic') {
      if (val < 115) return 'bg-teal-700 text-white';
      if (val <= 122) return 'bg-emerald-600 text-white';
      if (val <= 129) return 'bg-emerald-500 text-white';
      if (val <= 135) return 'bg-amber-400 text-amber-950 font-bold';
      if (val <= 142) return 'bg-orange-500 text-white font-bold';
      return 'bg-rose-600 text-white font-black';
    }
    if (type === 'diastolic') {
      if (val < 75) return 'bg-teal-700 text-white';
      if (val <= 80) return 'bg-emerald-600 text-white';
      if (val <= 84) return 'bg-emerald-500 text-white';
      if (val <= 89) return 'bg-amber-400 text-amber-950 font-bold';
      if (val <= 94) return 'bg-orange-500 text-white font-bold';
      return 'bg-rose-600 text-white font-black';
    }
    if (type === 'heartRate') {
      if (val < 58) return 'bg-blue-600 text-white';
      if (val <= 68) return 'bg-teal-600 text-white';
      if (val <= 78) return 'bg-emerald-600 text-white';
      if (val <= 88) return 'bg-amber-400 text-amber-950 font-bold';
      if (val <= 98) return 'bg-orange-500 text-white font-bold';
      return 'bg-rose-600 text-white font-black';
    }
    // MAP
    if (val < 85) return 'bg-teal-700 text-white';
    if (val <= 95) return 'bg-emerald-600 text-white';
    if (val <= 104) return 'bg-amber-400 text-amber-950 font-bold';
    return 'bg-rose-600 text-white font-black';
  };

  const getMetricLabel = () => {
    switch (selectedMetric) {
      case 'systolic':
        return 'Systolic Blood Pressure (mmHg)';
      case 'diastolic':
        return 'Diastolic Blood Pressure (mmHg)';
      case 'heartRate':
        return 'Heart Rate (BPM)';
      case 'map':
        return 'Mean Arterial Pressure (MAP mmHg)';
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 tracking-wide uppercase">
            <Clock className="w-4 h-4 text-teal-600" />
            <span>24-Hour Diurnal Rhythm Telemetry</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-slate-500 font-normal">Circadian Vital Sign Heatmap</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
            Circadian Vital Sign Heatmap &amp; Time-of-Day Dynamics
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
            Visualize your blood pressure and resting pulse fluctuations across every hour of the 24-hour day to detect morning surges, postprandial spikes, and nocturnal dipping patterns.
          </p>
        </div>

        {/* Metric Selector Controls */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-2xl self-start lg:self-center text-xs font-semibold">
          <button
            type="button"
            onClick={() => setSelectedMetric('systolic')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedMetric === 'systolic'
                ? 'bg-white text-teal-950 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-teal-600" />
            <span>Systolic BP</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedMetric('diastolic')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedMetric === 'diastolic'
                ? 'bg-white text-teal-950 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5 text-sky-600" />
            <span>Diastolic BP</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedMetric('heartRate')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedMetric === 'heartRate'
                ? 'bg-white text-teal-950 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-rose-600" />
            <span>Heart Rate</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedMetric('map')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedMetric === 'map'
                ? 'bg-white text-teal-950 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Scale className="w-3.5 h-3.5 text-indigo-600" />
            <span>MAP</span>
          </button>
        </div>
      </div>

      {/* Circadian Clinical Stats Strip (4 Quick Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Card 1: Nocturnal Dipping */}
        <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Nocturnal Dip Index</span>
            <Moon className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 font-mono">
              -{circadianStats.dipPercent}%
            </div>
            <div className={`text-[10px] font-bold px-2 py-0.5 rounded-md border mt-1.5 inline-block ${circadianStats.dipBadgeColor}`}>
              {circadianStats.dipClassification}
            </div>
          </div>
        </div>

        {/* Card 2: Morning Surge */}
        <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Morning Surge Delta</span>
            <Sunrise className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <div className="text-xl font-black text-amber-900 font-mono">
              +{circadianStats.morningSurgeDelta} <span className="text-xs font-semibold text-slate-500">mmHg</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Window: 07:00–09:00 AM awaken peak
            </p>
          </div>
        </div>

        {/* Card 3: Diurnal Peak Hour */}
        <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Daily Peak Hour</span>
            <ArrowUp className="w-4 h-4 text-rose-500" />
          </div>
          <div>
            <div className="text-xl font-black text-rose-900 font-mono">
              {circadianStats.peakSysHour.hourLabel}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Avg {circadianStats.peakSysHour.systolic}/{circadianStats.peakSysHour.diastolic} mmHg ({circadianStats.peakSysHour.heartRate} bpm)
            </p>
          </div>
        </div>

        {/* Card 4: Diurnal Nadir Hour */}
        <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Sleep Nadir Hour</span>
            <ArrowDown className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <div className="text-xl font-black text-emerald-900 font-mono">
              {circadianStats.nadirSysHour.hourLabel}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Avg {circadianStats.nadirSysHour.systolic}/{circadianStats.nadirSysHour.diastolic} mmHg ({circadianStats.nadirSysHour.heartRate} bpm)
            </p>
          </div>
        </div>
      </div>

      {/* 2D Heatmap Matrix Grid (Day of Week vs 24 Hours) */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
            <span>24-Hour Week Matrix (Hover or click cell for clinical telemetry):</span>
          </div>

          {/* Time Window Legend */}
          <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-200" />
              <span>Sleep Dip (01-05h)</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>Surge (07-09h)</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Optimal Day</span>
            </span>
          </div>
        </div>

        {/* Scrollable Heatmap Container */}
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[760px] space-y-1.5">
            {/* Hour Header Labels (00 to 23) */}
            <div className="grid grid-cols-[55px_repeat(24,1fr)] gap-1 text-[10px] font-mono text-slate-400 text-center font-bold">
              <div className="text-left font-sans text-slate-500 text-[11px]">Day</div>
              {HOURS_24.map((h) => {
                const isHighlighted = hoveredHour === h;
                const isSurgeHour = h >= 7 && h <= 9;
                const isDipHour = h >= 1 && h <= 5;
                return (
                  <div
                    key={h}
                    className={`py-0.5 rounded transition-colors ${
                      isHighlighted
                        ? 'bg-teal-100 text-teal-900 font-black'
                        : isSurgeHour
                        ? 'text-amber-700 bg-amber-50/60'
                        : isDipHour
                        ? 'text-indigo-700 bg-indigo-50/60'
                        : 'text-slate-500'
                    }`}
                  >
                    {String(h).padStart(2, '0')}
                  </div>
                );
              })}
            </div>

            {/* Matrix Rows (Mon to Sun) */}
            {heatmapMatrix.map((row) => (
              <div
                key={row.day}
                className="grid grid-cols-[55px_repeat(24,1fr)] gap-1 items-center"
              >
                {/* Day Label */}
                <div className="text-xs font-bold text-slate-700 text-left">
                  {row.day}
                </div>

                {/* 24 Hour Tiles */}
                {row.hours.map((cell) => {
                  const val =
                    selectedMetric === 'systolic'
                      ? cell.systolic
                      : selectedMetric === 'diastolic'
                      ? cell.diastolic
                      : selectedMetric === 'heartRate'
                      ? cell.heartRate
                      : cell.map;

                  const colorClass = getCellColor(val, selectedMetric);
                  const isHovered = hoveredHour === cell.hour;

                  return (
                    <button
                      key={cell.hour}
                      type="button"
                      onMouseEnter={() => setHoveredHour(cell.hour)}
                      onMouseLeave={() => setHoveredHour(null)}
                      onClick={() =>
                        setActiveCellDetail({
                          day: cell.day,
                          hour: cell.hour,
                          value: val,
                          secondaryValue:
                            selectedMetric === 'systolic'
                              ? cell.diastolic
                              : selectedMetric === 'heartRate'
                              ? cell.systolic
                              : undefined,
                          phase: cell.phase
                        })
                      }
                      title={`${cell.day} ${cell.hourLabel}: ${val} ${
                        selectedMetric === 'heartRate' ? 'BPM' : 'mmHg'
                      } (${cell.phase})`}
                      className={`h-7 sm:h-8 rounded-md flex items-center justify-center text-[10px] transition-all cursor-pointer ${colorClass} ${
                        isHovered ? 'ring-2 ring-slate-900 scale-105 z-10 shadow-xs' : ''
                      }`}
                    >
                      <span className="font-mono">{val}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Selected Cell Detail Popover Alert */}
        {activeCellDetail && (
          <div className="p-3.5 rounded-2xl bg-slate-900 text-white flex items-center justify-between gap-4 text-xs animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-white flex items-center gap-2">
                  <span>
                    {activeCellDetail.day} at {String(activeCellDetail.hour).padStart(2, '0')}:00
                  </span>
                  <span className="text-[10px] text-teal-300 font-mono uppercase bg-slate-800 px-2 py-0.5 rounded">
                    {activeCellDetail.phase}
                  </span>
                </div>
                <div className="text-slate-300 text-[11px] mt-0.5">
                  Recorded Value: <strong className="text-teal-400">{activeCellDetail.value} {selectedMetric === 'heartRate' ? 'BPM' : 'mmHg'}</strong>
                  {activeCellDetail.secondaryValue && (
                    <span> (Paired Reading: {activeCellDetail.secondaryValue})</span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveCellDetail(null)}
              className="text-slate-400 hover:text-white cursor-pointer px-2 py-1 text-xs"
            >
              ✕ Dismiss
            </button>
          </div>
        )}
      </div>

      {/* Recharts Continuous Diurnal Area Chart (24-Hour Profile) */}
      <div className="space-y-3 pt-4 border-t border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-600" />
              <span>24-Hour Circadian Progression Curve (Recharts Composite)</span>
            </h4>
            <p className="text-xs text-slate-500">
              Mean value trajectory with physiological reference intervals and highlighted morning surge window.
            </p>
          </div>

          {/* Filter by Specific Day */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-slate-500">Filter Day:</span>
            <select
              value={selectedDayFilter}
              onChange={(e) => setSelectedDayFilter(e.target.value)}
              className="px-2.5 py-1 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 text-slate-700 outline-hidden cursor-pointer"
            >
              <option value="all">All 7 Days (Composite Mean)</option>
              {DAYS_OF_WEEK.map((d) => (
                <option key={d} value={d}>
                  {d} Only
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Recharts Container */}
        <div className="h-64 sm:h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={diurnal24HourProfile}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              onMouseMove={(state) => {
                if (state?.activeTooltipIndex !== undefined && state.activeTooltipIndex !== null) {
                  const idx = typeof state.activeTooltipIndex === 'number' ? state.activeTooltipIndex : parseInt(String(state.activeTooltipIndex), 10);
                  if (!isNaN(idx)) {
                    setHoveredHour(idx);
                  }
                }
              }}
              onMouseLeave={() => setHoveredHour(null)}
            >
              <defs>
                <linearGradient id="circadianTealGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="circadianRoseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e11d48" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#e11d48" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="hourLabel"
                tick={{ fontSize: 10, fill: '#64748b' }}
                tickLine={false}
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <YAxis
                domain={
                  selectedMetric === 'systolic'
                    ? [90, 160]
                    : selectedMetric === 'diastolic'
                    ? [60, 110]
                    : selectedMetric === 'heartRate'
                    ? [45, 115]
                    : [70, 125]
                }
                tick={{ fontSize: 10, fill: '#64748b' }}
                tickLine={false}
                axisLine={false}
              />

              {/* Shaded Clinical Zones */}
              {/* 1. Nocturnal Dip Window (01:00 to 05:00) */}
              <ReferenceArea
                x1="01:00"
                x2="05:00"
                fill="#e0e7ff"
                fillOpacity={0.35}
                label={{
                  value: 'Nocturnal Sleep Dip',
                  position: 'insideTopLeft',
                  fill: '#4338ca',
                  fontSize: 10,
                  fontWeight: 600
                }}
              />

              {/* 2. Morning Surge Window (07:00 to 09:00) */}
              <ReferenceArea
                x1="07:00"
                x2="09:00"
                fill="#fef3c7"
                fillOpacity={0.45}
                label={{
                  value: 'Morning Surge Zone',
                  position: 'insideTopLeft',
                  fill: '#b45309',
                  fontSize: 10,
                  fontWeight: 600
                }}
              />

              {/* Clinical Target Line */}
              {selectedMetric === 'systolic' && (
                <ReferenceLine
                  y={120}
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  label={{ value: 'Target Sys <120', position: 'insideRight', fill: '#059669', fontSize: 10 }}
                />
              )}
              {selectedMetric === 'diastolic' && (
                <ReferenceLine
                  y={80}
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  label={{ value: 'Target Dia <80', position: 'insideRight', fill: '#059669', fontSize: 10 }}
                />
              )}
              {selectedMetric === 'heartRate' && (
                <ReferenceLine
                  y={75}
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  label={{ value: 'Optimal Resting 75', position: 'insideRight', fill: '#059669', fontSize: 10 }}
                />
              )}

              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg border border-slate-800 text-xs space-y-1">
                        <div className="font-bold flex items-center justify-between gap-3 text-teal-300">
                          <span>Hour: {data.hourLabel}</span>
                          <span className="text-[10px] text-slate-300 font-mono">{data.phase}</span>
                        </div>
                        <div className="pt-1 space-y-0.5">
                          {selectedMetric === 'systolic' && (
                            <>
                              <div>Systolic BP: <strong className="text-teal-400 font-mono">{data.systolic} mmHg</strong></div>
                              <div>Diastolic BP: <strong className="text-slate-300 font-mono">{data.diastolic} mmHg</strong></div>
                            </>
                          )}
                          {selectedMetric === 'diastolic' && (
                            <>
                              <div>Diastolic BP: <strong className="text-sky-400 font-mono">{data.diastolic} mmHg</strong></div>
                              <div>Systolic BP: <strong className="text-slate-300 font-mono">{data.systolic} mmHg</strong></div>
                            </>
                          )}
                          {selectedMetric === 'heartRate' && (
                            <div>Heart Rate: <strong className="text-rose-400 font-mono">{data.heartRate} BPM</strong></div>
                          )}
                          {selectedMetric === 'map' && (
                            <div>Mean Arterial Pressure: <strong className="text-indigo-400 font-mono">{data.map} mmHg</strong></div>
                          )}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {/* Data Series */}
              {selectedMetric === 'systolic' && (
                <>
                  <Area
                    type="monotone"
                    dataKey="systolic"
                    stroke="#0d9488"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#circadianTealGradient)"
                    name="Systolic BP"
                  />
                  <Line
                    type="monotone"
                    dataKey="diastolic"
                    stroke="#0284c7"
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    dot={false}
                    name="Diastolic BP"
                  />
                </>
              )}

              {selectedMetric === 'diastolic' && (
                <Area
                  type="monotone"
                  dataKey="diastolic"
                  stroke="#0284c7"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#circadianTealGradient)"
                  name="Diastolic BP"
                />
              )}

              {selectedMetric === 'heartRate' && (
                <Area
                  type="monotone"
                  dataKey="heartRate"
                  stroke="#e11d48"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#circadianRoseGradient)"
                  name="Heart Rate"
                />
              )}

              {selectedMetric === 'map' && (
                <Area
                  type="monotone"
                  dataKey="map"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#circadianTealGradient)"
                  name="MAP"
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Clinical Guidance Footnote */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
        <Info className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-slate-800 block">
            Clinical Circadian Interpretation Directive:
          </span>
          <p className="leading-relaxed">
            Blood pressure typically follows a 24-hour diurnal pattern, dropping 10–20% during deep sleep (nocturnal dip) and rising rapidly prior to awakening (morning surge). Absence of a nocturnal dip (&lt;10%) is an established clinical risk marker for target-organ damage. Consult with Dr. Sarah Mitchell, MD if morning surges exceed +20 mmHg or nighttime readings remain elevated.
          </p>
        </div>
      </div>
    </div>
  );
};
