import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Bell,
  BellRing,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flame,
  Info,
  Pill,
  Sparkles,
  Utensils,
  Volume2,
  Zap
} from 'lucide-react';
import { DoseLog, MedicationScheduleItem } from '../../types';
import { notificationService } from '../../services/notificationService';

interface NextMedicationCardProps {
  schedule: MedicationScheduleItem[];
  doseLogs: DoseLog[];
  onLogDose: (scheduleId: string, medicineName: string, scheduledTime: string) => void;
  onTriggerTestReminder: (item?: MedicationScheduleItem) => void;
  onOpenScheduleModal?: () => void;
  onViewMedicine?: (medicineId: string) => void;
}

export const NextMedicationCard: React.FC<NextMedicationCardProps> = ({
  schedule,
  doseLogs,
  onLogDose,
  onTriggerTestReminder,
  onOpenScheduleModal,
  onViewMedicine
}) => {
  // Tick every second for live real-time countdown
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick(t => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const todayLogs = doseLogs.filter(l => l.date === today && l.status === 'taken');

  // Compute detailed next dose & timeline
  const nextDoseInfo = notificationService.getNextDoseDetailed(schedule, todayLogs);

  // If no medications are active in schedule
  if (!nextDoseInfo) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 shrink-0">
            <Pill className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-teal-700">Medication Schedule</div>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">No Active Prescriptions Scheduled</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Add your current medications to activate real-time countdown timers and timed alarms.
            </p>
          </div>
        </div>

        {onOpenScheduleModal && (
          <button
            onClick={onOpenScheduleModal}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-2xs transition-colors shrink-0 cursor-pointer"
          >
            + Set Up Schedule
          </button>
        )}
      </div>
    );
  }

  const {
    item,
    time,
    formattedTime,
    isToday,
    isOverdue,
    isDueNow,
    hours,
    minutes,
    seconds,
    todayTimeline
  } = nextDoseInfo;

  // Format countdown string
  const pad = (n: number) => n.toString().padStart(2, '0');
  const countdownFormatted = `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;

  // Determine card theme based on urgency
  const isUrgent = isOverdue || isDueNow;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border transition-all duration-300 shadow-md ${
        isUrgent
          ? 'bg-linear-to-br from-amber-950 via-slate-900 to-rose-950 border-amber-500/50 text-white'
          : 'bg-linear-to-br from-slate-900 via-teal-950 to-slate-900 border-teal-500/40 text-white'
      }`}
    >
      {/* Decorative ambient glowing orbs */}
      <div
        className={`absolute -right-10 -top-10 w-52 h-52 rounded-full blur-3xl pointer-events-none opacity-20 ${
          isUrgent ? 'bg-amber-400' : 'bg-teal-400'
        }`}
      />
      <div
        className={`absolute -left-10 -bottom-10 w-52 h-52 rounded-full blur-3xl pointer-events-none opacity-20 ${
          isUrgent ? 'bg-rose-500' : 'bg-emerald-400'
        }`}
      />

      <div className="relative z-10 p-5 sm:p-6 space-y-5">
        {/* Top Header Row: Category Badge & Status Indicator */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-xs ${
                isOverdue
                  ? 'bg-rose-500 text-white animate-pulse'
                  : isDueNow
                  ? 'bg-amber-400 text-slate-950 animate-bounce'
                  : 'bg-teal-400 text-slate-950'
              }`}
            >
              {isOverdue ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Dose Overdue</span>
                </>
              ) : isDueNow ? (
                <>
                  <BellRing className="w-3.5 h-3.5" />
                  <span>Due Right Now</span>
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5" />
                  <span>Next Medication</span>
                </>
              )}
            </span>

            <span className="text-xs text-slate-300 font-medium">
              Scheduled for <span className="font-bold text-white">{formattedTime}</span>{' '}
              {isToday ? '(Today)' : '(Tomorrow Morning)'}
            </span>
          </div>

          {/* Quick test chime button */}
          <button
            onClick={() => onTriggerTestReminder(item)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold backdrop-blur-xs transition-colors cursor-pointer border border-white/10"
            title="Preview reminder sound and notification"
          >
            <Volume2 className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">Test Alert Sound</span>
          </button>
        </div>

        {/* Main Hero Grid: Countdown Box & Medicine Highlights */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          {/* Left Column (7 cols): Medicine Name, Dosage, Instructions */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-start gap-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                  isUrgent
                    ? 'bg-amber-500/20 border border-amber-400/40 text-amber-300'
                    : 'bg-teal-500/20 border border-teal-400/40 text-teal-300'
                }`}
              >
                <Pill className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-baseline gap-2">
                  <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {item.medicineName}
                  </h3>
                  <span className="text-base sm:text-lg font-bold text-teal-300">
                    {item.dosage}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-white/10 text-xs font-semibold text-teal-200 border border-white/10">
                    <Utensils className="w-3 h-3 text-teal-300" />
                    <span>{item.timing}</span>
                  </span>

                  {item.prescribedBy && (
                    <span className="text-xs text-slate-400">
                      Prescribed by <span className="text-slate-300 font-medium">{item.prescribedBy}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Special Instructions Note */}
            {item.instructions && (
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 flex items-start gap-2">
                <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white font-semibold">Directions: </strong>
                  {item.instructions}
                </span>
              </div>
            )}
          </div>

          {/* Right Column (5 cols): Big Countdown Digits & "Take Now" Button */}
          <div className="lg:col-span-5 flex flex-col items-start lg:items-end justify-center gap-3">
            <div className="w-full lg:w-auto p-4 rounded-xl bg-black/40 border border-white/10 backdrop-blur-md text-center lg:text-right space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">
                {isOverdue ? 'Time Passed Since Due' : isDueNow ? 'Dose Due Window' : 'Countdown to Dose'}
              </span>

              {isDueNow ? (
                <div className="text-2xl sm:text-3xl font-black text-amber-300 tracking-tight flex items-center justify-center lg:justify-end gap-2">
                  <BellRing className="w-6 h-6 text-amber-400 animate-bounce" />
                  <span>DUE RIGHT NOW</span>
                </div>
              ) : isOverdue ? (
                <div className="text-2xl sm:text-3xl font-black text-rose-400 tracking-tight">
                  Overdue by {Math.abs(nextDoseInfo.minutesUntil)}m
                </div>
              ) : (
                <div className="font-mono text-2xl sm:text-3xl font-black text-teal-300 tracking-wider">
                  {countdownFormatted}
                </div>
              )}

              <span className="text-[11px] text-slate-400 block">
                {isToday ? `Today at ${formattedTime}` : `Tomorrow morning at ${formattedTime}`}
              </span>
            </div>

            {/* Primary Action Button */}
            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-stretch lg:justify-end">
              <button
                onClick={() => onLogDose(item.id, item.medicineName, time)}
                className="flex-1 lg:flex-initial px-5 py-3 rounded-xl bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-slate-950" />
                <span>Mark Dose as Taken</span>
              </button>

              {onViewMedicine && (
                <button
                  onClick={() => onViewMedicine(item.medicineId || item.medicineName.toLowerCase())}
                  className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                  title="View full drug interactions & safety warnings"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Strip: Today's Full Regimen Timeline Bar */}
        {todayTimeline.length > 0 && (
          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2.5">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-teal-400" />
                <span>Today's Complete Medication Timeline</span>
              </span>
              <span>
                {todayTimeline.filter(t => t.isTaken).length} of {todayTimeline.length} completed today
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {todayTimeline.map((slot, idx) => (
                <div
                  key={`${slot.item.id}-${slot.time}-${idx}`}
                  className={`p-2.5 rounded-xl border transition-all text-xs flex items-center justify-between gap-2 ${
                    slot.isNext
                      ? 'bg-teal-500/20 border-teal-400/70 text-white shadow-xs'
                      : slot.isTaken
                      ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
                      : slot.isOverdue
                      ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                      : 'bg-black/20 border-white/5 text-slate-300'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-white truncate">{slot.item.medicineName}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{slot.formattedTime}</span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {slot.isTaken ? (
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                        <Check className="w-3 h-3" />
                        <span>Taken</span>
                      </span>
                    ) : slot.isNext ? (
                      <button
                        onClick={() => onLogDose(slot.item.id, slot.item.medicineName, slot.time)}
                        className="px-2 py-1 rounded-md bg-teal-500 hover:bg-teal-400 text-slate-950 text-[11px] font-black cursor-pointer shadow-xs"
                      >
                        Take
                      </button>
                    ) : (
                      <button
                        onClick={() => onLogDose(slot.item.id, slot.item.medicineName, slot.time)}
                        className="text-[11px] text-teal-300 hover:text-white underline cursor-pointer"
                      >
                        Take
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
