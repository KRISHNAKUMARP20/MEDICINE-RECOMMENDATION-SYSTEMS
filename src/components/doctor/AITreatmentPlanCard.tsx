import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  HeartPulse,
  Pill,
  Plus,
  Check,
  AlertTriangle,
  Clock,
  BookOpen,
  Apple,
  FileText,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  ExternalLink
} from 'lucide-react';
import { SuggestedTreatmentPlan, DoctorPrescribedItem, Medicine } from '../../types';
import { MEDICINES_DATA } from '../../data/medicines';

interface AITreatmentPlanCardProps {
  plan: SuggestedTreatmentPlan;
  onApplyMedication: (item: DoctorPrescribedItem) => void;
  onApplyAllMedications: (items: DoctorPrescribedItem[]) => void;
  onApplyNotes: (notes: string) => void;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
  prescribedItems: DoctorPrescribedItem[];
}

export const AITreatmentPlanCard: React.FC<AITreatmentPlanCardProps> = ({
  plan,
  onApplyMedication,
  onApplyAllMedications,
  onApplyNotes,
  onRegenerate,
  isRegenerating,
  prescribedItems
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [appliedNotesSuccess, setAppliedNotesSuccess] = useState<boolean>(false);

  // Helper to map recommended med to DoctorPrescribedItem
  const mapToPrescribedItem = (recMed: any, idx: number): DoctorPrescribedItem => {
    // Try to find matching medicine in local catalog
    const matchedMed = MEDICINES_DATA.find(
      m => m.name.toLowerCase().includes(recMed.name.toLowerCase()) ||
           recMed.name.toLowerCase().includes(m.name.toLowerCase()) ||
           (m.genericName && m.genericName.toLowerCase().includes(recMed.name.toLowerCase()))
    );

    return {
      id: `ai-rx-${Date.now()}-${idx}`,
      medicineId: matchedMed ? matchedMed.id : recMed.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      medicineName: recMed.name,
      genericName: matchedMed?.genericName || recMed.category || 'Clinical Protocol Drug',
      dosage: recMed.dosage || 'Standard clinical dose',
      frequency: recMed.frequency || 'Once daily',
      duration: recMed.duration || '14 Days',
      instructions: recMed.rationale ? `${recMed.rationale}. Take as directed.` : 'Take as directed with water.'
    };
  };

  const handleAddMed = (recMed: any, idx: number) => {
    const item = mapToPrescribedItem(recMed, idx);
    onApplyMedication(item);
  };

  const handleAddAllMeds = () => {
    const items = plan.recommendedMedications.map((m, idx) => mapToPrescribedItem(m, idx));
    onApplyAllMedications(items);
  };

  const handleApplyDirectivesToNotes = () => {
    const textToAppend = `[AI Clinical Protocol Directive]: ${plan.summary}\n` +
      `• Hemodynamics: ${plan.hemodynamicAssessment}\n` +
      `• Protocols: ${plan.primaryClinicalProtocols.map(p => p.protocolName).join('; ')}\n` +
      `• Non-Pharm: ${plan.nonPharmacologicalInterventions.slice(0, 2).join('; ')}\n` +
      `• Follow-up: ${plan.followUpTimeline}`;

    onApplyNotes(textToAppend);
    setAppliedNotesSuccess(true);
    setTimeout(() => setAppliedNotesSuccess(false), 3000);
  };

  // Check if a medication is already in the prescription pad
  const isMedAlreadyAdded = (medName: string) => {
    return prescribedItems.some(
      item => item.medicineName.toLowerCase().includes(medName.toLowerCase()) ||
              medName.toLowerCase().includes(item.medicineName.toLowerCase())
    );
  };

  return (
    <div className="bg-linear-to-br from-indigo-950 via-slate-900 to-blue-950 text-white rounded-3xl border border-indigo-500/30 p-5 sm:p-6 shadow-xl relative overflow-hidden transition-all">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

      {/* Card Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-800/60 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-linear-to-r from-amber-400 to-orange-500 text-slate-950 shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Clinical Protocol Recommender</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-400/30">
              {plan.modelUsed || 'Gemini 3.8 Flash (Decision Engine)'}
            </span>
            <span className="text-[10px] text-slate-400">
              Generated: {new Date(plan.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-black text-slate-100 flex items-center gap-2">
            <span>Evidence-Based Treatment Plan & Clinical Guidelines</span>
          </h3>
          <p className="text-xs text-slate-300/80 mt-0.5">
            Protocol synthesized from patient reported symptoms, longitudinal hemodynamics, and international medical guidelines.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          {onRegenerate && (
            <button
              type="button"
              onClick={onRegenerate}
              disabled={isRegenerating}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-white/10 disabled:opacity-50"
              title="Re-analyze with latest patient vitals"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin text-amber-400' : ''}`} />
              <span className="hidden md:inline">Re-analyze</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer border border-white/10"
            title={isExpanded ? 'Collapse Treatment Plan' : 'Expand Treatment Plan'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Body */}
      {isExpanded && (
        <div className="relative z-10 pt-4 space-y-4">
          {/* Summary & Hemodynamic Assessment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-300 uppercase tracking-wider mb-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                <span>Clinical Presentation & Triage Summary</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-normal">
                {plan.summary}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-300 uppercase tracking-wider mb-1.5">
                <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
                <span>Hemodynamic & Vital Perfusion Analysis</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-normal">
                {plan.hemodynamicAssessment}
              </p>
            </div>
          </div>

          {/* Primary Clinical Protocols */}
          {plan.primaryClinicalProtocols && plan.primaryClinicalProtocols.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Standard Clinical Guidelines Applied</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {plan.primaryClinicalProtocols.map((protocol, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-indigo-900/60 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-indigo-200">{protocol.protocolName}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block font-mono">{protocol.guideline}</span>
                    <ul className="space-y-1 pt-1">
                      {protocol.recommendedActions.map((action, aIdx) => (
                        <li key={aIdx} className="text-xs text-slate-300 flex items-start gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0"></span>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Medications (Pharmacological Directives) */}
          {plan.recommendedMedications && plan.recommendedMedications.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-blue-900/20 border border-blue-500/30 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-300 flex items-center gap-1.5">
                    <Pill className="w-3.5 h-3.5 text-blue-400" />
                    <span>Protocol-Recommended Pharmacotherapy</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Review and authorize suggested medications directly into the official Prescription Pad.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddAllMeds}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add All to Prescription Pad</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {plan.recommendedMedications.map((med, idx) => {
                  const alreadyAdded = isMedAlreadyAdded(med.name);
                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between hover:border-blue-500/40 transition-colors"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-bold text-sm text-slate-100 block">{med.name}</span>
                            {med.category && (
                              <span className="text-[10px] text-blue-300 font-mono">{med.category}</span>
                            )}
                          </div>
                          <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 text-[10px] font-mono font-bold shrink-0">
                            {med.dosage}
                          </span>
                        </div>

                        <div className="mt-1.5 text-xs text-slate-300 space-y-0.5 font-mono">
                          <div><span className="text-slate-500">Freq:</span> {med.frequency}</div>
                          <div><span className="text-slate-500">Duration:</span> {med.duration}</div>
                          {med.rationale && (
                            <p className="text-[11px] text-slate-400 italic font-sans pt-1">
                              "{med.rationale}"
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="pt-2.5 mt-2 border-t border-slate-800/80 flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => handleAddMed(med, idx)}
                          disabled={alreadyAdded}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                            alreadyAdded
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default'
                              : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                          }`}
                        >
                          {alreadyAdded ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>Added to Rx</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3 h-3" />
                              <span>+ Add to Rx</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Non-Pharmacological Interventions & Red Flags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Non-Pharmacological */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300 mb-2 flex items-center gap-1.5">
                <Apple className="w-3.5 h-3.5 text-emerald-400" />
                <span>Non-Pharmacological & Dietary Directives</span>
              </h4>
              <ul className="space-y-1.5">
                {plan.nonPharmacologicalInterventions.map((item, idx) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Red Flag Warnings */}
            <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-600/30">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-300 mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>Red Flag Warnings & Emergency Triggers</span>
              </h4>
              <ul className="space-y-1.5">
                {plan.redFlagWarnings.map((warning, idx) => (
                  <li key={idx} className="text-xs text-rose-200/90 flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0"></span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Footer: Follow-up Timeline & Quick Directive Apply */}
          <div className="pt-3 border-t border-indigo-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                <strong className="text-cyan-300">Follow-up:</strong> {plan.followUpTimeline}
              </span>
            </div>

            <button
              type="button"
              onClick={handleApplyDirectivesToNotes}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all border border-white/20 cursor-pointer"
            >
              {appliedNotesSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Directives Appended to Notes!</span>
                </>
              ) : (
                <>
                  <FileText className="w-3.5 h-3.5 text-indigo-300" />
                  <span>Append Protocol Directives to Doctor Notes</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
