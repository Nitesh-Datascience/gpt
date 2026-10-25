import React, { useState } from 'react';
import { 
  Wrench, 
  Play, 
  Check, 
  Code, 
  FileCode, 
  CheckCircle2, 
  Sparkles, 
  Cpu, 
  Copy, 
  Plus, 
  Trash2,
  Terminal
} from 'lucide-react';
import { PRESET_TOOLS } from '../data/modelsData';
import { ToolDefinition } from '../types';

export const ToolSimulator: React.FC = () => {
  const [selectedTools, setSelectedTools] = useState<ToolDefinition[]>(PRESET_TOOLS);
  const [userQuery, setUserQuery] = useState(
    'Alert the on-call engineer in #ops-incidents that database replica-02 latency spiked to 4500ms. Severity is critical!'
  );
  const [isRunning, setIsRunning] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const testPrompts = [
    {
      label: 'Slack Alert Trigger',
      text: 'Alert the on-call engineer in #ops-incidents that database replica-02 latency spiked to 4500ms. Severity is critical!',
    },
    {
      label: 'Stock Quote Check',
      text: 'What is the current stock price of NVDA? Also include its 50-day moving average indicators.',
    },
    {
      label: 'Vector Search Query',
      text: 'Find internal engineering docs regarding JWT token rotation policy and security expiration guidelines, retrieve top 5 results.',
    },
    {
      label: 'Direct Question (No Tool)',
      text: 'What is the capital of Australia?',
    },
  ];

  const handleRunSimulation = async () => {
    if (!userQuery.trim()) return;
    setIsRunning(true);
    setSimulationResult(null);

    try {
      const response = await fetch('/api/simulate-tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userQuery,
          tools: selectedTools,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Simulation failed');
      setSimulationResult(data.result);
    } catch (err: any) {
      setSimulationResult({ error: err.message });
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Wrench className="w-3.5 h-3.5" />
            <span>Interactive Function Calling Sandbox</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            GPT-4o mini Tool & Schema Dispatcher
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Test GPT-4o mini's tool-calling engine. Provide structured tool definitions with JSON schemas and observe how the model extracts parameters, formats arguments, and chooses appropriate function calls.
          </p>
        </div>

        {/* Quick prompt chips */}
        <div className="mt-5 flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 border-t border-slate-800/80">
          <span className="text-[11px] font-semibold text-slate-400 shrink-0">Sample Queries:</span>
          {testPrompts.map((p) => (
            <button
              key={p.label}
              onClick={() => setUserQuery(p.text)}
              className="px-3 py-1 rounded-xl text-xs bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 hover:text-white whitespace-nowrap transition"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Tools Available (Left 5) & Query / Output (Right 7) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Available Tools Config */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>Registered Tools ({selectedTools.length})</span>
            </h3>
          </div>

          <div className="space-y-3">
            {selectedTools.map((tool) => (
              <div
                key={tool.name}
                className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-emerald-400">{tool.name}()</span>
                  <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                    JSON Schema
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  {tool.description}
                </p>

                <div className="pt-2 border-t border-slate-800/60">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">Parameters:</span>
                  <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
                    {Object.entries(tool.parameters.properties).map(([key, prop]) => (
                      <span key={key} className="bg-slate-900 px-2 py-0.5 rounded text-cyan-300 border border-slate-800">
                        {key}: <span className="text-slate-400">{prop.type}</span>
                        {tool.parameters.required?.includes(key) && (
                          <span className="text-amber-400 ml-1 font-bold">*</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Query & Execution Sandbox */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
            <h3 className="font-bold text-white text-base flex items-center justify-between">
              <span>Test User Message</span>
              <span className="text-xs text-slate-400 font-normal">Natural language input</span>
            </h3>

            <textarea
              rows={3}
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              placeholder="Enter instructions for the model to trigger a tool..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 leading-relaxed font-sans"
            />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleRunSimulation}
                disabled={isRunning || !userQuery.trim()}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg ${
                  isRunning || !userQuery.trim()
                    ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/20 active:scale-95'
                }`}
              >
                {isRunning ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Resolving Tool Call...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Execute Tool Resolver</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Model Tool Call Output */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-white text-sm">Dispatched Tool Decision</span>
              </div>
              {simulationResult && (
                <button
                  onClick={() => handleCopy(JSON.stringify(simulationResult, null, 2))}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-400 hover:text-white bg-slate-800 rounded-lg"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                </button>
              )}
            </div>

            {isRunning ? (
              <div className="py-16 flex flex-col items-center justify-center text-slate-400 space-y-2">
                <div className="w-8 h-8 rounded-full border-2 border-emerald-400/30 border-t-emerald-400 animate-spin" />
                <span className="text-xs font-mono text-slate-400">Evaluating schema matching...</span>
              </div>
            ) : simulationResult?.toolCall ? (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Tool Invoked Successfully:</span>
                    <span className="font-mono bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/40">
                      {simulationResult.toolCall.name}
                    </span>
                  </div>
                  {simulationResult.reasoning && (
                    <p className="text-xs text-slate-300 italic">
                      "{simulationResult.reasoning}"
                    </p>
                  )}
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Extracted Arguments (Strict JSON Schema):
                  </span>
                  <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto">
                    {JSON.stringify(simulationResult.toolCall.arguments, null, 2)}
                  </pre>
                </div>
              </div>
            ) : simulationResult?.directAnswer ? (
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-slate-400">
                  No Tool Call Required (Direct Answer):
                </span>
                <p className="text-sm text-slate-200">
                  {simulationResult.directAnswer}
                </p>
              </div>
            ) : (
              <div className="py-16 text-center text-xs text-slate-400">
                Click "Execute Tool Resolver" to test schema dispatch.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
