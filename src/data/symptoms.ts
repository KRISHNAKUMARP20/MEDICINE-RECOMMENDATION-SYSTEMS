import { Symptom } from '../types';

export const SYMPTOMS_DATA: Symptom[] = [
  // General & Systemic
  { id: 'fever', name: 'fever', displayName: 'High Fever', category: 'General', severityWeight: 4, description: 'Body temperature elevated above 100.4°F (38°C)' },
  { id: 'mild_fever', name: 'mild_fever', displayName: 'Low-grade / Mild Fever', category: 'General', severityWeight: 2, description: 'Slightly elevated temperature between 99°F and 100.4°F' },
  { id: 'chills', name: 'chills', displayName: 'Chills & Shivering', category: 'General', severityWeight: 3, description: 'Feeling of coldness with involuntary muscle contractions' },
  { id: 'fatigue', name: 'fatigue', displayName: 'Extreme Fatigue / Malaise', category: 'General', severityWeight: 3, description: 'Persistent state of exhaustion not relieved by rest' },
  { id: 'weakness', name: 'weakness', displayName: 'Generalized Weakness', category: 'General', severityWeight: 3, description: 'Loss of overall physical strength or stamina' },
  { id: 'sweating', name: 'sweating', displayName: 'Profuse Sweating / Diaphoresis', category: 'General', severityWeight: 2, description: 'Excessive sweating unprompted by heat or exertion' },
  { id: 'night_sweats', name: 'night_sweats', displayName: 'Night Sweats', category: 'General', severityWeight: 4, description: 'Repeated episodes of extreme perspiration soaking sleepwear' },
  { id: 'weight_loss', name: 'weight_loss', displayName: 'Unintended Weight Loss', category: 'General', severityWeight: 4, description: 'Noticeable drop in body weight without dieting' },
  { id: 'weight_gain', name: 'weight_gain', displayName: 'Unexplained Weight Gain', category: 'General', severityWeight: 2, description: 'Rapid fluid retention or unexplained body mass increase' },
  { id: 'loss_of_appetite', name: 'loss_of_appetite', displayName: 'Loss of Appetite (Anorexia)', category: 'General', severityWeight: 3, description: 'Lack of desire to eat or early satiety' },
  { id: 'dehydration', name: 'dehydration', displayName: 'Signs of Dehydration', category: 'General', severityWeight: 4, description: 'Dry mouth, sunken eyes, skin turgor loss, dark urine' },

  // Head & Neurological
  { id: 'headache', name: 'headache', displayName: 'Headache', category: 'Head & Neurological', severityWeight: 2, description: 'Dull, throbbing, or aching pain in head or scalp' },
  { id: 'throbbing_headache', name: 'throbbing_headache', displayName: 'One-sided Throbbing Headache', category: 'Head & Neurological', severityWeight: 4, description: 'Intense unilateral pulsating pain characteristic of migraine' },
  { id: 'dizziness', name: 'dizziness', displayName: 'Dizziness & Lightheadedness', category: 'Head & Neurological', severityWeight: 3, description: 'Sensation of feeling faint, woozy, or unsteady' },
  { id: 'vertigo', name: 'vertigo', displayName: 'Spinning Sensation (Vertigo)', category: 'Head & Neurological', severityWeight: 3, description: 'Illusion that you or your surroundings are spinning' },
  { id: 'confusion', name: 'confusion', displayName: 'Mental Confusion / Disorientation', category: 'Head & Neurological', severityWeight: 5, description: 'Altered mental status, inability to think clearly' },
  { id: 'photophobia', name: 'photophobia', displayName: 'Light Sensitivity (Photophobia)', category: 'Head & Neurological', severityWeight: 3, description: 'Discomfort or eye pain in response to bright light' },
  { id: 'stiff_neck', name: 'stiff_neck', displayName: 'Stiff Neck (Nuchal Rigidity)', category: 'Head & Neurological', severityWeight: 5, description: 'Inability to flex neck forward comfortably, meningitis sign' },
  { id: 'tremors', name: 'tremors', displayName: 'Involuntary Tremors', category: 'Head & Neurological', severityWeight: 3, description: 'Rhythmic shaking movements of hands or limbs' },
  { id: 'numbness', name: 'numbness', displayName: 'Numbness or Tingling (Paresthesia)', category: 'Head & Neurological', severityWeight: 3, description: 'Pins-and-needles sensation in hands, feet, or face' },
  { id: 'blurred_vision', name: 'blurred_vision', displayName: 'Blurred or Distorted Vision', category: 'Head & Neurological', severityWeight: 3, description: 'Lack of sharp vision, hazy sight' },
  { id: 'loss_of_smell', name: 'loss_of_smell', displayName: 'Loss of Smell (Anosmia)', category: 'Head & Neurological', severityWeight: 2, description: 'Partial or total reduction in olfactory capability' },

  // Respiratory & ENT
  { id: 'cough', name: 'cough', displayName: 'Persistent Cough', category: 'Respiratory', severityWeight: 2, description: 'Dry or hacking non-productive cough' },
  { id: 'productive_cough', name: 'productive_cough', displayName: 'Productive Cough with Phlegm', category: 'Respiratory', severityWeight: 3, description: 'Cough producing yellow, green, or thick mucus' },
  { id: 'coughing_blood', name: 'coughing_blood', displayName: 'Coughing up Blood (Hemoptysis)', category: 'Respiratory', severityWeight: 5, description: 'Blood-streaked sputum or overt blood expectoration' },
  { id: 'shortness_of_breath', name: 'shortness_of_breath', displayName: 'Shortness of Breath (Dyspnea)', category: 'Respiratory', severityWeight: 4, description: 'Breathlessness, difficulty catching breath, air hunger' },
  { id: 'wheezing', name: 'wheezing', displayName: 'Wheezing & Chest Tightness', category: 'Respiratory', severityWeight: 4, description: 'High-pitched whistling sound during breathing' },
  { id: 'sore_throat', name: 'sore_throat', displayName: 'Sore Throat (Pharyngitis)', category: 'Respiratory', severityWeight: 2, description: 'Pain, scratchiness, or irritation in throat on swallowing' },
  { id: 'runny_nose', name: 'runny_nose', displayName: 'Runny or Stuffy Nose (Rhinorrhea)', category: 'Respiratory', severityWeight: 1, description: 'Nasal congestion and watery or mucoid discharge' },
  { id: 'sneezing', name: 'sneezing', displayName: 'Frequent Sneezing', category: 'Respiratory', severityWeight: 1, description: 'Paroxysmal involuntary expulsions of air through nose' },
  { id: 'sinus_pressure', name: 'sinus_pressure', displayName: 'Sinus Facial Pressure / Pain', category: 'Respiratory', severityWeight: 2, description: 'Pain over cheeks, bridge of nose, or forehead' },
  { id: 'loss_of_voice', name: 'loss_of_voice', displayName: 'Hoarseness / Loss of Voice', category: 'Respiratory', severityWeight: 2, description: 'Raspy, strained, or breathy vocal quality' },

  // Cardiovascular & Thoracic
  { id: 'chest_pain', name: 'chest_pain', displayName: 'Chest Pain / Pressure', category: 'Cardiovascular', severityWeight: 5, description: 'Substernal pressure, squeezing or tightness in chest' },
  { id: 'pleuritic_chest_pain', name: 'pleuritic_chest_pain', displayName: 'Sharp Chest Pain on Inhaling', category: 'Cardiovascular', severityWeight: 4, description: 'Sharp lancinating pain worsening with deep inhalation or coughing' },
  { id: 'palpitations', name: 'palpitations', displayName: 'Rapid Heartbeat (Palpitations)', category: 'Cardiovascular', severityWeight: 3, description: 'Noticeable pounding, fluttering, or racing heartbeat' },
  { id: 'swollen_ankles', name: 'swollen_ankles', displayName: 'Swelling in Legs/Ankles (Edema)', category: 'Cardiovascular', severityWeight: 3, description: 'Pitting fluid buildup in lower extremities' },
  { id: 'cold_extremities', name: 'cold_extremities', displayName: 'Cold Hands and Feet', category: 'Cardiovascular', severityWeight: 2, description: 'Poor peripheral circulation causing cold digits' },

  // Gastrointestinal & Abdominal
  { id: 'nausea', name: 'nausea', displayName: 'Nausea', category: 'Gastrointestinal', severityWeight: 2, description: 'Sensation of unease in stomach with urge to vomit' },
  { id: 'vomiting', name: 'vomiting', displayName: 'Vomiting (Emesis)', category: 'Gastrointestinal', severityWeight: 3, description: 'Forceful expulsion of gastric contents' },
  { id: 'abdominal_pain', name: 'abdominal_pain', displayName: 'Abdominal Cramping / Pain', category: 'Gastrointestinal', severityWeight: 3, description: 'Ache or cramp in belly area' },
  { id: 'severe_right_lower_quadrant_pain', name: 'severe_right_lower_quadrant_pain', displayName: 'Severe Right Lower Belly Pain', category: 'Gastrointestinal', severityWeight: 5, description: 'Sharp tenderness at McBurney point (suspect appendicitis)' },
  { id: 'upper_abdominal_burning', name: 'upper_abdominal_burning', displayName: 'Upper Abdominal Burning / Heartburn', category: 'Gastrointestinal', severityWeight: 2, description: 'Acid reflux, sour taste in mouth, retrosternal burn' },
  { id: 'diarrhea', name: 'diarrhea', displayName: 'Watery Diarrhea', category: 'Gastrointestinal', severityWeight: 3, description: 'Three or more loose or watery stools per day' },
  { id: 'bloody_stools', name: 'bloody_stools', displayName: 'Bloody or Black Stools (Melena)', category: 'Gastrointestinal', severityWeight: 5, description: 'Visible bright red blood or tarry dark stools' },
  { id: 'constipation', name: 'constipation', displayName: 'Constipation', category: 'Gastrointestinal', severityWeight: 2, description: 'Infrequent bowel movements or hard, difficult-to-pass stools' },
  { id: 'bloating', name: 'bloating', displayName: 'Abdominal Bloating & Gas', category: 'Gastrointestinal', severityWeight: 2, description: 'Feeling of abdominal fullness, tightness, or distention' },
  { id: 'jaundice', name: 'jaundice', displayName: 'Yellowish Skin & Eyes (Jaundice)', category: 'Gastrointestinal', severityWeight: 4, description: 'Icterus due to elevated bilirubin levels' },
  { id: 'dark_urine', name: 'dark_urine', displayName: 'Dark Tea-Colored Urine', category: 'Gastrointestinal', severityWeight: 3, description: 'Concentrated bilirubin or dehydration darkening urine' },

  // Musculoskeletal
  { id: 'joint_pain', name: 'joint_pain', displayName: 'Joint Pain (Arthralgia)', category: 'Musculoskeletal', severityWeight: 3, description: 'Aching or soreness in one or multiple joints' },
  { id: 'joint_swelling', name: 'joint_swelling', displayName: 'Swollen & Warm Joints', category: 'Musculoskeletal', severityWeight: 4, description: 'Inflammation, effusion, and localized warmth around joints' },
  { id: 'morning_stiffness', name: 'morning_stiffness', displayName: 'Morning Stiffness (>30 mins)', category: 'Musculoskeletal', severityWeight: 3, description: 'Difficulty moving joints upon waking, easing with motion' },
  { id: 'muscle_aches', name: 'muscle_aches', displayName: 'Generalized Muscle Pain (Myalgia)', category: 'Musculoskeletal', severityWeight: 3, description: 'Widespread tenderness in muscular tissues' },
  { id: 'back_pain', name: 'back_pain', displayName: 'Lower Back Pain', category: 'Musculoskeletal', severityWeight: 2, description: 'Lumbosacral pain aggravated by movement or prolonged sitting' },
  { id: 'neck_pain', name: 'neck_pain', displayName: 'Neck & Shoulder Tension', category: 'Musculoskeletal', severityWeight: 2, description: 'Muscular strain in cervical and trapezius regions' },

  // Dermatological & Cutaneous
  { id: 'skin_rash', name: 'skin_rash', displayName: 'Erythematous Skin Rash', category: 'Dermatological', severityWeight: 3, description: 'Red patches, hives, or maculopapular eruptions on skin' },
  { id: 'itching', name: 'itching', displayName: 'Severe Itching (Pruritus)', category: 'Dermatological', severityWeight: 2, description: 'Irritating sensation triggering strong desire to scratch' },
  { id: 'acne', name: 'acne', displayName: 'Pustules & Pimples (Acne)', category: 'Dermatological', severityWeight: 1, description: 'Comedones, papules, or cysts on face or back' },
  { id: 'dry_scaly_skin', name: 'dry_scaly_skin', displayName: 'Dry, Peeling or Scaly Skin', category: 'Dermatological', severityWeight: 2, description: 'Flaky epidermal shedding with cracked skin texture' },
  { id: 'pale_skin', name: 'pale_skin', displayName: 'Paleness (Pallor)', category: 'Dermatological', severityWeight: 3, description: 'Unusually light skin color, especially conjunctiva and nails' },

  // Urological & Reproductive
  { id: 'burning_urination', name: 'burning_urination', displayName: 'Burning Sensation on Urination (Dysuria)', category: 'Urological & Reproductive', severityWeight: 3, description: 'Stinging or burning discomfort while voiding' },
  { id: 'frequent_urination', name: 'frequent_urination', displayName: 'Frequent Urination (Pollakiuria)', category: 'Urological & Reproductive', severityWeight: 3, description: 'Needing to urinate much more often than usual' },
  { id: 'blood_in_urine', name: 'blood_in_urine', displayName: 'Blood in Urine (Hematuria)', category: 'Urological & Reproductive', severityWeight: 5, description: 'Pink, red, or cola-colored urine' },
  { id: 'excessive_thirst', name: 'excessive_thirst', displayName: 'Extreme Thirst (Polydipsia)', category: 'Urological & Reproductive', severityWeight: 4, description: 'Insatiable thirst often associated with hyperglycemia' },
  { id: 'excessive_hunger', name: 'excessive_hunger', displayName: 'Increased Hunger (Polyphagia)', category: 'Urological & Reproductive', severityWeight: 3, description: 'Unusual, intense cravings and constant hunger' },
];

export const SYMPTOM_CATEGORIES = [
  'All',
  'General',
  'Head & Neurological',
  'Respiratory',
  'Cardiovascular',
  'Gastrointestinal',
  'Musculoskeletal',
  'Dermatological',
  'Urological & Reproductive'
] as const;
