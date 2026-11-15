import React, { useState } from 'react';
import { 
  Play, 
  RotateCcw, 
  Trash2, 
  Terminal, 
  Copy, 
  Check, 
  Sparkles, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  Code2
} from 'lucide-react';
import { sound } from '../../../utils/sound';

interface ConsoleLogItem {
  type: 'log' | 'warn' | 'error' | 'info';
  content: string;
  timestamp: string;
}

const SNIPPETS: { title: string; code: string }[] = [
  {
    title: 'Memoized Fibonacci',
    code: `// Memoized Fibonacci Benchmark
function fibMemo(n, memo = {}) {
  if (n in memo) return memo[n];
  if (n <= 1) return n;
  memo[n] = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
  return memo[n];
}

console.log("Calculating Fib(40)...");
const start = performance.now();
const result = fibMemo(40);
const duration = (performance.now() - start).toFixed(3);

console.log(\`Result: \${result} (computed in \${duration} ms)\`);
console.info("Notice how memoization turns O(2^N) exponential into O(N) linear time!");`
  },
  {
    title: 'Array Transformations',
    code: `// High-Order Functional Array Operations
const engineers = [
  { name: 'Alice', role: 'Frontend', rating: 1950, active: true },
  { name: 'Bob', role: 'Fullstack', rating: 1720, active: false },
  { name: 'Charlie', role: 'Algorithms', rating: 2100, active: true },
  { name: 'Diana', role: 'Systems', rating: 1880, active: true }
];

console.log("All Engineers:", engineers);

const activeHighRank = engineers
  .filter(e => e.active && e.rating >= 1800)
  .map(e => \`\${e.name} (\${e.role}) - Rating: \${e.rating}\`);

console.log("Active 1800+ Engineers:", activeHighRank);`
  },
  {
    title: 'Async Promise Pipeline',
    code: `// Simulating Asynchronous Task Processing
async function runTaskQueue() {
  console.log("Starting async task processing pipeline...");
  
  const delay = (ms) => new Promise(res => setTimeout(res, ms));

  console.log("→ Stage 1: Initializing sandbox context...");
  await delay(100);
  
  console.log("→ Stage 2: Compiling AST syntax trees...");
  await delay(150);

  console.log("→ Stage 3: Verification complete. All green!");
  return { status: 200, execution: 'SUCCESS' };
}

runTaskQueue().then(res => console.log("Final outcome:", res));`
  }
];

