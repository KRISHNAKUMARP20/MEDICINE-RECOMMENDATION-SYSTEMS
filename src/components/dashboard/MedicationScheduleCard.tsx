import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellOff,
  BellRing,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Edit2,
  Info,
  Pill,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  Volume2,
  VolumeX,
  X,
  Zap
} from 'lucide-react';
import { DoseLog, MedicationScheduleItem } from '../../types';
import { notificationService } from '../../services/notificationService';
import { storageService } from '../../services/storageService';
import { MEDICINES_DATA } from '../../data/medicines';

interface MedicationScheduleCardProps {
  schedule: MedicationScheduleItem[];
  onUpdateSchedule: (newSchedule: MedicationScheduleItem[]) => void;
  doseLogs: DoseLog[];
  onLogDose: (scheduleId: string, medicineName: string, scheduledTime: string) => void;
  onTriggerTestReminder: (item?: MedicationScheduleItem) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  notificationPermission: NotificationPermission | 'unsupported';
  onRequestPermission: () => Promise<void>;
}

export const MedicationScheduleCard: React.FC<MedicationScheduleCardProps> = ({
  schedule,
  onUpdateSchedule,
  doseLogs,
  onLogDose,
  onTriggerTestReminder,
  soundEnabled,
  onToggleSound,
  notificationPermission,
  onRequestPermission
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MedicationScheduleItem | null>(null);

  // Form State for Adding / Editing
  const [formMedName, setFormMedName] = useState('');
  const [formDosage, setFormDosage] = useState('500mg');
  const [formTimes, setFormTimes] = useState<string[]>(['08:00', '20:00']);
  const [formTiming, setFormTiming] = useState('After meals');
  const [formInstructions, setFormInstructions] = useState('Take with a full glass of water');
  const [customTimeInput, setCustomTimeInput] = useState('12:00');

  const today = new Date().toISOString().split('T')[0];
  const todayLogs = doseLogs.filter(l => l.date === today && l.status === 'taken');

  // Calculate daily dose metrics
  let totalDosesScheduledToday = 0;
  schedule.filter(s => s.active).forEach(s => {
    totalDosesScheduledToday += s.times.length;
  });
  const takenCount = todayLogs.length;
  const adherencePercent = totalDosesScheduledToday > 0
    ? Math.round((Math.min(takenCount, totalDosesScheduledToday) / totalDosesScheduledToday) * 100)
    : 100;

  // Next upcoming dose
  const nextDose = notificationService.getNextDose(schedule, todayLogs);

  const openAddModal = () => {
    setEditingItem(null);
    setFormMedName('');
    setFormDosage('500mg (1 Tablet)');
    setFormTimes(['08:00', '20:00']);
    setFormTiming('After meals');
    setFormInstructions('Take with a glass of water after food');
    setIsModalOpen(true);
  };

  const openEditModal = (item: MedicationScheduleItem) => {
    setEditingItem(item);
    setFormMedName(item.medicineName);
    setFormDosage(item.dosage);
    setFormTimes([...item.times]);
    setFormTiming(item.timing);
    setFormInstructions(item.instructions);
    setIsModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formMedName.trim() || formTimes.length === 0) return;

    if (editingItem) {
      const updated: MedicationScheduleItem = {
        ...editingItem,
        medicineName: formMedName.trim(),
        dosage: formDosage.trim(),
        times: [...formTimes].sort(),
        timing: formTiming,
        instructions: formInstructions.trim()
      };
      const newSchedule = schedule.map(s => s.id === updated.id ? updated : s);
      onUpdateSchedule(newSchedule);
    } else {
      const newItem: MedicationScheduleItem = {
        id: `sched-${Date.now()}`,
        medicineId: formMedName.toLowerCase().replace(/\s+/g, '-'),
        medicineName: formMedName.trim(),
        dosage: formDosage.trim() || '1 Dose',
        times: [...formTimes].sort(),
        timing: formTiming,
        instructions: formInstructions.trim(),
        active: true,
        color: 'teal'
      };
      onUpdateSchedule([...schedule, newItem]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteItem = (id: string) => {
    const updated = schedule.filter(s => s.id !== id);
    onUpdateSchedule(updated);
  };

  const handleToggleItemActive = (id: string) => {
    const updated = schedule.map(s => s.id === id ? { ...s, active: !s.active } : s);
    onUpdateSchedule(updated);
  };

  const addTimeSlot = (time: string) => {
    if (!formTimes.includes(time)) {
      setFormTimes(prev => [...prev, time].sort());
    }
  };

  const removeTimeSlot = (time: string) => {
    setFormTimes(prev => prev.filter(t => t !== time));
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
      {/* Top Header & Notification Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-700 mb-1">
            <BellRing className="w-4 h-4 text-teal-600" />
            <span>Active Medication Schedule & Alarm System</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Prescription Regimen & Reminders
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Automated browser notifications and gentle audio chimes alert you exactly when it's time to take your doses.
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Permission Status / Request Button */}
          {notificationPermission === 'granted' ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Browser Alerts: Active</span>
            </div>
          ) : notificationPermission === 'denied' ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold" title="Browser blocked notifications. In-app alerts remain active.">
              <BellOff className="w-3.5 h-3.5 text-amber-600" />
              <span>In-App Alerts Active</span>
            </div>
          ) : (
            <button
              onClick={onRequestPermission}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Enable Browser Notifications</span>
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              soundEnabled
                ? 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
            }`}
            title={soundEnabled ? 'Audio chime enabled (Click to mute)' : 'Audio chime muted (Click to enable)'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-teal-600" /> : <VolumeX className="w-4 h-4 text-rose-500" />}
            <span className="hidden sm:inline">{soundEnabled ? 'Chime On' : 'Chime Muted'}</span>
          </button>

          {/* Test Alert Button */}
          <button
            onClick={() => onTriggerTestReminder()}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-800 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            title="Immediately test browser notification and audio chime"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Test Alert Now</span>
          </button>

          {/* Add Medicine Button */}
          <button
            onClick={openAddModal}
            className="px-3.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-teal-600" />
            <span>Add Medicine</span>
          </button>
        </div>
      </div>

      {/* Adherence & Regimen Status Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Daily Compliance Bar */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Today's Medication Adherence</span>
            </span>
            <span className="font-bold text-slate-900">
              {takenCount} of {totalDosesScheduledToday} doses taken ({adherencePercent}%)
            </span>
          </div>

          <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                adherencePercent >= 80 ? 'bg-emerald-500' : adherencePercent >= 50 ? 'bg-teal-500' : 'bg-amber-500'
              }`}
              style={{ width: `${Math.min(adherencePercent, 100)}%` }}
            ></div>
          </div>

          <div className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
            <span>Consistent timing optimizes therapeutic plasma levels</span>
            <span className="text-emerald-700 font-semibold">
              {takenCount === totalDosesScheduledToday && totalDosesScheduledToday > 0 ? '✓ Goal Achieved' : `${totalDosesScheduledToday - takenCount} remaining`}
            </span>
          </div>
        </div>

        {/* Regimen Summary */}
        <div className="p-4 rounded-xl bg-linear-to-br from-teal-50/70 to-emerald-50/40 border border-teal-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-teal-800">
                Active Prescription Regimen
              </div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">
                {schedule.filter(s => s.active).length} Active Medicines • {totalDosesScheduledToday} Scheduled Doses / Day
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Alarms enabled for morning, afternoon & evening slots
              </div>
            </div>
          </div>
          <button
            onClick={openAddModal}
            className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shrink-0 transition-colors shadow-2xs cursor-pointer"
          >
            + Add Med
          </button>
        </div>
      </div>

      {/* Medication Regimen Cards */}
      <div className="space-y-3">
        {schedule.length === 0 ? (
          <div className="text-center py-8 px-4 border border-dashed border-slate-200 rounded-xl">
            <Pill className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <div className="text-sm font-semibold text-slate-700">No scheduled medications</div>
            <p className="text-xs text-slate-400 mt-0.5 mb-3">Add your prescribed medicines to receive timed alerts.</p>
            <button
              onClick={openAddModal}
              className="px-3.5 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-bold cursor-pointer"
            >
              Add First Medicine
            </button>
          </div>
        ) : (
          schedule.map((item) => {
            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all ${
                  item.active
                    ? 'bg-white border-slate-200 hover:border-teal-300'
                    : 'bg-slate-50/70 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Medicine Name & Instructions */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0 mt-0.5">
                      <Pill className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                          {item.medicineName}
                        </h4>
                        <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                          {item.dosage}
                        </span>
                        <span className="text-[11px] font-medium px-2 py-0.5 bg-teal-50 text-teal-800 rounded-md border border-teal-100">
                          {item.timing}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {item.instructions || 'Take as directed'}
                      </p>
                    </div>
                  </div>

                  {/* Actions: Edit, Test, Pause, Delete */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => onTriggerTestReminder(item)}
                      className="p-1.5 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-colors cursor-pointer"
                      title="Test alarm for this medicine"
                    >
                      <Bell className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                      title="Edit schedule & times"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleItemActive(item.id)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                        item.active
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                      }`}
                    >
                      {item.active ? 'Pause' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Remove from schedule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Alarm Time Slots */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                    Scheduled Doses:
                  </span>
                  {item.times.map((time) => {
                    const isTaken = todayLogs.some(
                      l => l.scheduleId === item.id && l.scheduledTime === time
                    );
                    const formatted = notificationService.formatTime12h(time);

                    return (
                      <div
                        key={time}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                          isTaken
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200/80 hover:border-teal-400'
                        }`}
                      >
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{formatted}</span>
                        {isTaken ? (
                          <span className="flex items-center gap-0.5 text-emerald-600 text-[11px] font-bold">
                            <Check className="w-3 h-3" />
                            <span>Taken</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => onLogDose(item.id, item.medicineName, time)}
                            className="ml-1 text-[11px] font-bold text-teal-700 hover:text-teal-900 underline cursor-pointer"
                            title="Log as taken today"
                          >
                            Mark Taken
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Schedule Edit / Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center">
                  <Pill className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">
                    {editingItem ? 'Edit Medication Schedule' : 'Add Medication Reminder'}
                  </h3>
                  <p className="text-xs text-slate-400">Set scheduled reminder alarms and dosage instructions</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="p-5 space-y-4 text-xs sm:text-sm">
              {/* Medicine Name */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Medicine Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amoxicillin, Ibuprofen, Metformin"
                  value={formMedName}
                  onChange={(e) => setFormMedName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Dosage & Timing */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Dosage *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 500mg (1 Tablet)"
                    value={formDosage}
                    onChange={(e) => setFormDosage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Meal Timing
                  </label>
                  <select
                    value={formTiming}
                    onChange={(e) => setFormTiming(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  >
                    <option value="After meals">After meals</option>
                    <option value="Before meals">Before meals</option>
                    <option value="With food">With food</option>
                    <option value="At bedtime">At bedtime</option>
                    <option value="Anytime">Anytime</option>
                  </select>
                </div>
              </div>

              {/* Reminder Alarm Times */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Daily Reminder Times ({formTimes.length} set) *
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {formTimes.map(t => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 font-bold text-xs"
                    >
                      <Clock className="w-3 h-3 text-teal-600" />
                      <span>{notificationService.formatTime12h(t)}</span>
                      <button
                        type="button"
                        onClick={() => removeTimeSlot(t)}
                        className="hover:text-rose-600 cursor-pointer ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                {/* Quick Add Presets */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 mb-2">
                  <span className="font-semibold text-slate-700">Quick presets:</span>
                  {[
                    { label: 'Morning (08:00)', val: '08:00' },
                    { label: 'Noon (13:00)', val: '13:00' },
                    { label: 'Evening (18:00)', val: '18:00' },
                    { label: 'Night (21:00)', val: '21:00' }
                  ].map(p => (
                    <button
                      key={p.val}
                      type="button"
                      onClick={() => addTimeSlot(p.val)}
                      disabled={formTimes.includes(p.val)}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold border cursor-pointer ${
                        formTimes.includes(p.val)
                          ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                      }`}
                    >
                      +{p.label}
                    </button>
                  ))}
                </div>

                {/* Custom Time Picker */}
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={customTimeInput}
                    onChange={(e) => setCustomTimeInput(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <button
                    type="button"
                    onClick={() => addTimeSlot(customTimeInput)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
                  >
                    Add Specific Time
                  </button>
                </div>
              </div>

              {/* Special Instructions */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Special Instructions
                </label>
                <textarea
                  rows={2}
                  value={formInstructions}
                  onChange={(e) => setFormInstructions(e.target.value)}
                  placeholder="e.g. Take with plenty of water, avoid grapefruit juice..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>

              {/* Modal Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-2xs cursor-pointer"
                >
                  {editingItem ? 'Save Changes' : 'Add to Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
