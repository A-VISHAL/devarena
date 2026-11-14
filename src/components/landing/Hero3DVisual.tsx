import React, { useState, useEffect, useRef } from 'react';
import { 
  Gamepad2, 
  Swords, 
  CheckCircle2, 
  Flame, 
  Layers, 
  Code2
} from 'lucide-react';
import { sound } from '../../utils/sound';

export const Hero3DVisual: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState<number>(6);
  const [rotateY, setRotateY] = useState<number>(-8);
  const [interactiveTileActive, setInteractiveTileActive] = useState<number>(11);

  // Smooth pointer parallax tracking without excessive rotation
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const midX = rect.width / 2;
    const midY = rect.height / 2;
    const rY = ((x - midX) / midX) * 8;
    const rX = -((y - midY) / midY) * 8;

    setRotateX(rX);
    setRotateY(rY);
  };

  const handleMouseLeave = () => {
    setRotateX(5);
    setRotateY(-7);
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-xl mx-auto py-2 perspective-1000 select-none cursor-pointer"
    >
      {/* Background Soft Ambient Light (Self-contained) */}
      <div 
        className="absolute inset-0 w-full h-full rounded-3xl pointer-events-none filter blur-2xl opacity-20 -z-10 transition-transform duration-300"
        style={{
          background: 'radial-gradient(circle, rgba(230,167,70,0.5) 0%, rgba(131,182,163,0.2) 60%, transparent 80%)',
          transform: `translate(${rotateY * 3}px, ${-rotateX * 3}px)`
        }}
      />

      {/* Main Dimensional Slate Board - Fully Self-Contained with NO Clashing Floating Badges */}
      <div 
        className="relative w-full rounded-2xl bg-[#171C1E]/95 border border-[#30383A] p-5 sm:p-6 shadow-[0_24px_50px_-10px_rgba(0,0,0,0.85),0_0_25px_rgba(230,167,70,0.08)] backdrop-blur-xl transition-transform duration-150 ease-out preserve-3d"
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 mb-4 border-b border-[#273032]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-arena-amber animate-ping" />
            <span className="text-[11px] font-bold tracking-wider uppercase text-arena-textSecondary">
              DEVARENA DUAL ENGINE • LIVE NEXUS
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-arena-elevated border border-arena-border text-arena-amber flex items-center gap-1">
              <Flame className="w-3 h-3 text-arena-amber" />
              <span>5d Streak</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-arena-elevated border border-arena-border text-arena-teal font-semibold">
              Casual + Code
            </span>
            <span className="text-xs text-arena-amber font-mono font-bold">1444 Elo</span>
          </div>
        </div>

        {/* Dual Split Content: Left = Casual Game Board, Right = Code Duel IDE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* LEFT SIDE: Interactive Spatial Path Game (Zip #42) */}
          <div className="p-3.5 rounded-xl bg-[#131618] border border-[#2B3436] space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-arena-textSecondary">
              <span className="flex items-center gap-1.5 text-arena-teal">
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>Zip Daily #42</span>
              </span>
              <span className="text-[10px] text-arena-textSubtle font-mono">01:14</span>
            </div>

            {/* 4x4 Mini Interactive Grid Preview */}
            <div className="grid grid-cols-4 gap-1.5 p-2 rounded-lg bg-[#191F21] border border-[#242C2E]">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map((cell) => {
                const isCheckpoint = cell === 1 || cell === 6 || cell === 11 || cell === 16;
                const checkpointNum = cell === 1 ? 1 : cell === 6 ? 2 : cell === 11 ? 3 : cell === 16 ? 4 : null;
                const isPath = [1, 2, 6, 7, 11, 15, 16].includes(cell);
                const isObstacle = cell === 5 || cell === 10;
                const isCurrent = cell === interactiveTileActive;

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
                        ? 'bg-[#222E30] text-arena-teal border border-arena-teal/30'
                        : isObstacle
                        ? 'bg-[#101314] text-arena-textSubtle opacity-40 cursor-not-allowed'
                        : 'bg-[#131718] text-arena-textSubtle hover:bg-[#1E2527]'
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
          <div className="p-3.5 rounded-xl bg-[#131618] border border-[#2B3436] space-y-3 font-mono">
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

        {/* Bottom Integrated Shelf - Cleanly within the card bounds */}
        <div className="mt-4 pt-3.5 border-t border-[#273032] flex flex-wrap items-center justify-between gap-2.5 text-xs">
          {/* Wordle solved pill */}
          <div className="flex items-center gap-2 text-arena-textSecondary">
            <span className="text-[10px] uppercase font-bold text-arena-textSubtle">DAILY WORD:</span>
            <div className="flex items-center gap-1">
              <span className="w-5 h-5 rounded bg-arena-success text-[#141719] font-black text-[10px] flex items-center justify-center font-mono">C</span>
              <span className="w-5 h-5 rounded bg-arena-amber text-[#141719] font-black text-[10px] flex items-center justify-center font-mono">O</span>
              <span className="w-5 h-5 rounded bg-arena-elevated text-arena-textPrimary border border-arena-border font-black text-[10px] flex items-center justify-center font-mono">D</span>
              <span className="w-5 h-5 rounded bg-arena-success text-[#141719] font-black text-[10px] flex items-center justify-center font-mono">E</span>
            </div>
            <span className="text-[10px] text-arena-teal font-mono font-semibold">4/6 Solved</span>
          </div>

          {/* Ranked result status */}
          <div className="flex items-center gap-1.5 text-[11px] font-mono">
            <span className="text-arena-textSubtle">Ranked Match:</span>
            <span className="text-arena-success font-bold">Victory (+24 Elo)</span>
          </div>
        </div>

      </div>
    </div>
  );
};
