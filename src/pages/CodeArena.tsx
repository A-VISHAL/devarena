import React, { useState, useEffect } from 'react';
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
  Sparkles,
  Search,
  Copy,
  Check,
  X,
  Play,
  Flame,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CODING_PROBLEMS } from '../data/problems';
import { CodingBattleRoom } from '../components/arena/CodingBattleRoom';
import { CodingProblem, SupportedLanguage } from '../types';
import { sound } from '../utils/sound';

export const CodeArena: React.FC = () => {
  const { user, activeBattleId, setActiveBattleId } = useApp();

  // Matchmaking Config State
  const [difficulty, setDifficulty] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const [language, setLanguage] = useState<SupportedLanguage>('python');
  const [topic, setTopic] = useState<string>('All');
  const [duration, setDuration] = useState<number>(15);

  // Matchmaking Status State
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchTimer, setSearchTimer] = useState<number>(0);
  const [inputBattleCode, setInputBattleCode] = useState<string>('');
  const [selectedProblem, setSelectedProblem] = useState<CodingProblem>(CODING_PROBLEMS[0]);
  const [createdRoomCode, setCreatedRoomCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Timer for active matchmaking search
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSearching) {
      setSearchTimer(0);
      interval = setInterval(() => {
        setSearchTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSearching]);

  // If a battle is active, render the dedicated 1v1 split battle room
  if (activeBattleId) {
    return (
      <CodingBattleRoom
        battleId={activeBattleId}
        problem={selectedProblem}
        onBack={() => setActiveBattleId(null)}
      />
    );
  }

  // Filter problems matching the selected preferences
  const getMatchingProblem = (): CodingProblem => {
    let pool = CODING_PROBLEMS;
    if (difficulty !== 'All') {
      pool = pool.filter(p => p.difficulty === difficulty);
    }
    if (topic !== 'All') {
      pool = pool.filter(p => p.category.toLowerCase().includes(topic.toLowerCase()));
    }
    if (pool.length === 0) pool = CODING_PROBLEMS;
    return pool[Math.floor(Math.random() * pool.length)];
  };

  const handleStartSearch = () => {
    sound.playClick();
    setIsSearching(true);

    // Simulate matchmaking lookup (1.8s) then enter battle room
    setTimeout(() => {
      setIsSearching(false);
      const chosenProblem = getMatchingProblem();
      setSelectedProblem(chosenProblem);
      const newBattleCode = `DEV-${Math.floor(1000 + Math.random() * 9000)}`;
      setActiveBattleId(newBattleCode);
    }, 1800);
  };

  const handleCancelSearch = () => {
    sound.playClick();
    setIsSearching(false);
  };

  const handleCreatePrivateDuel = () => {
    sound.playClick();
    const chosenProblem = getMatchingProblem();
    setSelectedProblem(chosenProblem);
    const newCode = `DEV-${Math.floor(1000 + Math.random() * 9000)}`;
    setCreatedRoomCode(newCode);
  };

  const handleEnterCreatedRoom = () => {
    sound.playClick();
    if (createdRoomCode) {
      setActiveBattleId(createdRoomCode);
    }
  };

  const handleJoinBattle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputBattleCode.trim()) return;
    sound.playClick();
    setSelectedProblem(CODING_PROBLEMS[0]);
    setActiveBattleId(inputBattleCode.trim().toUpperCase());
  };

  const handleDirectProblemBattle = (prob: CodingProblem) => {
    sound.playClick();
    setSelectedProblem(prob);
    const newBattleCode = `DEV-${Math.floor(1000 + Math.random() * 9000)}`;
    setActiveBattleId(newBattleCode);
  };

  const formatSearchTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const topicOptions = [
    'All',
    'Array',
    'Hash Table',
    'Two Pointers',
    'Stack',
    'Dynamic Programming'
  ];

  return (
    <div className="page-container py-8 space-y-8 animate-in fade-in max-w-6xl mx-auto">
      
      {/* ============================================================== */}
      {/* 1. COMPACT ARENA HERO BANNER                                    */}
      {/* ============================================================== */}
      <div className="rounded-2xl bg-[#141A1C] border border-[#253033] p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#182023] border border-[#2B383C] text-arena-amber text-[10px] font-mono font-bold uppercase tracking-wider">
            <Swords className="w-3 h-3 text-arena-amber" />
            <span>1V1 VERSUS ARENA</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Competitive Code Arena
          </h1>
          <p className="text-xs text-[#9BA8A8]">
            Synchronized real-time algorithm duels inspired by NeetCode Versus. Solved tests and fast submissions earn verified Elo.
          </p>
        </div>

        {/* Rating Summary Card */}
        <div className="flex items-center gap-4 px-4 py-2.5 rounded-xl bg-[#101314] border border-[#253033] shrink-0">
          <div className="w-10 h-10 rounded-lg bg-[#182023] border border-[#2B383C] text-arena-amber flex items-center justify-center font-black">
            <Trophy className="w-5 h-5 text-arena-amber" />
          </div>
          <div>
            <div className="text-[10px] font-mono font-semibold uppercase text-[#9BA8A8]">CURRENT RATING</div>
            <div className="text-lg font-black text-white font-mono leading-tight">{user.rating} Elo</div>
            <div className="text-[11px] text-emerald-400 font-mono font-medium">
              {user.battlesWon}W - {user.battlesTotal - user.battlesWon}L ({user.battlesTotal > 0 ? Math.round((user.battlesWon / user.battlesTotal) * 100) : 0}%)
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. CENTERED MATCHMAKING SETUP PANEL (NeetCode Versus Style)    */}
      {/* ============================================================== */}
      <div className="bg-[#141A1C] border border-[#253033] rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
        
        {/* Active Opponent Search Overlay */}
        {isSearching ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in">
            {/* Animated Pulsing Radar Indicator */}
            <div className="relative flex items-center justify-center">
              <span className="w-20 h-20 rounded-full bg-arena-amber/10 animate-ping absolute" />
              <span className="w-14 h-14 rounded-full bg-arena-amber/20 animate-pulse absolute" />
              <div className="w-12 h-12 rounded-full bg-[#182023] border border-arena-amber flex items-center justify-center relative z-10 text-arena-amber shadow-[0_0_16px_rgba(255,173,66,0.4)]">
                <Swords className="w-5 h-5 animate-spin" />
              </div>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-lg font-black text-white">Searching for Opponent...</h2>
              <div className="text-sm font-mono font-bold text-arena-amber tracking-wider">
                {formatSearchTime(searchTimer)}
              </div>
              <p className="text-xs text-[#9BA8A8]">
                Matching with players around {user.rating} (±150 Elo)
              </p>
            </div>

            {/* Criteria Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1 font-mono text-[11px]">
              <span className="px-2.5 py-1 rounded bg-[#101314] border border-[#253033] text-[#CBD5E1]">
                Difficulty: <strong className="text-white">{difficulty}</strong>
              </span>
              <span className="px-2.5 py-1 rounded bg-[#101314] border border-[#253033] text-[#CBD5E1]">
                Language: <strong className="text-white">{language}</strong>
              </span>
              <span className="px-2.5 py-1 rounded bg-[#101314] border border-[#253033] text-[#CBD5E1]">
                Time: <strong className="text-white">{duration}m</strong>
              </span>
            </div>

            {/* Cancel Button */}
            <button
              onClick={handleCancelSearch}
              className="mt-4 px-5 py-2 rounded-xl bg-[#20292D] hover:bg-[#283236] text-[#CBD5E1] hover:text-white text-xs font-mono font-semibold border border-[#344247] transition-colors"
            >
              Cancel Search
            </button>
          </div>
        ) : (
          /* Matchmaking Configuration Interface */
          <div className="space-y-6">
            
            {/* A. Head-to-Head Visual: You VS Opponent */}
            <div className="grid grid-cols-1 md:grid-cols-7 items-center gap-4 p-4 rounded-xl bg-[#101314] border border-[#253033]">
              
              {/* You Card (3 cols) */}
              <div className="md:col-span-3 flex items-center gap-3 p-3 rounded-lg bg-[#161D20] border border-[#253033]">
                <img 
                  src={user.avatar} 
                  alt={user.displayName}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-arena-amber"
                />
                <div className="min-w-0">
                  <div className="text-xs font-mono font-bold text-arena-amber">YOU</div>
                  <div className="text-sm font-bold text-white truncate">{user.displayName}</div>
                  <div className="text-[11px] font-mono text-[#9BA8A8]">{user.rating} Elo</div>
                </div>
              </div>

              {/* VS Badge (1 col) */}
              <div className="md:col-span-1 flex justify-center py-2 md:py-0">
                <span className="w-8 h-8 rounded-full bg-[#182023] border border-[#2B383C] text-arena-amber font-mono font-black text-xs flex items-center justify-center shadow-inner">
                  VS
                </span>
              </div>

              {/* Opponent Card (3 cols) */}
              <div className="md:col-span-3 flex items-center gap-3 p-3 rounded-lg bg-[#161D20] border border-[#253033] border-dashed">
                <div className="w-10 h-10 rounded-full bg-[#182023] border border-[#253033] flex items-center justify-center text-[#9BA8A8]">
                  <Users className="w-5 h-5 text-[#9BA8A8]" />
                </div>
                <div>
                  <div className="text-xs font-mono font-bold text-[#9BA8A8]">OPPONENT</div>
                  <div className="text-sm font-bold text-white">Ranked Opponent</div>
                  <div className="text-[11px] font-mono text-[#9BA8A8]">~{user.rating} Elo (Auto-Matched)</div>
                </div>
              </div>

            </div>

            {/* B. Settings Selection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* 1. Difficulty */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-[#9BA8A8] uppercase tracking-wider block">
                  DIFFICULTY
                </label>
                <div className="grid grid-cols-4 gap-1 bg-[#101314] p-1 rounded-xl border border-[#253033]">
                  {(['All', 'Easy', 'Medium', 'Hard'] as const).map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDifficulty(d)}
                      className={`py-1 text-xs font-mono rounded-lg transition-all ${
                        difficulty === d
                          ? 'bg-[#1F272A] text-white font-bold border border-[#344247] shadow-sm'
                          : 'text-[#9BA8A8] hover:text-white'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Language */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-[#9BA8A8] uppercase tracking-wider block">
                  LANGUAGE
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                  className="w-full bg-[#101314] border border-[#253033] rounded-xl px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-arena-amber cursor-pointer"
                >
                  <option value="python">Python 3</option>
                  <option value="javascript">JavaScript (ES6)</option>
                  <option value="typescript">TypeScript</option>
                  <option value="cpp">C++ (GCC)</option>
                  <option value="java">Java (OpenJDK)</option>
                </select>
              </div>

              {/* 3. Topic */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-[#9BA8A8] uppercase tracking-wider block">
                  TOPIC
                </label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full bg-[#101314] border border-[#253033] rounded-xl px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-arena-amber cursor-pointer"
                >
                  {topicOptions.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* 4. Duration */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-[#9BA8A8] uppercase tracking-wider block">
                  DURATION
                </label>
                <div className="grid grid-cols-4 gap-1 bg-[#101314] p-1 rounded-xl border border-[#253033]">
                  {([10, 15, 20, 30] as const).map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setDuration(m)}
                      className={`py-1 text-xs font-mono rounded-lg transition-all ${
                        duration === m
                          ? 'bg-[#1F272A] text-white font-bold border border-[#344247] shadow-sm'
                          : 'text-[#9BA8A8] hover:text-white'
                      }`}
                    >
                      {m}m
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* C. Primary Actions: Find Match & Private Duel */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={handleStartSearch}
                className="w-full sm:flex-1 py-3 rounded-xl bg-arena-amber hover:bg-arena-amberHover text-zinc-950 font-bold text-sm font-mono flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Swords className="w-4 h-4 text-zinc-950" />
                <span>Find Random Match</span>
              </button>

              <button
                onClick={handleCreatePrivateDuel}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#1C2426] hover:bg-[#252E32] text-white font-mono font-semibold text-xs border border-[#2B383C] transition-colors flex items-center justify-center gap-2"
              >
                <Zap className="w-3.5 h-3.5 text-arena-amber" />
                <span>Create Private Duel</span>
              </button>
            </div>

            {/* D. Inline Private Duel Code Box (if created) */}
            {createdRoomCode && (
              <div className="p-4 rounded-xl bg-[#101314] border border-arena-amber/40 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in">
                <div className="space-y-0.5 text-left">
                  <div className="text-[10px] font-mono font-bold text-arena-amber uppercase tracking-wider">
                    ROOM CREATED • SHARE WITH FRIEND
                  </div>
                  <div className="text-xs text-[#9BA8A8]">
                    Send this room code to your friend to begin your 1v1 duel:
                  </div>
                  <div className="font-mono font-black text-lg text-white tracking-widest pt-0.5">
                    {createdRoomCode}
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/app/arena?battle=${createdRoomCode}`);
                      setCopiedCode(true);
                      setTimeout(() => setCopiedCode(false), 2000);
                    }}
                    className="flex-1 sm:flex-none px-3.5 py-2 rounded-lg bg-[#182023] hover:bg-[#20292D] border border-[#2B383C] text-xs font-mono font-semibold text-white flex items-center justify-center gap-1.5"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Link Copied' : 'Copy Link'}</span>
                  </button>

                  <button
                    onClick={handleEnterCreatedRoom}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-arena-amber hover:bg-arena-amberHover text-zinc-950 text-xs font-mono font-bold"
                  >
                    Enter Room
                  </button>
                </div>
              </div>
            )}

            {/* E. Join by Code Form */}
            <div className="pt-4 border-t border-[#253033] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-[#9BA8A8] text-xs">
                Have a battle invite code from another player?
              </span>

              <form onSubmit={handleJoinBattle} className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  value={inputBattleCode}
                  onChange={(e) => setInputBattleCode(e.target.value)}
                  placeholder="e.g. DEV-8492"
                  className="bg-[#101314] border border-[#253033] rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-arena-amber uppercase"
                />
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-[#20292D] hover:bg-[#283236] text-white text-xs font-mono font-semibold border border-[#344247] transition-colors"
                >
                  Join
                </button>
              </form>
            </div>

          </div>
        )}

      </div>

      {/* ============================================================== */}
      {/* 3. PROBLEM BANK — NeetCode / LeetCode Style Problem Grid        */}
      {/* ============================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Code2 className="w-4 h-4 text-arena-amber" />
              <span>Problem Bank</span>
            </h2>
            <p className="text-xs text-[#9BA8A8]">
              Select a specific problem to launch a direct 1v1 battle or sandbox session
            </p>
          </div>

          <span className="text-xs font-mono text-[#9BA8A8]">
            {CODING_PROBLEMS.length} Curated Challenges
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CODING_PROBLEMS.map((problem) => {
            const isSolved = user.problemsSolved.includes(problem.id);
            return (
              <div
                key={problem.id}
                className="bg-[#141A1C] border border-[#253033] rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-[#38484E] transition-all"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#9BA8A8] uppercase tracking-wider">
                      {problem.category}
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

                  <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                    <span>{problem.title}</span>
                    {isSolved && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  </h3>

                  <p className="text-xs text-[#9BA8A8] line-clamp-2 leading-relaxed">
                    {problem.description.replace(/```[\s\S]*?```/g, '')}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#20292D] flex items-center justify-between text-xs">
                  <span className="text-[11px] font-mono text-[#9BA8A8]">
                    {problem.testCases.length} Test Cases
                  </span>

                  <button
                    onClick={() => handleDirectProblemBattle(problem)}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#182023] hover:bg-[#20292D] text-arena-amber hover:text-white border border-[#2B383C] text-xs font-mono font-semibold transition-colors"
                  >
                    <Swords className="w-3 h-3 text-arena-amber" />
                    <span>Duel</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. RECENT BATTLE HISTORY                                       */}
      {/* ============================================================== */}
      {user.recentBattles && user.recentBattles.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#9BA8A8]" />
            <span>Recent Battles</span>
          </h2>

          <div className="space-y-2">
            {user.recentBattles.map((b) => (
              <div 
                key={b.id} 
                className="p-3 rounded-xl bg-[#141A1C] border border-[#253033] flex items-center justify-between text-xs font-mono"
              >
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                    b.result === 'won' 
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-red-500/15 text-red-400 border border-red-500/30'
                  }`}>
                    {b.result === 'won' ? 'VICTORY' : 'DEFEAT'}
                  </span>

                  <div>
                    <div className="font-semibold text-white flex items-center gap-1.5 font-sans">
                      <span>vs @{b.opponentName}</span>
                      <span className="text-[10px] text-[#9BA8A8] font-mono">({b.opponentRating} Elo)</span>
                    </div>
                    <div className="text-[11px] text-[#9BA8A8] mt-0.5 font-sans">
                      {b.problemTitle} • {b.testsPassed} test cases passed
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`font-bold font-mono ${
                    b.ratingChange >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {b.ratingChange >= 0 ? `+${b.ratingChange}` : b.ratingChange} Elo
                  </span>
                  <div className="text-[10px] text-[#64748B]">{b.timestamp}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
