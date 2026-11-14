import React, { useState, useEffect } from 'react';
import { 
  Swords, 
  ArrowRight, 
  Code2, 
  CheckCircle2, 
  Clock, 
  Terminal, 
  RotateCcw, 
  Trophy, 
  Zap, 
  Flame, 
  Play 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useInView } from '../../hooks/useScrollReveal';
import { sound } from '../../utils/sound';

export const DuelShowcaseSection: React.FC = () => {
  const { navigateToApp } = useApp();

  // Simulated match timeline states: 0 = starting, 1 = coding, 2 = running tests, 3 = winner reveal
  const [matchStep, setMatchStep] = useState<number>(3);
  const [isPlayingDemo, setIsPlayingDemo] = useState<boolean>(false);
  const { ref, hasAnimated } = useInView({ threshold: 0.25 });

  const startDemoPlayback = () => {
    sound.playGo();
    setIsPlayingDemo(true);
    setMatchStep(0);
    setTimeout(() => {
      setMatchStep(1);
      setTimeout(() => {
        setMatchStep(2);
        setTimeout(() => {
          sound.playVictory();
          setMatchStep(3);
          setIsPlayingDemo(false);
        }, 1600);
      }, 1600);
    }, 1200);
  };

  // Scroll-triggered duel playback
  useEffect(() => {
    if (hasAnimated && !isPlayingDemo) {
      startDemoPlayback();
    }
  }, [hasAnimated]);

  return (
    <section ref={ref} id="duel-showcase" className="py-24 relative bg-[#101314] overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-arena-amber/5 rounded-full filter blur-[150px] pointer-events-none -z-10" />

      <div className="w-[94%] max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className={`text-center max-w-3xl mx-auto space-y-4 reveal-init ${hasAnimated ? 'revealed' : ''}`}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-arena-surface border border-arena-border text-xs font-semibold text-arena-amber">
            <Swords className="w-3.5 h-3.5 text-arena-amber" />
            <span>COMPETITIVE DEVELOPER ARENA</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-arena-textPrimary tracking-tight">
            Your skills. Your opponent. <br />
            <span className="text-arena-amber">One problem.</span>
          </h2>

          <p className="text-sm sm:text-base text-arena-textSecondary leading-relaxed">
            Match against developers of your rating class. Both receive the identical algorithmic problem. Monaco Editor, live test execution, real-time code progress, and verified Elo rating shifts.
          </p>

          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={startDemoPlayback}
              disabled={isPlayingDemo}
              className="btn-secondary text-xs py-2 px-4 gap-1.5"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isPlayingDemo ? 'animate-spin' : ''}`} />
              <span>{isPlayingDemo ? 'Running Simulation...' : 'Replay Match Demonstration'}</span>
            </button>
            <span className="text-xs text-arena-textSubtle">(Demonstration view)</span>
          </div>
        </div>

        {/* Realistic Simulated Arena Duel Interface */}
        <div className={`rounded-2xl bg-arena-surface border border-arena-border p-5 sm:p-8 shadow-2xl space-y-6 reveal-scale-init ${hasAnimated ? 'revealed' : ''}`}>
          
          {/* Top Duel Match Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-arena-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-arena-amber/15 border border-arena-amber text-arena-amber flex items-center justify-center">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-arena-amber tracking-wider block">1v1 RANKED BATTLE</span>
                <h3 className="text-base sm:text-lg font-bold text-arena-textPrimary flex items-center gap-2">
                  <span>Problem: Two Sum</span>
                  <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-arena-elevated border border-arena-border text-arena-teal">
                    Hash Map • O(N)
                  </span>
                </h3>
              </div>
            </div>

            {/* Duel Timer & Status */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-arena-elevated border border-arena-border">
                <Clock className="w-4 h-4 text-arena-amber" />
                <span className="text-sm font-bold font-mono text-arena-textPrimary">03:48</span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-arena-success font-medium">
                <span className="w-2 h-2 rounded-full bg-arena-success animate-pulse" />
                <span>Socket Connected</span>
              </div>
            </div>
          </div>

          {/* Two Competitors & VS Center Indicator */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Competitor 1 (Player) */}
            <div className="lg:col-span-5 rounded-xl bg-[#141719] border border-[#30383A] p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-arena-amber/20 border border-arena-amber flex items-center justify-center font-bold text-arena-amber">
                    A
                  </div>
                  <div>
                    <div className="font-bold text-sm text-arena-textPrimary flex items-center gap-1.5">
                      <span>alex_dev</span>
                      <span className="text-[10px] font-mono text-arena-amber">(You)</span>
                    </div>
                    <span className="text-xs text-arena-textSecondary font-mono">1420 Elo</span>
                  </div>
                </div>

                <span className="text-xs font-mono px-2 py-0.5 rounded bg-arena-elevated border border-arena-border text-arena-success font-semibold">
                  {matchStep >= 2 ? 'Submitted' : 'Coding'}
                </span>
              </div>

              {/* Player Code Preview */}
              <div className="rounded-lg bg-[#0F1213] border border-[#232B2D] p-3 text-xs font-mono text-arena-textSecondary space-y-1 overflow-x-auto">
                <div className="text-arena-textSubtle">// Optimal O(N) Hash Table Solution</div>
                <div><span className="text-arena-amber">function</span> <span className="text-arena-teal">twoSum</span>(nums, target) &#123;</div>
                <div className="pl-3"><span className="text-arena-amber">const</span> map = <span className="text-arena-teal">new</span> Map();</div>
                <div className="pl-3"><span className="text-arena-amber">for</span> (<span className="text-arena-amber">let</span> i = 0; i &lt; nums.length; i++) &#123;</div>
                <div className="pl-6"><span className="text-arena-amber">const</span> comp = target - nums[i];</div>
                <div className="pl-6"><span className="text-arena-amber">if</span> (map.has(comp)) <span className="text-arena-teal font-bold">return</span> [map.get(comp), i];</div>
                <div className="pl-6">map.set(nums[i], i);</div>
                <div className="pl-3">&#125;</div>
                <div>&#125;</div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-arena-textSecondary font-mono">
                  <span>Code Completion</span>
                  <span className="text-arena-amber">{matchStep >= 1 ? '100%' : '35%'}</span>
                </div>
                <div className="h-1.5 w-full bg-[#1C2224] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-arena-amber transition-all duration-700" 
                    style={{ width: matchStep >= 1 ? '100%' : '35%' }}
                  />
                </div>
              </div>
            </div>

            {/* VS Center Nexus */}
            <div className="lg:col-span-2 flex flex-col items-center justify-center gap-2 py-2">
              <div className="w-12 h-12 rounded-full bg-arena-elevated border border-arena-amber/50 flex items-center justify-center font-black text-sm text-arena-amber shadow-[0_0_15px_rgba(230,167,70,0.3)]">
                VS
              </div>
              <span className="text-[10px] text-arena-textSubtle uppercase tracking-wider font-semibold">
                HEAD TO HEAD
              </span>
            </div>

            {/* Competitor 2 (Opponent) */}
            <div className="lg:col-span-5 rounded-xl bg-[#141719] border border-[#30383A] p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-arena-teal/20 border border-arena-teal flex items-center justify-center font-bold text-arena-teal">
                    K
                  </div>
                  <div>
                    <div className="font-bold text-sm text-arena-textPrimary flex items-center gap-1.5">
                      <span>kavya_codes</span>
                      <span className="text-[10px] font-mono text-arena-teal">Match</span>
                    </div>
                    <span className="text-xs text-arena-textSecondary font-mono">1465 Elo</span>
                  </div>
                </div>

                <span className="text-xs font-mono px-2 py-0.5 rounded bg-arena-elevated border border-arena-border text-arena-textSecondary">
                  {matchStep >= 3 ? 'Tests Running' : 'Typing...'}
                </span>
              </div>

              {/* Opponent Code Preview */}
              <div className="rounded-lg bg-[#0F1213] border border-[#232B2D] p-3 text-xs font-mono text-arena-textSecondary space-y-1 overflow-x-auto opacity-80">
                <div className="text-arena-textSubtle">// Double Loop O(N^2) Approach</div>
                <div><span className="text-arena-amber">function</span> <span className="text-arena-teal">twoSum</span>(nums, target) &#123;</div>
                <div className="pl-3"><span className="text-arena-amber">for</span> (<span className="text-arena-amber">let</span> i = 0; i &lt; nums.length; i++) &#123;</div>
                <div className="pl-6"><span className="text-arena-amber">for</span> (<span className="text-arena-amber">let</span> j = i + 1; j &lt; nums.length; j++) &#123;</div>
                <div className="pl-9"><span className="text-arena-amber">if</span> (nums[i] + nums[j] === target) &#123;</div>
                <div className="pl-12"><span className="text-arena-teal font-bold">return</span> [i, j];</div>
                <div className="pl-9">&#125;</div>
                <div className="pl-6">&#125;</div>
                <div className="pl-3">&#125;</div>
                <div>&#125;</div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-arena-textSecondary font-mono">
                  <span>Code Completion</span>
                  <span className="text-arena-teal">{matchStep >= 1 ? '70%' : '20%'}</span>
                </div>
                <div className="h-1.5 w-full bg-[#1C2224] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-arena-teal transition-all duration-700" 
                    style={{ width: matchStep >= 1 ? '70%' : '20%' }}
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Test Runner Execution Console & Match Winner Resolution */}
          <div className="p-4 rounded-xl bg-[#0E1112] border border-[#273032] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            {/* Real-time Test Output Badges */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-arena-textPrimary">
                <Terminal className="w-4 h-4 text-arena-amber" />
                <span>Test Suite: 4/4 Passed in 12ms</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-arena-textSecondary">
                <span className="px-2 py-0.5 rounded bg-[#172421] text-arena-success border border-arena-success/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Test 1: [2,7,11,15], target 9 → [0,1]</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-[#172421] text-arena-success border border-arena-success/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Test 2: [3,2,4], target 6 → [1,2]</span>
                </span>
              </div>
            </div>

            {/* Winner Banner & Rating Shift */}
            <div className="flex items-center gap-3 sm:border-l sm:border-arena-border sm:pl-5">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-arena-success block">MATCH WINNER</span>
                <div className="font-extrabold text-sm text-arena-textPrimary flex items-center gap-1.5 font-mono">
                  <span>alex_dev</span>
                  <span className="text-xs text-arena-amber font-bold">+24 Elo</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-arena-amber text-[#141719] flex items-center justify-center font-black">
                <Trophy className="w-5 h-5" />
              </div>
            </div>

          </div>

          {/* Action Row */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-arena-textSecondary">
              Practice solo with curated test cases or jump into ranked 1v1 matchmaking.
            </span>

            <button
              onClick={() => {
                sound.playVictory();
                navigateToApp('arena');
              }}
              className="btn-primary py-2.5 px-6 text-xs font-bold gap-2 w-full sm:w-auto shadow-md"
            >
              <span>Enter Code Arena</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};

