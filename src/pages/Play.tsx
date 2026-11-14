import React, { useState, useRef } from 'react';
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
  Swords,
  ChevronLeft,
  ChevronRight,
  Clock,
  Heart,
  Bookmark,
  Award,
  Share2,
  Filter,
  Check,
  CircleDot,
  History,
  Grid
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CasualGameId, GameCategory, GameResultData } from '../types';
import { ZipGame } from '../components/games/ZipGame';
import { WordPuzzle } from '../components/games/WordPuzzle';
import { OddOneOut } from '../components/games/OddOneOut';
import { PatternMaster } from '../components/games/PatternMaster';
import { MemoryGrid } from '../components/games/MemoryGrid';
import { ReactionChallenge } from '../components/games/ReactionChallenge';
import { QuickMath } from '../components/games/QuickMath';
import { LogicSprint } from '../components/games/LogicSprint';
import { CasualMultiplayerRoom } from '../components/games/CasualMultiplayerRoom';
import { GameResultView } from '../components/games/GameResultView';
import { CASUAL_LEADERBOARD } from '../data/mockData';
import { sound } from '../utils/sound';

export const Play: React.FC = () => {
  const { 
    user,
    activeGame, 
    setActiveGame, 
    activeMultiplayerCode,
    completedDailyChallenge,
    gameResultData,
    setGameResultData,
    toggleSaveGame
  } = useApp();

  // Navigation & Filtering State
  const [navTab, setNavTab] = useState<'all' | 'daily' | 'brain' | 'logic' | 'multiplayer' | 'recent' | 'saved' | 'best' | 'history' | 'challenges'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'Easy' | 'Medium' | 'Hard'>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'rating'>('popular');
  const [leaderboardTab, setLeaderboardTab] = useState<'global' | 'friends'>('global');
  const [quickRoomCode, setQuickRoomCode] = useState('');

  // Carousel ref for horizontal puzzle strip
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (direction: 'left' | 'right') => {
    sound.playClick();
    if (carouselRef.current) {
      const scrollAmount = 300;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // If a game is active, render the dedicated focused gameplay interface
  if (activeGame === 'zip') {
    return (
      <ZipGame 
        onBack={() => setActiveGame(null)} 
        onComplete={(res) => {
          setGameResultData(res);
          setActiveGame(null);
        }} 
      />
    );
  }
  if (activeGame === 'word-puzzle') {
    return (
      <WordPuzzle 
        onBack={() => setActiveGame(null)} 
        onComplete={(res) => {
          setGameResultData(res);
          setActiveGame(null);
        }}
      />
    );
  }
  if (activeGame === 'odd-one-out') return <OddOneOut onBack={() => setActiveGame(null)} />;
  if (activeGame === 'pattern-master') return <PatternMaster onBack={() => setActiveGame(null)} />;
  if (activeGame === 'memory-grid') return <MemoryGrid onBack={() => setActiveGame(null)} />;
  if (activeGame === 'reaction-challenge') return <ReactionChallenge onBack={() => setActiveGame(null)} />;
  if (activeGame === 'quick-math') {
    return (
      <QuickMath 
        onBack={() => setActiveGame(null)} 
        onComplete={(res) => {
          setGameResultData(res);
          setActiveGame(null);
        }}
      />
    );
  }
  if (activeGame === 'logic-sprint') return <LogicSprint onBack={() => setActiveGame(null)} />;
  if (activeGame === 'multiplayer-math') {
    return (
      <CasualMultiplayerRoom 
        initialRoomCode={activeMultiplayerCode} 
        onBack={() => setActiveGame(null)} 
      />
    );
  }

  // If viewing a post-game result screen and no game active
  if (gameResultData && !activeGame) {
    return (
      <GameResultView
        result={gameResultData}
        onPlayAgain={() => {
          const gId = gameResultData.gameId;
          setGameResultData(null);
          setActiveGame(gId);
        }}
        onBackToHub={() => setGameResultData(null)}
        onSelectGame={(gId) => {
          setGameResultData(null);
          setActiveGame(gId);
        }}
      />
    );
  }

  const allGames = [
    {
      id: 'zip' as CasualGameId,
      title: 'Zip',
      challengeNumber: 42,
      category: 'daily' as GameCategory,
      description: 'Connect numbered nodes in sequential order across an orthogonal spatial grid without crossing obstacle walls.',
      shortDesc: 'Daily spatial number path puzzle',
      icon: <Layers className="w-5 h-5 text-arena-amber" />,
      difficulty: 'Medium',
      playerCount: 'Solo / Daily',
      playTime: '2-3 mins',
      isDaily: true,
      isPopular: true,
      friendsPlayedCount: 14,
      tag: 'Spatial Logic'
    },
    {
      id: 'word-puzzle' as CasualGameId,
      title: 'Daily Word Puzzle',
      challengeNumber: 184,
      category: 'daily' as GameCategory,
      description: 'Guess the hidden 5-letter technical word in 6 attempts with color-coded feedback. Global synchronized puzzle.',
      shortDesc: '5-letter wordle puzzle',
      icon: <Sparkles className="w-5 h-5 text-arena-teal" />,
      difficulty: 'Medium',
      playerCount: 'Solo / Daily',
      playTime: '3-5 mins',
      isDaily: true,
      isPopular: true,
      completed: completedDailyChallenge,
      friendsPlayedCount: 22,
      tag: 'Word Logic'
    },
    {
      id: 'pattern-master' as CasualGameId,
      title: 'Pattern Master',
      challengeNumber: 68,
      category: 'logic' as GameCategory,
      description: 'Deduce arithmetic, geometric, Fibonacci, and rotational sequences with progressive combo streaks.',
      shortDesc: 'Sequence reasoning puzzle',
      icon: <Grid className="w-5 h-5 text-arena-amber" />,
      difficulty: 'Medium',
      playerCount: 'Solo',
      playTime: '3 mins',
      isPopular: true,
      friendsPlayedCount: 9,
      tag: 'Sequences'
    },
    {
      id: 'quick-math' as CasualGameId,
      title: 'Quick Math Sprint',
      category: 'brain' as GameCategory,
      description: '60-second rapid-fire mental arithmetic sprint tracking speed, combo streaks, and accuracy rating.',
      shortDesc: '60s mental math sprint',
      icon: <Calculator className="w-5 h-5 text-arena-teal" />,
      difficulty: 'Dynamic',
      playerCount: 'Solo',
      playTime: '60 secs',
      isPopular: true,
      friendsPlayedCount: 18,
      tag: 'Mental Sprint'
    },
    {
      id: 'reaction-challenge' as CasualGameId,
      title: 'Reaction Challenge',
      category: 'brain' as GameCategory,
      description: 'High-precision millisecond reflex benchmark with true percentile statistics and false-start detection.',
      shortDesc: 'Millisecond reflex benchmark',
      icon: <Activity className="w-5 h-5 text-arena-amber" />,
      difficulty: 'Easy',
      playerCount: 'Solo',
      playTime: '1 min',
      friendsPlayedCount: 11,
      tag: 'Reflex'
    },
    {
      id: 'memory-grid' as CasualGameId,
      title: 'Memory Grid',
      category: 'brain' as GameCategory,
      description: 'Working memory workout: memorize flashing spatial tiles on an expanding grid from 3x3 to 5x5.',
      shortDesc: 'Spatial pattern recall',
      icon: <Brain className="w-5 h-5 text-arena-teal" />,
      difficulty: 'Medium',
      playerCount: 'Solo',
      playTime: '2 mins',
      friendsPlayedCount: 8,
      tag: 'Working Memory'
    },
    {
      id: 'logic-sprint' as CasualGameId,
      title: 'Logic Sprint',
      category: 'logic' as GameCategory,
      description: 'Five quick deductive reasoning puzzles covering syllogisms, truth-tellers, angles, and balance logic.',
      shortDesc: 'Deductive reasoning riddles',
      icon: <Compass className="w-5 h-5 text-arena-amber" />,
      difficulty: 'Hard',
      playerCount: 'Solo',
      playTime: '4 mins',
      friendsPlayedCount: 6,
      tag: 'Deduction'
    },
    {
      id: 'odd-one-out' as CasualGameId,
      title: 'Odd One Out',
      category: 'brain' as GameCategory,
      description: 'Spot subtle symbols, rotations, or shade differences across 10 timed levels before timer expires.',
      shortDesc: 'Visual speed inspection',
      icon: <Eye className="w-5 h-5 text-arena-teal" />,
      difficulty: 'Dynamic',
      playerCount: 'Solo',
      playTime: '2 mins',
      friendsPlayedCount: 12,
      tag: 'Visual Speed'
    },
    {
      id: 'multiplayer-math' as CasualGameId,
      title: 'Quick Math 1v1 Clash',
      category: 'multiplayer' as GameCategory,
      description: 'Live 1v1 real-time math duel. Challenge a friend with a share link or room code and watch live score bars.',
      shortDesc: 'Synchronized live duel',
      icon: <Swords className="w-5 h-5 text-arena-amber" />,
      difficulty: 'Dynamic',
      playerCount: '2 Players (Live)',
      playTime: '45 secs',
      isMultiplayer: true,
      friendsPlayedCount: 15,
      tag: 'Live Duel'
    }
  ];

  // Filtering Logic
  const filteredCatalog = allGames.filter(g => {
    // Left Sidebar Navigation Filters
    if (navTab === 'daily' && g.category !== 'daily') return false;
    if (navTab === 'brain' && g.category !== 'brain') return false;
    if (navTab === 'logic' && g.category !== 'logic') return false;
    if (navTab === 'multiplayer' && !g.isMultiplayer) return false;
    if (navTab === 'saved' && !(user.savedGames || []).includes(g.id)) return false;
    if (navTab === 'recent' && !(user.recentlyPlayedGames || []).includes(g.id)) return false;

    // Center Filter Pills
    if (difficultyFilter !== 'all' && g.difficulty !== difficultyFilter) return false;

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = g.title.toLowerCase().includes(q);
      const matchDesc = g.description.toLowerCase().includes(q);
      const matchTag = g.tag.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchTag) return false;
    }

    return true;
  });

  const handleLaunchGame = (gameId: CasualGameId) => {
    sound.playClick();
    setActiveGame(gameId);
  };

  const handleJoinQuickRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickRoomCode.trim()) return;
    sound.playClick();
    setActiveGame('multiplayer-math');
  };

  return (
    <div className="page-container py-8 space-y-8 animate-in fade-in">
      
      {/* 3-COLUMN DESKTOP COMPOSITION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ========================================================= */}
        {/* A. LEFT SIDEBAR — GAME NAVIGATION (3 COLS)                */}
        {/* ========================================================= */}
        <aside className="lg:col-span-3 space-y-6">
          
          <div className="arena-card p-4 space-y-5">
            
            {/* Section: Discover */}
            <div>
              <span className="text-[10px] font-bold text-arena-textSubtle uppercase tracking-wider block mb-2 px-2">
                DISCOVER
              </span>
              <nav className="space-y-1">
                {[
                  { id: 'all', label: 'All Games', icon: <Gamepad2 className="w-4 h-4 text-arena-amber" />, count: allGames.length },
                  { id: 'daily', label: 'Daily Puzzles', icon: <Flame className="w-4 h-4 text-arena-warning" />, count: 2 },
                  { id: 'brain', label: 'Brain & Reflex', icon: <Brain className="w-4 h-4 text-arena-textSecondary" />, count: 4 },
                  { id: 'logic', label: 'Logic & Sequences', icon: <Compass className="w-4 h-4 text-arena-amber" />, count: 2 },
                  { id: 'multiplayer', label: 'Multiplayer Rooms', icon: <Swords className="w-4 h-4 text-arena-cyan" />, badge: 'LIVE' },
                ].map((item) => {
                  const isActive = navTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        sound.playClick();
                        setNavTab(item.id as any);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-arena-elevated text-arena-textPrimary border border-arena-border shadow-subtle'
                          : 'text-arena-textSecondary hover:text-arena-textPrimary hover:bg-arena-elevated/40'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                      {item.count !== undefined && (
                        <span className="text-[10px] font-mono text-arena-textSubtle bg-arena-surface px-1.5 py-0.2 rounded border border-arena-border">
                          {item.count}
                        </span>
                      )}
                      {item.badge && (
                        <span className="text-[9px] font-mono font-bold text-arena-cyan bg-arena-cyan/15 px-1.5 py-0.2 rounded border border-arena-cyan/30 animate-pulse">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Section: Your Activity */}
            <div className="pt-3 border-t border-arena-border">
              <span className="text-[10px] font-bold text-arena-textSubtle uppercase tracking-wider block mb-2 px-2">
                YOUR ACTIVITY
              </span>
              <nav className="space-y-1">
                {[
                  { id: 'recent', label: 'Recently Played', icon: <Clock className="w-4 h-4 text-arena-textSubtle" />, count: user.recentlyPlayedGames?.length || 0 },
                  { id: 'saved', label: 'Saved Puzzles', icon: <Bookmark className="w-4 h-4 text-arena-textSubtle" />, count: user.savedGames?.length || 0 },
                  { id: 'best', label: 'Your Best Scores', icon: <Trophy className="w-4 h-4 text-arena-amber" /> },
                  { id: 'history', label: 'Game History', icon: <History className="w-4 h-4 text-arena-textSubtle" />, count: user.gameHistory?.length || 0 }
                ].map((item) => {
                  const isActive = navTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        sound.playClick();
                        setNavTab(item.id as any);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-arena-elevated text-arena-textPrimary border border-arena-border shadow-subtle'
                          : 'text-arena-textSecondary hover:text-arena-textPrimary hover:bg-arena-elevated/40'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                      {item.count !== undefined && item.count > 0 && (
                        <span className="text-[10px] font-mono text-arena-textSubtle bg-arena-surface px-1.5 py-0.2 rounded border border-arena-border">
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Section: Challenges */}
            <div className="pt-3 border-t border-arena-border">
              <span className="text-[10px] font-bold text-arena-textSubtle uppercase tracking-wider block mb-2 px-2">
                CHALLENGES
              </span>
              <nav className="space-y-1">
                <button
                  onClick={() => {
                    sound.playClick();
                    setNavTab('challenges');
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    navTab === 'challenges'
                      ? 'bg-arena-elevated text-arena-textPrimary border border-arena-border shadow-subtle'
                      : 'text-arena-textSecondary hover:text-arena-textPrimary hover:bg-arena-elevated/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Zap className="w-4 h-4 text-arena-amber" />
                    <span>Friend Challenges</span>
                  </div>
                  {user.challenges && user.challenges.length > 0 && (
                    <span className="text-[10px] font-mono font-bold text-arena-cyan bg-arena-cyan/15 px-1.5 py-0.2 rounded border border-arena-cyan/30">
                      {user.challenges.length} New
                    </span>
                  )}
                </button>
              </nav>
            </div>

          </div>

          {/* Daily Streak Card in Left Sidebar */}
          <div className="p-4 rounded-xl bg-arena-surface border border-arena-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-arena-textPrimary flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-arena-warning" />
                <span>Daily Streak</span>
              </span>
              <span className="text-xs font-bold font-mono text-arena-warning">{user.streak} Days</span>
            </div>
            <p className="text-[11px] text-arena-textSecondary leading-relaxed">
              Play today's featured Zip or Word Puzzle to keep your daily streak alive.
            </p>
            <div className="pt-1 text-[10px] font-mono text-arena-textSubtle">
              Resets in: 03h 22m
            </div>
          </div>

        </aside>

        {/* ========================================================= */}
        {/* B. CENTER CONTENT — DISCOVERY & SOCIAL (6 COLS)           */}
        {/* ========================================================= */}
        <div className="lg:col-span-6 space-y-7">
          
          {/* Header Bar */}
          <div className="space-y-3 pb-2 border-b border-arena-border">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-arena-textPrimary tracking-tight">
                Explore Games
              </h1>
              <p className="text-xs sm:text-sm text-arena-textSecondary mt-1 leading-relaxed">
                Take a break, challenge your mind, and compete with friends.
              </p>
            </div>

            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-arena-textSubtle absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search puzzles and games..."
                  className="w-full bg-arena-surface border border-arena-border rounded-lg pl-9 pr-3 py-1.5 text-xs text-arena-textPrimary focus:outline-none focus:border-arena-borderHover"
                />
              </div>

              {/* Difficulty Filter */}
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value as any)}
                className="bg-arena-surface border border-arena-border rounded-lg px-3 py-1.5 text-xs text-arena-textPrimary focus:outline-none"
              >
                <option value="all">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          {/* ======================================================= */}
          {/* SECTION 1 — FEATURED DAILY CHALLENGE (Distinct Hero)    */}
          {/* ======================================================= */}
          <section className="rounded-2xl bg-arena-surface border border-arena-border p-6 relative overflow-hidden group">
            
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-arena-elevated border border-arena-border text-arena-amber text-[10px] font-bold font-mono tracking-wider mb-2">
                  <Flame className="w-3 h-3 text-arena-warning" />
                  <span>FEATURED DAILY CHALLENGE • #42</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-arena-textPrimary">
                  Zip — Number Path Puzzle
                </h2>
                <p className="text-xs text-arena-textSecondary mt-1 leading-relaxed max-w-lg">
                  Draw a continuous path through an orthogonal grid connecting numbered nodes 1 through 6 in order. Avoid dark obstacle walls and plan your path to hit each waypoint cleanly.
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] font-semibold text-arena-textSubtle block font-mono">CHALLENGE #42</span>
                <span className="text-xs font-semibold text-arena-teal font-mono">Medium • 3 mins</span>
              </div>
            </div>

            <div className="pt-4 mt-2 border-t border-arena-border flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-xs text-arena-textSecondary">
                <span className="flex items-center gap-1 font-semibold text-arena-warning font-mono">
                  <Flame className="w-3.5 h-3.5" />
                  <span>+1 Streak Day</span>
                </span>
                <span>•</span>
                <span className="text-arena-textSubtle">14 friends played</span>
              </div>

              <button
                onClick={() => handleLaunchGame('zip')}
                className="btn-primary py-2 px-5 text-xs font-semibold gap-1.5 shadow-sm"
              >
                <PlayIcon className="w-3.5 h-3.5 fill-current" />
                <span>Play Today's Zip</span>
              </button>
            </div>
          </section>

          {/* ======================================================= */}
          {/* SECTION 2 — WIND DOWN WITH A PUZZLE (Horizontal Strip) */}
          {/* ======================================================= */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-arena-textPrimary flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-arena-teal" />
                  <span>Wind down with a puzzle</span>
                </h3>
                <p className="text-[11px] text-arena-textSecondary">Quick games designed for mental clarity and focus</p>
              </div>

              {/* Carousel Scroll Arrows */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => scrollCarousel('left')}
                  className="p-1 rounded-lg bg-arena-surface border border-arena-border text-arena-textSecondary hover:text-arena-textPrimary hover:bg-arena-elevated transition-colors"
                  title="Scroll left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollCarousel('right')}
                  className="p-1 rounded-lg bg-arena-surface border border-arena-border text-arena-textSecondary hover:text-arena-textPrimary hover:bg-arena-elevated transition-colors"
                  title="Scroll right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Horizontal Scrollable Carousel Container */}
            <div 
              ref={carouselRef}
              className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-arena-border scroll-smooth select-none"
            >
              {[
                allGames.find(g => g.id === 'zip')!,
                allGames.find(g => g.id === 'word-puzzle')!,
                allGames.find(g => g.id === 'pattern-master')!,
                allGames.find(g => g.id === 'quick-math')!,
                allGames.find(g => g.id === 'memory-grid')!,
                allGames.find(g => g.id === 'logic-sprint')!,
                allGames.find(g => g.id === 'odd-one-out')!
              ].map((game) => (
                <div
                  key={game.id}
                  onClick={() => handleLaunchGame(game.id)}
                  className="w-56 shrink-0 arena-card p-4 flex flex-col justify-between cursor-pointer group hover:border-arena-borderHover transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="p-2 rounded-lg bg-arena-elevated border border-arena-border">
                        {game.icon}
                      </div>
                      <span className="text-[10px] font-semibold text-arena-amber font-mono bg-arena-elevated px-1.5 py-0.2 rounded border border-arena-border">
                        {game.challengeNumber ? `#${game.challengeNumber}` : game.playTime}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-arena-textPrimary group-hover:text-arena-amber transition-colors truncate">
                      {game.title}
                    </h4>
                    <p className="text-[11px] text-arena-textSecondary mt-0.5 line-clamp-2 leading-relaxed">
                      {game.shortDesc}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-arena-border flex items-center justify-between">
                    <span className="text-[10px] text-arena-textSubtle">
                      {game.friendsPlayedCount} played
                    </span>
                    <button className="text-xs font-semibold text-arena-amber group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      <span>Play</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ======================================================= */}
          {/* SECTION 3 — POPULAR BRAIN GAMES (Visual Card Layout)   */}
          {/* ======================================================= */}
          <section className="space-y-3">
            <div>
              <h3 className="font-bold text-sm text-arena-textPrimary flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-arena-amber" />
                <span>Popular Brain & Logic Games</span>
              </h3>
              <p className="text-[11px] text-arena-textSecondary">Sharpen working memory, processing speed, and deductive reasoning</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                allGames.find(g => g.id === 'quick-math')!,
                allGames.find(g => g.id === 'pattern-master')!,
                allGames.find(g => g.id === 'reaction-challenge')!,
                allGames.find(g => g.id === 'memory-grid')!
              ].map(game => (
                <div
                  key={game.id}
                  onClick={() => handleLaunchGame(game.id)}
                  className="arena-card p-4 flex flex-col justify-between cursor-pointer group hover:border-arena-borderHover transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 rounded-lg bg-arena-elevated border border-arena-border">
                        {game.icon}
                      </div>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-arena-elevated text-arena-textSecondary border border-arena-border font-mono">
                        {game.difficulty}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-arena-textPrimary group-hover:text-arena-amber transition-colors">
                      {game.title}
                    </h4>
                    <p className="text-xs text-arena-textSecondary mt-1 line-clamp-2 leading-relaxed">
                      {game.description}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-arena-border flex items-center justify-between">
                    <span className="text-[11px] text-arena-textSubtle font-mono">
                      {game.playTime} • {game.playerCount}
                    </span>
                    <button className="text-xs font-semibold text-arena-amber flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      <span>Play Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ======================================================= */}
          {/* SECTION 4 — FRIENDS ARE PLAYING (Social Activity)       */}
          {/* ======================================================= */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-arena-textPrimary flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-arena-cyan" />
                  <span>Friends & Community Activity</span>
                </h3>
                <p className="text-[11px] text-arena-textSecondary">Real results and streaks from other DEVARENA players</p>
              </div>
            </div>

            <div className="space-y-2">
              {[
                {
                  username: 'marcus_q',
                  avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80',
                  game: 'Zip #42',
                  gameId: 'zip' as CasualGameId,
                  achievement: 'Solved in 74 seconds',
                  time: '15m ago',
                  actionLabel: 'Play Same Puzzle'
                },
                {
                  username: 'kavya_codes',
                  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
                  game: 'Word Puzzle #184',
                  gameId: 'word-puzzle' as CasualGameId,
                  achievement: 'Solved in 4/6 guesses (12d Streak)',
                  time: '42m ago',
                  actionLabel: 'Try Puzzle'
                },
                {
                  username: 'sara_byte',
                  avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
                  game: 'Reaction Challenge',
                  gameId: 'reaction-challenge' as CasualGameId,
                  achievement: 'Personal Best: 188 ms',
                  time: '2h ago',
                  actionLabel: 'Challenge Score'
                }
              ].map((act, idx) => (
                <div 
                  key={idx}
                  className="p-3 rounded-xl bg-arena-surface border border-arena-border flex items-center justify-between text-xs hover:border-arena-borderHover transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img 
                      src={act.avatar} 
                      alt="" 
                      className="w-8 h-8 rounded-lg object-cover border border-arena-border" 
                    />
                    <div>
                      <div className="font-semibold text-arena-textPrimary flex items-center gap-1.5">
                        <span>@{act.username}</span>
                        <span className="text-[11px] text-arena-textSubtle">• {act.game}</span>
                      </div>
                      <div className="text-[11px] text-arena-teal mt-0.5">
                        {act.achievement}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-arena-textSubtle hidden sm:inline">{act.time}</span>
                    <button
                      onClick={() => handleLaunchGame(act.gameId)}
                      className="btn-secondary py-1 px-3 text-xs font-semibold gap-1"
                    >
                      <span>{act.actionLabel}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ======================================================= */}
          {/* SECTION 5 — DISCOVER MORE GAMES (Complete Catalog)      */}
          {/* ======================================================= */}
          <section className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-arena-textPrimary flex items-center gap-1.5">
                  <Grid className="w-4 h-4 text-arena-amber" />
                  <span>All Games Catalog</span>
                </h3>
                <p className="text-[11px] text-arena-textSecondary">Browse the entire library of casual games</p>
              </div>
              <span className="text-xs font-mono text-arena-textSubtle">
                {filteredCatalog.length} Available
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredCatalog.map(game => {
                const isSaved = (user.savedGames || []).includes(game.id);

                return (
                  <div
                    key={game.id}
                    className="arena-card p-4 flex flex-col justify-between group relative"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-arena-elevated border border-arena-border">
                            {game.icon}
                          </div>
                          <div>
                            <h4 className="font-bold text-xs text-arena-textPrimary group-hover:text-arena-amber transition-colors">
                              {game.title}
                            </h4>
                            <span className="text-[10px] text-arena-textSubtle font-mono">
                              {game.tag}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => toggleSaveGame(game.id)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            isSaved 
                              ? 'bg-arena-amber/15 text-arena-amber border-arena-amber/30' 
                              : 'bg-arena-elevated text-arena-textSubtle border-arena-border hover:text-arena-textPrimary'
                          }`}
                          title={isSaved ? "Saved" : "Save for later"}
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                        </button>
                      </div>

                      <p className="text-xs text-arena-textSecondary mt-2 line-clamp-2 leading-relaxed">
                        {game.description}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-arena-border flex items-center justify-between">
                      <span className="text-[10px] text-arena-textSubtle font-mono">
                        {game.playTime} • {game.playerCount}
                      </span>
                      <button
                        onClick={() => handleLaunchGame(game.id)}
                        className="btn-primary py-1 px-3 text-xs font-semibold gap-1"
                      >
                        <span>{game.isMultiplayer ? 'Enter Room' : 'Play'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

        </div>

        {/* ========================================================= */}
        {/* C. RIGHT SIDEBAR — STATS & LEADERBOARDS (3 COLS)          */}
        {/* ========================================================= */}
        <aside className="lg:col-span-3 space-y-6">
          
          {/* Your Gaming Stats Card */}
          <div className="arena-card p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-arena-border">
              <div className="flex items-center gap-2 text-xs font-bold text-arena-textPrimary">
                <Trophy className="w-4 h-4 text-arena-amber" />
                <span>Your Gaming Stats</span>
              </div>
              <span className="text-[10px] font-mono text-arena-lime font-semibold">Active</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-2.5 rounded-lg bg-arena-elevated border border-arena-border text-center">
                <span className="text-[10px] text-arena-textSubtle block font-semibold uppercase">GAMES SOLVED</span>
                <div className="text-lg font-bold text-arena-textPrimary font-mono mt-0.5">
                  {user.gameHistory?.length || 3}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-arena-elevated border border-arena-border text-center">
                <span className="text-[10px] text-arena-textSubtle block font-semibold uppercase">CASUAL RATING</span>
                <div className="text-lg font-bold text-arena-cyan font-mono mt-0.5">
                  {user.casualRating}
                </div>
              </div>
            </div>

            <div className="space-y-1.5 pt-1 text-xs">
              <div className="flex items-center justify-between text-arena-textSecondary">
                <span>Daily Streak:</span>
                <span className="font-bold text-arena-amber font-mono">{user.streak} Days 🔥</span>
              </div>
              <div className="flex items-center justify-between text-arena-textSecondary">
                <span>Zip Best Time:</span>
                <span className="font-bold text-arena-lime font-mono">1m 24s</span>
              </div>
              <div className="flex items-center justify-between text-arena-textSecondary">
                <span>Reaction Best:</span>
                <span className="font-bold text-arena-cyan font-mono">198 ms</span>
              </div>
            </div>

            {user.isGuest && (
              <div className="pt-2">
                <div className="text-[11px] text-arena-textSubtle leading-relaxed">
                  Guest mode active. Upgrade to save permanent stats and sync cross-device.
                </div>
              </div>
            )}
          </div>

          {/* Weekly Casual Leaderboard Card */}
          <div className="arena-card p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-arena-border">
              <div className="flex items-center gap-2 text-xs font-bold text-arena-textPrimary">
                <Award className="w-4 h-4 text-arena-amber" />
                <span>Weekly Leaderboard</span>
              </div>

              <div className="flex items-center gap-1 text-[10px] p-0.5 rounded bg-arena-elevated border border-arena-border">
                <button
                  onClick={() => setLeaderboardTab('global')}
                  className={`px-2 py-0.5 rounded font-medium ${
                    leaderboardTab === 'global' ? 'bg-arena-surface text-arena-textPrimary shadow-sm' : 'text-arena-textSubtle'
                  }`}
                >
                  Global
                </button>
                <button
                  onClick={() => setLeaderboardTab('friends')}
                  className={`px-2 py-0.5 rounded font-medium ${
                    leaderboardTab === 'friends' ? 'bg-arena-surface text-arena-textPrimary shadow-sm' : 'text-arena-textSubtle'
                  }`}
                >
                  Friends
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {CASUAL_LEADERBOARD.slice(0, 4).map((entry) => (
                <div
                  key={entry.userId}
                  className="p-2.5 rounded-lg bg-arena-elevated border border-arena-border flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-[11px] text-arena-textSubtle w-4 text-center">
                      #{entry.rank}
                    </span>
                    <img
                      src={entry.avatar}
                      alt={entry.username}
                      className="w-6 h-6 rounded-md object-cover border border-arena-border"
                    />
                    <span className="font-semibold text-arena-textPrimary">@{entry.username}</span>
                  </div>
                  <span className="font-bold text-arena-amber font-mono">{entry.score} pts</span>
                </div>
              ))}

              {/* Current user rank row */}
              <div className="p-2.5 rounded-lg bg-arena-elevated border-l-2 border-arena-amber flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono font-bold text-[11px] text-arena-amber w-4 text-center">
                    #8
                  </span>
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-6 h-6 rounded-md object-cover border border-arena-border"
                  />
                  <div>
                    <span className="font-semibold text-arena-textPrimary">@{user.username}</span>
                    <span className="text-[10px] text-arena-amber ml-1 font-mono">(You)</span>
                  </div>
                </div>
                <span className="font-bold text-arena-amber font-mono">{user.casualRating} pts</span>
              </div>
            </div>
          </div>

          {/* Pending Challenges Card */}
          <div className="arena-card p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-arena-textPrimary">
                <Zap className="w-4 h-4 text-arena-amber" />
                <span>Pending Challenges</span>
              </div>
              <span className="text-[10px] font-mono text-arena-amber font-bold">2 Active</span>
            </div>

            <div className="space-y-2">
              {[
                { from: 'kavya_codes', game: 'Math 1v1 Clash', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', gameId: 'multiplayer-math' as CasualGameId },
                { from: 'marcus_q', game: 'Zip #42 (72s)', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80', gameId: 'zip' as CasualGameId }
              ].map((c, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-arena-elevated border border-arena-border flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <img src={c.avatar} alt="" className="w-6 h-6 rounded-md object-cover" />
                    <div>
                      <div className="font-semibold text-arena-textPrimary truncate max-w-[120px]">@{c.from}</div>
                      <div className="text-[10px] text-arena-textSubtle">{c.game}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleLaunchGame(c.gameId)}
                    className="btn-primary py-1 px-2.5 text-[11px] font-semibold"
                  >
                    Accept
                  </button>
                </div>
              ))}
            </div>

            {/* Quick Room Code Join */}
            <form onSubmit={handleJoinQuickRoom} className="pt-2 border-t border-arena-border flex gap-2">
              <input
                type="text"
                value={quickRoomCode}
                onChange={(e) => setQuickRoomCode(e.target.value)}
                placeholder="Enter room code..."
                className="flex-1 bg-arena-elevated border border-arena-border rounded-lg px-2.5 py-1 text-xs text-arena-textPrimary font-mono focus:outline-none"
              />
              <button type="submit" className="btn-secondary py-1 px-3 text-xs font-semibold">
                Join
              </button>
            </form>
          </div>

          {/* Recently Played Shelf */}
          {(user.recentlyPlayedGames || []).length > 0 && (
            <div className="arena-card p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-arena-textPrimary">
                <Clock className="w-4 h-4 text-arena-textSubtle" />
                <span>Recently Played</span>
              </div>

              <div className="space-y-2">
                {(user.recentlyPlayedGames || []).slice(0, 3).map((gId) => {
                  const game = allGames.find(g => g.id === gId);
                  if (!game) return null;

                  return (
                    <div
                      key={gId}
                      className="p-2.5 rounded-lg bg-arena-elevated border border-arena-border flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        {game.icon}
                        <span className="font-semibold text-arena-textPrimary">{game.title}</span>
                      </div>
                      <button
                        onClick={() => handleLaunchGame(game.id)}
                        className="text-xs text-arena-amber font-semibold hover:underline"
                      >
                        Resume
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </aside>

      </div>

    </div>
  );
};
