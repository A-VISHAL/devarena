import React, { useState } from 'react';
import { 
  Check, 
  CheckCircle2, 
  Sparkles, 
  Lock, 
  ArrowRight, 
  Code2, 
  Layers, 
  GitBranch, 
  Repeat, 
  Cpu, 
  ChevronRight,
  Flame,
  Award
} from 'lucide-react';
import { COMPREHENSIVE_DSA_ROADMAP, LEARNING_STAGES } from '../../data/comprehensiveDsaRoadmap';
import { DSARoadmapTopic, LearningStage } from '../../types/learn';
import { sound } from '../../utils/sound';

interface InteractiveRoadmapTreeProps {
  activeTopicId: string;
  onSelectTopic: (topic: DSARoadmapTopic) => void;
  userSolvedProblems: string[];
  topicProgressMap: Record<string, number>;
}

export const InteractiveRoadmapTree: React.FC<InteractiveRoadmapTreeProps> = ({
  activeTopicId,
  onSelectTopic,
  userSolvedProblems,
  topicProgressMap
}) => {
  const [selectedStage, setSelectedStage] = useState<LearningStage | 'all'>('all');

  const filteredStages = selectedStage === 'all'
    ? LEARNING_STAGES
    : LEARNING_STAGES.filter(s => s.id === selectedStage);

  const getTopicStatus = (topic: DSARoadmapTopic): 'completed' | 'in-progress' | 'upcoming' => {
    const progress = topicProgressMap[topic.id] || 0;
    const solvedCount = topic.problemIds.filter(id => userSolvedProblems.includes(id)).length;
    
    if (progress >= 100 || (topic.problemIds.length > 0 && solvedCount === topic.problemIds.length)) {
      return 'completed';
    }
    if (progress > 0 || solvedCount > 0 || topic.id === activeTopicId || topic.stage === 'foundation') {
      return 'in-progress';
    }
    return 'upcoming';
  };

  const getStageStats = (stageId: LearningStage) => {
    const stageTopics = COMPREHENSIVE_DSA_ROADMAP.filter(t => t.stage === stageId);
    const completedCount = stageTopics.filter(t => getTopicStatus(t) === 'completed').length;
    const percent = Math.round((completedCount / stageTopics.length) * 100);
    return { total: stageTopics.length, completed: completedCount, percent };
  };

  return (
    <div className="space-y-6 select-none">
      
      {/* Stage Selector Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => {
            sound.playClick();
            setSelectedStage('all');
          }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            selectedStage === 'all'
              ? 'bg-[#FFAD42] text-[#101314] font-bold shadow-sm'
              : 'bg-[#141A1C] hover:bg-[#1E282B] text-[#8A999E] hover:text-white border border-[#253235]'
          }`}
        >
          All Stages ({COMPREHENSIVE_DSA_ROADMAP.length} Topics)
        </button>

        {LEARNING_STAGES.map((stg) => {
          const isSelected = selectedStage === stg.id;
          const { percent } = getStageStats(stg.id);

          return (
            <button
              key={stg.id}
              onClick={() => {
                sound.playClick();
                setSelectedStage(stg.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 border ${
                isSelected
                  ? 'bg-[#1C2528] text-white border-[#00E5FF] shadow-sm ring-1 ring-[#00E5FF]/30'
                  : 'bg-[#141A1C] hover:bg-[#1A2225] text-[#8A999E] hover:text-white border-[#253235]'
              }`}
            >
              <span>{stg.title}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                percent >= 100 
                  ? 'bg-[#B5FF4A]/15 text-[#B5FF4A] border border-[#B5FF4A]/30' 
                  : 'bg-[#182124] text-[#8A999E]'
              }`}>
                {percent}%
              </span>
            </button>
          );
        })}
      </div>

      {/* Structured Stages Progression */}
      <div className="space-y-8">
        {filteredStages.map((stage, sIdx) => {
          const stageTopics = COMPREHENSIVE_DSA_ROADMAP.filter(t => t.stage === stage.id);
          const { completed, total, percent } = getStageStats(stage.id);
          const isStageMastered = percent >= 100;

          return (
            <div 
              key={stage.id}
              className="rounded-2xl bg-[#141A1C] border border-[#253235] p-5 sm:p-6 space-y-5 relative overflow-hidden"
            >
              {/* Subtle Stage Ambient Header Accent */}
              <div 
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: stage.color }}
              />

              {/* Stage Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#202C2F]">
                <div>
                  <div className="flex items-center gap-2">
                    <span 
                      className="text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider"
                      style={{ backgroundColor: stage.accentBg, color: stage.color, border: `1px solid ${stage.borderAccent}` }}
                    >
                      STAGE {sIdx + 1}
                    </span>
                    <h3 className="text-base font-bold text-white tracking-tight">{stage.title}</h3>
                    {isStageMastered && (
                      <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-[#B5FF4A] bg-[#B5FF4A]/10 px-2 py-0.5 rounded-full border border-[#B5FF4A]/30">
                        <Award className="w-3 h-3" />
                        <span>MASTERED</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#8A999E] mt-1">{stage.description}</p>
                </div>

                {/* Stage Progress Gauge */}
                <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
                  <div className="text-right">
                    <span className="text-[10px] text-[#78888D] font-mono block">STAGE PROGRESS</span>
                    <span className="text-xs font-bold text-white font-mono">
                      {completed}/{total} Topics ({percent}%)
                    </span>
                  </div>
                  <div className="w-16 h-2 rounded-full bg-[#182326] overflow-hidden border border-[#28383B]">
                    <div 
                      className="h-full rounded-full transition-all duration-300"
                      style={{ 
                        width: `${percent}%`,
                        backgroundColor: isStageMastered ? '#B5FF4A' : stage.color 
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Connected Topics Roadmap Visual Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
                {stageTopics.map((topic, tIdx) => {
                  const status = getTopicStatus(topic);
                  const isSelected = activeTopicId === topic.id;
                  const progress = topicProgressMap[topic.id] || 0;
                  const solvedCount = topic.problemIds.filter(id => userSolvedProblems.includes(id)).length;

                  return (
                    <div
                      key={topic.id}
                      onClick={() => {
                        sound.playClick();
                        onSelectTopic(topic);
                      }}
                      className={`p-4 rounded-xl border transition-all cursor-pointer text-left relative flex flex-col justify-between group ${
                        isSelected
                          ? 'bg-[#1C2528] border-[#FFAD42] ring-1 ring-[#FFAD42]/40 shadow-md'
                          : status === 'completed'
                          ? 'bg-[#121A1C] border-[#B5FF4A]/35 hover:border-[#B5FF4A]/60'
                          : status === 'in-progress'
                          ? 'bg-[#151D20] border-[#2C3B40] hover:border-[#FFAD42]/50'
                          : 'bg-[#111618] border-[#20292B] hover:border-[#2C3B40] opacity-85'
                      }`}
                    >
                      {/* Top Node Indicator & Status Pill */}
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          
                          {/* Node Icon Circle */}
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono text-xs font-bold border transition-all ${
                            status === 'completed'
                              ? 'bg-[#B5FF4A]/15 text-[#B5FF4A] border-[#B5FF4A]/40 shadow-[0_0_8px_rgba(181,255,74,0.3)]'
                              : status === 'in-progress'
                              ? 'bg-[#FFAD42]/15 text-[#FFAD42] border-[#FFAD42]/40 shadow-[0_0_8px_rgba(255,173,66,0.3)]'
                              : 'bg-[#182124] text-[#6E7F84] border-[#253235]'
                          }`}>
                            {status === 'completed' ? (
                              <Check className="w-4 h-4 stroke-[3]" />
                            ) : (
                              <span>{sIdx * 5 + tIdx + 1}</span>
                            )}
                          </div>

                          {/* Status Badge */}
                          <div className="flex items-center gap-1.5">
                            {status === 'completed' ? (
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#B5FF4A]/10 text-[#B5FF4A] border border-[#B5FF4A]/30">
                                COMPLETED
                              </span>
                            ) : status === 'in-progress' ? (
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#FFAD42]/10 text-[#FFAD42] border border-[#FFAD42]/30 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#FFAD42] animate-pulse" />
                                LEARNING
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono text-[#6E7F84] px-2 py-0.5 rounded-full bg-[#161D20] border border-[#222E31]">
                                UPCOMING
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Title and Short Description */}
                        <h4 className="text-sm font-bold text-white group-hover:text-[#FFAD42] transition-colors flex items-center justify-between">
                          <span>{topic.title}</span>
                          <ChevronRight className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 ${
                            isSelected ? 'text-[#FFAD42]' : 'text-[#6E7F84]'
                          }`} />
                        </h4>
                        
                        <p className="text-[11px] text-[#8A999E] mt-1 line-clamp-2 leading-relaxed">
                          {topic.description}
                        </p>
                      </div>

                      {/* Difficulty Pills & Solved Count */}
                      <div className="pt-3 mt-3 border-t border-[#1F2B2E] space-y-2">
                        
                        {/* Difficulty breakdown tag */}
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {topic.difficultyBreakdown.easy} Easy
                            </span>
                            <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              {topic.difficultyBreakdown.medium} Med
                            </span>
                            {topic.difficultyBreakdown.hard > 0 && (
                              <span className="px-1.5 py-0.2 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                                {topic.difficultyBreakdown.hard} Hard
                              </span>
                            )}
                          </div>

                          <span className="text-[#A2B1B6]">
                            {solvedCount}/{topic.problemIds.length} Solved
                          </span>
                        </div>

                        {/* Mini Progress Bar */}
                        <div className="w-full h-1.5 rounded-full bg-[#182326] overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${
                              status === 'completed'
                                ? 'bg-[#B5FF4A]'
                                : status === 'in-progress'
                                ? 'bg-[#FFAD42]'
                                : 'bg-[#2A373B]'
                            }`}
                            style={{ width: `${Math.max(5, progress)}%` }}
                          />
                        </div>

                        {/* Prerequisites Indicator */}
                        {topic.prerequisites.length > 0 && (
                          <div className="text-[10px] text-[#6E7F84] font-mono truncate">
                            Prereq: {topic.prerequisites.join(', ')}
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};

