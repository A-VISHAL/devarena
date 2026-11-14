import React from 'react';
import { 
  Github, 
  Gamepad2, 
  Swords, 
  BookOpen, 
  Users, 
  Trophy, 
  Heart,
  ArrowUp
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sound } from '../../utils/sound';

export const LandingFooter: React.FC = () => {
  const { navigateToApp } = useApp();

  const scrollToTop = () => {
    sound.playClick();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-arena-border bg-[#0E1012] text-arena-textSecondary text-xs">
      <div className="w-[94%] max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        
        {/* Main 4-Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Column 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div 
              onClick={scrollToTop}
              className="flex items-center gap-2.5 cursor-pointer select-none group"
            >
              <div className="w-8 h-8 rounded-lg bg-arena-surface border border-arena-border flex items-center justify-center transition-colors group-hover:border-arena-amber">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-arena-amber">
                  <path d="M6 4L14 12L6 20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="18" cy="18" r="2.5" fill="#83B6A3"/>
                </svg>
              </div>
              <span className="font-extrabold text-base tracking-tight text-arena-textPrimary">
                DEVARENA
              </span>
            </div>

            <p className="text-xs text-arena-textSecondary leading-relaxed max-w-sm">
              The premier social competition platform bridging casual brain puzzles and competitive developer ecosystems. Play together, think faster, and code stronger.
            </p>

            <div className="flex items-center gap-3 pt-1">
              <a 
                href="https://github.com/HackOnVibeCom/y6w6hitwm06c0ybxt89ddxs5tt3iugdkmom5ggxz"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-arena-surface border border-arena-border text-arena-textSecondary hover:text-arena-textPrimary hover:border-arena-borderHover flex items-center justify-center transition-colors"
                aria-label="GitHub Repository"
              >
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Casual Games */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase text-arena-textPrimary tracking-wider">
              Casual Games
            </h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => navigateToApp('play', 'zip')} 
                  className="hover:text-arena-textPrimary transition-colors"
                >
                  Zip Daily #42
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigateToApp('play', 'word-puzzle')} 
                  className="hover:text-arena-textPrimary transition-colors"
                >
                  Daily Word Puzzle
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigateToApp('play', 'quick-math')} 
                  className="hover:text-arena-textPrimary transition-colors"
                >
                  Quick Math Sprint
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigateToApp('play', 'reaction-challenge')} 
                  className="hover:text-arena-textPrimary transition-colors"
                >
                  Reaction Benchmark
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigateToApp('play', 'memory-grid')} 
                  className="hover:text-arena-textPrimary transition-colors"
                >
                  Memory Grid
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Developer Ecosystem */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase text-arena-textPrimary tracking-wider">
              Developer Arena
            </h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => navigateToApp('arena')} 
                  className="hover:text-arena-textPrimary transition-colors"
                >
                  1v1 Coding Battles
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigateToApp('learn')} 
                  className="hover:text-arena-textPrimary transition-colors"
                >
                  DSA Curated Roadmap
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigateToApp('leaderboard')} 
                  className="hover:text-arena-textPrimary transition-colors"
                >
                  Global Elo Leaderboards
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigateToApp('profile')} 
                  className="hover:text-arena-textPrimary transition-colors"
                >
                  Ratings & Achievements
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Community & Product */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase text-arena-textPrimary tracking-wider">
              Community & About
            </h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => navigateToApp('community')} 
                  className="hover:text-arena-textPrimary transition-colors"
                >
                  Community Discussions
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigateToApp('home')} 
                  className="hover:text-arena-textPrimary transition-colors"
                >
                  App Dashboard
                </button>
              </li>
              <li>
                <a 
                  href="https://github.com/HackOnVibeCom/y6w6hitwm06c0ybxt89ddxs5tt3iugdkmom5ggxz"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-arena-textPrimary transition-colors"
                >
                  Source on GitHub
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Back to Top */}
        <div className="pt-8 border-t border-arena-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 text-arena-textSubtle">
            <span>© 2026 DEVARENA Inc. Built for players and developers.</span>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-arena-surface border border-arena-border text-arena-textSecondary hover:text-arena-textPrimary transition-colors"
          >
            <span>Back to Top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </footer>
  );
};

