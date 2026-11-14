import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Share2, Zap, Trophy, Activity, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sound } from '../../utils/sound';
import confetti from 'canvas-confetti';

type GameState = 'idle' | 'waiting' | 'ready' | 'too_early' | 'round_result' | 'game_complete';

function getPercentile(ms: number): { percentile: string; rank: string; color: string } {
  if (ms < 185) return { percentile: 'Top 1%', rank: 'Superhuman Reflexes', color: 'text-arena-blue' };
  if (ms < 215) return { percentile: 'Top 5%', rank: 'Pro Esports Caliber', color: 'text-arena-teal' };
  if (ms < 250) return { percentile: 'Top 25%', rank: 'Above Average', color: 'text-arena-success' };
  if (ms < 300) return { percentile: 'Top 50%', rank: 'Average Human', color: 'text-arena-warning' };
  return { percentile: 'Top 75%', rank: 'Relaxed Reflexes', color: 'text-arena-error' };
}

export const ReactionChallenge: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { recordCasualGameResult, openShareModal } = useApp();

  const [state, setState] = useState<GameState>('idle');
  const [currentMs, setCurrentMs] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const totalRounds = 5;

  const startWaiting = () => {
    sound.playClick();
    setState('waiting');
    setCurrentMs(null);

    const delay = Math.floor(1600 + Math.random() * 2600);

    timerRef.current = setTimeout(() => {
      startTimeRef.current = performance.now();
      setState('ready');
      sound.playGo();
    }, delay);
  };

  const handleClickArea = () => {
    if (state === 'idle') {
      startWaiting();
    } else if (state === 'waiting') {
      if (timerRef.current) clearTimeout(timerRef.current);
      sound.playWrong();
      setState('too_early');
    } else if (state === 'ready') {
      const elapsed = Math.round(performance.now() - startTimeRef.current);
      sound.playCorrect();
      setCurrentMs(elapsed);

      const newHistory = [...history, elapsed];
      setHistory(newHistory);

      if (newHistory.length >= totalRounds) {
        sound.playVictory();
        setState('game_complete');
        const best = Math.min(...newHistory);
        recordCasualGameResult('reaction-challenge', best);
        if (best < 220) confetti({ particleCount: 60, spread: 60 });
      } else {
        setState('round_result');
      }
    } else if (state === 'too_early' || state === 'round_result') {
      startWaiting();
    }
  };

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    sound.playClick();
    setState('idle');
    setCurrentMs(null);
    setHistory([]);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const averageMs = history.length > 0
    ? Math.round(history.reduce((a, b) => a + b, 0) / history.length)
    : 0;

  const bestMs = history.length > 0 ? Math.min(...history) : 0;
  const rankInfo = bestMs ? getPercentile(bestMs) : null;

  const handleShare = () => {
    openShareModal({
      title: 'Reaction Challenge',
      gameOrBattle: 'Reaction Challenge',
      scoreOrResult: `${bestMs} ms`,
      subtitle: `${rankInfo?.percentile} (${rankInfo?.rank}) • Avg: ${averageMs}ms`,
      customStats: [
        { label: 'Fastest', value: `${bestMs} ms` },
        { label: 'Average', value: `${averageMs} ms` }
      ]
    });
  };

  return (
    <div className="max-w-md mx-auto py-6 px-4 flex flex-col items-center animate-in fade-in">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-arena-border">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-medium text-arena-textSecondary hover:text-arena-textPrimary"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Games</span>
        </button>
        <div className="text-center">
          <h2 className="text-sm font-bold text-arena-textPrimary">Reaction Challenge</h2>
          <span className="text-[11px] text-arena-textSubtle">
            {history.length < totalRounds ? `Attempt ${history.length + 1} of ${totalRounds}` : 'Complete'}
          </span>
        </div>
        <button onClick={handleReset} className="p-1.5 text-arena-textSecondary hover:text-arena-textPrimary">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Stats preview */}
      <div className="w-full grid grid-cols-2 gap-2 mb-4">
        <div className="p-2.5 rounded-lg bg-arena-surface border border-arena-border text-center">
          <span className="text-[10px] text-arena-textSubtle font-medium block">BEST TIME</span>
          <span className="text-base font-bold text-arena-teal">{bestMs ? `${bestMs} ms` : '--'}</span>
        </div>
        <div className="p-2.5 rounded-lg bg-arena-surface border border-arena-border text-center">
          <span className="text-[10px] text-arena-textSubtle font-medium block">5-ROUND AVG</span>
          <span className="text-base font-bold text-arena-blue">{averageMs ? `${averageMs} ms` : '--'}</span>
        </div>
      </div>

      {/* Main Interactive Screen */}
      {state !== 'game_complete' ? (
        <div
          onClick={handleClickArea}
          className={`w-full h-72 sm:h-80 rounded-xl cursor-pointer select-none flex flex-col items-center justify-center p-6 text-center transition-all ${
            state === 'idle'
              ? 'bg-arena-surface border border-arena-border hover:border-arena-borderHover'
              : state === 'waiting'
              ? 'bg-arena-error/15 border border-arena-error text-arena-error'
              : state === 'ready'
              ? 'bg-arena-success text-slate-950 font-bold border border-arena-success'
              : state === 'too_early'
              ? 'bg-arena-warning/15 border border-arena-warning text-arena-warning'
              : 'bg-arena-surface border border-arena-border'
          }`}
        >
          {state === 'idle' && (
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-lg bg-arena-elevated border border-arena-border text-arena-blue flex items-center justify-center mx-auto">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-arena-textPrimary">Click to Start</h3>
              <p className="text-xs text-arena-textSecondary max-w-xs leading-relaxed">
                Wait for the red prompt to turn green, then click as fast as possible.
              </p>
            </div>
          )}

          {state === 'waiting' && (
            <div className="space-y-2">
              <div className="w-3.5 h-3.5 rounded-full bg-arena-error mx-auto animate-pulse" />
              <h3 className="text-2xl font-bold text-arena-error">Wait for Green...</h3>
              <p className="text-xs opacity-80">Do not click yet</p>
            </div>
          )}

          {state === 'ready' && (
            <div className="space-y-2">
              <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-wider">
                CLICK NOW!
              </h3>
            </div>
          )}

          {state === 'too_early' && (
            <div className="space-y-2">
              <AlertTriangle className="w-8 h-8 mx-auto" />
              <h3 className="text-xl font-bold">Too Early</h3>
              <p className="text-xs opacity-80">False start detected. Click anywhere to retry.</p>
            </div>
          )}

          {state === 'round_result' && (
            <div className="space-y-2">
              <Activity className="w-8 h-8 text-arena-blue mx-auto" />
              <div className="text-3xl font-bold text-arena-textPrimary">{currentMs} ms</div>
              <p className="text-xs text-arena-textSecondary">Click to continue ({history.length}/{totalRounds})</p>
            </div>
          )}
        </div>
      ) : (
        /* Final Results */
        <div className="w-full p-6 rounded-xl bg-arena-surface border border-arena-border text-center space-y-4">
          <div className="w-10 h-10 rounded-lg bg-arena-elevated border border-arena-border text-arena-blue flex items-center justify-center mx-auto">
            <Trophy className="w-5 h-5" />
          </div>

          <div>
            <span className="text-[10px] uppercase font-semibold text-arena-textSubtle">BENCHMARK RESULT</span>
            <div className="text-3xl font-extrabold text-arena-textPrimary mt-1">{bestMs} ms</div>
            {rankInfo && (
              <div className="mt-2 inline-flex items-center gap-2 px-2.5 py-1 rounded bg-arena-elevated border border-arena-border">
                <span className={`text-xs font-bold ${rankInfo.color}`}>{rankInfo.percentile}</span>
                <span className="text-xs text-arena-textSecondary">• {rankInfo.rank}</span>
              </div>
            )}
          </div>

          {/* History pills */}
          <div className="flex justify-center gap-1.5 pt-2">
            {history.map((ms, i) => (
              <div key={i} className="px-2 py-0.5 rounded bg-arena-elevated text-xs font-mono text-arena-textSecondary border border-arena-border">
                {ms}ms
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-3">
            <button onClick={handleReset} className="btn-secondary flex-1 py-2 text-xs">
              Try Again
            </button>
            <button onClick={handleShare} className="btn-primary flex-1 py-2 text-xs gap-1.5">
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Score</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
