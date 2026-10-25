import React, { useState } from 'react';
import { 
  Calculator, 
  DollarSign, 
  TrendingDown, 
  Sliders, 
  ArrowDownRight, 
  Sparkles,
  PieChart,
  Check
} from 'lucide-react';

export const CostCalculator: React.FC = () => {
  const [requestsPerMonth, setRequestsPerMonth] = useState<number>(500000);
  const [promptTokens, setPromptTokens] = useState<number>(800);
  const [completionTokens, setCompletionTokens] = useState<number>(300);
  const [cacheHitPercent, setCacheHitPercent] = useState<number>(20);

  // Compute total monthly tokens in Millions
  const totalPromptTokensM = (requestsPerMonth * promptTokens) / 1_000_000;
  const totalCompletionTokensM = (requestsPerMonth * completionTokens) / 1_000_000;

  const cachedPromptTokensM = totalPromptTokensM * (cacheHitPercent / 100);
  const uncachedPromptTokensM = totalPromptTokensM - cachedPromptTokensM;

  // Model pricing profiles (per 1M tokens)
  const models = [
    {
      id: 'gpt-4o-mini',
      name: 'GPT-4o mini',
      provider: 'OpenAI',
      promptPrice: 0.15,
      cachedPromptPrice: 0.075,
      completionPrice: 0.60,
      highlight: true,
      color: 'emerald',
    },
    {
      id: 'gemini-3.8-flash',
      name: 'Gemini 3.8 Flash',
      provider: 'Google',
      promptPrice: 0.10,
      cachedPromptPrice: 0.025,
      completionPrice: 0.40,
      highlight: false,
      color: 'cyan',
    },
    {
      id: 'gpt-35-turbo',
      name: 'GPT-3.5 Turbo (Legacy)',
      provider: 'OpenAI',
      promptPrice: 0.50,
      cachedPromptPrice: 0.50, // No prompt caching
      completionPrice: 1.50,
      highlight: false,
      color: 'slate',
    },
    {
      id: 'claude-35-haiku',
      name: 'Claude 3.5 Haiku',
      provider: 'Anthropic',
      promptPrice: 0.80,
      cachedPromptPrice: 0.08,
      completionPrice: 4.00,
      highlight: false,
      color: 'amber',
    },
    {
      id: 'gpt-4o',
      name: 'GPT-4o (Frontier)',
      provider: 'OpenAI',
      promptPrice: 2.50,
      cachedPromptPrice: 1.25,
      completionPrice: 10.00,
      highlight: false,
      color: 'purple',
    },
  ];

  const calculated = models.map((m) => {
    const promptCost = (uncachedPromptTokensM * m.promptPrice) + (cachedPromptTokensM * m.cachedPromptPrice);
    const completionCost = totalCompletionTokensM * m.completionPrice;
    const monthlyTotal = promptCost + completionCost;
    const annualTotal = monthlyTotal * 12;
    return {
      ...m,
      monthlyTotal,
      annualTotal,
      promptCost,
      completionCost,
    };
  });

  const gpt4oMiniCost = calculated.find((c) => c.id === 'gpt-4o-mini')?.monthlyTotal || 1;
  const gpt35Cost = calculated.find((c) => c.id === 'gpt-35-turbo')?.monthlyTotal || 1;
  const gpt4oCost = calculated.find((c) => c.id === 'gpt-4o')?.monthlyTotal || 1;

  const savingsVs35Monthly = gpt35Cost - gpt4oMiniCost;
  const savingsVs35Annual = savingsVs35Monthly * 12;
  const savingsVs4oAnnual = (gpt4oCost - gpt4oMiniCost) * 12;

  const maxCost = Math.max(...calculated.map((c) => c.monthlyTotal));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <Calculator className="w-3.5 h-3.5" />
              <span>Interactive Token Economics Simulator</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              GPT-4o mini Cost & ROI Calculator
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Model your application's projected workload. See how GPT-4o mini's $0.15 / $0.60 per million token pricing and automatic 50% prompt caching reduce cloud expenditure.
            </p>
          </div>

          {/* Quick Summary Badge */}
          <div className="bg-emerald-950/40 border border-emerald-500/30 p-4 rounded-2xl shrink-0 text-left space-y-1">
            <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block">
              Annual Savings vs GPT-3.5
            </span>
            <span className="text-2xl font-black text-white block">
              +${savingsVs35Annual.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </span>
            <span className="text-[11px] text-emerald-300/80 block">
              60% - 70% cheaper while outscoring on all benchmarks
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Sliders (Left 5 cols) + Results (Right 7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders Control Panel */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span>Workload Parameters</span>
          </h3>

          {/* Monthly Requests */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Monthly API Requests</span>
              <span className="font-mono text-emerald-400 font-bold">
                {requestsPerMonth.toLocaleString()} reqs
              </span>
            </div>
            <input
              type="range"
              min="10000"
              max="5000000"
              step="10000"
              value={requestsPerMonth}
              onChange={(e) => setRequestsPerMonth(parseInt(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>10K (Startup)</span>
              <span>1M (Growth)</span>
              <span>5M+ (Enterprise)</span>
            </div>
          </div>

          {/* Average Prompt Tokens */}
          <div className="space-y-2 pt-3 border-t border-slate-800/80">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Avg Prompt Tokens / Req</span>
              <span className="font-mono text-emerald-400 font-bold">
                {promptTokens.toLocaleString()} tokens
              </span>
            </div>
            <input
              type="range"
              min="100"
              max="8000"
              step="100"
              value={promptTokens}
              onChange={(e) => setPromptTokens(parseInt(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>100 (Short query)</span>
              <span>1,500 (RAG context)</span>
              <span>8,000 (Docs)</span>
            </div>
          </div>

          {/* Average Completion Tokens */}
          <div className="space-y-2 pt-3 border-t border-slate-800/80">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Avg Completion Tokens / Req</span>
              <span className="font-mono text-emerald-400 font-bold">
                {completionTokens.toLocaleString()} tokens
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="2000"
              step="50"
              value={completionTokens}
              onChange={(e) => setCompletionTokens(parseInt(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>50 (Classification)</span>
              <span>500 (Detailed response)</span>
              <span>2,000 (Code/Essay)</span>
            </div>
          </div>

          {/* Prompt Cache Hit Ratio */}
          <div className="space-y-2 pt-3 border-t border-slate-800/80">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Prompt Cache Hit Ratio</span>
              <span className="font-mono text-teal-400 font-bold">{cacheHitPercent}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="80"
              step="5"
              value={cacheHitPercent}
              onChange={(e) => setCacheHitPercent(parseInt(e.target.value))}
              className="w-full accent-teal-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0% (Unique prompts)</span>
              <span>30% (Standard system prompt)</span>
              <span>80% (Static agent)</span>
            </div>
          </div>

          {/* Monthly token volume tally */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs font-mono space-y-1">
            <div className="flex justify-between text-slate-400">
              <span>Monthly Prompt Tokens:</span>
              <span className="text-slate-200 font-bold">{totalPromptTokensM.toFixed(2)} M</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Monthly Completion Tokens:</span>
              <span className="text-slate-200 font-bold">{totalCompletionTokensM.toFixed(2)} M</span>
            </div>
          </div>
        </div>

        {/* Results & Comparative Table (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-5">
            <h3 className="font-bold text-white text-base flex items-center justify-between">
              <span>Comparative Monthly Cost Breakdown</span>
              <span className="text-xs text-slate-400 font-normal">Ranked by lowest cost</span>
            </h3>

            {/* Model Comparison Cards */}
            <div className="space-y-3">
              {calculated
                .sort((a, b) => a.monthlyTotal - b.monthlyTotal)
                .map((m) => {
                  const isGpt4oMini = m.id === 'gpt-4o-mini';
                  const percentOfMax = (m.monthlyTotal / maxCost) * 100;

                  return (
                    <div
                      key={m.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isGpt4oMini
                          ? 'bg-emerald-950/30 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/30'
                          : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{m.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                            {m.provider}
                          </span>
                          {isGpt4oMini && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              Selected Model
                            </span>
                          )}
                        </div>

                        <div className="text-right">
                          <div className={`font-mono text-base font-bold ${isGpt4oMini ? 'text-emerald-400' : 'text-slate-200'}`}>
                            ${m.monthlyTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            <span className="text-xs text-slate-400 font-normal"> / mo</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            ${m.annualTotal.toLocaleString('en-US', { maximumFractionDigits: 0 })} / year
                          </div>
                        </div>
                      </div>

                      {/* Bar indicator */}
                      <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isGpt4oMini ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-slate-600'
                          }`}
                          style={{ width: `${Math.max(percentOfMax, 2)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Savings Callout */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-emerald-400">
                <Sparkles className="w-4 h-4" />
                <span>Executive Summary:</span>
              </div>
              <p className="leading-relaxed text-slate-400">
                Migrating a workload of <strong>{requestsPerMonth.toLocaleString()} requests/month</strong> from legacy GPT-3.5 Turbo to <strong>GPT-4o mini</strong> yields an estimated annual saving of <strong>${savingsVs35Annual.toLocaleString('en-US', { maximumFractionDigits: 0 })}</strong> while unlocking 128k context, multimodal vision, and vastly higher coding benchmarks.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
