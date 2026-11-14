import React, { useState } from 'react';
import { ArrowLeft, RefreshCw, Share2, Compass, Trophy, Check, X, Lightbulb } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sound } from '../../utils/sound';
import confetti from 'canvas-confetti';

interface LogicPuzzle {
  id: string;
  scenario: string;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

const LOGIC_PUZZLES: LogicPuzzle[] = [
  {
    id: 'lp-1',
    scenario: 'Liam is taller than Noah. Mason is shorter than Liam but taller than Noah. Oliver is taller than Liam.',
    question: 'Who is the second tallest person in the group?',
    options: ['Oliver', 'Liam', 'Mason', 'Noah'],
    answer: 'Liam',
    explanation: 'From tallest to shortest: Oliver > Liam > Mason > Noah. Liam is the second tallest.'
  },
  {
    id: 'lp-2',
    scenario: 'All algorithms are logical procedures. Some logical procedures are self-optimizing. No buggy code is self-optimizing.',
    question: 'Which statement MUST be logically true based on the above?',
    options: [
      'All buggy code is an algorithm',
      'No buggy code is an algorithm',
      'Some logical procedures are not buggy code',
      'All algorithms are self-optimizing'
    ],
    answer: 'Some logical procedures are not buggy code',
    explanation: 'Because some logical procedures are self-optimizing, and zero self-optimizing procedures are buggy code, those specific logical procedures cannot be buggy code.'
  },
  {
    id: 'lp-3',
    scenario: 'A clock shows 3:15. What is the angle between the hour hand and the minute hand?',
    question: 'Calculate the exact acute angle:',
    options: ['0°', '7.5°', '15°', '12.5°'],
    answer: '7.5°',
    explanation: 'At 3:15, the minute hand is at 90°. The hour hand moves 0.5° per minute, so at 15 minutes past 3, it is at 90° + (15 * 0.5°) = 97.5°. The angle is 97.5° - 90° = 7.5°.'
  },
  {
    id: 'lp-4',
    scenario: 'You have two ropes. Each rope takes exactly 60 minutes to burn from one end to the other, but they burn at inconsistent rates throughout.',
    question: 'How can you measure exactly 45 minutes using both ropes?',
    options: [
      'Light rope 1 from one end, and rope 2 from both ends simultaneously',
      'Light rope 1 and cut rope 2 into 4 equal segments',
      'Light both ropes from one end simultaneously',
      'Fold rope 1 in half and burn from the center'
    ],
    answer: 'Light rope 1 from one end, and rope 2 from both ends simultaneously',
    explanation: 'Rope 2 burning from both ends finishes in exactly 30 minutes. At that exact moment, light the other end of Rope 1 (which had 30 minutes of burn left, now burning from both ends, taking 15 minutes). 30 + 15 = 45 minutes.'
  },
  {
    id: 'lp-5',
    scenario: 'In an island, Knights always tell the truth, and Knaves always lie. Person A says: "At least one of us is a Knave." Person B remains silent.',
    question: 'What are Person A and Person B?',
    options: [
      'A is a Knight, B is a Knave',
      'A is a Knave, B is a Knight',
      'Both are Knights',
      'Both are Knaves'
    ],
    answer: 'A is a Knight, B is a Knave',
    explanation: 'If A were a Knave, his statement would be false, meaning neither is a knave (both knights), which is a contradiction. Thus A must be a Knight telling the truth. Since at least one is a knave and A is a knight, B must be a Knave.'
  }
];

export const LogicSprint: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { recordCasualGameResult, openShareModal } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const currentPuzzle = LOGIC_PUZZLES[currentIndex];

  const handleSelectOption = (opt: string) => {
    if (isAnswered || gameOver) return;

    setSelectedOption(opt);
    setIsAnswered(true);

    const isCorrect = opt === currentPuzzle.answer;

    if (isCorrect) {
      sound.playCorrect();
      setScore(prev => prev + 200);
      setCorrectCount(prev => prev + 1);
    } else {
      sound.playWrong();
    }
  };

  const handleNext = () => {
    sound.playClick();
    if (currentIndex + 1 >= LOGIC_PUZZLES.length) {
      sound.playVictory();
      setGameOver(true);
      confetti({ particleCount: 65, spread: 60 });
      recordCasualGameResult('logic-sprint', score);
    } else {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    }
  };

