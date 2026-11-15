import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Flame, 
  Calendar, 
  Trophy, 
  Users, 
  Sparkles, 
  Code2, 
  Layers, 
  CheckCircle2, 
  Share2, 
  ArrowRight, 
  GitBranch, 
  Zap, 
  MessageSquare,
  Award,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { COMPREHENSIVE_DSA_ROADMAP } from '../data/comprehensiveDsaRoadmap';
import { DSARoadmapTopic, LearningMilestone } from '../types/learn';
import { InteractiveRoadmapTree } from '../components/learn/InteractiveRoadmapTree';
import { TopicLearningStudio } from '../components/learn/TopicLearningStudio';
import { SocialLearningFeed } from '../components/learn/SocialLearningFeed';
import { LearningTogetherSection } from '../components/learn/LearningTogetherSection';
import { LearningMilestoneModal } from '../components/learn/LearningMilestoneModal';
import { 
  getLearningMilestones, 
  recordLearningActivity 
} from '../services/learningActivityService';
import { sound } from '../utils/sound';

type LearnTab = 'roadmap' | 'feed' | 'together' | 'milestones';

export const Learn: React.FC = () => {
  const { 
    user, 
    setActiveTab, 
    setSelectedArenaProblemId, 
    addPost,
    openShareModal 
  } = useApp();

  const [activeLearnTab, setActiveLearnTab] = useState<LearnTab>('roadmap');
  const [activeTopic, setActiveTopic] = useState<DSARoadmapTopic>(COMPREHENSIVE_DSA_ROADMAP[0]);
  const [selectedMilestone, setSelectedMilestone] = useState<LearningMilestone | null>(null);

  // Overall metrics calculation
  const totalTopics = COMPREHENSIVE_DSA_ROADMAP.length;
  const totalSolved = user.problemsSolved.length;
  
  // Progress across roadmap
  const completedTopicsCount = useMemo(() => {
    return Object.values(user.topicProgress).filter(p => p >= 100).length;
  }, [user.topicProgress]);

  const overallMastery = useMemo(() => {
    // Weighted mastery based on problems solved and topic progress
    const solvedPoints = Math.min(60, (totalSolved / 25) * 60);
    const topicPoints = Math.min(40, (completedTopicsCount / 10) * 40);
    return Math.min(100, Math.round(solvedPoints + topicPoints));
  }, [totalSolved, completedTopicsCount]);

  // Milestones
  const milestones = useMemo(() => {
    return getLearningMilestones(user.problemsSolved, user.topicProgress, user.streak);
  }, [user.problemsSolved, user.topicProgress, user.streak]);

  const unlockedMilestonesCount = useMemo(() => {
    return milestones.filter(m => m.achieved).length;
  }, [milestones]);

  // Handlers
  const handleOpenProblemInArena = (problemId: string) => {
    sound.playClick();
    setSelectedArenaProblemId(problemId);
    setActiveTab('arena');
  };

  const handleSelectTopicById = (topicId: string) => {
    sound.playClick();
    const found = COMPREHENSIVE_DSA_ROADMAP.find(t => t.id === topicId);
    if (found) {
      setActiveTopic(found);
      setActiveLearnTab('roadmap');
      window.scrollTo({ top: 380, behavior: 'smooth' });
    }
  };

  const handleShareTopic = (topic: DSARoadmapTopic) => {
    sound.playClick();
    openShareModal({
      title: 'DSA Topic Mastery',
      gameOrBattle: topic.title,
      scoreOrResult: `${user.topicProgress[topic.id] || 65}% Mastery`,
      subtitle: `${topic.problemIds.length} Practice Problems • ${topic.timeComplexity} Time Complexity`,
      customStats: [
        { label: 'Category', value: topic.stage.toUpperCase() },
        { label: 'Complexity', value: topic.timeComplexity }
      ]
    });
  };

  const handlePostMilestoneToCommunity = (milestone: LearningMilestone) => {
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
      title: `🏆 Achieved Milestone: ${milestone.title}`,
      content: `Just completed verified learning milestone on DEVARENA: ${milestone.description}. Continuing the daily streak on the DSA roadmap!`,
      tags: ['DSA', 'Algorithms', 'Milestone', milestone.badge]
    });
  };

  const handlePostCommunityUpdateFromStudio = (topic: DSARoadmapTopic) => {
    addPost({
      author: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        rating: user.rating,
        headline: user.bio
      },
      type: 'discussion',
      title: `Studying ${topic.title} Roadmap`,
      content: `Working through ${topic.title} algorithms and step-by-step visualizers on DEVARENA. Key invariant to remember: ${topic.commonMistakes[0] || 'Understand time and space bounds'}.`,
      tags: ['DSA', topic.id, 'StudyWithMe']
    });
  };

  return (
    <div className="page-container py-8 space-y-6 animate-in fade-in">
      
      {/* HERO BANNER & REAL-TIME STATS GAUGE */}
      <div className="rounded-2xl bg-arena-surface border border-arena-border p-6 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-card">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-arena-amber/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-arena-teal/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="space-y-3 max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-arena-elevated border border-arena-border text-arena-teal text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5 text-arena-teal" />
            <span className="font-mono tracking-wide">INTERACTIVE SOCIAL DSA ACADEMY</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-arena-textPrimary tracking-tight">
            Learn Algorithms <span className="text-arena-amber">& Build in Public</span>
          </h1>

          <p className="text-xs sm:text-sm text-arena-textSecondary leading-relaxed">
            Combine LeetCode-grade algorithmic problem solving, GitHub-style annual contribution streaks, 
            interactive algorithm visualizers, and collaborative peer learning.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs">
            <div className="flex items-center gap-1.5 text-arena-warning font-mono font-semibold">
              <Flame className="w-4 h-4 fill-arena-warning" />
              <span>{user.streak} Day Active Streak</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-arena-border" />
            <div className="flex items-center gap-1.5 text-arena-textSecondary font-mono">
              <Layers className="w-4 h-4 text-arena-teal" />
              <span>{completedTopicsCount}/{totalTopics} Topics Completed</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-arena-border" />
            <div className="flex items-center gap-1.5 text-arena-textSecondary font-mono">
              <Code2 className="w-4 h-4 text-arena-amber" />
              <span>{totalSolved} Solved in Arena</span>
            </div>
          </div>
        </div>

        {/* Overall Mastery Gauge Card */}
        <div className="w-full lg:w-80 p-5 rounded-2xl bg-arena-elevated border border-arena-border space-y-3.5 shrink-0 relative z-10 shadow-sm">
          <div className="flex items-center justify-between text-xs">
            <span className="text-arena-textSubtle font-medium uppercase tracking-wider text-[10px]">
              Roadmap Mastery
            </span>
            <span className="text-arena-amber font-mono font-bold text-sm">
              {overallMastery}%
            </span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-arena-surface overflow-hidden p-0.5 border border-arena-border">
            <div 
              className="h-full bg-gradient-to-r from-arena-amber to-arena-teal rounded-full transition-all duration-500"
              style={{ width: `${overallMastery}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 text-center">
            <div className="p-2 rounded-lg bg-arena-surface border border-arena-border/50">
              <span className="text-[10px] text-arena-textSubtle block font-mono">TOPICS DONE</span>
              <span className="text-xs font-bold text-arena-textPrimary font-mono">
                {completedTopicsCount} / {totalTopics}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-arena-surface border border-arena-border/50">
              <span className="text-[10px] text-arena-textSubtle block font-mono">MILESTONES</span>
              <span className="text-xs font-bold text-arena-teal font-mono">
                {unlockedMilestonesCount} / {milestones.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* TOP NAVIGATION TABS */}
      <div className="flex items-center justify-between border-b border-arena-border pb-3 overflow-x-auto gap-2 no-scrollbar">
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              sound.playClick();
              setActiveLearnTab('roadmap');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeLearnTab === 'roadmap'
                ? 'bg-arena-amber text-[#101314] font-bold shadow-sm'
                : 'bg-arena-surface hover:bg-arena-elevated border border-arena-border text-arena-textSecondary hover:text-arena-textPrimary'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>DSA Roadmap & Studio</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              activeLearnTab === 'roadmap' ? 'bg-[#101314]/20 text-[#101314]' : 'bg-arena-elevated text-arena-textSubtle'
            }`}>
              {totalTopics}
            </span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveLearnTab('feed');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeLearnTab === 'feed'
                ? 'bg-arena-amber text-[#101314] font-bold shadow-sm'
                : 'bg-arena-surface hover:bg-arena-elevated border border-arena-border text-arena-textSecondary hover:text-arena-textPrimary'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Social Feed</span>
            <span className={`w-2 h-2 rounded-full bg-emerald-400 animate-pulse`} />
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveLearnTab('together');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeLearnTab === 'together'
                ? 'bg-arena-amber text-[#101314] font-bold shadow-sm'
                : 'bg-arena-surface hover:bg-arena-elevated border border-arena-border text-arena-textSecondary hover:text-arena-textPrimary'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Learning Together</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveLearnTab('milestones');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeLearnTab === 'milestones'
                ? 'bg-arena-amber text-[#101314] font-bold shadow-sm'
                : 'bg-arena-surface hover:bg-arena-elevated border border-arena-border text-arena-textSecondary hover:text-arena-textPrimary'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Milestones & Badges</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              activeLearnTab === 'milestones' ? 'bg-[#101314]/20 text-[#101314]' : 'bg-arena-elevated text-arena-textSubtle'
            }`}>
              {unlockedMilestonesCount}/{milestones.length}
            </span>
          </button>
        </div>

        {/* Right Quick Jump button */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('arena');
            }}
            className="btn-secondary py-1.5 px-3 text-xs gap-1.5 font-semibold text-arena-textSecondary hover:text-arena-textPrimary shrink-0"
          >
            <Code2 className="w-3.5 h-3.5 text-arena-teal" />
            <span>Open Code Arena</span>
          </button>
        </div>
      </div>

      {/* TAB CONTENT VIEWS */}

      {/* 1. ROADMAP & STUDIO VIEW */}
      {activeLearnTab === 'roadmap' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Interactive Roadmap Tree (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <InteractiveRoadmapTree
              activeTopicId={activeTopic.id}
              onSelectTopic={(t) => {
                setActiveTopic(t);
              }}
              userSolvedProblems={user.problemsSolved}
              topicProgressMap={user.topicProgress}
            />

            {/* Habit Streak Card in Roadmap Sidebar */}
            <div className="arena-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-arena-textSubtle uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-arena-warning" />
                  <span>Habit Continuity</span>
                </span>
                <button
                  onClick={() => {
                    sound.playClick();
                    setActiveTab('profile');
                  }}
                  className="text-[11px] text-arena-amber hover:underline font-mono"
                  title="View your annual contribution graph on profile"
                >
                  Profile Graph →
                </button>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-arena-textSecondary">Active streak</span>
                <span className="text-arena-warning font-mono font-bold flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-arena-warning" />
                  <span>{user.streak} Days</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Topic Learning Studio (7 Cols) */}
          <div className="lg:col-span-7">
            <TopicLearningStudio
              topic={activeTopic}
              userSolvedProblems={user.problemsSolved}
              onOpenProblemInArena={handleOpenProblemInArena}
              onShareTopic={handleShareTopic}
              onPostCommunityUpdate={handlePostCommunityUpdateFromStudio}
            />
          </div>

        </div>
      )}

      {/* 2. SOCIAL LEARNING FEED VIEW */}
      {activeLearnTab === 'feed' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <SocialLearningFeed
            onOpenTopic={handleSelectTopicById}
            onOpenProblem={handleOpenProblemInArena}
            onViewProfile={(username) => {
              sound.playClick();
              setActiveTab('profile');
            }}
            onNewCommunityPost={(text) => {
              addPost({
                author: {
                  id: user.id,
                  username: user.username,
                  displayName: user.displayName,
                  avatar: user.avatar,
                  rating: user.rating,
                  headline: user.bio
                },
                type: 'discussion',
                title: 'DSA Study Log',
                content: text,
                tags: ['LearnInPublic', 'DSA', 'Algorithms']
              });
            }}
          />
        </div>
      )}

      {/* 4. LEARNING TOGETHER VIEW */}
      {activeLearnTab === 'together' && (
        <div className="space-y-6">
          <LearningTogetherSection
            currentTopicId={activeTopic.id}
            userSolvedCount={totalSolved}
            onOpenTopic={handleSelectTopicById}
          />
        </div>
      )}

      {/* 5. MILESTONES & ACHIEVEMENTS VIEW */}
      {activeLearnTab === 'milestones' && (
        <div className="space-y-6">
          <div className="arena-card p-6 space-y-2">
            <div className="flex items-center gap-2 text-arena-amber text-xs font-semibold uppercase tracking-wider">
              <Trophy className="w-4 h-4" />
              <span>Verifiable Progression Milestones</span>
            </div>
            <h2 className="text-xl font-bold text-arena-textPrimary">
              Learning Milestones & Shareable Badges
            </h2>
            <p className="text-xs text-arena-textSecondary max-w-2xl leading-relaxed">
              Every milestone is unlocked strictly through genuine problem solving, lesson completion, and unbroken streak habits.
              Click any achieved badge to preview and export your branded achievement card to LinkedIn, WhatsApp, or the Community.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {milestones.map((milestone) => (
              <div
                key={milestone.id}
                onClick={() => {
                  sound.playClick();
                  setSelectedMilestone(milestone);
                }}
                className={`p-5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                  milestone.achieved
                    ? 'bg-arena-surface border-arena-border hover:border-arena-amber/50 text-arena-textPrimary shadow-card'
                    : 'bg-arena-surface/50 border-arena-border text-arena-textSubtle opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                    milestone.achieved
                      ? 'bg-arena-amber/15 text-arena-amber border border-arena-amber/30'
                      : 'bg-arena-elevated text-arena-textSubtle border border-arena-border'
                  }`}>
                    {milestone.achieved ? <Award className="w-6 h-6 text-arena-amber" /> : <Flame className="w-6 h-6" />}
                  </div>

                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                    milestone.achieved
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                      : 'bg-arena-elevated border-arena-border text-arena-textSubtle'
                  }`}>
                    {milestone.achieved ? 'UNLOCKED' : `${milestone.currentCount}/${milestone.requiredCount}`}
                  </span>
                </div>

                <div className="mt-3.5 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-arena-teal font-semibold">
                      {milestone.badge}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-arena-textPrimary group-hover:text-arena-amber transition-colors">
                    {milestone.title}
                  </h3>
                  <p className="text-xs text-arena-textSecondary leading-relaxed pt-1">
                    {milestone.description}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="mt-4 pt-3 border-t border-arena-border/50 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-arena-textSubtle">Requirement</span>
                    <span className={milestone.achieved ? 'text-arena-amber font-semibold' : 'text-arena-textSubtle'}>
                      {milestone.currentCount} / {milestone.requiredCount} {milestone.category}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-arena-elevated overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        milestone.achieved ? 'bg-arena-amber' : 'bg-arena-textSubtle/40'
                      }`}
                      style={{ width: `${Math.min(100, (milestone.currentCount / milestone.requiredCount) * 100)}%` }}
                    />
                  </div>
                </div>

                {milestone.achieved && (
                  <div className="mt-3 flex items-center justify-between text-xs text-arena-teal font-mono">
                    <span>Export Card</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SHAREABLE MILESTONE MODAL */}
      <LearningMilestoneModal
        milestone={selectedMilestone}
        onClose={() => setSelectedMilestone(null)}
        onPostToCommunity={handlePostMilestoneToCommunity}
      />

    </div>
  );
};
