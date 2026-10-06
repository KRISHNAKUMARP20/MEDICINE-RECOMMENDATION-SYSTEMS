import React, { useState } from 'react';
import {
  Bell,
  CheckCheck,
  Clock,
  ExternalLink,
  Flame,
  LogIn,
  Radio,
  Sparkles,
  Stethoscope,
  Trash2,
  User,
  Volume2,
  VolumeX,
  X
} from 'lucide-react';
import { DoctorNotification } from '../../types';

interface DoctorNotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: DoctorNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClearAll: () => void;
  onOpenCase: (caseId?: string) => void;
  onSimulatePatientLogin?: () => void;
}

export const DoctorNotificationCenter: React.FC<DoctorNotificationCenterProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onMarkAllRead,
  onClearAll,
  onOpenCase,
  onSimulatePatientLogin
}) => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'logins'>('all');
  const [soundEnabled, setSoundEnabled] = useState(true);

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'logins') return n.type === 'patient_login';
    return true;
  });

  const formatTimeAgo = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHour / 24);

      if (diffSec < 45) return 'Just now';
      if (diffMin < 60) return `${diffMin}m ago`;
      if (diffHour < 24) return `${diffHour}h ago`;
      return `${diffDay}d ago`;
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-3 sm:p-6 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] mt-12 sm:mt-14"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/80 border border-blue-400/30 flex items-center justify-center relative shadow-inner">
              <Stethoscope className="w-5 h-5 text-white" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-black flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base leading-tight">Doctor Alert Center</h3>
                <span className="inline-flex items-center gap-1 text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-400" />
                  Live Station
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-0.5">
                Direct Patient Login & Triage Notifications
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Mute alert chime' : 'Enable alert chime'}
              className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 transition-colors cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Status & Quick Action Strip */}
        <div className="px-4 py-2.5 bg-blue-50/70 border-b border-blue-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-blue-900 font-semibold">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
            <span>Dr. Sarah Mitchell, MD • Listening to patient arrivals</span>
          </div>

          {onSimulatePatientLogin && (
            <button
              onClick={onSimulatePatientLogin}
              className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
              title="Trigger a test patient login notification"
            >
              <LogIn className="w-3 h-3" />
              <span>Simulate Login</span>
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="px-4 pt-3 pb-2 border-b border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                filter === 'unread'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Unread</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setFilter('logins')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                filter === 'logins'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Logins Only
            </button>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
                title="Mark all notifications as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mark read</span>
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-[11px] text-slate-400 hover:text-rose-600 transition-colors p-1"
                title="Clear all notifications"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 divide-y divide-slate-100/60">
          {filteredNotifications.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center mb-3">
                <Bell className="w-6 h-6" />
              </div>
              <p className="font-bold text-slate-800 text-sm">No notifications found</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                When patients sign in or report symptoms, their direct alerts will instantly appear here for your immediate review.
              </p>
            </div>
          ) : (
            filteredNotifications.map(notif => (
              <div
                key={notif.id}
                onClick={() => {
                  onMarkRead(notif.id);
                  if (notif.caseId) {
                    onOpenCase(notif.caseId);
                    onClose();
                  } else {
                    onOpenCase();
                    onClose();
                  }
                }}
                className={`pt-2.5 first:pt-0 p-3 rounded-2xl border transition-all cursor-pointer relative group ${
                  !notif.read
                    ? 'bg-blue-50/50 border-blue-200 shadow-2xs hover:bg-blue-50 hover:border-blue-300'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-2xs ${
                        notif.type === 'patient_login'
                          ? 'bg-emerald-600 text-white'
                          : notif.urgency === 'High' || notif.urgency === 'Emergency'
                          ? 'bg-rose-600 text-white'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {notif.type === 'patient_login' ? (
                        <LogIn className="w-4 h-4" />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-black text-slate-900 text-sm">
                          {notif.patientName}
                        </span>
                        {notif.patientAge && (
                          <span className="text-xs text-slate-500">
                            ({notif.patientAge}yo, {notif.patientGender || 'Patient'})
                          </span>
                        )}
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 ring-2 ring-blue-200"></span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                            notif.type === 'patient_login'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {notif.type === 'patient_login' ? 'Direct Login Alert' : 'Symptom Triage'}
                        </span>

                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatTimeAgo(notif.timestamp)}</span>
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                        {notif.message}
                      </p>

                      {notif.symptoms && notif.symptoms.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {notif.symptoms.map((sym, sIdx) => (
                            <span
                              key={sIdx}
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 shadow-2xs"
                            >
                              {sym}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col items-end gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkRead(notif.id);
                        onOpenCase(notif.caseId);
                        onClose();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-2xs cursor-pointer opacity-90 group-hover:opacity-100 transition-opacity"
                    >
                      <span>Prescribe</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Logged into Doctor Workstation</span>
          <button
            onClick={() => {
              onOpenCase();
              onClose();
            }}
            className="font-bold text-blue-700 hover:text-blue-900 cursor-pointer"
          >
            Go to Doctor Rx Pad →
          </button>
        </div>
      </div>
    </div>
  );
};
