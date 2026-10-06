import { Medicine } from '../types';

export const MEDICINES_DATA: Medicine[] = [
  // Analgesics & Antipyretics
  {
    id: 'paracetamol',
    name: 'Paracetamol',
    genericName: 'Acetaminophen',
    brandNames: ['Tylenol', 'Panadol', 'Calpol', 'Crocin', 'Dolo-650'],
    drugClass: 'Analgesic & Antipyretic',
    prescriptionRequired: false,
    form: 'Tablet',
    priceRange: '$3 - $8',
    standardDosage: {
      adult: '500mg - 650mg every 4 to 6 hours as needed (Max: 4000mg/day)',
      pediatric: '10-15mg/kg every 4-6 hours (Max 75mg/kg/day)',
      frequency: 'Every 4-6 hours',
      timing: 'Anytime'
    },
    indications: ['Mild to moderate fever', 'Headache', 'Muscle pain', 'Osteoarthritis ache', 'Post-vaccination discomfort'],
    contraindications: ['Severe hepatic impairment', 'Active liver failure', 'Known hypersensitivity'],
    commonSideEffects: ['Nausea', 'Mild stomach upset'],
    severeSideEffects: ['Hepatotoxicity with overdose', 'Stevens-Johnson Syndrome (rare)', 'Acute liver necrosis'],
    pregnancyCategory: 'B',
    drugInteractions: [
      { interactsWith: 'Warfarin', severity: 'Moderate', description: 'Regular chronic high doses may enhance anticoagulation and bleeding risk.' },
      { interactsWith: 'Alcohol', severity: 'Severe', description: 'Concurrent heavy alcohol consumption significantly heightens hepatotoxicity.' }
    ],
    substitutes: ['Ibuprofen', 'Naproxen']
  },
  {
    id: 'ibuprofen',
    name: 'Ibuprofen',
    genericName: 'Ibuprofen',
    brandNames: ['Advil', 'Motrin', 'Nurofen', 'Brufen'],
    drugClass: 'NSAID (Nonsteroidal Anti-inflammatory Drug)',
    prescriptionRequired: false,
    form: 'Tablet',
    priceRange: '$5 - $12',
    standardDosage: {
      adult: '200mg - 400mg every 4 to 6 hours with meals (Max: 1200mg OTC, 2400mg Rx)',
      pediatric: '5-10mg/kg every 6-8 hours',
      frequency: 'Every 6-8 hours',
      timing: 'After meals'
    },
    indications: ['Inflammatory joint pain', 'Migraine', 'Dysmenorrhea', 'Dental pain', 'Fever with inflammation'],
    contraindications: ['Active peptic ulcer disease', 'Severe heart failure', 'Third trimester of pregnancy', 'Severe renal impairment'],
    commonSideEffects: ['Dyspepsia', 'Heartburn', 'Nausea', 'Abdominal cramps'],
    severeSideEffects: ['Gastrointestinal ulceration/bleeding', 'Renal impairment', 'Cardiovascular thrombotic events'],
    pregnancyCategory: 'D',
    drugInteractions: [
      { interactsWith: 'Aspirin', severity: 'Severe', description: 'Increases risk of gastrointestinal hemorrhage and attenuates aspirin cardioprotection.' },
      { interactsWith: 'Lisinopril', severity: 'Moderate', description: 'Reduces antihypertensive effect of ACE inhibitors and increases hyperkalemia risk.' }
    ],
    substitutes: ['Naproxen', 'Celecoxib', 'Paracetamol']
  },

  // Antibiotics & Antimicrobials
  {
    id: 'amoxicillin',
    name: 'Amoxicillin',
    genericName: 'Amoxicillin trihydrate',
    brandNames: ['Amoxil', 'Moxatag', 'Novamox'],
    drugClass: 'Penicillin-class Antibiotic',
    prescriptionRequired: true,
    form: 'Capsule',
    priceRange: '$10 - $20',
    standardDosage: {
      adult: '500mg three times daily or 875mg twice daily for 7-10 days',
      pediatric: '25-45mg/kg/day divided into 2 doses',
      frequency: 'Every 8 or 12 hours',
      timing: 'With food'
    },
    indications: ['Bacterial sinusitis', 'Streptococcal pharyngitis', 'Otitis media', 'Community-acquired pneumonia', 'H. pylori eradication'],
    contraindications: ['Penicillin allergy / Anaphylaxis to beta-lactams', 'Infectious mononucleosis (rash risk)'],
    commonSideEffects: ['Diarrhea', 'Mild rash', 'Nausea', 'Vomiting'],
    severeSideEffects: ['Anaphylactic shock', 'Clostridioides difficile colitis', 'Severe cutaneous adverse reactions'],
    pregnancyCategory: 'B',
    drugInteractions: [
      { interactsWith: 'Methotrexate', severity: 'Severe', description: 'Reduces renal excretion of methotrexate, increasing toxic risk.' },
      { interactsWith: 'Allopurinol', severity: 'Moderate', description: 'Higher incidence of drug rashes when co-prescribed.' }
    ],
    substitutes: ['Azithromycin', 'Cefuroxime', 'Doxycycline']
  },
  {
    id: 'azithromycin',
    name: 'Azithromycin',
    genericName: 'Azithromycin monohydrate',
    brandNames: ['Zithromax', 'Z-Pak', 'Azee'],
    drugClass: 'Macrolide Antibiotic',
    prescriptionRequired: true,
    form: 'Tablet',
    priceRange: '$15 - $35',
    standardDosage: {
      adult: '500mg on Day 1, followed by 250mg once daily on Days 2-5',
      frequency: 'Once daily',
      timing: 'Anytime'
    },
    indications: ['Atypical pneumonia', 'Acute bacterial exacerbations of COPD', 'Chlamydia infections', 'Sinusitis in penicillin-allergic patients'],
    contraindications: ['History of cholestatic jaundice with macrolides', 'Known baseline prolonged QT interval'],
    commonSideEffects: ['Diarrhea', 'Stomach cramps', 'Mild nausea'],
    severeSideEffects: ['QT interval prolongation & Torsades de pointes', 'Hepatotoxicity', 'Severe allergic angioedema'],
    pregnancyCategory: 'B',
    drugInteractions: [
      { interactsWith: 'Amiodarone', severity: 'Contraindicated', description: 'Additive risk of severe fatal ventricular arrhythmias and prolonged QT.' },
      { interactsWith: 'Warfarin', severity: 'Moderate', description: 'May potentiate INR and anticoagulant effect.' }
    ],
    substitutes: ['Clarithromycin', 'Doxycycline', 'Levofloxacin']
  },
  {
    id: 'ciprofloxacin',
    name: 'Ciprofloxacin',
    genericName: 'Ciprofloxacin Hydrochloride',
    brandNames: ['Cipro', 'Cifran', 'Ciplox'],
    drugClass: 'Fluoroquinolone Antibiotic',
    prescriptionRequired: true,
    form: 'Tablet',
    priceRange: '$12 - $25',
    standardDosage: {
      adult: '500mg twice daily for 7 to 14 days based on severity',
      frequency: 'Twice daily',
      timing: 'After meals'
    },
    indications: ['Complicated urinary tract infections', 'Typhoid fever', 'Infectious diarrhea', 'Bone and joint infections'],
    contraindications: ['History of tendon rupture', 'Myasthenia gravis', 'Concurrent tizanidine use'],
    commonSideEffects: ['Nausea', 'Diarrhea', 'Dizziness', 'Headache'],
    severeSideEffects: ['Tendonitis and tendon rupture (Achilles)', 'Peripheral neuropathy', 'Aortic aneurysm rupture risk'],
    pregnancyCategory: 'C',
    drugInteractions: [
      { interactsWith: 'Theophylline', severity: 'Severe', description: 'Increases theophylline plasma concentrations to toxic ranges.' },
      { interactsWith: 'Antacids (Aluminum/Magnesium)', severity: 'Moderate', description: 'Chelates ciprofloxacin, completely blocking its absorption.' }
    ],
    substitutes: ['Levofloxacin', 'Ceftriaxone', 'Nitrofurantoin']
  },

  // Antihistamines & Respiratory
  {
    id: 'cetirizine',
    name: 'Cetirizine',
    genericName: 'Cetirizine Hydrochloride',
    brandNames: ['Zyrtec', 'Cetzine', 'Alerid'],
    drugClass: 'Second-generation Antihistamine',
    prescriptionRequired: false,
    form: 'Tablet',
    priceRange: '$6 - $14',
    standardDosage: {
      adult: '10mg once daily in the evening',
      pediatric: '5mg once or twice daily for children >6 yrs',
      frequency: 'Once daily at bedtime',
      timing: 'Anytime'
    },
    indications: ['Allergic rhinitis', 'Seasonal hay fever', 'Chronic idiopathic urticaria', 'Allergic conjunctivitis'],
    contraindications: ['End-stage renal disease (CrCl < 10 mL/min)', 'Known cetirizine/hydroxyzine hypersensitivity'],
    commonSideEffects: ['Mild drowsiness', 'Dry mouth', 'Headache'],
    severeSideEffects: ['Severe urinary retention', 'Hypotension (rare)'],
    pregnancyCategory: 'B',
    drugInteractions: [
      { interactsWith: 'Alcohol', severity: 'Moderate', description: 'Additive CNS depression and impaired alertness.' }
    ],
    substitutes: ['Loratadine', 'Fexofenadine', 'Levocetirizine']
  },
  {
    id: 'salbutamol',
    name: 'Salbutamol (Albuterol)',
    genericName: 'Albuterol Sulfate',
    brandNames: ['Ventolin', 'ProAir', 'Asthalin'],
    drugClass: 'Short-acting Beta-2 Agonist (SABA) Bronchodilator',
    prescriptionRequired: true,
    form: 'Inhaler',
    priceRange: '$18 - $40',
    standardDosage: {
      adult: '1-2 inhalations (90-180mcg) every 4 to 6 hours as needed for wheezing',
      frequency: 'As needed (PRN)',
      timing: 'Anytime'
    },
    indications: ['Acute bronchial asthma spasm', 'Exercise-induced bronchospasm', 'COPD exacerbation wheeze'],
    contraindications: ['Hypersensitivity to salbutamol or fluorocarbons'],
    commonSideEffects: ['Fine tremors', 'Tachycardia', 'Nervousness', 'Palpitations'],
    severeSideEffects: ['Paradoxical bronchospasm', 'Hypokalemia', 'Cardiac arrhythmias'],
    pregnancyCategory: 'C',
    drugInteractions: [
      { interactsWith: 'Propranolol', severity: 'Severe', description: 'Non-selective beta-blockers antagonize bronchodilator action and trigger severe asthma attacks.' }
    ],
    substitutes: ['Levalbuterol', 'Terbutaline']
  },

  // Gastrointestinal
  {
    id: 'omeprazole',
    name: 'Omeprazole',
    genericName: 'Omeprazole',
    brandNames: ['Prilosec', 'Omez', 'Losec'],
    drugClass: 'Proton Pump Inhibitor (PPI)',
    prescriptionRequired: false,
    form: 'Capsule',
    priceRange: '$8 - $22',
    standardDosage: {
      adult: '20mg - 40mg once daily taken 30-60 minutes before breakfast for 4-8 weeks',
      frequency: 'Once daily morning',
      timing: 'Before meals'
    },
    indications: ['Gastroesophageal reflux disease (GERD)', 'Peptic ulcer disease', 'Zollinger-Ellison syndrome', 'Gastric protection with NSAIDs'],
    contraindications: ['Hypersensitivity to PPIs', 'Concurrent use with rilpivirine'],
    commonSideEffects: ['Headache', 'Abdominal pain', 'Flatulence', 'Diarrhea or constipation'],
    severeSideEffects: ['Hypomagnesemia with long-term use', 'Increased risk of bone fractures', 'C. difficile-associated diarrhea'],
    pregnancyCategory: 'C',
    drugInteractions: [
      { interactsWith: 'Clopidogrel', severity: 'Severe', description: 'Omeprazole inhibits CYP2C19, decreasing clopidogrel active metabolite and platelet inhibition.' },
      { interactsWith: 'Iron supplements', severity: 'Mild', description: 'Decreased stomach acidity limits oral non-heme iron absorption.' }
    ],
    substitutes: ['Pantoprazole', 'Esomeprazole', 'Famotidine']
  },
  {
    id: 'pantoprazole',
    name: 'Pantoprazole',
    genericName: 'Pantoprazole Sodium',
    brandNames: ['Protonix', 'Pan 40', 'Pantocid'],
    drugClass: 'Proton Pump Inhibitor (PPI)',
    prescriptionRequired: true,
    form: 'Tablet',
    priceRange: '$10 - $25',
    standardDosage: {
      adult: '40mg once daily 30 minutes before morning meal',
      frequency: 'Once daily morning',
      timing: 'Before meals'
    },
    indications: ['Erosive esophagitis', 'GERD', 'Stress ulcer prophylaxis in ICU', 'Pathological hypersecretory conditions'],
    contraindications: ['Known hypersensitivity to substituted benzimidazoles'],
    commonSideEffects: ['Mild diarrhea', 'Headache', 'Nausea'],
    severeSideEffects: ['Acute interstitial nephritis', 'Subacute cutaneous lupus erythematosus'],
    pregnancyCategory: 'B',
    drugInteractions: [
      { interactsWith: 'Atazanavir', severity: 'Severe', description: 'Decreases absorption of atazanavir significantly.' }
    ],
    substitutes: ['Omeprazole', 'Rabeprazole', 'Famotidine']
  },
  {
    id: 'ondansetron',
    name: 'Ondansetron',
    genericName: 'Ondansetron Hydrochloride',
    brandNames: ['Zofran', 'Emeset', 'Zofer'],
    drugClass: '5-HT3 Receptor Antagonist Antiemetic',
    prescriptionRequired: true,
    form: 'Tablet',
    priceRange: '$12 - $30',
    standardDosage: {
      adult: '4mg - 8mg orally every 8 hours as needed for nausea and vomiting',
      frequency: 'Every 8 hours PRN',
      timing: 'Anytime'
    },
    indications: ['Acute gastroenteritis vomiting', 'Chemotherapy-induced nausea', 'Post-operative nausea and vomiting'],
    contraindications: ['Congenital long QT syndrome', 'Concurrent apomorphine administration'],
    commonSideEffects: ['Constipation', 'Headache', 'Fatigue'],
    severeSideEffects: ['QT prolongation', 'Serotonin syndrome when combined with SSRIs'],
    pregnancyCategory: 'B',
    drugInteractions: [
      { interactsWith: 'Apomorphine', severity: 'Contraindicated', description: 'Can cause profound hypotension and loss of consciousness.' }
    ],
    substitutes: ['Domperidone', 'Metoclopramide', 'Promethazine']
  },
  {
    id: 'ors_electrolytes',
    name: 'Oral Rehydration Salts (ORS)',
    genericName: 'Sodium chloride, Trisodium citrate, Potassium chloride, Dextrose',
    brandNames: ['Electral', 'WHO-ORS', 'Hydralyte', 'Pedialyte'],
    drugClass: 'Electrolyte & Fluid Replenisher',
    prescriptionRequired: false,
    form: 'Syrup',
    priceRange: '$2 - $6',
    standardDosage: {
      adult: 'Dissolve 1 sachet in 1 liter clean drinking water; sip 200-400ml after each loose stool',
      frequency: 'Continuous frequent sips',
      timing: 'Anytime'
    },
    indications: ['Dehydration secondary to acute diarrhea or vomiting', 'Heat exhaustion', 'Exertional fluid depletion'],
    contraindications: ['Intractable persistent vomiting requiring IV fluids', 'Paralytic ileus', 'Severe renal failure (oliguria)'],
    commonSideEffects: ['None when correctly diluted'],
    severeSideEffects: ['Hypernatremia if prepared with insufficient water'],
    pregnancyCategory: 'A',
    drugInteractions: [],
    substitutes: ['Electrolyte solutions', 'Coconut water']
  },

  // Cardiovascular & Metabolic
  {
    id: 'amlodipine',
    name: 'Amlodipine',
    genericName: 'Amlodipine Besylate',
    brandNames: ['Norvasc', 'Amlong', 'Stamlo'],
    drugClass: 'Dihydropyridine Calcium Channel Blocker',
    prescriptionRequired: true,
    form: 'Tablet',
    priceRange: '$6 - $18',
    standardDosage: {
      adult: '5mg once daily; may titrate to 10mg once daily after 1-2 weeks',
      frequency: 'Once daily',
      timing: 'Anytime'
    },
    indications: ['Essential systemic hypertension', 'Chronic stable angina', 'Vasospastic (Prinzmetal) angina'],
    contraindications: ['Severe aortic stenosis', 'Severe cardiogenic shock', 'Hypotension (BP < 90/60)'],
    commonSideEffects: ['Peripheral ankle edema', 'Flushing', 'Dizziness', 'Palpitations'],
    severeSideEffects: ['Worsening angina upon initiation', 'Marked hypotension'],
    pregnancyCategory: 'C',
    drugInteractions: [
      { interactsWith: 'Simvastatin', severity: 'Moderate', description: 'Limit simvastatin dose to 20mg/day to avoid rhabdomyolysis.' }
    ],
    substitutes: ['Nifedipine', 'Felodipine', 'Lisinopril']
  },
  {
    id: 'metformin',
    name: 'Metformin',
    genericName: 'Metformin Hydrochloride',
    brandNames: ['Glucophage', 'Glycomet', 'Fortamet'],
    drugClass: 'Biguanide Antidiabetic Agent',
    prescriptionRequired: true,
    form: 'Tablet',
    priceRange: '$4 - $15',
    standardDosage: {
      adult: '500mg twice daily with meals or 850mg once daily with breakfast (Max 2000-2550mg/day)',
      frequency: 'Twice daily with meals',
      timing: 'With food'
    },
    indications: ['Type 2 Diabetes Mellitus', 'Prediabetes insulin resistance', 'Polycystic Ovary Syndrome (PCOS)'],
    contraindications: ['Severe renal impairment (eGFR < 30 mL/min)', 'Acute metabolic acidosis / DKA', 'Severe hepatic insufficiency'],
    commonSideEffects: ['Metallic taste', 'Diarrhea', 'Flatulence', 'Abdominal bloating'],
    severeSideEffects: ['Lactic acidosis (rare but high mortality)', 'Vitamin B12 deficiency on chronic use'],
    pregnancyCategory: 'B',
    drugInteractions: [
      { interactsWith: 'Iodinated Radiocontrast', severity: 'Severe', description: 'Must withhold 48 hours prior to contrast imaging to avoid contrast nephropathy and lactic acidosis.' }
    ],
    substitutes: ['Glimepiride', 'Sitagliptin', 'Empagliflozin']
  },
  {
    id: 'atorvastatin',
    name: 'Atorvastatin',
    genericName: 'Atorvastatin Calcium',
    brandNames: ['Lipitor', 'Atorva', 'Storvas'],
    drugClass: 'HMG-CoA Reductase Inhibitor (Statin)',
    prescriptionRequired: true,
    form: 'Tablet',
    priceRange: '$10 - $28',
    standardDosage: {
      adult: '10mg - 20mg once daily at bedtime (can titrate up to 80mg for high ASCVD risk)',
      frequency: 'Once daily at night',
      timing: 'Anytime'
    },
    indications: ['Hypercholesterolemia', 'Secondary prevention of myocardial infarction and stroke', 'Dyslipidemia in diabetes'],
    contraindications: ['Active liver disease', 'Unexplained persistent transaminase elevations', 'Pregnancy and lactation'],
    commonSideEffects: ['Myalgia', 'Mild dyspepsia', 'Elevated liver enzymes'],
    severeSideEffects: ['Rhabdomyolysis with myoglobinuria', 'Autoimmune necrotizing myopathy', 'Acute hepatic failure'],
    pregnancyCategory: 'X',
    drugInteractions: [
      { interactsWith: 'Clarithromycin', severity: 'Severe', description: 'Potent CYP3A4 inhibitors drastically elevate atorvastatin blood levels and rhabdomyolysis.' },
      { interactsWith: 'Grapefruit Juice', severity: 'Moderate', description: 'Increases statin systemic exposure.' }
    ],
    substitutes: ['Rosuvastatin', 'Pravastatin', 'Simvastatin']
  },
  {
    id: 'losartan',
    name: 'Losartan',
    genericName: 'Losartan Potassium',
    brandNames: ['Cozaar', 'Losar', 'Repace'],
    drugClass: 'Angiotensin II Receptor Blocker (ARB)',
    prescriptionRequired: true,
    form: 'Tablet',
    priceRange: '$8 - $20',
    standardDosage: {
      adult: '50mg once daily; maintenance range 25mg to 100mg once daily',
      frequency: 'Once daily',
      timing: 'Anytime'
    },
    indications: ['Hypertension', 'Diabetic nephropathy with proteinuria', 'Stroke risk reduction in LVH patients'],
    contraindications: ['Pregnancy (causes fetal toxicity and death)', 'Concomitant aliskiren in diabetic patients'],
    commonSideEffects: ['Dizziness', 'Nasal congestion', 'Back pain'],
    severeSideEffects: ['Hyperkalemia', 'Angioedema', 'Acute renal insufficiency in bilateral renal artery stenosis'],
    pregnancyCategory: 'D',
    drugInteractions: [
      { interactsWith: 'Spironolactone', severity: 'Severe', description: 'High risk of life-threatening hyperkalemia.' },
      { interactsWith: 'Potassium supplements', severity: 'Moderate', description: 'Can trigger toxic serum potassium elevation.' }
    ],
    substitutes: ['Telmisartan', 'Valsartan', 'Candesartan']
  },

  // Antimalarials & Antiparasitics
  {
    id: 'artemether_lumefantrine',
    name: 'Artemether + Lumefantrine',
    genericName: 'Artemether / Lumefantrine fixed combination',
    brandNames: ['Coartem', 'Lumart', 'Falcinil-LF'],
    drugClass: 'Artemisinin-based Combination Therapy (ACT)',
    prescriptionRequired: true,
    form: 'Tablet',
    priceRange: '$15 - $30',
    standardDosage: {
      adult: '4 tablets (20/120mg each) initially, 4 tablets after 8 hours, then 4 tablets twice daily for 2 more days (total 6-dose course)',
      frequency: 'Specific 6-dose schedule over 3 days',
      timing: 'With food'
    },
    indications: ['Uncomplicated Plasmodium falciparum malaria', 'Mixed malaria infections'],
    contraindications: ['Severe complicated cerebral malaria (requires IV artesunate)', 'First trimester of pregnancy (unless no alternative)'],
    commonSideEffects: ['Palpitations', 'Headache', 'Dizziness', 'Anorexia'],
    severeSideEffects: ['Delayed hemolytic anemia', 'QTc interval prolongation'],
    pregnancyCategory: 'C',
    drugInteractions: [
      { interactsWith: 'Grapefruit Juice', severity: 'Moderate', description: 'Alters metabolism of artemisinin components.' }
    ],
    substitutes: ['Artesunate + Amodiaquine', 'Chloroquine (for sensitive P. vivax)']
  },

  // Topical & Dermatological
  {
    id: 'hydrocortisone_cream',
    name: 'Hydrocortisone 1% Topical',
    genericName: 'Hydrocortisone topical',
    brandNames: ['Cortaid', 'Cortizone-10', 'Hycort'],
    drugClass: 'Mild Topical Corticosteroid',
    prescriptionRequired: false,
    form: 'Ointment',
    priceRange: '$5 - $12',
    standardDosage: {
      adult: 'Apply sparingly to affected skin area 1 to 2 times daily for up to 7 days',
      frequency: '1-2 times daily',
      timing: 'Anytime'
    },
    indications: ['Contact dermatitis', 'Mild eczema', 'Insect bite reactions', 'Pruritus and rash relief'],
    contraindications: ['Untreated bacterial, fungal, or viral skin infections (e.g. herpes, impetigo)', 'Rosacea or perioral dermatitis'],
    commonSideEffects: ['Local burning sensation', 'Skin dryness'],
    severeSideEffects: ['Skin atrophy and telangiectasia on prolonged misuse'],
    pregnancyCategory: 'C',
    drugInteractions: [],
    substitutes: ['Calamine lotion', 'Betamethasone (Rx strong)', 'Ceramide barrier cream']
  },
  {
    id: 'clotrimazole',
    name: 'Clotrimazole 1% Cream',
    genericName: 'Clotrimazole topical',
    brandNames: ['Lotrimin', 'Canesten', 'Candid'],
    drugClass: 'Azole Antifungal',
    prescriptionRequired: false,
    form: 'Ointment',
    priceRange: '$6 - $14',
    standardDosage: {
      adult: 'Apply thin layer to cleaned, dried infected area twice daily for 2 to 4 weeks',
      frequency: 'Twice daily',
      timing: 'Anytime'
    },
    indications: ['Tinea pedis (Athlete foot)', 'Tinea corporis (Ringworm)', 'Cutaneous candidiasis', 'Tinea cruris (Jock itch)'],
    contraindications: ['Hypersensitivity to azole antifungals'],
    commonSideEffects: ['Mild local erythema', 'Stinging', 'Peeling'],
    severeSideEffects: ['Contact allergic dermatitis'],
    pregnancyCategory: 'B',
    drugInteractions: [],
    substitutes: ['Terbinafine', 'Miconazole', 'Ketoconazole']
  }
];
