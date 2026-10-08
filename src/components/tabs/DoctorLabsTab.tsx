import React from 'react';
import { FlaskConical, FileText, Download, CheckCircle, Clock } from 'lucide-react';

export const DoctorLabsTab: React.FC = () => {
  const reports = [
    { id: 'LR-992', patient: 'Sarah Jenkins', test: 'Complete Blood Count (CBC)', date: 'Today', status: 'ready' },
    { id: 'LR-993', patient: 'Michael Chen', test: 'Lipid Panel', date: 'Yesterday', status: 'ready' },
    { id: 'LR-994', patient: 'Emma Watson', test: 'Thyroid Panel', date: 'Today', status: 'pending' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <FlaskConical className="w-6 h-6 text-blue-300" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">Lab Reports</h1>
          </div>
          <p className="text-blue-200/80">Review diagnostic imaging and laboratory test results.</p>
        </div>

        <div className="p-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-bold">Report ID</th>
                <th className="px-6 py-4 font-bold">Patient</th>
                <th className="px-6 py-4 font-bold">Test Type</th>
                <th className="px-6 py-4 font-bold">Date</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 font-medium text-slate-600">{report.id}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">{report.patient}</td>
                  <td className="px-6 py-4 text-slate-700">{report.test}</td>
                  <td className="px-6 py-4 text-slate-500">{report.date}</td>
                  <td className="px-6 py-4">
                    {report.status === 'ready' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">
                        <CheckCircle className="w-3 h-3" /> Ready
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-200">
                        <Clock className="w-3 h-3" /> Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => alert(`Downloading Lab Report (${report.id}) for ${report.patient}...`)}
                      disabled={report.status !== 'ready'}
                      className={`p-2 rounded-lg transition-colors inline-flex items-center gap-1 font-semibold text-sm ${report.status === 'ready' ? 'text-blue-600 hover:bg-blue-50' : 'text-slate-300 cursor-not-allowed'}`}
                    >
                      <Download className="w-4 h-4" /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
