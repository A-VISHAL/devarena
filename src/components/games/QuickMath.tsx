import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, RefreshCw, Share2, Calculator, Trophy, Timer, Flame, Check, X } from 'lucide-react';
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
    // Division with clean integer answer
    answer = Math.floor(2 + Math.random() * 12);
    num2 = Math.floor(2 + Math.random() * 10);
    num1 = answer * num2;
  }

  // Generate 3 plausible distractors
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

  // Timer
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
    confetti({ particleCount: 70, spread: 60 });
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
          <h2 className="text-base font-black text-white">Quick Math</h2>
          <span className="text-[10px] text-slate-400">60-Second Calculation Sprint</span>
        </div>
        <button onClick={handleStart} className="p-1.5 text-slate-400 hover:text-white">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Stats Bar */}
      <div className="w-full grid grid-cols-3 gap-2 mb-4">
        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 font-semibold block">SCORE</span>
          <span className="text-base font-black text-violet-400">{score}</span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 font-semibold block">TIME</span>
          <div className="flex items-center justify-center gap-1 text-base font-black text-cyan-400">
            <Timer className="w-4 h-4" />
            <span>{timeLeft}s</span>
          </div>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 font-semibold block">STREAK</span>
          <div className="flex items-center justify-center gap-1 text-base font-black text-amber-400">
            <Flame className="w-4 h-4" />
            <span>{streak}x</span>
          </div>
        </div>
      </div>

      {!isPlaying && !gameOver ? (
        /* Pre-game start banner */
        <div className="w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center mx-auto">
            <Calculator className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">Mental Math Sprint</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Solve as many arithmetic and logical equations as you can in 60 seconds. Consecutive correct answers award streak multipliers!
            </p>
          </div>
          <button onClick={handleStart} className="btn-cyan w-full py-3 text-sm font-bold">
            Start 60s Sprint
          </button>
        </div>
      ) : !gameOver ? (
        /* Playing Screen */
        <div className="w-full space-y-4">
          {/* Question Card */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-arena-card to-slate-950 border border-violet-500/30 text-center shadow-xl">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">EVALUATE</span>
            <div className="text-4xl sm:text-5xl font-black text-white tracking-wider my-3 font-mono">
              {currentQ.question} = ?
            </div>
          </div>

          {/* 4 Options Grid */}
          <div className="grid grid-cols-2 gap-3">
            {currentQ.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectOption(opt)}
                className="p-5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-violet-500/40 text-2xl font-black text-white font-mono transition-all active:scale-95 shadow-md"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Game Over */
        <div className="w-full p-6 rounded-3xl bg-slate-900 border border-violet-500/30 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-violet-600/20 text-violet-400 flex items-center justify-center mx-auto">
            <Trophy className="w-7 h-7" />
          </div>

          <div>
            <span className="text-xs uppercase font-bold text-slate-400">SPRINT COMPLETED</span>
            <div className="text-4xl font-black text-white mt-1">{score} Points</div>
            <p className="text-xs text-slate-400 mt-1">
              {correctCount} correct answers out of {totalAttempts} attempts ({accuracy}% accuracy)
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={handleStart} className="btn-secondary flex-1 py-2.5 text-xs">
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

