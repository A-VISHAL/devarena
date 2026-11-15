import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft, 
  Workflow, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  Info,
  Clock,
  HardDrive
} from 'lucide-react';
import { sound } from '../../../utils/sound';

type DsaPattern = 
  | 'two-pointers' 
  | 'sliding-window' 
  | 'fast-slow' 
  | 'prefix-sum' 
  | 'monotonic-stack' 
  | 'bfs' 
  | 'dfs' 
  | 'dp';

interface PatternMeta {
  id: DsaPattern;
  name: string;
  tagline: string;
  timeComp: string;
  spaceComp: string;
  description: string;
}

const PATTERNS: PatternMeta[] = [
  {
    id: 'two-pointers',
    name: 'Two Pointers',
    tagline: 'Converging pointers on sorted sequences',
    timeComp: 'O(N)',
    spaceComp: 'O(1)',
    description: 'Use two reference markers moving toward each other to find pairs in sorted arrays without O(N²) quadratic loops.'
  },
  {
    id: 'sliding-window',
    name: 'Sliding Window',
    tagline: 'Dynamic or fixed sub-array range inspection',
    timeComp: 'O(N)',
    spaceComp: 'O(K) or O(1)',
    description: 'Maintains an active contiguous range [L..R], expanding right to capture elements and contracting left to satisfy invariants.'
  },
  {
    id: 'fast-slow',
    name: 'Fast & Slow Pointers',
    tagline: 'Floyd cycle detection (Tortoise and Hare)',
    timeComp: 'O(N)',
    spaceComp: 'O(1)',
    description: 'Move one pointer at speed 1 and another at speed 2. If a cycle exists, the fast pointer will lap and meet the slow pointer.'
  },
  {
    id: 'prefix-sum',
    name: 'Prefix Sum',
    tagline: 'Precomputed cumulative sums for O(1) range queries',
    timeComp: 'O(N) build, O(1) query',
    spaceComp: 'O(N)',
    description: 'Construct prefix array P where P[i] = P[i-1] + arr[i]. Any sub-range sum [L..R] is answered instantly via P[R] - P[L-1].'
  },
  {
    id: 'monotonic-stack',
    name: 'Monotonic Stack',
    tagline: 'Next Greater / Smaller Element in linear time',
    timeComp: 'O(N)',
    spaceComp: 'O(N)',
    description: 'Maintains elements in strictly increasing or decreasing order. Popping elements when invariant is violated resolves relationships.'
  },
  {
    id: 'bfs',
    name: 'Breadth-First Search (BFS)',
    tagline: 'Level-order queue traversal',
    timeComp: 'O(V + E)',
    spaceComp: 'O(V)',
    description: 'Explores neighboring nodes level-by-level using a FIFO queue. Ideal for finding unweighted shortest paths.'
  },
  {
    id: 'dfs',
    name: 'Depth-First Search (DFS)',
    tagline: 'Deep dive call stack exploration',
    timeComp: 'O(V + E)',
    spaceComp: 'O(H) stack',
    description: 'Explores as far as possible along each branch before backtracking, leveraging the recursive call stack or explicit LIFO stack.'
  },
  {
    id: 'dp',
    name: 'Dynamic Programming (Tabulation)',
    tagline: 'Bottom-up overlapping subproblems memoization',
    timeComp: 'O(N)',
    spaceComp: 'O(N)',
    description: 'Breaks problems into subproblems and stores results in a lookup table (e.g., Fibonacci or 0/1 Knapsack) to eliminate exponential work.'
  }
];

