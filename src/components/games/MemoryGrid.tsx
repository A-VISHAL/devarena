import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Share2, Trophy, Heart, Eye, Brain } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sound } from '../../utils/sound';
import confetti from 'canvas-confetti';

export const MemoryGrid: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { recordCasualGameResult, openShareModal } = useApp();

  const [level, setLevel] = useState<number>(1);
  const [lives, setLives] = useState<number>(3);
  const [score, setScore] = useState<number>(0);
  const [activeCells, setActiveCells] = useState<number[]>([]);
  const [selectedCells, setSelectedCells] = useState<number[]>([]);
  const [showingPattern, setShowingPattern] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);

  // Dynamic grid: 3x3 for lvl 1-2, 4x4 for lvl 3-5, 5x5 for lvl 6+
  const gridSize = level <= 2 ? 3 : level <= 5 ? 4 : 5;
  const totalCells = gridSize * gridSize;
  const targetCount = Math.min(Math.floor(totalCells * 0.4), 2 + level);

  const startNewRound = (lvl: number) => {
    const cells: number[] = [];
    const size = lvl <= 2 ? 3 : lvl <= 5 ? 4 : 5;
    const count = Math.min(Math.floor(size * size * 0.4), 2 + lvl);

    while (cells.length < count) {
      const rnd = Math.floor(Math.random() * (size * size));
      if (!cells.includes(rnd)) cells.push(rnd);
    }

    setActiveCells(cells);
    setSelectedCells([]);
    setShowingPattern(true);

    // Show pattern for 1.4s then hide
    setTimeout(() => {
      setShowingPattern(false);
    }, 1400);
  };

  useEffect(() => {
    startNewRound(1);
  }, []);

  const handleCellClick = (idx: number) => {
    if (showingPattern || gameOver || selectedCells.includes(idx)) return;

    sound.playClick();
    const newSelected = [...selectedCells, idx];
    setSelectedCells(newSelected);

    if (activeCells.includes(idx)) {
      // Correct pick
      sound.playCorrect();
      
      // Check if all found
      const allFound = activeCells.every(c => newSelected.includes(c));
      if (allFound) {
        sound.playVictory();
        const levelBonus = level * 150;
        setScore(prev => prev + levelBonus);

        setTimeout(() => {
          const nextLvl = level + 1;
          setLevel(nextLvl);
          startNewRound(nextLvl);
        }, 800);
      }
    } else {
      // Wrong pick!
      sound.playWrong();
      setLives(prev => {
        const remaining = prev - 1;
        if (remaining <= 0) {
          setGameOver(true);
          recordCasualGameResult('memory-grid', score);
        }
        return remaining;
      });
    }
  };

  const handleRestart = () => {
    sound.playClick();
    setLevel(1);
    setLives(3);
    setScore(0);
    setGameOver(false);
    startNewRound(1);
  };

  const handleShare = () => {
    openShareModal({
      title: 'Memory Grid',
      gameOrBattle: 'Memory Grid Working Memory Test',
      scoreOrResult: `${score} Points`,
      subtitle: `Reached Level ${level} • Recalled ${targetCount} active cells`,
      customStats: [
        { label: 'Score', value: String(score) },
        { label: 'Peak Level', value: `Level ${level}` }
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
          <h2 className="text-base font-black text-white">Memory Grid</h2>
          <span className="text-[10px] text-slate-400">Level {level}</span>
        </div>
        <button onClick={handleRestart} className="p-1.5 text-slate-400 hover:text-white">
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
          <span className="text-[10px] text-slate-400 font-semibold block">LIVES</span>
          <div className="flex items-center justify-center gap-1 text-rose-500">
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart 
                key={i} 
                className={`w-4 h-4 ${i < lives ? 'fill-rose-500' : 'text-slate-700'}`} 
              />
            ))}
          </div>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 font-semibold block">TARGETS</span>
          <span className="text-base font-black text-cyan-400">
            {selectedCells.filter(c => activeCells.includes(c)).length} / {targetCount}
          </span>
        </div>
      </div>

      {/* Status Banner */}
      <div className="mb-4">
        {showingPattern ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-bold animate-pulse">
            <Eye className="w-4 h-4" />
            <span>Memorize the highlighted cells!</span>
          </div>
        ) : !gameOver ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium">
            <Brain className="w-4 h-4 text-violet-400" />
            <span>Click the cells that flashed</span>
          </div>
        ) : null}
      </div>

      {/* Grid */}
      {!gameOver ? (
        <div
          className="grid gap-2.5 p-4 rounded-3xl bg-slate-900/60 border border-arena-border shadow-xl"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`
          }}
        >
          {Array.from({ length: totalCells }).map((_, idx) => {
            const isPattern = activeCells.includes(idx);
            const isSelected = selectedCells.includes(idx);
            const isCorrect = isSelected && isPattern;
            const isWrong = isSelected && !isPattern;

            let cellClass = 'bg-slate-800/80 border-slate-700 hover:border-slate-600';

            if (showingPattern && isPattern) {
              cellClass = 'bg-gradient-to-tr from-cyan-500 to-violet-500 border-cyan-400 shadow-lg shadow-cyan-500/30 scale-105';
            } else if (isCorrect) {
              cellClass = 'bg-emerald-600 border-emerald-500 shadow-md shadow-emerald-600/30';
            } else if (isWrong) {
              cellClass = 'bg-rose-600 border-rose-500 animate-shake';
            }

            return (
              <button
                key={idx}
                disabled={showingPattern || isSelected}
                onClick={() => handleCellClick(idx)}
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 transition-all duration-200 active:scale-95 ${cellClass}`}
              />
            );
          })}
        </div>
      ) : (
        /* Game Over */
        <div className="w-full p-6 rounded-3xl bg-slate-900 border border-violet-500/30 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-violet-600/20 text-violet-400 flex items-center justify-center mx-auto">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">Memory Grid Complete</h3>
            <p className="text-xs text-slate-400 mt-1">
              Final Score: <strong className="text-violet-400">{score}</strong> points reached at Level {level}
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

