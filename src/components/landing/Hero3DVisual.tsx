import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Swords, 
  Gamepad2, 
  CheckCircle2, 
  Flame, 
  Play, 
  Layers, 
  Activity,
  Code2,
  Terminal
} from 'lucide-react';
import { sound } from '../../utils/sound';

export const Hero3DVisual: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState<number>(10);
  const [rotateY, setRotateY] = useState<number>(-14);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [interactiveTileActive, setInteractiveTileActive] = useState<number>(3);
  const [codeTestPassed, setCodeTestPassed] = useState<boolean>(true);

  // Smooth pointer parallax tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within element
    const y = e.clientY - rect.top;  // y position within element

    // Calculate rotation (-15 to 15 deg)
    const midX = rect.width / 2;
    const midY = rect.height / 2;
    const rY = ((x - midX) / midX) * 14;
    const rX = -((y - midY) / midY) * 14;

    setRotateX(rX);
    setRotateY(rY);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(8);
    setRotateY(-12);
  };

  // Subtle cyclic live test simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setCodeTestPassed(prev => !prev);
    }, 3800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-2xl h-[460px] sm:h-[520px] flex items-center justify-center perspective-1000 select-none cursor-pointer"
    >
      {/* Background Ambient Glow & Lighting Spotlights */}
      <div 
        className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full pointer-events-none filter blur-3xl opacity-30 transition-all duration-700 -z-10"
        style={{
          background: 'radial-gradient(circle, rgba(230,167,70,0.4) 0%, rgba(131,182,163,0.15) 50%, transparent 75%)',
          transform: `translate(${rotateY * 4}px, ${-rotateX * 4}px)`
        }}
      />
      <div 
        className="absolute -top-10 -right-10 w-48 h-48 rounded-full pointer-events-none filter blur-2xl opacity-20 bg-arena-teal transition-all duration-700 -z-10"
      />

      {/* Primary 3D Tilted Board Container */}
      <div 
        className="relative w-full max-w-lg sm:max-w-xl transition-transform duration-200 ease-out preserve-3d"
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Main Dimensional Slate Board */}
        <div 
          className="relative rounded-2xl bg-[#181D20]/95 border border-[#30383A] p-5 sm:p-6 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.8),0_0_30px_rgba(230,167,70,0.1)] backdrop-blur-xl transition-all"
          style={{ transform: 'translateZ(20px)' }}
        >
          {/* Board Header Bar */}
          <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#293234]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-arena-amber animate-ping" />
              <span className="text-[11px] font-bold tracking-wider uppercase text-arena-textSecondary">
                DEVARENA DUAL ENGINE • LIVE NEXUS
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-arena-elevated border border-arena-border text-arena-teal">
                Casual + Code
              </span>
              <span className="text-xs text-arena-amber font-mono font-bold">1444 Elo</span>
            </div>
          </div>

          {/* Dual Split Content: Left = Casual Game Board, Right = Code Duel IDE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* LEFT SIDE: Interactive Spatial Path Game (Zip & Wordle) */}
            <div className="p-3.5 rounded-xl bg-[#141719] border border-[#2E3739] space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-arena-textSecondary">
                <span className="flex items-center gap-1.5 text-arena-teal">
                  <Gamepad2 className="w-3.5 h-3.5" />
                  <span>Zip Daily #42</span>
                </span>
                <span className="text-[10px] text-arena-textSubtle font-mono">01:14</span>
              </div>

              {/* 4x4 Mini Interactive Grid Preview */}
              <div className="grid grid-cols-4 gap-1.5 p-2 rounded-lg bg-[#1B2022] border border-[#262E30]">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map((cell) => {
                  const isCheckpoint = cell === 1 || cell === 6 || cell === 11 || cell === 16;
                  const checkpointNum = cell === 1 ? 1 : cell === 6 ? 2 : cell === 11 ? 3 : cell === 16 ? 4 : null;
                  const isPath = [1, 2, 6, 7, 11, 15, 16].includes(cell);
                  const isObstacle = cell === 5 || cell === 10;
                  const isCurrent = cell === 11;

                  return (
                    <button
                      key={cell}
                      onClick={() => {
                        sound.playClick();
                        setInteractiveTileActive(cell);
                      }}
                      className={`h-8 sm:h-9 rounded-md flex items-center justify-center text-xs font-bold font-mono transition-all duration-200 ${
                        isCurrent
                          ? 'bg-arena-amber text-[#141719] shadow-[0_0_12px_rgba(230,167,70,0.8)] scale-105 z-10'
                          : isCheckpoint
                          ? 'bg-arena-teal text-[#141719] shadow-sm'
                          : isPath
                          ? 'bg-[#253235] text-arena-teal border border-arena-teal/30'
                          : isObstacle
                          ? 'bg-[#101314] text-arena-textSubtle opacity-40 cursor-not-allowed'
                          : 'bg-[#141819] text-arena-textSubtle hover:bg-[#202729]'
                      }`}
                    >
                      {checkpointNum ? checkpointNum : isObstacle ? '✕' : ''}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[11px] text-arena-textSecondary pt-1">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-arena-teal" />
                  <span>3/4 Nodes Connected</span>
                </span>
                <span className="font-mono text-arena-amber font-semibold">920 Pts</span>
              </div>
            </div>

            {/* RIGHT SIDE: Real-time Algorithmic Code Duel */}
            <div className="p-3.5 rounded-xl bg-[#141719] border border-[#2E3739] space-y-3 font-mono">
              <div className="flex items-center justify-between text-xs font-semibold text-arena-textSecondary">
                <span className="flex items-center gap-1.5 text-arena-amber">
                  <Swords className="w-3.5 h-3.5" />
                  <span>1v1 Code Duel</span>
                </span>
                <span className="text-[10px] text-arena-success flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-arena-success animate-pulse" />
                  <span>LIVE</span>
                </span>
              </div>

              {/* Simulated Code Editor Preview */}
              <div className="p-2.5 rounded-lg bg-[#0F1213] border border-[#22292B] text-[10px] leading-relaxed space-y-1 text-arena-textSecondary overflow-hidden">
                <div className="text-arena-textSubtle flex justify-between">
                  <span>// Two Sum — O(N) Hash Map</span>
                  <span className="text-arena-amber">Monaco</span>
                </div>
                <div>
                  <span className="text-arena-amber">function</span>{' '}
                  <span className="text-arena-teal">twoSum</span>(nums, target) &#123;
                </div>
                <div className="pl-2 text-arena-textPrimary">
                  <span className="text-arena-amber">const</span> map = <span className="text-arena-teal">new</span> Map();
                </div>
                <div className="pl-2">
                  <span className="text-arena-amber">for</span> (<span className="text-arena-amber">let</span> i=0; i&lt;nums.length; i++) &#123;
                </div>
                <div className="pl-4 text-arena-textPrimary">
                  <span className="text-arena-amber">if</span> (map.has(target - nums[i]))
                </div>
                <div className="pl-6 text-arena-teal font-bold">
                  return [map.get(diff), i];
                </div>
                <div className="text-arena-textSubtle">&#125;</div>
              </div>

              {/* Test Case Execution Badge */}
              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="flex items-center gap-1.5 text-arena-success font-sans font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Test Cases: 4/4 Passed (12ms)</span>
                </span>
                <span className="text-arena-teal font-mono font-bold">+24 Elo</span>
              </div>
            </div>

          </div>
        </div>

        {/* FLOATING 3D ELEMENT 1: Floating Wordle Solution Tile */}
        <div 
          className="absolute -top-6 -left-6 sm:-left-8 rounded-xl bg-arena-surface border border-arena-border p-3 shadow-2xl animate-float-slow hidden sm:flex items-center gap-2.5 backdrop-blur-md"
          style={{ transform: 'translateZ(65px)' }}
        >
          <div className="w-8 h-8 rounded-lg bg-arena-success text-[#141719] font-black text-sm flex items-center justify-center font-mono">
            C
          </div>
          <div className="w-8 h-8 rounded-lg bg-arena-amber text-[#141719] font-black text-sm flex items-center justify-center font-mono">
            O
          </div>
          <div className="w-8 h-8 rounded-lg bg-arena-elevated text-arena-textPrimary border border-arena-border font-black text-sm flex items-center justify-center font-mono">
            D
          </div>
          <div className="w-8 h-8 rounded-lg bg-arena-success text-[#141719] font-black text-sm flex items-center justify-center font-mono">
            E
          </div>
        </div>

        {/* FLOATING 3D ELEMENT 2: Floating Elo Rating Badge */}
        <div 
          className="absolute -bottom-6 -right-4 sm:-right-8 rounded-xl bg-arena-elevated/95 border border-arena-amber/40 p-3 shadow-2xl animate-float-alt flex items-center gap-3 backdrop-blur-md"
          style={{ transform: 'translateZ(80px)' }}
        >
          <div className="w-9 h-9 rounded-lg bg-arena-amber/15 border border-arena-amber text-arena-amber flex items-center justify-center">
            <Swords className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-arena-textSubtle tracking-wider">
              RANKED VICTORY
            </div>
            <div className="text-sm font-extrabold text-arena-textPrimary flex items-center gap-1.5 font-mono">
              <span>1444 Elo</span>
              <span className="text-xs text-arena-success font-bold">(+24)</span>
            </div>
          </div>
        </div>

        {/* FLOATING 3D ELEMENT 3: Active Streak Flame Badge */}
        <div 
          className="absolute -top-7 right-6 sm:right-10 rounded-xl bg-arena-surface/90 border border-arena-border px-3 py-1.5 shadow-xl animate-float-slow hidden sm:flex items-center gap-2"
          style={{ transform: 'translateZ(50px)' }}
        >
          <Flame className="w-4 h-4 text-arena-amber animate-pulse" />
          <span className="text-xs font-bold text-arena-textPrimary font-mono">5 Day Streak</span>
          <span className="text-[10px] text-arena-teal">1.5x XP</span>
        </div>

      </div>
    </div>
  );
};
