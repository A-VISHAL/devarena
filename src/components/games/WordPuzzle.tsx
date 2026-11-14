import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Share2, Trophy, Delete } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sound } from '../../utils/sound';
import confetti from 'canvas-confetti';

const WORD_LIST = [
  'STACK', 'QUEUE', 'ARRAY', 'LOGIC', 'GRAPH', 
  'BYTES', 'NODES', 'TREES', 'REACT', 'PIVOT', 
  'QUERY', 'SCOPE', 'SHARD', 'FETCH', 'BUILD',
  'CACHE', 'ROUTE', 'TOKEN', 'ASYNC', 'DEBUG'
];

function getDailyWord(): string {
  const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  return WORD_LIST[dayIndex % WORD_LIST.length];
}

type LetterStatus = 'correct' | 'present' | 'absent' | 'empty';

export const WordPuzzle: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { recordCasualGameResult, openShareModal } = useApp();

  const [targetWord] = useState<string>(getDailyWord);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [hasWon, setHasWon] = useState<boolean>(false);
  const [shakeRow, setShakeRow] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  const maxAttempts = 6;
  const wordLength = 5;

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
      setMessage(`Solved in ${newGuesses.length}/6 attempts.`);
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
      recordCasualGameResult('word-puzzle', (7 - newGuesses.length) * 100, { won: true, attempts: newGuesses.length });
    } else if (newGuesses.length >= maxAttempts) {
      sound.playWrong();
      setGameOver(true);
      setHasWon(false);
      setMessage(`Out of attempts. The word was ${targetWord}.`);
      recordCasualGameResult('word-puzzle', 20, { won: false, attempts: 6 });
    } else {
      sound.playCorrect();
    }
  }, [currentGuess, gameOver, guesses, maxAttempts, targetWord, recordCasualGameResult]);

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
      gameOrBattle: 'Word Puzzle',
      scoreOrResult: hasWon ? `${guesses.length}/6 Attempts` : 'X/6 Attempts',
      subtitle: emojiRows,
      customStats: [
        { label: 'Attempts', value: `${guesses.length}/6` },
        { label: 'Result', value: hasWon ? 'Solved' : 'Missed' }
      ]
    });
  };

  const keyboardRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DEL']
  ];

  return (
    <div className="max-w-xl mx-auto py-6 px-4 flex flex-col items-center animate-in fade-in">
      {/* Top Header */}
      <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-arena-border">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-medium text-arena-textSecondary hover:text-arena-textPrimary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Games</span>
        </button>
        <div className="text-center">
          <h2 className="text-sm font-bold text-arena-textPrimary">Daily Word Puzzle</h2>
          <span className="text-[11px] text-arena-textSubtle">Guess today's hidden 5-letter word</span>
        </div>
        <div className="w-16 flex justify-end">
          {gameOver && (
            <button
              onClick={handleShareResult}
              className="p-1.5 rounded-lg bg-arena-surface border border-arena-border text-arena-blue hover:text-white"
              title="Share Result"
            >
              <Share2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className="mb-4 px-3 py-1.5 rounded-lg bg-arena-elevated border border-arena-border text-xs font-medium text-center text-arena-textPrimary animate-in fade-in">
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
                let tileClass = 'bg-arena-surface border-arena-border text-arena-textPrimary';

                if (isSubmitted) {
                  if (targetWord[colIndex] === char) {
                    tileClass = 'bg-arena-success border-arena-success text-slate-950 font-bold';
                  } else if (targetWord.includes(char)) {
                    tileClass = 'bg-arena-warning border-arena-warning text-slate-950 font-bold';
                  } else {
                    tileClass = 'bg-arena-elevated border-arena-border text-arena-textSubtle';
                  }
                } else if (char) {
                  tileClass = 'bg-arena-elevated border-arena-blue text-arena-textPrimary';
                }

                return (
                  <div
                    key={colIndex}
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg border flex items-center justify-center font-bold text-lg transition-all ${tileClass}`}
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
        <div className="w-full p-4 mb-5 rounded-xl bg-arena-surface border border-arena-border flex items-center justify-between">
          <div>
            <div className="font-bold text-xs text-arena-textPrimary flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-arena-warning" />
              <span>{hasWon ? 'Puzzle Solved' : 'Challenge Finished'}</span>
            </div>
            <p className="text-[11px] text-arena-textSecondary mt-0.5">
              {hasWon ? `Completed in ${guesses.length}/6 attempts.` : `The word was ${targetWord}.`}
            </p>
          </div>
          <button
            onClick={handleShareResult}
            className="btn-primary text-xs py-1.5 px-3 gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
        </div>
      )}

      {/* Virtual Keyboard */}
      <div className="w-full max-w-md space-y-1.5 select-none">
        {keyboardRows.map((row, rowIdx) => (
          <div key={rowIdx} className="flex justify-center gap-1">
            {row.map((key) => {
              const status = keyStatuses[key];
              let keyClass = 'bg-arena-elevated hover:bg-[#293443] text-arena-textPrimary border-arena-border';

              if (status === 'correct') {
                keyClass = 'bg-arena-success text-slate-950 font-bold border-arena-success';
              } else if (status === 'present') {
                keyClass = 'bg-arena-warning text-slate-950 font-bold border-arena-warning';
              } else if (status === 'absent') {
                keyClass = 'bg-arena-bg text-arena-textSubtle border-arena-border';
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
                  className={`h-10 rounded-md font-medium text-xs flex items-center justify-center border transition-all active:scale-95 ${
                    isWide ? 'px-3 sm:px-3.5 text-[11px]' : 'w-8 sm:w-9'
                  } ${keyClass}`}
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
