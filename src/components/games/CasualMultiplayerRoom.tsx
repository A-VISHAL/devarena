import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  Users, 
  Trophy, 
  Timer, 
  Swords, 
  Share2
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
      confetti({ particleCount: 70, spread: 60 });
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
    <div className="max-w-xl mx-auto py-6 px-4 flex flex-col items-center animate-in fade-in">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-arena-border">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-medium text-arena-textSecondary hover:text-arena-textPrimary"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Casual Hub</span>
        </button>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5">
            <Swords className="w-4 h-4 text-arena-blue" />
            <h2 className="text-sm font-bold text-arena-textPrimary">Quick Math Clash</h2>
          </div>
          <span className="text-[10px] text-arena-teal font-mono font-bold">ROOM {roomCode}</span>
        </div>
        <button
          onClick={handleCopyLink}
          className="p-1.5 rounded-lg bg-arena-surface border border-arena-border text-arena-textSecondary hover:text-arena-textPrimary"
          title="Copy Room Link"
        >
          {copiedLink ? <Check className="w-4 h-4 text-arena-teal" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      {/* LOBBY STATE */}
      {!matchStarted && !matchEnded && (
        <div className="w-full space-y-4">
          {/* Invite Bar */}
          <div className="p-4 rounded-xl bg-arena-surface border border-arena-border flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-arena-textPrimary flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-arena-blue" />
                <span>Invite a Friend to Clash</span>
              </span>
              <p className="text-[11px] text-arena-textSecondary mt-0.5">
                Opponents can join with room code or URL directly as guests.
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                readOnly
                value={inviteUrl}
                className="bg-arena-elevated border border-arena-border rounded-lg px-2.5 py-1 text-xs text-arena-textPrimary font-mono w-full sm:w-44 truncate"
              />
              <button
                onClick={handleCopyLink}
                className="btn-primary py-1 px-3 text-xs gap-1.5 whitespace-nowrap"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* 1v1 Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className={`p-4 rounded-xl border text-center transition-all ${
              myReady ? 'bg-arena-elevated border-arena-success' : 'bg-arena-surface border-arena-border'
            }`}>
              <img 
                src={user.avatar} 
                alt={user.username} 
                className="w-12 h-12 rounded-lg object-cover mx-auto mb-2 border border-arena-border" 
              />
              <div className="font-bold text-xs text-arena-textPrimary truncate">{user.displayName}</div>
              <div className="text-[10px] text-arena-textSubtle">@{user.username} (You)</div>
              
              <div className="mt-3">
                <button
                  onClick={handleToggleReady}
                  className={`w-full py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    myReady 
                      ? 'bg-arena-success text-slate-950 font-bold' 
                      : 'btn-primary'
                  }`}
                >
                  {myReady ? '✓ Ready' : 'Ready Up'}
                </button>
              </div>
            </div>

            <div className={`p-4 rounded-xl border text-center transition-all ${
              opponent 
                ? opponentReady ? 'bg-arena-elevated border-arena-success' : 'bg-arena-surface border-arena-border'
                : 'bg-arena-surface border-dashed border-arena-border'
            }`}>
              {opponent ? (
                <>
                  <img 
                    src={opponent.avatar} 
                    alt={opponent.username} 
                    className="w-12 h-12 rounded-lg object-cover mx-auto mb-2 border border-arena-border" 
                  />
                  <div className="font-bold text-xs text-arena-textPrimary truncate">{opponent.username}</div>
                  <div className="text-[10px] text-arena-textSubtle">Opponent Connected</div>
                  <div className="mt-3">
                    <span className={`inline-block px-3 py-1 rounded-md text-xs font-semibold ${
                      opponentReady ? 'bg-arena-success text-slate-950 font-bold' : 'bg-arena-elevated text-arena-textSubtle'
                    }`}>
                      {opponentReady ? '✓ Ready' : 'Waiting...'}
                    </span>
                  </div>
                </>
              ) : (
                <div className="py-4 space-y-2">
                  <div className="w-10 h-10 rounded-lg bg-arena-elevated border border-arena-border flex items-center justify-center mx-auto text-arena-textSubtle animate-pulse">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="text-xs font-medium text-arena-textSecondary">Waiting for opponent...</div>
                  <p className="text-[10px] text-arena-textSubtle">Open a 2nd tab with the link to test dueling yourself</p>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleJoinCustomCode} className="p-2.5 rounded-xl bg-arena-surface border border-arena-border flex gap-2">
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="Join existing room: e.g. MATH-4812"
              className="flex-1 bg-transparent text-xs text-arena-textPrimary px-2 focus:outline-none"
            />
            <button type="submit" className="btn-secondary py-1 px-3 text-xs font-medium">
              Join
            </button>
          </form>
        </div>
      )}

      {/* COUNTDOWN */}
      {countdown !== null && (
        <div className="my-8 text-center animate-in zoom-in-50">
          <span className="text-[10px] font-bold text-arena-blue uppercase tracking-widest block mb-1">
            CLASH STARTING
          </span>
          <div className="text-6xl font-black text-arena-textPrimary font-mono animate-bounce">
            {countdown}
          </div>
        </div>
      )}

      {/* LIVE DUEL STATE */}
      {matchStarted && (
        <div className="w-full space-y-4">
          <div className="p-4 rounded-xl bg-arena-surface border border-arena-border space-y-2.5">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-arena-blue font-bold">You: {myScore} pts</span>
              <span className="flex items-center gap-1 text-arena-teal font-mono font-bold">
                <Timer className="w-3.5 h-3.5" />
                <span>{timeLeft}s</span>
              </span>
              <span className="text-arena-teal font-bold">{opponent ? opponent.username : 'Opponent'}: {opponentScore} pts</span>
            </div>

            <div className="w-full h-2 rounded-full bg-arena-elevated overflow-hidden flex">
              <div 
                className="h-full bg-arena-blue transition-all duration-300"
                style={{ width: `${Math.min(100, (myScore / 1500) * 100)}%` }}
              />
              <div 
                className="h-full bg-arena-teal transition-all duration-300 ml-auto"
                style={{ width: `${Math.min(100, (opponentScore / 1500) * 100)}%` }}
              />
            </div>
          </div>

          <div className="p-6 rounded-xl bg-arena-surface border border-arena-border text-center">
            <span className="text-[10px] text-arena-textSubtle font-semibold uppercase tracking-wider">CALCULATE RAPIDLY</span>
            <div className="text-3xl sm:text-4xl font-extrabold text-arena-textPrimary my-3 font-mono">
              {questions[qIndex].question} = ?
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {questions[qIndex].options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(opt)}
                className="p-4 rounded-lg bg-arena-surface hover:bg-arena-elevated border border-arena-border text-xl font-bold text-arena-textPrimary font-mono active:scale-98"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MATCH RESULT */}
      {matchEnded && (
        <div className="w-full p-6 rounded-xl bg-arena-surface border border-arena-border text-center space-y-4">
          <div className="w-10 h-10 rounded-lg bg-arena-elevated border border-arena-border text-arena-blue flex items-center justify-center mx-auto">
            <Trophy className="w-5 h-5" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-arena-textPrimary">
              {winner === 'you' ? 'Victory' : winner === 'opponent' ? 'Defeat' : 'Tied Clash'}
            </h3>
            <p className="text-xs text-arena-textSecondary mt-1">
              Final: You ({myScore}) vs {opponent?.username || 'Opponent'} ({opponentScore})
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
              className="btn-secondary flex-1 py-2 text-xs font-semibold"
            >
              Rematch
            </button>
            <button
              onClick={() => {
                openShareModal({
                  title: 'Multiplayer Clash',
                  gameOrBattle: 'Quick Math Clash',
                  scoreOrResult: winner === 'you' ? 'Victory' : `${myScore} Points`,
                  subtitle: `Final: ${myScore} vs ${opponentScore}`,
                  customStats: [
                    { label: 'Your Score', value: `${myScore} pts` },
                    { label: 'Opponent', value: `${opponentScore} pts` }
                  ]
                });
              }}
              className="btn-primary flex-1 py-2 text-xs gap-1.5 font-semibold"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Result</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
