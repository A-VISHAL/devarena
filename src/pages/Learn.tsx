import React, { useState } from 'react';
import { 
  BookOpen, 
  Layers, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  Code2, 
  Trophy, 
  Sparkles,
  ChevronRight,
  ExternalLink,
  Flame,
  Check
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

  // Calculate overall mastery
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-in fade-in">
      
      {/* Banner & Overall Progress */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-arena-card to-slate-950 border border-cyan-500/30 p-6 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-bold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>INTERACTIVE DSA ROADMAP & PRACTICE</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white">
            Algorithms & Data Structures
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Master the core computer science foundations. Study concept explanations, understand optimal time and space complexity invariants, and solve real practice problems in Monaco Editor.
          </p>
        </div>

        {/* Overall Mastery Gauge */}
        <div className="w-full lg:w-72 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shrink-0">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-400">Roadmap Progress</span>
            <span className="text-cyan-400">{overallMastery}% Mastery</span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full transition-all duration-500"
              style={{ width: `${overallMastery}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span>{totalSolved} Problems Solved</span>
            <span>{totalTopics} DSA Topics</span>
          </div>
        </div>
      </div>

      {/* Split View: Topic Visual Roadmap on Left, Topic Guide & Problems on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Topics Nav (5 Cols) */}
        <div className="lg:col-span-5 space-y-2.5">
          <div className="flex items-center justify-between px-2 mb-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Roadmap Progression
            </span>
            <span className="text-xs text-slate-500">15 Topics</span>
          </div>

          <div className="space-y-2 max-h-[750px] overflow-y-auto pr-1">
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
                  className={`w-full p-4 rounded-2xl border text-left transition-all duration-150 flex items-center justify-between ${
                    isSelected
                      ? 'bg-gradient-to-r from-violet-950/60 to-slate-900 border-violet-500/50 shadow-lg shadow-violet-500/10'
                      : 'bg-arena-card border-arena-border hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                      isSelected
                        ? 'bg-violet-600 text-white shadow-md shadow-violet-500/30'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {index + 1}
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                        <span>{topic.title}</span>
                        {isComplete && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      </h4>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {topic.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pl-2 shrink-0">
                    {progress > 0 && (
                      <span className="text-[10px] font-bold text-cyan-400">
                        {progress}%
                      </span>
                    )}
                    <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-violet-400' : 'text-slate-600'}`} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Deep Dive Detail (7 Cols) */}
        <div className="lg:col-span-7 arena-card p-6 space-y-6">
          
          {/* Active Topic Header */}
          <div className="flex items-start justify-between pb-4 border-b border-arena-border">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-400 mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>TOPIC GUIDE</span>
              </div>
              <h2 className="text-2xl font-black text-white">{activeTopic.title}</h2>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {activeTopic.description}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center shrink-0">
              <span className="text-[10px] text-slate-500 block font-semibold">MASTERY</span>
              <span className="text-base font-black text-violet-400">
                {user.topicProgress[activeTopic.id] || 0}%
              </span>
            </div>
          </div>

          {/* Complexity Invariants */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">TIME COMPLEXITY</span>
              <span className="text-xs font-mono font-bold text-cyan-400 mt-1 block">
                {activeTopic.timeComplexity}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">SPACE COMPLEXITY</span>
              <span className="text-xs font-mono font-bold text-violet-400 mt-1 block">
                {activeTopic.spaceComplexity}
              </span>
            </div>
          </div>

          {/* Key Concept Notes */}
          <div className="space-y-2">
            <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              Core Invariants & Rules
            </h4>
            <div className="space-y-2">
              {activeTopic.conceptNotes.map((note, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{note}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Common Algorithmic Patterns */}
          <div>
            <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-2">
              Frequent Patterns
            </h4>
            <div className="flex flex-wrap gap-2">
              {activeTopic.commonPatterns.map((pattern, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300 font-medium"
                >
                  {pattern}
                </span>
              ))}
            </div>
          </div>

          {/* Curated Practice Problems */}
          <div className="pt-4 border-t border-arena-border space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-cyan-400" />
                <span>Practice Problems</span>
              </h4>
              <span className="text-[11px] text-slate-500">
                Run in Monaco Editor with Automated Tests
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
                    className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between hover:border-violet-500/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        isSolved 
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {isSolved ? <Check className="w-4 h-4" /> : <Code2 className="w-3.5 h-3.5" />}
                      </div>

                      <div>
                        <div className="font-bold text-xs text-white flex items-center gap-2">
                          <span>{prob.title}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            prob.difficulty === 'Easy' 
                              ? 'bg-emerald-500/10 text-emerald-400' 
                              : prob.difficulty === 'Medium'
                              ? 'bg-amber-500/10 text-amber-400'
                              : 'bg-rose-500/10 text-rose-400'
                          }`}>
                            {prob.difficulty}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {prob.testCases.length} Test Cases • JS, TS, Python
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenProblem(prob.id)}
                      className="btn-primary py-1.5 px-3 text-xs gap-1.5 font-bold"
                    >
                      <span>{isSolved ? 'Review' : 'Solve'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* Problem Solving Modal with Monaco Editor & Real Execution */}
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

