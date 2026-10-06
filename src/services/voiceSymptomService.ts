import { Symptom } from '../types';
import { SYMPTOMS_DATA } from '../data/symptoms';

export interface DetectedVoiceSymptom {
  symptom: Symptom;
  detectedSeverity: 'Mild' | 'Moderate' | 'Severe';
  detectedDurationDays: number;
  matchedPhrase: string;
  confidence: number;
}

// Synonyms and spoken natural language variations mapping to symptom IDs
const SPOKEN_SYMPTOM_PATTERNS: Array<{
  symptomId: string;
  patterns: string[];
}> = [
  {
    symptomId: 'fever',
    patterns: ['high fever', 'burning up', 'fever', 'high temperature', 'running a fever', 'feverish', 'temperature elevated']
  },
  {
    symptomId: 'mild_fever',
    patterns: ['mild fever', 'low grade fever', 'slightly warm', 'slight temperature', 'low fever']
  },
  {
    symptomId: 'chills',
    patterns: ['chills', 'shivering', 'shivers', 'feeling cold', 'teeth chattering', 'cold chills']
  },
  {
    symptomId: 'fatigue',
    patterns: ['fatigue', 'extreme fatigue', 'exhausted', 'exhaustion', 'tired', 'feeling drained', 'malaise', 'no energy', 'lethargic', 'lethargy']
  },
  {
    symptomId: 'weakness',
    patterns: ['weakness', 'generalized weakness', 'feeling weak', 'loss of strength', 'body weak']
  },
  {
    symptomId: 'sweating',
    patterns: ['sweating', 'sweaty', 'profuse sweating', 'perspiring', 'perspiration', 'diaphoresis', 'breaking out in sweat']
  },
  {
    symptomId: 'night_sweats',
    patterns: ['night sweats', 'sweating at night', 'waking up soaked', 'sweating in sleep']
  },
  {
    symptomId: 'weight_loss',
    patterns: ['weight loss', 'losing weight', 'lost weight', 'unintended weight loss', 'clothes loose']
  },
  {
    symptomId: 'weight_gain',
    patterns: ['weight gain', 'gaining weight', 'gained weight', 'rapid weight gain']
  },
  {
    symptomId: 'loss_of_appetite',
    patterns: ['loss of appetite', 'no appetite', 'not hungry', 'cant eat', "can't eat", 'anorexia', 'lost appetite', 'refusing food']
  },
  {
    symptomId: 'dehydration',
    patterns: ['dehydration', 'dehydrated', 'dry mouth', 'thirsty', 'parched']
  },
  {
    symptomId: 'headache',
    patterns: ['headache', 'head hurts', 'head pain', 'aching head', 'head pounding']
  },
  {
    symptomId: 'throbbing_headache',
    patterns: ['migraine', 'throbbing headache', 'one sided headache', 'pulsating headache', 'intense headache']
  },
  {
    symptomId: 'dizziness',
    patterns: ['dizziness', 'dizzy', 'lightheaded', 'lightheadedness', 'feeling faint', 'woozy', 'unsteady']
  },
  {
    symptomId: 'vertigo',
    patterns: ['vertigo', 'room spinning', 'spinning sensation', 'loss of balance', 'spinning']
  },
  {
    symptomId: 'confusion',
    patterns: ['confusion', 'confused', 'disoriented', 'brain fog', 'cant think clearly', "can't think clearly", 'altered sensorium']
  },
  {
    symptomId: 'photophobia',
    patterns: ['light sensitivity', 'sensitive to light', 'photophobia', 'eyes hurt in light']
  },
  {
    symptomId: 'stiff_neck',
    patterns: ['stiff neck', 'neck stiffness', 'cant bend neck', "can't bend neck", 'nuchal rigidity']
  },
  {
    symptomId: 'tremors',
    patterns: ['tremors', 'tremor', 'shaking hands', 'shaky hands', 'involuntary shaking', 'trembling']
  },
  {
    symptomId: 'numbness',
    patterns: ['numbness', 'tingling', 'pins and needles', 'paresthesia', 'numb hands', 'numb feet', 'loss of feeling']
  },
  {
    symptomId: 'blurred_vision',
    patterns: ['blurred vision', 'blurry vision', 'blurry sight', 'hazy vision', 'cant see well', "can't see well"]
  },
  {
    symptomId: 'loss_of_smell',
    patterns: ['loss of smell', 'lost smell', 'cant smell', "can't smell", 'anosmia']
  },
  {
    symptomId: 'cough',
    patterns: ['cough', 'coughing', 'dry cough', 'hacking cough', 'persistent cough']
  },
  {
    symptomId: 'productive_cough',
    patterns: ['productive cough', 'coughing phlegm', 'coughing mucus', 'wet cough', 'yellow mucus', 'green mucus', 'phlegm']
  },
  {
    symptomId: 'coughing_blood',
    patterns: ['coughing blood', 'blood in cough', 'blood in phlegm', 'hemoptysis', 'coughing up blood']
  },
  {
    symptomId: 'shortness_of_breath',
    patterns: ['shortness of breath', 'short of breath', 'breathless', 'breathlessness', 'hard to breathe', 'cant breathe', "can't breathe", 'dyspnea', 'gasping for air', 'difficulty breathing']
  },
  {
    symptomId: 'wheezing',
    patterns: ['wheezing', 'wheeze', 'whistling breath', 'chest whistling', 'asthma attack']
  },
  {
    symptomId: 'sore_throat',
    patterns: ['sore throat', 'throat hurts', 'throat pain', 'scratchy throat', 'pain on swallowing', 'pharyngitis', 'irritated throat']
  },
  {
    symptomId: 'runny_nose',
    patterns: ['runny nose', 'stuffy nose', 'congested', 'nasal congestion', 'rhinorrhea', 'blocked nose', 'dripping nose']
  },
  {
    symptomId: 'sneezing',
    patterns: ['sneezing', 'sneeze', 'frequent sneezing', 'sneezing fits']
  },
  {
    symptomId: 'sinus_pressure',
    patterns: ['sinus pressure', 'sinus pain', 'facial pressure', 'pain over cheeks', 'forehead pressure', 'sinuses hurt']
  },
  {
    symptomId: 'loss_of_voice',
    patterns: ['loss of voice', 'lost voice', 'hoarse', 'hoarseness', 'raspy voice']
  },
  {
    symptomId: 'chest_pain',
    patterns: ['chest pain', 'chest pressure', 'tightness in chest', 'chest tightness', 'heaviness in chest', 'pain in chest', 'angina']
  },
  {
    symptomId: 'pleuritic_chest_pain',
    patterns: ['sharp chest pain', 'pain on inhaling', 'pain when breathing in', 'pleuritic pain']
  },
  {
    symptomId: 'palpitations',
    patterns: ['palpitations', 'racing heart', 'heart racing', 'heart pounding', 'fluttering heart', 'rapid heartbeat', 'heart skips a beat']
  },
  {
    symptomId: 'swollen_ankles',
    patterns: ['swollen ankles', 'swelling in legs', 'swollen feet', 'swollen legs', 'edema', 'water retention in legs']
  },
  {
    symptomId: 'cold_extremities',
    patterns: ['cold hands', 'cold feet', 'cold extremities', 'chilly fingers']
  },
  {
    symptomId: 'nausea',
    patterns: ['nausea', 'nauseous', 'feeling sick', 'queasy', 'sick to stomach', 'urge to vomit']
  },
  {
    symptomId: 'vomiting',
    patterns: ['vomiting', 'throwing up', 'threw up', 'vomit', 'emesis', 'puking']
  },
  {
    symptomId: 'abdominal_pain',
    patterns: ['abdominal pain', 'stomach pain', 'belly ache', 'stomach ache', 'belly pain', 'tummy ache', 'abdominal cramps', 'stomach cramps']
  },
  {
    symptomId: 'severe_right_lower_quadrant_pain',
    patterns: ['right lower abdominal pain', 'lower right belly pain', 'appendix pain', 'mcburney pain', 'sharp right side pain']
  },
  {
    symptomId: 'upper_abdominal_burning',
    patterns: ['heartburn', 'acid reflux', 'stomach burning', 'burning in stomach', 'acid regurgitation', 'sour stomach', 'gerd']
  },
  {
    symptomId: 'diarrhea',
    patterns: ['diarrhea', 'watery diarrhea', 'loose stools', 'loose motion', 'loose motions', 'frequent loose stool', 'watery stool']
  },
  {
    symptomId: 'bloody_stools',
    patterns: ['bloody stools', 'blood in stool', 'black stool', 'tarry stool', 'melena', 'red in stool']
  },
  {
    symptomId: 'constipation',
    patterns: ['constipation', 'constipated', 'hard stool', 'difficulty passing stool', 'cant poop', "can't poop"]
  },
  {
    symptomId: 'bloating',
    patterns: ['bloating', 'bloated', 'gas', 'abdominal bloating', 'distended stomach', 'fullness in belly']
  },
  {
    symptomId: 'jaundice',
    patterns: ['jaundice', 'yellow skin', 'yellow eyes', 'yellowing of skin', 'icterus']
  },
  {
    symptomId: 'dark_urine',
    patterns: ['dark urine', 'tea colored urine', 'brown urine', 'concentrated urine']
  },
  {
    symptomId: 'joint_pain',
    patterns: ['joint pain', 'joints hurt', 'aching joints', 'arthralgia', 'knee pain', 'hip pain', 'wrist pain', 'shoulder pain']
  },
  {
    symptomId: 'joint_swelling',
    patterns: ['joint swelling', 'swollen joints', 'warm joints', 'knee swelling']
  },
  {
    symptomId: 'morning_stiffness',
    patterns: ['morning stiffness', 'stiff joints in the morning', 'stiffness after waking up', 'stiff hands in morning']
  },
  {
    symptomId: 'muscle_aches',
    patterns: ['muscle aches', 'muscle pain', 'body aches', 'myalgia', 'sore muscles', 'body hurts all over']
  },
  {
    symptomId: 'back_pain',
    patterns: ['back pain', 'lower back pain', 'backache', 'lumbago', 'lumbar pain']
  },
  {
    symptomId: 'neck_pain',
    patterns: ['neck pain', 'neck ache', 'neck tension', 'sore neck']
  },
  {
    symptomId: 'skin_rash',
    patterns: ['skin rash', 'rash', 'red rash', 'hives', 'red bumps', 'skin eruption', 'welts']
  },
  {
    symptomId: 'itching',
    patterns: ['itching', 'itchy', 'pruritus', 'itchy skin', 'desire to scratch']
  },
  {
    symptomId: 'acne',
    patterns: ['acne', 'pimples', 'pustules', 'zits', 'breakouts']
  },
  {
    symptomId: 'dry_scaly_skin',
    patterns: ['dry skin', 'scaly skin', 'peeling skin', 'flaky skin', 'cracked skin']
  },
  {
    symptomId: 'pale_skin',
    patterns: ['pale skin', 'paleness', 'pallor', 'looking pale', 'washed out']
  },
  {
    symptomId: 'burning_urination',
    patterns: ['burning urination', 'pain when peeing', 'burning when peeing', 'hurts to pee', 'dysuria', 'stinging urination', 'painful urination']
  },
  {
    symptomId: 'frequent_urination',
    patterns: ['frequent urination', 'peeing frequently', 'urinating often', 'peeing all the time', 'pollakiuria', 'constant urge to pee']
  },
  {
    symptomId: 'blood_in_urine',
    patterns: ['blood in urine', 'hematuria', 'red urine', 'pink urine', 'cola colored urine']
  },
  {
    symptomId: 'excessive_thirst',
    patterns: ['excessive thirst', 'extreme thirst', 'thirsty all the time', 'polydipsia', 'unquenchable thirst']
  },
  {
    symptomId: 'excessive_hunger',
    patterns: ['excessive hunger', 'polyphagia', 'constant hunger', 'always hungry', 'extreme hunger']
  }
];

