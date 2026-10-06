import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  Line,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell
} from 'recharts';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Calendar,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Download,
  Filter,
  Flame,
  Info,
  Maximize2,
  Minimize2,
  Pill,
  Sparkles,
  TrendingUp,
  X,
  Zap
} from 'lucide-react';
import { DoseLog, MedicationScheduleItem, UserRecord } from '../../types';
import { notificationService } from '../../services/notificationService';

export type ComplianceTimeRange = 'rolling7' | 'currentWeek' | 'lastWeek' | 'past14';
export type ComplianceChartMode = 'composed' | 'timeSlots' | 'cumulative';

interface WeeklyMedicationComplianceChartProps {
  schedule: MedicationScheduleItem[];
  doseLogs: DoseLog[];
  onLogDose?: (scheduleId: string, medicineName: string, scheduledTime: string, date: string) => void;
  onNavigateToSchedule?: () => void;
  currentUser?: UserRecord;
}

interface DailyCompliancePoint {
  dateStr: string;
  dayLabel: string;
  dayName: string;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
  taken: number;
  missed: number;
  upcoming: number;
  totalScheduled: number;
  complianceRate: number; // 0 to 100
  takenMeds: Array<{ name: string; time: string }>;
  missedMeds: Array<{ name: string; time: string }>;
}

interface SlotComplianceData {
  slotKey: string;
  slotName: string;
  timeRange: string;
  taken: number;
  missed: number;
  total: number;
  complianceRate: number;
}

