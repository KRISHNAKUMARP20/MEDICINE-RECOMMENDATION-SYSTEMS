export interface DrugInteractionPair {
  drugA: string;
  drugB: string;
  drugAName?: string;
  drugBName?: string;
  severity: 'Severe' | 'Moderate' | 'Mild';
  clinicalEffect: string;
  adverseEffects: string[];
  mechanism: string;
  recommendation: string;
  actionRequired: 'Immediate Discontinuation' | 'Dose Staggering Required' | 'Clinical Monitoring Advised' | 'Safe with Caution';
}

export const DRUG_INTERACTION_RULES: DrugInteractionPair[] = [
  {
    drugA: 'ibuprofen',
    drugB: 'losartan',
    severity: 'Moderate',
    clinicalEffect: 'Reduced antihypertensive efficacy and elevated risk of acute kidney injury and hyperkalemia.',
    adverseEffects: [
      'Acute Kidney Injury (reduced eGFR)',
      'Hyperkalemia (Serum Potassium > 5.2 mEq/L)',
      'Fluid retention & blunted blood pressure control',
      'Increased cardiovascular strain'
    ],
    mechanism: 'NSAIDs block vasodilatory renal prostaglandins (PGE2/PGI2), causing afferent arteriolar constriction while ARBs dilate the efferent arteriole, drastically reducing glomerular filtration pressure.',
    recommendation: 'Avoid chronic co-administration. Monitor serum creatinine and potassium within 7-14 days. For fever/pain relief, substitute with Paracetamol.',
    actionRequired: 'Clinical Monitoring Advised'
  },
  {
    drugA: 'ibuprofen',
    drugB: 'amlodipine',
    severity: 'Moderate',
    clinicalEffect: 'Antagonism of hypotensive response and increased peripheral fluid retention.',
    adverseEffects: [
      'Loss of systemic blood pressure control',
      'Peripheral lower-extremity edema',
      'Fluid retention'
    ],
    mechanism: 'Renal prostaglandin inhibition promotes sodium and water reabsorption, counteracting calcium channel blocker vasodilation.',
    recommendation: 'Check blood pressure regularly. Restrict NSAID use to shortest effective duration (<= 3-5 days).',
    actionRequired: 'Clinical Monitoring Advised'
  },
  {
    drugA: 'ibuprofen',
    drugB: 'paracetamol',
    severity: 'Mild',
    clinicalEffect: 'Safe for alternating multimodal analgesia, but concurrent excessive dosing increases cumulative organ burden.',
    adverseEffects: [
      'Cumulative gastric irritation',
      'Hepatorenal stress on supratherapeutic doses'
    ],
    mechanism: 'Complementary peripheral COX inhibition (Ibuprofen) and central serotonergic/cannabinoid pathway antipyresis (Paracetamol).',
    recommendation: 'Stagger doses by 2 to 3 hours. Do not exceed 1200mg/day OTC Ibuprofen or 3000-4000mg/day Paracetamol.',
    actionRequired: 'Safe with Caution'
  },
  {
    drugA: 'ibuprofen',
    drugB: 'salbutamol',
    severity: 'Moderate',
    clinicalEffect: 'Risk of NSAID-exacerbated respiratory disease (AERD) and severe acute bronchospasm in sensitive asthmatic patients.',
    adverseEffects: [
      'Acute bronchoconstriction & wheezing',
      'Reduced bronchodilator response',
      'Severe respiratory distress in aspirin-triad asthma'
    ],
    mechanism: 'Cyclooxygenase inhibition shunts arachidonic acid to 5-lipoxygenase, overproducing cysteinyl leukotrienes that provoke intense airway constriction.',
    recommendation: 'Patients with bronchial asthma should avoid non-selective NSAIDs unless previously proven tolerant. Use Paracetamol for analgesia.',
    actionRequired: 'Clinical Monitoring Advised'
  },
  {
    drugA: 'azithromycin',
    drugB: 'ondansetron',
    severity: 'Severe',
    clinicalEffect: 'Synergistic prolongation of cardiac ventricular repolarization (QTc interval) precipitating fatal Torsades de Pointes arrhythmia.',
    adverseEffects: [
      'Torsades de Pointes (polymorphic ventricular tachycardia)',
      'Marked QTc prolongation (> 500 ms)',
      'Syncope and sudden cardiac arrest risk',
      'Palpitations and dizziness'
    ],
    mechanism: 'Both agents exert additive blockades of human ether-à-go-go-related gene (hERG) voltage-gated potassium channels (IKr currents) in cardiac myocytes.',
    recommendation: 'Contraindicated for concurrent outpatient use. Select an alternative non-macrolide antibiotic (e.g. Amoxicillin) or non-5HT3 antiemetic.',
    actionRequired: 'Immediate Discontinuation'
  },
  {
    drugA: 'ciprofloxacin',
    drugB: 'ondansetron',
    severity: 'Severe',
    clinicalEffect: 'Dual potentiation of cardiac QTc interval prolongation with elevated risk of ventricular dysrhythmias.',
    adverseEffects: [
      'Ventricular tachyarrhythmias (Torsades de Pointes)',
      'Severe QTc prolongation',
      'Syncope / Loss of consciousness'
    ],
    mechanism: 'Fluoroquinolones and 5-HT3 antagonists both delay cardiac myocyte repolarization through additive hERG potassium channel inhibition.',
    recommendation: 'Avoid combination. Consider alternative antiemetic (e.g. Metoclopramide) or alternative antibiotic classes without QTc liabilities.',
    actionRequired: 'Immediate Discontinuation'
  },
  {
    drugA: 'metformin',
    drugB: 'ciprofloxacin',
    severity: 'Moderate',
    clinicalEffect: 'Severe dysglycemia including acute symptomatic hypoglycemia or unpredictable glucose spikes.',
    adverseEffects: [
      'Severe neuroglycopenic hypoglycemia (glucose < 55 mg/dL)',
      'Diaphoresis, tremors, acute confusion',
      'Transient unpredictable hyperglycemia'
    ],
    mechanism: 'Fluoroquinolones stimulate pancreatic beta-cell SUR1 receptors causing inappropriate insulin secretion, compounding Metformin insulin sensitization.',
    recommendation: 'Increase capillary blood glucose testing to 3-4 times daily during fluoroquinolone therapy. Keep fast-acting carbohydrates available.',
    actionRequired: 'Clinical Monitoring Advised'
  },
  {
    drugA: 'atorvastatin',
    drugB: 'azithromycin',
    severity: 'Moderate',
    clinicalEffect: 'Elevated circulating statin plasma concentrations increasing the hazard of statin-induced myotoxicity.',
    adverseEffects: [
      'Skeletal muscle myopathy and intense myalgia',
      'Serum creatine kinase (CK) elevation',
      'Rhabdomyolysis and acute myoglobinuric kidney failure (rare)'
    ],
    mechanism: 'Macrolides cause competitive inhibition of hepatic CYP3A4 metabolism and OATP1B1 hepatic uptake transporters, delaying Atorvastatin elimination.',
    recommendation: 'Instruct patient to report any unexplained muscle tenderness, dark urine, or weakness. Consider temporarily withholding Atorvastatin during short 5-day antibiotic course.',
    actionRequired: 'Dose Staggering Required'
  },
  {
    drugA: 'amlodipine',
    drugB: 'atorvastatin',
    severity: 'Moderate',
    clinicalEffect: 'Mutual CYP3A4 substrate interaction leading to moderately increased Atorvastatin exposure.',
    adverseEffects: [
      'Increased incidence of peripheral edema',
      'Myalgia and muscle fatigue',
      'Elevated serum liver transaminases (ALT/AST)'
    ],
    mechanism: 'Both agents share CYP3A4 hepatic clearance pathways, increasing the area under the curve (AUC) of Atorvastatin by approximately 18%.',
    recommendation: 'Safe to co-prescribe with standard clinical dosing, but monitor liver function and muscle symptoms if Atorvastatin exceeds 40mg/day.',
    actionRequired: 'Clinical Monitoring Advised'
  },
  {
    drugA: 'ciprofloxacin',
    drugB: 'losartan',
    severity: 'Moderate',
    clinicalEffect: 'Compounded hypotensive response and additive risk of renal impairment in dehydrated patients.',
    adverseEffects: [
      'Orthostatic hypotension and dizziness',
      'Elevated blood urea nitrogen (BUN) and creatinine',
      'Hyperkalemia risk'
    ],
    mechanism: 'Vasodilation from ARB coupled with fluid losses from infection or ciprofloxacin-mediated vasodilation reduces systemic vascular resistance.',
    recommendation: 'Maintain adequate oral fluid intake and monitor seated vs standing blood pressure during antimicrobial course.',
    actionRequired: 'Clinical Monitoring Advised'
  },
  {
    drugA: 'omeprazole',
    drugB: 'atorvastatin',
    severity: 'Mild',
    clinicalEffect: 'Potential slight enhancement of statin absorption due to gastric pH elevation.',
    adverseEffects: [
      'Mild gastrointestinal discomfort',
      'Minimal change in statin bioavailability'
    ],
    mechanism: 'Proton pump inhibition increases intragastric pH, mildly modifying the dissolution profile of lipophilic statins.',
    recommendation: 'Take Omeprazole 30-60 minutes before morning breakfast, and take Atorvastatin in the evening.',
    actionRequired: 'Dose Staggering Required'
  },
  {
    drugA: 'amoxicillin',
    drugB: 'allopurinol',
    severity: 'Moderate',
    clinicalEffect: 'Significantly heightened incidence of cutaneous hypersensitivity reactions and widespread maculopapular drug eruptions.',
    adverseEffects: [
      'Pruritic maculopapular rash (exanthema)',
      'Epidermal erythema and peeling',
      'Allergic contact dermatitis'
    ],
    mechanism: 'Synergistic cell-mediated immune hypersensitivity induced by aminopenicillin metabolites in the presence of xanthine oxidase inhibition.',
    recommendation: 'Discontinue Amoxicillin immediately if an erythematous rash appears. Switch to a macrolide or cephalosporin if non-allergic.',
    actionRequired: 'Clinical Monitoring Advised'
  },
  {
    drugA: 'ciprofloxacin',
    drugB: 'theophylline',
    severity: 'Severe',
    clinicalEffect: 'Life-threatening theophylline toxicity including generalized seizures, intractable arrhythmias, and respiratory arrest.',
    adverseEffects: [
      'Generalized grand-mal seizures',
      'Supraventricular and ventricular tachycardia',
      'Severe intractable nausea and intractable emesis',
      'Cardiopulmonary collapse'
    ],
    mechanism: 'Ciprofloxacin is a potent mechanism-based inhibitor of hepatic cytochrome P450 1A2 (CYP1A2), reducing theophylline clearance by over 50%.',
    recommendation: 'Avoid combination. If co-administration is necessary, reduce theophylline dose by 50% and conduct strict therapeutic drug monitoring.',
    actionRequired: 'Immediate Discontinuation'
  },
  {
    drugA: 'artemether_lumefantrine',
    drugB: 'azithromycin',
    severity: 'Severe',
    clinicalEffect: 'Critical compounding of myocardial QTc prolongation during antimalarial therapy.',
    adverseEffects: [
      'Severe cardiac QTc prolongation (> 500 ms)',
      'Fatal polymorphic ventricular tachycardia',
      'Severe dizziness and syncope'
    ],
    mechanism: 'Both lumefantrine and azithromycin inhibit cardiac hERG potassium ion channels, producing dangerous additive repolarization delay.',
    recommendation: 'Avoid concurrent administration. If an antibacterial is required during ACT treatment, select beta-lactams or doxycycline.',
    actionRequired: 'Immediate Discontinuation'
  },
  {
    drugA: 'artemether_lumefantrine',
    drugB: 'ondansetron',
    severity: 'Severe',
    clinicalEffect: 'Dangerous additive cardiac repolarization prolongation during treatment of malaria-associated vomiting.',
    adverseEffects: [
      'Ventricular arrhythmias (Torsades de Pointes)',
      'Marked QTc prolongation',
      'Cardiac syncope'
    ],
    mechanism: 'Lumefantrine and ondansetron both prolong cardiac ventricular repolarization through additive potassium channel blockade.',
    recommendation: 'Use alternative antiemetic agents such as Promethazine or Metoclopramide during artemether-lumefantrine treatment.',
    actionRequired: 'Immediate Discontinuation'
  }
];

