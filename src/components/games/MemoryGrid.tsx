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

    setTimeout(() => {
      setShowingPattern(false);
    }, 1300);
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
      sound.playCorrect();
      
      const allFound = activeCells.every(c => newSelected.includes(c));
      if (allFound) {
        sound.playVictory();
        const levelBonus = level * 150;
        setScore(prev => prev + levelBonus);

        setTimeout(() => {
          const nextLvl = level + 1;
          setLevel(nextLvl);
          startNewRound(nextLvl);
        }, 700);
      }
    } else {
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
      gameOrBattle: 'Memory Grid',
      scoreOrResult: `${score} Points`,
      subtitle: `Level ${level} • Recalled ${targetCount} active cells`,
      customStats: [
        { label: 'Score', value: String(score) },
        { label: 'Peak Level', value: `Level ${level}` }
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
          <h2 className="text-sm font-bold text-arena-textPrimary">Memory Grid</h2>
          <span className="text-[11px] text-arena-textSubtle">Level {level}</span>
        </div>
        <button onClick={handleRestart} className="p-1.5 text-arena-textSecondary hover:text-arena-textPrimary">
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
          <span className="text-[10px] text-arena-textSubtle font-medium block">LIVES</span>
          <div className="flex items-center justify-center gap-1 text-arena-error">
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart 
                key={i} 
                className={`w-3.5 h-3.5 ${i < lives ? 'fill-arena-error' : 'text-arena-border'}`} 
              />
            ))}
          </div>
        </div>
        <div className="p-2.5 rounded-lg bg-arena-surface border border-arena-border text-center">
          <span className="text-[10px] text-arena-textSubtle font-medium block">TARGETS</span>
          <span className="text-base font-bold text-arena-teal">
            {selectedCells.filter(c => activeCells.includes(c)).length} / {targetCount}
          </span>
        </div>
      </div>

      {/* Status Notice */}
      <div className="mb-4">
        {showingPattern ? (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-arena-elevated border border-arena-blue/40 text-arena-blue text-xs font-medium">
            <Eye className="w-3.5 h-3.5" />
            <span>Memorize highlighted cells</span>
          </div>
        ) : !gameOver ? (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-arena-surface border border-arena-border text-arena-textSecondary text-xs">
            <Brain className="w-3.5 h-3.5 text-arena-textSubtle" />
            <span>Click the cells that flashed</span>
          </div>
        ) : null}
      </div>

      {/* Grid */}
      {!gameOver ? (
        <div
          className="grid gap-2 p-3.5 rounded-xl bg-arena-surface border border-arena-border"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`
          }}
        >
          {Array.from({ length: totalCells }).map((_, idx) => {
            const isPattern = activeCells.includes(idx);
            const isSelected = selectedCells.includes(idx);
            const isCorrect = isSelected && isPattern;
            const isWrong = isSelected && !isPattern;

            let cellClass = 'bg-arena-elevated border-arena-border hover:border-arena-borderHover';

            if (showingPattern && isPattern) {
              cellClass = 'bg-arena-blue border-arena-blue text-white shadow-subtle';
            } else if (isCorrect) {
              cellClass = 'bg-arena-success border-arena-success text-slate-950 font-bold';
            } else if (isWrong) {
              cellClass = 'bg-arena-error border-arena-error';
            }

            return (
              <button
                key={idx}
                disabled={showingPattern || isSelected}
                onClick={() => handleCellClick(idx)}
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-lg border transition-all active:scale-95 ${cellClass}`}
              />
            );
          })}
        </div>
      ) : (
        /* Game Over */
        <div className="w-full p-6 rounded-xl bg-arena-surface border border-arena-border text-center space-y-4">
          <div className="w-10 h-10 rounded-lg bg-arena-elevated border border-arena-border text-arena-blue flex items-center justify-center mx-auto">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-arena-textPrimary">Memory Grid Complete</h3>
            <p className="text-xs text-arena-textSecondary mt-1">
              Final Score: <strong className="text-arena-textPrimary">{score}</strong> reached at Level {level}
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
