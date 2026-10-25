import React, { useEffect, useRef } from 'react';
import { NanoGameEngine, PlayerStats, GameState } from './engine';

interface GameCanvasProps {
  onStatsUpdate: (stats: PlayerStats) => void;
  onStateChange: (state: GameState) => void;
  engineRef: React.MutableRefObject<NanoGameEngine | null>;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  onStatsUpdate,
  onStateChange,
  engineRef,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize Engine
    const engine = new NanoGameEngine(canvasRef.current);
    engine.onStatsUpdate = onStatsUpdate;
    engine.onStateChange = onStateChange;
    engineRef.current = engine;

    let lastTime = performance.now();
    let animId = 0;

    const loop = (currentTime: number) => {
      animId = requestAnimationFrame(loop);
      const dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      engine.update(dt);
      engine.render();
    };

    animId = requestAnimationFrame(loop);

    // Resize listener
    const handleResize = () => {
      engine.resize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden w-full h-full bg-slate-950">
      <canvas
        ref={canvasRef}
        className="block w-full h-full outline-none select-none cursor-crosshair"
      />
    </div>
  );
};
