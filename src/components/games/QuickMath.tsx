import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Share2, Calculator, Trophy, Timer, Flame } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sound } from '../../utils/sound';
import confetti from 'canvas-confetti';

interface MathQuestion {
  question: string;
  answer: number;
  options: number[];
}

function generateMathQuestion(streak: number): MathQuestion {
  const operations = ['+', '-', '*'];
  if (streak >= 5) operations.push('/');

  const op = operations[Math.floor(Math.random() * operations.length)];
  let num1 = 0;
  let num2 = 0;
  let answer = 0;

  if (op === '+') {
    num1 = Math.floor(10 + Math.random() * (20 + streak * 5));
    num2 = Math.floor(5 + Math.random() * (15 + streak * 5));
    answer = num1 + num2;
  } else if (op === '-') {
    num1 = Math.floor(20 + Math.random() * (30 + streak * 5));
    num2 = Math.floor(5 + Math.random() * num1);
    answer = num1 - num2;
  } else if (op === '*') {
    num1 = Math.floor(3 + Math.random() * (7 + Math.min(5, streak)));
    num2 = Math.floor(2 + Math.random() * (9 + Math.min(5, streak)));
    answer = num1 * num2;
  } else {
    answer = Math.floor(2 + Math.random() * 12);
    num2 = Math.floor(2 + Math.random() * 10);
    num1 = answer * num2;
  }

  const optionsSet = new Set<number>([answer]);
  while (optionsSet.size < 4) {
    const delta = Math.floor(1 + Math.random() * 8) * (Math.random() > 0.5 ? 1 : -1);
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

export const QuickMath: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { recordCasualGameResult, openShareModal } = useApp();

  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [totalAttempts, setTotalAttempts] = useState<number>(0);
  const [currentQ, setCurrentQ] = useState<MathQuestion>(() => generateMathQuestion(0));
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
    recordCasualGameResult('quick-math', score);
  };

  const handleStart = () => {
    sound.playGo();
    setIsPlaying(true);
    setGameOver(false);
    setScore(0);
    setStreak(0);
    setCorrectCount(0);
    setTotalAttempts(0);
    setTimeLeft(60);
    setCurrentQ(generateMathQuestion(0));
  };

  const handleSelectOption = (opt: number) => {
    if (!isPlaying || gameOver) return;

    setTotalAttempts(prev => prev + 1);

    if (opt === currentQ.answer) {
      sound.playCorrect();
      const newStreak = streak + 1;
      const pts = 100 + newStreak * 20;
      setScore(prev => prev + pts);
      setStreak(newStreak);
      setCorrectCount(prev => prev + 1);
      setCurrentQ(generateMathQuestion(newStreak));
    } else {
      sound.playWrong();
      setStreak(0);
      setCurrentQ(generateMathQuestion(0));
    }
  };

  const accuracy = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0;

  const handleShare = () => {
    openShareModal({
      title: 'Quick Math',
      gameOrBattle: 'Quick Math 60s Sprint',
      scoreOrResult: `${score} Points`,
      subtitle: `${correctCount} Correct • ${accuracy}% Accuracy • Streak: ${streak}`,
      customStats: [
        { label: 'Score', value: String(score) },
        { label: 'Solved in 60s', value: String(correctCount) },
        { label: 'Accuracy', value: `${accuracy}%` }
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
          <h2 className="text-sm font-bold text-arena-textPrimary">Quick Math</h2>
          <span className="text-[11px] text-arena-textSubtle">60-Second Calculation Sprint</span>
        </div>
        <button onClick={handleStart} className="p-1.5 text-arena-textSecondary hover:text-arena-textPrimary">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Stats Bar */}
      <div className="w-full grid grid-cols-3 gap-2 mb-4">
        <div className="p-2.5 rounded-lg bg-arena-surface border border-arena-border text-center">
          <span className="text-[10px] text-arena-textSubtle font-medium block">SCORE</span>
          <span className="text-base font-bold text-arena-blue">{score}</span>
        </div>
        <div className="p-2.5 rounded-lg bg-arena-surface border border-arena-border text-center">
          <span className="text-[10px] text-arena-textSubtle font-medium block">TIME</span>
          <div className="flex items-center justify-center gap-1 text-base font-bold text-arena-teal">
            <Timer className="w-3.5 h-3.5" />
            <span>{timeLeft}s</span>
          </div>
        </div>
        <div className="p-2.5 rounded-lg bg-arena-surface border border-arena-border text-center">
          <span className="text-[10px] text-arena-textSubtle font-medium block">STREAK</span>
          <div className="flex items-center justify-center gap-1 text-base font-bold text-arena-warning">
            <Flame className="w-3.5 h-3.5" />
            <span>{streak}x</span>
          </div>
        </div>
      </div>

      {!isPlaying && !gameOver ? (
        <div className="w-full p-8 rounded-xl bg-arena-surface border border-arena-border text-center space-y-4">
          <div className="w-12 h-12 rounded-lg bg-arena-elevated border border-arena-border text-arena-teal flex items-center justify-center mx-auto">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-arena-textPrimary">Mental Arithmetic Sprint</h3>
            <p className="text-xs text-arena-textSecondary mt-1 max-w-xs mx-auto leading-relaxed">
              Solve as many equations as you can in 60 seconds. Consecutive correct answers increase streak bonus.
            </p>
          </div>
          <button onClick={handleStart} className="btn-primary w-full py-2.5 text-xs font-semibold">
            Start 60s Sprint
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
            {currentQ.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectOption(opt)}
                className="p-4 rounded-lg bg-arena-surface hover:bg-arena-elevated border border-arena-border text-xl font-bold text-arena-textPrimary font-mono transition-all active:scale-98"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Game Over */
        <div className="w-full p-6 rounded-xl bg-arena-surface border border-arena-border text-center space-y-4">
          <div className="w-10 h-10 rounded-lg bg-arena-elevated border border-arena-border text-arena-blue flex items-center justify-center mx-auto">
            <Trophy className="w-5 h-5" />
          </div>

          <div>
            <span className="text-[10px] uppercase font-semibold text-arena-textSubtle">SPRINT FINISHED</span>
            <div className="text-3xl font-extrabold text-arena-textPrimary mt-1">{score} Points</div>
            <p className="text-xs text-arena-textSecondary mt-1">
              {correctCount} correct of {totalAttempts} attempts ({accuracy}% accuracy)
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={handleStart} className="btn-secondary flex-1 py-2 text-xs">
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
