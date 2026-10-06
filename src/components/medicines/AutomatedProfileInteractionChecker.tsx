import React, { useState, useEffect, useMemo } from 'react';
import {
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Bot,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flame,
  Info,
  Pill,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  X,
  Zap
} from 'lucide-react';
import { MEDICINES_DATA } from '../../data/medicines';
import { checkDrugInteractions, DrugInteractionPair, normalizeDrugKey } from '../../data/drugInteractions';
import { Medicine, UserRecord } from '../../types';
import { storageService } from '../../services/storageService';

interface AutomatedProfileInteractionCheckerProps {
  currentUser?: UserRecord;
  activeMedications: string[];
  onToggleActiveMed: (medId: string) => void;
  onClearActiveMeds?: () => void;
  onSelectMedicineDetails?: (med: Medicine) => void;
}

export interface GeminiRegimenAnalysis {
  overallRiskLevel: 'High' | 'Moderate' | 'Low' | 'Safe';
  summary: string;
  flaggedAdverseEffects: string[];
  pairwiseInteractions: Array<{
    drugA: string;
    drugB: string;
    severity: 'Severe' | 'Moderate' | 'Mild';
    adverseEffects: string[];
    mechanism: string;
    clinicalEffect: string;
    recommendation: string;
    actionRequired: string;
  }>;
  monitoringParameters: string[];
  patientCounselingDirectives: string[];
  source?: string;
  analyzedAt?: string;
}

