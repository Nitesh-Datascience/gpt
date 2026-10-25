import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  FileCode, 
  Copy, 
  Check, 
  ArrowRight, 
  FileJson,
  Layers
} from 'lucide-react';
import { PROMPT_TEMPLATES } from '../data/modelsData';
import { PromptTemplate } from '../types';

interface PromptCookbookProps {
  onLoadTemplate: (templateId: string) => void;
}

export const PromptCookbook: React.FC<PromptCookbookProps> = ({ onLoadTemplate }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = ['All', 'Data Extraction', 'Coding', 'Reasoning', 'Creative'];

  const filteredTemplates = selectedCategory === 'All'
    ? PROMPT_TEMPLATES
    : PROMPT_TEMPLATES.filter((t) => t.category === selectedCategory);

  const handleCopy = (t: PromptTemplate) => {
    const fullText = `System Instructions:\n${t.systemPrompt}\n\nUser Prompt:\n${t.userPrompt}`;
    navigator.clipboard.writeText(fullText);
    setCopiedId(t.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Curated Production Recipes</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            GPT-4o mini Prompt Cookbook
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Production recipes engineered specifically for GPT-4o mini's 128k context, high coding benchmark scores, and strict JSON Schema adherence. One click to load directly into the playground.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="mt-5 flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 border-t border-slate-800/80">
          <span className="text-xs text-slate-400 font-semibold mr-1">Categories:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-medium transition ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTemplates.map((template) => {
          const isCopied = copiedId === template.id;

          return (
            <div
              key={template.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col justify-between space-y-4 hover:border-slate-700 transition"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {template.category}
                  </span>
                  {template.jsonMode && (
                    <span className="flex items-center gap-1 text-[10px] text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
                      <FileJson className="w-3 h-3" />
                      <span>Strict JSON Schema</span>
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-white text-lg tracking-tight">
                  {template.title}
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {template.description}
                </p>

                {/* System Prompt Peek */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">System Directive:</span>
                  <p className="text-xs font-mono text-slate-300 line-clamp-2">
                    {template.systemPrompt}
                  </p>
                </div>

                {/* User Prompt Peek */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">User Prompt:</span>
                  <p className="text-xs font-mono text-emerald-300/90 line-clamp-3">
                    {template.userPrompt}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => handleCopy(template)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onLoadTemplate(template.id)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500 hover:text-slate-950 transition"
                >
                  <span>Open in Playground</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
