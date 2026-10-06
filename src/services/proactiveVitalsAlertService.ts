import { HealthMetric, ProactiveVitalsAlert, UserRecord, DoctorNotification } from '../types';
import { storageService } from './storageService';

const DISMISSED_ALERTS_KEY = 'medassist_dismissed_vitals_alerts_v1';
const ESCALATED_ALERTS_KEY = 'medassist_escalated_vitals_alerts_v1';

class ProactiveVitalsAlertService {
  private getDismissedIds(): Set<string> {
    try {
      const data = localStorage.getItem(DISMISSED_ALERTS_KEY);
      if (data) {
        return new Set(JSON.parse(data));
      }
    } catch {
      // ignore
    }
    return new Set();
  }

  private getEscalatedIds(): Set<string> {
    try {
      const data = localStorage.getItem(ESCALATED_ALERTS_KEY);
      if (data) {
        return new Set(JSON.parse(data));
      }
    } catch {
      // ignore
    }
    return new Set();
  }

  public dismissAlert(alertId: string): void {
    try {
      const set = this.getDismissedIds();
      set.add(alertId);
      localStorage.setItem(DISMISSED_ALERTS_KEY, JSON.stringify(Array.from(set)));
      window.dispatchEvent(new CustomEvent('medassist:vitals-alert-changed'));
    } catch (e) {
      console.error('Failed to dismiss alert', e);
    }
  }

  public markAlertEscalated(alertId: string): void {
    try {
      const set = this.getEscalatedIds();
      set.add(alertId);
      localStorage.setItem(ESCALATED_ALERTS_KEY, JSON.stringify(Array.from(set)));
      window.dispatchEvent(new CustomEvent('medassist:vitals-alert-changed'));
    } catch (e) {
      console.error('Failed to mark alert escalated', e);
    }
  }

