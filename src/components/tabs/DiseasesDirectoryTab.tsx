import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Check,
  Database,
  Filter,
  HeartPulse,
  Info,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  X
} from 'lucide-react';
import { DISEASES_DATA } from '../../data/diseases';
import { SYMPTOMS_DATA } from '../../data/symptoms';
import { ClinicalDiseaseRecord, Disease } from '../../types';
import { clinicalDatasetService } from '../../services/clinicalDatasetService';

interface DiseasesDirectoryTabProps {
  onCheckDiseaseSymptoms: (symptoms: string[]) => void;
  onViewMedicine?: (medicineId: string) => void;
}

export const DiseasesDirectoryTab: React.FC<DiseasesDirectoryTabProps> = ({
  onCheckDiseaseSymptoms,
  onViewMedicine
}) => {
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDisease, setSelectedDisease] = useState<Disease | null>(null);

  useEffect(() => {
    const load = () => {
      const normalized = clinicalDatasetService.getNormalizedDiseases();
      setDiseases(normalized.length > 0 ? normalized : DISEASES_DATA);
    };
    load();

    window.addEventListener('medassist:clinical-diseases-updated', load);
    return () => window.removeEventListener('medassist:clinical-diseases-updated', load);
  }, []);

  const categories = Array.from(new Set(diseases.map(d => d.category))).sort();

  const filteredDiseases = diseases.filter(disease => {
    const matchesSearch =
      disease.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      disease.icd10.toLowerCase().includes(searchQuery.toLowerCase()) ||
      disease.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      disease.specialist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      disease.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ((disease as ClinicalDiseaseRecord).snomedCt && (disease as ClinicalDiseaseRecord).snomedCt.includes(searchQuery));

    const matchesUrgency = selectedUrgency === 'All' || disease.urgency === selectedUrgency;
    const matchesCategory = selectedCategory === 'All' || disease.category === selectedCategory;
    return matchesSearch && matchesUrgency && matchesCategory;
  });

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

  const getSymptomName = (symId: string) => {
    const s = SYMPTOMS_DATA.find(x => x.id === symId);
    return s ? s.displayName : symId;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-700 font-bold text-xs uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4" />
            <span>Clinical Pathology Compendium</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Diseases & Clinical Guidelines</h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Pathological profiles, primary symptom signatures, specialist referral paths, and diagnostic protocols.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>{diseases.length} Professional Clinical Records</span>
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by disease name, ICD-10, SNOMED, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:border-teal-500 outline-hidden transition-all shadow-2xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs font-semibold bg-white border border-slate-200 text-slate-700 rounded-xl px-3 py-2 outline-hidden focus:border-teal-500 cursor-pointer shadow-2xs"
          >
            <option value="All">All Specialties</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Urgency Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {['All', 'Low', 'Medium', 'High', 'Emergency'].map((urg) => (
              <button
                key={urg}
                onClick={() => setSelectedUrgency(urg)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  selectedUrgency === urg ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {urg}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Diseases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDiseases.map((disease) => {
          const clinRecord = disease as ClinicalDiseaseRecord;
          return (
            <div
              key={disease.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-teal-400 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 leading-snug">
                      {disease.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 font-mono mt-0.5">
                      <span className="text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200/60 font-semibold">
                        ICD-10: {disease.icd10}
                      </span>
                      {clinRecord.snomedCt && (
                        <span className="text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          SNOMED: {clinRecord.snomedCt}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border shrink-0 ${getUrgencyBadge(disease.urgency)}`}>
                    {disease.urgency}
                  </span>
                </div>

              <div className="text-xs text-teal-700 font-medium mb-2.5">
                {disease.category}
              </div>

              <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
                {disease.description}
              </p>

              <div className="mb-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Primary Symptoms:
                </span>
                <div className="flex flex-wrap gap-1">
                  {disease.primarySymptoms.slice(0, 4).map((symId) => (
                    <span key={symId} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium">
                      {getSymptomName(symId)}
                    </span>
                  ))}
                  {disease.primarySymptoms.length > 4 && (
                    <span className="text-[10px] text-slate-400 px-1 py-0.5">+{disease.primarySymptoms.length - 4} more</span>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => setSelectedDisease(disease)}
                className="text-xs font-semibold text-teal-600 hover:text-teal-800 cursor-pointer"
              >
                View Full Protocol →
              </button>

              <button
                onClick={() => onCheckDiseaseSymptoms(disease.primarySymptoms)}
                className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                title="Populate symptom checker with this disease profile"
              >
                <HeartPulse className="w-3.5 h-3.5" />
                <span>Test Profile</span>
              </button>
            </div>
          </div>
        );
      })}
      </div>

      {/* Disease Detail Modal */}
      {selectedDisease && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-teal-900 text-white p-6 flex items-center justify-between">
              <div>
                <span className="text-xs text-teal-300 font-bold uppercase tracking-wider">
                  {selectedDisease.category} • ICD-10: {selectedDisease.icd10} {(selectedDisease as ClinicalDiseaseRecord).snomedCt ? `• SNOMED: ${(selectedDisease as ClinicalDiseaseRecord).snomedCt}` : ''}
                </span>
                <h3 className="text-2xl font-bold mt-1">{selectedDisease.name}</h3>
                <p className="text-xs text-slate-300 mt-1">Specialist: {selectedDisease.specialist}</p>
              </div>
              <button
                onClick={() => setSelectedDisease(null)}
                className="text-slate-300 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-700">
              <p className="text-slate-800 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                {selectedDisease.description}
              </p>

              <div>
                <h4 className="font-bold text-slate-900 mb-1.5">Symptom Signatures:</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedDisease.primarySymptoms.map((s, i) => (
                    <span key={i} className="px-2.5 py-1 bg-teal-50 text-teal-900 border border-teal-200 rounded-md font-semibold text-xs">
                      {getSymptomName(s)} (Primary)
                    </span>
                  ))}
                  {selectedDisease.secondarySymptoms.map((s, i) => (
                    <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs">
                      {getSymptomName(s)}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1.5">Standard First-Line Medications:</h4>
                <div className="space-y-2">
                  {selectedDisease.recommendedMedicines.map((med, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900 capitalize">{med.medicineId}</span>
                        <span className="text-xs text-slate-500 ml-2">({med.type} Therapy)</span>
                        <div className="text-xs text-slate-600 mt-0.5">{med.dosage} • {med.duration}</div>
                      </div>
                      {onViewMedicine && (
                        <button
                          onClick={() => {
                            setSelectedDisease(null);
                            onViewMedicine(med.medicineId);
                          }}
                          className="text-xs font-semibold text-teal-600 hover:underline cursor-pointer"
                        >
                          Drug Profile →
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-rose-900 mb-1.5 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>Emergency Warning Signs:</span>
                </h4>
                <ul className="list-disc list-inside text-rose-900 bg-rose-50 p-3 rounded-xl border border-rose-200 space-y-1">
                  {selectedDisease.emergencySigns.map((sign, i) => (
                    <li key={i}>{sign}</li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <h5 className="font-bold text-slate-900 mb-1">Key Precautions:</h5>
                  <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                    {selectedDisease.precautions.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <h5 className="font-bold text-slate-900 mb-1">Dietary Advice:</h5>
                  <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                    {selectedDisease.dietaryAdvice.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              <button
                onClick={() => {
                  setSelectedDisease(null);
                  onCheckDiseaseSymptoms(selectedDisease.primarySymptoms);
                }}
                className="px-4 py-2 rounded-xl bg-teal-50 text-teal-800 font-bold text-xs hover:bg-teal-100 cursor-pointer flex items-center gap-1.5"
              >
                <HeartPulse className="w-4 h-4" />
                <span>Simulate in Symptom Checker</span>
              </button>

              <button
                onClick={() => setSelectedDisease(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
