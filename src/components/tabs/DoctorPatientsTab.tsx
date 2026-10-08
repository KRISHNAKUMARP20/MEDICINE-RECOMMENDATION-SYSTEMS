import React, { useMemo, useState } from 'react';
import { Search, Users, Phone, Mail, Activity, Calendar, FileText, ChevronRight } from 'lucide-react';
import { PredictionResult, UserRecord } from '../../types';

interface DoctorPatientsTabProps {
  predictions: PredictionResult[];
}

export const DoctorPatientsTab: React.FC<DoctorPatientsTabProps> = ({ predictions }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Extract unique patients from predictions
  const patients = useMemo(() => {
    const patientMap = new Map<string, any>();
    
    predictions.forEach(p => {
      const name = p.patientName || 'Unknown Patient';
      if (!patientMap.has(name)) {
        patientMap.set(name, {
          name,
          age: p.patientAge || 35,
          gender: p.patientGender || 'Unspecified',
          lastVisit: p.timestamp,
          visits: 1,
          conditions: [p.predictedDisease.name]
        });
      } else {
        const existing = patientMap.get(name);
        existing.visits += 1;
        if (new Date(p.timestamp) > new Date(existing.lastVisit)) {
          existing.lastVisit = p.timestamp;
        }
        if (!existing.conditions.includes(p.predictedDisease.name)) {
          existing.conditions.push(p.predictedDisease.name);
        }
      }
    });

    return Array.from(patientMap.values()).sort((a, b) => new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime());
  }, [predictions]);

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.conditions.some((c: string) => c.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Users className="w-6 h-6 text-blue-300" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">My Patients</h1>
          </div>
          <p className="text-blue-200/80">Manage your patient roster, view medical histories, and track follow-ups.</p>
        </div>

        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
            <input 
              type="text"
              placeholder="Search patients by name or condition..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <button onClick={() => alert('Filter options will be available when connected to the backend database.')} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-colors flex-1 sm:flex-none">
              Filter
            </button>
            <button onClick={() => alert('New Patient Intake form opened.')} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-colors shadow-sm shadow-blue-500/20 flex-1 sm:flex-none">
              + New Patient
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-bold">Patient Details</th>
                <th className="px-6 py-4 font-bold">Recent Conditions</th>
                <th className="px-6 py-4 font-bold">Last Visit</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <Users className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                    <p className="text-lg font-semibold text-slate-700">No patients found</p>
                    <p className="text-sm">Try adjusting your search criteria</p>
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                          {patient.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{patient.name}</p>
                          <p className="text-xs text-slate-500">{patient.age}y • {patient.gender}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {patient.conditions.slice(0, 2).map((c: string, i: number) => (
                          <span key={i} className="px-2 py-1 bg-slate-100 border border-slate-200 rounded-md text-[11px] font-medium text-slate-700">
                            {c}
                          </span>
                        ))}
                        {patient.conditions.length > 2 && (
                          <span className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-[11px] font-medium text-slate-500">
                            +{patient.conditions.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {new Date(patient.lastVisit).toLocaleDateString()}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 ml-5">{patient.visits} total visits</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-xs font-bold">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => alert(`Opening medical chart for ${patient.name}...`)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center gap-1 font-semibold text-sm">
                        View Chart
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
