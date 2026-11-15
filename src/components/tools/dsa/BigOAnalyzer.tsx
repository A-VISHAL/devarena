import React, { useState } from 'react';
import { 
  TrendingUp, 
  Code2, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Copy, 
  Check, 
  Zap, 
  Info,
  BarChart2
} from 'lucide-react';
import { sound } from '../../../utils/sound';

interface ComplexityResult {
  timeComplexity: string;
  spaceComplexity: string;
  confidence: 'High' | 'Medium' | 'Estimated';
  reasoning: string[];
  loopDepth: number;
  hasRecursion: boolean;
  hasHalving: boolean;
  allocatesMemory: boolean;
}

const PRESETS: {
  title: string;
  complexity: string;
  code: string;
}[] = [
  {
    title: 'O(1) - Constant Lookup',
    complexity: 'O(1)',
    code: `function getFirstElement(arr) {
  // Direct indexed access takes constant time
  if (arr.length === 0) return null;
  return arr[0];
}`
  },
  {
    title: 'O(log N) - Binary Search',
    complexity: 'O(log N)',
    code: `function binarySearch(arr, target) {
  let low = 0, high = arr.length - 1;
  while (low <= high) {
    let mid = Math.floor((low + high) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) low = mid + 1;
    else high = mid - 1;
  }
  return -1;
}`
  },
  {
    title: 'O(N) - Linear Scan',
    complexity: 'O(N)',
    code: `function findMax(arr) {
  let max = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      max = arr[i];
    }
  }
  return max;
}`
  },
  {
    title: 'O(N log N) - Merge / Sort',
    complexity: 'O(N log N)',
    code: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right); // merge takes O(N) linear work
}`
  },
  {
    title: 'O(N²) - Nested Loops',
    complexity: 'O(N²)',
    code: `function findDuplicates(arr) {
  const duplicates = [];
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] === arr[j]) {
        duplicates.push(arr[i]);
      }
    }
  }
  return duplicates;
}`
  },
  {
    title: 'O(2ⁿ) - Naive Fibonacci',
    complexity: 'O(2ⁿ)',
    code: `function fibonacci(n) {
  if (n <= 1) return n;
  // Branching tree generates 2^n recursive call frames
  return fibonacci(n - 1) + fibonacci(n - 2);
}`
  }
];

export const BigOAnalyzer: React.FC = () => {
  const [code, setCode] = useState<string>(PRESETS[2].code);
  const [copied, setCopied] = useState<boolean>(false);
  const [selectedPreset, setSelectedPreset] = useState<string>(PRESETS[2].title);
  const [testInputSize, setTestInputSize] = useState<number>(100);

  // Static AST/Pattern Analysis Parser
  const analyzeCode = (src: string): ComplexityResult => {
    const clean = src.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
    const reasoning: string[] = [];
    
    // Check loops
    const forMatches = (clean.match(/for\s*\(/g) || []).length;
    const whileMatches = (clean.match(/while\s*\(/g) || []).length;
    const forEachMatches = (clean.match(/\.(map|filter|forEach|reduce|some|every)\s*\(/g) || []).length;
    
    // Check nested loops heuristic
    let maxNesting = 0;
    const lines = clean.split('\n');
    let currentNesting = 0;
    for (const line of lines) {
      if (/for\s*\(|while\s*\(|\.(map|filter|forEach)\s*\(/.test(line)) {
        currentNesting++;
        if (currentNesting > maxNesting) maxNesting = currentNesting;
      }
      if (line.includes('}')) {
        currentNesting = Math.max(0, currentNesting - 1);
      }
    }

    const totalLoops = forMatches + whileMatches + forEachMatches;

    // Check halving / logarithmic markers
    const hasHalving = /low\s*=\s*mid|high\s*=\s*mid|\/\s*2|\*=\s*2|\/=\s*2|>>\s*1|Math\.floor\(\s*\(low\s*\+\s*high\)\s*\/\s*2\)/.test(clean);
    
    // Check recursion
    const functionNameMatch = clean.match(/function\s+([a-zA-Z0-9_$]+)/);
    const fnName = functionNameMatch ? functionNameMatch[1] : null;
    let recursiveCalls = 0;
    if (fnName) {
      const regex = new RegExp(`\\b${fnName}\\s*\\(`, 'g');
      const matches = clean.match(regex);
      if (matches) {
        recursiveCalls = matches.length - 1; // subtract declaration
      }
    }

    // Check branching recursion: e.g. fn(n-1) + fn(n-2)
    const isBranchingRecursion = recursiveCalls >= 2 && !/memo|cache|dp\[/.test(clean);

    // Check memory allocation
    const allocatesMemory = /new\s+Array|\[\s*\]|\.slice|\.concat|\.push|new\s+Map|new\s+Set/.test(clean);

    let timeComplexity = 'O(1)';
    let spaceComplexity = 'O(1)';
    let confidence: 'High' | 'Medium' | 'Estimated' = 'Medium';

    // Decision Tree
    if (isBranchingRecursion) {
      timeComplexity = 'O(2ⁿ)';
      spaceComplexity = 'O(N)';
      confidence = 'High';
      reasoning.push('Detected branching recursive calls without memoization (call tree doubles at each tier).');
      reasoning.push('Space complexity is O(N) due to call stack depth up to maximum recursion tree height.');
    } else if (recursiveCalls > 0 && clean.includes('slice') && /merge/.test(clean)) {
      timeComplexity = 'O(N log N)';
      spaceComplexity = 'O(N)';
      confidence = 'High';
      reasoning.push('Detected divide-and-conquer splitting with linear recombination (Merge Sort pattern).');
      reasoning.push('Allocates slice copies yielding O(N) auxiliary space.');
    } else if (maxNesting >= 3) {
      timeComplexity = 'O(N³)';
      spaceComplexity = allocatesMemory ? 'O(N)' : 'O(1)';
      confidence = 'Medium';
      reasoning.push(`Identified ${maxNesting} levels of deeply nested loops.`);
    } else if (maxNesting === 2) {
      timeComplexity = 'O(N²)';
      spaceComplexity = allocatesMemory ? 'O(N)' : 'O(1)';
      confidence = 'High';
      reasoning.push('Identified 2 nested loop structures iterating over collection size N.');
      if (allocatesMemory) {
        reasoning.push('Collects elements in dynamic array/data structure (O(N) space).');
      }
    } else if (hasHalving && totalLoops > 0) {
      timeComplexity = 'O(log N)';
      spaceComplexity = 'O(1)';
      confidence = 'High';
      reasoning.push('Search space or loop counter is repeatedly halved/multiplied by 2 (logarithmic factor).');
    } else if (totalLoops > 0) {
      timeComplexity = 'O(N)';
      spaceComplexity = allocatesMemory ? 'O(N)' : 'O(1)';
      confidence = 'High';
      reasoning.push(`Identified single iterative loop or sequence of unnested loops across N elements.`);
      if (allocatesMemory) {
        reasoning.push('Allocates memory proportional to input elements.');
      }
    } else {
      timeComplexity = 'O(1)';
      spaceComplexity = 'O(1)';
      confidence = 'High';
      reasoning.push('No iterative loops or recursive invocations detected; executed via direct arithmetic/memory access.');
    }

    return {
      timeComplexity,
      spaceComplexity,
      confidence,
      reasoning,
      loopDepth: maxNesting,
      hasRecursion: recursiveCalls > 0,
      hasHalving,
      allocatesMemory
    };
  };

  const result = analyzeCode(code);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    sound.click();
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePresetSelect = (preset: typeof PRESETS[0]) => {
    sound.click();
    setCode(preset.code);
    setSelectedPreset(preset.title);
  };

  // Asymptotic operations calculator for charts
  const calcOperations = (complexity: string, n: number): number => {
    switch (complexity) {
      case 'O(1)': return 1;
      case 'O(log N)': return Math.max(1, Math.round(Math.log2(n)));
      case 'O(N)': return n;
      case 'O(N log N)': return Math.round(n * Math.log2(n));
      case 'O(N²)': return n * n;
      case 'O(N³)': return n * n * n;
      case 'O(2ⁿ)': return Math.min(1000000000, Math.pow(2, Math.min(n, 30)));
      default: return n;
    }
  };

  const opsCurrent = calcOperations(result.timeComplexity, testInputSize);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#1C2426] border border-[#252D30] rounded-xl p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FFAD42]/10 text-[#FFAD42] border border-[#FFAD42]/20">
                STATIC PATTERN ANALYSIS
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                No External AI APIs • Client-Side Pattern Parsing
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">Big O Complexity Analyzer</h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Inspect loop depths, recursion call trees, divide-and-conquer splits, and evaluate asymptotic runtime curves.
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map(p => (
              <button
                key={p.title}
                onClick={() => handlePresetSelect(p)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors border ${
                  selectedPreset === p.title
                    ? 'bg-[#00E5FF]/20 border-[#00E5FF] text-[#00E5FF]'
                    : 'bg-[#101314] border-[#252D30] text-neutral-400 hover:text-white hover:border-neutral-600'
                }`}
              >
                {p.complexity}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Code Editor & Analysis Report */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Code Input Area (7 cols) */}
        <div className="lg:col-span-7 bg-[#1C2426] border border-[#252D30] rounded-xl p-5 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-[#00E5FF]" />
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Algorithm Source Snippet
                </span>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-[#252D30] hover:bg-[#2F383C] text-neutral-300 rounded transition-colors border border-neutral-700/40"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#B5FF4A]" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            <textarea
              value={code}
              onChange={e => {
                setCode(e.target.value);
                setSelectedPreset('');
              }}
              rows={14}
              placeholder="Paste or write your function code here to analyze..."
              className="w-full bg-[#101314] text-xs font-mono text-neutral-200 p-4 rounded-lg border border-[#252D30] focus:outline-none focus:border-[#00E5FF] leading-relaxed resize-y"
              spellCheck={false}
            />
          </div>

          <div className="mt-4 pt-4 border-t border-[#252D30] flex items-center justify-between text-xs text-neutral-400 font-mono">
            <span>Pattern Engine: Static Heuristics v2</span>
            <span>Lines: {code.split('\n').length}</span>
          </div>
        </div>

        {/* Right: Analysis Dashboard (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Complexity Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#1C2426] border border-[#252D30] rounded-xl p-4 relative overflow-hidden">
              <div className="text-[10px] uppercase font-mono font-bold text-neutral-400">Time Complexity</div>
              <div className="text-2xl font-mono font-bold text-[#FFAD42] mt-1">
                {result.timeComplexity}
              </div>
              <div className="text-[10px] text-neutral-500 mt-1">
                Confidence: <span className="text-neutral-300">{result.confidence}</span>
              </div>
            </div>

            <div className="bg-[#1C2426] border border-[#252D30] rounded-xl p-4 relative overflow-hidden">
              <div className="text-[10px] uppercase font-mono font-bold text-neutral-400">Auxiliary Space</div>
              <div className="text-2xl font-mono font-bold text-[#00E5FF] mt-1">
                {result.spaceComplexity}
              </div>
              <div className="text-[10px] text-neutral-500 mt-1">
                Call Stack & Allocations
              </div>
            </div>
          </div>

          {/* Reasoning Details */}
          <div className="bg-[#1C2426] border border-[#252D30] rounded-xl p-4">
            <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#B5FF4A]" />
              Analysis Reasoning
            </h4>
            <div className="space-y-2">
              {result.reasoning.map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-neutral-300 font-sans leading-relaxed">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#B5FF4A] shrink-0 mt-0.5" />
                  <span>{r}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-[#252D30] grid grid-cols-3 gap-2 text-center">
              <div className="bg-[#101314] p-2 rounded border border-[#252D30]">
                <div className="text-[10px] text-neutral-400 font-mono">Loop Depth</div>
                <div className="text-sm font-bold text-white font-mono">{result.loopDepth}</div>
              </div>
              <div className="bg-[#101314] p-2 rounded border border-[#252D30]">
                <div className="text-[10px] text-neutral-400 font-mono">Recursion</div>
                <div className="text-sm font-bold text-white font-mono">
                  {result.hasRecursion ? 'Yes' : 'No'}
                </div>
              </div>
              <div className="bg-[#101314] p-2 rounded border border-[#252D30]">
                <div className="text-[10px] text-neutral-400 font-mono">Halving</div>
                <div className="text-sm font-bold text-white font-mono">
                  {result.hasHalving ? 'Yes' : 'No'}
                </div>
              </div>
            </div>
          </div>

          {/* Scale Simulator */}
          <div className="bg-[#1C2426] border border-[#252D30] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-white font-mono uppercase">Scale Estimator</span>
              <span className="text-[10px] font-mono text-[#00E5FF]">N = {testInputSize.toLocaleString()}</span>
            </div>

            <input
              type="range"
              min="10"
              max="10000"
              step="50"
              value={testInputSize}
              onChange={e => setTestInputSize(Number(e.target.value))}
              className="w-full accent-[#00E5FF] cursor-pointer"
            />

            <div className="mt-3 p-2.5 rounded-lg bg-[#101314] border border-[#252D30] flex items-center justify-between text-xs font-mono">
              <span className="text-neutral-400">Estimated Operations:</span>
              <span className="text-[#FFAD42] font-bold">
                {opsCurrent >= 1000000000 ? '> 1,000,000,000 (Time Limit Exceeded)' : opsCurrent.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Complexity Comparison Visualizer Chart */}
      <div className="bg-[#1C2426] border border-[#252D30] rounded-xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-[#00E5FF]" />
              Asymptotic Growth Comparison Chart
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              How various time complexity classes behave as input size N grows from 1 to 64.
            </p>
          </div>
        </div>

        {/* Scaled Visual Curve SVG */}
        <div className="w-full h-64 bg-[#101314] rounded-xl border border-[#252D30] p-4 relative flex items-center justify-center">
          <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
            {/* Grid lines */}
            <line x1="50" y1="20" x2="50" y2="170" stroke="#252D30" strokeWidth="1" />
            <line x1="50" y1="170" x2="480" y2="170" stroke="#252D30" strokeWidth="1" />
            
            {/* Axis labels */}
            <text x="470" y="185" fill="#71717a" fontSize="10" textAnchor="end" fontFamily="monospace">Input Size (N) →</text>
            <text x="40" y="30" fill="#71717a" fontSize="10" textAnchor="end" fontFamily="monospace" transform="rotate(-90 40,30)">Operations (T) →</text>

            {/* O(1) - Constant */}
            <path d="M 50 165 L 480 165" fill="none" stroke="#B5FF4A" strokeWidth="2" strokeDasharray="3,3" />
            <text x="485" y="168" fill="#B5FF4A" fontSize="10" fontFamily="monospace">O(1)</text>

            {/* O(log N) */}
            <path d="M 50 165 Q 200 150 480 145" fill="none" stroke="#00E5FF" strokeWidth="2" />
            <text x="485" y="148" fill="#00E5FF" fontSize="10" fontFamily="monospace">O(log N)</text>

            {/* O(N) */}
            <path d="M 50 165 L 480 110" fill="none" stroke="#38bdf8" strokeWidth="2" />
            <text x="485" y="113" fill="#38bdf8" fontSize="10" fontFamily="monospace">O(N)</text>

            {/* O(N log N) */}
            <path d="M 50 165 Q 260 130 480 70" fill="none" stroke="#fbbf24" strokeWidth="2" />
            <text x="485" y="73" fill="#fbbf24" fontSize="10" fontFamily="monospace">O(N log N)</text>

            {/* O(N²) */}
            <path d="M 50 165 Q 220 150 350 20" fill="none" stroke="#f97316" strokeWidth="2.5" />
            <text x="355" y="25" fill="#f97316" fontSize="10" fontFamily="monospace">O(N²)</text>

            {/* O(2ⁿ) */}
            <path d="M 50 165 Q 110 160 150 20" fill="none" stroke="#f43f5e" strokeWidth="2.5" />
            <text x="155" y="25" fill="#f43f5e" fontSize="10" fontFamily="monospace">O(2ⁿ)</text>
          </svg>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-[#B5FF4A]">
            <span className="w-2.5 h-0.5 bg-[#B5FF4A]"></span> O(1) Excellent
          </span>
          <span className="flex items-center gap-1.5 text-[#00E5FF]">
            <span className="w-2.5 h-0.5 bg-[#00E5FF]"></span> O(log N) Great
          </span>
          <span className="flex items-center gap-1.5 text-sky-400">
            <span className="w-2.5 h-0.5 bg-sky-400"></span> O(N) Fair
          </span>
          <span className="flex items-center gap-1.5 text-amber-400">
            <span className="w-2.5 h-0.5 bg-amber-400"></span> O(N log N) Acceptable
          </span>
          <span className="flex items-center gap-1.5 text-orange-400">
            <span className="w-2.5 h-0.5 bg-orange-400"></span> O(N²) Poor
          </span>
          <span className="flex items-center gap-1.5 text-rose-500">
            <span className="w-2.5 h-0.5 bg-rose-500"></span> O(2ⁿ) Horrible
          </span>
        </div>
      </div>
    </div>
  );
};

