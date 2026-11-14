import React, { useState } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Menu, 
  X, 
  ArrowRight,
  Gamepad2,
  Swords,
  BookOpen,
  Sparkles,
  Layers
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useScrollProgress } from '../../hooks/useScrollReveal';
import { sound } from '../../utils/sound';

export const LandingNavbar: React.FC = () => {
  const { navigateToApp, isSoundMuted, toggleSound } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const scrollProgress = useScrollProgress();

  const handleNavClick = (sectionId: string) => {
    sound.playClick();
    setMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#141719]/85 backdrop-blur-md border-b border-[#30383A] transition-all">
      {/* Real-time Global Scroll Progress Indicator */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-transparent pointer-events-none">
        <div 
          className="h-full bg-gradient-to-r from-arena-amber via-arena-amberHighlight to-arena-teal transition-all duration-100 shadow-[0_0_8px_rgba(230,167,70,0.6)]"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <div className="w-[94%] max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => {
            sound.playClick();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="w-8 h-8 rounded-lg bg-arena-surface border border-arena-border flex items-center justify-center transition-all group-hover:border-arena-amber group-hover:shadow-[0_0_15px_rgba(230,167,70,0.2)]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-arena-amber">
              <path d="M6 4L14 12L6 20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="18" cy="18" r="2.5" fill="#83B6A3"/>
            </svg>
          </div>
          <div>
            <div className="font-extrabold text-base tracking-tight text-arena-textPrimary flex items-center gap-1.5">
              <span>DEVARENA</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-arena-elevated border border-arena-border text-arena-amber">v2.0</span>
            </div>
            <span className="text-[10px] text-arena-textSubtle tracking-wider hidden sm:block uppercase">Social Gaming & Developer Arena</span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-[#1A2022]/60 p-1.5 rounded-xl border border-arena-border text-xs">
          <button
            onClick={() => handleNavClick('two-worlds')}
            className="px-3 py-1.5 rounded-lg text-arena-textSecondary hover:text-arena-textPrimary hover:bg-arena-surface transition-colors"
          >
            Two Worlds
          </button>
          <button
            onClick={() => handleNavClick('games-showcase')}
            className="px-3 py-1.5 rounded-lg text-arena-textSecondary hover:text-arena-textPrimary hover:bg-arena-surface transition-colors"
          >
            Explore Games
          </button>
          <button
            onClick={() => handleNavClick('duel-showcase')}
            className="px-3 py-1.5 rounded-lg text-arena-textSecondary hover:text-arena-textPrimary hover:bg-arena-surface transition-colors"
          >
            1v1 Code Battles
          </button>
          <button
            onClick={() => handleNavClick('learn-roadmap')}
            className="px-3 py-1.5 rounded-lg text-arena-textSecondary hover:text-arena-textPrimary hover:bg-arena-surface transition-colors"
          >
            DSA Roadmap
          </button>
          <button
            onClick={() => handleNavClick('social-loop')}
            className="px-3 py-1.5 rounded-lg text-arena-textSecondary hover:text-arena-textPrimary hover:bg-arena-surface transition-colors"
          >
            Social Duels
          </button>
          <button
            onClick={() => handleNavClick('progression')}
            className="px-3 py-1.5 rounded-lg text-arena-textSecondary hover:text-arena-textPrimary hover:bg-arena-surface transition-colors"
          >
            Progression
          </button>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            aria-label={isSoundMuted ? "Unmute audio" : "Mute audio"}
            className="w-9 h-9 rounded-lg bg-arena-surface border border-arena-border text-arena-textSecondary hover:text-arena-textPrimary hover:border-arena-borderHover flex items-center justify-center transition-colors"
          >
            {isSoundMuted ? <VolumeX className="w-4 h-4 text-arena-textSubtle" /> : <Volume2 className="w-4 h-4 text-arena-amber" />}
          </button>

          {/* Quick Explore Link */}
          <button
            onClick={() => {
              sound.playClick();
              navigateToApp('play');
            }}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-arena-elevated border border-arena-border text-xs font-semibold text-arena-textPrimary hover:bg-arena-surface hover:border-arena-borderHover transition-all"
          >
            <Gamepad2 className="w-3.5 h-3.5 text-arena-teal" />
            <span>Play Games</span>
          </button>

          {/* Primary CTA: Enter the Arena */}
          <button
            onClick={() => {
              sound.playVictory();
              navigateToApp('home');
            }}
            className="btn-primary text-xs py-2 px-4 gap-1.5 shadow-[0_0_15px_rgba(230,167,70,0.25)] hover:shadow-[0_0_20px_rgba(230,167,70,0.4)]"
          >
            <span>Enter the Arena</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-arena-surface border border-arena-border text-arena-textSecondary hover:text-arena-textPrimary"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#141719] border-b border-arena-border px-4 py-4 space-y-2 animate-in fade-in slide-in-from-top-2">
          <button
            onClick={() => handleNavClick('two-worlds')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-arena-textSecondary hover:text-arena-textPrimary hover:bg-arena-surface"
          >
            Two Worlds (Play & Code)
          </button>
          <button
            onClick={() => handleNavClick('games-showcase')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-arena-textSecondary hover:text-arena-textPrimary hover:bg-arena-surface"
          >
            Casual Brain Games
          </button>
          <button
            onClick={() => handleNavClick('duel-showcase')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-arena-textSecondary hover:text-arena-textPrimary hover:bg-arena-surface"
          >
            1v1 Live Code Arena
          </button>
          <button
            onClick={() => handleNavClick('learn-roadmap')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-arena-textSecondary hover:text-arena-textPrimary hover:bg-arena-surface"
          >
            DSA Learning Roadmap
          </button>
          <button
            onClick={() => handleNavClick('social-loop')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-arena-textSecondary hover:text-arena-textPrimary hover:bg-arena-surface"
          >
            Challenge Friends
          </button>
          <button
            onClick={() => handleNavClick('progression')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-arena-textSecondary hover:text-arena-textPrimary hover:bg-arena-surface"
          >
            Ratings & Achievements
          </button>

          <div className="pt-3 border-t border-arena-border flex gap-2">
            <button
              onClick={() => {
                sound.playClick();
                navigateToApp('play');
              }}
              className="flex-1 py-2 rounded-lg bg-arena-surface border border-arena-border text-xs font-semibold text-center text-arena-textPrimary"
            >
              Play Games
            </button>
            <button
              onClick={() => {
                sound.playClick();
                navigateToApp('arena');
              }}
              className="flex-1 py-2 rounded-lg bg-arena-amber text-[#141719] text-xs font-bold text-center"
            >
              Enter Code Arena
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

