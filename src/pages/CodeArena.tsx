import React, { useState } from 'react';
import { 
  Swords, 
  Trophy, 
  Users, 
  Zap, 
  Clock, 
  CheckCircle2, 
  Code2, 
  Shield,
  Activity,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CODING_PROBLEMS } from '../data/problems';
import { CodingBattleRoom } from '../components/arena/CodingBattleRoom';
import { CodingProblem } from '../types';
import { sound } from '../utils/sound';

export const CodeArena: React.FC = () => {
  const { user, activeBattleId, setActiveBattleId } = useApp();

  const [inputBattleCode, setInputBattleCode] = useState('');
  const [selectedProblem, setSelectedProblem] = useState<CodingProblem>(CODING_PROBLEMS[0]);
  const [matchmaking, setMatchmaking] = useState(false);

  if (activeBattleId) {
    return (
      <CodingBattleRoom
        battleId={activeBattleId}
        problem={selectedProblem}
        onBack={() => setActiveBattleId(null)}
      />
    );
  }

  const handleCreateBattle = (problem?: CodingProblem) => {
    sound.playClick();
    const prob = problem || CODING_PROBLEMS[Math.floor(Math.random() * CODING_PROBLEMS.length)];
    setSelectedProblem(prob);
    const newBattleCode = `DEV-${Math.floor(1000 + Math.random() * 9000)}`;
    setActiveBattleId(newBattleCode);
  };

  const handleJoinBattle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputBattleCode.trim()) return;
    sound.playClick();
    setSelectedProblem(CODING_PROBLEMS[0]);
    setActiveBattleId(inputBattleCode.trim().toUpperCase());
  };

  const handleQuickMatch = () => {
    sound.playClick();
    setMatchmaking(true);
    setTimeout(() => {
      setMatchmaking(false);
      handleCreateBattle();
    }, 1800);
  };

  return (
    <div className="page-container py-8 space-y-8 animate-in fade-in">
      
      {/* Banner */}
      <div className="rounded-2xl bg-arena-surface border border-arena-border p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex-1 space-y-2.5 max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-arena-elevated border border-arena-border text-arena-amber text-xs font-semibold">
              <Swords className="w-3.5 h-3.5" />
              <span>COMPETITIVE DEVELOPER ECOSYSTEM</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-arena-textPrimary">
              1v1 Live Coding Arena
            </h1>
            <p className="text-xs sm:text-sm text-arena-textSecondary leading-relaxed">
              Real-time algorithm duels with synchronized problems and automated sandbox test judging. Correct submissions claim verified Elo rating points.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-arena-elevated border border-arena-border flex items-center gap-4 shrink-0">
            <div className="w-10 h-10 rounded-lg bg-arena-surface border border-arena-border text-arena-amber flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-arena-textSubtle font-semibold uppercase">VERIFIED RATING</span>
              <div className="text-xl font-bold text-arena-textPrimary font-mono">{user.rating} Elo</div>
              <div className="text-[11px] text-arena-teal font-medium">{user.battlesWon}W / {user.battlesTotal} Matches</div>
            </div>
          </div>
        </div>
      </div>

      {/* MATCHMAKING CARDS — 3 Columns across viewport */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Quick Match Card */}
        <div className="arena-card p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="w-9 h-9 rounded-lg bg-arena-elevated border border-arena-border text-arena-amber flex items-center justify-center mb-3">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-arena-textPrimary">Ranked Matchmaking</h3>
            <p className="text-xs text-arena-textSecondary mt-1 leading-relaxed">
              Find an opponent with a similar Elo rating (±150 Elo) for a 15-minute battle.
            </p>
          </div>

          <button
            onClick={handleQuickMatch}
            disabled={matchmaking}
            className="w-full btn-primary py-2 text-xs font-semibold gap-2"
          >
            {matchmaking ? (
              <>
                <Activity className="w-3.5 h-3.5 animate-spin" />
                <span>Finding Opponent...</span>
              </>
            ) : (
              <>
                <Swords className="w-3.5 h-3.5" />
                <span>Find Ranked Match</span>
              </>
            )}
          </button>
        </div>

        {/* Private Friend Duel Card */}
        <div className="arena-card p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="w-9 h-9 rounded-lg bg-arena-elevated border border-arena-border text-arena-teal flex items-center justify-center mb-3">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-arena-textPrimary">Private Challenge</h3>
            <p className="text-xs text-arena-textSecondary mt-1 leading-relaxed">
              Create a custom battle lobby with a shareable invite link for a direct friend duel.
            </p>
          </div>

          <button
            onClick={() => handleCreateBattle()}
            className="w-full btn-secondary py-2 text-xs font-medium gap-2 text-arena-textPrimary"
          >
            <Sparkles className="w-3.5 h-3.5 text-arena-teal" />
            <span>Create Battle Room</span>
          </button>
        </div>

        {/* Join by Room Code */}
        <div className="arena-card p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="w-9 h-9 rounded-lg bg-arena-elevated border border-arena-border text-arena-textSecondary flex items-center justify-center mb-3">
              <Shield className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-arena-textPrimary">Join via Code</h3>
            <p className="text-xs text-arena-textSecondary mt-1 leading-relaxed">
              Enter an invite code shared by an opponent (e.g. DEV-8492).
            </p>
          </div>

          <form onSubmit={handleJoinBattle} className="flex gap-2">
            <input
              type="text"
              value={inputBattleCode}
              onChange={(e) => setInputBattleCode(e.target.value)}
              placeholder="e.g. DEV-4912"
              className="flex-1 bg-arena-elevated border border-arena-border rounded-lg px-2.5 py-1.5 text-xs text-arena-textPrimary focus:outline-none focus:border-arena-borderHover font-mono"
            />
            <button type="submit" className="btn-secondary py-1.5 px-3 text-xs font-medium">
              Join
            </button>
          </form>
        </div>

      </div>

      {/* CURATED PROBLEM BANK — 1 to 4 Columns on Wide Displays */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-arena-textPrimary flex items-center gap-2">
            <Code2 className="w-4 h-4 text-arena-amber" />
            <span>Problem Bank</span>
          </h2>
          <p className="text-xs text-arena-textSecondary">Select a specific algorithm problem to challenge an opponent or practice in sandbox</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {CODING_PROBLEMS.map((problem) => {
            const isSolved = user.problemsSolved.includes(problem.id);
            return (
              <div
                key={problem.id}
                className="arena-card p-4 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold text-arena-textSubtle uppercase tracking-wider">
                      {problem.category}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded font-mono ${
                      problem.difficulty === 'Easy'
                        ? 'bg-arena-success/15 text-arena-success border border-arena-success/30'
                        : problem.difficulty === 'Medium'
                        ? 'bg-arena-warning/15 text-arena-warning border border-arena-warning/30'
                        : 'bg-arena-error/15 text-arena-error border border-arena-error/30'
                    }`}>
                      {problem.difficulty}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-arena-textPrimary flex items-center gap-1.5">
                    <span>{problem.title}</span>
                    {isSolved && <CheckCircle2 className="w-3.5 h-3.5 text-arena-success shrink-0" />}
                  </h3>

                  <p className="text-xs text-arena-textSecondary mt-1 line-clamp-2 leading-relaxed">
                    {problem.description.replace(/```[\s\S]*?```/g, '')}
                  </p>
                </div>

                <div className="pt-3 border-t border-arena-border flex items-center justify-between">
                  <span className="text-[11px] text-arena-textSubtle font-mono">
                    {problem.testCases.length} Test Cases
                  </span>

                  <button
                    onClick={() => handleCreateBattle(problem)}
                    className="btn-primary py-1 px-3 text-xs gap-1 font-semibold"
                  >
                    <Swords className="w-3.5 h-3.5" />
                    <span>Battle</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RECENT BATTLES LOG */}
      {user.recentBattles.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-arena-textPrimary flex items-center gap-2">
            <Clock className="w-4 h-4 text-arena-textSubtle" />
            <span>Recent Battle History</span>
          </h2>

          <div className="space-y-2">
            {user.recentBattles.map((b) => (
              <div 
                key={b.id} 
                className="p-3 rounded-lg bg-arena-surface border border-arena-border flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                    b.result === 'won' 
                      ? 'bg-arena-success/15 text-arena-success border border-arena-success/30' 
                      : 'bg-arena-error/15 text-arena-error border border-arena-error/30'
                  }`}>
                    {b.result === 'won' ? 'WIN' : 'LOSS'}
                  </span>

                  <div>
                    <div className="font-semibold text-arena-textPrimary flex items-center gap-1.5">
                      <span>vs @{b.opponentName}</span>
                      <span className="text-[10px] text-arena-textSubtle">({b.opponentRating} Elo)</span>
                    </div>
                    <div className="text-[11px] text-arena-textSecondary mt-0.5">
                      {b.problemTitle} • {b.testsPassed} test cases passed
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`font-bold font-mono ${
                    b.ratingChange > 0 ? 'text-arena-teal' : 'text-arena-error'
                  }`}>
                    {b.ratingChange > 0 ? `+${b.ratingChange}` : b.ratingChange} Elo
                  </span>
                  <div className="text-[10px] text-arena-textSubtle">{b.timestamp}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
