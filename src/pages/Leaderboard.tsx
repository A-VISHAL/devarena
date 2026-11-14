import React, { useState } from 'react';
import { 
  Trophy, 
  Gamepad2, 
  Swords, 
  CheckCircle2, 
  Lock 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CASUAL_LEADERBOARD, DEVELOPER_LEADERBOARD, ACHIEVEMENTS } from '../data/mockData';
import { sound } from '../utils/sound';

export const Leaderboard: React.FC = () => {
  const { user } = useApp();

  const [activeBoard, setActiveBoard] = useState<'developer' | 'casual' | 'achievements'>('developer');

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 animate-in fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-arena-border">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-arena-blue" />
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
            <Swords className="w-3.5 h-3.5 text-arena-blue" />
            <span>Developer</span>
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
            <span>Casual</span>
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
        <div className="space-y-4">
          {/* Top 3 Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {DEVELOPER_LEADERBOARD.slice(0, 3).map((entry, idx) => (
              <div 
                key={entry.userId}
                className="arena-card p-4 text-center relative flex flex-col justify-between"
              >
                <div className="absolute top-2.5 right-2.5 text-xs font-bold text-arena-textSubtle">
                  #{entry.rank}
                </div>
                <div>
                  <img
                    src={entry.avatar}
                    alt={entry.username}
                    className="w-12 h-12 rounded-lg object-cover mx-auto mb-2 border border-arena-border"
                  />
                  <h3 className="font-bold text-xs text-arena-textPrimary">@{entry.username}</h3>
                  <span className="text-[10px] font-semibold px-2 py-0.2 rounded bg-arena-elevated text-arena-textSecondary border border-arena-border inline-block mt-1">
                    {entry.ratingBadge}
                  </span>
                </div>

                <div className="pt-2.5 mt-2.5 border-t border-arena-border">
                  <div className="text-lg font-bold text-arena-blue">{entry.score} Elo</div>
                  <span className="text-[10px] text-arena-textSubtle">{entry.secondaryScore}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="arena-card overflow-hidden">
            <div className="p-3 bg-arena-elevated border-b border-arena-border flex items-center justify-between text-[11px] font-semibold text-arena-textSubtle">
              <span className="w-12 text-center">RANK</span>
              <span className="flex-1">DEVELOPER</span>
              <span className="w-28 text-right">RATING</span>
              <span className="w-36 text-right hidden sm:inline">RECORD</span>
            </div>

            <div className="divide-y divide-arena-border">
              {/* Current user */}
              <div className="p-3 bg-arena-elevated/60 flex items-center justify-between text-xs font-medium border-l-2 border-arena-blue">
                <span className="w-12 text-center font-bold text-arena-blue">#4</span>
                <div className="flex-1 flex items-center gap-2">
                  <img src={user.avatar} className="w-6 h-6 rounded-md object-cover" alt="" />
                  <div>
                    <span className="text-arena-textPrimary font-semibold">@{user.username}</span>
                    <span className="text-[10px] text-arena-blue ml-1.5 font-medium">(You)</span>
                  </div>
                </div>
                <span className="w-28 text-right font-bold text-arena-textPrimary">{user.rating} Elo</span>
                <span className="w-36 text-right text-arena-textSecondary hidden sm:inline">
                  {user.battlesWon}W / {user.battlesLost}L
                </span>
              </div>

              {DEVELOPER_LEADERBOARD.map((item) => (
                <div key={item.userId} className="p-3 flex items-center justify-between text-xs hover:bg-arena-elevated/40">
                  <span className="w-12 text-center font-semibold text-arena-textSubtle">#{item.rank}</span>
                  <div className="flex-1 flex items-center gap-2">
                    <img src={item.avatar} className="w-6 h-6 rounded-md object-cover" alt="" />
                    <span className="text-arena-textPrimary">@{item.username}</span>
                  </div>
                  <span className="w-28 text-right font-bold text-arena-blue">{item.score} Elo</span>
                  <span className="w-36 text-right text-arena-textSubtle hidden sm:inline">{item.secondaryScore}</span>
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
            <div className="p-3 bg-arena-elevated border-b border-arena-border flex items-center justify-between text-[11px] font-semibold text-arena-textSubtle">
              <span className="w-12 text-center">RANK</span>
              <span className="flex-1">PLAYER</span>
              <span className="w-28 text-right">POINTS</span>
              <span className="w-36 text-right hidden sm:inline">RECORD</span>
            </div>

            <div className="divide-y divide-arena-border">
              {/* Current user */}
              <div className="p-3 bg-arena-elevated/60 flex items-center justify-between text-xs font-medium border-l-2 border-arena-teal">
                <span className="w-12 text-center font-bold text-arena-teal">#8</span>
                <div className="flex-1 flex items-center gap-2">
                  <img src={user.avatar} className="w-6 h-6 rounded-md object-cover" alt="" />
                  <div>
                    <span className="text-arena-textPrimary font-semibold">@{user.username}</span>
                    <span className="text-[10px] text-arena-teal ml-1.5 font-medium">(You)</span>
                  </div>
                </div>
                <span className="w-28 text-right font-bold text-arena-textPrimary">{user.casualRating} Pts</span>
                <span className="w-36 text-right text-arena-warning hidden sm:inline">
                  {user.streak}d Streak
                </span>
              </div>

              {CASUAL_LEADERBOARD.map((item) => (
                <div key={item.userId} className="p-3 flex items-center justify-between text-xs hover:bg-arena-elevated/40">
                  <span className="w-12 text-center font-semibold text-arena-textSubtle">#{item.rank}</span>
                  <div className="flex-1 flex items-center gap-2">
                    <img src={item.avatar} className="w-6 h-6 rounded-md object-cover" alt="" />
                    <span className="text-arena-textPrimary">@{item.username}</span>
                  </div>
                  <span className="w-28 text-right font-bold text-arena-teal">{item.score} Pts</span>
                  <span className="w-36 text-right text-arena-textSubtle hidden sm:inline">{item.secondaryScore}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ACHIEVEMENTS SHELF */}
      {activeBoard === 'achievements' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {ACHIEVEMENTS.map((ach) => {
              const isUnlocked = user.achievements.includes(ach.id);

              return (
                <div
                  key={ach.id}
                  className={`arena-card p-4 flex items-start gap-3.5 transition-all ${
                    isUnlocked ? 'border-arena-border' : 'opacity-50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-arena-elevated border border-arena-border flex items-center justify-center shrink-0 text-arena-blue">
                    {isUnlocked ? <Trophy className="w-5 h-5 text-arena-teal" /> : <Lock className="w-4 h-4 text-arena-textSubtle" />}
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-semibold text-xs text-arena-textPrimary">{ach.title}</h4>
                      {isUnlocked && (
                        <CheckCircle2 className="w-3 h-3 text-arena-success" />
                      )}
                    </div>
                    <p className="text-[11px] text-arena-textSecondary leading-relaxed">
                      {ach.description}
                    </p>
                    <span className="inline-block text-[10px] font-semibold text-arena-textSubtle uppercase tracking-wider pt-0.5">
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
