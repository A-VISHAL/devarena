import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ArrowLeft, 
  RotateCcw, 
  Undo2, 
  HelpCircle, 
  Volume2, 
  VolumeX, 
  Timer as TimerIcon, 
  Sparkles, 
  Check, 
  AlertCircle,
  Trophy,
  Share2,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sound } from '../../utils/sound';
import confetti from 'canvas-confetti';
import { GameResultData } from '../../types';

interface Coord {
  r: number;
  c: number;
}

interface NodeCheckpoint {
  id: number;
  r: number;
  c: number;
}

export const ZipGame: React.FC<{ 
  onBack: () => void;
  onComplete?: (result: GameResultData) => void;
}> = ({ onBack, onComplete }) => {
  const { 
    recordCasualGameCompletion, 
    openShareModal, 
    isSoundMuted, 
    toggleSound,
    user 
  } = useApp();

  const GRID_SIZE = 6;
  const CHALLENGE_NUMBER = 42;

  // Level Definition for Daily Zip #42
  const checkpoints: NodeCheckpoint[] = [
    { id: 1, r: 0, c: 0 },
    { id: 2, r: 0, c: 4 },
    { id: 3, r: 2, c: 2 },
    { id: 4, r: 3, c: 5 },
    { id: 5, r: 5, c: 3 },
    { id: 6, r: 5, c: 5 }
  ];

  const obstacles: Coord[] = [
    { r: 1, c: 1 },
    { r: 2, c: 4 },
    { r: 3, c: 2 },
    { r: 4, c: 0 },
    { r: 4, c: 4 }
  ];

  // Game State
  const [path, setPath] = useState<Coord[]>([{ r: 0, c: 0 }]);
  const [currentCheckpoint, setCurrentCheckpoint] = useState<number>(1);
  const [seconds, setSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [moveCount, setMoveCount] = useState<number>(0);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [hintCell, setHintCell] = useState<Coord | null>(null);
  const isDraggingRef = useRef<boolean>(false);

  // Timer
  useEffect(() => {
    let interval: any = null;
    if (isRunning && !isCompleted) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, isCompleted]);

  const isObstacle = useCallback((r: number, c: number) => {
    return obstacles.some(o => o.r === r && o.c === c);
  }, []);

  const getCheckpointAt = useCallback((r: number, c: number) => {
    return checkpoints.find(cp => cp.r === r && cp.c === c);
  }, []);

  const isCellInPath = useCallback((r: number, c: number) => {
    return path.findIndex(p => p.r === r && p.c === c);
  }, [path]);

  // Handle cell click or drag move
  const handleCellAction = useCallback((r: number, c: number) => {
    if (isCompleted) return;

    const pathIndex = isCellInPath(r, c);
    
    // Clicking on an already visited cell rewinds/undos to that position
    if (pathIndex !== -1) {
      if (pathIndex === path.length - 1) return; // clicking head does nothing
      sound.playClick();
      const newPath = path.slice(0, pathIndex + 1);
      setPath(newPath);
      setMoveCount(m => m + 1);
      setHintCell(null);

      // Re-evaluate current checkpoint reached
      let maxReached = 1;
      for (const cp of checkpoints) {
        if (newPath.some(p => p.r === cp.r && p.c === cp.c)) {
          if (cp.id === maxReached) maxReached++;
        } else {
          break;
        }
      }
      setCurrentCheckpoint(maxReached - 1);
      return;
    }

    // Otherwise, check if (r, c) is orthogonally adjacent to path head
    const head = path[path.length - 1];
    const dr = Math.abs(head.r - r);
    const dc = Math.abs(head.c - c);

    if ((dr === 1 && dc === 0) || (dr === 0 && dc === 1)) {
      if (isObstacle(r, c)) return;

      const checkpoint = getCheckpointAt(r, c);
      // If cell is a checkpoint, make sure it's the NEXT sequential checkpoint
      if (checkpoint && checkpoint.id !== currentCheckpoint + 1) {
        sound.playWrong();
        return;
      }

      sound.playClick();
      const newPath = [...path, { r, c }];
      setPath(newPath);
      setMoveCount(m => m + 1);
      setHintCell(null);

      let nextCp = currentCheckpoint;
      if (checkpoint && checkpoint.id === currentCheckpoint + 1) {
        sound.playCorrect();
        nextCp = checkpoint.id;
        setCurrentCheckpoint(nextCp);
      }

      // Check for puzzle completion: reached final checkpoint
      if (nextCp === checkpoints.length) {
        setIsCompleted(true);
        setIsRunning(false);
        sound.playVictory();
        confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });

        const finalScore = Math.max(100, 1000 - seconds * 8 - moveCount * 5);
        const result: GameResultData = {
          gameId: 'zip',
          gameTitle: `Zip #${CHALLENGE_NUMBER}`,
          challengeNumber: CHALLENGE_NUMBER,
          score: finalScore,
          timeTakenSec: seconds,
          moves: moveCount + 1,
          won: true,
          streak: user.streak,
          headline: 'Path Fully Connected!',
          customStats: [
            { label: 'Time', value: `${Math.floor(seconds / 60)}m ${seconds % 60}s` },
            { label: 'Steps', value: String(moveCount + 1) },
            { label: 'Waypoints', value: `${checkpoints.length}/${checkpoints.length}` }
          ],
          shareSummary: `DEVARENA Zip #${CHALLENGE_NUMBER}\nSolved in ${Math.floor(seconds / 60)}m ${seconds % 60}s • ${moveCount + 1} steps\nStreak: ${user.streak}d 🔥`
        };

        recordCasualGameCompletion(result);
        if (onComplete) {
          setTimeout(() => onComplete(result), 1200);
        }
      }
    }
  }, [isCompleted, path, isCellInPath, isObstacle, getCheckpointAt, currentCheckpoint, seconds, moveCount, user.streak, recordCasualGameCompletion, onComplete]);

  const handleUndo = () => {
    if (path.length <= 1 || isCompleted) return;
    sound.playClick();
    const newPath = path.slice(0, -1);
    setPath(newPath);
    setMoveCount(m => m + 1);

    let maxReached = 1;
    for (const cp of checkpoints) {
      if (newPath.some(p => p.r === cp.r && p.c === cp.c)) {
        if (cp.id === maxReached) maxReached++;
      } else {
        break;
      }
    }
    setCurrentCheckpoint(maxReached - 1);
  };

  const handleReset = () => {
    sound.playClick();
    setPath([{ r: 0, c: 0 }]);
    setCurrentCheckpoint(1);
    setMoveCount(0);
    setSeconds(0);
    setIsCompleted(false);
    setIsRunning(true);
    setHintCell(null);
  };

  const handleHint = () => {
    if (isCompleted) return;
    sound.playClick();
    const nextTarget = checkpoints.find(cp => cp.id === currentCheckpoint + 1);
    if (!nextTarget) return;

    const head = path[path.length - 1];
    // Find adjacent unvisited valid neighbor closest to nextTarget
    const neighbors: Coord[] = [
      { r: head.r - 1, c: head.c },
      { r: head.r + 1, c: head.c },
      { r: head.r, c: head.c - 1 },
      { r: head.r, c: head.c + 1 },
    ].filter(n => 
      n.r >= 0 && n.r < GRID_SIZE && 
      n.c >= 0 && n.c < GRID_SIZE && 
      !isObstacle(n.r, n.c) && 
      isCellInPath(n.r, n.c) === -1
    );

    if (neighbors.length > 0) {
      neighbors.sort((a, b) => {
        const distA = Math.abs(a.r - nextTarget.r) + Math.abs(a.c - nextTarget.c);
        const distB = Math.abs(b.r - nextTarget.r) + Math.abs(b.c - nextTarget.c);
        return distA - distB;
      });
      setHintCell(neighbors[0]);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="min-h-[85vh] flex flex-col bg-arena-bg animate-in fade-in">
      
      {/* 1. TOP MINIMAL NAVIGATION BAR */}
      <div className="w-full bg-arena-surface border-b border-arena-border">
        <div className="page-container h-14 flex items-center justify-between">
          
          {/* Back & Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-arena-elevated border border-arena-border text-xs font-medium text-arena-textSecondary hover:text-arena-textPrimary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Games</span>
            </button>

            <div className="h-4 w-px bg-arena-border hidden sm:block" />

            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-arena-textPrimary">Zip</span>
                <span className="text-[11px] font-mono text-arena-amber font-semibold px-2 py-0.2 rounded bg-arena-elevated border border-arena-border">
                  #{CHALLENGE_NUMBER}
                </span>
                <span className="text-[10px] font-medium px-2 py-0.2 rounded bg-arena-elevated text-arena-textSecondary border border-arena-border hidden md:inline">
                  Daily Puzzle
                </span>
              </div>
            </div>
          </div>

          {/* Center Timer */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-arena-elevated border border-arena-border font-mono text-xs font-semibold">
            <TimerIcon className="w-3.5 h-3.5 text-arena-teal" />
            <span className="text-arena-textPrimary">{formatTime(seconds)}</span>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleUndo}
              disabled={path.length <= 1 || isCompleted}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-arena-elevated border border-arena-border text-xs text-arena-textSecondary hover:text-arena-textPrimary transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              title="Undo last step"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Undo</span>
            </button>

            <button
              onClick={handleReset}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-arena-elevated border border-arena-border text-xs text-arena-textSecondary hover:text-arena-textPrimary transition-colors flex items-center gap-1.5"
              title="Reset puzzle"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Reset</span>
            </button>

            <button
              onClick={() => setShowHelp(true)}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-arena-elevated border border-arena-border text-xs text-arena-textSecondary hover:text-arena-textPrimary transition-colors flex items-center gap-1.5"
              title="How to play"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Rules</span>
            </button>

            <button
              onClick={toggleSound}
              className="p-1.5 rounded-lg bg-arena-elevated border border-arena-border text-xs text-arena-textSecondary hover:text-arena-textPrimary transition-colors"
              title={isSoundMuted ? "Unmute" : "Mute"}
            >
              {isSoundMuted ? <VolumeX className="w-3.5 h-3.5 text-arena-error" /> : <Volume2 className="w-3.5 h-3.5 text-arena-teal" />}
            </button>
          </div>

        </div>
      </div>

      {/* 2. MAIN FOCUSED GAMEPLAY WORKSPACE */}
      <div className="page-container py-6 flex-1 flex flex-col items-center justify-center">
        
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Panel: Game Context & Progress (Desktop 3 Cols) */}
          <div className="lg:col-span-3 space-y-4 order-2 lg:order-1">
            <div className="p-4 rounded-xl bg-arena-surface border border-arena-border space-y-3">
              <span className="text-[10px] uppercase font-semibold text-arena-textSubtle tracking-wider">
                WAYPOINTS
              </span>
              <div className="space-y-1.5">
                {checkpoints.map(cp => {
                  const isReached = currentCheckpoint >= cp.id;
                  const isNext = currentCheckpoint + 1 === cp.id;

                  return (
                    <div 
                      key={cp.id}
                      className={`p-2 rounded-lg border text-xs flex items-center justify-between transition-all ${
                        isReached 
                          ? 'bg-arena-elevated border-arena-amber text-arena-amber font-semibold'
                          : isNext
                          ? 'bg-arena-elevated/70 border-arena-amber/50 text-arena-textPrimary'
                          : 'bg-arena-surface border-arena-border text-arena-textSubtle'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold font-mono ${
                          isReached ? 'bg-arena-amber text-[#141719]' : 'bg-arena-border text-arena-textSubtle'
                        }`}>
                          {cp.id}
                        </span>
                        <span>Checkpoint {cp.id}</span>
                      </div>
                      {isReached && <Check className="w-3.5 h-3.5 text-arena-amber" />}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-arena-surface border border-arena-border text-xs space-y-1.5 text-arena-textSecondary">
              <span className="text-[10px] font-semibold text-arena-textSubtle uppercase tracking-wider block">
                GAME OBJECTIVE
              </span>
              <p className="leading-relaxed">
                Draw a continuous path connecting numbers 1 through 6 in order. Drag or click adjacent tiles to move.
              </p>
            </div>
          </div>

          {/* Center Panel: The Game Board (Desktop 6 Cols) */}
          <div className="lg:col-span-6 flex flex-col items-center order-1 lg:order-2">
            
            {/* Status Feedback Pill */}
            <div className="mb-4 flex items-center gap-2">
              <div className="px-3 py-1 rounded-full bg-arena-elevated border border-arena-border text-xs font-medium text-arena-textSecondary flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-arena-amber animate-pulse" />
                <span>Next Target: <strong>Checkpoint {currentCheckpoint + 1 <= checkpoints.length ? currentCheckpoint + 1 : 'Complete'}</strong></span>
              </div>
            </div>

            {/* Interactive Zip Board */}
            <div 
              className="p-3 sm:p-4 rounded-2xl bg-arena-surface border border-arena-border shadow-card select-none"
              onMouseLeave={() => { isDraggingRef.current = false; }}
              onMouseUp={() => { isDraggingRef.current = false; }}
            >
              <div 
                className="grid gap-2"
                style={{
                  gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`
                }}
              >
                {Array.from({ length: GRID_SIZE }).map((_, r) => 
                  Array.from({ length: GRID_SIZE }).map((_, c) => {
                    const obstacle = isObstacle(r, c);
                    const checkpoint = getCheckpointAt(r, c);
                    const pathIndex = isCellInPath(r, c);
                    const isInPath = pathIndex !== -1;
                    const isHead = path.length > 0 && path[path.length - 1].r === r && path[path.length - 1].c === c;
                    const isHint = hintCell && hintCell.r === r && hintCell.c === c;

                    let bgClass = 'bg-arena-elevated border-arena-border/60 hover:border-arena-borderHover';

                    if (obstacle) {
                      bgClass = 'bg-[#181D1F] border-[#252C2E] opacity-50 cursor-not-allowed';
                    } else if (isInPath) {
                      bgClass = isHead 
                        ? 'bg-arena-amber border-arena-amber text-[#141719] shadow-sm' 
                        : 'bg-arena-amber/25 border-arena-amber/60 text-arena-amber';
                    } else if (isHint) {
                      bgClass = 'bg-arena-teal/20 border-arena-teal animate-pulse';
                    }

                    return (
                      <button
                        key={`${r}-${c}`}
                        disabled={obstacle || isCompleted}
                        onMouseDown={() => {
                          isDraggingRef.current = true;
                          handleCellAction(r, c);
                        }}
                        onMouseEnter={() => {
                          if (isDraggingRef.current) {
                            handleCellAction(r, c);
                          }
                        }}
                        className={`w-11 h-11 sm:w-14 sm:h-14 rounded-xl border flex items-center justify-center font-bold text-base transition-all active:scale-95 relative group ${bgClass}`}
                      >
                        {/* Checkpoint Number badge */}
                        {checkpoint ? (
                          <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all ${
                            isInPath 
                              ? isHead 
                                ? 'bg-[#141719] text-arena-amber' 
                                : 'bg-arena-amber text-[#141719]' 
                              : 'bg-arena-surface border border-arena-border text-arena-textPrimary group-hover:border-arena-amber'
                          }`}>
                            {checkpoint.id}
                          </div>
                        ) : obstacle ? (
                          <div className="w-2.5 h-2.5 rounded-sm bg-arena-border/70" />
                        ) : isInPath && !isHead ? (
                          <div className="w-2.5 h-2.5 rounded-full bg-arena-amber" />
                        ) : null}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Quick action bar */}
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={handleHint}
                className="btn-secondary py-1.5 px-3.5 text-xs gap-1.5 font-medium"
              >
                <Sparkles className="w-3.5 h-3.5 text-arena-amber" />
                <span>Need a Hint</span>
              </button>
            </div>
          </div>

          {/* Right Panel: Live Stats & Personal Best (Desktop 3 Cols) */}
          <div className="lg:col-span-3 space-y-4 order-3">
            <div className="p-4 rounded-xl bg-arena-surface border border-arena-border space-y-3">
              <span className="text-[10px] uppercase font-semibold text-arena-textSubtle tracking-wider">
                CURRENT SESSION
              </span>

              <div className="grid grid-cols-2 lg:grid-cols-1 gap-2.5">
                <div className="p-2.5 rounded-lg bg-arena-elevated border border-arena-border">
                  <span className="text-[10px] text-arena-textSubtle block font-medium">TOTAL STEPS</span>
                  <div className="text-xl font-bold text-arena-textPrimary font-mono mt-0.5">{moveCount}</div>
                </div>

                <div className="p-2.5 rounded-lg bg-arena-elevated border border-arena-border">
                  <span className="text-[10px] text-arena-textSubtle block font-medium">COMPLETION</span>
                  <div className="text-xl font-bold text-arena-amber font-mono mt-0.5">
                    {Math.round((currentCheckpoint / checkpoints.length) * 100)}%
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-arena-surface border border-arena-border space-y-2">
              <span className="text-[10px] uppercase font-semibold text-arena-textSubtle tracking-wider">
                PERSONAL BEST
              </span>
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-arena-textSecondary">Record Time:</span>
                <span className="text-arena-teal font-mono">1m 24s</span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-arena-textSecondary">Active Streak:</span>
                <span className="text-arena-warning font-mono">{user.streak} Days</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* 3. HOW TO PLAY MODAL DRAWER */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-arena-bg/85 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-arena-surface border border-arena-border rounded-2xl p-6 space-y-4 shadow-card">
            <div className="flex items-center justify-between pb-3 border-b border-arena-border">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-arena-elevated border border-arena-border text-arena-amber flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-arena-textPrimary">How to Play Zip</h3>
              </div>
              <button 
                onClick={() => setShowHelp(false)}
                className="p-1 rounded-lg text-arena-textSecondary hover:text-arena-textPrimary hover:bg-arena-elevated"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-arena-textSecondary leading-relaxed">
              <div className="p-3 rounded-xl bg-arena-elevated border border-arena-border space-y-1">
                <div className="font-bold text-arena-textPrimary text-xs">1. Follow the Numbers</div>
                <p>Start at checkpoint <strong>1</strong> and draw a continuous orthogonal path to <strong>2</strong>, then <strong>3</strong>, all the way to <strong>6</strong>.</p>
              </div>

              <div className="p-3 rounded-xl bg-arena-elevated border border-arena-border space-y-1">
                <div className="font-bold text-arena-textPrimary text-xs">2. Movement Rules</div>
                <p>You can move Up, Down, Left, or Right to adjacent tiles. You cannot cross dark obstacle blocks or step on tiles already visited in your path.</p>
              </div>

              <div className="p-3 rounded-xl bg-arena-elevated border border-arena-border space-y-1">
                <div className="font-bold text-arena-textPrimary text-xs">3. Quick Undo & Rewind</div>
                <p>Click on any previously placed step in your path to immediately rewind the line back to that point, or use the Undo button.</p>
              </div>
            </div>

            <button
              onClick={() => setShowHelp(false)}
              className="w-full btn-primary py-2 text-xs font-semibold"
            >
              Got it, let's play
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

