import React, { useState } from 'react';
import { 
  Trophy, 
  Gamepad2, 
  Swords, 
  Medal, 
  Flame, 
  Sparkles, 
  CheckCircle2, 
  Lock,
  Zap,
  Activity,
  Calculator,
  Brain,
  Share2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CASUAL_LEADERBOARD, DEVELOPER_LEADERBOARD, ACHIEVEMENTS } from '../data/mockData';
import { sound } from '../utils/sound';

export const Leaderboard: React.FC = () => {
  const { user, openShareModal } = useApp();

  const [activeBoard, setActiveBoard] = useState<'developer' | 'casual' | 'achievements'>('developer');

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6 animate-in fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-arena-border">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <h1 className="text-2xl font-black text-white">Rankings & Achievements</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Global leaderboards across competitive algorithm battles, casual brain puzzles, and verified badges.
          </p>
        </div>

        {/* Board Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-arena-surface border border-arena-border">
          <button
            onClick={() => {
              sound.playClick();
              setActiveBoard('developer');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeBoard === 'developer'
                ? 'bg-violet-600/30 text-white border border-violet-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Swords className="w-3.5 h-3.5 text-violet-400" />
            <span>Developer Arena</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveBoard('casual');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeBoard === 'casual'
                ? 'bg-emerald-600/30 text-white border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Casual Games</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveBoard('achievements');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeBoard === 'achievements'
                ? 'bg-amber-600/30 text-white border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Achievements</span>
          </button>
        </div>
      </div>

      {/* DEVELOPER ELO LEADERBOARD */}
      {activeBoard === 'developer' && (
        <div className="space-y-4">
          {/* Top 3 Podium Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {DEVELOPER_LEADERBOARD.slice(0, 3).map((entry, idx) => (
              <div 
                key={entry.userId}
                className={`arena-card p-5 text-center relative overflow-hidden flex flex-col justify-between ${
                  idx === 0 
                    ? 'border-yellow-500/40 shadow-lg shadow-yellow-500/10' 
                    : idx === 1 
                    ? 'border-slate-500/40' 
                    : 'border-amber-700/40'
                }`}
              >
                <div className="absolute top-2 right-2 text-xs font-black text-slate-500">
                  #{entry.rank}
                </div>
                <div>
                  <img
                    src={entry.avatar}
                    alt={entry.username}
                    className="w-14 h-14 rounded-full object-cover mx-auto mb-2 border-2 border-violet-500/50"
                  />
                  <h3 className="font-extrabold text-sm text-white">@{entry.username}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20 inline-block mt-1">
                    {entry.ratingBadge}
                  </span>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-800">
                  <div className="text-xl font-black text-white">{entry.score} Elo</div>
                  <span className="text-[10px] text-slate-400">{entry.secondaryScore}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="arena-card overflow-hidden">
            <div className="p-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs font-bold text-slate-400">
              <span className="w-12 text-center">RANK</span>
              <span className="flex-1">DEVELOPER</span>
              <span className="w-28 text-right">RATING (ELO)</span>
              <span className="w-36 text-right hidden sm:inline">RECORD</span>
            </div>

            <div className="divide-y divide-slate-850">
              {/* Inject current user */}
              <div className="p-3.5 bg-violet-950/30 flex items-center justify-between text-xs font-bold border-l-4 border-violet-500">
                <span className="w-12 text-center text-violet-400">#4</span>
                <div className="flex-1 flex items-center gap-2.5">
                  <img src={user.avatar} className="w-7 h-7 rounded-full object-cover" alt="" />
                  <div>
                    <span className="text-white">@{user.username}</span>
                    <span className="text-[10px] text-violet-400 ml-1.5">(You)</span>
                  </div>
                </div>
                <span className="w-28 text-right font-black text-white">{user.rating} Elo</span>
                <span className="w-36 text-right text-slate-400 hidden sm:inline">
                  {user.battlesWon}W / {user.battlesLost}L
                </span>
              </div>

              {DEVELOPER_LEADERBOARD.map((item) => (
                <div key={item.userId} className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-900/40">
                  <span className="w-12 text-center font-bold text-slate-400">#{item.rank}</span>
                  <div className="flex-1 flex items-center gap-2.5">
                    <img src={item.avatar} className="w-7 h-7 rounded-full object-cover border border-slate-700" alt="" />
                    <span className="font-semibold text-slate-200">@{item.username}</span>
                  </div>
                  <span className="w-28 text-right font-black text-violet-400">{item.score} Elo</span>
                  <span className="w-36 text-right text-slate-400 hidden sm:inline">{item.secondaryScore}</span>
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
            <div className="p-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs font-bold text-slate-400">
              <span className="w-12 text-center">RANK</span>
              <span className="flex-1">PLAYER</span>
              <span className="w-28 text-right">TOTAL POINTS</span>
              <span className="w-36 text-right hidden sm:inline">STATS</span>
            </div>

            <div className="divide-y divide-slate-850">
              {/* Inject current user */}
              <div className="p-3.5 bg-emerald-950/30 flex items-center justify-between text-xs font-bold border-l-4 border-emerald-500">
                <span className="w-12 text-center text-emerald-400">#8</span>
                <div className="flex-1 flex items-center gap-2.5">
                  <img src={user.avatar} className="w-7 h-7 rounded-full object-cover" alt="" />
                  <div>
                    <span className="text-white">@{user.username}</span>
                    <span className="text-[10px] text-emerald-400 ml-1.5">(You)</span>
                  </div>
                </div>
                <span className="w-28 text-right font-black text-white">{user.casualRating} Pts</span>
                <span className="w-36 text-right text-amber-400 hidden sm:inline">
                  {user.streak}d Streak 🔥
                </span>
              </div>

              {CASUAL_LEADERBOARD.map((item) => (
                <div key={item.userId} className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-900/40">
                  <span className="w-12 text-center font-bold text-slate-400">#{item.rank}</span>
                  <div className="flex-1 flex items-center gap-2.5">
                    <img src={item.avatar} className="w-7 h-7 rounded-full object-cover border border-slate-700" alt="" />
                    <span className="font-semibold text-slate-200">@{item.username}</span>
                  </div>
                  <span className="w-28 text-right font-black text-emerald-400">{item.score} Pts</span>
                  <span className="w-36 text-right text-slate-400 hidden sm:inline">{item.secondaryScore}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ACHIEVEMENTS SHELF */}
      {activeBoard === 'achievements' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ACHIEVEMENTS.map((ach) => {
              const isUnlocked = user.achievements.includes(ach.id);

              return (
                <div
                  key={ach.id}
                  className={`arena-card p-5 flex items-start gap-4 transition-all ${
                    isUnlocked 
                      ? 'border-violet-500/40 bg-gradient-to-br from-slate-900 to-violet-950/20' 
                      : 'opacity-60 bg-slate-950/40 border-slate-800'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    isUnlocked 
                      ? 'bg-violet-600/20 text-violet-400 border border-violet-500/30' 
                      : 'bg-slate-900 text-slate-600'
                  }`}>
                    {isUnlocked ? <Trophy className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-white">{ach.title}</h4>
                      {isUnlocked && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {ach.description}
                    </p>
                    <span className="inline-block text-[10px] font-bold text-slate-500 uppercase tracking-wider pt-1">
                      {isUnlocked ? '✓ UNLOCKED & VERIFIED' : 'LOCKED'}
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

