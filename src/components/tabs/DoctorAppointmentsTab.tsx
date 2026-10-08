import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Video, MapPin, User, CheckCircle2 } from 'lucide-react';

export const DoctorAppointmentsTab: React.FC = () => {
  const [activeView, setActiveView] = useState<'upcoming' | 'past'>('upcoming');

  const appointments = [
    { id: 1, patient: 'Sarah Jenkins', time: '09:00 AM', date: 'Today', type: 'Video Consult', status: 'upcoming', condition: 'Migraine Follow-up' },
    { id: 2, patient: 'Michael Chen', time: '10:30 AM', date: 'Today', type: 'In-Person', status: 'upcoming', condition: 'Annual Checkup' },
    { id: 3, patient: 'Emma Watson', time: '02:00 PM', date: 'Today', type: 'Video Consult', status: 'upcoming', condition: 'Test Results Review' },
    { id: 4, patient: 'Robert Taylor', time: '11:15 AM', date: 'Yesterday', type: 'In-Person', status: 'past', condition: 'Hypertension' },
  ];

  const filtered = appointments.filter(a => a.status === activeView);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <CalendarIcon className="w-6 h-6 text-blue-300" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">Appointments</h1>
          </div>
          <p className="text-blue-200/80">Manage your daily schedule and upcoming patient consultations.</p>
        </div>

        <div className="p-6">
          <div className="flex space-x-2 border-b border-slate-200 mb-6">
            <button 
              onClick={() => setActiveView('upcoming')}
              className={`pb-3 px-4 font-medium transition-colors border-b-2 ${activeView === 'upcoming' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              Upcoming
            </button>
            <button 
              onClick={() => setActiveView('past')}
              className={`pb-3 px-4 font-medium transition-colors border-b-2 ${activeView === 'past' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              Past Appointments
            </button>
          </div>

          <div className="space-y-4">
            {filtered.map(app => (
              <div key={app.id} className="border border-slate-100 bg-slate-50 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:border-blue-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{app.patient}</h3>
                    <p className="text-sm text-slate-500">{app.condition}</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 text-sm text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <CalendarIcon className="w-4 h-4 text-slate-400" /> {app.date}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" /> {app.time}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {app.type === 'Video Consult' ? <Video className="w-4 h-4 text-blue-500" /> : <MapPin className="w-4 h-4 text-emerald-500" />} 
                    <span className="font-medium">{app.type}</span>
                  </div>
                </div>

                {activeView === 'upcoming' && (
                  <button onClick={() => alert(`Starting secure ${app.type.toLowerCase()} session with ${app.patient}...`)} className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm shadow-blue-500/20">
                    Join / Start
                  </button>
                )}
                {activeView === 'past' && (
                  <div className="flex items-center gap-1 text-emerald-600 text-sm font-semibold">
                    <CheckCircle2 className="w-4 h-4" /> Completed
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
