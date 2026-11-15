import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronRight, 
  Sparkles, 
  Sliders, 
  Clock, 
  Check, 
  BarChart3,
  Shuffle,
  Info
} from 'lucide-react';
import { sound } from '../../../utils/sound';

type SortAlgorithm = 'bubble' | 'selection' | 'insertion' | 'merge' | 'quick' | 'heap';

interface SortStep {
  array: number[];
  comparing: number[];
  swapping: number[];
  sortedIndices: number[];
  comparisons: number;
  swaps: number;
  description: string;
}

const ALGO_METADATA: Record<SortAlgorithm, {
  name: string;
  best: string;
  avg: string;
  worst: string;
  space: string;
  stable: boolean;
  summary: string;
}> = {
  bubble: {
    name: 'Bubble Sort',
    best: 'O(N)',
    avg: 'O(N²)',
    worst: 'O(N²)',
    space: 'O(1)',
    stable: true,
    summary: 'Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.'
  },
  selection: {
    name: 'Selection Sort',
    best: 'O(N²)',
    avg: 'O(N²)',
    worst: 'O(N²)',
    space: 'O(1)',
    stable: false,
    summary: 'Divides the list into a sorted and unsorted region, repeatedly selecting the smallest element from the unsorted region.'
  },
  insertion: {
    name: 'Insertion Sort',
    best: 'O(N)',
    avg: 'O(N²)',
    worst: 'O(N²)',
    space: 'O(1)',
    stable: true,
    summary: 'Builds the final sorted array one item at a time, inserting each element into its proper position in the sorted prefix.'
  },
  merge: {
    name: 'Merge Sort',
    best: 'O(N log N)',
    avg: 'O(N log N)',
    worst: 'O(N log N)',
    space: 'O(N)',
    stable: true,
    summary: 'A divide-and-conquer algorithm that recursively splits the array into halves, sorts them, and merges the sorted halves.'
  },
  quick: {
    name: 'Quick Sort',
    best: 'O(N log N)',
    avg: 'O(N log N)',
    worst: 'O(N²)',
    space: 'O(log N)',
    stable: false,
    summary: 'Picks an element as pivot and partitions the given array around the picked pivot by placing smaller elements before and larger after.'
  },
  heap: {
    name: 'Heap Sort',
    best: 'O(N log N)',
    avg: 'O(N log N)',
    worst: 'O(N log N)',
    space: 'O(1)',
    stable: false,
    summary: 'Builds a max heap from the input data, then repeatedly extracts the maximum element and places it at the end.'
  }
};

