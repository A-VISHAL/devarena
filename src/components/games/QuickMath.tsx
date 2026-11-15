import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Share2, Calculator, Trophy, Timer, Flame, ArrowRight, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CasualGameId, GameResultData } from '../../types';
import { sound } from '../../utils/sound';
import confetti from 'canvas-confetti';

interface MathQuestion {
  question: string;
  answer: number;
  options: number[];
}

function generateMathQuestion(streak: number, difficulty: 'easy' | 'normal' = 'easy'): MathQuestion {
  const operations = difficulty === 'easy' ? ['+', '-'] : ['+', '-', '*'];
  if (difficulty === 'normal' && streak >= 5) operations.push('/');

  const op = operations[Math.floor(Math.random() * operations.length)];
  let num1 = 0;
  let num2 = 0;
  let answer = 0;

  if (op === '+') {
    num1 = Math.floor(difficulty === 'easy' ? (2 + Math.random() * 12) : (10 + Math.random() * (20 + streak * 5)));
    num2 = Math.floor(difficulty === 'easy' ? (1 + Math.random() * 10) : (5 + Math.random() * (15 + streak * 5)));
    answer = num1 + num2;
  } else if (op === '-') {
    num1 = Math.floor(difficulty === 'easy' ? (10 + Math.random() * 15) : (20 + Math.random() * (30 + streak * 5)));
    num2 = Math.floor(difficulty === 'easy' ? (1 + Math.random() * (num1 - 1)) : (5 + Math.random() * num1));
    answer = num1 - num2;
  } else if (op === '*') {
    num1 = Math.floor(2 + Math.random() * 6);
    num2 = Math.floor(2 + Math.random() * 5);
    answer = num1 * num2;
  } else {
    answer = Math.floor(2 + Math.random() * 8);
    num2 = Math.floor(2 + Math.random() * 6);
    num1 = answer * num2;
  }

  const optionsSet = new Set<number>([answer]);
  while (optionsSet.size < 4) {
    const delta = Math.floor(1 + Math.random() * 6) * (Math.random() > 0.5 ? 1 : -1);
    const fake = answer + delta;
    if (fake >= 0) optionsSet.add(fake);
  }

  const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

  return {
    question: `${num1} ${op} ${num2}`,
    answer,
    options
  };
}

