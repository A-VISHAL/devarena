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
  HelpCircle, 
  Sparkles,
  Trophy
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
      confetti({ particleCount: 80, spread: 70 });
      recordProblemSolved(problem.id, topicId);
    } else {
      sound.playWrong();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-6xl h-[92vh] bg-arena-surface border border-arena-border rounded-3xl overflow-hidden flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="h-14 px-5 bg-arena-surfaceLight border-b border-arena-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <span>{problem.title}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                problem.difficulty === 'Easy' 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : problem.difficulty === 'Medium'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
              }`}>
                {problem.difficulty}
              </span>
            </h3>
            {isAlreadySolved && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" />
                <span>Solved</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRun}
              disabled={isRunning || isSubmitting}
              className="btn-secondary py-1.5 px-3 text-xs gap-1.5"
            >
              <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
              <span>{isRunning ? 'Running...' : 'Run Tests'}</span>
            </button>
            <button
              onClick={handleSubmit}
              disabled={isRunning || isSubmitting}
              className="btn-primary py-1.5 px-3.5 text-xs gap-1.5 font-bold"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Evaluating...' : 'Submit'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Split */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* Left: Problem Details */}
          <div className="w-full lg:w-5/12 p-5 overflow-y-auto space-y-5 bg-arena-bg border-r border-arena-border">
            <div>
              <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-2">Problem Statement</h4>
              <p className="whitespace-pre-line text-xs sm:text-sm text-slate-300 leading-relaxed">
                {problem.description}
              </p>
            </div>

            {/* Examples */}
            <div>
              <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-2">Examples</h4>
              <div className="space-y-2.5">
                {problem.examples.map((ex, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs space-y-1">
                    <div><span className="text-slate-500">Input: </span>{ex.input}</div>
                    <div><span className="text-slate-500">Output: </span><span className="text-emerald-400">{ex.output}</span></div>
                    {ex.explanation && <div className="text-[11px] font-sans text-slate-400">{ex.explanation}</div>}
                  </div>
                ))}
              </div>
            </div>

            {/* Constraints */}
            <div>
              <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-2">Constraints</h4>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-400 font-mono">
                {problem.constraints.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>

            {/* Hint Button */}
            <div className="pt-2">
              <button
                onClick={() => setShowHint(!showHint)}
                className="flex items-center gap-1.5 text-xs font-semibold text-violet-400 hover:text-violet-300"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{showHint ? 'Hide Hint' : 'Need a Hint?'}</span>
              </button>
              {showHint && (
                <div className="mt-2 p-3 rounded-xl bg-violet-950/40 border border-violet-500/30 text-xs text-violet-200">
                  Think about optimal time complexity. Using a hash map or two pointers can reduce quadratic O(N²) iterations down to linear O(N).
                </div>
              )}
            </div>
          </div>

          {/* Right: Monaco Editor + Console */}
          <div className="w-full lg:w-7/12 flex flex-col bg-[#1e1e1e]">
            {/* Editor Subheader */}
            <div className="h-9 px-4 bg-[#252526] border-b border-[#333333] flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-violet-400" />
                <span>Editor</span>
              </span>
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value as any)}
                className="bg-[#1e1e1e] border border-slate-700 rounded-lg px-2 py-0.5 text-xs text-slate-200"
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python 3</option>
              </select>
            </div>

            {/* Monaco Editor */}
            <div className="flex-1 min-h-[280px]">
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
            <div className="h-48 bg-slate-950 border-t border-slate-800 flex flex-col">
              <div className="h-8 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-semibold">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Execution Output</span>
                </div>
                {execReport && (
                  <span className={`text-[11px] font-bold ${
                    execReport.allPassed ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {execReport.totalPassed} / {execReport.totalTests} Passed ({execReport.totalTimeMs} ms)
                  </span>
                )}
              </div>

              <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs font-mono">
                {!execReport ? (
                  <div className="h-full flex items-center justify-center text-slate-500 font-sans text-xs">
                    Run sample tests or submit solution to execute against test suite.
                  </div>
                ) : execReport.compileError ? (
                  <pre className="text-rose-400 whitespace-pre-wrap">{execReport.compileError}</pre>
                ) : (
                  execReport.results.map((res) => (
                    <div 
                      key={res.index}
                      className={`p-2 rounded-xl border ${
                        res.passed ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-rose-950/20 border-rose-500/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold flex items-center gap-1.5">
                          {res.passed ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-rose-400" />}
                          <span className={res.passed ? 'text-emerald-300' : 'text-rose-300'}>
                            Test #{res.index} {res.isHidden && '(Hidden)'}
                          </span>
                        </span>
                        <span className="text-[10px] text-slate-500">{res.executionTimeMs} ms</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
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

