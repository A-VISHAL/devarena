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
  Clock, 
  Zap, 
  BookOpen, 
  TrendingUp,
  Brain,
  Hash,
  Eye,
  Activity,
  Calculator,
  Compass
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      
      {/* HERO SECTION — Linear/Vercel restraint */}
      <div className="rounded-2xl bg-arena-surface border border-arena-border p-6 sm:p-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-arena-elevated border border-arena-border text-arena-textSecondary text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-arena-blue" />
              <span>Social Casual Gaming & Competitive Developer Platform</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-arena-textPrimary leading-tight">
              Play together. Think faster. <br />
              <span className="text-arena-blue">Code stronger.</span>
            </h1>

            <p className="text-sm sm:text-base text-arena-textSecondary leading-relaxed max-w-xl">
              Quick, engaging puzzles anyone can enjoy without technical skills. Real-time 1v1 coding duels, DSA roadmaps, and ratings for developers.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => handleStartGame('word-puzzle')}
                className="btn-primary py-2.5 px-5 text-xs font-semibold gap-2"
              >
                <Gamepad2 className="w-4 h-4" />
                <span>Play Casual Games</span>
              </button>

              <button
                onClick={handleStartBattle}
                className="btn-secondary py-2.5 px-5 text-xs font-semibold gap-2"
              >
                <Swords className="w-4 h-4 text-arena-blue" />
                <span>Start Coding Battle</span>
              </button>
            </div>
          </div>

          {/* Compact Stats Layout */}
          <div className="grid grid-cols-3 lg:grid-cols-1 gap-2.5 sm:gap-3 shrink-0 lg:w-64">
            <div className="p-3.5 rounded-xl bg-arena-elevated border border-arena-border">
              <div className="flex items-center gap-1.5 text-xs text-arena-textSecondary font-medium mb-1">
                <Swords className="w-3.5 h-3.5 text-arena-blue" />
                <span>Coding Rating</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-arena-textPrimary">{user.rating} Elo</div>
              <span className="text-[10px] text-arena-teal font-medium">Ranked Arena</span>
            </div>

            <div className="p-3.5 rounded-xl bg-arena-elevated border border-arena-border">
              <div className="flex items-center gap-1.5 text-xs text-arena-textSecondary font-medium mb-1">
                <Flame className="w-3.5 h-3.5 text-arena-warning" />
                <span>Active Streak</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-arena-warning">{user.streak} Days</div>
              <span className="text-[10px] text-arena-textSubtle font-medium">Streak Multiplier</span>
            </div>

            <div className="p-3.5 rounded-xl bg-arena-elevated border border-arena-border">
              <div className="flex items-center gap-1.5 text-xs text-arena-textSecondary font-medium mb-1">
                <Trophy className="w-3.5 h-3.5 text-arena-blue" />
                <span>Win Rate</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-arena-textPrimary">
                {user.battlesTotal > 0 ? `${Math.round((user.battlesWon / user.battlesTotal) * 100)}%` : '100%'}
              </div>
              <span className="text-[10px] text-arena-textSubtle font-medium">{user.battlesWon}W / {user.battlesTotal} Total</span>
            </div>
          </div>

        </div>
      </div>

      {/* DAILY CHALLENGE & QUICK SOCIAL ACTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Daily Challenge Card (2 Cols) */}
        <div className="lg:col-span-2 arena-card p-6 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-arena-elevated border border-arena-border text-arena-teal text-[11px] font-semibold mb-2">
                <span>DAILY PUZZLE</span>
              </div>
              <h3 className="text-lg font-bold text-arena-textPrimary">Word Puzzle — Daily 5-Letter Challenge</h3>
              <p className="text-xs text-arena-textSecondary mt-1 max-w-lg leading-relaxed">
                Guess today's hidden technical word in 6 attempts. Feedback colors indicate exact matches and present letters. Every player receives the same word today.
              </p>
            </div>

            {completedDailyChallenge ? (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-arena-elevated text-arena-success text-xs font-medium border border-arena-border shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-arena-success" />
                <span>Completed</span>
              </span>
            ) : (
              <div className="text-right shrink-0">
                <span className="text-[10px] text-arena-textSubtle block font-medium">RESETS IN</span>
                <span className="text-xs font-semibold text-arena-textSecondary font-mono">03h 24m</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-arena-border">
            <div className="flex items-center gap-3 text-xs text-arena-textSecondary">
              <span className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-arena-warning" />
                <span>+1 Streak Day</span>
              </span>
              <span>•</span>
              <span className="text-arena-textSubtle">Casual • No code required</span>
            </div>

            <button
              onClick={() => handleStartGame('word-puzzle')}
              className="btn-primary text-xs py-2 px-4 gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{completedDailyChallenge ? 'Review Board' : 'Play Today\'s Puzzle'}</span>
            </button>
          </div>
        </div>

        {/* Challenge a Friend Card */}
        <div className="arena-card p-6 flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 text-arena-blue text-[11px] font-semibold mb-2">
              <Zap className="w-3.5 h-3.5" />
              <span>INSTANT CHALLENGE</span>
            </div>
            <h3 className="text-base font-bold text-arena-textPrimary">Challenge a Friend</h3>
            <p className="text-xs text-arena-textSecondary mt-1 leading-relaxed">
              Create a private room with a shareable link. Opponents can join directly as a guest without signing up first.
            </p>
          </div>

          <div className="space-y-2 mt-5">
            <button
              onClick={() => {
                sound.playClick();
                setActiveGame('multiplayer-math');
                setActiveTab('play');
              }}
              className="w-full btn-secondary text-xs py-2 px-3 flex items-center justify-between font-medium"
            >
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-3.5 h-3.5 text-arena-teal" />
                <span>Quick Math 1v1 Clash</span>
              </div>
              <ArrowRight className="w-3 h-3 text-arena-textSubtle" />
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('arena');
              }}
              className="w-full btn-primary text-xs py-2 px-3 flex items-center justify-between font-medium"
            >
              <div className="flex items-center gap-2">
                <Swords className="w-3.5 h-3.5" />
                <span>1v1 Code Battle Lobby</span>
              </div>
              <ArrowRight className="w-3 h-3 text-white" />
            </button>
          </div>
        </div>

      </div>

      {/* CASUAL GAMES SHELF */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-arena-textPrimary flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-arena-teal" />
              <span>Casual Games</span>
            </h2>
            <p className="text-xs text-arena-textSecondary">Accessible brain games with real scoring and shareable results</p>
          </div>
          <button
            onClick={() => setActiveTab('play')}
            className="text-xs font-medium text-arena-blue hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              id: 'odd-one-out' as CasualGameId,
              title: 'Odd One Out',
              desc: 'Spot the subtle symbol, rotation, or shade difference across 10 timed levels.',
              icon: <Eye className="w-4 h-4 text-arena-teal" />,
              tag: 'Visual Speed',
            },
            {
              id: 'reaction-challenge' as CasualGameId,
              title: 'Reaction Challenge',
              desc: 'High-precision millisecond reflex benchmark with true percentile statistics.',
              icon: <Activity className="w-4 h-4 text-arena-blue" />,
              tag: 'Reflexes',
            },
            {
              id: 'quick-math' as CasualGameId,
              title: 'Quick Math',
              desc: '60-second mental arithmetic sprint tracking speed, streaks, and accuracy.',
              icon: <Calculator className="w-4 h-4 text-arena-teal" />,
              tag: 'Mental Sprint',
            },
            {
              id: 'memory-grid' as CasualGameId,
              title: 'Memory Grid',
              desc: 'Memorize spatial flashing patterns on an expanding 3x3 to 5x5 grid.',
              icon: <Brain className="w-4 h-4 text-arena-blue" />,
              tag: 'Working Memory',
            }
          ].map((game) => (
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
                <h3 className="font-semibold text-sm text-arena-textPrimary group-hover:text-arena-blue transition-colors">
                  {game.title}
                </h3>
                <p className="text-xs text-arena-textSecondary mt-1 leading-relaxed line-clamp-2">
                  {game.desc}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-arena-border flex items-center justify-between text-xs font-medium text-arena-blue">
                <span>Play Game</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CODE ARENA & COMMUNITY ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Developer Ecosystem Card */}
        <div className="arena-card p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-arena-blue mb-2">
              <Swords className="w-3.5 h-3.5" />
              <span>DEVELOPER ARENA</span>
            </div>
            <h3 className="text-lg font-bold text-arena-textPrimary">1v1 Algorithm Duels & DSA Roadmap</h3>
            <p className="text-xs text-arena-textSecondary mt-1 leading-relaxed">
              Both developers receive the identical DSA problem and code simultaneously in Monaco Editor. Automated sandbox judges run test cases in real time.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-lg bg-arena-elevated border border-arena-border">
              <span className="text-[10px] text-arena-textSubtle uppercase font-semibold">1v1 Rating</span>
              <div className="text-base font-bold text-arena-textPrimary mt-0.5">Elo System</div>
              <p className="text-[10px] text-arena-textSecondary mt-0.5">Verified skill progression</p>
            </div>
            <div className="p-3 rounded-lg bg-arena-elevated border border-arena-border">
              <span className="text-[10px] text-arena-textSubtle uppercase font-semibold">DSA Roadmap</span>
              <div className="text-base font-bold text-arena-textPrimary mt-0.5">15 Core Topics</div>
              <p className="text-[10px] text-arena-textSecondary mt-0.5">Arrays to Dynamic Programming</p>
            </div>
          </div>

          <div className="pt-3 border-t border-arena-border flex gap-3">
            <button
              onClick={() => setActiveTab('arena')}
              className="btn-primary flex-1 py-2 text-xs font-semibold gap-1.5"
            >
              <Swords className="w-3.5 h-3.5" />
              <span>Enter Arena</span>
            </button>
            <button
              onClick={() => setActiveTab('learn')}
              className="btn-secondary flex-1 py-2 text-xs font-semibold gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-arena-teal" />
              <span>Explore Roadmap</span>
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
              className="text-xs font-medium text-arena-blue hover:underline"
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
                action: 'completed today\'s Word Puzzle',
                badge: '12d Streak',
                badgeColor: 'text-arena-warning bg-arena-elevated',
                time: '45m ago'
              },
              {
                user: 'sara_byte',
                avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
                action: 'clocked 188ms on Reaction Challenge',
                badge: 'Top 1% Reflex',
                badgeColor: 'text-arena-blue bg-arena-elevated',
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
