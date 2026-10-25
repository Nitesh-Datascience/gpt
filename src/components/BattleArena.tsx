import React, { useState } from 'react';
import { 
  Swords, 
  Play, 
  RotateCcw, 
  Clock, 
  Zap, 
  DollarSign, 
  Trophy, 
  Check, 
  Copy, 
  Sparkles,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

interface BattleArenaProps {
  openAiApiKey: string;
}

export const BattleArena: React.FC<BattleArenaProps> = ({ openAiApiKey }) => {
  const [prompt, setPrompt] = useState(
    'Implement a concurrency-limited async task queue in TypeScript (max 3 concurrent jobs). It must support .add(task), error handling, and return a Promise resolving when all queued tasks complete.'
  );
  const [isRunning, setIsRunning] = useState(false);
  const [gptResult, setGptResult] = useState<any>(null);
  const [geminiResult, setGeminiResult] = useState<any>(null);
  const [votedWinner, setVotedWinner] = useState<'gpt' | 'gemini' | 'tie' | null>(null);
  const [copiedSide, setCopiedSide] = useState<'gpt' | 'gemini' | null>(null);

  const battlePresets = [
    {
      title: 'Async Queue (TypeScript)',
      prompt: 'Implement a concurrency-limited async task queue in TypeScript (max 3 concurrent jobs). It must support .add(task), error handling, and return a Promise resolving when all queued tasks complete.',
    },
    {
      title: 'Monty Hall 4-Doors (Probability)',
      prompt: 'Suppose the Monty Hall problem has 4 doors: 1 car, 3 goats. You pick Door 1. Host opens Doors 2 and 3, revealing 2 goats. Should you switch to Door 4? Compute exact conditional probabilities.',
    },
    {
      title: 'SQL Performance Optimization',
      prompt: 'Optimize this slow SQL query that joins 15M transactions with 2M users to calculate 30-day customer churn and rolling average spend. Detail necessary composite indexes and CTE rewrites.',
    },
    {
      title: 'Cyberpunk Noir Monologue',
      prompt: 'Write a punchy, atmospheric, 120-word cyberpunk internal monologue of a synth-detective examining a neon crime alley in Neo-Shinjuku. Focus on sensory texture.',
    },
  ];

  const runBattle = async () => {
    if (!prompt.trim()) return;
    setIsRunning(true);
    setGptResult(null);
    setGeminiResult(null);
    setVotedWinner(null);

    try {
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          openAiApiKey: openAiApiKey || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Battle failed');

      setGptResult(data.gpt4oMini);
      setGeminiResult(data.geminiFlash);
    } catch (err: any) {
      setGptResult({ error: err.message });
      setGeminiResult({ error: err.message });
    } finally {
      setIsRunning(false);
    }
  };

  const copyText = (text: string, side: 'gpt' | 'gemini') => {
    navigator.clipboard.writeText(text);
    setCopiedSide(side);
    setTimeout(() => setCopiedSide(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-emerald-500/10 via-cyan-500/5 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs tracking-wider uppercase">
              <Swords className="w-4 h-4" />
              <span>Direct Model Face-off</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              GPT-4o mini vs Gemini 3.8 Flash
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Dispatch simultaneous prompt evaluations. Compare real-world code generation, mathematical reasoning, latency (ms), token velocity, and billing cost side-by-side.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/80 px-4 py-2.5 rounded-2xl border border-slate-800 shrink-0 text-xs font-mono">
            <div className="text-right">
              <span className="text-emerald-400 font-bold">GPT-4o mini</span>
              <span className="text-slate-400 block text-[10px]">$0.15 / $0.60</span>
            </div>
            <span className="text-slate-600 px-1 font-sans text-sm font-bold">VS</span>
            <div className="text-left">
              <span className="text-cyan-400 font-bold">Gemini 3.8 Flash</span>
              <span className="text-slate-400 block text-[10px]">$0.10 / $0.40</span>
            </div>
          </div>
        </div>

        {/* Preset battle chips */}
        <div className="mt-5 flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 border-t border-slate-800/80">
          <span className="text-[11px] font-semibold text-slate-400 shrink-0">Sample Challenges:</span>
          {battlePresets.map((b) => (
            <button
              key={b.title}
              onClick={() => setPrompt(b.prompt)}
              className="px-3 py-1 rounded-xl text-xs bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 hover:text-white whitespace-nowrap transition"
            >
              {b.title}
            </button>
          ))}
        </div>
      </div>

      {/* Prompt Input Box */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
        <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
          <span>Battle Prompt</span>
          <span className="text-[11px] text-slate-400 font-normal">Sent to both models simultaneously</span>
        </label>
        <textarea
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter a prompt to compare both models..."
          className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 leading-relaxed font-sans"
        />

        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => {
              setPrompt('');
              setGptResult(null);
              setGeminiResult(null);
            }}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 p-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            onClick={runBattle}
            disabled={isRunning || !prompt.trim()}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg ${
              isRunning || !prompt.trim()
                ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:opacity-95 text-slate-950 shadow-emerald-500/20 active:scale-95'
            }`}
          >
            {isRunning ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Racing Models...</span>
              </>
            ) : (
              <>
                <Swords className="w-4 h-4" />
                <span>Start Battle</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Dual Arena View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: GPT-4o mini */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
                <div>
                  <h3 className="font-bold text-sm text-white">GPT-4o mini</h3>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    OpenAI Flagship Compact
                  </span>
                </div>
              </div>

              {gptResult?.text && (
                <button
                  onClick={() => copyText(gptResult.text, 'gpt')}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-slate-400 hover:text-white bg-slate-800 rounded-lg"
                >
                  {copiedSide === 'gpt' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSide === 'gpt' ? 'Copied' : 'Copy'}</span>
                </button>
              )}
            </div>

            {/* Metrics Bar */}
            {gptResult?.latencyMs && (
              <div className="grid grid-cols-3 gap-2 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 my-3 text-[11px] font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px]">LATENCY</span>
                  <span className="font-semibold text-slate-200">{gptResult.latencyMs} ms</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">OUTPUT</span>
                  <span className="font-semibold text-slate-200">{gptResult.completionTokens} tokens</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">COST</span>
                  <span className="font-semibold text-emerald-400">${gptResult.costUsd?.toFixed(6)}</span>
                </div>
              </div>
            )}

            {/* Response Area */}
            {isRunning ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-2">
                <div className="w-8 h-8 rounded-full border-2 border-emerald-400/30 border-t-emerald-400 animate-spin" />
                <span className="text-xs font-mono text-slate-400">GPT-4o mini streaming...</span>
              </div>
            ) : gptResult?.error ? (
              <div className="p-4 bg-red-950/30 border border-red-800 rounded-xl text-xs text-red-300 font-mono mt-3">
                {gptResult.error}
              </div>
            ) : gptResult?.text ? (
              <div className="mt-3 bg-slate-950/90 rounded-xl p-4 border border-slate-800/80 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed max-h-[460px] overflow-y-auto">
                {gptResult.text}
              </div>
            ) : (
              <div className="py-20 text-center text-xs text-slate-400">
                Click "Start Battle" to run the comparison.
              </div>
            )}
          </div>

          {/* Voting Button */}
          {gptResult?.text && geminiResult?.text && (
            <button
              onClick={() => setVotedWinner('gpt')}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition ${
                votedWinner === 'gpt'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-md'
                  : 'bg-slate-950/50 text-slate-400 hover:text-slate-200 border-slate-800 hover:border-slate-700'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-emerald-400" />
              <span>{votedWinner === 'gpt' ? 'Voted Winner!' : 'Vote GPT-4o mini Best'}</span>
            </button>
          )}
        </div>

        {/* Right: Gemini 3.8 Flash */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
                <div>
                  <h3 className="font-bold text-sm text-white">Gemini 3.8 Flash</h3>
                  <span className="text-[10px] text-cyan-400 font-mono">
                    Google High-Speed Flash
                  </span>
                </div>
              </div>

              {geminiResult?.text && (
                <button
                  onClick={() => copyText(geminiResult.text, 'gemini')}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-slate-400 hover:text-white bg-slate-800 rounded-lg"
                >
                  {copiedSide === 'gemini' ? <Check className="w-3 h-3 text-cyan-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSide === 'gemini' ? 'Copied' : 'Copy'}</span>
                </button>
              )}
            </div>

            {/* Metrics Bar */}
            {geminiResult?.latencyMs && (
              <div className="grid grid-cols-3 gap-2 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 my-3 text-[11px] font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px]">LATENCY</span>
                  <span className="font-semibold text-slate-200">{geminiResult.latencyMs} ms</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">OUTPUT</span>
                  <span className="font-semibold text-slate-200">{geminiResult.completionTokens} tokens</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">COST</span>
                  <span className="font-semibold text-cyan-400">${geminiResult.costUsd?.toFixed(6)}</span>
                </div>
              </div>
            )}

            {/* Response Area */}
            {isRunning ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-2">
                <div className="w-8 h-8 rounded-full border-2 border-cyan-400/30 border-t-cyan-400 animate-spin" />
                <span className="text-xs font-mono text-slate-400">Gemini 3.8 Flash streaming...</span>
              </div>
            ) : geminiResult?.error ? (
              <div className="p-4 bg-red-950/30 border border-red-800 rounded-xl text-xs text-red-300 font-mono mt-3">
                {geminiResult.error}
              </div>
            ) : geminiResult?.text ? (
              <div className="mt-3 bg-slate-950/90 rounded-xl p-4 border border-slate-800/80 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed max-h-[460px] overflow-y-auto">
                {geminiResult.text}
              </div>
            ) : (
              <div className="py-20 text-center text-xs text-slate-400">
                Click "Start Battle" to run the comparison.
              </div>
            )}
          </div>

          {/* Voting Button */}
          {gptResult?.text && geminiResult?.text && (
            <button
              onClick={() => setVotedWinner('gemini')}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition ${
                votedWinner === 'gemini'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-md'
                  : 'bg-slate-950/50 text-slate-400 hover:text-slate-200 border-slate-800 hover:border-slate-700'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-cyan-400" />
              <span>{votedWinner === 'gemini' ? 'Voted Winner!' : 'Vote Gemini Best'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