  /**
   * Evaluates longitudinal health metrics against ACC/AHA, JNC-8, ADA, and WHO clinical guidelines.
   * Identifies both instantaneous boundary excursions and longitudinal multi-day trend hazards.
   */
  public evaluateVitals(vitalsHistory: HealthMetric[]): ProactiveVitalsAlert[] {
    if (!vitalsHistory || vitalsHistory.length === 0) return [];

    const sorted = [...vitalsHistory].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const latest = sorted[sorted.length - 1];
    const dismissed = this.getDismissedIds();
    const escalated = this.getEscalatedIds();

    const alerts: ProactiveVitalsAlert[] = [];

    // 1. Blood Pressure Evaluation (AHA / ACC 2017 & JNC-8)
    const sys = latest.bloodPressureSys;
    const dia = latest.bloodPressureDia;

    if (sys >= 180 || dia >= 120) {
      const id = `alert-bp-crisis-${latest.id}`;
      alerts.push({
        id,
        metric: 'blood_pressure',
        metricLabel: 'Blood Pressure',
        severity: 'critical',
        title: '🚨 Hypertensive Crisis Emergency Threshold',
        currentValue: `${sys}/${dia} mmHg`,
        safeRange: '< 120 / < 80 mmHg (JNC-8 Normal)',
        message: `Extremely elevated blood pressure (${sys}/${dia} mmHg) exceeds hypertensive crisis limits. Risk of acute organ damage (stroke, cardiac strain, nephrosclerosis).`,
        clinicalSuggestion: 'Seek immediate emergency medical attention or urgently contact your physician. Do not engage in strenuous physical activity. Repeat reading in 5 minutes in a calm seated position.',
        trendDescription: 'Critical instantaneous spike requiring urgent physician triage.',
        timestamp: latest.date,
        status: escalated.has(id) ? 'escalated_to_doctor' : 'active'
      });
    } else if (sys >= 140 || dia >= 90) {
      // Check if it's a consecutive multi-reading elevation trend
      const isConsecutiveHigh = sorted.slice(-3).every(v => v.bloodPressureSys >= 135 || v.bloodPressureDia >= 88);
      const id = `alert-bp-stage2-${latest.id}`;

      alerts.push({
        id,
        metric: 'blood_pressure',
        metricLabel: 'Blood Pressure',
        severity: 'warning',
        title: '⚠️ Stage 2 Hypertension Detected',
        currentValue: `${sys}/${dia} mmHg`,
        safeRange: '< 120 / < 80 mmHg (JNC-8)',
        message: `Blood pressure (${sys}/${dia} mmHg) is in the Stage 2 hypertension range. ${isConsecutiveHigh ? 'Persistent elevation noted across recent measurements.' : 'Significant elevation above clinical goal.'}`,
        clinicalSuggestion: 'Transmit reading to Doctor Portal for review. Evaluate for initial or titrated dual-agent antihypertensive therapy (e.g., ACE-inhibitor/ARB + CCB or Thiazide diuretic). Implement strict DASH diet with sodium < 1,500 mg/day.',
        trendDescription: isConsecutiveHigh ? 'Consecutive multi-day elevated pattern' : 'Current measurement exceeds safe limit',
        timestamp: latest.date,
        status: escalated.has(id) ? 'escalated_to_doctor' : 'active'
      });
    } else if (sys >= 130 || dia >= 80) {
      const id = `alert-bp-stage1-${latest.id}`;
      alerts.push({
        id,
        metric: 'blood_pressure',
        metricLabel: 'Blood Pressure',
        severity: 'warning',
        title: 'Stage 1 Hypertension / Pre-hypertension',
        currentValue: `${sys}/${dia} mmHg`,
        safeRange: '< 120 / < 80 mmHg',
        message: `Systolic (${sys} mmHg) or diastolic (${dia} mmHg) is elevated above the optimal threshold.`,
        clinicalSuggestion: 'Recommend non-pharmacological lifestyle intervention: 30 minutes daily aerobic exercise, reduction of sodium intake, stress management, and 14-day ambulatory blood pressure log.',
        trendDescription: 'Mild elevation requiring non-pharmacological lifestyle management.',
        timestamp: latest.date,
        status: escalated.has(id) ? 'escalated_to_doctor' : 'active'
      });
    } else if (sys < 90 || dia < 60) {
      const id = `alert-bp-hypo-${latest.id}`;
      alerts.push({
        id,
        metric: 'blood_pressure',
        metricLabel: 'Blood Pressure',
        severity: 'warning',
        title: 'Hypotension (Low Blood Pressure)',
        currentValue: `${sys}/${dia} mmHg`,
        safeRange: '90-120 / 60-80 mmHg',
        message: `Blood pressure reading (${sys}/${dia} mmHg) falls below standard physiological baseline, with potential risks of orthostatic dizziness, syncope, or hypoperfusion.`,
        clinicalSuggestion: 'Ensure adequate oral fluid and electrolyte rehydration. Review ongoing vasodilator or diuretic medications for possible over-titration. Avoid rapid standing.',
        trendDescription: 'Sub-baseline pressure excursion.',
        timestamp: latest.date,
        status: escalated.has(id) ? 'escalated_to_doctor' : 'active'
      });
    }

    // 2. Resting Heart Rate Evaluation (AHA Guidelines)
    const hr = latest.heartRate;
    if (hr >= 110) {
      const id = `alert-hr-tachy-high-${latest.id}`;
      alerts.push({
        id,
        metric: 'heart_rate',
        metricLabel: 'Heart Rate',
        severity: 'critical',
        title: '⚠️ Marked Resting Tachycardia',
        currentValue: `${hr} BPM`,
        safeRange: '60 – 100 BPM (Normal Sinus)',
        message: `Resting heart rate (${hr} BPM) is markedly above normal sinus limits. May indicate acute infection, autonomic distress, dehydration, thyroid excess, or cardiac arrhythmia.`,
        clinicalSuggestion: 'Rest in a recumbent position and verify SpO2. If accompanied by palpitations, chest tightness, or dyspnea, seek immediate clinical evaluation or physician review.',
        trendDescription: 'Acute tachycardia excursion.',
        timestamp: latest.date,
        status: escalated.has(id) ? 'escalated_to_doctor' : 'active'
      });
    } else if (hr > 100) {
      const id = `alert-hr-tachy-${latest.id}`;
      alerts.push({
        id,
        metric: 'heart_rate',
        metricLabel: 'Heart Rate',
        severity: 'warning',
        title: 'Elevated Heart Rate (Sinus Tachycardia)',
        currentValue: `${hr} BPM`,
        safeRange: '60 – 100 BPM',
        message: `Resting pulse of ${hr} BPM is above the standard resting target range.`,
        clinicalSuggestion: 'Evaluate caffeine intake, emotional stress, and hydration. Re-check resting pulse after 15 minutes of quiet sitting.',
        trendDescription: 'Above resting threshold.',
        timestamp: latest.date,
        status: escalated.has(id) ? 'escalated_to_doctor' : 'active'
      });
    } else if (hr < 50) {
      const id = `alert-hr-brady-${latest.id}`;
      alerts.push({
        id,
        metric: 'heart_rate',
        metricLabel: 'Heart Rate',
        severity: 'warning',
        title: 'Sinus Bradycardia Detected',
        currentValue: `${hr} BPM`,
        safeRange: '60 – 100 BPM',
        message: `Resting pulse of ${hr} BPM is notably lower than standard adult baseline.`,
        clinicalSuggestion: 'If asymptomatic in an athlete, this may be benign. If experiencing fatigue, lightheadedness, or taking Beta-blockers/Calcium channel blockers, consult your physician for dosage audit.',
        trendDescription: 'Sub-baseline heart rate.',
        timestamp: latest.date,
        status: escalated.has(id) ? 'escalated_to_doctor' : 'active'
      });
    }

    // 3. Fasting Glucose Evaluation (ADA 2024 Guidelines)
    const sugar = latest.bloodSugar;
    if (sugar >= 180) {
      const id = `alert-sugar-high-${latest.id}`;
      alerts.push({
        id,
        metric: 'blood_sugar',
        metricLabel: 'Blood Sugar',
        severity: 'critical',
        title: '🚨 Severe Hyperglycemia Alert',
        currentValue: `${sugar} mg/dL`,
        safeRange: '70 – 99 mg/dL (Fasting Euglycemia)',
        message: `Fasting blood glucose (${sugar} mg/dL) significantly exceeds safe glycemic targets. Risk of acute hyperosmolar dehydration or diabetic ketoacidosis.`,
        clinicalSuggestion: 'Check urine/blood ketones if applicable. Ensure continuous water hydration. Prompt physician consultation required for medication adjustment (Metformin, SGLT2i, or Insulin).',
        trendDescription: 'Severe glycemic spike.',
        timestamp: latest.date,
        status: escalated.has(id) ? 'escalated_to_doctor' : 'active'
      });
    } else if (sugar >= 126) {
      const id = `alert-sugar-diab-${latest.id}`;
      alerts.push({
        id,
        metric: 'blood_sugar',
        metricLabel: 'Blood Sugar',
        severity: 'warning',
        title: 'Diabetic Range Fasting Hyperglycemia',
        currentValue: `${sugar} mg/dL`,
        safeRange: '70 – 99 mg/dL',
        message: `Fasting blood glucose (${sugar} mg/dL) meets the diagnostic threshold for diabetes mellitus (>= 126 mg/dL).`,
        clinicalSuggestion: 'Schedule confirmatory HbA1c testing. Initiate low-glycemic dietary protocols and physician consultation for first-line pharmacotherapy.',
        trendDescription: 'Elevated fasting glucose.',
        timestamp: latest.date,
        status: escalated.has(id) ? 'escalated_to_doctor' : 'active'
      });
    } else if (sugar < 70) {
      const id = `alert-sugar-hypo-${latest.id}`;
      alerts.push({
        id,
        metric: 'blood_sugar',
        metricLabel: 'Blood Sugar',
        severity: 'critical',
        title: '⚠️ Hypoglycemia Hazard (Low Blood Sugar)',
        currentValue: `${sugar} mg/dL`,
        safeRange: '70 – 99 mg/dL',
        message: `Blood glucose level (${sugar} mg/dL) is below safe neuroglycopenic limits (< 70 mg/dL). Risk of confusion, tremors, diaphoresis, and syncope.`,
        clinicalSuggestion: 'Apply the Rule of 15 immediately: Consume 15 grams of fast-acting simple carbohydrates (4oz fruit juice or 3-4 glucose tablets). Re-check in 15 minutes.',
        trendDescription: 'Acute hypoglycemic dip.',
        timestamp: latest.date,
        status: escalated.has(id) ? 'escalated_to_doctor' : 'active'
      });
    }

    // 4. Longitudinal Weight Trend Evaluation (Fluid Retention / Acute Decompensation)
    if (sorted.length >= 2) {
      const prev = sorted[sorted.length - 2];
      const weightDiff = latest.weight - prev.weight;
      const daysDiff = Math.max(
        1,
        Math.round(
          (new Date(latest.date).getTime() - new Date(prev.date).getTime()) / (24 * 3600 * 1000)
        )
      );

      // Rapid weight gain >= 2.0 kg in <= 3 days is a classic clinical warning for fluid retention
      if (weightDiff >= 2.0 && daysDiff <= 3) {
        const id = `alert-weight-gain-${latest.id}`;
        alerts.push({
          id,
          metric: 'weight',
          metricLabel: 'Body Weight',
          severity: 'warning',
          title: '⚠️ Rapid Acute Weight Gain Detected',
          currentValue: `+${Math.round(weightDiff * 10) / 10} kg in ${daysDiff} day${daysDiff > 1 ? 's' : ''}`,
          safeRange: 'Normal physiological variance: < 0.5 kg/day',
          message: `Sudden weight gain of +${Math.round(weightDiff * 10) / 10} kg in a short interval (${daysDiff} days). Clinically indicates potential fluid accumulation (congestive cardiac strain or renal retention).`,
          clinicalSuggestion: 'Inspect lower extremities for bilateral pedal edema. Transmit vitals to Doctor Portal for review of diuretic therapy and cardiac function.',
          trendDescription: `Sudden increase of +${Math.round(weightDiff * 10) / 10} kg over ${daysDiff} days.`,
          timestamp: latest.date,
          status: escalated.has(id) ? 'escalated_to_doctor' : 'active'
        });
      }
    }

    // Filter out dismissed alerts unless they are critical emergencies
    return alerts.filter(a => a.severity === 'critical' || !dismissed.has(a.id));
  }

