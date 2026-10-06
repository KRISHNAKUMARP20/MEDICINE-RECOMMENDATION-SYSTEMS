import { HealthMetric, PatientProfile, TriagePriorityAssessment, TriageUrgencyLevel } from '../types';
import { SymptomInput } from './mlPredictionService';

export interface VitalsInputContext {
  bloodPressureSys: number;
  bloodPressureDia: number;
  heartRate: number;
  temperature: number;
  bloodSugar: number;
  oxygenSaturation?: number;
  respiratoryRate?: number;
  weight?: number;
}

class TriagePriorityService {
  /**
   * Fast synchronous clinical evaluation based on Emergency Severity Index (ESI) & Manchester Triage guidelines.
   * Runs immediately on symptom/vital change with 0 latency.
   */
  public evaluateLocal(
    symptoms: SymptomInput[],
    vitals: VitalsInputContext,
    patientProfile?: Partial<PatientProfile>
  ): TriagePriorityAssessment {
    const symList = (symptoms || []).map(s => s.symptomId.toLowerCase());
    const hasSevere = (symptoms || []).some(s => s.severity === 'Severe');
    const hasModerate = (symptoms || []).some(s => s.severity === 'Moderate');

    const sys = Number(vitals.bloodPressureSys) || 120;
    const dia = Number(vitals.bloodPressureDia) || 80;
    const hr = Number(vitals.heartRate) || 72;
    const temp = Number(vitals.temperature) || 98.6;
    const sugar = Number(vitals.bloodSugar) || 95;
    const spo2 = Number(vitals.oxygenSaturation) || 98;
    const rr = Number(vitals.respiratoryRate) || 16;

    const redFlags: string[] = [];

    // Red-flag symptom checks
    const hasChestPain = symList.some(s => s.includes('chest_pain') || s.includes('chest pain'));
    const hasBreathShortness = symList.some(s => s.includes('breath') || s.includes('shortness_of_breath'));
    const hasConfusion = symList.some(s => s.includes('confus') || s.includes('altered_sensorium') || s.includes('coma') || s.includes('dizziness'));
    const hasHemoptysis = symList.some(s => s.includes('blood') || s.includes('hemoptysis'));
    const hasStiffNeck = symList.some(s => s.includes('neck') || s.includes('stiff_neck'));

    if (hasChestPain) redFlags.push('Acute chest pain / potential acute coronary syndrome');
    if (hasBreathShortness && (hasSevere || spo2 < 93)) redFlags.push('Acute respiratory distress or hypoxemic dyspnea');
    if (hasConfusion) redFlags.push('Altered neurological state or impaired consciousness');
    if (hasHemoptysis) redFlags.push('Active hemoptysis or mucosal hemorrhage');
    if (hasStiffNeck && temp >= 101) redFlags.push('Meningeal irritation triad (fever + nuchal rigidity)');

    // Vitals danger zone classification
    let vitalsStatus: 'Normal' | 'Borderline' | 'Abnormal' | 'Critical' = 'Normal';
    const vitalIssues: string[] = [];

    if (sys >= 180 || dia >= 120) {
      redFlags.push(`Hypertensive crisis: ${sys}/${dia} mmHg`);
      vitalIssues.push(`BP ${sys}/${dia} mmHg (hypertensive crisis >= 180/120)`);
      vitalsStatus = 'Critical';
    } else if (sys >= 140 || dia >= 90) {
      vitalIssues.push(`BP ${sys}/${dia} mmHg (Stage 2 hypertension)`);
      vitalsStatus = 'Abnormal';
    } else if (sys < 90 || dia < 60) {
      vitalIssues.push(`BP ${sys}/${dia} mmHg (hypotensive hypoperfusion)`);
      vitalsStatus = 'Abnormal';
    }

    if (hr >= 130 || hr < 45) {
      redFlags.push(`Severe pulse excursion: ${hr} BPM`);
      vitalIssues.push(`Heart Rate ${hr} BPM (critical bradycardia/tachycardia)`);
      vitalsStatus = 'Critical';
    } else if (hr >= 100 || hr < 55) {
      vitalIssues.push(`Heart Rate ${hr} BPM (sinus tachycardia/bradycardia)`);
      if (vitalsStatus !== 'Critical') vitalsStatus = 'Abnormal';
    }

    if (temp >= 104.0) {
      redFlags.push(`Hyperpyrexia: ${temp}°F`);
      vitalIssues.push(`Body Temp ${temp}°F (hyperpyrexia >= 104°F)`);
      vitalsStatus = 'Critical';
    } else if (temp >= 101.5) {
      vitalIssues.push(`Body Temp ${temp}°F (high pyrexia)`);
      if (vitalsStatus !== 'Critical') vitalsStatus = 'Abnormal';
    }

    if (sugar < 60) {
      redFlags.push(`Severe hypoglycemia: ${sugar} mg/dL`);
      vitalIssues.push(`Blood Sugar ${sugar} mg/dL (severe neuroglycopenia)`);
      vitalsStatus = 'Critical';
    } else if (sugar >= 250) {
      redFlags.push(`Severe hyperglycemia: ${sugar} mg/dL`);
      vitalIssues.push(`Blood Sugar ${sugar} mg/dL (marked hyperglycemia)`);
      if (vitalsStatus !== 'Critical') vitalsStatus = 'Abnormal';
    } else if (sugar >= 140) {
      vitalIssues.push(`Blood Sugar ${sugar} mg/dL (impaired/elevated)`);
      if (vitalsStatus === 'Normal') vitalsStatus = 'Borderline';
    }

    if (spo2 > 0 && spo2 < 92) {
      redFlags.push(`Critical hypoxemia: SpO2 ${spo2}%`);
      vitalIssues.push(`SpO2 ${spo2}% (<92% hypoxia)`);
      vitalsStatus = 'Critical';
    } else if (spo2 > 0 && spo2 < 95) {
      vitalIssues.push(`SpO2 ${spo2}% (borderline desaturation)`);
      if (vitalsStatus === 'Normal') vitalsStatus = 'Borderline';
    }

    const vitalsDetails = vitalIssues.length > 0
      ? `Contributing vital deviations: ${vitalIssues.join('; ')}.`
      : 'All monitored vital metrics are currently within stable adult ranges.';

    // EMERGENCY (ESI 1 or 2)
    const isEmergency =
      vitalsStatus === 'Critical' ||
      (hasChestPain && (hasSevere || hr >= 100 || sys >= 140)) ||
      (hasBreathShortness && (hasSevere || spo2 < 93)) ||
      hasConfusion ||
      hasHemoptysis ||
      (hasStiffNeck && temp >= 101);

    if (isEmergency) {
      const isEsi1 = vitalsStatus === 'Critical' && (hasChestPain || hasConfusion || (spo2 > 0 && spo2 < 90));
      return {
        urgencyLevel: 'Emergency',
        esiScore: isEsi1 ? 1 : 2,
        priorityLabel: isEsi1 ? 'Emergency Priority (Immediate Resuscitation)' : 'Emergency Priority (Emergent Care)',
        badgeColor: 'rose',
        chiefRiskFactor: redFlags[0] || 'High-risk cardiopulmonary or hemodynamic instability',
        clinicalRationale: `Urgent clinical presentation: ${redFlags.slice(0, 2).join('; ') || 'Critical physiological vital parameter breach'}. Concurrently recorded vitals (${sys}/${dia} mmHg, HR ${hr} BPM, Temp ${temp}°F) present imminent risk of systemic decompensation. Immediate emergency department triage required.`,
        recommendedCareSetting: 'Emergency Department / Call 911',
        timeframeToCare: 'Immediate (< 15 mins)',
        vitalSignsImpact: {
          status: vitalsStatus,
          details: vitalsDetails
        },
        redFlagsIdentified: redFlags.length > 0 ? redFlags : ['Physiological instability requiring immediate physician assessment'],
        suggestedActionDirectives: [
          'Call Emergency Medical Services (911/112) or go to the nearest Emergency Department immediately.',
          'Do not drive yourself to the hospital; await emergency medical transport.',
          'Remain calm, seated in a comfortable upright position, and loosen constrictive clothing.'
        ],
        evaluatedAt: new Date().toISOString(),
        source: 'clinical_rule_engine'
      };
    }

    // URGENT (ESI 3)
    const isUrgent =
      vitalsStatus === 'Abnormal' ||
      hasSevere ||
      hasChestPain ||
      hasBreathShortness ||
      (temp >= 100.5 && symList.length >= 2) ||
      symList.length >= 4;

    if (isUrgent) {
      return {
        urgencyLevel: 'Urgent',
        esiScore: 3,
        priorityLabel: 'Urgent Priority (Same-Day Clinical Care)',
        badgeColor: 'amber',
        chiefRiskFactor: redFlags[0] || (hasSevere ? 'High-severity symptom presentation' : 'Elevated physiological biomarkers'),
        clinicalRationale: `Symptoms and vital signs indicate active acute illness (${vitalsDetails}). While not currently in immediate life-threatening collapse, progression risk warrants formal clinical assessment within a short timeframe.`,
        recommendedCareSetting: 'Urgent Care Center / Same-Day Clinic',
        timeframeToCare: 'Within 2-4 hours',
        vitalSignsImpact: {
          status: vitalsStatus,
          details: vitalsDetails
        },
        redFlagsIdentified: redFlags.length > 0 ? redFlags : ['Active acute disease manifestations requiring prompt evaluation'],
        suggestedActionDirectives: [
          'Visit an Urgent Care Center or arrange a same-day physician consultation.',
          'Maintain adequate oral hydration and monitor temperature and resting pulse every 2 hours.',
          'If symptoms abruptly escalate or chest pressure develops, proceed immediately to the Emergency Room.'
        ],
        evaluatedAt: new Date().toISOString(),
        source: 'clinical_rule_engine'
      };
    }

    // ROUTINE (ESI 4 or 5)
    return {
      urgencyLevel: 'Routine',
      esiScore: 4,
      priorityLabel: 'Routine Priority (Standard Outpatient Care)',
      badgeColor: 'emerald',
      chiefRiskFactor: 'Mild localized or self-limiting symptoms with stable vitals',
      clinicalRationale: `Reported symptoms are within manageable bounds and vital parameters are stable (${sys}/${dia} mmHg, HR ${hr} BPM, Temp ${temp}°F). No red-flag cardiopulmonary or neurological signs are observed.`,
      recommendedCareSetting: 'Primary Care Physician / Telehealth / Home Care',
      timeframeToCare: 'Within 24-72 hours',
      vitalSignsImpact: {
        status: 'Normal',
        details: vitalsDetails
      },
      redFlagsIdentified: [],
      suggestedActionDirectives: [
        'Schedule a routine outpatient appointment or consult with your primary doctor via telehealth.',
        'Follow supportive home-care measures: rest, proper hydration, and nutritious meals.',
        'Re-evaluate if symptoms persist beyond 3-5 days or if new severe symptoms emerge.'
      ],
      evaluatedAt: new Date().toISOString(),
      source: 'clinical_rule_engine'
    };
  }

  /**
   * Calls the Gemini 3.8 Flash backend API to generate deep clinical triage reasoning.
   */
  public async evaluateWithGemini(
    symptoms: SymptomInput[],
    vitals: VitalsInputContext,
    patientProfile?: Partial<PatientProfile>
  ): Promise<TriagePriorityAssessment> {
    try {
      const response = await fetch('/api/evaluate-triage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          symptoms,
          vitals,
          patientProfile
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const result: TriagePriorityAssessment = await response.json();
      return result;
    } catch (err) {
      console.warn('Backend triage API failed, falling back to local clinical rule engine:', err);
      return this.evaluateLocal(symptoms, vitals, patientProfile);
    }
  }
}

export const triagePriorityService = new TriagePriorityService();
