import React, { useState } from 'react';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Heart,
  HeartPulse,
  Info,
  Pill,
  Plus,
  Scale,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Target,
  User,
  X,
  Zap
} from 'lucide-react';
import { PatientProfile, UserRecord } from '../../types';

interface OnboardingWizardProps {
  currentUser: UserRecord;
  onComplete: (updatedProfile: PatientProfile) => void;
  onDismiss?: () => void;
  isModal?: boolean;
}

const COMMON_CHRONIC_CONDITIONS = [
  { id: 'hypertension', label: 'Hypertension (High Blood Pressure)', category: 'Cardiovascular' },
  { id: 'type2_diabetes', label: 'Type 2 Diabetes Mellitus', category: 'Endocrine' },
  { id: 'hyperlipidemia', label: 'Hyperlipidemia (High Cholesterol)', category: 'Cardiovascular' },
  { id: 'asthma', label: 'Bronchial Asthma / COPD', category: 'Respiratory' },
  { id: 'coronary_disease', label: 'Coronary Artery Disease', category: 'Cardiovascular' },
  { id: 'gerd', label: 'GERD (Acid Reflux)', category: 'Gastrointestinal' },
  { id: 'kidney_disease', label: 'Chronic Kidney Disease', category: 'Renal' },
  { id: 'thyroid_disorder', label: 'Hypothyroidism / Thyroid Disorder', category: 'Endocrine' },
  { id: 'osteoarthritis', label: 'Osteoarthritis / Chronic Pain', category: 'Musculoskeletal' },
  { id: 'migraine', label: 'Chronic Migraine / Cephalea', category: 'Neurological' },
];

const COMMON_ALLERGIES = [
  'Penicillin',
  'Amoxicillin',
  'Sulfa Antibiotics',
  'Aspirin / NSAIDs',
  'Cephalosporins',
  'Latex',
  'Peanuts',
  'Shellfish',
  'No Known Drug Allergies (NKDA)'
];

