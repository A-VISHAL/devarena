import React, { useState } from 'react';
import { ArrowLeft, RefreshCw, Share2, Trophy, HelpCircle, Check, X, Flame } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sound } from '../../utils/sound';
import confetti from 'canvas-confetti';

interface PatternQuestion {
  sequence: (string | number)[];
  options: (string | number)[];
  answer: string | number;
  explanation: string;
}

const PATTERNS: PatternQuestion[] = [
  {
    sequence: [3, 7, 11, 15, '?'],
    options: [17, 19, 21, 23],
    answer: 19,
    explanation: 'Arithmetic progression with a constant step of +4.'
  },
  {
    sequence: [2, 6, 18, 54, '?'],
    options: [108, 162, 148, 172],
    answer: 162,
    explanation: 'Geometric sequence where each number is multiplied by 3.'
  },
  {
    sequence: [1, 1, 2, 3, 5, 8, '?'],
    options: [11, 13, 14, 15],
    answer: 13,
    explanation: 'Fibonacci sequence: each number is the sum of the two preceding ones (5 + 8 = 13).'
  },
  {
    sequence: [1, 4, 9, 16, 25, '?'],
    options: [30, 36, 49, 32],
    answer: 36,
    explanation: 'Perfect square numbers: 1², 2², 3², 4², 5², 6² = 36.'
  },
  {
    sequence: [2, 3, 5, 7, 11, '?'],
    options: [13, 15, 17, 19],
    answer: 13,
    explanation: 'Sequence of prime numbers.'
  },
  {
    sequence: [5, 10, 8, 16, 14, '?'],
    options: [20, 24, 28, 18],
    answer: 28,
    explanation: 'Alternating rule: multiply by 2, then subtract 2. 14 * 2 = 28.'
  },
  {
    sequence: ['▲', '▶', '▼', '◀', '?'],
    options: ['▲', '▶', '◆', '▼'],
    answer: '▲',
    explanation: 'Clockwise 90-degree rotational cycle.'
  },
  {
    sequence: [100, 95, 85, 70, '?'],
    options: [50, 55, 60, 45],
    answer: 50,
    explanation: 'Subtractions increase by 5 each step: -5, -10, -15, -20. 70 - 20 = 50.'
  }
];

export const PatternMaster: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { recordCasualGameResult, openShareModal } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const currentPattern = PATTERNS[currentIndex];

  const handleSelectOption = (opt: string | number) => {
    if (isAnswered || gameOver) return;

    setSelectedOption(opt);
    setIsAnswered(true);

    const isCorrect = opt === currentPattern.answer;

    if (isCorrect) {
      sound.playCorrect();
      const newStreak = streak + 1;
      const pts = 100 + newStreak * 25;
      setScore(prev => prev + pts);
      setStreak(newStreak);
    } else {
      sound.playWrong();
      setStreak(0);
    }
  };

  const handleNext = () => {
    sound.playClick();
    if (currentIndex + 1 >= PATTERNS.length) {
      sound.playVictory();
      setGameOver(true);
      confetti({ particleCount: 75, spread: 65 });
      recordCasualGameResult('pattern-master', score);
    } else {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    }
  };

  const handleRestart = () => {
    sound.playClick();
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setGameOver(false);
  };

  const handleShare = () => {
    openShareModal({
      title: 'Pattern Master',
      gameOrBattle: 'Pattern Master Sequence Challenge',
      scoreOrResult: `${score} Points`,
      subtitle: `Completed all ${PATTERNS.length} rounds • Streak: ${streak}`,
      customStats: [
        { label: 'Score', value: String(score) },
        { label: 'Rounds', value: `${PATTERNS.length}/${PATTERNS.length}` }
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
          <h2 className="text-base font-black text-white">Pattern Master</h2>
          <span className="text-[10px] text-slate-400">Round {currentIndex + 1} of {PATTERNS.length}</span>
        </div>
        <button onClick={handleRestart} className="p-1.5 text-slate-400 hover:text-white">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Stats Bar */}
      <div className="w-full grid grid-cols-2 gap-2 mb-5">
        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 font-semibold block">TOTAL SCORE</span>
          <span className="text-base font-black text-violet-400">{score}</span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 font-semibold block">COMBO STREAK</span>
          <div className="flex items-center justify-center gap-1 text-base font-black text-amber-400">
            <Flame className="w-4 h-4" />
            <span>{streak}x</span>
          </div>
        </div>
      </div>

      {!gameOver ? (
        <div className="w-full space-y-5">
          {/* Sequence Display */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-arena-border flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {currentPattern.sequence.map((item, idx) => (
              <div
                key={idx}
                className={`min-w-12 h-12 px-3 rounded-xl border flex items-center justify-center text-lg font-black transition-all ${
                  item === '?'
                    ? 'bg-violet-600/20 border-violet-500/60 text-violet-300 animate-pulse'
                    : 'bg-slate-800 border-slate-700 text-white'
                }`}
              >
                {item}
              </div>
            ))}
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-3">
            {currentPattern.options.map((opt, idx) => {
              const isSelected = selectedOption === opt;
              const isCorrectOpt = opt === currentPattern.answer;
              let btnClass = 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-white';

              if (isAnswered) {
                if (isCorrectOpt) {
                  btnClass = 'bg-emerald-600/30 border-emerald-500 text-emerald-200';
                } else if (isSelected && !isCorrectOpt) {
                  btnClass = 'bg-rose-600/30 border-rose-500 text-rose-200';
                } else {
                  btnClass = 'bg-slate-900/40 border-slate-800/40 text-slate-600';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(opt)}
                  disabled={isAnswered}
                  className={`p-4 rounded-xl border font-black text-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${btnClass}`}
                >
                  <span>{opt}</span>
                  {isAnswered && isCorrectOpt && <Check className="w-4 h-4 text-emerald-400" />}
                  {isAnswered && isSelected && !isCorrectOpt && <X className="w-4 h-4 text-rose-400" />}
                </button>
              );
            })}
          </div>

          {/* Explanation Banner */}
          {isAnswered && (
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 animate-in fade-in space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                <span>Pattern Rule:</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {currentPattern.explanation}
              </p>
              <button
                onClick={handleNext}
                className="w-full btn-primary py-2 text-xs font-bold mt-2"
              >
                {currentIndex + 1 < PATTERNS.length ? 'Next Pattern ➜' : 'Finish & See Results'}
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Game Over */
        <div className="w-full p-6 rounded-3xl bg-slate-900 border border-violet-500/30 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-violet-600/20 text-violet-400 flex items-center justify-center mx-auto">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">Pattern Master Completed!</h3>
            <p className="text-xs text-slate-400 mt-1">
              You scored <strong className="text-violet-400">{score}</strong> points across all sequence tests.
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={handleRestart} className="btn-secondary flex-1 py-2.5 text-xs">
              Play Again
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

