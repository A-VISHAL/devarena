import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { 
  ArrowLeft, 
  Play, 
  Send, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Timer, 
  Swords, 
  Trophy, 
  Share2, 
  Copy, 
  Check, 
  Users, 
  AlertCircle,
  Terminal,
  Code2,
  Sparkles
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

export const CodingBattleRoom: React.FC<CodingBattleRoomProps> = ({
  battleId,
  problem,
  onBack
}) => {
  const { user, recordCodingBattleResult, openShareModal } = useApp();

  // Language & Code state
  const [language, setLanguage] = useState<'javascript' | 'typescript' | 'python'>('javascript');
  const [code, setCode] = useState<string>(problem.starterCode.javascript);

  // Match & Lobby state
  const [roomStatus, setRoomStatus] = useState<'lobby' | 'countdown' | 'battle' | 'ended'>('lobby');
  const [timeRemaining, setTimeRemaining] = useState<number>(900); // 15 mins
  const [countdown, setCountdown] = useState<number | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Participants
  const [myReady, setMyReady] = useState<boolean>(false);
  const [opponent, setOpponent] = useState<BattleParticipant | null>(null);

  // Execution & Submission
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [execReport, setExecReport] = useState<ExecutionReport | null>(null);
  const [mySubmission, setMySubmission] = useState<{
    passed: boolean;
    testsPassed: number;
    totalTests: number;
    timeTaken: number;
  } | null>(null);

  // Opponent submission
  const [opponentSubmission, setOpponentSubmission] = useState<{
    passed: boolean;
    testsPassed: number;
    totalTests: number;
    timeTaken: number;
  } | null>(null);

  // Final Battle Result
  const [battleWinner, setBattleWinner] = useState<{
    winner: 'you' | 'opponent' | 'draw';
    reason: string;
    newRating: number;
    ratingDelta: number;
  } | null>(null);

  const startTimeRef = useRef<number>(0);

  // Update starter code when language switches
  const handleLanguageChange = (newLang: 'javascript' | 'typescript' | 'python') => {
    sound.playClick();
    setLanguage(newLang);
    setCode(problem.starterCode[newLang]);
  };

  // Sync Engine Setup
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
          language: 'javascript',
          testsPassed: 0,
          totalTests: problem.testCases.length,
          hasPassedAll: false
        });
        sound.playCorrect();

        // Acknowledge back
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
          language: 'javascript',
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
          testsPassed: data.testsPassed || prev.testsPassed 
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

  // Timer during active battle
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

  // Code editor keystroke listener to sync typing status
  const handleCodeChange = (newCode?: string) => {
    if (newCode !== undefined) {
      setCode(newCode);
      syncEngine.send('battle_status_update', {
        userId: user.id,
        status: 'typing'
      });
    }
  };

  // Run Sample Tests (Visible test cases only)
  const handleRunSampleTests = async () => {
    sound.playClick();
    setIsRunning(true);
    syncEngine.send('battle_status_update', { userId: user.id, status: 'running' });

    const report = await executeCode(problem, code, language, false);
    setExecReport(report);
    setIsRunning(false);

    if (report.allPassed) {
      sound.playCorrect();
    } else {
      sound.playWrong();
    }

    syncEngine.send('battle_status_update', {
      userId: user.id,
      status: 'idle',
      testsPassed: report.totalPassed
    });
  };

  // Submit Solution (Judges against ALL test cases including hidden)
  const handleSubmitSolution = async () => {
    sound.playClick();
    setIsSubmitting(true);
    const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);

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

    if (report.allPassed) {
      sound.playVictory();
    } else {
      sound.playWrong();
    }

    // Check if battle should conclude
    if (opponentSubmission || report.allPassed) {
      evaluateFinalWinner(sub, opponentSubmission);
    }
  };

  // Final winner evaluation using official rules
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
      reason = 'You solved all test cases first!';
    } else if (!mySub?.passed && oppSub?.passed) {
      winner = 'opponent';
      reason = `${oppName} solved all test cases!`;
    } else if (mySub?.passed && oppSub?.passed) {
      // Both passed: fastest submission wins!
      if (mySub.timeTaken < oppSub.timeTaken) {
        winner = 'you';
        reason = `Both solved correctly! You submitted ${oppSub.timeTaken - mySub.timeTaken}s faster.`;
      } else if (mySub.timeTaken > oppSub.timeTaken) {
        winner = 'opponent';
        reason = `Both solved correctly! ${oppName} submitted ${mySub.timeTaken - oppSub.timeTaken}s faster.`;
      } else {
        winner = 'draw';
        reason = 'Tied execution time and test results!';
      }
    } else {
      // Neither passed all: most test cases passed wins
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
      confetti({ particleCount: 100, spread: 80 });
    }
  };

  const inviteUrl = `${window.location.origin}/?battle=${battleId}`;

  const handleCopyLink = () => {
    sound.playClick();
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-arena-bg">
      {/* Top Battle Header */}
      <div className="h-14 px-4 bg-arena-surface border-b border-arena-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Exit Arena</span>
          </button>
          <div className="h-4 w-px bg-slate-800" />
          <h2 className="font-extrabold text-sm text-white flex items-center gap-2">
            <span>{problem.title}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              problem.difficulty === 'Easy' 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : problem.difficulty === 'Medium'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
            }`}>
              {problem.difficulty}
            </span>
          </h2>
        </div>

        {/* Center Countdown / Timer */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 font-mono text-sm font-bold">
          <Timer className="w-4 h-4 text-cyan-400" />
          <span className={timeRemaining < 120 ? 'text-rose-400 animate-pulse' : 'text-slate-200'}>
            {formatTimer(timeRemaining)}
          </span>
        </div>

        {/* Right Status Actions */}
        <div className="flex items-center gap-2">
          {roomStatus === 'lobby' && (
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Link Copied' : 'Invite Friend'}</span>
            </button>
          )}

          {roomStatus === 'battle' && (
            <>
              <button
                onClick={handleRunSampleTests}
                disabled={isRunning || isSubmitting}
                className="btn-secondary py-1.5 px-3 text-xs gap-1.5"
              >
                <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                <span>{isRunning ? 'Running...' : 'Run Tests'}</span>
              </button>
              <button
                onClick={handleSubmitSolution}
                disabled={isRunning || isSubmitting || mySubmission?.passed}
                className="btn-primary py-1.5 px-3.5 text-xs gap-1.5 font-bold"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Judging...' : mySubmission?.passed ? 'Passed ✓' : 'Submit'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* LOBBY / PRE-MATCH BANNER */}
      {roomStatus === 'lobby' && (
        <div className="p-4 bg-gradient-to-r from-violet-950/60 via-slate-900 to-cyan-950/60 border-b border-violet-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-400">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-white">Live 1v1 Battle Lobby</div>
              <p className="text-xs text-slate-400">
                {opponent 
                  ? `${opponent.username} is connected! Click "Ready Up" when prepared.` 
                  : 'Share the battle link with a friend or test in a second tab!'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleToggleReady}
              className={`flex-1 sm:flex-none px-5 py-2 rounded-xl text-xs font-extrabold transition-all ${
                myReady 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' 
                  : 'btn-primary'
              }`}
            >
              {myReady ? '✓ You Are Ready' : 'Ready Up'}
            </button>
          </div>
        </div>
      )}

      {/* COUNTDOWN OVERLAY */}
      {countdown !== null && (
        <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in">
          <span className="text-xs font-black text-cyan-400 uppercase tracking-widest mb-2">
            BATTLE STARTING
          </span>
          <div className="text-8xl font-black text-white font-mono animate-bounce">
            {countdown}
          </div>
        </div>
      )}

      {/* MAIN SPLIT VIEW */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Left Panel: Problem Statement & Opponent Live Radar */}
        <div className="w-full lg:w-5/12 border-r border-arena-border flex flex-col overflow-y-auto bg-arena-bg">
          
          {/* Opponent Live Status Bar */}
          <div className="p-3.5 bg-arena-surface border-b border-arena-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <img 
                  src={opponent ? opponent.avatar : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'} 
                  alt="" 
                  className="w-8 h-8 rounded-full object-cover border border-cyan-500/50" 
                />
                <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${
                  opponent ? 'bg-emerald-400' : 'bg-slate-600'
                }`} />
              </div>
              <div>
                <div className="font-bold text-xs text-white">
                  {opponent ? opponent.username : 'Waiting for opponent...'}
                </div>
                <div className="text-[10px] text-slate-400">
                  {opponent ? `${opponent.rating} Elo` : 'Share invite code'}
                </div>
              </div>
            </div>

            <div className="text-right">
              {opponent?.status === 'typing' && (
                <span className="text-[11px] font-semibold text-violet-400 animate-pulse">Typing code...</span>
              )}
              {opponent?.status === 'running' && (
                <span className="text-[11px] font-semibold text-amber-400">Running tests...</span>
              )}
              {opponent?.status === 'submitted' && (
                <span className="text-[11px] font-bold text-emerald-400">Submitted solution!</span>
              )}
              {(!opponent?.status || opponent?.status === 'idle') && (
                <span className="text-[11px] text-slate-500">
                  {opponent ? `Passed ${opponent.testsPassed}/${problem.testCases.length} tests` : 'Offline'}
                </span>
              )}
            </div>
          </div>

          {/* Problem Statement Content */}
          <div className="p-5 space-y-5 text-sm text-slate-300">
            <div>
              <h3 className="font-bold text-white text-base mb-2">Description</h3>
              <p className="whitespace-pre-line leading-relaxed text-slate-300 text-xs sm:text-sm">
                {problem.description}
              </p>
            </div>

            {/* Examples */}
            <div>
              <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-2.5">
                Examples
              </h4>
              <div className="space-y-3">
                {problem.examples.map((ex, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs space-y-1">
                    <div>
                      <span className="text-slate-500">Input: </span>
                      <span className="text-slate-200">{ex.input}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Output: </span>
                      <span className="text-emerald-400">{ex.output}</span>
                    </div>
                    {ex.explanation && (
                      <div className="text-[11px] text-slate-400 font-sans pt-1">
                        {ex.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Constraints */}
            <div>
              <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-2">
                Constraints
              </h4>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-400 font-mono">
                {problem.constraints.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right Panel: Code Editor & Console Output */}
        <div className="w-full lg:w-7/12 flex flex-col bg-[#1e1e1e]">
          
          {/* Editor Sub-header */}
          <div className="h-10 px-4 bg-[#252526] border-b border-[#333333] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1 text-xs font-semibold text-slate-400">
              <Code2 className="w-3.5 h-3.5 text-violet-400" />
              <span>Solution</span>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value as any)}
                className="bg-[#1e1e1e] border border-slate-700 rounded-lg px-2 py-0.5 text-xs text-slate-200 focus:outline-none"
              >
                <option value="javascript">JavaScript (ES6)</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python 3</option>
              </select>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 min-h-[300px]">
            <Editor
              height="100%"
              theme="vs-dark"
              language={language === 'python' ? 'python' : 'javascript'}
              value={code}
              onChange={handleCodeChange}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: 'JetBrains Mono, monospace',
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
              }}
            />
          </div>

          {/* Test Case Output Console */}
          <div className="h-56 bg-slate-950 border-t border-slate-800 flex flex-col">
            <div className="h-8 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-400">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>Test Execution Results</span>
              </div>
              {execReport && (
                <span className={`text-[11px] font-bold ${
                  execReport.allPassed ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {execReport.totalPassed} / {execReport.totalTests} Passed ({execReport.totalTimeMs} ms)
                </span>
              )}
            </div>

            <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs font-mono">
              {!execReport ? (
                <div className="h-full flex items-center justify-center text-slate-500 font-sans text-xs">
                  Run or Submit your solution to see test results and execution time.
                </div>
              ) : execReport.compileError ? (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 font-sans text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                    <span>Runtime / Syntax Error:</span>
                  </div>
                  <pre className="font-mono text-[11px] whitespace-pre-wrap">{execReport.compileError}</pre>
                </div>
              ) : (
                <div className="space-y-2">
                  {execReport.results.map((res) => (
                    <div 
                      key={res.index}
                      className={`p-2.5 rounded-xl border ${
                        res.passed 
                          ? 'bg-emerald-950/20 border-emerald-500/30' 
                          : 'bg-rose-950/20 border-rose-500/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold flex items-center gap-1.5">
                          {res.passed ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-rose-400" />
                          )}
                          <span className={res.passed ? 'text-emerald-300' : 'text-rose-300'}>
                            Test Case #{res.index} {res.isHidden && '(Hidden Test)'}
                          </span>
                        </span>
                        <span className="text-[10px] text-slate-400">{res.executionTimeMs} ms</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 font-mono">
                        <div>
                          <span className="text-slate-500 block text-[10px]">EXPECTED</span>
                          <span>{JSON.stringify(res.expected)}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">ACTUAL</span>
                          <span className={res.passed ? 'text-emerald-400' : 'text-rose-400'}>
                            {res.error ? `Error: ${res.error}` : JSON.stringify(res.actual)}
                          </span>
                        </div>
                      </div>

                      {res.logs && res.logs.length > 0 && (
                        <div className="mt-1.5 pt-1.5 border-t border-slate-800 text-[10px] text-slate-400">
                          <span className="text-slate-500">Console: </span>
                          {res.logs.join(' | ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FINAL BATTLE RESULT MODAL */}
      {battleWinner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-arena-surface border border-violet-500/40 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-violet-600/20 text-violet-400 flex items-center justify-center mx-auto shadow-lg shadow-violet-500/30">
              <Trophy className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">
                1V1 CODING BATTLE CONCLUDED
              </span>
              <h3 className="text-3xl font-black text-white mt-1">
                {battleWinner.winner === 'you' ? '🏆 VICTORY!' : battleWinner.winner === 'opponent' ? 'DEFEAT' : 'TIED BATTLE'}
              </h3>
              <p className="text-xs text-slate-300 mt-1 font-medium">{battleWinner.reason}</p>
            </div>

            {/* Rating Delta Card */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-around">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block">RATING CHANGE</span>
                <span className={`text-xl font-black ${
                  battleWinner.ratingDelta > 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {battleWinner.ratingDelta > 0 ? `+${battleWinner.ratingDelta}` : battleWinner.ratingDelta} Elo
                </span>
              </div>
              <div className="h-8 w-px bg-slate-800" />
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block">NEW RATING</span>
                <span className="text-xl font-black text-violet-400">{battleWinner.newRating} Elo</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
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
                className="btn-secondary flex-1 py-2.5 text-xs font-bold"
              >
                Rematch
              </button>
              <button
                onClick={() => {
                  openShareModal({
                    title: 'Coding Battle Victory',
                    gameOrBattle: `1v1 Battle on ${problem.title}`,
                    scoreOrResult: battleWinner.winner === 'you' ? 'Victory 🏆' : 'Competed',
                    subtitle: `${battleWinner.ratingDelta > 0 ? `+${battleWinner.ratingDelta}` : battleWinner.ratingDelta} Elo • ${mySubmission?.testsPassed || 0}/${problem.testCases.length} Tests`,
                    customStats: [
                      { label: 'Rating', value: `${battleWinner.newRating} Elo` },
                      { label: 'Time', value: `${mySubmission?.timeTaken || 0}s` }
                    ]
                  });
                }}
                className="btn-primary flex-1 py-2.5 text-xs gap-1.5 font-bold"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Card</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

