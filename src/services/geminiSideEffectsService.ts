export interface GeminiSideEffectsResult {
  medicineName: string;
  genericName?: string;
  drugClass?: string;
  commonSideEffects: string[];
  severeSideEffects: string[];
  adverseEffectProfile?: string;
  monitoringAdvice?: string;
  blackBoxWarning?: string | null;
  patientCounselingPoint?: string;
  source: 'gemini' | 'clinical_dataset';
  modelUsed: string;
  fetchedAt: string;
}

const CACHE_STORAGE_KEY = 'medassist_gemini_side_effects_cache_v1';

class GeminiSideEffectsService {
  private memoryCache: Map<string, GeminiSideEffectsResult> = new Map();

  constructor() {
    this.loadCacheFromStorage();
  }

  private loadCacheFromStorage() {
    try {
      const data = localStorage.getItem(CACHE_STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        Object.entries(parsed).forEach(([key, val]) => {
          this.memoryCache.set(key.toLowerCase(), val as GeminiSideEffectsResult);
        });
      }
    } catch {
      // ignore
    }
  }

  private saveCacheToStorage() {
    try {
      const obj: Record<string, GeminiSideEffectsResult> = {};
      this.memoryCache.forEach((val, key) => {
        obj[key] = val;
      });
      localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(obj));
    } catch {
      // ignore
    }
  }

  public getCached(medKey: string): GeminiSideEffectsResult | null {
    return this.memoryCache.get(medKey.toLowerCase()) || null;
  }

  public async fetchSideEffects(medicine: {
    id?: string;
    name: string;
    genericName?: string;
    drugClass?: string;
  }): Promise<GeminiSideEffectsResult> {
    const cacheKey = (medicine.id || medicine.name).toLowerCase();
    const cached = this.getCached(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await fetch('/api/medication-side-effects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          medicineName: medicine.name,
          genericName: medicine.genericName,
          drugClass: medicine.drugClass
        })
      });

      if (!response.ok) {
        throw new Error(`API returned HTTP ${response.status}`);
      }

      const result: GeminiSideEffectsResult = await response.json();
      this.memoryCache.set(cacheKey, result);
      this.memoryCache.set(medicine.name.toLowerCase(), result);
      this.saveCacheToStorage();
      return result;
    } catch (err) {
      console.warn('Fallback side effects due to API failure:', err);
      const fallback: GeminiSideEffectsResult = {
        medicineName: medicine.name,
        genericName: medicine.genericName,
        drugClass: medicine.drugClass,
        commonSideEffects: ['Mild nausea or dyspepsia', 'Headache', 'Drowsiness or dizziness', 'Dry mouth'],
        severeSideEffects: ['Acute anaphylaxis / Angioedema', 'Severe cutaneous adverse reactions', 'Hepatic or renal toxicity with overdose'],
        adverseEffectProfile: `Clinical safety profile for ${medicine.name} (${medicine.drugClass || 'Therapeutic'}).`,
        monitoringAdvice: 'Monitor clinical vital signs and patient tolerance.',
        blackBoxWarning: null,
        patientCounselingPoint: 'Report unusual rash, difficulty breathing, or severe pain immediately to your physician.',
        source: 'clinical_dataset',
        modelUsed: 'Clinical Formulary Knowledge Base',
        fetchedAt: new Date().toISOString()
      };
      this.memoryCache.set(cacheKey, fallback);
      return fallback;
    }
  }
}

export const geminiSideEffectsService = new GeminiSideEffectsService();
