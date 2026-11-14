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
  Eye,
  Activity,
  Calculator,
  Compass,
  Layers,
  Swords
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
      icon: <Sparkles className="w-5 h-5 text-arena-teal" />,
      difficulty: 'Medium',
      playerCount: 'Solo / Daily',
      playTime: '3-5 mins',
      completed: completedDailyChallenge
    },
    {
      id: 'odd-one-out' as CasualGameId,
      title: 'Odd One Out',
      category: 'daily' as GameCategory,
      description: 'Spot the subtle symbol, rotation, or shade difference across 10 levels before the timer runs out.',
      icon: <Eye className="w-5 h-5 text-arena-blue" />,
      difficulty: 'Dynamic',
      playerCount: 'Solo',
      playTime: '2 mins'
    },
    {
      id: 'pattern-master' as CasualGameId,
      title: 'Pattern Master',
      category: 'daily' as GameCategory,
      description: 'Deduce arithmetic, geometric, Fibonacci, and rotational sequences with progressive combo multipliers.',
      icon: <Layers className="w-5 h-5 text-arena-teal" />,
      difficulty: 'Medium',
      playerCount: 'Solo',
      playTime: '3 mins'
    },
    {
      id: 'memory-grid' as CasualGameId,
      title: 'Memory Grid',
      category: 'brain' as GameCategory,
      description: 'Working memory workout: memorize flashing spatial tiles on an expanding grid from 3x3 to 5x5.',
      icon: <Brain className="w-5 h-5 text-arena-blue" />,
      difficulty: '3x3 to 5x5',
      playerCount: 'Solo',
      playTime: '3 mins'
    },
    {
      id: 'reaction-challenge' as CasualGameId,
      title: 'Reaction Challenge',
      category: 'brain' as GameCategory,
      description: 'High-precision millisecond reflex benchmark with genuine percentile metrics and false-start detection.',
      icon: <Activity className="w-5 h-5 text-arena-teal" />,
      difficulty: 'Reflex Test',
      playerCount: 'Solo',
      playTime: '1 min'
    },
    {
      id: 'quick-math' as CasualGameId,
      title: 'Quick Math Sprint',
      category: 'brain' as GameCategory,
      description: '60-second rapid-fire mental arithmetic sprint with combo streaks and answers-per-minute rating.',
      icon: <Calculator className="w-5 h-5 text-arena-blue" />,
      difficulty: 'Adaptive',
      playerCount: 'Solo',
      playTime: '60 secs'
    },
    {
      id: 'logic-sprint' as CasualGameId,
      title: 'Logic Sprint',
      category: 'brain' as GameCategory,
      description: 'Five quick deductive reasoning puzzles covering syllogisms, truth-tellers, angles, and balance logic.',
      icon: <Compass className="w-5 h-5 text-arena-teal" />,
      difficulty: 'Challenging',
      playerCount: 'Solo',
      playTime: '4 mins'
    },
    {
      id: 'multiplayer-math' as CasualGameId,
      title: 'Quick Math 1v1 Clash',
      category: 'multiplayer' as GameCategory,
      description: 'Live 1v1 real-time math duel. Challenge a friend with a share link or room code and watch live score bars.',
      icon: <Swords className="w-5 h-5 text-arena-blue" />,
      difficulty: 'Competitive',
      playerCount: '2 Players (Live)',
      playTime: '45 secs',
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-arena-border">
        <div>
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-arena-teal" />
            <h1 className="text-2xl font-bold text-arena-textPrimary">Casual Gaming Hub</h1>
          </div>
          <p className="text-xs text-arena-textSecondary mt-1">
            Original puzzles and brain games designed for quick thinking, friendly challenges, and social play.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-arena-textSubtle absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search games..."
            className="w-full bg-arena-surface border border-arena-border rounded-lg pl-9 pr-3 py-1.5 text-xs text-arena-textPrimary focus:outline-none focus:border-arena-borderHover"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: 'all', label: 'All Games' },
          { id: 'daily', label: 'Daily Puzzles', icon: <Flame className="w-3.5 h-3.5 text-arena-warning" /> },
          { id: 'brain', label: 'Brain & Reflexes', icon: <Brain className="w-3.5 h-3.5 text-arena-blue" /> },
          { id: 'multiplayer', label: 'Multiplayer Rooms', icon: <Users className="w-3.5 h-3.5 text-arena-teal" /> },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              sound.playClick();
              setSelectedCategory(cat.id as any);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedCategory === cat.id
                ? 'bg-arena-elevated text-arena-textPrimary border border-arena-border shadow-subtle'
                : 'bg-arena-surface text-arena-textSecondary hover:text-arena-textPrimary border border-arena-border'
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
            className="arena-card p-5 flex flex-col justify-between cursor-pointer group relative"
          >
            {game.isMultiplayer && (
              <div className="absolute top-3 right-3 text-[10px] font-semibold px-2 py-0.5 rounded bg-arena-elevated text-arena-blue border border-arena-border">
                LIVE 1V1
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-lg bg-arena-elevated border border-arena-border">
                  {game.icon}
                </div>
                {!game.isMultiplayer && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-arena-elevated text-arena-textSecondary border border-arena-border">
                    {game.difficulty}
                  </span>
                )}
              </div>

              <h3 className="font-bold text-sm text-arena-textPrimary group-hover:text-arena-blue transition-colors flex items-center gap-1.5">
                <span>{game.title}</span>
                {game.completed && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-arena-success shrink-0" />
                )}
              </h3>

              <p className="text-xs text-arena-textSecondary mt-1.5 leading-relaxed">
                {game.description}
              </p>
            </div>

            <div className="pt-3.5 mt-4 border-t border-arena-border flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-[11px] text-arena-textSubtle">
                <span>{game.playTime}</span>
                <span>•</span>
                <span>{game.playerCount}</span>
              </div>

              <span className="text-xs font-semibold text-arena-blue group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                <span>{game.isMultiplayer ? 'Enter Room' : 'Play'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