// Helper to determine spoken severity
function extractSpokenSeverity(text: string): 'Mild' | 'Moderate' | 'Severe' {
  const lower = text.toLowerCase();
  if (
    lower.includes('severe') ||
    lower.includes('very high') ||
    lower.includes('extreme') ||
    lower.includes('unbearable') ||
    lower.includes('terrible') ||
    lower.includes('awful') ||
    lower.includes('intense') ||
    lower.includes('acute') ||
    lower.includes('very bad')
  ) {
    return 'Severe';
  }
  if (
    lower.includes('mild') ||
    lower.includes('slight') ||
    lower.includes('little bit') ||
    lower.includes('minor') ||
    lower.includes('low') ||
    lower.includes('a little')
  ) {
    return 'Mild';
  }
  return 'Moderate';
}

// Helper to detect duration in days from spoken natural language
function extractSpokenDuration(text: string): number {
  const lower = text.toLowerCase();

  // Pattern: "X days", "X day"
  const dayMatch = lower.match(/(\d+)\s*(?:days?)/);
  if (dayMatch && dayMatch[1]) {
    const val = parseInt(dayMatch[1], 10);
    if (!isNaN(val) && val > 0 && val <= 365) return val;
  }

  // Word numbers
  if (lower.includes('one day') || lower.includes('a day') || lower.includes('since yesterday') || lower.includes('yesterday')) return 1;
  if (lower.includes('two days')) return 2;
  if (lower.includes('three days')) return 3;
  if (lower.includes('four days')) return 4;
  if (lower.includes('five days')) return 5;
  if (lower.includes('six days')) return 6;
  if (lower.includes('a week') || lower.includes('one week') || lower.includes('seven days')) return 7;
  if (lower.includes('two weeks')) return 14;
  if (lower.includes('three weeks')) return 21;
  if (lower.includes('a month') || lower.includes('one month')) return 30;

  return 3; // clinical default
}

