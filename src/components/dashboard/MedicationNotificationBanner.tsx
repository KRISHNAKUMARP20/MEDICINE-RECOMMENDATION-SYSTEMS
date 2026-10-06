import React from 'react';
import {
  Bell,
  BellRing,
  Check,
  CheckCircle2,
  Clock,
  Pill,
  Sparkles,
  Volume2,
  VolumeX,
  X
} from 'lucide-react';
import { MedicationScheduleItem } from '../../types';
import { notificationService } from '../../services/notificationService';

export interface DueDoseAlert {
  id: string;
  item: MedicationScheduleItem;
  scheduledTime: string;
  formattedTime: string;
  triggeredAt: Date;
  isTest?: boolean;
}

interface MedicationNotificationBannerProps {
  alert: DueDoseAlert;
  onMarkTaken: (alert: DueDoseAlert) => void;
  onSnooze: (alert: DueDoseAlert, minutes: number) => void;
  onDismiss: (alert: DueDoseAlert) => void;
}

export const MedicationNotificationBanner: React.FC<MedicationNotificationBannerProps> = ({
  alert,
  onMarkTaken,
  onSnooze,
  onDismiss
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-amber-500 via-orange-500 to-rose-600 p-0.5 shadow-xl animate-in slide-in-from-top-4 duration-300">
      <div className="bg-slate-900 rounded-[14px] p-4 sm:p-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Side: Animated Alarm Icon & Drug Details */}
        <div className="flex items-start gap-3.5">
          <div className="relative shrink-0 mt-0.5">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 animate-pulse">
              <BellRing className="w-6 h-6 animate-bounce" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500"></span>
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-400 text-slate-950 shadow-2xs">
                <Clock className="w-3 h-3" />
                {alert.isTest ? 'Test Reminder' : `Dose Due: ${alert.formattedTime}`}
              </span>
              <span className="text-xs text-amber-200/90 font-medium">
                Scheduled at {alert.formattedTime}
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
              <Pill className="w-5 h-5 text-teal-400 shrink-0" />
              <span>{alert.item.medicineName}</span>
              <span className="text-sm font-semibold text-slate-300">({alert.item.dosage})</span>
            </h3>

            <div className="text-xs sm:text-sm text-slate-300 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="font-semibold text-teal-300">{alert.item.timing}</span>
              {alert.item.instructions && (
                <>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-300">{alert.item.instructions}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0 md:self-center">
          <button
            onClick={() => onMarkTaken(alert)}
            className="px-4 py-2.5 rounded-xl bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-slate-950" />
            <span>Mark as Taken</span>
          </button>

          <button
            onClick={() => onSnooze(alert, 10)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-200 border border-slate-700 font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Remind again in 10 minutes"
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Snooze 10m</span>
          </button>

          <button
            onClick={() => onDismiss(alert)}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            title="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
