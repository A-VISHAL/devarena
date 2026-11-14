import React, { useState } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  ArrowRight, 
  Code2, 
  ChevronRight, 
  Check, 
  Sparkles 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DSA_TOPICS } from '../data/dsaRoadmap';
import { CODING_PROBLEMS } from '../data/problems';
import { DSATopic, CodingProblem } from '../types';
import { LearnProblemModal } from '../components/learn/LearnProblemModal';
import { sound } from '../utils/sound';

export const Learn: React.FC = () => {
  const { user } = useApp();

  const [activeTopic, setActiveTopic] = useState<DSATopic>(DSA_TOPICS[0]);
  const [solvingProblem, setSolvingProblem] = useState<CodingProblem | null>(null);

  const totalTopics = DSA_TOPICS.length;
  const totalSolved = user.problemsSolved.length;
  const overallMastery = Math.min(100, Math.round((totalSolved / 12) * 100));

  const handleOpenProblem = (problemId: string) => {
    sound.playClick();
    const prob = CODING_PROBLEMS.find(p => p.id === problemId);
    if (prob) {
      setSolvingProblem(prob);
    }
  };

  return (
    <div className="page-container py-8 space-y-8 animate-in fade-in">
      
      {/* Banner */}
      <div className="rounded-2xl bg-arena-surface border border-arena-border p-6 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="space-y-2.5 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-arena-elevated border border-arena-border text-arena-teal text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>STRUCTURED LEARNING ROADMAP</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-arena-textPrimary">
            Algorithms & Data Structures
          </h1>
          <p className="text-xs sm:text-sm text-arena-textSecondary leading-relaxed">
            Master core computer science topics with concept breakdowns, invariant analysis, and interactive Monaco editor practice.
          </p>
        </div>

        {/* Overall Mastery Gauge */}
        <div className="w-full lg:w-72 p-4 rounded-xl bg-arena-elevated border border-arena-border space-y-2.5 shrink-0">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-arena-textSecondary">Progress</span>
            <span className="text-arena-amber font-mono">{overallMastery}% Mastery</span>
          </div>

          <div className="w-full h-2 rounded-full bg-arena-surface overflow-hidden">
            <div 
              className="h-full bg-arena-amber rounded-full transition-all duration-300"
              style={{ width: `${overallMastery}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-arena-textSubtle">
            <span>{totalSolved} Problems Solved</span>
            <span>{totalTopics} Core Topics</span>
          </div>
        </div>
      </div>

      {/* Split View — Full Width 4 / 8 Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Topics Nav (4 Cols) */}
        <div className="lg:col-span-4 space-y-2">
          <div className="flex items-center justify-between px-1 mb-1">
            <span className="text-[11px] font-semibold text-arena-textSubtle uppercase tracking-wider">
              Roadmap Progression
            </span>
            <span className="text-[11px] text-arena-textSubtle font-mono">{DSA_TOPICS.length} Topics</span>
          </div>

          <div className="space-y-1.5 max-h-[720px] overflow-y-auto pr-1">
            {DSA_TOPICS.map((topic, index) => {
              const isSelected = activeTopic.id === topic.id;
              const progress = user.topicProgress[topic.id] || 0;
              const isComplete = progress >= 100;

              return (
                <button
                  key={topic.id}
                  onClick={() => {
                    sound.playClick();
                    setActiveTopic(topic);
                  }}
                  className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-arena-elevated border-arena-amber/50 text-arena-textPrimary shadow-subtle'
                      : 'bg-arena-surface border-arena-border hover:border-arena-borderHover text-arena-textSecondary'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs font-mono ${
                      isSelected
                        ? 'bg-arena-amber text-[#141719]'
                        : 'bg-arena-elevated text-arena-textSubtle'
                    }`}>
                      {index + 1}
                    </div>

                    <div>
                      <h4 className="font-semibold text-xs text-arena-textPrimary flex items-center gap-1.5">
                        <span>{topic.title}</span>
                        {isComplete && <CheckCircle2 className="w-3.5 h-3.5 text-arena-success" />}
                      </h4>
                      <p className="text-[11px] text-arena-textSubtle line-clamp-1 mt-0.5">
                        {topic.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 pl-2 shrink-0">
                    {progress > 0 && (
                      <span className="text-[10px] font-semibold text-arena-teal font-mono">
                        {progress}%
                      </span>
                    )}
                    <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-arena-amber' : 'text-arena-textSubtle'}`} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Detail Pane (8 Cols) */}
        <div className="lg:col-span-8 arena-card p-6 space-y-5">
          
          <div className="flex items-start justify-between pb-3.5 border-b border-arena-border">
            <div>
              <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-arena-amber mb-1">
                <Sparkles className="w-3 h-3" />
                <span>TOPIC GUIDE</span>
              </div>
              <h2 className="text-xl font-bold text-arena-textPrimary">{activeTopic.title}</h2>
              <p className="text-xs text-arena-textSecondary mt-1 leading-relaxed">
                {activeTopic.description}
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-arena-elevated border border-arena-border text-center shrink-0">
              <span className="text-[10px] text-arena-textSubtle block font-medium">MASTERY</span>
              <span className="text-sm font-bold text-arena-amber font-mono">
                {user.topicProgress[activeTopic.id] || 0}%
              </span>
            </div>
          </div>

          {/* Complexity Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-lg bg-arena-elevated border border-arena-border">
              <span className="text-[10px] uppercase font-semibold text-arena-textSubtle block">TIME COMPLEXITY</span>
              <span className="text-xs font-mono font-medium text-arena-teal mt-0.5 block">
                {activeTopic.timeComplexity}
              </span>
            </div>
            <div className="p-3.5 rounded-lg bg-arena-elevated border border-arena-border">
              <span className="text-[10px] uppercase font-semibold text-arena-textSubtle block">SPACE COMPLEXITY</span>
              <span className="text-xs font-mono font-medium text-arena-amber mt-0.5 block">
                {activeTopic.spaceComplexity}
              </span>
            </div>
          </div>

          {/* Core Concept Notes */}
          <div className="space-y-2">
            <h4 className="text-[11px] uppercase font-semibold text-arena-textSubtle tracking-wider">
              Core Principles
            </h4>
            <div className="space-y-1.5">
              {activeTopic.conceptNotes.map((note, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-arena-elevated border border-arena-border text-xs text-arena-textSecondary flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-arena-amber mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{note}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Common Algorithmic Patterns */}
          <div>
            <h4 className="text-[11px] uppercase font-semibold text-arena-textSubtle tracking-wider mb-2">
              Common Patterns
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {activeTopic.commonPatterns.map((pattern, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded bg-arena-elevated border border-arena-border text-xs text-arena-textSecondary"
                >
                  {pattern}
                </span>
              ))}
            </div>
          </div>

          {/* Practice Problems */}
          <div className="pt-3.5 border-t border-arena-border space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] uppercase font-semibold text-arena-textSubtle tracking-wider flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-arena-amber" />
                <span>Practice Problems</span>
              </h4>
              <span className="text-[11px] text-arena-textSubtle">
                Monaco Editor & Test Runner
              </span>
            </div>

            <div className="space-y-2">
              {activeTopic.problemIds.map((probId) => {
                const prob = CODING_PROBLEMS.find(p => p.id === probId);
                if (!prob) return null;
                const isSolved = user.problemsSolved.includes(prob.id);

                return (
                  <div
                    key={prob.id}
                    className="p-3.5 rounded-lg bg-arena-elevated border border-arena-border flex items-center justify-between hover:border-arena-borderHover transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded flex items-center justify-center ${
                        isSolved 
                          ? 'bg-arena-success/15 text-arena-success' 
                          : 'bg-arena-surface text-arena-textSubtle'
                      }`}>
                        {isSolved ? <Check className="w-3.5 h-3.5" /> : <Code2 className="w-3.5 h-3.5" />}
                      </div>

                      <div>
                        <div className="font-semibold text-xs text-arena-textPrimary flex items-center gap-1.5">
                          <span>{prob.title}</span>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded font-mono ${
                            prob.difficulty === 'Easy' 
                              ? 'bg-arena-success/15 text-arena-success' 
                              : prob.difficulty === 'Medium'
                              ? 'bg-arena-warning/15 text-arena-warning'
                              : 'bg-arena-error/15 text-arena-error'
                          }`}>
                            {prob.difficulty}
                          </span>
                        </div>
                        <span className="text-[10px] text-arena-textSubtle font-mono">
                          {prob.testCases.length} Test Cases • JS, TS, Python
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenProblem(prob.id)}
                      className="btn-primary py-1 px-3.5 text-xs gap-1 font-semibold"
                    >
                      <span>{isSolved ? 'Review' : 'Solve'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {solvingProblem && (
        <LearnProblemModal
          problem={solvingProblem}
          topicId={activeTopic.id}
          onClose={() => setSolvingProblem(null)}
        />
      )}

    </div>
  );
};
