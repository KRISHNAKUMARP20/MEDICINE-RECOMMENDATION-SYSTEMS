import React, { useState } from 'react';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Bot,
  BrainCircuit,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  Film,
  Flame,
  Heart,
  HeartPulse,
  Info,
  Key,
  Layers,
  Lock,
  LogIn,
  LogOut,
  Monitor,
  Pill,
  Play,
  Radio,
  RefreshCw,
  Scan,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  TrendingUp,
  User,
  UserCheck,
  Users,
  Video,
  Zap
} from 'lucide-react';
import { ActiveTab, ThemeColor } from '../Navbar';
import { PatientProfile, UserRecord } from '../../types';
import { storageService } from '../../services/storageService';
import { OnboardingWizard } from '../onboarding/OnboardingWizard';

interface HomeTabProps {
  currentUser: UserRecord;
  setCurrentUser: (user: UserRecord) => void;
  setActiveTab: (tab: ActiveTab) => void;
  onPatientLogin: (patientUser: UserRecord) => void;
  setThemeColor?: (theme: ThemeColor) => void;
  onEmergencyClick?: () => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  currentUser,
  setCurrentUser,
  setActiveTab,
  onPatientLogin,
  setThemeColor,
  onEmergencyClick
}) => {
  // Onboarding Wizard state
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    // Show by default if onboarding is not completed
    return !currentUser.profile.onboardingCompleted;
  });
  const [onboardingSuccessMessage, setOnboardingSuccessMessage] = useState<string | null>(null);

  // Login modal or inline credentials state
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [selectedFormRole, setSelectedFormRole] = useState<'patient' | 'doctor' | 'admin' | null>(null);
  const [emailInput, setEmailInput] = useState('alex.johnson@health.org');
  const [passwordInput, setPasswordInput] = useState('••••••••••••');
  const [customName, setCustomName] = useState('Alex Johnson');
  const [ageInput, setAgeInput] = useState('38');
  const [symptomsInput, setSymptomsInput] = useState('');
  const [loginSuccessMessage, setLoginSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeWorkflowStep, setActiveWorkflowStep] = useState<number>(1);

  // Pre-configured Demo Accounts
  const demoAccounts = [
    {
      role: 'patient' as const,
      name: 'Alex Johnson',
      email: 'alex.johnson@health.org',
      title: 'Patient Telemetry Profile',
      specialty: 'Active Case #PT-9042',
      description: '38 yrs male · Penicillin allergy · Active symptom logs, vital tracking & daily medication calendar.',
      targetTab: 'dashboard' as ActiveTab,
      theme: 'teal' as ThemeColor
    },
    {
      role: 'doctor' as const,
      name: 'Dr. Sarah Mitchell, MD',
      email: 'dr.mitchell@hospital.org',
      title: 'Attending Physician (MD)',
      specialty: 'Internal Medicine & Cardiology',
      description: 'Attending physician workstation · Live incoming patient consult triage, BP/HR charts & electronic Rx dispenser.',
      targetTab: 'doctor-portal' as ActiveTab,
      theme: 'doctor-blue' as ThemeColor
    },
    {
      role: 'admin' as const,
      name: 'Admin Supervisor',
      email: 'admin@medassist.internal',
      title: 'Clinical Operations Director',
      specialty: 'Hospital Systems Administration',
      description: 'System audit logs, ML model benchmarks, Kaggle dataset explorer & security permissions.',
      targetTab: 'admin-portal' as ActiveTab,
      theme: 'slate' as ThemeColor
    }
  ];

  // Handle 1-click Quick Login
  const handleQuickLogin = (account: typeof demoAccounts[0]) => {
    setIsSubmitting(true);
    setLoginSuccessMessage(`Authenticating as ${account.name} (${account.title})...`);

    setTimeout(() => {
      const updatedUser: UserRecord = {
        ...currentUser,
        id: account.role === 'patient' ? 'usr-alex-patient' : account.role === 'doctor' ? 'usr-doctor-mitchell' : 'usr-admin-supervisor',
        role: account.role,
        name: account.name,
        email: account.email
      };

      if (account.role === 'patient') {
        onPatientLogin(updatedUser);
      } else {
        storageService.saveUserProfile(updatedUser);
        setCurrentUser(updatedUser);
      }

      if (setThemeColor) {
        setThemeColor(account.theme);
      }

      setIsSubmitting(false);
      setLoginSuccessMessage(`Authenticated as ${account.name}. Redirecting to ${account.title}...`);

      setTimeout(() => {
        setLoginSuccessMessage(null);
        setLoginModalOpen(false);
        setActiveTab(account.targetTab);
      }, 600);
    }, 350);
  };

  // Handle Form Submit
  const handleFormLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFormRole) return;
    setIsSubmitting(true);

    const userName = customName.trim() || (selectedFormRole === 'doctor' ? 'Dr. Sarah Mitchell, MD' : selectedFormRole === 'admin' ? 'System Administrator' : 'Patient User');
    setLoginSuccessMessage(`Verifying credentials for ${emailInput}...`);

    setTimeout(() => {
      const updatedUser: UserRecord = {
        ...currentUser,
        id: `usr-${Date.now()}`,
        role: selectedFormRole,
        name: userName,
        email: emailInput || `${userName.toLowerCase().replace(/\s+/g, '.')}@health.org`,
        profile: selectedFormRole === 'patient' ? {
          ...currentUser.profile,
          name: userName,
          age: parseInt(ageInput, 10) || 38,
          activeSymptoms: symptomsInput ? symptomsInput.split(',').map(s => s.trim()) : []
        } : currentUser.profile
      };

      if (selectedFormRole === 'patient') {
        onPatientLogin(updatedUser);
      } else {
        storageService.saveUserProfile(updatedUser);
        setCurrentUser(updatedUser);
      }

      if (setThemeColor) {
        setThemeColor(selectedFormRole === 'doctor' ? 'doctor-blue' : selectedFormRole === 'admin' ? 'slate' : 'teal');
      }

      setIsSubmitting(false);
      setLoginSuccessMessage(`Authenticated successfully! Welcome, ${userName}.`);

      setTimeout(() => {
        setLoginSuccessMessage(null);
        setLoginModalOpen(false);
        setActiveTab(selectedFormRole === 'doctor' ? 'doctor-portal' : selectedFormRole === 'admin' ? 'admin-portal' : 'dashboard');
        setSelectedFormRole(null);
      }, 600);
    }, 400);
  };

  const handleSelectRoleForForm = (role: 'patient' | 'doctor' | 'admin') => {
    setSelectedFormRole(role);
    if (role === 'patient') {
      setCustomName('Alex Johnson');
      setEmailInput('alex.johnson@health.org');
      setAgeInput('38');
      setSymptomsInput('');
    } else if (role === 'doctor') {
      setCustomName('Dr. Sarah Mitchell, MD');
      setEmailInput('dr.mitchell@hospital.org');
    } else {
      setCustomName('Admin Supervisor');
      setEmailInput('admin@medassist.internal');
    }
    setPasswordInput('••••••••••••');
  };

  const interactiveWorkflowSteps = [
    {
      step: 1,
      title: 'Biometric & Symptom Intake',
      subtitle: 'Patient reports clinical observations',
      details: 'Select from 132 validated symptom markers or capture longitudinal vitals (BP, glucose, heart rate) with timestamped records.',
      target: 'symptom-checker' as ActiveTab,
      actionText: 'Try Symptom Intake'
    },
    {
      step: 2,
      title: 'Multi-Model ML Classification',
      subtitle: 'Ensemble inference across 4 algorithms',
      details: 'Random Forest (97.2%), Decision Tree (95.1%), Naive Bayes (93.8%), and KNN evaluate probabilities across 41 ICD-10 conditions.',
      target: 'ml-studio' as ActiveTab,
      actionText: 'View Algorithm Weights'
    },
    {
      step: 3,
      title: 'Pharmacotherapy & Safety Collision',
      subtitle: 'Drug-drug conflict prevention',
      details: 'Instant pairwise interaction scanning across known patient allergies, drug classes, renal clearance, and black-box precautions.',
      target: 'medicines' as ActiveTab,
      actionText: 'Open Drug Formulary'
    },
    {
      step: 4,
      title: 'Physician E-Prescribing Station',
      subtitle: 'Attending MD review & authorization',
      details: 'Dr. Sarah Mitchell, MD reviews diagnostic telemetry, confirms evidence-based dosage protocols, and signs electronic prescriptions.',
      target: 'doctor-portal' as ActiveTab,
      actionText: 'Open Doctor Workstation'
    },
    {
      step: 5,
      title: 'Veo Medical Motion Animation',
      subtitle: 'Visualizing anatomical & cellular dynamics',
      details: 'Convert diagnostic scans or diagrams into 16:9 or 9:16 video simulations using Google Veo (veo-3.1-fast-generate-preview).',
      target: 'animate-video' as ActiveTab,
      actionText: 'Open Veo Studio'
    }
  ];

  const handleCompleteOnboarding = (updatedProfile: PatientProfile) => {
    const updatedUser: UserRecord = {
      ...currentUser,
      name: updatedProfile.name || currentUser.name,
      profile: updatedProfile
    };
    setCurrentUser(updatedUser);
    storageService.saveUserProfile(updatedUser);
    setShowOnboarding(false);
    setOnboardingSuccessMessage(
      `Clinical health profile, chronic conditions & therapeutic goals saved successfully for ${updatedProfile.name}!`
    );

    // Notify doctor workstation of newly onboarded patient data
    storageService.notifyDoctorOfPatientLogin(updatedUser);

    setTimeout(() => {
      setOnboardingSuccessMessage(null);
    }, 5000);
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-start w-full px-4 pb-20 pt-4 sm:pt-8 animate-in fade-in duration-500">
      {/* 1. Hero Presentation Section */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-linear-to-br from-slate-900 via-slate-800 to-slate-950 text-white p-10 sm:p-16 md:p-24 shadow-2xl border border-slate-800/60 w-full max-w-7xl text-center flex flex-col items-center">
        {/* Abstract Background Orbs */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-teal-500/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 to-transparent pointer-events-none opacity-50" />

        <div className="relative z-10 space-y-8 flex flex-col items-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm text-teal-300 text-sm font-semibold tracking-wide mb-2 shadow-2xs">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span>Next-Generation Medical Intelligence</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-linear-to-r from-white via-slate-200 to-slate-400 leading-tight pb-2">
            Clinical Decision Support <br className="hidden md:block"/> & Pharmacotherapy
          </h1>

          <p className="text-lg sm:text-2xl text-slate-300/90 leading-relaxed max-w-3xl font-light">
            A comprehensive, multi-model AI platform designed to bridge the gap between patient symptoms, advanced diagnostics, and physician prescribing.
          </p>

          <div className="pt-10 flex flex-col sm:flex-row items-center gap-6">
            <button
              onClick={() => setLoginModalOpen(true)}
              className="group px-8 py-4 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-lg flex items-center gap-3 shadow-[0_0_40px_-10px_rgba(20,184,166,0.5)] transition-all hover:scale-105 hover:shadow-[0_0_60px_-15px_rgba(20,184,166,0.7)] cursor-pointer"
            >
              <LogIn className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
              <span>Secure Login Portal</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
            <div className="text-slate-400 text-sm font-medium flex items-center gap-2 bg-slate-800/50 px-4 py-3 rounded-xl border border-slate-700/50 backdrop-blur-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>HIPAA Compliant & End-to-End Encrypted</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Features Grid */}
      <section className="w-full max-w-7xl mt-20 sm:mt-28 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Enterprise Clinical Workflows</h2>
          <p className="text-slate-500 mt-4 text-lg max-w-2xl mx-auto">Integrated modules powering the future of precision healthcare, diagnostic analysis, and patient safety.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {interactiveWorkflowSteps.map((step, idx) => (
            <div key={idx} className="group relative bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 hover:border-teal-200 hover:shadow-2xl hover:shadow-teal-900/10 transition-all duration-300 hover:-translate-y-1.5 flex flex-col">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="text-8xl font-black">{step.step}</span>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300 shadow-sm shrink-0">
                {step.step === 1 && <HeartPulse className="w-7 h-7" />}
                {step.step === 2 && <BrainCircuit className="w-7 h-7" />}
                {step.step === 3 && <Pill className="w-7 h-7" />}
                {step.step === 4 && <Stethoscope className="w-7 h-7" />}
                {step.step === 5 && <Video className="w-7 h-7" />}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
              <div className="text-sm font-semibold text-teal-600 mb-4">{step.subtitle}</div>
              <p className="text-slate-600 leading-relaxed text-sm mb-6 flex-1">{step.details}</p>
            </div>
          ))}
          {/* Fill the 6th spot with a decorative card */}
          <div className="group relative rounded-3xl p-8 bg-linear-to-br from-teal-500 to-blue-600 shadow-xl shadow-teal-900/20 text-white flex flex-col justify-between overflow-hidden transition-all duration-300 hover:-translate-y-1.5">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl -mt-20 -mr-20 pointer-events-none" />
            <div>
              <div className="w-14 h-14 rounded-2xl bg-white/20 text-white flex items-center justify-center mb-6 backdrop-blur-md shadow-sm">
                <Activity className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-2">Ready to Transform Care?</h3>
              <p className="text-white/90 leading-relaxed text-sm mb-6">Join leading institutions utilizing our intelligent healthcare platform.</p>
            </div>
            <button
              onClick={() => setLoginModalOpen(true)}
              className="mt-auto px-6 py-3 rounded-xl bg-white text-teal-700 font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors cursor-pointer shadow-sm"
            >
              <Lock className="w-4 h-4" />
              <span>Access Secure System</span>
            </button>
          </div>
        </div>
      </section>

      {/* Login Dialog Modal (Custom credentials) */}
      {loginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
                  <LogIn className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Sign In to MedAssist</h3>
                  <p className="text-xs text-slate-500">Select your account role</p>
                </div>
              </div>

              <button
                onClick={() => setLoginModalOpen(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer text-base font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {!selectedFormRole ? (
                <div className="grid grid-cols-1 gap-4">
                  {demoAccounts.map(acc => (
                    <button
                      key={acc.role}
                      type="button"
                      onClick={() => handleSelectRoleForForm(acc.role)}
                      className="p-4 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 flex items-center gap-4 transition-all cursor-pointer text-left"
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                          acc.role === 'doctor' ? 'bg-blue-100 text-blue-700' : 
                          acc.role === 'admin' ? 'bg-amber-100 text-amber-700' : 
                          'bg-teal-100 text-teal-700'
                      }`}>
                        {acc.role === 'doctor' ? <Stethoscope className="w-6 h-6" /> : 
                         acc.role === 'admin' ? <ShieldCheck className="w-6 h-6" /> : 
                         <User className="w-6 h-6" />}
                      </div>
                      <div>
                        <div className="font-bold text-lg text-slate-900 capitalize">{acc.role} Login</div>
                        <div className="text-sm text-slate-500">Sign in to your {acc.role} account</div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <form onSubmit={handleFormLogin} className="space-y-4">
                  {selectedFormRole === 'patient' && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                        <input
                          type="text"
                          required
                          value={customName}
                          onChange={(e) => setCustomName(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Age</label>
                        <input
                          type="number"
                          required
                          value={ageInput}
                          onChange={(e) => setAgeInput(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Current Symptoms (comma separated)</label>
                        <input
                          type="text"
                          placeholder="e.g., headache, fever"
                          value={symptomsInput}
                          onChange={(e) => setSymptomsInput(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                    </>
                  )}
                  {(selectedFormRole === 'doctor' || selectedFormRole === 'admin') && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">{selectedFormRole === 'doctor' ? 'Doctor ID / Name' : 'Admin ID / Name'}</label>
                      <input
                        type="text"
                        required
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                    <input
                      type="password"
                      required
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  {loginSuccessMessage && (
                    <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium animate-pulse border border-emerald-200">
                      {loginSuccessMessage}
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setSelectedFormRole(null)}
                      className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`px-6 py-2 rounded-lg font-bold text-white transition-all shadow-md cursor-pointer ${
                        selectedFormRole === 'doctor' ? 'bg-blue-600 hover:bg-blue-500' :
                        selectedFormRole === 'admin' ? 'bg-amber-600 hover:bg-amber-500' :
                        'bg-teal-600 hover:bg-teal-500'
                      }`}
                    >
                      {isSubmitting ? 'Authenticating...' : 'Sign In'}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {!selectedFormRole && (
              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setLoginModalOpen(false)}
                    className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    Cancel
                  </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
