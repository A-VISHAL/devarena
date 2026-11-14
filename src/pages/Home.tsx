import React from 'react';
import { 
  Gamepad2, 
  Swords, 
  Flame, 
  Trophy, 
  Sparkles, 
  ArrowRight, 
  Play, 
  Users, 
  CheckCircle2, 
  Clock, 
  Zap, 
  BookOpen, 
  Share2,
  TrendingUp,
  Brain
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CasualGameId } from '../types';
import { sound } from '../utils/sound';

export const Home: React.FC = () => {
  const { 
    user, 
    setActiveTab, 
    setActiveGame, 
    setActiveBattleId,
    completedDailyChallenge,
    openShareModal
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-in fade-in">
      
      {/* HERO SECTION */}
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-arena-card to-slate-950 border border-violet-500/25 p-6 sm:p-10 overflow-hidden shadow-2xl">
        {/* Ambient neon orbs */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen Casual Gaming & Competitive Developer Arena</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Play together. Think faster. <br />
              <span className="bg-gradient-to-r from-violet-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">
                Code stronger.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              Anyone can play brain-stimulating casual puzzles. Developers can enter 1v1 live coding battles, practice DSA algorithms, and prove their real problem-solving skill.
            </p>

            {/* Hero Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => handleStartGame('word-puzzle')}
                className="btn-cyan py-3 px-6 text-sm font-bold gap-2 shadow-lg shadow-cyan-500/25"
              >
                <Gamepad2 className="w-4 h-4" />
                <span>Play Casual Games</span>
              </button>

              <button
                onClick={handleStartBattle}
                className="btn-primary py-3 px-6 text-sm font-bold gap-2 shadow-lg shadow-violet-500/25"
              >
                <Swords className="w-4 h-4" />
                <span>Start a Coding Battle</span>
              </button>
            </div>
          </div>

          {/* Quick Stats Glance */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-3 shrink-0">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-1.5 text-xs text-slate-400 font-semibold mb-1">
                <Swords className="w-3.5 h-3.5 text-violet-400" />
                <span>Coding Rating</span>
              </div>
              <div className="text-2xl font-black text-white">{user.rating} Elo</div>
              <span className="text-[10px] text-emerald-400 font-medium">Ranked Arena</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-1.5 text-xs text-slate-400 font-semibold mb-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Active Streak</span>
              </div>
              <div className="text-2xl font-black text-amber-400">{user.streak} Days</div>
              <span className="text-[10px] text-slate-400 font-medium">Streak Multiplier Active</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center lg:text-left col-span-2 sm:col-span-1">
              <div className="flex items-center justify-center lg:justify-start gap-1.5 text-xs text-slate-400 font-semibold mb-1">
                <Trophy className="w-3.5 h-3.5 text-cyan-400" />
                <span>Win Rate</span>
              </div>
              <div className="text-2xl font-black text-cyan-400">
                {user.battlesTotal > 0 ? `${Math.round((user.battlesWon / user.battlesTotal) * 100)}%` : '100%'}
              </div>
              <span className="text-[10px] text-slate-400 font-medium">{user.battlesWon} Won / {user.battlesTotal} Total</span>
            </div>
          </div>
        </div>
      </div>

      {/* DAILY CHALLENGE & QUICK ACTIONS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Daily Challenge Card (2 Cols) */}
        <div className="lg:col-span-2 arena-card-glow p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-2">
                <Sparkles className="w-3 h-3" />
                <span>TODAY'S DAILY PUZZLE</span>
              </div>
              <h3 className="text-xl font-black text-white">Daily Word Puzzle — 5-Letter Challenge</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-lg">
                Guess today's hidden technical word in 6 tries. Letter tiles flip green, yellow, or dark to guide you. Every player in the world receives the same word today!
              </p>
            </div>

            {completedDailyChallenge ? (
              <span className="flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40">
                <CheckCircle2 className="w-4 h-4" />
                <span>Completed</span>
              </span>
            ) : (
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block font-semibold">RESET IN</span>
                <span className="text-xs font-bold text-slate-300 font-mono">03h 24m</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>+1 Streak Day</span>
              </span>
              <span>•</span>
              <span className="text-violet-300 font-medium">No coding required</span>
            </div>

            <button
              onClick={() => handleStartGame('word-puzzle')}
              className={`btn-primary text-xs py-2 px-4 gap-1.5 ${
                completedDailyChallenge ? 'bg-slate-800 hover:bg-slate-700' : ''
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{completedDailyChallenge ? 'Review Board' : 'Play Today\'s Word'}</span>
            </button>
          </div>
        </div>

        {/* Quick Duel & Challenge Card */}
        <div className="arena-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-violet-400 text-xs font-bold mb-2">
              <Zap className="w-4 h-4" />
              <span>INSTANT SOCIAL CHALLENGE</span>
            </div>
            <h3 className="text-base font-extrabold text-white">Challenge a Friend</h3>
            <p className="text-xs text-slate-400 mt-1">
              Create an instant private room. They don't even need an account to join!
            </p>
          </div>

          <div className="space-y-2.5 mt-5">
            <button
              onClick={() => {
                sound.playClick();
                setActiveGame('multiplayer-math');
                setActiveTab('play');
              }}
              className="w-full btn-secondary text-xs py-2.5 px-3 flex items-center justify-between font-bold hover:border-cyan-500/40"
            >
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-4 h-4 text-cyan-400" />
                <span>Quick Math 1v1 Duel</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('arena');
              }}
              className="w-full btn-primary text-xs py-2.5 px-3 flex items-center justify-between font-bold"
            >
              <div className="flex items-center gap-2">
                <Swords className="w-4 h-4" />
                <span>1v1 Code Battle Lobby</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-white/80" />
            </button>
          </div>
        </div>
      </div>

      {/* POPULAR CASUAL GAMES SHELF */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-emerald-400" />
              <span>Casual Games</span>
            </h2>
            <p className="text-xs text-slate-400">Playable by everyone • No technical knowledge required</p>
          </div>
          <button
            onClick={() => setActiveTab('play')}
            className="text-xs font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1"
          >
            <span>View All Games</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              id: 'odd-one-out' as CasualGameId,
              title: 'Odd One Out',
              desc: 'Find the symbol or subtle shade that differs across 10 progressive levels.',
              icon: '🔍',
              tag: 'Visual Speed',
              color: 'from-amber-600/20 to-rose-600/20'
            },
            {
              id: 'reaction-challenge' as CasualGameId,
              title: 'Reaction Challenge',
              desc: 'High-precision millisecond reflex benchmark with genuine percentile metrics.',
              icon: '⚡',
              tag: 'Reflexes',
              color: 'from-cyan-600/20 to-blue-600/20'
            },
            {
              id: 'quick-math' as CasualGameId,
              title: 'Quick Math',
              desc: '60-second rapid mental arithmetic sprint with combo multipliers.',
              icon: '🧮',
              tag: 'Mental Sprint',
              color: 'from-emerald-600/20 to-teal-600/20'
            },
            {
              id: 'memory-grid' as CasualGameId,
              title: 'Memory Grid',
              desc: 'Memorize spatial flashing patterns on an expanding 3x3 to 5x5 grid.',
              icon: '🧠',
              tag: 'Working Memory',
              color: 'from-violet-600/20 to-purple-600/20'
            }
          ].map((game) => (
            <div
              key={game.id}
              onClick={() => handleStartGame(game.id)}
              className="arena-card p-5 cursor-pointer hover:scale-[1.02] hover:border-violet-500/40 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{game.icon}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {game.tag}
                  </span>
                </div>
                <h3 className="font-extrabold text-sm text-white group-hover:text-violet-300 transition-colors">
                  {game.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {game.desc}
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-violet-400">
                <span>Play Now</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TRENDING CODING BATTLES & FRIEND ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Developer Ecosystem Teaser */}
        <div className="arena-card p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-violet-400 mb-2">
              <Swords className="w-4 h-4" />
              <span>COMPETITIVE CODING ECOSYSTEM</span>
            </div>
            <h3 className="text-lg font-black text-white">Live 1v1 Algorithm Duels & DSA Roadmap</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Step into the Code Arena. Both players receive the identical DSA problem and code simultaneously in Monaco Editor. Automated sandbox judges run test cases in real-time.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-bold">1v1 Rating</span>
              <div className="text-base font-black text-white mt-0.5">Elo System</div>
              <p className="text-[10px] text-slate-400 mt-0.5">Verified skill progression</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-bold">DSA Roadmap</span>
              <div className="text-base font-black text-white mt-0.5">15 Core Topics</div>
              <p className="text-[10px] text-slate-400 mt-0.5">Arrays to Dynamic Programming</p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex gap-3">
            <button
              onClick={() => setActiveTab('arena')}
              className="btn-primary flex-1 py-2 text-xs font-bold gap-1.5"
            >
              <Swords className="w-3.5 h-3.5" />
              <span>Enter Arena</span>
            </button>
            <button
              onClick={() => setActiveTab('learn')}
              className="btn-secondary flex-1 py-2 text-xs font-bold gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>Explore Roadmap</span>
            </button>
          </div>
        </div>

        {/* Live Community Activity Stream */}
        <div className="arena-card p-6 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
              <Users className="w-4 h-4" />
              <span>FRIENDS & COMMUNITY ACTIVITY</span>
            </div>
            <button
              onClick={() => setActiveTab('community')}
              className="text-xs font-semibold text-slate-400 hover:text-white"
            >
              View Feed
            </button>
          </div>

          <div className="space-y-3">
            {[
              {
                user: 'kavya_codes',
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
                action: 'won a 1v1 battle on Two Sum',
                badge: '+26 Elo',
                time: '12m ago'
              },
              {
                user: 'marcus_q',
                avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80',
                action: 'achieved a 12-day streak on Daily Puzzle',
                badge: '12d Streak 🔥',
                time: '45m ago'
              },
              {
                user: 'sara_byte',
                avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
                action: 'clocked 188ms on Reaction Challenge',
                badge: 'Top 1% Reflex',
                time: '2h ago'
              }
            ].map((act, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <img src={act.avatar} alt="" className="w-7 h-7 rounded-full object-cover border border-violet-500/30" />
                  <div>
                    <span className="font-bold text-slate-200">@{act.user} </span>
                    <span className="text-slate-400">{act.action}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 font-bold text-[10px] border border-violet-500/20">
                    {act.badge}
                  </span>
                  <div className="text-[10px] text-slate-500 mt-0.5">{act.time}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 text-center">
            <span className="text-[11px] text-slate-400">
              Invite friends to see their achievements and duel directly!
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

