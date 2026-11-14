import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  Users, 
  Trophy, 
  Timer, 
  Flame, 
  Swords, 
  Sparkles,
  Share2,
  RefreshCw,
  Zap
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { syncEngine } from '../../utils/syncEngine';
import { sound } from '../../utils/sound';
import confetti from 'canvas-confetti';

interface MathQuestion {
  question: string;
  answer: number;
  options: number[];
}

// Deterministic question generator from seed so both players get exact same questions
function generateDeterministicQuestions(roomCode: string, count: number = 20): MathQuestion[] {
  let seed = 0;
  for (let i = 0; i < roomCode.length; i++) seed = (seed << 5) - seed + roomCode.charCodeAt(i);

  const pseudoRandom = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  const list: MathQuestion[] = [];
  const ops = ['+', '-', '*'];

  for (let i = 0; i < count; i++) {
    const op = ops[Math.floor(pseudoRandom() * ops.length)];
    let n1 = 0, n2 = 0, ans = 0;

    if (op === '+') {
      n1 = Math.floor(10 + pseudoRandom() * 40);
      n2 = Math.floor(5 + pseudoRandom() * 30);
      ans = n1 + n2;
    } else if (op === '-') {
      n1 = Math.floor(25 + pseudoRandom() * 50);
      n2 = Math.floor(5 + pseudoRandom() * 20);
      ans = n1 - n2;
    } else {
      n1 = Math.floor(3 + pseudoRandom() * 9);
      n2 = Math.floor(3 + pseudoRandom() * 9);
      ans = n1 * n2;
    }

    const set = new Set<number>([ans]);
    while (set.size < 4) {
      const delta = Math.floor(1 + pseudoRandom() * 6) * (pseudoRandom() > 0.5 ? 1 : -1);
      const fake = ans + delta;
      if (fake >= 0) set.add(fake);
    }

    list.push({
      question: `${n1} ${op} ${n2}`,
      answer: ans,
      options: Array.from(set).sort(() => pseudoRandom() - 0.5)
    });
  }

  return list;
}

