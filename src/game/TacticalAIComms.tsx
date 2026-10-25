import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  Sparkles, 
  X, 
  Terminal, 
  Search, 
  ShieldAlert, 
  Dna,
  Zap
} from 'lucide-react';
import { PlayerStats } from './engine';

interface TacticalAICommsProps {
  isOpen: boolean;
  onClose: () => void;
  stats: PlayerStats;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  isBioscience?: boolean;
}

export const TacticalAIComms: React.FC<TacticalAICommsProps> = ({
  isOpen,
  onClose,
  stats,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `[AURA BIO-TACTICAL ONLINE]\nNanobot MK-IV deployed in vascular cellular chamber. Wave ${stats.wave} active. I am monitoring pathogen mutations and antigen markers. Query me for molecular countermeasures or tactical advisories.`,
      isBioscience: true,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/game/tactical-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          stats,
          history: messages.map((m) => ({ role: m.role, text: m.content })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Tactical Comms offline');

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.text,
          isBioscience: true,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `[WARNING: COMMS INTERFERENCE] ${err.message || 'Signal lost'}. Re-aligning molecular telemetry...`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Web Speech API Voice Recognition (Transcribe audio directly in browser)
  const toggleVoiceRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser. Please type your query.');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsRecording(true);
      recognition.onend = () => setIsRecording(false);
      recognition.onerror = () => setIsRecording(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput(transcript);
          handleSend(transcript);
        }
      };

      recognition.start();
    } catch {
      setIsRecording(false);
    }
  };

  // Text-to-Speech synthesizer
  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.replace(/\[.*?\]/g, ''));
      utterance.rate = 1.05;
      utterance.pitch = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-950/95 border-l border-emerald-500/30 shadow-2xl flex flex-col backdrop-blur-md animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 bg-slate-900/90 border-b border-emerald-500/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm tracking-tight font-mono">AURA Tactical AI</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                Gemini Active
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Cellular Diagnostics • Bioscience Advisor
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Suggested Tactical Questions */}
      <div className="p-2.5 bg-slate-900/40 border-b border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar text-[11px] font-mono">
        <span className="text-slate-400 shrink-0">Tactics:</span>
        {[
          'How to neutralize Viral Capsids?',
          'Bacterial Flagellate weaknesses?',
          'How does the Bio-EMP work?',
          'What is Cytomegalovirus?',
        ].map((q) => (
          <button
            key={q}
            onClick={() => handleSend(q)}
            className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-emerald-300 whitespace-nowrap transition border border-slate-700/50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Thread */}
      <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-3.5 font-mono text-xs">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${
              m.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-[88%] p-3 rounded-2xl whitespace-pre-wrap leading-relaxed shadow-md ${
                m.role === 'user'
                  ? 'bg-emerald-600 text-slate-950 font-sans font-medium rounded-br-none'
                  : 'bg-slate-900/90 border border-emerald-500/20 text-slate-200 rounded-bl-none'
              }`}
            >
              {m.content}
            </div>

            {m.role === 'assistant' && (
              <button
                onClick={() => speakMessage(m.content)}
                className="flex items-center gap-1 mt-1 text-[10px] text-slate-400 hover:text-emerald-400 p-0.5 transition"
                title="Speak advisory aloud"
              >
                <Volume2 className="w-3 h-3" />
                <span>Audio Readout</span>
              </button>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-slate-400 text-xs py-2">
            <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span>Analyzing cellular telemetry with Gemini...</span>
          </div>
        )}
      </div>

      {/* Input Form with Audio Transcription */}
      <div className="p-3 bg-slate-900/90 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <button
            type="button"
            onClick={toggleVoiceRecording}
            className={`p-2 rounded-xl border transition ${
              isRecording
                ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-emerald-400'
            }`}
            title="Speech-to-text voice input"
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AURA tactical guidance... (or speak)"
            className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
          />

          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl disabled:opacity-50 transition shadow-md shadow-emerald-500/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
