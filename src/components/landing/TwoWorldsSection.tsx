import React, { useState } from 'react';
import { 
  Gamepad2, 
  Swords, 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  Brain, 
  Code2, 
  Trophy, 
  Activity, 
  Zap, 
  Users, 
  Sparkles 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sound } from '../../utils/sound';

export const TwoWorldsSection: React.FC = () => {
  const { navigateToApp } = useApp();
  const [activeSide, setActiveSide] = useState<'both' | 'casual' | 'developer'>('both');

  return (
    <section id="two-worlds" className="py-24 relative overflow-hidden">
      {/* Background Subtle Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#141719] via-[#101314] to-[#141719] pointer-events-none -z-10" />

      <div className="w-[94%] max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-arena-surface border border-arena-border text-xs font-semibold text-arena-teal">
            <Sparkles className="w-3.5 h-3.5 text-arena-teal" />
            <span>TWO WORLDS. ONE SHARED ARENA.</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-arena-textPrimary tracking-tight leading-tight">
            Not just games. <br />
            Not just code. <br />
            <span className="text-arena-amber">A place for both.</span>
          </h2>

          <p className="text-sm sm:text-base text-arena-textSecondary leading-relaxed">
            Anyone can jump in for quick brain puzzles, invite friends, and unwind. Developers unlock an additional competitive layer to solve algorithms, duel in real time, and demonstrate true engineering prowess.
          </p>

          {/* Interactive Mode Filter Tabs */}
          <div className="pt-2 inline-flex p-1 rounded-xl bg-arena-surface border border-arena-border text-xs">
            <button
              onClick={() => {
                sound.playClick();
                setActiveSide('both');
              }}
              className={`px-4 py-1.5 rounded-lg font-semibold transition-all ${
                activeSide === 'both' ? 'bg-arena-elevated text-arena-textPrimary shadow-sm' : 'text-arena-textSecondary hover:text-arena-textPrimary'
              }`}
            >
              Unified Ecosystem
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setActiveSide('casual');
              }}
              className={`px-4 py-1.5 rounded-lg font-semibold transition-all ${
                activeSide === 'casual' ? 'bg-arena-teal/20 text-arena-teal border border-arena-teal/40' : 'text-arena-textSecondary hover:text-arena-textPrimary'
              }`}
            >
              Play for Fun
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setActiveSide('developer');
              }}
              className={`px-4 py-1.5 rounded-lg font-semibold transition-all ${
                activeSide === 'developer' ? 'bg-arena-amber/20 text-arena-amber border border-arena-amber/40' : 'text-arena-textSecondary hover:text-arena-textPrimary'
              }`}
            >
              Compete with Code
            </button>
          </div>
        </div>

        {/* Split Grid Composition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* LEFT WORLD: Casual Gaming & Social Puzzles */}
          <div 
            onMouseEnter={() => setActiveSide('casual')}
            onMouseLeave={() => setActiveSide('both')}
            className={`lg:col-span-6 rounded-2xl p-6 sm:p-8 bg-gradient-to-br from-[#181F21] to-[#141819] border transition-all duration-300 flex flex-col justify-between ${
              activeSide === 'casual' || activeSide === 'both'
                ? 'border-arena-teal/40 shadow-[0_10px_35px_-10px_rgba(131,182,163,0.15)]'
                : 'border-arena-border opacity-70'
            }`}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-arena-teal/15 border border-arena-teal/40 text-arena-teal flex items-center justify-center">
                    <Gamepad2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-arena-teal block">FOR EVERYONE</span>
                    <h3 className="text-xl sm:text-2xl font-bold text-arena-textPrimary">Play for Fun</h3>
                  </div>
                </div>
                <span className="text-xs font-mono px-2.5 py-1 rounded bg-[#162224] border border-arena-teal/30 text-arena-teal">
                  Zero Code Required
                </span>
              </div>

              <p className="text-sm text-arena-textSecondary leading-relaxed">
                Clean, beautifully designed micro-games that sharpen memory, reflexes, verbal intuition, and deductive logic. Pick up and play in under 3 minutes.
              </p>

              {/* Casual Features Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-arena-surface/80 border border-arena-border">
                  <div className="font-semibold text-xs text-arena-textPrimary flex items-center gap-2">
                    <Layers className="w-4 h-4 text-arena-teal" />
                    <span>Daily Word & Zip Puzzles</span>
                  </div>
                  <p className="text-[11px] text-arena-textSecondary mt-1">
                    Synchronized daily puzzle with spoiler-free score sharing.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-arena-surface/80 border border-arena-border">
                  <div className="font-semibold text-xs text-arena-textPrimary flex items-center gap-2">
                    <Activity className="w-4 h-4 text-arena-teal" />
                    <span>Millisecond Reaction Test</span>
                  </div>
                  <p className="text-[11px] text-arena-textSecondary mt-1">
                    Precision benchmark comparing reflexes against global percentiles.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-arena-surface/80 border border-arena-border">
                  <div className="font-semibold text-xs text-arena-textPrimary flex items-center gap-2">
                    <Brain className="w-4 h-4 text-arena-teal" />
                    <span>Memory & Logic Sprints</span>
                  </div>
                  <p className="text-[11px] text-arena-textSecondary mt-1">
                    Spatial flash matrices and truth-table deduction sprint.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-arena-surface/80 border border-arena-border">
                  <div className="font-semibold text-xs text-arena-textPrimary flex items-center gap-2">
                    <Users className="w-4 h-4 text-arena-teal" />
                    <span>Friend Challenge Links</span>
                  </div>
                  <p className="text-[11px] text-arena-textSecondary mt-1">
                    Send room code links that friends join directly without signup.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-arena-border mt-6 flex items-center justify-between">
              <span className="text-xs text-arena-textSubtle">8 Playable Games Available</span>
              <button
                onClick={() => {
                  sound.playClick();
                  navigateToApp('play');
                }}
                className="btn-teal text-xs py-2 px-4 gap-1.5 font-bold"
              >
                <span>Play Casual Games</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* RIGHT WORLD: Competitive Developer Ecosystem */}
          <div 
            onMouseEnter={() => setActiveSide('developer')}
            onMouseLeave={() => setActiveSide('both')}
            className={`lg:col-span-6 rounded-2xl p-6 sm:p-8 bg-gradient-to-br from-[#201D1A] to-[#181615] border transition-all duration-300 flex flex-col justify-between ${
              activeSide === 'developer' || activeSide === 'both'
                ? 'border-arena-amber/40 shadow-[0_10px_35px_-10px_rgba(230,167,70,0.15)]'
                : 'border-arena-border opacity-70'
            }`}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-arena-amber/15 border border-arena-amber/40 text-arena-amber flex items-center justify-center">
                    <Swords className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-arena-amber block">FOR DEVELOPERS</span>
                    <h3 className="text-xl sm:text-2xl font-bold text-arena-textPrimary">Compete with Code</h3>
                  </div>
                </div>
                <span className="text-xs font-mono px-2.5 py-1 rounded bg-[#25201A] border border-arena-amber/30 text-arena-amber">
                  Ranked Matchmaking
                </span>
              </div>

              <p className="text-sm text-arena-textSecondary leading-relaxed">
                Real-time 1v1 algorithm duels, structured DSA topic pathways, verified Elo ratings, and realistic Monaco editor test environments.
              </p>

              {/* Developer Features Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-arena-surface/80 border border-arena-border">
                  <div className="font-semibold text-xs text-arena-textPrimary flex items-center gap-2">
                    <Zap className="w-4 h-4 text-arena-amber" />
                    <span>Real-time 1v1 Coding Duels</span>
                  </div>
                  <p className="text-[11px] text-arena-textSecondary mt-1">
                    Both competitors receive the identical problem. Fastest correct solution wins.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-arena-surface/80 border border-arena-border">
                  <div className="font-semibold text-xs text-arena-textPrimary flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-arena-amber" />
                    <span>Monaco Editor + Test Suite</span>
                  </div>
                  <p className="text-[11px] text-arena-textSecondary mt-1">
                    In-browser syntax highlighting, instant test runners, and performance timing.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-arena-surface/80 border border-arena-border">
                  <div className="font-semibold text-xs text-arena-textPrimary flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-arena-amber" />
                    <span>Verified Elo Rating Ladder</span>
                  </div>
                  <p className="text-[11px] text-arena-textSecondary mt-1">
                    Skill-based rating adjustments from Novice to Grandmaster tier.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-arena-surface/80 border border-arena-border">
                  <div className="font-semibold text-xs text-arena-textPrimary flex items-center gap-2">
                    <Brain className="w-4 h-4 text-arena-amber" />
                    <span>Curated DSA Roadmap</span>
                  </div>
                  <p className="text-[11px] text-arena-textSecondary mt-1">
                    Structured milestone tracks from Two Pointers to Dynamic Programming.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-arena-border mt-6 flex items-center justify-between">
              <span className="text-xs text-arena-textSubtle">Live Multiplayer & Solo Practice</span>
              <button
                onClick={() => {
                  sound.playClick();
                  navigateToApp('arena');
                }}
                className="btn-primary text-xs py-2 px-4 gap-1.5 font-bold"
              >
                <span>Enter Code Arena</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
