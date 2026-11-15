import React, { useState } from 'react';
import { ArrowLeft, RefreshCw, Share2, Trophy, HelpCircle, Check, X, Flame, Sparkles } from 'lucide-react';
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
    explanation: 'Alternating rule: multiply by 2, then subtract 2 (14 * 2 = 28).'
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
    explanation: 'Subtractions increase by 5 each step: -5, -10, -15, -20. (70 - 20 = 50).'
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
  const [difficulty, setDifficulty] = useState<'easy' | 'normal'>('easy');
  const [showHint, setShowHint] = useState<boolean>(false);

  const currentPattern = PATTERNS[currentIndex];

  // In Easy mode or when hint is clicked, eliminate 2 wrong options for a 50/50 choice
  const eliminatedOptions = React.useMemo(() => {
    if (difficulty === 'easy' || showHint) {
      const wrong = currentPattern.options.filter(opt => opt !== currentPattern.answer);
      return wrong.slice(0, 2);
    }
    return [];
  }, [difficulty, showHint, currentPattern]);

  const handleHint = () => {
    sound.playClick();
    setShowHint(true);
  };

  const handleSelectOption = (opt: string | number) => {
    if (isAnswered || gameOver) return;

    setSelectedOption(opt);
    setIsAnswered(true);

    const isCorrect = opt === currentPattern.answer;

    if (isCorrect) {
      sound.playCorrect();
      const newStreak = streak + 1;
      const pts = (difficulty === 'easy' ? 80 : 100) + newStreak * 25;
      setScore(prev => prev + pts);
      setStreak(newStreak);
    } else {
      sound.playWrong();
      setStreak(0);
    }
  };

  const handleNext = () => {
    sound.playClick();
    setShowHint(false);
    if (currentIndex + 1 >= PATTERNS.length) {
      sound.playVictory();
      setGameOver(true);
      confetti({ particleCount: 65, spread: 60 });
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
    setShowHint(false);
    setGameOver(false);
  };

  const handleShare = () => {
    openShareModal({
      title: 'Pattern Master',
      gameOrBattle: 'Pattern Master',
      gameId: 'pattern-master',
      gameTitle: 'Pattern Master',
      scoreOrResult: `${score} Points`,
      score: score,
      roundsOrMoves: `all ${PATTERNS.length} rounds`,
      streak: streak,
      subtitle: `Completed all ${PATTERNS.length} rounds • Streak: ${streak}`,
      customStats: [
        { label: 'Score', value: String(score) },
        { label: 'Rounds', value: `${PATTERNS.length}/${PATTERNS.length}` }
      ]
    });
  };

  return (
    <div className="w-full max-w-xl mx-auto py-6 px-4 flex flex-col items-center animate-in fade-in">
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
          <h2 className="text-sm font-bold text-arena-textPrimary">Pattern Master</h2>
          <span className="text-[11px] text-arena-textSubtle">Round {currentIndex + 1} of {PATTERNS.length}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => { sound.playClick(); setDifficulty(d => d === 'easy' ? 'normal' : 'easy'); }}
            className={`px-2 py-1 rounded text-[11px] font-medium border transition-colors ${
              difficulty === 'easy'
                ? 'bg-arena-success/15 border-arena-success/30 text-arena-success'
                : 'bg-arena-elevated border-arena-border text-arena-textSecondary'
            }`}
            title="Toggle game difficulty"
          >
            {difficulty === 'easy' ? '🟢 Easy' : '🟡 Normal'}
          </button>
          <button
            onClick={handleHint}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-arena-amber/15 hover:bg-arena-amber/25 border border-arena-amber/30 text-arena-amber text-xs font-semibold shadow-sm transition-all"
            title="Corner Hint: Eliminates 2 wrong answers and reveals pattern rule"
          >
            <Sparkles className="w-3.5 h-3.5 text-arena-amber animate-pulse" />
            <span>💡 Hint</span>
          </button>
          <button onClick={handleRestart} className="p-1.5 text-arena-textSecondary hover:text-arena-textPrimary">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating Corner Hint Banner */}
      {showHint && !isAnswered && (
        <div className="w-full mb-3 p-3 rounded-lg bg-arena-amber/10 border border-arena-amber/30 text-arena-textPrimary text-xs flex items-start justify-between gap-2 animate-in fade-in">
          <div className="flex items-start gap-2">
            <span className="text-base leading-none">💡</span>
            <div>
              <span className="font-semibold text-arena-amber block">Corner Hint (50/50 Applied)</span>
              <span className="text-arena-textSecondary text-[11px] leading-tight block mt-0.5">
                {currentPattern.explanation.split('.')[0]}. Two wrong choices have been removed for you!
              </span>
            </div>
          </div>
          <button onClick={() => setShowHint(false)} className="text-arena-textSubtle hover:text-arena-textPrimary p-0.5">
            ✕
          </button>
        </div>
      )}

      {/* Stats Bar */}
      <div className="w-full grid grid-cols-2 gap-2 mb-4">
        <div className="p-2.5 rounded-lg bg-arena-surface border border-arena-border text-center">
          <span className="text-[10px] text-arena-textSubtle font-medium block">SCORE</span>
          <span className="text-base font-bold text-arena-amber font-mono">{score}</span>
        </div>
        <div className="p-2.5 rounded-lg bg-arena-surface border border-arena-border text-center">
          <span className="text-[10px] text-arena-textSubtle font-medium block">COMBO STREAK</span>
          <div className="flex items-center justify-center gap-1 text-base font-bold text-arena-warning font-mono">
            <Flame className="w-3.5 h-3.5" />
            <span>{streak}x</span>
          </div>
        </div>
      </div>

      {!gameOver ? (
        <div className="w-full space-y-4">
          {/* Sequence Display */}
          <div className="p-5 rounded-xl bg-arena-surface border border-arena-border flex flex-wrap items-center justify-center gap-2">
            {currentPattern.sequence.map((item, idx) => (
              <div
                key={idx}
                className={`min-w-10 h-11 px-3 rounded-lg border flex items-center justify-center text-sm font-bold transition-all ${
                  item === '?'
                    ? 'bg-arena-elevated border-arena-amber text-arena-amber'
                    : 'bg-arena-elevated border-arena-border text-arena-textPrimary'
                }`}
              >
                {item}
              </div>
            ))}
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-2.5">
            {currentPattern.options.map((opt, idx) => {
              const isSelected = selectedOption === opt;
              const isCorrectOpt = opt === currentPattern.answer;
              const isEliminated = eliminatedOptions.includes(opt);
              let btnClass = 'bg-arena-surface hover:bg-arena-elevated border-arena-border text-arena-textPrimary';

              if (isEliminated && !isAnswered) {
                btnClass = 'bg-arena-surface/30 opacity-30 border-arena-border line-through text-arena-textSubtle cursor-not-allowed';
              } else if (isAnswered) {
                if (isCorrectOpt) {
                  btnClass = 'bg-arena-success text-slate-950 font-bold border-arena-success';
                } else if (isSelected && !isCorrectOpt) {
                  btnClass = 'bg-arena-error/20 border-arena-error text-arena-error';
                } else {
                  btnClass = 'bg-arena-surface opacity-40 border-arena-border text-arena-textSubtle';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(opt)}
                  disabled={isAnswered || isEliminated}
                  className={`p-3.5 rounded-lg border font-semibold text-base transition-all active:scale-98 flex items-center justify-center gap-2 ${btnClass}`}
                >
                  <span>{opt}</span>
                  {isAnswered && isCorrectOpt && <Check className="w-4 h-4 text-slate-950" />}
                  {isAnswered && isSelected && !isCorrectOpt && <X className="w-4 h-4 text-arena-error" />}
                  {isEliminated && !isAnswered && <span className="text-[10px] text-arena-textSubtle no-underline font-mono ml-1">(50/50 out)</span>}
                </button>
              );
            })}
          </div>

          {/* Explanation Banner */}
          {isAnswered && (
            <div className="p-3.5 rounded-lg bg-arena-surface border border-arena-border animate-in fade-in space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-arena-textPrimary">
                <HelpCircle className="w-3.5 h-3.5 text-arena-teal" />
                <span>Pattern Rule:</span>
              </div>
              <p className="text-xs text-arena-textSecondary leading-relaxed">
                {currentPattern.explanation}
              </p>
              <button
                onClick={handleNext}
                className="w-full btn-primary py-2 text-xs font-medium mt-1"
              >
                {currentIndex + 1 < PATTERNS.length ? 'Next Pattern ➜' : 'Finish & See Results'}
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Game Over */
        <div className="w-full p-6 rounded-xl bg-arena-surface border border-arena-border text-center space-y-4">
          <div className="w-10 h-10 rounded-lg bg-arena-elevated border border-arena-border text-arena-amber flex items-center justify-center mx-auto">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-arena-textPrimary">Pattern Master Complete</h3>
            <p className="text-xs text-arena-textSecondary mt-1">
              Final Score: <strong className="text-arena-textPrimary">{score}</strong> points
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={handleRestart} className="btn-secondary flex-1 py-2 text-xs">
              Play Again
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
