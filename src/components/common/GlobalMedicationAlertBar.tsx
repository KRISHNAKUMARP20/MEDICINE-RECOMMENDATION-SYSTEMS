import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellRing,
  CheckCircle2,
  Clock,
  ExternalLink,
  Pill,
  Sparkles,
  Volume2,
  X
} from 'lucide-react';
import { DueDoseAlert } from '../../types';
import { notificationService } from '../../services/notificationService';
import { storageService } from '../../services/storageService';
import { ActiveTab } from '../Navbar';

interface GlobalMedicationAlertBarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onDoseLogged?: () => void;
}

export const GlobalMedicationAlertBar: React.FC<GlobalMedicationAlertBarProps> = ({
  activeTab,
  setActiveTab,
  onDoseLogged
}) => {
  const [activeAlerts, setActiveAlerts] = useState<DueDoseAlert[]>([]);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'unsupported'>('default');
  const [permissionBannerDismissed, setPermissionBannerDismissed] = useState(false);

  // Sync permission status
  useEffect(() => {
    setPermissionStatus(notificationService.getPermissionStatus());
  }, []);

  // Subscribe to notification events from global notificationService
  useEffect(() => {
    const unsubAlert = notificationService.onAlert(newAlert => {
      setActiveAlerts(prev => {
        // Prevent duplicates
        if (prev.some(a => a.id === newAlert.id)) return prev;
        return [newAlert, ...prev];
      });
    });

    const unsubNavigate = notificationService.onNavigateToDashboard(() => {
      setActiveTab('dashboard');
    });

    return () => {
      unsubAlert();
      unsubNavigate();
    };
  }, [setActiveTab]);

  const handleRequestPermission = async () => {
    const perm = await notificationService.requestPermission();
    setPermissionStatus(perm);
    if (perm === 'granted') {
      notificationService.sendBrowserNotification('✅ Medication Reminders Activated', {
        body: 'MedAssist will alert you when active medications are due, even when MedAssist is minimized or backgrounded.',
        tag: 'medassist-permission-granted'
      });
    }
  };

  const handleMarkTaken = (alert: DueDoseAlert) => {
    storageService.logDoseTaken(alert.item.id, alert.item.medicineName, alert.scheduledTime);
    notificationService.clearAlertSlot(alert.item.id, alert.scheduledTime);
    notificationService.playSuccessChime();
    setActiveAlerts(prev => prev.filter(a => a.id !== alert.id));
    if (onDoseLogged) {
      onDoseLogged();
    }
  };

  const handleSnooze = (alert: DueDoseAlert, minutes = 10) => {
    notificationService.snoozeAlert(alert, minutes);
    setActiveAlerts(prev => prev.filter(a => a.id !== alert.id));
  };

  const handleDismiss = (alert: DueDoseAlert) => {
    setActiveAlerts(prev => prev.filter(a => a.id !== alert.id));
  };

  return (
    <div className="w-full space-y-2 mb-4">
      {/* 1. Permission Prompt Banner if not granted yet */}
      {permissionStatus === 'default' && !permissionBannerDismissed && (
        <div className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4 text-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-teal-400 flex items-center justify-center shrink-0 shadow-2xs">
              <BellRing className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">
                Browser Medication Reminders
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Receive scheduled prescription alerts even if MedAssist is minimized or working in background tabs.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              onClick={handleRequestPermission}
              className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
            >
              Enable Desktop Alerts
            </button>
            <button
              onClick={() => setPermissionBannerDismissed(true)}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              title="Dismiss notification prompt"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Active Due Medication Alert Toasts */}
      {activeAlerts.map(alert => (
        <div
          key={alert.id}
          className="relative overflow-hidden rounded-2xl bg-linear-to-r from-amber-500 via-orange-500 to-rose-600 p-0.5 shadow-xl animate-in slide-in-from-top-3 duration-300"
        >
          <div className="bg-slate-900 rounded-[14px] p-4 sm:p-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Left Column: Icon & Drug Info */}
            <div className="flex items-start gap-3.5">
              <div className="relative shrink-0 mt-0.5">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                  <BellRing className="w-6 h-6 animate-bounce" />
                </div>
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500"></span>
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 shadow-2xs">
                    <Clock className="w-3 h-3" />
                    {alert.isTest ? 'Test Alert' : `Dose Due Now: ${alert.formattedTime}`}
                  </span>
                  <span className="text-xs text-amber-200/90 font-medium">
                    Scheduled dose requires action
                  </span>
                </div>

                <div className="flex flex-wrap items-baseline gap-2 pt-0.5">
                  <h3 className="text-xl font-black text-white tracking-tight">
                    {alert.item.medicineName}
                  </h3>
                  <span className="text-sm font-bold text-amber-300">
                    {alert.item.dosage}
                  </span>
                  <span className="text-xs text-slate-300 bg-white/10 px-2 py-0.5 rounded-md">
                    {alert.item.timing}
                  </span>
                </div>

                {alert.item.instructions && (
                  <p className="text-xs text-slate-300 pt-0.5 max-w-xl">
                    <span className="font-semibold text-white">Instructions: </span>
                    {alert.item.instructions}
                  </p>
                )}
              </div>
            </div>

            {/* Right Column: Fast Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 self-start md:self-center shrink-0">
              <button
                onClick={() => handleMarkTaken(alert)}
                className="px-4 py-2 rounded-xl bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-slate-950" />
                <span>Mark as Taken</span>
              </button>

              <button
                onClick={() => handleSnooze(alert, 10)}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold backdrop-blur-xs transition-colors cursor-pointer border border-white/10"
              >
                Snooze 10m
              </button>

              {activeTab !== 'dashboard' && (
                <button
                  onClick={() => {
                    setActiveTab('dashboard');
                  }}
                  className="px-3 py-2 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-200 text-xs font-semibold border border-teal-500/30 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>Dashboard</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                onClick={() => handleDismiss(alert)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