export class VoiceSymptomService {
  /**
   * Check if browser supports Web Speech Recognition
   */
  public static isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    );
  }

  /**
   * Parse natural spoken transcription and identify matching symptoms
   */
  public static parseTranscript(transcript: string): DetectedVoiceSymptom[] {
    if (!transcript || transcript.trim().length === 0) return [];

    const lowerTranscript = transcript.toLowerCase();
    const globalSeverity = extractSpokenSeverity(lowerTranscript);
    const globalDuration = extractSpokenDuration(lowerTranscript);

    const detectedMap = new Map<string, DetectedVoiceSymptom>();

    // 1. Check mapped spoken patterns
    for (const item of SPOKEN_SYMPTOM_PATTERNS) {
      for (const pattern of item.patterns) {
        // Regex word boundary matching
        const regex = new RegExp(`\\b${pattern}\\b`, 'i');
        if (regex.test(lowerTranscript)) {
          const symptom = SYMPTOMS_DATA.find(s => s.id === item.symptomId);
          if (symptom && !detectedMap.has(symptom.id)) {
            // Check if local severity was specified near this phrase
            const index = lowerTranscript.indexOf(pattern);
            const contextWindow = lowerTranscript.substring(
              Math.max(0, index - 20),
              Math.min(lowerTranscript.length, index + pattern.length + 20)
            );
            const localSeverity = extractSpokenSeverity(contextWindow);
            const resolvedSeverity = localSeverity !== 'Moderate' ? localSeverity : globalSeverity;

            detectedMap.set(symptom.id, {
              symptom,
              detectedSeverity: resolvedSeverity,
              detectedDurationDays: globalDuration,
              matchedPhrase: pattern,
              confidence: 0.95
            });
          }
          break; // move to next symptom
        }
      }
    }

    // 2. Fallback: Check direct symptom name / displayName matching
    for (const sym of SYMPTOMS_DATA) {
      if (detectedMap.has(sym.id)) continue;

      const nameWords = sym.name.replace(/_/g, ' ').toLowerCase();
      const displayWords = sym.displayName.toLowerCase();

      if (lowerTranscript.includes(nameWords) || lowerTranscript.includes(displayWords)) {
        detectedMap.set(sym.id, {
          symptom: sym,
          detectedSeverity: globalSeverity,
          detectedDurationDays: globalDuration,
          matchedPhrase: sym.displayName,
          confidence: 0.88
        });
      }
    }

    return Array.from(detectedMap.values());
  }

  /**
   * Initialize a SpeechRecognition instance with safe callbacks
   */
  public static createRecognitionSession(callbacks: {
    onResult: (transcript: string, isFinal: boolean) => void;
    onError: (error: string) => void;
    onStart: () => void;
    onEnd: () => void;
  }): {
    start: () => void;
    stop: () => void;
    abort: () => void;
  } | null {
    if (!this.isSupported()) return null;

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        callbacks.onStart();
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcriptChunk = result[0]?.transcript || '';
          if (result.isFinal) {
            finalTranscript += transcriptChunk;
          } else {
            interimTranscript += transcriptChunk;
          }
        }

        const totalTranscript = (finalTranscript + ' ' + interimTranscript).trim();
        callbacks.onResult(totalTranscript, finalTranscript.length > 0);
      };

      recognition.onerror = (event: any) => {
        const errType = event.error || 'unknown';
        let humanMessage = `Speech recognition error: ${errType}`;
        if (errType === 'not-allowed') {
          humanMessage = 'Microphone permission was denied. Please allow microphone access in your browser.';
        } else if (errType === 'no-speech') {
          humanMessage = 'No speech detected. Please speak clearly into your microphone.';
        } else if (errType === 'network') {
          humanMessage = 'Network connection error for speech recognition.';
        }
        callbacks.onError(humanMessage);
      };

      recognition.onend = () => {
        callbacks.onEnd();
      };

      return {
        start: () => {
          try {
            recognition.start();
          } catch (e: any) {
            // Already started or active
            console.warn('SpeechRecognition start warning:', e);
          }
        },
        stop: () => {
          try {
            recognition.stop();
          } catch (e: any) {
            console.warn('SpeechRecognition stop warning:', e);
          }
        },
        abort: () => {
          try {
            recognition.abort();
          } catch (e: any) {
            console.warn('SpeechRecognition abort warning:', e);
          }
        }
      };
    } catch (e) {
      console.error('Failed to instantiate SpeechRecognition:', e);
      return null;
    }
  }
}