  /**
   * Directly escalates a proactive vitals alert to the DoctorPortalTab queue via storageService.
   */
  public escalateToDoctor(alert: ProactiveVitalsAlert, currentUser: UserRecord): DoctorNotification {
    const notifications = storageService.getDoctorNotifications();

    const docNotification: DoctorNotification = {
      id: `notif-vitals-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type: 'vitals_alert',
      title: `⚡ Clinical Vitals Alert: ${alert.title}`,
      message: `Patient ${currentUser.name} triggered a proactive ${alert.metricLabel} alert: ${alert.currentValue} (Target: ${alert.safeRange}). Doctor review and therapeutic adjustment requested.`,
      patientId: currentUser.id,
      patientName: currentUser.name,
      patientAge: currentUser.profile.age,
      patientGender: currentUser.profile.gender,
      timestamp: new Date().toISOString(),
      read: false,
      urgency: alert.severity === 'critical' ? 'Emergency' : 'High',
      vitalsAlert: alert
    };

    const updated = [docNotification, ...notifications.slice(0, 49)];
    storageService.saveAllDoctorNotifications(updated);
    this.markAlertEscalated(alert.id);

    // Also attach to or update doctor consultation case in storage
    const allPredictions = storageService.getPredictions();
    const patientCase = allPredictions.find(
      p => p.patientId === currentUser.id || p.patientName?.toLowerCase() === currentUser.name.toLowerCase()
    );

    if (patientCase) {
      // Add red flag warning to case
      const updatedCase = {
        ...patientCase,
        redFlagWarnings: [
          ...new Set([
            `[Proactive Vitals Alert] ${alert.title}: ${alert.currentValue} (Safe: ${alert.safeRange}). Suggestion: ${alert.clinicalSuggestion}`,
            ...patientCase.redFlagWarnings
          ])
        ]
      };
      storageService.updatePrediction(updatedCase);
    }

    // Dispatch DOM event for immediate cross-tab reaction
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('medassist:doctor-notification', {
          detail: { notification: docNotification, allNotifications: updated }
        })
      );
    }

    return docNotification;
  }
}

export const proactiveVitalsAlertService = new ProactiveVitalsAlertService();
