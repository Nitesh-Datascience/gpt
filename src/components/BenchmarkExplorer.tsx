import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  CheckCircle2, 
  Cpu, 
  Zap, 
  Database, 
  FileCode, 
  Eye, 
  Globe, 
  ShieldCheck, 
  Sparkles,
  Layers
} from 'lucide-react';
import { BENCHMARKS_DATA, GPT_4O_MINI_SPECS } from '../data/modelsData';

export const BenchmarkExplorer: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'benchmarks' | 'architecture' | 'tokenization'>('benchmarks');

  const categories = ['All', 'Coding', 'General', 'Math', 'Multilingual', 'Vision'];

  const filteredBenchmarks = selectedCategory === 'All'
    ? BENCHMARKS_DATA
    : BENCHMARKS_DATA.filter((b) => b.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Hero Showcase Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Official Intelligence & Performance Metrics</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              GPT-4o mini Benchmark Intelligence
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              OpenAI's most capable cost-efficient small model, delivering frontier-class intelligence (82.0% MMLU, 87.2% HumanEval) while reducing inference costs by up to 94% compared to standard frontier models.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
            <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl text-center">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">MMLU Score</span>
              <span className="text-2xl font-black text-emerald-400">82.0%</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">vs 70.0% (3.5 Turbo)</span>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl text-center">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">HumanEval (Code)</span>
              <span className="text-2xl font-black text-teal-400">87.2%</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">pass@1 Python</span>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl text-center col-span-2 sm:col-span-1">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Cost Reduction</span>
              <span className="text-2xl font-black text-cyan-400">-60%</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">cheaper than 3.5 Turbo</span>
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 mt-6 pt-4 border-t border-slate-800/80">
          {[
            { id: 'benchmarks', label: 'Benchmark Arena Ratings', icon: BarChart3 },
            { id: 'architecture', label: 'Architecture & Specifications', icon: Cpu },
            { id: 'tokenization', label: 'Tokenization & o200k Vocabulary', icon: Layers },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-800/50 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Benchmarks */}
      {activeTab === 'benchmarks' && (
        <div className="space-y-6">
          {/* Category filter */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-xs text-slate-400 font-semibold mr-1">Filter Domain:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                  selectedCategory === cat
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Benchmark Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredBenchmarks.map((bench) => (
              <div
                key={bench.name}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 hover:border-slate-700/80 transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-base">{bench.name}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                        {bench.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {bench.description}
                    </p>
                  </div>
                </div>

                {/* Comparative Horizontal Progress Bars */}
                <div className="space-y-2.5 pt-2">
                  {/* GPT-4o mini */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        GPT-4o mini
                      </span>
                      <span className="font-mono font-bold text-emerald-400">
                        {bench.gpt4oMini}{bench.unit}
                      </span>
                    </div>
                    <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden p-0.5">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${bench.gpt4oMini}%` }}
                      />
                    </div>
                  </div>

                  {/* Gemini 1.5/3.8 Flash */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-cyan-400" />
                        Gemini Flash
                      </span>
                      <span className="font-mono text-slate-300">
                        {bench.geminiFlash}{bench.unit}
                      </span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden p-0.5">
                      <div
                        className="bg-cyan-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${bench.geminiFlash}%` }}
                      />
                    </div>
                  </div>

                  {/* Claude 3.5 Haiku */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        Claude 3.5 Haiku
                      </span>
                      <span className="font-mono text-slate-400">
                        {bench.claudeHaiku}{bench.unit}
                      </span>
                    </div>
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-500/80 h-full rounded-full"
                        style={{ width: `${bench.claudeHaiku}%` }}
                      />
                    </div>
                  </div>

                  {/* GPT-3.5 Turbo */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-slate-500" />
                        GPT-3.5 Turbo (Predecessor)
                      </span>
                      <span className="font-mono text-slate-400">
                        {bench.gpt35Turbo}{bench.unit}
                      </span>
                    </div>
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-slate-600 h-full rounded-full"
                        style={{ width: `${bench.gpt35Turbo}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Architecture & Specs */}
      {activeTab === 'architecture' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4 md:col-span-2">
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-400" />
              <span>Core Architectural Highlights</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 space-y-1">
                <div className="text-xs text-slate-400 font-semibold uppercase">Context Window</div>
                <div className="text-xl font-bold text-white">128,000 Tokens</div>
                <p className="text-xs text-slate-400">Equivalent to ~300 pages of text in a single prompt.</p>
              </div>

              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 space-y-1">
                <div className="text-xs text-slate-400 font-semibold uppercase">Max Completion Tokens</div>
                <div className="text-xl font-bold text-emerald-400">16,384 Tokens</div>
                <p className="text-xs text-slate-400">4x higher than standard 4K output token limits.</p>
              </div>

              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 space-y-1">
                <div className="text-xs text-slate-400 font-semibold uppercase">Knowledge Cutoff</div>
                <div className="text-xl font-bold text-white">October 2023</div>
                <p className="text-xs text-slate-400">Broad foundational pre-training with alignment for low hallucination.</p>
              </div>

              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 space-y-1">
                <div className="text-xs text-slate-400 font-semibold uppercase">Structured Output Adherence</div>
                <div className="text-xl font-bold text-teal-400">100% Strict Schema</div>
                <p className="text-xs text-slate-400">Constrained decoding guarantees valid JSON output matching your JSON Schema.</p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Production Design Principles:
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {GPT_4O_MINI_SPECS.keyHighlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>Cost Structure</span>
            </h3>

            <div className="space-y-3 text-xs font-mono">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">INPUT TOKENS</span>
                <span className="text-lg font-bold text-emerald-400">$0.150</span>
                <span className="text-slate-400 block text-[10px]">per 1,000,000 tokens</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">OUTPUT TOKENS</span>
                <span className="text-lg font-bold text-emerald-400">$0.600</span>
                <span className="text-slate-400 block text-[10px]">per 1,000,000 tokens</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">CACHED PROMPT READS</span>
                <span className="text-lg font-bold text-teal-400">$0.075</span>
                <span className="text-slate-400 block text-[10px]">50% discount on prompt cache hits</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Tokenization & o200k */}
      {activeTab === 'tokenization' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              <span>o200k_base Tokenizer Advantage</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              GPT-4o mini utilizes OpenAI’s updated <strong>o200k_base</strong> tokenizer (200,000 token vocabulary vs 100,000 in GPT-3.5 and earlier GPT-4 models). This dramatically reduces token counts for non-English languages and code by 15% to 40%, yielding faster throughput and direct cost savings on top of low pricing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-semibold">Non-English Text</span>
              <div className="text-xl font-bold text-emerald-400">15% - 40% Fewer Tokens</div>
              <p className="text-[11px] text-slate-400">Substantially higher token density for Japanese, Hindi, Arabic, Korean, and Chinese.</p>
            </div>

            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-semibold">Structured Code</span>
              <div className="text-xl font-bold text-cyan-400">10% - 20% Fewer Tokens</div>
              <p className="text-[11px] text-slate-400">Common programming keywords, braces, and indentation chunks represented compactly.</p>
            </div>

            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-semibold">Prompt Caching</span>
              <div className="text-xl font-bold text-teal-400">Automatic 50% Off</div>
              <p className="text-[11px] text-slate-400">Prefixes &ge; 1,024 tokens are cached automatically by OpenAI with zero code changes.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
