import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Share2, Zap, Trophy, Timer, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sound } from '../../utils/sound';
import confetti from 'canvas-confetti';

interface LevelConfig {
  gridSize: number; // 3x3, 4x4, 5x5
  items: { text: string; bg?: string; rotate?: number; isOdd: boolean }[];
  hint: string;
}

function generateLevel(level: number): LevelConfig {
  const gridSize = level <= 3 ? 3 : level <= 7 ? 4 : 5;
  const totalCells = gridSize * gridSize;
  const oddIndex = Math.floor(Math.random() * totalCells);

  const levelTypes = ['symbol', 'color', 'rotation', 'number'];
  const type = levelTypes[(level - 1) % levelTypes.length];

  const items = [];

  if (type === 'symbol') {
    const pairs = [
      { normal: '▲', odd: '▼', hint: 'Inverted triangle' },
      { normal: '◆', odd: '◇', hint: 'Hollow diamond' },
      { normal: '●', odd: '◐', hint: 'Half-filled circle' },
      { normal: '★', odd: '☆', hint: 'Outline star' },
      { normal: '⚙', odd: '⚡', hint: 'Lightning bolt' }
    ];
    const pair = pairs[(level - 1) % pairs.length];
    for (let i = 0; i < totalCells; i++) {
      items.push({
        text: i === oddIndex ? pair.odd : pair.normal,
        isOdd: i === oddIndex
      });
    }
    return { gridSize, items, hint: pair.hint };
  } else if (type === 'color') {
    const baseHue = (level * 67) % 360;
    const diffDelta = Math.max(8, 30 - level * 2); // gets subtler
    const normalBg = `hsl(${baseHue}, 70%, 50%)`;
    const oddBg = `hsl(${baseHue + diffDelta}, 75%, 55%)`;

    for (let i = 0; i < totalCells; i++) {
      items.push({
        text: '',
        bg: i === oddIndex ? oddBg : normalBg,
        isOdd: i === oddIndex
      });
    }
    return { gridSize, items, hint: 'Spot the subtle shade difference' };
  } else if (type === 'rotation') {
    const icon = '➤';
    for (let i = 0; i < totalCells; i++) {
      items.push({
        text: icon,
        rotate: i === oddIndex ? 180 : 0,
        isOdd: i === oddIndex
      });
    }
    return { gridSize, items, hint: 'Opposite pointing direction' };
  } else {
    // Number parity / math
    const baseNum = 20 + level * 2;
    for (let i = 0; i < totalCells; i++) {
      const num = i === oddIndex ? baseNum + 1 : baseNum; // one odd number
      items.push({
        text: String(num),
        isOdd: i === oddIndex
      });
    }
    return { gridSize, items, hint: 'One number is odd, others are even' };
  }
}

export const OddOneOut: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { recordCasualGameResult, openShareModal } = useApp();

  const [level, setLevel] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(15);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [levelConfig, setLevelConfig] = useState<LevelConfig>(() => generateLevel(1));

  const maxLevels = 10;

  // Timer countdown
  useEffect(() => {
    if (gameOver) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleGameOver();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameOver, level]);

  const handleGameOver = () => {
    sound.playWrong();
    setGameOver(true);
    recordCasualGameResult('odd-one-out', score);
  };

  const handleCellClick = (isOdd: boolean) => {
    if (gameOver) return;

    if (isOdd) {
      sound.playCorrect();
      const timeBonus = timeLeft * 15;
      const streakBonus = streak * 25;
      const addedPoints = 100 + timeBonus + streakBonus;
      
      const newScore = score + addedPoints;
      const newStreak = streak + 1;
      setScore(newScore);
      setStreak(newStreak);

      if (level >= maxLevels) {
        sound.playVictory();
        setGameOver(true);
        confetti({ particleCount: 80, spread: 70 });
        recordCasualGameResult('odd-one-out', newScore);
      } else {
        const nextLevel = level + 1;
        setLevel(nextLevel);
        setTimeLeft(Math.max(8, 16 - nextLevel));
        setLevelConfig(generateLevel(nextLevel));
      }
    } else {
      sound.playWrong();
      setStreak(0);
      setTimeLeft(prev => Math.max(1, prev - 3)); // penalty
    }
  };

  const handleRestart = () => {
    sound.playClick();
    setLevel(1);
    setScore(0);
    setStreak(0);
    setTimeLeft(15);
    setGameOver(false);
    setLevelConfig(generateLevel(1));
  };

  const handleShare = () => {
    openShareModal({
      title: 'Odd One Out',
      gameOrBattle: 'Odd One Out Challenge',
      scoreOrResult: `${score} Points`,
      subtitle: `Cleared Level ${level}/${maxLevels} • ${streak} Best Streak`,
      customStats: [
        { label: 'Score', value: String(score) },
        { label: 'Level Reached', value: `${level}/${maxLevels}` }
      ]
    });
  };

  return (
    <div className="max-w-md mx-auto py-4 px-3 flex flex-col items-center">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-arena-border">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Games</span>
        </button>
        <div className="text-center">
          <h2 className="text-base font-black text-white">Odd One Out</h2>
          <span className="text-[10px] text-slate-400">Level {level} of {maxLevels}</span>
        </div>
        <button
          onClick={handleRestart}
          className="p-1.5 text-slate-400 hover:text-white"
          title="Restart"
        >
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
            <Zap className="w-4 h-4" />
            <span>{streak}x</span>
          </div>
        </div>
      </div>

      {/* Hint */}
      <p className="text-xs text-slate-400 mb-4 flex items-center gap-1.5 font-medium">
        <AlertCircle className="w-3.5 h-3.5 text-cyan-400" />
        <span>Hint: {levelConfig.hint}</span>
      </p>

      {/* Grid */}
      {!gameOver ? (
        <div 
          className="grid gap-2 p-3 rounded-2xl bg-slate-900/60 border border-arena-border"
          style={{
            gridTemplateColumns: `repeat(${levelConfig.gridSize}, minmax(0, 1fr))`
          }}
        >
          {levelConfig.items.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleCellClick(item.isOdd)}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl border border-slate-800 hover:border-violet-500/50 flex items-center justify-center text-xl font-bold transition-all active:scale-95 shadow-sm"
              style={{
                backgroundColor: item.bg || '#161d31',
                transform: item.rotate ? `rotate(${item.rotate}deg)` : undefined
              }}
            >
              {item.text}
            </button>
          ))}
        </div>
      ) : (
        /* Game Over Screen */
        <div className="w-full p-6 rounded-3xl bg-slate-900 border border-violet-500/30 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-violet-600/20 text-violet-400 flex items-center justify-center mx-auto">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">
              {level >= maxLevels ? 'All Levels Conquered!' : 'Challenge Ended'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Final Score: <strong className="text-violet-400">{score}</strong> points at Level {level}
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

