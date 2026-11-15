import React from 'react';
import { 
  Gamepad2, 
  Swords, 
  Flame, 
  Trophy, 
  ArrowRight, 
  Play, 
  Users, 
  CheckCircle2, 
  Zap, 
  BookOpen, 
  Brain, 
  Eye, 
  Activity, 
  Calculator, 
  Layers, 
  Compass,
  Code2,
  Sparkles,
  FileSpreadsheet
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CasualGameId } from '../types';
import { sound } from '../utils/sound';

export const Home: React.FC = () => {
  const { 
    user, 
    setActiveTab, 
    setActiveGame, 
    completedDailyChallenge 
  } = useApp();

  const handleStartGame = (gameId: CasualGameId) => {
    sound.playClick();
    setActiveGame(gameId);
    setActiveTab('play');
  };

  const handleStartBattle = () => {
    sound.playClick();
    setActiveTab('arena');
  };

  const casualGamesList = [
    {
      id: 'odd-one-out' as CasualGameId,
      title: 'Odd One Out',
      desc: 'Spot subtle symbols, rotations, or shades across 10 timed levels.',
      icon: <Eye className="w-4 h-4 text-arena-teal" />,
      tag: 'Visual Speed',
    },
    {
      id: 'reaction-challenge' as CasualGameId,
      title: 'Reaction Challenge',
      desc: 'High-precision millisecond reflex benchmark with true percentiles.',
      icon: <Activity className="w-4 h-4 text-arena-amber" />,
      tag: 'Reflexes',
    },
    {
      id: 'quick-math' as CasualGameId,
      title: 'Quick Math',
      desc: '60-second mental arithmetic sprint tracking speed and streaks.',
      icon: <Calculator className="w-4 h-4 text-arena-teal" />,
      tag: 'Mental Sprint',
    },
    {
      id: 'memory-grid' as CasualGameId,
      title: 'Memory Grid',
      desc: 'Memorize spatial flashing patterns on an expanding 3x3 to 5x5 grid.',
      icon: <Brain className="w-4 h-4 text-arena-amber" />,
      tag: 'Memory',
    },
    {
      id: 'pattern-master' as CasualGameId,
      title: 'Pattern Master',
      desc: 'Deduce numeric, geometric, and rotational sequences with combos.',
      icon: <Layers className="w-4 h-4 text-arena-teal" />,
      tag: 'Sequences',
    },
    {
      id: 'logic-sprint' as CasualGameId,
      title: 'Logic Sprint',
      desc: 'Deductive reasoning puzzles with truth tables and spatial logic.',
      icon: <Compass className="w-4 h-4 text-arena-amber" />,
      tag: 'Deduction',
    }
  ];

  return (
    <div className="page-container py-8 space-y-8 animate-in fade-in">
      
      {/* HERO SECTION — Wide Desktop 2-Column Layout */}
      <div className="rounded-2xl bg-arena-surface border border-arena-border p-6 sm:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Headline, Description, Primary Actions */}
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-arena-elevated border border-arena-border text-arena-textSecondary text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-arena-amber" />
              <span>Social Casual Gaming & Competitive Developer Platform</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-5xl font-extrabold tracking-tight text-arena-textPrimary leading-tight">
              Play together. Think faster. <br />
              <span className="text-arena-amber">Code stronger.</span>
            </h1>

            <p className="text-sm sm:text-base text-arena-textSecondary leading-relaxed max-w-2xl">
              Quick, engaging puzzles anyone can enjoy without technical skills. Real-time 1v1 coding duels, DSA roadmaps, and verified ratings for developers.
            </p>

            {/* Primary Action Buttons & Feature Indicators */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => handleStartGame('word-puzzle')}
                className="btn-primary py-2.5 px-5 text-xs font-semibold gap-2 shadow-sm"
              >
                <Gamepad2 className="w-4 h-4" />
                <span>Play Casual Games</span>
              </button>

              <button
                onClick={handleStartBattle}
                className="btn-secondary py-2.5 px-5 text-xs font-semibold gap-2"
              >
                <Swords className="w-4 h-4 text-arena-amber" />
                <span>Start Coding Battle</span>
              </button>

              <div className="hidden sm:flex items-center gap-3 text-xs text-arena-textSubtle ml-2">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-arena-teal" />
                  <span>No login required to test</span>
                </span>
                <span>•</span>
                <span>Real-time test runners</span>
              </div>
            </div>
          </div>

          {/* Right Column: Balanced Statistics Grid with Semantic Highlights */}
          <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
            
            {/* Coding Rating - Cyan (Competitive Arena) */}
            <div className="p-4 rounded-xl bg-arena-elevated border border-arena-border hover:border-arena-cyan/30 transition-colors">
              <div className="flex items-center justify-between text-xs text-arena-textSecondary font-medium mb-1">
                <span className="flex items-center gap-1.5">
                  <Swords className="w-3.5 h-3.5 text-arena-cyan" />
                  <span>Coding Rating</span>
                </span>
                <span className="text-[10px] text-arena-cyan font-mono font-semibold px-1.5 py-0.2 rounded bg-arena-cyan/10 border border-arena-cyan/25">Ranked Arena</span>
              </div>
              <div className="text-2xl font-bold text-arena-cyan font-mono">{user.rating} Elo</div>
              <p className="text-[11px] text-arena-textSubtle mt-0.5">Top 15% active competitive coders</p>
            </div>

            {/* Active Streak - Orange (Daily Multiplier) */}
            <div className="p-4 rounded-xl bg-arena-elevated border border-arena-border hover:border-arena-amber/30 transition-colors">
              <div className="flex items-center justify-between text-xs text-arena-textSecondary font-medium mb-1">
                <span className="flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-arena-amber fill-arena-amber/30" />
                  <span>Active Streak</span>
                </span>
                <span className="text-[10px] text-arena-amber font-mono font-semibold px-1.5 py-0.2 rounded bg-arena-amber/10 border border-arena-amber/25">Multiplier</span>
              </div>
              <div className="text-2xl font-bold text-arena-amber font-mono">{user.streak} Days</div>
              <p className="text-[11px] text-arena-textSubtle mt-0.5">Next milestone bonus in 4 days</p>
            </div>

            {/* Win Rate - Lime (Verified Victories) */}
            <div className="p-4 rounded-xl bg-arena-elevated border border-arena-border hover:border-arena-lime/30 transition-colors">
              <div className="flex items-center justify-between text-xs text-arena-textSecondary font-medium mb-1">
                <span className="flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-arena-lime" />
                  <span>Win Rate</span>
                </span>
                <span className="text-[10px] text-arena-lime font-mono font-semibold px-1.5 py-0.2 rounded bg-arena-lime/10 border border-arena-lime/25">{user.battlesWon}W / {user.battlesTotal} Total</span>
              </div>
              <div className="text-2xl font-bold text-arena-lime font-mono">
                {user.battlesTotal > 0 ? `${Math.round((user.battlesWon / user.battlesTotal) * 100)}%` : '100%'}
              </div>
              <p className="text-[11px] text-arena-textSubtle mt-0.5">{user.problemsSolved.length} Algorithm problems mastered</p>
            </div>
          </div>

        </div>
      </div>

      {/* DAILY CHALLENGE & INSTANT CHALLENGE SECTION — Responsive 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Daily Challenge Card (8 Cols on Wide Screen) */}
        <div className="lg:col-span-8 arena-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-arena-elevated border border-arena-border text-arena-lime text-[11px] font-semibold mb-2">
                  <span>DAILY PUZZLE</span>
                </div>
                <h3 className="text-xl font-bold text-arena-textPrimary">Word Puzzle — Daily 5-Letter Challenge</h3>
                <p className="text-xs text-arena-textSecondary mt-1 leading-relaxed max-w-xl">
                  Guess today's hidden technical word in 6 attempts. Feedback colors indicate exact matches and present letters. Every player across the globe receives the identical word today.
                </p>
              </div>

              {completedDailyChallenge ? (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-arena-elevated text-arena-lime text-xs font-semibold border border-arena-lime/30 shrink-0 shadow-[0_0_8px_rgba(181,255,74,0.15)]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-arena-lime" />
                  <span>Completed</span>
                </span>
              ) : (
                <div className="text-right shrink-0">
                  <span className="text-[10px] text-arena-textSubtle block font-medium">RESETS IN</span>
                  <span className="text-xs font-semibold text-arena-textSecondary font-mono">03h 24m</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between pt-4 mt-2 border-t border-arena-border gap-3">
            <div className="flex items-center gap-3 text-xs text-arena-textSecondary">
              <span className="flex items-center gap-1 text-arena-amber font-medium">
                <Flame className="w-3.5 h-3.5" />
                <span>+1 Streak Day</span>
              </span>
              <span>•</span>
              <span className="text-arena-textSubtle">Casual • No code required</span>
              <span>•</span>
              <span className="text-arena-cyan font-mono text-[11px]">Word length: 5</span>
            </div>

            <button
              onClick={() => handleStartGame('word-puzzle')}
              className="btn-primary text-xs py-2 px-4 gap-1.5 shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{completedDailyChallenge ? 'Review Board' : "Play Today's Puzzle"}</span>
            </button>
          </div>
        </div>

        {/* Challenge a Friend Card (4 Cols on Wide Screen) */}
        <div className="lg:col-span-4 arena-card p-6 flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 text-arena-cyan text-[11px] font-semibold mb-2">
              <Zap className="w-3.5 h-3.5 text-arena-cyan" />
              <span>INSTANT CHALLENGE</span>
            </div>
            <h3 className="text-base font-bold text-arena-textPrimary">Challenge a Friend</h3>
            <p className="text-xs text-arena-textSecondary mt-1 leading-relaxed">
              Create a private room with a shareable invite link. Opponents can join directly as a guest without signing up first.
            </p>
          </div>

          <div className="space-y-2.5 mt-5">
            <button
              onClick={() => {
                sound.playClick();
                setActiveGame('multiplayer-math');
                setActiveTab('play');
              }}
              className="w-full btn-secondary text-xs py-2.5 px-3 flex items-center justify-between font-medium group"
            >
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-3.5 h-3.5 text-arena-teal" />
                <span>Quick Math 1v1 Clash</span>
              </div>
              <ArrowRight className="w-3 h-3 text-arena-textSubtle group-hover:text-arena-textPrimary group-hover:translate-x-0.5 transition-all" />
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('arena');
              }}
              className="w-full btn-primary text-xs py-2.5 px-3 flex items-center justify-between font-medium group"
            >
              <div className="flex items-center gap-2">
                <Swords className="w-3.5 h-3.5" />
                <span>1v1 Code Battle Lobby</span>
              </div>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

      </div>

      {/* CASUAL GAMES SHELF — 4 on Desktop, 6 on Ultrawide */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-arena-textPrimary flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-arena-teal" />
              <span>Casual Games</span>
            </h2>
            <p className="text-xs text-arena-textSecondary">Accessible brain games with real scoring and instant shareable results</p>
          </div>
          <button
            onClick={() => setActiveTab('play')}
            className="text-xs font-semibold text-arena-amber hover:underline flex items-center gap-1"
          >
            <span>View All Games</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6 gap-4">
          {casualGamesList.map((game) => (
            <div
              key={game.id}
              onClick={() => handleStartGame(game.id)}
              className="arena-card p-4 cursor-pointer hover:border-arena-borderHover transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-arena-elevated border border-arena-border">
                    {game.icon}
                  </div>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-arena-elevated text-arena-textSecondary border border-arena-border">
                    {game.tag}
                  </span>
                </div>
                <h3 className="font-semibold text-sm text-arena-textPrimary group-hover:text-arena-amber transition-colors">
                  {game.title}
                </h3>
                <p className="text-xs text-arena-textSecondary mt-1 leading-relaxed line-clamp-2">
                  {game.desc}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-arena-border flex items-center justify-between text-xs font-medium text-arena-amber">
                <span>Play Game</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* THEMED ACHIEVEMENT & COLLECTIBLE CARDS SHOWCASE BANNER */}
      <div 
        onClick={() => {
          sound.playClick();
          setActiveTab('cards');
        }}
        className="rounded-2xl p-5 sm:p-6 bg-gradient-to-r from-[#182326] via-[#151E20] to-[#12181A] border border-[#2B3B3F] hover:border-arena-amber/50 cursor-pointer transition-all shadow-card group"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-arena-amber/15 border border-arena-amber/40 flex items-center justify-center text-arena-amber shrink-0 group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-arena-amber/10 border border-arena-amber/30 text-arena-amber">
                  NEW FEATURE
                </span>
                <span className="text-xs font-mono text-arena-teal font-semibold">
                  {user.unlockedCards?.length || 4} Cards Unlocked
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-arena-textPrimary group-hover:text-arena-amber transition-colors">
                Themed Achievement & Collectible Card System
              </h3>
              <p className="text-xs text-arena-textSecondary max-w-xl">
                Every victory generates a cryptographic achievement card. Inspect 3D holographic cards, verify test metrics, and export high-res cards to LinkedIn.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-arena-amber shrink-0">
            <span>Explore Collection</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* DEVELOPER ARENA & COMMUNITY ACTIVITY — Full-width balanced 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Developer Ecosystem Card */}
        <div className="arena-card p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-arena-amber mb-2">
              <Swords className="w-3.5 h-3.5" />
              <span>DEVELOPER ARENA</span>
            </div>
            <h3 className="text-lg font-bold text-arena-textPrimary">1v1 Algorithm Duels & DSA Roadmap</h3>
            <p className="text-xs text-arena-textSecondary mt-1 leading-relaxed">
              Both developers receive the identical DSA problem and code simultaneously in Monaco Editor. Automated sandbox judges run test cases in real time.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-lg bg-arena-elevated border border-arena-border">
              <span className="text-[10px] text-arena-textSubtle uppercase font-semibold">1v1 Rating</span>
              <div className="text-base font-bold text-arena-textPrimary mt-0.5 font-mono">Elo System</div>
              <p className="text-[10px] text-arena-textSecondary mt-0.5">Verified skill progression</p>
            </div>
            <div className="p-3.5 rounded-lg bg-arena-elevated border border-arena-border">
              <span className="text-[10px] text-arena-textSubtle uppercase font-semibold">DSA Roadmap</span>
              <div className="text-base font-bold text-arena-textPrimary mt-0.5 font-mono">15 Core Topics</div>
              <p className="text-[10px] text-arena-textSecondary mt-0.5">Arrays to Dynamic Programming</p>
            </div>
          </div>

          <div className="pt-3 border-t border-arena-border flex flex-wrap gap-2.5">
            <button
              onClick={() => setActiveTab('arena')}
              className="btn-primary flex-1 min-w-[110px] py-2 text-xs font-semibold gap-1.5"
            >
              <Swords className="w-3.5 h-3.5" />
              <span>Enter Arena</span>
            </button>
            <button
              onClick={() => setActiveTab('dsa-sheets')}
              className="btn-secondary flex-1 min-w-[110px] py-2 text-xs font-semibold gap-1.5 text-arena-cyan hover:border-arena-cyan/40"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>DSA Sheets</span>
            </button>
            <button
              onClick={() => setActiveTab('learn')}
              className="btn-secondary flex-1 min-w-[110px] py-2 text-xs font-semibold gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-arena-teal" />
              <span>Roadmap</span>
            </button>
          </div>
        </div>

        {/* Friends & Community Activity */}
        <div className="arena-card p-6 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-arena-textPrimary">
              <Users className="w-3.5 h-3.5 text-arena-teal" />
              <span>Recent Community Activity</span>
            </div>
            <button
              onClick={() => setActiveTab('community')}
              className="text-xs font-medium text-arena-amber hover:underline"
            >
              View Feed
            </button>
          </div>

          <div className="space-y-2.5">
            {[
              {
                user: 'kavya_codes',
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
                action: 'won a 1v1 battle on Two Sum',
                badge: '+26 Elo',
                badgeColor: 'text-arena-teal bg-arena-elevated',
                time: '12m ago'
              },
              {
                user: 'marcus_q',
                avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80',
                action: "completed today's Word Puzzle",
                badge: '12d Streak',
                badgeColor: 'text-arena-warning bg-arena-elevated',
                time: '45m ago'
              },
              {
                user: 'sara_byte',
                avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
                action: 'clocked 188ms on Reaction Challenge',
                badge: 'Top 1% Reflex',
                badgeColor: 'text-arena-amber bg-arena-elevated',
                time: '2h ago'
              }
            ].map((act, i) => (
              <div key={i} className="p-2.5 rounded-lg bg-arena-elevated border border-arena-border flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <img src={act.avatar} alt="" className="w-7 h-7 rounded-md object-cover" />
                  <div>
                    <span className="font-semibold text-arena-textPrimary">@{act.user} </span>
                    <span className="text-arena-textSecondary">{act.action}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border border-arena-border ${act.badgeColor}`}>
                    {act.badge}
                  </span>
                  <div className="text-[10px] text-arena-textSubtle mt-0.5">{act.time}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 text-center">
            <span className="text-[11px] text-arena-textSubtle">
              Challenge any community member directly to an instant duel
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
