import React, { useState } from 'react';
import { X, Key, ShieldCheck, Check, AlertCircle, Trash2 } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  openAiKey: string;
  onSaveKey: (key: string) => void;
  onClearKey: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  openAiKey,
  onSaveKey,
  onClearKey,
}) => {
  const [inputValue, setInputValue] = useState(openAiKey);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveKey(inputValue.trim());
    onClose();
  };

  const handleClear = () => {
    setInputValue('');
    onClearKey();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-white">OpenAI API Key</h3>
            <p className="text-xs text-slate-400">Optional: Connect directly to official GPT-4o mini</p>
          </div>
        </div>

        <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800 mb-4 text-xs text-slate-300 space-y-2">
          <div className="flex items-start gap-2 text-emerald-400 font-medium">
            <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" />
            <span>Zero configuration required by default</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            By default, all queries execute seamlessly using the built-in server engine. If you wish to route calls directly to OpenAI's production infrastructure, provide your personal key below. It is stored solely in your browser's <code className="bg-slate-800 px-1 py-0.5 rounded text-emerald-300">localStorage</code>.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              OpenAI Secret Key
            </label>
            <input
              type="password"
              placeholder="sk-proj-..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition"
            />
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            {openAiKey ? (
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-400 hover:text-red-300 bg-red-950/30 hover:bg-red-950/50 border border-red-900/40 rounded-xl transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove Key
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-800 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-medium text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 rounded-xl font-semibold shadow-lg shadow-emerald-500/20 transition"
              >
                Save & Activate
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
