import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Check,
  CheckCircle2,
  Clock,
  Filter,
  Flame,
  Info,
  Pill,
  RotateCcw,
  Sparkles,
  TrendingUp,
  X
} from 'lucide-react';
import { DoseLog, MedicationScheduleItem } from '../../types';
import { storageService } from '../../services/storageService';
import { notificationService } from '../../services/notificationService';

interface MedicationCalendarProps {
  schedule: MedicationScheduleItem[];
  doseLogs: DoseLog[];
  onToggleDose?: (scheduleId: string, medicineName: string, scheduledTime: string, date: string) => void;
  soundEnabled?: boolean;
}

export const MedicationCalendar: React.FC<MedicationCalendarProps> = ({
  schedule,
  doseLogs,
  onToggleDose,
  soundEnabled = true
}) => {
  const todayObj = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => {
    const y = todayObj.getFullYear();
    const m = String(todayObj.getMonth() + 1).padStart(2, '0');
    const d = String(todayObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [todayObj]);

  // Current view month & year state
  const [currentDate, setCurrentDate] = useState<Date>(new Date(todayObj.getFullYear(), todayObj.getMonth(), 1));
  const [selectedFilterMed, setSelectedFilterMed] = useState<string>('all');
  const [selectedDayDetail, setSelectedDayDetail] = useState<string | null>(todayStr);

  const activeSchedule = useMemo(() => {
    return schedule.filter(s => s.active);
  }, [schedule]);

  const filteredSchedule = useMemo(() => {
    if (selectedFilterMed === 'all') return activeSchedule;
    return activeSchedule.filter(s => s.id === selectedFilterMed);
  }, [activeSchedule, selectedFilterMed]);

  // Month navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleJumpToToday = () => {
    const target = new Date(todayObj.getFullYear(), todayObj.getMonth(), 1);
    setCurrentDate(target);
    setSelectedDayDetail(todayStr);
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  // Generate calendar days grid (including padding days from previous and next month)
  const calendarGrid = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    interface CalendarDayCell {
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isPast: boolean;
      isFuture: boolean;
    }

    const cells: CalendarDayCell[] = [];

    // 1. Previous month padding days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevDate = new Date(year, month - 1, d);
      const py = prevDate.getFullYear();
      const pm = String(prevDate.getMonth() + 1).padStart(2, '0');
      const pd = String(d).padStart(2, '0');
      const dateStr = `${py}-${pm}-${pd}`;
      cells.push({
        dateStr,
        dayNumber: d,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isPast: dateStr < todayStr,
        isFuture: dateStr > todayStr
      });
    }

    // 2. Current month days
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const mStr = String(month + 1).padStart(2, '0');
      const dStr = String(d).padStart(2, '0');
      const dateStr = `${year}-${mStr}-${dStr}`;
      cells.push({
        dateStr,
        dayNumber: d,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        isPast: dateStr < todayStr,
        isFuture: dateStr > todayStr
      });
    }

    // 3. Next month padding days to complete full grid (multiple of 7)
    const totalRemaining = 7 - (cells.length % 7);
    if (totalRemaining < 7) {
      for (let d = 1; d <= totalRemaining; d++) {
        const nextDate = new Date(year, month + 1, d);
        const ny = nextDate.getFullYear();
        const nm = String(nextDate.getMonth() + 1).padStart(2, '0');
        const nd = String(d).padStart(2, '0');
        const dateStr = `${ny}-${nm}-${nd}`;
        cells.push({
          dateStr,
          dayNumber: d,
          isCurrentMonth: false,
          isToday: dateStr === todayStr,
          isPast: dateStr < todayStr,
          isFuture: dateStr > todayStr
        });
      }
    }

    return cells;
  }, [year, month, todayStr]);

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

  // Calculate monthly stats
  const monthlyStats = useMemo(() => {
    let totalScheduledPastAndToday = 0;
    let totalTakenPastAndToday = 0;
    let perfectDays = 0;
    let daysWithDoses = 0;

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let d = 1; d <= daysInMonth; d++) {
      const mStr = String(month + 1).padStart(2, '0');
      const dStr = String(d).padStart(2, '0');
      const dateStr = `${year}-${mStr}-${dStr}`;

      if (dateStr <= todayStr) {
        let dayScheduled = 0;
        let dayTaken = 0;

        filteredSchedule.forEach(item => {
          item.times.forEach(t => {
            dayScheduled++;
            if (logsLookup.has(`${item.id}_${t}_${dateStr}`)) {
              dayTaken++;
            }
          });
        });

        if (dayScheduled > 0) {
          daysWithDoses++;
          totalScheduledPastAndToday += dayScheduled;
          totalTakenPastAndToday += dayTaken;
          if (dayTaken === dayScheduled) {
            perfectDays++;
          }
        }
      }
    }

    const rate = totalScheduledPastAndToday > 0
      ? Math.round((totalTakenPastAndToday / totalScheduledPastAndToday) * 100)
      : 100;

    // Calculate current streak
    let streak = 0;
    const checkDate = new Date(todayObj);
    while (true) {
      const cy = checkDate.getFullYear();
      const cm = String(checkDate.getMonth() + 1).padStart(2, '0');
      const cd = String(checkDate.getDate()).padStart(2, '0');
      const cStr = `${cy}-${cm}-${cd}`;

      let dayScheduled = 0;
      let dayTaken = 0;
      activeSchedule.forEach(item => {
        item.times.forEach(t => {
          dayScheduled++;
          if (logsLookup.has(`${item.id}_${t}_${cStr}`)) {
            dayTaken++;
          }
        });
      });

      if (dayScheduled > 0 && dayTaken === dayScheduled) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        // If today is not yet complete, check if yesterday had a streak
        if (cStr === todayStr && dayTaken < dayScheduled) {
          checkDate.setDate(checkDate.getDate() - 1);
          continue;
        }
        break;
      }
    }

    return {
      rate,
      totalScheduled: totalScheduledPastAndToday,
      totalTaken: totalTakenPastAndToday,
      missed: Math.max(0, totalScheduledPastAndToday - totalTakenPastAndToday),
      perfectDays,
      daysWithDoses,
      streak
    };
  }, [year, month, todayStr, filteredSchedule, activeSchedule, logsLookup, todayObj]);

  // Handle toggling adherence checkbox for a specific dose slot
  const handleToggleSlot = (
    e: React.MouseEvent | React.ChangeEvent,
    scheduleId: string,
    medicineName: string,
    scheduledTime: string,
    date: string
  ) => {
    e.stopPropagation();

    // Call storage toggle
    const result = storageService.toggleDose(scheduleId, medicineName, scheduledTime, date);

    if (result.taken && soundEnabled) {
      notificationService.playSuccessChime();
    }

    // If dose was for today and taken, clear alert slot
    if (date === todayStr && result.taken) {
      notificationService.clearAlertSlot(scheduleId, scheduledTime);
    }

    if (onToggleDose) {
      onToggleDose(scheduleId, medicineName, scheduledTime, date);
    }
  };

  // Quick mark all doses for selected day as taken
  const handleMarkAllForDay = (dateStr: string) => {
    let anyToggled = false;
    filteredSchedule.forEach(item => {
      item.times.forEach(time => {
        const isTaken = logsLookup.has(`${item.id}_${time}_${dateStr}`);
        if (!isTaken) {
          storageService.logDoseTaken(item.id, item.medicineName, time, dateStr);
          anyToggled = true;
        }
      });
    });

    if (anyToggled && soundEnabled) {
      notificationService.playSuccessChime();
    }

    if (dateStr === todayStr) {
      filteredSchedule.forEach(item => {
        item.times.forEach(time => {
          notificationService.clearAlertSlot(item.id, time);
        });
      });
    }
  };

  // Format date readable
  const formatDayHeading = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('default', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* 1. Header Toolbar */}
      <div className="p-5 sm:p-6 border-b border-slate-100 bg-linear-to-b from-slate-50/60 to-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-600/10 text-teal-700 flex items-center justify-center">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Medication Adherence Calendar
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Monthly schedule overview · Toggle checkboxes to log taken doses or adjust historical compliance
          </p>
        </div>

        {/* Filter by Medicine & Navigation Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Medicine Filter Dropdown */}
          <div className="relative">
            <select
              aria-label="Filter calendar by medication"
              value={selectedFilterMed}
              onChange={e => setSelectedFilterMed(e.target.value)}
              className="pl-8 pr-7 py-1.5 text-xs font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 transition-colors cursor-pointer appearance-none"
            >
              <option value="all">All Medications ({activeSchedule.length})</option>
              {activeSchedule.map(s => (
                <option key={s.id} value={s.id}>
                  {s.medicineName} ({s.dosage})
                </option>
              ))}
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Jump to Today Button */}
          <button
            type="button"
            onClick={handleJumpToToday}
            className="px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100/80 border border-teal-200/80 rounded-lg transition-colors cursor-pointer"
          >
            Today
          </button>

          {/* Month Pagination */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5">
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label="Previous month"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-md transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold text-slate-800 min-w-32 text-center select-none">
              {monthName} {year}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="Next month"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-md transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Monthly Adherence Analytics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-slate-100 bg-slate-50/50 divide-x divide-y sm:divide-y-0 divide-slate-100">
        <div className="p-4 sm:px-6">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-teal-600" />
            <span>Monthly Adherence</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {monthlyStats.rate}%
            </span>
            <span className="text-[11px] text-slate-500">
              {monthlyStats.perfectDays} perfect days
            </span>
          </div>
        </div>

        <div className="p-4 sm:px-6">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Doses Taken</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700 tracking-tight">
              {monthlyStats.totalTaken}
            </span>
            <span className="text-[11px] text-slate-500">
              of {monthlyStats.totalScheduled} scheduled
            </span>
          </div>
        </div>

        <div className="p-4 sm:px-6">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Current Streak</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {monthlyStats.streak} {monthlyStats.streak === 1 ? 'Day' : 'Days'}
            </span>
            <span className="text-[11px] text-emerald-600 font-medium">
              active streak
            </span>
          </div>
        </div>

        <div className="p-4 sm:px-6">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Missed Doses</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-700 tracking-tight">
              {monthlyStats.missed}
            </span>
            <span className="text-[11px] text-slate-500">
              requiring review
            </span>
          </div>
        </div>
      </div>

      {/* 3. Calendar Grid & Day Inspector Layout */}
      <div className="p-4 sm:p-6 space-y-6">
        {/* Weekday Header */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs font-bold text-slate-500 uppercase tracking-wider py-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-1">
              {day}
            </div>
          ))}
        </div>

        {/* 7-column Calendar Cells */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {calendarGrid.map(cell => {
            const isSelected = selectedDayDetail === cell.dateStr;

            // Calculate day dose stats
            let dayTotalDoses = 0;
            let dayTakenDoses = 0;

            filteredSchedule.forEach(item => {
              item.times.forEach(t => {
                dayTotalDoses++;
                if (logsLookup.has(`${item.id}_${t}_${cell.dateStr}`)) {
                  dayTakenDoses++;
                }
              });
            });

            const isAllTaken = dayTotalDoses > 0 && dayTakenDoses === dayTotalDoses;
            const isPartialTaken = dayTakenDoses > 0 && dayTakenDoses < dayTotalDoses;
            const isNoneTaken = dayTotalDoses > 0 && dayTakenDoses === 0;

            return (
              <div
                key={cell.dateStr}
                onClick={() => setSelectedDayDetail(cell.dateStr)}
                tabIndex={0}
                role="button"
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setSelectedDayDetail(cell.dateStr);
                  }
                }}
                className={`min-h-[92px] sm:min-h-[118px] p-1.5 sm:p-2.5 rounded-xl border transition-all text-left flex flex-col justify-between cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-teal-500 ${
                  cell.isToday
                    ? 'border-teal-500 bg-teal-50/20 ring-1 ring-teal-500/30'
                    : isSelected
                    ? 'border-slate-400 bg-slate-50/90 shadow-xs'
                    : cell.isCurrentMonth
                    ? 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/40'
                    : 'border-slate-100 bg-slate-50/30 text-slate-300'
                }`}
              >
                {/* Cell Top: Day Number & Adherence Pill */}
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                      cell.isToday
                        ? 'bg-teal-600 text-white shadow-xs'
                        : cell.isCurrentMonth
                        ? 'text-slate-800'
                        : 'text-slate-400'
                    }`}
                  >
                    {cell.dayNumber}
                  </span>

                  {dayTotalDoses > 0 && (
                    <div className="flex items-center gap-1">
                      {isAllTaken && (
                        <span
                          title="All scheduled doses taken"
                          className="w-2 h-2 rounded-full bg-emerald-500"
                        />
                      )}
                      {isPartialTaken && (
                        <span
                          title="Partially taken"
                          className="w-2 h-2 rounded-full bg-amber-500"
                        />
                      )}
                      {isNoneTaken && cell.isPast && (
                        <span
                          title="Missed doses"
                          className="w-2 h-2 rounded-full bg-rose-400"
                        />
                      )}
                      <span className="text-[10px] font-bold text-slate-600 hidden sm:inline">
                        {dayTakenDoses}/{dayTotalDoses}
                      </span>
                    </div>
                  )}
                </div>

                {/* Cell Center/Bottom: Doses with Interactive Checkboxes */}
                <div className="mt-1 space-y-1 overflow-hidden">
                  {filteredSchedule.slice(0, 3).map(item => {
                    return item.times.slice(0, 2).map(time => {
                      const doseKey = `${item.id}_${time}_${cell.dateStr}`;
                      const isTaken = logsLookup.has(doseKey);

                      return (
                        <div
                          key={doseKey}
                          onClick={e => handleToggleSlot(e, item.id, item.medicineName, time, cell.dateStr)}
                          title={`${item.medicineName} (${time}) - Click to toggle adherence`}
                          className={`group/dose flex items-center gap-1.5 px-1 py-0.5 rounded text-[11px] truncate transition-colors cursor-pointer ${
                            isTaken
                              ? 'bg-emerald-50 text-emerald-800 font-medium'
                              : 'hover:bg-slate-100 text-slate-600'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isTaken}
                            onChange={e => handleToggleSlot(e, item.id, item.medicineName, time, cell.dateStr)}
                            className="w-3.5 h-3.5 rounded text-teal-600 focus:ring-teal-500 border-slate-300 cursor-pointer shrink-0"
                            aria-label={`Toggle ${item.medicineName} ${time} on ${cell.dateStr}`}
                          />
                          <span
                            className={`truncate text-[10px] hidden sm:inline ${
                              isTaken ? 'line-through text-slate-600' : 'text-slate-700'
                            }`}
                          >
                            <span className="font-semibold">{time}</span> {item.medicineName}
                          </span>
                        </div>
                      );
                    });
                  })}

                  {/* Overflow count if more doses */}
                  {dayTotalDoses > 3 && (
                    <div className="text-[10px] text-slate-600 font-semibold px-1 text-center sm:text-left">
                      +{dayTotalDoses - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 4. Selected Day Detail Drawer / Quick Action Bar */}
        {selectedDayDetail && (
          <div className="rounded-2xl border border-teal-100 bg-linear-to-r from-teal-50/40 via-white to-emerald-50/30 p-4 sm:p-5 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-teal-100/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {selectedDayDetail.split('-')[2]}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {formatDayHeading(selectedDayDetail)}
                  </h3>
                  <span className="text-xs text-slate-500">
                    {selectedDayDetail === todayStr
                      ? 'Today · Live schedule'
                      : selectedDayDetail < todayStr
                      ? 'Historical record'
                      : 'Upcoming scheduled doses'}
                  </span>
                </div>
              </div>

              {/* Day Quick Controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleMarkAllForDay(selectedDayDetail)}
                  className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Mark All Taken</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDayDetail(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Close day view"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Doses List for Selected Day */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredSchedule.map(item => {
                return item.times.map(time => {
                  const doseKey = `${item.id}_${time}_${selectedDayDetail}`;
                  const isTaken = logsLookup.has(doseKey);
                  const logRecord = logsLookup.get(doseKey);

                  return (
                    <div
                      key={doseKey}
                      onClick={e => handleToggleSlot(e, item.id, item.medicineName, time, selectedDayDetail)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isTaken
                          ? 'border-emerald-200 bg-emerald-50/60 shadow-2xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isTaken}
                        onChange={e => handleToggleSlot(e, item.id, item.medicineName, time, selectedDayDetail)}
                        className="w-5 h-5 mt-0.5 rounded text-teal-600 focus:ring-teal-500 border-slate-300 cursor-pointer shrink-0"
                        aria-label={`Toggle adherence for ${item.medicineName} at ${time}`}
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {item.medicineName}
                          </span>
                          <span className="text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-1.5 py-0.2 rounded shrink-0">
                            {time}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {item.dosage} · {item.timing}
                        </div>

                        {item.instructions && (
                          <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                            {item.instructions}
                          </div>
                        )}

                        {isTaken && logRecord?.takenAt && (
                          <div className="text-[10px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Logged at {new Date(logRecord.takenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                });
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
