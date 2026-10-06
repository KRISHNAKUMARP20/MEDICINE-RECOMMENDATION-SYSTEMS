import { MLModelMetrics } from '../types';

export const ML_MODELS_BENCHMARKS: MLModelMetrics[] = [
  {
    name: 'Random Forest',
    accuracy: 96.8,
    precision: 96.4,
    recall: 95.9,
    f1Score: 96.1,
    rocAuc: 0.988,
    trainingTimeSec: 1.84,
    architecture: 'Bootstrap Aggregated Multi-Tree Ensemble (100 Estimators)',
    badge: 'Core Clinical Engine',
    role: 'Robust Primary Diagnostic Baseline',
    isChampion: false,
    description: 'Ensemble of 100 decorrelated decision trees using bootstrap aggregation and random feature sub-selection. Offers exceptional resistance against symptom noise and multi-pathology co-occurrence.',
    pros: [
      'Resistant to overfitting through bagging and feature subspace sampling',
      'Provides accurate probability calibration for differential diagnoses',
      'Calculates Gini-impurity based feature importance rankings with low variance'
    ],
    cons: [
      'Slightly higher memory footprint during mobile client inference'
    ],
    hyperparameters: {
      'n_estimators': 100,
      'max_depth': 16,
      'min_samples_split': 3,
      'criterion': 'gini',
      'bootstrap': 'True'
    },
    matrixLabels: ['Malaria', 'Typhoid', 'Pneumonia', 'GERD', 'Asthma'],
    confusionMatrix: [
      [98, 1, 1, 0, 0],
      [1, 96, 2, 1, 0],
      [0, 2, 95, 0, 3],
      [0, 0, 0, 99, 1],
      [0, 0, 3, 1, 96]
    ]
  },
  {
    name: 'Ensemble Weighted',
    accuracy: 97.4,
    precision: 97.1,
    recall: 96.8,
    f1Score: 96.9,
    rocAuc: 0.992,
    trainingTimeSec: 2.65,
    architecture: 'Calibrated Soft-Voting Multi-Model Meta-Learner',
    badge: 'Production Champion',
    role: 'Highest Clinical Confidence Meta-Estimator',
    isChampion: true,
    description: 'Soft-voting ensemble meta-estimator synthesizing probability distributions across tree and Bayesian estimators for maximum diagnostic discrimination and minimum false-negative risk.',
    pros: [
      'Lowest error rate and highest generalization accuracy across diverse patient profiles',
      'Mitigates single-algorithm blind spots and boundary bias',
      'Superior calibrated confidence scores for clinical triage prioritization'
    ],
    cons: [
      'Requires parallelized estimator scoring for live inference'
    ],
    hyperparameters: {
      'voting': 'soft',
      'rf_weight': 0.60,
      'tree_depth': 16,
      'calibration': 'sigmoid',
      'cv_folds': 10
    },
    matrixLabels: ['Malaria', 'Typhoid', 'Pneumonia', 'GERD', 'Asthma'],
    confusionMatrix: [
      [99, 1, 0, 0, 0],
      [1, 97, 1, 1, 0],
      [0, 1, 97, 0, 2],
      [0, 0, 0, 100, 0],
      [0, 0, 2, 1, 97]
    ]
  }
];

export const FEATURE_IMPORTANCE_DATA = [
  { symptom: 'High Fever', importance: 0.142, category: 'General' },
  { symptom: 'Shortness of Breath', importance: 0.128, category: 'Respiratory' },
  { symptom: 'Chest Pain / Pressure', importance: 0.115, category: 'Cardiovascular' },
  { symptom: 'Productive Cough', importance: 0.098, category: 'Respiratory' },
  { symptom: 'Wheezing', importance: 0.087, category: 'Respiratory' },
  { symptom: 'Chills & Shivering', importance: 0.076, category: 'General' },
  { symptom: 'Severe Abdominal Pain', importance: 0.069, category: 'Gastrointestinal' },
  { symptom: 'Upper Abdominal Burning', importance: 0.062, category: 'Gastrointestinal' },
  { symptom: 'Throbbing Headache', importance: 0.054, category: 'Neurological' },
  { symptom: 'Excessive Thirst', importance: 0.048, category: 'Endocrine' },
  { symptom: 'Frequent Urination', importance: 0.043, category: 'Urological' },
  { symptom: 'Joint Swelling', importance: 0.039, category: 'Musculoskeletal' },
  { symptom: 'Skin Rash', importance: 0.032, category: 'Dermatological' }
];

export const DATASET_SUMMARY_STATS = {
  totalRecords: 4920,
  trainRecords: 3936,
  testRecords: 984,
  featuresCount: 132,
  uniqueDiseases: 42,
  cvFolds: 10,
  meanCrossValidationScore: 0.963,
  standardDeviation: 0.012
};
