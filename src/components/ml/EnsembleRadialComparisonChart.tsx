import React, { useState } from 'react';
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  BarChart3,
  CheckCircle2,
  Clock,
  Cpu,
  Layers,
  Sparkles,
  TrendingUp,
  Zap
} from 'lucide-react';
import { MLModelMetrics } from '../../types';

interface EnsembleRadialComparisonChartProps {
  ensembleModel: MLModelMetrics;
  randomForestModel: MLModelMetrics;
  activeModelName: string;
  onSelectModel: (modelName: string) => void;
}

export const EnsembleRadialComparisonChart: React.FC<EnsembleRadialComparisonChartProps> = ({
  ensembleModel,
  randomForestModel,
  activeModelName,
  onSelectModel
}) => {
  const [viewMode, setViewMode] = useState<'dual' | 'overlay'>('dual');
  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);

  // Prepare Radial Bar Data for Ensemble Weighted
  const ensembleRadialData = [
    {
      metric: 'ROC-AUC',
      fullName: 'ROC-AUC Diagnostic Area',
      value: Math.round(ensembleModel.rocAuc * 1000) / 10, // 99.2%
      fill: '#10b981', // emerald-500
      delta: '+0.4% vs RF',
      desc: 'Overall discrimination capability across all 41 pathology classes'
    },
    {
      metric: 'F1-Score',
      fullName: 'Harmonic F1-Score',
      value: ensembleModel.f1Score, // 96.9%
      fill: '#14b8a6', // teal-500
      delta: '+0.8% vs RF',
      desc: 'Balanced harmonic mean between precision and sensitivity'
    },
    {
      metric: 'Recall',
      fullName: 'Clinical Recall / Sensitivity',
      value: ensembleModel.recall, // 96.8%
      fill: '#06b6d4', // cyan-500
      delta: '+0.9% vs RF',
      desc: 'Minimizes false negatives for high-acuity illnesses'
    },
    {
      metric: 'Precision',
      fullName: 'Diagnostic Precision',
      value: ensembleModel.precision, // 97.1%
      fill: '#3b82f6', // blue-500
      delta: '+0.7% vs RF',
      desc: 'Positive predictive value for medication appropriateness'
    },
    {
      metric: 'Accuracy',
      fullName: 'Cross-Validation Accuracy',
      value: ensembleModel.accuracy, // 97.4%
      fill: '#0d9488', // teal-600
      delta: '+0.6% vs RF',
      desc: 'Primary 10-fold cross-validation convergence accuracy'
    }
  ];

  // Prepare Radial Bar Data for Random Forest
  const rfRadialData = [
    {
      metric: 'ROC-AUC',
      fullName: 'ROC-AUC Diagnostic Area',
      value: Math.round(randomForestModel.rocAuc * 1000) / 10, // 98.8%
      fill: '#6366f1', // indigo-500
      delta: 'Baseline',
      desc: 'Robust area under curve with bootstrap aggregation'
    },
    {
      metric: 'F1-Score',
      fullName: 'Harmonic F1-Score',
      value: randomForestModel.f1Score, // 96.1%
      fill: '#8b5cf6', // violet-500
      delta: 'Baseline',
      desc: 'Solid harmonic trade-off across 100 decision trees'
    },
    {
      metric: 'Recall',
      fullName: 'Clinical Recall / Sensitivity',
      value: randomForestModel.recall, // 95.9%
      fill: '#a855f7', // purple-500
      delta: 'Baseline',
      desc: 'Sensitivity rate on multi-symptom presentations'
    },
    {
      metric: 'Precision',
      fullName: 'Diagnostic Precision',
      value: randomForestModel.precision, // 96.4%
      fill: '#3b82f6', // blue-500
      delta: 'Baseline',
      desc: 'Individual tree voting accuracy on symptom inputs'
    },
    {
      metric: 'Accuracy',
      fullName: 'Cross-Validation Accuracy',
      value: randomForestModel.accuracy, // 96.8%
      fill: '#4f46e5', // indigo-600
      delta: 'Baseline',
      desc: '100-tree bagging forest baseline validation score'
    }
  ];

  // Combined overlay data for comparative view
  const overlayData = [
    {
      name: 'RF Recall (95.9%)',
      value: randomForestModel.recall,
      fill: '#818cf8',
      model: 'Random Forest',
      metric: 'Recall'
    },
    {
      name: 'Ensemble Recall (96.8%)',
      value: ensembleModel.recall,
      fill: '#06b6d4',
      model: 'Ensemble Weighted',
      metric: 'Recall'
    },
    {
      name: 'RF F1 (96.1%)',
      value: randomForestModel.f1Score,
      fill: '#a78bfa',
      model: 'Random Forest',
      metric: 'F1-Score'
    },
    {
      name: 'Ensemble F1 (96.9%)',
      value: ensembleModel.f1Score,
      fill: '#14b8a6',
      model: 'Ensemble Weighted',
      metric: 'F1-Score'
    },
    {
      name: 'RF Accuracy (96.8%)',
      value: randomForestModel.accuracy,
      fill: '#6366f1',
      model: 'Random Forest',
      metric: 'Accuracy'
    },
    {
      name: 'Ensemble Accuracy (97.4%)',
      value: ensembleModel.accuracy,
      fill: '#0d9488',
      model: 'Ensemble Weighted',
      metric: 'Accuracy'
    },
    {
      name: 'RF ROC-AUC (98.8%)',
      value: Math.round(randomForestModel.rocAuc * 1000) / 10,
      fill: '#4f46e5',
      model: 'Random Forest',
      metric: 'ROC-AUC'
    },
    {
      name: 'Ensemble ROC-AUC (99.2%)',
      value: Math.round(ensembleModel.rocAuc * 1000) / 10,
      fill: '#10b981',
      model: 'Ensemble Weighted',
      metric: 'ROC-AUC'
    }
  ];

  // Custom Tooltip component for Recharts
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl border border-slate-700 text-xs min-w-[210px] backdrop-blur-md">
          <div className="flex items-center justify-between gap-2 border-b border-slate-700/80 pb-1.5 mb-1.5">
            <span className="font-black text-slate-100">{data.fullName || data.name}</span>
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-md font-mono"
              style={{ backgroundColor: `${data.fill}33`, color: data.fill }}
            >
              {data.metric || 'Metric'}
            </span>
          </div>

          <div className="flex items-baseline justify-between gap-3">
            <span className="text-slate-400">Score:</span>
            <span className="font-mono text-base font-black text-white">{data.value}%</span>
          </div>

          {data.delta && (
            <div className="flex items-center justify-between gap-3 mt-1 text-[11px]">
              <span className="text-slate-400">Advantage:</span>
              <span className="font-mono font-bold text-emerald-400">{data.delta}</span>
            </div>
          )}

          {data.desc && (
            <p className="text-[11px] text-slate-300 mt-1.5 leading-snug border-t border-slate-800 pt-1.5">
              {data.desc}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs overflow-hidden">
      {/* Header and Toggle Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
        <div>
          <div className="flex items-center gap-2 text-teal-700 font-bold text-xs uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4 text-teal-600" />
            <span>Recharts Radial Bar Diagnostic Topology</span>
          </div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            Top Ensemble Algorithms: Multi-Ring Radial Benchmark
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Visualizing clinical accuracy, precision, recall, F1, and ROC-AUC for our two premier ensemble learners.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl self-start sm:self-auto">
          <button
            onClick={() => setViewMode('dual')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'dual'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Dual Side-by-Side
          </button>
          <button
            onClick={() => setViewMode('overlay')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'overlay'
                ? 'bg-white text-teal-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Comparative Concentric
          </button>
        </div>
      </div>

      {/* Main Radial Chart Display */}
      <AnimatePresence mode="wait">
        {viewMode === 'dual' ? (
          <motion.div
            key="dual-view"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch"
          >
            {/* 1. Ensemble Weighted Radial Chart Card */}
            <div
              onClick={() => onSelectModel(ensembleModel.name)}
              className={`rounded-3xl border-2 p-5 transition-all cursor-pointer flex flex-col justify-between ${
                activeModelName === ensembleModel.name
                  ? 'bg-teal-50/40 border-teal-500 shadow-md shadow-teal-500/10 ring-2 ring-teal-400/20'
                  : 'bg-slate-50/60 border-slate-200 hover:border-teal-300 hover:bg-slate-50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-teal-500 ring-4 ring-teal-200 animate-pulse"></span>
                    <h4 className="font-extrabold text-slate-900 text-base">
                      {ensembleModel.name}
                    </h4>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-linear-to-r from-amber-500/20 to-orange-500/20 text-amber-900 border border-amber-300">
                    <Award className="w-3 h-3 text-amber-600" />
                    <span>Champion</span>
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-2">
                  Soft-voting meta-estimator synthesizing tree probabilities.
                </p>
              </div>

              {/* Radial Bar Chart container */}
              <div className="relative w-full h-72 flex items-center justify-center my-2">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="25%"
                    outerRadius="95%"
                    barSize={12}
                    data={ensembleRadialData}
                    startAngle={210}
                    endAngle={-30}
                  >
                    <PolarAngleAxis
                      type="number"
                      domain={[0, 100]}
                      angleAxisId={0}
                      tick={false}
                    />
                    <RadialBar
                      background={{ fill: '#f1f5f9' }}
                      dataKey="value"
                      cornerRadius={8}
                    />
                    <Tooltip content={<CustomTooltip />} />
                  </RadialBarChart>
                </ResponsiveContainer>

                {/* Center Score Badge */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl sm:text-3xl font-black text-teal-800 font-mono tracking-tight">
                    {ensembleModel.accuracy}%
                  </span>
                  <span className="text-[10px] uppercase font-bold text-teal-600 tracking-wider">
                    Accuracy
                  </span>
                  <span className="text-[9px] font-mono text-slate-400 mt-0.5">
                    10-Fold CV
                  </span>
                </div>
              </div>

              {/* Ring Metric Legend Badges */}
              <div className="grid grid-cols-5 gap-1.5 pt-3 border-t border-slate-200/80 text-center">
                {ensembleRadialData.map((d) => (
                  <div
                    key={d.metric}
                    onMouseEnter={() => setHoveredMetric(d.metric)}
                    onMouseLeave={() => setHoveredMetric(null)}
                    className="p-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs transition-all hover:scale-105"
                  >
                    <div className="w-2 h-2 rounded-full mx-auto mb-1" style={{ backgroundColor: d.fill }}></div>
                    <span className="block text-[10px] font-bold text-slate-500 uppercase truncate">
                      {d.metric}
                    </span>
                    <span className="block text-xs font-mono font-black text-slate-900">
                      {d.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Random Forest Radial Chart Card */}
            <div
              onClick={() => onSelectModel(randomForestModel.name)}
              className={`rounded-3xl border-2 p-5 transition-all cursor-pointer flex flex-col justify-between ${
                activeModelName === randomForestModel.name
                  ? 'bg-indigo-50/40 border-indigo-500 shadow-md shadow-indigo-500/10 ring-2 ring-indigo-400/20'
                  : 'bg-slate-50/60 border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-indigo-200"></span>
                    <h4 className="font-extrabold text-slate-900 text-base">
                      {randomForestModel.name}
                    </h4>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                    <Cpu className="w-3 h-3 text-indigo-600" />
                    <span>Core Engine</span>
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-2">
                  Bootstrap aggregated forest of 100 decorrelated decision trees.
                </p>
              </div>

              {/* Radial Bar Chart container */}
              <div className="relative w-full h-72 flex items-center justify-center my-2">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="25%"
                    outerRadius="95%"
                    barSize={12}
                    data={rfRadialData}
                    startAngle={210}
                    endAngle={-30}
                  >
                    <PolarAngleAxis
                      type="number"
                      domain={[0, 100]}
                      angleAxisId={0}
                      tick={false}
                    />
                    <RadialBar
                      background={{ fill: '#f1f5f9' }}
                      dataKey="value"
                      cornerRadius={8}
                    />
                    <Tooltip content={<CustomTooltip />} />
                  </RadialBarChart>
                </ResponsiveContainer>

                {/* Center Score Badge */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl sm:text-3xl font-black text-indigo-900 font-mono tracking-tight">
                    {randomForestModel.accuracy}%
                  </span>
                  <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">
                    Accuracy
                  </span>
                  <span className="text-[9px] font-mono text-slate-400 mt-0.5">
                    10-Fold CV
                  </span>
                </div>
              </div>

              {/* Ring Metric Legend Badges */}
              <div className="grid grid-cols-5 gap-1.5 pt-3 border-t border-slate-200/80 text-center">
                {rfRadialData.map((d) => (
                  <div
                    key={d.metric}
                    onMouseEnter={() => setHoveredMetric(d.metric)}
                    onMouseLeave={() => setHoveredMetric(null)}
                    className="p-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs transition-all hover:scale-105"
                  >
                    <div className="w-2 h-2 rounded-full mx-auto mb-1" style={{ backgroundColor: d.fill }}></div>
                    <span className="block text-[10px] font-bold text-slate-500 uppercase truncate">
                      {d.metric}
                    </span>
                    <span className="block text-xs font-mono font-black text-slate-900">
                      {d.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="overlay-view"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="p-4 bg-slate-900 text-white rounded-3xl"
          >
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              {/* Radial Chart */}
              <div className="w-full lg:w-1/2 h-80 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="18%"
                    outerRadius="95%"
                    barSize={10}
                    data={overlayData}
                    startAngle={180}
                    endAngle={-180}
                  >
                    <PolarAngleAxis
                      type="number"
                      domain={[0, 100]}
                      angleAxisId={0}
                      tick={false}
                    />
                    <RadialBar
                      background={{ fill: '#1e293b' }}
                      dataKey="value"
                      cornerRadius={6}
                    />
                    <Tooltip content={<CustomTooltip />} />
                  </RadialBarChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl sm:text-2xl font-black text-teal-400 font-mono">
                    Δ +0.6%
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Net Edge
                  </span>
                </div>
              </div>

              {/* Comparative metric rows */}
              <div className="w-full lg:w-1/2 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                  <span className="font-bold">Metric Pillar</span>
                  <div className="flex items-center gap-6 font-mono text-[11px]">
                    <span className="text-teal-400 font-bold">Ensemble Weighted</span>
                    <span className="text-indigo-400 font-bold">Random Forest</span>
                    <span className="text-emerald-400 font-bold">Delta</span>
                  </div>
                </div>

                {[
                  {
                    name: 'Validation Accuracy',
                    ens: ensembleModel.accuracy,
                    rf: randomForestModel.accuracy,
                    delta: '+0.6%'
                  },
                  {
                    name: 'Diagnostic Precision',
                    ens: ensembleModel.precision,
                    rf: randomForestModel.precision,
                    delta: '+0.7%'
                  },
                  {
                    name: 'Clinical Recall',
                    ens: ensembleModel.recall,
                    rf: randomForestModel.recall,
                    delta: '+0.9%'
                  },
                  {
                    name: 'Harmonic F1-Score',
                    ens: ensembleModel.f1Score,
                    rf: randomForestModel.f1Score,
                    delta: '+0.8%'
                  },
                  {
                    name: 'ROC-AUC Area',
                    ens: ensembleModel.rocAuc,
                    rf: randomForestModel.rocAuc,
                    delta: '+0.004'
                  },
                  {
                    name: 'Inference Latency',
                    ens: `${ensembleModel.trainingTimeSec}s`,
                    rf: `${randomForestModel.trainingTimeSec}s`,
                    delta: '+0.81s'
                  }
                ].map((row) => (
                  <div
                    key={row.name}
                    className="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-slate-800/60 border border-slate-700/50"
                  >
                    <span className="font-semibold text-slate-200">{row.name}</span>
                    <div className="flex items-center gap-6 font-mono font-bold text-xs">
                      <span className="text-teal-300 w-16 text-right">
                        {typeof row.ens === 'number' ? `${row.ens}%` : row.ens}
                      </span>
                      <span className="text-indigo-300 w-16 text-right">
                        {typeof row.rf === 'number' ? `${row.rf}%` : row.rf}
                      </span>
                      <span className="text-emerald-400 w-12 text-right">{row.delta}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
