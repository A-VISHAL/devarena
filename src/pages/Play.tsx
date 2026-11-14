import React, { useState } from 'react';
import { 
  Gamepad2, 
  Sparkles, 
  Brain, 
  Users, 
  Play as PlayIcon, 
  Flame, 
  Trophy, 
  ArrowRight, 
  Zap, 
  CheckCircle2, 
  Search,
  Filter
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CasualGameId, GameCategory } from '../types';
import { WordPuzzle } from '../components/games/WordPuzzle';
import { OddOneOut } from '../components/games/OddOneOut';
import { PatternMaster } from '../components/games/PatternMaster';
import { MemoryGrid } from '../components/games/MemoryGrid';
import { ReactionChallenge } from '../components/games/ReactionChallenge';
import { QuickMath } from '../components/games/QuickMath';
import { LogicSprint } from '../components/games/LogicSprint';
import { CasualMultiplayerRoom } from '../components/games/CasualMultiplayerRoom';
import { sound } from '../utils/sound';

export const Play: React.FC = () => {
  const { 
    activeGame, 
    setActiveGame, 
    activeMultiplayerCode,
    completedDailyChallenge 
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<GameCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // If a game is active, render the specific game view
  if (activeGame === 'word-puzzle') return <WordPuzzle onBack={() => setActiveGame(null)} />;
  if (activeGame === 'odd-one-out') return <OddOneOut onBack={() => setActiveGame(null)} />;
  if (activeGame === 'pattern-master') return <PatternMaster onBack={() => setActiveGame(null)} />;
  if (activeGame === 'memory-grid') return <MemoryGrid onBack={() => setActiveGame(null)} />;
  if (activeGame === 'reaction-challenge') return <ReactionChallenge onBack={() => setActiveGame(null)} />;
  if (activeGame === 'quick-math') return <QuickMath onBack={() => setActiveGame(null)} />;
  if (activeGame === 'logic-sprint') return <LogicSprint onBack={() => setActiveGame(null)} />;
  if (activeGame === 'multiplayer-math') {
    return (
      <CasualMultiplayerRoom 
        initialRoomCode={activeMultiplayerCode} 
        onBack={() => setActiveGame(null)} 
      />
    );
  }

  const allGames = [
    {
      id: 'word-puzzle' as CasualGameId,
      title: 'Daily Word Puzzle',
      category: 'daily' as GameCategory,
      description: 'Guess the hidden 5-letter word in 6 attempts with color-coded tile feedback. Global synchronized daily word.',
      icon: '🟩',
      difficulty: 'Medium',
      playerCount: 'Solo / Daily',
      playTime: '3-5 mins',
      accent: 'emerald',
      isDaily: true,
      completed: completedDailyChallenge
    },
    {
      id: 'odd-one-out' as CasualGameId,
      title: 'Odd One Out',
      category: 'daily' as GameCategory,
      description: 'Spot the subtle symbol, rotation, or shade difference across 10 levels before the timer runs out.',
      icon: '🔍',
      difficulty: 'Dynamic',
      playerCount: 'Solo',
      playTime: '2 mins',
      accent: 'amber'
    },
    {
      id: 'pattern-master' as CasualGameId,
      title: 'Pattern Master',
      category: 'daily' as GameCategory,
      description: 'Deduce arithmetic, geometric, Fibonacci, and rotational sequences with progressive combo multipliers.',
      icon: '📈',
      difficulty: 'Medium',
      playerCount: 'Solo',
      playTime: '3 mins',
      accent: 'violet'
    },
    {
      id: 'memory-grid' as CasualGameId,
      title: 'Memory Grid',
      category: 'brain' as GameCategory,
      description: 'Working memory workout: memorize flashing spatial tiles on an expanding grid from 3x3 to 5x5.',
      icon: '🧠',
      difficulty: 'Scales to 5x5',
      playerCount: 'Solo',
      playTime: '3 mins',
      accent: 'cyan'
    },
    {
      id: 'reaction-challenge' as CasualGameId,
      title: 'Reaction Challenge',
      category: 'brain' as GameCategory,
      description: 'High-precision millisecond reflex benchmark with genuine percentile metrics and false-start detection.',
      icon: '⚡',
      difficulty: 'Reflex Test',
      playerCount: 'Solo',
      playTime: '1 min',
      accent: 'cyan'
    },
    {
      id: 'quick-math' as CasualGameId,
      title: 'Quick Math Sprint',
      category: 'brain' as GameCategory,
      description: '60-second rapid-fire mental arithmetic sprint with combo streaks and answers-per-minute rating.',
      icon: '🧮',
      difficulty: 'Adaptive',
      playerCount: 'Solo',
      playTime: '60 secs',
      accent: 'emerald'
    },
    {
      id: 'logic-sprint' as CasualGameId,
      title: 'Logic Sprint',
      category: 'brain' as GameCategory,
      description: 'Five quick deductive reasoning puzzles covering syllogisms, truth-tellers, angles, and balance logic.',
      icon: '🧭',
      difficulty: 'Challenging',
      playerCount: 'Solo',
      playTime: '4 mins',
      accent: 'violet'
    },
    {
      id: 'multiplayer-math' as CasualGameId,
      title: 'Quick Math 1v1 Clash',
      category: 'multiplayer' as GameCategory,
      description: 'Live 1v1 real-time math duel. Challenge a friend with a share link or room code and watch live score bars.',
      icon: '⚔️',
      difficulty: 'Competitive',
      playerCount: '2 Players (Live)',
      playTime: '45 secs',
      accent: 'rose',
      isMultiplayer: true
    }
  ];

  const filteredGames = allGames.filter(g => {
    const matchesCat = selectedCategory === 'all' || g.category === selectedCategory;
    const matchesSearch = g.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          g.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-arena-border">
        <div>
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-6 h-6 text-emerald-400" />
            <h1 className="text-2xl font-black text-white">Casual Gaming Hub</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Original puzzles and brain games designed for quick thinking, friendly challenges, and social fun.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search games..."
            className="w-full bg-arena-surface border border-arena-border rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: 'all', label: 'All Games', icon: <Sparkles className="w-3.5 h-3.5" /> },
          { id: 'daily', label: 'Daily Puzzles', icon: <Flame className="w-3.5 h-3.5 text-amber-400" /> },
          { id: 'brain', label: 'Brain & Reflexes', icon: <Brain className="w-3.5 h-3.5 text-cyan-400" /> },
          { id: 'multiplayer', label: 'Multiplayer Rooms', icon: <Users className="w-3.5 h-3.5 text-rose-400" /> },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              sound.playClick();
              setSelectedCategory(cat.id as any);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedCategory === cat.id
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20'
                : 'bg-arena-surface text-slate-400 hover:text-white border border-arena-border hover:bg-slate-800'
            }`}
          >
            {cat.icon}
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Games Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredGames.map((game) => (
          <div
            key={game.id}
            onClick={() => {
              sound.playClick();
              setActiveGame(game.id);
            }}
            className="arena-card p-6 flex flex-col justify-between hover:border-violet-500/50 hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-200 cursor-pointer group relative overflow-hidden"
          >
            {game.isMultiplayer && (
              <div className="absolute top-0 right-0 bg-gradient-to-l from-rose-600 to-violet-600 text-[10px] font-black text-white px-3 py-1 rounded-bl-xl shadow-md">
                LIVE 1V1 MULTIPLAYER
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl p-2 rounded-2xl bg-slate-900 border border-slate-800">
                  {game.icon}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700">
                  {game.difficulty}
                </span>
              </div>

              <h3 className="font-black text-base text-white group-hover:text-violet-300 transition-colors flex items-center gap-2">
                <span>{game.title}</span>
                {game.completed && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                )}
              </h3>

              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                {game.description}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                <span>{game.playTime}</span>
                <span>•</span>
                <span>{game.playerCount}</span>
              </div>

              <span className="text-xs font-bold text-violet-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                <span>{game.isMultiplayer ? 'Create / Join Room' : 'Play Now'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
