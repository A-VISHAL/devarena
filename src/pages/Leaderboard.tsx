import React, { useState } from 'react';
import { 
  Trophy, 
  Gamepad2, 
  Swords, 
  CheckCircle2, 
  Lock,
  Medal,
  Flame,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CASUAL_LEADERBOARD, DEVELOPER_LEADERBOARD, ACHIEVEMENTS } from '../data/mockData';
import { sound } from '../utils/sound';

export const Leaderboard: React.FC = () => {
  const { user, setActiveTab, setActiveBattleId } = useApp();

  const [activeBoard, setActiveBoard] = useState<'developer' | 'casual' | 'achievements'>('developer');

  const handleChallengePlayer = (username: string) => {
    sound.playClick();
    const newBattleCode = `DEV-${Math.floor(1000 + Math.random() * 9000)}`;
    setActiveBattleId(newBattleCode);
    setActiveTab('arena');
  };

  return (
    <div className="page-container py-8 space-y-6 animate-in fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-arena-border">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-arena-amber" />
            <h1 className="text-2xl font-bold text-arena-textPrimary">Leaderboards & Achievements</h1>
          </div>
          <p className="text-xs text-arena-textSecondary mt-1">
            Global rankings across competitive 1v1 coding duels, casual puzzles, and verified badges.
          </p>
        </div>

        {/* Board Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-arena-surface border border-arena-border">
          <button
            onClick={() => {
              sound.playClick();
              setActiveBoard('developer');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeBoard === 'developer'
                ? 'bg-arena-elevated text-arena-textPrimary border border-arena-border shadow-subtle'
                : 'text-arena-textSecondary hover:text-arena-textPrimary'
            }`}
          >
            <Swords className="w-3.5 h-3.5 text-arena-amber" />
            <span>Developer Elo</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveBoard('casual');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeBoard === 'casual'
                ? 'bg-arena-elevated text-arena-textPrimary border border-arena-border shadow-subtle'
                : 'text-arena-textSecondary hover:text-arena-textPrimary'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5 text-arena-teal" />
            <span>Casual Games</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveBoard('achievements');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeBoard === 'achievements'
                ? 'bg-arena-elevated text-arena-textPrimary border border-arena-border shadow-subtle'
                : 'text-arena-textSecondary hover:text-arena-textPrimary'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-arena-warning" />
            <span>Badges</span>
          </button>
        </div>
      </div>

      {/* DEVELOPER ELO LEADERBOARD */}
      {activeBoard === 'developer' && (
        <div className="space-y-6">
          {/* Top 3 Podium Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {DEVELOPER_LEADERBOARD.slice(0, 3).map((entry, idx) => (
              <div 
                key={entry.userId}
                className="arena-card p-5 text-center relative flex flex-col justify-between"
              >
                <div className={`absolute top-3 right-3 text-xs font-bold font-mono px-2 py-0.5 rounded ${
                  idx === 0 
                    ? 'bg-arena-amber/20 text-arena-amber border border-arena-amber/30' 
                    : idx === 1 
                    ? 'bg-slate-400/20 text-slate-300 border border-slate-400/30' 
                    : 'bg-arena-teal/20 text-arena-teal border border-arena-teal/30'
                }`}>
                  #{entry.rank}
                </div>

                <div>
                  <img
                    src={entry.avatar}
                    alt={entry.username}
                    className="w-14 h-14 rounded-xl object-cover mx-auto mb-3 border border-arena-border"
                  />
                  <h3 className="font-bold text-sm text-arena-textPrimary">@{entry.username}</h3>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-arena-elevated text-arena-textSecondary border border-arena-border inline-block mt-1 font-mono">
                    {entry.ratingBadge}
                  </span>
                </div>

                <div className="pt-3 mt-3 border-t border-arena-border flex items-center justify-between">
                  <div className="text-left">
                    <div className="text-base font-bold text-arena-amber font-mono">{entry.score} Elo</div>
                    <span className="text-[10px] text-arena-textSubtle">{entry.secondaryScore}</span>
                  </div>

                  <button
                    onClick={() => handleChallengePlayer(entry.username)}
                    className="btn-secondary py-1 px-2.5 text-xs font-medium gap-1"
                  >
                    <Swords className="w-3 h-3 text-arena-amber" />
                    <span>Duel</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Full Table */}
          <div className="arena-card overflow-hidden">
            <div className="p-3.5 bg-arena-elevated border-b border-arena-border flex items-center justify-between text-[11px] font-semibold text-arena-textSubtle uppercase tracking-wider">
              <span className="w-16 text-center">Rank</span>
              <span className="flex-1">Developer</span>
              <span className="w-32 text-right">Rating</span>
              <span className="w-44 text-right hidden sm:inline">Performance</span>
              <span className="w-24 text-right pr-2">Action</span>
            </div>

            <div className="divide-y divide-arena-border">
              {/* Current user Highlight */}
              <div className="p-3.5 bg-arena-elevated/70 flex items-center justify-between text-xs font-medium border-l-4 border-arena-amber">
                <span className="w-16 text-center font-bold text-arena-amber font-mono">#4</span>
                <div className="flex-1 flex items-center gap-2.5">
                  <img src={user.avatar} className="w-7 h-7 rounded-lg object-cover" alt="" />
                  <div>
                    <span className="text-arena-textPrimary font-semibold">@{user.username}</span>
                    <span className="text-[10px] text-arena-amber ml-1.5 font-medium px-1.5 py-0.2 rounded bg-arena-amber/15 border border-arena-amber/25">YOU</span>
                  </div>
                </div>
                <span className="w-32 text-right font-bold text-arena-textPrimary font-mono">{user.rating} Elo</span>
                <span className="w-44 text-right text-arena-textSecondary hidden sm:inline font-mono">
                  {user.battlesWon}W / {user.battlesLost}L ({user.battlesTotal > 0 ? Math.round((user.battlesWon / user.battlesTotal) * 100) : 100}%)
                </span>
                <span className="w-24 text-right pr-2 text-arena-textSubtle text-[11px]">Your Rank</span>
              </div>

              {DEVELOPER_LEADERBOARD.map((item) => (
                <div key={item.userId} className="p-3.5 flex items-center justify-between text-xs hover:bg-arena-elevated/40 transition-colors">
                  <span className="w-16 text-center font-semibold text-arena-textSubtle font-mono">#{item.rank}</span>
                  <div className="flex-1 flex items-center gap-2.5">
                    <img src={item.avatar} className="w-7 h-7 rounded-lg object-cover" alt="" />
                    <span className="text-arena-textPrimary font-medium">@{item.username}</span>
                  </div>
                  <span className="w-32 text-right font-bold text-arena-amber font-mono">{item.score} Elo</span>
                  <span className="w-44 text-right text-arena-textSubtle hidden sm:inline font-mono">{item.secondaryScore}</span>
                  <div className="w-24 text-right pr-2">
                    <button
                      onClick={() => handleChallengePlayer(item.username)}
                      className="text-xs text-arena-amber hover:underline font-semibold"
                    >
                      Challenge
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CASUAL GAMING LEADERBOARD */}
      {activeBoard === 'casual' && (
        <div className="space-y-4">
          <div className="arena-card overflow-hidden">
            <div className="p-3.5 bg-arena-elevated border-b border-arena-border flex items-center justify-between text-[11px] font-semibold text-arena-textSubtle uppercase tracking-wider">
              <span className="w-16 text-center">Rank</span>
              <span className="flex-1">Player</span>
              <span className="w-32 text-right">Points</span>
              <span className="w-44 text-right hidden sm:inline">Streak / Metric</span>
            </div>

            <div className="divide-y divide-arena-border">
              {/* Current user */}
              <div className="p-3.5 bg-arena-elevated/70 flex items-center justify-between text-xs font-medium border-l-4 border-arena-teal">
                <span className="w-16 text-center font-bold text-arena-teal font-mono">#8</span>
                <div className="flex-1 flex items-center gap-2.5">
                  <img src={user.avatar} className="w-7 h-7 rounded-lg object-cover" alt="" />
                  <div>
                    <span className="text-arena-textPrimary font-semibold">@{user.username}</span>
                    <span className="text-[10px] text-arena-teal ml-1.5 font-medium px-1.5 py-0.2 rounded bg-arena-teal/15 border border-arena-teal/25">YOU</span>
                  </div>
                </div>
                <span className="w-32 text-right font-bold text-arena-textPrimary font-mono">{user.casualRating} Pts</span>
                <span className="w-44 text-right text-arena-warning hidden sm:inline font-mono">
                  {user.streak}d Streak
                </span>
              </div>

              {CASUAL_LEADERBOARD.map((item) => (
                <div key={item.userId} className="p-3.5 flex items-center justify-between text-xs hover:bg-arena-elevated/40 transition-colors">
                  <span className="w-16 text-center font-semibold text-arena-textSubtle font-mono">#{item.rank}</span>
                  <div className="flex-1 flex items-center gap-2.5">
                    <img src={item.avatar} className="w-7 h-7 rounded-lg object-cover" alt="" />
                    <span className="text-arena-textPrimary font-medium">@{item.username}</span>
                  </div>
                  <span className="w-32 text-right font-bold text-arena-teal font-mono">{item.score} Pts</span>
                  <span className="w-44 text-right text-arena-textSubtle hidden sm:inline font-mono">{item.secondaryScore}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ACHIEVEMENTS SHELF — Responsive Grid */}
      {activeBoard === 'achievements' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {ACHIEVEMENTS.map((ach) => {
              const isUnlocked = user.achievements.includes(ach.id);

              return (
                <div
                  key={ach.id}
                  className={`arena-card p-4 flex items-start gap-3.5 transition-all ${
                    isUnlocked ? 'border-arena-border' : 'opacity-50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-arena-elevated border border-arena-border flex items-center justify-center shrink-0">
                    {isUnlocked ? <Trophy className="w-5 h-5 text-arena-teal" /> : <Lock className="w-4 h-4 text-arena-textSubtle" />}
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-semibold text-xs text-arena-textPrimary">{ach.title}</h4>
                      {isUnlocked && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-arena-success" />
                      )}
                    </div>
                    <p className="text-[11px] text-arena-textSecondary leading-relaxed">
                      {ach.description}
                    </p>
                    <span className="inline-block text-[10px] font-semibold text-arena-textSubtle uppercase tracking-wider pt-0.5 font-mono">
                      {isUnlocked ? '✓ VERIFIED' : 'LOCKED'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
