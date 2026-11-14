import React from 'react';
import { 
  ArrowRight, 
  Gamepad2, 
  Swords, 
  Sparkles, 
  ShieldCheck, 
  Layers 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sound } from '../../utils/sound';

export const FinalCtaSection: React.FC = () => {
  const { navigateToApp } = useApp();

  return (
    <section className="py-24 relative overflow-hidden bg-gradient-to-b from-[#141719] to-[#0E1012]">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-arena-amber/10 rounded-full filter blur-[140px] pointer-events-none -z-10" />

      <div className="w-[94%] max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        
        {/* Dimensional Center Badge */}
        <div className="w-16 h-16 rounded-2xl bg-arena-surface border border-arena-amber/50 shadow-[0_0_30px_rgba(230,167,70,0.3)] flex items-center justify-center mx-auto transform hover:rotate-6 transition-transform">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-arena-amber">
            <path d="M6 4L14 12L6 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="18" cy="18" r="3" fill="#83B6A3"/>
          </svg>
        </div>

        {/* Section Headline */}
        <div className="space-y-4 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-arena-textPrimary tracking-tight leading-tight">
            Your next challenge <br />
            <span className="text-arena-amber">starts here.</span>
          </h2>
          <p className="text-base sm:text-lg text-arena-textSecondary leading-relaxed">
            Whether you want a quick puzzle, a friendly competition, or a serious coding battle, there's a place for you in DEVARENA.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => {
              sound.playVictory();
              navigateToApp('home');
            }}
            className="btn-primary py-3.5 px-8 text-sm font-bold gap-2.5 shadow-[0_0_25px_rgba(230,167,70,0.35)] hover:shadow-[0_0_35px_rgba(230,167,70,0.55)] transition-all transform hover:-translate-y-0.5 w-full sm:w-auto"
          >
            <span>Enter DEVARENA</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              sound.playClick();
              navigateToApp('play');
            }}
            className="btn-secondary py-3.5 px-8 text-sm font-semibold gap-2 hover:bg-arena-surface transition-all transform hover:-translate-y-0.5 w-full sm:w-auto"
          >
            <Gamepad2 className="w-4 h-4 text-arena-teal" />
            <span>Explore the Games</span>
          </button>
        </div>

        {/* Trust Indicators */}
        <div className="pt-4 flex items-center justify-center gap-2 text-xs font-medium text-arena-textSubtle">
          <ShieldCheck className="w-4 h-4 text-arena-teal" />
          <span>No credit card required • Instant guest play • Free forever</span>
        </div>

      </div>
    </section>
  );
};
