import { GoogleGenerativeAI } from '@google/generative-ai';
import { DISEASES_DATA } from '../data/diseases';
import { MEDICINES_DATA } from '../data/medicines';
import { DRUG_INTERACTION_RULES } from '../data/drugInteractions';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  suggestedActions?: string[];
  intent?: 'diagnosis' | 'medicine' | 'interaction' | 'emergency' | 'general';
}

let geminiApiKey = localStorage.getItem('medassist_gemini_key') || import.meta.env.VITE_GEMINI_API_KEY || '';

export function setGeminiApiKey(key: string) {
  geminiApiKey = key;
  if (key) {
    localStorage.setItem('medassist_gemini_key', key);
  } else {
    localStorage.removeItem('medassist_gemini_key');
  }
}

export function getGeminiApiKey() {
  return geminiApiKey;
}

export async function sendChatMessage(
  message: string,
  history: ChatMessage[] = []
): Promise<ChatMessage> {
  // If Gemini API Key is available, use real AI
  if (geminiApiKey) {
    try {
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: "You are MedAssist, an expert Clinical AI Health Assistant. Provide accurate, professional, and empathetic medical triage, medication information, and symptom analysis. Keep responses concise and easy to read using markdown formatting. Always add a disclaimer that you are an AI and not a substitute for a real doctor for serious conditions."
      });
      
      const chat = model.startChat({
        history: history.filter(h => h.id !== 'welcome' && h.sender !== 'bot' || (h.sender === 'bot' && h.text)).map(h => ({
          role: h.sender === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }],
        })).slice(-10) // keep last 10 messages for context
      });

      const result = await chat.sendMessage(message);
      const response = await result.response;
      const text = response.text();

      return {
        id: `bot_gemini_${Date.now()}`,
        sender: 'bot',
        text: text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        intent: 'general'
      };
    } catch (error) {
      console.error("Gemini API Error:", error);
      // Fallback to rule engine if API fails
    }
  }

  // Fallback: Intelligent Medical Clinical Knowledge Engine
  return generateClinicalFallbackResponse(message);
}

