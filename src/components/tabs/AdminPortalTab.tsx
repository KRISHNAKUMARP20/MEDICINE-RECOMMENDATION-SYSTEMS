import React from 'react';
import { Shield, Users, Stethoscope, User, Clock, CheckCircle2 } from 'lucide-react';
import { UserRecord } from '../../types';

interface AdminPortalTabProps {
  currentUser: UserRecord;
}

export const AdminPortalTab: React.FC<AdminPortalTabProps> = ({ currentUser }) => {
  // Mock data for currently registered/logged-in users for monitoring
  const activeUsers = [
    { id: '1', name: 'Dr. Sarah Mitchell, MD', role: 'doctor', status: 'Online', lastActive: 'Just now', email: 'dr.mitchell@hospital.org' },
    { id: '2', name: 'Alex Johnson', role: 'patient', status: 'Online', lastActive: '5 mins ago', email: 'alex.johnson@health.org' },
    { id: '3', name: 'Dr. James Wilson', role: 'doctor', status: 'Offline', lastActive: '2 hours ago', email: 'j.wilson@hospital.org' },
    { id: '4', name: 'Maria Garcia', role: 'patient', status: 'Online', lastActive: '12 mins ago', email: 'm.garcia@email.com' },
    { id: '5', name: 'Admin Supervisor', role: 'admin', status: 'Online', lastActive: 'Just now', email: 'admin@medassist.internal' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" />
            <span>System Administration & Security</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Active Sessions Monitor</h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Monitor registered patients and physicians currently accessing the clinical portal.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-800 p-2 rounded-xl text-xs font-semibold border border-slate-700">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-lg">
            <Users className="w-4 h-4" />
            <span>{activeUsers.length} Total Users</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg">
            <CheckCircle2 className="w-4 h-4" />
            <span>{activeUsers.filter(u => u.status === 'Online').length} Online</span>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Live User Directory
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm ${
                        user.role === 'doctor' ? 'bg-blue-600' : user.role === 'admin' ? 'bg-slate-800' : 'bg-teal-500'
                      }`}>
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{user.name}</div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${
                      user.role === 'doctor' 
                        ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                        : user.role === 'admin'
                        ? 'bg-slate-100 text-slate-700 border border-slate-300'
                        : 'bg-teal-50 text-teal-700 border border-teal-200'
                    }`}>
                      {user.role === 'doctor' ? <Stethoscope className="w-3.5 h-3.5" /> : user.role === 'admin' ? <Shield className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                      <span className="capitalize">{user.role}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${user.status === 'Online' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`}></span>
                      <span className={`text-xs font-bold ${user.status === 'Online' ? 'text-emerald-700' : 'text-slate-500'}`}>
                        {user.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {user.lastActive}
                    </div>
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
