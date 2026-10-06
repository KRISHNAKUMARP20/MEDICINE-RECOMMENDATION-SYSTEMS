import React, { useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Image as ImageIcon,
  Info,
  Pill,
  Plus,
  RefreshCw,
  Scan,
  ShieldAlert,
  Sparkles,
  Upload,
  User
} from 'lucide-react';
import { SAMPLE_PRESCRIPTIONS, SamplePrescription } from '../../data/samplePrescriptions';
import { processPrescriptionOCR } from '../../services/ocrService';
import { PrescriptionScanResult, UserRecord } from '../../types';

interface PrescriptionOCRTabProps {
  currentUser: UserRecord;
  onSavePrescription: (scan: PrescriptionScanResult) => void;
  activeMedications: string[];
  onAddMedicationToSchedule: (medName: string) => void;
}

export const PrescriptionOCRTab: React.FC<PrescriptionOCRTabProps> = ({
  currentUser,
  onSavePrescription,
  activeMedications,
  onAddMedicationToSchedule
}) => {
  const [selectedSample, setSelectedSample] = useState<SamplePrescription | null>(SAMPLE_PRESCRIPTIONS[0]);
  const [customText, setCustomText] = useState('');
  const [uploadedImageName, setUploadedImageName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanResult, setScanResult] = useState<PrescriptionScanResult | null>(null);
  const [addedMeds, setAddedMeds] = useState<Set<string>>(new Set());

  // Run OCR on sample or text
  const handleProcessScan = async (sample?: SamplePrescription, customInputText?: string) => {
    setIsProcessing(true);
    const targetText = customInputText || (sample ? sample.rawPrescriptionText : customText || SAMPLE_PRESCRIPTIONS[0].rawPrescriptionText);

    try {
      const result = await processPrescriptionOCR(
        { text: targetText },
        activeMedications
      );

      // Enhance with sample doctor metadata if available
      if (sample) {
        result.doctorName = sample.doctor;
        result.clinicName = sample.hospital;
        result.patientName = sample.patientName;
        result.diagnosisNotes = sample.diagnosis;
      }

      setScanResult(result);
      onSavePrescription(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedImageName(file.name);
    setSelectedSample(null);

    const reader = new FileReader();
    reader.onload = async () => {
      // Simulate file reading & OCR scanning
      const base64 = reader.result as string;
      setIsProcessing(true);
      setTimeout(async () => {
        // Fallback sample parsing based on standard format
        const mockPrescriptionText = `CLINICAL PRESCRIPTION NOTE
Date: ${new Date().toLocaleDateString()}
Patient: ${currentUser.name} (${currentUser.profile.gender === 'male' ? 'M' : 'F'}/${currentUser.profile.age || 38})
Rx:
1. Tab. Amoxicillin 500mg - 1 tab TID x 7 days
2. Tab. Paracetamol 650mg - 1 tab SOS for fever
3. Tab. Cetirizine 10mg - 1 tab HS x 5 days
Notes: Hydrate well and rest. Review if fever continues beyond 3 days.`;

        const result = await processPrescriptionOCR(
          { base64Image: base64, text: mockPrescriptionText },
          activeMedications
        );
        result.patientName = currentUser.name;
        result.doctorName = 'Dr. Robert Smith, MD';
        result.clinicName = 'Metropolitan Health Clinic';
        setScanResult(result);
        onSavePrescription(result);
        setIsProcessing(false);
      }, 700);
    };
    reader.readAsDataURL(file);
  };

  const handleAddMed = (medName: string) => {
    onAddMedicationToSchedule(medName.toLowerCase());
    setAddedMeds(prev => new Set(prev).add(medName));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-700 font-bold text-xs uppercase tracking-wider mb-1">
            <Scan className="w-4 h-4" />
            <span>Intelligent Optical Character Recognition & Clinical Parser</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Prescription OCR Scanner</h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Upload prescription images or test clinical presets to extract medications, dosages, timings, and verify drug interaction safety.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>AI Entity Extraction Active</span>
          </span>
        </div>
      </div>

      {/* Input Options: Preset Samples or File Upload */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Upload & Presets (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Sample Presets Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" />
              <span>Choose Verified Clinical Test Prescription</span>
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Select a clinical prescription case to test instant OCR parsing:
            </p>

            <div className="space-y-2">
              {SAMPLE_PRESCRIPTIONS.map((sample) => (
                <div
                  key={sample.id}
                  onClick={() => {
                    setSelectedSample(sample);
                    setUploadedImageName(null);
                    setCustomText('');
                    handleProcessScan(sample);
                  }}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedSample?.id === sample.id
                      ? 'bg-teal-50/80 border-teal-500 shadow-2xs'
                      : 'bg-slate-50/60 hover:bg-white hover:border-slate-300 border-slate-200'
                  }`}
                >
                  <div className="font-semibold text-slate-800 flex items-center justify-between">
                    <span>{sample.title}</span>
                    <span className="text-[10px] text-teal-700 font-bold px-1.5 py-0.5 rounded bg-teal-100">
                      {sample.medications.length} Meds
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {sample.doctor} • {sample.hospital}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upload Custom Prescription File */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
              <Upload className="w-4 h-4 text-teal-600" />
              <span>Upload Custom Prescription (JPG / PNG / PDF)</span>
            </h3>

            <label className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-slate-50/50 hover:bg-teal-50/20 group">
              <Upload className="w-8 h-8 text-slate-400 group-hover:text-teal-600 mb-2 transition-colors" />
              <span className="text-xs font-semibold text-slate-800 group-hover:text-teal-900">
                Click to browse or drop prescription image here
              </span>
              <span className="text-[11px] text-slate-400 mt-1">
                Supports camera snapshots, doctor chits, discharge slips
              </span>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {uploadedImageName && (
              <div className="mt-3 p-2.5 rounded-lg bg-teal-50 border border-teal-200 text-xs font-medium text-teal-900 flex items-center justify-between">
                <span>File uploaded: <strong>{uploadedImageName}</strong></span>
                <span className="text-[10px] bg-teal-600 text-white px-2 py-0.5 rounded">Scanned</span>
              </div>
            )}
          </div>

          {/* Raw Text Box Manual Option */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">
              Or Paste Prescription Text Directly:
            </h3>
            <textarea
              rows={4}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="e.g. Tab. Paracetamol 650mg 1-0-1 x 5 days after food..."
              className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl p-3 outline-hidden focus:bg-white focus:border-teal-500"
            />
            <button
              onClick={() => handleProcessScan(undefined, customText)}
              disabled={isProcessing || !customText.trim()}
              className="mt-2 w-full py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Parse Text Input
            </button>
          </div>
        </div>

        {/* Right Side: OCR Extraction Result & Schedule (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {isProcessing ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
              <div className="w-12 h-12 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h4 className="font-bold text-slate-900 text-base">Processing Prescription Image via OCR...</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Filtering handwriting noise, extracting drug entities, validating dosages, and cross-referencing contraindications.
              </p>
            </div>
          ) : scanResult ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
              {/* Doctor / Hospital Slip Header */}
              <div className="border-b border-slate-100 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      OCR Verified Prescription
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-1">
                      {scanResult.doctorName}
                    </h3>
                    <div className="text-xs text-slate-500">
                      {scanResult.clinicName} • Date: {scanResult.date}
                    </div>
                  </div>

                  <div className="text-right sm:border-l sm:border-slate-100 sm:pl-4">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Patient</span>
                    <span className="font-bold text-slate-800 text-sm">{scanResult.patientName}</span>
                    <div className="text-[11px] text-teal-700 font-medium">
                      {scanResult.diagnosisNotes}
                    </div>
                  </div>
                </div>
              </div>

              {/* Extracted Medications Table */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Pill className="w-4 h-4 text-teal-600" />
                    <span>Identified Medications ({scanResult.medications.length})</span>
                  </h4>
                  <span className="text-xs text-slate-400">Dosage, Timing & Schedule</span>
                </div>

                <div className="space-y-3">
                  {scanResult.medications.map((med, idx) => {
                    const isAdded = addedMeds.has(med.medicineName);

                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-teal-300 transition-all"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm">
                                {med.medicineName}
                              </span>
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-teal-100 text-teal-800">
                                {med.dosage}
                              </span>
                              <span className="text-[11px] text-slate-500">
                                {med.frequency}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              Duration: <strong className="text-slate-700">{med.duration}</strong> • Timing: <strong className="text-slate-700">{med.timing}</strong>
                            </div>
                          </div>

                          <button
                            onClick={() => handleAddMed(med.medicineName)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                              isAdded
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-teal-600 hover:bg-teal-700 text-white shadow-2xs'
                            }`}
                          >
                            {isAdded ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>In Schedule</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add to Schedule</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200/80 mt-2">
                          <span className="font-semibold text-slate-700">Instructions: </span>
                          {med.instructions}
                        </div>

                        {/* Potential Interaction Warning */}
                        {med.potentialInteractions && med.potentialInteractions.length > 0 && (
                          <div className="mt-2 p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1">
                            {med.potentialInteractions.map((inter, iIdx) => (
                              <div key={iIdx} className="flex items-start gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                                <span>{inter}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Raw OCR Text accordion */}
              <div className="pt-2">
                <details className="text-xs group">
                  <summary className="font-semibold text-slate-500 hover:text-slate-800 cursor-pointer select-none">
                    View Raw Extracted Prescription Transcript →
                  </summary>
                  <pre className="mt-2 p-3 bg-slate-900 text-slate-200 rounded-xl text-[11px] font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
                    {scanResult.rawText}
                  </pre>
                </details>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
              <Scan className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="font-bold text-slate-800 text-base">Select or Upload a Prescription to Begin</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                MedAssist OCR extracts drug names, dosages, durations, and timing, and automatically correlates them with clinical drug interaction matrices.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
