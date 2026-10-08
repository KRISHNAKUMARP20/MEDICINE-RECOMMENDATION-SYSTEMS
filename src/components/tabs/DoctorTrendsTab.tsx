import React from 'react';
import { TrendingUp, Activity, Users, AlertCircle } from 'lucide-react';

export const DoctorTrendsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-300" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">Health Trends</h1>
          </div>
          <p className="text-blue-200/80">Population health analytics and seasonal disease tracking.</p>
        </div>
        
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 border border-slate-200 rounded-2xl bg-white shadow-sm flex flex-col gap-2">
              <div className="flex items-center gap-2 text-slate-500 font-medium">
                <Users className="w-5 h-5 text-blue-500" /> Total Patients
              </div>
              <div className="text-3xl font-black text-slate-800">1,248</div>
              <div className="text-sm text-emerald-600 font-semibold">+12% this month</div>
            </div>
            <div className="p-5 border border-slate-200 rounded-2xl bg-white shadow-sm flex flex-col gap-2">
              <div className="flex items-center gap-2 text-slate-500 font-medium">
                <Activity className="w-5 h-5 text-indigo-500" /> Active Cases
              </div>
              <div className="text-3xl font-black text-slate-800">42</div>
              <div className="text-sm text-amber-600 font-semibold">Higher than usual</div>
            </div>
            <div className="p-5 border border-slate-200 rounded-2xl bg-white shadow-sm flex flex-col gap-2">
              <div className="flex items-center gap-2 text-slate-500 font-medium">
                <AlertCircle className="w-5 h-5 text-rose-500" /> High Risk
              </div>
              <div className="text-3xl font-black text-slate-800">7</div>
              <div className="text-sm text-rose-600 font-semibold">Requires immediate review</div>
            </div>
          </div>

          <div className="p-8 border border-slate-200 bg-slate-50 rounded-2xl flex flex-col items-center justify-center min-h-[300px] text-center">
            <TrendingUp className="w-12 h-12 text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-700">Detailed Analytics Generating</h3>
            <p className="text-slate-500 mt-2 max-w-sm">The data science engine is currently processing the latest batch of patient data to generate updated charts.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
