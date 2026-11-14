import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Share2, Trophy, Timer, AlertCircle, Zap } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sound } from '../../utils/sound';
import confetti from 'canvas-confetti';

interface LevelConfig {
  gridSize: number;
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
      { normal: '⬟', odd: '⬢', hint: 'Hexagon vs Pentagon' }
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
    const baseLightness = 22;
    const diffDelta = Math.max(5, 18 - level * 1.5);
    const normalBg = `hsl(215, 20%, ${baseLightness}%)`;
    const oddBg = `hsl(215, 25%, ${baseLightness + diffDelta}%)`;

    for (let i = 0; i < totalCells; i++) {
      items.push({
        text: '',
        bg: i === oddIndex ? oddBg : normalBg,
        isOdd: i === oddIndex
      });
    }
    return { gridSize, items, hint: 'Identify the subtle shade variant' };
  } else if (type === 'rotation') {
    const icon = '➤';
    for (let i = 0; i < totalCells; i++) {
      items.push({
        text: icon,
        rotate: i === oddIndex ? 180 : 0,
        isOdd: i === oddIndex
      });
    }
    return { gridSize, items, hint: 'Opposite pointing orientation' };
  } else {
    const baseNum = 20 + level * 2;
    for (let i = 0; i < totalCells; i++) {
      const num = i === oddIndex ? baseNum + 1 : baseNum;
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
        confetti({ particleCount: 70, spread: 70 });
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
      setTimeLeft(prev => Math.max(1, prev - 3));
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
      gameOrBattle: 'Odd One Out',
      scoreOrResult: `${score} Points`,
      subtitle: `Completed Level ${level}/${maxLevels} • Streak: ${streak}`,
      customStats: [
        { label: 'Score', value: String(score) },
        { label: 'Level', value: `${level}/${maxLevels}` }
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
          <h2 className="text-sm font-bold text-arena-textPrimary">Odd One Out</h2>
          <span className="text-[11px] text-arena-textSubtle">Level {level} of {maxLevels}</span>
        </div>
        <button
          onClick={handleRestart}
          className="p-1.5 text-arena-textSecondary hover:text-arena-textPrimary"
          title="Restart"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
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
            <Zap className="w-3.5 h-3.5" />
            <span>{streak}x</span>
          </div>
        </div>
      </div>

      {/* Hint */}
      <p className="text-xs text-arena-textSecondary mb-4 flex items-center gap-1.5 font-medium">
        <AlertCircle className="w-3.5 h-3.5 text-arena-teal" />
        <span>Hint: {levelConfig.hint}</span>
      </p>

      {/* Grid */}
      {!gameOver ? (
        <div 
          className="grid gap-2 p-3.5 rounded-xl bg-arena-surface border border-arena-border"
          style={{
            gridTemplateColumns: `repeat(${levelConfig.gridSize}, minmax(0, 1fr))`
          }}
        >
          {levelConfig.items.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleCellClick(item.isOdd)}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg border border-arena-border hover:border-arena-borderHover flex items-center justify-center text-lg font-bold transition-all active:scale-95 text-arena-textPrimary"
              style={{
                backgroundColor: item.bg || '#242A2D',
                transform: item.rotate ? `rotate(${item.rotate}deg)` : undefined
              }}
            >
              {item.text}
            </button>
          ))}
        </div>
      ) : (
        /* Game Over Screen */
        <div className="w-full p-6 rounded-xl bg-arena-surface border border-arena-border text-center space-y-4">
          <div className="w-10 h-10 rounded-lg bg-arena-elevated border border-arena-border text-arena-amber flex items-center justify-center mx-auto">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-arena-textPrimary">
              {level >= maxLevels ? 'All Levels Completed' : 'Session Ended'}
            </h3>
            <p className="text-xs text-arena-textSecondary mt-1">
              Final Score: <strong className="text-arena-textPrimary">{score}</strong> at Level {level}
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
