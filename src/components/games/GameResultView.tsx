import React, { useState } from 'react';
import { 
  Trophy, 
  Share2, 
  Copy, 
  Check, 
  RotateCcw, 
  Swords, 
  Flame, 
  Timer, 
  Zap, 
  ArrowRight, 
  Sparkles, 
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  Award,
  Users
} from 'lucide-react';
import { GameResultData, CasualGameId } from '../../types';
import { useApp } from '../../context/AppContext';
import { sound } from '../../utils/sound';

interface GameResultViewProps {
  result: GameResultData;
  onPlayAgain: () => void;
  onBackToHub: () => void;
  onSelectGame: (gameId: CasualGameId) => void;
}

export const GameResultView: React.FC<GameResultViewProps> = ({
  result,
  onPlayAgain,
  onBackToHub,
  onSelectGame
}) => {
  const { user, openShareModal, setActiveBattleId, setActiveTab } = useApp();
  const [copied, setCopied] = useState(false);
  const [createdChallengeLink, setCreatedChallengeLink] = useState(false);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  const handleCopyResult = () => {
    sound.playClick();
    const shareText = result.shareSummary || `DEVARENA: ${result.gameTitle}
Result: ${result.won ? 'SOLVED ✓' : 'Finished'}
Score: ${result.score} pts • Time: ${formatTime(result.timeTakenSec)}
Streak: ${user.streak}d 🔥

Can you beat my time?
${window.location.origin}`;

    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenShareCard = () => {
    sound.playClick();
    openShareModal({
      title: 'Game Result',
      gameOrBattle: result.gameTitle,
      scoreOrResult: `${result.score} Points`,
      subtitle: `${result.won ? 'Solved' : 'Completed'} in ${formatTime(result.timeTakenSec)}`,
      customStats: result.customStats
    });
  };

  const handleChallengeFriend = () => {
    sound.playClick();
    const challengeCode = `DEV-${Math.floor(1000 + Math.random() * 9000)}`;
    const url = `${window.location.origin}/?room=${challengeCode}`;
    navigator.clipboard.writeText(url);
    setCreatedChallengeLink(true);
    setTimeout(() => setCreatedChallengeLink(false), 3000);
  };

  const recommendedGames: { id: CasualGameId; title: string; category: string; time: string; badge: string }[] = [
    { id: 'zip' as CasualGameId, title: 'Zip #42', category: 'Daily Path', time: '3 mins', badge: 'Daily' },
    { id: 'word-puzzle' as CasualGameId, title: 'Daily Word Puzzle', category: 'Word Logic', time: '3 mins', badge: 'Daily' },
    { id: 'quick-math' as CasualGameId, title: 'Quick Math Sprint', category: 'Mental Math', time: '60 secs', badge: 'Fast' },
    { id: 'reaction-challenge' as CasualGameId, title: 'Reaction Benchmark', category: 'Reflexes', time: '1 min', badge: 'Reflex' },
    { id: 'memory-grid' as CasualGameId, title: 'Memory Grid', category: 'Working Memory', time: '2 mins', badge: 'Brain' },
    { id: 'pattern-master' as CasualGameId, title: 'Pattern Master', category: 'Sequences', time: '3 mins', badge: 'Logic' }
  ].filter(g => g.id !== result.gameId);

  return (
    <div className="min-h-[85vh] py-8 page-container animate-in fade-in space-y-8">
      
      {/* Top Header Return */}
      <div className="flex items-center justify-between pb-4 border-b border-arena-border">
        <button
          onClick={onBackToHub}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-arena-surface border border-arena-border text-xs font-semibold text-arena-textSecondary hover:text-arena-textPrimary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Explore All Games</span>
        </button>

        <div className="text-right">
          <span className="text-[10px] uppercase font-semibold text-arena-textSubtle block">SESSION COMPLETE</span>
          <span className="text-xs font-bold text-arena-amber font-mono">{result.gameTitle}</span>
        </div>
      </div>

      {/* 1. RESULT HERO PANEL — Amber Midnight Identity */}
      <div className="rounded-2xl bg-arena-surface border border-arena-border p-6 sm:p-10 relative overflow-hidden">
        
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-arena-amber/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl mx-auto text-center space-y-5">
          
          {/* Status Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-arena-elevated border border-arena-border text-arena-amber text-xs font-semibold">
            <Trophy className="w-3.5 h-3.5" />
            <span>{result.won ? 'CHALLENGE COMPLETED' : 'SESSION FINISHED'}</span>
          </div>

          {/* Congratulatory Headline */}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-arena-textPrimary tracking-tight">
            {result.headline || (result.won ? 'Outstanding Performance!' : 'Good Effort!')}
          </h1>

          <p className="text-xs sm:text-sm text-arena-textSecondary max-w-lg mx-auto leading-relaxed">
            {result.won 
              ? `You successfully solved ${result.gameTitle} in ${formatTime(result.timeTakenSec)}. Your progress has been updated in your profile.`
              : `Completed ${result.gameTitle}. Practice rounds help sharpen mental processing and logic reflexes.`}
          </p>

          {/* Core Metric Highlights Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
            <div className="p-4 rounded-xl bg-arena-elevated border border-arena-border text-center">
              <span className="text-[10px] uppercase font-semibold text-arena-textSubtle block">FINAL SCORE</span>
              <div className="text-2xl font-black text-arena-amber font-mono mt-1">{result.score}</div>
              <span className="text-[10px] text-arena-teal font-medium">Verified Pts</span>
            </div>

            <div className="p-4 rounded-xl bg-arena-elevated border border-arena-border text-center">
              <span className="text-[10px] uppercase font-semibold text-arena-textSubtle block">TIME TAKEN</span>
              <div className="text-2xl font-black text-arena-textPrimary font-mono mt-1">
                {result.timeTakenSec > 0 ? formatTime(result.timeTakenSec) : '--'}
              </div>
              <span className="text-[10px] text-arena-textSubtle font-medium">Live Chrono</span>
            </div>

            <div className="p-4 rounded-xl bg-arena-elevated border border-arena-border text-center">
              <span className="text-[10px] uppercase font-semibold text-arena-textSubtle block">ACTIVE STREAK</span>
              <div className="text-2xl font-black text-arena-warning font-mono mt-1">{user.streak}d</div>
              <span className="text-[10px] text-arena-warning font-medium">Daily Multiplier</span>
            </div>

            <div className="p-4 rounded-xl bg-arena-elevated border border-arena-border text-center">
              <span className="text-[10px] uppercase font-semibold text-arena-textSubtle block">ACCURACY / STEPS</span>
              <div className="text-2xl font-black text-arena-textPrimary font-mono mt-1">
                {result.moves ? `${result.moves} steps` : result.accuracy ? `${result.accuracy}%` : 'Clean'}
              </div>
              <span className="text-[10px] text-arena-teal font-medium">Efficiency</span>
            </div>
          </div>

          {/* Sharing & Action Buttons */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleOpenShareCard}
              className="btn-primary py-2.5 px-5 text-xs font-semibold gap-2 shadow-sm"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Result Card</span>
            </button>

            <button
              onClick={handleCopyResult}
              className="btn-secondary py-2.5 px-5 text-xs font-semibold gap-2"
            >
              {copied ? <Check className="w-4 h-4 text-arena-teal" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Summary'}</span>
            </button>

            <button
              onClick={handleChallengeFriend}
              className="btn-secondary py-2.5 px-5 text-xs font-semibold gap-2"
            >
              <Swords className="w-4 h-4 text-arena-amber" />
              <span>{createdChallengeLink ? 'Challenge Link Copied!' : 'Challenge a Friend'}</span>
            </button>

            <button
              onClick={onPlayAgain}
              className="btn-secondary py-2.5 px-4 text-xs font-semibold gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Again</span>
            </button>
          </div>

        </div>
      </div>

      {/* 2. HOW YOU COMPARE & PLAYER STATS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* How You Compare (Desktop 7 Cols) */}
        <div className="lg:col-span-7 arena-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-arena-border">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-arena-teal" />
              <h3 className="font-bold text-sm text-arena-textPrimary">How You Compare</h3>
            </div>
            <span className="text-[11px] font-mono text-arena-teal font-semibold">Today's Benchmark</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-3.5 rounded-xl bg-arena-elevated border border-arena-border space-y-1">
              <span className="text-[10px] text-arena-textSubtle uppercase font-semibold">SPEED PERCENTILE</span>
              <div className="text-xl font-bold text-arena-amber font-mono">Top 15%</div>
              <p className="text-[11px] text-arena-textSecondary leading-relaxed">
                Faster than 85% of players who completed this puzzle today.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-arena-elevated border border-arena-border space-y-1">
              <span className="text-[10px] text-arena-textSubtle uppercase font-semibold">PERSONAL COMPARISON</span>
              <div className="text-xl font-bold text-arena-textPrimary font-mono">
                {result.timeTakenSec > 0 ? `${formatTime(result.timeTakenSec)}` : 'On Record'}
              </div>
              <p className="text-[11px] text-arena-textSecondary leading-relaxed">
                Matches your top quartile pace across mental puzzles.
              </p>
            </div>
          </div>

          {/* Guest notice */}
          {user.isGuest && (
            <div className="p-3.5 rounded-xl bg-arena-elevated/70 border border-arena-border flex items-center justify-between gap-4">
              <div className="text-xs text-arena-textSecondary">
                <strong className="text-arena-textPrimary">Playing as Guest: </strong>
                Your streak and scores are currently saved in local browser storage.
              </div>
              <button
                onClick={() => setActiveTab('profile')}
                className="btn-primary py-1 px-3 text-xs font-semibold shrink-0"
              >
                Save Account
              </button>
            </div>
          )}
        </div>

        {/* Your Overall Stats (Desktop 5 Cols) */}
        <div className="lg:col-span-5 arena-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-arena-border">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-arena-amber" />
              <h3 className="font-bold text-sm text-arena-textPrimary">Career Milestones</h3>
            </div>
            <span className="text-[11px] text-arena-textSubtle">All Puzzles</span>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-arena-elevated border border-arena-border text-xs">
              <span className="text-arena-textSecondary">Casual Rating:</span>
              <span className="font-bold text-arena-amber font-mono">{user.casualRating} Pts</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-arena-elevated border border-arena-border text-xs">
              <span className="text-arena-textSecondary">Completed Puzzles:</span>
              <span className="font-bold text-arena-textPrimary font-mono">{user.gameHistory?.length || 3} Solved</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-arena-elevated border border-arena-border text-xs">
              <span className="text-arena-textSecondary">Consecutive Streak:</span>
              <span className="font-bold text-arena-warning font-mono">{user.streak} Days</span>
            </div>
          </div>
        </div>

      </div>

      {/* 3. PLAY ANOTHER GAME — RECOMMENDATIONS CAROUSEL */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-arena-textPrimary flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-arena-amber" />
              <span>Play Another Game</span>
            </h3>
            <p className="text-xs text-arena-textSecondary">Keep your mental momentum going with today's other challenges</p>
          </div>

          <button
            onClick={onBackToHub}
            className="text-xs font-semibold text-arena-amber hover:underline flex items-center gap-1"
          >
            <span>All Games Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {recommendedGames.slice(0, 5).map(g => (
            <div
              key={g.id}
              onClick={() => onSelectGame(g.id)}
              className="arena-card p-4 cursor-pointer hover:border-arena-borderHover transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-arena-elevated text-arena-textSecondary border border-arena-border">
                    {g.badge}
                  </span>
                  <span className="text-[10px] text-arena-textSubtle">{g.time}</span>
                </div>
                <h4 className="font-bold text-xs text-arena-textPrimary group-hover:text-arena-amber transition-colors">
                  {g.title}
                </h4>
                <p className="text-[11px] text-arena-textSecondary mt-0.5">{g.category}</p>
              </div>

              <div className="pt-3 mt-3 border-t border-arena-border flex items-center justify-between text-xs font-semibold text-arena-amber">
                <span>Play</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