function generateClinicalFallbackResponse(query: string): ChatMessage {
  const lower = query.toLowerCase();
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Emergency check
  if (
    lower.includes('chest pain') ||
    lower.includes('heart attack') ||
    lower.includes('can\'t breathe') ||
    lower.includes('severe bleeding') ||
    lower.includes('unconscious') ||
    lower.includes('stroke') ||
    lower.includes('suicide')
  ) {
    return {
      id: `bot_${Date.now()}`,
      sender: 'bot',
      text: `🚨 **CRITICAL MEDICAL WARNING:** If you or someone nearby is experiencing acute crushing chest pain, extreme difficulty breathing, sudden paralysis/numbness, or severe bleeding, please call **911 or your local emergency medical service immediately**.\n\nDo not attempt self-medication for acute medical emergencies.`,
      timestamp: time,
      intent: 'emergency',
      suggestedActions: ['Call Emergency Services', 'Find Nearest Emergency Room']
    };
  }

  // Drug Interaction query
  if (lower.includes('interaction') || (lower.includes('take') && lower.includes('with'))) {
    const mentionedMeds = MEDICINES_DATA.filter(m =>
      lower.includes(m.name.toLowerCase()) || lower.includes(m.genericName.toLowerCase())
    );

    if (mentionedMeds.length >= 2) {
      const pair = DRUG_INTERACTION_RULES.find(r =>
        (r.drugA.toLowerCase() === mentionedMeds[0].id && r.drugB.toLowerCase() === mentionedMeds[1].id) ||
        (r.drugA.toLowerCase() === mentionedMeds[1].id && r.drugB.toLowerCase() === mentionedMeds[0].id)
      );

      if (pair) {
        return {
          id: `bot_${Date.now()}`,
          sender: 'bot',
          text: `⚠️ **Drug Interaction Found: ${mentionedMeds[0].name} + ${mentionedMeds[1].name}**\n\n- **Severity:** ${pair.severity}\n- **Clinical Effect:** ${pair.clinicalEffect}\n- **Mechanism:** ${pair.mechanism}\n- **Clinical Recommendation:** ${pair.recommendation}`,
          timestamp: time,
          intent: 'interaction',
          suggestedActions: ['View Full Drug Interactions', 'Consult Pharmacist']
        };
      } else {
        return {
          id: `bot_${Date.now()}`,
          sender: 'bot',
          text: `No major severe interactions documented between **${mentionedMeds[0].name}** and **${mentionedMeds[1].name}** in standard clinical databases. However, always consult your physician or pharmacist regarding dosage separation and individual medical history.`,
          timestamp: time,
          intent: 'interaction'
        };
      }
    }
  }

  // Medicine query
  const matchedMedicine = MEDICINES_DATA.find(m =>
    lower.includes(m.name.toLowerCase()) || lower.includes(m.genericName.toLowerCase())
  );
  if (matchedMedicine) {
    return {
      id: `bot_${Date.now()}`,
      sender: 'bot',
      text: `💊 **${matchedMedicine.name} (${matchedMedicine.genericName})**\n\n- **Drug Class:** ${matchedMedicine.drugClass}\n- **Prescription:** ${matchedMedicine.prescriptionRequired ? 'Prescription Required (Rx)' : 'Over-the-Counter (OTC)'}\n- **Adult Dosage:** ${matchedMedicine.standardDosage.adult}\n- **Timing:** ${matchedMedicine.standardDosage.timing}\n- **Indications:** ${matchedMedicine.indications.join(', ')}\n- **Key Warnings:** ${matchedMedicine.contraindications.join(', ')}\n- **Substitutes:** ${matchedMedicine.substitutes.join(', ')}`,
      timestamp: time,
      intent: 'medicine',
      suggestedActions: [`Check ${matchedMedicine.name} Interactions`, 'View Disease Directory']
    };
  }

  // Disease query
  const matchedDisease = DISEASES_DATA.find(d =>
    lower.includes(d.name.toLowerCase()) || lower.includes(d.id.toLowerCase())
  );
  if (matchedDisease) {
    const medList = matchedDisease.recommendedMedicines.map(m => `• ${m.medicineId} (${m.type}) - ${m.dosage}`).join('\n');
    return {
      id: `bot_${Date.now()}`,
      sender: 'bot',
      text: `🩺 **Clinical Overview: ${matchedDisease.name}**\n\n${matchedDisease.description}\n\n**Common Symptoms:** ${matchedDisease.primarySymptoms.join(', ')}\n\n**Standard Medications:**\n${medList}\n\n**Specialist to Consult:** ${matchedDisease.specialist}`,
      timestamp: time,
      intent: 'diagnosis',
      suggestedActions: ['Run Full Symptom Check', 'View Precaution Guidelines']
    };
  }

  // Symptom check intent
  if (lower.includes('fever') || lower.includes('cough') || lower.includes('headache') || lower.includes('stomach') || lower.includes('pain') || lower.includes('sick')) {
    return {
      id: `bot_${Date.now()}`,
      sender: 'bot',
      text: `I noticed you described symptoms. For an accurate clinical prediction powered by our Random Forest & Ensemble Machine Learning models:\n\n1. Use our **Symptom Checker** tab to select your symptoms with severity and duration.\n2. Get personalized medicine recommendations, dosage guidelines, and precaution checklists.\n3. Verify your medications against potential drug interactions.`,
      timestamp: time,
      intent: 'diagnosis',
      suggestedActions: ['Open Symptom Checker', 'Browse Medicines Database']
    };
  }

  // Default helpful message
  return {
    id: `bot_${Date.now()}`,
    sender: 'bot',
    text: `Hello! I am your **MedAssist Clinical AI Health Assistant**. I can help you with:\n\n1. **Disease & Symptom Analysis** ("I have high fever and severe headache")\n2. **Medicine Information & Dosage** ("Tell me about Paracetamol dosage and side effects")\n3. **Drug-to-Drug Interactions** ("Can I take Ibuprofen with Losartan?")\n4. **Prescription Scanner Guidance** ("How do I scan and parse my doctor's prescription?")\n\nHow may I assist your health inquiry today?`,
    timestamp: time,
    intent: 'general',
    suggestedActions: ['Check Symptoms Now', 'Scan Prescription', 'Compare ML Models']
  };
}