  const handleRestart = () => {
    sound.playClick();
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setCorrectCount(0);
    setGameOver(false);
  };

  const handleShare = () => {
    openShareModal({
      title: 'Logic Sprint',
      gameOrBattle: 'Logic Sprint',
      scoreOrResult: `${score} Points`,
      subtitle: `${correctCount}/${LOGIC_PUZZLES.length} Puzzles Solved`,
      customStats: [
        { label: 'Score', value: String(score) },
        { label: 'Accuracy', value: `${correctCount}/${LOGIC_PUZZLES.length}` }
      ]
    });
  };

  return (
    <div className="max-w-md mx-auto py-6 px-4 flex flex-col items-center animate-in fade-in">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-arena-border">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-medium text-arena-textSecondary hover:text-arena-textPrimary"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Games</span>
        </button>
        <div className="text-center">
          <h2 className="text-sm font-bold text-arena-textPrimary">Logic Sprint</h2>
          <span className="text-[11px] text-arena-textSubtle">Puzzle {currentIndex + 1} of {LOGIC_PUZZLES.length}</span>
        </div>
        <button onClick={handleRestart} className="p-1.5 text-arena-textSecondary hover:text-arena-textPrimary">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {!gameOver ? (
        <div className="w-full space-y-4">
          {/* Scenario Card */}
          <div className="p-4 rounded-xl bg-arena-surface border border-arena-border space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-arena-blue uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5" />
              <span>Premise & Scenario</span>
            </div>
            <p className="text-xs text-arena-textPrimary leading-relaxed">
              {currentPuzzle.scenario}
            </p>
            <div className="pt-2 border-t border-arena-border text-xs font-bold text-arena-textPrimary">
              {currentPuzzle.question}
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            {currentPuzzle.options.map((opt, idx) => {
              const isSelected = selectedOption === opt;
              const isCorrectOpt = opt === currentPuzzle.answer;

              let btnClass = 'bg-arena-surface hover:bg-arena-elevated border-arena-border text-arena-textPrimary';

              if (isAnswered) {
                if (isCorrectOpt) {
                  btnClass = 'bg-arena-success text-slate-950 font-bold border-arena-success';
                } else if (isSelected && !isCorrectOpt) {
                  btnClass = 'bg-arena-error/20 border-arena-error text-arena-error';
                } else {
                  btnClass = 'bg-arena-surface opacity-40 border-arena-border text-arena-textSubtle';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(opt)}
                  disabled={isAnswered}
                  className={`w-full p-3 rounded-lg border text-left text-xs font-medium flex items-center justify-between gap-3 transition-all ${btnClass}`}
                >
                  <span>{opt}</span>
                  {isAnswered && isCorrectOpt && <Check className="w-4 h-4 text-slate-950 shrink-0" />}
                  {isAnswered && isSelected && !isCorrectOpt && <X className="w-4 h-4 text-arena-error shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Explanation drawer */}
          {isAnswered && (
            <div className="p-3.5 rounded-lg bg-arena-surface border border-arena-border animate-in fade-in space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-arena-teal">
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Deduction:</span>
              </div>
              <p className="text-xs text-arena-textSecondary leading-relaxed">
                {currentPuzzle.explanation}
              </p>
              <button
                onClick={handleNext}
                className="w-full btn-primary py-2 text-xs font-medium mt-1"
              >
                {currentIndex + 1 < LOGIC_PUZZLES.length ? 'Next Logic Puzzle ➜' : 'View Results'}
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Game Over */
        <div className="w-full p-6 rounded-xl bg-arena-surface border border-arena-border text-center space-y-4">
          <div className="w-10 h-10 rounded-lg bg-arena-elevated border border-arena-border text-arena-blue flex items-center justify-center mx-auto">
            <Trophy className="w-5 h-5" />
          </div>

          <div>
            <span className="text-[10px] uppercase font-semibold text-arena-textSubtle">LOGIC SPRINT COMPLETE</span>
            <div className="text-3xl font-extrabold text-arena-textPrimary mt-1">{score} Points</div>
            <p className="text-xs text-arena-textSecondary mt-1">
              Solved {correctCount} of {LOGIC_PUZZLES.length} puzzles correctly.
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={handleRestart} className="btn-secondary flex-1 py-2 text-xs">
              Play Again
            </button>
            <button onClick={handleShare} className="btn-primary flex-1 py-2 text-xs gap-1.5">
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Score</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