export const WeeklyMedicationComplianceChart: React.FC<WeeklyMedicationComplianceChartProps> = ({
  schedule,
  doseLogs,
  onLogDose,
  onNavigateToSchedule,
  currentUser
}) => {
  const [timeRange, setTimeRange] = useState<ComplianceTimeRange>('rolling7');
  const [chartMode, setChartMode] = useState<ComplianceChartMode>('composed');
  const [selectedMedFilter, setSelectedMedFilter] = useState<string>('all');
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [selectedDayInfo, setSelectedDayInfo] = useState<DailyCompliancePoint | null>(null);

  const todayObj = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => {
    const y = todayObj.getFullYear();
    const m = String(todayObj.getMonth() + 1).padStart(2, '0');
    const d = String(todayObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [todayObj]);

  const activeSchedule = useMemo(() => {
    return schedule.filter(s => s.active);
  }, [schedule]);

  const filteredSchedule = useMemo(() => {
    if (selectedMedFilter === 'all') return activeSchedule;
    return activeSchedule.filter(s => s.id === selectedMedFilter);
  }, [activeSchedule, selectedMedFilter]);

  // Lookup map for fast adherence checks: `key = "${scheduleId}_${scheduledTime}_${date}"`
  const logsLookup = useMemo(() => {
    const map = new Map<string, DoseLog>();
    doseLogs.forEach(log => {
      if (log.status === 'taken') {
        map.set(`${log.scheduleId}_${log.scheduledTime}_${log.date}`, log);
      }
    });
    return map;
  }, [doseLogs]);

  // Calculate dates in selected range
  const rangeDates = useMemo<string[]>(() => {
    const dates: string[] = [];
    const now = new Date(todayObj);

    if (timeRange === 'rolling7') {
      // Last 7 days: today - 6 days through today
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        dates.push(`${y}-${m}-${day}`);
      }
    } else if (timeRange === 'currentWeek') {
      // Monday through Sunday of current calendar week
      const currentDayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday
      const distanceToMonday = (currentDayOfWeek + 6) % 7;
      const monday = new Date(now);
      monday.setDate(now.getDate() - distanceToMonday);

      for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        dates.push(`${y}-${m}-${day}`);
      }
    } else if (timeRange === 'lastWeek') {
      // Monday through Sunday of previous week
      const currentDayOfWeek = now.getDay();
      const distanceToMonday = (currentDayOfWeek + 6) % 7;
      const prevMonday = new Date(now);
      prevMonday.setDate(now.getDate() - distanceToMonday - 7);

      for (let i = 0; i < 7; i++) {
        const d = new Date(prevMonday);
        d.setDate(prevMonday.getDate() + i);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        dates.push(`${y}-${m}-${day}`);
      }
    } else {
      // Past 14 days
      for (let i = 13; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        dates.push(`${y}-${m}-${day}`);
      }
    }

    return dates;
  }, [timeRange, todayObj]);

  // Compute daily adherence data for the chart
  const dailyData = useMemo<DailyCompliancePoint[]>(() => {
    const currentHour = todayObj.getHours();
    const currentMinute = todayObj.getMinutes();
    const currentTimeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;

    return rangeDates.map(dateStr => {
      const parts = dateStr.split('-');
      const dObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      const dayName = dObj.toLocaleDateString('default', { weekday: 'short' });
      const dayNum = dObj.getDate();
      const dayLabel = `${dayName} ${dayNum}`;

      const isToday = dateStr === todayStr;
      const isPast = dateStr < todayStr;
      const isFuture = dateStr > todayStr;

      let taken = 0;
      let missed = 0;
      let upcoming = 0;
      const takenMeds: Array<{ name: string; time: string }> = [];
      const missedMeds: Array<{ name: string; time: string }> = [];

      filteredSchedule.forEach(item => {
        item.times.forEach(t => {
          const logKey = `${item.id}_${t}_${dateStr}`;
          const isTaken = logsLookup.has(logKey);

          if (isTaken) {
            taken++;
            takenMeds.push({ name: item.medicineName, time: t });
          } else if (isPast) {
            missed++;
            missedMeds.push({ name: item.medicineName, time: t });
          } else if (isToday) {
            // If scheduled time has already passed today, it's missed/overdue; if still to come, it's upcoming
            if (t <= currentTimeStr) {
              missed++;
              missedMeds.push({ name: item.medicineName, time: t });
            } else {
              upcoming++;
            }
          } else {
            // Future day
            upcoming++;
          }
        });
      });

      const totalScheduled = taken + missed + upcoming;
      const totalDueSoFar = taken + missed;
      const complianceRate = totalDueSoFar > 0 ? Math.round((taken / totalDueSoFar) * 100) : isFuture ? 100 : 100;

      return {
        dateStr,
        dayLabel,
        dayName,
        isToday,
        isPast,
        isFuture,
        taken,
        missed,
        upcoming,
        totalScheduled,
        complianceRate,
        takenMeds,
        missedMeds
      };
    });
  }, [rangeDates, filteredSchedule, logsLookup, todayObj, todayStr]);

  // Cumulative trend data for Area Chart
  const cumulativeData = useMemo(() => {
    let cumTaken = 0;
    let cumScheduled = 0;

    return dailyData.map(d => {
      cumTaken += d.taken;
      cumScheduled += (d.taken + d.missed);
      const cumRate = cumScheduled > 0 ? Math.round((cumTaken / cumScheduled) * 100) : 100;

      return {
        ...d,
        cumTaken,
        cumScheduled,
        cumRate
      };
    });
  }, [dailyData]);

  // Compute time-slot breakdown (Morning, Afternoon, Evening, Night)
  const slotData = useMemo<SlotComplianceData[]>(() => {
    const slots = [
      { key: 'morning', name: 'Morning', timeRange: '06:00 - 11:59', minH: 6, maxH: 11, taken: 0, missed: 0 },
      { key: 'afternoon', name: 'Afternoon', timeRange: '12:00 - 16:59', minH: 12, maxH: 16, taken: 0, missed: 0 },
      { key: 'evening', name: 'Evening', timeRange: '17:00 - 20:59', minH: 17, maxH: 20, taken: 0, missed: 0 },
      { key: 'night', name: 'Night / Bedtime', timeRange: '21:00 - 05:59', minH: 21, maxH: 24, taken: 0, missed: 0 }
    ];

    dailyData.forEach(day => {
      if (day.isFuture) return;

      day.takenMeds.forEach(m => {
        const hour = parseInt(m.time.split(':')[0], 10);
        const slot = slots.find(s => {
          if (s.key === 'night') return hour >= 21 || hour < 6;
          return hour >= s.minH && hour <= s.maxH;
        });
        if (slot) slot.taken++;
      });

      day.missedMeds.forEach(m => {
        const hour = parseInt(m.time.split(':')[0], 10);
        const slot = slots.find(s => {
          if (s.key === 'night') return hour >= 21 || hour < 6;
          return hour >= s.minH && hour <= s.maxH;
        });
        if (slot) slot.missed++;
      });
    });

    return slots.map(s => {
      const total = s.taken + s.missed;
      const rate = total > 0 ? Math.round((s.taken / total) * 100) : 100;
      return {
        slotKey: s.key,
        slotName: s.name,
        timeRange: s.timeRange,
        taken: s.taken,
        missed: s.missed,
        total,
        complianceRate: rate
      };
    });
  }, [dailyData]);

  // Overall Weekly KPIs
  const weeklyKpis = useMemo(() => {
    let totalTaken = 0;
    let totalMissed = 0;
    let totalUpcoming = 0;

    dailyData.forEach(d => {
      totalTaken += d.taken;
      totalMissed += d.missed;
      totalUpcoming += d.upcoming;
    });

    const totalDue = totalTaken + totalMissed;
    const rate = totalDue > 0 ? Math.round((totalTaken / totalDue) * 100) : 100;

    // Calculate current streak
    let streak = 0;
    const sortedDaysDesc = [...dailyData].filter(d => !d.isFuture).reverse();
    for (const d of sortedDaysDesc) {
      if (d.missed === 0 && d.taken > 0) {
        streak++;
      } else if (d.isToday && d.missed === 0) {
        // Today still in progress with no misses
        streak++;
      } else {
        break;
      }
    }

    // Determine status badge
    let statusText = 'Optimal Adherence';
    let statusColor = 'emerald';
    if (rate >= 90) {
      statusText = 'Optimal Adherence (Therapeutic Benchmark Met)';
      statusColor = 'emerald';
    } else if (rate >= 80) {
      statusText = 'Target Compliance (Good Adherence)';
      statusColor = 'teal';
    } else if (rate >= 70) {
      statusText = 'Suboptimal Adherence (Clinical Review Advised)';
      statusColor = 'amber';
    } else {
      statusText = 'High Non-Adherence Risk (<70% Compliance)';
      statusColor = 'rose';
    }

    // Best and lowest day
    const pastDays = dailyData.filter(d => !d.isFuture && (d.taken + d.missed) > 0);
    let bestDay = 'None';
    let lowestDay = 'None';

    if (pastDays.length > 0) {
      const sortedByRate = [...pastDays].sort((a, b) => b.complianceRate - a.complianceRate);
      bestDay = `${sortedByRate[0].dayName} (${sortedByRate[0].complianceRate}%)`;
      lowestDay = `${sortedByRate[sortedByRate.length - 1].dayName} (${sortedByRate[sortedByRate.length - 1].complianceRate}%)`;
    }

    return {
      totalTaken,
      totalMissed,
      totalUpcoming,
      totalDue,
      rate,
      streak,
      statusText,
      statusColor,
      bestDay,
      lowestDay
    };
  }, [dailyData]);

  // Clinical Summary Copy Handler for Doctor Visits
  const handleCopyDoctorSummary = () => {
    const medNames = filteredSchedule.map(s => s.medicineName).join(', ');
    const summary = `PATIENT MEDICATION COMPLIANCE REPORT:
Patient: ${currentUser?.name || 'Alex Johnson'}
Period: ${rangeDates[0]} to ${rangeDates[rangeDates.length - 1]} (${timeRange})
Regimen: ${medNames || 'Standard Regimen'}
Compliance Score: ${weeklyKpis.rate}% (${weeklyKpis.totalTaken}/${weeklyKpis.totalDue} doses taken)
Doses Missed: ${weeklyKpis.totalMissed}
Current Streak: ${weeklyKpis.streak} days
Time-Slot Breakdown:
- Morning: ${slotData.find(s => s.slotKey === 'morning')?.complianceRate}%
- Afternoon: ${slotData.find(s => s.slotKey === 'afternoon')?.complianceRate}%
- Evening: ${slotData.find(s => s.slotKey === 'evening')?.complianceRate}%
- Night: ${slotData.find(s => s.slotKey === 'night')?.complianceRate}%
Clinical Note: ${weeklyKpis.statusText}`;

    navigator.clipboard.writeText(summary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 3000);
  };

  // Quick log dose action for today
  const handleQuickLogToday = (item: MedicationScheduleItem, time: string) => {
    if (onLogDose) {
      onLogDose(item.id, item.medicineName, time, todayStr);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-all space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 text-teal-700 font-bold text-xs uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4 text-teal-600" />
            <span>Pharmacotherapy Adherence Analytics</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Weekly Medication Compliance Chart</span>
            <span
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                weeklyKpis.rate >= 90
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : weeklyKpis.rate >= 80
                  ? 'bg-teal-50 text-teal-800 border-teal-300'
                  : weeklyKpis.rate >= 70
                  ? 'bg-amber-50 text-amber-900 border-amber-300'
                  : 'bg-rose-50 text-rose-900 border-rose-300'
              }`}
            >
              {weeklyKpis.rate}% Score
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Adherence to scheduled medication times tracked across rolling days and clinical daily time-slots
          </p>
        </div>

        {/* Action Controls & Filters */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
          {/* Timeframe Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setTimeRange('rolling7')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                timeRange === 'rolling7' ? 'bg-white text-teal-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Last 7 Days
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('currentWeek')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                timeRange === 'currentWeek' ? 'bg-white text-teal-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              This Week
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('lastWeek')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                timeRange === 'lastWeek' ? 'bg-white text-teal-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Last Week
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('past14')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                timeRange === 'past14' ? 'bg-white text-teal-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              14 Days
            </button>
          </div>

          {/* Copy Summary for Doctor Button */}
          <button
            type="button"
            onClick={handleCopyDoctorSummary}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Copy formatted adherence summary for doctor or telemedicine visit"
          >
            {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSummary ? 'Copied Summary!' : 'Share with Doctor'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Compliance Rate</span>
            <TrendingUp className="w-3.5 h-3.5 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {weeklyKpis.rate}%
          </div>
          <div className="text-[11px] font-medium text-slate-500 truncate mt-0.5">
            Target benchmark: &gt;85%
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Doses Taken</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {weeklyKpis.totalTaken}{' '}
            <span className="text-xs font-normal text-slate-400">/ {weeklyKpis.totalDue} due</span>
          </div>
          <div className="text-[11px] font-medium text-emerald-700 truncate mt-0.5">
            {weeklyKpis.totalMissed === 0 ? 'Zero missed doses' : `${weeklyKpis.totalMissed} doses missed`}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Adherence Streak</span>
            <Flame className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {weeklyKpis.streak}{' '}
            <span className="text-xs font-normal text-slate-400">Days</span>
          </div>
          <div className="text-[11px] font-medium text-slate-500 truncate mt-0.5">
            Consecutive 100% adherence
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Daily Patterns</span>
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="text-sm font-bold text-slate-900 mt-1">
            Best: <span className="text-teal-700">{weeklyKpis.bestDay}</span>
          </div>
          <div className="text-[11px] font-medium text-slate-500 truncate mt-0.5">
            Lowest: {weeklyKpis.lowestDay}
          </div>
        </div>
      </div>

      {/* Sub-toolbar: Medication Filter & Chart Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Medication Selector Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-bold text-slate-700">Filter Medicine:</span>
          <select
            value={selectedMedFilter}
            onChange={(e) => setSelectedMedFilter(e.target.value)}
            className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 outline-hidden focus:border-teal-500 shadow-2xs cursor-pointer"
          >
            <option value="all">All Prescribed Medications ({activeSchedule.length})</option>
            {activeSchedule.map(s => (
              <option key={s.id} value={s.id}>{s.medicineName} ({s.times.length}x daily)</option>
            ))}
          </select>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setChartMode('composed')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              chartMode === 'composed' ? 'bg-white text-teal-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Daily Adherence &amp; % Trend
          </button>
          <button
            type="button"
            onClick={() => setChartMode('timeSlots')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              chartMode === 'timeSlots' ? 'bg-white text-teal-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hourly Time-Slots
          </button>
          <button
            type="button"
            onClick={() => setChartMode('cumulative')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              chartMode === 'cumulative' ? 'bg-white text-teal-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Cumulative Curve
          </button>
        </div>
      </div>

      {/* Main Recharts Visualization Canvas */}
      <div className="bg-slate-50/70 rounded-2xl border border-slate-200/90 p-4 sm:p-5">
        {filteredSchedule.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
              <Pill className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800 text-base">No Active Medications Scheduled</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Add your prescribed medications and scheduled times to begin tracking real-time compliance.
            </p>
            {onNavigateToSchedule && (
              <button
                type="button"
                onClick={onNavigateToSchedule}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                Configure Medication Schedule
              </button>
            )}
          </div>
        ) : chartMode === 'composed' ? (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
                <span className="text-xs font-bold text-slate-800">Doses Taken</span>
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ml-2"></span>
                <span className="text-xs font-bold text-slate-800">Doses Missed</span>
                <span className="w-2.5 h-0.5 bg-sky-600 ml-2"></span>
                <span className="text-xs font-bold text-slate-800">Compliance Rate (%)</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                Dashed Red Line: 85% Target Adherence
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={dailyData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  onClick={(e: any) => {
                    if (e && e.activePayload && e.activePayload[0]) {
                      setSelectedDayInfo(e.activePayload[0].payload as DailyCompliancePoint);
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="dayLabel"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  {/* Left Y Axis: Count of Doses */}
                  <YAxis
                    yAxisId="left"
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  {/* Right Y Axis: Percentage 0-100 */}
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: '#0284c7' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip content={<CustomComplianceTooltip />} />
                  <ReferenceLine
                    yAxisId="right"
                    y={85}
                    stroke="#e11d48"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{ value: 'Target 85%', fill: '#e11d48', fontSize: 10, position: 'insideTopRight' }}
                  />
                  {/* Taken Doses Bar */}
                  <Bar
                    yAxisId="left"
                    dataKey="taken"
                    name="Doses Taken"
                    fill="#0d9488"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={40}
                  />
                  {/* Missed Doses Bar */}
                  <Bar
                    yAxisId="left"
                    dataKey="missed"
                    name="Doses Missed"
                    fill="#f43f5e"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={40}
                  />
                  {/* Compliance Rate Line */}
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="complianceRate"
                    name="Adherence %"
                    stroke="#0284c7"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#0284c7', strokeWidth: 2, stroke: '#ffffff' }}
                    activeDot={{ r: 6, fill: '#0369a1', stroke: '#ffffff', strokeWidth: 2 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : chartMode === 'timeSlots' ? (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h4 className="font-bold text-sm text-slate-800">
                  Adherence Breakdown by Scheduled Time of Day
                </h4>
                <p className="text-[11px] text-slate-500">
                  Identifies which daily dose intervals have high compliance vs risk of being forgotten
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200">
                {timeRange === 'rolling7' ? 'Last 7 Days Aggregated' : 'Selected Period Aggregated'}
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={slotData}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 40, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <YAxis
                    dataKey="slotName"
                    type="category"
                    tick={{ fontSize: 11, fontWeight: 'bold', fill: '#1e293b' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <Tooltip content={<SlotTooltip />} />
                  <ReferenceLine
                    x={85}
                    stroke="#e11d48"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{ value: '85% Target', fill: '#e11d48', fontSize: 10, position: 'top' }}
                  />
                  <Bar
                    dataKey="complianceRate"
                    name="Slot Adherence Rate"
                    radius={[0, 8, 8, 0]}
                    maxBarSize={32}
                  >
                    {slotData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.complianceRate >= 90
                            ? '#0d9488'
                            : entry.complianceRate >= 80
                            ? '#0284c7'
                            : entry.complianceRate >= 70
                            ? '#f59e0b'
                            : '#f43f5e'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h4 className="font-bold text-sm text-slate-800">
                  Cumulative Dose Adherence vs Scheduled Protocol
                </h4>
                <p className="text-[11px] text-slate-500">
                  Rolling fulfillment curve showing cumulative doses taken vs target ceiling
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200">
                Cumulative Progression
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={cumulativeData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="cumTakenGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="cumSchedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#cbd5e1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#cbd5e1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="dayLabel"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomComplianceTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="cumScheduled"
                    name="Cumulative Target"
                    stroke="#94a3b8"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#cumSchedGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="cumTaken"
                    name="Cumulative Taken"
                    stroke="#0d9488"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#cumTakenGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Selected Day Drill-down Drawer / Inspection Banner */}
      {selectedDayInfo && (
        <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 text-xs space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <Calendar className="w-4 h-4 text-teal-600" />
              <span>Inspection for {selectedDayInfo.dayName}, {selectedDayInfo.dateStr}</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-teal-200/80 text-teal-900">
                {selectedDayInfo.complianceRate}% Compliance
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedDayInfo(null)}
              className="text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <span className="font-bold text-emerald-800 flex items-center gap-1 mb-1">
                <Check className="w-3.5 h-3.5" />
                <span>Doses Taken ({selectedDayInfo.takenMeds.length}):</span>
              </span>
              {selectedDayInfo.takenMeds.length === 0 ? (
                <span className="text-slate-400 italic">No doses logged on this day.</span>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {selectedDayInfo.takenMeds.map((m, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-white border border-emerald-200 text-emerald-950 font-medium">
                      {m.name} @ {m.time}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <span className="font-bold text-rose-800 flex items-center gap-1 mb-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Missed / Pending ({selectedDayInfo.missedMeds.length}):</span>
              </span>
              {selectedDayInfo.missedMeds.length === 0 ? (
                <span className="text-emerald-700 font-medium">Full adherence! All doses completed.</span>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {selectedDayInfo.missedMeds.map((m, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-white border border-rose-200 text-rose-950 font-medium">
                      {m.name} @ {m.time}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Clinical Guidance Footnote */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-teal-600 shrink-0" />
          <span>
            Clinical Pharmacotherapy Standard: Maintaining a <strong>&gt;85% adherence rate</strong> ensures steady-state therapeutic plasma concentrations.
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="font-semibold text-slate-700">{weeklyKpis.statusText}</span>
        </div>
      </div>
    </div>
  );
};

// Custom Tooltip for Daily Composed & Cumulative Charts
const CustomComplianceTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data: DailyCompliancePoint = payload[0].payload;
    return (
      <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-xl border border-slate-700 text-xs space-y-2 min-w-[200px] z-50">
        <div className="flex items-center justify-between border-b border-slate-700 pb-1.5 font-bold">
          <span>{data.dayName}, {data.dateStr}</span>
          <span className={`px-2 py-0.5 rounded text-[10px] ${
            data.complianceRate >= 90
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
              : data.complianceRate >= 80
              ? 'bg-teal-500/20 text-teal-300 border border-teal-400/40'
              : 'bg-rose-500/20 text-rose-300 border border-rose-400/40'
          }`}>
            {data.complianceRate}% Adherence
          </span>
        </div>

        <div className="space-y-1 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Doses Taken:</span>
            <span className="font-bold text-emerald-400">{data.taken}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Doses Missed:</span>
            <span className="font-bold text-rose-400">{data.missed}</span>
          </div>
          {data.upcoming > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Upcoming Today:</span>
              <span className="font-bold text-slate-300">{data.upcoming}</span>
            </div>
          )}
          <div className="flex items-center justify-between pt-1 border-t border-slate-800">
            <span className="text-slate-400">Total Scheduled:</span>
            <span className="font-bold text-white">{data.totalScheduled}</span>
          </div>
        </div>

        {data.missedMeds.length > 0 && (
          <div className="text-[10px] text-rose-300 pt-1 border-t border-slate-800">
            <strong>Missed: </strong>
            {data.missedMeds.map(m => `${m.name} (${m.time})`).join(', ')}
          </div>
        )}
      </div>
    );
  }
  return null;
};

// Custom Tooltip for Time Slots Chart
const SlotTooltip: React.FC<any> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data: SlotComplianceData = payload[0].payload;
    return (
      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1.5 min-w-[180px] z-50">
        <div className="font-bold text-teal-300 flex items-center justify-between border-b border-slate-700 pb-1">
          <span>{data.slotName}</span>
          <span className="text-[10px] text-slate-400 font-mono">{data.timeRange}</span>
        </div>
        <div className="text-[11px] space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Slot Adherence:</span>
            <span className="font-bold text-white">{data.complianceRate}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Doses Taken:</span>
            <span className="font-bold text-emerald-400">{data.taken}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Doses Missed:</span>
            <span className="font-bold text-rose-400">{data.missed}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};
