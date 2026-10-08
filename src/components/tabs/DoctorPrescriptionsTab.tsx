import React, { useState } from 'react';
import { Pill, Search, FileText, Download } from 'lucide-react';

interface DoctorPrescriptionsTabProps {
  prescriptions: any[];
}

export const DoctorPrescriptionsTab: React.FC<DoctorPrescriptionsTabProps> = ({ prescriptions }) => {
  const [search, setSearch] = useState('');

  const filtered = prescriptions.filter(p => 
    p.patientName?.toLowerCase().includes(search.toLowerCase()) ||
    p.disease?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Pill className="w-6 h-6 text-blue-300" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">Prescriptions</h1>
          </div>
          <p className="text-blue-200/80">View and manage all prescriptions issued to your patients.</p>
        </div>

        <div className="p-6 border-b border-slate-100">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
            <input 
              type="text"
              placeholder="Search by patient or disease..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="p-6">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-lg font-semibold text-slate-600">No prescriptions found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filtered.map(p => (
                <div key={p.id} className="border border-slate-200 rounded-2xl p-5 hover:border-blue-300 transition-colors bg-slate-50/50">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">Rx for {p.patientName}</h3>
                      <p className="text-sm text-slate-500">{p.disease} • {new Date(p.timestamp || Date.now()).toLocaleDateString()}</p>
                    </div>
                    <button onClick={() => alert(`Downloading PDF prescription for ${p.patientName}...`)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="Download Rx">
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="bg-white border border-slate-100 rounded-xl p-3 space-y-2">
                    {p.medicines.map((med: any, i: number) => (
                      <div key={i} className="flex justify-between items-center text-sm">
                        <span className="font-semibold text-slate-700">{med.name}</span>
                        <span className="text-slate-500">{med.dosage}</span>
                      </div>
                    ))}
                  </div>
                  {p.doctorNotes && (
                    <div className="mt-4 text-sm text-slate-600 bg-amber-50 p-3 rounded-xl border border-amber-100">
                      <strong>Notes:</strong> {p.doctorNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
