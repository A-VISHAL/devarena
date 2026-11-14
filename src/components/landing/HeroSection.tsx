import React from 'react';
import { 
  Gamepad2, 
  Swords, 
  ArrowRight, 
  Sparkles, 
  Flame, 
  ShieldCheck, 
  Zap, 
  Trophy,
  CheckCircle2,
  Users
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Hero3DVisual } from './Hero3DVisual';
import { sound } from '../../utils/sound';

export const HeroSection: React.FC = () => {
  const { navigateToApp } = useApp();

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center pt-8 pb-16 overflow-hidden">
      {/* Background radial gradient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-arena-amber/5 filter blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-[450px] h-[400px] rounded-full bg-arena-teal/5 filter blur-[120px] pointer-events-none -z-10" />

      <div className="w-[94%] max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headline, Narrative & Primary Actions */}
          <div className="lg:col-span-6 space-y-6 text-left">
            
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-arena-surface border border-arena-border text-xs font-semibold text-arena-textSecondary shadow-sm">
              <span className="w-2 h-2 rounded-full bg-arena-amber animate-pulse" />
              <span className="text-arena-textPrimary uppercase tracking-wider text-[11px]">
                The Playground for Curious Minds
              </span>
            </div>

            {/* Main Headline with Animated Amber Treatment */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-arena-textPrimary leading-[1.08]">
              Play together. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-arena-textPrimary via-[#E2E6EC] to-[#A5AAA5]">
                Think faster.
              </span> <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-arena-amber via-arena-amberHighlight to-[#FFBD62] inline-block animate-pulse">
                Code stronger.
              </span>
            </h1>

            {/* Narrative Description */}
            <p className="text-base sm:text-lg text-arena-textSecondary leading-relaxed max-w-xl font-normal">
              From quick brain games to real-time coding battles, DEVARENA brings people together to play, compete, learn and grow.
            </p>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <button
                onClick={() => {
                  sound.playVictory();
                  navigateToApp('home');
                }}
                className="btn-primary py-3 px-6 text-sm font-bold gap-2 shadow-[0_0_20px_rgba(230,167,70,0.3)] hover:shadow-[0_0_28px_rgba(230,167,70,0.5)] transition-all transform hover:-translate-y-0.5"
              >
                <span>Enter the Arena</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  navigateToApp('play');
                }}
                className="btn-secondary py-3 px-6 text-sm font-semibold gap-2 hover:bg-arena-surface transition-all transform hover:-translate-y-0.5"
              >
                <Gamepad2 className="w-4 h-4 text-arena-teal" />
                <span>Explore Games</span>
              </button>
            </div>

            {/* Supporting Micro-copy & Trust Indicators */}
            <div className="pt-3 space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-arena-textSubtle">
                <ShieldCheck className="w-4 h-4 text-arena-teal" />
                <span>No downloads. No barriers. Just play.</span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-arena-textSecondary pt-2 border-t border-arena-border/60">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-arena-teal" />
                  <span>Instant Guest Access</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-arena-amber" />
                  <span>Real-time 1v1 Duels</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-arena-teal" />
                  <span>Global Elo Ratings</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: 3D Centerpiece Visual */}
          <div className="lg:col-span-6 flex items-center justify-center lg:justify-end">
            <Hero3DVisual />
          </div>

        </div>
      </div>
    </section>
  );
};
