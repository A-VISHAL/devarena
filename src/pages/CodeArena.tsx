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
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CODING_PROBLEMS } from '../data/problems';
import { CodingBattleRoom } from '../components/arena/CodingBattleRoom';
import { LeetCodeArena } from '../components/arena/LeetCodeArena';
import { CodingProblem, SupportedLanguage } from '../types';
import { sound } from '../utils/sound';

export const CodeArena: React.FC = () => {
  const { user, activeBattleId, setActiveBattleId, selectedArenaProblemId } = useApp();

  // Mode: Practice (LeetCode-style IDE) vs 1v1 Battle Lobby
  const [arenaMode, setArenaMode] = useState<'practice' | 'battle-lobby'>('practice');

  // Matchmaking Config State
  const [difficulty, setDifficulty] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const [language, setLanguage] = useState<SupportedLanguage>('python');
  const [topic, setTopic] = useState<string>('All');
  const [duration, setDuration] = useState<number>(15);

  // Matchmaking Status State
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchTimer, setSearchTimer] = useState<number>(0);
  const [inputBattleCode, setInputBattleCode] = useState<string>('');
  const [selectedProblem, setSelectedProblem] = useState<CodingProblem>(() => {
    return CODING_PROBLEMS.find(p => p.id === selectedArenaProblemId) || CODING_PROBLEMS[0];
  });
  const [createdRoomCode, setCreatedRoomCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Keep selectedProblem in sync
  useEffect(() => {
    if (selectedArenaProblemId) {
      const found = CODING_PROBLEMS.find(p => p.id === selectedArenaProblemId);
      if (found) setSelectedProblem(found);
    }
  }, [selectedArenaProblemId]);

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

  // If user is in Practice mode (Default LeetCode-style environment)
  if (arenaMode === 'practice') {
    return (
      <LeetCodeArena
        onStart1v1Battle={() => {
          sound.playClick();
          setArenaMode('battle-lobby');
        }}
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
    'Dynamic Programming',
    'Sliding Window',
    'Binary Search',
    'Graphs'
  ];

  return (
    <div className="page-container py-6 space-y-6 animate-in fade-in max-w-6xl mx-auto">
      
      {/* Return to Practice IDE button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            sound.playClick();
            setArenaMode('practice');
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141A1C] hover:bg-[#1C2426] border border-[#253033] text-xs font-medium text-[#9AA5A6] hover:text-white transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#FFAD42]" />
          <span>Back to Solo Code Arena</span>
        </button>

        <span className="text-xs font-mono text-[#9AA5A6]">
          1v1 Duel Lobby • Real-Time Synchronization
        </span>
      </div>

      {/* ============================================================== */}
      {/* 1. COMPACT ARENA HERO BANNER                                    */}
      {/* ============================================================== */}
      <div className="rounded-2xl bg-[#141A1C] border border-[#253033] p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#FFAD42]/10 border border-[#FFAD42]/30 text-[#FFAD42] text-xs font-mono font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFAD42] animate-pulse" />
            1v1 CODE DUEL ARENA
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Real-Time Competitive Problem Solving
          </h1>
          <p className="text-xs text-[#9AA5A6] max-w-xl">
            Challenge fellow developers, solve identical LeetCode algorithmic problems with live test runs, and climb the verified Elo rating ladder.
          </p>
        </div>

        {/* User Stats Snapshot */}
        <div className="flex items-center gap-3 bg-[#101314] px-4 py-2.5 rounded-xl border border-[#253033] shrink-0 font-mono text-xs">
          <div>
            <div className="text-[10px] text-[#64748B] uppercase">Rating</div>
            <div className="text-base font-bold text-[#FFAD42]">{user.rating} Elo</div>
          </div>
          <div className="h-6 w-px bg-[#253033]" />
          <div>
            <div className="text-[10px] text-[#64748B] uppercase">Win Rate</div>
            <div className="text-base font-bold text-[#B5FF4A]">
              {user.battlesTotal > 0 ? Math.round((user.battlesWon / user.battlesTotal) * 100) : 0}%
            </div>
          </div>
          <div className="h-6 w-px bg-[#253033]" />
          <div>
            <div className="text-[10px] text-[#64748B] uppercase">Duels</div>
            <div className="text-base font-bold text-white">{user.battlesTotal}</div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. MATCHMAKING & PRIVATE ROOM LAUNCHER                          */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Quick Matchmaker Setup */}
        <div className="lg:col-span-7 bg-[#141A1C] border border-[#253033] rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#253033]">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#FFAD42]" />
              <h2 className="font-bold text-sm text-white">Match Preferences</h2>
            </div>
            <span className="text-[11px] text-[#64748B] font-mono">15 Min Duel</span>
          </div>

          {/* Difficulty Selector */}
          <div className="space-y-2">
            <label className="text-xs text-[#9AA5A6] font-medium block">Difficulty Tier</label>
            <div className="grid grid-cols-4 gap-2">
              {(['All', 'Easy', 'Medium', 'Hard'] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => {
                    sound.playClick();
                    setDifficulty(diff);
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    difficulty === diff
                      ? 'bg-[#1C2426] text-white border-[#FFAD42] shadow-subtle'
                      : 'bg-[#101314] text-[#9AA5A6] border-[#253033] hover:border-[#3E4C50]'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Topic Preference */}
          <div className="space-y-2">
            <label className="text-xs text-[#9AA5A6] font-medium block">Algorithm Category</label>
            <div className="flex flex-wrap gap-1.5">
              {topicOptions.map((top) => (
                <button
                  key={top}
                  onClick={() => {
                    sound.playClick();
                    setTopic(top);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    topic === top
                      ? 'bg-[#FFAD42]/15 text-[#FFAD42] border-[#FFAD42]/40'
                      : 'bg-[#101314] text-[#9AA5A6] border-[#253033] hover:text-white hover:border-[#3E4C50]'
                  }`}
                >
                  {top}
                </button>
              ))}
            </div>
          </div>

          {/* Primary Action Button */}
          {isSearching ? (
            <div className="p-4 rounded-xl bg-[#101314] border border-[#FFAD42]/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-[#FFAD42] border-t-transparent rounded-full animate-spin" />
                <div>
                  <div className="text-xs font-semibold text-white">Searching for Duel Opponent...</div>
                  <div className="text-[10px] text-[#9AA5A6]">Matching skill rating around {user.rating} Elo</div>
                </div>
              </div>
              <div className="flex items-center gap-3 font-mono">
                <span className="text-xs font-bold text-[#FFAD42]">{formatSearchTime(searchTimer)}</span>
                <button
                  onClick={handleCancelSearch}
                  className="px-2.5 py-1 rounded bg-[#253033] hover:bg-[#3E4C50] text-[11px] text-[#9AA5A6] hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleStartSearch}
              className="w-full py-3 rounded-xl bg-[#FFAD42] hover:bg-[#E59830] text-[#101314] font-bold text-sm flex items-center justify-center gap-2 shadow-subtle transition-all"
            >
              <Swords className="w-4 h-4" />
              <span>Find Match (Random Duel)</span>
            </button>
          )}
        </div>

        {/* Right Column: Private Duel Room & Join Code */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Create Private Duel */}
          <div className="bg-[#141A1C] border border-[#253033] rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#00E5FF]" />
              <h3 className="font-bold text-sm text-white">Challenge a Friend</h3>
            </div>
            <p className="text-xs text-[#9AA5A6]">
              Create an invite room with deterministic test cases and share the duel code with your friend.
            </p>

            {createdRoomCode ? (
              <div className="p-3 rounded-xl bg-[#101314] border border-[#253033] space-y-3 font-mono">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#9AA5A6]">Room Code:</span>
                  <span className="text-[#FFAD42] font-bold text-base tracking-wider">{createdRoomCode}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(createdRoomCode);
                      setCopiedCode(true);
                      setTimeout(() => setCopiedCode(false), 2000);
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-[#1C2426] hover:bg-[#253033] border border-[#253033] text-xs font-semibold text-white flex items-center justify-center gap-1.5"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-[#B5FF4A]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                  </button>
                  <button
                    onClick={handleEnterCreatedRoom}
                    className="flex-1 py-1.5 rounded-lg bg-[#FFAD42] hover:bg-[#E59830] text-xs font-bold text-[#101314] flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Enter Room</span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleCreatePrivateDuel}
                className="w-full py-2.5 rounded-xl bg-[#1C2426] hover:bg-[#253033] border border-[#253033] hover:border-[#3E4C50] text-xs font-semibold text-white flex items-center justify-center gap-2 transition-all"
              >
                <span>Generate Private Duel Room</span>
              </button>
            )}
          </div>

          {/* Join with Room Code */}
          <div className="bg-[#141A1C] border border-[#253033] rounded-2xl p-5 space-y-3">
            <h3 className="font-bold text-xs text-white uppercase tracking-wider">Join with Code</h3>
            <form onSubmit={handleJoinBattle} className="flex gap-2">
              <input
                type="text"
                value={inputBattleCode}
                onChange={(e) => setInputBattleCode(e.target.value.toUpperCase())}
                placeholder="Enter Code (DEV-XXXX)"
                className="flex-1 bg-[#101314] border border-[#253033] focus:border-[#FFAD42] rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-[#64748B] focus:outline-none"
              />
              <button
                type="submit"
                disabled={!inputBattleCode.trim()}
                className="px-4 py-2 rounded-xl bg-[#1C2426] hover:bg-[#253033] border border-[#253033] text-xs font-bold text-[#FFAD42] disabled:opacity-40 transition-all"
              >
                Join
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. DIRECT PROBLEM DUEL SELECTOR                                */}
      {/* ============================================================== */}
      <div className="bg-[#141A1C] border border-[#253033] rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#253033]">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-[#00E5FF]" />
            <h2 className="font-bold text-sm text-white">Direct Problem Duels</h2>
          </div>
          <span className="text-xs text-[#9AA5A6]">Click any problem to launch an instant battle room</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {CODING_PROBLEMS.slice(0, 9).map((prob) => (
            <div
              key={prob.id}
              onClick={() => handleDirectProblemBattle(prob)}
              className="p-3.5 rounded-xl bg-[#101314] border border-[#253033] hover:border-[#FFAD42]/50 hover:bg-[#182022] cursor-pointer transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-[#9AA5A6] text-[11px]">#{prob.leetcodeNumber || '•'}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold font-mono border ${
                  prob.difficulty === 'Easy'
                    ? 'bg-[#B5FF4A]/10 text-[#B5FF4A] border-[#B5FF4A]/30'
                    : prob.difficulty === 'Medium'
                    ? 'bg-[#FFAD42]/10 text-[#FFAD42] border-[#FFAD42]/30'
                    : 'bg-[#FF5C67]/10 text-[#FF5C67] border-[#FF5C67]/30'
                }`}>
                  {prob.difficulty}
                </span>
              </div>

              <div className="font-bold text-xs text-white group-hover:text-[#FFAD42] truncate transition-colors">
                {prob.title}
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#9AA5A6] pt-1">
                <span>{prob.category}</span>
                <span className="flex items-center gap-1 text-[#FFAD42] font-semibold group-hover:translate-x-0.5 transition-transform">
                  <span>Duel</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
