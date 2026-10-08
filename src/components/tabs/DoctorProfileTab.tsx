import React from 'react';
import { User, Settings, Mail, Phone, MapPin, Award } from 'lucide-react';

interface DoctorProfileTabProps {
  currentUser: any;
}

export const DoctorProfileTab: React.FC<DoctorProfileTabProps> = ({ currentUser }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <User className="w-6 h-6 text-blue-300" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">Doctor Profile</h1>
          </div>
          <p className="text-blue-200/80">Manage your personal details and portal settings.</p>
        </div>

        <div className="p-6 sm:p-8 flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/3 space-y-6">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center">
              <div className="w-32 h-32 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-white shadow-md">
                <User className="w-16 h-16 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Dr. {currentUser.profile?.name || currentUser.name}</h2>
              <p className="text-blue-600 font-medium">General Practitioner</p>
            </div>
            
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
              <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-2">Contact Details</h3>
              <div className="flex items-center gap-3 text-slate-600 text-sm">
                <Mail className="w-4 h-4 text-slate-400" /> {currentUser.email}
              </div>
              <div className="flex items-center gap-3 text-slate-600 text-sm">
                <Phone className="w-4 h-4 text-slate-400" /> +1 (555) 123-4567
              </div>
              <div className="flex items-center gap-3 text-slate-600 text-sm">
                <MapPin className="w-4 h-4 text-slate-400" /> Central Hospital, NY
              </div>
            </div>
          </div>
          
          <div className="w-full md:w-2/3 space-y-6">
            <div className="border border-slate-200 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-blue-500" /> Professional Credentials
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Medical License</label>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700">MD-8842910</div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Years of Experience</label>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700">12 Years</div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Specializations</label>
                  <div className="flex gap-2 mt-2">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-100">Internal Medicine</span>
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium border border-indigo-100">Cardiology</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border border-slate-200 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5 text-slate-500" /> System Settings
              </h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                  <div>
                    <div className="font-semibold text-slate-700">Email Notifications</div>
                    <div className="text-xs text-slate-500">Receive alerts for new patient cases</div>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                </label>
                <label className="flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                  <div>
                    <div className="font-semibold text-slate-700">SMS Alerts</div>
                    <div className="text-xs text-slate-500">Emergency alerts delivered to mobile</div>
                  </div>
                  <input type="checkbox" className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                </label>
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <button onClick={() => alert('Profile settings saved successfully!')} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-sm shadow-blue-500/30">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
