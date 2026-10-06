import React, { useEffect, useState } from 'react';
import {
  Bell,
  CheckCircle2,
  ExternalLink,
  LogIn,
  Radio,
  Sparkles,
  Stethoscope,
  X
} from 'lucide-react';
import { DoctorNotification } from '../../types';

interface LiveDoctorAlertToastProps {
  notification: DoctorNotification | null;
  onDismiss: () => void;
  onOpenDoctorPortal: (caseId?: string) => void;
}

export const LiveDoctorAlertToast: React.FC<LiveDoctorAlertToastProps> = ({
  notification,
  onDismiss,
  onOpenDoctorPortal
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setVisible(true);
      // Auto-dismiss toast after 8 seconds
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onDismiss, 300);
      }, 8000);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [notification, onDismiss]);

  if (!notification || !visible) return null;

  return (
    <div className="fixed top-16 right-4 sm:right-6 z-50 max-w-md w-full animate-in slide-in-from-top-4 fade-in duration-300">
      <div className="bg-slate-900 text-white rounded-2xl shadow-2xl border-2 border-blue-500/70 p-4 relative overflow-hidden backdrop-blur-md">
        {/* Glow ambient accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex items-start gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/40 animate-bounce">
            <LogIn className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0 pr-6">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-400" />
                Live Patient Login
              </span>
              <span className="text-xs text-blue-300 font-semibold">Doctor Pager Alert</span>
            </div>

            <h4 className="font-bold text-sm text-white mt-1 leading-snug">
              {notification.patientName} has logged into the portal
            </h4>

            <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
              {notification.message}
            </p>

            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={() => {
                  onOpenDoctorPortal(notification.caseId);
                  onDismiss();
                }}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-all cursor-pointer"
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Review & Prescribe Rx</span>
              </button>

              <button
                onClick={() => {
                  setVisible(false);
                  setTimeout(onDismiss, 200);
                }}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>

          <button
            onClick={() => {
              setVisible(false);
              setTimeout(onDismiss, 200);
            }}
            className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
