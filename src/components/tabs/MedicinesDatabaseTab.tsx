import React, { useState, useEffect, useMemo } from 'react';
import {
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Filter,
  Info,
  Pill,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Sparkles,
  X
} from 'lucide-react';
import { MEDICINES_DATA } from '../../data/medicines';
import { checkDrugInteractions, DrugInteractionPair, normalizeDrugKey } from '../../data/drugInteractions';
import { Medicine, UserRecord } from '../../types';
import {
  geminiSideEffectsService,
  GeminiSideEffectsResult
} from '../../services/geminiSideEffectsService';
import { AutomatedProfileInteractionChecker } from '../medicines/AutomatedProfileInteractionChecker';

interface MedicinesDatabaseTabProps {
  currentUser?: UserRecord;
  activeMedications: string[];
  onToggleActiveMed: (medId: string) => void;
  onClearActiveMeds?: () => void;
  focusedMedicineId?: string | null;
}

export const MedicinesDatabaseTab: React.FC<MedicinesDatabaseTabProps> = ({
  currentUser,
  activeMedications,
  onToggleActiveMed,
  onClearActiveMeds,
  focusedMedicineId
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'OTC' | 'Rx'>('All');
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(() => {
    if (focusedMedicineId) {
      return MEDICINES_DATA.find(m => m.id === focusedMedicineId) || null;
    }
    return null;
  });

  // Gemini Side-Effects State
  const [sideEffectsMap, setSideEffectsMap] = useState<Record<string, GeminiSideEffectsResult>>({});
  const [loadingSideEffects, setLoadingSideEffects] = useState<Record<string, boolean>>({});
  const [expandedSideEffects, setExpandedSideEffects] = useState<Record<string, boolean>>({});
  const [modalLoading, setModalLoading] = useState(false);

  // Auto-fetch side effects for selected medicine in modal
  useEffect(() => {
    if (selectedMedicine) {
      const medKey = selectedMedicine.id;
      const cached = geminiSideEffectsService.getCached(medKey);
      if (cached) {
        setSideEffectsMap(prev => ({ ...prev, [medKey]: cached }));
      } else {
        fetchGeminiSideEffects(selectedMedicine);
      }
    }
  }, [selectedMedicine]);

  const fetchGeminiSideEffects = async (med: Medicine, forceRefresh = false) => {
    const medKey = med.id;
    setLoadingSideEffects(prev => ({ ...prev, [medKey]: true }));
    setModalLoading(true);

    try {
      const result = await geminiSideEffectsService.fetchSideEffects(med);
      setSideEffectsMap(prev => ({ ...prev, [medKey]: result }));
    } catch (e) {
      console.error('Failed to fetch side effects', e);
    } finally {
      setLoadingSideEffects(prev => ({ ...prev, [medKey]: false }));
      setModalLoading(false);
    }
  };

  const handleToggleInlineSideEffects = async (med: Medicine) => {
    const medKey = med.id;
    const isCurrentlyExpanded = !!expandedSideEffects[medKey];

    if (!isCurrentlyExpanded && !sideEffectsMap[medKey]) {
      await fetchGeminiSideEffects(med);
    }

    setExpandedSideEffects(prev => ({
      ...prev,
      [medKey]: !isCurrentlyExpanded
    }));
  };

  // Drug interaction checker tray
  const [interactionTray, setInteractionTray] = useState<string[]>(['ibuprofen', 'losartan']);
  const [detectedInteractions, setDetectedInteractions] = useState<DrugInteractionPair[]>(() =>
    checkDrugInteractions(['ibuprofen', 'losartan'])
  );
  const [showManualSandbox, setShowManualSandbox] = useState(false);

  // Automated Drug Interactions across all medications marked active in user profile
  const profileInteractions = useMemo(() => {
    return checkDrugInteractions(activeMedications);
  }, [activeMedications]);

  const filteredMedicines = MEDICINES_DATA.filter(med => {
    const matchesSearch =
      med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.brandNames.some(b => b.toLowerCase().includes(searchQuery.toLowerCase())) ||
      med.indications.some(i => i.toLowerCase().includes(searchQuery.toLowerCase())) ||
      med.drugClass.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterType === 'All' ||
      (filterType === 'OTC' && !med.prescriptionRequired) ||
      (filterType === 'Rx' && med.prescriptionRequired);

    return matchesSearch && matchesFilter;
  });

  const toggleTrayMed = (medId: string) => {
    let nextTray: string[];
    if (interactionTray.includes(medId)) {
      nextTray = interactionTray.filter(id => id !== medId);
    } else {
      nextTray = [...interactionTray, medId];
    }
    setInteractionTray(nextTray);
    setDetectedInteractions(checkDrugInteractions(nextTray));
  };

  const clearTray = () => {
    setInteractionTray([]);
    setDetectedInteractions([]);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-700 font-bold text-xs uppercase tracking-wider mb-1">
            <Pill className="w-4 h-4" />
            <span>Clinical Pharmacopeia & Interaction Engine</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Medicine Directory & Drug Safety</h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Search indications, dosage protocols, contraindications, and multi-drug interaction hazards.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
            {MEDICINES_DATA.length} Standard Drugs Indexed
          </span>
        </div>
      </div>

      {/* Automated Drug-Interaction Checker for Concurrently Active Profile Medications */}
      <AutomatedProfileInteractionChecker
        currentUser={currentUser}
        activeMedications={activeMedications}
        onToggleActiveMed={onToggleActiveMed}
        onClearActiveMeds={onClearActiveMeds}
        onSelectMedicineDetails={(m) => setSelectedMedicine(m)}
      />

      {/* Optional Manual Sandbox Collapsible Bar */}
      <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
        <div className="flex items-center gap-2 text-xs text-slate-700 font-semibold">
          <Sliders className="w-4 h-4 text-teal-600" />
          <span>Manual Two-Drug Sandbox ({interactionTray.length} queued)</span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            — Test arbitrary pairwise combinations not in your active profile
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowManualSandbox(!showManualSandbox)}
          className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
        >
          <span>{showManualSandbox ? 'Hide Manual Sandbox' : 'Open Manual Sandbox'}</span>
          {showManualSandbox ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Manual Drug-to-Drug Interaction Matrix Checker Tool */}
      {showManualSandbox && (
        <div className="bg-linear-to-br from-slate-900 via-slate-800 to-teal-950 text-white rounded-2xl p-6 shadow-lg animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg">Manual Sandbox Drug-to-Drug Interaction Analyzer</h3>
                <p className="text-xs text-slate-400">Select any two or more catalog medications to test for pharmacological cross-reactions</p>
              </div>
            </div>
            {interactionTray.length > 0 && (
              <button
                onClick={clearTray}
                className="text-xs text-slate-400 hover:text-white underline cursor-pointer self-start"
              >
                Clear Sandbox ({interactionTray.length})
              </button>
            )}
          </div>

          {/* Selected Drugs in Tray */}
          <div className="flex flex-wrap items-center gap-2 mb-4 min-h-[38px] p-2 rounded-xl bg-slate-800/80 border border-slate-700">
            <span className="text-xs text-slate-400 pl-1 font-medium">Selected Drugs:</span>
            {interactionTray.length === 0 ? (
              <span className="text-xs text-slate-500 italic">None selected. Click "+ Sandbox" on any drug below.</span>
            ) : (
              interactionTray.map(id => {
                const med = MEDICINES_DATA.find(m => m.id === id);
                return (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-teal-900/80 text-teal-200 border border-teal-700/60"
                  >
                    <span>{med?.name || id}</span>
                    <button
                      onClick={() => toggleTrayMed(id)}
                      className="hover:text-rose-400 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                );
              })
            )}
          </div>

          {/* Results of Interaction Analyzer */}
          {interactionTray.length < 2 ? (
            <div className="text-xs text-slate-400 bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
              💡 Add at least 2 medications to check for drug-drug interactions, CYP450 enzyme competitions, and synergy risks.
            </div>
          ) : detectedInteractions.length === 0 ? (
            <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs sm:text-sm flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>No severe pharmacokinetic or pharmacodynamic interactions documented between these selected medications.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {detectedInteractions.map((inter, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-sm text-rose-200 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <span>{inter.drugA.toUpperCase()} + {inter.drugB.toUpperCase()}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      inter.severity === 'Severe'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}>
                      {inter.severity} Interaction
                    </span>
                  </div>
                  <p className="text-slate-300 leading-snug">
                    <strong>Clinical Effect:</strong> {inter.clinicalEffect}
                  </p>
                  <p className="text-slate-400 leading-snug">
                    <strong>Mechanism:</strong> {inter.mechanism}
                  </p>
                  <p className="text-teal-300 font-medium pt-1">
                    <strong>Recommendation:</strong> {inter.recommendation}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search medicine, generic, brand, or disease..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:border-teal-500 outline-hidden transition-all shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setFilterType('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filterType === 'All' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Medicines
          </button>
          <button
            onClick={() => setFilterType('OTC')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filterType === 'OTC' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Over-the-Counter (OTC)
          </button>
          <button
            onClick={() => setFilterType('Rx')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filterType === 'Rx' ? 'bg-white text-teal-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Prescription (Rx)
          </button>
        </div>
      </div>

      {/* Medicines Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMedicines.map((med) => {
          const inTray = interactionTray.includes(med.id);
          const normId = normalizeDrugKey(med.id);
          const normName = normalizeDrugKey(med.name);
          const isActive = activeMedications.some(
            m => normalizeDrugKey(m) === normId || normalizeDrugKey(m) === normName
          );

          // Check if this medicine has an active conflict in the profile
          const activeConflict = isActive
            ? profileInteractions.find(
                pi =>
                  normalizeDrugKey(pi.drugA) === normId ||
                  normalizeDrugKey(pi.drugB) === normId ||
                  normalizeDrugKey(pi.drugA) === normName ||
                  normalizeDrugKey(pi.drugB) === normName
              )
            : null;

          return (
            <div
              key={med.id}
              className={`rounded-2xl border p-5 shadow-xs transition-all flex flex-col justify-between ${
                activeConflict?.severity === 'Severe'
                  ? 'bg-rose-50/40 border-rose-300 ring-2 ring-rose-400/40 shadow-sm'
                  : activeConflict
                  ? 'bg-amber-50/40 border-amber-300 ring-2 ring-amber-400/30 shadow-sm'
                  : isActive
                  ? 'bg-emerald-50/30 border-emerald-400 ring-2 ring-emerald-500/20 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-teal-400 hover:shadow-md'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-slate-900 leading-tight">
                        {med.name}
                      </h3>
                      {isActive && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 shrink-0">
                          <Check className="w-2.5 h-2.5" />
                          <span>Active</span>
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">
                      {med.genericName}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span
                      className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full ${
                        med.prescriptionRequired
                          ? 'bg-amber-100 text-amber-900 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                      }`}
                    >
                      {med.prescriptionRequired ? 'Rx' : 'OTC'}
                    </span>
                    {activeConflict && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 ${
                          activeConflict.severity === 'Severe'
                            ? 'bg-rose-600 text-white animate-pulse'
                            : 'bg-amber-500 text-slate-950'
                        }`}
                        title={activeConflict.clinicalEffect}
                      >
                        <AlertTriangle className="w-2.5 h-2.5" />
                        <span>Conflict</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-xs text-teal-700 font-medium mb-2.5">
                  {med.drugClass}
                </div>

                {/* Active Interaction Warning banner on Card */}
                {activeConflict && (
                  <div
                    className={`p-2.5 rounded-xl text-xs mb-3 border space-y-1 ${
                      activeConflict.severity === 'Severe'
                        ? 'bg-rose-100/90 text-rose-950 border-rose-300'
                        : 'bg-amber-100/90 text-amber-950 border-amber-300'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1 text-[11px]">
                      <AlertOctagon className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>
                        Regimen Conflict with{' '}
                        {normalizeDrugKey(activeConflict.drugA) === normId || normalizeDrugKey(activeConflict.drugA) === normName
                          ? activeConflict.drugBName || activeConflict.drugB
                          : activeConflict.drugAName || activeConflict.drugA}:
                      </span>
                    </div>
                    <p className="text-[10px] leading-snug line-clamp-2">
                      {activeConflict.clinicalEffect}
                    </p>
                    {activeConflict.adverseEffects && activeConflict.adverseEffects.length > 0 && (
                      <div className="text-[9px] font-bold text-rose-800 flex items-center gap-1 pt-0.5">
                        <span>Hazards:</span>
                        <span className="truncate">{activeConflict.adverseEffects.join(', ')}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Brand names pill tags */}
                {med.brandNames.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {med.brandNames.map((b, bIdx) => (
                      <span key={bIdx} className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                        {b}
                      </span>
                    ))}
                  </div>
                )}

                <div className="text-xs text-slate-600 line-clamp-2 mb-3 bg-slate-50 p-2 rounded-lg">
                  <strong>Dosage:</strong> {med.standardDosage.adult}
                </div>

                {/* Inline Expandable Gemini AI Side Effects Panel */}
                {expandedSideEffects[med.id] && (
                  <div className="mb-3 p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs space-y-2 animate-fadeIn">
                    <div className="flex items-center justify-between pb-1.5 border-b border-amber-200/60">
                      <div className="flex items-center gap-1.5 font-bold text-amber-950">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>Gemini AI Adverse Profile</span>
                      </div>
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                        Gemini 3.8 Flash
                      </span>
                    </div>

                    {loadingSideEffects[med.id] ? (
                      <div className="py-3 flex items-center justify-center gap-2 text-amber-800 font-semibold">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" />
                        <span>Querying Gemini Pharmacovigilance...</span>
                      </div>
                    ) : sideEffectsMap[med.id] ? (
                      <div className="space-y-2">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-amber-900 block mb-0.5">
                            Common Side Effects:
                          </span>
                          <ul className="list-disc list-inside space-y-0.5 text-slate-700 text-[11px]">
                            {sideEffectsMap[med.id].commonSideEffects.slice(0, 3).map((e, idx) => (
                              <li key={idx} className="leading-snug">{e}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-bold text-rose-900 block mb-0.5">
                            Severe Adverse Risks:
                          </span>
                          <ul className="list-disc list-inside space-y-0.5 text-rose-900 text-[11px]">
                            {sideEffectsMap[med.id].severeSideEffects.slice(0, 2).map((e, idx) => (
                              <li key={idx} className="leading-snug">{e}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <div className="text-amber-800 text-[11px]">No adverse effects recorded.</div>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Pregnancy: <strong>Cat {med.pregnancyCategory}</strong></span>
                  <span>Form: <strong>{med.form}</strong></span>
                  <span>Est: <strong>{med.priceRange}</strong></span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {/* Mark as Active in Profile Toggle Button */}
                  <button
                    type="button"
                    onClick={() => onToggleActiveMed(med.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                        : 'bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-800 border border-slate-200'
                    }`}
                    title={isActive ? 'Click to remove from active profile' : 'Click to mark as active medication in patient profile'}
                  >
                    {isActive ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    <span>{isActive ? 'Active ✓' : '+ Active'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMedicine(med)}
                    className="py-1.5 px-2 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold text-center transition-colors cursor-pointer"
                  >
                    Details
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleInlineSideEffects(med)}
                    disabled={loadingSideEffects[med.id]}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      expandedSideEffects[med.id]
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                    title="Fetch common and severe side-effects using Gemini API"
                  >
                    <Sparkles className={`w-3.5 h-3.5 text-amber-600 ${loadingSideEffects[med.id] ? 'animate-spin' : ''}`} />
                    <span className="truncate">
                      {loadingSideEffects[med.id]
                        ? '...'
                        : expandedSideEffects[med.id]
                        ? 'Hide'
                        : 'AI Effects'}
                    </span>
                  </button>

                  {showManualSandbox && (
                    <button
                      type="button"
                      onClick={() => toggleTrayMed(med.id)}
                      className={`px-2 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer shrink-0 ${
                        inTray
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                      title="Test in manual 2-drug sandbox"
                    >
                      {inTray ? 'Tray ✓' : '+ Tray'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Medicine Detailed Modal */}
      {selectedMedicine && (() => {
        const selNormId = normalizeDrugKey(selectedMedicine.id);
        const selNormName = normalizeDrugKey(selectedMedicine.name);
        const isSelectedActive = activeMedications.some(
          m => normalizeDrugKey(m) === selNormId || normalizeDrugKey(m) === selNormName
        );
        const selectedConflict = isSelectedActive
          ? profileInteractions.find(
              pi =>
                normalizeDrugKey(pi.drugA) === selNormId ||
                normalizeDrugKey(pi.drugB) === selNormId ||
                normalizeDrugKey(pi.drugA) === selNormName ||
                normalizeDrugKey(pi.drugB) === selNormName
            )
          : null;

        return (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-teal-400 font-bold uppercase tracking-wider">
                      {selectedMedicine.drugClass}
                    </span>
                    {isSelectedActive && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 flex items-center gap-1">
                        <Check className="w-2.5 h-2.5" />
                        <span>Active in Profile</span>
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold mt-1">{selectedMedicine.name}</h3>
                  <p className="text-xs text-slate-300 font-mono mt-0.5">Generic: {selectedMedicine.genericName}</p>
                </div>
                <button
                  onClick={() => setSelectedMedicine(null)}
                  className="text-slate-400 hover:text-white p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-700">
                {/* Active Regimen Interaction Alert in Modal */}
                {selectedConflict && (
                  <div
                    className={`p-4 rounded-xl border space-y-2 ${
                      selectedConflict.severity === 'Severe'
                        ? 'bg-rose-50 border-rose-300 text-rose-950'
                        : 'bg-amber-50 border-amber-300 text-amber-950'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-sm">
                        <AlertOctagon className="w-4 h-4 text-rose-600" />
                        <span>
                          Active Regimen Interaction Warning with{' '}
                          {normalizeDrugKey(selectedConflict.drugA) === selNormId || normalizeDrugKey(selectedConflict.drugA) === selNormName
                            ? selectedConflict.drugBName || selectedConflict.drugB
                            : selectedConflict.drugAName || selectedConflict.drugA}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          selectedConflict.severity === 'Severe'
                            ? 'bg-rose-600 text-white'
                            : 'bg-amber-500 text-slate-950'
                        }`}
                      >
                        {selectedConflict.severity} Hazard
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed font-medium">
                      <strong>Clinical Effect:</strong> {selectedConflict.clinicalEffect}
                    </p>
                    <p className="text-xs leading-relaxed text-slate-700">
                      <strong>Mechanism:</strong> {selectedConflict.mechanism}
                    </p>
                    {selectedConflict.adverseEffects?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="text-[11px] font-bold text-rose-900">Highlighted Adverse Effects:</span>
                        {selectedConflict.adverseEffects.map((ae, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-rose-100 text-rose-900 font-semibold border border-rose-200">
                            {ae}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="p-2 rounded-lg bg-white/80 border border-slate-200 text-xs font-semibold text-slate-800">
                      <strong>Recommendation:</strong> {selectedConflict.recommendation}
                    </div>
                  </div>
                )}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Status</span>
                  <span className="font-semibold text-slate-800">
                    {selectedMedicine.prescriptionRequired ? 'Prescription (Rx)' : 'Over-the-Counter'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Pregnancy</span>
                  <span className="font-semibold text-slate-800">FDA Category {selectedMedicine.pregnancyCategory}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Timing</span>
                  <span className="font-semibold text-slate-800">{selectedMedicine.standardDosage.timing}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Form</span>
                  <span className="font-semibold text-slate-800">{selectedMedicine.form}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1">Standard Adult Dosage Protocol:</h4>
                <div className="p-3 bg-teal-50 border border-teal-100 rounded-xl text-teal-950 font-medium">
                  {selectedMedicine.standardDosage.adult}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1">Clinical Indications:</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedMedicine.indications.map((ind, i) => (
                    <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-md text-xs font-medium">
                      {ind}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1">Contraindications & Precautions:</h4>
                <ul className="list-disc list-inside space-y-1 text-rose-900 bg-rose-50 p-3 rounded-xl border border-rose-100">
                  {selectedMedicine.contraindications.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>

              {/* Gemini AI Side Effects & Adverse Reaction Section */}
              <div className="rounded-2xl border-2 border-amber-300 bg-linear-to-br from-amber-50/60 via-white to-rose-50/40 p-4 sm:p-5 shadow-xs space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-amber-200">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                        <span>Clinical Side-Effects & Adverse Profile</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 uppercase">
                          Gemini API
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Evidence-based common and severe adverse reactions verified by Gemini 3.8 Flash
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => fetchGeminiSideEffects(selectedMedicine, true)}
                    disabled={modalLoading}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-amber-400 text-slate-700 hover:text-amber-900 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto shadow-2xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-amber-600 ${modalLoading ? 'animate-spin' : ''}`} />
                    <span>{modalLoading ? 'Analyzing...' : 'Re-query Gemini'}</span>
                  </button>
                </div>

                {modalLoading ? (
                  <div className="py-6 flex flex-col items-center justify-center text-center space-y-2">
                    <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                    <div className="text-xs font-bold text-slate-800">
                      Fetching Adverse Effect Profile for {selectedMedicine.name} from Gemini API...
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Cross-referencing pharmacovigilance reports and common vs severe toxicity thresholds
                    </div>
                  </div>
                ) : sideEffectsMap[selectedMedicine.id] ? (
                  <div className="space-y-3.5">
                    {/* Common vs Severe 2-Column Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Common Side Effects */}
                      <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200">
                        <div className="flex items-center gap-1.5 font-bold text-amber-950 text-xs uppercase tracking-wider mb-2">
                          <AlertCircle className="w-4 h-4 text-amber-600" />
                          <span>Common Side Effects</span>
                        </div>
                        <ul className="space-y-1.5 text-xs text-slate-700">
                          {sideEffectsMap[selectedMedicine.id].commonSideEffects.map((side, i) => (
                            <li key={i} className="flex items-start gap-1.5 leading-snug">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5"></span>
                              <span>{side}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Severe & Life-Threatening Reactions */}
                      <div className="p-3.5 rounded-xl bg-rose-50/90 border border-rose-200">
                        <div className="flex items-center gap-1.5 font-bold text-rose-950 text-xs uppercase tracking-wider mb-2">
                          <ShieldAlert className="w-4 h-4 text-rose-600" />
                          <span>Severe / Critical Adverse Risks</span>
                        </div>
                        <ul className="space-y-1.5 text-xs text-rose-950">
                          {sideEffectsMap[selectedMedicine.id].severeSideEffects.map((severe, i) => (
                            <li key={i} className="flex items-start gap-1.5 leading-snug font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0 mt-1.5"></span>
                              <span>{severe}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Black Box Warning if present */}
                    {sideEffectsMap[selectedMedicine.id].blackBoxWarning && (
                      <div className="p-3 rounded-xl bg-slate-900 text-rose-200 border-2 border-rose-600 text-xs space-y-1">
                        <div className="font-black text-rose-400 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-rose-400" />
                          <span>FDA BLACK BOX / MAJOR CLINICAL WARNING</span>
                        </div>
                        <p className="leading-snug">
                          {sideEffectsMap[selectedMedicine.id].blackBoxWarning}
                        </p>
                      </div>
                    )}

                    {/* Clinical Profile Summary & Monitoring Advice */}
                    {sideEffectsMap[selectedMedicine.id].adverseEffectProfile && (
                      <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 space-y-1">
                        <strong className="text-slate-900 block font-bold">Pharmacovigilance Summary:</strong>
                        <p className="leading-relaxed">
                          {sideEffectsMap[selectedMedicine.id].adverseEffectProfile}
                        </p>
                      </div>
                    )}

                    {sideEffectsMap[selectedMedicine.id].monitoringAdvice && (
                      <div className="p-3 rounded-xl bg-teal-50/80 border border-teal-200 text-xs text-teal-950 space-y-1">
                        <strong className="text-teal-900 block font-bold">Clinical Monitoring Parameters:</strong>
                        <p className="leading-relaxed">
                          {sideEffectsMap[selectedMedicine.id].monitoringAdvice}
                        </p>
                      </div>
                    )}

                    {sideEffectsMap[selectedMedicine.id].patientCounselingPoint && (
                      <div className="p-2.5 rounded-lg bg-slate-100 text-xs text-slate-600 italic">
                        <strong>Patient Guidance:</strong> {sideEffectsMap[selectedMedicine.id].patientCounselingPoint}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>Engine: {sideEffectsMap[selectedMedicine.id].modelUsed || 'Gemini 3.8 Flash'}</span>
                      <span>Updated: {new Date(sideEffectsMap[selectedMedicine.id].fetchedAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-center">
                    <button
                      type="button"
                      onClick={() => fetchGeminiSideEffects(selectedMedicine)}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-2 mx-auto cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Fetch Side-Effects with Gemini API</span>
                    </button>
                  </div>
                )}
              </div>

              {selectedMedicine.substitutes.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Common Generic / Therapeutic Substitutes:</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedMedicine.substitutes.map((sub, i) => (
                      <span key={i} className="px-2.5 py-1 bg-sky-50 text-sky-800 rounded-md text-xs font-medium">
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => onToggleActiveMed(selectedMedicine.id)}
                className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  isSelectedActive
                    ? 'bg-rose-100 hover:bg-rose-200 text-rose-900 border border-rose-300'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                }`}
              >
                {isSelectedActive ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>{isSelectedActive ? 'Remove from Active Profile' : 'Add to Active Profile Regimen'}</span>
              </button>

              <button
                onClick={() => setSelectedMedicine(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs cursor-pointer"
              >
                Close Drug Profile
              </button>
            </div>
          </div>
        </div>
        );
      })()}
    </div>
  );
};
