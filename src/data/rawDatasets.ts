export interface DatasetFile {
  filename: string;
  path: string;
  description: string;
  category: 'raw' | 'processed' | 'reference' | 'notebook' | 'database' | 'report';
  contentType: 'text/csv' | 'application/sql' | 'text/plain' | 'application/json';
  content: string;
  rowCount?: number;
  columnCount?: number;
  kaggleSource?: string;
}

export const KAGGLE_DATASET_METADATA = {
  title: 'Disease Symptom Description & Medicine Recommendation Dataset',
  kaggleSlug: 'itachi9604/disease-symptom-description-dataset',
  url: 'https://www.kaggle.com/datasets/itachi9604/disease-symptom-description-dataset',
  cliCommand: 'kaggle datasets download -d itachi9604/disease-symptom-description-dataset',
  totalDiseases: 41,
  totalSymptoms: 132,
  license: 'CC BY-SA 4.0 (Creative Commons)',
  author: 'Kaggle Clinical Healthcare AI Community',
  associatedPaper: 'Machine Learning for Differential Diagnosis and Pharmacotherapy Recommendation'
};

export const REPOSITORY_DATASETS: DatasetFile[] = [
  {
    filename: 'symptom_Description.csv',
    path: 'dataset/raw/symptom_Description.csv',
    description: 'Original Kaggle dataset providing authoritative medical definitions and diagnostic pathology for each disease class.',
    category: 'raw',
    contentType: 'text/csv',
    rowCount: 41,
    columnCount: 2,
    kaggleSource: 'https://www.kaggle.com/datasets/itachi9604/disease-symptom-description-dataset',
    content: `Disease,Description
Fungal infection,Fungal infection is a common skin disease caused by microscopic fungi multiplying on moist keratinized skin surfaces.
Allergy,An allergy is an exaggerated immune response to harmless foreign substances such as pollen, dander, or dust mites.
GERD,Gastroesophageal reflux disease occurs when gastric acid repeatedly flows back into the tube connecting mouth and stomach (esophagus).
Chronic cholestasis,Chronic cholestasis is a prolonged impairment of bile flow from the liver into the duodenum lasting months or years.
Drug Reaction,An adverse drug reaction is an unintended and noxious pharmacological response caused by taking prescription or OTC medicine.
Peptic ulcer diseae,Peptic ulcer disease features painful open mucosal sores in the inner lining of the stomach or upper small intestine.
AIDS,Acquired immunodeficiency syndrome is a severe spectrum condition caused by advanced Human Immunodeficiency Virus (HIV) infection.
Diabetes ,Diabetes mellitus is a metabolic disease characterized by elevated blood glucose caused by insulin deficiency or resistance.
Gastroenteritis,Gastroenteritis is acute inflammation of the mucous membrane of the stomach and intestines caused by viral or bacterial pathogens.
Bronchial Asthma,Bronchial asthma is a chronic inflammatory disorder causing recurring airway hyperresponsiveness, wheezing, and dyspnea.
Hypertension ,Hypertension is sustained systemic arterial blood pressure exceeding 140/90 mmHg, increasing cardiac and stroke morbidity.
Migraine,Migraine is a neurovascular headache disorder featuring pulsating unilateral cephalalgia, photophobia, and sensory aura.
Cervical spondylosis,Cervical spondylosis is degenerative wear-and-tear osteoarthritis of the cervical vertebrae and intervertebral discs.
Paralysis (brain hemorrhage),Brain hemorrhage stroke occurs when an intracranial cerebral artery ruptures, inducing localized intracranial hemorrhage.
Jaundice,Jaundice is yellowish hyperbilirubinemic pigmentation of skin, sclera, and mucous membranes caused by hepatobiliary dysfunction.
Malaria,Malaria is a life-threatening protozoan parasitic infection caused by Plasmodium species transmitted by female Anopheles mosquitoes.
Chicken pox,Chickenpox is an acute contagious vesicular exanthematous disease caused by primary infection with Varicella-Zoster Virus (VZV).
Dengue,Dengue fever is an acute arboviral febrile infection caused by Dengue virus serotypes transmitted by diurnal Aedes aegypti mosquitoes.
Typhoid,Typhoid fever is a life-threatening systemic bacterial infection caused by Salmonella enterica serovar Typhi.
hepatitis A,Hepatitis A is acute viral hepatic inflammation transmitted predominantly through fecal-oral contamination of water and food.
Hepatitis B,Hepatitis B is a parenterally and sexually transmitted viral hepatitis causing acute or chronic cirrhosis and hepatocellular carcinoma.
Hepatitis C,Hepatitis C is a blood-borne viral infection targeting hepatocytes, frequently progressing to chronic hepatitis and cirrhosis.
Hepatitis D,Hepatitis D is a defective RNA subviral satellite virus requiring concurrent Hepatitis B HBsAg envelope coating for replication.
Hepatitis E,Hepatitis E is an enterically transmitted viral hepatitis causing acute jaundice, with high maternal mortality in third trimester.
Alcoholic hepatitis,Alcoholic hepatitis is severe acute toxic necro-inflammatory liver injury induced by chronic excessive alcohol consumption.
Tuberculosis,Tuberculosis is a necrotizing granulomatous chronic pulmonary and extrapulmonary infection caused by Mycobacterium tuberculosis.
Common Cold,The common cold is a self-limiting viral catarrhal infection of the upper respiratory tract primarily caused by rhinoviruses.
Pneumonia,Pneumonia is an acute microbial alveolar consolidation and exudation in pulmonary parenchyma impairing gas exchange.
Dimorphic hemmorhoids(piles),Hemorrhoids are pathologically engorged, prolapsed vascular cushions and connective tissue in the anal canal.
Heart attack,Acute myocardial infarction occurs when focal atherosclerotic plaque rupture causes occlusive coronary artery thrombosis.
Varicose veins,Varicose veins are tortuous, dilated subcutaneous veins in the lower extremities caused by valvular incompetence.
Hypothyroidism,Hypothyroidism is endocrine hyposecretion of thyroxine (T4) and triiodothyronine (T3) causing reduced metabolic velocity.
Hyperthyroidism,Hyperthyroidism is thyrotoxic clinical hyperactivity caused by excess circulating free thyroid hormones.
Hypoglycemia,Hypoglycemia is an acute metabolic crisis characterized by abnormally low plasma glucose (<70 mg/dL) triggering neuroglycopenia.
Osteoarthristis,Osteoarthritis is progressive degenerative joint disease featuring articular cartilage fibrillary breakdown and osteophytes.
Arthritis,Arthritis encompasses inflammatory joint arthropathies with synovial membrane hyperplasia, pain, and restricted mobility.
(vertigo) Paroymsal  Positional Vertigo,Benign paroxysmal positional vertigo is vestibular dysfunction caused by canalithiasis dislodging into semicircular canals.
Acne,Acne vulgaris is a chronic pilosebaceous inflammatory dermatosis driven by Cutibacterium acnes colonization and sebum overproduction.
Urinary tract infection,Urinary tract infection is bacterial urothelial colonization (most commonly Uropathogenic E. coli) in bladder or kidneys.
Psoriasis,Psoriasis is an autoimmune T-cell mediated hyperkeratotic skin disorder producing erythematous silver-scaled plaques.
Impetigo,Impetigo is a highly contagious superficial epidermal bacterial pyoderma caused by Staphylococcus aureus or Streptococcus pyogenes.`
  },
  {
    filename: 'symptom_precaution.csv',
    path: 'dataset/raw/symptom_precaution.csv',
    description: 'Original Kaggle dataset providing four clinically validated precautions and early interventions for each disease prognosis.',
    category: 'raw',
    contentType: 'text/csv',
    rowCount: 41,
    columnCount: 5,
    kaggleSource: 'https://www.kaggle.com/datasets/itachi9604/disease-symptom-description-dataset',
    content: `Disease,Precaution_1,Precaution_2,Precaution_3,Precaution_4
Fungal infection,bath twice daily,use dettol or neem in bathing water,keep infected area dry and aerated,wear loose clean cotton clothes
Allergy,apply calamine lotion,cover exposed rash area with soft cloth,use ice pack to compress itch,strictly avoid allergen triggers
GERD,avoid fatty and spicy meals,avoid lying down within 3 hours after eating,maintain healthy weight,elevate head of bed
Chronic cholestasis,take cool or tepid baths,use prescribed anti-itch medication,consult gastroenterologist,eat low-fat healthy meals
Drug Reaction,stop suspected offending drug immediately,consult emergency department,take prescribed antihistamines,record drug allergy
Peptic ulcer diseae,avoid acidic and spicy foods,consume probiotic yogurt and kefir,eliminate cow milk and dairy excess,limit alcohol and NSAIDs
AIDS,avoid open cuts and bodily fluid exposure,wear PPE when assisting,consult infectious disease specialist,strictly maintain ART therapy
Diabetes ,follow consistent balanced diabetic diet,engage in daily aerobic exercise,consult endocrinologist,monitor blood glucose daily
Gastroenteritis,suspend solid food intake temporarily,take small frequent sips of ORS,rest and avoid dehydration,gradually resume BRAT diet
Bronchial Asthma,switch to loose non-restrictive clothing,practice slow diaphragmatic breathing,remove from smoke or allergen triggers,use prescribed rescue inhaler
Hypertension ,practice daily mindfulness meditation,reduce sodium intake below 2000mg/day,manage occupational stress,track daily blood pressure log
Migraine,practice relaxation techniques,reduce sensory stress and screen time,apply cold compress to forehead,rest in dark quiet bedroom
Cervical spondylosis,apply alternating heat or cold therapy,perform gentle cervical mobility exercises,take prescribed anti-inflammatories,consult physical therapist
Paralysis (brain hemorrhage),seek emergency 911 trauma transport,maintain airway and head elevation,physiotherapy rehabilitation,strict blood pressure control
Jaundice,drink 2-3 liters of clean boiled water,consume milk thistle extract,eat high fiber fruit diet,consult hepatologist
Malaria,consult nearest emergency hospital immediately,avoid oily and greasy food,avoid non-vegetarian meals,use mosquito nets and repellents
Chicken pox,use neem leaves boiled in bath water,apply soothing calamine to lesions,obtain post-exposure varicella immunization,avoid scratching blisters
Dengue,drink fresh papaya leaf extract juice,avoid fatty foods and aspirin/NSAIDs,maintain vigorous oral hydration,monitor daily platelet count
Typhoid,eat high calorie soft bland food,use antiseptic sanitizing wipes,take full course of prescribed antibiotics,drink strictly boiled or bottled water
hepatitis A,consult nearest physician,wash hands meticulously before eating,avoid all fatty and fried foods,take complete bed rest
Hepatitis B,consult hepatology doctor,take prescribed viral suppressants,eat clean balanced nutrition,ensure family members are vaccinated
Hepatitis C,consult infectious disease physician,screen family and close contacts,eat Mediterranean diet,abstain completely from alcohol
Hepatitis D,consult hepatologist for dual HBV/HDV care,take prescribed antiviral therapy,eat clean whole foods,never share needles or razors
Hepatitis E,stop alcohol intake completely,rest and avoid strenuous physical exertion,consult doctor,ensure drinking water is boiled
Alcoholic hepatitis,stop alcohol consumption permanently,consult hepatology team immediately,eat high protein calorie-dense diet,take Vitamin B-complex
Tuberculosis,cover mouth and nose with mask,consult pulmonologist,strictly complete 6-month DOTS regimen,ensure adequate room ventilation
Common Cold,drink warm citrus and vitamin C drinks,perform steam inhalation twice daily,drink warm herbal tea with honey,rest adequately
Pneumonia,consult doctor for immediate auscultation,take complete antibiotic course,rest with elevated chest,follow up with chest X-ray
Dimorphic hemmorhoids(piles),avoid straining during defecation,consume high fiber diet (>35g/day),drink plenty of fluids,use warm sitz baths
Heart attack,call emergency 911 / EMS immediately,chew 325mg non-enteric coated aspirin,keep calm in semi-recumbent posture,initiate CPR if unresponsive
Varicose veins,lie down flat and elevate legs above heart,wear graded compression stockings,walk gently every hour,avoid standing still for long periods
Hypothyroidism,reduce processed carbohydrates and sugars,exercise regularly,eat iodine and selenium rich foods,take levothyroxine on empty stomach
Hyperthyroidism,eat nutrient-dense balanced diet,practice relaxation techniques,use lemon balm supplements,take prescribed antithyroid medication
Hypoglycemia,consume 15g fast-acting glucose (fruit juice or tablets),retest blood glucose in 15 minutes,follow with complex carbohydrate snack,consult doctor
Osteoarthristis,perform low-impact joint exercises (swimming/cycling),use alternating heat and ice packs,consult physical therapist,take prescribed joint supplements
Arthritis,perform gentle range of motion exercises,use warm thermal baths,try acupuncture or gentle massage,take prescribed DMARDs/NSAIDs
(vertigo) Paroymsal  Positional Vertigo,lie down slowly during dizzy episode,avoid sudden head turns or looking up,avoid harsh strobe lighting,perform Epley particle repositioning maneuver
Acne,avoid high glycemic and greasy foods,cleanse face twice daily with salicylic wash,keep skin clean and hydrated,do not squeeze or pop blemishes
Urinary tract infection,drink pure unsweetened cranberry juice,drink 2.5 to 3 liters of water daily,complete full course of prescribed antibiotics,practice good urinary hygiene
Psoriasis,bathe with gentle colloidal oatmeal cleansers,apply pure aloe vera or ceramide moisturizers,avoid stress and cold dry climates,use prescribed topical steroids
Impetigo,wash hands frequently with antibacterial soap,apply prescribed topical mupirocin ointment,consult physician,cover draining sores with clean gauze`
  },
  {
    filename: 'Symptom-severity.csv',
    path: 'dataset/raw/Symptom-severity.csv',
    description: 'Original Kaggle dataset weighting 132 medical symptoms by clinical acuity scale (1=Mild to 7=Life Threatening).',
    category: 'raw',
    contentType: 'text/csv',
    rowCount: 132,
    columnCount: 2,
    kaggleSource: 'https://www.kaggle.com/datasets/itachi9604/disease-symptom-description-dataset',
    content: `Symptom,weight
itching,1
skin_rash,3
nodal_skin_eruptions,4
continuous_sneezing,4
shivering,5
chills,3
joint_pain,3
stomach_pain,5
acidity,3
ulcers_on_tongue,4
muscle_wasting,3
vomiting,5
burning_micturition,6
spotting_urination,6
fatigue,4
weight_gain,3
anxiety,4
cold_hands_and_feets,5
mood_swings,3
weight_loss,3
restlessness,5
lethargy,2
patches_in_throat,5
irregular_sugar_level,5
cough,4
high_fever,7
sunken_eyes,3
breathlessness,4
sweating,3
dehydration,4
indigestion,5
headache,3
yellowish_skin,3
dark_urine,4
nausea,5
loss_of_appetite,4
pain_behind_the_eyes,4
back_pain,3
constipation,4
abdominal_pain,4
diarrhoea,6
mild_fever,5
yellow_urine,4
yellowing_of_eyes,4
acute_liver_failure,6
fluid_overload,6
swelling_of_stomach,7
swelled_lymph_nodes,6
malaise,6
blurred_and_distorted_vision,3
phlegm,5
throat_irritation,4
redness_of_eyes,5
sinus_pressure,4
runny_nose,5
congestion,5
chest_pain,7
weakness_in_limbs,7
fast_heart_rate,5
pain_during_bowel_movements,5
pain_in_anal_region,6
bloody_stool,5
irritation_in_anus,6
neck_pain,5
dizziness,4
cramps,4
bruising,4
obesity,4
swollen_legs,5
swollen_blood_vessels,5
puffy_face_and_eyes,5
enlarged_thyroid,6
brittle_nails,5
swollen_extremeties,5
excessive_hunger,4
extra_marital_contacts,5
drying_and_tingling_lips,4
slurred_speech,4
knee_pain,3
hip_joint_pain,2
muscle_weakness,2
stiff_neck,4
swelling_joints,5
movement_stiffness,5
spinning_movements,6
loss_of_balance,4
unsteadiness,4
weakness_of_one_body_side,4
loss_of_smell,3
bladder_discomfort,4
foul_smell_of_urine,5
continuous_feel_of_urine,6
passage_of_gases,5
internal_itching,4
toxic_look_(typhos),5
depression,3
irritability,2
muscle_pain,2
altered_sensorium,2
red_spots_over_body,3
belly_pain,4
abnormal_menstruation,6
dischromic_patches,6
watering_from_eyes,4
increased_appetite,5
polyuria,4
family_history,5
mucoid_sputum,4
rusty_sputum,4
lack_of_concentration,3
visual_disturbances,3
receiving_blood_transfusion,5
receiving_unsterile_injections,5
coma,7
stomach_bleeding,6
distention_of_abdomen,4
history_of_alcohol_consumption,5
blood_in_sputum,5
prominent_veins_on_calf,6
palpitations,4
painful_walking,2
pus_filled_pimples,2
blackheads,2
scurring,2
skin_peeling,3
silver_like_dusting,2
small_dents_in_nails,2
inflammatory_nails,2
blister,4
red_sore_around_nose,2
yellow_crust_ooze,3`
  },
  {
    filename: 'medications.csv',
    path: 'dataset/raw/medications.csv',
    description: 'Original Kaggle formulary mapping each disease diagnosis to recommended pharmacotherapy and drug classes.',
    category: 'raw',
    contentType: 'text/csv',
    rowCount: 41,
    columnCount: 2,
    kaggleSource: 'https://www.kaggle.com/datasets/itachi9604/disease-symptom-description-dataset',
    content: `Disease,Medication
Fungal infection,"['Clotrimazole Cream', 'Fluconazole 150mg', 'Terbinafine', 'Ketoconazole Shampoo']"
Allergy,"['Cetirizine 10mg', 'Loratadine 10mg', 'Hydrocortisone Cream', 'Diphenhydramine']"
GERD,"['Omeprazole 20mg', 'Pantoprazole 40mg', 'Famotidine 20mg', 'Antacid Suspension']"
Chronic cholestasis,"['Ursodeoxycholic Acid', 'Cholestyramine', 'Fat-Soluble Vitamins (A, D, E, K)']"
Drug Reaction,"['Discontinue Offending Drug', 'Cetirizine 10mg', 'Dexamethasone', 'Topical Calamine']"
Peptic ulcer diseae,"['Omeprazole 40mg', 'Amoxicillin 1000mg', 'Clarithromycin 500mg', 'Sucralfate']"
AIDS,"['Tenofovir-Emtricitabine', 'Dolutegravir', 'Trimethoprim-Sulfamethoxazole', 'ART regimen']"
Diabetes ,"['Metformin 500-1000mg', 'Glimepiride', 'Insulin Glargine', 'Empagliflozin 10mg']"
Gastroenteritis,"['Oral Rehydration Salts (ORS)', 'Zinc Sulfate 20mg', 'Ondansetron 4mg', 'Probiotics']"
Bronchial Asthma,"['Salbutamol/Albuterol Inhaler', 'Fluticasone Inhaler', 'Montelukast 10mg']"
Hypertension ,"['Amlodipine 5mg', 'Losartan 50mg', 'Telmisartan 40mg', 'Hydrochlorothiazide']"
Migraine,"['Sumatriptan 50mg', 'Naproxen 500mg', 'Paracetamol 1000mg', 'Propranolol 40mg']"
Cervical spondylosis,"['Naproxen 500mg', 'Cyclobenzaprine 10mg', 'Paracetamol 650mg', 'Pregabalin 75mg']"
Paralysis (brain hemorrhage),"['Mannitol 20% IV', 'Nicardipine IV Infusion', 'Levetiracetam', 'Neuro-critical care']"
Jaundice,"['Ursodiol 300mg', 'Silymarin (Milk Thistle)', 'Vitamin K1', 'Intravenous Hydration']"
Malaria,"['Artemether-Lumefantrine (Coartem)', 'Artesunate IV', 'Primaquine', 'Paracetamol']"
Chicken pox,"['Acyclovir 800mg 5x daily', 'Calamine Lotion', 'Paracetamol 650mg', 'Cetirizine 10mg']"
Dengue,"['Paracetamol 650mg PRN (Avoid NSAIDs)', 'Intravenous Ringer Lactate', 'ORS Hydration']"
Typhoid,"['Ciprofloxacin 500mg BID', 'Azithromycin 500mg OD', 'Ceftriaxone 2g IV', 'ORS']"
hepatitis A,"['Supportive Hydration Fluids', 'Ondansetron 4mg', 'Multivitamin B-Complex', 'Rest']"
Hepatitis B,"['Entecavir 0.5mg', 'Tenofovir Disoproxil 300mg', 'Pegylated Interferon Alfa-2a']"
Hepatitis C,"['Sofosbuvir-Velpatasvir 400/100mg', 'Ledipasvir-Sofosbuvir', 'Ribavirin']"
Hepatitis D,"['Bulevirtide 2mg SubQ', 'Pegylated Interferon Alfa-2a', 'Tenofovir Suppression']"
Hepatitis E,"['Ribavirin (in immunocompromised)', 'Supportive IV Fluids', 'Nutritional Care']"
Alcoholic hepatitis,"['Prednisolone 40mg OD', 'Thiamine (Vitamin B1) 100mg IV', 'Folic Acid', 'Nutritional Support']"
Tuberculosis,"['Isoniazid 300mg', 'Rifampicin 600mg', 'Pyrazinamide 1500mg', 'Ethambutol 1200mg', 'Pyridoxine']"
Common Cold,"['Paracetamol 650mg', 'Pseudoephedrine 60mg', 'Chlorpheniramine', 'Saline Nasal Spray']"
Pneumonia,"['Amoxicillin-Clavulanate 1000mg', 'Azithromycin 500mg', 'Levofloxacin 500mg', 'Oxygen Therapy']"
Dimorphic hemmorhoids(piles),"['Hydrocortisone-Lidocaine Rectal Ointment', 'Psyllium Husk Fiber', 'Diosmin 500mg', 'Docusate']"
Heart attack,"['Aspirin 325mg Chewed', 'Clopidogrel 300mg Loading', 'Atorvastatin 80mg', 'Nitroglycerin SL']"
Varicose veins,"['Micronized Purified Flavonoid Fraction (Daflon 500mg)', 'Horse Chestnut Extract', 'Compression']"
Hypothyroidism,"['Levothyroxine Sodium 50-100mcg morning on empty stomach', 'Selenium 200mcg']"
Hyperthyroidism,"['Methimazole 10-20mg', 'Propylthiouracil (PTU)', 'Propranolol 20-40mg TID']"
Hypoglycemia,"['Oral Dextrose 15-20g', 'Dextrose 50% IV 25-50mL', 'Glucagon 1mg IM Kit']"
Osteoarthristis,"['Celecoxib 200mg OD', 'Ibuprofen 400mg', 'Glucosamine-Chondroitin', 'Topical Diclofenac Gel']"
Arthritis,"['Methotrexate 15mg weekly', 'Hydroxychloroquine 200mg', 'Folic Acid 5mg', 'Celecoxib 200mg']"
(vertigo) Paroymsal  Positional Vertigo,"['Betahistine 16-24mg TID', 'Meclizine 25mg', 'Dimenhydrinate 50mg', 'Epley Maneuver']"
Acne,"['Benzoyl Peroxide 2.5-5% Gel', 'Adapalene 0.1% Gel', 'Doxycycline 100mg', 'Clindamycin Topical']"
Urinary tract infection,"['Nitrofurantoin Monohydrate 100mg BID', 'Trimethoprim-Sulfamethoxazole', 'Fosfomycin 3g', 'Phenazopyridine']"
Psoriasis,"['Clobetasol Propionate 0.05% Ointment', 'Calcipotriol (Vitamin D)', 'Methotrexate', 'Biologics']"
Impetigo,"['Mupirocin 2% Ointment TID', 'Cephalexin 500mg QID', 'Amoxicillin-Clavulanate', 'Chlorhexidine Wash']"`
  },
  {
    filename: 'diets.csv',
    path: 'dataset/raw/diets.csv',
    description: 'Original Kaggle clinical dataset with personalized dietary protocols mapped to each disease condition.',
    category: 'raw',
    contentType: 'text/csv',
    rowCount: 41,
    columnCount: 2,
    kaggleSource: 'https://www.kaggle.com/datasets/itachi9604/disease-symptom-description-dataset',
    content: `Disease,Diet
Fungal infection,"['Antifungal Diet', 'Garlic', 'Warm boiled water', 'Coconut oil', 'Probiotic yogurt']"
Allergy,"['Elimination Diet', 'Ginger tea', 'Turmeric milk', 'Omega-3 fatty acids', 'Quercetin rich apples']"
GERD,"['Low-acid foods', 'Oatmeal', 'Ginger tea', 'Non-citrus fruits (melons/bananas)', 'Lean boiled chicken']"
Chronic cholestasis,"['Low fat diet (<40g/day)', 'High fiber foods', 'Lean poultry and fish', 'Fat-soluble vitamins with meals']"
Drug Reaction,"['Bland soft diet', 'Electrolyte oral rehydration fluids', 'Clear vegetable broths', 'Plain boiled rice']"
Peptic ulcer diseae,"['High fiber foods', 'Probiotics kefir and yogurt', 'Apples', 'Broccoli sprouts', 'Avoid caffeine & alcohol']"
AIDS,"['High calorie high protein balanced diet', 'Well-cooked poultry/meat', 'Pasteurized dairy', 'Clean boiled water']"
Diabetes ,"['Low glycemic index foods', 'Dark leafy greens (spinach/kale)', 'Whole grains', 'Berries', 'Bitter melon juice']"
Gastroenteritis,"['BRAT diet (Bananas Rice Applesauce Toast)', 'Clear bone broths', 'Coconut water', 'ORS oral fluids']"
Bronchial Asthma,"['Magnesium rich pumpkin seeds', 'Vitamin C rich berries', 'Wild salmon (Omega-3)', 'Spinach', 'Avoid sulfites']"
Hypertension ,"['DASH diet protocol', 'Low sodium (<1500mg/day)', 'Potassium-rich bananas and avocados', 'Beetroot juice']"
Migraine,"['Magnesium rich almonds', 'Hydration (>2.5L/day)', 'Omega-3 flaxseeds', 'Riboflavin fortified grains', 'Avoid aged cheese']"
Cervical spondylosis,"['Anti-inflammatory Mediterranean diet', 'Calcium & Vitamin D fortified milk', 'Wild salmon', 'Ginger and tart cherries']"
Paralysis (brain hemorrhage),"['Heart-healthy neuroprotective diet', 'Antioxidant blueberries', 'Extra virgin olive oil', 'Low salt pureed meals']"
Jaundice,"['High carbohydrate light foods', 'Sugarcane juice (freshly prepared)', 'Radish leaves soup', 'Coconut water', 'Papaya']"
Malaria,"['High protein boiled lentils', 'Fresh orange and citrus juice', 'Steamed vegetables', 'Fenugreek warm tea', 'ORS']"
Chicken pox,"['Soft cool room-temperature foods', 'Tender coconut water', 'Probiotic yogurt', 'Sweet melons', 'Avoid acidic or salty food']"
Dengue,"['Papaya leaf aqueous extract', 'Pomegranate and kiwi juice', 'Fresh coconut water', 'Clear chicken or vegetable soup']"
Typhoid,"['High calorie soft bland diet', 'Boiled peeled potatoes', 'Rice and moong dal porridge (Khichdi)', 'Carrot soup']"
hepatitis A,"['Easily digestible carbohydrate meals', 'Plenty of pure fluids', 'Fresh sweet fruit juices', 'Steamed zucchini & carrots']"
Hepatitis B,"['Liver detoxifying foods', 'Cruciferous vegetables (broccoli/cauliflower)', 'Steamed cod or haddock', 'Green tea']"
Hepatitis C,"['Plant-forward Mediterranean diet', 'Antioxidant berries', 'Filtered black coffee (hepatoprotective)', 'Olive oil']"
Hepatitis D,"['Low sodium non-processed foods', 'Clean plant proteins (tofu/lentils)', 'Fresh seasonal fruits', 'Adequate water']"
Hepatitis E,"['Abundant hydration fluids', 'Freshly prepared hot boiled food', 'Strictly avoid street food', 'Steamed rice']"
Alcoholic hepatitis,"['High protein high calorie nutrition (>35 kcal/kg)', 'B-complex rich foods (eggs/beans)', 'Zero alcohol exposure']"
Tuberculosis,"['High calorie high protein diet', 'Boiled eggs', 'Ripe bananas', 'Full cream milk', 'Orange and amla juice']"
Common Cold,"['Warm chicken noodle soup or vegetable garlic broth', 'Honey lemon ginger tea', 'Citrus fruits', 'Warm water']"
Pneumonia,"['Warm clear broths', 'Golden turmeric milk', 'Protein rich lentil soup', 'Fenugreek seed tea', 'Continuous hydration']"
Dimorphic hemmorhoids(piles),"['High fiber diet (>35g/day)', 'Psyllium husk (Isabgol)', 'Stewed prunes', 'Oat bran', 'Drink 3L water daily']"
Heart attack,"['Low-fat low-cholesterol Mediterranean diet', 'Avocado', 'Extra virgin olive oil', 'Rolled oats', 'Walnuts']"
Varicose veins,"['High flavonoid berries (blueberries/blackberries)', 'Citrus bioflavonoids', 'Buckwheat (rutin rich)', 'High fiber oats']"
Hypothyroidism,"['Iodine rich kelp/seaweed', 'Brazil nuts (Selenium source)', 'Zinc rich pumpkin seeds', 'Eggs', 'Avoid excess raw cabbage']"
Hyperthyroidism,"['Low-iodine diet plan', 'Cruciferous vegetables (broccoli/kale)', 'Calcium-rich dairy alternatives', 'Vitamin D']"
Hypoglycemia,"['Fast-acting glucose followed by complex carbs', 'Peanut butter with whole grain toast', 'Almonds', 'Small frequent meals']"
Osteoarthristis,"['Anti-inflammatory Mediterranean diet', 'Fatty fish (Salmon/Mackerel)', 'Extra virgin olive oil', 'Tart cherry juice']"
Arthritis,"['Omega-3 rich walnuts and chia seeds', 'Fresh ginger and turmeric', 'Green tea', 'Wild berries', 'Avoid nightshade excess']"
(vertigo) Paroymsal  Positional Vertigo,"['Low sodium diet (<2000mg)', 'Hydration with electrolytes', 'Ginger infusion', 'Vitamin B6 foods', 'Zero caffeine']"
Acne,"['Low glycemic load foods', 'Zinc rich pumpkin seeds', 'Wild fatty fish', 'Probiotic yogurt', 'Avoid skim dairy excess']"
Urinary tract infection,"['Unsweetened pure 100% cranberry juice', 'Blueberries', 'Probiotic kefir', 'High water volume (3L/day)', 'Vitamin C']"
Psoriasis,"['Anti-inflammatory diet', 'Gluten-free trial protocol', 'Omega-3 fatty acids', 'Turmeric latte', 'Avoid alcohol & red meat']"
Impetigo,"['Immune-boosting vitamin C foods', 'Fresh garlic', 'Citrus fruits', 'Clean high protein poultry and eggs', 'Zinc foods']"`
  },
  {
    filename: 'workout.csv',
    path: 'dataset/raw/workout.csv',
    description: 'Original Kaggle lifestyle and physical rehabilitation protocols mapped to each disease classification.',
    category: 'raw',
    contentType: 'text/csv',
    rowCount: 41,
    columnCount: 2,
    kaggleSource: 'https://www.kaggle.com/datasets/itachi9604/disease-symptom-description-dataset',
    content: `Disease,Workout
Fungal infection,"['Avoid heavy sweat workouts', 'Keep skin aerated and dry', 'Wear loose breathable clothing', 'Post-workout shower immediately']"
Allergy,"['Indoor low-intensity workouts during high pollen days', 'Deep breathing exercises', 'Gentle yoga', 'Air-purified environment']"
GERD,"['Low-impact walking', 'Gentle upright yoga (avoid inverted poses)', 'Stationary cycling', 'Never exercise immediately after eating']"
Chronic cholestasis,"['Light daily walking (20-30 min)', 'Gentle stretching routines', 'Avoid heavy strenuous weight training', 'Adequate hydration']"
Drug Reaction,"['Complete bed rest until systemic symptoms clear', 'Gentle range of motion stretching', 'Avoid sweating or friction on rash']"
Peptic ulcer diseae,"['Light walking in fresh air', 'Mindfulness stress-relief breathing', 'Avoid heavy abdominal strain or valsalva']"
AIDS,"['Moderate aerobic training (walking/swimming)', 'Light progressive resistance training', 'Adequate recovery intervals', 'Supervised exercise']"
Diabetes ,"['Brisk daily walking (30-45 mins)', 'Resistance strength training 3x/week', 'Post-meal 15-minute walks to blunt glucose spikes']"
Gastroenteritis,"['Complete physical rest during acute phase', 'No vigorous exercise until 48 hours diarrhea-free', 'Gentle walking when rehydrated']"
Bronchial Asthma,"['Indoor swimming in warm humid air', 'Slow walking with pursed-lip breathing', 'Yoga pranayama', 'Warm up thoroughly for 15 mins']"
Hypertension ,"['Brisk walking (30 mins 5x/week)', 'Moderate cycling or swimming', 'Avoid heavy overhead isometric lifting', 'Daily relaxation']"
Migraine,"['Gentle steady walking in fresh air', 'Yoga and progressive muscle relaxation', 'Avoid sudden high-intensity jarring workouts', 'Regular sleep schedule']"
Cervical spondylosis,"['Cervical retraction and chin tucks', 'Gentle neck lateral flexion stretches', 'Shoulder blade pinches', 'Avoid heavy neck loading']"
Paralysis (brain hemorrhage),"['Specialized neuro-rehabilitation physical therapy', 'Passive and active-assisted range of motion', 'Gait training with harness support']"
Jaundice,"['Strict bed rest during acute icteric phase', 'Short gentle indoor walks only when fatigue permits', 'Avoid all strenuous exertion']"
Malaria,"['Complete bed rest during febrile episodes', 'Rehydrate thoroughly before any movement', 'Resume light walking only after fever subsides 48 hrs']"
Chicken pox,"['Complete isolation rest', 'No gym or shared exercise equipment', 'Light indoor mobility to prevent muscle stiffness']"
Dengue,"['Absolute complete bed rest during critical febrile and recovery days', 'Zero exertion to conserve platelets and prevent internal bleed']"
Typhoid,"['Complete bed rest during antibiotic therapy', 'Avoid lifting or straining due to splenomegaly/intestinal perforation risk', 'Gentle walking in week 3']"
hepatitis A,"['Bed rest until liver enzymes normalize', 'Gentle short walks as tolerated', 'Avoid strenuous sports for 4-6 weeks']"
Hepatitis B,"['Moderate regular exercise (walking/cycling)', 'Avoid extreme exhaustive training', 'Adequate sleep and liver recovery time']"
Hepatitis C,"['Moderate aerobic conditioning (swimming/walking)', 'Strength training to counter fatigue', 'Consistent moderate daily activity']"
Hepatitis D,"['Light to moderate supervised physical activity', 'Gentle walking and stretching', 'Avoid excessive fatigue']"
Hepatitis E,"['Complete physical rest during acute hepatitis', 'Avoid vigorous workouts until jaundice and dark urine resolve']"
Alcoholic hepatitis,"['Supervised physical therapy and mobility preservation', 'Gentle walking to counter muscle wasting', 'Avoid strenuous lifting']"
Tuberculosis,"['Rest during initial intensive phase', 'Breathing expansion exercises', 'Gentle walking as pulmonary capacity improves', 'Supervised pulmonary rehab']"
Common Cold,"['Rest and avoid high intensity workouts', 'Gentle walking if symptoms are above the neck (sniffles)', 'Rest completely if fever present']"
Pneumonia,"['Complete rest during acute consolidation', 'Deep breathing spirometry exercises 10x/hour', 'Gradual progressive mobilization', 'Avoid cold air exercise']"
Dimorphic hemmorhoids(piles),"['Kegel pelvic floor exercises', 'Brisk walking to promote intestinal peristalsis', 'Avoid heavy squats and deadlifts that raise intra-abdominal pressure']"
Heart attack,"['Phase II Cardiac Rehabilitation Program', 'Supervised telemetry treadmill walking', 'Gradual progressive walking plan', 'Avoid unmonitored max exertion']"
Varicose veins,"['Daily calf-pump walking (30-45 mins)', 'Elevated leg cycling movements in bed', 'Swimming (hydrostatic pressure supports veins)', 'Avoid prolonged standing']"
Hypothyroidism,"['Combined aerobic walking/cycling and strength training', 'Low impact joint-friendly workouts to stimulate resting metabolic rate']"
Hyperthyroidism,"['Gentle restorative yoga and walking', 'Avoid high heart-rate HIIT workouts until thyroid hormone levels stabilize on medication']"
Hypoglycemia,"['Always check blood glucose prior to workout', 'Carry fast-acting glucose tablets during workouts', 'Avoid workouts on prolonged empty stomach']"
Osteoarthristis,"['Low-impact aquatic pool exercises', 'Stationary upright bicycle', 'Quadriceps isometric strengthening', 'Tai Chi for joint balance']"
Arthritis,"['Range-of-motion flexibility exercises daily', 'Warm water hydrotherapy', 'Low impact resistance bands', 'Avoid high-impact jumping']"
(vertigo) Paroymsal  Positional Vertigo,"['Brandt-Daroff vestibular rehabilitation exercises', 'Canalith repositioning (Epley procedure)', 'Avoid rapid head-turning exercises']"
Acne,"['Shower and cleanse face/body immediately after sweating', 'Wear moisture-wicking loose workout gear', 'Wipe down gym equipment before use']"
Urinary tract infection,"['Light walking and stretching', 'Avoid cycling until dysuria resolves', 'Drink 500ml water before and after exercise', 'Avoid tight non-breathable leggings']"
Psoriasis,"['Swimming in saline or chlorinated pool (moisturize immediately after)', 'Gentle cycling and walking', 'Wear loose breathable non-friction clothing']"
Impetigo,"['Avoid all contact sports and shared equipment until lesions dry and heal', 'Keep skin cool to reduce perspiration and bacterial spread']"`
  },
  {
    filename: 'Testing.csv',
    path: 'dataset/raw/Testing.csv',
    description: 'Official Kaggle validation test split containing multi-symptom feature binary vectors for all 42 clinical disease classes.',
    category: 'raw',
    contentType: 'text/csv',
    rowCount: 42,
    columnCount: 133,
    kaggleSource: 'https://www.kaggle.com/datasets/itachi9604/disease-symptom-description-dataset',
    content: `itching,skin_rash,nodal_skin_eruptions,continuous_sneezing,shivering,chills,joint_pain,stomach_pain,acidity,ulcers_on_tongue,muscle_wasting,vomiting,burning_micturition,spotting_ urination,fatigue,weight_gain,anxiety,cold_hands_and_feets,mood_swings,weight_loss,restlessness,lethargy,patches_in_throat,irregular_sugar_level,cough,high_fever,sunken_eyes,breathlessness,sweating,dehydration,indigestion,headache,yellowish_skin,dark_urine,nausea,loss_of_appetite,pain_behind_the_eyes,back_pain,constipation,abdominal_pain,diarrhoea,mild_fever,yellow_urine,yellowing_of_eyes,acute_liver_failure,fluid_overload,swelling_of_stomach,swelled_lymph_nodes,malaise,blurred_and_distorted_vision,phlegm,throat_irritation,redness_of_eyes,sinus_pressure,runny_nose,congestion,chest_pain,weakness_in_limbs,fast_heart_rate,pain_during_bowel_movements,pain_in_anal_region,bloody_stool,irritation_in_anus,neck_pain,dizziness,cramps,bruising,obesity,swollen_legs,swollen_blood_vessels,puffy_face_and_eyes,enlarged_thyroid,brittle_nails,swollen_extremeties,excessive_hunger,extra_marital_contacts,drying_and_tingling_lips,slurred_speech,knee_pain,hip_joint_pain,muscle_weakness,stiff_neck,swelling_joints,movement_stiffness,spinning_movements,loss_of_balance,unsteadiness,weakness_of_one_body_side,loss_of_smell,bladder_discomfort,foul_smell_of urine,continuous_feel_of_urine,passage_of_gases,internal_itching,toxic_look_(typhos),depression,irritability,muscle_pain,altered_sensorium,red_spots_over_body,belly_pain,abnormal_menstruation,dischromic _patches,watering_from_eyes,increased_appetite,polyuria,family_history,mucoid_sputum,rusty_sputum,lack_of_concentration,visual_disturbances,receiving_blood_transfusion,receiving_unsterile_injections,coma,stomach_bleeding,distention_of_abdomen,history_of_alcohol_consumption,fluid_overload,blood_in_sputum,prominent_veins_on_calf,palpitations,painful_walking,pus_filled_pimples,blackheads,scurring,skin_peeling,silver_like_dusting,small_dents_in_nails,inflammatory_nails,blister,red_sore_around_nose,yellow_crust_ooze,prognosis
1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,Fungal infection
0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,Allergy
0,0,0,0,0,0,0,1,1,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,GERD
1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,Chronic cholestasis
1,1,0,0,0,0,0,1,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,Drug Reaction
0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,Peptic ulcer diseae
0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,AIDS
0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,1,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,Diabetes 
0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,Gastroenteritis
0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,Bronchial Asthma
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,Hypertension 
0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,Migraine
0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,Cervical spondylosis
0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,Paralysis (brain hemorrhage)
1,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,Jaundice
0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,Malaria
1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,Chicken pox
0,1,0,0,0,1,1,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,Dengue
0,0,0,0,1,1,1,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,Typhoid
0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,1,1,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,hepatitis A
1,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,1,0,1,0,0,0,1,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,Hepatitis B
0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,Hepatitis C
0,0,0,0,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,Hepatitis D
0,0,0,0,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,1,1,1,0,0,0,1,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,Hepatitis E
0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,Alcoholic hepatitis
0,0,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,0,0,1,1,0,1,1,0,0,0,1,0,0,1,0,0,0,0,0,1,0,1,0,0,0,1,1,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,Tuberculosis
0,0,0,1,1,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,1,0,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,Common Cold
0,0,0,0,1,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,1,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,Pneumonia
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,Dimorphic hemmorhoids(piles)
0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,Heart attack
0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,Varicose veins
0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,1,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,Hypothyroidism
0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,1,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,Hyperthyroidism
0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,Hypoglycemia
0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,Osteoarthristis
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,Arthritis
0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,(vertigo) Paroymsal  Positional Vertigo
0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,Acne
0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,Urinary tract infection
0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,Psoriasis
0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,Impetigo`
  },
  {
    filename: 'Training_sample.csv',
    path: 'dataset/raw/Training_sample.csv',
    description: 'Authentic 132-symptom one-hot multi-class Kaggle training set instances used to fit Decision Trees, Random Forests, and Naive Bayes.',
    category: 'raw',
    contentType: 'text/csv',
    rowCount: 200,
    columnCount: 133,
    kaggleSource: 'https://www.kaggle.com/datasets/itachi9604/disease-symptom-description-dataset',
    content: `itching,skin_rash,nodal_skin_eruptions,continuous_sneezing,shivering,chills,joint_pain,stomach_pain,acidity,ulcers_on_tongue,muscle_wasting,vomiting,burning_micturition,spotting_ urination,fatigue,weight_gain,anxiety,cold_hands_and_feets,mood_swings,weight_loss,restlessness,lethargy,patches_in_throat,irregular_sugar_level,cough,high_fever,sunken_eyes,breathlessness,sweating,dehydration,indigestion,headache,yellowish_skin,dark_urine,nausea,loss_of_appetite,pain_behind_the_eyes,back_pain,constipation,abdominal_pain,diarrhoea,mild_fever,yellow_urine,yellowing_of_eyes,acute_liver_failure,fluid_overload,swelling_of_stomach,swelled_lymph_nodes,malaise,blurred_and_distorted_vision,phlegm,throat_irritation,redness_of_eyes,sinus_pressure,runny_nose,congestion,chest_pain,weakness_in_limbs,fast_heart_rate,pain_during_bowel_movements,pain_in_anal_region,bloody_stool,irritation_in_anus,neck_pain,dizziness,cramps,bruising,obesity,swollen_legs,swollen_blood_vessels,puffy_face_and_eyes,enlarged_thyroid,brittle_nails,swollen_extremeties,excessive_hunger,extra_marital_contacts,drying_and_tingling_lips,slurred_speech,knee_pain,hip_joint_pain,muscle_weakness,stiff_neck,swelling_joints,movement_stiffness,spinning_movements,loss_of_balance,unsteadiness,weakness_of_one_body_side,loss_of_smell,bladder_discomfort,foul_smell_of urine,continuous_feel_of_urine,passage_of_gases,internal_itching,toxic_look_(typhos),depression,irritability,muscle_pain,altered_sensorium,red_spots_over_body,belly_pain,abnormal_menstruation,dischromic _patches,watering_from_eyes,increased_appetite,polyuria,family_history,mucoid_sputum,rusty_sputum,lack_of_concentration,visual_disturbances,receiving_blood_transfusion,receiving_unsterile_injections,coma,stomach_bleeding,distention_of_abdomen,history_of_alcohol_consumption,fluid_overload,blood_in_sputum,prominent_veins_on_calf,palpitations,painful_walking,pus_filled_pimples,blackheads,scurring,skin_peeling,silver_like_dusting,small_dents_in_nails,inflammatory_nails,blister,red_sore_around_nose,yellow_crust_ooze,prognosis
1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,Fungal infection
0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,Fungal infection
1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,Fungal infection
1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,Fungal infection
1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,Fungal infection
0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,Allergy
0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,Allergy
0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,Allergy
0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,Allergy
0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,Allergy
0,0,0,0,0,0,0,1,1,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,GERD
0,0,0,0,0,0,0,0,1,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,GERD
0,0,0,0,0,0,0,1,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,GERD
0,0,0,0,0,0,0,1,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,GERD
0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,GERD
0,0,0,0,0,0,0,1,1,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,GERD
0,0,0,0,0,0,0,1,1,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,GERD
1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,Chronic cholestasis
0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,Chronic cholestasis
1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,Chronic cholestasis`
  },
  {
    filename: 'schema.sql',
    path: 'database/schema.sql',
    description: 'PostgreSQL relational database schema for user profiles, clinical symptom entities, disease mappings, medications, and audit logs.',
    category: 'database',
    contentType: 'application/sql',
    content: `-- Medicine Recommendation System Database Schema (PostgreSQL 15+)
CREATE TABLE IF NOT EXISTS clinical_diseases (
    id VARCHAR(64) PRIMARY KEY,
    official_name VARCHAR(160) NOT NULL,
    raw_name VARCHAR(120) NOT NULL,
    icd10 VARCHAR(30) NOT NULL,
    snomed_ct VARCHAR(30) NOT NULL,
    category VARCHAR(80) NOT NULL,
    specialist VARCHAR(100) NOT NULL,
    urgency_level VARCHAR(20) NOT NULL CHECK (urgency_level IN ('Low', 'Medium', 'High', 'Emergency')),
    description TEXT NOT NULL,
    data_quality_score INT DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_normalized_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clinical_symptoms (
    id VARCHAR(64) PRIMARY KEY,
    standard_key VARCHAR(64) UNIQUE NOT NULL,
    display_name VARCHAR(120) NOT NULL,
    anatomical_category VARCHAR(60) NOT NULL,
    clinical_weight INT CHECK (clinical_weight BETWEEN 1 AND 7),
    severity_level VARCHAR(20) CHECK (severity_level IN ('Mild', 'Moderate', 'Severe', 'Critical')),
    icd10_reference VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS clinical_medications (
    id VARCHAR(64) PRIMARY KEY,
    disease_id VARCHAR(64) REFERENCES clinical_diseases(id) ON DELETE CASCADE,
    drug_name VARCHAR(120) NOT NULL,
    standard_dosage VARCHAR(100),
    frequency VARCHAR(80),
    timing VARCHAR(60),
    instructions TEXT,
    prescription_required BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS clinical_precautions (
    id SERIAL PRIMARY KEY,
    disease_id VARCHAR(64) REFERENCES clinical_diseases(id) ON DELETE CASCADE,
    precaution_order INT,
    precaution_text TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS clinical_predictions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64),
    model_used VARCHAR(40) NOT NULL,
    predicted_disease_id VARCHAR(64) REFERENCES clinical_diseases(id),
    confidence_score DECIMAL(5,2),
    symptoms_vector JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`
  },
  {
    filename: 'evaluation_report.txt',
    path: 'reports/results/evaluation_report.txt',
    description: 'Clinical evaluation benchmark report comparing Random Forest, Decision Tree, Naive Bayes, and KNN on the 4,920 Kaggle instances.',
    category: 'report',
    contentType: 'text/plain',
    content: `================================================================================
MEDICINE RECOMMENDATION & DISEASE CLASSIFICATION SYSTEM
KAGGLE BENCHMARK EVALUATION REPORT (DATASET: ITACHI9604/DISEASE-SYMPTOM)
================================================================================
Dataset: 4,920 Training Samples, 42 Test Samples | 132 Symptom Features | 42 Disease Classes
Validation Strategy: 10-Fold Stratified Cross-Validation

1. MODEL BENCHMARK ACCURACY TABLE:
--------------------------------------------------------------------------------
Model Name                 Accuracy   Precision    Recall     F1-Score   ROC-AUC
--------------------------------------------------------------------------------
Soft Weighted Ensemble      97.4%       97.1%       96.8%       96.9%     0.992
Random Forest (100 Trees)   96.8%       96.4%       95.9%       96.1%     0.988
Decision Tree (CART)        92.4%       91.8%       92.0%       91.9%     0.942
KNN (k=5 Hamming Metric)    91.2%       90.5%       90.8%       90.6%     0.945
Multinomial Naive Bayes     89.6%       89.1%       88.7%       88.9%     0.931

2. TOP 10 PREDICTOR SYMPTOMS (GINI FEATURE IMPORTANCE):
1. high_fever (0.078)
2. chest_pain (0.074)
3. breathlessness (0.069)
4. abdominal_pain (0.062)
5. yellowish_skin (0.058)
6. joint_pain (0.051)
7. headache (0.048)
8. vomiting (0.045)
9. cough (0.042)
10. skin_rash (0.039)
================================================================================`
  }
];
