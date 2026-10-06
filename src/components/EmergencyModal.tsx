import React from 'react';
import {
  AlertOctagon,
  HeartPulse,
  PhoneCall,
  ShieldAlert,
  X
} from 'lucide-react';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const redFlags = [
    {
      title: 'Chest Pain or Pressure',
      desc: 'Radiating pain to the jaw, neck, back, or left arm, accompanied by cold sweat or shortness of breath (Myocardial Infarction).'
    },
    {
      title: 'Signs of Stroke (F.A.S.T)',
      desc: 'Face drooping, Arm weakness, Speech difficulty, sudden loss of balance or vision loss.'
    },
    {
      title: 'Severe Respiratory Distress',
      desc: 'Inability to speak in full sentences, cyanosis (blue lips/fingernails), stridor or severe wheezing.'
    },
    {
      title: 'Anaphylactic Reaction',
      desc: 'Swelling of throat, tongue, or lips after medication or allergen exposure; sudden hives and hypotension.'
    },
    {
      title: 'Sudden Unresponsiveness / Seizure',
      desc: 'New-onset prolonged seizures or altered mental state.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full border-2 border-rose-500 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Urgent Red Header */}
        <div className="bg-rose-600 text-white p-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider bg-rose-700 px-2 py-0.5 rounded">
                Emergency Protocol
              </span>
              <h3 className="text-xl font-black mt-1">Immediate Medical Attention Required</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs sm:text-sm text-slate-700">
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 font-semibold leading-relaxed">
            MedAssist is an informational decision support tool. If you or someone near you is experiencing any of the critical symptoms below, call local emergency services immediately:
          </div>

          {/* Emergency Hotlines */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-3 bg-slate-900 text-white rounded-xl text-center">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">US & Canada</span>
              <span className="text-xl font-black text-rose-400">911</span>
            </div>
            <div className="p-3 bg-slate-900 text-white rounded-xl text-center">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Europe & UK</span>
              <span className="text-xl font-black text-amber-400">112 / 999</span>
            </div>
            <div className="p-3 bg-slate-900 text-white rounded-xl text-center">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">India</span>
              <span className="text-xl font-black text-emerald-400">102 / 108</span>
            </div>
            <div className="p-3 bg-slate-900 text-white rounded-xl text-center">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Australia</span>
              <span className="text-xl font-black text-sky-400">000</span>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-2">Red-Flag Symptoms Requiring Emergency Care:</h4>
            <div className="space-y-2">
              {redFlags.map((flag, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="font-bold text-rose-800">{flag.title}: </span>
                  <span className="text-slate-600 text-xs">{flag.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
          >
            I Understand, Close Notice
          </button>
        </div>
      </div>
    </div>
  );
};