export const QuickMath: React.FC<{ 
  onBack: () => void;
  onComplete?: (result: GameResultData) => void;
}> = ({ onBack, onComplete }) => {
  const { recordCasualGameCompletion, openShareModal } = useApp();

  const [difficulty, setDifficulty] = useState<'easy' | 'normal'>('easy');
  const sprintDuration = difficulty === 'easy' ? 90 : 60;
  const [timeLeft, setTimeLeft] = useState<number>(sprintDuration);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [totalAttempts, setTotalAttempts] = useState<number>(0);
  const [currentQ, setCurrentQ] = useState<MathQuestion>(() => generateMathQuestion(0, 'easy'));
  const [hintActive, setHintActive] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);

  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, gameOver]);

  const handleTimeUp = () => {
    sound.playVictory();
    setIsPlaying(false);
    setGameOver(true);
    confetti({ particleCount: 60, spread: 60 });
    const res: GameResultData = {
      gameId: 'quick-math',
      gameTitle: 'Quick Math Sprint',
      score,
      timeTakenSec: sprintDuration,
      moves: totalAttempts,
      accuracy,
      won: true,
      streak: Math.max(streak, 1),
      headline: `Scored ${score} Points!`,
      customStats: [
        { label: 'Score', value: String(score) },
        { label: `Solved in ${sprintDuration}s`, value: `${correctCount}/${totalAttempts}` },
        { label: 'Accuracy', value: `${accuracy}%` }
      ],
      shareSummary: `DEVARENA Quick Math Sprint: ${score} points! Solved ${correctCount}/${totalAttempts} (${accuracy}% accuracy) in ${sprintDuration}s!\nplay.devarena.com`
    };
    recordCasualGameCompletion(res);
  };

  const handleDetailedResults = () => {
    if (onComplete) {
      onComplete({
        gameId: 'quick-math',
        gameTitle: 'Quick Math Sprint',
        score,
        timeTakenSec: sprintDuration,
        moves: totalAttempts,
        accuracy,
        won: true,
        streak: Math.max(streak, 1),
        headline: `Scored ${score} Points!`,
        customStats: [
          { label: 'Score', value: String(score) },
          { label: `Solved in ${sprintDuration}s`, value: `${correctCount}/${totalAttempts}` },
          { label: 'Accuracy', value: `${accuracy}%` }
        ],
        shareSummary: `DEVARENA Quick Math Sprint: ${score} points! Solved ${correctCount}/${totalAttempts} (${accuracy}% accuracy) in ${sprintDuration}s!\nplay.devarena.com`
      });
    }
  };

  const handleStart = (diff = difficulty) => {
    sound.playGo();
    setIsPlaying(true);
    setGameOver(false);
    setScore(0);
    setStreak(0);
    setCorrectCount(0);
    setTotalAttempts(0);
    setHintActive(false);
    const duration = diff === 'easy' ? 90 : 60;
    setTimeLeft(duration);
    setCurrentQ(generateMathQuestion(0, diff));
  };

  const toggleDifficulty = () => {
    sound.playClick();
    const nextDiff = difficulty === 'easy' ? 'normal' : 'easy';
    setDifficulty(nextDiff);
    setIsPlaying(false);
    setGameOver(false);
    setTimeLeft(nextDiff === 'easy' ? 90 : 60);
    setCurrentQ(generateMathQuestion(0, nextDiff));
  };

  const handleHint = () => {
    if (!isPlaying || gameOver) return;
    sound.playClick();
    setHintActive(true);
  };

  // Two wrong options eliminated when hint or easy mode is active
  const eliminatedOpts = React.useMemo(() => {
    if (hintActive) {
      const wrong = currentQ.options.filter(o => o !== currentQ.answer);
      return wrong.slice(0, 2);
    }
    return [];
  }, [hintActive, currentQ]);

  const handleSelectOption = (opt: number) => {
    if (!isPlaying || gameOver) return;

    setTotalAttempts(prev => prev + 1);

    if (opt === currentQ.answer) {
      sound.playCorrect();
      const newStreak = streak + 1;
      const pts = (difficulty === 'easy' ? 80 : 100) + newStreak * 20;
      setScore(prev => prev + pts);
      setStreak(newStreak);
      setCorrectCount(prev => prev + 1);
      setHintActive(false);
      setCurrentQ(generateMathQuestion(newStreak, difficulty));
    } else {
      sound.playWrong();
      setStreak(0);
      setHintActive(false);
      setCurrentQ(generateMathQuestion(0, difficulty));
    }
  };

  const accuracy = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0;

  const handleShare = () => {
    openShareModal({
      title: 'Quick Math',
      gameOrBattle: `Quick Math ${sprintDuration}s Sprint`,
      scoreOrResult: `${score} Points`,
      subtitle: `${correctCount} Correct • ${accuracy}% Accuracy • Streak: ${streak}`,
      customStats: [
        { label: 'Score', value: String(score) },
        { label: `Solved in ${sprintDuration}s`, value: String(correctCount) },
        { label: 'Accuracy', value: `${accuracy}%` }
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
          <h2 className="text-sm font-bold text-arena-textPrimary">Quick Math</h2>
          <span className="text-[11px] text-arena-textSubtle">{sprintDuration}-Second Calculation Sprint</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleDifficulty}
            className={`px-2 py-1 rounded text-[11px] font-medium border transition-colors ${
              difficulty === 'easy'
                ? 'bg-arena-success/15 border-arena-success/30 text-arena-success'
                : 'bg-arena-elevated border-arena-border text-arena-textSecondary'
            }`}
            title="Toggle difficulty (Easy gives 90 seconds and friendly numbers)"
          >
            {difficulty === 'easy' ? '🟢 Easy' : '🟡 Normal'}
          </button>
          <button
            onClick={handleHint}
            disabled={!isPlaying || gameOver}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-arena-amber/15 hover:bg-arena-amber/25 border border-arena-amber/30 text-arena-amber text-xs font-semibold shadow-sm transition-all disabled:opacity-40"
            title="Corner Hint: Eliminates 2 wrong numbers (50/50)"
          >
            <Sparkles className="w-3.5 h-3.5 text-arena-amber animate-pulse" />
            <span>💡 Hint</span>
          </button>
          <button onClick={() => handleStart(difficulty)} className="p-1.5 text-arena-textSecondary hover:text-arena-textPrimary">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="w-full grid grid-cols-3 gap-2 mb-4">
        <div className="p-2.5 rounded-lg bg-arena-surface border border-arena-border text-center">
          <span className="text-[10px] text-arena-textSubtle font-medium block">SCORE</span>
          <span className="text-base font-bold text-arena-amber font-mono">{score}</span>
        </div>
        <div className="p-2.5 rounded-lg bg-arena-surface border border-arena-border text-center">
          <span className="text-[10px] text-arena-textSubtle font-medium block">TIME</span>
          <div className="flex items-center justify-center gap-1 text-base font-bold text-arena-teal font-mono">
            <Timer className="w-3.5 h-3.5" />
            <span>{timeLeft}s</span>
          </div>
        </div>
        <div className="p-2.5 rounded-lg bg-arena-surface border border-arena-border text-center">
          <span className="text-[10px] text-arena-textSubtle font-medium block">STREAK</span>
          <div className="flex items-center justify-center gap-1 text-base font-bold text-arena-warning font-mono">
            <Flame className="w-3.5 h-3.5" />
            <span>{streak}x</span>
          </div>
        </div>
      </div>

      {/* Floating Corner Hint Banner */}
      {hintActive && isPlaying && !gameOver && (
        <div className="w-full mb-3 p-3 rounded-lg bg-arena-amber/10 border border-arena-amber/30 text-arena-textPrimary text-xs flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="text-base leading-none">💡</span>
            <div>
              <span className="font-semibold text-arena-amber block">Corner Hint: 50/50 Active!</span>
              <span className="text-arena-textSecondary text-[11px] block">
                Two incorrect answers were removed. Pick between the remaining two!
              </span>
            </div>
          </div>
          <button onClick={() => setHintActive(false)} className="text-arena-textSubtle hover:text-arena-textPrimary p-0.5">
            ✕
          </button>
        </div>
      )}

      {!isPlaying && !gameOver ? (
        <div className="w-full p-8 rounded-xl bg-arena-surface border border-arena-border text-center space-y-4">
          <div className="w-12 h-12 rounded-lg bg-arena-elevated border border-arena-border text-arena-teal flex items-center justify-center mx-auto">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-arena-textPrimary">Mental Arithmetic Sprint</h3>
            <p className="text-xs text-arena-textSecondary mt-1 max-w-xs mx-auto leading-relaxed">
              Solve equations rapidly in {sprintDuration} seconds. {difficulty === 'easy' ? '🟢 Easy mode active (simple additions and subtractions).' : ''}
            </p>
          </div>
          <button onClick={() => handleStart(difficulty)} className="btn-primary w-full py-2.5 text-xs font-semibold">
            Start {sprintDuration}s Sprint
          </button>
        </div>
      ) : !gameOver ? (
        <div className="w-full space-y-4">
          {/* Question Card */}
          <div className="p-8 rounded-xl bg-arena-surface border border-arena-border text-center">
            <span className="text-[10px] uppercase font-semibold text-arena-textSubtle tracking-wider">EVALUATE</span>
            <div className="text-3xl sm:text-4xl font-extrabold text-arena-textPrimary tracking-wider my-3 font-mono">
              {currentQ.question} = ?
            </div>
          </div>

          {/* 4 Options Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {currentQ.options.map((opt, idx) => {
              const isEliminated = eliminatedOpts.includes(opt);
              return (
                <button
                  key={idx}
                  disabled={isEliminated}
                  onClick={() => handleSelectOption(opt)}
                  className={`p-4 rounded-lg border text-xl font-bold font-mono transition-all active:scale-98 ${
                    isEliminated
                      ? 'bg-arena-surface/30 opacity-20 border-arena-border line-through text-arena-textSubtle cursor-not-allowed'
                      : 'bg-arena-surface hover:bg-arena-elevated border-arena-border text-arena-textPrimary'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Game Over */
        <div className="w-full p-6 rounded-xl bg-arena-surface border border-arena-border text-center space-y-4">
          <div className="w-10 h-10 rounded-lg bg-arena-elevated border border-arena-border text-arena-amber flex items-center justify-center mx-auto">
            <Trophy className="w-5 h-5" />
          </div>

          <div>
            <span className="text-[10px] uppercase font-semibold text-arena-textSubtle">SPRINT FINISHED</span>
            <div className="text-3xl font-extrabold text-arena-textPrimary mt-1">{score} Points</div>
            <p className="text-xs text-arena-textSecondary mt-1">
              {correctCount} correct of {totalAttempts} attempts ({accuracy}% accuracy)
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button onClick={() => handleStart(difficulty)} className="btn-secondary flex-1 py-2 text-xs">
              Play Again
            </button>
            {onComplete && (
              <button onClick={handleDetailedResults} className="btn-primary flex-1 py-2 text-xs gap-1.5">
                <span>View Full Results</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button onClick={handleShare} className="btn-secondary flex-1 py-2 text-xs gap-1.5">
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Score</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
