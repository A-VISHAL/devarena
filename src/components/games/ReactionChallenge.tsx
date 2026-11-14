import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Share2, Zap, Trophy, Activity, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sound } from '../../utils/sound';
import confetti from 'canvas-confetti';

type GameState = 'idle' | 'waiting' | 'ready' | 'too_early' | 'round_result' | 'game_complete';

function getPercentile(ms: number): { percentile: string; rank: string; color: string } {
  if (ms < 185) return { percentile: 'Top 1%', rank: 'Superhuman Reflexes', color: 'text-violet-400' };
  if (ms < 215) return { percentile: 'Top 5%', rank: 'Pro Esports Caliber', color: 'text-cyan-400' };
  if (ms < 250) return { percentile: 'Top 25%', rank: 'Above Average', color: 'text-emerald-400' };
  if (ms < 300) return { percentile: 'Top 50%', rank: 'Average Human', color: 'text-amber-400' };
  return { percentile: 'Top 75%', rank: 'Relaxed Reflexes', color: 'text-rose-400' };
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

    // Random delay between 1.6s and 4.2s
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
      // False start! Clicked too early
      if (timerRef.current) clearTimeout(timerRef.current);
      sound.playWrong();
      setState('too_early');
    } else if (state === 'ready') {
      // Clicked in time!
      const elapsed = Math.round(performance.now() - startTimeRef.current);
      sound.playCorrect();
      setCurrentMs(elapsed);

      const newHistory = [...history, elapsed];
      setHistory(newHistory);

      if (newHistory.length >= totalRounds) {
        sound.playVictory();
        setState('game_complete');
        const avg = Math.round(newHistory.reduce((a, b) => a + b, 0) / newHistory.length);
        const best = Math.min(...newHistory);
        recordCasualGameResult('reaction-challenge', best);
        if (best < 220) confetti({ particleCount: 70, spread: 60 });
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
      gameOrBattle: 'Neural Reaction Benchmark',
      scoreOrResult: `${bestMs} ms`,
      subtitle: `${rankInfo?.percentile} (${rankInfo?.rank}) • Avg: ${averageMs}ms`,
      customStats: [
        { label: 'Fastest Reaction', value: `${bestMs} ms` },
        { label: '5-Round Average', value: `${averageMs} ms` }
      ]
    });
  };

  return (
    <div className="max-w-md mx-auto py-4 px-3 flex flex-col items-center">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-arena-border">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Games</span>
        </button>
        <div className="text-center">
          <h2 className="text-base font-black text-white">Reaction Challenge</h2>
          <span className="text-[10px] text-slate-400">
            {history.length < totalRounds ? `Attempt ${history.length + 1} of ${totalRounds}` : 'Complete'}
          </span>
        </div>
        <button onClick={handleReset} className="p-1.5 text-slate-400 hover:text-white">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Stats preview */}
      <div className="w-full grid grid-cols-2 gap-2 mb-4">
        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 font-semibold block">BEST TIME</span>
          <span className="text-base font-black text-cyan-400">{bestMs ? `${bestMs} ms` : '--'}</span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 font-semibold block">5-ROUND AVG</span>
          <span className="text-base font-black text-violet-400">{averageMs ? `${averageMs} ms` : '--'}</span>
        </div>
      </div>

      {/* Main Interactive Screen */}
      {state !== 'game_complete' ? (
        <div
          onClick={handleClickArea}
          className={`w-full h-72 sm:h-80 rounded-3xl cursor-pointer select-none flex flex-col items-center justify-center p-6 text-center transition-all duration-150 shadow-2xl ${
            state === 'idle'
              ? 'bg-slate-900 border-2 border-slate-800 hover:border-violet-500/50'
              : state === 'waiting'
              ? 'bg-rose-950 border-2 border-rose-600'
              : state === 'ready'
              ? 'bg-emerald-600 border-4 border-emerald-300 shadow-emerald-500/50 scale-[1.02]'
              : state === 'too_early'
              ? 'bg-amber-950 border-2 border-amber-500'
              : 'bg-slate-900 border-2 border-violet-500/50'
          }`}
        >
          {state === 'idle' && (
            <div className="space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-violet-600/20 text-violet-400 flex items-center justify-center mx-auto">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-white">Tap to Start</h3>
              <p className="text-xs text-slate-400 max-w-xs">
                Wait for the red screen to turn green, then click as fast as humanly possible!
              </p>
            </div>
          )}

          {state === 'waiting' && (
            <div className="space-y-2 animate-pulse">
              <div className="w-4 h-4 rounded-full bg-rose-500 mx-auto" />
              <h3 className="text-2xl font-black text-rose-200">Wait for Green...</h3>
              <p className="text-xs text-rose-300">Do not click yet!</p>
            </div>
          )}

          {state === 'ready' && (
            <div className="space-y-2">
              <h3 className="text-4xl font-black text-white tracking-wider animate-bounce">
                CLICK NOW!
              </h3>
            </div>
          )}

          {state === 'too_early' && (
            <div className="space-y-2">
              <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
              <h3 className="text-2xl font-black text-amber-200">Too Early!</h3>
              <p className="text-xs text-amber-300">False start detected. Click anywhere to retry.</p>
            </div>
          )}

          {state === 'round_result' && (
            <div className="space-y-2">
              <Activity className="w-10 h-10 text-cyan-400 mx-auto" />
              <div className="text-4xl font-black text-white">{currentMs} ms</div>
              <p className="text-xs text-slate-400">Click to start next round ({history.length}/{totalRounds})</p>
            </div>
          )}
        </div>
      ) : (
        /* Final Results */
        <div className="w-full p-6 rounded-3xl bg-slate-900 border border-violet-500/40 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-violet-600/20 text-violet-400 flex items-center justify-center mx-auto">
            <Trophy className="w-7 h-7" />
          </div>

          <div>
            <span className="text-xs uppercase font-bold text-slate-400">BENCHMARK RESULT</span>
            <div className="text-4xl font-black text-white mt-1">{bestMs} ms</div>
            {rankInfo && (
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700">
                <span className={`text-xs font-black ${rankInfo.color}`}>{rankInfo.percentile}</span>
                <span className="text-xs text-slate-300 font-semibold">• {rankInfo.rank}</span>
              </div>
            )}
          </div>

          {/* History pills */}
          <div className="flex justify-center gap-1.5 pt-2">
            {history.map((ms, i) => (
              <div key={i} className="px-2 py-1 rounded-lg bg-slate-950 text-xs font-mono text-slate-300 border border-slate-800">
                {ms}ms
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-3">
            <button onClick={handleReset} className="btn-secondary flex-1 py-2.5 text-xs">
              Try Again
            </button>
            <button onClick={handleShare} className="btn-primary flex-1 py-2.5 text-xs gap-1.5">
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Score</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