export const CasualMultiplayerRoom: React.FC<{
  initialRoomCode?: string | null;
  onBack: () => void;
}> = ({ initialRoomCode, onBack }) => {
  const { user, openShareModal, recordCasualGameResult } = useApp();

  const [roomCode, setRoomCode] = useState<string>(() => {
    return initialRoomCode || `MATH-${Math.floor(1000 + Math.random() * 9000)}`;
  });

  const [inputCode, setInputCode] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Match state
  const [isHost, setIsHost] = useState<boolean>(!initialRoomCode);
  const [opponent, setOpponent] = useState<{ id: string; username: string; avatar: string; rating: number } | null>(null);
  const [myReady, setMyReady] = useState<boolean>(false);
  const [opponentReady, setOpponentReady] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [matchStarted, setMatchStarted] = useState<boolean>(false);
  const [matchEnded, setMatchEnded] = useState<boolean>(false);

  // Game tracking
  const [qIndex, setQIndex] = useState<number>(0);
  const [myScore, setMyScore] = useState<number>(0);
  const [opponentScore, setOpponentScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(45);

  const [questions] = useState<MathQuestion[]>(() => generateDeterministicQuestions(roomCode));

  // Sync engine listeners
  useEffect(() => {
    syncEngine.joinRoom(roomCode, {
      id: user.id,
      username: user.username,
      avatar: user.avatar
    });

    const unsubJoin = syncEngine.on('join_room', (data) => {
      if (data.user.id !== user.id) {
        setOpponent(data.user);
        sound.playCorrect();
        // Respond so they know we exist
        syncEngine.send('presence_ack', {
          user: {
            id: user.id,
            username: user.username,
            avatar: user.avatar,
            rating: user.casualRating
          }
        });
      }
    });

    const unsubAck = syncEngine.on('presence_ack', (data) => {
      if (data.user.id !== user.id) {
        setOpponent(data.user);
      }
    });

    const unsubReady = syncEngine.on('player_ready', (data) => {
      if (data.userId !== user.id) {
        setOpponentReady(data.ready);
      }
    });

    const unsubStart = syncEngine.on('match_start', () => {
      startCountdown();
    });

    const unsubScore = syncEngine.on('score_update', (data) => {
      if (data.userId !== user.id) {
        setOpponentScore(data.score);
      }
    });

    const unsubEnd = syncEngine.on('match_finish', (data) => {
      setOpponentScore(data.finalScore);
      finishMatch();
    });

    return () => {
      unsubJoin();
      unsubAck();
      unsubReady();
      unsubStart();
      unsubScore();
      unsubEnd();
      syncEngine.leaveRoom(roomCode, user.id);
    };
  }, [roomCode, user]);

  const startCountdown = () => {
    let count = 3;
    setCountdown(count);
    sound.playCountdown();

    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
        sound.playCountdown();
      } else {
        clearInterval(interval);
        setCountdown(null);
        setMatchStarted(true);
        sound.playGo();
      }
    }, 1000);
  };

  const handleToggleReady = () => {
    sound.playClick();
    const next = !myReady;
    setMyReady(next);
    syncEngine.send('player_ready', { userId: user.id, ready: next });

    if (next && opponentReady) {
      syncEngine.send('match_start', {});
      startCountdown();
    }
  };

  // Timer when match is live
  useEffect(() => {
    if (!matchStarted || matchEnded) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          finishMatch();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [matchStarted, matchEnded]);

  const finishMatch = () => {
    if (matchEnded) return;
    setMatchEnded(true);
    setMatchStarted(false);

    syncEngine.send('match_finish', {
      userId: user.id,
      finalScore: myScore
    });

    if (myScore > opponentScore) {
      sound.playVictory();
      confetti({ particleCount: 80, spread: 70 });
      recordCasualGameResult('multiplayer-math', myScore + 100);
    } else {
      sound.playWrong();
      recordCasualGameResult('multiplayer-math', myScore);
    }
  };

  const handleAnswer = (opt: number) => {
    if (!matchStarted || matchEnded) return;

    const currentQ = questions[qIndex];
    if (opt === currentQ.answer) {
      sound.playCorrect();
      const newScore = myScore + 100;
      setMyScore(newScore);
      syncEngine.send('score_update', { userId: user.id, score: newScore });

      if (qIndex + 1 < questions.length) {
        setQIndex(prev => prev + 1);
      }
    } else {
      sound.playWrong();
    }
  };

  const inviteUrl = `${window.location.origin}/?room=${roomCode}`;

  const handleCopyLink = () => {
    sound.playClick();
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleJoinCustomCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode.trim()) {
      sound.playClick();
      setRoomCode(inputCode.trim().toUpperCase());
      setInputCode('');
      setOpponent(null);
      setMyReady(false);
      setOpponentReady(false);
      setMatchStarted(false);
      setMatchEnded(false);
    }
  };

  const winner = myScore > opponentScore ? 'you' : myScore < opponentScore ? 'opponent' : 'draw';

  return (
    <div className="max-w-xl mx-auto py-4 px-3 flex flex-col items-center">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-arena-border">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Casual Hub</span>
        </button>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5">
            <Swords className="w-4 h-4 text-violet-400" />
            <h2 className="text-base font-black text-white">Quick Math Clash</h2>
          </div>
          <span className="text-[10px] text-cyan-400 font-mono font-bold">ROOM {roomCode}</span>
        </div>
        <button
          onClick={handleCopyLink}
          className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          title="Copy Room Link"
        >
          {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      {/* LOBBY STATE (Waiting for match to begin) */}
      {!matchStarted && !matchEnded && (
        <div className="w-full space-y-4">
          {/* Invite Bar */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-violet-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Users className="w-4 h-4 text-cyan-400" />
                <span>Invite a Friend to Duel</span>
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Share this link or room code. They can join as a guest instantly!
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                readOnly
                value={inviteUrl}
                className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 font-mono w-full sm:w-44 truncate"
              />
              <button
                onClick={handleCopyLink}
                className="btn-cyan py-1.5 px-3 text-xs gap-1.5 whitespace-nowrap"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Player Cards 1v1 */}
          <div className="grid grid-cols-2 gap-3">
            {/* Player 1 (You) */}
            <div className={`p-4 rounded-2xl border text-center transition-all ${
              myReady ? 'bg-emerald-950/40 border-emerald-500/50' : 'bg-slate-900 border-slate-800'
            }`}>
              <img 
                src={user.avatar} 
                alt={user.username} 
                className="w-12 h-12 rounded-full object-cover mx-auto mb-2 border-2 border-violet-500" 
              />
              <div className="font-bold text-sm text-white truncate">{user.displayName}</div>
              <div className="text-[10px] text-slate-400">@{user.username} (You)</div>
              
              <div className="mt-3">
                <button
                  onClick={handleToggleReady}
                  className={`w-full py-1.5 rounded-xl text-xs font-bold transition-all ${
                    myReady 
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30' 
                      : 'btn-primary'
                  }`}
                >
                  {myReady ? '✓ Ready!' : 'Ready Up'}
                </button>
              </div>
            </div>

            {/* Player 2 (Opponent or Waiting) */}
            <div className={`p-4 rounded-2xl border text-center transition-all ${
              opponent 
                ? opponentReady ? 'bg-emerald-950/40 border-emerald-500/50' : 'bg-slate-900 border-slate-800'
                : 'bg-slate-900/40 border-dashed border-slate-800'
            }`}>
              {opponent ? (
                <>
                  <img 
                    src={opponent.avatar} 
                    alt={opponent.username} 
                    className="w-12 h-12 rounded-full object-cover mx-auto mb-2 border-2 border-cyan-500" 
                  />
                  <div className="font-bold text-sm text-white truncate">{opponent.username}</div>
                  <div className="text-[10px] text-slate-400">Opponent Connected</div>
                  <div className="mt-3">
                    <span className={`inline-block px-3 py-1.5 rounded-xl text-xs font-bold ${
                      opponentReady ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {opponentReady ? '✓ Ready' : 'Waiting...'}
                    </span>
                  </div>
                </>
              ) : (
                <div className="py-4 space-y-2">
                  <div className="w-10 h-10 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-slate-500 animate-pulse">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-slate-400">Waiting for friend...</div>
                  <p className="text-[10px] text-slate-500">Open another tab with the link to test dueling yourself!</p>
                </div>
              )}
            </div>
          </div>

          {/* Join Another Room Form */}
          <form onSubmit={handleJoinCustomCode} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex gap-2">
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="Have a room code? e.g. MATH-4812"
              className="flex-1 bg-transparent text-xs text-white px-2 focus:outline-none"
            />
            <button type="submit" className="btn-secondary py-1.5 px-3 text-xs font-bold">
              Join Room
            </button>
          </form>
        </div>
      )}

      {/* COUNTDOWN OVERLAY */}
      {countdown !== null && (
        <div className="my-10 text-center animate-in zoom-in-50">
          <span className="text-xs font-black text-cyan-400 uppercase tracking-widest block mb-1">
            MATCH STARTING IN
          </span>
          <div className="text-7xl font-black text-white font-mono animate-bounce">
            {countdown}
          </div>
        </div>
      )}

      {/* LIVE DUEL STATE */}
      {matchStarted && (
        <div className="w-full space-y-4">
          {/* Live Progress Duel Header */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-arena-border space-y-3">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-violet-400 flex items-center gap-1.5">
                <img src={user.avatar} className="w-4 h-4 rounded-full" alt="" />
                <span>You: {myScore} pts</span>
              </span>
              <span className="flex items-center gap-1 text-cyan-400 font-mono text-sm">
                <Timer className="w-4 h-4" />
                <span>{timeLeft}s</span>
              </span>
              <span className="text-cyan-400 flex items-center gap-1.5">
                <span>{opponent ? opponent.username : 'Opponent'}: {opponentScore} pts</span>
                {opponent && <img src={opponent.avatar} className="w-4 h-4 rounded-full" alt="" />}
              </span>
            </div>

            {/* Dual Score Bars */}
            <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden flex">
              <div 
                className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 transition-all duration-300"
                style={{ width: `${Math.min(100, (myScore / 1500) * 100)}%` }}
              />
              <div 
                className="h-full bg-gradient-to-l from-cyan-500 to-teal-500 transition-all duration-300 ml-auto"
                style={{ width: `${Math.min(100, (opponentScore / 1500) * 100)}%` }}
              />
            </div>
          </div>

          {/* Active Question */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-violet-500/30 text-center">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">CALCULATE RAPIDLY</span>
            <div className="text-4xl sm:text-5xl font-black text-white my-3 font-mono">
              {questions[qIndex].question} = ?
            </div>
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-3">
            {questions[qIndex].options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(opt)}
                className="p-5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-violet-500/40 text-2xl font-black text-white font-mono active:scale-95 shadow-md"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MATCH RESULT STATE */}
      {matchEnded && (
        <div className="w-full p-6 rounded-3xl bg-slate-900 border border-violet-500/30 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-violet-600/20 text-violet-400 flex items-center justify-center mx-auto">
            <Trophy className="w-7 h-7" />
          </div>

          <div>
            <h3 className="text-2xl font-black text-white">
              {winner === 'you' ? '🏆 VICTORY!' : winner === 'opponent' ? 'DEFEAT' : 'TIED MATCH'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Final Score: You ({myScore}) vs {opponent?.username || 'Opponent'} ({opponentScore})
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => {
                sound.playClick();
                setMyScore(0);
                setOpponentScore(0);
                setMatchEnded(false);
                setMatchStarted(false);
                setMyReady(false);
                setOpponentReady(false);
                setQIndex(0);
                setTimeLeft(45);
              }}
              className="btn-secondary flex-1 py-2.5 text-xs font-bold"
            >
              Rematch
            </button>
            <button
              onClick={() => {
                openShareModal({
                  title: 'Multiplayer Clash',
                  gameOrBattle: 'Quick Math 1v1 Clash',
                  scoreOrResult: winner === 'you' ? 'Victory 🏆' : `${myScore} Points`,
                  subtitle: `Duels Score: ${myScore} vs ${opponentScore}`,
                  customStats: [
                    { label: 'Your Score', value: `${myScore} pts` },
                    { label: 'Opponent Score', value: `${opponentScore} pts` }
                  ]
                });
              }}
              className="btn-primary flex-1 py-2.5 text-xs gap-1.5 font-bold"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Duel</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

