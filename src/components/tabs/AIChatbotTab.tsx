import React, { useState, useRef, useEffect } from 'react';
import {
  AlertTriangle,
  Bot,
  HelpCircle,
  Pill,
  Send,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  Key, 
  Trash2, 
  User
} from 'lucide-react';
import { ChatMessage, sendChatMessage, getGeminiApiKey, setGeminiApiKey } from '../../services/chatService';
import { ActiveTab } from '../Navbar';

interface AIChatbotTabProps {
  setActiveTab: (tab: ActiveTab) => void;
  onCheckDiseaseSymptoms: (symptoms: string[]) => void;
}

export const AIChatbotTab: React.FC<AIChatbotTabProps> = ({
  setActiveTab,
  onCheckDiseaseSymptoms
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: `Hello! I am your **MedAssist Clinical AI Health Assistant**.\n\nI can help you with:\n- **Symptom Assessment & Guidance** ("I have high fever and severe headache")\n- **Medicine Dosage & Guidelines** ("What is the standard dosage for Paracetamol?")\n- **Drug-to-Drug Interaction Checking** ("Can I take Ibuprofen with Losartan?")\n- **Emergency Triage** ("What symptoms need immediate hospital attention?")\n\nHow can I help you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      intent: 'general',
      suggestedActions: [
        'Check Symptoms for Malaria',
        'Can I take Ibuprofen with Losartan?',
        'Paracetamol adult dosage',
        'Emergency red flags'
      ]
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [apiKey, setApiKey] = useState(getGeminiApiKey());
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSaveApiKey = () => {
    setGeminiApiKey(apiKey);
    setShowApiKeyInput(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsTyping(true);

    try {
      const botResponse = await sendChatMessage(query, messages);
      setMessages(prev => [...prev, botResponse]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: `bot_err_${Date.now()}`,
          sender: 'bot',
          text: 'I apologize, but I could not process your query at this moment. Please check your network or consult a medical professional.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleActionClick = (action: string) => {
    if (action.includes('Symptom Checker') || action.includes('Check Symptoms')) {
      setActiveTab('symptom-checker');
    } else if (action.includes('Medicines') || action.includes('Interactions')) {
      setActiveTab('medicines');
    } else {
      handleSend(action);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center shadow-md shadow-teal-500/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-900 text-lg">Clinical AI Health Assistant</h2>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Online
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Pharmacotherapy, drug interactions, and symptom triage intelligence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {showApiKeyInput ? (
            <div className="flex items-center gap-2">
              <input 
                type="password" 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Paste Gemini API Key"
                className="text-xs px-2 py-1 rounded border border-slate-300 w-48 focus:outline-hidden focus:border-teal-500"
              />
              <button onClick={handleSaveApiKey} className="text-xs bg-teal-600 text-white px-2 py-1 rounded hover:bg-teal-700 cursor-pointer">Save</button>
            </div>
          ) : (
            <button
              onClick={() => setShowApiKeyInput(true)}
              className="text-xs text-slate-400 hover:text-teal-600 flex items-center gap-1 cursor-pointer p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              title="Configure Gemini API Key"
            >
              <Key className="w-4 h-4" />
              <span className="hidden sm:inline">{apiKey ? 'API Key Configured' : 'Setup AI'}</span>
            </button>
          )}

          <button
            onClick={() => setMessages(messages.slice(0, 1))}
            className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1 cursor-pointer p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
            title="Clear Conversation"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Clear Chat</span>
          </button>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs h-[520px] flex flex-col justify-between overflow-hidden">
        {/* Messages Stream */}
        <div className="overflow-y-auto space-y-4 pr-1">
          {messages.map((msg) => {
            const isBot = msg.sender === 'bot';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isBot ? 'justify-start' : 'justify-end'}`}
              >
                {isBot && (
                  <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    isBot
                      ? msg.intent === 'emergency'
                        ? 'bg-rose-50 border border-rose-200 text-rose-950'
                        : 'bg-slate-50 border border-slate-200 text-slate-800 shadow-2xs'
                      : 'bg-teal-600 text-white rounded-tr-none shadow-xs'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.text}</div>

                  {/* Suggested Quick Action Chips */}
                  {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex flex-wrap gap-1.5">
                      {msg.suggestedActions.map((action, aIdx) => (
                        <button
                          key={aIdx}
                          onClick={() => handleActionClick(action)}
                          className="px-2.5 py-1 rounded-lg bg-white hover:bg-teal-50 text-teal-800 border border-slate-200 text-[11px] font-semibold transition-colors cursor-pointer shadow-2xs"
                        >
                          {action} →
                        </button>
                      ))}
                    </div>
                  )}

                  <div className={`text-[10px] mt-2 text-right ${isBot ? 'text-slate-400' : 'text-teal-200'}`}>
                    {msg.timestamp}
                  </div>
                </div>

                {!isBot && (
                  <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 text-xs font-bold">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isTyping && (
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0 text-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce delay-100"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce delay-200"></span>
                <span className="ml-1 text-[11px]">MedAssist AI analyzing clinical context...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="pt-3 border-t border-slate-100">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about medications, side effects, dosage, or symptoms..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:bg-white focus:border-teal-500 outline-hidden transition-all"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isTyping}
              className="p-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white transition-all shadow-xs cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="text-[10px] text-slate-400 mt-1.5 text-center">
            MedAssist AI is designed for informational and triage purposes. In emergencies, call your local emergency service immediately.
          </div>
        </div>
      </div>
    </div>
  );
};
