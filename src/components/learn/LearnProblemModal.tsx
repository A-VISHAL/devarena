import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { 
  X, 
  Play, 
  Send, 
  CheckCircle2, 
  XCircle, 
  Terminal, 
  Code2, 
  HelpCircle 
} from 'lucide-react';
import { CodingProblem } from '../../types';
import { useApp } from '../../context/AppContext';
import { executeCode, ExecutionReport } from '../../utils/codeRunner';
import { sound } from '../../utils/sound';
import confetti from 'canvas-confetti';

interface LearnProblemModalProps {
  problem: CodingProblem;
  topicId?: string;
  onClose: () => void;
}

export const LearnProblemModal: React.FC<LearnProblemModalProps> = ({
  problem,
  topicId,
  onClose
}) => {
  const { recordProblemSolved, user } = useApp();

  const [language, setLanguage] = useState<'javascript' | 'typescript' | 'python'>('javascript');
  const [code, setCode] = useState<string>(problem.starterCode.javascript);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [execReport, setExecReport] = useState<ExecutionReport | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);

  const isAlreadySolved = user.problemsSolved.includes(problem.id);

  const handleLanguageChange = (lang: 'javascript' | 'typescript' | 'python') => {
    sound.playClick();
    setLanguage(lang);
    setCode(problem.starterCode[lang]);
  };

  const handleRun = async () => {
    sound.playClick();
    setIsRunning(true);
    const report = await executeCode(problem, code, language, false);
    setExecReport(report);
    setIsRunning(false);

    if (report.allPassed) sound.playCorrect();
    else sound.playWrong();
  };

  const handleSubmit = async () => {
    sound.playClick();
    setIsSubmitting(true);
    const report = await executeCode(problem, code, language, true);
    setExecReport(report);
    setIsSubmitting(false);

    if (report.allPassed) {
      sound.playVictory();
      confetti({ particleCount: 70, spread: 60 });
      recordProblemSolved(problem.id, topicId);
    } else {
      sound.playWrong();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-arena-bg/85 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-5xl h-[90vh] bg-arena-surface border border-arena-border rounded-2xl overflow-hidden flex flex-col shadow-card">
        
        {/* Header */}
        <div className="h-12 px-4 bg-arena-elevated border-b border-arena-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-arena-textPrimary text-sm flex items-center gap-2">
              <span>{problem.title}</span>
              <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                problem.difficulty === 'Easy' 
                  ? 'bg-arena-success/15 text-arena-success'
                  : problem.difficulty === 'Medium'
                  ? 'bg-arena-warning/15 text-arena-warning'
                  : 'bg-arena-error/15 text-arena-error'
              }`}>
                {problem.difficulty}
              </span>
            </h3>
            {isAlreadySolved && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-arena-success px-2 py-0.2 rounded bg-arena-success/10 border border-arena-success/20">
                <CheckCircle2 className="w-3 h-3" />
                <span>Solved</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRun}
              disabled={isRunning || isSubmitting}
              className="btn-secondary py-1 px-3 text-xs gap-1.5"
            >
              <Play className="w-3 h-3 text-arena-teal fill-current" />
              <span>{isRunning ? 'Running...' : 'Run'}</span>
            </button>
            <button
              onClick={handleSubmit}
              disabled={isRunning || isSubmitting}
              className="btn-primary py-1 px-3 text-xs gap-1.5 font-medium"
            >
              <Send className="w-3 h-3" />
              <span>{isSubmitting ? 'Evaluating...' : 'Submit'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-arena-textSecondary hover:text-arena-textPrimary hover:bg-arena-elevated"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body Split */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* Left: Problem Details */}
          <div className="w-full lg:w-5/12 p-4 overflow-y-auto space-y-4 bg-arena-surface border-r border-arena-border">
            <div>
              <h4 className="text-[11px] uppercase font-semibold text-arena-textSubtle tracking-wider mb-1.5">Problem Statement</h4>
              <p className="whitespace-pre-line text-xs text-arena-textSecondary leading-relaxed">
                {problem.description}
              </p>
            </div>

            {/* Examples */}
            <div>
              <h4 className="text-[11px] uppercase font-semibold text-arena-textSubtle tracking-wider mb-1.5">Examples</h4>
              <div className="space-y-2">
                {problem.examples.map((ex, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-arena-elevated border border-arena-border font-mono text-xs space-y-0.5">
                    <div><span className="text-arena-textSubtle">Input: </span><span className="text-arena-textPrimary">{ex.input}</span></div>
                    <div><span className="text-arena-textSubtle">Output: </span><span className="text-arena-teal">{ex.output}</span></div>
                    {ex.explanation && <div className="text-[10px] font-sans text-arena-textSecondary">{ex.explanation}</div>}
                  </div>
                ))}
              </div>
            </div>

            {/* Constraints */}
            <div>
              <h4 className="text-[11px] uppercase font-semibold text-arena-textSubtle tracking-wider mb-1.5">Constraints</h4>
              <ul className="list-disc list-inside space-y-0.5 text-xs text-arena-textSecondary font-mono">
                {problem.constraints.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>

            {/* Hint */}
            <div className="pt-2">
              <button
                onClick={() => setShowHint(!showHint)}
                className="flex items-center gap-1.5 text-xs font-medium text-arena-blue hover:underline"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{showHint ? 'Hide Hint' : 'View Hint'}</span>
              </button>
              {showHint && (
                <div className="mt-2 p-2.5 rounded-lg bg-arena-elevated border border-arena-border text-xs text-arena-textSecondary leading-relaxed">
                  Consider optimal time complexity. Using an auxiliary hash map or two pointers can reduce quadratic O(N²) time down to linear O(N).
                </div>
              )}
            </div>
          </div>

          {/* Right: Monaco Editor + Console */}
          <div className="w-full lg:w-7/12 flex flex-col bg-[#141820]">
            <div className="h-8 px-4 bg-arena-surface border-b border-arena-border flex items-center justify-between">
              <span className="text-xs font-medium text-arena-textSecondary flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-arena-blue" />
                <span>Solution</span>
              </span>
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value as any)}
                className="bg-arena-elevated border border-arena-border rounded px-2 py-0.5 text-[11px] text-arena-textPrimary"
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python 3</option>
              </select>
            </div>

            <div className="flex-1 min-h-[260px]">
              <Editor
                height="100%"
                theme="vs-dark"
                language={language === 'python' ? 'python' : 'javascript'}
                value={code}
                onChange={(val) => setCode(val || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  fontFamily: 'JetBrains Mono, monospace',
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true
                }}
              />
            </div>

            {/* Test Case Output Console */}
            <div className="h-44 bg-arena-bg border-t border-arena-border flex flex-col">
              <div className="h-8 px-4 bg-arena-surface border-b border-arena-border flex items-center justify-between text-xs text-arena-textSecondary font-medium">
                <div className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-arena-teal" />
                  <span>Execution Output</span>
                </div>
                {execReport && (
                  <span className={`text-[11px] font-semibold ${
                    execReport.allPassed ? 'text-arena-success' : 'text-arena-error'
                  }`}>
                    {execReport.totalPassed} / {execReport.totalTests} Passed ({execReport.totalTimeMs} ms)
                  </span>
                )}
              </div>

              <div className="flex-1 p-3 overflow-y-auto space-y-1.5 text-xs font-mono">
                {!execReport ? (
                  <div className="h-full flex items-center justify-center text-arena-textSubtle font-sans text-xs">
                    Run sample tests or submit solution to execute against the test suite.
                  </div>
                ) : execReport.compileError ? (
                  <pre className="text-arena-error whitespace-pre-wrap">{execReport.compileError}</pre>
                ) : (
                  execReport.results.map((res) => (
                    <div 
                      key={res.index}
                      className={`p-2 rounded-lg border ${
                        res.passed ? 'bg-arena-success/5 border-arena-success/20' : 'bg-arena-error/5 border-arena-error/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-semibold flex items-center gap-1.5">
                          {res.passed ? <CheckCircle2 className="w-3.5 h-3.5 text-arena-success" /> : <XCircle className="w-3.5 h-3.5 text-arena-error" />}
                          <span className={res.passed ? 'text-arena-success' : 'text-arena-error'}>
                            Test #{res.index} {res.isHidden && '(Hidden)'}
                          </span>
                        </span>
                        <span className="text-[10px] text-arena-textSubtle">{res.executionTimeMs} ms</span>
                      </div>
                      <div className="text-[11px] text-arena-textSecondary">
                        Expected: {JSON.stringify(res.expected)} | Actual: {JSON.stringify(res.actual)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
