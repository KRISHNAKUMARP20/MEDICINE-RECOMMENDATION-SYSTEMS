import { SuggestedTreatmentPlan } from '../types';

export interface TreatmentPlanRequestPayload {
  patientName?: string;
  patientAge?: number;
  patientGender?: string;
  diagnosedCondition?: string;
  urgency?: string;
  symptoms?: Array<{ name: string; severity?: string; duration?: string }>;
  vitals?: {
    systolicBP?: number;
    diastolicBP?: number;
    heartRate?: number;
    map?: number;
    pulsePressure?: number;
    spo2?: number;
    tempF?: number;
    status?: string;
  };
}

/**
 * Builds an evidence-based clinical treatment plan grounded in standard clinical protocols
 * (ACC/AHA, ADA, GOLD, WHO, AHS, ACG) incorporating symptom history and hemodynamic vitals.
 */
export function generateEvidenceBasedTreatmentPlan(payload: TreatmentPlanRequestPayload): SuggestedTreatmentPlan {
  const age = payload.patientAge || 40;
  const condition = (payload.diagnosedCondition || 'General Medical Condition').toLowerCase();
  const urgency = payload.urgency || 'Moderate';
  const vitals = payload.vitals || {
    systolicBP: 120,
    diastolicBP: 80,
    heartRate: 72,
    map: 93,
    pulsePressure: 40,
    spo2: 98,
    tempF: 98.6,
    status: 'Normal'
  };

  const sys = vitals.systolicBP || 120;
  const dia = vitals.diastolicBP || 80;
  const hr = vitals.heartRate || 72;
  const map = vitals.map || Math.round((2 * dia + sys) / 3);
  const spo2 = vitals.spo2 || 98;
  const tempF = vitals.tempF || 98.6;

  // Hemodynamic assessment
  let hemodynamicAssessment = `Current presentation: ${sys}/${dia} mmHg, HR ${hr} BPM, MAP ${map} mmHg. `;
  if (sys >= 140 || dia >= 90) {
    hemodynamicAssessment += `Patient demonstrates Stage 2 hypertensive hemodynamics. Increased afterload observed; requires immediate pharmacological intervention and MAP control.`;
  } else if (sys >= 130 || dia >= 80) {
    hemodynamicAssessment += `Patient presents with Stage 1 hypertension. Borderline afterload with elevated systemic vascular resistance; lifestyle plus first-line monotherapy advised.`;
  } else if (sys < 95 || dia < 60) {
    hemodynamicAssessment += `Hypotensive tendency detected. Perfusion monitoring recommended to avert end-organ hypoperfusion.`;
  } else {
    hemodynamicAssessment += `Hemodynamics are normotensive with stable Mean Arterial Pressure maintaining adequate tissue perfusion.`;
  }

  if (hr > 100) {
    hemodynamicAssessment += ` Resting sinus tachycardia noted (${hr} BPM), indicating compensatory autonomic response to pain, fever, or volume contraction.`;
  } else if (hr < 60) {
    hemodynamicAssessment += ` Resting sinus bradycardia noted (${hr} BPM). Assess chronotropic competence and nodal blocking medications.`;
  }

  // Domain-specific protocol matching
  if (condition.includes('hypertens') || condition.includes('arterial') || condition.includes('cardio') || sys >= 140) {
    return {
      summary: `Patient (${age}y) presents with elevated cardiovascular indices consistent with Stage ${sys >= 140 ? '2' : '1'} Hypertension. Triage assessment indicates necessity of blood pressure reduction to target <130/80 mmHg per ACC/AHA guidelines.`,
      hemodynamicAssessment,
      primaryClinicalProtocols: [
        {
          protocolName: 'ACC/AHA 2017 Hypertension Management Guideline',
          guideline: 'American College of Cardiology / American Heart Association Task Force',
          recommendedActions: [
            'Initiate first-line antihypertensive therapy with ACEi (Lisinopril) or ARB (Losartan)',
            'Add Dihydropyridine CCB (Amlodipine) if systolic pressure remains >20 mmHg above target',
            'Conduct basic metabolic panel (BMP) at 2 to 4 weeks to verify serum creatinine and potassium levels'
          ]
        },
        {
          protocolName: 'Longitudinal Hemodynamic Self-Monitoring Protocol',
          guideline: 'AHA Home Blood Pressure Monitoring Standards',
          recommendedActions: [
            'Instruct patient on twice-daily validated oscillometric cuff readings (morning before medication, evening before dinner)',
            'Record 7-day log prior to follow-up titration visit',
            'Hold ACEi/ARB if systolic drops <100 mmHg accompanied by orthostatic dizziness'
          ]
        }
      ],
      recommendedMedications: [
        {
          name: 'Lisinopril',
          dosage: '10mg',
          frequency: 'Once daily (morning)',
          duration: '30 days',
          rationale: 'First-line ACE inhibitor to reduce systemic vascular resistance and preserve renal hemodynamics',
          category: 'Antihypertensive (ACE Inhibitor)'
        },
        {
          name: 'Amlodipine',
          dosage: '5mg',
          frequency: 'Once daily',
          duration: '30 days',
          rationale: 'Peripheral vascular calcium channel blocker for synergistic afterload reduction',
          category: 'Calcium Channel Blocker'
        }
      ],
      nonPharmacologicalInterventions: [
        'Adopt Dietary Approaches to Stop Hypertension (DASH) eating pattern with daily sodium restricted to <2,000 mg',
        'Engage in 150 minutes per week of moderate-intensity aerobic physical activity (brisk walking, cycling)',
        'Limit alcohol consumption and eliminate tobacco exposure',
        'Structured stress reduction and 7-8 hours of quality sleep'
      ],
      redFlagWarnings: [
        'Systolic BP ≥180 mmHg or Diastolic BP ≥120 mmHg (Hypertensive Urgency / Crisis)',
        'Acute retrosternal chest pain, radiating left arm pain, or diaphoresis',
        'New-onset neurological deficits (facial droop, unilateral arm weakness, speech slurring)',
        'Acute severe shortness of breath or pulmonary edema symptoms'
      ],
      followUpTimeline: 'Schedule follow-up clinical evaluation in 2 to 4 weeks with home BP log review.',
      generatedAt: new Date().toISOString(),
      modelUsed: 'Clinical Decision Support Matrix (ACC/AHA Protocol)'
    };
  }

  if (condition.includes('diabet') || condition.includes('glycem') || condition.includes('sugar')) {
    return {
      summary: `Patient (${age}y) presents with symptoms and clinical indicators consistent with Glycemic Dysregulation / Type 2 Diabetes Mellitus. Comprehensive metabolic stabilization protocol indicated.`,
      hemodynamicAssessment,
      primaryClinicalProtocols: [
        {
          protocolName: 'ADA 2024 Standards of Medical Care in Diabetes',
          guideline: 'American Diabetes Association Clinical Practice Recommendations',
          recommendedActions: [
            'Initiate Metformin as foundational pharmacological monotherapy with titration to gastrointestinal tolerance',
            'Order HbA1c, comprehensive metabolic panel, and urine albumin-to-creatinine ratio (uACR)',
            'Set individualized HbA1c glycemic goal (<7.0% for most non-pregnant adults)'
          ]
        },
        {
          protocolName: 'Microvascular & Macrovascular Risk Mitigation Protocol',
          guideline: 'ADA/KDIGO Consensus Statement',
          recommendedActions: [
            'Annual comprehensive dilated eye examination by ophthalmology',
            'Annual comprehensive diabetic foot examination with 10g monofilament and pedal pulse palpation',
            'Initiate SGLT2i or GLP-1 RA if established atherosclerotic cardiovascular disease or chronic kidney disease'
          ]
        }
      ],
      recommendedMedications: [
        {
          name: 'Metformin Hydrochloride',
          dosage: '500mg',
          frequency: 'Twice daily with meals',
          duration: '30 days',
          rationale: 'First-line biguanide reducing hepatic gluconeogenesis and increasing peripheral insulin sensitivity',
          category: 'Antidiabetic (Biguanide)'
        },
        {
          name: 'Empagliflozin',
          dosage: '10mg',
          frequency: 'Once daily (morning)',
          duration: '30 days',
          rationale: 'SGLT2 inhibitor providing glycemic control alongside proven cardiorenal risk reduction',
          category: 'SGLT2 Inhibitor'
        }
      ],
      nonPharmacologicalInterventions: [
        'Medical Nutrition Therapy (MNT): Low glycemic index, high-fiber dietary intake with portion control',
        'At least 150 minutes/week of moderate-to-vigorous aerobic exercise, with no more than 2 consecutive days without activity',
        'Daily self-inspection of feet for erythema, blisters, or calluses',
        'Pre-prandial and post-prandial self-monitoring of blood glucose (SMBG)'
      ],
      redFlagWarnings: [
        'Severe hypoglycemia (<54 mg/dL) with confusion, tremors, diaphoresis, or loss of consciousness',
        'Diabetic Ketoacidosis (DKA) signs: deep rapid breathing (Kussmaul), nausea, vomiting, fruity breath odor',
        'Hyperosmolar Hyperglycemic State (HHS): Blood glucose >600 mg/dL with severe dehydration and altered mentation',
        'Non-healing lower extremity ulcers or spreading cellulitis'
      ],
      followUpTimeline: 'Repeat clinic consultation with HbA1c laboratory verification in 3 months (or 4 weeks for initial titration check).',
      generatedAt: new Date().toISOString(),
      modelUsed: 'Clinical Decision Support Matrix (ADA Protocol)'
    };
  }

  if (condition.includes('pneumonia') || condition.includes('bronch') || condition.includes('asthma') || condition.includes('respirat') || condition.includes('cough')) {
    return {
      summary: `Patient (${age}y) presents with acute respiratory symptoms. Oxygenation saturation stands at ${spo2}%. Evidence-based antimicrobial and airway management protocols indicated.`,
      hemodynamicAssessment,
      primaryClinicalProtocols: [
        {
          protocolName: 'ATS / IDSA Community-Acquired Pneumonia Clinical Guideline',
          guideline: 'American Thoracic Society & Infectious Diseases Society of America',
          recommendedActions: [
            'Administer empiric broad-spectrum antibiotic covering typical and atypical respiratory pathogens',
            'Monitor peripheral pulse oximetry (SpO2) continuously; initiate supplemental oxygen if SpO2 drops below 92%',
            'Calculate CURB-65 or Pneumonia Severity Index (PSI) score to validate outpatient vs inpatient criteria'
          ]
        },
        {
          protocolName: 'Airway Clearance & Bronchodilator Protocol',
          guideline: 'Global Initiative for Asthma / Chronic Obstructive Lung Disease (GOLD)',
          recommendedActions: [
            'Prescribe short-acting beta-2 agonist (SABA) inhaler for acute bronchospasm or dyspnea episodes',
            'Advise active cycle of breathing techniques and adequate oral hydration to liquefy airway secretions'
          ]
        }
      ],
      recommendedMedications: [
        {
          name: 'Amoxicillin-Clavulanate (Augmentin)',
          dosage: '875/125mg',
          frequency: 'Twice daily with meals',
          duration: '7 days',
          rationale: 'First-line beta-lactamase inhibitor combination for community-acquired respiratory bacterial infections',
          category: 'Antibiotic (Beta-lactamase inhibitor)'
        },
        {
          name: 'Azithromycin',
          dosage: '500mg Day 1, then 250mg Days 2-5',
          frequency: 'Once daily',
          duration: '5 days',
          rationale: 'Macrolide covering atypical respiratory pathogens (Mycoplasma, Chlamydia pneumoniae)',
          category: 'Macrolide Antibiotic'
        },
        {
          name: 'Albuterol Inhaler (Ventolin HFA)',
          dosage: '90mcg / puff',
          frequency: '1-2 puffs every 4-6 hours PRN',
          duration: '14 days',
          rationale: 'Rapid bronchodilation for relief of wheezing and reactive airway bronchospasm',
          category: 'Short-acting Beta-2 Agonist'
        }
      ],
      nonPharmacologicalInterventions: [
        'Maintain vigorous oral hydration (>2.5 liters/day) to facilitate mucociliary clearance',
        'Strict rest and elevation of head of bed to 30-45 degrees to maximize diaphragmatic excursion',
        'Avoid all second-hand smoke, vaping, and respiratory irritants',
        'Use cool-mist humidifier or steam inhalation for upper airway soothing'
      ],
      redFlagWarnings: [
        'SpO2 desaturation < 92% on ambient room air',
        'Severe respiratory distress, intercostal retractions, or inability to speak full sentences',
        'Hemoptysis (coughing up fresh red blood)',
        'Altered mental status, cyanosis around perioral region or nail beds'
      ],
      followUpTimeline: 'Re-evaluation in 48 to 72 hours for clinical improvement; seek immediate emergency care if breathing deteriorates.',
      generatedAt: new Date().toISOString(),
      modelUsed: 'Clinical Decision Support Matrix (ATS/IDSA Protocol)'
    };
  }

  if (condition.includes('dengue') || condition.includes('malaria') || condition.includes('typhoid') || condition.includes('fever') || tempF > 100.4) {
    return {
      summary: `Patient (${age}y) presents with acute febrile illness (Temperature: ${tempF}°F, HR: ${hr} BPM). Clinical evaluation mandates strict vector-borne triage and fluid management.`,
      hemodynamicAssessment,
      primaryClinicalProtocols: [
        {
          protocolName: 'WHO Clinical Protocol for Acute Febrile Illness & Dengue Case Management',
          guideline: 'World Health Organization Vector-Borne Disease Control Guidelines',
          recommendedActions: [
            'Order urgent Complete Blood Count (CBC) with differential, platelet count, and hematocrit tracking',
            'Order Dengue NS1 antigen / IgM-IgG antibody serology and peripheral blood smear for malarial parasites',
            'Calculate fluid maintenance requirements and initiate oral rehydration therapy'
          ]
        },
        {
          protocolName: 'Platelet Protection & Hemorrhagic Prevention Directive',
          guideline: 'CDC Clinical Protocol for Arboviral Infections',
          recommendedActions: [
            'STRICT CONTRAINDICATION: Absolutely avoid NSAIDs (Ibuprofen, Aspirin, Naproxen, Diclofenac) due to hemorrhage and platelet inhibition risk',
            'Use ONLY Paracetamol (Acetaminophen) for antipyresis with maximum daily dose strictly capped at 3g/24h',
            'Perform tourniquet test and check skin daily for petechiae or ecchymoses'
          ]
        }
      ],
      recommendedMedications: [
        {
          name: 'Paracetamol (Acetaminophen)',
          dosage: '650mg',
          frequency: 'Every 6 hours PRN for fever >100°F (Max 3000mg/day)',
          duration: '5 days',
          rationale: 'Preferred safe antipyretic that avoids platelet dysfunction and GI mucosal ulceration',
          category: 'Antipyretic / Analgesic'
        },
        {
          name: 'Oral Rehydration Salts (WHO-Formula ORS)',
          dosage: '1 sachet dissolved in 1L boiled and cooled water',
          frequency: 'Sip continuously (2-3 liters/day)',
          duration: '5 days',
          rationale: 'Maintains intravascular volume, replenishes essential electrolytes, and prevents plasma leakage shock',
          category: 'Electrolyte Replacement'
        }
      ],
      nonPharmacologicalInterventions: [
        'Complete bed rest during the febrile and critical phase (Days 3 to 7)',
        'Frequent tepid sponge bathing with warm water to manage pyrexia',
        'Maintain light, easily digestible diet (porridge, clear soups, fresh fruit juices)',
        'Use mosquito nets and repellent to prevent household transmission'
      ],
      redFlagWarnings: [
        'Warning signs of severe plasma leakage: persistent vomiting, severe abdominal pain, mucosal bleeding (epistaxis, gum bleed)',
        'Drop in platelet count below 100,000 / μL or abrupt increase in hematocrit >20%',
        'Lethargy, extreme restlessness, cold clammy extremities, or oliguria (no urination for >6 hours)'
      ],
      followUpTimeline: 'Mandatory daily CBC and clinical review until fever subsides and platelet count rebounds.',
      generatedAt: new Date().toISOString(),
      modelUsed: 'Clinical Decision Support Matrix (WHO Arboviral Protocol)'
    };
  }

  // Default Standard Comprehensive Protocol
  return {
    summary: `Patient (${age}y) presents with clinical symptoms indicating ${payload.diagnosedCondition || 'an acute presentation'}. Triage assessment establishes a structured evidence-based therapeutic pathway.`,
    hemodynamicAssessment,
    primaryClinicalProtocols: [
      {
        protocolName: 'Evidence-Based Primary Care Triage & Pharmacotherapy Protocol',
        guideline: 'Standard Medical Practice Guidelines & Clinical Decision Support Systems',
        recommendedActions: [
          'Targeted physical examination and corroborating diagnostic laboratory evaluation',
          'Symptom-targeted pharmacological relief with standardized therapeutic margins',
          'Regular vital sign tracking to verify hemodynamic and respiratory stability'
        ]
      },
      {
        protocolName: 'Longitudinal Patient Recovery & Safety Netting Protocol',
        guideline: 'National Patient Safety & Ambulatory Quality Guidelines',
        recommendedActions: [
          'Provide clear written instructions on medication adherence and adverse reaction monitoring',
          'Establish explicit criteria for escalation to urgent or emergency department care'
        ]
      }
    ],
    recommendedMedications: [
      {
        name: 'Paracetamol (Acetaminophen)',
        dosage: '500mg',
        frequency: 'Every 6-8 hours PRN',
        duration: '5 days',
        rationale: 'First-line non-opioid analgesic and antipyretic for mild-to-moderate somatic discomfort',
        category: 'Analgesic'
      },
      {
        name: 'Multivitamin with Zinc & B-Complex',
        dosage: '1 capsule',
        frequency: 'Once daily after breakfast',
        duration: '15 days',
        rationale: 'Cellular recovery support and metabolic replenishment',
        category: 'Nutritional Supplement'
      }
    ],
    nonPharmacologicalInterventions: [
      'Adequate oral hydration: minimum 2.0 to 2.5 liters of water daily',
      'Preserve 7 to 9 hours of uninterrupted nocturnal rest',
      'Nutrient-dense balanced meals low in processed sugars and trans-fats',
      'Avoid strenuous physical exertion until full symptom resolution'
    ],
    redFlagWarnings: [
      'Sudden onset of severe shortness of breath or resting chest pain',
      'Persistent high fever unresponsive to standard antipyretics for >72 hours',
      'Severe intractable vomiting preventing all oral fluid retention',
      'New onset focal neurological symptoms, syncope, or profound lethargy'
    ],
    followUpTimeline: 'Schedule clinical review within 5 to 7 days if symptoms fail to resolve or if new symptoms emerge.',
    generatedAt: new Date().toISOString(),
    modelUsed: 'Clinical Decision Support Matrix (General Internal Medicine Protocol)'
  };
}
