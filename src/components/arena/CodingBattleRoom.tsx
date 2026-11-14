import React, { useState, useEffect, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { 
  ArrowLeft, 
  Play, 
  Send, 
  CheckCircle2, 
  XCircle, 
  Timer, 
  Swords, 
  Trophy, 
  Share2, 
  Copy, 
  Check, 
  Terminal, 
  Code2, 
  AlertCircle,
  Flag,
  RotateCcw,
  Maximize2,
  Minimize2,
  ChevronUp,
  ChevronDown,
  Info,
  Clock,
  Sparkles,
  Zap,
  ExternalLink,
  ShieldAlert,
  Flame,
  CheckCheck
} from 'lucide-react';
import { CodingProblem, BattleParticipant } from '../../types';
import { useApp } from '../../context/AppContext';
import { syncEngine } from '../../utils/syncEngine';
import { executeCode, ExecutionReport } from '../../utils/codeRunner';
import { sound } from '../../utils/sound';
import confetti from 'canvas-confetti';

interface CodingBattleRoomProps {
  battleId: string;
  problem: CodingProblem;
  onBack: () => void;
}

type SupportedLanguage = 'python' | 'javascript' | 'typescript' | 'cpp' | 'java';

export const CodingBattleRoom: React.FC<CodingBattleRoomProps> = ({
  battleId,
  problem,
  onBack
}) => {
  const { user, recordCodingBattleResult, openShareModal } = useApp();

  // Language & Code State
  const [language, setLanguage] = useState<SupportedLanguage>('python');
  const [code, setCode] = useState<string>(() => {
    return problem.starterCode.python || problem.starterCode.javascript;
  });

  // Battle Lifecycle State
  const [roomStatus, setRoomStatus] = useState<'lobby' | 'countdown' | 'battle' | 'ended'>('lobby');
  const [timeRemaining, setTimeRemaining] = useState<number>(900); // 15 mins default
  const [countdown, setCountdown] = useState<number | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [showForfeitModal, setShowForfeitModal] = useState<boolean>(false);

  // Participants & Synchronization State
  const [myReady, setMyReady] = useState<boolean>(false);
  const [opponent, setOpponent] = useState<BattleParticipant | null>(null);

  // Execution & Submissions State
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [execReport, setExecReport] = useState<ExecutionReport | null>(null);
  const [selectedTestCaseIdx, setSelectedTestCaseIdx] = useState<number>(0);
  const [isConsoleCollapsed, setIsConsoleCollapsed] = useState<boolean>(false);
  const [activeConsoleTab, setActiveConsoleTab] = useState<'cases' | 'output'>('cases');

  // Split-pane layout percentage (default 45% problem, 55% editor)
  const [splitPercent, setSplitPercent] = useState<number>(45);
  const [isDraggingSplitter, setIsDraggingSplitter] = useState<boolean>(false);

  const [mySubmission, setMySubmission] = useState<{
    passed: boolean;
    testsPassed: number;
    totalTests: number;
    timeTaken: number;
  } | null>(null);

  const [opponentSubmission, setOpponentSubmission] = useState<{
    passed: boolean;
    testsPassed: number;
    totalTests: number;
    timeTaken: number;
  } | null>(null);

  const [battleWinner, setBattleWinner] = useState<{
    winner: 'you' | 'opponent' | 'draw';
    reason: string;
    newRating: number;
    ratingDelta: number;
  } | null>(null);

  const startTimeRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle language switch and load template
  const handleLanguageChange = (newLang: SupportedLanguage) => {
    sound.playClick();
    setLanguage(newLang);
    const template = problem.starterCode[newLang] || problem.starterCode.javascript;
    setCode(template);
  };

  const handleResetCode = () => {
    sound.playClick();
    const template = problem.starterCode[language] || problem.starterCode.javascript;
    setCode(template);
  };

  // Draggable Splitter Implementation
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingSplitter || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newPercent = ((e.clientX - rect.left) / rect.width) * 100;
      // Clamp between 25% and 75%
      if (newPercent >= 25 && newPercent <= 75) {
        setSplitPercent(newPercent);
      }
    };

    const handleMouseUp = () => {
      if (isDraggingSplitter) {
        setIsDraggingSplitter(false);
      }
    };

    if (isDraggingSplitter) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingSplitter]);

  // Network sync engine listeners
  useEffect(() => {
    syncEngine.joinRoom(battleId, {
      id: user.id,
      username: user.username,
      avatar: user.avatar
    });

    const unsubJoin = syncEngine.on('join_battle', (data) => {
      if (data.user.id !== user.id) {
        setOpponent({
          id: data.user.id,
          username: data.user.username,
          avatar: data.user.avatar,
          rating: data.user.rating || 1200,
          isReady: false,
          status: 'idle',
          code: '',
          language: 'python',
          testsPassed: 0,
          totalTests: problem.testCases.length,
          hasPassedAll: false
        });
        sound.playCorrect();

        syncEngine.send('battle_ack', {
          user: {
            id: user.id,
            username: user.username,
            avatar: user.avatar,
            rating: user.rating
          }
        });
      }
    });

    const unsubAck = syncEngine.on('battle_ack', (data) => {
      if (data.user.id !== user.id) {
        setOpponent({
          id: data.user.id,
          username: data.user.username,
          avatar: data.user.avatar,
          rating: data.user.rating || 1200,
          isReady: false,
          status: 'idle',
          code: '',
          language: 'python',
          testsPassed: 0,
          totalTests: problem.testCases.length,
          hasPassedAll: false
        });
      }
    });

    const unsubReady = syncEngine.on('battle_ready', (data) => {
      if (data.userId !== user.id) {
        setOpponent(prev => prev ? { ...prev, isReady: data.ready } : null);
      }
    });

    const unsubStart = syncEngine.on('battle_start_signal', () => {
      startCountdown();
    });

    const unsubStatus = syncEngine.on('battle_status_update', (data) => {
      if (data.userId !== user.id) {
        setOpponent(prev => prev ? { 
          ...prev, 
          status: data.status, 
          testsPassed: data.testsPassed !== undefined ? data.testsPassed : prev.testsPassed 
        } : null);
      }
    });

    const unsubSubmit = syncEngine.on('battle_solution_submitted', (data) => {
      if (data.userId !== user.id) {
        setOpponentSubmission(data.submission);
        setOpponent(prev => prev ? { 
          ...prev, 
          status: 'submitted', 
          hasPassedAll: data.submission.passed,
          testsPassed: data.submission.testsPassed
        } : null);
      }
    });

    return () => {
      unsubJoin();
      unsubAck();
      unsubReady();
      unsubStart();
      unsubStatus();
      unsubSubmit();
      syncEngine.leaveRoom(battleId, user.id);
    };
  }, [battleId, user, problem]);

  const startCountdown = () => {
    setRoomStatus('countdown');
    let c = 3;
    setCountdown(c);
    sound.playCountdown();

    const interval = setInterval(() => {
      c--;
      if (c > 0) {
        setCountdown(c);
        sound.playCountdown();
      } else {
        clearInterval(interval);
        setCountdown(null);
        setRoomStatus('battle');
        startTimeRef.current = Date.now();
        sound.playGo();
      }
    }, 1000);
  };

  const handleToggleReady = () => {
    sound.playClick();
    const next = !myReady;
    setMyReady(next);
    syncEngine.send('battle_ready', { userId: user.id, ready: next });

    if (next && opponent?.isReady) {
      syncEngine.send('battle_start_signal', {});
      startCountdown();
    }
  };

  // Match countdown timer
  useEffect(() => {
    if (roomStatus !== 'battle') return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          evaluateFinalWinner(mySubmission, opponentSubmission);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [roomStatus, mySubmission, opponentSubmission]);

  const handleCodeChange = (newCode?: string) => {
    if (newCode !== undefined) {
      setCode(newCode);
      syncEngine.send('battle_status_update', {
        userId: user.id,
        status: 'typing'
      });
    }
  };

  // Run sample tests
  const handleRunSampleTests = async () => {
    sound.playClick();
    setIsRunning(true);
    setIsConsoleCollapsed(false);
    syncEngine.send('battle_status_update', { userId: user.id, status: 'running' });

    const report = await executeCode(problem, code, language, false);
    setExecReport(report);
    setIsRunning(false);

    if (report.allPassed) sound.playCorrect();
    else sound.playWrong();

    syncEngine.send('battle_status_update', {
      userId: user.id,
      status: 'idle',
      testsPassed: report.totalPassed
    });
  };

  // Submit against full test suite
  const handleSubmitSolution = async () => {
    sound.playClick();
    setIsSubmitting(true);
    setIsConsoleCollapsed(false);
    const timeSpent = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));

    const report = await executeCode(problem, code, language, true);
    setExecReport(report);
    setIsSubmitting(false);

    const sub = {
      passed: report.allPassed,
      testsPassed: report.totalPassed,
      totalTests: report.totalTests,
      timeTaken: timeSpent
    };

    setMySubmission(sub);

    syncEngine.send('battle_solution_submitted', {
      userId: user.id,
      submission: sub
    });

    if (report.allPassed) sound.playVictory();
    else sound.playWrong();

    if (opponentSubmission || report.allPassed) {
      evaluateFinalWinner(sub, opponentSubmission);
    }
  };

  // Handle Forfeit
  const handleForfeit = () => {
    sound.playClick();
    setShowForfeitModal(false);
    setRoomStatus('ended');

    const oppName = opponent?.username || 'Opponent';
    const oppRating = opponent?.rating || 1200;

    const { newRating, ratingDelta } = recordCodingBattleResult(
      'lost',
      oppName,
      oppRating,
      problem.title,
      `${mySubmission?.testsPassed || 0}/${problem.testCases.length}`,
      mySubmission?.timeTaken || 0
    );

    setBattleWinner({
      winner: 'opponent',
      reason: 'You forfeited the match.',
      newRating,
      ratingDelta
    });
  };

  // Winner evaluation
  const evaluateFinalWinner = (
    mySub: typeof mySubmission,
    oppSub: typeof opponentSubmission
  ) => {
    setRoomStatus('ended');

    let winner: 'you' | 'opponent' | 'draw' = 'draw';
    let reason = '';

    const oppRating = opponent ? opponent.rating : 1200;
    const oppName = opponent ? opponent.username : 'Opponent';

    if (mySub?.passed && !oppSub?.passed) {
      winner = 'you';
      reason = 'You solved all test cases first.';
    } else if (!mySub?.passed && oppSub?.passed) {
      winner = 'opponent';
      reason = `${oppName} solved all test cases.`;
    } else if (mySub?.passed && oppSub?.passed) {
      if (mySub.timeTaken < oppSub.timeTaken) {
        winner = 'you';
        reason = `Both solved correctly. You submitted ${oppSub.timeTaken - mySub.timeTaken}s faster.`;
      } else if (mySub.timeTaken > oppSub.timeTaken) {
        winner = 'opponent';
        reason = `Both solved correctly. ${oppName} submitted ${mySub.timeTaken - oppSub.timeTaken}s faster.`;
      } else {
        winner = 'draw';
        reason = 'Tied execution time and test case results.';
      }
    } else {
      const myCount = mySub?.testsPassed || 0;
      const oppCount = oppSub?.testsPassed || 0;
      if (myCount > oppCount) {
        winner = 'you';
        reason = `You passed more test cases (${myCount} vs ${oppCount}).`;
      } else if (oppCount > myCount) {
        winner = 'opponent';
        reason = `${oppName} passed more test cases (${oppCount} vs ${myCount}).`;
      } else {
        winner = 'draw';
        reason = `Equal test cases passed (${myCount}/${problem.testCases.length}).`;
      }
    }

    const { newRating, ratingDelta } = recordCodingBattleResult(
      winner === 'you' ? 'won' : winner === 'opponent' ? 'lost' : 'draw',
      oppName,
      oppRating,
      problem.title,
      `${mySub?.testsPassed || 0}/${problem.testCases.length}`,
      mySub?.timeTaken || 0
    );

    setBattleWinner({ winner, reason, newRating, ratingDelta });

    if (winner === 'you') {
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    }
  };

  const inviteUrl = `${window.location.origin}/app/arena?battle=${battleId}`;

  const handleCopyLink = () => {
    sound.playClick();
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Keyboard shortcuts (Cmd/Ctrl + Enter to run, Cmd/Ctrl + Shift + Enter to submit)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (e.shiftKey) {
          if (!isRunning && !isSubmitting && roomStatus === 'battle') {
            handleSubmitSolution();
          }
        } else {
          if (!isRunning && !isSubmitting && roomStatus === 'battle') {
            handleRunSampleTests();
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, isSubmitting, roomStatus, code, language]);

  const totalProblemTests = problem.testCases.length;
  const mySolvedCount = mySubmission ? mySubmission.testsPassed : (execReport?.totalPassed || 0);
  const oppSolvedCount = opponent ? (opponent.testsPassed || 0) : 0;

  return (
    <div className="h-full w-full flex flex-col bg-[#101314] text-[#F5F5F5] select-none overflow-hidden font-sans">
      
      {/* ============================================================== */}
      {/* A. COMPACT TOP MATCH HEADER (NeetCode Versus Style)             */}
      {/* ============================================================== */}
      <header className="h-12 bg-[#141A1C] border-b border-[#253033] px-4 flex items-center justify-between shrink-0 z-20">
        
        {/* Left Side: My Card & Stats */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs text-[#9BA8A8] hover:text-[#F5F5F5] transition-colors py-1 px-1.5 rounded hover:bg-[#1E272A]"
            title="Leave Match"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px] font-mono">Exit</span>
          </button>

          <div className="h-4 w-px bg-[#253033] hidden sm:block" />

          {/* User Status Pill */}
          <div className="flex items-center gap-2 bg-[#182023] border border-[#2B383C] px-2.5 py-1 rounded-lg">
            <img 
              src={user.avatar} 
              alt={user.displayName}
              className="w-5 h-5 rounded-full object-cover ring-1 ring-arena-amber/40"
            />
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-semibold text-white truncate max-w-[100px] sm:max-w-[130px]">
                {user.displayName}
              </span>
              <span className="text-[#9BA8A8] font-mono text-[11px] hidden md:inline">
                ({user.rating})
              </span>
            </div>

            <div className="h-3 w-px bg-[#2B383C] mx-0.5" />

            {/* Test Case Score */}
            <span className="text-[11px] font-mono font-bold text-arena-amber">
              {mySolvedCount}/{totalProblemTests} <span className="text-[10px] text-[#9BA8A8] font-normal hidden sm:inline">tests</span>
            </span>
          </div>
        </div>

        {/* Center: Match Countdown Timer & Status Badge */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#182023] border border-[#2B383C] shadow-inner font-mono">
            <Timer className={`w-3.5 h-3.5 ${timeRemaining < 120 ? 'text-red-400 animate-pulse' : 'text-arena-amber'}`} />
            <span className={`text-xs font-bold tracking-wider ${timeRemaining < 120 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
              {formatTimer(timeRemaining)}
            </span>
          </div>

          {/* Match Status Badge */}
          <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
            roomStatus === 'battle'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : roomStatus === 'lobby'
              ? 'bg-arena-amber/10 text-arena-amber border-arena-amber/30'
              : 'bg-zinc-800 text-zinc-400 border-zinc-700'
          }`}>
            {roomStatus === 'battle' ? 'LIVE' : roomStatus === 'lobby' ? 'WAITING' : 'FINISHED'}
          </span>
        </div>

        {/* Right Side: Opponent Card, Forfeit & Actions */}
        <div className="flex items-center gap-3">
          
          {/* Opponent Status Pill */}
          <div className="flex items-center gap-2 bg-[#182023] border border-[#2B383C] px-2.5 py-1 rounded-lg">
            <span className="text-[11px] font-mono font-bold text-[#9BA8A8]">
              {oppSolvedCount}/{totalProblemTests} <span className="text-[10px] font-normal hidden sm:inline">tests</span>
            </span>

            <div className="h-3 w-px bg-[#2B383C] mx-0.5" />

            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-semibold text-white truncate max-w-[90px] sm:max-w-[120px]">
                {opponent ? opponent.username : 'Searching...'}
              </span>
              {opponent && (
                <span className="text-[#9BA8A8] font-mono text-[11px] hidden md:inline">
                  ({opponent.rating})
                </span>
              )}
            </div>

            <img 
              src={opponent ? opponent.avatar : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'} 
              alt="Opponent"
              className={`w-5 h-5 rounded-full object-cover ring-1 ${opponent ? 'ring-emerald-500/40' : 'ring-zinc-700 opacity-60'}`}
            />
          </div>

          {/* Forfeit action button */}
          {roomStatus === 'battle' && (
            <button
              onClick={() => setShowForfeitModal(true)}
              className="text-[#9BA8A8] hover:text-red-400 p-1.5 rounded hover:bg-[#1E272A] transition-colors"
              title="Forfeit Match"
            >
              <Flag className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Share room invite during lobby */}
          {roomStatus === 'lobby' && (
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-[#182023] hover:bg-[#1F292D] border border-[#2B383C] text-arena-amber transition-colors"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied' : 'Invite'}</span>
            </button>
          )}

        </div>

      </header>

      {/* ============================================================== */}
      {/* LOBBY / OPPONENT DISCOVERY BAR (When waiting for ready)       */}
      {/* ============================================================== */}
      {roomStatus === 'lobby' && (
        <div className="bg-[#161C1F] border-b border-[#253033] px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-arena-amber opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-arena-amber" />
            </span>
            <div className="text-[11px] text-[#9BA8A8]">
              {opponent ? (
                <span>
                  <strong className="text-white font-mono">@{opponent.username}</strong> joined the room.{' '}
                  {opponent.isReady ? (
                    <span className="text-emerald-400 font-semibold">Opponent is ready!</span>
                  ) : (
                    <span>Waiting for opponent to ready up.</span>
                  )}
                </span>
              ) : (
                <span>Invite code: <strong className="text-white font-mono bg-[#101314] px-1.5 py-0.5 rounded border border-[#2B383C]">{battleId}</strong> • Share with a friend or test in another window.</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleReady}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all duration-200 ${
                myReady
                  ? 'bg-emerald-500 text-zinc-950 font-bold shadow-[0_0_12px_rgba(34,197,94,0.3)]'
                  : 'bg-arena-amber hover:bg-arena-amberHover text-zinc-950 font-bold'
              }`}
            >
              {myReady ? '✓ Ready (Waiting)' : 'Ready Up'}
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* COUNTDOWN OVERLAY                                              */}
      {/* ============================================================== */}
      {countdown !== null && (
        <div className="absolute inset-0 z-50 bg-[#101314]/90 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in">
          <span className="text-[11px] font-mono font-bold text-arena-amber uppercase tracking-widest mb-2">
            MATCH STARTS IN
          </span>
          <div className="text-8xl font-black font-mono text-white animate-pulse">
            {countdown}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* B. MAIN 2-COLUMN SPLIT WORKSPACE (Problem 45% | Editor 55%)   */}
      {/* ============================================================== */}
      <div 
        ref={containerRef}
        className="flex-1 flex flex-col md:flex-row overflow-hidden relative"
      >
        
        {/* ============================================================ */}
        {/* LEFT PANEL — PROBLEM STATEMENT (45%)                          */}
        {/* ============================================================ */}
        <section 
          style={{ width: `${splitPercent}%` }}
          className="h-full flex flex-col bg-[#141A1C] border-r border-[#253033] min-w-[280px] overflow-hidden"
        >
          {/* Panel Header */}
          <div className="h-10 px-4 bg-[#161D20] border-b border-[#253033] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-arena-amber" />
                <span>{problem.title}</span>
              </span>
              <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                problem.difficulty === 'Easy'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : problem.difficulty === 'Medium'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-red-500/10 text-red-400 border-red-500/30'
              }`}>
                {problem.difficulty}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#101314] text-[#9BA8A8] border border-[#253033]">
                {problem.category}
              </span>
            </div>
          </div>

          {/* Problem Statement Content (Independent Scroll) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs text-[#9BA8A8] leading-relaxed selection:bg-arena-amber/20">
            
            {/* Description */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-white">
                Problem Description
              </h4>
              <p className="whitespace-pre-line text-[#CBD5E1] font-sans text-xs leading-relaxed">
                {problem.description}
              </p>
            </div>

            {/* Input & Output Format */}
            <div className="p-3 rounded-lg bg-[#101314] border border-[#253033] space-y-2 font-mono text-[11px]">
              <div className="flex items-start gap-2">
                <span className="text-arena-amber font-semibold shrink-0">Input:</span>
                <span className="text-[#CBD5E1] font-sans">
                  Target function arguments provided according to problem signature.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-400 font-semibold shrink-0">Output:</span>
                <span className="text-[#CBD5E1] font-sans">
                  Return value matching the expected solution signature.
                </span>
              </div>
            </div>

            {/* Examples */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-white">
                Examples
              </h4>
              
              <div className="space-y-2.5">
                {problem.examples.map((ex, idx) => (
                  <div 
                    key={idx}
                    className="p-3 rounded-lg bg-[#101314] border border-[#253033] font-mono text-[11px] space-y-1.5"
                  >
                    <div className="text-[10px] font-bold text-[#9BA8A8] uppercase tracking-wider">
                      Example {idx + 1}
                    </div>
                    <div>
                      <span className="text-[#9BA8A8]">Input: </span>
                      <span className="text-white font-medium">{ex.input}</span>
                    </div>
                    <div>
                      <span className="text-[#9BA8A8]">Output: </span>
                      <span className="text-emerald-400 font-medium">{ex.output}</span>
                    </div>
                    {ex.explanation && (
                      <div className="text-[11px] text-[#94A3B8] font-sans pt-1 border-t border-[#1C2426]">
                        <span className="font-semibold text-white">Explanation: </span>
                        {ex.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Constraints */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-white">
                Constraints
              </h4>
              <ul className="list-disc list-inside space-y-1 text-[11px] font-mono text-[#CBD5E1] bg-[#101314] p-3 rounded-lg border border-[#253033]">
                {problem.constraints.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>

            {/* Opponent Realtime Telemetry Card */}
            {opponent && (
              <div className="p-3 rounded-lg bg-[#161D20] border border-[#253033] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] text-[#9BA8A8]">Opponent Status:</span>
                </div>
                <div className="font-mono text-[11px] font-semibold text-white">
                  {opponent.status === 'typing' && <span className="text-amber-400">Typing code...</span>}
                  {opponent.status === 'running' && <span className="text-cyan-400">Running tests...</span>}
                  {opponent.status === 'submitted' && <span className="text-emerald-400">Solution submitted!</span>}
                  {(!opponent.status || opponent.status === 'idle') && (
                    <span className="text-[#9BA8A8]">{opponent.testsPassed || 0}/{totalProblemTests} passed</span>
                  )}
                </div>
              </div>
            )}

          </div>
        </section>

        {/* ============================================================ */}
        {/* DRAGGABLE RESIZER HANDLE                                      */}
        {/* ============================================================ */}
        <div
          onMouseDown={() => setIsDraggingSplitter(true)}
          className={`w-1 cursor-col-resize hover:bg-arena-amber bg-[#253033] transition-colors relative z-10 shrink-0 ${
            isDraggingSplitter ? 'bg-arena-amber' : ''
          }`}
          title="Drag to resize panels"
        />

        {/* ============================================================ */}
        {/* RIGHT PANEL — CODE EDITOR & CONSOLE (55%)                     */}
        {/* ============================================================ */}
        <section 
          style={{ width: `${100 - splitPercent}%` }}
          className="h-full flex flex-col bg-[#101314] min-w-[320px] overflow-hidden"
        >
          {/* Top Editor Control Toolbar */}
          <div className="h-10 px-3 bg-[#141A1C] border-b border-[#253033] flex items-center justify-between shrink-0">
            
            {/* Left: Language Selection */}
            <div className="flex items-center gap-2">
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
                className="bg-[#182023] border border-[#2B383C] text-white text-xs font-mono rounded px-2.5 py-1 focus:outline-none focus:border-arena-amber cursor-pointer"
              >
                <option value="python">Python 3</option>
                <option value="javascript">JavaScript (ES6)</option>
                <option value="typescript">TypeScript</option>
                <option value="cpp">C++ (GCC)</option>
                <option value="java">Java (OpenJDK)</option>
              </select>

              <button
                onClick={handleResetCode}
                title="Reset code template"
                className="p-1 rounded text-[#9BA8A8] hover:text-white hover:bg-[#1E272A] transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Right: Run & Submit Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Run Button (Ctrl+Enter) */}
              <button
                onClick={handleRunSampleTests}
                disabled={isRunning || isSubmitting || roomStatus !== 'battle'}
                title="Run Sample Test Cases (Ctrl + Enter)"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#1F272A] hover:bg-[#283236] text-white text-xs font-mono font-semibold border border-[#344247] transition-all disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 text-emerald-400 fill-current" />
                <span>{isRunning ? 'Running...' : 'Run'}</span>
                <span className="text-[10px] text-[#9BA8A8] hidden lg:inline font-mono">⌘↵</span>
              </button>

              {/* Submit Button (Ctrl+Shift+Enter) */}
              <button
                onClick={handleSubmitSolution}
                disabled={isRunning || isSubmitting || roomStatus !== 'battle' || mySubmission?.passed}
                title="Submit Solution against All Test Cases"
                className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  mySubmission?.passed
                    ? 'bg-emerald-500 text-zinc-950 shadow-[0_0_12px_rgba(34,197,94,0.35)]'
                    : 'bg-arena-amber hover:bg-arena-amberHover text-zinc-950 disabled:opacity-50'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Zap className="w-3.5 h-3.5 animate-spin" />
                    <span>Judging...</span>
                  </>
                ) : mySubmission?.passed ? (
                  <>
                    <CheckCheck className="w-3.5 h-3.5 text-zinc-950" />
                    <span>Accepted</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 text-zinc-950" />
                    <span>Submit</span>
                    <span className="text-[10px] text-zinc-900/80 hidden lg:inline font-mono">⇧⌘↵</span>
                  </>
                )}
              </button>
            </div>

          </div>

          {/* Monaco Code Editor Canvas */}
          <div className="flex-1 min-h-[160px] relative">
            <Editor
              height="100%"
              theme="vs-dark"
              language={
                language === 'python' 
                  ? 'python' 
                  : language === 'cpp' 
                  ? 'cpp' 
                  : language === 'java' 
                  ? 'java' 
                  : language === 'typescript' 
                  ? 'typescript' 
                  : 'javascript'
              }
              value={code}
              onChange={handleCodeChange}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: 'JetBrains Mono, Menlo, Monaco, Consolas, monospace',
                lineNumbers: 'on',
                glyphMargin: false,
                folding: true,
                lineDecorationsWidth: 8,
                lineNumbersMinChars: 3,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                smoothScrolling: true,
                padding: { top: 12, bottom: 12 },
                renderLineHighlight: 'line',
                renderWhitespace: 'selection',
                readOnly: roomStatus === 'countdown'
              }}
            />
          </div>

          {/* ============================================================ */}
          {/* C. COLLAPSIBLE BOTTOM CONSOLE / TEST RESULTS                  */}
          {/* ============================================================ */}
          <div className={`bg-[#141A1C] border-t border-[#253033] flex flex-col transition-all duration-200 ${
            isConsoleCollapsed ? 'h-9' : 'h-56'
          }`}>
            
            {/* Console Bar Header */}
            <div className="h-9 px-3 bg-[#161D20] border-b border-[#253033] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsConsoleCollapsed(!isConsoleCollapsed)}
                  className="flex items-center gap-1.5 text-xs font-mono font-semibold text-[#9BA8A8] hover:text-white"
                >
                  <Terminal className="w-3.5 h-3.5 text-arena-amber" />
                  <span>Test Results</span>
                  {isConsoleCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {!isConsoleCollapsed && execReport && (
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                      execReport.allPassed 
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-red-500/15 text-red-400 border border-red-500/30'
                    }`}>
                      {execReport.allPassed ? 'Accepted' : 'Wrong Answer'} ({execReport.totalPassed}/{execReport.totalTests})
                    </span>
                    <span className="text-[10px] font-mono text-[#9BA8A8]">
                      Runtime: {execReport.totalTimeMs} ms
                    </span>
                  </div>
                )}
              </div>

              {/* Console Tabs */}
              {!isConsoleCollapsed && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setActiveConsoleTab('cases')}
                    className={`px-2.5 py-0.5 text-xs font-mono rounded ${
                      activeConsoleTab === 'cases' 
                        ? 'bg-[#20292D] text-white font-semibold' 
                        : 'text-[#9BA8A8] hover:text-white'
                    }`}
                  >
                    Test Cases
                  </button>
                  <button
                    onClick={() => setActiveConsoleTab('output')}
                    className={`px-2.5 py-0.5 text-xs font-mono rounded ${
                      activeConsoleTab === 'output' 
                        ? 'bg-[#20292D] text-white font-semibold' 
                        : 'text-[#9BA8A8] hover:text-white'
                    }`}
                  >
                    Console Output
                  </button>
                </div>
              )}
            </div>

            {/* Console Body */}
            {!isConsoleCollapsed && (
              <div className="flex-1 overflow-y-auto p-3 text-xs font-mono bg-[#101314]">
                
                {/* Empty State */}
                {!execReport ? (
                  <div className="h-full flex flex-col items-center justify-center text-[#9BA8A8] space-y-1">
                    <p className="text-xs font-sans">Click "Run" to test your solution against example inputs.</p>
                    <p className="text-[11px] text-[#64748B]">Or click "Submit" to run against all hidden test cases.</p>
                  </div>
                ) : execReport.compileError ? (
                  /* Error Alert */
                  <div className="p-3 rounded-lg bg-red-950/30 border border-red-800/40 text-red-400 space-y-1.5 font-mono">
                    <div className="flex items-center gap-1.5 font-bold">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <span>Compilation / Runtime Error</span>
                    </div>
                    <pre className="text-[11px] whitespace-pre-wrap text-red-300 bg-[#0A0D0E] p-2 rounded border border-red-900/40">
                      {execReport.compileError}
                    </pre>
                  </div>
                ) : activeConsoleTab === 'cases' ? (
                  /* Test Cases View */
                  <div className="space-y-3">
                    {/* Test Case Selection Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                      {execReport.results.map((tc, idx) => (
                        <button
                          key={tc.index}
                          onClick={() => setSelectedTestCaseIdx(idx)}
                          className={`px-2.5 py-1 rounded text-xs font-mono flex items-center gap-1.5 border transition-all ${
                            selectedTestCaseIdx === idx
                              ? 'bg-[#1C2528] text-white border-arena-amber font-semibold shadow-sm'
                              : 'bg-[#141A1C] text-[#9BA8A8] border-[#253033] hover:text-white'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${tc.passed ? 'bg-emerald-400' : 'bg-red-400'}`} />
                          <span>Case {tc.index}</span>
                        </button>
                      ))}
                    </div>

                    {/* Selected Test Case Detail */}
                    {execReport.results[selectedTestCaseIdx] && (
                      (() => {
                        const tc = execReport.results[selectedTestCaseIdx];
                        return (
                          <div className="p-3 rounded-lg bg-[#141A1C] border border-[#253033] space-y-2">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className={`font-semibold flex items-center gap-1.5 ${tc.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                                {tc.passed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                <span>{tc.passed ? 'Passed' : 'Failed'} {tc.isHidden && '(Hidden Test Case)'}</span>
                              </span>
                              <span className="text-[#9BA8A8] font-mono">{tc.executionTimeMs} ms</span>
                            </div>

                            <div className="space-y-1.5 text-[11px]">
                              <div>
                                <span className="text-[#9BA8A8] block text-[10px] uppercase font-bold tracking-wider">Input</span>
                                <div className="bg-[#101314] px-2 py-1 rounded border border-[#253033] text-white">
                                  {JSON.stringify(tc.input)}
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                <div>
                                  <span className="text-[#9BA8A8] block text-[10px] uppercase font-bold tracking-wider">Expected Output</span>
                                  <div className="bg-[#101314] px-2 py-1 rounded border border-[#253033] text-emerald-400">
                                    {JSON.stringify(tc.expected)}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-[#9BA8A8] block text-[10px] uppercase font-bold tracking-wider">Actual Output</span>
                                  <div className={`bg-[#101314] px-2 py-1 rounded border border-[#253033] ${tc.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {tc.actual === undefined ? 'undefined' : JSON.stringify(tc.actual)}
                                  </div>
                                </div>
                              </div>

                              {tc.error && (
                                <div className="pt-1">
                                  <span className="text-red-400 block text-[10px] uppercase font-bold tracking-wider">Error Details</span>
                                  <div className="bg-red-950/30 text-red-300 p-2 rounded border border-red-900/40">
                                    {tc.error}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()
                    )}

                  </div>
                ) : (
                  /* Raw Console Log Output */
                  <div className="p-2 space-y-1 font-mono text-[11px] text-[#CBD5E1]">
                    {execReport.results.flatMap(r => r.logs || []).length === 0 ? (
                      <span className="text-[#64748B] italic">No console logs output during execution.</span>
                    ) : (
                      execReport.results.flatMap((r, i) => 
                        (r.logs || []).map((log, li) => (
                          <div key={`${i}-${li}`} className="text-[#CBD5E1]">
                            <span className="text-arena-amber">[Case {r.index}]</span> {log}
                          </div>
                        ))
                      )
                    )}
                  </div>
                )}

              </div>
            )}

          </div>

        </section>

      </div>

      {/* ============================================================== */}
      {/* FORFEIT CONFIRMATION MODAL                                      */}
      {/* ============================================================== */}
      {showForfeitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-[#161C1F] border border-[#2B383C] rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center">
                <Flag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Forfeit Match?</h3>
                <p className="text-xs text-[#9BA8A8]">Surrendering will grant the win to your opponent and deduce Elo rating.</p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowForfeitModal(false)}
                className="flex-1 py-1.5 rounded-lg bg-[#20292D] hover:bg-[#283236] text-white text-xs font-semibold"
              >
                Continue Playing
              </button>
              <button
                onClick={handleForfeit}
                className="flex-1 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold"
              >
                Yes, Forfeit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. MATCH COMPLETION SCREEN (Head-to-head NeetCode Versus style)*/}
      {/* ============================================================== */}
      {battleWinner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg bg-[#141A1C] border border-[#2B383C] rounded-2xl p-6 space-y-6 text-center shadow-2xl">
            
            {/* Outcome Icon & Title */}
            <div className="space-y-2">
              <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center mx-auto shadow-lg ${
                battleWinner.winner === 'you'
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-[0_0_24px_rgba(34,197,94,0.3)]'
                  : battleWinner.winner === 'opponent'
                  ? 'bg-red-500/15 border-red-500/40 text-red-400'
                  : 'bg-amber-500/15 border-amber-500/40 text-amber-400'
              }`}>
                <Trophy className="w-7 h-7" />
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-[#9BA8A8]">
                  MATCH CONCLUDED
                </span>
                <h2 className={`text-2xl font-black tracking-tight mt-0.5 ${
                  battleWinner.winner === 'you' 
                    ? 'text-emerald-400' 
                    : battleWinner.winner === 'opponent' 
                    ? 'text-red-400' 
                    : 'text-amber-400'
                }`}>
                  {battleWinner.winner === 'you' ? 'Victory' : battleWinner.winner === 'opponent' ? 'Defeat' : 'Draw'}
                </h2>
                <p className="text-xs text-[#9BA8A8] mt-1 max-w-md mx-auto">
                  {battleWinner.reason}
                </p>
              </div>
            </div>

            {/* Head-to-Head Comparison Card */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-[#101314] border border-[#253033]">
              
              {/* You Card */}
              <div className="space-y-2 text-left p-2.5 rounded-lg bg-[#161D20] border border-[#253033]">
                <div className="flex items-center gap-2">
                  <img 
                    src={user.avatar} 
                    alt={user.displayName}
                    className="w-6 h-6 rounded-full object-cover ring-1 ring-arena-amber"
                  />
                  <div>
                    <div className="text-xs font-bold text-white truncate">{user.displayName}</div>
                    <div className="text-[10px] font-mono text-[#9BA8A8]">YOU</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#253033] space-y-1 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-[#9BA8A8]">Tests Passed:</span>
                    <span className="font-bold text-white">{mySubmission?.testsPassed || 0}/{totalProblemTests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9BA8A8]">Time:</span>
                    <span className="text-white">{mySubmission?.timeTaken || 0}s</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-[#9BA8A8]">Rating:</span>
                    <span className={`font-bold ${battleWinner.ratingDelta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {battleWinner.ratingDelta >= 0 ? `+${battleWinner.ratingDelta}` : battleWinner.ratingDelta} ({battleWinner.newRating})
                    </span>
                  </div>
                </div>
              </div>

              {/* Opponent Card */}
              <div className="space-y-2 text-left p-2.5 rounded-lg bg-[#161D20] border border-[#253033]">
                <div className="flex items-center gap-2">
                  <img 
                    src={opponent ? opponent.avatar : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'} 
                    alt="Opponent"
                    className="w-6 h-6 rounded-full object-cover ring-1 ring-zinc-700"
                  />
                  <div>
                    <div className="text-xs font-bold text-white truncate">{opponent ? opponent.username : 'Opponent'}</div>
                    <div className="text-[10px] font-mono text-[#9BA8A8]">OPPONENT</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#253033] space-y-1 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-[#9BA8A8]">Tests Passed:</span>
                    <span className="font-bold text-white">{opponent?.testsPassed || 0}/{totalProblemTests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9BA8A8]">Time:</span>
                    <span className="text-white">{opponentSubmission?.timeTaken || (timeRemaining < 1 ? '15m 00s' : '—')}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-[#9BA8A8]">Rating:</span>
                    <span className="font-bold text-[#9BA8A8]">{opponent ? opponent.rating : 1200} Elo</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Actions: Rematch, Share on LinkedIn, Exit */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={() => {
                  sound.playClick();
                  setRoomStatus('lobby');
                  setBattleWinner(null);
                  setMySubmission(null);
                  setOpponentSubmission(null);
                  setExecReport(null);
                  setMyReady(false);
                }}
                className="flex-1 py-2 rounded-xl bg-[#20292D] hover:bg-[#283236] text-white text-xs font-semibold font-mono border border-[#344247] transition-colors"
              >
                Rematch
              </button>

              <button
                onClick={() => {
                  openShareModal({
                    title: 'Coding Battle Victory',
                    gameOrBattle: `1v1 Battle on ${problem.title}`,
                    scoreOrResult: battleWinner.winner === 'you' ? 'Victory' : 'Competed',
                    isBattle: true,
                    problemTitle: problem.title,
                    opponentName: opponent?.username || 'Opponent',
                    battleResult: battleWinner.winner === 'you' ? 'Win' : 'Loss',
                    executionTime: `${mySubmission?.timeTaken || 12}s`,
                    testCasesPassed: `${mySubmission?.testsPassed || totalProblemTests}/${totalProblemTests}`,
                    ratingChange: battleWinner.ratingDelta,
                    subtitle: `${battleWinner.ratingDelta > 0 ? `+${battleWinner.ratingDelta}` : battleWinner.ratingDelta} Elo • ${mySubmission?.testsPassed || 0}/${totalProblemTests} Tests`,
                    customStats: [
                      { label: 'Rating', value: `${battleWinner.newRating} Elo` },
                      { label: 'Time', value: `${mySubmission?.timeTaken || 0}s` },
                      { label: 'Tests', value: `${mySubmission?.testsPassed || 0}/${totalProblemTests}` }
                    ]
                  });
                }}
                className="flex-1 py-2 rounded-xl bg-arena-amber hover:bg-arena-amberHover text-zinc-950 text-xs font-bold font-mono transition-colors flex items-center justify-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5 text-zinc-950" />
                <span>Share Card</span>
              </button>

              <button
                onClick={onBack}
                className="py-2 px-3 rounded-xl bg-[#141A1C] hover:bg-[#1E2528] text-[#9BA8A8] hover:text-white text-xs font-mono border border-[#253033] transition-colors"
              >
                Exit
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
