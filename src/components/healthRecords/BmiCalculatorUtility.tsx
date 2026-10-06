import React, { useState, useMemo, useEffect } from 'react';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Heart,
  HeartPulse,
  Info,
  RefreshCw,
  RotateCcw,
  Save,
  Scale,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  User,
  Zap
} from 'lucide-react';
import { HealthMetric, UserRecord } from '../../types';

interface BmiCalculatorUtilityProps {
  currentUser: UserRecord;
  onUpdateUser?: (updatedUser: UserRecord) => void;
  vitals?: HealthMetric[];
  onAddVitalWeight?: (weightKg: number) => void;
}

export type UnitSystem = 'metric' | 'imperial';

export interface BmiCategoryInfo {
  key: 'underweight' | 'normal' | 'overweight' | 'obese';
  label: string;
  shortLabel: string;
  range: string;
  color: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
  gaugeColor: string;
  healthRisk: string;
  advice: string;
}

export const BMI_CATEGORIES: Record<string, BmiCategoryInfo> = {
  underweight: {
    key: 'underweight',
    label: 'Underweight (< 18.5)',
    shortLabel: 'Underweight',
    range: '< 18.5',
    color: '#0284c7',
    textColor: 'text-sky-800',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-300',
    gaugeColor: '#38bdf8',
    healthRisk: 'Risk of nutritional deficiency, weakened immunity, and osteoporosis',
    advice: 'Consider caloric-dense, nutrient-rich foods and consult a nutritionist to safely achieve healthy weight.'
  },
  normal: {
    key: 'normal',
    label: 'Normal Weight (18.5 – 24.9)',
    shortLabel: 'Normal Weight',
    range: '18.5 – 24.9',
    color: '#10b981',
    textColor: 'text-emerald-800',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-300',
    gaugeColor: '#10b981',
    healthRisk: 'Lowest risk for cardiovascular disease, metabolic syndrome, and diabetes',
    advice: 'Maintain regular aerobic physical activity, balanced whole-food diet, and steady hydration.'
  },
  overweight: {
    key: 'overweight',
    label: 'Overweight (25.0 – 29.9)',
    shortLabel: 'Overweight',
    range: '25.0 – 29.9',
    color: '#f59e0b',
    textColor: 'text-amber-800',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    gaugeColor: '#f59e0b',
    healthRisk: 'Moderate increase in risk for hypertension, dyslipidemia, and osteoarthritis',
    advice: 'A modest 5–10% reduction in body weight significantly improves glycemic and blood pressure parameters.'
  },
  obese: {
    key: 'obese',
    label: 'Obese (≥ 30.0)',
    shortLabel: 'Obesity',
    range: '≥ 30.0',
    color: '#f43f5e',
    textColor: 'text-rose-800',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-300',
    gaugeColor: '#f43f5e',
    healthRisk: 'High risk for type 2 diabetes, coronary artery disease, sleep apnea, and fatty liver',
    advice: 'Comprehensive medical lifestyle intervention, structured physical training, and metabolic monitoring advised.'
  }
};

