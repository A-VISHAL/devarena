import React, { useState } from 'react';
import { 
  Swords, 
  Flame, 
  Trophy, 
  CheckCircle2, 
  Share2, 
  Edit3, 
  Layers, 
  BookOpen,
  Code2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ACHIEVEMENTS } from '../data/mockData';
import { sound } from '../utils/sound';

export const Profile: React.FC = () => {
  const { user, updateUserProfile, openShareModal } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio);
  const [githubUrl, setGithubUrl] = useState(user.githubUrl || 'https://github.com');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playCorrect();
    updateUserProfile({
      displayName: displayName.trim(),
      bio: bio.trim(),
      githubUrl: githubUrl.trim()
    });
    setIsEditing(false);
  };

  const handleShareProfile = () => {
    sound.playClick();
    const url = `${window.location.origin}/?tab=profile`;
    navigator.clipboard.writeText(url);

    openShareModal({
      title: 'Developer Profile',
      gameOrBattle: `${user.displayName} (@${user.username})`,
      scoreOrResult: `${user.rating} Elo Rating`,
      subtitle: `${user.battlesWon} Wins • ${user.problemsSolved.length} Problems Solved`,
      customStats: [
        { label: 'Rating', value: `${user.rating} Elo` },
        { label: 'Streak', value: `${user.streak}d` }
      ]
    });
  };

  const winRate = user.battlesTotal > 0
    ? Math.round((user.battlesWon / user.battlesTotal) * 100)
    : 100;

  return (
    <div className="page-container py-8 space-y-6 animate-in fade-in">
      
      {/* Profile Header Hero */}
      <div className="rounded-2xl bg-arena-surface border border-arena-border p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <img
            src={user.avatar}
            alt={user.username}
            className="w-20 h-20 rounded-xl object-cover border border-arena-border"
          />

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-arena-textPrimary">{user.displayName}</h1>
              <span className="text-xs font-mono font-medium text-arena-textSubtle">@{user.username}</span>
              {user.isGuest ? (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-arena-elevated text-arena-teal border border-arena-border">
                  GUEST IDENTITY
                </span>
              ) : (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-arena-elevated text-arena-amber border border-arena-border font-mono">
                  VERIFIED DEVELOPER
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-arena-textSecondary leading-relaxed">
              {user.bio}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
              {user.skills.map((skill, i) => (
                <span key={i} className="text-[11px] font-medium px-2 py-0.5 rounded bg-arena-elevated border border-arena-border text-arena-textSecondary font-mono">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="flex sm:flex-col gap-2 shrink-0">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn-secondary py-1.5 px-3 text-xs gap-1.5 font-medium"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Cancel' : 'Edit Bio'}</span>
            </button>
            <button
              onClick={handleShareProfile}
              className="btn-primary py-1.5 px-3 text-xs gap-1.5 font-semibold"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* Edit Form Modal Drawer */}
      {isEditing && (
        <form onSubmit={handleSaveProfile} className="arena-card p-5 space-y-3.5 animate-in fade-in">
          <h3 className="font-bold text-xs text-arena-textPrimary">Edit Profile Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-arena-textSubtle block mb-1">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-arena-elevated border border-arena-border rounded-lg px-2.5 py-1.5 text-xs text-arena-textPrimary focus:outline-none focus:border-arena-borderHover"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-arena-textSubtle block mb-1">GitHub URL</label>
              <input
                type="text"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="w-full bg-arena-elevated border border-arena-border rounded-lg px-2.5 py-1.5 text-xs text-arena-textPrimary focus:outline-none focus:border-arena-borderHover"
              />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-medium text-arena-textSubtle block mb-1">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={2}
              className="w-full bg-arena-elevated border border-arena-border rounded-lg p-2 text-xs text-arena-textPrimary focus:outline-none focus:border-arena-borderHover resize-none"
            />
          </div>
          <button type="submit" className="btn-primary py-1.5 px-3.5 text-xs font-semibold">
            Save Changes
          </button>
        </form>
      )}

      {/* COMPETITIVE METRICS OVERVIEW — 4 Columns across full container */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="arena-card p-4 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs text-arena-textSubtle font-medium mb-1">
            <Swords className="w-3.5 h-3.5 text-arena-amber" />
            <span>Coding Rating</span>
          </div>
          <div className="text-2xl font-bold text-arena-textPrimary font-mono">{user.rating} Elo</div>
          <span className="text-[10px] text-arena-amber font-semibold">RANKED</span>
        </div>

        <div className="arena-card p-4 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs text-arena-textSubtle font-medium mb-1">
            <Trophy className="w-3.5 h-3.5 text-arena-teal" />
            <span>Win Rate</span>
          </div>
          <div className="text-2xl font-bold text-arena-teal font-mono">{winRate}%</div>
          <span className="text-[10px] text-arena-textSubtle">{user.battlesWon}W / {user.battlesTotal} Total</span>
        </div>

        <div className="arena-card p-4 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs text-arena-textSubtle font-medium mb-1">
            <Flame className="w-3.5 h-3.5 text-arena-warning" />
            <span>Active Streak</span>
          </div>
          <div className="text-2xl font-bold text-arena-warning font-mono">{user.streak} Days</div>
          <span className="text-[10px] text-arena-textSubtle">Consecutive Days</span>
        </div>

        <div className="arena-card p-4 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs text-arena-textSubtle font-medium mb-1">
            <BookOpen className="w-3.5 h-3.5 text-arena-textPrimary" />
            <span>Problems Solved</span>
          </div>
          <div className="text-2xl font-bold text-arena-textPrimary font-mono">{user.problemsSolved.length}</div>
          <span className="text-[10px] text-arena-textSubtle">DSA Practice</span>
        </div>
      </div>

      {/* TOPIC MASTERY BARS & BADGES — 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Topic Breakdown */}
        <div className="arena-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs text-arena-textPrimary flex items-center gap-2">
              <Layers className="w-4 h-4 text-arena-teal" />
              <span>Algorithmic Topic Mastery</span>
            </h3>
            <span className="text-[11px] text-arena-textSubtle">Practice coverage</span>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Arrays & Vectors', id: 'arrays', defaultPct: 65 },
              { label: 'Stacks & Queues', id: 'stacks-queues', defaultPct: 50 },
              { label: 'Two Pointers', id: 'two-pointers', defaultPct: 40 },
              { label: 'Sliding Window', id: 'sliding-window', defaultPct: 30 },
              { label: 'Dynamic Programming', id: 'dynamic-programming', defaultPct: 20 },
            ].map((topic) => {
              const pct = user.topicProgress[topic.id] || topic.defaultPct;
              return (
                <div key={topic.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-arena-textSecondary">{topic.label}</span>
                    <span className="text-arena-amber font-mono font-medium text-[11px]">{pct}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-arena-elevated overflow-hidden">
                    <div 
                      className="h-full bg-arena-amber rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Verified Badges */}
        <div className="arena-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs text-arena-textPrimary flex items-center gap-2">
              <Trophy className="w-4 h-4 text-arena-warning" />
              <span>Earned Achievements</span>
            </h3>
            <span className="text-[11px] text-arena-textSubtle">
              {user.achievements.length} Unlocked
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {ACHIEVEMENTS.slice(0, 4).map((ach) => {
              const isUnlocked = user.achievements.includes(ach.id);
              return (
                <div 
                  key={ach.id} 
                  className={`p-3 rounded-lg border text-center transition-all ${
                    isUnlocked 
                      ? 'bg-arena-elevated border-arena-border text-arena-textPrimary' 
                      : 'bg-arena-surface border-arena-border text-arena-textSubtle opacity-40'
                  }`}
                >
                  <div className="w-7 h-7 rounded-md bg-arena-surface border border-arena-border text-arena-amber flex items-center justify-center mx-auto mb-1">
                    <Trophy className="w-3.5 h-3.5 text-arena-teal" />
                  </div>
                  <div className="font-semibold text-xs truncate">{ach.title}</div>
                  <p className="text-[10px] text-arena-textSubtle line-clamp-1 mt-0.5">{ach.description}</p>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* RECENT BATTLES */}
      <div className="arena-card p-5 space-y-3">
        <h3 className="font-bold text-xs text-arena-textPrimary flex items-center gap-2">
          <Swords className="w-4 h-4 text-arena-amber" />
          <span>Competitive Battle History</span>
        </h3>

        <div className="space-y-2">
          {user.recentBattles.map((b) => (
            <div key={b.id} className="p-3 rounded-lg bg-arena-elevated border border-arena-border flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <span className={`px-2 py-0.5 rounded font-bold text-[10px] font-mono ${
                  b.result === 'won' ? 'bg-arena-success/15 text-arena-success border border-arena-success/30' : 'bg-arena-error/15 text-arena-error border border-arena-error/30'
                }`}>
                  {b.result.toUpperCase()}
                </span>
                <div>
                  <span className="font-semibold text-arena-textPrimary">{b.problemTitle} </span>
                  <span className="text-arena-textSubtle">vs @{b.opponentName}</span>
                </div>
              </div>

              <div className="text-right">
                <span className={`font-semibold font-mono ${b.ratingChange > 0 ? 'text-arena-teal' : 'text-arena-error'}`}>
                  {b.ratingChange > 0 ? `+${b.ratingChange}` : b.ratingChange} Elo
                </span>
                <span className="text-[10px] text-arena-textSubtle block">{b.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
