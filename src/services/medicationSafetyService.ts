import { MEDICINES_DATA } from '../data/medicines';
import { DRUG_INTERACTION_RULES, DrugInteractionPair } from '../data/drugInteractions';
import {
  AllergyConflict,
  DuplicateTherapyConflict,
  MedicationInteractionConflict,
  MedicationSafetyReport,
  Medicine,
  OrganCaution,
  PatientProfile
} from '../types';

// Clinical allergy cross-reactivity mapping
interface AllergyMapping {
  allergyKeywords: string[];
  triggers: string[]; // medicine IDs or drug classes or generic terms
  mechanism: string;
  alternative: string;
}

const ALLERGY_KNOWLEDGE_BASE: AllergyMapping[] = [
  {
    allergyKeywords: ['penicillin', 'amoxicillin', 'ampicillin', 'beta-lactam', 'penam'],
    triggers: [
      'amoxicillin',
      'ampicillin',
      'penicillin',
      'amoxicillin_clavulanate',
      'augmentin',
      'piperacillin',
      'penicillin-class antibiotic'
    ],
    mechanism: 'Cross-reactive beta-lactam core ring structure triggering immediate IgE-mediated anaphylaxis, bronchospasm, or severe angioedema.',
    alternative: 'Non-beta-lactam macrolides (Azithromycin, Clarithromycin) or Doxycycline.'
  },
  {
    allergyKeywords: ['sulfa', 'sulfonamide', 'bactrim', 'septra'],
    triggers: [
      'sulfamethoxazole',
      'trimethoprim_sulfamethoxazole',
      'bactrim',
      'sulfasalazine',
      'sulfonamide'
    ],
    mechanism: 'Sulfonamide arylamine cross-hypersensitivity with severe risk of Stevens-Johnson syndrome (SJS) or toxic epidermal necrolysis (TEN).',
    alternative: 'Nitrofurantoin, Fluoroquinolones, or Cephalosporins (if non-sulfa).'
  },
  {
    allergyKeywords: ['aspirin', 'nsaid', 'ibuprofen', 'naproxen', 'diclofenac'],
    triggers: [
      'ibuprofen',
      'aspirin',
      'naproxen',
      'diclofenac',
      'ketorolac',
      'celecoxib',
      'nsaid (nonsteroidal anti-inflammatory drug)'
    ],
    mechanism: 'COX-1 inhibition diverting arachidonic acid to leukotrienes, inducing Aspirin-Exacerbated Respiratory Disease (AERD) or urticaria.',
    alternative: 'Paracetamol (Acetaminophen) for analgesia/fever; selective COX-2 inhibitor under supervision.'
  },
  {
    allergyKeywords: ['cephalosporin', 'cephalexin', 'ceftriaxone', 'cefpodoxime'],
    triggers: [
      'cephalexin',
      'ceftriaxone',
      'cefixime',
      'cefpodoxime',
      'cephalosporin-class antibiotic'
    ],
    mechanism: 'Beta-lactam cephalosporin ring hypersensitivity, with potential cross-reactivity in penicillin-allergic patients.',
    alternative: 'Macrolides (Azithromycin), Fluoroquinolones, or Carbapenems.'
  },
  {
    allergyKeywords: ['codeine', 'morphine', 'opioid', 'tramadol'],
    triggers: [
      'codeine',
      'morphine',
      'tramadol',
      'oxycodone',
      'hydrocodone',
      'opioid'
    ],
    mechanism: 'Mu-opioid receptor mast cell degranulation or true IgE-mediated pseudoallergy and respiratory depression.',
    alternative: 'Non-opioid multimodal analgesics (Paracetamol, topical analgesics, neuropathic agents).'
  },
  {
    allergyKeywords: ['ciprofloxacin', 'fluoroquinolone', 'levofloxacin'],
    triggers: [
      'ciprofloxacin',
      'levofloxacin',
      'moxifloxacin',
      'fluoroquinolone'
    ],
    mechanism: 'Fluoroquinolone-mediated tendinopathy and immediate hypersensitivity.',
    alternative: 'Beta-lactams (if not allergic), Macrolides, or Doxycycline.'
  }
];

export interface CrossReferenceParams {
  recommendedMedicines: Array<{
    medicine: Medicine;
    role?: 'Primary' | 'Secondary' | 'Supportive';
    dosage?: string;
  }>;
  knownAllergies: string[];
  currentMedications: string[];
  patientProfile?: PatientProfile;
}

