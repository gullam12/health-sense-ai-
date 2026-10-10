import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, X, Bot, User, ArrowRight, ShieldAlert, Sparkles, Loader2 } from 'lucide-react';
import { chatWithAssistantApi } from '../../services/apiService';

export const ClinicalAssistantModal = ({ isOpen, onClose, onSelectDiseaseModel }) => {
  const [language, setLanguage] = useState('en-US');
  const [isListening, setIsListening] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Hello, I am your HealthSense clinical symptom assistant powered by Google Gemini. You can speak or type your symptoms, vital signs, or health questions.",
      modelSuggestion: null,
      source: 'google_gemini_ai'
    }
  ]);

  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check Web Speech API support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [language]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please type your symptoms.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.lang = language;
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        setIsListening(false);
      }
    }
  };

  const handleSendMessage = async (textToSend = inputText) => {
    if (!textToSend.trim() || isThinking) return;

    const userMessage = { sender: 'user', text: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsThinking(true);

    try {
      const res = await chatWithAssistantApi(textToSend, messages, language);
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: res.text,
          modelSuggestion: res.modelSuggestion,
          source: res.source
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: "I am having trouble reaching the triage service right now. Please explore our screening modules directly or consult a healthcare professional.",
          modelSuggestion: null,
          source: 'error'
        }
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white border border-clinical-border shadow-clinical-lg max-w-xl w-full flex flex-col h-[560px]">
        {/* Header */}
        <div className="p-4 border-b border-clinical-border flex items-center justify-between bg-clinical-canvas">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-clinical-celadon" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-clinical-ink">
                  AI Symptom Assistant (SRS §5.0 FR-5)
                </h3>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                  <Sparkles className="w-2.5 h-2.5 text-purple-600" />
                  Google Gemini Flash
                </span>
              </div>
              <p className="text-[11px] text-clinical-muted">
                Conversational natural language symptom triage & voice intake
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Multi-lingual Selector */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="text-[11px] py-1 px-2 border border-clinical-border bg-white font-medium text-clinical-ink"
            >
              <option value="en-US">English (US)</option>
              <option value="es-ES">Español (ES)</option>
              <option value="hi-IN">हिन्दी (Hindi)</option>
            </select>

            <button
              onClick={onClose}
              className="p-1 text-clinical-muted hover:text-clinical-ink"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Log */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs bg-slate-50/50">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] p-3 border ${
                  m.sender === 'user'
                    ? 'bg-clinical-ink text-white border-clinical-ink rounded-none'
                    : 'bg-white text-clinical-ink border-clinical-border shadow-xs'
                }`}
              >
                {m.sender === 'ai' && m.source === 'google_gemini_ai' && (
                  <div className="flex items-center gap-1 text-[10px] font-semibold text-purple-700 mb-1.5 pb-1 border-b border-purple-100">
                    <Sparkles className="w-3 h-3 text-purple-600" />
                    <span>Gemini Clinical Intelligence</span>
                  </div>
                )}

                <div className="leading-relaxed">{m.text}</div>

                {m.modelSuggestion && (
                  <button
                    onClick={() => {
                      onSelectDiseaseModel(m.modelSuggestion.key);
                      onClose();
                    }}
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-clinical-celadon text-white hover:bg-clinical-celadon-hover transition-colors"
                  >
                    <span>{m.modelSuggestion.label}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="flex flex-col items-start">
              <div className="p-3 border bg-white border-purple-200 text-purple-700 shadow-xs flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" />
                <span className="text-[11px] font-medium">Gemini is synthesizing clinical triage recommendations...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 border-t border-clinical-border bg-white flex flex-wrap gap-1.5">
          <span className="text-[10px] text-clinical-muted font-medium self-center mr-1">Quick prompts:</span>
          <button
            disabled={isThinking}
            onClick={() => handleSendMessage("I am experiencing frequent thirst, fatigue, and high blood sugar readings.")}
            className="px-2 py-0.5 text-[10px] bg-clinical-canvas border border-clinical-border text-clinical-ink hover:bg-slate-200 disabled:opacity-50"
          >
            Thirst & high sugar
          </button>
          <button
            disabled={isThinking}
            onClick={() => handleSendMessage("Chest tightness when climbing stairs and elevated blood pressure.")}
            className="px-2 py-0.5 text-[10px] bg-clinical-canvas border border-clinical-border text-clinical-ink hover:bg-slate-200 disabled:opacity-50"
          >
            Chest tightness & high BP
          </button>
          <button
            disabled={isThinking}
            onClick={() => handleSendMessage("Noticing vocal pitch shakiness and hand tremor.")}
            className="px-2 py-0.5 text-[10px] bg-clinical-canvas border border-clinical-border text-clinical-ink hover:bg-slate-200 disabled:opacity-50"
          >
            Voice tremor & shakiness
          </button>
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-clinical-border bg-white flex items-center gap-2">
          <button
            type="button"
            disabled={isThinking}
            onClick={toggleListening}
            className={`p-2 border transition-all ${
              isListening
                ? 'bg-rose-600 text-white border-rose-600 animate-pulse'
                : 'bg-clinical-canvas text-clinical-ink border-clinical-border hover:bg-slate-200 disabled:opacity-50'
            }`}
            title="Toggle Voice Microphone"
          >
            {isListening ? <Mic className="w-4 h-4" /> : <Mic className="w-4 h-4 text-clinical-celadon" />}
          </button>

          <input
            type="text"
            disabled={isThinking}
            placeholder={isListening ? "Listening to your voice..." : isThinking ? "Waiting for Gemini AI..." : "Describe symptoms or vital readings..."}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
            className="flex-1 px-3 py-2 text-xs border border-clinical-border focus:border-clinical-ink disabled:bg-slate-100"
          />

          <button
            disabled={isThinking || !inputText.trim()}
            onClick={() => handleSendMessage()}
            className="p-2 bg-clinical-ink text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {isThinking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