// Helper to normalize drug names, generic aliases, or IDs
export function normalizeDrugKey(raw: string): string {
  const s = raw.toLowerCase().trim();
  if (s.includes('ibuprofen') || s.includes('advil') || s.includes('motrin')) return 'ibuprofen';
  if (s.includes('paracetamol') || s.includes('acetaminophen') || s.includes('tylenol') || s.includes('panadol') || s.includes('dolo')) return 'paracetamol';
  if (s.includes('losartan') || s.includes('cozaar')) return 'losartan';
  if (s.includes('amlodipine') || s.includes('norvasc')) return 'amlodipine';
  if (s.includes('metformin') || s.includes('glucophage')) return 'metformin';
  if (s.includes('atorvastatin') || s.includes('lipitor')) return 'atorvastatin';
  if (s.includes('azithromycin') || s.includes('zithromax') || s.includes('z-pak')) return 'azithromycin';
  if (s.includes('ciprofloxacin') || s.includes('cipro')) return 'ciprofloxacin';
  if (s.includes('amoxicillin') || s.includes('amoxil')) return 'amoxicillin';
  if (s.includes('omeprazole') || s.includes('prilosec')) return 'omeprazole';
  if (s.includes('pantoprazole') || s.includes('protonix')) return 'pantoprazole';
  if (s.includes('ondansetron') || s.includes('zofran')) return 'ondansetron';
  if (s.includes('salbutamol') || s.includes('albuterol') || s.includes('ventolin')) return 'salbutamol';
  if (s.includes('cetirizine') || s.includes('zyrtec')) return 'cetirizine';
  if (s.includes('artemether') || s.includes('coartem') || s.includes('lumefantrine')) return 'artemether_lumefantrine';
  if (s.includes('allopurinol') || s.includes('zyloprim')) return 'allopurinol';
  if (s.includes('theophylline') || s.includes('theochron')) return 'theophylline';
  return s.replace(/[^a-z0-9]/g, '_');
}

export function checkDrugInteractions(drugIds: string[]): DrugInteractionPair[] {
  const interactions: DrugInteractionPair[] = [];
  const normalizedIds = Array.from(new Set(drugIds.map(d => normalizeDrugKey(d))));

  for (let i = 0; i < normalizedIds.length; i++) {
    for (let j = i + 1; j < normalizedIds.length; j++) {
      const idA = normalizedIds[i];
      const idB = normalizedIds[j];

      const match = DRUG_INTERACTION_RULES.find(
        rule =>
          (rule.drugA === idA && rule.drugB === idB) ||
          (rule.drugA === idB && rule.drugB === idA)
      );

      if (match) {
        // Prevent duplicate results
        if (!interactions.some(item => 
          (item.drugA === match.drugA && item.drugB === match.drugB) ||
          (item.drugA === match.drugB && item.drugB === match.drugA)
        )) {
          interactions.push(match);
        }
      }
    }
  }

  // Sort: Severe first, then Moderate, then Mild
  const severityRank = { Severe: 3, Moderate: 2, Mild: 1 };
  return interactions.sort((a, b) => severityRank[b.severity] - severityRank[a.severity]);
}