const HEALTH_GOALS_OPTIONS = [
  {
    id: 'goal-bp',
    title: 'Blood Pressure Control',
    target: 'Maintain resting BP < 120/80 mmHg',
    icon: HeartPulse,
    category: 'Cardiology'
  },
  {
    id: 'goal-sugar',
    title: 'Glycemic Optimization',
    target: 'Fasting glucose < 100 mg/dL, HbA1c < 7.0%',
    icon: Activity,
    category: 'Endocrine'
  },
  {
    id: 'goal-adherence',
    title: 'Medication Adherence',
    target: 'Achieve ≥ 95% on-time prescription compliance',
    icon: Pill,
    category: 'Pharmacotherapy'
  },
  {
    id: 'goal-weight',
    title: 'Cardiovascular Fitness & Weight',
    target: 'Target normal BMI (18.5 - 24.9) and regular cardio',
    icon: Scale,
    category: 'Lifestyle'
  },
  {
    id: 'goal-respiratory',
    title: 'Respiratory Health',
    target: 'Minimize bronchospasm & environmental flare-ups',
    icon: Sparkles,
    category: 'Pulmonology'
  },
  {
    id: 'goal-stress',
    title: 'Stress & Sleep Quality',
    target: 'Improve restful recovery (7-8 hours/night)',
    icon: Zap,
    category: 'Wellness'
  }
];

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  currentUser,
  onComplete,
  onDismiss,
  isModal = false
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Profile Form State
  const [name, setName] = useState(currentUser.profile.name || currentUser.name || '');
  const [age, setAge] = useState<number>(currentUser.profile.age || 38);
  const [gender, setGender] = useState<'male' | 'female' | 'other'>(currentUser.profile.gender || 'male');
  const [heightCm, setHeightCm] = useState<number>(currentUser.profile.heightCm || 175);
  const [weightKg, setWeightKg] = useState<number>(currentUser.profile.weightKg || 72);
  const [bloodType, setBloodType] = useState<string>(currentUser.profile.bloodType || 'O+');
  const [isPregnant, setIsPregnant] = useState<boolean>(currentUser.profile.isPregnant || false);
  const [hasRenalDisease, setHasRenalDisease] = useState<boolean>(currentUser.profile.hasRenalDisease || false);
  const [hasHepaticDisease, setHasHepaticDisease] = useState<boolean>(currentUser.profile.hasHepaticDisease || false);

  // Conditions & Allergies
  const [chronicConditions, setChronicConditions] = useState<string[]>(
    currentUser.profile.chronicConditions || ['Hypertension (High Blood Pressure)']
  );
  const [customConditionInput, setCustomConditionInput] = useState('');
  const [knownAllergies, setKnownAllergies] = useState<string[]>(
    currentUser.profile.knownAllergies || ['Penicillin']
  );
  const [customAllergyInput, setCustomAllergyInput] = useState('');

  // Health Goals
  const [healthGoals, setHealthGoals] = useState<string[]>(
    currentUser.profile.healthGoals || [
      'Maintain resting BP < 120/80 mmHg',
      'Achieve ≥ 95% on-time prescription compliance'
    ]
  );
  const [customGoalInput, setCustomGoalInput] = useState('');

  // Emergency Contact
  const [emergencyContactName, setEmergencyContactName] = useState(currentUser.profile.emergencyContactName || '');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(currentUser.profile.emergencyContactPhone || '');

  // Calculate BMI
  const heightM = heightCm / 100;
  const bmi = heightM > 0 ? (weightKg / (heightM * heightM)).toFixed(1) : '23.5';
  const numBmi = parseFloat(bmi);
  const bmiStatus =
    numBmi < 18.5
      ? { label: 'Underweight', color: 'text-sky-700 bg-sky-50 border-sky-200' }
      : numBmi <= 24.9
      ? { label: 'Normal Weight (Optimal)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' }
      : numBmi <= 29.9
      ? { label: 'Overweight (Borderline)', color: 'text-amber-700 bg-amber-50 border-amber-200' }
      : { label: 'Obese (Elevated Risk)', color: 'text-rose-700 bg-rose-50 border-rose-200' };

  // Toggle selection helpers
  const toggleCondition = (label: string) => {
    setChronicConditions(prev =>
      prev.includes(label) ? prev.filter(c => c !== label) : [...prev, label]
    );
  };

  const handleAddCustomCondition = () => {
    const val = customConditionInput.trim();
    if (val && !chronicConditions.includes(val)) {
      setChronicConditions(prev => [...prev, val]);
      setCustomConditionInput('');
    }
  };

  const toggleAllergy = (allergy: string) => {
    if (allergy.includes('NKDA') || allergy.includes('No Known')) {
      setKnownAllergies([allergy]);
      return;
    }
    setKnownAllergies(prev => {
      const filtered = prev.filter(a => !a.includes('NKDA') && !a.includes('No Known'));
      return filtered.includes(allergy)
        ? filtered.filter(a => a !== allergy)
        : [...filtered, allergy];
    });
  };

  const handleAddCustomAllergy = () => {
    const val = customAllergyInput.trim();
    if (val && !knownAllergies.includes(val)) {
      setKnownAllergies(prev => [...prev.filter(a => !a.includes('NKDA')), val]);
      setCustomAllergyInput('');
    }
  };

  const toggleGoal = (goalTarget: string) => {
    setHealthGoals(prev =>
      prev.includes(goalTarget) ? prev.filter(g => g !== goalTarget) : [...prev, goalTarget]
    );
  };

  const handleAddCustomGoal = () => {
    const val = customGoalInput.trim();
    if (val && !healthGoals.includes(val)) {
      setHealthGoals(prev => [...prev, val]);
      setCustomGoalInput('');
    }
  };

  // Submit complete onboarding
  const handleFinalSubmit = () => {
    const updatedProfile: PatientProfile = {
      ...currentUser.profile,
      name: name.trim() || currentUser.profile.name,
      age: Math.max(1, Math.min(120, age)),
      gender,
      heightCm,
      weightKg,
      bloodType,
      isPregnant: gender === 'female' ? isPregnant : false,
      hasRenalDisease,
      hasHepaticDisease,
      knownAllergies,
      chronicConditions,
      healthGoals,
      emergencyContactName: emergencyContactName.trim() || undefined,
      emergencyContactPhone: emergencyContactPhone.trim() || undefined,
      onboardingCompleted: true,
      onboardingCompletedAt: new Date().toISOString()
    };

    onComplete(updatedProfile);
  };

  const stepsMeta = [
    { num: 1, title: 'Demographics & Vitals', desc: 'Biometric baselines' },
    { num: 2, title: 'Chronic Conditions', desc: 'Medical history & allergies' },
    { num: 3, title: 'Health Goals', desc: 'Clinical therapeutic targets' },
    { num: 4, title: 'Review & Verify', desc: 'Confirm clinical intake' },
  ];

  const content = (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden text-slate-800 transition-all">
      {/* Header Bar */}
      <div className="bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 sm:p-7 border-b border-slate-800 relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-300 tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-teal-400" />
              <span>Patient Clinical Intake Wizard</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-300">Step {currentStep} of 4</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Personalize Your Medical Profile &amp; Care Goals
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
              Initialize your health baselines so MedAssist can calibrate drug interaction warnings, ESI triage severity, and physician consultation telemetry.
            </p>
          </div>

          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors self-start sm:self-center cursor-pointer"
              title="Close or complete later"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Multi-Step Segmented Bar */}
        <div className="mt-6 grid grid-cols-4 gap-2 pt-2 border-t border-slate-800/80">
          {stepsMeta.map((s) => (
            <button
              key={s.num}
              type="button"
              onClick={() => setCurrentStep(s.num as any)}
              className={`text-left group cursor-pointer transition-all ${
                currentStep === s.num ? 'opacity-100' : 'opacity-60 hover:opacity-90'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    currentStep === s.num
                      ? 'bg-teal-400 text-slate-950 ring-2 ring-teal-400/40'
                      : currentStep > s.num
                      ? 'bg-teal-700 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {currentStep > s.num ? <Check className="w-3 h-3" /> : s.num}
                </span>
                <span className="text-xs font-semibold text-white hidden md:inline truncate">
                  {s.title}
                </span>
              </div>
              <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    currentStep >= s.num ? 'bg-teal-400' : 'bg-transparent'
                  }`}
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Step Body Content */}
      <div className="p-6 sm:p-8 space-y-6">
        {/* ================= STEP 1: DEMOGRAPHICS & VITALS ================= */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                1. Patient Demographics &amp; Biometric Baselines
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Required for pediatric vs adult dosing protocols, creatinine clearance, and hemodynamic safety limits.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Alex Johnson"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 outline-hidden bg-white"
                />
              </div>

              {/* Age */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Age (Years)
                </label>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value, 10) || 1)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 outline-hidden bg-white"
                />
              </div>

              {/* Biological Sex */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Biological Sex
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 outline-hidden bg-white cursor-pointer"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other / Non-Binary</option>
                </select>
              </div>

              {/* Height */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Height</span>
                  <span className="text-[11px] font-normal text-slate-500 font-mono">{heightCm} cm</span>
                </label>
                <input
                  type="number"
                  min={50}
                  max={250}
                  value={heightCm}
                  onChange={(e) => setHeightCm(parseInt(e.target.value, 10) || 170)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 outline-hidden bg-white"
                />
              </div>

              {/* Weight */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Weight</span>
                  <span className="text-[11px] font-normal text-slate-500 font-mono">{weightKg} kg</span>
                </label>
                <input
                  type="number"
                  min={20}
                  max={300}
                  value={weightKg}
                  onChange={(e) => setWeightKg(parseInt(e.target.value, 10) || 70)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 outline-hidden bg-white"
                />
              </div>

              {/* Blood Type */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Blood Group
                </label>
                <select
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 outline-hidden bg-white cursor-pointer"
                >
                  {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'Unknown'].map((bt) => (
                    <option key={bt} value={bt}>
                      {bt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Calculated BMI Badge Strip */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <span>Body Mass Index (BMI):</span>
                    <span className="font-mono text-base font-black text-slate-900">{bmi}</span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${bmiStatus.color}`}>
                      {bmiStatus.label}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Height: {heightCm} cm · Weight: {weightKg} kg · Standard Clinical Equation
                  </div>
                </div>
              </div>

              {gender === 'female' && (
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer p-2 rounded-lg bg-white border border-slate-200">
                  <input
                    type="checkbox"
                    checked={isPregnant}
                    onChange={(e) => setIsPregnant(e.target.checked)}
                    className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
                  />
                  <span>Currently Pregnant (Trimester contraindications apply)</span>
                </label>
              )}
            </div>
          </div>
        )}

        {/* ================= STEP 2: CHRONIC CONDITIONS & ALLERGIES ================= */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                2. Chronic Conditions &amp; Drug Allergies
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Our rule engine checks your conditions against the 132-symptom Kaggle ML database and alerts Dr. Mitchell to contraindicated therapies.
              </p>
            </div>

            {/* Chronic Conditions Multi-Select */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-800 block">
                Select Pre-Existing Chronic Conditions:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {COMMON_CHRONIC_CONDITIONS.map((cond) => {
                  const isSelected = chronicConditions.includes(cond.label);
                  return (
                    <button
                      key={cond.id}
                      type="button"
                      onClick={() => toggleCondition(cond.label)}
                      className={`p-3 rounded-xl border text-left flex items-start justify-between gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-teal-600 bg-teal-50/50 text-teal-950 font-bold ring-1 ring-teal-500'
                          : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700 font-medium'
                      }`}
                    >
                      <div>
                        <div className="text-xs">{cond.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{cond.category}</div>
                      </div>
                      <span
                        className={`w-4 h-4 rounded flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected ? 'bg-teal-600 text-white' : 'border border-slate-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Add Custom Condition */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={customConditionInput}
                  onChange={(e) => setCustomConditionInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomCondition())}
                  placeholder="Add another chronic condition (e.g., Atrial Fibrillation, Psoriasis)..."
                  className="flex-1 text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
                <button
                  type="button"
                  onClick={handleAddCustomCondition}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Known Drug Allergies */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <span>Known Drug Allergies (Prevents Severe Adverse Drug Reactions):</span>
              </label>

              <div className="flex flex-wrap gap-2">
                {COMMON_ALLERGIES.map((allergy) => {
                  const isSelected = knownAllergies.includes(allergy);
                  return (
                    <button
                      key={allergy}
                      type="button"
                      onClick={() => toggleAllergy(allergy)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? allergy.includes('NKDA')
                            ? 'bg-slate-800 text-white border-slate-800'
                            : 'bg-rose-50 text-rose-900 border-rose-300 ring-1 ring-rose-400'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {allergy}
                    </button>
                  );
                })}
              </div>

              {/* Add Custom Allergy */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={customAllergyInput}
                  onChange={(e) => setCustomAllergyInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomAllergy())}
                  placeholder="Add specific medication allergy (e.g., Codeine, Ciprofloxacin)..."
                  className="flex-1 text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
                <button
                  type="button"
                  onClick={handleAddCustomAllergy}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Allergy</span>
                </button>
              </div>
            </div>

            {/* Organ Impairment Cautions */}
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2 text-xs">
              <span className="font-bold text-amber-900 block">
                Organ Impairment Precautions:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center gap-2 text-amber-950 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasRenalDisease}
                    onChange={(e) => setHasRenalDisease(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                  />
                  <span>Renal Disease / Reduced eGFR (Dose titration flag)</span>
                </label>
                <label className="flex items-center gap-2 text-amber-950 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasHepaticDisease}
                    onChange={(e) => setHasHepaticDisease(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                  />
                  <span>Hepatic Disease / Elevated ALT/AST (Liver enzyme caution)</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 3: HEALTH GOALS ================= */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                3. Health Goals &amp; Therapeutic Targets
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Select your primary clinical priorities. These targets calibrate your daily telemetry graphs and adherence alerts.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {HEALTH_GOALS_OPTIONS.map((g) => {
                const Icon = g.icon;
                const isSelected = healthGoals.includes(g.target);
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => toggleGoal(g.target)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3.5 ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/50 text-teal-950 font-bold ring-2 ring-teal-500/20'
                        : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-700 font-medium'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-900">{g.title}</div>
                      <div className="text-xs text-slate-600 mt-0.5">{g.target}</div>
                      <div className="text-[10px] text-teal-700 font-medium mt-1 uppercase tracking-wide">
                        {g.category}
                      </div>
                    </div>
                    <span
                      className={`w-4 h-4 rounded flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected ? 'bg-teal-600 text-white' : 'border border-slate-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom Goal Input */}
            <div className="space-y-1 pt-1">
              <label className="text-xs font-bold text-slate-800 block">
                Add Custom Health Objective:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customGoalInput}
                  onChange={(e) => setCustomGoalInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomGoal())}
                  placeholder="e.g., Lower resting heart rate below 70 bpm, Walk 8,000 steps daily..."
                  className="flex-1 text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
                <button
                  type="button"
                  onClick={handleAddCustomGoal}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Goal</span>
                </button>
              </div>
            </div>

            {/* Emergency Contact Information (Optional) */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Shield className="w-4 h-4 text-teal-600" />
                <span>Designated Emergency Contact (Optional for Critical Triage):</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={emergencyContactName}
                  onChange={(e) => setEmergencyContactName(e.target.value)}
                  placeholder="Contact Name (e.g., Jane Johnson)"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
                <input
                  type="tel"
                  value={emergencyContactPhone}
                  onChange={(e) => setEmergencyContactPhone(e.target.value)}
                  placeholder="Phone Number (e.g., +1 555-0192)"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 4: REVIEW & VERIFY ================= */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                4. Review &amp; Initialize Clinical Profile
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Verify your health information. Upon confirmation, Dr. Sarah Mitchell's workstation will receive your active medical profile.
              </p>
            </div>

            {/* Profile Review Card */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-4 text-xs">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-teal-600 text-white font-black flex items-center justify-center text-sm shadow-2xs">
                    {name ? name.charAt(0) : 'P'}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900">{name}</div>
                    <div className="text-[11px] text-slate-500">
                      {age} yrs · {gender} · Blood: <strong className="text-slate-800">{bloodType}</strong> · BMI: <strong className="text-slate-800">{bmi}</strong> ({bmiStatus.label})
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-xs font-semibold text-teal-700 hover:underline cursor-pointer"
                >
                  Edit Demographics
                </button>
              </div>

              {/* Conditions & Allergies */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 uppercase tracking-wide text-[10px]">
                    Active Chronic Conditions ({chronicConditions.length}):
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="text-[11px] font-semibold text-teal-700 hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
                {chronicConditions.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {chronicConditions.map((c, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-800 text-[11px] font-medium">
                        {c}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-400 italic">No chronic conditions indicated</span>
                )}
              </div>

              {/* Known Allergies */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 uppercase tracking-wide text-[10px]">
                    Documented Allergies ({knownAllergies.length}):
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="text-[11px] font-semibold text-teal-700 hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {knownAllergies.map((a, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-md bg-rose-50 border border-rose-200 text-rose-900 text-[11px] font-bold">
                      ⚠️ {a}
                    </span>
                  ))}
                </div>
              </div>

              {/* Selected Health Goals */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 uppercase tracking-wide text-[10px]">
                    Therapeutic Health Goals ({healthGoals.length}):
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="text-[11px] font-semibold text-teal-700 hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
                <ul className="space-y-1">
                  {healthGoals.map((g, i) => (
                    <li key={i} className="flex items-center gap-2 text-slate-700 font-medium">
                      <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span>{g}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Doctor Telemetry Assurance */}
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-start gap-3">
              <Stethoscope className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Physician Telemetry Sync:</span>
                <span className="text-blue-800">
                  Attending physician <strong>Dr. Sarah Mitchell, MD</strong> will be notified of your calibrated baseline. Your dosage recommendations and drug safety alerts will immediately reflect these conditions.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((currentStep - 1) as any)}
              className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            {currentStep < 4 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((currentStep + 1) as any)}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalSubmit}
                className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
              >
                <Check className="w-4 h-4" />
                <span>Save Profile &amp; Complete Onboarding</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
        <div className="max-w-3xl w-full my-8 animate-in fade-in zoom-in-95 duration-200">
          {content}
        </div>
      </div>
    );
  }

  return content;
};
