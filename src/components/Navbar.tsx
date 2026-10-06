import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Bell,
  BookOpen,
  Bot,
  BrainCircuit,
  FileSpreadsheet,
  FileText,
  FolderTree,
  HeartPulse,
  History,
  Home,
  LogIn,
  LogOut,
  Palette,
  Pill,
  Radio,
  Scan,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  User,
  Users,
  Video
} from 'lucide-react';
import { DoctorNotification, UserRecord } from '../types';
import { DoctorNotificationCenter } from './notifications/DoctorNotificationCenter';
import { PatientLoginModal } from './modals/PatientLoginModal';

export type ActiveTab =
  | 'home'
  | 'dashboard'
  | 'doctor-portal'
  | 'symptom-checker'
  | 'medicines'
  | 'diseases'
  | 'prescription-ocr'
  | 'animate-video'
  | 'ml-studio'
  | 'ai-chatbot'
  | 'health-records'
  | 'admin-portal'
  | 'project-explorer';

export type ThemeColor = 'doctor-blue' | 'teal' | 'indigo' | 'slate';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentUser: UserRecord;
  setCurrentUser?: (user: UserRecord) => void;
  themeColor?: ThemeColor;
  setThemeColor?: (theme: ThemeColor) => void;
  doctorNotifications?: DoctorNotification[];
  onMarkDoctorNotificationRead?: (id: string) => void;
  onMarkAllDoctorNotificationsRead?: () => void;
  onClearDoctorNotifications?: () => void;
  onPatientLogin?: (patientUser: UserRecord) => void;
  onOpenDoctorCase?: (caseId?: string) => void;
  onOpenEmergencyModal?: () => void;
  onEmergencyClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  setCurrentUser,
  themeColor = 'doctor-blue',
  setThemeColor,
  doctorNotifications = [],
  onMarkDoctorNotificationRead = () => {},
  onMarkAllDoctorNotificationsRead = () => {},
  onClearDoctorNotifications = () => {},
  onPatientLogin,
  onOpenDoctorCase = () => {},
  onOpenEmergencyModal,
  onEmergencyClick
}) => {
  const [notifCenterOpen, setNotifCenterOpen] = useState(false);
  const [patientLoginModalOpen, setPatientLoginModalOpen] = useState(false);

  const unreadDoctorNotifs = doctorNotifications.filter(n => !n.read).length;
  const triggerEmergency = onEmergencyClick || onOpenEmergencyModal || (() => {});
  const isDoctor = currentUser.role === 'doctor';
  const isAdmin = currentUser.role === 'admin';

  const switchRole = (role: 'patient' | 'doctor' | 'admin') => {
    const updatedUser: UserRecord = {
      ...currentUser,
      role,
      name: role === 'doctor' ? 'Dr. Sarah Mitchell, MD' : role === 'admin' ? 'Admin Supervisor' : 'Alex Johnson',
      email: role === 'doctor' ? 'dr.mitchell@hospital.org' : role === 'admin' ? 'admin@medassist.internal' : 'alex.johnson@health.org'
    };

    if (role === 'patient' && onPatientLogin) {
      onPatientLogin(updatedUser);
    } else if (setCurrentUser) {
      setCurrentUser(updatedUser);
    }

    if (role === 'doctor') {
      setActiveTab('doctor-portal');
      if (setThemeColor) setThemeColor('doctor-blue');
    } else if (role === 'admin') {
      setActiveTab('admin-portal');
    } else if (activeTab === 'admin-portal' || activeTab === 'doctor-portal') {
      setActiveTab('dashboard');
    }
  };

  const handlePatientModalLogin = (patientUser: UserRecord) => {
    if (onPatientLogin) {
      onPatientLogin(patientUser);
    } else if (setCurrentUser) {
      setCurrentUser(patientUser);
    }
    setActiveTab('dashboard');
  };

  const getPrimaryGradient = () => {
    if (themeColor === 'doctor-blue' || isDoctor) return 'from-slate-900 via-blue-900 to-indigo-950 border border-blue-800/50 shadow-sm';
    if (themeColor === 'indigo') return 'from-slate-900 via-indigo-950 to-slate-900 border border-indigo-800/50 shadow-sm';
    if (themeColor === 'slate') return 'from-slate-900 via-slate-800 to-slate-950 border border-slate-700 shadow-sm';
    return 'from-slate-900 via-teal-950 to-slate-900 border border-teal-800/50 shadow-sm';
  };

  const getActiveTabClass = (tab: ActiveTab) => {
    if (activeTab !== tab) {
      return 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/80 font-medium';
    }
    if (themeColor === 'doctor-blue' || isDoctor) {
      return 'bg-blue-50/90 text-blue-900 font-bold border-b-2 border-blue-700 shadow-2xs';
    }
    if (themeColor === 'indigo') {
      return 'bg-indigo-50/90 text-indigo-900 font-bold border-b-2 border-indigo-700 shadow-2xs';
    }
    if (themeColor === 'slate') {
      return 'bg-slate-100 text-slate-950 font-bold border-b-2 border-slate-800 shadow-2xs';
    }
    return 'bg-teal-50/90 text-teal-900 font-bold border-b-2 border-teal-700 shadow-2xs';
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      {/* Top Banner: Clinical Institutional Bar */}
      <div className="bg-slate-950 text-slate-300 text-xs px-4 py-1.5 flex items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className={`inline-block w-2 h-2 rounded-full ${
            isDoctor ? 'bg-blue-400 animate-pulse' : 'bg-teal-400'
          }`}></span>
          <span className="font-bold text-white tracking-wide">
            MedAssist Clinical System
          </span>
          <span className="text-slate-500 hidden sm:inline" aria-hidden="true">·</span>
          <span className="text-slate-400 hidden sm:inline font-medium">
            {isDoctor ? 'Physician Consultation & Rx Prescriber' : 'Clinical Decision Support & Pharmacotherapy'}
          </span>
          <span className="text-slate-500 hidden md:inline" aria-hidden="true">·</span>
          <span className="text-emerald-400 font-mono text-[11px] hidden md:inline">
            ICD-10 &amp; JNC-8 Aligned
          </span>
        </div>

        <div className="flex items-center gap-3">
          {activeTab !== 'home' && (
            <>
              {/* Theme Palette Switcher */}
              <div className="flex items-center gap-1.5 bg-slate-900 rounded-lg px-2.5 py-0.5 text-[11px] border border-slate-800 text-slate-300">
                <Palette className="w-3 h-3 text-slate-400" />
                <span className="text-slate-400 hidden md:inline">Theme:</span>
                <select
                  value={themeColor}
                  onChange={(e) => setThemeColor && setThemeColor(e.target.value as ThemeColor)}
                  className="bg-transparent text-slate-100 font-semibold outline-hidden cursor-pointer"
                  title="Select professional clinical color palette"
                >
                  <option value="doctor-blue" className="bg-slate-900 text-white">Clinical Navy (Primary)</option>
                  <option value="teal" className="bg-slate-900 text-white">Medical Teal (Formulary)</option>
                  <option value="indigo" className="bg-slate-900 text-white">Deep Indigo (Research)</option>
                  <option value="slate" className="bg-slate-900 text-white">Surgical Slate (Monochrome)</option>
                </select>
              </div>

              <button
                onClick={triggerEmergency}
                className="flex items-center gap-1.5 text-rose-300 hover:text-rose-100 font-semibold transition-colors cursor-pointer text-[11px]"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Emergency</span> Red Flags
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className={`w-10 h-10 rounded-xl bg-linear-to-tr ${getPrimaryGradient()} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform`}>
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-slate-900 tracking-tight">MedAssist</span>
                <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm border ${
                  isDoctor
                    ? 'bg-blue-50 text-blue-800 border-blue-200'
                    : 'bg-teal-50 text-teal-700 border border-teal-200'
                }`}>
                  {isDoctor ? 'DOCTOR MD' : 'ML + OCR'}
                </span>
              </div>
              <p className="text-xs text-slate-500 -mt-0.5 hidden sm:block">
                {isDoctor ? 'Physician Consultation & Rx Prescriber' : 'Clinical Medicine Recommendation'}
              </p>
            </div>
          </div>

          {/* Primary Navigation Items */}
          {activeTab !== 'home' && (
            <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
              {/* Dedicated Doctor Tab */}
              {isDoctor && (
                <button
                  onClick={() => setActiveTab('doctor-portal')}
                  className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'doctor-portal'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 font-bold'
                      : 'bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100 font-semibold'
                  }`}
                >
                  <Stethoscope className="w-4 h-4" />
                  <span>Doctor Consults & Rx</span>
                </button>
              )}

              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${getActiveTabClass('dashboard')}`}
              >
                <Activity className="w-4 h-4" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => setActiveTab('symptom-checker')}
                className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${getActiveTabClass('symptom-checker')}`}
              >
                <HeartPulse className="w-4 h-4" />
                <span>Symptom Checker</span>
              </button>

              <button
                onClick={() => setActiveTab('prescription-ocr')}
                className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${getActiveTabClass('prescription-ocr')}`}
              >
                <Scan className="w-4 h-4" />
                <span>Prescription OCR</span>
              </button>

              <button
                onClick={() => setActiveTab('animate-video')}
                className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${getActiveTabClass('animate-video')}`}
              >
                <Video className="w-4 h-4 text-teal-600" />
                <span>Animate to Video (Veo)</span>
              </button>

              <button
                onClick={() => setActiveTab('medicines')}
                className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${getActiveTabClass('medicines')}`}
              >
                <Pill className="w-4 h-4" />
                <span>Medicines & Interactions</span>
              </button>

              <button
                onClick={() => setActiveTab('ml-studio')}
                className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${getActiveTabClass('ml-studio')}`}
              >
                <BrainCircuit className="w-4 h-4" />
                <span>ML Models (97%)</span>
              </button>

              <button
                onClick={() => setActiveTab('ai-chatbot')}
                className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${getActiveTabClass('ai-chatbot')}`}
              >
                <Bot className="w-4 h-4" />
                <span>AI Chatbot</span>
              </button>

              <button
                onClick={() => setActiveTab('project-explorer')}
                className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${getActiveTabClass('project-explorer')}`}
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Kaggle Datasets</span>
              </button>
            </nav>
          )}

          {/* User profile & Action button */}
          {activeTab !== 'home' && (
            <div className="flex items-center gap-2">
              {isDoctor && (
                <button
                  onClick={() => setNotifCenterOpen(true)}
                  className={`relative p-2 rounded-xl transition-all cursor-pointer ${
                    unreadDoctorNotifs > 0
                      ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 ring-2 ring-blue-400 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  title={`Doctor Live Alert Center (${unreadDoctorNotifs} unread alerts)`}
                >
                  <Bell className="w-5 h-5" />
                  {unreadDoctorNotifs > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-rose-600 text-white rounded-full text-[10px] font-black flex items-center justify-center animate-pulse shadow-sm">
                      {unreadDoctorNotifs}
                    </span>
                  )}
                </button>
              )}

              {isDoctor && (
                <button
                  onClick={() => setActiveTab('doctor-portal')}
                  className="hidden md:flex px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs items-center gap-1.5 shadow-sm shadow-blue-500/20 cursor-pointer"
                >
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>Doctor Workstation</span>
                </button>
              )}

              <button
                onClick={() => setActiveTab('health-records')}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors relative"
                title="Health Records & History"
              >
                <History className="w-5 h-5" />
              </button>

              {isAdmin && (
                <button
                  onClick={() => setActiveTab('admin-portal')}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer ${
                    activeTab === 'admin-portal'
                      ? 'bg-amber-500 text-white shadow-amber-500/25 ring-2 ring-amber-400'
                      : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                  }`}
                  title="System Admin Console"
                >
                  <Users className="w-4 h-4 text-amber-700" />
                  <span className="hidden sm:inline">Admin Console</span>
                </button>
              )}

              <div className="hidden lg:flex items-center gap-2 pl-1 border-l border-slate-200">
                <div
                  className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-black shadow-2xs ${
                    isAdmin
                      ? 'bg-amber-100 border-amber-300 text-amber-900'
                      : isDoctor
                      ? 'bg-blue-100 border-blue-300 text-blue-900'
                      : 'bg-slate-100 border-slate-300 text-slate-700'
                  }`}
                >
                  {isDoctor ? 'MD' : isAdmin ? 'AD' : currentUser.name.charAt(0)}
                </div>
                <div className="text-left text-xs">
                  <div className="font-bold text-slate-900 leading-tight truncate max-w-[130px]">{currentUser.name}</div>
                  <div className="text-[11px] font-semibold text-slate-500 capitalize flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      isAdmin ? 'bg-amber-500' : isDoctor ? 'bg-blue-500' : 'bg-teal-500'
                    }`}></span>
                    <span>{currentUser.role}</span>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('home')}
                  className="ml-2 p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Render Doctor Notification Center Modal */}
      <DoctorNotificationCenter
        isOpen={notifCenterOpen}
        onClose={() => setNotifCenterOpen(false)}
        notifications={doctorNotifications}
        onMarkRead={onMarkDoctorNotificationRead}
        onMarkAllRead={onMarkAllDoctorNotificationsRead}
        onClearAll={onClearDoctorNotifications}
        onOpenCase={(caseId) => {
          if (caseId) {
            onOpenDoctorCase(caseId);
          } else {
            setActiveTab('doctor-portal');
          }
        }}
        onSimulatePatientLogin={() => {
          if (onPatientLogin) {
            const simulatedUser: UserRecord = {
              id: `sim-patient-${Date.now()}`,
              name: 'Chloe Bennett',
              email: 'chloe.b@health.org',
              role: 'patient',
              createdAt: new Date().toISOString(),
              profile: {
                name: 'Chloe Bennett',
                age: 52,
                gender: 'female',
                knownAllergies: ['Sulfa'],
                currentMedications: []
              }
            };
            onPatientLogin(simulatedUser);
          }
        }}
      />

      {/* Render Patient Login Modal */}
      <PatientLoginModal
        isOpen={patientLoginModalOpen}
        onClose={() => setPatientLoginModalOpen(false)}
        currentUser={currentUser}
        onPatientLogin={handlePatientModalLogin}
      />

      {/* Sub-navigation bar for mobile/tablets */}
      {activeTab !== 'home' && (
        <div className="lg:hidden flex items-center gap-2 overflow-x-auto px-4 py-2 bg-slate-50 border-t border-slate-200 text-xs no-scrollbar">
          {isDoctor && (
            <button
              onClick={() => setActiveTab('doctor-portal')}
              className={`px-3 py-1.5 rounded-md shrink-0 font-bold flex items-center gap-1 ${
                activeTab === 'doctor-portal' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-900 font-bold'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Doctor Consults & Rx</span>
            </button>
          )}
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-2.5 py-1.5 rounded-md shrink-0 font-medium ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-600'}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('symptom-checker')}
            className={`px-2.5 py-1.5 rounded-md shrink-0 font-medium ${activeTab === 'symptom-checker' ? 'bg-blue-600 text-white' : 'text-slate-600'}`}
          >
            Symptom Checker
          </button>
          <button
            onClick={() => setActiveTab('prescription-ocr')}
            className={`px-2.5 py-1.5 rounded-md shrink-0 font-medium ${activeTab === 'prescription-ocr' ? 'bg-blue-600 text-white' : 'text-slate-600'}`}
          >
            Prescription OCR
          </button>
          <button
            onClick={() => setActiveTab('medicines')}
            className={`px-2.5 py-1.5 rounded-md shrink-0 font-medium ${activeTab === 'medicines' ? 'bg-blue-600 text-white' : 'text-slate-600'}`}
          >
            Medicines
          </button>
          <button
            onClick={() => setActiveTab('diseases')}
            className={`px-2.5 py-1.5 rounded-md shrink-0 font-medium ${activeTab === 'diseases' ? 'bg-blue-600 text-white' : 'text-slate-600'}`}
          >
            Diseases
          </button>
          <button
            onClick={() => setActiveTab('ml-studio')}
            className={`px-2.5 py-1.5 rounded-md shrink-0 font-medium ${activeTab === 'ml-studio' ? 'bg-blue-600 text-white' : 'text-slate-600'}`}
          >
            ML Studio
          </button>
          <button
            onClick={() => setActiveTab('ai-chatbot')}
            className={`px-2.5 py-1.5 rounded-md shrink-0 font-medium ${activeTab === 'ai-chatbot' ? 'bg-blue-600 text-white' : 'text-slate-600'}`}
          >
            AI Chatbot
          </button>
          <button
            onClick={() => setActiveTab('project-explorer')}
            className={`px-2.5 py-1.5 rounded-md shrink-0 font-medium ${activeTab === 'project-explorer' ? 'bg-blue-600 text-white' : 'text-slate-600'}`}
          >
            Kaggle Datasets
          </button>
          <button
            onClick={() => setActiveTab('health-records')}
            className={`px-2.5 py-1.5 rounded-md shrink-0 font-medium ${activeTab === 'health-records' ? 'bg-blue-600 text-white' : 'text-slate-600'}`}
          >
            Records & Profile
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin-portal')}
              className={`px-2.5 py-1.5 rounded-md shrink-0 font-bold ${activeTab === 'admin-portal' ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-900'}`}
            >
              🛡️ Admin Portal
            </button>
          )}
        </div>
      )}
    </header>
  );
};
