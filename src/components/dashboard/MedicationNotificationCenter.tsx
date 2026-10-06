import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellOff,
  BellRing,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flame,
  Info,
  Pill,
  Play,
  Plus,
  RefreshCw,
  Shield,
  ShieldCheck,
  Sparkles,
  Volume2,
  VolumeX,
  X,
  AlertTriangle,
  Check
} from 'lucide-react';
import { DueDoseAlert, MedicationScheduleItem, DoseLog, UserRecord } from '../../types';
import { notificationService } from '../../services/notificationService';
import { storageService } from '../../services/storageService';

interface MedicationNotificationCenterProps {
  currentUser: UserRecord;
  schedule: MedicationScheduleItem[];
  doseLogs: DoseLog[];
  onLogDose: (scheduleId: string, medicineName: string, scheduledTime: string) => void;
  onUpdateSchedule: (newSchedule: MedicationScheduleItem[]) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onViewMedicine?: (medicineId: string) => void;
}

export const MedicationNotificationCenter: React.FC<MedicationNotificationCenterProps> = ({
  currentUser,
  schedule,
  doseLogs,
  onLogDose,
  onUpdateSchedule,
  soundEnabled,
  onToggleSound,
  onViewMedicine
}) => {
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'unsupported'>('default');
  const [activeAlerts, setActiveAlerts] = useState<DueDoseAlert[]>([]);
  const [isTestingPush, setIsTestingPush] = useState(false);
  const [testResultMsg, setTestResultMsg] = useState<string | null>(null);
  const [customTimeInput, setCustomTimeInput] = useState('');
  const [selectedMedForCustomTime, setSelectedMedForCustomTime] = useState<string>('');
  const [showAddCustomTime, setShowAddCustomTime] = useState(false);

  // Check initial permission
  useEffect(() => {
    setPermissionStatus(notificationService.getPermissionStatus());
  }, []);

  // Subscribe to live notifications from the global notification service
  useEffect(() => {
    const unsubAlert = notificationService.onAlert(newAlert => {
      setActiveAlerts(prev => {
        if (prev.some(a => a.id === newAlert.id)) return prev;
        return [newAlert, ...prev];
      });
    });

    return () => {
      unsubAlert();
    };
  }, []);

  // Request browser permission
  const handleRequestPermission = async () => {
    const perm = await notificationService.requestPermission();
    setPermissionStatus(perm);
    if (perm === 'granted') {
      notificationService.sendBrowserNotification('🔔 Push Notifications Activated', {
        body: 'MedAssist will alert you when active medications are due, even when your browser tab is in the background.',
        playSound: soundEnabled
      });
      setTestResultMsg('Browser push notifications enabled! You will now receive alerts for all scheduled doses.');
      setTimeout(() => setTestResultMsg(null), 5000);
    } else if (perm === 'denied') {
      setTestResultMsg('Push notifications were denied. Please check your browser site settings to allow notifications for MedAssist.');
      setTimeout(() => setTestResultMsg(null), 6000);
    }
  };

  // Trigger test alert for a specific drug or default
  const handleTriggerTestPush = async (med?: MedicationScheduleItem) => {
    setIsTestingPush(true);
    setTestResultMsg(null);

    const targetName = med ? `${med.medicineName} (${med.dosage})` : 'Amoxicillin 500mg';
    const result = await notificationService.sendTestReminder(targetName);

    setPermissionStatus(result.permission as NotificationPermission);

    if (result.browserNotificationSent) {
      setTestResultMsg(`Push notification sent for ${targetName}! Check your desktop notification tray.`);
    } else {
      setTestResultMsg(`In-app notification alert triggered for ${targetName}. (Enable browser permissions above to see desktop push banners).`);
    }

    setIsTestingPush(false);
    setTimeout(() => setTestResultMsg(null), 5000);
  };

  // Trigger an alert for right now (sets current time + 1 min or immediate)
  const handleArmImmediateReminder = (med: MedicationScheduleItem) => {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${h}:${m}`;

    // Add this time to the item's times if not already present
    if (!med.times.includes(currentTimeStr)) {
      const updatedSchedule = schedule.map(item => {
        if (item.id === med.id) {
          return {
            ...item,
            times: [...item.times, currentTimeStr].sort()
          };
        }
        return item;
      });
      onUpdateSchedule(updatedSchedule);
    }

    // Force check immediately
    notificationService.checkScheduleAndNotify();
    setTestResultMsg(`Armed reminder for ${med.medicineName} at current time (${currentTimeStr}). Alert will trigger automatically!`);
    setTimeout(() => setTestResultMsg(null), 5000);
  };

  // Mark dose taken
  const handleMarkTaken = (alert: DueDoseAlert) => {
    onLogDose(alert.item.id, alert.item.medicineName, alert.scheduledTime);
    setActiveAlerts(prev => prev.filter(a => a.id !== alert.id));
  };

  // Snooze
  const handleSnooze = (alert: DueDoseAlert, minutes = 10) => {
    notificationService.snoozeAlert(alert, minutes);
    setActiveAlerts(prev => prev.filter(a => a.id !== alert.id));
    setTestResultMsg(`Snoozed ${alert.item.medicineName} for ${minutes} minutes.`);
    setTimeout(() => setTestResultMsg(null), 4000);
  };

  // Dismiss
  const handleDismiss = (alert: DueDoseAlert) => {
    setActiveAlerts(prev => prev.filter(a => a.id !== alert.id));
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const activeItems = schedule.filter(s => s.active !== false);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
      {/* Top Header */}
      <div className="p-5 sm:p-6 bg-linear-to-r from-slate-900 via-slate-800 to-teal-950 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30">
              <BellRing className="w-4 h-4 animate-bounce" />
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider text-teal-400 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-500/30">
              Web Push Notification Engine
            </span>
          </div>
          <h3 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            <span>Medication Push Alerts & Schedule Dispatcher</span>
          </h3>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Local browser-based scheduler monitoring your active prescription list. Dispatches native desktop notifications and medical audio chimes when doses are due, even if you are working in other tabs.
          </p>
        </div>

        {/* Permission & Sound Controls */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto shrink-0">
          <button
            type="button"
            onClick={onToggleSound}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
              soundEnabled
                ? 'bg-teal-500/20 text-teal-300 border-teal-500/40 hover:bg-teal-500/30'
                : 'bg-white/10 text-slate-400 border-white/10 hover:bg-white/15'
            }`}
            title="Toggle synthesized Web Audio reminder chime"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-teal-300" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
            <span>{soundEnabled ? 'Chime ON' : 'Chime Muted'}</span>
          </button>

          {permissionStatus === 'granted' ? (
            <div className="px-3 py-2 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Desktop Push Active</span>
            </div>
          ) : permissionStatus === 'denied' ? (
            <div className="px-3 py-2 rounded-xl bg-rose-500/20 border border-rose-400/40 text-rose-300 text-xs font-bold flex items-center gap-1.5">
              <BellOff className="w-4 h-4 text-rose-400" />
              <span>Notifications Blocked</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleRequestPermission}
              className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-teal-500/25 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Enable Browser Push</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleTriggerTestPush()}
            disabled={isTestingPush}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-white/15"
          >
            <Play className={`w-3.5 h-3.5 ${isTestingPush ? 'animate-spin' : ''}`} />
            <span>Test Push Alert</span>
          </button>
        </div>
      </div>

      {/* Test feedback toast */}
      {testResultMsg && (
        <div className="px-6 py-2.5 bg-teal-50 border-b border-teal-200 text-teal-900 text-xs font-medium flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
            <span>{testResultMsg}</span>
          </div>
          <button
            onClick={() => setTestResultMsg(null)}
            className="text-teal-700 hover:text-teal-900 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Active Triggered Due Doses Banner (If Any Are Due Right Now) */}
      {activeAlerts.length > 0 && (
        <div className="p-4 sm:p-5 bg-linear-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 border-b border-amber-300">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <h4 className="text-xs font-black uppercase tracking-wider text-rose-950">
              Active Push Alerts Awaiting Patient Action ({activeAlerts.length})
            </h4>
          </div>

          <div className="space-y-3">
            {activeAlerts.map(alert => (
              <div
                key={alert.id}
                className="bg-white rounded-xl border border-amber-300 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 animate-fadeIn"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <Pill className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-black text-slate-900">
                        {alert.item.medicineName}
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                        {alert.item.dosage}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        Due: <strong>{alert.formattedTime}</strong> ({alert.item.timing})
                      </span>
                    </div>
                    {alert.item.instructions && (
                      <p className="text-xs text-slate-600 mt-1">
                        {alert.item.instructions}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-start md:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMarkTaken(alert)}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Taken</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSnooze(alert, 10)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer border border-slate-200"
                  >
                    Snooze 10m
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDismiss(alert)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Dismiss alert"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Prescription Push Schedule Matrix */}
      <div className="p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600" />
              <span>Active Prescription Scheduled Notification Times</span>
            </h4>
            <p className="text-xs text-slate-500">
              Timers are matched against the local client clock and trigger browser alerts automatically.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Polling every 10s</span>
          </div>
        </div>

        {activeItems.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <Pill className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No active medications scheduled</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Add medications to your regimen to enable automatic timed push notifications.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {activeItems.map(item => {
              // Check if any doses taken today
              const takenTimes = item.times.filter(t =>
                doseLogs.some(
                  l => l.scheduleId === item.id && l.scheduledTime === t && l.date === todayStr && l.status === 'taken'
                )
              );
              const allTakenToday = item.times.length > 0 && takenTimes.length === item.times.length;

              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-slate-50 p-4 transition-all hover:border-teal-300 flex flex-col justify-between gap-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-slate-900 text-sm">{item.medicineName}</h5>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-900">
                            {item.dosage}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {item.timing} • Prescribed by: {item.prescribedBy || 'General Clinic'}
                        </p>
                      </div>

                      {allTakenToday ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shrink-0">
                          <Check className="w-3 h-3" />
                          <span>All Taken</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black uppercase tracking-wider shrink-0">
                          Scheduled
                        </span>
                      )}
                    </div>

                    {/* Notification Slot Badges */}
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Push Alarm Trigger Times:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {item.times.map((t, idx) => {
                          const isTaken = doseLogs.some(
                            l => l.scheduleId === item.id && l.scheduledTime === t && l.date === todayStr && l.status === 'taken'
                          );
                          const formatted = notificationService.formatTime12h(t);

                          return (
                            <div
                              key={idx}
                              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 border transition-all ${
                                isTaken
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : 'bg-white text-slate-800 border-slate-200 shadow-2xs'
                              }`}
                            >
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{formatted}</span>
                              {isTaken ? (
                                <span className="text-[10px] text-emerald-600 font-semibold">✓ Taken</span>
                              ) : (
                                <span className="text-[10px] text-teal-600 font-semibold">Armed</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {item.instructions && (
                      <p className="text-xs text-slate-600 italic bg-white/70 p-2 rounded-lg border border-slate-200/60">
                        "{item.instructions}"
                      </p>
                    )}
                  </div>

                  {/* Actions for this specific medication */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/80">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleTriggerTestPush(item)}
                        className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer"
                        title="Trigger test push alert for this medication"
                      >
                        <Bell className="w-3 h-3" />
                        <span>Test Alert</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleArmImmediateReminder(item)}
                        className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                        title="Arm an automated reminder for the current clock time"
                      >
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        <span>Arm for Now</span>
                      </button>
                    </div>

                    {onViewMedicine && (
                      <button
                        type="button"
                        onClick={() => onViewMedicine(item.medicineId)}
                        className="text-xs font-bold text-slate-500 hover:text-teal-700 flex items-center gap-1 cursor-pointer"
                      >
                        <span>Drug Info</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