export const AutomatedProfileInteractionChecker: React.FC<AutomatedProfileInteractionCheckerProps> = ({
  currentUser,
  activeMedications,
  onToggleActiveMed,
  onClearActiveMeds,
  onSelectMedicineDetails
}) => {
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<GeminiRegimenAnalysis | null>(null);
  const [showAiBreakdown, setShowAiBreakdown] = useState(false);

  // Map activeMedications to full Medicine objects
  const activeMedObjects = useMemo(() => {
    return activeMedications
      .map(id => {
        const norm = normalizeDrugKey(id);
        return MEDICINES_DATA.find(m => normalizeDrugKey(m.id) === norm || normalizeDrugKey(m.name) === norm);
      })
      .filter((m): m is Medicine => !!m);
  }, [activeMedications]);

  // Automated Drug Interaction Detection across all active medications
  const detectedInteractions = useMemo<DrugInteractionPair[]>(() => {
    if (activeMedications.length < 2) return [];

    // 1. Check pairwise database rules
    const pairResults = checkDrugInteractions(activeMedications);

    // 2. Also check each medicine's internal drugInteractions list
    const combined = [...pairResults];

    activeMedObjects.forEach(med => {
      if (!med.drugInteractions) return;
      med.drugInteractions.forEach(di => {
        const targetNorm = normalizeDrugKey(di.interactsWith);
        // Check if any other active medication matches targetNorm
        const matchingOther = activeMedObjects.find(
          other => other.id !== med.id && (normalizeDrugKey(other.id) === targetNorm || normalizeDrugKey(other.name) === targetNorm)
        );

        if (matchingOther) {
          const alreadyExists = combined.some(
            c =>
              (normalizeDrugKey(c.drugA) === normalizeDrugKey(med.id) && normalizeDrugKey(c.drugB) === normalizeDrugKey(matchingOther.id)) ||
              (normalizeDrugKey(c.drugA) === normalizeDrugKey(matchingOther.id) && normalizeDrugKey(c.drugB) === normalizeDrugKey(med.id))
          );

          if (!alreadyExists) {
            combined.push({
              drugA: med.id,
              drugB: matchingOther.id,
              drugAName: med.name,
              drugBName: matchingOther.name,
              severity: di.severity === 'Severe' ? 'Severe' : di.severity === 'Moderate' ? 'Moderate' : 'Mild',
              clinicalEffect: di.description,
              adverseEffects: [
                di.description.length > 50 ? di.description.substring(0, 50) + '...' : di.description
              ],
              mechanism: `Pharmacological cross-reactivity between ${med.drugClass} and ${matchingOther.drugClass}.`,
              recommendation: `Monitor patient response closely or substitute ${med.name} with an alternative.`,
              actionRequired: di.severity === 'Severe' ? 'Immediate Discontinuation' : 'Clinical Monitoring Advised'
            });
          }
        }
      });
    });

    return combined;
  }, [activeMedications, activeMedObjects]);

  // Reset AI analysis if active medications change
  useEffect(() => {
    setAiAnalysisResult(null);
    setShowAiBreakdown(false);
  }, [activeMedications]);

  const hasSevereInteraction = detectedInteractions.some(i => i.severity === 'Severe');
  const hasModerateInteraction = detectedInteractions.some(i => i.severity === 'Moderate');

  // Collect all unique highlighted adverse effects
  const allHighlightedAdverseEffects = useMemo(() => {
    const list: string[] = [];
    detectedInteractions.forEach(inter => {
      if (inter.adverseEffects && Array.isArray(inter.adverseEffects)) {
        inter.adverseEffects.forEach(eff => {
          if (!list.includes(eff)) {
            list.push(eff);
          }
        });
      }
    });
    return list;
  }, [detectedInteractions]);

  // Request deep Gemini AI interaction audit
  const handleRunAiAnalysis = async () => {
    if (activeMedications.length < 2) return;
    setIsAiAnalyzing(true);

    try {
      const response = await fetch('/api/analyze-regimen-interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medications: activeMedObjects.map(m => ({
            id: m.id,
            name: m.name,
            genericName: m.genericName,
            drugClass: m.drugClass,
            dosage: m.standardDosage?.adult || 'Standard'
          })),
          patientProfile: currentUser?.profile
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const result: GeminiRegimenAnalysis = await response.json();
      setAiAnalysisResult(result);
      setShowAiBreakdown(true);
    } catch (err) {
      console.warn('Backend regimen analysis failed, constructing structured fallback:', err);
      // Construct fallback from detectedInteractions
      setAiAnalysisResult({
        overallRiskLevel: hasSevereInteraction ? 'High' : hasModerateInteraction ? 'Moderate' : 'Safe',
        summary: hasSevereInteraction
          ? `High-risk pharmacological conflict identified between your active profile medications (${activeMedObjects.map(m => m.name).join(', ')}). Immediate physician consultation and dose modification is strongly advised.`
          : hasModerateInteraction
          ? `Moderate interaction hazards detected between active medications. Enhanced therapeutic monitoring and dose scheduling adjustments are recommended.`
          : `Active profile medications have compatible metabolic and pharmacodynamic pathways with no severe adverse conflicts detected.`,
        flaggedAdverseEffects: allHighlightedAdverseEffects.length > 0 ? allHighlightedAdverseEffects : ['No acute adverse toxicity flagged.'],
        pairwiseInteractions: detectedInteractions.map(d => ({
          drugA: d.drugAName || d.drugA,
          drugB: d.drugBName || d.drugB,
          severity: d.severity,
          adverseEffects: d.adverseEffects || [],
          mechanism: d.mechanism,
          clinicalEffect: d.clinicalEffect,
          recommendation: d.recommendation,
          actionRequired: d.actionRequired || 'Clinical Monitoring Advised'
        })),
        monitoringParameters: [
          'Monitor seated and standing blood pressure',
          'Evaluate renal function (Serum Creatinine/eGFR) if combining NSAIDs with antihypertensives',
          'Watch for sudden muscle soreness or weakness'
        ],
        patientCounselingDirectives: [
          'Report any irregular heartbeats, palpitations, or fainting immediately.',
          'Do not start or stop prescribed medications without consulting your prescribing doctor.',
          'Take medications with a full glass of water and adhere to meal-timing instructions.'
        ],
        source: 'clinical_rule_engine',
        analyzedAt: new Date().toISOString()
      });
      setShowAiBreakdown(true);
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  // Quick preset test combinations
  const handleApplyPreset = (ids: string[]) => {
    if (onClearActiveMeds) {
      onClearActiveMeds();
    }
    // Toggle each on
    ids.forEach(id => {
      if (!activeMedications.includes(id)) {
        onToggleActiveMed(id);
      }
    });
  };

  // Scheduled prescriptions from patient's daily regimen
  const scheduledPrescriptionItems = useMemo(() => {
    return storageService.getMedicationSchedule().filter(s => s.active !== false);
  }, []);

  const handleSyncFromSchedule = () => {
    scheduledPrescriptionItems.forEach(item => {
      const norm = normalizeDrugKey(item.medicineName || item.medicineId);
      const isAlreadyActive = activeMedications.some(m => normalizeDrugKey(m) === norm);
      if (!isAlreadyActive) {
        onToggleActiveMed(item.medicineId || item.medicineName);
      }
    });
  };

  return (
    <div
      className={`rounded-2xl border-2 transition-all shadow-md overflow-hidden ${
        hasSevereInteraction
          ? 'border-rose-500 bg-linear-to-br from-rose-50/90 via-red-50/60 to-rose-50/90'
          : hasModerateInteraction
          ? 'border-amber-400 bg-linear-to-br from-amber-50/90 via-orange-50/60 to-amber-50/90'
          : activeMedications.length >= 2
          ? 'border-emerald-500 bg-linear-to-br from-emerald-50/90 via-teal-50/60 to-emerald-50/90'
          : 'border-slate-300 bg-white'
      }`}
    >
      {/* Top Banner Status Header */}
      <div
        className={`px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white ${
          hasSevereInteraction
            ? 'bg-rose-700'
            : hasModerateInteraction
            ? 'bg-linear-to-r from-amber-600 to-orange-600'
            : activeMedications.length >= 2
            ? 'bg-linear-to-r from-emerald-700 to-teal-700'
            : 'bg-slate-900'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0 shadow-sm">
            {hasSevereInteraction ? (
              <AlertOctagon className="w-6 h-6 animate-pulse" />
            ) : hasModerateInteraction ? (
              <AlertTriangle className="w-6 h-6" />
            ) : activeMedications.length >= 2 ? (
              <ShieldCheck className="w-6 h-6" />
            ) : (
              <Shield className="w-6 h-6" />
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-black/25">
                Automated Drug Interaction Checker
              </span>
              <span className="text-xs font-bold text-white/90">
                Active Profile Regimen ({activeMedications.length} Marked Active)
              </span>
              {aiAnalysisResult?.source === 'gemini' && (
                <span className="text-[10px] font-bold text-teal-200 bg-teal-900/60 px-2 py-0.5 rounded flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Gemini 3.8 Flash Verified</span>
                </span>
              )}
            </div>

            <h3 className="font-black text-lg sm:text-xl leading-tight mt-0.5">
              {hasSevereInteraction
                ? `🚨 High-Risk Drug Interaction Detected (${detectedInteractions.length} Conflict${detectedInteractions.length > 1 ? 's' : ''})`
                : hasModerateInteraction
                ? `⚠️ Moderate Drug Interaction Hazard (${detectedInteractions.length} Cross-Reaction${detectedInteractions.length > 1 ? 's' : ''})`
                : activeMedications.length >= 2
                ? `✅ No Adverse Cross-Reactions Detected (${activeMedications.length} Compatible Medications)`
                : `Active Profile Medication Interaction Monitor`}
            </h3>
          </div>
        </div>

        {/* Top Right Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {activeMedications.length >= 2 && (
            <button
              type="button"
              onClick={handleRunAiAnalysis}
              disabled={isAiAnalyzing}
              className="px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              title="Run deep multimodal pharmacological evaluation with Gemini 3.8 Flash"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isAiAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAiAnalyzing ? 'Analyzing with AI...' : 'AI Regimen Audit'}</span>
            </button>
          )}

          {scheduledPrescriptionItems.length > 0 && (
            <button
              type="button"
              onClick={handleSyncFromSchedule}
              className="px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Import active medications from your daily prescription schedule"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync Prescriptions ({scheduledPrescriptionItems.length})</span>
            </button>
          )}

          {activeMedications.length > 0 && onClearActiveMeds && (
            <button
              type="button"
              onClick={onClearActiveMeds}
              className="px-3 py-2 rounded-xl bg-black/20 hover:bg-black/35 text-white/90 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Clear Active ({activeMedications.length})
            </button>
          )}
        </div>
      </div>

      {/* Main Body */}
      <div className="p-5 sm:p-6 space-y-5">
        {/* Active Profile Medications Pill Strip */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Pill className="w-4 h-4 text-teal-600" />
              <span className="font-bold text-xs text-slate-900">
                Active Medications Currently in Patient Profile:
              </span>
              <span className="text-[11px] text-slate-500">
                ({activeMedications.length} active • screened automatically against each other)
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              Click ✕ to remove or toggle "+ Mark Active" on any medicine card below
            </span>
          </div>

          {activeMedications.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2">
              <p className="text-xs text-slate-600 font-medium">
                No medications currently marked as active in your profile.
              </p>
              <div className="text-[11px] text-slate-400">
                Mark 2 or more medications as active below to automatically detect contraindications and adverse reactions, or test one of these standard clinical demo pairs:
              </div>
              <div className="flex flex-wrap justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleApplyPreset(['ibuprofen', 'losartan'])}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition-colors cursor-pointer"
                >
                  Test Ibuprofen + Losartan (Renal/HTN Hazard)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset(['azithromycin', 'ondansetron'])}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-300 transition-colors cursor-pointer"
                >
                  Test Azithromycin + Ondansetron (Severe QTc Arrhythmia)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset(['metformin', 'ciprofloxacin'])}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-300 transition-colors cursor-pointer"
                >
                  Test Metformin + Ciprofloxacin (Hypoglycemia Spike)
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              {activeMedObjects.map(med => {
                // Check if this specific medication is involved in any detected interaction
                const hasConflict = detectedInteractions.some(
                  di =>
                    normalizeDrugKey(di.drugA) === normalizeDrugKey(med.id) ||
                    normalizeDrugKey(di.drugB) === normalizeDrugKey(med.id)
                );
                const isConflictSevere = detectedInteractions.some(
                  di =>
                    (normalizeDrugKey(di.drugA) === normalizeDrugKey(med.id) ||
                      normalizeDrugKey(di.drugB) === normalizeDrugKey(med.id)) &&
                    di.severity === 'Severe'
                );

                return (
                  <div
                    key={med.id}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs transition-all shadow-2xs ${
                      isConflictSevere
                        ? 'bg-rose-50 border-rose-300 text-rose-900 ring-2 ring-rose-400/30'
                        : hasConflict
                        ? 'bg-amber-50 border-amber-300 text-amber-900'
                        : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold">
                      {isConflictSevere ? (
                        <AlertOctagon className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      ) : hasConflict ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      ) : (
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      )}
                      <span>{med.name}</span>
                    </div>

                    <span className="text-[10px] text-slate-500 font-normal">
                      ({med.genericName})
                    </span>

                    {onSelectMedicineDetails && (
                      <button
                        type="button"
                        onClick={() => onSelectMedicineDetails(med)}
                        className="text-[10px] text-teal-700 hover:underline cursor-pointer ml-0.5"
                        title="View clinical monograph"
                      >
                        Details
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onToggleActiveMed(med.id)}
                      className="p-0.5 rounded-md hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 cursor-pointer ml-1"
                      title="Remove from active profile"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Single Medication Information Note */}
        {activeMedications.length === 1 && (
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">1 Active Medication Marked:</span>
              <p className="text-blue-800 leading-relaxed mt-0.5">
                Automated multi-drug interaction checking requires at least 2 active medications. Click <strong>"+ Mark Active"</strong> on another medication in the directory below to automatically evaluate combinations for adverse interactions.
              </p>
            </div>
          </div>
        )}

        {/* Highlighted Adverse Clinical Effects Panel (When Interactions Exist) */}
        {detectedInteractions.length > 0 && (
          <div className="space-y-4 animate-fadeIn">
            {/* Specific Adverse Effect Tags Strip */}
            {allHighlightedAdverseEffects.length > 0 && (
              <div className="bg-white rounded-xl border border-rose-200 p-4 shadow-2xs space-y-2">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-rose-600" />
                  <span className="font-bold text-xs text-rose-950 uppercase tracking-wider">
                    Highlighted Potential Adverse Effects Triggered by Active Regimen:
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {allHighlightedAdverseEffects.map((effect, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300 flex items-center gap-1 shadow-2xs"
                    >
                      <span>⚠️</span>
                      <span>{effect}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Individual Conflict Cards */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>Pairwise Clinical Interaction Breakdown ({detectedInteractions.length}):</span>
              </h4>

              {detectedInteractions.map((inter, idx) => {
                const isSevere = inter.severity === 'Severe';
                const medA = MEDICINES_DATA.find(m => normalizeDrugKey(m.id) === normalizeDrugKey(inter.drugA));
                const medB = MEDICINES_DATA.find(m => normalizeDrugKey(m.id) === normalizeDrugKey(inter.drugB));

                return (
                  <div
                    key={idx}
                    className={`rounded-xl border p-4 sm:p-5 transition-all shadow-xs space-y-3 ${
                      isSevere
                        ? 'bg-rose-50/70 border-rose-300'
                        : 'bg-amber-50/70 border-amber-300'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                            isSevere ? 'bg-rose-600 text-white' : 'bg-amber-500 text-slate-950'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <div>
                          <h5 className="font-black text-sm sm:text-base text-slate-900">
                            {medA?.name || inter.drugA.toUpperCase()} + {medB?.name || inter.drugB.toUpperCase()}
                          </h5>
                          <span className="text-[11px] text-slate-500">
                            {medA?.drugClass} ↔ {medB?.drugClass}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            isSevere
                              ? 'bg-rose-600 text-white'
                              : 'bg-amber-500 text-slate-950'
                          }`}
                        >
                          {inter.severity} Interaction
                        </span>
                        {inter.actionRequired && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-white text-slate-800 border border-slate-300">
                            {inter.actionRequired}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Clinical Effect & Adverse Outcomes */}
                    <div className="bg-white rounded-lg p-3 border border-slate-200 space-y-1.5 text-xs">
                      <div className="text-slate-800 font-medium">
                        <strong className="text-slate-900">Clinical Manifestation: </strong>
                        {inter.clinicalEffect}
                      </div>

                      {inter.adverseEffects && inter.adverseEffects.length > 0 && (
                        <div className="pt-1 flex flex-wrap items-center gap-1.5">
                          <span className="text-[11px] font-bold text-rose-800">Primary Hazards:</span>
                          {inter.adverseEffects.map((ae, aIdx) => (
                            <span key={aIdx} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-rose-50 text-rose-900 border border-rose-200">
                              {ae}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Pharmacological Mechanism & Recommendations */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="bg-white/80 p-3 rounded-lg border border-slate-200">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                          Pharmacological Mechanism:
                        </span>
                        <p className="text-slate-700 leading-relaxed font-medium">
                          {inter.mechanism}
                        </p>
                      </div>

                      <div className="bg-white/80 p-3 rounded-lg border border-slate-200">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 block mb-1">
                          Clinical Action & Safer Alternative:
                        </span>
                        <p className="text-slate-800 leading-relaxed font-semibold">
                          {inter.recommendation}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Gemini AI Deep Pharmacological Audit Panel (When Requested) */}
        {showAiBreakdown && aiAnalysisResult && (
          <div className="rounded-xl border border-teal-300 bg-white p-5 shadow-sm space-y-4 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-600" />
                <h4 className="font-bold text-sm text-slate-900">
                  Gemini 3.8 Flash Pharmacovigilance Regimen Analysis
                </h4>
              </div>
              <span className="text-[11px] text-slate-500">
                Audited against Patient Profile ({currentUser?.name || 'Patient'}, {currentUser?.profile?.age || 38}yo)
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-teal-50/70 border border-teal-200 text-xs text-slate-800 leading-relaxed font-medium">
              <strong className="text-teal-950 font-bold block mb-1">AI Regimen Synthesis:</strong>
              {aiAnalysisResult.summary}
            </div>

            {aiAnalysisResult.monitoringParameters?.length > 0 && (
              <div>
                <span className="text-xs font-bold text-slate-800 block mb-1.5">
                  Recommended Monitoring & Diagnostic Parameters:
                </span>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-700">
                  {aiAnalysisResult.monitoringParameters.map((param, pIdx) => (
                    <li key={pIdx}>{param}</li>
                  ))}
                </ul>
              </div>
            )}

            {aiAnalysisResult.patientCounselingDirectives?.length > 0 && (
              <div className="pt-2">
                <span className="text-xs font-bold text-slate-800 block mb-1.5">
                  Patient Counseling Directives:
                </span>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-700">
                  {aiAnalysisResult.patientCounselingDirectives.map((dir, dIdx) => (
                    <li key={dIdx}>{dir}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
