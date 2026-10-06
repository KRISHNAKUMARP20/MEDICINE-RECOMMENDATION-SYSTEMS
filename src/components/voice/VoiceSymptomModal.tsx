import React, { useState, useEffect, useRef } from 'react';
import {
  AlertCircle,
  Check,
  Clock,
  Flame,
  HelpCircle,
  Mic,
  MicOff,
  Plus,
  Radio,
  RotateCcw,
  Sparkles,
  Stethoscope,
  Volume2,
  X
} from 'lucide-react';
import {
  VoiceSymptomService,
  DetectedVoiceSymptom
} from '../../services/voiceSymptomService';
import { SymptomInput } from '../../services/mlPredictionService';

interface VoiceSymptomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplySymptoms: (newSymptoms: SymptomInput[]) => void;
  onSetSearchQuery?: (query: string) => void;
  existingSymptomIds: string[];
}

export const VoiceSymptomModal: React.FC<VoiceSymptomModalProps> = ({
  isOpen,
  onClose,
  onApplySymptoms,
  onSetSearchQuery,
  existingSymptomIds
}) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [detectedSymptoms, setDetectedSymptoms] = useState<DetectedVoiceSymptom[]>([]);
  const [selectedForAdding, setSelectedForAdding] = useState<Record<string, boolean>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState<boolean>(true);

  const recognitionSessionRef = useRef<{
    start: () => void;
    stop: () => void;
    abort: () => void;
  } | null>(null);

  // Check Web Speech API support
  useEffect(() => {
    setIsSupported(VoiceSymptomService.isSupported());
  }, []);

  // Update detected symptoms whenever transcript changes
  useEffect(() => {
    if (!transcript) {
      setDetectedSymptoms([]);
      setSelectedForAdding({});
      return;
    }

    const detected = VoiceSymptomService.parseTranscript(transcript);
    setDetectedSymptoms(detected);

    // Default all newly detected symptoms to checked
    setSelectedForAdding(prev => {
      const updated = { ...prev };
      detected.forEach(d => {
        if (updated[d.symptom.id] === undefined) {
          updated[d.symptom.id] = true;
        }
      });
      return updated;
    });
  }, [transcript]);

  // Start speech recognition session
  const startListening = () => {
    setErrorMsg(null);
    if (!VoiceSymptomService.isSupported()) {
      setErrorMsg('Web Speech API is not supported in this browser. Please use Google Chrome, Microsoft Edge, or Safari.');
      return;
    }

    // Stop existing session if active
    if (recognitionSessionRef.current) {
      recognitionSessionRef.current.abort();
    }

    const session = VoiceSymptomService.createRecognitionSession({
      onStart: () => {
        setIsListening(true);
        setErrorMsg(null);
      },
      onResult: (text: string) => {
        setTranscript(text);
      },
      onError: (err: string) => {
        setIsListening(false);
        setErrorMsg(err);
      },
      onEnd: () => {
        setIsListening(false);
      }
    });

    if (session) {
      recognitionSessionRef.current = session;
      session.start();
    } else {
      setErrorMsg('Failed to initialize speech recognition.');
    }
  };

  // Stop speech recognition
  const stopListening = () => {
    if (recognitionSessionRef.current) {
      recognitionSessionRef.current.stop();
    }
    setIsListening(false);
  };

  // Toggle listening
  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Auto-start listening when modal opens
  useEffect(() => {
    if (isOpen) {
      startListening();
    } else {
      stopListening();
    }
    return () => {
      stopListening();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApplyToChecker = () => {
    const toAdd: SymptomInput[] = detectedSymptoms
      .filter(d => selectedForAdding[d.symptom.id])
      .map(d => ({
        symptomId: d.symptom.id,
        severity: d.detectedSeverity,
        durationDays: d.detectedDurationDays
      }));

    if (toAdd.length > 0) {
      onApplySymptoms(toAdd);
    }
    onClose();
  };

  const handleApplyToSearch = () => {
    if (transcript.trim() && onSetSearchQuery) {
      onSetSearchQuery(transcript.trim());
      onClose();
    }
  };

  const handleClear = () => {
    setTranscript('');
    setDetectedSymptoms([]);
    setSelectedForAdding({});
  };

  // Pre-made clinical sample phrases for testing
  const samplePhrases = [
    "I have had a high fever for three days with chills and extreme fatigue",
    "Severe headache, stiff neck, and sensitivity to light since yesterday",
    "Chest pain, shortness of breath, and profuse sweating",
    "Watery diarrhea, vomiting, and severe abdominal cramping for two days",
    "Joint pain, morning stiffness, and skin rash"
  ];

  const handleSelectSamplePhrase = (phrase: string) => {
    setTranscript(phrase);
    if (isListening) {
      stopListening();
    }
  };

  const activeCount = detectedSymptoms.filter(d => selectedForAdding[d.symptom.id]).length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-linear-to-r from-teal-900 via-slate-900 to-slate-950 text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
              isListening
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40 ring-4 ring-rose-500/20 animate-pulse'
                : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
            }`}>
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">Voice Symptom Dictation</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Web Speech API
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Speak naturally to describe your symptoms, duration, and severity.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-700 flex-1">
          {/* Audio Equalizer & Mic Toggle Bar */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleListening}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer ${
                  isListening
                    ? 'bg-rose-600 hover:bg-rose-500 text-white ring-4 ring-rose-500/20'
                    : 'bg-teal-600 hover:bg-teal-500 text-white'
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-4 h-4" />
                    <span>Stop Listening</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    <span>Start Speaking</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                {isListening ? (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                    <span>Listening actively... Speak now</span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-500 font-medium">
                    {transcript ? 'Dictation paused' : 'Click "Start Speaking" or use microphone'}
                  </span>
                )}
              </div>
            </div>

            {/* Simulated Audio Frequency Visualizer */}
            {isListening && (
              <div className="flex items-center gap-1 h-5 px-3 py-1 bg-white border border-slate-200 rounded-lg shadow-2xs">
                <span className="w-1 bg-teal-500 rounded-full animate-bounce [animation-delay:-0.3s] h-3" />
                <span className="w-1 bg-teal-600 rounded-full animate-bounce [animation-delay:-0.15s] h-4" />
                <span className="w-1 bg-teal-500 rounded-full animate-bounce h-2" />
                <span className="w-1 bg-teal-600 rounded-full animate-bounce [animation-delay:-0.2s] h-5" />
                <span className="w-1 bg-teal-500 rounded-full animate-bounce [animation-delay:-0.4s] h-3" />
              </div>
            )}
          </div>

          {/* Browser Unsupported Warning */}
          {!isSupported && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Web Speech API not detected in this browser</p>
                <p className="mt-0.5 text-amber-700">
                  Chrome, Edge, or Safari support direct verbal dictation. You can also click any of the sample clinical phrases below to simulate speech extraction.
                </p>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Real-time Transcription Box */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-teal-600" />
                <span>Live Spoken Transcription</span>
              </span>
              {transcript && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-slate-400 hover:text-slate-600 text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            <div className="relative min-h-[90px] p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 font-medium leading-relaxed focus-within:bg-white focus-within:border-teal-500 transition-colors">
              {transcript ? (
                <p>{transcript}</p>
              ) : (
                <p className="text-slate-400 italic">
                  {isListening
                    ? "Listening for your voice... Try saying: 'I've had a severe fever, chills, and headache for three days.'"
                    : "No voice detected yet. Click 'Start Speaking' and describe what you are experiencing."}
                </p>
              )}
            </div>
          </div>

          {/* Detected Symptoms Section */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>Extracted Clinical Symptoms ({detectedSymptoms.length} detected)</span>
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                Matched against 60+ standardized features
              </span>
            </div>

            {detectedSymptoms.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-center text-xs text-slate-400">
                {transcript
                  ? "No exact clinical symptoms identified yet. Speak symptoms like fever, cough, chest pain, nausea, or dizziness."
                  : "Speak your symptoms above to see automatic clinical extraction here in real time."}
              </div>
            ) : (
              <div className="space-y-2">
                {detectedSymptoms.map(d => {
                  const isChecked = !!selectedForAdding[d.symptom.id];
                  const alreadyInChecker = existingSymptomIds.includes(d.symptom.id);

                  return (
                    <div
                      key={d.symptom.id}
                      onClick={() =>
                        setSelectedForAdding(prev => ({
                          ...prev,
                          [d.symptom.id]: !prev[d.symptom.id]
                        }))
                      }
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isChecked
                          ? 'border-teal-500 bg-teal-50/50 shadow-2xs'
                          : 'border-slate-200 bg-white opacity-60 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500 cursor-pointer pointer-events-none"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs sm:text-sm text-slate-900">
                              {d.symptom.displayName}
                            </span>
                            {alreadyInChecker && (
                              <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-medium">
                                Already added
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>System: {d.symptom.category}</span>
                            <span>•</span>
                            <span className="text-teal-700 font-medium">
                              Heard: "{d.matchedPhrase}"
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Detected Severity */}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          d.detectedSeverity === 'Severe'
                            ? 'bg-rose-100 text-rose-800 border-rose-200'
                            : d.detectedSeverity === 'Mild'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : 'bg-amber-100 text-amber-800 border-amber-200'
                        }`}>
                          {d.detectedSeverity}
                        </span>

                        {/* Detected Duration */}
                        <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{d.detectedDurationDays}d</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick-try Clinical Phrases (Helper / Simulation) */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Quick Voice Test Prompts (Click to simulate speaking):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {samplePhrases.map((phrase, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSamplePhrase(phrase)}
                  className="text-left text-xs bg-slate-100 hover:bg-teal-50 hover:text-teal-900 border border-slate-200 hover:border-teal-300 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer text-slate-600"
                >
                  "{phrase}"
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 p-4 sm:px-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 font-medium self-start sm:self-center">
            {detectedSymptoms.length > 0 ? (
              <span>
                <strong className="text-teal-800 font-bold">{activeCount}</strong> of{' '}
                {detectedSymptoms.length} symptom{detectedSymptoms.length > 1 ? 's' : ''} selected
              </span>
            ) : (
              <span>Speak symptoms or pick a quick test prompt</span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {transcript && (
              <button
                type="button"
                onClick={handleApplyToSearch}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer w-full sm:w-auto text-center"
                title="Search symptom directory using transcript"
              >
                Use in Search
              </button>
            )}

            <button
              type="button"
              onClick={handleApplyToChecker}
              disabled={activeCount === 0}
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-teal-600/20 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed w-full sm:w-auto"
            >
              <Check className="w-4 h-4" />
              <span>Apply to Symptom Checker ({activeCount})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
