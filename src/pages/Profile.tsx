import React, { useState, useMemo } from 'react';
import { 
  Swords, 
  Flame, 
  Trophy, 
  CheckCircle2, 
  Share2, 
  Edit3, 
  Layers, 
  BookOpen,
  Code2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ACHIEVEMENTS } from '../data/mockData';
import { getUserCards, DSA_MILESTONE_THRESHOLDS, BASE_COLLECTIBLE_CARDS } from '../data/collectibleCards';
import { CollectibleCardItem } from '../components/cards/CollectibleCardItem';
import { CardDetailModal } from '../components/cards/CardDetailModal';
import { CardShareStudioModal } from '../components/cards/CardShareStudioModal';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { CollectibleCard } from '../types/cards';
import { sound } from '../utils/sound';
import { LearningActivityHeatmap } from '../components/learn/LearningActivityHeatmap';
import { getLearningMilestones } from '../services/learningActivityService';
import { LearningMilestoneModal } from '../components/learn/LearningMilestoneModal';
import { LearningMilestone } from '../types/learn';

export const Profile: React.FC = () => {
  const { user, updateUserProfile, openShareModal, setActiveTab, settings, addPost, unlockCard } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio);
  const [githubUrl, setGithubUrl] = useState(user.githubUrl || 'https://github.com');
  const [inspectingCard, setInspectingCard] = useState<CollectibleCard | null>(null);
  const [sharingCard, setSharingCard] = useState<CollectibleCard | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<LearningMilestone | null>(null);

  const learningMilestones = useMemo(() => {
    return getLearningMilestones(user.problemsSolved, user.topicProgress, user.streak);
  }, [user.problemsSolved, user.topicProgress, user.streak]);

  const userCards = useMemo(() => {
    return getUserCards(user.unlockedCards || ['speed_thinker', 'daily_challenger', 'first_blood', 'perfect_submission']);
  }, [user.unlockedCards]);

  // DSA Milestone Cards (50, 100, 200, 500, 1000)
  const dsaMilestoneCards = useMemo(() => {
    const solvedCount = user.problemsSolved.length;
    const unlockedIds = user.unlockedCards || [];

    return DSA_MILESTONE_THRESHOLDS.map(item => {
      const cardDef = BASE_COLLECTIBLE_CARDS.find(c => c.id === item.cardId);
      const isUnlocked = unlockedIds.includes(item.cardId) || solvedCount >= item.threshold;
      const progress = Math.min(100, Math.round((solvedCount / item.threshold) * 100));
      const remaining = Math.max(0, item.threshold - solvedCount);

      const card: CollectibleCard = cardDef ? {
        ...cardDef,
        unlocked: isUnlocked,
        unlockedAt: isUnlocked ? 'Verified' : undefined
      } : {
        id: item.cardId,
        cardId: `DA-DSA-${item.threshold}`,
        title: item.label,
        category: 'coding',
        rarity: item.threshold >= 500 ? 'legendary' : item.threshold >= 100 ? 'epic' : 'rare',
        description: `Solved ${item.threshold} problems in DEVARENA.`,
        unlockCriteria: `Solve ${item.threshold} problems in DEVARENA.`,
        artworkType: 'binary-tree',
        unlocked: isUnlocked
      };

      return {
        ...item,
        card,
        isUnlocked,
        progress,
        remaining
      };
    });
  }, [user.problemsSolved.length, user.unlockedCards]);

  const pinnedCards = useMemo(() => {
    const pinnedIds = user.pinnedCardIds || ['first_blood', 'perfect_submission'];
    const pinned = userCards.filter(c => pinnedIds.includes(c.id));
    if (pinned.length === 0) return userCards.filter(c => c.unlocked).slice(0, 3);
    return pinned;
  }, [userCards, user.pinnedCardIds]);

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

      {/* ANNUAL LEARNING ACTIVITY & CONTRIBUTION GRAPH */}
      <div className="space-y-4">
        {settings?.profileVisibility === 'private' && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Private Profile Active: Your learning activity graph is hidden from public community views.</span>
            </span>
            <button
              onClick={() => setActiveTab('settings')}
              className="text-[11px] underline hover:text-white font-medium"
            >
              Privacy Settings
            </button>
          </div>
        )}

        <LearningActivityHeatmap
          title="Annual Learning Activity Graph"
          subtitle="Unified daily contributions across algorithms, code arena executions, and DSA roadmap lessons."
        />

        {/* Learning Milestones & Verified Progress */}
        <div className="arena-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-xs text-arena-textPrimary flex items-center gap-2">
                <Trophy className="w-4 h-4 text-arena-amber" />
                <span>Verified Learning Milestones</span>
              </h3>
              <p className="text-[11px] text-arena-textSubtle mt-0.5">
                Earned strictly through genuine algorithm practice, streak consistency, and stage mastery.
              </p>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('learn');
              }}
              className="btn-secondary py-1 px-3 text-xs gap-1 font-semibold"
            >
              <span>Explore Learn Hub</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {learningMilestones.map((milestone) => (
              <div
                key={milestone.id}
                onClick={() => {
                  sound.playClick();
                  setSelectedMilestone(milestone);
                }}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                  milestone.achieved
                    ? 'bg-arena-elevated border-arena-border hover:border-arena-amber/50 text-arena-textPrimary shadow-sm'
                    : 'bg-arena-surface/60 border-arena-border text-arena-textSubtle opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                      milestone.achieved
                        ? 'bg-arena-amber/15 text-arena-amber border border-arena-amber/30'
                        : 'bg-arena-surface text-arena-textSubtle border border-arena-border'
                    }`}>
                      {milestone.achieved ? <CheckCircle2 className="w-4 h-4 text-arena-amber" /> : <Flame className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-arena-textPrimary group-hover:text-arena-amber transition-colors">
                        {milestone.title}
                      </h4>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-arena-surface text-arena-textSubtle border border-arena-border">
                        {milestone.badge}
                      </span>
                    </div>
                  </div>

                  {milestone.achieved && (
                    <span className="text-[10px] text-arena-teal font-mono shrink-0">
                      Share ↗
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-arena-textSecondary line-clamp-2 mt-2 leading-relaxed">
                  {milestone.description}
                </p>

                <div className="mt-2.5 pt-2 border-t border-arena-border/50 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-arena-textSubtle">
                    Progress: {milestone.currentCount}/{milestone.requiredCount}
                  </span>
                  <span className={milestone.achieved ? 'text-arena-success font-semibold' : 'text-arena-textSubtle'}>
                    {milestone.achieved ? 'Unlocked' : 'In Progress'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* LOOP 1 — PROBLEM SOLVING MILESTONE CARDS (50, 100, 200, 500, 1000) */}
      <div className="arena-card p-6 space-y-5 border-arena-amber/30 bg-gradient-to-b from-[#182124] to-[#141B1D]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-arena-border">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-arena-amber/15 border border-arena-amber/40 text-arena-amber text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3 h-3 text-arena-amber" />
                <span>Loop 1 • Growth Achievement Sharing</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#101314] text-arena-teal border border-arena-border">
                {user.problemsSolved.length} Problems Solved
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-arena-textPrimary mt-1.5 flex items-center gap-2">
              <span>Problem Solving Milestone Cards</span>
            </h3>
            <p className="text-xs text-arena-textSecondary mt-0.5 max-w-2xl leading-relaxed">
              Solve 50, 100, 200, 500, or 1,000 problems to unlock verified collectible cards. Every achievement pops up as an exclusive badge that you can share to LinkedIn, WhatsApp, or Discord to invite others to challenge your score.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('arena');
              }}
              className="btn-primary py-2 px-3.5 text-xs font-bold gap-1.5 flex items-center shadow-md"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Solve in Arena</span>
            </button>
          </div>
        </div>

        {/* 5 Milestone Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {dsaMilestoneCards.map((item) => {
            const isUnlocked = item.isUnlocked;
            const threshold = item.threshold;
            const card = item.card;

            return (
              <div
                key={item.cardId}
                className={`rounded-2xl border p-4 flex flex-col justify-between transition-all relative overflow-hidden group ${
                  isUnlocked
                    ? 'bg-[#182326] border-arena-amber/50 shadow-[0_0_20px_rgba(255,173,66,0.12)]'
                    : 'bg-[#12181A]/80 border-arena-border text-arena-textSubtle'
                }`}
              >
                {/* Top Badge & Tier */}
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2.5">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                      isUnlocked
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                        : 'bg-arena-elevated border-arena-border text-arena-textSubtle'
                    }`}>
                      {item.badge}
                    </span>

                    <span className={`text-[9px] font-mono uppercase font-bold px-1.5 py-0.2 rounded ${
                      card.rarity === 'legendary'
                        ? 'bg-arena-amber/20 text-arena-amber'
                        : card.rarity === 'epic'
                        ? 'bg-arena-cyan/20 text-arena-cyan'
                        : 'bg-arena-lime/20 text-arena-lime'
                    }`}>
                      {card.rarity}
                    </span>
                  </div>

                  {/* Artwork Preview */}
                  <div 
                    onClick={() => {
                      if (isUnlocked) {
                        sound.playClick();
                        unlockCard(item.cardId);
                      }
                    }}
                    className={`cursor-pointer transition-transform group-hover:scale-[1.02] ${!isUnlocked ? 'opacity-50 grayscale' : ''}`}
                  >
                    <div className="w-full aspect-[4/3] rounded-xl overflow-hidden mb-2.5">
                      <CollectibleCardItem
                        card={card}
                        compact
                        onInspect={() => {
                          sound.playClick();
                          unlockCard(item.cardId);
                        }}
                      />
                    </div>
                  </div>

                  <h4 className="font-bold text-xs text-white line-clamp-1 group-hover:text-arena-amber transition-colors">
                    {card.title}
                  </h4>
                  <p className="text-[11px] text-[#8C9C9E] line-clamp-2 mt-1 leading-relaxed">
                    {card.description}
                  </p>
                </div>

                {/* Progress & Bottom Actions */}
                <div className="mt-4 pt-3 border-t border-arena-border/60 space-y-2.5">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-[#8C9C9E]">Progress</span>
                    <span className={isUnlocked ? 'text-emerald-400 font-bold' : 'text-arena-amber font-semibold'}>
                      {user.problemsSolved.length}/{threshold} ({item.progress}%)
                    </span>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-[#101517] overflow-hidden border border-arena-border/50">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isUnlocked ? 'bg-emerald-400' : 'bg-arena-amber'
                      }`}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>

                  {isUnlocked ? (
                    <div className="pt-1 flex gap-2">
                      <button
                        onClick={() => {
                          sound.playVictory();
                          unlockCard(item.cardId);
                        }}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-arena-amber text-slate-950 font-bold text-[11px] flex items-center justify-center gap-1 shadow-sm hover:bg-amber-400 transition-colors"
                        title="Pop up badge to share to LinkedIn, WhatsApp or Discord"
                      >
                        <Share2 className="w-3 h-3" />
                        <span>Share Badge</span>
                      </button>
                    </div>
                  ) : (
                    <div className="pt-1 space-y-1.5">
                      <div className="text-[10px] font-mono text-[#8C9C9E] text-center">
                        {item.remaining} more to unlock
                      </div>
                      <button
                        onClick={() => {
                          sound.playClick();
                          unlockCard(item.cardId);
                        }}
                        className="w-full py-1 px-2 rounded-lg bg-arena-elevated hover:bg-[#253235] border border-arena-border text-arena-amber text-[10px] font-mono font-semibold flex items-center justify-center gap-1 transition-colors"
                        title="Simulate earning this milestone card & test share pop-up"
                      >
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>Simulate Pop-up</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SHOWCASED ACHIEVEMENT CARDS */}
      <div className="arena-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-arena-amber" />
            <h3 className="font-bold text-sm text-arena-textPrimary">
              Showcase Collectibles
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#182326] border border-[#2B3B3F] text-arena-teal font-semibold">
              Pinned on Profile
            </span>
          </div>

          <button
            onClick={() => setActiveTab('cards')}
            className="text-xs font-semibold text-arena-amber hover:underline flex items-center gap-1 group"
          >
            <span>View All Cards ({userCards.filter(c => c.unlocked).length}/{userCards.length})</span>
            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {pinnedCards.map((card) => (
            <CollectibleCardItem
              key={card.id}
              card={card}
              compact
              isPinned
              onInspect={(c) => {
                sound.playClick();
                setInspectingCard(c);
              }}
              onShare={(c) => {
                sound.playClick();
                setSharingCard(c);
              }}
            />
          ))}
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

      {/* 3D Card Detail & Flip Modal */}
      <ErrorBoundary fallbackTitle="Card Detail Error">
        <CardDetailModal
          card={inspectingCard}
          onClose={() => setInspectingCard(null)}
          isPinned={inspectingCard ? (user.pinnedCardIds || []).includes(inspectingCard.id) : false}
          onTogglePin={(c) => {
            const currentPinned = [...(user.pinnedCardIds || ['first_blood', 'perfect_submission'])];
            const isP = currentPinned.includes(c.id);
            const nextP = isP ? currentPinned.filter(id => id !== c.id) : [...currentPinned.slice(-2), c.id];
            updateUserProfile({ pinnedCardIds: nextP });
          }}
          onShare={(c) => {
            setInspectingCard(null);
            setSharingCard(c);
          }}
        />
      </ErrorBoundary>

      {/* Victory Studio Share Modal */}
      <ErrorBoundary fallbackTitle="Share Studio Error">
        <CardShareStudioModal
          card={sharingCard}
          user={user}
          onClose={() => setSharingCard(null)}
        />
      </ErrorBoundary>

      {/* Learning Milestone Modal */}
      <LearningMilestoneModal
        milestone={selectedMilestone}
        onClose={() => setSelectedMilestone(null)}
        onPostToCommunity={(m) => {
          addPost({
            author: {
              id: user.id,
              username: user.username,
              displayName: user.displayName,
              avatar: user.avatar,
              rating: user.rating,
              headline: user.bio
            },
            type: 'achievement_unlocked',
            title: `Unlocked Milestone: ${m.title}`,
            content: `Earned the verified ${m.badge} credential on DEVARENA: ${m.description}`,
            tags: ['DSA', 'Milestone', 'Algorithms']
          });
        }}
      />

    </div>
  );
};
