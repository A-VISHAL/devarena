import React, { useState } from 'react';
import { 
  Gamepad2, 
  ArrowRight, 
  Layers, 
  Sparkles, 
  Eye, 
  Activity, 
  Calculator, 
  Brain, 
  Compass, 
  Check, 
  Play, 
  Clock, 
  Flame 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CasualGameId } from '../../types';
import { sound } from '../../utils/sound';

interface GameItem {
  id: CasualGameId;
  title: string;
  category: string;
  badge: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  duration: string;
  description: string;
  previewType: 'zip' | 'word' | 'math' | 'reaction' | 'memory' | 'pattern' | 'odd' | 'logic';
}

export const GamesShowcaseSection: React.FC = () => {
  const { navigateToApp } = useApp();
  const [selectedGame, setSelectedGame] = useState<CasualGameId>('zip');
  const [miniWordGuess, setMiniWordGuess] = useState<string>('ARRAY');
  const [miniMathAnswer, setMiniMathAnswer] = useState<number | null>(null);
  const [reactionClicked, setReactionClicked] = useState<boolean>(false);

  const games: GameItem[] = [
    {
      id: 'zip',
      title: 'Zip #42',
      category: 'Spatial Deduction',
      badge: 'Daily Challenge',
      difficulty: 'Medium',
      duration: '2-3 mins',
      description: 'Connect numbered nodes (1 to 6) across an orthogonal 6x6 spatial grid without hitting barrier obstacles.',
      previewType: 'zip'
    },
    {
      id: 'word-puzzle',
      title: 'Daily Word Puzzle',
      category: 'Word Logic',
      badge: 'Daily Puzzle',
      difficulty: 'Medium',
      duration: '3 mins',
      description: 'Guess today\'s 5-letter technical term in 6 tries. Green marks exact matches, amber marks misplaced letters.',
      previewType: 'word'
    },
    {
      id: 'quick-math',
      title: 'Quick Math Sprint',
      category: 'Mental Arithmetic',
      badge: 'Fast Sprint',
      difficulty: 'Easy',
      duration: '60 secs',
      description: 'A 60-second high-speed mental arithmetic challenge. Build streaks for exponential score multipliers.',
      previewType: 'math'
    },
    {
      id: 'reaction-challenge',
      title: 'Reaction Benchmark',
      category: 'Reflex Speed',
      badge: 'Reflex Test',
      difficulty: 'Hard',
      duration: '1 min',
      description: 'High-precision millisecond benchmark measuring raw reaction speed and comparing against global percentiles.',
      previewType: 'reaction'
    },
    {
      id: 'memory-grid',
      title: 'Memory Grid',
      category: 'Working Memory',
      badge: 'Brain Game',
      difficulty: 'Medium',
      duration: '2 mins',
      description: 'Memorize flashing spatial coordinates across dynamically expanding 3x3 to 5x5 grids.',
      previewType: 'memory'
    },
    {
      id: 'pattern-master',
      title: 'Pattern Master',
      category: 'Sequence Reasoning',
      badge: 'Logic',
      difficulty: 'Medium',
      duration: '2 mins',
      description: 'Deduce geometric, numerical, and rotational patterns with combo-based scoring.',
      previewType: 'pattern'
    },
    {
      id: 'odd-one-out',
      title: 'Odd One Out',
      category: 'Visual Perception',
      badge: 'Speed Search',
      difficulty: 'Easy',
      duration: '1-2 mins',
      description: 'Spot subtle optical variations, color shades, or rotational anomalies across 10 rapid timed rounds.',
      previewType: 'odd'
    },
    {
      id: 'logic-sprint',
      title: 'Logic Sprint',
      category: 'Boolean Deduction',
      badge: 'Logic Puzzle',
      difficulty: 'Hard',
      duration: '3 mins',
      description: 'Solve deductive truth tables, boolean logic gates, and positional reasoning paradoxes.',
      previewType: 'logic'
    }
  ];

  const activeGameObj = games.find(g => g.id === selectedGame) || games[0];

  return (
    <section id="games-showcase" className="py-24 relative bg-[#121517]">
      <div className="w-[94%] max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-arena-border">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-arena-surface border border-arena-border text-xs font-semibold text-arena-teal">
              <Gamepad2 className="w-3.5 h-3.5 text-arena-teal" />
              <span>GAMES FOR EVERY MIND</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-arena-textPrimary tracking-tight">
              Take a break. <br />
              <span className="text-arena-teal">Challenge your brain.</span>
            </h2>
            <p className="text-sm sm:text-base text-arena-textSecondary">
              Quick to start. Difficult to put down. Enjoy real scoring, daily streak tracking, and instant friend challenges.
            </p>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              navigateToApp('play');
            }}
            className="btn-primary text-xs py-2.5 px-5 gap-2 self-start md:self-auto font-bold"
          >
            <span>Explore All Games</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Interactive Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: 8 Game Cards Catalog */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {games.map((game) => {
              const isSelected = selectedGame === game.id;
              return (
                <div
                  key={game.id}
                  onClick={() => {
                    sound.playClick();
                    setSelectedGame(game.id);
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 select-none ${
                    isSelected
                      ? 'bg-arena-elevated border-arena-teal shadow-[0_0_20px_rgba(131,182,163,0.15)] scale-[1.01]'
                      : 'bg-arena-surface/80 border-arena-border hover:bg-arena-elevated hover:border-arena-borderHover'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#162022] text-arena-teal font-semibold border border-arena-teal/20">
                      {game.badge}
                    </span>
                    <span className="text-[11px] text-arena-textSubtle flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{game.duration}</span>
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-arena-textPrimary mb-1">
                    {game.title}
                  </h3>
                  <p className="text-xs text-arena-textSecondary line-clamp-2 leading-relaxed">
                    {game.description}
                  </p>

                  <div className="mt-3 pt-3 border-t border-arena-border/60 flex items-center justify-between text-[11px]">
                    <span className="text-arena-textSubtle">{game.category}</span>
                    <span className={`font-mono font-medium ${
                      game.difficulty === 'Easy' ? 'text-arena-teal' : game.difficulty === 'Medium' ? 'text-arena-amber' : 'text-arena-error'
                    }`}>
                      {game.difficulty}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Live Interactive Game Simulator Box */}
          <div className="lg:col-span-5 sticky top-24 rounded-2xl bg-arena-surface border border-arena-border p-6 shadow-2xl space-y-6">
            
            {/* Header info for selected game */}
            <div className="flex items-center justify-between pb-4 border-b border-arena-border">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-arena-teal">
                  INTERACTIVE SIMULATION
                </span>
                <h3 className="text-xl font-extrabold text-arena-textPrimary mt-0.5">
                  {activeGameObj.title}
                </h3>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-arena-elevated border border-arena-border text-arena-amber font-semibold">
                {activeGameObj.duration}
              </span>
            </div>

            {/* Custom interactive micro-simulation preview depending on active game */}
            <div className="p-5 rounded-xl bg-[#141719] border border-arena-border flex flex-col items-center justify-center min-h-[220px]">
              
              {/* ZIP GAME PREVIEW */}
              {activeGameObj.previewType === 'zip' && (
                <div className="space-y-3 w-full max-w-xs">
                  <div className="text-[11px] text-arena-textSecondary text-center">
                    Click checkpoints in order (1 → 2 → 3 → 4)
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map((idx) => {
                      const isPoint = idx === 1 || idx === 6 || idx === 11 || idx === 16;
                      const num = idx === 1 ? 1 : idx === 6 ? 2 : idx === 11 ? 3 : idx === 16 ? 4 : null;
                      const inPath = [1, 2, 6, 7, 11].includes(idx);
                      const isObstacle = idx === 5 || idx === 10;
                      return (
                        <div
                          key={idx}
                          className={`h-11 rounded-lg flex items-center justify-center font-mono font-bold text-xs border ${
                            isPoint 
                              ? 'bg-arena-amber text-[#141719] border-arena-amber shadow-sm'
                              : inPath
                              ? 'bg-arena-teal/20 text-arena-teal border-arena-teal/40'
                              : isObstacle
                              ? 'bg-[#101314] text-arena-textSubtle opacity-30 border-transparent'
                              : 'bg-arena-surface text-arena-textSubtle border-arena-border'
                          }`}
                        >
                          {num || (isObstacle ? '✕' : '')}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* WORD PUZZLE PREVIEW */}
              {activeGameObj.previewType === 'word' && (
                <div className="space-y-3 w-full max-w-xs text-center">
                  <span className="text-[11px] text-arena-textSecondary">
                    Guess: <span className="font-mono text-arena-amber font-bold">{miniWordGuess}</span>
                  </span>
                  <div className="flex justify-center gap-2">
                    {['S', 'T', 'A', 'C', 'K'].map((ch, i) => (
                      <div
                        key={i}
                        className={`w-11 h-11 rounded-lg font-mono font-black text-sm flex items-center justify-center border shadow-sm ${
                          i === 0 ? 'bg-arena-success text-[#141719] border-arena-success' :
                          i === 2 ? 'bg-arena-warning text-[#141719] border-arena-warning' :
                          'bg-arena-elevated text-arena-textSubtle border-arena-border'
                        }`}
                      >
                        {ch}
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-center gap-2">
                    {miniWordGuess.split('').map((ch, i) => (
                      <div
                        key={i}
                        className="w-11 h-11 rounded-lg font-mono font-black text-sm flex items-center justify-center border bg-arena-success text-[#141719] border-arena-success"
                      >
                        {ch}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* QUICK MATH PREVIEW */}
              {activeGameObj.previewType === 'math' && (
                <div className="space-y-4 w-full max-w-xs text-center font-mono">
                  <div className="text-2xl font-black text-arena-textPrimary">
                    14 × 7 = ?
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[98, 88, 102, 94].map((ans) => (
                      <button
                        key={ans}
                        onClick={() => {
                          sound.playCorrect();
                          setMiniMathAnswer(ans);
                        }}
                        className={`py-2.5 rounded-lg border text-sm font-bold transition-all ${
                          miniMathAnswer === ans
                            ? ans === 98 ? 'bg-arena-success text-[#141719] border-arena-success' : 'bg-arena-error text-white border-arena-error'
                            : 'bg-arena-surface hover:bg-arena-elevated border-arena-border text-arena-textPrimary'
                        }`}
                      >
                        {ans}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* REACTION CHALLENGE PREVIEW */}
              {activeGameObj.previewType === 'reaction' && (
                <div className="space-y-3 w-full max-w-xs text-center">
                  <div 
                    onClick={() => {
                      sound.playClick();
                      setReactionClicked(!reactionClicked);
                    }}
                    className={`p-6 rounded-xl border cursor-pointer select-none transition-all ${
                      reactionClicked 
                        ? 'bg-arena-success text-[#141719] border-arena-success font-black' 
                        : 'bg-arena-teal text-[#141719] border-arena-teal hover:scale-98 font-bold'
                    }`}
                  >
                    <div className="text-sm uppercase tracking-wider font-extrabold">
                      {reactionClicked ? '194 ms — Top 4%!' : 'CLICK WHEN GREEN!'}
                    </div>
                  </div>
                  <div className="text-[11px] text-arena-textSecondary">
                    Benchmark millisecond human reflexes
                  </div>
                </div>
              )}

              {/* OTHER GAMES FALLBACK PREVIEW */}
              {['memory', 'pattern', 'odd', 'logic'].includes(activeGameObj.previewType) && (
                <div className="space-y-3 w-full max-w-xs text-center">
                  <div className="w-12 h-12 rounded-xl bg-arena-elevated border border-arena-border text-arena-amber flex items-center justify-center mx-auto">
                    <Brain className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-bold text-arena-textPrimary">
                    {activeGameObj.title}
                  </div>
                  <p className="text-xs text-arena-textSecondary">
                    {activeGameObj.description}
                  </p>
                </div>
              )}

            </div>

            {/* Launch Game Directly CTA */}
            <div className="pt-2 flex flex-col gap-2.5">
              <button
                onClick={() => {
                  sound.playVictory();
                  navigateToApp('play', activeGameObj.id);
                }}
                className="btn-primary w-full py-3 text-xs font-bold gap-2 shadow-md"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Play {activeGameObj.title} Now</span>
              </button>

              <div className="flex items-center justify-center gap-1.5 text-xs text-arena-textSubtle">
                <Sparkles className="w-3.5 h-3.5 text-arena-teal" />
                <span>Instant playable in browser • No signup required</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
