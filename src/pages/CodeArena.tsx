import React, { useState } from 'react';
import { 
  Swords, 
  Trophy, 
  Play, 
  Users, 
  Zap, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Code2, 
  Share2,
  Sparkles,
  Shield,
  Activity
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

  // If a battle is active, render the live 1v1 CodingBattleRoom!
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
    setSelectedProblem(CODING_PROBLEMS[0]); // default or match
    setActiveBattleId(inputBattleCode.trim().toUpperCase());
  };

  const handleQuickMatch = () => {
    sound.playClick();
    setMatchmaking(true);
    // Simulate matchmaking search for 2 seconds
    setTimeout(() => {
      setMatchmaking(false);
      handleCreateBattle();
    }, 1800);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-in fade-in">
      
      {/* Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-arena-card to-slate-950 border border-violet-500/30 p-6 sm:p-8 overflow-hidden shadow-2xl">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-bold">
            <Swords className="w-3.5 h-3.5" />
            <span>RANKED COMPETITIVE PROGRAMMING</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white">
            1v1 Live Coding Arena
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Duel programmers in real-time. Both players receive the identical problem, code in Monaco Editor, and are judged by our automated test runner. First correct submission wins the match and claims Elo rating.
          </p>
        </div>

        {/* Rating Card Floating */}
        <div className="mt-6 sm:mt-0 sm:absolute sm:top-8 sm:right-8 p-4 rounded-2xl bg-slate-900/90 border border-violet-500/30 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase">CURRENT ELO RATING</span>
            <div className="text-2xl font-black text-white">{user.rating} Elo</div>
            <div className="text-[11px] text-emerald-400 font-semibold">{user.battlesWon} Wins / {user.battlesTotal} Total</div>
          </div>
        </div>
      </div>

      {/* MATCHMAKING & LOBBY CREATION ACTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Quick Match Card */}
        <div className="arena-card p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center mb-3">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-white">Quick Matchmaking</h3>
            <p className="text-xs text-slate-400 mt-1">
              Find an opponent with a similar Elo rating (±150 Elo) for a 15-minute ranked duel.
            </p>
          </div>

          <button
            onClick={handleQuickMatch}
            disabled={matchmaking}
            className="w-full btn-primary py-2.5 text-xs font-bold gap-2"
          >
            {matchmaking ? (
              <>
                <Activity className="w-4 h-4 animate-spin text-cyan-300" />
                <span>Finding Opponent...</span>
              </>
            ) : (
              <>
                <Swords className="w-4 h-4" />
                <span>Find Ranked Match</span>
              </>
            )}
          </button>
        </div>

        {/* Private Friend Duel Card */}
        <div className="arena-card p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center mb-3">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-white">Private Friend Battle</h3>
            <p className="text-xs text-slate-400 mt-1">
              Create a custom battle lobby with a shareable invite link. Friends can join as guests instantly!
            </p>
          </div>

          <button
            onClick={() => handleCreateBattle()}
            className="w-full btn-cyan py-2.5 text-xs font-bold gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Create Battle Lobby</span>
          </button>
        </div>

        {/* Join by Room Code */}
        <div className="arena-card p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center mb-3">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-white">Join by Battle Code</h3>
            <p className="text-xs text-slate-400 mt-1">
              Enter the room code shared by your friend (e.g. DEV-8492).
            </p>
          </div>

          <form onSubmit={handleJoinBattle} className="flex gap-2">
            <input
              type="text"
              value={inputBattleCode}
              onChange={(e) => setInputBattleCode(e.target.value)}
              placeholder="e.g. DEV-4912"
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500 font-mono"
            />
            <button type="submit" className="btn-secondary py-2 px-3 text-xs font-bold">
              Join
            </button>
          </form>
        </div>

      </div>

      {/* CURATED PROBLEM BANK SHELF */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Code2 className="w-5 h-5 text-violet-400" />
              <span>Problem Bank</span>
            </h2>
            <p className="text-xs text-slate-400">Select a specific problem to challenge a friend or practice solo</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CODING_PROBLEMS.map((problem) => {
            const isSolved = user.problemsSolved.includes(problem.id);
            return (
              <div
                key={problem.id}
                className="arena-card p-5 flex flex-col justify-between hover:border-violet-500/40 transition-all space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {problem.category}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      problem.difficulty === 'Easy'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : problem.difficulty === 'Medium'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    }`}>
                      {problem.difficulty}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                    <span>{problem.title}</span>
                    {isSolved && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                  </h3>

                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {problem.description.replace(/```[\s\S]*?```/g, '')}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-mono">
                    {problem.testCases.length} Test Cases
                  </span>

                  <button
                    onClick={() => handleCreateBattle(problem)}
                    className="btn-primary py-1.5 px-3 text-xs gap-1.5 font-bold"
                  >
                    <Swords className="w-3.5 h-3.5" />
                    <span>Battle on This</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RECENT BATTLES LOG */}
      {user.recentBattles.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>Recent Battle History</span>
          </h2>

          <div className="space-y-2">
            {user.recentBattles.map((b) => (
              <div 
                key={b.id} 
                className="p-3.5 rounded-2xl bg-arena-surface border border-arena-border flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                    b.result === 'won' 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    {b.result === 'won' ? 'W' : 'L'}
                  </div>

                  <div>
                    <div className="font-bold text-white flex items-center gap-2">
                      <span>vs @{b.opponentName}</span>
                      <span className="text-[10px] text-slate-400">({b.opponentRating} Elo)</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Problem: <span className="text-slate-300 font-medium">{b.problemTitle}</span> • {b.testsPassed} tests passed
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`font-black ${
                    b.ratingChange > 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {b.ratingChange > 0 ? `+${b.ratingChange}` : b.ratingChange} Elo
                  </span>
                  <div className="text-[10px] text-slate-500">{b.timestamp}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

