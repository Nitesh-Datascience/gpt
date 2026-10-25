import React, { useState, useRef } from 'react';
import { 
  Play, 
  Square, 
  RotateCcw, 
  Copy, 
  Check, 
  Code, 
  FileJson, 
  Image as ImageIcon, 
  Trash2, 
  Sliders, 
  Sparkles, 
  Zap, 
  Clock, 
  DollarSign, 
  Cpu, 
  ChevronDown, 
  ChevronUp, 
  Layers,
  HelpCircle,
  Braces
} from 'lucide-react';
import { GenerationMetrics, GenerationResult } from '../types';
import { PROMPT_TEMPLATES } from '../data/modelsData';

interface PlaygroundProps {
  openAiApiKey: string;
  initialTemplateId?: string | null;
  onClearInitialTemplate?: () => void;
}

export const Playground: React.FC<PlaygroundProps> = ({
  openAiApiKey,
  initialTemplateId,
  onClearInitialTemplate,
}) => {
  const [model, setModel] = useState<'gpt-4o-mini' | 'gemini-3.8-flash'>('gpt-4o-mini');
  const [systemPrompt, setSystemPrompt] = useState('You are GPT-4o mini, a versatile, ultra-fast, and precise AI assistant.');
  const [showSystemPrompt, setShowSystemPrompt] = useState(true);
  const [userPrompt, setUserPrompt] = useState(
    'Write a concise TypeScript function to validate and normalize international phone numbers (E.164 format) with regex and helpful error messages.'
  );
  const [temperature, setTemperature] = useState<number>(0.7);
  const [maxTokens, setMaxTokens] = useState<number>(2048);
  const [jsonMode, setJsonMode] = useState<boolean>(false);
  const [jsonSchema, setJsonSchema] = useState<string>('{\n  "type": "object",\n  "properties": {\n    "result": { "type": "string" },\n    "confidence": { "type": "number" }\n  },\n  "required": ["result"]\n}');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [codeExportOpen, setCodeExportOpen] = useState<boolean>(false);
  const [activeCodeLang, setActiveCodeLang] = useState<'python' | 'curl' | 'node'>('python');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle template selection if triggered
  React.useEffect(() => {
    if (initialTemplateId) {
      const template = PROMPT_TEMPLATES.find((t) => t.id === initialTemplateId);
      if (template) {
        setSystemPrompt(template.systemPrompt);
        setUserPrompt(template.userPrompt);
        setJsonMode(Boolean(template.jsonMode));
        if (template.jsonSchema) {
          setJsonSchema(template.jsonSchema);
        }
      }
      onClearInitialTemplate?.();
    }
  }, [initialTemplateId, onClearInitialTemplate]);

  // Image Upload Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Sample Image Loaders
  const loadSampleImage = (type: 'diagram' | 'receipt') => {
    // Generates an SVG data URL sample
    if (type === 'diagram') {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="300" viewBox="0 0 600 300">
        <rect width="600" height="300" fill="#0f172a" />
        <rect x="50" y="100" width="120" height="80" rx="8" fill="#10b981" />
        <text x="110" y="145" fill="#ffffff" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">Client App</text>
        <path d="M 170 140 L 250 140" stroke="#38bdf8" stroke-width="3" marker-end="url(#arrow)" />
        <rect x="250" y="100" width="130" height="80" rx="8" fill="#3b82f6" />
        <text x="315" y="135" fill="#ffffff" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">GPT-4o mini</text>
        <text x="315" y="155" fill="#bae6fd" font-family="sans-serif" font-size="11" text-anchor="middle">128K Context</text>
        <path d="M 380 140 L 460 140" stroke="#38bdf8" stroke-width="3" />
        <rect x="460" y="100" width="100" height="80" rx="8" fill="#8b5cf6" />
        <text x="510" y="145" fill="#ffffff" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">PostgreSQL</text>
        <text x="300" y="240" fill="#94a3b8" font-family="sans-serif" font-size="13" text-anchor="middle">Microservice Architecture Schema</text>
      </svg>`;
      setSelectedImage(`data:image/svg+xml;base64,${btoa(svg)}`);
      setUserPrompt('Analyze this architecture diagram. What are the key components, data flow directions, and how can latency be minimized?');
    } else {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="350" viewBox="0 0 400 350">
        <rect width="400" height="350" fill="#ffffff" />
        <text x="200" y="40" fill="#000" font-family="monospace" font-size="18" font-weight="bold" text-anchor="middle">COFFEE ROASTERS LAB</text>
        <text x="200" y="65" fill="#666" font-family="monospace" font-size="12" text-anchor="middle">Order #4092 - Table 4</text>
        <line x1="30" y1="85" x2="370" y2="85" stroke="#333" stroke-dasharray="4" />
        <text x="30" y="120" fill="#000" font-family="monospace" font-size="14">2x Cortado Oat Milk</text>
        <text x="370" y="120" fill="#000" font-family="monospace" font-size="14" text-anchor="end">$11.00</text>
        <text x="30" y="150" fill="#000" font-family="monospace" font-size="14">1x Almond Croissant</text>
        <text x="370" y="150" fill="#000" font-family="monospace" font-size="14" text-anchor="end">$4.75</text>
        <text x="30" y="180" fill="#000" font-family="monospace" font-size="14">1x Cold Brew Nitro</text>
        <text x="370" y="180" fill="#000" font-family="monospace" font-size="14" text-anchor="end">$5.50</text>
        <line x1="30" y1="210" x2="370" y2="210" stroke="#333" />
        <text x="30" y="240" fill="#000" font-family="monospace" font-size="14">Subtotal</text>
        <text x="370" y="240" fill="#000" font-family="monospace" font-size="14" text-anchor="end">$21.25</text>
        <text x="30" y="265" fill="#000" font-family="monospace" font-size="14">Tax (8.25%)</text>
        <text x="370" y="265" fill="#000" font-family="monospace" font-size="14" text-anchor="end">$1.75</text>
        <text x="30" y="300" fill="#000" font-family="monospace" font-size="16" font-weight="bold">TOTAL DUE</text>
        <text x="370" y="300" fill="#000" font-family="monospace" font-size="16" font-weight="bold" text-anchor="end">$23.00</text>
      </svg>`;
      setSelectedImage(`data:image/svg+xml;base64,${btoa(svg)}`);
      setUserPrompt('Extract all line items, tax, total due, and merchant name from this receipt into strict JSON format.');
      setJsonMode(true);
    }
  };

  const handleGenerate = async () => {
    if (!userPrompt.trim() && !selectedImage) return;

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          prompt: userPrompt,
          systemInstruction: showSystemPrompt ? systemPrompt : '',
          temperature,
          maxTokens,
          jsonMode,
          jsonSchema: jsonMode ? jsonSchema : undefined,
          imageBase64: selectedImage || undefined,
          openAiApiKey: openAiApiKey || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Generation failed');
      }

      setResult({
        text: data.text,
        metrics: {
          latencyMs: data.latencyMs,
          promptTokens: data.promptTokens,
          completionTokens: data.completionTokens,
          totalTokens: data.totalTokens,
          tokensPerSecond: data.tokensPerSecond,
          estimatedCostUsd: data.estimatedCostUsd,
          model: data.model,
          isRealOpenAi: data.isRealOpenAi,
        },
      });
    } catch (err: any) {
      setResult({
        text: '',
        error: err.message || 'Error executing request.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const estTokens = Math.ceil((userPrompt.length + (showSystemPrompt ? systemPrompt.length : 0)) / 3.8);
  const estCost = ((estTokens / 1_000_000) * 0.15).toFixed(6);

  return (
    <div className="space-y-6">
      {/* Top Banner: Quick Template Pills */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 shrink-0">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Quick Prompts:</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {PROMPT_TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.id}
              onClick={() => {
                setSystemPrompt(tmpl.systemPrompt);
                setUserPrompt(tmpl.userPrompt);
                setJsonMode(Boolean(tmpl.jsonMode));
                if (tmpl.jsonSchema) setJsonSchema(tmpl.jsonSchema);
              }}
              className="px-2.5 py-1 text-xs rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 hover:text-white whitespace-nowrap transition"
            >
              {tmpl.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Prompting Canvas (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* System Prompt (Collapsible) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-lg transition">
            <button
              onClick={() => setShowSystemPrompt(!showSystemPrompt)}
              className="w-full px-4 py-2.5 bg-slate-950/60 flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-white transition"
            >
              <div className="flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                <span>System Instructions</span>
                <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                  Persona & Constraints
                </span>
              </div>
              {showSystemPrompt ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {showSystemPrompt && (
              <div className="p-4 bg-slate-900/60 border-t border-slate-800/80 space-y-2">
                <textarea
                  rows={2}
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="Define model behavior, instructions, formatting standards..."
                  className="w-full bg-slate-950 border border-slate-700/70 rounded-xl p-3 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
                <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] text-slate-400">
                  <span className="text-slate-400">Roles:</span>
                  {[
                    { label: 'Senior Engineer', p: 'You are an elite Senior Staff Software Engineer. Write concise, optimal, production-grade code with error handling.' },
                    { label: 'JSON Extractor', p: 'Extract information precisely into the requested JSON schema. Never include conversational preface.' },
                    { label: 'Socratic Tutor', p: 'Guide the user to the answer using Socratic questioning, clarity, and foundational intuition.' },
                  ].map((role) => (
                    <button
                      key={role.label}
                      type="button"
                      onClick={() => setSystemPrompt(role.p)}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                    >
                      {role.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Prompt Editor */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>User Prompt</span>
              </label>
              <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                <span>~{estTokens} tokens</span>
                <span>•</span>
                <span>${estCost} prompt cost</span>
              </div>
            </div>

            <textarea
              rows={6}
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="Enter your prompt here..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 leading-relaxed font-sans"
            />

            {/* Multimodal Attachment & Samples Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 hover:text-white transition"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Attach Image (Vision)</span>
                </button>

                <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="text-slate-400 text-[11px]">Samples:</span>
                  <button
                    type="button"
                    onClick={() => loadSampleImage('diagram')}
                    className="text-[11px] px-2 py-0.5 rounded bg-slate-800/60 hover:bg-slate-800 text-cyan-300"
                  >
                    Arch Diagram
                  </button>
                  <button
                    type="button"
                    onClick={() => loadSampleImage('receipt')}
                    className="text-[11px] px-2 py-0.5 rounded bg-slate-800/60 hover:bg-slate-800 text-teal-300"
                  >
                    Receipt
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setUserPrompt('');
                    setSelectedImage(null);
                    setResult(null);
                  }}
                  className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
                  title="Clear Prompt"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isLoading || (!userPrompt.trim() && !selectedImage)}
                  className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold shadow-lg transition-all ${
                    isLoading || (!userPrompt.trim() && !selectedImage)
                      ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/25 active:scale-95'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Run Prompt</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Attached Image Preview */}
            {selectedImage && (
              <div className="relative inline-block mt-2 p-1.5 bg-slate-950 border border-slate-700 rounded-xl">
                <img
                  src={selectedImage}
                  alt="Prompt Attachment"
                  className="h-28 rounded-lg object-contain bg-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-2 -right-2 p-1 bg-red-600 hover:bg-red-500 text-white rounded-full shadow-md"
                  title="Remove image"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Model Output Canvas */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
                <span className="text-xs font-semibold text-slate-200">Model Output</span>
                {result?.metrics && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-emerald-500/20">
                    {result.metrics.model}
                  </span>
                )}
              </div>

              {result?.text && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCodeExportOpen(!codeExportOpen)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200 bg-slate-800/80 rounded-lg border border-slate-700/60 transition"
                  >
                    <Code className="w-3.5 h-3.5" />
                    <span>View Code</span>
                  </button>
                  <button
                    onClick={() => handleCopy(result.text)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200 bg-slate-800/80 rounded-lg border border-slate-700/60 transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Content Display */}
            {isLoading ? (
              <div className="py-16 flex flex-col items-center justify-center space-y-3 text-slate-400">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-2 border-emerald-500/30 border-t-emerald-400 animate-spin" />
                  <Cpu className="w-5 h-5 text-emerald-400 absolute inset-0 m-auto" />
                </div>
                <p className="text-xs font-mono text-slate-400">GPT-4o mini inferencing...</p>
              </div>
            ) : result?.error ? (
              <div className="p-4 bg-red-950/30 border border-red-800/50 rounded-xl text-red-300 text-xs">
                <p className="font-semibold mb-1">Execution Error:</p>
                <p className="font-mono">{result.error}</p>
              </div>
            ) : result?.text ? (
              <div className="space-y-4">
                <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800/90 text-sm text-slate-200 font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-[500px]">
                  {result.text}
                </div>

                {/* Telemetry Metric Badges */}
                {result.metrics && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/50 p-3.5 rounded-xl border border-slate-800 text-xs font-mono">
                    <div className="space-y-0.5">
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>LATENCY</span>
                      </div>
                      <div className="font-semibold text-slate-200">
                        {result.metrics.latencyMs} ms
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Zap className="w-3 h-3 text-emerald-400" />
                        <span>SPEED</span>
                      </div>
                      <div className="font-semibold text-emerald-400">
                        {result.metrics.tokensPerSecond} tok/s
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Layers className="w-3 h-3 text-cyan-400" />
                        <span>TOKENS</span>
                      </div>
                      <div className="font-semibold text-slate-200">
                        {result.metrics.completionTokens} out / {result.metrics.promptTokens} in
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-emerald-400" />
                        <span>EST. COST</span>
                      </div>
                      <div className="font-semibold text-emerald-400">
                        ${result.metrics.estimatedCostUsd.toFixed(6)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400 text-xs space-y-2">
                <Cpu className="w-8 h-8 text-slate-700 mx-auto" />
                <p>Run a prompt above to see GPT-4o mini inference and token metrics.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Parameters & Settings (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Model Card & Selector */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>Model Selection</span>
            </h4>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setModel('gpt-4o-mini')}
                className={`w-full p-3 rounded-xl border text-left transition flex items-start justify-between ${
                  model === 'gpt-4o-mini'
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-white shadow-md'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="font-semibold text-sm flex items-center gap-1.5">
                    <span>GPT-4o mini</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400">
                      OpenAI
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    128k context • $0.15 / $0.60 per 1M • Vision & Tool Calling
                  </div>
                </div>
                {model === 'gpt-4o-mini' && <Check className="w-4 h-4 text-emerald-400 mt-0.5" />}
              </button>

              <button
                type="button"
                onClick={() => setModel('gemini-3.8-flash')}
                className={`w-full p-3 rounded-xl border text-left transition flex items-start justify-between ${
                  model === 'gemini-3.8-flash'
                    ? 'bg-cyan-950/40 border-cyan-500/50 text-white shadow-md'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="font-semibold text-sm flex items-center gap-1.5">
                    <span>Gemini 3.8 Flash</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-400">
                      Google
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    1M context • $0.10 / $0.40 per 1M • Native Multimodal
                  </div>
                </div>
                {model === 'gemini-3.8-flash' && <Check className="w-4 h-4 text-cyan-400 mt-0.5" />}
              </button>
            </div>
          </div>

          {/* Hyperparameters Dial */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              <span>Inference Parameters</span>
            </h4>

            {/* Temperature */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Temperature</span>
                <span className="font-mono text-emerald-400 font-semibold">{temperature}</span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0.0 (Strict / Code)</span>
                <span>0.7 (Balanced)</span>
                <span>2.0 (Creative)</span>
              </div>
            </div>

            {/* Max Output Tokens */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Max Output Tokens</span>
                <span className="font-mono text-emerald-400 font-semibold">{maxTokens}</span>
              </div>
              <input
                type="range"
                min="256"
                max="4096"
                step="256"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>256 (Snippet)</span>
                <span>2048</span>
                <span>4096 (Full Doc)</span>
              </div>
            </div>
          </div>

          {/* Structured Outputs / JSON Schema Mode */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileJson className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-slate-200">Structured Output (JSON)</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={jsonMode}
                  onChange={(e) => setJsonMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              GPT-4o mini offers 100% adherence to defined JSON Schemas with strict grammar validation.
            </p>

            {jsonMode && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Schema (JSON Schema format):</span>
                  <button
                    type="button"
                    onClick={() => {
                      setJsonSchema(
                        JSON.stringify(
                          {
                            type: 'object',
                            properties: {
                              summary: { type: 'string' },
                              sentiment: { type: 'string', enum: ['positive', 'neutral', 'negative'] },
                              tags: { type: 'array', items: { type: 'string' } },
                            },
                            required: ['summary', 'sentiment', 'tags'],
                          },
                          null,
                          2
                        )
                      );
                    }}
                    className="text-emerald-400 hover:underline"
                  >
                    Reset Preset
                  </button>
                </div>
                <textarea
                  rows={5}
                  value={jsonSchema}
                  onChange={(e) => setJsonSchema(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-[11px] font-mono text-emerald-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Code Export Modal */}
      {codeExportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white font-semibold text-sm">
                <Code className="w-4 h-4 text-emerald-400" />
                <span>Executable API Integration Code</span>
              </div>
              <button
                onClick={() => setCodeExportOpen(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800"
              >
                Close
              </button>
            </div>

            <div className="flex gap-2 text-xs">
              {(['python', 'node', 'curl'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveCodeLang(lang)}
                  className={`px-3 py-1.5 rounded-lg uppercase font-semibold transition ${
                    activeCodeLang === lang
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto max-h-96">
              {activeCodeLang === 'python' && `from openai import OpenAI
client = OpenAI()

response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "system", "content": ${JSON.stringify(systemPrompt)}},
        {"role": "user", "content": ${JSON.stringify(userPrompt)}}
    ],
    temperature=${temperature},
    max_tokens=${maxTokens}${jsonMode ? `,\n    response_format={"type": "json_object"}` : ''}
)

print(response.choices[0].message.content)`}

              {activeCodeLang === 'node' && `import OpenAI from "openai";
const openai = new OpenAI();

async function main() {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: ${JSON.stringify(systemPrompt)} },
      { role: "user", content: ${JSON.stringify(userPrompt)} }
    ],
    temperature: ${temperature},
    max_tokens: ${maxTokens}${jsonMode ? `,\n    response_format: { type: "json_object" }` : ''}
  });

  console.log(completion.choices[0].message.content);
}

main();`}

              {activeCodeLang === 'curl' && `curl https://api.openai.com/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $OPENAI_API_KEY" \\
  -d '{
    "model": "gpt-4o-mini",
    "messages": [
      {"role": "system", "content": ${JSON.stringify(systemPrompt)}},
      {"role": "user", "content": ${JSON.stringify(userPrompt)}}
    ],
    "temperature": ${temperature},
    "max_tokens": ${maxTokens}
  }'`}
            </pre>

            <div className="flex justify-end">
              <button
                onClick={() => {
                  let text = '';
                  if (activeCodeLang === 'python') text = `from openai import OpenAI...`;
                  // copy active
                  navigator.clipboard.writeText(
                    activeCodeLang === 'python'
                      ? `from openai import OpenAI\nclient = OpenAI()\n\nresponse = client.chat.completions.create(\n    model="gpt-4o-mini",\n    messages=[\n        {"role": "system", "content": ${JSON.stringify(systemPrompt)}},\n        {"role": "user", "content": ${JSON.stringify(userPrompt)}}\n    ],\n    temperature=${temperature},\n    max_tokens=${maxTokens}\n)\nprint(response.choices[0].message.content)`
                      : `curl https://api.openai.com/v1/chat/completions ...`
                  );
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-slate-950 font-semibold text-xs rounded-xl"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