export const SortingVisualizer: React.FC = () => {
  const [algorithm, setAlgorithm] = useState<SortAlgorithm>('quick');
  const [arraySize, setArraySize] = useState<number>(20);
  const [speed, setSpeed] = useState<number>(60); // ms per step
  const [customInput, setCustomInput] = useState<string>('');
  
  // Steps generation
  const [steps, setSteps] = useState<SortStep[]>([]);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Generate initial array
  const generateRandomArray = (size: number): number[] => {
    const arr: number[] = [];
    for (let i = 0; i < size; i++) {
      arr.push(Math.floor(Math.random() * 90) + 10);
    }
    return arr;
  };

  // Compile steps for the chosen algorithm
  const generateSteps = (initial: number[], algo: SortAlgorithm): SortStep[] => {
    const stepsList: SortStep[] = [];
    let arr = [...initial];
    let comparisons = 0;
    let swaps = 0;

    // Record initial step
    stepsList.push({
      array: [...arr],
      comparing: [],
      swapping: [],
      sortedIndices: [],
      comparisons: 0,
      swaps: 0,
      description: 'Initial unsorted state'
    });

    if (algo === 'bubble') {
      const n = arr.length;
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n - i - 1; j++) {
          comparisons++;
          stepsList.push({
            array: [...arr],
            comparing: [j, j + 1],
            swapping: [],
            sortedIndices: Array.from({ length: i }, (_, k) => n - 1 - k),
            comparisons,
            swaps,
            description: `Comparing elements ${arr[j]} and ${arr[j + 1]}`
          });

          if (arr[j] > arr[j + 1]) {
            swaps++;
            const temp = arr[j];
            arr[j] = arr[j + 1];
            arr[j + 1] = temp;

            stepsList.push({
              array: [...arr],
              comparing: [],
              swapping: [j, j + 1],
              sortedIndices: Array.from({ length: i }, (_, k) => n - 1 - k),
              comparisons,
              swaps,
              description: `Swapped ${arr[j + 1]} and ${arr[j]}`
            });
          }
        }
      }
    } else if (algo === 'selection') {
      const n = arr.length;
      for (let i = 0; i < n; i++) {
        let minIdx = i;
        for (let j = i + 1; j < n; j++) {
          comparisons++;
          stepsList.push({
            array: [...arr],
            comparing: [minIdx, j],
            swapping: [],
            sortedIndices: Array.from({ length: i }, (_, k) => k),
            comparisons,
            swaps,
            description: `Checking if ${arr[j]} is smaller than current minimum ${arr[minIdx]}`
          });

          if (arr[j] < arr[minIdx]) {
            minIdx = j;
          }
        }

        if (minIdx !== i) {
          swaps++;
          const temp = arr[i];
          arr[i] = arr[minIdx];
          arr[minIdx] = temp;

          stepsList.push({
            array: [...arr],
            comparing: [],
            swapping: [i, minIdx],
            sortedIndices: Array.from({ length: i + 1 }, (_, k) => k),
            comparisons,
            swaps,
            description: `Placed minimum ${arr[i]} into sorted index ${i}`
          });
        }
      }
    } else if (algo === 'insertion') {
      const n = arr.length;
      for (let i = 1; i < n; i++) {
        let key = arr[i];
        let j = i - 1;

        stepsList.push({
          array: [...arr],
          comparing: [i],
          swapping: [],
          sortedIndices: Array.from({ length: i }, (_, k) => k),
          comparisons,
          swaps,
          description: `Evaluating key element ${key} at index ${i}`
        });

        while (j >= 0 && arr[j] > key) {
          comparisons++;
          swaps++;
          arr[j + 1] = arr[j];

          stepsList.push({
            array: [...arr],
            comparing: [j, j + 1],
            swapping: [j + 1],
            sortedIndices: [],
            comparisons,
            swaps,
            description: `Shifted ${arr[j + 1]} rightward to open slot for ${key}`
          });

          j--;
        }
        arr[j + 1] = key;
        stepsList.push({
          array: [...arr],
          comparing: [],
          swapping: [j + 1],
          sortedIndices: Array.from({ length: i + 1 }, (_, k) => k),
          comparisons,
          swaps,
          description: `Inserted ${key} into position ${j + 1}`
        });
      }
    } else if (algo === 'quick') {
      const quickSortHelper = (low: number, high: number) => {
        if (low < high) {
          const pivot = arr[high];
          let i = low - 1;

          for (let j = low; j < high; j++) {
            comparisons++;
            stepsList.push({
              array: [...arr],
              comparing: [j, high],
              swapping: [],
              sortedIndices: [],
              comparisons,
              swaps,
              description: `Comparing element ${arr[j]} with pivot ${pivot}`
            });

            if (arr[j] < pivot) {
              i++;
              swaps++;
              const temp = arr[i];
              arr[i] = arr[j];
              arr[j] = temp;

              stepsList.push({
                array: [...arr],
                comparing: [],
                swapping: [i, j],
                sortedIndices: [],
                comparisons,
                swaps,
                description: `Partitioned ${arr[i]} to the left of pivot`
              });
            }
          }

          swaps++;
          const temp = arr[i + 1];
          arr[i + 1] = arr[high];
          arr[high] = temp;

          const pi = i + 1;
          stepsList.push({
            array: [...arr],
            comparing: [],
            swapping: [pi, high],
            sortedIndices: [pi],
            comparisons,
            swaps,
            description: `Pivot ${arr[pi]} fixed at position ${pi}`
          });

          quickSortHelper(low, pi - 1);
          quickSortHelper(pi + 1, high);
        }
      };

      quickSortHelper(0, arr.length - 1);
    } else if (algo === 'merge') {
      const mergeHelper = (l: number, m: number, r: number) => {
        const leftArr = arr.slice(l, m + 1);
        const rightArr = arr.slice(m + 1, r + 1);

        let i = 0, j = 0, k = l;

        while (i < leftArr.length && j < rightArr.length) {
          comparisons++;
          stepsList.push({
            array: [...arr],
            comparing: [l + i, m + 1 + j],
            swapping: [],
            sortedIndices: [],
            comparisons,
            swaps,
            description: `Comparing left sub-array element ${leftArr[i]} with right ${rightArr[j]}`
          });

          if (leftArr[i] <= rightArr[j]) {
            arr[k] = leftArr[i];
            i++;
          } else {
            arr[k] = rightArr[j];
            j++;
          }
          swaps++;
          stepsList.push({
            array: [...arr],
            comparing: [],
            swapping: [k],
            sortedIndices: [],
            comparisons,
            swaps,
            description: `Merged smaller element ${arr[k]} into index ${k}`
          });
          k++;
        }

        while (i < leftArr.length) {
          arr[k] = leftArr[i];
          i++;
          k++;
          stepsList.push({
            array: [...arr],
            comparing: [],
            swapping: [k - 1],
            sortedIndices: [],
            comparisons,
            swaps,
            description: `Flushed remaining left element into index ${k - 1}`
          });
        }

        while (j < rightArr.length) {
          arr[k] = rightArr[j];
          j++;
          k++;
          stepsList.push({
            array: [...arr],
            comparing: [],
            swapping: [k - 1],
            sortedIndices: [],
            comparisons,
            swaps,
            description: `Flushed remaining right element into index ${k - 1}`
          });
        }
      };

      const mergeSortRec = (l: number, r: number) => {
        if (l < r) {
          const m = Math.floor(l + (r - l) / 2);
          mergeSortRec(l, m);
          mergeSortRec(m + 1, r);
          mergeHelper(l, m, r);
        }
      };

      mergeSortRec(0, arr.length - 1);
    } else if (algo === 'heap') {
      const heapify = (n: number, i: number) => {
        let largest = i;
        const left = 2 * i + 1;
        const right = 2 * i + 2;

        if (left < n) {
          comparisons++;
          if (arr[left] > arr[largest]) largest = left;
        }

        if (right < n) {
          comparisons++;
          if (arr[right] > arr[largest]) largest = right;
        }

        if (largest !== i) {
          swaps++;
          const swap = arr[i];
          arr[i] = arr[largest];
          arr[largest] = swap;

          stepsList.push({
            array: [...arr],
            comparing: [i, largest],
            swapping: [i, largest],
            sortedIndices: [],
            comparisons,
            swaps,
            description: `Heapified subtree: swapped ${arr[i]} with ${arr[largest]}`
          });

          heapify(n, largest);
        }
      };

      const n = arr.length;
      for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        heapify(n, i);
      }

      for (let i = n - 1; i > 0; i--) {
        swaps++;
        const temp = arr[0];
        arr[0] = arr[i];
        arr[i] = temp;

        stepsList.push({
          array: [...arr],
          comparing: [0, i],
          swapping: [0, i],
          sortedIndices: Array.from({ length: n - i }, (_, k) => n - 1 - k),
          comparisons,
          swaps,
          description: `Extracted max element ${arr[i]} to sorted position ${i}`
        });

        heapify(i, 0);
      }
    }

    // Final completed step
    stepsList.push({
      array: [...arr],
      comparing: [],
      swapping: [],
      sortedIndices: Array.from({ length: arr.length }, (_, k) => k),
      comparisons,
      swaps,
      description: `✓ Array completely sorted with ${algo.toUpperCase()} sort!`
    });

    return stepsList;
  };

  // Reset or initialize with new array
  const handleResetArray = (customVals?: number[]) => {
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);

    const initial = customVals || generateRandomArray(arraySize);
    const computedSteps = generateSteps(initial, algorithm);
    setSteps(computedSteps);
    setCurrentStepIdx(0);
  };

  useEffect(() => {
    handleResetArray();
  }, [algorithm, arraySize]);

  // Handle Play / Pause
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentStepIdx(prev => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            sound.playVictory();
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, steps.length, speed]);

  const handleCustomInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;

    const parsed = customInput
      .split(/[, ]+/)
      .map(x => parseInt(x.trim(), 10))
      .filter(x => !isNaN(x) && x > 0 && x <= 100);

    if (parsed.length >= 4) {
      sound.playClick();
      setArraySize(parsed.length);
      handleResetArray(parsed);
    }
  };

  const currentStep = steps[currentStepIdx] || {
    array: [],
    comparing: [],
    swapping: [],
    sortedIndices: [],
    comparisons: 0,
    swaps: 0,
    description: ''
  };

  const maxVal = Math.max(...(currentStep.array.length ? currentStep.array : [100]));
  const meta = ALGO_METADATA[algorithm];

  return (
    <div className="space-y-6">
      
      {/* Top Header Card */}
      <div className="arena-card p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-arena-amber/10 border border-arena-amber/30 text-arena-amber text-[10px] font-mono font-bold uppercase tracking-wider mb-1.5">
              <BarChart3 className="w-3 h-3" />
              <span>Interactive Algorithm Visualizer</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">{meta.name}</h2>
            <p className="text-xs text-arena-textSecondary mt-0.5 max-w-2xl leading-relaxed">
              {meta.summary}
            </p>
          </div>

          {/* Complexity Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#12181A] p-3 rounded-xl border border-arena-border font-mono text-center shrink-0">
            <div>
              <span className="text-[10px] text-arena-textSubtle block">BEST</span>
              <span className="text-xs font-bold text-emerald-400">{meta.best}</span>
            </div>
            <div>
              <span className="text-[10px] text-arena-textSubtle block">AVERAGE</span>
              <span className="text-xs font-bold text-arena-amber">{meta.avg}</span>
            </div>
            <div>
              <span className="text-[10px] text-arena-textSubtle block">WORST</span>
              <span className="text-xs font-bold text-red-400">{meta.worst}</span>
            </div>
            <div>
              <span className="text-[10px] text-arena-textSubtle block">AUX SPACE</span>
              <span className="text-xs font-bold text-arena-teal">{meta.space}</span>
            </div>
          </div>
        </div>

        {/* Algorithm Selector Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-arena-border">
          {(Object.keys(ALGO_METADATA) as SortAlgorithm[]).map((algoKey) => (
            <button
              key={algoKey}
              onClick={() => {
                sound.playClick();
                setAlgorithm(algoKey);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all ${
                algorithm === algoKey
                  ? 'bg-arena-amber text-slate-950 font-bold shadow-sm'
                  : 'bg-arena-elevated hover:bg-[#253235] text-arena-textSecondary hover:text-white border border-arena-border'
              }`}
            >
              {ALGO_METADATA[algoKey].name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Visualizer Stage */}
      <div className="arena-card p-6 space-y-5 bg-[#101314]">
        
        {/* Realtime Counters & Description */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-arena-border text-xs">
          <div className="flex items-center gap-4 font-mono">
            <div>
              <span className="text-arena-textSubtle">Comparisons: </span>
              <span className="text-arena-teal font-bold">{currentStep.comparisons}</span>
            </div>
            <div>
              <span className="text-arena-textSubtle">Swaps: </span>
              <span className="text-arena-amber font-bold">{currentStep.swaps}</span>
            </div>
            <div>
              <span className="text-arena-textSubtle">Step: </span>
              <span className="text-white font-bold">{currentStepIdx + 1} / {steps.length}</span>
            </div>
          </div>

          <div className="text-[11px] font-mono text-arena-amber bg-arena-amber/10 border border-arena-amber/25 px-2.5 py-1 rounded-lg">
            {currentStep.description}
          </div>
        </div>

        {/* Dynamic Bars Canvas */}
        <div className="h-64 sm:h-80 w-full flex items-end justify-center gap-1 sm:gap-1.5 px-2 pt-8 pb-2 bg-[#0C0F10] rounded-xl border border-arena-border/60 relative overflow-hidden">
          {currentStep.array.map((val, idx) => {
            const isComparing = currentStep.comparing.includes(idx);
            const isSwapping = currentStep.swapping.includes(idx);
            const isSorted = currentStep.sortedIndices.includes(idx) || currentStepIdx === steps.length - 1;

            let barColor = 'bg-[#1C2629] border-[#2A3B3F] text-zinc-400';
            if (isSwapping) {
              barColor = 'bg-red-500 border-red-400 text-white shadow-[0_0_12px_rgba(239,68,68,0.5)]';
            } else if (isComparing) {
              barColor = 'bg-arena-amber border-amber-300 text-slate-950 shadow-[0_0_12px_rgba(255,173,66,0.5)]';
            } else if (isSorted) {
              barColor = 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-[0_0_8px_rgba(16,185,129,0.3)]';
            }

            const heightPct = Math.max(8, (val / maxVal) * 100);

            return (
              <div
                key={idx}
                style={{ height: `${heightPct}%` }}
                className={`flex-1 rounded-t-md border-t border-x flex flex-col items-center justify-between transition-all duration-100 ${barColor}`}
                title={`Value: ${val} (Index: ${idx})`}
              >
                <span className="text-[9px] font-mono font-bold mt-1 opacity-80 hidden sm:inline">
                  {val}
                </span>
                <span className="text-[8px] font-mono opacity-50 mb-0.5 hidden lg:inline">
                  {idx}
                </span>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-[#8C9C9E] pt-1">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#1C2629] border border-[#2A3B3F]" />
            <span>Unsorted</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-arena-amber" />
            <span>Comparing</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-red-500" />
            <span>Swapping / Relocating</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500" />
            <span>Sorted Position</span>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-arena-border">
          
          {/* Playback buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playClick();
                setIsPlaying(!isPlaying);
              }}
              className="btn-primary py-2 px-4 text-xs font-bold gap-1.5 flex items-center shadow-md"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? 'Pause' : 'Start Sorting'}</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setIsPlaying(false);
                setCurrentStepIdx(prev => Math.min(steps.length - 1, prev + 1));
              }}
              disabled={isPlaying || currentStepIdx >= steps.length - 1}
              className="btn-secondary py-2 px-3 text-xs font-semibold gap-1 flex items-center disabled:opacity-40"
              title="Next Step"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                sound.playClick();
                handleResetArray();
              }}
              className="btn-secondary py-2 px-3 text-xs font-semibold gap-1 flex items-center"
              title="Reset to start"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Speed & Array Size Controls */}
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-arena-textSubtle">Speed:</span>
              <select
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="bg-arena-elevated border border-arena-border rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
              >
                <option value={150}>0.5x (Slow)</option>
                <option value={60}>1.0x (Normal)</option>
                <option value={20}>2.0x (Fast)</option>
                <option value={5}>4.0x (Hyper)</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-arena-textSubtle">Size:</span>
              <select
                value={arraySize}
                onChange={(e) => setArraySize(Number(e.target.value))}
                className="bg-arena-elevated border border-arena-border rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
              >
                <option value={12}>12 Elements</option>
                <option value={20}>20 Elements</option>
                <option value={32}>32 Elements</option>
                <option value={48}>48 Elements</option>
              </select>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                handleResetArray();
              }}
              className="p-1.5 rounded-lg bg-arena-elevated hover:bg-[#253235] border border-arena-border text-arena-amber transition-colors"
              title="Generate new random array"
            >
              <Shuffle className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* Custom Input Drawer */}
        <form onSubmit={handleCustomInputSubmit} className="pt-2 flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Custom array e.g. 64, 34, 25, 12, 22, 11, 90"
            className="flex-1 bg-arena-elevated border border-arena-border rounded-xl px-3 py-2 text-xs text-white placeholder-arena-textSubtle focus:outline-none focus:border-arena-amber font-mono"
          />
          <button
            type="submit"
            className="btn-secondary py-2 px-4 text-xs font-bold shrink-0"
          >
            Apply Custom Array
          </button>
        </form>

      </div>

    </div>
  );
};

