import React, { useState } from 'react';
import { 
  BookOpen, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  Sparkles, 
  Layers, 
  Clock, 
  Trophy, 
  ChevronRight 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useInView } from '../../hooks/useScrollReveal';
import { sound } from '../../utils/sound';

interface RoadmapNode {
  id: string;
  stageNumber: number;
  title: string;
  tier: 'Foundations' | 'Intermediate' | 'Advanced' | 'Mastery';
  solvedCount: number;
  totalCount: number;
  status: 'completed' | 'in-progress' | 'unlocked' | 'locked';
  timeComplexity: string;
  spaceComplexity: string;
  patterns: string[];
  keyProblems: string[];
}

export const LearnRoadmapSection: React.FC = () => {
  const { navigateToApp } = useApp();
  const [selectedNodeId, setSelectedNodeId] = useState<string>('arrays');
  const { ref, hasAnimated } = useInView({ threshold: 0.15 });

  const nodes: RoadmapNode[] = [
    {
      id: 'arrays',
      stageNumber: 1,
      title: 'Arrays & Two Pointers',
      tier: 'Foundations',
      solvedCount: 6,
      totalCount: 6,
      status: 'completed',
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(1) in-place',
      patterns: ['Opposite-end converging pointers', 'Fast & slow pointers', 'Prefix sum arrays'],
      keyProblems: ['Two Sum', 'Container With Most Water', 'Trapping Rain Water']
    },
    {
      id: 'sliding-window',
      stageNumber: 2,
      title: 'Sliding Window & Hash Maps',
      tier: 'Foundations',
      solvedCount: 5,
      totalCount: 6,
      status: 'in-progress',
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(K) auxiliary',
      patterns: ['Dynamically expanding window', 'Shrink condition checks', 'Character frequency tables'],
      keyProblems: ['Longest Substring Without Repeating', 'Minimum Window Substring']
    },
    {
      id: 'linked-lists',
      stageNumber: 3,
      title: 'Linked Lists & Stacks',
      tier: 'Intermediate',
      solvedCount: 4,
      totalCount: 5,
      status: 'in-progress',
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(N) stack depth',
      patterns: ['Monotonic increasing stack', 'Pointer manipulation', 'Dummy node heads'],
      keyProblems: ['Reverse Linked List', 'Valid Parentheses', 'Daily Temperatures']
    },
    {
      id: 'trees',
      stageNumber: 4,
      title: 'Binary Trees & BSTs',
      tier: 'Intermediate',
      solvedCount: 3,
      totalCount: 6,
      status: 'unlocked',
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(H) recursion height',
      patterns: ['Recursive DFS (Pre/In/Post)', 'BFS Level-order with queues', 'BST invariant validation'],
      keyProblems: ['Maximum Depth', 'Invert Binary Tree', 'Validate Binary Search Tree']
    },
    {
      id: 'graphs',
      stageNumber: 5,
      title: 'Graphs & BFS / DFS',
      tier: 'Advanced',
      solvedCount: 2,
      totalCount: 6,
      status: 'unlocked',
      timeComplexity: 'O(V + E)',
      spaceComplexity: 'O(V) visited set',
      patterns: ['Adjacency list traversal', 'Shortest path BFS', 'Topological sorting & cycle detection'],
      keyProblems: ['Number of Islands', 'Course Schedule', 'Clone Graph']
    },
    {
      id: 'dp',
      stageNumber: 6,
      title: 'Dynamic Programming',
      tier: 'Mastery',
      solvedCount: 0,
      totalCount: 7,
      status: 'locked',
      timeComplexity: 'O(N × M)',
      spaceComplexity: 'O(N) 1D rolling array',
      patterns: ['Optimal substructure identification', 'Top-down memoization', 'Bottom-up tabulation'],
      keyProblems: ['Climbing Stairs', 'Coin Change', 'Longest Common Subsequence']
    }
  ];

  const activeNode = nodes.find(n => n.id === selectedNodeId) || nodes[0];

  return (
    <section ref={ref} id="learn-roadmap" className="py-24 relative bg-[#141719]">
      <div className="w-[94%] max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className={`flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-arena-border reveal-init ${hasAnimated ? 'revealed' : ''}`}>
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-arena-surface border border-arena-border text-xs font-semibold text-arena-teal">
              <BookOpen className="w-3.5 h-3.5 text-arena-teal" />
              <span>STRUCTURED DSA ROADMAP</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-arena-textPrimary tracking-tight">
              Every great developer <br />
              <span className="text-arena-teal">starts somewhere.</span>
            </h2>
            <p className="text-sm sm:text-base text-arena-textSecondary">
              Stop grinding random problems. Follow a carefully structured algorithmic pathway designed to build pattern recognition from foundations to advanced dynamic programming.
            </p>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              navigateToApp('learn');
            }}
            className="btn-teal text-xs py-2.5 px-5 gap-2 self-start md:self-auto font-bold"
          >
            <span>Explore Full Roadmap</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Interactive Roadmap Layout: Nodes Pathway on Left, Topic Inspector on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Interactive Milestone Pathway */}
          <div className={`lg:col-span-7 space-y-3 relative reveal-left-init ${hasAnimated ? 'revealed' : ''}`}>
            {/* Connecting Pathway Line */}
            <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-arena-border pointer-events-none -z-0 hidden sm:block" />

            {nodes.map((node, index) => {
              const isSelected = selectedNodeId === node.id;
              const isDone = node.status === 'completed';
              const isInProgress = node.status === 'in-progress';
              const isLocked = node.status === 'locked';

              return (
                <div
                  key={node.id}
                  onClick={() => {
                    sound.playClick();
                    setSelectedNodeId(node.id);
                  }}
                  className={`p-4 rounded-xl border cursor-pointer select-none transition-all duration-200 relative z-10 flex items-center justify-between gap-4 ${
                    isSelected
                      ? 'bg-arena-elevated border-arena-teal shadow-[0_0_20px_rgba(131,182,163,0.15)] translate-x-1'
                      : 'bg-arena-surface/85 border-arena-border hover:bg-arena-elevated hover:border-arena-borderHover'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    {/* Node status icon */}
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs font-mono border ${
                      isDone
                        ? 'bg-arena-success/20 text-arena-success border-arena-success'
                        : isInProgress
                        ? 'bg-arena-amber/20 text-arena-amber border-arena-amber'
                        : isLocked
                        ? 'bg-[#181D1F] text-arena-textSubtle border-arena-border'
                        : 'bg-arena-surface text-arena-teal border-arena-teal/40'
                    }`}>
                      {isDone ? <CheckCircle2 className="w-4 h-4" /> : isLocked ? <Lock className="w-3.5 h-3.5" /> : node.stageNumber}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold text-arena-textSubtle tracking-wider">
                          STAGE {node.stageNumber} • {node.tier}
                        </span>
                        {isInProgress && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-arena-amber/15 text-arena-amber font-mono">
                            IN PROGRESS
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-sm text-arena-textPrimary mt-0.5">
                        {node.title}
                      </h3>
                    </div>
                  </div>

                  {/* Progress & Solved Pill */}
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-arena-textPrimary block">
                      {node.solvedCount}/{node.totalCount}
                    </span>
                    <span className="text-[10px] text-arena-textSecondary">Problems</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Node Details Inspector Card */}
          <div className={`lg:col-span-5 sticky top-24 rounded-2xl bg-arena-surface border border-arena-border p-6 shadow-2xl space-y-6 reveal-right-init ${hasAnimated ? 'revealed' : ''}`}>
            
            {/* Stage Header */}
            <div className="flex items-center justify-between pb-4 border-b border-arena-border">
              <div>
                <span className="text-[10px] uppercase font-bold text-arena-teal tracking-wider">
                  TOPIC SPECIFICATION
                </span>
                <h3 className="text-xl font-extrabold text-arena-textPrimary mt-0.5">
                  {activeNode.title}
                </h3>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded bg-arena-elevated border border-arena-border text-arena-amber font-semibold">
                {activeNode.tier}
              </span>
            </div>

            {/* Complexity Specs */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-[#141719] border border-arena-border">
                <span className="text-[10px] uppercase font-semibold text-arena-textSubtle block">TIME COMPLEXITY</span>
                <span className="font-mono text-sm font-bold text-arena-teal mt-0.5 block">{activeNode.timeComplexity}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#141719] border border-arena-border">
                <span className="text-[10px] uppercase font-semibold text-arena-textSubtle block">SPACE COMPLEXITY</span>
                <span className="font-mono text-sm font-bold text-arena-amber mt-0.5 block">{activeNode.spaceComplexity}</span>
              </div>
            </div>

            {/* Core Algorithmic Patterns */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-arena-textPrimary uppercase tracking-wider text-[11px]">
                Essential Patterns to Master
              </span>
              <ul className="space-y-1.5">
                {activeNode.patterns.map((pat, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-arena-textSecondary">
                    <span className="w-1.5 h-1.5 rounded-full bg-arena-teal mt-1.5 shrink-0" />
                    <span>{pat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Practice Problems Preview */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-arena-textPrimary uppercase tracking-wider text-[11px]">
                Benchmark Problems ({activeNode.solvedCount}/{activeNode.totalCount} Solved)
              </span>
              <div className="space-y-1.5">
                {activeNode.keyProblems.map((prob, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-[#141719] border border-arena-border flex items-center justify-between text-xs font-mono">
                    <span className="text-arena-textPrimary">{prob}</span>
                    <span className="text-[10px] text-arena-teal">Ready in IDE</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Jump into Topic CTA */}
            <button
              onClick={() => {
                sound.playClick();
                navigateToApp('learn');
              }}
              className="btn-primary w-full py-2.5 text-xs font-bold gap-2"
            >
              <span>Practice {activeNode.title}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </div>

        </div>

      </div>
    </section>
  );
};

