import React from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Download,
  Info,
  Pill,
  Printer,
  ShieldAlert,
  Stethoscope,
  UserCheck,
  X
} from 'lucide-react';
import { PredictionResult } from '../../types';

interface PredictionResultModalProps {
  result: PredictionResult;
  onClose: () => void;
  onConsultDoctor?: (specialist: string) => void;
  onViewMedicine?: (medicineId: string) => void;
}

export const PredictionResultModal: React.FC<PredictionResultModalProps> = ({
  result,
  onClose,
  onConsultDoctor,
  onViewMedicine
}) => {
  const { predictedDisease, confidence, differentialDiagnoses, recommendedMedicines, redFlagWarnings, specialistRecommendation, dietAndLifestyle } = result;

  const handlePrint = () => {
    window.print();
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'Emergency':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'High':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Medium':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none">
        {/* Header */}
        <div className="bg-linear-to-r from-teal-900 via-teal-800 to-slate-900 text-white px-6 py-5 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Diagnostic Inference Report
              </span>
              <span className="text-xs text-slate-300 font-mono">
                ID: {result.id.slice(0, 14)}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mt-1">Clinical Evaluation Summary</h2>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handlePrint}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Print Clinical Summary"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800">
          {/* AI-Driven Triage Priority Assessment Banner */}
          {result.triageAssessment && (
            <div
              className={`rounded-xl border p-4.5 transition-all ${
                result.triageAssessment.urgencyLevel === 'Emergency'
                  ? 'bg-rose-50 border-rose-300'
                  : result.triageAssessment.urgencyLevel === 'Urgent'
                  ? 'bg-amber-50 border-amber-300'
                  : 'bg-emerald-50 border-emerald-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                      result.triageAssessment.urgencyLevel === 'Emergency'
                        ? 'bg-rose-600 text-white'
                        : result.triageAssessment.urgencyLevel === 'Urgent'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    Triage Urgency: {result.triageAssessment.urgencyLevel}
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {result.triageAssessment.priorityLabel} (ESI Level {result.triageAssessment.esiScore})
                  </span>
                </div>
                <span className="text-xs font-semibold text-slate-600">
                  Target Care Window: <strong className="text-slate-900">{result.triageAssessment.timeframeToCare}</strong>
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {result.triageAssessment.clinicalRationale}
              </p>
              <div className="mt-2 text-[11px] text-slate-500 flex flex-wrap items-center gap-3">
                <span>Setting: <strong className="text-slate-700">{result.triageAssessment.recommendedCareSetting}</strong></span>
                <span>•</span>
                <span>Vitals Impact: <strong className="text-slate-700">{result.triageAssessment.vitalSignsImpact.status}</strong></span>
              </div>
            </div>
          )}

          {/* Emergency Red Flag Box if any */}
          {redFlagWarnings.length > 0 && (
            <div className="rounded-xl bg-rose-50 border border-rose-300 p-4">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-sm mb-1.5">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <span>Clinical Precaution & Red-Flag Warnings</span>
              </div>
              <ul className="list-disc list-inside text-xs sm:text-sm text-rose-900 space-y-1">
                {redFlagWarnings.map((flag, idx) => (
                  <li key={idx} className="leading-snug">{flag}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Primary Predicted Diagnosis */}
          <div className="rounded-2xl border-2 border-teal-500/40 bg-teal-50/30 p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    {predictedDisease.name}
                  </h3>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${getUrgencyBadge(predictedDisease.urgency)}`}>
                    {predictedDisease.urgency} Urgency
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                  <span><strong>ICD-10:</strong> {predictedDisease.icd10}</span>
                  <span>•</span>
                  <span><strong>Category:</strong> {predictedDisease.category}</span>
                  <span>•</span>
                  <span><strong>Engine Model:</strong> {result.modelUsed}</span>
                </div>
              </div>

              {/* Confidence Meter */}
              <div className="text-right sm:border-l sm:border-teal-200 sm:pl-6 shrink-0">
                <div className="text-xs uppercase font-bold text-teal-800 tracking-wider">
                  Diagnostic Confidence
                </div>
                <div className="text-3xl font-black text-teal-700">
                  {confidence}%
                </div>
                <div className="w-32 h-2 bg-slate-200 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-teal-500 to-emerald-500 rounded-full"
                    style={{ width: `${confidence}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed bg-white/70 p-3.5 rounded-xl border border-teal-100">
              {predictedDisease.description}
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-teal-200/60 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <Stethoscope className="w-4 h-4 text-teal-700" />
                <span>Recommended Specialist: <strong className="text-slate-900">{specialistRecommendation}</strong></span>
              </div>
              {onConsultDoctor && (
                <button
                  onClick={() => onConsultDoctor(specialistRecommendation)}
                  className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold transition-colors cursor-pointer"
                >
                  Consult {specialistRecommendation.split('/')[0]} →
                </button>
              )}
            </div>
          </div>

          {/* Differential Diagnoses */}
          {differentialDiagnoses.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                <Info className="w-4 h-4 text-slate-500" />
                <span>Differential Diagnoses Evaluated by ML Classifier</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {differentialDiagnoses.map((diff, i) => (
                  <div key={i} className="p-3 rounded-xl border border-slate-200 bg-white shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-slate-900 text-xs truncate" title={diff.disease.name}>
                        {diff.disease.name}
                      </div>
                      <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                        {diff.probability}%
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      ICD-10: {diff.disease.icd10}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Medication Safety Audit & Cross-Reference Alerts */}
          {result.safetyAudit && result.safetyAudit.hasConflicts && (
            <div className="rounded-2xl border-2 border-rose-500 bg-rose-50/90 p-5 shadow-xs">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-sm mb-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <span>Medication Cross-Reference Safety Alert ({result.safetyAudit.totalWarningsCount} Conflicts Found)</span>
              </div>
              <p className="text-xs text-rose-800 mb-3 leading-relaxed">
                {result.safetyAudit.summaryText}
              </p>

              <div className="space-y-2.5">
                {result.safetyAudit.allergyConflicts.map((ac, idx) => (
                  <div key={`modal-allergy-${idx}`} className="bg-white p-3 rounded-xl border border-rose-300 text-xs">
                    <div className="flex items-center justify-between font-bold text-rose-900 mb-1">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                        <span>ALLERGY CONTRAINDICATION: {ac.medicineName}</span>
                      </span>
                      <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">
                        {ac.severity} Allergy
                      </span>
                    </div>
                    <div className="text-slate-700 leading-snug">
                      Patient has documented allergy to <strong>{ac.allergy}</strong>. {ac.mechanism}
                    </div>
                    <div className="mt-1.5 text-emerald-800 font-medium bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                      <strong>Recommended Safe Alternative:</strong> {ac.recommendedAlternative}
                    </div>
                  </div>
                ))}

                {result.safetyAudit.interactionConflicts.map((ic, idx) => (
                  <div key={`modal-inter-${idx}`} className="bg-white p-3 rounded-xl border border-amber-300 text-xs">
                    <div className="flex items-center justify-between font-bold text-amber-900 mb-1">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                        <span>DRUG-DRUG COLLISION: {ic.recommendedMedicine} ↔ {ic.currentMedicine}</span>
                      </span>
                      <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                        {ic.severity} Risk
                      </span>
                    </div>
                    <div className="text-slate-700 leading-snug">{ic.clinicalEffect}</div>
                    <div className="mt-1 text-slate-600 italic">
                      <strong>Recommendation:</strong> {ic.recommendation}
                    </div>
                  </div>
                ))}

                {result.safetyAudit.duplicateConflicts.map((dc, idx) => (
                  <div key={`modal-dup-${idx}`} className="bg-white p-2.5 rounded-xl border border-purple-200 text-xs text-purple-900">
                    <strong>Duplicate Therapy:</strong> {dc.medicine} with current {dc.currentMedicine}. {dc.warning}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Official Doctor Prescription or Pending Review Banner */}
          {result.doctorOrder ? (
            <div className="p-5 rounded-2xl bg-blue-50 border-2 border-blue-400 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-blue-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-600 text-white">
                        Authorized Physician Rx
                      </span>
                      <span className="text-xs text-blue-900 font-semibold">
                        License: #{result.doctorOrder.licenseNumber || 'MD-88492'}
                      </span>
                    </div>
                    <h4 className="text-base font-black text-slate-900 mt-0.5">
                      Prescribed by {result.doctorOrder.doctorName}
                    </h4>
                    <p className="text-xs text-slate-600">{result.doctorOrder.doctorSpecialty}</p>
                  </div>
                </div>

                <span className="text-xs text-slate-500">
                  Prescribed on: {new Date(result.doctorOrder.prescribedAt).toLocaleDateString()}
                </span>
              </div>

              {/* Prescribed Medicines */}
              <div className="mt-4 space-y-2.5">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Prescribed Medications to Take:
                </span>
                {result.doctorOrder.prescribedMedicines.map((med, idx) => (
                  <div key={idx} className="bg-white p-3.5 rounded-xl border border-blue-200 shadow-2xs">
                    <div className="flex justify-between items-baseline">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-800 text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-slate-900 text-sm">{med.medicineName}</span>
                        {med.genericName && (
                          <span className="text-xs text-slate-500">({med.genericName})</span>
                        )}
                      </div>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        {med.dosage}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-slate-700 flex flex-wrap gap-x-4 gap-y-1">
                      <div><strong>Frequency:</strong> {med.frequency}</div>
                      <div><strong>Duration:</strong> {med.duration}</div>
                    </div>
                    {med.instructions && (
                      <div className="mt-1 text-xs text-slate-600 italic bg-slate-50 p-2 rounded-lg">
                        <strong>Doctor's Instructions:</strong> {med.instructions}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {result.doctorOrder.clinicalNotes && (
                <div className="mt-3 p-3 bg-white/80 rounded-xl border border-blue-200 text-xs text-slate-700">
                  <strong className="text-slate-900 block mb-0.5">Doctor's Clinical Notes:</strong>
                  {result.doctorOrder.clinicalNotes}
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-amber-900">Physician Review Required for Medication</h4>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  Your symptoms and diagnostic results have been submitted to <strong>Dr. Sarah Mitchell, MD</strong> in the Clinical Provider Queue.
                  Under clinical safety guidelines, medications must be authorized and prescribed directly by the doctor based on your case.
                </p>
              </div>
            </div>
          )}

          {/* Reference Pharmacotherapy from Protocol */}
          {recommendedMedicines.length > 0 && !result.doctorOrder && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Pill className="w-4 h-4 text-teal-600" />
                  <span>Clinical Formulary Guidelines (Awaiting Doctor Authorization)</span>
                </h4>
                <span className="text-xs text-slate-400">Standard Hospital Protocol</span>
              </div>

              <div className="space-y-3">
                {recommendedMedicines.map((rec, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs hover:border-teal-300 transition-all opacity-80"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-base">
                            {rec.medicine.name}
                          </span>
                          <span className="text-xs text-slate-500">
                            ({rec.medicine.genericName})
                          </span>
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                            Doctor Rx Required
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          Standard Clinical Protocol: {rec.dosage} • {rec.duration}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lifestyle, Dietary & Precaution Guidelines */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5 text-teal-800">
                <Check className="w-4 h-4 text-teal-600" />
                <span>Precautions</span>
              </h5>
              <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                {dietAndLifestyle.precautions.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5 text-emerald-800">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Dietary Advice</span>
              </h5>
              <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                {dietAndLifestyle.diet.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5 text-sky-800">
                <Check className="w-4 h-4 text-sky-600" />
                <span>Lifestyle Measures</span>
              </h5>
              <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                {dietAndLifestyle.lifestyle.map((l, i) => (
                  <li key={i}>{l}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="text-xs text-slate-500">
            Report timestamp: {new Date(result.timestamp).toLocaleString()}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Report</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