export const DsaPatternVisualizer: React.FC = () => {
  const [activePattern, setActivePattern] = useState<DsaPattern>('two-pointers');
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(700);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset step on pattern switch
  useEffect(() => {
    setStepIndex(0);
    setIsPlaying(false);
  }, [activePattern]);

  // Pattern-specific states and step generators
  const currentMeta = PATTERNS.find(p => p.id === activePattern)!;

  // 1. Two Pointers Data: Target sum = 18 on [2, 4, 7, 11, 14, 16, 20]
  const twoPointersSteps = [
    { left: 0, right: 6, sum: 22, log: 'left = 0 (2), right = 6 (20). Sum = 22 > 18. Too large, decrement right pointer.' },
    { left: 0, right: 5, sum: 18, log: 'left = 0 (2), right = 5 (16). Sum = 18 === 18! Target pair found: (2, 16).' }
  ];
  const twoPointersArr = [2, 4, 7, 11, 14, 16, 20];

  // 2. Sliding Window Data: Max sum sub-array of size K = 3 on [2, 1, 5, 1, 3, 2]
  const slidingWindowArr = [2, 1, 5, 1, 3, 2];
  const slidingWindowSteps = [
    { start: 0, end: 2, sum: 8, max: 8, log: 'Initial window [2, 1, 5]. Current sum = 8. Best max = 8.' },
    { start: 1, end: 3, sum: 7, max: 8, log: 'Slide window: subtract arr[0] (2), add arr[3] (1). Window [1, 5, 1], sum = 7.' },
    { start: 2, end: 4, sum: 9, max: 9, log: 'Slide window: subtract arr[1] (1), add arr[4] (3). Window [5, 1, 3], sum = 9. New max = 9!' },
    { start: 3, end: 5, sum: 6, max: 9, log: 'Slide window: subtract arr[2] (5), add arr[5] (2). Window [1, 3, 2], sum = 6. Finished.' }
  ];

  // 3. Fast and Slow Pointers Data: Linked List 1 -> 2 -> 3 -> 4 -> 5 -> (loops back to 3)
  const cycleList = [1, 2, 3, 4, 5];
  const fastSlowSteps = [
    { slow: 0, fast: 0, log: 'Start: slow = Node 1, fast = Node 1.' },
    { slow: 1, fast: 2, log: 'Step 1: slow moves to Node 2 (speed 1), fast moves to Node 3 (speed 2).' },
    { slow: 2, fast: 4, log: 'Step 2: slow moves to Node 3, fast moves to Node 5.' },
    { slow: 3, fast: 3, log: 'Step 3: slow moves to Node 4, fast loops around and lands on Node 3.' },
    { slow: 4, fast: 5, log: 'Step 4: slow moves to Node 5, fast moves to Node 5. Cycle collision detected at Node 5!' }
  ];

  // 4. Prefix Sum Data: arr = [3, 1, 4, 2, 5]
  const prefixArr = [3, 1, 4, 2, 5];
  const prefixSteps = [
    { computedIdx: 0, pArr: [3], log: 'P[0] = arr[0] = 3.' },
    { computedIdx: 1, pArr: [3, 4], log: 'P[1] = P[0] + arr[1] = 3 + 1 = 4.' },
    { computedIdx: 2, pArr: [3, 4, 8], log: 'P[2] = P[1] + arr[2] = 4 + 4 = 8.' },
    { computedIdx: 3, pArr: [3, 4, 8, 10], log: 'P[3] = P[2] + arr[3] = 8 + 2 = 10.' },
    { computedIdx: 4, pArr: [3, 4, 8, 10, 15], log: 'P[4] = P[3] + arr[4] = 10 + 5 = 15. Query sum(1..3) = P[3] - P[0] = 10 - 3 = 7!' }
  ];

  // 5. Monotonic Stack: arr = [2, 1, 5, 6, 2, 3] -> Next Greater Element
  const monoArr = [2, 1, 5, 6, 2, 3];
  const monoSteps = [
    { currIdx: 0, stack: [2], log: 'Process 2: stack is empty, push 2.' },
    { currIdx: 1, stack: [2, 1], log: 'Process 1: 1 < 2, monotonic invariant holds, push 1.' },
    { currIdx: 2, stack: [5], log: 'Process 5: 5 > 1 (pop 1, next greater of 1 is 5), 5 > 2 (pop 2, next greater is 5). Push 5.' },
    { currIdx: 3, stack: [6], log: 'Process 6: 6 > 5 (pop 5, next greater of 5 is 6). Push 6.' },
    { currIdx: 4, stack: [6, 2], log: 'Process 2: 2 < 6, push 2.' },
    { currIdx: 5, stack: [6, 3], log: 'Process 3: 3 > 2 (pop 2, next greater is 3). Push 3.' }
  ];

  // 6. BFS Tree Level Traversal: Levels [1], [2, 3], [4, 5, 6]
  const bfsSteps = [
    { queue: ['1'], visited: ['1'], current: '1', log: 'Queue init with Root [1]. Pop 1, visit its children [2, 3].' },
    { queue: ['2', '3'], visited: ['1', '2'], current: '2', log: 'Pop 2 from queue. Visit children of 2: [4, 5].' },
    { queue: ['3', '4', '5'], visited: ['1', '2', '3'], current: '3', log: 'Pop 3 from queue. Visit child of 3: [6].' },
    { queue: ['4', '5', '6'], visited: ['1', '2', '3', '4'], current: '4', log: 'Pop 4 (leaf node).' },
    { queue: ['5', '6'], visited: ['1', '2', '3', '4', '5'], current: '5', log: 'Pop 5 (leaf node).' },
    { queue: ['6'], visited: ['1', '2', '3', '4', '5', '6'], current: '6', log: 'Pop 6. All nodes visited in level order!' }
  ];

  // 7. DFS Call Stack Traversal
  const dfsSteps = [
    { stack: ['Root (1)'], log: 'Call dfs(1). Push onto call stack.' },
    { stack: ['Root (1)', 'Left (2)'], log: 'Explore left child first: call dfs(2).' },
    { stack: ['Root (1)', 'Left (2)', 'LeftLeaf (4)'], log: 'Explore left child of 2: call dfs(4). Leaf reached, backtrack.' },
    { stack: ['Root (1)', 'Left (2)', 'RightLeaf (5)'], log: 'Backtrack to 2, explore right child: call dfs(5). Leaf reached, backtrack.' },
    { stack: ['Root (1)', 'Right (3)'], log: 'Backtrack to 1, explore right branch: call dfs(3).' },
    { stack: [], log: 'DFS traversal complete! All branches explored depth-first.' }
  ];

  // 8. Dynamic Programming Tabulation: Fibonacci F(0)..F(5)
  const dpArr = [0, 1, 2, 3, 4, 5];
  const dpSteps = [
    { table: [0, 1], activeIdx: 1, log: 'Base cases: dp[0] = 0, dp[1] = 1.' },
    { table: [0, 1, 1], activeIdx: 2, log: 'dp[2] = dp[1] + dp[0] = 1 + 0 = 1.' },
    { table: [0, 1, 1, 2], activeIdx: 3, log: 'dp[3] = dp[2] + dp[1] = 1 + 1 = 2.' },
    { table: [0, 1, 1, 2, 3], activeIdx: 4, log: 'dp[4] = dp[3] + dp[2] = 2 + 1 = 3.' },
    { table: [0, 1, 1, 2, 3, 5], activeIdx: 5, log: 'dp[5] = dp[4] + dp[3] = 3 + 2 = 5. Result for F(5) is computed in O(N) time with no repeated work!' }
  ];

  // Determine current active steps array length
  const getStepCount = () => {
    switch (activePattern) {
      case 'two-pointers': return twoPointersSteps.length;
      case 'sliding-window': return slidingWindowSteps.length;
      case 'fast-slow': return fastSlowSteps.length;
      case 'prefix-sum': return prefixSteps.length;
      case 'monotonic-stack': return monoSteps.length;
      case 'bfs': return bfsSteps.length;
      case 'dfs': return dfsSteps.length;
      case 'dp': return dpSteps.length;
    }
  };

  const totalSteps = getStepCount();

  // Animation player
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setStepIndex(prev => {
          if (prev < totalSteps - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            sound.success();
            return prev;
          }
        });
      }, speed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, totalSteps, speed]);

  const handleNext = () => {
    sound.click();
    if (stepIndex < totalSteps - 1) setStepIndex(stepIndex + 1);
  };

  const handlePrev = () => {
    sound.click();
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  };

  const handleReset = () => {
    sound.click();
    setIsPlaying(false);
    setStepIndex(0);
  };

  const togglePlay = () => {
    sound.click();
    if (stepIndex >= totalSteps - 1) setStepIndex(0);
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="space-y-6">
      {/* Pattern Selector Tabs */}
      <div className="bg-[#1C2426] border border-[#252D30] rounded-xl p-3 shadow-lg">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {PATTERNS.map(p => (
            <button
              key={p.id}
              onClick={() => {
                sound.click();
                setActivePattern(p.id);
              }}
              className={`px-3.5 py-2 rounded-lg text-xs font-mono font-medium whitespace-nowrap transition-all border ${
                activePattern === p.id
                  ? 'bg-[#00E5FF]/15 border-[#00E5FF] text-[#00E5FF] shadow-sm shadow-[#00E5FF]/20 font-bold'
                  : 'bg-[#101314] border-[#252D30] text-neutral-400 hover:text-white hover:border-neutral-700'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Pattern Header / Specs */}
      <div className="bg-[#1C2426] border border-[#252D30] rounded-xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#B5FF4A]/10 text-[#B5FF4A] border border-[#B5FF4A]/20">
                CORE PARADIGM
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                {currentMeta.tagline}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">{currentMeta.name}</h2>
            <p className="text-xs text-neutral-300 mt-0.5 max-w-2xl leading-relaxed">
              {currentMeta.description}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-[#101314] px-3 py-2 rounded-lg border border-[#252D30] text-center min-w-[90px]">
              <div className="text-[10px] uppercase font-mono text-neutral-500 flex items-center justify-center gap-1">
                <Clock className="w-3 h-3 text-[#FFAD42]" /> Time
              </div>
              <div className="text-xs font-mono font-bold text-[#FFAD42] mt-0.5">{currentMeta.timeComp}</div>
            </div>
            <div className="bg-[#101314] px-3 py-2 rounded-lg border border-[#252D30] text-center min-w-[90px]">
              <div className="text-[10px] uppercase font-mono text-neutral-500 flex items-center justify-center gap-1">
                <HardDrive className="w-3 h-3 text-[#00E5FF]" /> Space
              </div>
              <div className="text-xs font-mono font-bold text-[#00E5FF] mt-0.5">{currentMeta.spaceComp}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Demonstration Stage */}
      <div className="bg-[#1C2426] border border-[#252D30] rounded-xl p-6 shadow-xl relative min-h-[300px] flex flex-col justify-between">
        {/* Render Pattern Specific Visual Elements */}
        <div className="my-auto py-8">
          {/* TWO POINTERS */}
          {activePattern === 'two-pointers' && (
            <div className="flex flex-col items-center">
              <div className="text-xs font-mono text-neutral-400 mb-6">
                Goal: Find pair with sum = <span className="text-[#00E5FF] font-bold">18</span>
              </div>
              <div className="flex items-center justify-center gap-2.5">
                {twoPointersArr.map((val, idx) => {
                  const step = twoPointersSteps[stepIndex];
                  const isLeft = idx === step.left;
                  const isRight = idx === step.right;
                  const isPairFound = stepIndex === 1 && (isLeft || isRight);

                  return (
                    <div key={idx} className="flex flex-col items-center relative">
                      <div className="absolute -top-7 text-[10px] font-mono font-bold">
                        {isLeft && <span className="text-amber-400">LEFT</span>}
                        {isRight && <span className="text-[#00E5FF]">RIGHT</span>}
                      </div>
                      <div
                        className={`w-12 h-14 rounded-lg flex items-center justify-center font-mono font-bold text-base transition-all duration-300 border ${
                          isPairFound
                            ? 'bg-[#B5FF4A]/20 border-[#B5FF4A] text-[#B5FF4A] scale-110 shadow-lg shadow-[#B5FF4A]/30'
                            : isLeft
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300 scale-105'
                            : isRight
                            ? 'bg-[#00E5FF]/20 border-[#00E5FF] text-[#00E5FF] scale-105'
                            : 'bg-[#101314] border-[#252D30] text-neutral-400'
                        }`}
                      >
                        {val}
                      </div>
                      <span className="text-[10px] text-neutral-500 font-mono mt-1.5">{idx}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SLIDING WINDOW */}
          {activePattern === 'sliding-window' && (
            <div className="flex flex-col items-center">
              <div className="text-xs font-mono text-neutral-400 mb-6">
                Goal: Max sum contiguous sub-array of fixed window size <span className="text-[#00E5FF] font-bold">K = 3</span>
              </div>
              <div className="flex items-center justify-center gap-2.5">
                {slidingWindowArr.map((val, idx) => {
                  const step = slidingWindowSteps[stepIndex];
                  const inWindow = idx >= step.start && idx <= step.end;

                  return (
                    <div key={idx} className="flex flex-col items-center relative">
                      <div
                        className={`w-12 h-14 rounded-lg flex items-center justify-center font-mono font-bold text-base transition-all duration-300 border ${
                          inWindow
                            ? 'bg-[#00E5FF]/20 border-[#00E5FF] text-[#00E5FF] ring-2 ring-[#00E5FF]/50 scale-105'
                            : 'bg-[#101314] border-[#252D30] text-neutral-600 opacity-40'
                        }`}
                      >
                        {val}
                      </div>
                      <span className="text-[10px] text-neutral-500 font-mono mt-1.5">{idx}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* FAST AND SLOW POINTERS */}
          {activePattern === 'fast-slow' && (
            <div className="flex flex-col items-center">
              <div className="text-xs font-mono text-neutral-400 mb-6">
                Goal: Detect loop cycle (Node 5 points back to Node 3)
              </div>
              <div className="flex items-center justify-center gap-3">
                {cycleList.map((val, idx) => {
                  const step = fastSlowSteps[stepIndex];
                  const isSlow = idx === step.slow;
                  const isFast = idx === step.fast;

                  return (
                    <div key={idx} className="flex flex-col items-center relative">
                      <div className="absolute -top-7 text-[9px] font-mono font-bold flex gap-1">
                        {isSlow && <span className="text-amber-400 bg-amber-400/10 px-1 rounded">SLOW</span>}
                        {isFast && <span className="text-[#00E5FF] bg-[#00E5FF]/10 px-1 rounded">FAST</span>}
                      </div>
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-mono font-bold text-sm transition-all duration-300 border ${
                          isSlow && isFast && stepIndex === 4
                            ? 'bg-[#B5FF4A]/20 border-[#B5FF4A] text-[#B5FF4A] ring-2 ring-[#B5FF4A] scale-110'
                            : isSlow
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                            : isFast
                            ? 'bg-[#00E5FF]/20 border-[#00E5FF] text-[#00E5FF]'
                            : 'bg-[#101314] border-[#252D30] text-neutral-300'
                        }`}
                      >
                        {val}
                      </div>
                      {idx < cycleList.length - 1 && (
                        <span className="text-neutral-600 text-xs font-mono">→</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PREFIX SUM */}
          {activePattern === 'prefix-sum' && (
            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-neutral-400 w-16 text-right">Original:</span>
                <div className="flex gap-2">
                  {prefixArr.map((v, i) => (
                    <div key={i} className="w-10 h-10 rounded bg-[#101314] border border-[#252D30] text-white flex items-center justify-center font-mono text-xs font-bold">
                      {v}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[#00E5FF] w-16 text-right">Prefix P:</span>
                <div className="flex gap-2">
                  {prefixSteps[stepIndex].pArr.map((v, i) => (
                    <div key={i} className="w-10 h-10 rounded bg-[#00E5FF]/20 border border-[#00E5FF] text-[#00E5FF] flex items-center justify-center font-mono text-xs font-bold animate-fadeIn">
                      {v}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* MONOTONIC STACK */}
          {activePattern === 'monotonic-stack' && (
            <div className="flex flex-col items-center">
              <div className="text-xs font-mono text-neutral-400 mb-4">
                Current Stack State (Monotonically Decreasing):
              </div>
              <div className="flex items-center gap-2 min-h-[50px] bg-[#101314] p-3 rounded-xl border border-[#252D30]">
                {monoSteps[stepIndex].stack.map((v, i) => (
                  <div key={i} className="px-3 py-1.5 rounded-lg bg-[#FFAD42]/20 border border-[#FFAD42] text-[#FFAD42] font-mono font-bold text-sm">
                    {v}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BFS */}
          {activePattern === 'bfs' && (
            <div className="flex flex-col items-center">
              <div className="text-xs font-mono text-neutral-400 mb-2">FIFO Queue:</div>
              <div className="flex items-center gap-2 bg-[#101314] px-4 py-2 rounded-lg border border-[#252D30]">
                {bfsSteps[stepIndex].queue.map((node, i) => (
                  <span key={i} className="px-2.5 py-1 bg-[#00E5FF]/15 border border-[#00E5FF] text-[#00E5FF] rounded font-mono font-bold text-xs">
                    {node}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* DFS */}
          {activePattern === 'dfs' && (
            <div className="flex flex-col items-center">
              <div className="text-xs font-mono text-neutral-400 mb-2">Recursive Call Stack:</div>
              <div className="flex flex-col-reverse items-center gap-1.5 min-w-[200px]">
                {dfsSteps[stepIndex].stack.map((frame, i) => (
                  <div key={i} className="w-full py-1.5 px-3 bg-[#B5FF4A]/10 border border-[#B5FF4A]/40 text-[#B5FF4A] rounded text-center font-mono text-xs font-bold">
                    {frame}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DYNAMIC PROGRAMMING */}
          {activePattern === 'dp' && (
            <div className="flex flex-col items-center">
              <div className="text-xs font-mono text-neutral-400 mb-3">
                1D Tabulation Memo Table [dp[0] .. dp[5]]:
              </div>
              <div className="flex items-center gap-2">
                {dpSteps[stepIndex].table.map((val, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <span className="text-[10px] font-mono text-neutral-500 mb-1">F({idx})</span>
                    <div className="w-11 h-11 rounded-lg bg-[#00E5FF]/20 border border-[#00E5FF] text-[#00E5FF] flex items-center justify-center font-mono font-bold text-sm">
                      {val}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Narrative Box */}
        <div className="p-4 rounded-xl bg-[#101314] border border-[#252D30] flex items-start gap-3">
          <div className="p-2 rounded-lg bg-[#252D30] text-[#00E5FF] shrink-0 mt-0.5">
            <CheckCircle2 className="w-5 h-5 text-[#00E5FF]" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-white">
                STEP {stepIndex + 1} OF {totalSteps}
              </span>
              <span className="text-[10px] font-mono text-neutral-500">
                Pattern Invariant Active
              </span>
            </div>
            <p className="text-xs text-neutral-300 mt-1 font-mono leading-relaxed">
              {activePattern === 'two-pointers' && twoPointersSteps[stepIndex]?.log}
              {activePattern === 'sliding-window' && slidingWindowSteps[stepIndex]?.log}
              {activePattern === 'fast-slow' && fastSlowSteps[stepIndex]?.log}
              {activePattern === 'prefix-sum' && prefixSteps[stepIndex]?.log}
              {activePattern === 'monotonic-stack' && monoSteps[stepIndex]?.log}
              {activePattern === 'bfs' && bfsSteps[stepIndex]?.log}
              {activePattern === 'dfs' && dfsSteps[stepIndex]?.log}
              {activePattern === 'dp' && dpSteps[stepIndex]?.log}
            </p>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="mt-5 pt-4 border-t border-[#252D30] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition-all ${
                isPlaying
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                  : 'bg-[#00E5FF] text-black shadow-lg shadow-[#00E5FF]/20 hover:brightness-110'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4" /> Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" /> Play
                </>
              )}
            </button>

            <button
              onClick={handlePrev}
              disabled={stepIndex === 0}
              className="p-2 bg-[#252D30] hover:bg-[#2F383C] text-neutral-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={handleNext}
              disabled={stepIndex >= totalSteps - 1}
              className="p-2 bg-[#252D30] hover:bg-[#2F383C] text-neutral-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleReset}
              className="p-2 bg-[#252D30] hover:bg-[#2F383C] text-neutral-300 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-neutral-400 font-mono">Speed:</span>
            <input
              type="range"
              min="200"
              max="1500"
              step="100"
              value={speed}
              onChange={e => setSpeed(Number(e.target.value))}
              className="w-28 accent-[#00E5FF] cursor-pointer"
            />
            <span className="text-xs text-neutral-400 font-mono w-14">
              {speed}ms
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