export const JsPlayground: React.FC = () => {
  const [code, setCode] = useState<string>(SNIPPETS[0].code);
  const [logs, setLogs] = useState<ConsoleLogItem[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const runCode = async () => {
    sound.click();
    setIsRunning(true);
    setLogs([]);
    setExecutionTime(null);

    const interceptedLogs: ConsoleLogItem[] = [];

    const formatArg = (arg: any): string => {
      if (typeof arg === 'object' && arg !== null) {
        try {
          return JSON.stringify(arg, null, 2);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    };

    const customConsole = {
      log: (...args: any[]) => {
        interceptedLogs.push({
          type: 'log',
          content: args.map(formatArg).join(' '),
          timestamp: new Date().toLocaleTimeString()
        });
      },
      warn: (...args: any[]) => {
        interceptedLogs.push({
          type: 'warn',
          content: args.map(formatArg).join(' '),
          timestamp: new Date().toLocaleTimeString()
        });
      },
      error: (...args: any[]) => {
        interceptedLogs.push({
          type: 'error',
          content: args.map(formatArg).join(' '),
          timestamp: new Date().toLocaleTimeString()
        });
      },
      info: (...args: any[]) => {
        interceptedLogs.push({
          type: 'info',
          content: args.map(formatArg).join(' '),
          timestamp: new Date().toLocaleTimeString()
        });
      }
    };

    const t0 = performance.now();
    try {
      // Evaluate within client context with custom console
      const runner = new Function('console', `
        return (async () => {
          ${code}
        })();
      `);
      await runner(customConsole);
      const t1 = performance.now();
      setExecutionTime(t1 - t0);
      sound.success();
    } catch (err: any) {
      const t1 = performance.now();
      setExecutionTime(t1 - t0);
      interceptedLogs.push({
        type: 'error',
        content: `Runtime Error: ${err.message}`,
        timestamp: new Date().toLocaleTimeString()
      });
      sound.defeat();
    } finally {
      setLogs([...interceptedLogs]);
      setIsRunning(false);
    }
  };

  const handleClearLogs = () => {
    sound.click();
    setLogs([]);
    setExecutionTime(null);
  };

  const handleResetCode = () => {
    sound.click();
    setCode(SNIPPETS[0].code);
    setLogs([]);
    setExecutionTime(null);
  };

  const handleCopyCode = () => {
    sound.click();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#1C2426] border border-[#252D30] rounded-xl p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#B5FF4A]/10 text-[#B5FF4A] border border-[#B5FF4A]/20">
                CLIENT-SIDE REPL
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                JavaScript ES2024 • Console Capture
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">JavaScript Playground</h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Execute modern JavaScript directly in your browser. Inspect logs, evaluate promises, and benchmark execution latencies.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={runCode}
              disabled={isRunning}
              className="flex items-center gap-2 px-4 py-2 bg-[#00E5FF] hover:brightness-110 text-black font-bold rounded-lg text-xs transition-all shadow-md shadow-[#00E5FF]/20 disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-current" />
              {isRunning ? 'Running...' : 'Run Code'}
            </button>

            <button
              onClick={handleResetCode}
              className="p-2 bg-[#252D30] hover:bg-[#2F383C] text-neutral-300 rounded-lg transition-colors border border-neutral-700/50"
              title="Reset Code"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Snippets Preset Bar */}
        <div className="mt-4 pt-4 border-t border-[#252D30] flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs text-neutral-400 font-mono shrink-0 mr-1">Templates:</span>
          {SNIPPETS.map(s => (
            <button
              key={s.title}
              onClick={() => {
                sound.click();
                setCode(s.code);
              }}
              className="px-2.5 py-1 bg-[#101314] hover:bg-[#252D30] text-neutral-300 hover:text-white rounded-lg text-xs font-mono border border-[#252D30] whitespace-nowrap transition-colors"
            >
              {s.title}
            </button>
          ))}
        </div>
      </div>

      {/* Editor & Console Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Code Editor (7 cols) */}
        <div className="lg:col-span-7 bg-[#1C2426] border border-[#252D30] rounded-xl p-4 flex flex-col shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-[#00E5FF]" />
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                JavaScript Source
              </span>
            </div>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-2 py-1 text-xs bg-[#252D30] hover:bg-[#2F383C] text-neutral-300 rounded transition-colors font-mono"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#B5FF4A]" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          <textarea
            value={code}
            onChange={e => setCode(e.target.value)}
            rows={16}
            placeholder="Write JavaScript code here..."
            className="w-full bg-[#101314] text-xs font-mono text-neutral-200 p-4 rounded-lg border border-[#252D30] focus:outline-none focus:border-[#00E5FF] leading-relaxed resize-y"
            spellCheck={false}
          />

          <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-neutral-500">
            <span>Runs client-side in window scope</span>
            <span>{code.split('\n').length} lines</span>
          </div>
        </div>

        {/* Right: Console Output (5 cols) */}
        <div className="lg:col-span-5 bg-[#1C2426] border border-[#252D30] rounded-xl p-4 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#FFAD42]" />
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Captured Console ({logs.length})
                </span>
              </div>
              <button
                onClick={handleClearLogs}
                className="text-neutral-400 hover:text-white p-1 rounded transition-colors"
                title="Clear Logs"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Console Log Feed */}
            <div className="bg-[#101314] rounded-lg border border-[#252D30] p-3.5 min-h-[300px] max-h-[360px] overflow-y-auto space-y-2 font-mono text-xs">
              {logs.length === 0 ? (
                <div className="text-neutral-600 italic py-12 text-center select-none">
                  Click "Run Code" to execute and view console outputs...
                </div>
              ) : (
                logs.map((log, i) => (
                  <div
                    key={i}
                    className={`p-2 rounded border leading-relaxed break-all ${
                      log.type === 'error'
                        ? 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                        : log.type === 'warn'
                        ? 'bg-amber-950/30 border-amber-500/40 text-amber-300'
                        : log.type === 'info'
                        ? 'bg-sky-950/30 border-sky-500/40 text-sky-300'
                        : 'bg-[#1C2426]/50 border-neutral-800 text-neutral-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-neutral-500 mb-1">
                      <span className="uppercase font-bold">{log.type}</span>
                      <span>{log.timestamp}</span>
                    </div>
                    <pre className="whitespace-pre-wrap font-mono text-xs">{log.content}</pre>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Execution Time Benchmark */}
          <div className="mt-4 pt-3 border-t border-[#252D30] flex items-center justify-between text-xs font-mono">
            <span className="text-neutral-400">Execution Latency:</span>
            {executionTime !== null ? (
              <span className="text-[#B5FF4A] font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {executionTime.toFixed(2)} ms
              </span>
            ) : (
              <span className="text-neutral-600">Pending</span>
            )}
          </div>
        </div>
      </div>

      {/* Security Disclaimer Note */}
      <div className="p-4 rounded-xl bg-[#101314] border border-[#252D30] flex items-start gap-3">
        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-xs text-neutral-400 leading-relaxed font-sans">
          <strong className="text-white">Note:</strong> Browser execution runs directly within your local browser's JavaScript engine. It is safe for educational demos, personal scripts, and algorithm prototyping, but does not isolate malicious scripts from untrusted external parties. Never paste unverified code from unknown sources.
        </p>
      </div>
    </div>
  );
};

