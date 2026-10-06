import { Disease } from '../types';

export const DISEASES_DATA: Disease[] = [
  {
    id: 'malaria',
    name: 'Malaria',
    icd10: 'B50 - B54',
    category: 'Infectious & Parasitic Diseases',
    specialist: 'Infectious Disease Specialist / General Physician',
    urgency: 'High',
    description: 'A life-threatening mosquito-borne infectious disease caused by Plasmodium parasites, characterized by cyclical high-grade paroxysms of fever, chills, and sweating.',
    primarySymptoms: ['fever', 'chills', 'sweating', 'headache', 'fatigue'],
    secondarySymptoms: ['nausea', 'vomiting', 'muscle_aches', 'loss_of_appetite', 'pale_skin'],
    recommendedMedicines: [
      { medicineId: 'artemether_lumefantrine', type: 'Primary', dosage: '4 tablets initially, then at 8, 24, 36, 48, and 60 hours', duration: '3 Days', instructions: 'Take with fatty foods or milk to enhance drug absorption.' },
      { medicineId: 'paracetamol', type: 'Supportive', dosage: '650mg every 6 hours PRN', duration: '3-5 Days', instructions: 'For controlling high fever spikes and headache.' },
      { medicineId: 'ors_electrolytes', type: 'Supportive', dosage: '1 sachet in 1L water; frequent sips', duration: 'As needed', instructions: 'Prevent dehydration from heavy fever sweats and vomiting.' }
    ],
    precautions: [
      'Sleep under insecticide-treated bed nets (ITNs)',
      'Undergo a blood smear (thick and thin films) or Rapid Diagnostic Test (RDT) immediately',
      'Avoid standing water sources near living spaces',
      'Wear long-sleeved clothing during dawn and dusk'
    ],
    dietaryAdvice: [
      'Drink abundant fluids (coconut water, oral rehydration solution, clear broths)',
      'High calorie, easily digestible meals (steamed rice, boiled lentils, oats)',
      'Avoid greasy, spicy, and deep-fried foods'
    ],
    lifestyleAdvice: [
      'Strict bed rest during fever bouts',
      'Keep indoor temperature cool and well ventilated',
      'Monitor body temperature every 4 hours'
    ],
    emergencySigns: [
      'Altered consciousness, drowsiness or delirium',
      'Severe respiratory distress or tachypnea',
      'Severe jaundice or persistent vomiting preventing oral medication',
      'Spontaneous bleeding or black/cola colored urine (Blackwater fever)'
    ]
  },
  {
    id: 'typhoid',
    name: 'Typhoid Fever (Enteric Fever)',
    icd10: 'A01.0',
    category: 'Infectious Diseases',
    specialist: 'Infectious Disease Specialist / Gastroenterologist',
    urgency: 'High',
    description: 'Systemic bacterial infection caused by Salmonella enterica serotype Typhi, transmitted via contaminated food or water, causing stepladder fevers and abdominal distress.',
    primarySymptoms: ['fever', 'headache', 'abdominal_pain', 'fatigue', 'loss_of_appetite'],
    secondarySymptoms: ['constipation', 'diarrhea', 'weakness', 'dry_scaly_skin', 'nausea'],
    recommendedMedicines: [
      { medicineId: 'ciprofloxacin', type: 'Primary', dosage: '500mg twice daily', duration: '7 - 10 Days', instructions: 'Take on empty stomach or after light meals. Complete full antibiotic course.' },
      { medicineId: 'paracetamol', type: 'Supportive', dosage: '500mg every 6 hours PRN', duration: '5 Days', instructions: 'Manage persistent pyrexia and headache.' },
      { medicineId: 'ors_electrolytes', type: 'Supportive', dosage: 'Continuous sips throughout the day', duration: '7 Days', instructions: 'Replenish electrolytes lost through fever and diarrhea.' }
    ],
    precautions: [
      'Boil or filter all drinking water thoroughly',
      'Strict hand hygiene before food preparation and eating',
      'Avoid raw unpeeled fruits and street-vended foods',
      'Isolate eating utensils to prevent household transmission'
    ],
    dietaryAdvice: [
      'Bland soft diet: rice porridge (congee), boiled potatoes, bananas, toast',
      'High protein broths and well-boiled strained soups',
      'Avoid raw vegetables, spicy spices, and high-fiber foods that irritate inflamed bowel'
    ],
    lifestyleAdvice: [
      'Adequate physical rest for minimum 1-2 weeks',
      'Daily monitoring of temperature charts',
      'Ensure sanitary disposal of human waste'
    ],
    emergencySigns: [
      'Severe sudden abdominal pain with rigid guarding (suspected bowel perforation)',
      'Intestinal hemorrhage with black tarry stools',
      'Severe delirium, confusion, or stupor (typhoid state)'
    ]
  },
  {
    id: 'gerd',
    name: 'Gastroesophageal Reflux Disease (GERD)',
    icd10: 'K21.9',
    category: 'Gastrointestinal Disorders',
    specialist: 'Gastroenterologist',
    urgency: 'Medium',
    description: 'Chronic mucosal damage caused by stomach acid persistently escaping into the esophagus due to transient lower esophageal sphincter relaxation.',
    primarySymptoms: ['upper_abdominal_burning', 'chest_pain', 'bloating', 'nausea'],
    secondarySymptoms: ['sore_throat', 'loss_of_voice', 'cough', 'vomiting'],
    recommendedMedicines: [
      { medicineId: 'omeprazole', type: 'Primary', dosage: '20mg - 40mg once daily', duration: '4 - 8 Weeks', instructions: 'Swallow whole with water 30-60 minutes before morning breakfast.' },
      { medicineId: 'pantoprazole', type: 'Secondary', dosage: '40mg once daily', duration: '4 - 8 Weeks', instructions: 'Alternative if omeprazole is not tolerated or drug interaction exists.' }
    ],
    precautions: [
      'Do not lie down within 3 hours of eating a meal',
      'Elevate the head of your bed by 6 inches using risers',
      'Avoid tight-fitting garments around the waist and abdomen',
      'Limit tobacco and alcohol consumption'
    ],
    dietaryAdvice: [
      'Eat smaller, frequent meals instead of 2-3 large heavy meals',
      'Avoid citrus fruits, tomatoes, chocolate, caffeine, and spearmint/peppermint',
      'Limit heavily spiced, fried, and high-fat foods'
    ],
    lifestyleAdvice: [
      'Maintain a healthy weight to reduce intra-abdominal pressure',
      'Stop smoking to restore lower esophageal sphincter tone',
      'Walk gently for 15 minutes after meals'
    ],
    emergencySigns: [
      'Difficulty or pain swallowing solid foods (dysphagia/odynophagia)',
      'Vomiting blood or coffee-ground emesis',
      'Crushing chest pressure radiating to jaw or left arm (must rule out acute myocardial infarction)'
    ]
  },
  {
    id: 'bronchial_asthma',
    name: 'Bronchial Asthma',
    icd10: 'J45.9',
    category: 'Respiratory Diseases',
    specialist: 'Pulmonologist / Allergist',
    urgency: 'High',
    description: 'Chronic airway inflammatory condition characterized by hyper-responsiveness, reversible airflow obstruction, and bronchospasm episodes.',
    primarySymptoms: ['wheezing', 'shortness_of_breath', 'cough', 'chest_pain'],
    secondarySymptoms: ['fatigue', 'night_sweats', 'sinus_pressure'],
    recommendedMedicines: [
      { medicineId: 'salbutamol', type: 'Primary', dosage: '1 - 2 puffs every 4-6 hours PRN', duration: 'Rescue PRN', instructions: 'Inhale with a spacer device during acute wheezing or before exercise.' },
      { medicineId: 'cetirizine', type: 'Supportive', dosage: '10mg once daily in evening', duration: '14 - 30 Days', instructions: 'Helps suppress allergic trigger-driven airway irritation.' }
    ],
    precautions: [
      'Always keep a rescue inhaler within arm’s reach',
      'Identify and avoid specific personal triggers (dust mites, pet dander, mold, cold air, smoke)',
      'Use HEPA air purifiers inside bedroom',
      'Follow your personalized Asthma Action Plan'
    ],
    dietaryAdvice: [
      'Eat antioxidant-rich fruits and vegetables rich in vitamin C and beta-carotene',
      'Avoid sulfite-containing foods (dried fruits, processed wines, pickled foods)',
      'Stay well-hydrated to help thin mucus secretions'
    ],
    lifestyleAdvice: [
      'Wear a scarf or mask over nose and mouth in freezing weather',
      'Practice diaphragmatic breathing exercises (Buteyko technique)',
      'Warm up thoroughly before physical exercise'
    ],
    emergencySigns: [
      'Severe breathlessness unable to speak full sentences in one breath',
      'Lips or fingernails turning blue/gray (cyanosis)',
      'Chest and rib retractions (using accessory neck muscles to breathe)',
      'Peak flow meter reading below 50% of personal best with no relief from inhaler'
    ]
  },
  {
    id: 'pneumonia',
    name: 'Community-Acquired Pneumonia',
    icd10: 'J18.9',
    category: 'Respiratory Infections',
    specialist: 'Pulmonologist / General Physician',
    urgency: 'High',
    description: 'Acute lower respiratory infection causing inflammation and fluid accumulation in the lung alveoli, impairing blood oxygenation.',
    primarySymptoms: ['productive_cough', 'fever', 'chills', 'shortness_of_breath', 'pleuritic_chest_pain'],
    secondarySymptoms: ['fatigue', 'sweating', 'loss_of_appetite', 'nausea', 'confusion'],
    recommendedMedicines: [
      { medicineId: 'amoxicillin', type: 'Primary', dosage: '875mg twice daily or 500mg 3 times daily', duration: '7 - 10 Days', instructions: 'Take with food. Do not discontinue early even after fever abates.' },
      { medicineId: 'azithromycin', type: 'Secondary', dosage: '500mg Day 1, then 250mg daily for 4 days', duration: '5 Days', instructions: 'Covers atypical respiratory pathogens like Mycoplasma.' },
      { medicineId: 'paracetamol', type: 'Supportive', dosage: '650mg every 6 hours PRN', duration: '5 Days', instructions: 'Controls debilitating pleuritic discomfort and temperature spikes.' }
    ],
    precautions: [
      'Complete all prescribed antibiotics without missing doses',
      'Monitor peripheral oxygen saturation (SpO2) using a pulse oximeter',
      'Rest in an upright or semi-reclined posture to optimize lung volume',
      'Practice deep breathing and coughing spirometry exercises'
    ],
    dietaryAdvice: [
      'High protein nutrition to rebuild immune tissues (eggs, pulses, tofu, lean poultry)',
      'Warm herbal teas with honey to soothe cough receptors',
      'Abundant hydration to liquefy deep tracheobronchial secretions'
    ],
    lifestyleAdvice: [
      'Absolute smoking cessation and avoid secondhand smoke',
      'Total bed rest until cleared by physician'
    ],
    emergencySigns: [
      'Pulse oximeter reading dropping below 92% (SpO2 < 92%)',
      'Confusion, lethargy, or extreme drowsiness (especially in elderly)',
      'Coughing up gross blood (hemoptysis)',
      'Systolic blood pressure below 90 mmHg'
    ]
  },
  {
    id: 'allergic_rhinitis',
    name: 'Allergic Rhinitis & Sinusitis',
    icd10: 'J30.9',
    category: 'Immunological & Respiratory',
    specialist: 'Allergist / ENT Specialist',
    urgency: 'Low',
    description: 'IgE-mediated allergic inflammation of the nasal mucosa provoked by environmental aeroallergens such as pollens, dust mites, or animal dander.',
    primarySymptoms: ['runny_nose', 'sneezing', 'itching', 'sinus_pressure'],
    secondarySymptoms: ['headache', 'fatigue', 'sore_throat', 'loss_of_smell'],
    recommendedMedicines: [
      { medicineId: 'cetirizine', type: 'Primary', dosage: '10mg once daily at bedtime', duration: '14 - 30 Days', instructions: 'Non-sedating antihistamine to suppress histamine H1 receptor reactions.' },
      { medicineId: 'paracetamol', type: 'Supportive', dosage: '500mg every 8 hours PRN', duration: '3 Days', instructions: 'Relieves accompanying sinus headache and facial tenderness.' }
    ],
    precautions: [
      'Perform regular saline nasal irrigation (Neti pot with distilled water)',
      'Keep windows closed during high pollen counts',
      'Wash bedding weekly in hot water (>130°F / 55°C)',
      'Use mattress and pillow allergy-proof dust mite encasements'
    ],
    dietaryAdvice: [
      'Anti-inflammatory foods rich in quercetin (onions, apples, berries)',
      'Ginger and turmeric warm infusions',
      'Stay away from histamine-rich aged cheeses and fermented foods during flare-ups'
    ],
    lifestyleAdvice: [
      'Shower and change clothing immediately after spending time outdoors during pollen season',
      'Use sunglasses outdoors to protect conjunctiva from windblown allergens'
    ],
    emergencySigns: [
      'Swelling of lips, tongue, or throat with breathing compromise (anaphylaxis - emergency epinephrine required)',
      'Severe periorbital eyelid swelling with high fever'
    ]
  },
  {
    id: 'migraine',
    name: 'Migraine Headache',
    icd10: 'G43.9',
    category: 'Neurological Disorders',
    specialist: 'Neurologist',
    urgency: 'Medium',
    description: 'A primary neurovascular headache disorder characterized by recurrent attacks of moderate to severe pulsating unilateral throbbing pain, sensory hypersensitivity, and nausea.',
    primarySymptoms: ['throbbing_headache', 'photophobia', 'nausea', 'vomiting'],
    secondarySymptoms: ['dizziness', 'blurred_vision', 'neck_pain', 'fatigue'],
    recommendedMedicines: [
      { medicineId: 'ibuprofen', type: 'Primary', dosage: '400mg with light snack at first sign of attack', duration: 'Single dose; repeat in 6h PRN', instructions: 'Take early at the onset of aura or throbbing phase for maximum effectiveness.' },
      { medicineId: 'paracetamol', type: 'Secondary', dosage: '650mg - 1000mg single dose', duration: 'PRN', instructions: 'Can be combined with caffeine under physician direction.' },
      { medicineId: 'ondansetron', type: 'Supportive', dosage: '4mg - 8mg orally', duration: 'PRN during attack', instructions: 'Controls migraine-associated nausea and gastrointestinal stasis.' }
    ],
    precautions: [
      'Retreat to a dark, quiet, climate-controlled room at onset of symptoms',
      'Apply an ice pack or cold gel compress to forehead or base of skull',
      'Maintain consistent regular sleep and meal schedules',
      'Maintain a headache trigger diary (stress, sleep loss, skipping meals, cheese, MSG)'
    ],
    dietaryAdvice: [
      'Maintain strict hydration (dehydration is a prominent migraine trigger)',
      'Avoid aged cheeses, cured meats with nitrates, red wine, and artificial sweeteners like aspartame',
      'Magnesium-rich foods (spinach, pumpkin seeds, almonds)'
    ],
    lifestyleAdvice: [
      'Engage in regular stress-reduction techniques (progressive muscle relaxation, biofeedback)',
      'Avoid sudden shifts in caffeine intake'
    ],
    emergencySigns: [
      'Sudden "thunderclap" headache reaching maximal intensity within seconds',
      'Headache accompanied by fever, stiff neck, and focal motor weakness or speech slurring',
      'First severe headache in a patient over 50 years of age'
    ]
  },
  {
    id: 'type2_diabetes',
    name: 'Type 2 Diabetes Mellitus',
    icd10: 'E11.9',
    category: 'Endocrine & Metabolic Disorders',
    specialist: 'Endocrinologist / Diabetologist',
    urgency: 'Medium',
    description: 'A chronic metabolic disorder characterized by peripheral insulin resistance, progressive pancreatic beta-cell dysfunction, and persistent hyperglycemia.',
    primarySymptoms: ['excessive_thirst', 'frequent_urination', 'fatigue', 'weight_loss'],
    secondarySymptoms: ['excessive_hunger', 'blurred_vision', 'numbness', 'weakness'],
    recommendedMedicines: [
      { medicineId: 'metformin', type: 'Primary', dosage: '500mg twice daily with meals', duration: 'Long-term maintenance', instructions: 'Take with breakfast and dinner to minimize gastrointestinal discomfort.' },
      { medicineId: 'atorvastatin', type: 'Supportive', dosage: '10mg - 20mg once daily at bedtime', duration: 'Long-term', instructions: 'Cardiovascular risk reduction per clinical diabetes guidelines.' }
    ],
    precautions: [
      'Monitor self-measured blood glucose (fasting target 80-130 mg/dL, postprandial <180 mg/dL)',
      'Undergo HbA1c testing every 3 to 6 months (target generally <7.0%)',
      'Inspect feet daily for microtrauma, blisters, or calluses',
      'Annual dilated eye examination and urine microalbuminuria screen'
    ],
    dietaryAdvice: [
      'Focus on low glycemic index complex carbohydrates, leafy green vegetables, and high fiber',
      'Eliminate sugar-sweetened beverages, refined sweets, and fruit juices',
      'Portion control using the plate method (50% non-starchy veggies, 25% lean protein, 25% whole grains)'
    ],
    lifestyleAdvice: [
      'Aim for minimum 150 minutes of moderate aerobic exercise per week plus resistance training',
      'Weight management: 5-7% weight loss significantly enhances insulin sensitivity'
    ],
    emergencySigns: [
      'Blood glucose reading above 350 mg/dL with ketones, fruity breath odor, or vomiting (DKA/HHS)',
      'Hypoglycemia (blood glucose < 70 mg/dL) with shaking, sweating, confusion (treat with 15g fast sugar immediately)',
      'Non-healing foot ulcer with spreading redness or foul discharge'
    ]
  },
  {
    id: 'essential_hypertension',
    name: 'Essential Hypertension',
    icd10: 'I10',
    category: 'Cardiovascular Disorders',
    specialist: 'Cardiologist / Nephrologist / Internist',
    urgency: 'Medium',
    description: 'Sustained elevation of systemic arterial blood pressure (systolic ≥130 mmHg and/or diastolic ≥80 mmHg) without an identifiable secondary etiology.',
    primarySymptoms: ['headache', 'dizziness', 'palpitations'],
    secondarySymptoms: ['fatigue', 'blurred_vision', 'shortness_of_breath', 'chest_pain'],
    recommendedMedicines: [
      { medicineId: 'amlodipine', type: 'Primary', dosage: '5mg once daily morning', duration: 'Long-term maintenance', instructions: 'Check blood pressure periodically; report significant lower leg swelling.' },
      { medicineId: 'losartan', type: 'Secondary', dosage: '50mg once daily', duration: 'Long-term maintenance', instructions: 'Excellent renal protective agent in diabetic and hypertensive patients.' }
    ],
    precautions: [
      'Maintain home blood pressure monitoring logs (measure sitting after 5 min rest)',
      'Adhere strictly to daily medication schedule without skipping doses',
      'Limit dietary sodium intake to under 2,000 mg (less than 1 teaspoon of table salt per day)',
      'Avoid OTC decongestants (pseudoephedrine) and NSAIDs which spike blood pressure'
    ],
    dietaryAdvice: [
      'Strict adherence to DASH diet (Dietary Approaches to Stop Hypertension)',
      'Abundant potassium-rich foods (bananas, sweet potatoes, spinach) unless restricted by renal disease',
      'Limit alcohol consumption'
    ],
    lifestyleAdvice: [
      'Engage in brisk daily walking (30-45 minutes)',
      'Practice chronic stress-reduction techniques',
      'Achieve and preserve optimal Body Mass Index (BMI 18.5 - 24.9)'
    ],
    emergencySigns: [
      'Hypertensive Crisis: BP > 180/120 mmHg with severe headache, visual changes, or chest pain',
      'Sudden numbness or paralysis of face, arm, or leg (acute stroke signs)',
      'Sudden severe shortness of breath (pulmonary edema)'
    ]
  },
  {
    id: 'acute_gastroenteritis',
    name: 'Acute Viral Gastroenteritis (Stomach Flu)',
    icd10: 'A08.4',
    category: 'Gastrointestinal Infections',
    specialist: 'Gastroenterologist / Family Medicine',
    urgency: 'Medium',
    description: 'Self-limiting intestinal infection caused by norovirus, rotavirus, or astrovirus causing acute inflammation of stomach and intestines with watery diarrhea and emesis.',
    primarySymptoms: ['diarrhea', 'vomiting', 'nausea', 'abdominal_pain'],
    secondarySymptoms: ['mild_fever', 'chills', 'muscle_aches', 'dehydration', 'fatigue'],
    recommendedMedicines: [
      { medicineId: 'ors_electrolytes', type: 'Primary', dosage: '200-400ml after every loose stool or emesis episode', duration: '3 - 5 Days', instructions: 'Sip slowly; avoid chugging to prevent re-triggering vomiting.' },
      { medicineId: 'ondansetron', type: 'Supportive', dosage: '4mg - 8mg orally every 8 hours PRN', duration: '2 - 3 Days', instructions: 'Enables patient to tolerate oral fluids and prevent IV admission.' },
      { medicineId: 'paracetamol', type: 'Supportive', dosage: '500mg every 6 hours PRN', duration: '3 Days', instructions: 'Alleviates abdominal cramping pain and low-grade pyrexia.' }
    ],
    precautions: [
      'Wash hands thoroughly with soap and water for 20 seconds (alcohol sanitizer does not kill norovirus)',
      'Disinfect contaminated bathroom surfaces with a dilute bleach solution',
      'Do not prepare food for household members while actively symptomatic',
      'Avoid antimotility drugs (like loperamide) if bloody diarrhea or high fever is present'
    ],
    dietaryAdvice: [
      'Initiate BRAT diet (Bananas, Rice, Applesauce, Toast) once vomiting halts',
      'Clear broths, diluted coconut water, and plain gelatin',
      'Avoid dairy products, coffee, alcohol, artificial sugars, and greasy dishes'
    ],
    lifestyleAdvice: [
      'Rest quietly in bed with readily accessible bathroom',
      'Monitor hydration markers (urine color should remain light pale yellow)'
    ],
    emergencySigns: [
      'Inability to retain liquids for more than 12-24 hours',
      'Signs of severe hypovolemic shock (dizziness on standing, no urination for 8+ hours, dry tongue)',
      'High fever > 102°F or gross bloody or black stools'
    ]
  },
  {
    id: 'osteoarthritis',
    name: 'Osteoarthritis',
    icd10: 'M19.9',
    category: 'Musculoskeletal Disorders',
    specialist: 'Rheumatologist / Orthopedic Surgeon',
    urgency: 'Low',
    description: 'Degenerative joint disease caused by mechanical wear-and-tear breakdown of protective articular cartilage and underlying subchondral bone.',
    primarySymptoms: ['joint_pain', 'morning_stiffness', 'joint_swelling'],
    secondarySymptoms: ['fatigue', 'weakness', 'back_pain'],
    recommendedMedicines: [
      { medicineId: 'paracetamol', type: 'Primary', dosage: '650mg three times daily PRN', duration: 'PRN', instructions: 'First-line analgesic due to superior safety profile in elderly patients.' },
      { medicineId: 'ibuprofen', type: 'Secondary', dosage: '400mg twice daily with meals during inflammatory flare-ups', duration: 'Short courses (5-7 days)', instructions: 'Always take with food; consult physician regarding gastric protection.' }
    ],
    precautions: [
      'Engage in low-impact joint-friendly physical activity (swimming, stationary cycling, walking)',
      'Avoid high-impact jumping or twisting stresses on knee/hip joints',
      'Use supportive footwear with shock-absorbing orthotics',
      'Apply heat pads before activity to ease stiffness and cold packs post-activity for swelling'
    ],
    dietaryAdvice: [
      'Anti-inflammatory Mediterranean diet rich in extra virgin olive oil, nuts, and fatty fish (omega-3s)',
      'Maintain caloric balance to unload mechanical strain from weight-bearing joints',
      'Ensure adequate vitamin D and calcium intake'
    ],
    lifestyleAdvice: [
      'Physiotherapy for quadriceps and hamstring muscle strengthening',
      'Utilize assistive walking devices (canes, trekking poles) if instability occurs'
    ],
    emergencySigns: [
      'Sudden joint effusion with acute severe redness, hot skin, and inability to bear any weight (suspect septic joint)',
      'Rapid onset neurological deficit in limbs (in spinal osteoarthritis)'
    ]
  },
  {
    id: 'acute_dermatitis',
    name: 'Contact Dermatitis & Eczema',
    icd10: 'L23.9',
    category: 'Dermatological Conditions',
    specialist: 'Dermatologist',
    urgency: 'Low',
    description: 'Inflammatory eczematous skin reaction triggered either by direct exposure to an irritant substance or by a cell-mediated allergic type IV hypersensitivity.',
    primarySymptoms: ['skin_rash', 'itching', 'dry_scaly_skin'],
    secondarySymptoms: ['burning_urination', 'mild_fever', 'joint_pain'],
    recommendedMedicines: [
      { medicineId: 'hydrocortisone_cream', type: 'Primary', dosage: 'Apply thin layer to affected skin twice daily', duration: '7 - 10 Days', instructions: 'Do not use continuously for >2 weeks on face or intertriginous skin.' },
      { medicineId: 'cetirizine', type: 'Secondary', dosage: '10mg at bedtime', duration: '7 - 14 Days', instructions: 'Relieves intense nocturnal scratching and aids sleep.' },
      { medicineId: 'clotrimazole', type: 'Supportive', dosage: 'Apply twice daily if secondary fungal superinfection is suspected', duration: '14 Days', instructions: 'For intertriginous macerated rash folds.' }
    ],
    precautions: [
      'Identify and discontinue contact with suspected culprits (nickel jewelry, fragrances, harsh laundry detergents, latex)',
      'Take lukewarm, short (5-10 minute) showers; avoid steaming hot baths',
      'Apply thick unscented ceramide moisturizers within 3 minutes of stepping out of shower',
      'Trim fingernails short to prevent traumatic excoriation and bacterial inoculation'
    ],
    dietaryAdvice: [
      'Drink plenty of water to maintain skin hydration',
      'Identify potential food allergies in pediatric eczema (eggs, milk, peanuts)'
    ],
    lifestyleAdvice: [
      'Wear loose, soft 100% cotton garments; avoid itchy wool and polyester fabrics',
      'Use a humidifier in dry winter climates'
    ],
    emergencySigns: [
      'Rapidly spreading tender rash with yellowish honey-colored crusting or pus-filled blisters (secondary bacterial impetigo / Staph infection)',
      'Development of fever and systemic malaise with skin blistering'
    ]
  }
];
