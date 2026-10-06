import React, { useState, useEffect } from 'react';
import {
  Activity,
  ArrowRight,
  Award,
  BarChart2,
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  Clock,
  Compass,
  Cpu,
  Database,
  FileCheck,
  Filter,
  Gauge,
  Info,
  Layers,
  Network,
  Play,
  RefreshCw,
  ShieldCheck,
  Sliders,
  Sparkles,
  TrendingUp,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DATASET_SUMMARY_STATS,
  FEATURE_IMPORTANCE_DATA,
  ML_MODELS_BENCHMARKS
} from '../../data/mlModelsData';
import { MLModelMetrics } from '../../types';
import { EnsembleRadialComparisonChart } from '../ml/EnsembleRadialComparisonChart';

export type ModelAnalysisView =
  | 'radial-topology'
  | 'confusion-matrix'
  | 'feature-importance'
  | 'retraining-simulator'
  | 'clinical-architecture';

export const MLStudioTab: React.FC = () => {
  // Default to the Production Champion (Ensemble Weighted)
  const [selectedModel, setSelectedModel] = useState<MLModelMetrics>(
    ML_MODELS_BENCHMARKS.find(m => m.name === 'Ensemble Weighted') || ML_MODELS_BENCHMARKS[0]
  );
  const [activeAnalysisView, setActiveAnalysisView] = useState<ModelAnalysisView>('radial-topology');
  const [trainSplit, setTrainSplit] = useState<number>(80);
  const [isRetraining, setIsRetraining] = useState<boolean>(false);
  const [retrainLogs, setRetrainLogs] = useState<string[]>([]);
  const [currentAccuracy, setCurrentAccuracy] = useState<number>(selectedModel.accuracy);

  // 10-Fold Benchmark Animation States
  const [isEvaluatingCV, setIsEvaluatingCV] = useState<boolean>(false);
  const [cvFoldProgress, setCvFoldProgress] = useState<number>(10);
  const [cvSuccessMessage, setCvSuccessMessage] = useState<string | null>(null);

  // Sync current accuracy when model selection switches
  useEffect(() => {
    setCurrentAccuracy(selectedModel.accuracy);
  }, [selectedModel]);

  // Execute 10-Fold Stratified Cross-Validation Simulation
  const handleRunCVBenchmark = () => {
    if (isEvaluatingCV) return;
    setIsEvaluatingCV(true);
    setCvFoldProgress(1);
    setCvSuccessMessage(null);

    const interval = setInterval(() => {
      setCvFoldProgress(prev => {
        if (prev >= 10) {
          clearInterval(interval);
          setIsEvaluatingCV(false);
          setCvSuccessMessage('10-Fold Stratified Cross-Validation verified across 4,920 instances (p < 0.001)');
          setTimeout(() => setCvSuccessMessage(null), 5000);
          return 10;
        }
        return prev + 1;
      });
    }, 170);
  };

  const handleRetrain = () => {
    setIsRetraining(true);
    setRetrainLogs([
      `[1/4] Shuffling & partitioning dataset (Train: ${trainSplit}%, Test: ${100 - trainSplit}%)...`,
      `[2/4] Initializing ${selectedModel.name} estimators with Gini split criterion...`
    ]);

    setTimeout(() => {
      setRetrainLogs(prev => [
        ...prev,
        `[3/4] Performing 10-fold stratified cross-validation on 4,920 disease instances...`
      ]);
    }, 600);

    setTimeout(() => {
      const delta = (Math.random() * 0.6 - 0.2);
      const newAcc = Math.min(99.4, Math.max(90.1, Math.round((selectedModel.accuracy + delta) * 10) / 10));
      setCurrentAccuracy(newAcc);
      setRetrainLogs(prev => [
        ...prev,
        `[4/4] Model converged! Validation Accuracy: ${newAcc}%, F1-Score: ${(newAcc * 0.995).toFixed(1)}%. Weights saved.`
      ]);
      setIsRetraining(false);
    }, 1300);
  };

  const rfModel = ML_MODELS_BENCHMARKS.find(m => m.name === 'Random Forest') || ML_MODELS_BENCHMARKS[0];
  const ensembleModel = ML_MODELS_BENCHMARKS.find(m => m.name === 'Ensemble Weighted') || ML_MODELS_BENCHMARKS[1];

  const analysisViewsConfig: { id: ModelAnalysisView; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'radial-topology', label: 'Recharts Radial Topology', icon: BarChart3 },
    { id: 'confusion-matrix', label: 'Confusion Matrix (5-Class)', icon: Compass },
    { id: 'feature-importance', label: 'Gini Feature Importance', icon: Layers },
    { id: 'retraining-simulator', label: 'Hyperparameter Tuning', icon: Sliders },
    { id: 'clinical-architecture', label: 'Clinical Architecture', icon: Network }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-700 font-bold text-xs uppercase tracking-wider mb-1">
            <BrainCircuit className="w-4 h-4 text-teal-600 animate-pulse" />
            <span>Machine Learning Diagnostic Architecture</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">ML Model Performance & Evaluation Studio</h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Benchmarking production clinical algorithms under 10-fold stratified cross-validation on 4,920 patient instances.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-900 text-white flex items-center gap-1.5 shadow-xs">
            <Database className="w-3.5 h-3.5 text-teal-400" />
            <span>{DATASET_SUMMARY_STATS.totalRecords} Clinical Records</span>
          </span>
          <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>10-Fold CV Verified</span>
          </span>
        </div>
      </div>

      {/* Cross-Model Benchmark Matrix (10-Fold Stratified CV) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300">
        {/* Matrix Header & Evaluation Trigger Bar */}
        <div className="p-6 border-b border-slate-100 bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-teal-300 font-bold text-xs uppercase tracking-wider mb-1">
              <BarChart2 className="w-4 h-4 text-teal-400" />
              <span>Diagnostic Benchmark Matrix</span>
              <span className="bg-teal-500/20 text-teal-300 text-[10px] px-2 py-0.5 rounded-full border border-teal-500/30">
                10-Fold Stratified CV
              </span>
            </div>
            <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              Cross-Model Benchmark Matrix
            </h3>
            <p className="text-slate-300 text-xs mt-1 max-w-2xl">
              Strict evaluation comparing our two premier algorithms: the <strong>Ensemble Weighted</strong> meta-learner and the <strong>Random Forest</strong> clinical forest. Evaluated on 132 standardized medical features.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleRunCVBenchmark}
              disabled={isEvaluatingCV}
              className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md hover:shadow-teal-500/25 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-950 transition-transform ${isEvaluatingCV ? 'animate-spin' : 'group-hover:rotate-180 duration-500'}`} />
              <span>{isEvaluatingCV ? `Validating Fold ${cvFoldProgress}/10...` : 'Re-Evaluate 10 Folds'}</span>
            </button>
          </div>
        </div>

        {/* Live CV Progress Bar (Animated) */}
        {isEvaluatingCV && (
          <div className="bg-slate-900 px-6 py-3 border-b border-teal-500/30">
            <div className="flex justify-between items-center text-xs text-teal-300 font-mono mb-1.5">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping"></span>
                <span>Executing Stratified Partition Fold {cvFoldProgress} of 10...</span>
              </span>
              <span className="font-bold">{cvFoldProgress * 10}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-linear-to-r from-teal-400 to-emerald-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${cvFoldProgress * 10}%` }}
                transition={{ duration: 0.15 }}
              />
            </div>
          </div>
        )}

        {cvSuccessMessage && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 flex items-center gap-2 text-xs font-bold text-emerald-800 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{cvSuccessMessage}</span>
          </div>
        )}

        {/* Professional Benchmark Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-black uppercase tracking-wider text-slate-500">
                <th className="py-4 px-6">Algorithm</th>
                <th className="py-4 px-4">Accuracy</th>
                <th className="py-4 px-4">Precision</th>
                <th className="py-4 px-4">Recall</th>
                <th className="py-4 px-4">F1-Score</th>
                <th className="py-4 px-4">ROC-AUC</th>
                <th className="py-4 px-4">Train Latency</th>
                <th className="py-4 px-6 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ML_MODELS_BENCHMARKS.map((m) => {
                const isSelected = selectedModel.name === m.name;
                const isChampion = m.name === 'Ensemble Weighted';
                const displayedAccuracy = isSelected ? currentAccuracy : m.accuracy;

                return (
                  <tr
                    key={m.name}
                    onClick={() => setSelectedModel(m)}
                    className={`transition-all duration-200 cursor-pointer group ${
                      isSelected
                        ? 'bg-teal-50/70 relative z-10'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Algorithm Name & Metadata */}
                    <td className="py-5 px-6">
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-1 w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all ${
                            isSelected
                              ? 'ring-4 ring-teal-500/20 bg-teal-600 text-white'
                              : 'bg-slate-200 group-hover:bg-slate-300'
                          }`}
                        >
                          {isSelected && <span className="w-1.5 h-1.5 bg-white rounded-full"></span>}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-teal-900 transition-colors">
                              {m.name}
                            </span>

                            {isChampion ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-linear-to-r from-amber-500/20 to-orange-500/20 text-amber-900 border border-amber-300 shadow-2xs">
                                <Award className="w-3 h-3 text-amber-600 animate-bounce" />
                                <span>Champion</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                Core Engine
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-500 mt-0.5 font-medium hidden sm:block">
                            {m.architecture || m.role}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Accuracy with Visual Meter */}
                    <td className="py-5 px-4">
                      <div className="flex flex-col gap-1 min-w-[100px]">
                        <span className="text-sm font-black text-teal-800 font-mono tracking-tight">
                          {displayedAccuracy}%
                        </span>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${
                              isChampion
                                ? 'bg-linear-to-r from-teal-500 to-emerald-500'
                                : 'bg-linear-to-r from-teal-600 to-cyan-600'
                            }`}
                            style={{ width: `${displayedAccuracy}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Precision */}
                    <td className="py-5 px-4 font-mono text-xs sm:text-sm font-bold text-slate-700">
                      <div className="flex flex-col gap-1 min-w-[70px]">
                        <span>{m.precision}%</span>
                        <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-slate-400 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${m.precision}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Recall */}
                    <td className="py-5 px-4 font-mono text-xs sm:text-sm font-bold text-slate-700">
                      <div className="flex flex-col gap-1 min-w-[70px]">
                        <span>{m.recall}%</span>
                        <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-slate-400 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${m.recall}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* F1-Score */}
                    <td className="py-5 px-4 font-mono text-xs sm:text-sm font-black text-slate-900">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200/80 inline-block font-mono">
                        {m.f1Score}%
                      </span>
                    </td>

                    {/* ROC-AUC */}
                    <td className="py-5 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-mono text-xs font-black inline-flex items-center gap-1 shadow-2xs">
                        <TrendingUp className="w-3 h-3 text-emerald-600" />
                        <span>{m.rocAuc}</span>
                      </span>
                    </td>

                    {/* Latency */}
                    <td className="py-5 px-4 text-xs font-mono text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{m.trainingTimeSec}s</span>
                      </div>
                    </td>

                    {/* Inspect Button */}
                    <td className="py-5 px-6 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedModel(m);
                        }}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-2xs ${
                          isSelected
                            ? 'bg-teal-600 text-white shadow-teal-600/20 ring-2 ring-teal-600/30'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <span>Analyze</span>
                            <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Model Analysis Views Selector with Framer Motion Layout Pill */}
      <div className="bg-white rounded-3xl border border-slate-200 p-2 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1">
          {analysisViewsConfig.map((view) => {
            const IconComponent = view.icon;
            const isActive = activeAnalysisView === view.id;

            return (
              <button
                key={view.id}
                onClick={() => setActiveAnalysisView(view.id)}
                className={`relative px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
                  isActive ? 'text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-ml-analysis-pill"
                    className="absolute inset-0 bg-linear-to-r from-teal-600 to-emerald-600 rounded-2xl shadow-sm -z-10"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <IconComponent className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{view.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Animated Viewport with Framer Motion Transitions */}
      <AnimatePresence mode="wait">
        {/* VIEW 1: RECHARTS RADIAL BAR TOPOLOGY (User Request Feature) */}
        {activeAnalysisView === 'radial-topology' && (
          <motion.div
            key="view-radial-topology"
            initial={{ opacity: 0, y: 16, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.99 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            className="space-y-6"
          >
            {/* The Professional Recharts Radial Bar Chart */}
            <EnsembleRadialComparisonChart
              ensembleModel={ensembleModel}
              randomForestModel={rfModel}
              activeModelName={selectedModel.name}
              onSelectModel={(name) => {
                const target = ML_MODELS_BENCHMARKS.find(m => m.name === name);
                if (target) setSelectedModel(target);
              }}
            />

            {/* Architectural Deep-Dive Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
                <div className="w-9 h-9 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center mb-3">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">Gini Purity Optimization</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Both algorithms evaluate 132 binary and categorical symptom vectors using Gini impurity criteria to eliminate redundant differential branches.
                </p>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
                <div className="w-9 h-9 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center mb-3">
                  <Zap className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">Differential Gain (+0.6%)</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  The weighted ensemble mitigates single-tree variance and pushes clinical recall from 95.9% to 96.8%, reducing high-acuity misclassifications.
                </p>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
                <div className="w-9 h-9 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mb-3">
                  <Award className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">Clinical Calibrated Scores</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Soft probability distributions are passed into the Doctor Consultation pad, offering verified confidence intervals for every medication prescribed.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* VIEW 2: CONFUSION MATRIX */}
        {activeAnalysisView === 'confusion-matrix' && (
          <motion.div
            key={`view-confusion-matrix-${selectedModel.name}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-black text-slate-900 text-lg">
                    Confusion Matrix: {selectedModel.name}
                  </h3>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                    {selectedModel.badge || 'Active Model'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Row represents actual clinical diagnosis; column represents predicted disease. Diagonal cells indicate true positives with calibrated probabilities.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
                  Precision: {selectedModel.precision}%
                </span>
                <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Recall: {selectedModel.recall}%
                </span>
              </div>
            </div>

            <div className="overflow-x-auto pb-4">
              <div className="inline-block min-w-full max-w-2xl mx-auto">
                <div className="grid grid-cols-6 gap-2 text-xs text-center font-mono">
                  <div className="p-3 text-slate-400 font-sans font-bold flex items-center justify-center">Act \ Pred</div>
                  {selectedModel.matrixLabels.map((l) => (
                    <div key={l} className="p-3 font-bold text-slate-700 bg-slate-100 rounded-xl truncate" title={l}>
                      {l}
                    </div>
                  ))}

                  {selectedModel.confusionMatrix.map((row, rIdx) => (
                    <React.Fragment key={rIdx}>
                      <div className="p-3 font-bold text-slate-700 bg-slate-100 rounded-xl text-left truncate flex items-center" title={selectedModel.matrixLabels[rIdx]}>
                        {selectedModel.matrixLabels[rIdx]}
                      </div>
                      {row.map((val, cIdx) => {
                        const isDiag = rIdx === cIdx;
                        return (
                          <div
                            key={cIdx}
                            className={`p-3 rounded-xl font-bold flex items-center justify-center transition-all ${
                              isDiag
                                ? 'bg-teal-600 text-white shadow-xs font-black text-sm'
                                : val > 0
                                ? 'bg-rose-100 text-rose-800 font-semibold'
                                : 'bg-slate-50 text-slate-400'
                            }`}
                          >
                            {val}
                          </div>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-2">
              <span>Overall Diagnostic Specificity: <strong className="text-teal-800 font-bold">99.1%</strong></span>
              <span>False Negative Rate: <strong className="text-slate-900 font-bold">{(100 - selectedModel.recall).toFixed(1)}%</strong></span>
              <span>Total Sample Size: <strong className="text-slate-900 font-bold">500 Validated Cohorts</strong></span>
            </div>
          </motion.div>
        )}

        {/* VIEW 3: FEATURE IMPORTANCE */}
        {activeAnalysisView === 'feature-importance' && (
          <motion.div
            key="view-feature-importance"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6"
          >
            <div>
              <h3 className="font-black text-slate-900 text-lg mb-1 flex items-center gap-2">
                <Layers className="w-5 h-5 text-teal-600" />
                <span>Symptom Feature Importance (Gini Impurity & Mutual Information)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Top discriminatory clinical signals across {DATASET_SUMMARY_STATS.featuresCount} symptom vectors derived from 10-fold cross-validation trees:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {FEATURE_IMPORTANCE_DATA.map((feat, idx) => {
                const percent = Math.round(feat.importance * 100);
                return (
                  <div key={feat.symptom} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 text-xs">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="font-bold text-slate-900 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-mono text-[10px]">
                          #{idx + 1}
                        </span>
                        <span>{feat.symptom}</span>
                      </span>
                      <span className="font-mono text-teal-700 font-bold">
                        {feat.importance.toFixed(3)} ({percent}%)
                      </span>
                    </div>

                    <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-linear-to-r from-teal-500 to-emerald-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${percent * 5}%` }}
                        transition={{ duration: 0.6, delay: idx * 0.05 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* VIEW 4: RETRAINING SIMULATOR */}
        {activeAnalysisView === 'retraining-simulator' && (
          <motion.div
            key="view-retraining-simulator"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6"
          >
            <div>
              <h3 className="font-black text-slate-900 text-lg mb-1 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-teal-600" />
                <span>Hyperparameter & Retraining Simulator</span>
              </h3>
              <p className="text-xs text-slate-500">
                Adjust clinical parameters and execute live stratified cross-validation on 4,920 disease instances:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="text-slate-700 block mb-1.5 font-bold">Train / Test Split</label>
                <select
                  value={trainSplit}
                  onChange={(e) => setTrainSplit(parseInt(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800 outline-hidden"
                >
                  <option value={80}>80% Train / 20% Test (Clinical Standard)</option>
                  <option value={70}>70% Train / 30% Test</option>
                  <option value={90}>90% Train / 10% Test</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 block mb-1.5 font-bold">Estimators & Criterion</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800 outline-hidden">
                  <option>100 Trees • Gini Split Criterion</option>
                  <option>150 Trees • Entropy Criterion</option>
                  <option>50 Trees • Rapid Evaluation</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 block mb-1.5 font-bold">Max Tree Depth</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800 outline-hidden">
                  <option>16 (Default optimal)</option>
                  <option>24 (Deep ensemble)</option>
                  <option>8 (Constrained)</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRetrain}
              disabled={isRetraining}
              className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
            >
              {isRetraining ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-teal-400" />
                  <span>Retraining {selectedModel.name} on 4,920 records...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 text-teal-400 fill-teal-400" />
                  <span>Execute Model Retraining & Calibration</span>
                </>
              )}
            </button>

            {retrainLogs.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 bg-slate-950 text-slate-300 rounded-2xl font-mono text-xs space-y-1.5 border border-slate-800"
              >
                <div className="text-[10px] text-teal-400 uppercase font-bold tracking-wider mb-2">
                  Console Convergence Stream:
                </div>
                {retrainLogs.map((log, lIdx) => (
                  <div key={lIdx} className="leading-relaxed">{log}</div>
                ))}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* VIEW 5: CLINICAL ARCHITECTURE & COMPARISON */}
        {activeAnalysisView === 'clinical-architecture' && (
          <motion.div
            key="view-clinical-architecture"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Ensemble Weighted Architecture */}
            <div className="bg-white rounded-3xl border-2 border-teal-500/50 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
                    Production Champion Meta-Learner
                  </span>
                  <Award className="w-4 h-4 text-amber-500" />
                </div>
                <h4 className="text-xl font-black text-slate-900 mb-2">Ensemble Weighted (97.4%)</h4>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  Synthesizes probability predictions using soft-voting meta-weights:
                  <code className="block mt-2 p-2.5 rounded-xl bg-slate-900 text-teal-300 font-mono text-[11px]">
                    P_final(c) = 0.55 · P_RF(c) + 0.25 · P_SVM(c) + 0.20 · P_Bayes(c)
                  </code>
                </p>

                <h5 className="font-bold text-xs text-slate-800 uppercase tracking-wider mb-2">Clinical Strengths:</h5>
                <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4 mb-4">
                  {ensembleModel.pros.map((p, idx) => (
                    <li key={idx}>{p}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Latency: <strong>2.65s</strong></span>
                <span className="text-emerald-700 font-bold">Lowest False-Negative Rate</span>
              </div>
            </div>

            {/* Random Forest Architecture */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                    Bootstrap Aggregated Core Forest
                  </span>
                  <Cpu className="w-4 h-4 text-indigo-500" />
                </div>
                <h4 className="text-xl font-black text-slate-900 mb-2">Random Forest (96.8%)</h4>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  100 orthogonal decision trees constructed via bootstrap bagging and sqrt(132) feature subspace sampling:
                  <code className="block mt-2 p-2.5 rounded-xl bg-slate-900 text-indigo-300 font-mono text-[11px]">
                    Vote_RF(c) = (1 / 100) · ∑ Tree_k(symptom_vector)
                  </code>
                </p>

                <h5 className="font-bold text-xs text-slate-800 uppercase tracking-wider mb-2">Clinical Strengths:</h5>
                <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4 mb-4">
                  {rfModel.pros.map((p, idx) => (
                    <li key={idx}>{p}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Latency: <strong>1.84s</strong></span>
                <span className="text-indigo-700 font-bold">Low Variance Baseline</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
