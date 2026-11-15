import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft, 
  Search, 
  Shuffle, 
  CheckCircle2, 
  XCircle, 
  Info, 
  Zap, 
  ArrowDown, 
  Sliders 
} from 'lucide-react';
import { sound } from '../../../utils/sound';

interface StepState {
  low: number;
  high: number;
  mid: number;
  target: number;
  comparison: 'equal' | 'less' | 'greater' | 'none';
  discardedRange: [number, number] | null; // [start, end]
  status: 'searching' | 'found' | 'not_found';
  narrative: string;
  comparisonsCount: number;
}

export const BinarySearchVisualizer: React.FC = () => {
  const [array, setArray] = useState<number[]>([3, 7, 12, 19, 24, 31, 38, 45, 52, 60, 68, 77, 85, 92, 99]);
  const [target, setTarget] = useState<number>(45);
  const [customInput, setCustomInput] = useState<string>('');
  const [targetInput, setTargetInput] = useState<string>('45');
  const [speed, setSpeed] = useState<number>(600); // ms per step
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [steps, setSteps] = useState<StepState[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Compute all binary search steps
  const computeSteps = (sortedArr: number[], searchVal: number): StepState[] => {
    const recordedSteps: StepState[] = [];
    let low = 0;
    let high = sortedArr.length - 1;
    let comps = 0;

    recordedSteps.push({
      low,
      high,
      mid: -1,
      target: searchVal,
      comparison: 'none',
      discardedRange: null,
      status: 'searching',
      narrative: `Search window initialized: low = index 0 (value: ${sortedArr[0]}), high = index ${high} (value: ${sortedArr[high]}). Target = ${searchVal}.`,
      comparisonsCount: 0
    });

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const midVal = sortedArr[mid];
      comps++;

      if (midVal === searchVal) {
        recordedSteps.push({
          low,
          high,
          mid,
          target: searchVal,
          comparison: 'equal',
          discardedRange: null,
          status: 'found',
          narrative: `Match found! Element at mid index ${mid} (${midVal}) matches target ${searchVal} in ${comps} comparison${comps > 1 ? 's' : ''}.`,
          comparisonsCount: comps
        });
        return recordedSteps;
      } else if (midVal < searchVal) {
        recordedSteps.push({
          low,
          high,
          mid,
          target: searchVal,
          comparison: 'less',
          discardedRange: [low, mid],
          status: 'searching',
          narrative: `arr[mid] (${midVal}) < ${searchVal}. Since array is sorted, target must be in the right half. Discarding indices [${low}..${mid}]. New low becomes ${mid + 1}.`,
          comparisonsCount: comps
        });
        low = mid + 1;
      } else {
        recordedSteps.push({
          low,
          high,
          mid,
          target: searchVal,
          comparison: 'greater',
          discardedRange: [mid, high],
          status: 'searching',
          narrative: `arr[mid] (${midVal}) > ${searchVal}. Target must be in the left half. Discarding indices [${mid}..${high}]. New high becomes ${mid - 1}.`,
          comparisonsCount: comps
        });
        high = mid - 1;
      }
    }

    recordedSteps.push({
      low,
      high,
      mid: -1,
      target: searchVal,
      comparison: 'none',
      discardedRange: null,
      status: 'not_found',
      narrative: `Search window collapsed (low ${low} > high ${high}). Target ${searchVal} does not exist in the array. Completed in ${comps} comparisons.`,
      comparisonsCount: comps
    });

    return recordedSteps;
  };

  // Re-generate steps when array or target changes
  useEffect(() => {
    const computed = computeSteps(array, target);
    setSteps(computed);
    setCurrentStepIdx(0);
    setIsPlaying(false);
  }, [array, target]);

  // Animation player
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentStepIdx(prev => {
          if (prev < steps.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            if (steps[steps.length - 1]?.status === 'found') {
              sound.success();
            } else {
              sound.defeat();
            }
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
  }, [isPlaying, steps.length, speed]);

  const generateRandomArray = () => {
    sound.click();
    const length = 15;
    const set = new Set<number>();
    while (set.size < length) {
      set.add(Math.floor(Math.random() * 120) + 1);
    }
    const sorted = Array.from(set).sort((a, b) => a - b);
    setArray(sorted);
    // pick one random target or missing target
    if (Math.random() > 0.3) {
      const pick = sorted[Math.floor(Math.random() * sorted.length)];
      setTarget(pick);
      setTargetInput(pick.toString());
    } else {
      const missing = Math.floor(Math.random() * 120) + 1;
      setTarget(missing);
      setTargetInput(missing.toString());
    }
  };

  const applyCustomArray = () => {
    sound.click();
    if (!customInput.trim()) return;
    const parsed = customInput
      .split(/[\s,]+/)
      .map(s => parseInt(s.trim(), 10))
      .filter(n => !isNaN(n));

    if (parsed.length >= 2) {
      const sorted = Array.from(new Set(parsed)).sort((a, b) => a - b).slice(0, 24);
      setArray(sorted);
      setCustomInput('');
    }
  };

  const applyTarget = () => {
    sound.click();
    const val = parseInt(targetInput, 10);
    if (!isNaN(val)) {
      setTarget(val);
    }
  };

  const handleNext = () => {
    sound.click();
    if (currentStepIdx < steps.length - 1) {
      setCurrentStepIdx(currentStepIdx + 1);
    }
  };

  const handlePrev = () => {
    sound.click();
    if (currentStepIdx > 0) {
      setCurrentStepIdx(currentStepIdx - 1);
    }
  };

  const handleReset = () => {
    sound.click();
    setIsPlaying(false);
    setCurrentStepIdx(0);
  };

  const togglePlay = () => {
    sound.click();
    if (currentStepIdx >= steps.length - 1) {
      setCurrentStepIdx(0);
    }
    setIsPlaying(!isPlaying);
  };

  const currentStep = steps[currentStepIdx] || {
    low: 0,
    high: array.length - 1,
    mid: -1,
    target,
    comparison: 'none',
    discardedRange: null,
    status: 'searching',
    narrative: 'Initializing...',
    comparisonsCount: 0
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Controls */}
      <div className="bg-[#1C2426] border border-[#252D30] rounded-xl p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20">
                O(log N) SEARCH
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                Logarithmic Divide & Conquer
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">Binary Search Visualizer</h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Follow low, high, and mid pointers. Half of the search space is eliminated on every single iteration.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={generateRandomArray}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#252D30] hover:bg-[#2F383C] text-neutral-200 rounded-lg text-xs font-medium transition-colors border border-neutral-700/50"
            >
              <Shuffle className="w-3.5 h-3.5 text-[#00E5FF]" />
              New Random Array
            </button>

            <div className="flex items-center gap-1 bg-[#101314] px-2.5 py-1.5 rounded-lg border border-[#252D30]">
              <span className="text-xs text-neutral-400 font-mono">Target:</span>
              <input
                type="number"
                value={targetInput}
                onChange={e => setTargetInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && applyTarget()}
                className="w-16 bg-[#1C2426] text-white text-xs px-2 py-1 rounded border border-neutral-700 focus:outline-none focus:border-[#00E5FF] text-center font-mono"
              />
              <button
                onClick={applyTarget}
                className="px-2 py-1 bg-[#00E5FF]/15 text-[#00E5FF] hover:bg-[#00E5FF]/25 rounded text-xs font-semibold transition-colors"
              >
                Set
              </button>
            </div>
          </div>
        </div>

        {/* Input Bar */}
        <div className="mt-4 pt-4 border-t border-[#252D30] flex flex-col md:flex-row items-center gap-3">
          <div className="flex-1 w-full flex items-center gap-2">
            <span className="text-xs text-neutral-400 whitespace-nowrap font-mono">Custom Array:</span>
            <input
              type="text"
              placeholder="e.g. 5, 12, 18, 25, 33, 47, 52, 68, 71, 89"
              value={customInput}
              onChange={e => setCustomInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applyCustomArray()}
              className="flex-1 bg-[#101314] text-xs text-neutral-200 px-3 py-2 rounded-lg border border-[#252D30] focus:outline-none focus:border-[#00E5FF] font-mono"
            />
            <button
              onClick={applyCustomArray}
              className="px-3 py-2 bg-[#252D30] hover:bg-[#2F383C] text-xs text-white rounded-lg transition-colors border border-neutral-700 font-mono"
            >
              Load & Sort
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="bg-[#1C2426] border border-[#252D30] rounded-xl p-6 shadow-xl relative overflow-hidden">
        {/* Pointers Legend & Stats */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 text-amber-400 rounded-md border border-amber-500/20">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              Low: [{currentStep.low}]
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#00E5FF]/10 text-[#00E5FF] rounded-md border border-[#00E5FF]/20">
              <span className="w-2 h-2 rounded-full bg-[#00E5FF]"></span>
              Mid: [{currentStep.mid >= 0 ? currentStep.mid : '-'}]
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-500/10 text-purple-400 rounded-md border border-purple-500/20">
              <span className="w-2 h-2 rounded-full bg-purple-400"></span>
              High: [{currentStep.high}]
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="text-neutral-400">
              Comparisons: <span className="text-[#00E5FF] font-bold">{currentStep.comparisonsCount}</span>
            </div>
            <div className="text-neutral-400">
              Step: <span className="text-white font-bold">{currentStepIdx + 1}</span> / {steps.length}
            </div>
            <div className="text-neutral-400">
              Max Possible Steps: <span className="text-[#B5FF4A] font-bold">~{Math.ceil(Math.log2(array.length + 1))}</span>
            </div>
          </div>
        </div>

        {/* Array Visualization Grid */}
        <div className="overflow-x-auto pb-6 pt-10">
          <div className="flex items-end justify-center gap-2 min-w-[650px] px-4">
            {array.map((val, idx) => {
              const isLow = idx === currentStep.low;
              const isHigh = idx === currentStep.high;
              const isMid = idx === currentStep.mid;
              const inActiveWindow = idx >= currentStep.low && idx <= currentStep.high;
              const isTargetFound = currentStep.status === 'found' && isMid;

              return (
                <div key={idx} className="flex flex-col items-center relative group">
                  {/* Floating pointer indicator tags above */}
                  <div className="absolute -top-9 flex flex-col items-center pointer-events-none">
                    {isMid && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono bg-[#00E5FF] text-black shadow-lg shadow-[#00E5FF]/30 animate-bounce">
                        MID
                      </span>
                    )}
                    {!isMid && isLow && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-400 text-black">
                        LOW
                      </span>
                    )}
                    {!isMid && isHigh && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono bg-purple-400 text-black">
                        HIGH
                      </span>
                    )}
                  </div>

                  {/* Cell Box */}
                  <div
                    className={`w-12 h-14 rounded-lg flex flex-col items-center justify-center font-mono font-bold transition-all duration-300 border ${
                      isTargetFound
                        ? 'bg-[#B5FF4A]/20 border-[#B5FF4A] text-[#B5FF4A] scale-110 shadow-lg shadow-[#B5FF4A]/20 ring-2 ring-[#B5FF4A]'
                        : isMid
                        ? 'bg-[#00E5FF]/20 border-[#00E5FF] text-[#00E5FF] scale-105 shadow-md shadow-[#00E5FF]/20'
                        : inActiveWindow
                        ? 'bg-[#252D30] border-neutral-600 text-white hover:border-[#00E5FF]/50'
                        : 'bg-[#101314]/60 border-neutral-800 text-neutral-600 opacity-35'
                    }`}
                  >
                    <span className="text-base">{val}</span>
                  </div>

                  {/* Index Label below */}
                  <div className="mt-2 text-[10px] font-mono text-neutral-500">
                    {idx}
                  </div>

                  {/* Mini pointer indicator bottom */}
                  <div className="flex gap-0.5 mt-1">
                    {isLow && <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>}
                    {isHigh && <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Narrative Box */}
        <div className="mt-6 p-4 rounded-xl bg-[#101314] border border-[#252D30] flex items-start gap-3">
          <div className="p-2 rounded-lg bg-[#252D30] text-[#00E5FF] shrink-0 mt-0.5">
            {currentStep.status === 'found' ? (
              <CheckCircle2 className="w-5 h-5 text-[#B5FF4A]" />
            ) : currentStep.status === 'not_found' ? (
              <XCircle className="w-5 h-5 text-rose-400" />
            ) : (
              <Zap className="w-5 h-5 text-[#00E5FF]" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-neutral-300">
                {currentStep.status === 'found' ? (
                  <span className="text-[#B5FF4A]">TARGET FOUND AT INDEX {currentStep.mid}</span>
                ) : currentStep.status === 'not_found' ? (
                  <span className="text-rose-400">TARGET NOT FOUND</span>
                ) : (
                  <span>ITERATION {currentStepIdx} LOG</span>
                )}
              </span>
              <span className="text-[10px] font-mono text-neutral-500">
                Formula: mid = ⌊(low + high) / 2⌋
              </span>
            </div>
            <p className="text-sm text-neutral-200 mt-1 font-mono leading-relaxed">
              {currentStep.narrative}
            </p>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="mt-6 pt-5 border-t border-[#252D30] flex flex-wrap items-center justify-between gap-4">
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
              disabled={currentStepIdx === 0}
              className="p-2 bg-[#252D30] hover:bg-[#2F383C] text-neutral-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Previous Step"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={handleNext}
              disabled={currentStepIdx >= steps.length - 1}
              className="p-2 bg-[#252D30] hover:bg-[#2F383C] text-neutral-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Next Step"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleReset}
              className="p-2 bg-[#252D30] hover:bg-[#2F383C] text-neutral-300 rounded-lg transition-colors"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-neutral-400 font-mono">Speed:</span>
            <input
              type="range"
              min="150"
              max="1200"
              step="50"
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

      {/* Educational Walkthrough & Code Snippet */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1C2426] border border-[#252D30] rounded-xl p-5">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Info className="w-4 h-4 text-[#00E5FF]" />
            How Binary Search Works
          </h3>
          <ul className="space-y-2.5 text-xs text-neutral-300 font-sans leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-[#00E5FF] font-bold">•</span>
              <span><strong>Precondition:</strong> The collection MUST be ordered/sorted. Without monotonic ordering, binary search invariants fail.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00E5FF] font-bold">•</span>
              <span><strong>Divide:</strong> Calculate the middle index using <code className="text-[#00E5FF] bg-[#101314] px-1 py-0.5 rounded">mid = low + Math.floor((high - low) / 2)</code> to avoid integer overflow in languages with fixed 32-bit bounds.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00E5FF] font-bold">•</span>
              <span><strong>Compare & Conquer:</strong> Compare <code className="text-amber-400 font-mono">arr[mid]</code> with target. If equal, terminate. If smaller, shift <code className="text-amber-400 font-mono">low = mid + 1</code>. If greater, shift <code className="text-purple-400 font-mono">high = mid - 1</code>.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00E5FF] font-bold">•</span>
              <span><strong>Efficiency:</strong> For 1,000,000 items, binary search needs at most <strong>20 comparisons</strong> ($2^{20} \approx 10^6$). Linear search takes up to 1,000,000 comparisons.</span>
            </li>
          </ul>
        </div>

        <div className="bg-[#1C2426] border border-[#252D30] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#B5FF4A]" />
              JavaScript Implementation
            </h3>
            <span className="text-[11px] font-mono text-neutral-400">Iterative Pattern</span>
          </div>
          <pre className="text-xs bg-[#101314] p-3.5 rounded-lg border border-[#252D30] font-mono text-neutral-300 overflow-x-auto leading-relaxed">
{`function binarySearch(arr, target) {
  let low = 0;
  let high = arr.length - 1;

  while (low <= high) {
    // Avoid (low + high) overflow in fixed-width types
    const mid = low + Math.floor((high - low) / 2);
    
    if (arr[mid] === target) {
      return mid; // Target found
    } else if (arr[mid] < target) {
      low = mid + 1; // Search right half
    } else {
      high = mid - 1; // Search left half
    }
  }

  return -1; // Target not found
}`}
          </pre>
        </div>
      </div>
    </div>
  );
};

