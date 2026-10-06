import React, { useState, useEffect } from 'react';
import { Navbar, ActiveTab, ThemeColor } from './components/Navbar';
import { HomeTab } from './components/tabs/HomeTab';
import { DashboardTab } from './components/tabs/DashboardTab';
import { DoctorPortalTab } from './components/tabs/DoctorPortalTab';
import { SymptomCheckerTab } from './components/tabs/SymptomCheckerTab';
import { MedicinesDatabaseTab } from './components/tabs/MedicinesDatabaseTab';
import { DiseasesDirectoryTab } from './components/tabs/DiseasesDirectoryTab';
import { PrescriptionOCRTab } from './components/tabs/PrescriptionOCRTab';
import { AnimateImageToVideoTab } from './components/tabs/AnimateImageToVideoTab';
import { MLStudioTab } from './components/tabs/MLStudioTab';
import { AIChatbotTab } from './components/tabs/AIChatbotTab';
import { HealthRecordsTab } from './components/tabs/HealthRecordsTab';
import { AdminPortalTab } from './components/tabs/AdminPortalTab';
import { ProjectExplorerTab } from './components/tabs/ProjectExplorerTab';
import { EmergencyModal } from './components/EmergencyModal';
import { PredictionResultModal } from './components/tabs/PredictionResultModal';
import {
  DoctorConsultationOrder,
  DoctorNotification,
  HealthMetric,
  PredictionResult,
  PrescriptionScanResult,
  UserRecord
} from './types';
import { storageService } from './services/storageService';
import { notificationService } from './services/notificationService';
import { LiveDoctorAlertToast } from './components/notifications/LiveDoctorAlertToast';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserRecord>(() => storageService.getUserProfile());
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [themeColor, setThemeColor] = useState<ThemeColor>(() =>
    currentUser.role === 'doctor' ? 'doctor-blue' : 'teal'
  );
  const [predictions, setPredictions] = useState<PredictionResult[]>(() => storageService.getPredictions());
  const [prescriptions, setPrescriptions] = useState<PrescriptionScanResult[]>(() => storageService.getPrescriptions());
  const [vitals, setVitals] = useState<HealthMetric[]>(() => storageService.getHealthMetrics());
  const [activeMedications, setActiveMedications] = useState<string[]>(() => 
    currentUser.profile.currentMedications && currentUser.profile.currentMedications.length > 0
      ? currentUser.profile.currentMedications
      : ['amoxicillin', 'paracetamol']
  );
  const [doctorNotifications, setDoctorNotifications] = useState<DoctorNotification[]>(() =>
    storageService.getDoctorNotifications()
  );
  const [liveAlertToast, setLiveAlertToast] = useState<DoctorNotification | null>(null);
  const [selectedDoctorCaseId, setSelectedDoctorCaseId] = useState<string | undefined>(undefined);

  // Start background medication notification scheduler and listen for live doctor notifications
  useEffect(() => {
    // notificationService.startGlobalScheduler();

    const handleDoctorNotifEvent = (e: any) => {
      const updatedList = storageService.getDoctorNotifications();
      setDoctorNotifications(updatedList);
      if (e.detail?.notification) {
        setLiveAlertToast(e.detail.notification);
        if (currentUser.role === 'doctor') {
          notificationService.playDoctorAlertChime();
        }
      }
    };

    const handleDoctorNotifUpdated = () => {
      setDoctorNotifications(storageService.getDoctorNotifications());
    };

    window.addEventListener('medassist:doctor-notification', handleDoctorNotifEvent);
    window.addEventListener('medassist:doctor-notification-updated', handleDoctorNotifUpdated);

    return () => {
      // notificationService.stopGlobalScheduler();
      window.removeEventListener('medassist:doctor-notification', handleDoctorNotifEvent);
      window.removeEventListener('medassist:doctor-notification-updated', handleDoctorNotifUpdated);
    };
  }, []);

  // Modals & transient states
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const [selectedHistoricalPrediction, setSelectedHistoricalPrediction] = useState<PredictionResult | null>(null);
  const [symptomCheckerPreload, setSymptomCheckerPreload] = useState<string[] | undefined>(undefined);
  const [focusedMedicineId, setFocusedMedicineId] = useState<string | null>(null);

  // Directly notify doctor when a patient logs in
  const handlePatientLogin = (patientUser: UserRecord) => {
    storageService.saveUserProfile(patientUser);
    setCurrentUser(patientUser);

    // DIRECT NOTIFICATION TO DOCTOR STATION:
    const newNotif = storageService.notifyDoctorOfPatientLogin(patientUser);
    setDoctorNotifications(storageService.getDoctorNotifications());
    // Only play chime and show toast if the person initiating is somehow a doctor (e.g., simulating),
    // otherwise the patient shouldn't get a doctor alert popup in their face.
    // Since patientUser becomes the current user right before this, they are a patient now.
    // So we don't play the chime or set the toast here.
    // If they switch back to doctor, they will see it in the notification center.
  };

  // Sync to local storage
  const handleSavePrediction = (newPred: PredictionResult) => {
    storageService.savePrediction(newPred);
    // Directly notify doctor of incoming symptom submission
    const newNotif = storageService.notifyDoctorOfPatientSymptomSubmission(newPred);
    setDoctorNotifications(storageService.getDoctorNotifications());
    // Only play chime and show toast if currently logged in as a doctor
    if (currentUser.role === 'doctor') {
      notificationService.playDoctorAlertChime();
      setLiveAlertToast(newNotif);
    }
    setPredictions(storageService.getPredictions());
  };

  const handleUpdatePrediction = (updatedPred: PredictionResult) => {
    storageService.updatePrediction(updatedPred);
    setPredictions(storageService.getPredictions());
  };

  const handleDoctorPrescribe = (predictionId: string, order: DoctorConsultationOrder) => {
    const currentPred = predictions.find(p => p.id === predictionId);
    if (!currentPred) return;

    const updatedPred: PredictionResult = {
      ...currentPred,
      doctorOrder: order
    };
    storageService.updatePrediction(updatedPred);
    setPredictions(storageService.getPredictions());

    // Automatically synchronize doctor-prescribed medications into the medication schedule
    order.prescribedMedicines.forEach(item => {
      storageService.addOrUpdateScheduleItem({
        id: `rx-${item.id}`,
        medicineId: item.medicineId || item.medicineName.toLowerCase().replace(/\s+/g, '-'),
        medicineName: item.medicineName,
        dosage: item.dosage,
        times: ['08:00', '20:00'],
        timing: 'After meals',
        instructions: `${item.frequency} for ${item.duration}. ${item.instructions || ''}`,
        active: true,
        color: 'blue'
      });
    });
  };

  const handleSavePrescription = (newScan: PrescriptionScanResult) => {
    storageService.savePrescription(newScan);
    setPrescriptions(storageService.getPrescriptions());
  };

  const handleAddVital = (metric: HealthMetric) => {
    storageService.saveHealthMetric(metric);
    setVitals(storageService.getHealthMetrics());
  };

  const handleUpdateUser = (updatedUser: UserRecord) => {
    storageService.saveUserProfile(updatedUser);
    setCurrentUser(updatedUser);
  };

  const handleQuickCheck = (symptoms: string[]) => {
    setSymptomCheckerPreload(symptoms);
    setActiveTab('symptom-checker');
  };

  const handleViewMedicine = (medicineId: string) => {
    setFocusedMedicineId(medicineId);
    setActiveTab('medicines');
  };

  const handleToggleActiveMed = (medId: string) => {
    setActiveMedications(prev => {
      const next = prev.includes(medId) ? prev.filter(m => m !== medId) : [...prev, medId];
      // Sync with patient profile currentMedications
      const updatedUser: UserRecord = {
        ...currentUser,
        profile: {
          ...currentUser.profile,
          currentMedications: next
        }
      };
      storageService.saveUserProfile(updatedUser);
      setCurrentUser(updatedUser);
      return next;
    });
  };

  const handleClearActiveMeds = () => {
    setActiveMedications([]);
    const updatedUser: UserRecord = {
      ...currentUser,
      profile: {
        ...currentUser.profile,
        currentMedications: []
      }
    };
    storageService.saveUserProfile(updatedUser);
    setCurrentUser(updatedUser);
  };

  const handleAddMedicationToSchedule = (medName: string) => {
    if (!activeMedications.includes(medName)) {
      setActiveMedications(prev => [...prev, medName]);
    }
    // Also save to active schedule
    const currentSchedule = storageService.getMedicationSchedule();
    const exists = currentSchedule.some(s => s.medicineName.toLowerCase() === medName.toLowerCase());
    if (!exists) {
      storageService.addOrUpdateScheduleItem({
        id: `sched-${Date.now()}`,
        medicineId: medName.toLowerCase().replace(/\s+/g, '-'),
        medicineName: medName,
        dosage: '1 Dose',
        times: ['08:00', '20:00'],
        timing: 'After meals',
        instructions: 'Take as directed with water',
        active: true,
        color: 'teal'
      });
    }
  };

  const getSelectionColor = () => {
    if (themeColor === 'doctor-blue') return 'selection:bg-blue-600 selection:text-white';
    if (themeColor === 'indigo') return 'selection:bg-indigo-600 selection:text-white';
    if (themeColor === 'slate') return 'selection:bg-slate-700 selection:text-white';
    return 'selection:bg-teal-700 selection:text-white';
  };

  return (
    <div className={`min-h-screen bg-slate-50/70 text-slate-800 flex flex-col font-sans ${getSelectionColor()}`}>
      {/* Live Doctor Alert Floating Toast */}
      {currentUser.role === 'doctor' && (
        <LiveDoctorAlertToast
          notification={liveAlertToast}
          onDismiss={() => setLiveAlertToast(null)}
          onOpenDoctorPortal={(caseId) => {
            if (caseId) setSelectedDoctorCaseId(caseId);
            setActiveTab('doctor-portal');
          }}
        />
      )}

      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        setCurrentUser={handleUpdateUser}
        themeColor={themeColor}
        setThemeColor={setThemeColor}
        doctorNotifications={doctorNotifications}
        onMarkDoctorNotificationRead={(id) => storageService.markDoctorNotificationAsRead(id)}
        onMarkAllDoctorNotificationsRead={() => storageService.markAllDoctorNotificationsAsRead()}
        onClearDoctorNotifications={() => storageService.clearDoctorNotifications()}
        onPatientLogin={handlePatientLogin}
        onOpenDoctorCase={(caseId) => {
          if (caseId) setSelectedDoctorCaseId(caseId);
          setActiveTab('doctor-portal');
        }}
        onEmergencyClick={() => setEmergencyModalOpen(true)}
      />

      {/* Patient Active Connection Banner when in Patient Mode */}
      {currentUser.role === 'patient' && (
        <div className="bg-slate-900/95 border-b border-slate-800 text-slate-300 text-xs px-4 py-1.5 flex items-center justify-between">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="font-semibold text-white">
                Active Telemetry Session: {currentUser.name}
              </span>
              <span className="text-slate-500 hidden sm:inline" aria-hidden="true">·</span>
              <span className="text-slate-400 hidden sm:inline text-[11px]">
                Attending Physician: <strong className="text-slate-200">Dr. Sarah Mitchell, MD</strong>
              </span>
            </div>
            <button
              onClick={() => {
                // Quick switch to doctor view to check alerts
                const docUser: UserRecord = {
                  ...currentUser,
                  role: 'doctor',
                  name: 'Dr. Sarah Mitchell, MD',
                  email: 'dr.mitchell@hospital.org'
                };
                handleUpdateUser(docUser);
                setActiveTab('doctor-portal');
                setThemeColor('doctor-blue');
              }}
              className="text-teal-400 hover:text-teal-300 font-semibold cursor-pointer text-[11px] flex items-center gap-1 transition-colors"
            >
              <span>Switch to Doctor Station</span>
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Tab Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {activeTab === 'home' && (
          <HomeTab
            currentUser={currentUser}
            setCurrentUser={handleUpdateUser}
            setActiveTab={setActiveTab}
            onPatientLogin={handlePatientLogin}
            setThemeColor={setThemeColor}
            onEmergencyClick={() => setEmergencyModalOpen(true)}
          />
        )}

        {activeTab === 'doctor-portal' && (
          <DoctorPortalTab
            currentUser={currentUser}
            predictions={predictions}
            onUpdatePrediction={handleUpdatePrediction}
            onPrescribeToPatient={handleDoctorPrescribe}
            onNavigateToSymptomChecker={() => setActiveTab('symptom-checker')}
            onViewMedicine={handleViewMedicine}
            doctorNotifications={doctorNotifications}
            selectedCaseIdOverride={selectedDoctorCaseId}
            onSimulatePatientLogin={() => {
              handlePatientLogin({
                id: `patient-alex-${Date.now()}`,
                name: 'Alex Johnson',
                email: 'alex.johnson@health.org',
                role: 'patient',
                createdAt: new Date().toISOString(),
                profile: {
                  name: 'Alex Johnson',
                  age: 38,
                  gender: 'male',
                  knownAllergies: ['Penicillin'],
                  currentMedications: ['paracetamol']
                }
              });
            }}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardTab
            setActiveTab={setActiveTab}
            currentUser={currentUser}
            recentPredictions={predictions}
            recentPrescriptions={prescriptions}
            vitals={vitals}
            onQuickCheck={handleQuickCheck}
          />
        )}

        {activeTab === 'symptom-checker' && (
          <SymptomCheckerTab
            key={symptomCheckerPreload?.join(',') || 'default'}
            currentUser={currentUser}
            onSavePrediction={handleSavePrediction}
            initialSymptoms={symptomCheckerPreload}
            onViewMedicine={handleViewMedicine}
            onNavigateToDoctorPortal={() => setActiveTab('doctor-portal')}
          />
        )}

        {activeTab === 'medicines' && (
          <MedicinesDatabaseTab
            currentUser={currentUser}
            activeMedications={activeMedications}
            onToggleActiveMed={handleToggleActiveMed}
            onClearActiveMeds={handleClearActiveMeds}
            focusedMedicineId={focusedMedicineId}
          />
        )}

        {activeTab === 'diseases' && (
          <DiseasesDirectoryTab
            onCheckDiseaseSymptoms={handleQuickCheck}
            onViewMedicine={handleViewMedicine}
          />
        )}

        {activeTab === 'prescription-ocr' && (
          <PrescriptionOCRTab
            currentUser={currentUser}
            onSavePrescription={handleSavePrescription}
            activeMedications={activeMedications}
            onAddMedicationToSchedule={handleAddMedicationToSchedule}
          />
        )}

        {activeTab === 'animate-video' && (
          <AnimateImageToVideoTab />
        )}

        {activeTab === 'ml-studio' && <MLStudioTab />}

        {activeTab === 'ai-chatbot' && (
          <AIChatbotTab
            setActiveTab={setActiveTab}
            onCheckDiseaseSymptoms={handleQuickCheck}
          />
        )}

        {activeTab === 'health-records' && (
          <HealthRecordsTab
            currentUser={currentUser}
            onUpdateUser={handleUpdateUser}
            predictions={predictions}
            prescriptions={prescriptions}
            vitals={vitals}
            onAddVital={handleAddVital}
            onSelectPrediction={(pred) => setSelectedHistoricalPrediction(pred)}
            onNavigateToDoctorPortal={() => setActiveTab('doctor-portal')}
          />
        )}

        {activeTab === 'admin-portal' && (
          <AdminPortalTab currentUser={currentUser} />
        )}

        {activeTab === 'project-explorer' && <ProjectExplorerTab />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-6 px-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Medicine-Recommendation-System</span>
            <span>•</span>
            <span>Clinical ML & Pharmacotherapy Decision Support Platform</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setActiveTab('home')}
              className="hover:text-teal-700 underline cursor-pointer"
            >
              Home
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveTab('project-explorer')}
              className="hover:text-teal-700 underline cursor-pointer"
            >
              Repository Architecture
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveTab('ml-studio')}
              className="hover:text-teal-700 underline cursor-pointer"
            >
              ML Benchmark Matrix
            </button>
            <span>•</span>
            <button
              onClick={() => setEmergencyModalOpen(true)}
              className="hover:text-rose-600 font-bold cursor-pointer"
            >
              Emergency Protocols
            </button>
          </div>
        </div>
      </footer>

      {/* Emergency Notice Modal */}
      <EmergencyModal
        isOpen={emergencyModalOpen}
        onClose={() => setEmergencyModalOpen(false)}
      />

      {/* Historical Prediction Modal Preview */}
      {selectedHistoricalPrediction && (
        <PredictionResultModal
          result={selectedHistoricalPrediction}
          onClose={() => setSelectedHistoricalPrediction(null)}
          onViewMedicine={handleViewMedicine}
        />
      )}
    </div>
  );
}
