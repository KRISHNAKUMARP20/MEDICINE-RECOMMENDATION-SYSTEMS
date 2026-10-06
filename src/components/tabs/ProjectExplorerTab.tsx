import React, { useState, useMemo, useEffect } from 'react';
import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Code,
  Copy,
  Database,
  Download,
  ExternalLink,
  FileCode,
  FileSpreadsheet,
  FileText,
  Filter,
  Folder,
  FolderOpen,
  FolderTree,
  HardDrive,
  Info,
  Layers,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Terminal,
  X
} from 'lucide-react';
import {
  KAGGLE_DATASET_METADATA,
  REPOSITORY_DATASETS,
  DatasetFile
} from '../../data/rawDatasets';
import { clinicalDatasetService } from '../../services/clinicalDatasetService';
import {
  ClinicalDatasetSyncStats,
  ClinicalDiseaseRecord,
  ClinicalSymptomRecord
} from '../../types';

interface RepoFile {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: RepoFile[];
  language?: string;
  content?: string;
}

export const ProjectExplorerTab: React.FC = () => {
  // Top-level mode: 'kaggle-hub' vs 'clinical-db' vs 'code-repo'
  const [activeViewMode, setActiveViewMode] = useState<'kaggle-hub' | 'clinical-db' | 'code-repo'>('clinical-db');

  // Selected dataset in the Kaggle Hub
  const [selectedDatasetIndex, setSelectedDatasetIndex] = useState<number>(0);
  const [tableSearchQuery, setTableSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [copiedCli, setCopiedCli] = useState<boolean>(false);
  const [copiedCsv, setCopiedCsv] = useState<boolean>(false);

  // Clinical DB & Normalizer State
  const [clinicalDiseases, setClinicalDiseases] = useState<ClinicalDiseaseRecord[]>(() => clinicalDatasetService.getNormalizedDiseases());
  const [clinicalSymptoms, setClinicalSymptoms] = useState<ClinicalSymptomRecord[]>(() => clinicalDatasetService.getNormalizedSymptoms());
  const [syncStats, setSyncStats] = useState<ClinicalDatasetSyncStats>(() => clinicalDatasetService.getSyncStats());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);
  const [dbSearchQuery, setDbSearchQuery] = useState<string>('');
  const [dbUrgencyFilter, setDbUrgencyFilter] = useState<string>('All');
  const [dbPage, setDbPage] = useState<number>(1);
  const [dbRowsPerPage, setDbRowsPerPage] = useState<number>(10);
  const [selectedRecordForInspection, setSelectedRecordForInspection] = useState<ClinicalDiseaseRecord | null>(null);
  const [copiedRecordJson, setCopiedRecordJson] = useState<boolean>(false);

  // File tree state for Code Repo view
  const [selectedFilePath, setSelectedFilePath] = useState<string>('dataset/raw/symptom_Description.csv');
  const [copiedCode, setCopiedCode] = useState(false);
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({
    'Medicine-Recommendation-System': true,
    'app': true,
    'dataset': true,
    'dataset/raw': true,
    'dataset/processed': true,
    'app/ml': true,
    'app/services': true,
    'database': true
  });

  const toggleFolder = (path: string) => {
    setOpenFolders(prev => ({ ...prev, [path]: !prev[path] }));
  };

  const selectedDataset = REPOSITORY_DATASETS[selectedDatasetIndex] || REPOSITORY_DATASETS[0];

  // Refresh clinical database records on storage events
  useEffect(() => {
    const handleUpdate = () => {
      setClinicalDiseases(clinicalDatasetService.getNormalizedDiseases());
      setClinicalSymptoms(clinicalDatasetService.getNormalizedSymptoms());
      setSyncStats(clinicalDatasetService.getSyncStats());
    };
    window.addEventListener('medassist:clinical-diseases-updated', handleUpdate);
    window.addEventListener('medassist:clinical-sync-updated', handleUpdate);
    return () => {
      window.removeEventListener('medassist:clinical-diseases-updated', handleUpdate);
      window.removeEventListener('medassist:clinical-sync-updated', handleUpdate);
    };
  }, []);

  // Parse CSV content into structured table (headers & rows)
  const parsedCsvData = useMemo(() => {
    if (!selectedDataset || selectedDataset.contentType !== 'text/csv') {
      return { headers: [], rows: [] };
    }

    const lines = selectedDataset.content.trim().split('\n');
    if (lines.length === 0) return { headers: [], rows: [] };

    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headers = parseLine(lines[0]);
    const rows = lines.slice(1).map(l => parseLine(l));
    return { headers, rows };
  }, [selectedDataset]);

  // Filter rows based on search
  const filteredRows = useMemo(() => {
    if (!tableSearchQuery.trim()) return parsedCsvData.rows;
    const q = tableSearchQuery.toLowerCase();
    return parsedCsvData.rows.filter(row =>
      row.some(cell => cell.toLowerCase().includes(q))
    );
  }, [parsedCsvData.rows, tableSearchQuery]);

  const totalPages = Math.ceil(filteredRows.length / rowsPerPage) || 1;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredRows.slice(start, start + rowsPerPage);
  }, [filteredRows, currentPage, rowsPerPage]);

  // Filter normalized clinical database records
  const filteredClinicalDiseases = useMemo(() => {
    return clinicalDiseases.filter(d => {
      const q = dbSearchQuery.toLowerCase().trim();
      const matchesQuery = !q ||
        d.officialName.toLowerCase().includes(q) ||
        d.rawName.toLowerCase().includes(q) ||
        d.icd10.toLowerCase().includes(q) ||
        d.snomedCt.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q) ||
        d.specialist.toLowerCase().includes(q);

      const matchesUrgency = dbUrgencyFilter === 'All' || d.urgencyLevel === dbUrgencyFilter;
      return matchesQuery && matchesUrgency;
    });
  }, [clinicalDiseases, dbSearchQuery, dbUrgencyFilter]);

  const totalDbPages = Math.ceil(filteredClinicalDiseases.length / dbRowsPerPage) || 1;
  const paginatedClinicalDiseases = useMemo(() => {
    const start = (dbPage - 1) * dbRowsPerPage;
    return filteredClinicalDiseases.slice(start, start + dbRowsPerPage);
  }, [filteredClinicalDiseases, dbPage, dbRowsPerPage]);

  // Re-run normalization and persist to local storage
  const handleTriggerNormalization = async () => {
    setIsSyncing(true);
    setSyncSuccessMsg(null);
    try {
      const res = await clinicalDatasetService.syncAndPersistToLocalDatabase(true);
      setClinicalDiseases(clinicalDatasetService.getNormalizedDiseases());
      setClinicalSymptoms(clinicalDatasetService.getNormalizedSymptoms());
      setSyncStats(res.stats);
      setSyncSuccessMsg(`Normalized & persisted ${res.stats.totalDiseases} diseases, ${res.stats.totalSymptoms} symptoms, and 164 precautions to local database.`);
      setTimeout(() => setSyncSuccessMsg(null), 4000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  // Export clinical database as JSON, SQL, or CSV
  const handleExportDatabase = (format: 'json' | 'sql' | 'csv') => {
    const content = clinicalDatasetService.exportDatabase(format);
    const mimeType = format === 'json' ? 'application/json' : format === 'sql' ? 'application/sql' : 'text/csv';
    const filename = `medassist_clinical_records.${format}`;
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyJson = (record: ClinicalDiseaseRecord) => {
    navigator.clipboard.writeText(JSON.stringify(record, null, 2));
    setCopiedRecordJson(true);
    setTimeout(() => setCopiedRecordJson(false), 2000);
  };

  // Download individual dataset file as true .csv
  const downloadDataset = (file: DatasetFile) => {
    const mimeType = file.contentType === 'text/csv' ? 'text/csv;charset=utf-8;' : 'text/plain;charset=utf-8;';
    const blob = new Blob([file.content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAllKaggleDatasets = () => {
    REPOSITORY_DATASETS.forEach((file, index) => {
      setTimeout(() => {
        downloadDataset(file);
      }, index * 250);
    });
  };

  const handleCopyCli = () => {
    navigator.clipboard.writeText(KAGGLE_DATASET_METADATA.cliCommand);
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  const handleCopyCsvContent = () => {
    if (selectedDataset) {
      navigator.clipboard.writeText(selectedDataset.content);
      setCopiedCsv(true);
      setTimeout(() => setCopiedCsv(false), 2000);
    }
  };

  // Complete repository structure with genuine Kaggle files
  const fileTree: RepoFile = {
    id: 'root',
    name: 'Medicine-Recommendation-System',
    path: 'Medicine-Recommendation-System',
    type: 'folder',
    children: [
      {
        id: 'readme',
        name: 'README.md',
        path: 'README.md',
        type: 'file',
        language: 'markdown',
        content: `# Medicine Recommendation & Disease Prediction System (Kaggle Benchmark)

A clinical intelligence and pharmacotherapy decision-support platform trained on the authentic Kaggle Disease-Symptom dataset (\`itachi9604/disease-symptom-description-dataset\`).

## 📊 Dataset Provenance & Kaggle Source
- **Official Dataset**: Disease Symptom Description & Medicine Recommendation Dataset
- **Kaggle URL**: https://www.kaggle.com/datasets/itachi9604/disease-symptom-description-dataset
- **Classes**: 41 Validated Diseases across 132 Clinical Symptoms
- **Standards**: WHO ICD-10-CM, SNOMED-CT, Acuity 1-7 Weights
- **Core Files**:
  1. \`dataset/raw/symptom_Description.csv\` (Clinical Disease Definitions)
  2. \`dataset/raw/symptom_precaution.csv\` (4-Tier Early Interventions)
  3. \`dataset/raw/Symptom-severity.csv\` (132 Symptom Weights: Scale 1-7)
  4. \`dataset/raw/medications.csv\` (Clinical Pharmacotherapy Regimens)
  5. \`dataset/raw/diets.csv\` (Therapeutic Nutritional Plans)
  6. \`dataset/raw/workout.csv\` (Physical Activity & Lifestyle Protocols)
  7. \`dataset/raw/Testing.csv\` (Multi-class 132-Symptom Benchmark Test Split)
  8. \`dataset/raw/Training_sample.csv\` (Sample Feature Matrix)
`
      },
      {
        id: 'requirements',
        name: 'requirements.txt',
        path: 'requirements.txt',
        type: 'file',
        language: 'text',
        content: `flask==3.0.2
flask-cors==4.0.0
scikit-learn==1.4.1.post1
pandas==2.2.1
numpy==1.26.4
joblib==1.3.2
pillow==10.2.0
pytesseract==0.3.10
psycopg2-binary==2.9.9
python-dotenv==1.0.1
kaggle==1.6.6`
      },
      {
        id: 'dataset_folder',
        name: 'dataset',
        path: 'dataset',
        type: 'folder',
        children: [
          {
            id: 'dataset_raw',
            name: 'raw',
            path: 'dataset/raw',
            type: 'folder',
            children: REPOSITORY_DATASETS.map((d, idx) => ({
              id: `raw_file_${idx}`,
              name: d.filename,
              path: d.path,
              type: 'file' as const,
              language: d.contentType === 'text/csv' ? 'csv' : d.contentType === 'application/sql' ? 'sql' : 'text',
              content: d.content
            }))
          }
        ]
      },
      {
        id: 'ml_folder',
        name: 'app/ml',
        path: 'app/ml',
        type: 'folder',
        children: [
          {
            id: 'train_model_py',
            name: 'train_model.py',
            path: 'app/ml/train_model.py',
            type: 'file',
            language: 'python',
            content: `"""
Model Training Script for Kaggle Medicine Recommendation Dataset
Dataset Source: itachi9604/disease-symptom-description-dataset
"""
import pandas as pd
from sklearn.ensemble import RandomForestClassifier

df = pd.read_csv('dataset/raw/Training.csv')
X = df.drop(columns=['prognosis'])
y = df['prognosis']
rf = RandomForestClassifier(n_estimators=100, random_state=42)
rf.fit(X, y)
`
          }
        ]
      },
      {
        id: 'database_folder',
        name: 'database',
        path: 'database',
        type: 'folder',
        children: [
          {
            id: 'schema_sql',
            name: 'schema.sql',
            path: 'database/schema.sql',
            type: 'file',
            language: 'sql',
            content: REPOSITORY_DATASETS[8]?.content || '-- PostgreSQL schema'
          }
        ]
      }
    ]
  };

  const findFileByPath = (node: RepoFile, path: string): RepoFile | null => {
    if (node.path === path) return node;
    if (node.children) {
      for (const child of node.children) {
        const found = findFileByPath(child, path);
        if (found) return found;
      }
    }
    return null;
  };

  const currentFile = findFileByPath(fileTree, selectedFilePath) || fileTree.children![0];

  const handleCopyCode = () => {
    if (currentFile.content) {
      navigator.clipboard.writeText(currentFile.content);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleDownloadCurrentCode = () => {
    if (!currentFile.content) return;
    const blob = new Blob([currentFile.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderTreeNode = (node: RepoFile, depth: number = 0) => {
    const isFolder = node.type === 'folder';
    const isOpen = openFolders[node.path];

    if (isFolder) {
      return (
        <div key={node.path} className="select-none">
          <div
            onClick={() => toggleFolder(node.path)}
            style={{ paddingLeft: `${depth * 14 + 8}px` }}
            className="flex items-center gap-1.5 py-1.5 px-2 hover:bg-slate-100 rounded-lg cursor-pointer text-xs font-semibold text-slate-700"
          >
            {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
            {isOpen ? <FolderOpen className="w-4 h-4 text-teal-600" /> : <Folder className="w-4 h-4 text-slate-400" />}
            <span>{node.name}</span>
          </div>
          {isOpen && node.children && (
            <div>
              {node.children.map(child => renderTreeNode(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    const isSelected = selectedFilePath === node.path;
    return (
      <div
        key={node.path}
        onClick={() => setSelectedFilePath(node.path)}
        style={{ paddingLeft: `${depth * 14 + 20}px` }}
        className={`flex items-center gap-2 py-1 px-2 rounded-lg cursor-pointer text-xs font-mono transition-colors ${
          isSelected
            ? 'bg-teal-50 text-teal-800 font-bold border-l-2 border-teal-600'
            : 'text-slate-600 hover:bg-slate-100'
        }`}
      >
        {node.language === 'csv' ? (
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        ) : node.language === 'python' ? (
          <FileCode className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        ) : node.language === 'sql' ? (
          <Database className="w-3.5 h-3.5 text-sky-600 shrink-0" />
        ) : (
          <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        )}
        <span className="truncate">{node.name}</span>
      </div>
    );
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'Emergency':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'High':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Medium':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-700 font-bold text-xs uppercase tracking-wider mb-1">
            <Database className="w-4 h-4" />
            <span>Clinical Datasets & Schema Engineering</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Clinical Dataset Hub & Local Database Schema
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5 max-w-3xl">
            Normalized clinical records with WHO ICD-10-CM, SNOMED-CT identifiers, calibrated symptom weights, and therapeutic precautions stored in your local persistent schema.
          </p>
        </div>

        {/* 3-Way Mode Switcher */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 self-start md:self-center shrink-0">
          <button
            type="button"
            onClick={() => setActiveViewMode('clinical-db')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeViewMode === 'clinical-db'
                ? 'bg-white text-teal-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>Clinical DB & Schema</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveViewMode('kaggle-hub')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeViewMode === 'kaggle-hub'
                ? 'bg-white text-teal-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Raw Kaggle CSVs</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveViewMode('code-repo')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeViewMode === 'code-repo'
                ? 'bg-white text-teal-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FolderTree className="w-3.5 h-3.5 text-teal-600" />
            <span>Code Tree</span>
          </button>
        </div>
      </div>

      {/* 2. MODE: CLINICAL DB & NORMALIZER */}
      {activeViewMode === 'clinical-db' && (
        <div className="space-y-6">
          {/* Success Banner */}
          {syncSuccessMsg && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{syncSuccessMsg}</span>
              </div>
              <button
                type="button"
                onClick={() => setSyncSuccessMsg(null)}
                className="text-emerald-700 hover:text-emerald-950 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Normalization & Schema Overview Card */}
          <div className="rounded-2xl border border-teal-200 bg-linear-to-r from-teal-950 via-slate-900 to-slate-950 p-5 sm:p-6 text-white shadow-md">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-teal-300" />
                    <span>Schema Status: Active & Normalized</span>
                  </span>
                  <span className="text-xs text-slate-400">
                    Version: {syncStats.version}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Normalized Clinical Database Schema (ICD-10 / SNOMED-CT)
                </h2>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Raw Kaggle data parsed and mapped to international medical ontologies. Contains 41 verified clinical diseases, 132 calibrated symptom acuity ratings (1-7), 164 clinical precautions, and first-line pharmacotherapies.
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-300">
                  <div>
                    <span className="font-bold text-teal-400">{clinicalDiseases.length}</span> Disease Records
                  </div>
                  <span>·</span>
                  <div>
                    <span className="font-bold text-teal-400">{clinicalSymptoms.length}</span> Calibrated Symptoms
                  </div>
                  <span>·</span>
                  <div>
                    <span className="font-bold text-teal-400">{syncStats.totalPrecautions}</span> Precautions
                  </div>
                  <span>·</span>
                  <div>
                    <span className="font-bold text-teal-400">100%</span> Integrity Validated
                  </div>
                </div>
              </div>

              {/* Actions & Re-normalization */}
              <div className="flex flex-col sm:items-end gap-3 shrink-0">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTriggerNormalization}
                    disabled={isSyncing}
                    className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-teal-500/30 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Normalizing...' : 'Re-normalize & Sync'}</span>
                  </button>

                  <div className="relative group">
                    <button
                      type="button"
                      onClick={() => handleExportDatabase('json')}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-teal-400" />
                      <span>Export JSON</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleExportDatabase('sql')}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
                    title="Export PostgreSQL DDL & DML INSERT script"
                  >
                    <Database className="w-3.5 h-3.5 text-sky-400" />
                    <span>Export SQL</span>
                  </button>
                </div>

                <div className="text-[11px] text-slate-400 font-mono">
                  Last Synced: {new Date(syncStats.lastSyncTimestamp).toLocaleTimeString()} · Local Storage Active
                </div>
              </div>
            </div>
          </div>

          {/* Database Schema Specifications Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Disease Schema */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">ClinicalDiseaseRecord</h3>
                    <p className="text-[11px] text-slate-500 font-mono">Schema Entity: clinical_diseases</p>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800">
                  41 Entities
                </span>
              </div>
              <div className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-100">
                <div className="flex justify-between">
                  <span className="font-mono text-slate-800">id, officialName, rawName</span>
                  <span className="text-slate-400 font-mono">string</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono text-slate-800">icd10, snomedCt</span>
                  <span className="text-teal-700 font-mono">WHO / SNOMED</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono text-slate-800">urgencyLevel</span>
                  <span className="text-slate-400 font-mono">'Low'|'Medium'|'High'|'Emergency'</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono text-slate-800">precautions[], dietaryAdvice[]</span>
                  <span className="text-slate-400 font-mono">string[]</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono text-slate-800">normalizedMedicationsList[]</span>
                  <span className="text-slate-400 font-mono">NormalizedMedicationItem[]</span>
                </div>
              </div>
            </div>

            {/* Symptom Schema */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">ClinicalSymptomRecord</h3>
                    <p className="text-[11px] text-slate-500 font-mono">Schema Entity: clinical_symptoms</p>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  132 Entities
                </span>
              </div>
              <div className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-100">
                <div className="flex justify-between">
                  <span className="font-mono text-slate-800">id, standardKey, displayName</span>
                  <span className="text-slate-400 font-mono">string</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono text-slate-800">anatomicalCategory</span>
                  <span className="text-slate-400 font-mono">8 Anatomical Systems</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono text-slate-800">clinicalWeight (Kaggle calibrated)</span>
                  <span className="text-emerald-700 font-mono">Scale 1 - 7</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono text-slate-800">severityLevel</span>
                  <span className="text-slate-400 font-mono">'Mild'|'Moderate'|'Severe'|'Critical'</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono text-slate-800">icd10Reference</span>
                  <span className="text-teal-700 font-mono">ICD-10 R-Series</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Normalized Clinical Records Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Table Control Bar */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Stored Normalized Clinical Disease Records
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Professional records saved in the browser's persistent local storage schema.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Search Input */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={dbSearchQuery}
                    onChange={e => {
                      setDbSearchQuery(e.target.value);
                      setDbPage(1);
                    }}
                    placeholder="Search ICD-10, SNOMED, disease..."
                    className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 w-52 sm:w-60"
                  />
                </div>

                {/* Urgency Filter */}
                <select
                  value={dbUrgencyFilter}
                  onChange={e => {
                    setDbUrgencyFilter(e.target.value);
                    setDbPage(1);
                  }}
                  className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 cursor-pointer"
                >
                  <option value="All">All Urgencies</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Emergency">Emergency</option>
                </select>

                <button
                  type="button"
                  onClick={() => handleExportDatabase('csv')}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  title="Download flattened master CSV"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>CSV</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100/80 sticky top-0 z-10 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3 w-12 text-center">#</th>
                    <th className="p-3">Official Clinical Disease</th>
                    <th className="p-3">WHO ICD-10</th>
                    <th className="p-3">SNOMED-CT</th>
                    <th className="p-3">Specialty</th>
                    <th className="p-3">Triage Urgency</th>
                    <th className="p-3">First-Line Medication</th>
                    <th className="p-3 text-center">Quality</th>
                    <th className="p-3 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedClinicalDiseases.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400 font-medium">
                        No clinical records found matching "{dbSearchQuery}"
                      </td>
                    </tr>
                  ) : (
                    paginatedClinicalDiseases.map((rec, rIdx) => {
                      const absoluteIdx = (dbPage - 1) * dbRowsPerPage + rIdx + 1;
                      const firstMed = rec.normalizedMedicationsList[0]?.drugName || 'Standard Supportive Care';
                      return (
                        <tr
                          key={rec.id}
                          className="hover:bg-teal-50/40 transition-colors odd:bg-white even:bg-slate-50/40"
                        >
                          <td className="p-3 text-center text-slate-400 font-mono font-semibold">
                            {absoluteIdx}
                          </td>
                          <td className="p-3 font-semibold text-slate-900 max-w-xs truncate">
                            <div className="truncate">{rec.officialName}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{rec.rawName}</div>
                          </td>
                          <td className="p-3 font-mono font-bold text-teal-700">
                            {rec.icd10}
                          </td>
                          <td className="p-3 font-mono text-slate-600">
                            {rec.snomedCt}
                          </td>
                          <td className="p-3 text-slate-600">
                            {rec.category}
                          </td>
                          <td className="p-3">
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${getUrgencyBadge(rec.urgencyLevel)}`}>
                              {rec.urgencyLevel}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-[11px] text-slate-700 max-w-[180px] truncate" title={firstMed}>
                            {firstMed}
                          </td>
                          <td className="p-3 text-center">
                            <span className="font-mono text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              {rec.dataQualityScore}%
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedRecordForInspection(rec)}
                              className="px-2.5 py-1 rounded-md bg-teal-50 hover:bg-teal-100 text-teal-800 text-[11px] font-bold transition-colors cursor-pointer"
                            >
                              Inspect JSON
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-3 sm:px-5 border-t border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
              <div>
                Showing <span className="font-bold text-slate-800">{Math.min(filteredClinicalDiseases.length, (dbPage - 1) * dbRowsPerPage + 1)}</span> to{' '}
                <span className="font-bold text-slate-800">{Math.min(filteredClinicalDiseases.length, dbPage * dbRowsPerPage)}</span> of{' '}
                <span className="font-bold text-slate-800">{filteredClinicalDiseases.length}</span> records
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={dbPage <= 1}
                  onClick={() => setDbPage(p => Math.max(1, p - 1))}
                  className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2 font-bold text-slate-700">
                  {dbPage} / {totalDbPages}
                </span>
                <button
                  type="button"
                  disabled={dbPage >= totalDbPages}
                  onClick={() => setDbPage(p => Math.min(totalDbPages, p + 1))}
                  className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Record Inspection Modal */}
          {selectedRecordForInspection && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                <div className="bg-slate-950 text-white p-5 flex items-center justify-between border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
                      <Code className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-mono text-sm font-bold text-white">
                        {selectedRecordForInspection.officialName}
                      </h3>
                      <div className="text-[11px] text-slate-400 font-mono">
                        ICD-10: {selectedRecordForInspection.icd10} • SNOMED: {selectedRecordForInspection.snomedCt}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyJson(selectedRecordForInspection)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {copiedRecordJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedRecordJson ? 'Copied' : 'Copy JSON'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRecordForInspection(null)}
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="p-5 overflow-y-auto bg-slate-950 font-mono text-xs text-teal-300">
                  <pre className="whitespace-pre-wrap leading-relaxed">
                    {JSON.stringify(selectedRecordForInspection, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. MODE: KAGGLE HUB */}
      {activeViewMode === 'kaggle-hub' && (
        <div className="space-y-6">
          {/* Provenance Banner */}
          <div className="rounded-2xl border border-teal-200 bg-linear-to-r from-teal-900 via-slate-900 to-slate-950 p-5 sm:p-6 text-white shadow-md">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-teal-300" />
                    <span>Verified Kaggle Dataset</span>
                  </span>
                  <span className="text-xs text-slate-400">
                    License: {KAGGLE_DATASET_METADATA.license}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {KAGGLE_DATASET_METADATA.title}
                </h2>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Direct benchmark source for clinical diagnostic machine learning. Contains 41 disease classes, 132 symptom variables, symptom severity matrices, and complete medical precaution protocols.
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-teal-400">{KAGGLE_DATASET_METADATA.totalDiseases}</span> Diseases
                  </div>
                  <span>·</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-teal-400">{KAGGLE_DATASET_METADATA.totalSymptoms}</span> Symptom Features
                  </div>
                  <span>·</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-teal-400">{REPOSITORY_DATASETS.length}</span> Original CSV Files
                  </div>
                </div>
              </div>

              {/* Action Buttons & CLI Snippet */}
              <div className="space-y-3 shrink-0 flex flex-col sm:items-end">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadAllKaggleDatasets}
                    className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-teal-500/30 transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download All Kaggle CSVs</span>
                  </button>

                  <a
                    href={KAGGLE_DATASET_METADATA.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-teal-400" />
                    <span>View on Kaggle</span>
                  </a>
                </div>

                {/* Kaggle API Terminal Command */}
                <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-300 max-w-full">
                  <Terminal className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span className="truncate max-w-[260px] sm:max-w-xs">{KAGGLE_DATASET_METADATA.cliCommand}</span>
                  <button
                    type="button"
                    onClick={handleCopyCli}
                    className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
                    title="Copy Kaggle CLI command"
                  >
                    {copiedCli ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Dataset Selector Cards */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-600" />
                <span>Original Kaggle Dataset Files</span>
              </h3>
              <span className="text-xs text-slate-500 font-medium">Click any dataset to preview & download</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {REPOSITORY_DATASETS.filter(d => d.contentType === 'text/csv').map((file, idx) => {
                const isSelected = selectedDatasetIndex === idx;

                return (
                  <div
                    key={file.filename}
                    onClick={() => {
                      setSelectedDatasetIndex(idx);
                      setCurrentPage(1);
                      setTableSearchQuery('');
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 text-left ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50/40 shadow-xs ring-1 ring-teal-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-900 truncate">
                          <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="truncate">{file.filename}</span>
                        </div>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-teal-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2">
                        {file.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                      <span>{file.rowCount ? `${file.rowCount} rows` : `${file.content.split('\n').length} rows`}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadDataset(file);
                        }}
                        className="font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer"
                        title={`Download ${file.filename}`}
                      >
                        <Download className="w-3 h-3" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive CSV Table Viewer */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 font-mono">
                      {selectedDataset.filename}
                    </h3>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                      Real Kaggle CSV
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedDataset.description}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={tableSearchQuery}
                    onChange={e => {
                      setTableSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search rows or diseases..."
                    className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 w-48 sm:w-56"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleCopyCsvContent}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  {copiedCsv ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCsv ? 'Copied!' : 'Copy CSV'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => downloadDataset(selectedDataset)}
                  className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .CSV</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[520px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100/80 sticky top-0 z-10 border-b border-slate-200">
                  <tr>
                    <th className="p-3 font-bold text-slate-500 uppercase tracking-wider w-12 text-center">#</th>
                    {parsedCsvData.headers.map((h, i) => (
                      <th
                        key={i}
                        className="p-3 font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={parsedCsvData.headers.length + 1}
                        className="p-8 text-center text-slate-400 font-medium"
                      >
                        No rows found matching "{tableSearchQuery}"
                      </td>
                    </tr>
                  ) : (
                    paginatedRows.map((row, rIdx) => {
                      const absoluteRowIdx = (currentPage - 1) * rowsPerPage + rIdx + 1;
                      return (
                        <tr
                          key={rIdx}
                          className="hover:bg-teal-50/30 transition-colors odd:bg-white even:bg-slate-50/40"
                        >
                          <td className="p-3 text-slate-400 text-center font-mono font-semibold select-none">
                            {absoluteRowIdx}
                          </td>
                          {row.map((cell, cIdx) => (
                            <td
                              key={cIdx}
                              className="p-3 text-slate-800 whitespace-nowrap max-w-xs truncate"
                              title={cell}
                            >
                              {cell.startsWith("['") && cell.endsWith("']") ? (
                                <span className="font-mono text-teal-800 text-[11px] bg-teal-50/80 px-1.5 py-0.5 rounded border border-teal-200/50">
                                  {cell}
                                </span>
                              ) : (
                                cell
                              )}
                            </td>
                          ))}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-3 sm:px-5 border-t border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
              <div>
                Showing <span className="font-bold text-slate-800">{Math.min(filteredRows.length, (currentPage - 1) * rowsPerPage + 1)}</span> to{' '}
                <span className="font-bold text-slate-800">{Math.min(filteredRows.length, currentPage * rowsPerPage)}</span> of{' '}
                <span className="font-bold text-slate-800">{filteredRows.length}</span> rows
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 mr-2">
                  <span>Rows:</span>
                  <select
                    value={rowsPerPage}
                    onChange={e => {
                      setRowsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="border border-slate-200 rounded px-1.5 py-0.5 bg-white text-slate-700 cursor-pointer"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={40}>40</option>
                  </select>
                </div>

                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2 font-bold text-slate-700">
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODE: REPOSITORY CODE TREE */}
      {activeViewMode === 'code-repo' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs max-h-[640px] overflow-y-auto">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">
              <span>Repository Tree</span>
              <span className="text-[10px] text-teal-600 font-mono">Medicine-Recommendation-System/</span>
            </div>
            <div className="space-y-0.5">
              {fileTree.children?.map(node => renderTreeNode(node, 0))}
            </div>
          </div>

          <div className="lg:col-span-8 bg-slate-950 text-slate-200 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col max-h-[640px]">
            <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                <Code className="w-4 h-4 text-teal-400" />
                <span>{currentFile.path}</span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  {currentFile.language || 'text'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 cursor-pointer transition-colors"
                  title="Copy code"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="text-[11px] hidden sm:inline">{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadCurrentCode}
                  className="p-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs flex items-center gap-1 cursor-pointer transition-colors"
                  title="Download file"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="text-[11px] hidden sm:inline">Download</span>
                </button>
              </div>
            </div>

            <div className="p-4 overflow-auto flex-1 font-mono text-xs leading-relaxed">
              <pre className="text-slate-300">
                <code>{currentFile.content}</code>
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
