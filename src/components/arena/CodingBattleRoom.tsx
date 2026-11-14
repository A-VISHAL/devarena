import React, { useState, useEffect, useRef } from 'react';
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
  AlertCircle 
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

  const [language, setLanguage] = useState<'javascript' | 'typescript' | 'python'>('javascript');
  const [code, setCode] = useState<string>(problem.starterCode.javascript);

  const [roomStatus, setRoomStatus] = useState<'lobby' | 'countdown' | 'battle' | 'ended'>('lobby');
  const [timeRemaining, setTimeRemaining] = useState<number>(900);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const [myReady, setMyReady] = useState<boolean>(false);
  const [opponent, setOpponent] = useState<BattleParticipant | null>(null);

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [execReport, setExecReport] = useState<ExecutionReport | null>(null);
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

  const handleLanguageChange = (newLang: 'javascript' | 'typescript' | 'python') => {
    sound.playClick();
    setLanguage(newLang);
    setCode(problem.starterCode[newLang]);
  };

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

  const handleRunSampleTests = async () => {
    sound.playClick();
    setIsRunning(true);
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

    if (report.allPassed) sound.playVictory();
    else sound.playWrong();

    if (opponentSubmission || report.allPassed) {
      evaluateFinalWinner(sub, opponentSubmission);
    }
  };

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
      confetti({ particleCount: 80, spread: 70 });
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
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-arena-bg">
      {/* Top Battle Header */}
      <div className="h-12 px-4 bg-arena-surface border-b border-arena-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-xs font-medium text-arena-textSecondary hover:text-arena-textPrimary"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Exit</span>
          </button>
          <div className="h-3.5 w-px bg-arena-border" />
          <h2 className="font-bold text-xs text-arena-textPrimary flex items-center gap-2">
            <span>{problem.title}</span>
            <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
              problem.difficulty === 'Easy' 
                ? 'bg-arena-success/15 text-arena-success'
                : problem.difficulty === 'Medium'
                ? 'bg-arena-warning/15 text-arena-warning'
                : 'bg-arena-error/15 text-arena-error'
            }`}>
              {problem.difficulty}
            </span>
          </h2>
        </div>

        {/* Center Countdown / Timer */}
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-arena-elevated border border-arena-border font-mono text-xs font-semibold">
          <Timer className="w-3.5 h-3.5 text-arena-teal" />
          <span className={timeRemaining < 120 ? 'text-arena-error animate-pulse' : 'text-arena-textPrimary'}>
            {formatTimer(timeRemaining)}
          </span>
        </div>

        {/* Right Status Actions */}
        <div className="flex items-center gap-2">
          {roomStatus === 'lobby' && (
            <button
              onClick={handleCopyLink}
              className="btn-secondary py-1 px-2.5 text-xs gap-1.5"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-arena-teal" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied' : 'Invite'}</span>
            </button>
          )}

          {roomStatus === 'battle' && (
            <>
              <button
                onClick={handleRunSampleTests}
                disabled={isRunning || isSubmitting}
                className="btn-secondary py-1 px-2.5 text-xs gap-1.5"
              >
                <Play className="w-3.5 h-3.5 text-arena-teal fill-current" />
                <span>{isRunning ? 'Running...' : 'Run'}</span>
              </button>
              <button
                onClick={handleSubmitSolution}
                disabled={isRunning || isSubmitting || mySubmission?.passed}
                className={`py-1 px-3.5 text-xs gap-1.5 font-bold rounded-xl transition-all ${
                  mySubmission?.passed
                    ? 'bg-arena-lime text-[#101314] shadow-[0_0_14px_rgba(181,255,74,0.35)]'
                    : 'btn-primary'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Judging...' : mySubmission?.passed ? 'Passed ✓' : 'Submit'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* LOBBY BANNER */}
      {roomStatus === 'lobby' && (
        <div className="p-3.5 bg-arena-elevated border-b border-arena-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-arena-surface border border-arena-border flex items-center justify-center text-arena-cyan">
              <Swords className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-xs text-arena-textPrimary flex items-center gap-2">
                <span>1v1 Battle Lobby</span>
                {opponent && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full bg-arena-cyan/15 text-arena-cyan border border-arena-cyan/30 text-[10px] font-mono font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-arena-cyan animate-pulse shadow-[0_0_6px_#00E5FF]" />
                    Opponent Online
                  </span>
                )}
              </div>
              <p className="text-[11px] text-arena-textSecondary">
                {opponent 
                  ? `${opponent.username} is connected. Click "Ready" when prepared.` 
                  : 'Share the battle link with an opponent or open another tab to duel.'}
              </p>
            </div>
          </div>

          <button
            onClick={handleToggleReady}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              myReady ? 'bg-arena-lime text-[#101314] font-bold shadow-[0_0_12px_rgba(181,255,74,0.3)]' : 'btn-primary'
            }`}
          >
            {myReady ? '✓ Ready' : 'Ready Up'}
          </button>
        </div>
      )}

      {/* COUNTDOWN OVERLAY */}
      {countdown !== null && (
        <div className="absolute inset-0 z-50 bg-arena-bg/90 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in">
          <span className="text-[10px] font-bold text-arena-amber uppercase tracking-widest mb-1">
            BATTLE STARTING
          </span>
          <div className="text-7xl font-extrabold text-arena-textPrimary font-mono animate-bounce">
            {countdown}
          </div>
        </div>
      )}

      {/* MAIN SPLIT VIEW */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Left Panel: Problem Statement & Opponent Status */}
        <div className="w-full lg:w-5/12 border-r border-arena-border flex flex-col overflow-y-auto bg-arena-surface">
          
          {/* Opponent Status */}
          <div className="p-3 bg-arena-elevated border-b border-arena-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img 
                src={opponent ? opponent.avatar : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'} 
                alt="" 
                className="w-6 h-6 rounded-md object-cover border border-arena-border" 
              />
              <div>
                <div className="font-semibold text-xs text-arena-textPrimary">
                  {opponent ? opponent.username : 'Waiting for opponent...'}
                </div>
                <div className="text-[10px] text-arena-textSubtle">
                  {opponent ? `${opponent.rating} Elo` : 'Invite link ready'}
                </div>
              </div>
            </div>

            <div className="text-right">
              {opponent?.status === 'typing' && (
                <span className="text-[10px] font-medium text-arena-amber animate-pulse">Typing...</span>
              )}
              {opponent?.status === 'running' && (
                <span className="text-[10px] font-medium text-arena-teal">Running tests...</span>
              )}
              {opponent?.status === 'submitted' && (
                <span className="text-[10px] font-semibold text-arena-success">Submitted!</span>
              )}
              {(!opponent?.status || opponent?.status === 'idle') && (
                <span className="text-[10px] text-arena-textSubtle">
                  {opponent ? `${opponent.testsPassed}/${problem.testCases.length} passed` : 'Offline'}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="p-4 space-y-4 text-xs text-arena-textSecondary">
            <div>
              <h3 className="font-bold text-arena-textPrimary text-xs mb-1.5">Description</h3>
              <p className="whitespace-pre-line leading-relaxed text-arena-textSecondary">
                {problem.description}
              </p>
            </div>

            {/* Examples */}
            <div>
              <h4 className="font-semibold text-[11px] text-arena-textSubtle uppercase tracking-wider mb-2">
                Examples
              </h4>
              <div className="space-y-2">
                {problem.examples.map((ex, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-arena-elevated border border-arena-border font-mono text-xs space-y-0.5">
                    <div><span className="text-arena-textSubtle">Input: </span><span className="text-arena-textPrimary">{ex.input}</span></div>
                    <div><span className="text-arena-textSubtle">Output: </span><span className="text-arena-teal">{ex.output}</span></div>
                    {ex.explanation && (
                      <div className="text-[10px] text-arena-textSecondary font-sans pt-0.5">
                        {ex.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Constraints */}
            <div>
              <h4 className="font-semibold text-[11px] text-arena-textSubtle uppercase tracking-wider mb-1.5">
                Constraints
              </h4>
              <ul className="list-disc list-inside space-y-0.5 text-arena-textSecondary font-mono text-[11px]">
                {problem.constraints.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>
          </div>
        </div>

        {/* Right Panel: Editor & Console */}
        <div className="w-full lg:w-7/12 flex flex-col bg-arena-bg">
          
          <div className="h-9 px-4 bg-arena-surface border-b border-arena-border flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1 text-xs font-medium text-arena-textSecondary">
              <Code2 className="w-3.5 h-3.5 text-arena-amber" />
              <span>Solution</span>
            </div>

            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value as any)}
              className="bg-arena-elevated border border-arena-border rounded px-2 py-0.5 text-[11px] text-arena-textPrimary focus:outline-none"
            >
              <option value="javascript">JavaScript (ES6)</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python 3</option>
            </select>
          </div>

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
          <div className="h-52 bg-arena-bg border-t border-arena-border flex flex-col">
            <div className="h-8 px-4 bg-arena-surface border-b border-arena-border flex items-center justify-between text-xs font-medium text-arena-textSecondary">
              <div className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-arena-teal" />
                <span>Test Execution Results</span>
              </div>
              {execReport && (
                <span className={`text-[11px] font-semibold ${
                  execReport.allPassed ? 'text-arena-success' : 'text-arena-error'
                }`}>
                  {execReport.totalPassed} / {execReport.totalTests} Passed ({execReport.totalTimeMs} ms)
                </span>
              )}
            </div>

            <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs font-mono">
              {!execReport ? (
                <div className="h-full flex items-center justify-center text-arena-textSubtle font-sans text-xs">
                  Run or Submit your solution to execute against the test suite.
                </div>
              ) : execReport.compileError ? (
                <div className="p-2.5 rounded-lg bg-arena-error/10 border border-arena-error/30 text-arena-error font-sans text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Error:</span>
                  </div>
                  <pre className="font-mono text-[11px] whitespace-pre-wrap">{execReport.compileError}</pre>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {execReport.results.map((res) => (
                    <div 
                      key={res.index}
                      className={`p-2 rounded-lg border ${
                        res.passed 
                          ? 'bg-arena-success/5 border-arena-success/20' 
                          : 'bg-arena-error/5 border-arena-error/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold flex items-center gap-1.5">
                          {res.passed ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-arena-success" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-arena-error" />
                          )}
                          <span className={res.passed ? 'text-arena-success' : 'text-arena-error'}>
                            Test #{res.index} {res.isHidden && '(Hidden)'}
                          </span>
                        </span>
                        <span className="text-[10px] text-arena-textSubtle">{res.executionTimeMs} ms</span>
                      </div>

                      <div className="text-[11px] text-arena-textSecondary">
                        Expected: {JSON.stringify(res.expected)} | Actual: {JSON.stringify(res.actual)}
                      </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-arena-bg/85 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-arena-surface border border-arena-border rounded-2xl p-6 text-center space-y-4">
            <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mx-auto ${
              battleWinner.winner === 'you'
                ? 'bg-arena-lime/15 border-arena-lime/40 text-arena-lime shadow-[0_0_16px_rgba(181,255,74,0.3)]'
                : battleWinner.winner === 'opponent'
                ? 'bg-arena-error/15 border-arena-error/40 text-arena-error'
                : 'bg-arena-elevated border-arena-border text-arena-amber'
            }`}>
              <Trophy className="w-6 h-6" />
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-arena-textSubtle tracking-wider">
                1V1 BATTLE RESULT
              </span>
              <h3 className={`text-2xl font-bold mt-0.5 ${
                battleWinner.winner === 'you' ? 'text-arena-lime' : battleWinner.winner === 'opponent' ? 'text-arena-error' : 'text-arena-textPrimary'
              }`}>
                {battleWinner.winner === 'you' ? 'Victory 🏆' : battleWinner.winner === 'opponent' ? 'Defeat' : 'Tied Match'}
              </h3>
              <p className="text-xs text-arena-textSecondary mt-1">{battleWinner.reason}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-arena-elevated border border-arena-border flex items-center justify-around">
              <div>
                <span className="text-[10px] text-arena-textSubtle font-medium block">RATING DELTA</span>
                <span className={`text-lg font-bold font-mono ${
                  battleWinner.ratingDelta > 0 ? 'text-arena-lime' : 'text-arena-error'
                }`}>
                  {battleWinner.ratingDelta > 0 ? `+${battleWinner.ratingDelta}` : battleWinner.ratingDelta} Elo
                </span>
              </div>
              <div className="h-6 w-px bg-arena-border" />
              <div>
                <span className="text-[10px] text-arena-textSubtle font-medium block">NEW RATING</span>
                <span className="text-lg font-bold text-arena-textPrimary font-mono">{battleWinner.newRating} Elo</span>
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
                className="btn-secondary flex-1 py-2 text-xs font-semibold"
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
                    testCasesPassed: `${mySubmission?.testsPassed || problem.testCases.length}/${problem.testCases.length}`,
                    ratingChange: battleWinner.ratingDelta,
                    subtitle: `${battleWinner.ratingDelta > 0 ? `+${battleWinner.ratingDelta}` : battleWinner.ratingDelta} Elo • ${mySubmission?.testsPassed || 0}/${problem.testCases.length} Tests`,
                    customStats: [
                      { label: 'Rating', value: `${battleWinner.newRating} Elo` },
                      { label: 'Time', value: `${mySubmission?.timeTaken || 0}s` },
                      { label: 'Tests', value: `${mySubmission?.testsPassed || 0}/${problem.testCases.length}` }
                    ]
                  });
                }}
                className="btn-primary flex-1 py-2 text-xs gap-1.5 font-semibold"
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
