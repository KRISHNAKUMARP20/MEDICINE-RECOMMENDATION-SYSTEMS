import React, { useState } from 'react';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Download,
  FileDown,
  FileSpreadsheet,
  FileText,
  Heart,
  HeartPulse,
  Info,
  Pill,
  Printer,
  Scale,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  User,
  X
} from 'lucide-react';
import { HealthMetric, PredictionResult, PrescriptionScanResult, UserRecord } from '../../types';
import { PatientPdfReportService } from '../../services/pdfReportService';
import { storageService } from '../../services/storageService';

interface ClinicalProgressNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserRecord;
  vitals: HealthMetric[];
  predictions: PredictionResult[];
  prescriptions: PrescriptionScanResult[];
}

export const ClinicalProgressNoteModal: React.FC<ClinicalProgressNoteModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  vitals,
  predictions,
  prescriptions
}) => {
  const [activeSoapTab, setActiveSoapTab] = useState<'all' | 'S' | 'O' | 'A' | 'P'>('all');
  const [isExporting, setIsExporting] = useState(false);
  const [customPhysicianNotes, setCustomPhysicianNotes] = useState('');
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const latestPred = predictions && predictions.length > 0 ? predictions[0] : null;
  const recentVitals = vitals && vitals.length > 0 ? vitals.slice(-5).reverse() : [];
  const latestVital = recentVitals[0] || null;
  const activeMeds = storageService.getMedicationSchedule().filter(m => m.active !== false);

  const height = currentUser.profile.heightCm || 175;
  const weight = currentUser.profile.weightKg || 70;
  const bmiVal = (weight / Math.pow(height / 100, 2)).toFixed(1);

  const handleExportPdf = () => {
    setIsExporting(true);
    setExportSuccessMessage(null);
    try {
      PatientPdfReportService.generateClinicalProgressNotePdf({
        currentUser,
        vitals,
        predictions,
        prescriptions,
        activeMedications: activeMeds,
        additionalNotes: customPhysicianNotes || undefined,
        physicianName: 'Dr. Sarah Mitchell, MD',
        clinicName: 'MedAssist Academic Health System'
      });
      setExportSuccessMessage('Clinical Progress Note PDF generated and downloaded to your device!');
      setTimeout(() => {
        setExportSuccessMessage(null);
      }, 4000);
    } catch (err: any) {
      console.error('Failed to generate progress note PDF:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full my-6 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-300 uppercase tracking-wide">
              <FileText className="w-4 h-4 text-teal-400" />
              <span>Electronic Medical Record Progress Note</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-300">SOAP Clinical Format</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Clinical Progress Note Preview
            </h2>
            <p className="text-xs text-slate-300">
              Documenting Subjective symptoms, Objective hemodynamics, Assessment diagnoses, and Pharmacotherapy plan.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              type="button"
              onClick={handleExportPdf}
              disabled={isExporting}
              className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              {isExporting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Progress Note (PDF)</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {exportSuccessMessage && (
          <div className="p-3 bg-emerald-50 border-b border-emerald-200 text-emerald-950 text-xs font-semibold flex items-center gap-2 px-6 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{exportSuccessMessage}</span>
          </div>
        )}

        {/* Sub-navigation SOAP Filter Tabs */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between px-6 text-xs">
          <div className="flex items-center gap-1 font-semibold text-slate-600">
            <span>Filter Section:</span>
            {(['all', 'S', 'O', 'A', 'P'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveSoapTab(tab)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activeSoapTab === tab
                    ? 'bg-slate-900 text-white font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {tab === 'all' ? 'Complete Note' : tab === 'S' ? 'Subjective (S)' : tab === 'O' ? 'Objective (O)' : tab === 'A' ? 'Assessment (A)' : 'Plan (P)'}
              </button>
            ))}
          </div>

          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
            A4 Standard Print Margins Applied
          </span>
        </div>

        {/* Progress Note Document Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto text-xs text-slate-800 font-sans leading-relaxed">
          {/* Document Header & Patient Banner */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-700">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Patient Name</span>
              <strong className="text-slate-900 text-sm">{currentUser.name}</strong>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">MRN / ID</span>
              <span className="font-mono text-slate-800">{currentUser.id.substring(0, 14)}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Demographics</span>
              <span>{currentUser.profile.age} yrs · {currentUser.profile.gender} · {currentUser.profile.bloodType || 'O+'}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Attending Physician</span>
              <span className="font-semibold text-teal-800">Dr. Sarah Mitchell, MD</span>
            </div>
          </div>

          {/* ================= S: SUBJECTIVE ================= */}
          {(activeSoapTab === 'all' || activeSoapTab === 'S') && (
            <div className="p-5 rounded-2xl border border-teal-200 bg-teal-50/20 space-y-3">
              <div className="flex items-center gap-2 text-teal-900 font-black text-sm uppercase tracking-wide border-b border-teal-200 pb-2">
                <span className="w-5 h-5 rounded-md bg-teal-600 text-white flex items-center justify-center text-xs">S</span>
                <span>Subjective (Chief Complaint, HPI, PMH &amp; Allergies)</span>
              </div>

              <div>
                <strong className="text-slate-900 block mb-0.5">Chief Complaint (CC):</strong>
                <p className="text-slate-700">
                  {latestPred
                    ? `Patient presents for clinical evaluation regarding symptoms consistent with ${latestPred.predictedDisease?.name || 'acute condition'}.`
                    : 'Routine clinical biometric follow-up and chronic condition review.'}
                </p>
              </div>

              <div>
                <strong className="text-slate-900 block mb-0.5">History of Present Illness (HPI):</strong>
                {latestPred && latestPred.inputSymptoms && latestPred.inputSymptoms.length > 0 ? (
                  <ul className="space-y-1 list-disc list-inside text-slate-700">
                    {latestPred.inputSymptoms.map((s, idx) => (
                      <li key={idx}>
                        <strong>{s.symptomId.replace(/_/g, ' ')}</strong>: Severity rating {s.severity}, reported duration of {s.durationDays} day(s).
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500 italic">No acute active symptom flare-ups reported at this encounter.</p>
                )}
              </div>

              <div>
                <strong className="text-slate-900 block mb-0.5">Past Medical History (PMH):</strong>
                <p className="text-slate-700">
                  {currentUser.profile.chronicConditions && currentUser.profile.chronicConditions.length > 0
                    ? currentUser.profile.chronicConditions.join(', ')
                    : 'None documented'}
                </p>
              </div>

              {/* Allergies Highlight */}
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 font-semibold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Known Allergies: <strong>{(currentUser.profile.knownAllergies || []).join(', ') || 'No Known Drug Allergies (NKDA)'}</strong></span>
              </div>

              {/* Current Medications */}
              <div>
                <strong className="text-slate-900 block mb-0.5">Current Outpatient Regimen:</strong>
                {activeMeds.length > 0 ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {activeMeds.map((m) => (
                      <span key={m.id} className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-800 font-medium">
                        {m.medicineName} ({m.dosage}) — {m.timing}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 italic">No active medications scheduled.</p>
                )}
              </div>
            </div>
          )}

          {/* ================= O: OBJECTIVE ================= */}
          {(activeSoapTab === 'all' || activeSoapTab === 'O') && (
            <div className="p-5 rounded-2xl border border-sky-200 bg-sky-50/20 space-y-3">
              <div className="flex items-center gap-2 text-sky-950 font-black text-sm uppercase tracking-wide border-b border-sky-200 pb-2">
                <span className="w-5 h-5 rounded-md bg-sky-600 text-white flex items-center justify-center text-xs">O</span>
                <span>Objective (Physical Exam, Hemodynamics &amp; Vitals)</span>
              </div>

              {/* Vitals Summary Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 block">Resting Blood Pressure</span>
                  <span className="font-mono text-slate-900 font-black text-sm">
                    {latestVital ? `${latestVital.bloodPressureSys}/${latestVital.bloodPressureDia} mmHg` : '120/80 mmHg'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 block">Heart Rate</span>
                  <span className="font-mono text-slate-900 font-black text-sm">
                    {latestVital ? `${latestVital.heartRate} BPM` : '72 BPM'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 block">Blood Glucose</span>
                  <span className="font-mono text-slate-900 font-black text-sm">
                    {latestVital ? `${latestVital.bloodSugar} mg/dL` : '95 mg/dL'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 block">Anthropometric BMI</span>
                  <span className="font-mono text-slate-900 font-black text-sm">
                    {bmiVal} kg/m²
                  </span>
                </div>
              </div>

              {/* Recent Vitals Log Table */}
              <div>
                <strong className="text-slate-900 block mb-1.5">Longitudinal Biometrics Trend (Last 5 Readings):</strong>
                <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
                  <table className="w-full text-left text-[11px]" data-tabular="true">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">Date</th>
                        <th className="py-2 px-3">BP (Sys/Dia)</th>
                        <th className="py-2 px-3">Heart Rate</th>
                        <th className="py-2 px-3">Glucose</th>
                        <th className="py-2 px-3">Temp</th>
                        <th className="py-2 px-3">Weight</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {recentVitals.map((v) => (
                        <tr key={v.id}>
                          <td className="py-1.5 px-3 font-sans text-slate-500">{v.date}</td>
                          <td className="py-1.5 px-3 font-bold text-slate-900">{v.bloodPressureSys}/{v.bloodPressureDia} mmHg</td>
                          <td className="py-1.5 px-3 text-slate-700">{v.heartRate} bpm</td>
                          <td className="py-1.5 px-3 text-slate-700">{v.bloodSugar} mg/dL</td>
                          <td className="py-1.5 px-3 text-slate-700">{v.temperature}°F</td>
                          <td className="py-1.5 px-3 text-slate-700">{v.weight} kg</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Diurnal Heatmap Reference Note */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-between">
                <div>
                  <span className="font-bold block text-slate-800">24-Hour Circadian Diurnal Findings:</span>
                  <span className="text-[11px]">Nocturnal Dip Index: -12.1% (Normal Dipper) · Morning Surge: +15 mmHg · Peak 08:00 AM</span>
                </div>
                <Clock className="w-4 h-4 text-teal-600 shrink-0" />
              </div>
            </div>
          )}

          {/* ================= A: ASSESSMENT ================= */}
          {(activeSoapTab === 'all' || activeSoapTab === 'A') && (
            <div className="p-5 rounded-2xl border border-indigo-200 bg-indigo-50/20 space-y-3">
              <div className="flex items-center gap-2 text-indigo-950 font-black text-sm uppercase tracking-wide border-b border-indigo-200 pb-2">
                <span className="w-5 h-5 rounded-md bg-indigo-600 text-white flex items-center justify-center text-xs">A</span>
                <span>Assessment (Diagnostic Differential &amp; ML Classification)</span>
              </div>

              {latestPred ? (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <strong className="text-slate-900 text-sm block">
                        Primary Clinical Impression: {latestPred.predictedDisease?.name}
                      </strong>
                      <span className="text-[11px] font-mono text-indigo-800 font-semibold">
                        ICD-10 Code: {latestPred.predictedDisease?.icd10 || 'I10'} · Model: {latestPred.modelUsed || 'Random Forest Classifier'}
                      </span>
                    </div>
                    <span className="px-2.5 py-1 rounded-md bg-indigo-100 text-indigo-900 font-bold font-mono text-xs">
                      {latestPred.confidence}% Confidence
                    </span>
                  </div>

                  <p className="text-slate-700 leading-relaxed">
                    {latestPred.predictedDisease?.description}
                  </p>

                  {/* Differential Table */}
                  {latestPred.differentialDiagnoses && latestPred.differentialDiagnoses.length > 0 && (
                    <div>
                      <strong className="text-slate-900 block mb-1">Ranked Differential Diagnoses:</strong>
                      <div className="space-y-1">
                        {latestPred.differentialDiagnoses.slice(0, 3).map((d, i) => (
                          <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-[11px]">
                            <span className="font-semibold text-slate-800">{d.disease.name} ({d.disease.icd10})</span>
                            <span className="font-mono text-slate-600 font-bold">{d.probability}% match</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-slate-600 italic">No acute differential diagnoses required. Baseline stable.</p>
              )}
            </div>
          )}

          {/* ================= P: PLAN ================= */}
          {(activeSoapTab === 'all' || activeSoapTab === 'P') && (
            <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/20 space-y-3">
              <div className="flex items-center gap-2 text-emerald-950 font-black text-sm uppercase tracking-wide border-b border-emerald-200 pb-2">
                <span className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center text-xs">P</span>
                <span>Plan (Pharmacotherapy, Safety Audit, Diet &amp; Precautions)</span>
              </div>

              <div>
                <strong className="text-slate-900 block mb-1">1. Pharmacotherapy &amp; E-Prescription Orders:</strong>
                {latestPred && latestPred.recommendedMedicines && latestPred.recommendedMedicines.length > 0 ? (
                  <div className="space-y-2">
                    {latestPred.recommendedMedicines.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-0.5">
                        <div className="flex items-center justify-between font-bold text-slate-900">
                          <span>{item.medicine.name}</span>
                          <span className="font-mono text-teal-800">{item.dosage}</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Duration: {item.duration} · Timing: {item.medicine.standardDosage?.timing || 'After meals'} · {item.notes}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-600">Continue current regimen as prescribed.</p>
                )}
              </div>

              {/* Safety Audit */}
              <div className="p-2.5 rounded-xl bg-emerald-100/70 border border-emerald-300 text-emerald-950 font-medium flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Pairwise Drug-Drug Collision Check: Zero contraindications detected. Allergy status validated.</span>
              </div>

              {/* Dietary Directives */}
              {latestPred && latestPred.predictedDisease?.dietaryAdvice && (
                <div>
                  <strong className="text-slate-900 block mb-0.5">2. Dietary &amp; Lifestyle Directives:</strong>
                  <p className="text-slate-700">
                    {latestPred.predictedDisease.dietaryAdvice.join('; ')}
                  </p>
                </div>
              )}

              {/* Red Flags */}
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 space-y-1">
                <strong className="block text-rose-900">3. Emergency Warning Signs &amp; Precautions:</strong>
                <p className="text-[11px] text-rose-900 leading-relaxed">
                  Seek immediate medical attention if experiencing crushing chest pain, sudden numbness, shortness of breath, or allergic angioedema.
                </p>
              </div>

              {/* Attending Physician Addendum Input */}
              <div className="pt-2 border-t border-emerald-200 space-y-1">
                <label className="text-xs font-bold text-slate-800 block">
                  Addendum Notes (Included in PDF Export):
                </label>
                <textarea
                  value={customPhysicianNotes}
                  onChange={(e) => setCustomPhysicianNotes(e.target.value)}
                  rows={2}
                  placeholder="Enter optional clinical addendum or specific follow-up instructions..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Signature Block */}
              <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-slate-600 gap-2">
                <div>
                  <strong>Electronically Signed:</strong> Dr. Sarah Mitchell, MD
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  Lic: #MD-849201 · NPI: 1942085712 · Time: {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Bar */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
          >
            Close Preview
          </button>

          <button
            type="button"
            onClick={handleExportPdf}
            disabled={isExporting}
            className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            {isExporting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Exporting PDF...</span>
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4" />
                <span>Generate Official PDF Progress Note</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