export class MedicationSafetyService {
  /**
   * Cross-references newly recommended medications against knownAllergies and currentMedications
   */
  public crossReference(params: CrossReferenceParams): MedicationSafetyReport {
    const {
      recommendedMedicines,
      knownAllergies = [],
      currentMedications = [],
      patientProfile
    } = params;

    const allergyConflicts: AllergyConflict[] = [];
    const interactionConflicts: MedicationInteractionConflict[] = [];
    const duplicateConflicts: DuplicateTherapyConflict[] = [];
    const organCautions: OrganCaution[] = [];

    // Cleaned input lists
    const cleanAllergies = knownAllergies
      .map(a => a.trim().toLowerCase())
      .filter(a => a && a !== 'none' && a !== 'no known allergies' && a !== 'nka');

    const cleanCurrentMeds = currentMedications
      .map(m => m.trim().toLowerCase())
      .filter(m => m);

    // 1. Cross-reference against knownAllergies
    recommendedMedicines.forEach(({ medicine }) => {
      const medId = medicine.id.toLowerCase();
      const medName = medicine.name.toLowerCase();
      const genericName = (medicine.genericName || '').toLowerCase();
      const drugClass = (medicine.drugClass || '').toLowerCase();
      const brandNames = (medicine.brandNames || []).map(b => b.toLowerCase());

      cleanAllergies.forEach(allergy => {
        // Direct name match or substring match
        const directMatch =
          medId.includes(allergy) ||
          medName.includes(allergy) ||
          genericName.includes(allergy) ||
          drugClass.includes(allergy) ||
          brandNames.some(b => b.includes(allergy)) ||
          allergy.includes(medId) ||
          allergy.includes(medName);

        // Clinical cross-reactivity mapping match
        const mappingMatch = ALLERGY_KNOWLEDGE_BASE.find(mapping => {
          const keywordHits = mapping.allergyKeywords.some(k => allergy.includes(k) || k.includes(allergy));
          if (!keywordHits) return false;
          return mapping.triggers.some(t =>
            medId.includes(t) ||
            medName.includes(t) ||
            genericName.includes(t) ||
            drugClass.includes(t)
          );
        });

        if (directMatch || mappingMatch) {
          const severity: 'Critical' | 'Severe' | 'Moderate' =
            allergy.includes('penicillin') || allergy.includes('anaphylaxis') || directMatch ? 'Critical' : 'Severe';

          const mechanism = mappingMatch
            ? mappingMatch.mechanism
            : `Patient has documented allergy to "${allergy}". ${medicine.name} (${medicine.drugClass}) is clinically contraindicated due to immediate hypersensitivity risks.`;

          const recommendedAlternative = mappingMatch
            ? mappingMatch.alternative
            : medicine.substitutes?.length
            ? medicine.substitutes.join(', ')
            : 'Consult attending physician for a non-cross-reactive alternative.';

          // Avoid duplicate entries for same medicine & allergy
          const alreadyLogged = allergyConflicts.some(
            a => a.medicineId === medicine.id && a.allergy.toLowerCase() === allergy
          );

          if (!alreadyLogged) {
            allergyConflicts.push({
              medicineId: medicine.id,
              medicineName: medicine.name,
              allergy: allergy.charAt(0).toUpperCase() + allergy.slice(1),
              severity,
              mechanism,
              recommendedAlternative
            });
          }
        }
      });
    });

    // 2. Cross-reference against currentMedications (Drug-Drug Interactions)
    recommendedMedicines.forEach(({ medicine }) => {
      const recId = medicine.id.toLowerCase();
      const recName = medicine.name.toLowerCase();

      cleanCurrentMeds.forEach(currMed => {
        // Do not check interaction with itself
        if (recId === currMed || recName === currMed) return;

        // Check standard rules
        const ruleMatch = DRUG_INTERACTION_RULES.find(
          rule =>
            (rule.drugA.toLowerCase() === recId && rule.drugB.toLowerCase() === currMed) ||
            (rule.drugB.toLowerCase() === recId && rule.drugA.toLowerCase() === currMed) ||
            (recName.includes(rule.drugA.toLowerCase()) && currMed.includes(rule.drugB.toLowerCase())) ||
            (recName.includes(rule.drugB.toLowerCase()) && currMed.includes(rule.drugA.toLowerCase()))
        );

        // Also check medicine's internal drugInteractions table
        const internalMatch = medicine.drugInteractions?.find(di =>
          di.interactsWith.toLowerCase().includes(currMed) ||
          currMed.includes(di.interactsWith.toLowerCase())
        );

        if (ruleMatch) {
          const alreadyLogged = interactionConflicts.some(
            ic => ic.recommendedMedicine === medicine.name && ic.currentMedicine.toLowerCase() === currMed
          );
          if (!alreadyLogged) {
            interactionConflicts.push({
              recommendedMedicine: medicine.name,
              currentMedicine: currMed.charAt(0).toUpperCase() + currMed.slice(1),
              severity: ruleMatch.severity,
              clinicalEffect: ruleMatch.clinicalEffect,
              mechanism: ruleMatch.mechanism,
              recommendation: ruleMatch.recommendation
            });
          }
        } else if (internalMatch) {
          const alreadyLogged = interactionConflicts.some(
            ic => ic.recommendedMedicine === medicine.name && ic.currentMedicine.toLowerCase() === currMed
          );
          if (!alreadyLogged) {
            interactionConflicts.push({
              recommendedMedicine: medicine.name,
              currentMedicine: currMed.charAt(0).toUpperCase() + currMed.slice(1),
              severity: internalMatch.severity as 'Severe' | 'Moderate' | 'Mild',
              clinicalEffect: internalMatch.description,
              mechanism: 'Pharmacokinetic or pharmacodynamic drug collision.',
              recommendation: 'Monitor patient closely or consider dosage adjustment.'
            });
          }
        }

        // 3. Duplicate Therapy Check (e.g. taking two NSAIDs or duplicate analgesic loads)
        const currMedMeta = MEDICINES_DATA.find(
          m => m.id.toLowerCase() === currMed || m.name.toLowerCase() === currMed
        );

        if (currMedMeta && currMedMeta.id !== medicine.id) {
          const sameClass =
            currMedMeta.drugClass &&
            medicine.drugClass &&
            currMedMeta.drugClass.toLowerCase() === medicine.drugClass.toLowerCase();

          const bothNSAIDs =
            currMedMeta.drugClass.toLowerCase().includes('nsaid') &&
            medicine.drugClass.toLowerCase().includes('nsaid');

          const bothAntipyretics =
            currMedMeta.drugClass.toLowerCase().includes('analgesic') &&
            medicine.drugClass.toLowerCase().includes('analgesic');

          if (sameClass || bothNSAIDs || (bothAntipyretics && currMedMeta.name === medicine.name)) {
            duplicateConflicts.push({
              medicine: medicine.name,
              currentMedicine: currMedMeta.name,
              therapeuticClass: medicine.drugClass,
              warning: `Duplicate ${medicine.drugClass} therapy detected. Concurrent intake increases cumulative toxicity (e.g. GI ulceration, hepatotoxicity) without added therapeutic benefit.`
            });
          }
        }
      });
    });

    // 4. Organ & Physiological Cautions
    if (patientProfile) {
      recommendedMedicines.forEach(({ medicine }) => {
        if (patientProfile.isPregnant && (medicine.pregnancyCategory === 'D' || medicine.pregnancyCategory === 'X')) {
          organCautions.push({
            medicineName: medicine.name,
            condition: 'Pregnancy Teratogenicity',
            severity: 'High',
            recommendation: `FDA Pregnancy Category ${medicine.pregnancyCategory}: Significant fetal risk. Substitute with Category A/B drug.`
          });
        }
        if (patientProfile.hasRenalDisease && medicine.contraindications?.some(c => c.toLowerCase().includes('renal'))) {
          organCautions.push({
            medicineName: medicine.name,
            condition: 'Renal Impairment',
            severity: 'Moderate',
            recommendation: 'Patient has history of chronic renal disease. Renal clearance reduced; dosage reduction or GFR monitoring required.'
          });
        }
        if (patientProfile.hasHepaticDisease && medicine.contraindications?.some(c => c.toLowerCase().includes('liver') || c.toLowerCase().includes('hepatic'))) {
          organCautions.push({
            medicineName: medicine.name,
            condition: 'Hepatic Impairment',
            severity: 'High',
            recommendation: 'Hepatic metabolism compromised. High hepatotoxicity risk; titrate dose or select renally cleared alternative.'
          });
        }
      });
    }

    const hasCriticalAllergy = allergyConflicts.some(a => a.severity === 'Critical');
    const hasSevereInteraction = interactionConflicts.some(i => i.severity === 'Severe');
    const totalWarningsCount =
      allergyConflicts.length + interactionConflicts.length + duplicateConflicts.length + organCautions.length;
    const hasConflicts = totalWarningsCount > 0;

    // Build human-readable summary
    let summaryText = 'All newly recommended medications are cleared. No allergy conflicts or harmful drug interactions detected.';
    if (hasConflicts) {
      const parts: string[] = [];
      if (allergyConflicts.length > 0) {
        parts.push(`${allergyConflicts.length} documented allergy conflict${allergyConflicts.length > 1 ? 's' : ''}`);
      }
      if (interactionConflicts.length > 0) {
        parts.push(`${interactionConflicts.length} drug-drug interaction${interactionConflicts.length > 1 ? 's' : ''}`);
      }
      if (duplicateConflicts.length > 0) {
        parts.push(`${duplicateConflicts.length} duplicate class warning${duplicateConflicts.length > 1 ? 's' : ''}`);
      }
      if (organCautions.length > 0) {
        parts.push(`${organCautions.length} organ contraindication${organCautions.length > 1 ? 's' : ''}`);
      }
      summaryText = `Warning: Cross-reference identified ${parts.join(', ')} with the patient profile.`;
    }

    return {
      hasConflicts,
      hasCriticalAllergy,
      hasSevereInteraction,
      allergyConflicts,
      interactionConflicts,
      duplicateConflicts,
      organCautions,
      totalWarningsCount,
      summaryText,
      timestamp: new Date().toISOString()
    };
  }
}

export const medicationSafetyService = new MedicationSafetyService();
