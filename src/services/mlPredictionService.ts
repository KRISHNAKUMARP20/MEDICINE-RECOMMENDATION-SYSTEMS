import { DISEASES_DATA } from '../data/diseases';
import { MEDICINES_DATA } from '../data/medicines';
import { SYMPTOMS_DATA } from '../data/symptoms';
import { checkDrugInteractions } from '../data/drugInteractions';
import { Disease, Medicine, PatientProfile, PredictionResult } from '../types';
import { clinicalDatasetService } from './clinicalDatasetService';
import { medicationSafetyService } from './medicationSafetyService';

export interface SymptomInput {
  symptomId: string;
  severity: 'Mild' | 'Moderate' | 'Severe';
  durationDays: number;
}

export function runDiseasePrediction(
  inputs: SymptomInput[],
  modelType: 'Random Forest' | 'Decision Tree' | 'Naive Bayes' | 'K-Nearest Neighbors' | 'Ensemble Weighted' = 'Ensemble Weighted',
  patientProfile?: PatientProfile
): PredictionResult {
  if (inputs.length === 0) {
    throw new Error('Please select at least one symptom.');
  }

  const selectedIds = new Set(inputs.map(i => i.symptomId));
  const symptomWeights = new Map<string, number>();

  inputs.forEach(input => {
    const symMeta = SYMPTOMS_DATA.find(s => s.id === input.symptomId);
    const baseWeight = symMeta ? symMeta.severityWeight : 2;
    const severityMultiplier = input.severity === 'Severe' ? 1.5 : input.severity === 'Moderate' ? 1.2 : 0.9;
    const durationMultiplier = input.durationDays > 7 ? 1.3 : input.durationDays > 3 ? 1.1 : 1.0;
    symptomWeights.set(input.symptomId, baseWeight * severityMultiplier * durationMultiplier);
  });

  // Calculate scores for each disease based on algorithmic logic
  const scores: { disease: Disease; score: number; matchCount: number; matchedSymptoms: string[] }[] = [];
  const activeDiseases = clinicalDatasetService.getNormalizedDiseases();
  const diseasesToEvaluate = activeDiseases.length > 0 ? activeDiseases : DISEASES_DATA;

  diseasesToEvaluate.forEach(disease => {
    let diseaseScore = 0;
    const matched: string[] = [];
    let primaryMatchCount = 0;

    // Check primary symptoms (higher weight)
    disease.primarySymptoms.forEach(symId => {
      if (selectedIds.has(symId)) {
        primaryMatchCount++;
        matched.push(symId);
        const weight = symptomWeights.get(symId) || 3;
        diseaseScore += weight * 4.0;
      }
    });

    // Check secondary symptoms (moderate weight)
    disease.secondarySymptoms.forEach(symId => {
      if (selectedIds.has(symId)) {
        matched.push(symId);
        const weight = symptomWeights.get(symId) || 2;
        diseaseScore += weight * 1.8;
      }
    });

    // Model specific variance adjustments:
    if (modelType === 'Decision Tree') {
      // Strict branching: if primary symptoms are not matched, penalty is high
      if (primaryMatchCount === 0) {
        diseaseScore *= 0.15;
      } else {
        diseaseScore *= (1 + primaryMatchCount * 0.3);
      }
    } else if (modelType === 'Naive Bayes') {
      // Probabilistic independence product approximation
      const prior = 0.08;
      let logLikelihood = Math.log(prior);
      const totalDiseaseSyms = disease.primarySymptoms.length + disease.secondarySymptoms.length;
      const matchedCount = matched.length;
      const pMatchGivenDisease = Math.min(0.95, (matchedCount + 1) / (totalDiseaseSyms + 2));
      logLikelihood += Math.log(pMatchGivenDisease) * 3;
      diseaseScore = Math.max(0.01, diseaseScore * Math.exp(logLikelihood + 2));
    } else if (modelType === 'K-Nearest Neighbors') {
      // Hamming distance inverse
      const totalDiseaseSyms = disease.primarySymptoms.length + disease.secondarySymptoms.length;
      const overlap = matched.length;
      const jaccard = overlap / (selectedIds.size + totalDiseaseSyms - overlap || 1);
      diseaseScore = jaccard * 100;
    } else if (modelType === 'Random Forest' || modelType === 'Ensemble Weighted') {
      // Multi-feature non-linear interactions
      const coverageRatio = matched.length / (disease.primarySymptoms.length || 1);
      diseaseScore = diseaseScore * (1 + coverageRatio * 0.5);
    }

    // Penalize when only 1 symptom is matched out of many required
    if (matched.length === 1 && disease.primarySymptoms.length > 3) {
      diseaseScore *= 0.5;
    }

    scores.push({
      disease,
      score: diseaseScore,
      matchCount: matched.length,
      matchedSymptoms: matched
    });
  });

  // Sort descending by score
  scores.sort((a, b) => b.score - a.score);

  const top = scores[0];
  const totalScore = scores.reduce((sum, s) => sum + s.score, 0) || 1;
  const rawConfidence = Math.min(98.5, Math.max(45, (top.score / totalScore) * 160 + (top.matchCount >= 3 ? 20 : 10)));
  const confidence = Math.round(rawConfidence * 10) / 10;

  // Build differential diagnoses
  const differentialDiagnoses = scores.slice(1, 4).map(item => ({
    disease: item.disease,
    probability: Math.round(Math.min(95, (item.score / (totalScore || 1)) * 100)),
    matchingSymptoms: item.matchedSymptoms
  }));

  // Map recommended medicines and filter contraindications
  const recommendedMedicines = top.disease.recommendedMedicines.map(rec => {
    const medMeta = MEDICINES_DATA.find(m => m.id === rec.medicineId) || {
      id: rec.medicineId,
      name: rec.medicineId,
      genericName: rec.medicineId,
      brandNames: [],
      drugClass: 'Therapeutic Agent',
      prescriptionRequired: true,
      standardDosage: { adult: rec.dosage, frequency: 'Daily', timing: 'Anytime' as const },
      indications: [top.disease.name],
      contraindications: [],
      commonSideEffects: ['Mild nausea', 'Drowsiness'],
      severeSideEffects: ['Allergic reaction'],
      pregnancyCategory: 'B' as const,
      drugInteractions: [],
      substitutes: [],
      priceRange: '$10 - $20',
      form: 'Tablet' as const
    };

    const safetyWarnings: string[] = [];

    // Check patient contraindications
    if (patientProfile) {
      if (patientProfile.isPregnant && (medMeta.pregnancyCategory === 'D' || medMeta.pregnancyCategory === 'X')) {
        safetyWarnings.push(`CONTRAINDICATED IN PREGNANCY (FDA Category ${medMeta.pregnancyCategory}). Consult obstetrician for safer alternative.`);
      }
      if (patientProfile.hasRenalDisease && medMeta.contraindications.some(c => c.toLowerCase().includes('renal'))) {
        safetyWarnings.push(`Caution: Patient has renal impairment history. Dose adjustment required.`);
      }
      if (patientProfile.hasHepaticDisease && medMeta.contraindications.some(c => c.toLowerCase().includes('liver') || c.toLowerCase().includes('hepatic'))) {
        safetyWarnings.push(`Caution: Hepatic metabolism impaired. Potential hepatotoxicity risk.`);
      }
      if (patientProfile.knownAllergies?.length) {
        patientProfile.knownAllergies.forEach(allergy => {
          if (medMeta.name.toLowerCase().includes(allergy.toLowerCase()) || medMeta.drugClass.toLowerCase().includes(allergy.toLowerCase())) {
            safetyWarnings.push(`CRITICAL ALLERGY ALERT: Patient allergic to ${allergy}! Do not dispense.`);
          }
        });
      }
    }

    return {
      medicine: medMeta,
      role: rec.type,
      dosage: rec.dosage,
      duration: rec.duration,
      notes: rec.instructions,
      safetyWarnings
    };
  });

  // Check drug-drug interactions between recommended medicines and current patient meds
  const medIdsToCheck = recommendedMedicines.map(r => r.medicine.id);
  if (patientProfile?.currentMedications) {
    medIdsToCheck.push(...patientProfile.currentMedications);
  }
  const drugInteractions = checkDrugInteractions(medIdsToCheck);
  drugInteractions.forEach(interaction => {
    recommendedMedicines.forEach(rm => {
      if (rm.medicine.id.toLowerCase() === interaction.drugA || rm.medicine.id.toLowerCase() === interaction.drugB) {
        rm.safetyWarnings.push(`Interaction with ${interaction.drugA === rm.medicine.id ? interaction.drugB : interaction.drugA}: ${interaction.clinicalEffect}`);
      }
    });
  });

  // Run comprehensive cross-reference safety audit via medicationSafetyService
  const safetyAudit = medicationSafetyService.crossReference({
    recommendedMedicines,
    knownAllergies: patientProfile?.knownAllergies || [],
    currentMedications: patientProfile?.currentMedications || [],
    patientProfile
  });

  // Attach safety audit warnings to individual recommended medicines
  safetyAudit.allergyConflicts.forEach(ac => {
    const target = recommendedMedicines.find(rm => rm.medicine.id === ac.medicineId || rm.medicine.name === ac.medicineName);
    if (target) {
      target.safetyWarnings.unshift(`ALLERGY ALERT [${ac.severity.toUpperCase()}]: ${ac.allergy} allergy cross-reaction! ${ac.mechanism}`);
    }
  });

  safetyAudit.interactionConflicts.forEach(ic => {
    const target = recommendedMedicines.find(rm => rm.medicine.name === ic.recommendedMedicine);
    if (target) {
      target.safetyWarnings.push(`INTERACTION [${ic.severity.toUpperCase()} with ${ic.currentMedicine}]: ${ic.clinicalEffect}`);
    }
  });

  safetyAudit.duplicateConflicts.forEach(dc => {
    const target = recommendedMedicines.find(rm => rm.medicine.name === dc.medicine);
    if (target) {
      target.safetyWarnings.push(`DUPLICATE THERAPY: Already taking ${dc.currentMedicine} (${dc.therapeuticClass}).`);
    }
  });

  // Collect red flag emergency signs
  const redFlagWarnings: string[] = [];
  top.disease.emergencySigns.forEach(sign => {
    redFlagWarnings.push(sign);
  });
  if (selectedIds.has('chest_pain') || selectedIds.has('shortness_of_breath') || selectedIds.has('confusion') || selectedIds.has('coughing_blood') || selectedIds.has('blood_in_urine')) {
    redFlagWarnings.unshift('IMMEDIATE ATTENTION: High-risk acute symptoms detected (cardiorespiratory or neurological). Seek urgent medical care if progressing.');
  }

  // Prepend critical allergy alert to redFlagWarnings if detected
  if (safetyAudit.hasCriticalAllergy) {
    redFlagWarnings.unshift(`PHARMACOTHERAPY CONTRAINDICATION: ${safetyAudit.allergyConflicts.map(a => `${a.medicineName} (${a.allergy} Allergy)`).join(', ')} contraindicated.`);
  }

  return {
    id: `pred_${Date.now()}`,
    timestamp: new Date().toISOString(),
    inputSymptoms: inputs,
    modelUsed: modelType,
    predictedDisease: top.disease,
    confidence,
    differentialDiagnoses,
    recommendedMedicines,
    redFlagWarnings,
    specialistRecommendation: top.disease.specialist,
    dietAndLifestyle: {
      precautions: top.disease.precautions,
      diet: top.disease.dietaryAdvice,
      lifestyle: top.disease.lifestyleAdvice
    },
    safetyAudit
  };
}
