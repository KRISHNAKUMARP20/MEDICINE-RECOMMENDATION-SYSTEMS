import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  HeartPulse,
  LogIn,
  Radio,
  Send,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  User,
  UserPlus,
  X
} from 'lucide-react';
import { UserRecord } from '../../types';

interface PatientLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserRecord;
  onPatientLogin: (patientUser: UserRecord) => void;
}

export const PatientLoginModal: React.FC<PatientLoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onPatientLogin
}) => {
  const [tab, setTab] = useState<'quick' | 'custom'>('quick');

  // Custom patient form
  const [name, setName] = useState('');
  const [age, setAge] = useState('32');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('female');
  const [allergies, setAllergies] = useState('None');
  const [chiefComplaint, setChiefComplaint] = useState('Fever and body aches');

  if (!isOpen) return null;

  const samplePatients: Array<{
    id: string;
    name: string;
    email: string;
    age: number;
    gender: 'male' | 'female' | 'other';
    allergies: string[];
    condition: string;
    status: string;
  }> = [
    {
      id: 'patient-alex-1',
      name: 'Alex Johnson',
      email: 'alex.johnson@health.org',
      age: 38,
      gender: 'male',
      allergies: ['Penicillin'],
      condition: 'Acute Malarial Fever & Chills',
      status: 'Needs Doctor Review'
    },
    {
      id: 'patient-emily-2',
      name: 'Emily Davis',
      email: 'emily.davis@health.org',
      age: 45,
      gender: 'female',
      allergies: ['Sulfa drugs'],
      condition: 'Essential Hypertension & Headaches',
      status: 'Awaiting Medication Refill'
    },
    {
      id: 'patient-marcus-3',
      name: 'Marcus Vance',
      email: 'marcus.v@health.org',
      age: 29,
      gender: 'male',
      allergies: ['Aspirin'],
      condition: 'Persistent Bronchial Cough',
      status: 'New Intake'
    },
    {
      id: 'patient-chloe-4',
      name: 'Chloe Bennett',
      email: 'chloe.b@health.org',
      age: 52,
      gender: 'female',
      allergies: ['NSAIDs'],
      condition: 'Type 2 Diabetes Screening',
      status: 'Follow-up Consultation'
    }
  ];

  const handleSelectQuickPatient = (p: typeof samplePatients[0]) => {
    const userRec: UserRecord = {
      id: p.id,
      name: p.name,
      email: p.email,
      role: 'patient',
      createdAt: new Date().toISOString(),
      profile: {
        name: p.name,
        age: p.age,
        gender: p.gender,
        knownAllergies: p.allergies,
        currentMedications: []
      }
    };
    onPatientLogin(userRec);
    onClose();
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const userRec: UserRecord = {
      id: `usr-patient-${Date.now()}`,
      name: name.trim(),
      email: `${name.toLowerCase().replace(/\s+/g, '.') || 'patient'}@patientcare.org`,
      role: 'patient',
      createdAt: new Date().toISOString(),
      profile: {
        name: name.trim(),
        age: parseInt(age) || 30,
        gender: gender,
        knownAllergies: allergies.split(',').map(s => s.trim()).filter(Boolean),
        currentMedications: []
      }
    };
    onPatientLogin(userRec);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-linear-to-r from-emerald-700 via-teal-700 to-cyan-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center shadow-inner">
              <LogIn className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg">Patient Portal Sign In</h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30 flex items-center gap-1">
                  <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-300" />
                  Auto-Alert Doctor
                </span>
              </div>
              <p className="text-xs text-emerald-100 mt-0.5">
                Logging in automatically dispatches a real-time notification to the Physician Station
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
          <button
            onClick={() => setTab('quick')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              tab === 'quick'
                ? 'bg-white text-emerald-800 shadow-xs border border-emerald-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Select Registered Patient</span>
          </button>
          <button
            onClick={() => setTab('custom')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              tab === 'custom'
                ? 'bg-white text-emerald-800 shadow-xs border border-emerald-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Sign In New Patient</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {tab === 'quick' ? (
            <div className="space-y-2.5">
              <p className="text-xs text-slate-500 font-medium">
                Choose a patient profile to log in. This will immediately transmit an alert to Dr. Sarah Mitchell's workstation:
              </p>

              {samplePatients.map(p => {
                const isSelected = currentUser.id === p.id && currentUser.role === 'patient';
                return (
                  <div
                    key={p.id}
                    onClick={() => handleSelectQuickPatient(p)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-300 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-black flex items-center justify-center text-sm shadow-2xs">
                        {p.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{p.name}</span>
                          <span className="text-xs text-slate-500">
                            ({p.age}yo, {p.gender})
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">{p.condition}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-semibold text-slate-400">
                            Allergies: {p.allergies.join(', ') || 'None'}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600">
                            {p.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-2xs cursor-pointer shrink-0"
                    >
                      <span>Log In</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <form onSubmit={handleCustomLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Patient Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rachel Adams"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="115"
                    required
                    value={age}
                    onChange={e => setAge(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Known Drug Allergies
                </label>
                <input
                  type="text"
                  placeholder="e.g. Penicillin, Sulfa, None"
                  value={allergies}
                  onChange={e => setAllergies(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Chief Complaint / Reason for Visit
                </label>
                <input
                  type="text"
                  placeholder="e.g. High fever, migraine, sore throat"
                  value={chiefComplaint}
                  onChange={e => setChiefComplaint(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In Patient & Trigger Doctor Alert</span>
                </button>
              </div>
            </form>
          )}

          {/* Doctor Alert Info Notice */}
          <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
            <Stethoscope className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Hospital Direct Notification Link</span>
              When you log in, MedAssist connects directly to Dr. Sarah Mitchell's workstation pager.
              The doctor can review your symptoms and prescribe medications immediately.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
