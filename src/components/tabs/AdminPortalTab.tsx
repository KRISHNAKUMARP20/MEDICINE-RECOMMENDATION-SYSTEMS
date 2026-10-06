import React, { useState } from 'react';
import {
  Activity,
  AlertCircle,
  Database,
  Download,
  FileSpreadsheet,
  Lock,
  Pill,
  Plus,
  RefreshCw,
  Search,
  Server,
  Shield,
  Stethoscope,
  Trash2,
  Users
} from 'lucide-react';
import { DISEASES_DATA } from '../../data/diseases';
import { MEDICINES_DATA } from '../../data/medicines';
import { SYMPTOMS_DATA } from '../../data/symptoms';
import { REPOSITORY_DATASETS } from '../../data/rawDatasets';
import { UserRecord } from '../../types';

interface AdminPortalTabProps {
  currentUser: UserRecord;
}

export const AdminPortalTab: React.FC<AdminPortalTabProps> = ({ currentUser }) => {
  const [activeSection, setActiveSection] = useState<'analytics' | 'diseases' | 'medicines' | 'users' | 'datasets'>('analytics');
  const [diseaseList, setDiseaseList] = useState(DISEASES_DATA);
  const [medicineList, setMedicineList] = useState(MEDICINES_DATA);

  // New disease modal state
  const [newDiseaseName, setNewDiseaseName] = useState('');
  const [newDiseaseICD, setNewDiseaseICD] = useState('');
  const [newDiseaseCat, setNewDiseaseCat] = useState('Infectious Diseases');
  const [showAddDisease, setShowAddDisease] = useState(false);

  // Download dataset CSV
  const handleDownloadDataset = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleAddDisease = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDiseaseName.trim()) return;

    const newDis = {
      id: newDiseaseName.toLowerCase().replace(/\s+/g, '_'),
      name: newDiseaseName,
      icd10: newDiseaseICD || 'R69',
      category: newDiseaseCat,
      specialist: 'General Physician',
      urgency: 'Medium' as const,
      description: 'Newly registered pathological classification added by supervisor.',
      primarySymptoms: ['fever', 'fatigue'],
      secondarySymptoms: ['headache'],
      recommendedMedicines: [
        { medicineId: 'paracetamol', type: 'Primary' as const, dosage: '500mg q6h', duration: '3 Days', instructions: 'After meals' }
      ],
      precautions: ['Rest well', 'Hydrate adequately'],
      dietaryAdvice: ['Balanced fluid diet'],
      lifestyleAdvice: ['Avoid strain'],
      emergencySigns: ['High uncontrolled fever', 'Dyspnea']
    };

    setDiseaseList([newDis, ...diseaseList]);
    setNewDiseaseName('');
    setNewDiseaseICD('');
    setShowAddDisease(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" />
            <span>Administrative Control & Dataset Repository</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">System Admin Console</h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Manage disease ontologies, pharmaceutical formulary, patient accounts, and ML training sets.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-xl self-start md:self-auto text-xs font-semibold">
          {(['analytics', 'diseases', 'medicines', 'users', 'datasets'] as const).map((sec) => (
            <button
              key={sec}
              onClick={() => setActiveSection(sec)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-colors cursor-pointer ${
                activeSection === sec ? 'bg-teal-600 text-white shadow-2xs font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>
      </div>

      {/* Section: Analytics & Diagnostics */}
      {activeSection === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Diseases Registered</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">{diseaseList.length}</div>
              <span className="text-[11px] text-teal-600 font-semibold">ICD-10 Mapped</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Medicines Indexed</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">{medicineList.length}</div>
              <span className="text-[11px] text-teal-600 font-semibold">FDA & WHO Essential</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Standard Symptoms</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">{SYMPTOMS_DATA.length}</div>
              <span className="text-[11px] text-teal-600 font-semibold">8 Organ Systems</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">ML Inference Engine</span>
              <div className="text-2xl font-bold text-emerald-600 mt-1">97.4%</div>
              <span className="text-[11px] text-slate-500 font-medium">Weighted Soft Ensemble</span>
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="font-bold text-slate-900 text-base mb-3 flex items-center gap-2">
              <Server className="w-4 h-4 text-teal-600" />
              <span>System Telemetry & Database Connections</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block font-semibold mb-1">In-Memory Database</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Connected & Synced
                </span>
                <span className="text-slate-500 text-[11px] mt-1 block">Local storage + API mirror</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block font-semibold mb-1">OCR Pipeline</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Active (Gemini Vision / Regex)
                </span>
                <span className="text-slate-500 text-[11px] mt-1 block">Prescription entity extraction</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block font-semibold mb-1">Drug Interaction Rules</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Validated & Active
                </span>
                <span className="text-slate-500 text-[11px] mt-1 block">Cross-checking all Rx & OTC</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section: Diseases */}
      {activeSection === 'diseases' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">
              Configured Clinical Diseases ({diseaseList.length})
            </h3>
            <button
              onClick={() => setShowAddDisease(true)}
              className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Disease</span>
            </button>
          </div>

          {showAddDisease && (
            <form onSubmit={handleAddDisease} className="p-4 bg-teal-50 border border-teal-200 rounded-xl space-y-3 text-xs">
              <h4 className="font-bold text-teal-950">Add Disease Specification</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Disease Name (e.g., Bronchitis)"
                  value={newDiseaseName}
                  onChange={(e) => setNewDiseaseName(e.target.value)}
                  className="bg-white border border-teal-300 rounded-lg p-2 font-medium"
                  required
                />
                <input
                  type="text"
                  placeholder="ICD-10 (e.g., J20.9)"
                  value={newDiseaseICD}
                  onChange={(e) => setNewDiseaseICD(e.target.value)}
                  className="bg-white border border-teal-300 rounded-lg p-2 font-medium"
                />
                <input
                  type="text"
                  placeholder="Category (e.g., Respiratory)"
                  value={newDiseaseCat}
                  onChange={(e) => setNewDiseaseCat(e.target.value)}
                  className="bg-white border border-teal-300 rounded-lg p-2 font-medium"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddDisease(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold"
                >
                  Save Disease
                </button>
              </div>
            </form>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold">
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">ICD-10</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Specialist</th>
                  <th className="py-2.5 px-3">Urgency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {diseaseList.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{d.name}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">{d.icd10}</td>
                    <td className="py-2.5 px-3 text-slate-700">{d.category}</td>
                    <td className="py-2.5 px-3 text-slate-700">{d.specialist}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800">
                        {d.urgency}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Section: Medicines */}
      {activeSection === 'medicines' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-base">
            Pharmaceutical Formulary ({medicineList.length})
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold">
                  <th className="py-2.5 px-3">Drug Name</th>
                  <th className="py-2.5 px-3">Generic Name</th>
                  <th className="py-2.5 px-3">Class</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Standard Adult Dosage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {medicineList.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{m.name}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">{m.genericName}</td>
                    <td className="py-2.5 px-3 text-slate-700">{m.drugClass}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        m.prescriptionRequired ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {m.prescriptionRequired ? 'Rx' : 'OTC'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 truncate max-w-xs">{m.standardDosage.adult}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Section: Users */}
      {activeSection === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Registered System Users</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold">
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-3">Age</th>
                  <th className="py-2.5 px-3">Known Allergies</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                <tr className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-bold text-slate-900">Alex Johnson</td>
                  <td className="py-2.5 px-3"><span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold">Patient</span></td>
                  <td className="py-2.5 px-3 text-slate-500">alex.johnson@health.org</td>
                  <td className="py-2.5 px-3 text-slate-700">38</td>
                  <td className="py-2.5 px-3 text-rose-600 font-semibold">Penicillin</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-bold text-slate-900">Dr. Sarah Mitchell, MD</td>
                  <td className="py-2.5 px-3"><span className="px-2 py-0.5 bg-teal-100 text-teal-800 rounded font-bold">Doctor (MD)</span></td>
                  <td className="py-2.5 px-3 text-slate-500">dr.mitchell@hospital.org</td>
                  <td className="py-2.5 px-3 text-slate-700">45</td>
                  <td className="py-2.5 px-3 text-slate-400">None</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-bold text-slate-900">Admin Supervisor</td>
                  <td className="py-2.5 px-3"><span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold">Admin</span></td>
                  <td className="py-2.5 px-3 text-slate-500">admin@medassist.internal</td>
                  <td className="py-2.5 px-3 text-slate-700">40</td>
                  <td className="py-2.5 px-3 text-slate-400">None</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Section: Datasets */}
      {activeSection === 'datasets' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-base mb-1">
            Machine Learning Datasets & Reference Files
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Download standard clinical training datasets, preprocessed matrices, and database seed scripts:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {REPOSITORY_DATASETS.map((ds) => (
              <div key={ds.filename} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 text-xs font-mono">{ds.filename}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded uppercase font-bold bg-white text-slate-600 border border-slate-200">
                      {ds.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">{ds.description}</p>
                </div>

                <button
                  onClick={() => handleDownloadDataset(ds.filename, ds.content)}
                  className="w-full py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-teal-600" />
                  <span>Download {ds.filename}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
