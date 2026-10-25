import React, { useState, useEffect } from 'react';
import { GameShell } from './game/GameShell';
import { Navbar } from './components/Navbar';
import { Playground } from './components/Playground';
import { BattleArena } from './components/BattleArena';
import { BenchmarkExplorer } from './components/BenchmarkExplorer';
import { CostCalculator } from './components/CostCalculator';
import { ToolSimulator } from './components/ToolSimulator';
import { PromptCookbook } from './components/PromptCookbook';
import { ApiKeyModal } from './components/ApiKeyModal';
import { AppTab } from './types';
import { Gamepad2, Sparkles, Cpu, ExternalLink, ShieldCheck } from 'lucide-react';

export default function App() {
  // Mode: 'game' (default full-viewport Game Shell) | 'studio' (GPT-4o mini Dev Lab)
  const [appMode, setAppMode] = useState<'game' | 'studio'>('game');
  const [activeTab, setActiveTab] = useState<AppTab>('playground');
  const [openAiApiKey, setOpenAiApiKey] = useState<string>('');
  const [isKeyModalOpen, setIsKeyModalOpen] = useState<boolean>(false);
  const [loadedTemplateId, setLoadedTemplateId] = useState<string | null>(null);

  // Load saved OpenAI API key from localStorage
  useEffect(() => {
    try {
      const savedKey = localStorage.getItem('gpt4o_mini_openai_key');
      if (savedKey) {
        setOpenAiApiKey(savedKey);
      }
    } catch {
      // Ignored
    }
  }, []);

  const handleSaveKey = (key: string) => {
    setOpenAiApiKey(key);
    try {
      if (key) {
        localStorage.setItem('gpt4o_mini_openai_key', key);
      } else {
        localStorage.removeItem('gpt4o_mini_openai_key');
      }
    } catch {
      // Ignored
    }
  };

  const handleClearKey = () => {
    setOpenAiApiKey('');
    try {
      localStorage.removeItem('gpt4o_mini_openai_key');
    } catch {
      // Ignored
    }
  };

  const handleLoadTemplate = (templateId: string) => {
    setLoadedTemplateId(templateId);
    setActiveTab('playground');
  };

  // Full-Viewport 3D Game Shell Mode (Default, Zero website navbars or footers)
  if (appMode === 'game') {
    return (
      <div className="relative w-screen h-screen overflow-hidden bg-slate-950">
        <GameShell />

        {/* Discreet Floating Lab Switcher (Bottom-center, collapsible, non-interfering) */}
        <div className="absolute top-4 right-4 z-40">
          <button
            onClick={() => setAppMode('studio')}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 rounded-xl text-xs font-mono backdrop-blur-sm shadow-xl transition"
            title="Open Developer Studio & Benchmarks"
          >
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Model Studio & Benchmarks</span>
          </button>
        </div>
      </div>
    );
  }

  // Developer Studio & Benchmarks Mode
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Bar with Return to 3D Game CTA */}
      <div className="bg-emerald-950/60 border-b border-emerald-500/20 px-4 py-2 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 text-emerald-300">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Developer Studio & Model Intelligence Arena</span>
        </div>
        <button
          onClick={() => setAppMode('game')}
          className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg transition"
        >
          <Gamepad2 className="w-3.5 h-3.5" />
          <span>Return to 3D Game [NANO-CORE]</span>
        </button>
      </div>

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        hasCustomKey={Boolean(openAiApiKey)}
        onOpenKeyModal={() => setIsKeyModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'playground' && (
          <Playground
            openAiApiKey={openAiApiKey}
            initialTemplateId={loadedTemplateId}
            onClearInitialTemplate={() => setLoadedTemplateId(null)}
          />
        )}

        {activeTab === 'arena' && (
          <BattleArena openAiApiKey={openAiApiKey} />
        )}

        {activeTab === 'benchmarks' && (
          <BenchmarkExplorer />
        )}

        {activeTab === 'calculator' && (
          <CostCalculator />
        )}

        {activeTab === 'tools' && (
          <ToolSimulator />
        )}

        {activeTab === 'cookbook' && (
          <PromptCookbook onLoadTemplate={handleLoadTemplate} />
        )}
      </main>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        openAiKey={openAiApiKey}
        onSaveKey={handleSaveKey}
        onClearKey={handleClearKey}
      />

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-900 bg-slate-950/80 py-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-300">GPT-4o mini Studio & Lab</span>
            <span>•</span>
            <span>128k Context Window • 16k Max Output Tokens • $0.150 / $0.600 per 1M</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Full-Stack AI Engine Active</span>
            </span>
            <span>•</span>
            <a
              href="https://platform.openai.com/docs/models/gpt-4o-mini"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-200 transition flex items-center gap-1"
            >
              <span>OpenAI Docs</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
