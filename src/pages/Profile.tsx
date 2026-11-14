import React, { useState } from 'react';
import { 
  User, 
  Swords, 
  Flame, 
  Trophy, 
  CheckCircle2, 
  Share2, 
  Github, 
  Globe, 
  Edit3, 
  Copy, 
  Check, 
  Code2, 
  Layers, 
  Sparkles,
  BookOpen
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
  const [copiedLink, setCopiedLink] = useState(false);

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
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);

    openShareModal({
      title: 'Developer Profile Card',
      gameOrBattle: `${user.displayName} (@${user.username})`,
      scoreOrResult: `${user.rating} Elo Rating`,
      subtitle: `${user.battlesWon} Wins • ${user.problemsSolved.length} DSA Problems Solved`,
      customStats: [
        { label: 'Coding Rating', value: `${user.rating} Elo` },
        { label: 'Active Streak', value: `${user.streak}d 🔥` }
      ]
    });
  };

  const winRate = user.battlesTotal > 0
    ? Math.round((user.battlesWon / user.battlesTotal) * 100)
    : 100;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6 animate-in fade-in">
      
      {/* Profile Header Hero */}
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-arena-card to-slate-950 border border-violet-500/30 p-6 sm:p-8 overflow-hidden shadow-2xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          <img
            src={user.avatar}
            alt={user.username}
            className="w-24 h-24 rounded-3xl object-cover border-2 border-violet-500/50 shadow-xl shadow-violet-500/20"
          />

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-black text-white">{user.displayName}</h1>
              <span className="text-xs font-mono font-bold text-slate-400">@{user.username}</span>
              {user.isGuest ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  GUEST PROFILE
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20">
                  VERIFIED DEVELOPER
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              {user.bio}
            </p>

            {/* Social Links & Skills */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              {user.skills.map((skill, i) => (
                <span key={i} className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex sm:flex-col gap-2 shrink-0">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn-secondary py-2 px-3 text-xs gap-1.5 font-bold"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Cancel' : 'Edit Bio'}</span>
            </button>
            <button
              onClick={handleShareProfile}
              className="btn-primary py-2 px-3 text-xs gap-1.5 font-bold shadow-md shadow-violet-500/20"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* Edit Form Modal Drawer */}
      {isEditing && (
        <form onSubmit={handleSaveProfile} className="arena-card p-5 space-y-3 animate-in fade-in">
          <h3 className="font-extrabold text-sm text-white">Edit Profile Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">GitHub URL</label>
              <input
                type="text"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Short Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={2}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-violet-500"
            />
          </div>
          <button type="submit" className="btn-primary py-2 px-4 text-xs font-bold">
            Save Changes
          </button>
        </form>
      )}

      {/* COMPETITIVE METRICS OVERVIEW */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="arena-card p-5 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-semibold mb-1">
            <Swords className="w-4 h-4 text-violet-400" />
            <span>Coding Rating</span>
          </div>
          <div className="text-2xl font-black text-white">{user.rating} Elo</div>
          <span className="text-[10px] text-violet-400 font-bold">VERIFIED RANK</span>
        </div>

        <div className="arena-card p-5 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-semibold mb-1">
            <Trophy className="w-4 h-4 text-cyan-400" />
            <span>Win Rate</span>
          </div>
          <div className="text-2xl font-black text-cyan-400">{winRate}%</div>
          <span className="text-[10px] text-slate-400">{user.battlesWon} Won / {user.battlesTotal} Total</span>
        </div>

        <div className="arena-card p-5 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-semibold mb-1">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Active Streak</span>
          </div>
          <div className="text-2xl font-black text-amber-400">{user.streak} Days</div>
          <span className="text-[10px] text-amber-500/80 font-bold">ON FIRE</span>
        </div>

        <div className="arena-card p-5 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-semibold mb-1">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>Problems Solved</span>
          </div>
          <div className="text-2xl font-black text-emerald-400">{user.problemsSolved.length}</div>
          <span className="text-[10px] text-slate-400">DSA Practice</span>
        </div>
      </div>

      {/* TOPIC MASTERY BARS & UNLOCKED BADGES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Topic Breakdown */}
        <div className="arena-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Algorithmic Topic Mastery</span>
            </h3>
            <span className="text-xs text-slate-400">Practice progress</span>
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
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-300">{topic.label}</span>
                    <span className="text-violet-400 font-mono">{pct}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-violet-600 to-cyan-500 rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Verified Badges */}
        <div className="arena-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span>Earned Achievements & Badges</span>
            </h3>
            <span className="text-xs text-slate-400">
              {user.achievements.length} Unlocked
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {ACHIEVEMENTS.slice(0, 4).map((ach) => {
              const isUnlocked = user.achievements.includes(ach.id);
              return (
                <div 
                  key={ach.id} 
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    isUnlocked 
                      ? 'bg-slate-900/90 border-violet-500/40 text-white' 
                      : 'bg-slate-950/40 border-slate-800/80 text-slate-600 opacity-50'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center mx-auto mb-1.5">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div className="font-bold text-xs truncate">{ach.title}</div>
                  <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{ach.description}</p>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* RECENT BATTLES LIST */}
      <div className="arena-card p-6 space-y-4">
        <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
          <Swords className="w-4 h-4 text-violet-400" />
          <span>Verified Competitive Battle History</span>
        </h3>

        <div className="space-y-2">
          {user.recentBattles.map((b) => (
            <div key={b.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                  b.result === 'won' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {b.result.toUpperCase()}
                </span>
                <div>
                  <span className="font-bold text-slate-200">{b.problemTitle} </span>
                  <span className="text-slate-500">vs @{b.opponentName}</span>
                </div>
              </div>

              <div className="text-right">
                <span className={`font-black ${b.ratingChange > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {b.ratingChange > 0 ? `+${b.ratingChange}` : b.ratingChange} Elo
                </span>
                <span className="text-[10px] text-slate-500 block">{b.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

