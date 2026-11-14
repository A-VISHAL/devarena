import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Share2, HelpCircle, Trophy, ArrowLeft, Delete, CornerDownLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sound } from '../../utils/sound';
import confetti from 'canvas-confetti';

const WORD_LIST = [
  'STACK', 'QUEUE', 'ARRAY', 'LOGIC', 'GRAPH', 
  'BYTES', 'NODES', 'TREES', 'REACT', 'PIVOT', 
  'QUERY', 'SCOPE', 'SHARD', 'FETCH', 'BUILD',
  'CACHE', 'ROUTE', 'TOKEN', 'ASYNC', 'DEBUG'
];

// Determine daily word based on date
function getDailyWord(): string {
  const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  return WORD_LIST[dayIndex % WORD_LIST.length];
}

type LetterStatus = 'correct' | 'present' | 'absent' | 'empty';

export const WordPuzzle: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { recordCasualGameResult, openShareModal, user } = useApp();

  const [targetWord] = useState<string>(getDailyWord);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [hasWon, setHasWon] = useState<boolean>(false);
  const [shakeRow, setShakeRow] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  const maxAttempts = 6;
  const wordLength = 5;

  // Key status mapping for on-screen keyboard
  const getKeyStatuses = useCallback((): Record<string, LetterStatus> => {
    const statuses: Record<string, LetterStatus> = {};
    guesses.forEach(guess => {
      for (let i = 0; i < guess.length; i++) {
        const letter = guess[i];
        if (targetWord[i] === letter) {
          statuses[letter] = 'correct';
        } else if (targetWord.includes(letter) && statuses[letter] !== 'correct') {
          statuses[letter] = 'present';
        } else if (!targetWord.includes(letter) && !statuses[letter]) {
          statuses[letter] = 'absent';
        }
      }
    });
    return statuses;
  }, [guesses, targetWord]);

  const handleCharInput = useCallback((char: string) => {
    if (gameOver) return;
    if (currentGuess.length < wordLength) {
      sound.playClick();
      setCurrentGuess(prev => prev + char.toUpperCase());
    }
  }, [currentGuess, gameOver]);

  const handleDelete = useCallback(() => {
    if (gameOver) return;
    if (currentGuess.length > 0) {
      sound.playClick();
      setCurrentGuess(prev => prev.slice(0, -1));
    }
  }, [currentGuess, gameOver]);

  const handleSubmit = useCallback(() => {
    if (gameOver) return;
    if (currentGuess.length !== wordLength) {
      sound.playWrong();
      setShakeRow(true);
      setMessage('Word must be 5 letters');
      setTimeout(() => setShakeRow(false), 500);
      return;
    }

    const newGuesses = [...guesses, currentGuess];
    setGuesses(newGuesses);
    setCurrentGuess('');

    if (currentGuess === targetWord) {
      sound.playVictory();
      setGameOver(true);
      setHasWon(true);
      setMessage(`Brilliant! You guessed it in ${newGuesses.length}/6 attempts.`);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      recordCasualGameResult('word-puzzle', (7 - newGuesses.length) * 100, { won: true, attempts: newGuesses.length });
    } else if (newGuesses.length >= maxAttempts) {
      sound.playWrong();
      setGameOver(true);
      setHasWon(false);
      setMessage(`Out of attempts! The word was ${targetWord}.`);
      recordCasualGameResult('word-puzzle', 20, { won: false, attempts: 6 });
    } else {
      sound.playCorrect();
    }
  }, [currentGuess, gameOver, guesses, maxAttempts, targetWord, recordCasualGameResult]);

  // Physical keyboard listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSubmit();
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        handleCharInput(e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCharInput, handleDelete, handleSubmit]);

  const keyStatuses = getKeyStatuses();

  // Generate shareable emoji grid
  const handleShareResult = () => {
    const emojiRows = guesses.map(guess => {
      return guess.split('').map((ch, idx) => {
        if (targetWord[idx] === ch) return '🟩';
        if (targetWord.includes(ch)) return '🟨';
        return '⬛';
      }).join('');
    }).join('\n');

    openShareModal({
      title: 'Daily Word Puzzle',
      gameOrBattle: 'Word Puzzle (Daily)',
      scoreOrResult: hasWon ? `${guesses.length}/6 Attempts` : 'X/6 Attempts',
      subtitle: emojiRows,
      customStats: [
        { label: 'Attempts', value: `${guesses.length}/6` },
        { label: 'Result', value: hasWon ? 'Solved 🏆' : 'Missed' }
      ]
    });
  };

  const keyboardRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DEL']
  ];

  return (
    <div className="max-w-xl mx-auto py-4 px-3 flex flex-col items-center">
      {/* Top Header */}
      <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-arena-border">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors p-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Games</span>
        </button>
        <div className="text-center">
          <h2 className="text-base font-black text-white">Daily Word Puzzle</h2>
          <span className="text-[10px] text-slate-400 font-medium">Guess today's hidden 5-letter word</span>
        </div>
        <div className="w-16 flex justify-end">
          {gameOver && (
            <button
              onClick={handleShareResult}
              className="p-1.5 rounded-xl bg-violet-600/30 text-violet-300 border border-violet-500/40 hover:bg-violet-600/50"
              title="Share Result"
            >
              <Share2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className="mb-3 px-3 py-1.5 rounded-xl bg-slate-800 text-xs font-bold text-center text-slate-200 border border-slate-700 animate-in fade-in">
          {message}
        </div>
      )}

      {/* Word Grid */}
      <div className="grid grid-rows-6 gap-2 mb-6">
        {Array.from({ length: maxAttempts }).map((_, rowIndex) => {
          const guess = guesses[rowIndex] || (rowIndex === guesses.length ? currentGuess : '');
          const isCurrentRow = rowIndex === guesses.length;
          const isSubmitted = rowIndex < guesses.length;

          return (
            <div 
              key={rowIndex} 
              className={`flex gap-2 ${isCurrentRow && shakeRow ? 'animate-bounce' : ''}`}
            >
              {Array.from({ length: wordLength }).map((_, colIndex) => {
                const char = guess[colIndex] || '';
                let statusBg = 'bg-slate-900/80 border-slate-800 text-white';

                if (isSubmitted) {
                  if (targetWord[colIndex] === char) {
                    statusBg = 'bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-600/20';
                  } else if (targetWord.includes(char)) {
                    statusBg = 'bg-amber-600 border-amber-500 text-white shadow-md shadow-amber-600/20';
                  } else {
                    statusBg = 'bg-slate-800/80 border-slate-700 text-slate-400';
                  }
                } else if (char) {
                  statusBg = 'bg-slate-800/90 border-violet-500/60 text-white scale-105';
                }

                return (
                  <div
                    key={colIndex}
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl border-2 flex items-center justify-center font-black text-xl tracking-wider transition-all duration-200 ${statusBg}`}
                  >
                    {char}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Completion Banner */}
      {gameOver && (
        <div className="w-full p-4 mb-4 rounded-2xl bg-gradient-to-r from-violet-950/60 to-slate-900 border border-violet-500/30 flex items-center justify-between">
          <div>
            <div className="font-extrabold text-sm text-white flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>{hasWon ? 'Daily Challenge Complete!' : 'Challenge Finished'}</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {hasWon ? `Streak boosted! Solved in ${guesses.length} attempts.` : `The word was ${targetWord}. Try again tomorrow!`}
            </p>
          </div>
          <button
            onClick={handleShareResult}
            className="btn-primary text-xs py-2 px-3 gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Result</span>
          </button>
        </div>
      )}

      {/* Virtual Keyboard */}
      <div className="w-full max-w-md space-y-1.5 select-none">
        {keyboardRows.map((row, rowIdx) => (
          <div key={rowIdx} className="flex justify-center gap-1">
            {row.map((key) => {
              const status = keyStatuses[key];
              let btnClass = 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700';

              if (status === 'correct') {
                btnClass = 'bg-emerald-600 text-white border-emerald-500';
              } else if (status === 'present') {
                btnClass = 'bg-amber-600 text-white border-amber-500';
              } else if (status === 'absent') {
                btnClass = 'bg-slate-900 text-slate-500 border-slate-800';
              }

              const isWide = key === 'ENTER' || key === 'DEL';

              return (
                <button
                  key={key}
                  onClick={() => {
                    if (key === 'ENTER') handleSubmit();
                    else if (key === 'DEL') handleDelete();
                    else handleCharInput(key);
                  }}
                  className={`h-11 rounded-lg font-bold text-xs flex items-center justify-center border transition-all active:scale-95 ${
                    isWide ? 'px-3 sm:px-4 text-[11px]' : 'w-8 sm:w-10'
                  } ${btnClass}`}
                >
                  {key === 'DEL' ? <Delete className="w-4 h-4" /> : key}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

