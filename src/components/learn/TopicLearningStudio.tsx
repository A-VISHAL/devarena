import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  Code2, 
  ArrowRight, 
  Copy, 
  Check, 
  Play, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft, 
  AlertTriangle, 
  Lightbulb, 
  Share2, 
  MessageSquare, 
  Send, 
  ExternalLink,
  Flame,
  Clock,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { DSARoadmapTopic } from '../../types/learn';
import { CODING_PROBLEMS } from '../../data/problems';
import { CodingProblem } from '../../types';
import { sound } from '../../utils/sound';
import { markLessonCompleted, getCompletedLessons, recordLearningActivity } from '../../services/learningActivityService';

interface TopicLearningStudioProps {
  topic: DSARoadmapTopic;
  userSolvedProblems: string[];
  onOpenProblemInArena: (problemId: string) => void;
  onShareTopic: (topic: DSARoadmapTopic) => void;
  onPostCommunityUpdate?: (topic: DSARoadmapTopic) => void;
}

export const TopicLearningStudio: React.FC<TopicLearningStudioProps> = ({
  topic,
  userSolvedProblems,
  onOpenProblemInArena,
  onShareTopic,
  onPostCommunityUpdate
}) => {
  const [selectedLang, setSelectedLang] = useState<'python' | 'cpp' | 'java'>('python');
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<string[]>(getCompletedLessons());
  
  // Discussion comment input state
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Array<{ id: string; author: string; avatar: string; text: string; time: string; likes: number }>>([
    {
      id: 'c1',
      author: 'kavya_codes',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      text: `Key takeaway for ${topic.title}: Always state the space-time invariant before jumping into implementation!`,
      time: '2h ago',
      likes: 5
    },
    {
      id: 'c2',
      author: 'marcus_q',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80',
      text: 'Kadane and sliding window share the same core principle of discarding unpromising prefixes.',
      time: '5h ago',
      likes: 3
    }
  ]);

  const handleCopyCode = async () => {
    sound.playClick();
    const code = topic.codeExamples[selectedLang];
    await navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleToggleLesson = (lessonId: string, lessonTitle: string) => {
    sound.playCorrect();
    const success = markLessonCompleted(lessonId, topic.id, topic.title, lessonTitle);
    if (success) {
      setCompletedLessons(prev => [...prev, lessonId]);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    sound.playVictory();

    const created = {
      id: `comm_${Date.now()}`,
      author: 'You (Guest #5128)',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      text: newComment.trim(),
      time: 'Just now',
      likes: 1
    };

    setComments(prev => [created, ...prev]);
    recordLearningActivity('discussion_posted', {
      topicId: topic.id,
      topicTitle: topic.title,
      details: `Contributed note on ${topic.title}: "${newComment.trim().slice(0, 40)}..."`,
      points: 2
    });

    setNewComment('');
  };

  const currentStep = topic.visualization.steps[activeStepIndex] || topic.visualization.steps[0];
  const totalSteps = topic.visualization.steps.length;

  return (
    <div className="space-y-6 animate-in fade-in select-none">
      
      {/* ================================================================ */}
      {/* 1. TOPIC HEADER HERO                                             */}
      {/* ================================================================ */}
      <div className="rounded-2xl bg-[#141A1C] border border-[#253235] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/30 uppercase">
                {topic.stage.replace('-', ' ')}
              </span>
              <span className="text-[11px] text-[#78888D] font-mono">
                {topic.difficultyBreakdown.easy + topic.difficultyBreakdown.medium + topic.difficultyBreakdown.hard} Curated Problems
              </span>
            </div>

            <h1 className="text-2xl font-bold text-white tracking-tight">{topic.title}</h1>
            <p className="text-xs sm:text-sm text-[#8A999E] mt-1.5 leading-relaxed max-w-3xl">
              {topic.description}
            </p>
          </div>

          {/* Social Share & Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onShareTopic(topic)}
              className="px-3.5 py-2 rounded-xl bg-[#1C2528] hover:bg-[#253235] border border-[#2D3C40] text-xs font-semibold text-white transition-all flex items-center gap-2 shadow-sm"
              title="Share progress card on LinkedIn or WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span>Share Topic</span>
            </button>

            {onPostCommunityUpdate && (
              <button
                onClick={() => onPostCommunityUpdate(topic)}
                className="px-3.5 py-2 rounded-xl bg-[#FFAD42] hover:bg-[#F29F30] text-[#101314] text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                <span>Post Update</span>
              </button>
            )}
          </div>
        </div>

        {/* Complexity & Prerequisite Metadata Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[#202C2F]">
          <div className="p-3 rounded-xl bg-[#0F1416] border border-[#222E31]">
            <span className="text-[10px] uppercase font-mono text-[#78888D] block">TIME COMPLEXITY</span>
            <span className="text-xs font-mono font-bold text-[#00E5FF] mt-0.5 block truncate">
              {topic.timeComplexity}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#0F1416] border border-[#222E31]">
            <span className="text-[10px] uppercase font-mono text-[#78888D] block">SPACE COMPLEXITY</span>
            <span className="text-xs font-mono font-bold text-[#FFAD42] mt-0.5 block truncate">
              {topic.spaceComplexity}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#0F1416] border border-[#222E31]">
            <span className="text-[10px] uppercase font-mono text-[#78888D] block">PREREQUISITES</span>
            <span className="text-xs font-mono text-[#B5FF4A] mt-0.5 block truncate font-medium">
              {topic.prerequisites.join(', ') || 'None'}
            </span>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* 2. INTERACTIVE ALGORITHM VISUALIZATION                            */}
      {/* ================================================================ */}
      <div className="rounded-2xl bg-[#141A1C] border border-[#253235] p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#202C2F]">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00E5FF]" />
              <h3 className="text-sm font-bold text-white tracking-tight">
                {topic.visualization.title}
              </h3>
            </div>
            <p className="text-xs text-[#8A999E] mt-0.5">{topic.visualization.description}</p>
          </div>

          {/* Stepper Controls */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-mono text-[#78888D]">
              Step <strong className="text-white">{activeStepIndex + 1}</strong> of {totalSteps}
            </span>

            <div className="flex items-center gap-1">
              <button
                disabled={activeStepIndex === 0}
                onClick={() => {
                  sound.playClick();
                  setActiveStepIndex(prev => Math.max(0, prev - 1));
                }}
                className="p-1.5 rounded-lg bg-[#182225] hover:bg-[#222E32] disabled:opacity-40 text-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                disabled={activeStepIndex === totalSteps - 1}
                onClick={() => {
                  sound.playClick();
                  setActiveStepIndex(prev => Math.min(totalSteps - 1, prev + 1));
                }}
                className="p-1.5 rounded-lg bg-[#182225] hover:bg-[#222E32] disabled:opacity-40 text-white transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setActiveStepIndex(0);
                }}
                className="p-1.5 rounded-lg bg-[#182225] hover:bg-[#222E32] text-[#8A999E] hover:text-white transition-colors"
                title="Restart visualization"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Visual Canvas State Renderer */}
        <div className="p-6 rounded-xl bg-[#0D1214] border border-[#202C2F] space-y-4">
          
          {/* Array / Cell Elements Display */}
          {Array.isArray(topic.visualization.initialState) && (
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 py-4">
              {topic.visualization.initialState.map((val, idx) => {
                const isHighlighted = currentStep.highlightIndices?.includes(idx);
                const pointer = currentStep.pointers?.find(p => p.index === idx);

                return (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    {/* Top Pointer Flag */}
                    <div className="h-5 flex items-center font-mono text-[10px] font-bold text-[#FFAD42]">
                      {pointer ? pointer.label : ''}
                    </div>

                    {/* Array Cell */}
                    <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-mono text-sm font-bold border transition-all ${
                      isHighlighted
                        ? 'bg-[#FFAD42]/20 border-[#FFAD42] text-[#FFAD42] scale-110 shadow-[0_0_12px_rgba(255,173,66,0.3)] ring-2 ring-[#FFAD42]/30'
                        : 'bg-[#141C1E] border-[#253539] text-white'
                    }`}>
                      {val}
                    </div>

                    {/* Bottom Index */}
                    <span className="text-[10px] font-mono text-[#6E7F84]">{idx}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Current Step Description & Real-time Invariant */}
          <div className="p-3.5 rounded-xl bg-[#141B1D] border border-[#28383B] flex items-start gap-3 text-xs">
            <span className="w-2 h-2 rounded-full bg-[#00E5FF] mt-1.5 shrink-0 shadow-[0_0_6px_#00E5FF]" />
            <div className="space-y-0.5">
              <div className="font-bold text-white">{currentStep.description}</div>
              <p className="text-[11px] text-[#8A999E] leading-relaxed">
                {currentStep.explanation}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ================================================================ */}
      {/* 3. STEP-BY-STEP LESSON CHECKLIST                                 */}
      {/* ================================================================ */}
      <div className="rounded-2xl bg-[#141A1C] border border-[#253235] p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#202C2F]">
          <div>
            <h3 className="text-sm font-bold text-white">Topic Curriculum Lessons</h3>
            <p className="text-xs text-[#8A999E] mt-0.5">Complete mini-lessons to log verified daily learning activity.</p>
          </div>
          <span className="text-[10px] font-mono text-[#B5FF4A] font-bold">
            {topic.lessons.filter(l => completedLessons.includes(l.id)).length}/{topic.lessons.length} Completed
          </span>
        </div>

        <div className="space-y-2.5">
          {topic.lessons.map((lesson) => {
            const isDone = completedLessons.includes(lesson.id);

            return (
              <div
                key={lesson.id}
                className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                  isDone 
                    ? 'bg-[#10181A] border-[#B5FF4A]/30 text-white' 
                    : 'bg-[#0F1416] border-[#222E31] text-[#A2B1B6]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleLesson(lesson.id, lesson.title)}
                    className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                      isDone
                        ? 'bg-[#B5FF4A] text-[#101314] border-[#B5FF4A]'
                        : 'border-[#334449] hover:border-[#FFAD42] text-transparent'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </button>

                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-2">
                      <span>{lesson.title}</span>
                      <span className="text-[10px] text-[#6E7F84] font-mono font-normal">({lesson.duration})</span>
                    </h4>
                    <p className="text-[11px] text-[#78888D] mt-0.5">{lesson.summary}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleLesson(lesson.id, lesson.title)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                    isDone
                      ? 'bg-[#B5FF4A]/10 text-[#B5FF4A] border border-[#B5FF4A]/30'
                      : 'bg-[#182326] hover:bg-[#223135] text-white border border-[#27373B]'
                  }`}
                >
                  {isDone ? 'Completed ✓' : 'Mark Lesson Done'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================================================================ */}
      {/* 4. MULTI-LANGUAGE CODE IMPLEMENTATIONS                          */}
      {/* ================================================================ */}
      <div className="rounded-2xl bg-[#141A1C] border border-[#253235] p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#202C2F]">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Code2 className="w-4 h-4 text-[#FFAD42]" />
              <span>Production Code Templates</span>
            </h3>
            <p className="text-xs text-[#8A999E] mt-0.5">Canonical implementations with minimal overhead.</p>
          </div>

          {/* Language Tabs & Copy Button */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#0D1214] p-1 rounded-xl border border-[#222E31]">
              {(['python', 'cpp', 'java'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    sound.playClick();
                    setSelectedLang(lang);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
                    selectedLang === lang
                      ? 'bg-[#1C272A] text-[#FFAD42] border border-[#FFAD42]/30 shadow-sm'
                      : 'text-[#78888D] hover:text-white'
                  }`}
                >
                  {lang === 'cpp' ? 'C++' : lang}
                </button>
              ))}
            </div>

            <button
              onClick={handleCopyCode}
              className="p-1.5 rounded-lg bg-[#182225] hover:bg-[#222E32] text-[#8A999E] hover:text-white transition-colors"
              title="Copy snippet to clipboard"
            >
              {copiedCode ? <Check className="w-4 h-4 text-[#B5FF4A]" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Code Block Container */}
        <div className="p-4 rounded-xl bg-[#0A0D0E] border border-[#202C2F] font-mono text-xs text-[#D8E2E6] overflow-x-auto leading-relaxed">
          <pre>{topic.codeExamples[selectedLang]}</pre>
        </div>
      </div>

      {/* ================================================================ */}
      {/* 5. PATTERNS, PITFALLS & INTERVIEW ADVICE                        */}
      {/* ================================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Common Patterns Card */}
        <div className="rounded-2xl bg-[#141A1C] border border-[#253235] p-5 space-y-3">
          <h4 className="text-xs font-bold text-white flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-[#FFAD42]" />
            <span>Recurring Algorithmic Patterns</span>
          </h4>
          <div className="space-y-1.5">
            {topic.commonPatterns.map((p, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-[#0F1416] border border-[#222E31] text-xs text-[#A2B1B6] flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFAD42] mt-1.5 shrink-0" />
                <span>{p}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Common Mistakes Card */}
        <div className="rounded-2xl bg-[#141A1C] border border-[#253235] p-5 space-y-3">
          <h4 className="text-xs font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span>Critical Edge Cases & Pitfalls</span>
          </h4>
          <div className="space-y-1.5">
            {topic.commonMistakes.map((m, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-[#0F1416] border border-[#222E31] text-xs text-[#A2B1B6] flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                <span>{m}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ================================================================ */}
      {/* 6. PRACTICE PROBLEMS IN CODE ARENA                               */}
      {/* ================================================================ */}
      <div className="rounded-2xl bg-[#141A1C] border border-[#253235] p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#202C2F]">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Code2 className="w-4 h-4 text-[#00E5FF]" />
              <span>Practice in Code Arena</span>
            </h3>
            <p className="text-xs text-[#8A999E] mt-0.5">Solve verified problems with sample and custom test cases.</p>
          </div>
          <span className="text-xs font-mono text-[#00E5FF]">
            {topic.problemIds.filter(id => userSolvedProblems.includes(id)).length}/{topic.problemIds.length} Solved
          </span>
        </div>

        <div className="space-y-2.5">
          {topic.problemIds.map((probId) => {
            const prob = CODING_PROBLEMS.find(p => p.id === probId);
            if (!prob) return null;
            const isSolved = userSolvedProblems.includes(prob.id);

            return (
              <div
                key={prob.id}
                className="p-4 rounded-xl bg-[#0F1416] border border-[#222E31] hover:border-[#2D3E42] transition-colors flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                    isSolved
                      ? 'bg-[#B5FF4A]/15 text-[#B5FF4A] border border-[#B5FF4A]/30'
                      : 'bg-[#182326] text-[#78888D] border border-[#28383B]'
                  }`}>
                    {isSolved ? <Check className="w-4 h-4 stroke-[3]" /> : <Code2 className="w-4 h-4" />}
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-2">
                      <span>{prob.title}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.2 rounded font-semibold ${
                        prob.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        prob.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {prob.difficulty}
                      </span>
                    </h4>
                    <span className="text-[10px] text-[#78888D] font-mono mt-0.5 block">
                      {prob.testCases?.length || 3} Test Suites • Python, JS, TS, Java, C++
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onOpenProblemInArena(prob.id)}
                  className="px-4 py-1.5 rounded-xl bg-[#FFAD42] hover:bg-[#F29F30] text-[#101314] text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-[0.98]"
                >
                  <span>{isSolved ? 'Review' : 'Solve'}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================================================================ */}
      {/* 7. TOPIC DISCUSSION & COMMUNITY NOTES                            */}
      {/* ================================================================ */}
      <div className="rounded-2xl bg-[#141A1C] border border-[#253235] p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#202C2F]">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#00E5FF]" />
            <h3 className="text-sm font-bold text-white">Topic Discussions & Insights</h3>
          </div>
          <span className="text-xs text-[#78888D] font-mono">{comments.length} Comments</span>
        </div>

        {/* Comment Input Box */}
        <form onSubmit={handleAddComment} className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={`Share an explanation or tip for ${topic.title}...`}
            className="flex-1 bg-[#0F1416] border border-[#222E31] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#6E7F84] focus:outline-none focus:border-[#FFAD42]/60 font-sans"
          />
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="px-4 py-2 rounded-xl bg-[#00E5FF] hover:bg-[#00C8E0] disabled:opacity-40 text-[#101314] text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
          >
            <span>Post</span>
            <Send className="w-3 h-3" />
          </button>
        </form>

        {/* Existing Comments List */}
        <div className="space-y-2.5 pt-1">
          {comments.map((c) => (
            <div key={c.id} className="p-3.5 rounded-xl bg-[#0F1416] border border-[#222E31] text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src={c.avatar} alt="" className="w-5 h-5 rounded-md object-cover border border-[#28383B]" />
                  <span className="font-bold text-white">{c.author}</span>
                </div>
                <span className="text-[10px] text-[#6E7F84] font-mono">{c.time}</span>
              </div>
              <p className="text-[#A2B1B6] leading-relaxed text-[11px]">{c.text}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

