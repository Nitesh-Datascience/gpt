import React, { useState, useRef } from 'react';
import { GameCanvas } from './GameCanvas';
import { NanoGameEngine, PlayerStats, GameState } from './engine';
import { TacticalAIComms } from './TacticalAIComms';
import { sounds } from './audio';
import { 
  Play, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Shield, 
  Zap, 
  Bomb, 
  Dna, 
  Trophy, 
  Skull, 
  Bot, 
  Sparkles,
  HelpCircle,
  Crosshair
} from 'lucide-react';

export const GameShell: React.FC = () => {
  const engineRef = useRef<NanoGameEngine | null>(null);

  const [gameState, setGameState] = useState<GameState>('title');
  const [stats, setStats] = useState<PlayerStats>({
    hp: 100,
    maxHp: 100,
    energy: 100,
    maxEnergy: 100,
    score: 0,
    dnaCollected: 0,
    empCharges: 1,
    wave: 1,
    enemiesRemaining: 0,
  });

  const [isMuted, setIsMuted] = useState(false);
  const [isCommsOpen, setIsCommsOpen] = useState(false);

  const handleStartGame = () => {
    engineRef.current?.startGame();
  };

  const handleRestart = () => {
    engineRef.current?.restartGame();
  };

  const handleResume = () => {
    engineRef.current?.togglePause();
  };

  const toggleMute = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none text-slate-100">
      {/* 3D WebGL Canvas Layer (100% full bleed, isolated) */}
      <GameCanvas
        engineRef={engineRef}
        onStatsUpdate={setStats}
        onStateChange={setGameState}
      />

      {/* Low-Occlusion In-Game HUD (Pointer-events: none wrapper; > 85% playfield unobstructed) */}
      {gameState === 'playing' && (
        <div className="absolute inset-0 pointer-events-none p-5 sm:p-7 flex flex-col justify-between z-20">
          {/* Top Status Bar: Vitals & Radar Cluster */}
          <div className="flex items-start justify-between">
            {/* Player Vitals (Top-Left Perimeter) */}
            <div className="pointer-events-auto bg-slate-950/80 border border-emerald-500/30 p-3 rounded-2xl shadow-xl space-y-2 w-56 font-mono">
              {/* Integrity (HP) */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-300">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <Shield className="w-3.5 h-3.5" />
                    <span>HULL INTEGRITY</span>
                  </span>
                  <span className="tabular-nums text-white">
                    {Math.max(0, Math.round(stats.hp))}%
                  </span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-150 ${
                      stats.hp > 40 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.max(0, Math.min(100, stats.hp))}%` }}
                  />
                </div>
              </div>

              {/* Energy Capacitor */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-300">
                  <span className="flex items-center gap-1.5 text-cyan-400">
                    <Zap className="w-3.5 h-3.5" />
                    <span>ENERGY SHIELD</span>
                  </span>
                  <span className="tabular-nums text-white">
                    {Math.round(stats.energy)}%
                  </span>
                </div>
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-cyan-400 rounded-full transition-all duration-100"
                    style={{ width: `${Math.max(0, Math.min(100, stats.energy))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Wave & Threat Tracker (Top-Center Perimeter) */}
            <div className="pointer-events-auto bg-slate-950/80 border border-slate-800 px-5 py-2.5 rounded-2xl shadow-xl flex items-center gap-4 text-xs font-mono">
              <div className="text-center">
                <span className="text-[10px] text-slate-400 block uppercase">SECTOR WAVE</span>
                <span className="text-lg font-black text-emerald-400 tabular-nums">
                  0{stats.wave} <span className="text-xs text-slate-400">/ 05</span>
                </span>
              </div>
              <div className="w-px h-8 bg-slate-800" />
              <div className="text-center">
                <span className="text-[10px] text-slate-400 block uppercase">PATHOGENS</span>
                <span className="text-lg font-black text-pink-400 tabular-nums">
                  {stats.enemiesRemaining}
                </span>
              </div>
            </div>

            {/* Quick Actions & Comms (Top-Right Perimeter) */}
            <div className="pointer-events-auto flex items-center gap-2">
              <button
                onClick={() => setIsCommsOpen(!isCommsOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-slate-950/80 hover:bg-slate-900 border border-emerald-500/40 text-emerald-400 hover:text-emerald-300 rounded-xl text-xs font-mono shadow-xl transition"
                title="Toggle Tactical AI Comms (TAB)"
              >
                <Bot className="w-4 h-4" />
                <span className="hidden sm:inline">Tactical AI</span>
                <span className="text-[10px] bg-emerald-500/20 px-1 rounded">Tab</span>
              </button>

              <button
                onClick={toggleMute}
                className="p-2 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl shadow-xl transition"
                title="Toggle Audio (M)"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              </button>
            </div>
          </div>

          {/* Bottom Arsenal & Weapons Dock */}
          <div className="flex items-end justify-between">
            {/* Score & DNA Sample Counter (Bottom-Left) */}
            <div className="pointer-events-auto bg-slate-950/80 border border-slate-800 px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-4 text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">SCORE</span>
                <span className="text-base font-bold text-white tabular-nums">
                  {stats.score.toLocaleString()}
                </span>
              </div>
              <div className="w-px h-7 bg-slate-800" />
              <div className="flex items-center gap-1.5 text-teal-300">
                <Dna className="w-4 h-4 text-teal-400" />
                <span className="font-bold tabular-nums">{stats.dnaCollected} DNA</span>
              </div>
            </div>

            {/* Special Bio-EMP Bomb Action Button (Bottom-Right) */}
            <div className="pointer-events-auto flex items-center gap-3 font-mono">
              <button
                onClick={() => engineRef.current?.triggerEmpBomb()}
                disabled={stats.empCharges <= 0}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border text-xs font-bold transition shadow-xl ${
                  stats.empCharges > 0
                    ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300 hover:bg-emerald-900/60 active:scale-95'
                    : 'bg-slate-950/60 border-slate-800 text-slate-600 cursor-not-allowed'
                }`}
              >
                <Bomb className="w-4 h-4 text-emerald-400" />
                <span>BIO-EMP BOMB [E]</span>
                <span className="bg-emerald-500/20 px-2 py-0.5 rounded-lg text-emerald-300 text-xs">
                  {stats.empCharges}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Title Screen Overlay */}
      {gameState === 'title' && (
        <div className="absolute inset-0 z-30 flex flex-col justify-between p-8 sm:p-12 pointer-events-none">
          {/* Top Logo / Lockup with 30-40% Negative Space */}
          <div className="pointer-events-auto max-w-xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>3D Nanotech Cellular Warfare Simulator</span>
            </div>

            {/* Bespoke Inline SVG Title Lockup */}
            <svg
              viewBox="0 0 620 90"
              className="w-full max-w-lg h-auto filter drop-shadow-[0_4px_18px_rgba(16,185,129,0.35)]"
            >
              <defs>
                <linearGradient id="titleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="50%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#c084fc" />
                </linearGradient>
              </defs>
              <text
                x="0"
                y="65"
                fontFamily="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont"
                fontWeight="900"
                fontSize="62"
                letterSpacing="1"
                fill="url(#titleGrad)"
              >
                NANO-CORE
              </text>
              <text
                x="410"
                y="40"
                fontFamily="ui-monospace, monospace"
                fontWeight="800"
                fontSize="18"
                letterSpacing="3"
                fill="#38bdf8"
              >
                3D ARENA
              </text>
              <text
                x="410"
                y="62"
                fontFamily="ui-monospace, monospace"
                fontWeight="600"
                fontSize="12"
                letterSpacing="2"
                fill="#94a3b8"
              >
                CYBER-IMMUNITY
              </text>
            </svg>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans max-w-md">
              Pilot the MK-IV Nanobot inside a living vascular chamber. Eradicate mutated viral capsids and bacterial runners before they breach cellular integrity.
            </p>
          </div>

          {/* Bottom CTA & Controls Strip */}
          <div className="pointer-events-auto space-y-4 max-w-md">
            <button
              onClick={handleStartGame}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 text-slate-950 font-black text-sm tracking-wide uppercase shadow-2xl shadow-emerald-500/30 active:scale-95 transition flex items-center justify-center gap-3 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>ENGAGE NANOBOT [SPACE / ENTER]</span>
            </button>

            {/* Flat Control-Hint Line */}
            <div className="text-xs text-slate-400 font-mono flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>WASD Move</span>
              <span>•</span>
              <span>Space / Click Fire</span>
              <span>•</span>
              <span>Shift Dash</span>
              <span>•</span>
              <span>E Bio-EMP</span>
              <span>•</span>
              <span>Esc Pause</span>
            </div>
          </div>
        </div>
      )}

      {/* Pause Modal */}
      {gameState === 'paused' && (
        <div className="absolute inset-0 z-40 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-sm w-full text-center space-y-5 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 mx-auto">
              <Crosshair className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white font-mono">MISSION PAUSED</h3>
              <p className="text-xs text-slate-400 mt-1 font-mono">Systems on standby</p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={handleResume}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase transition"
              >
                Resume Operation [ESC]
              </button>
              <button
                onClick={handleRestart}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition"
              >
                Restart Mission
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Victory Modal */}
      {gameState === 'victory' && (
        <div className="absolute inset-0 z-40 bg-black/80 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-8 max-w-md w-full text-center space-y-5 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
              <Trophy className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-2xl font-black text-white tracking-tight">CELLULAR DEFENSE SUCCESS!</h3>
              <p className="text-xs text-emerald-300 mt-1 font-mono">
                All 5 pathogen waves eliminated. Sector secured.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs font-mono space-y-2 text-left">
              <div className="flex justify-between text-slate-400">
                <span>Final Tactical Score:</span>
                <span className="text-white font-bold">{stats.score.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>DNA Harvested:</span>
                <span className="text-teal-400 font-bold">{stats.dnaCollected} Samples</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Remaining Integrity:</span>
                <span className="text-emerald-400 font-bold">{Math.round(stats.hp)}%</span>
              </div>
            </div>

            <button
              onClick={handleRestart}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs uppercase shadow-lg shadow-emerald-500/20 transition active:scale-95"
            >
              Play Another Mission
            </button>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {gameState === 'gameover' && (
        <div className="absolute inset-0 z-40 bg-black/85 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-red-500/40 rounded-3xl p-8 max-w-md w-full text-center space-y-5 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 mx-auto">
              <Skull className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-2xl font-black text-white tracking-tight">NANOBOT COMPROMISED</h3>
              <p className="text-xs text-red-400 mt-1 font-mono">
                Hull integrity reached 0%. Viral load overwhelmed defense.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs font-mono space-y-2 text-left">
              <div className="flex justify-between text-slate-400">
                <span>Survived Until Wave:</span>
                <span className="text-white font-bold">{stats.wave}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Final Score:</span>
                <span className="text-emerald-400 font-bold">{stats.score.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handleRestart}
              className="w-full py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase shadow-lg shadow-red-500/20 transition active:scale-95 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Re-Deploy Nanobot</span>
            </button>
          </div>
        </div>
      )}

      {/* Tactical AI Comms Sidebar (Gemini Bioscience Companion) */}
      <TacticalAIComms
        isOpen={isCommsOpen}
        onClose={() => setIsCommsOpen(false)}
        stats={stats}
      />
    </div>
  );
};