export const BmiCalculatorUtility: React.FC<BmiCalculatorUtilityProps> = ({
  currentUser,
  onUpdateUser,
  vitals = []
}) => {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric');

  // Determine initial values from user records (profile or latest vital log)
  const initialWeightKg = useMemo(() => {
    if (vitals && vitals.length > 0) {
      // Find latest vital with weight
      const sorted = [...vitals].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      if (sorted[0]?.weight) return Number(sorted[0].weight);
    }
    return currentUser.profile.weightKg || 72;
  }, [vitals, currentUser.profile.weightKg]);

  const initialHeightCm = useMemo(() => {
    return currentUser.profile.heightCm || 175;
  }, [currentUser.profile.heightCm]);

  // Form states in metric
  const [heightCm, setHeightCm] = useState<number>(initialHeightCm);
  const [weightKg, setWeightKg] = useState<number>(initialWeightKg);

  // Imperial inputs (ft, in, lbs)
  const [heightFt, setHeightFt] = useState<number>(() => Math.floor(initialHeightCm / 30.48));
  const [heightIn, setHeightIn] = useState<number>(() => Math.round((initialHeightCm % 30.48) / 2.54));
  const [weightLbs, setWeightLbs] = useState<number>(() => Math.round(initialWeightKg * 2.20462));

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Sync state if currentUser changes from outside
  useEffect(() => {
    const h = currentUser.profile.heightCm || 175;
    const w = initialWeightKg;
    setHeightCm(h);
    setWeightKg(w);
    setHeightFt(Math.floor(h / 30.48));
    setHeightIn(Math.round((h % 30.48) / 2.54));
    setWeightLbs(Math.round(w * 2.20462));
  }, [currentUser, initialWeightKg]);

  // Metric to Imperial synchronization
  const updateFromMetric = (h: number, w: number) => {
    setHeightCm(h);
    setWeightKg(w);
    setHeightFt(Math.floor(h / 30.48));
    setHeightIn(Math.round((h % 30.48) / 2.54));
    setWeightLbs(Math.round(w * 2.20462));
  };

  // Imperial to Metric synchronization
  const updateFromImperial = (ft: number, inch: number, lbs: number) => {
    setHeightFt(ft);
    setHeightIn(inch);
    setWeightLbs(lbs);
    const cm = Math.round((ft * 12 + inch) * 2.54);
    const kg = Number((lbs / 2.20462).toFixed(1));
    setHeightCm(cm);
    setWeightKg(kg);
  };

  // Reset back to user record values
  const handleResetToRecord = () => {
    updateFromMetric(initialHeightCm, initialWeightKg);
  };

  // Save updated height and weight to User Profile
  const handleSaveToProfile = () => {
    if (!onUpdateUser) return;
    const updatedUser: UserRecord = {
      ...currentUser,
      profile: {
        ...currentUser.profile,
        heightCm: Math.round(heightCm),
        weightKg: Number(weightKg.toFixed(1))
      }
    };
    onUpdateUser(updatedUser);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Calculate BMI
  const bmiCalculation = useMemo(() => {
    const hM = heightCm / 100;
    if (hM <= 0 || weightKg <= 0) {
      return {
        bmi: 0,
        category: BMI_CATEGORIES.normal,
        healthyWeightMinKg: 0,
        healthyWeightMaxKg: 0,
        healthyWeightMinLbs: 0,
        healthyWeightMaxLbs: 0,
        weightDifferenceKg: 0,
        weightDifferenceLbs: 0
      };
    }

    const rawBmi = weightKg / (hM * hM);
    const bmi = Number(rawBmi.toFixed(1));

    let category = BMI_CATEGORIES.normal;
    if (bmi < 18.5) {
      category = BMI_CATEGORIES.underweight;
    } else if (bmi < 25.0) {
      category = BMI_CATEGORIES.normal;
    } else if (bmi < 30.0) {
      category = BMI_CATEGORIES.overweight;
    } else {
      category = BMI_CATEGORIES.obese;
    }

    // Healthy weight range for this height (BMI 18.5 to 24.9)
    const minKg = Number((18.5 * hM * hM).toFixed(1));
    const maxKg = Number((24.9 * hM * hM).toFixed(1));
    const minLbs = Math.round(minKg * 2.20462);
    const maxLbs = Math.round(maxKg * 2.20462);

    let diffKg = 0;
    if (bmi < 18.5) {
      diffKg = Number((minKg - weightKg).toFixed(1));
    } else if (bmi > 24.9) {
      diffKg = Number((weightKg - maxKg).toFixed(1));
    }
    const diffLbs = Math.round(diffKg * 2.20462);

    return {
      bmi,
      category,
      healthyWeightMinKg: minKg,
      healthyWeightMaxKg: maxKg,
      healthyWeightMinLbs: minLbs,
      healthyWeightMaxLbs: maxLbs,
      weightDifferenceKg: diffKg,
      weightDifferenceLbs: diffLbs
    };
  }, [heightCm, weightKg]);

  // Copy BMI clinical summary for doctor
  const handleCopyBmiSummary = () => {
    const text = `PATIENT BIOMETRIC BMI EVALUATION:
Patient: ${currentUser.name} (Age: ${currentUser.profile.age})
Height: ${heightCm} cm (${heightFt}'${heightIn}")
Weight: ${weightKg} kg (${weightLbs} lbs)
Calculated BMI: ${bmiCalculation.bmi} kg/m²
Classification: ${bmiCalculation.category.label}
Healthy Weight Range: ${bmiCalculation.healthyWeightMinKg} – ${bmiCalculation.healthyWeightMaxKg} kg (${bmiCalculation.healthyWeightMinLbs} – ${bmiCalculation.healthyWeightMaxLbs} lbs)
Clinical Assessment: ${bmiCalculation.category.healthRisk}
Guidance: ${bmiCalculation.category.advice}`;

    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 3000);
  };

  // Semi-circle SVG Gauge Math
  // BMI scale from 12 to 42 mapped across 180 degrees (from 180° / left to 0° / right)
  const gaugeMath = useMemo(() => {
    const minBmi = 12;
    const maxBmi = 42;
    const clampedBmi = Math.min(Math.max(bmiCalculation.bmi, minBmi), maxBmi);

    // Percentage across scale 0 to 1
    const pct = (clampedBmi - minBmi) / (maxBmi - minBmi);

    // Needle Angle: from 180 degrees (left) to 0 degrees (right)
    const angle = 180 - pct * 180;
    const rad = (angle * Math.PI) / 180;

    // Radius and center
    const cx = 150;
    const cy = 135;
    const r = 100;

    // Needle tip coordinates
    const needleLen = 80;
    const nx = cx + needleLen * Math.cos(rad);
    const ny = cy - needleLen * Math.sin(rad);

    return { cx, cy, r, angle, nx, ny, pct };
  }, [bmiCalculation.bmi]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-all space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 text-teal-700 font-bold text-xs uppercase tracking-wider mb-1">
            <Scale className="w-4 h-4 text-teal-600" />
            <span>Biometric Anthropometric Calculator</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Body Mass Index (BMI) &amp; Weight Analysis</span>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${bmiCalculation.category.bgColor} ${bmiCalculation.category.textColor} ${bmiCalculation.category.borderColor}`}
            >
              {bmiCalculation.category.shortLabel}
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluates adult adiposity, healthy weight ranges, and cardiovascular risk thresholds based on user health records
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
          {/* Unit Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setUnitSystem('metric')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                unitSystem === 'metric' ? 'bg-white text-teal-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Metric (cm / kg)
            </button>
            <button
              type="button"
              onClick={() => setUnitSystem('imperial')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                unitSystem === 'imperial' ? 'bg-white text-teal-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Imperial (ft, in / lbs)
            </button>
          </div>

          {/* Copy Report Button */}
          <button
            type="button"
            onClick={handleCopyBmiSummary}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Copy BMI evaluation to clipboard for clinical visits"
          >
            {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSummary ? 'Copied Assessment!' : 'Copy Summary'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Calculator Inputs on Left, Gauge Visualizer on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Biometric Inputs & Sliders (5 cols) */}
        <div className="lg:col-span-5 bg-slate-50/80 rounded-2xl border border-slate-200/90 p-5 space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <User className="w-4 h-4 text-teal-600" />
              <span>Biometric Records for {currentUser.name}</span>
            </span>
            <button
              type="button"
              onClick={handleResetToRecord}
              className="text-[11px] font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1 transition-colors cursor-pointer"
              title="Reset inputs to values from user profile and recent vitals"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Sync from Record</span>
            </button>
          </div>

          {unitSystem === 'metric' ? (
            /* Metric Inputs */
            <div className="space-y-4 text-xs">
              {/* Height (cm) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-700">Height (cm)</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={100}
                      max={250}
                      value={heightCm}
                      onChange={(e) => updateFromMetric(Number(e.target.value) || 170, weightKg)}
                      className="w-18 bg-white border border-slate-200 rounded-lg px-2 py-1 text-right font-black text-slate-900 text-sm focus:border-teal-500 outline-hidden"
                    />
                    <span className="text-slate-400 font-semibold">cm</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={120}
                  max={220}
                  value={heightCm}
                  onChange={(e) => updateFromMetric(Number(e.target.value), weightKg)}
                  className="w-full accent-teal-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                  <span>120 cm (3'11")</span>
                  <span>175 cm (5'9")</span>
                  <span>220 cm (7'3")</span>
                </div>
              </div>

              {/* Weight (kg) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-700">Weight (kg)</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={30}
                      max={220}
                      step={0.1}
                      value={weightKg}
                      onChange={(e) => updateFromMetric(heightCm, Number(e.target.value) || 70)}
                      className="w-18 bg-white border border-slate-200 rounded-lg px-2 py-1 text-right font-black text-slate-900 text-sm focus:border-teal-500 outline-hidden"
                    />
                    <span className="text-slate-400 font-semibold">kg</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={35}
                  max={160}
                  step={0.5}
                  value={weightKg}
                  onChange={(e) => updateFromMetric(heightCm, Number(e.target.value))}
                  className="w-full accent-teal-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                  <span>35 kg (77 lbs)</span>
                  <span>70 kg (154 lbs)</span>
                  <span>160 kg (352 lbs)</span>
                </div>
              </div>
            </div>
          ) : (
            /* Imperial Inputs */
            <div className="space-y-4 text-xs">
              {/* Height (ft & in) */}
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Height (Feet &amp; Inches)</label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5">
                    <input
                      type="number"
                      min={3}
                      max={7}
                      value={heightFt}
                      onChange={(e) => updateFromImperial(Number(e.target.value) || 5, heightIn, weightLbs)}
                      className="w-full text-right font-black text-slate-900 text-sm outline-hidden"
                    />
                    <span className="text-slate-400 font-semibold">ft</span>
                  </div>
                  <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5">
                    <input
                      type="number"
                      min={0}
                      max={11}
                      value={heightIn}
                      onChange={(e) => updateFromImperial(heightFt, Number(e.target.value) || 0, weightLbs)}
                      className="w-full text-right font-black text-slate-900 text-sm outline-hidden"
                    />
                    <span className="text-slate-400 font-semibold">in</span>
                  </div>
                </div>
              </div>

              {/* Weight (lbs) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-700">Weight (lbs)</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={70}
                      max={450}
                      value={weightLbs}
                      onChange={(e) => updateFromImperial(heightFt, heightIn, Number(e.target.value) || 150)}
                      className="w-20 bg-white border border-slate-200 rounded-lg px-2 py-1 text-right font-black text-slate-900 text-sm focus:border-teal-500 outline-hidden"
                    />
                    <span className="text-slate-400 font-semibold">lbs</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={80}
                  max={350}
                  value={weightLbs}
                  onChange={(e) => updateFromImperial(heightFt, heightIn, Number(e.target.value))}
                  className="w-full accent-teal-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                  <span>80 lbs</span>
                  <span>160 lbs</span>
                  <span>350 lbs</span>
                </div>
              </div>
            </div>
          )}

          {/* Save to Profile Button */}
          {onUpdateUser && (
            <div className="pt-2 border-t border-slate-200/80">
              <button
                type="button"
                onClick={handleSaveToProfile}
                className="w-full py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                {savedSuccess ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    <span>Saved to Patient Profile!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save {heightCm}cm / {weightKg}kg to Profile</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Context Note */}
          <div className="text-[11px] text-slate-500 leading-relaxed bg-white p-3 rounded-xl border border-slate-200/60">
            <span className="font-semibold text-slate-700">Source Record: </span>
            Height from clinical profile ({currentUser.profile.heightCm || 175} cm). Weight synced from recent vitals ({initialWeightKg} kg).
          </div>
        </div>

        {/* Right Column: Visual Color-Coded BMI Gauge & Spectrum (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 space-y-6">
          {/* Radial Semi-Circular Gauge */}
          <div className="flex flex-col items-center">
            <div className="relative w-full max-w-[320px] aspect-[300/180] flex justify-center">
              <svg viewBox="0 0 300 180" className="w-full h-full overflow-visible">
                <defs>
                  {/* Gauge Background Shadow */}
                  <filter id="gaugeShadow" x="-10%" y="-10%" width="120%" height="120%">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.1" />
                  </filter>
                  {/* Needle Glow */}
                  <filter id="needleGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.25" />
                  </filter>
                </defs>

                {/* Semicircle Gauge Segments */}
                {/* 
                  Arc center: (150, 140), radius: 95, strokeWidth: 20
                  Angles: 180° (left) to 0° (right)
                  Range: 12 to 42 BMI (total range = 30)
                  1. Underweight: 12 to 18.5 => fraction = 6.5 / 30 = 0.2166 => 39° (from 180° to 141°)
                  2. Normal: 18.5 to 25.0 => fraction = 6.5 / 30 = 0.2166 => 39° (from 141° to 102°)
                  3. Overweight: 25.0 to 30.0 => fraction = 5.0 / 30 = 0.1666 => 30° (from 102° to 72°)
                  4. Obese: 30.0 to 42.0 => fraction = 12.0 / 30 = 0.4000 => 72° (from 72° to 0°)
                */}

                {/* Segment 1: Underweight (< 18.5) */}
                <path
                  d="M 55 140 A 95 95 0 0 1 76.1 80.2"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="20"
                  strokeLinecap="round"
                />

                {/* Segment 2: Normal Weight (18.5 - 24.9) */}
                <path
                  d="M 76.1 80.2 A 95 95 0 0 1 130.2 47.1"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="20"
                />

                {/* Segment 3: Overweight (25.0 - 29.9) */}
                <path
                  d="M 130.2 47.1 A 95 95 0 0 1 179.3 49.6"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="20"
                />

                {/* Segment 4: Obese (>= 30.0) */}
                <path
                  d="M 179.3 49.6 A 95 95 0 0 1 245 140"
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="20"
                  strokeLinecap="round"
                />

                {/* Tick Labels on Gauge Perimeter */}
                <text x="45" y="158" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#64748b">15</text>
                <text x="68" y="72" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0284c7">18.5</text>
                <text x="126" y="36" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#059669">25</text>
                <text x="185" y="38" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#d97706">30</text>
                <text x="255" y="158" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#e11d48">40</text>

                {/* Indicator Needle */}
                <g filter="url(#needleGlow)">
                  <line
                    x1={gaugeMath.cx}
                    y1={gaugeMath.cy}
                    x2={gaugeMath.nx}
                    y2={gaugeMath.ny}
                    stroke="#0f172a"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  {/* Central Pivot Hub */}
                  <circle cx={gaugeMath.cx} cy={gaugeMath.cy} r="9" fill="#0f172a" />
                  <circle cx={gaugeMath.cx} cy={gaugeMath.cy} r="4" fill="#ffffff" />
                </g>
              </svg>

              {/* Digital Readout Center Overlay */}
              <div className="absolute bottom-0 flex flex-col items-center">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  {bmiCalculation.bmi}
                </span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  kg / m²
                </span>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold border shadow-2xs ${bmiCalculation.category.bgColor} ${bmiCalculation.category.textColor} ${bmiCalculation.category.borderColor}`}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: bmiCalculation.category.color }}
                    ></span>
                    <span>{bmiCalculation.category.label}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Horizontal Color-Coded BMI Spectrum Bar with Marker Pin */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>WHO BMI Spectrum</span>
              <span className="text-slate-500 font-normal text-[11px]">
                Calculated value: <strong>{bmiCalculation.bmi}</strong>
              </span>
            </div>

            {/* Segmented bar */}
            <div className="relative">
              <div className="h-4 rounded-full overflow-hidden flex w-full shadow-inner border border-slate-200">
                <div
                  className="bg-sky-400 flex items-center justify-center text-[9px] font-black text-white"
                  style={{ width: '22%' }}
                  title="Underweight: < 18.5"
                >
                  &lt;18.5
                </div>
                <div
                  className="bg-emerald-500 flex items-center justify-center text-[9px] font-black text-white"
                  style={{ width: '25%' }}
                  title="Normal: 18.5 – 24.9"
                >
                  18.5–24.9
                </div>
                <div
                  className="bg-amber-400 flex items-center justify-center text-[9px] font-black text-white"
                  style={{ width: '20%' }}
                  title="Overweight: 25.0 – 29.9"
                >
                  25–29.9
                </div>
                <div
                  className="bg-rose-500 flex items-center justify-center text-[9px] font-black text-white"
                  style={{ width: '33%' }}
                  title="Obese: ≥ 30.0"
                >
                  ≥30
                </div>
              </div>

              {/* Pin Pointer on Spectrum */}
              <div
                className="absolute -top-1.5 -bottom-1.5 w-3 bg-slate-950 border-2 border-white rounded-full shadow-md transition-all -ml-1.5"
                style={{
                  left: `${Math.min(Math.max(gaugeMath.pct * 100, 2), 98)}%`
                }}
                title={`Current BMI: ${bmiCalculation.bmi}`}
              />
            </div>

            {/* Category Threshold Labels */}
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold px-1">
              <span className="text-sky-700">Underweight</span>
              <span className="text-emerald-700">Normal (Healthy)</span>
              <span className="text-amber-700">Overweight</span>
              <span className="text-rose-700">Obese</span>
            </div>
          </div>

          {/* Healthy Weight Target Range & Variance Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* Target Weight Card */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="font-semibold">Healthy Weight Benchmark</span>
                <HeartPulse className="w-3.5 h-3.5 text-teal-600" />
              </div>
              <div className="text-lg font-black text-slate-900">
                {bmiCalculation.healthyWeightMinKg} – {bmiCalculation.healthyWeightMaxKg} kg
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {bmiCalculation.healthyWeightMinLbs} – {bmiCalculation.healthyWeightMaxLbs} lbs (for {heightCm} cm)
              </div>
            </div>

            {/* Weight Variance / Target Delta Card */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="font-semibold">Variance from Target</span>
                {bmiCalculation.category.key === 'normal' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                )}
              </div>
              <div className="text-lg font-black text-slate-900">
                {bmiCalculation.category.key === 'normal' ? (
                  <span className="text-emerald-700">Ideal Range</span>
                ) : bmiCalculation.category.key === 'underweight' ? (
                  <span className="text-sky-700">+{bmiCalculation.weightDifferenceKg} kg</span>
                ) : (
                  <span className="text-rose-700">-{bmiCalculation.weightDifferenceKg} kg</span>
                )}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {bmiCalculation.category.key === 'normal' ? (
                  'Within standard WHO normal range'
                ) : bmiCalculation.category.key === 'underweight' ? (
                  `Gain ${bmiCalculation.weightDifferenceKg} kg (${bmiCalculation.weightDifferenceLbs} lbs) for normal`
                ) : (
                  `Lose ${bmiCalculation.weightDifferenceKg} kg (${bmiCalculation.weightDifferenceLbs} lbs) for normal`
                )}
              </div>
            </div>
          </div>

          {/* Clinical Assessment Box */}
          <div className={`p-4 rounded-xl border ${bmiCalculation.category.bgColor} ${bmiCalculation.category.borderColor} text-xs space-y-1.5`}>
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Cardiometabolic Risk Assessment ({bmiCalculation.category.shortLabel}):</span>
            </div>
            <p className="text-slate-700 leading-relaxed font-medium">
              {bmiCalculation.category.healthRisk}.
            </p>
            <p className="text-slate-600 text-[11px] pt-1 border-t border-slate-200/50">
              <strong>Clinical Guidance: </strong>
              {bmiCalculation.category.advice}
            </p>
          </div>
        </div>
      </div>

      {/* Clinical Guidance Footnote */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-teal-600 shrink-0" />
          <span>
            WHO Anthropometric Standard: BMI classifies weight-for-height in adults (kg/m²). Highly athletic individuals with elevated muscularity may present elevated BMI without adiposity.
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: bmiCalculation.category.color }}></span>
          <span className="font-semibold text-slate-700">{bmiCalculation.category.label}</span>
        </div>
      </div>
    </div>
  );
};
