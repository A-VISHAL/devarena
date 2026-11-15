import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { 
  Play, 
  Send, 
  RotateCcw, 
  Bookmark, 
  BookmarkCheck, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  Share2, 
  Copy, 
  Check, 
  Swords, 
  Terminal, 
  Sparkles, 
  Clock, 
  Code2, 
  FileText, 
  Lightbulb, 
  HelpCircle, 
  ExternalLink,
  Layers,
  Building2,
  Maximize2,
  Minimize2,
  CheckCheck,
  Plus,
  Trash2,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CODING_PROBLEMS } from '../../data/problems';
import { CodingProblem, SupportedLanguage } from '../../types';
import { executeCode, ExecutionReport } from '../../utils/codeRunner';
import { sound } from '../../utils/sound';
import confetti from 'canvas-confetti';

interface LeetCodeArenaProps {
  onStart1v1Battle?: () => void;
}

export const LeetCodeArena: React.FC<LeetCodeArenaProps> = ({ onStart1v1Battle }) => {
  const { 
    user, 
    selectedArenaProblemId, 
    setSelectedArenaProblemId,
    bookmarkedProblemIds,
    toggleBookmarkProblem,
    attemptedProblemIds,
    recordProblemAttempt,
    savedCodeCache,
    saveProblemCode,
    recordProblemSolved,
    toggleMarkProblemSolved,
    settings
  } = useApp();

  // 1. Problem Selection State
  const activeProblem: CodingProblem = useMemo(() => {
    const found = CODING_PROBLEMS.find(p => p.id === selectedArenaProblemId);
    return found || CODING_PROBLEMS[0];
  }, [selectedArenaProblemId]);

  // 2. Navigation Sidebar Filter State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'Solved' | 'Attempted' | 'Todo'>('All');

  // 3. Center Description Panel State
  const [descTab, setDescTab] = useState<'description' | 'hints' | 'submissions' | 'solutions'>('description');
  const [expandedHints, setExpandedHints] = useState<Record<number, boolean>>({});
  const [copiedLink, setCopiedLink] = useState(false);

  // 4. Code Editor State
  const [language, setLanguage] = useState<SupportedLanguage>(() => {
    return (settings?.defaultLanguage as SupportedLanguage) || 'javascript';
  });
  const [code, setCode] = useState<string>(() => {
    if (savedCodeCache[activeProblem.id]?.[language]) {
      return savedCodeCache[activeProblem.id][language];
    }
    return activeProblem.starterCode[language] || activeProblem.starterCode.javascript;
  });

  // When problem or language changes, restore code from cache or template
  useEffect(() => {
    const cached = savedCodeCache[activeProblem.id]?.[language];
    if (cached) {
      setCode(cached);
    } else {
      const template = activeProblem.starterCode[language] || activeProblem.starterCode.javascript;
      setCode(template);
    }
    setExecReport(null);
  }, [activeProblem.id, language]);

  // 5. Testcases & Console State
  const [activeConsoleTab, setActiveConsoleTab] = useState<'cases' | 'result' | 'console'>('cases');
  const [selectedCaseIdx, setSelectedCaseIdx] = useState<number>(0);
  const [customInputText, setCustomInputText] = useState<string>('');
  const [isConsoleCollapsed, setIsConsoleCollapsed] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [execReport, setExecReport] = useState<ExecutionReport | null>(null);

  // Resizable Panes state: Center width % (clamped between 30% and 65%)
  const [centerSplitPercent, setCenterSplitPercent] = useState<number>(45);
  const [isDraggingCenterSplitter, setIsDraggingCenterSplitter] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle panel resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingCenterSplitter || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const sidebarWidth = isSidebarCollapsed ? 0 : 280;
      const availableWidth = rect.width - sidebarWidth;
      if (availableWidth <= 0) return;
      
      const mouseRelative = e.clientX - rect.left - sidebarWidth;
      const newPercent = (mouseRelative / availableWidth) * 100;
      if (newPercent >= 28 && newPercent <= 68) {
        setCenterSplitPercent(newPercent);
      }
    };

    const handleMouseUp = () => {
      setIsDraggingCenterSplitter(false);
    };

    if (isDraggingCenterSplitter) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingCenterSplitter, isSidebarCollapsed]);

  // Unique topics list
  const allTopics = useMemo(() => {
    const set = new Set<string>();
    CODING_PROBLEMS.forEach(p => {
      set.add(p.category);
      if (p.relatedTopics) p.relatedTopics.forEach(t => set.add(t));
    });
    return ['All', ...Array.from(set)];
  }, []);

  // Filtered problems list
  const filteredProblems = useMemo(() => {
    return CODING_PROBLEMS.filter(p => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesCategory = p.category.toLowerCase().includes(q);
        const matchesNum = p.leetcodeNumber ? String(p.leetcodeNumber).includes(q) : false;
        if (!matchesTitle && !matchesCategory && !matchesNum) return false;
      }
      // Difficulty filter
      if (selectedDifficulty !== 'All' && p.difficulty !== selectedDifficulty) return false;
      // Topic filter
      if (selectedTopic !== 'All') {
        const matchesCategory = p.category.toLowerCase().includes(selectedTopic.toLowerCase());
        const matchesRelated = p.relatedTopics?.some(t => t.toLowerCase().includes(selectedTopic.toLowerCase()));
        if (!matchesCategory && !matchesRelated) return false;
      }
      // Status filter
      const isSolved = user.problemsSolved.includes(p.id);
      const isAttempted = attemptedProblemIds.includes(p.id);
      if (selectedStatus === 'Solved' && !isSolved) return false;
      if (selectedStatus === 'Attempted' && (!isAttempted || isSolved)) return false;
      if (selectedStatus === 'Todo' && (isSolved || isAttempted)) return false;

      return true;
    });
  }, [searchQuery, selectedDifficulty, selectedTopic, selectedStatus, user.problemsSolved, attemptedProblemIds]);

  // Handle Code changes and persist to cache
  const handleCodeChange = (newVal?: string) => {
    const updated = newVal || '';
    setCode(updated);
    saveProblemCode(activeProblem.id, language, updated);
  };

  // Reset starter code
  const handleResetCode = () => {
    sound.playClick();
    const template = activeProblem.starterCode[language] || activeProblem.starterCode.javascript;
    setCode(template);
    saveProblemCode(activeProblem.id, language, template);
  };

  // Run Code against Sample Test Cases or Custom Test Case
  const handleRunCode = async () => {
    sound.playClick();
    setIsRunning(true);
    setIsConsoleCollapsed(false);
    setActiveConsoleTab('result');
    recordProblemAttempt(activeProblem.id);

    let customCases: { input: any[]; expected?: any; isCustom?: boolean }[] | undefined = undefined;
    if (customInputText.trim()) {
      try {
        const parsed = JSON.parse(customInputText.trim());
        customCases = [{
          input: Array.isArray(parsed) ? parsed : [parsed],
          isCustom: true
        }];
      } catch {
        // Fall back to sample test cases if custom input fails JSON parsing
      }
    }

    const report = await executeCode(activeProblem, code, language, false, customCases);
    setExecReport(report);
    setIsRunning(false);

    if (report.allPassed) sound.playCorrect();
    else sound.playWrong();
  };

  // Submit Code against Full Test Suite
  const handleSubmitCode = async () => {
    sound.playClick();
    setIsSubmitting(true);
    setIsConsoleCollapsed(false);
    setActiveConsoleTab('result');
    recordProblemAttempt(activeProblem.id);

    const report = await executeCode(activeProblem, code, language, true);
    setExecReport(report);
    setIsSubmitting(false);

    if (report.allPassed) {
      sound.playVictory();
      confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
      recordProblemSolved(activeProblem.id, activeProblem.category);
    } else {
      sound.playWrong();
    }
  };

  // Keyboard Shortcuts for Run (⌘↵) and Submit (⇧⌘↵)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isMod = isMac ? e.metaKey : e.ctrlKey;

      if (isMod && e.key === 'Enter') {
        e.preventDefault();
        if (e.shiftKey) {
          handleSubmitCode();
        } else {
          handleRunCode();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [code, language, activeProblem, customInputText]);

  // Share problem link
  const handleCopyProblemLink = () => {
    sound.playClick();
    const url = `${window.location.origin}/app/arena?problem=${activeProblem.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const isBookmarked = bookmarkedProblemIds.includes(activeProblem.id);
  const isSolved = user.problemsSolved.includes(activeProblem.id);

  return (
    <div className="h-[calc(100vh-3.5rem)] w-full flex flex-col bg-[#101314] text-[#F5F5F5] overflow-hidden select-none font-sans">
      
      {/* ============================================================== */}
      {/* 1. TOP UTILITY ACTION BAR                                      */}
      {/* ============================================================== */}
      <div className="h-11 bg-[#141A1C] border-b border-[#253033] px-3 sm:px-4 flex items-center justify-between gap-3 shrink-0 text-xs">
        
        {/* Left: Sidebar Toggle & Breadcrumb */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => setIsSidebarCollapsed(prev => !prev)}
            className="p-1.5 rounded-md hover:bg-[#1C2426] text-[#9AA5A6] hover:text-[#F5F5F5] border border-transparent hover:border-[#2B3538] transition-all"
            title={isSidebarCollapsed ? "Expand Problem Navigation" : "Collapse Sidebar"}
          >
            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4 text-[#FFAD42]" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          <div className="flex items-center gap-2 truncate">
            <span className="font-mono text-[11px] text-[#9AA5A6] hidden sm:inline">
              #{activeProblem.leetcodeNumber || '1'}
            </span>
            <span className="font-semibold text-white truncate max-w-[200px] sm:max-w-[320px]">
              {activeProblem.title}
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
              activeProblem.difficulty === 'Easy'
                ? 'bg-[#B5FF4A]/10 text-[#B5FF4A] border-[#B5FF4A]/30'
                : activeProblem.difficulty === 'Medium'
                ? 'bg-[#FFAD42]/10 text-[#FFAD42] border-[#FFAD42]/30'
                : 'bg-[#FF5C67]/10 text-[#FF5C67] border-[#FF5C67]/30'
            }`}>
              {activeProblem.difficulty}
            </span>
          </div>
        </div>

        {/* Right: Actions, 1v1 Battle Mode, Shortcuts */}
        <div className="flex items-center gap-2 shrink-0">
          {/* 1v1 Duel Switcher Button */}
          {onStart1v1Battle && (
            <button
              onClick={onStart1v1Battle}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1C2426] hover:bg-[#252D30] border border-[#2B3538] text-[11px] font-medium text-[#FFAD42] transition-all hover:border-[#FFAD42]/40"
              title="Launch a Real-Time 1v1 Duel in Code Battle Room"
            >
              <Swords className="w-3.5 h-3.5 text-[#FFAD42]" />
              <span className="hidden md:inline">1v1 Battle Mode</span>
            </button>
          )}

          {/* Quick Mark Solved */}
          <button
            onClick={() => toggleMarkProblemSolved(activeProblem.id)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all ${
              isSolved
                ? 'bg-[#B5FF4A]/15 text-[#B5FF4A] border-[#B5FF4A]/40'
                : 'bg-[#1C2426] text-[#9AA5A6] hover:text-[#F5F5F5] border-[#2B3538]'
            }`}
            title="Mark Problem Solved"
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${isSolved ? 'text-[#B5FF4A]' : 'text-[#667275]'}`} />
            <span className="hidden sm:inline">{isSolved ? 'Solved' : 'Mark Solved'}</span>
          </button>

          {/* Bookmark Button */}
          <button
            onClick={() => toggleBookmarkProblem(activeProblem.id)}
            className={`p-1.5 rounded-md border transition-all ${
              isBookmarked
                ? 'bg-[#FFAD42]/15 text-[#FFAD42] border-[#FFAD42]/40'
                : 'bg-[#1C2426] text-[#9AA5A6] hover:text-white border-[#2B3538]'
            }`}
            title={isBookmarked ? "Remove Bookmark" : "Bookmark Problem"}
          >
            {isBookmarked ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
          </button>

          {/* Share Problem Link */}
          <button
            onClick={handleCopyProblemLink}
            className="p-1.5 rounded-md bg-[#1C2426] hover:bg-[#252D30] text-[#9AA5A6] hover:text-white border border-[#2B3538] transition-all"
            title="Copy Problem Link"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-[#B5FF4A]" /> : <Share2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. MAIN 3-PANEL WORKSPACE                                      */}
      {/* ============================================================== */}
      <div ref={containerRef} className="flex-1 flex overflow-hidden relative">

        {/* ------------------------------------------------------------ */}
        {/* PANEL A: LEFT PROBLEM NAVIGATION SIDEBAR                     */}
        {/* ------------------------------------------------------------ */}
        {!isSidebarCollapsed && (
          <aside className="w-64 sm:w-72 bg-[#121617] border-r border-[#253033] flex flex-col shrink-0 overflow-hidden">
            
            {/* Header & Search */}
            <div className="p-3 border-b border-[#253033] space-y-2.5">
              <div className="flex items-center justify-between text-xs font-semibold text-[#9AA5A6]">
                <span className="flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-[#FFAD42]" />
                  <span>Problem Navigator</span>
                </span>
                <span className="text-[10px] font-mono text-[#667275]">
                  {filteredProblems.length}/{CODING_PROBLEMS.length}
                </span>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#667275] absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search problem or #ID..."
                  className="w-full bg-[#1C2426] border border-[#2B3538] focus:border-[#FFAD42] text-xs text-white pl-8 pr-3 py-1.5 rounded-md focus:outline-none placeholder-[#667275]"
                />
              </div>

              {/* Difficulty Filter Pills */}
              <div className="flex items-center gap-1 bg-[#182022] p-1 rounded-md border border-[#2B3538] text-[10px] font-medium">
                {(['All', 'Easy', 'Medium', 'Hard'] as const).map(diff => (
                  <button
                    key={diff}
                    onClick={() => {
                      sound.playClick();
                      setSelectedDifficulty(diff);
                    }}
                    className={`flex-1 py-1 rounded text-center transition-all ${
                      selectedDifficulty === diff
                        ? 'bg-[#252D30] text-white font-semibold shadow-subtle'
                        : 'text-[#9AA5A6] hover:text-white'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>

              {/* Topic & Status Filter Dropdowns */}
              <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="bg-[#1C2426] border border-[#2B3538] text-[11px] text-[#9AA5A6] rounded px-2 py-1 focus:outline-none focus:border-[#FFAD42]"
                >
                  {allTopics.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as any)}
                  className="bg-[#1C2426] border border-[#2B3538] text-[11px] text-[#9AA5A6] rounded px-2 py-1 focus:outline-none focus:border-[#FFAD42]"
                >
                  <option value="All">All Status</option>
                  <option value="Solved">Solved</option>
                  <option value="Attempted">Attempted</option>
                  <option value="Todo">Todo</option>
                </select>
              </div>
            </div>

            {/* Problem List */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#1C2426]/60">
              {filteredProblems.map((prob) => {
                const isActive = prob.id === activeProblem.id;
                const isProbSolved = user.problemsSolved.includes(prob.id);
                const isProbAttempted = attemptedProblemIds.includes(prob.id);

                return (
                  <div
                    key={prob.id}
                    onClick={() => {
                      sound.playClick();
                      setSelectedArenaProblemId(prob.id);
                    }}
                    className={`px-3 py-2.5 cursor-pointer flex items-center justify-between gap-2 transition-all group ${
                      isActive
                        ? 'bg-[#1C2426] border-l-2 border-[#FFAD42]'
                        : 'hover:bg-[#182022] border-l-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      {/* Status Icon */}
                      <span className="mt-0.5 shrink-0">
                        {isProbSolved ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#B5FF4A]" />
                        ) : isProbAttempted ? (
                          <span className="w-3.5 h-3.5 rounded-full border border-[#FFAD42] inline-block" />
                        ) : (
                          <span className="w-3.5 h-3.5 rounded-full border border-[#3E4C50] inline-block" />
                        )}
                      </span>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono text-[#667275]">
                            #{prob.leetcodeNumber || '•'}
                          </span>
                          <span className={`text-xs truncate font-medium ${
                            isActive ? 'text-[#FFAD42] font-semibold' : 'text-[#F5F5F5] group-hover:text-white'
                          }`}>
                            {prob.title}
                          </span>
                        </div>
                        <div className="text-[10px] text-[#9AA5A6] flex items-center gap-2 mt-0.5">
                          <span>{prob.category}</span>
                          {prob.acceptanceRate && (
                            <span className="text-[#667275]">{prob.acceptanceRate}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono shrink-0 font-medium ${
                      prob.difficulty === 'Easy'
                        ? 'text-[#B5FF4A] bg-[#B5FF4A]/10'
                        : prob.difficulty === 'Medium'
                        ? 'text-[#FFAD42] bg-[#FFAD42]/10'
                        : 'text-[#FF5C67] bg-[#FF5C67]/10'
                    }`}>
                      {prob.difficulty}
                    </span>
                  </div>
                );
              })}

              {filteredProblems.length === 0 && (
                <div className="p-6 text-center text-xs text-[#9AA5A6] space-y-2">
                  <p>No matching problems found.</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedDifficulty('All');
                      setSelectedTopic('All');
                      setSelectedStatus('All');
                    }}
                    className="text-[11px] text-[#FFAD42] hover:underline"
                  >
                    Reset all filters
                  </button>
                </div>
              )}
            </div>
          </aside>
        )}

        {/* ------------------------------------------------------------ */}
        {/* PANEL B: CENTER PROBLEM DESCRIPTION & DETAILS                */}
        {/* ------------------------------------------------------------ */}
        <section 
          style={{ width: `${centerSplitPercent}%` }}
          className="h-full flex flex-col bg-[#141A1C] border-r border-[#253033] min-w-[320px] overflow-hidden"
        >
          {/* Header Tabs: Description, Hints, Submissions, Solutions */}
          <div className="h-10 bg-[#161C1F] border-b border-[#253033] px-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1 text-xs">
              <button
                onClick={() => setDescTab('description')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                  descTab === 'description'
                    ? 'bg-[#252D30] text-white border border-[#2B3538] font-semibold'
                    : 'text-[#9AA5A6] hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-[#FFAD42]" />
                <span>Description</span>
              </button>

              <button
                onClick={() => setDescTab('hints')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                  descTab === 'hints'
                    ? 'bg-[#252D30] text-white border border-[#2B3538] font-semibold'
                    : 'text-[#9AA5A6] hover:text-white'
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5 text-[#00E5FF]" />
                <span>Hints ({activeProblem.hints?.length || 0})</span>
              </button>

              <button
                onClick={() => setDescTab('solutions')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                  descTab === 'solutions'
                    ? 'bg-[#252D30] text-white border border-[#2B3538] font-semibold'
                    : 'text-[#9AA5A6] hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#B5FF4A]" />
                <span>Approach</span>
              </button>
            </div>

            {activeProblem.acceptanceRate && (
              <span className="text-[11px] font-mono text-[#9AA5A6] hidden sm:inline">
                Acceptance: <span className="text-white font-semibold">{activeProblem.acceptanceRate}</span>
              </span>
            )}
          </div>

          {/* Tab Content: Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-sm text-[#E2E8F0] leading-relaxed">
            
            {/* Tab 1: Description */}
            {descTab === 'description' && (
              <>
                {/* Title & Metadata Header */}
                <div className="space-y-2 border-b border-[#253033] pb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm text-[#9AA5A6]">
                      #{activeProblem.leetcodeNumber || '1'}
                    </span>
                    <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                      {activeProblem.title}
                    </h1>
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap text-xs">
                    <span className={`px-2.5 py-0.5 rounded font-semibold border ${
                      activeProblem.difficulty === 'Easy'
                        ? 'bg-[#B5FF4A]/10 text-[#B5FF4A] border-[#B5FF4A]/30'
                        : activeProblem.difficulty === 'Medium'
                        ? 'bg-[#FFAD42]/10 text-[#FFAD42] border-[#FFAD42]/30'
                        : 'bg-[#FF5C67]/10 text-[#FF5C67] border-[#FF5C67]/30'
                    }`}>
                      {activeProblem.difficulty}
                    </span>

                    <span className="px-2 py-0.5 rounded bg-[#1C2426] border border-[#2B3538] text-[#9AA5A6]">
                      {activeProblem.category}
                    </span>

                    {activeProblem.acceptanceRate && (
                      <span className="text-[11px] text-[#9AA5A6] font-mono">
                        Acceptance: <strong className="text-white">{activeProblem.acceptanceRate}</strong>
                      </span>
                    )}

                    {isSolved && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#B5FF4A]">
                        <CheckCheck className="w-3.5 h-3.5" /> Solved
                      </span>
                    )}
                  </div>
                </div>

                {/* Problem Statement Prose */}
                <div className="whitespace-pre-line text-sm text-[#CBD5E1] space-y-3 font-normal leading-relaxed">
                  {activeProblem.description}
                </div>

                {/* Input & Output Format */}
                {(activeProblem.inputFormat || activeProblem.outputFormat) && (
                  <div className="rounded-xl bg-[#182022] border border-[#2B3538] p-3.5 space-y-2 text-xs font-mono">
                    {activeProblem.inputFormat && (
                      <div>
                        <span className="text-[#FFAD42] font-semibold">Input: </span>
                        <span className="text-[#CBD5E1]">{activeProblem.inputFormat}</span>
                      </div>
                    )}
                    {activeProblem.outputFormat && (
                      <div>
                        <span className="text-[#00E5FF] font-semibold">Output: </span>
                        <span className="text-[#CBD5E1]">{activeProblem.outputFormat}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Examples */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-xs tracking-wider text-[#9AA5A6] uppercase">
                    Examples
                  </h3>
                  {activeProblem.examples.map((ex, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl bg-[#182022] border border-[#2B3538] p-3.5 space-y-2 text-xs font-mono"
                    >
                      <div className="text-[11px] font-bold text-[#FFAD42]">
                        Example {idx + 1}:
                      </div>
                      <div className="space-y-1">
                        <div>
                          <span className="text-[#9AA5A6]">Input: </span>
                          <span className="text-white font-medium">{ex.input}</span>
                        </div>
                        <div>
                          <span className="text-[#9AA5A6]">Output: </span>
                          <span className="text-[#B5FF4A] font-semibold">{ex.output}</span>
                        </div>
                        {ex.explanation && (
                          <div className="pt-1 text-[#9AA5A6] font-sans text-xs italic">
                            Explanation: {ex.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Constraints */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-xs tracking-wider text-[#9AA5A6] uppercase">
                    Constraints
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-xs font-mono text-[#CBD5E1] pl-1">
                    {activeProblem.constraints.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>

                {/* Related Topics & Companies Tags */}
                <div className="pt-2 border-t border-[#253033] space-y-3">
                  {activeProblem.relatedTopics && activeProblem.relatedTopics.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold text-[#9AA5A6] uppercase tracking-wider block">
                        Related Topics
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {activeProblem.relatedTopics.map(t => (
                          <span
                            key={t}
                            onClick={() => setSelectedTopic(t)}
                            className="px-2 py-0.5 rounded-md bg-[#1C2426] hover:bg-[#252D30] border border-[#2B3538] text-[11px] text-[#9AA5A6] hover:text-[#00E5FF] cursor-pointer transition-colors"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeProblem.companies && activeProblem.companies.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-semibold text-[#9AA5A6] uppercase tracking-wider block flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-[#FFAD42]" />
                        <span>Companies Asking This</span>
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {activeProblem.companies.map(comp => (
                          <span
                            key={comp}
                            className="px-2 py-0.5 rounded-md bg-[#1C2426] border border-[#2B3538] text-[11px] text-white/80 font-mono"
                          >
                            {comp}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Tab 2: Hints */}
            {descTab === 'hints' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-[#9AA5A6] pb-2 border-b border-[#253033]">
                  <Lightbulb className="w-4 h-4 text-[#00E5FF]" />
                  <span>Stuck? Reveal progressive hints to guide your solution.</span>
                </div>

                {activeProblem.hints && activeProblem.hints.length > 0 ? (
                  activeProblem.hints.map((hint, idx) => {
                    const isOpen = !!expandedHints[idx];
                    return (
                      <div
                        key={idx}
                        className="rounded-xl bg-[#182022] border border-[#2B3538] overflow-hidden"
                      >
                        <button
                          onClick={() => {
                            sound.playClick();
                            setExpandedHints(prev => ({ ...prev, [idx]: !prev[idx] }));
                          }}
                          className="w-full px-4 py-3 flex items-center justify-between text-xs font-semibold text-white hover:bg-[#20282A] transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-[#252D30] text-[#00E5FF] flex items-center justify-center font-mono text-[10px]">
                              {idx + 1}
                            </span>
                            <span>Hint {idx + 1}</span>
                          </span>
                          {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-[#9AA5A6]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#9AA5A6]" />}
                        </button>
                        {isOpen && (
                          <div className="px-4 pb-3 pt-1 text-xs text-[#CBD5E1] border-t border-[#253033] bg-[#141A1C]/60 leading-relaxed font-sans">
                            {hint}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-[#9AA5A6] p-4 text-center">No hints registered for this problem.</p>
                )}
              </div>
            )}

            {/* Tab 3: Approach & Complexity */}
            {descTab === 'solutions' && (
              <div className="space-y-4 text-xs">
                <div className="rounded-xl bg-[#182022] border border-[#2B3538] p-4 space-y-2">
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#B5FF4A]" />
                    <span>Algorithmic Invariant & Complexity</span>
                  </h4>
                  <p className="text-[#CBD5E1] leading-relaxed">
                    Optimal patterns typically eliminate nested quadratic loops using two converging pointers, dynamic prefix lookups, or contiguous frequency sliding windows.
                  </p>
                  <div className="grid grid-cols-2 gap-3 pt-2 font-mono">
                    <div className="p-2.5 rounded bg-[#141A1C] border border-[#2B3538]">
                      <span className="text-[10px] text-[#9AA5A6] block">Time Complexity</span>
                      <span className="text-white font-semibold">O(N) or O(N log N)</span>
                    </div>
                    <div className="p-2.5 rounded bg-[#141A1C] border border-[#2B3538]">
                      <span className="text-[10px] text-[#9AA5A6] block">Space Complexity</span>
                      <span className="text-white font-semibold">O(1) to O(N)</span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#141A1C] border border-[#253033] space-y-2">
                  <h5 className="font-semibold text-white">Recommended Strategy:</h5>
                  <ol className="list-decimal list-inside space-y-1.5 text-[#CBD5E1]">
                    <li>Understand the input domain constraints and potential integer overflows.</li>
                    <li>Dry-run the algorithm on empty, single-element, and duplicate edge cases.</li>
                    <li>Use custom test cases below to verify boundary conditions before submitting.</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ------------------------------------------------------------ */}
        {/* DRAGGABLE RESIZER HANDLE                                     */}
        {/* ------------------------------------------------------------ */}
        <div
          onMouseDown={() => setIsDraggingCenterSplitter(true)}
          className="w-1.5 bg-[#1C2426] hover:bg-[#FFAD42] active:bg-[#FFAD42] cursor-col-resize transition-colors shrink-0 z-20 flex items-center justify-center group"
          title="Drag to resize problem and editor panes"
        >
          <div className="w-0.5 h-6 bg-[#3E4C50] group-hover:bg-white rounded" />
        </div>

        {/* ------------------------------------------------------------ */}
        {/* PANEL C: RIGHT MONACO EDITOR & CONSOLE RUNNER               */}
        {/* ------------------------------------------------------------ */}
        <main className="flex-1 min-w-[340px] flex flex-col bg-[#101314] overflow-hidden">
          
          {/* Editor Action Bar */}
          <div className="h-10 bg-[#141A1C] border-b border-[#253033] px-3 sm:px-4 flex items-center justify-between gap-2 shrink-0">
            
            {/* Language Selection & Execution Engine Badge */}
            <div className="flex items-center gap-2">
              <select
                value={language}
                onChange={(e) => {
                  sound.playClick();
                  setLanguage(e.target.value as SupportedLanguage);
                }}
                className="bg-[#1C2426] border border-[#2B3538] text-xs font-mono font-medium text-white rounded px-2.5 py-1 focus:outline-none focus:border-[#FFAD42]"
              >
                <option value="javascript">JavaScript (V8)</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python 3 (Transpiled)</option>
                <option value="cpp">C++ (Simulated)</option>
                <option value="java">Java (Simulated)</option>
              </select>

              {/* Execution Engine Transparency Badge */}
              <div
                className="hidden lg:flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded bg-[#182022] border border-[#2B3538]"
                title={language === 'javascript' || language === 'typescript' 
                  ? 'Executes natively in client browser V8 JavaScript thread' 
                  : 'Client regex transpiler converts basic syntax to JS in-browser'}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${
                  language === 'javascript' || language === 'typescript' ? 'bg-[#B5FF4A]' : 'bg-[#FFAD42]'
                }`} />
                <span className="text-[#9AA5A6]">
                  {language === 'javascript' || language === 'typescript' ? 'Native JS' : 'Simulated'}
                </span>
              </div>
            </div>

            {/* Run & Submit Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleResetCode}
                className="p-1.5 rounded-md hover:bg-[#1C2426] text-[#9AA5A6] hover:text-white border border-transparent hover:border-[#2B3538] transition-all"
                title="Reset to Starter Template"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Run Code Button */}
              <button
                disabled={isRunning || isSubmitting}
                onClick={handleRunCode}
                className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#1C2426] hover:bg-[#252D30] border border-[#2B3538] text-xs font-semibold text-white transition-all disabled:opacity-50"
                title="Run Code against sample test cases (Cmd/Ctrl + Enter)"
              >
                {isRunning ? (
                  <span className="w-3.5 h-3.5 border-2 border-[#FFAD42] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5 text-[#00E5FF] fill-[#00E5FF]" />
                )}
                <span>Run</span>
                <span className="text-[10px] text-[#667275] hidden sm:inline font-mono">⌘↵</span>
              </button>

              {/* Submit Code Button */}
              <button
                disabled={isRunning || isSubmitting}
                onClick={handleSubmitCode}
                className="flex items-center gap-1.5 px-3.5 py-1 rounded-md bg-[#FFAD42] hover:bg-[#E59830] text-xs font-bold text-[#101314] transition-all disabled:opacity-50 shadow-subtle"
                title="Submit solution against all test cases (Cmd/Ctrl + Shift + Enter)"
              >
                {isSubmitting ? (
                  <span className="w-3.5 h-3.5 border-2 border-[#101314] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Submit</span>
                <span className="text-[10px] text-[#101314]/70 hidden sm:inline font-mono">⇧⌘↵</span>
              </button>
            </div>
          </div>

          {/* Monaco Editor Component */}
          <div className="flex-1 relative overflow-hidden bg-[#101314]">
            <Editor
              height="100%"
              language={language === 'cpp' ? 'cpp' : language === 'java' ? 'java' : language === 'python' ? 'python' : language}
              value={code}
              onChange={handleCodeChange}
              theme={settings?.editorTheme || 'vs-dark'}
              options={{
                fontSize: settings?.fontSize || 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                minimap: { enabled: false },
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                wordWrap: settings?.wordWrap || 'on',
                automaticLayout: true,
                tabSize: settings?.tabSize || 2,
                cursorBlinking: 'smooth',
                smoothScrolling: true,
                padding: { top: 12, bottom: 12 }
              }}
            />
          </div>

          {/* ---------------------------------------------------------- */}
          {/* BOTTOM CONSOLE & TEST RESULTS DRAWER                       */}
          {/* ---------------------------------------------------------- */}
          <div className={`border-t border-[#253033] bg-[#141A1C] transition-all ${
            isConsoleCollapsed ? 'h-9' : 'h-64 sm:h-72'
          } flex flex-col shrink-0`}>
            
            {/* Console Header Tabs */}
            <div className="h-9 px-3 sm:px-4 bg-[#161C1F] border-b border-[#253033] flex items-center justify-between text-xs font-medium">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setIsConsoleCollapsed(false);
                    setActiveConsoleTab('cases');
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
                    activeConsoleTab === 'cases' && !isConsoleCollapsed
                      ? 'bg-[#252D30] text-white font-semibold'
                      : 'text-[#9AA5A6] hover:text-white'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5 text-[#00E5FF]" />
                  <span>Test Cases</span>
                </button>

                <button
                  onClick={() => {
                    setIsConsoleCollapsed(false);
                    setActiveConsoleTab('result');
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
                    activeConsoleTab === 'result' && !isConsoleCollapsed
                      ? 'bg-[#252D30] text-white font-semibold'
                      : 'text-[#9AA5A6] hover:text-white'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5 text-[#FFAD42]" />
                  <span>Test Result</span>
                  {execReport && (
                    <span className={`w-2 h-2 rounded-full ${
                      execReport.allPassed ? 'bg-[#B5FF4A]' : 'bg-[#FF5C67]'
                    }`} />
                  )}
                </button>

                <button
                  onClick={() => {
                    setIsConsoleCollapsed(false);
                    setActiveConsoleTab('console');
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
                    activeConsoleTab === 'console' && !isConsoleCollapsed
                      ? 'bg-[#252D30] text-white font-semibold'
                      : 'text-[#9AA5A6] hover:text-white'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5 text-[#9AA5A6]" />
                  <span>Stdout</span>
                </button>
              </div>

              {/* Collapse Console Toggle */}
              <button
                onClick={() => setIsConsoleCollapsed(prev => !prev)}
                className="p-1 rounded text-[#9AA5A6] hover:text-white hover:bg-[#1C2426]"
                title={isConsoleCollapsed ? "Expand Console" : "Collapse Console"}
              >
                {isConsoleCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Console Body Area */}
            {!isConsoleCollapsed && (
              <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 text-xs font-mono">
                
                {/* 1. Testcases Tab: Case 1, Case 2, + Custom */}
                {activeConsoleTab === 'cases' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {activeProblem.testCases.filter(t => !t.isHidden).map((tc, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedCaseIdx(idx)}
                          className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                            selectedCaseIdx === idx
                              ? 'bg-[#252D30] text-white border border-[#3E4C50]'
                              : 'bg-[#182022] text-[#9AA5A6] hover:text-white'
                          }`}
                        >
                          Case {idx + 1}
                        </button>
                      ))}

                      <button
                        onClick={() => setSelectedCaseIdx(999)}
                        className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                          selectedCaseIdx === 999
                            ? 'bg-[#252D30] text-[#00E5FF] border border-[#00E5FF]/40'
                            : 'bg-[#182022] text-[#9AA5A6] hover:text-white'
                        }`}
                      >
                        <Plus className="w-3 h-3" />
                        <span>Custom Case</span>
                      </button>
                    </div>

                    {/* Standard Case Details */}
                    {selectedCaseIdx !== 999 && activeProblem.testCases[selectedCaseIdx] && (
                      <div className="space-y-2 rounded-xl bg-[#182022] border border-[#2B3538] p-3">
                        <div>
                          <span className="text-[#9AA5A6] block text-[11px] mb-1 font-semibold uppercase">
                            Input Arguments:
                          </span>
                          <div className="p-2 rounded bg-[#101314] text-white">
                            {JSON.stringify(activeProblem.testCases[selectedCaseIdx].input)}
                          </div>
                        </div>
                        <div>
                          <span className="text-[#9AA5A6] block text-[11px] mb-1 font-semibold uppercase">
                            Expected Output:
                          </span>
                          <div className="p-2 rounded bg-[#101314] text-[#B5FF4A]">
                            {JSON.stringify(activeProblem.testCases[selectedCaseIdx].expected)}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Custom Input Editor */}
                    {selectedCaseIdx === 999 && (
                      <div className="space-y-2 rounded-xl bg-[#182022] border border-[#2B3538] p-3">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-[#FFAD42] font-semibold uppercase">
                            Custom Test Input (JSON array of arguments):
                          </span>
                          <button
                            onClick={() => setCustomInputText('')}
                            className="text-[#9AA5A6] hover:text-white text-[10px]"
                          >
                            Clear
                          </button>
                        </div>
                        <textarea
                          rows={3}
                          value={customInputText}
                          onChange={(e) => setCustomInputText(e.target.value)}
                          placeholder='e.g. [[2, 7, 11, 15], 9]'
                          className="w-full bg-[#101314] border border-[#2B3538] text-xs font-mono text-white p-2 rounded focus:outline-none focus:border-[#FFAD42]"
                        />
                        <p className="text-[10px] text-[#9AA5A6]">
                          Tip: Provide arguments formatted as a JSON array matching the function parameters.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Test Result Tab */}
                {activeConsoleTab === 'result' && (
                  <div className="space-y-3">
                    {execReport ? (
                      <>
                        {/* Status Header Banner */}
                        <div className={`p-3 rounded-xl border flex items-center justify-between gap-4 ${
                          execReport.statusLabel === 'Accepted'
                            ? 'bg-[#B5FF4A]/10 border-[#B5FF4A]/30 text-[#B5FF4A]'
                            : execReport.statusLabel === 'Wrong Answer'
                            ? 'bg-[#FF5C67]/10 border-[#FF5C67]/30 text-[#FF5C67]'
                            : 'bg-[#FFAD42]/10 border-[#FFAD42]/30 text-[#FFAD42]'
                        }`}>
                          <div className="flex items-center gap-2">
                            {execReport.statusLabel === 'Accepted' ? (
                              <CheckCircle2 className="w-5 h-5 text-[#B5FF4A]" />
                            ) : (
                              <XCircle className="w-5 h-5 text-[#FF5C67]" />
                            )}
                            <div>
                              <div className="font-bold text-sm tracking-wide">
                                {execReport.statusLabel}
                              </div>
                              <div className="text-[10px] text-[#9AA5A6]">
                                Passed {execReport.totalPassed} / {execReport.totalTests} test cases
                              </div>
                            </div>
                          </div>

                          <div className="text-right text-[11px] font-mono">
                            <span className="text-white font-semibold">
                              Runtime: {execReport.totalTimeMs} ms
                            </span>
                            <span className="block text-[9px] text-[#9AA5A6]">
                              {execReport.executionEnvironment}
                            </span>
                          </div>
                        </div>

                        {/* Compilation Error Output */}
                        {execReport.compileError && (
                          <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/30 text-red-300 space-y-1">
                            <span className="font-bold text-xs">Error Details:</span>
                            <pre className="text-xs whitespace-pre-wrap">{execReport.compileError}</pre>
                          </div>
                        )}

                        {/* Test Case Inspection Cards */}
                        <div className="space-y-2">
                          {execReport.results.map((res, i) => (
                            <div
                              key={i}
                              className={`p-3 rounded-xl border text-xs font-mono space-y-1.5 ${
                                res.passed
                                  ? 'bg-[#182022] border-[#2B3538]'
                                  : 'bg-[#1F1819] border-red-500/30'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-white">
                                  Case {res.index} {res.isCustom && '(Custom)'}
                                </span>
                                <span className={`font-semibold ${res.passed ? 'text-[#B5FF4A]' : 'text-[#FF5C67]'}`}>
                                  {res.passed ? 'Passed ✓' : 'Failed ✗'}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                                <div>
                                  <span className="text-[#9AA5A6] block">Expected:</span>
                                  <div className="p-1.5 rounded bg-[#101314] text-[#B5FF4A]">
                                    {JSON.stringify(res.expected)}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-[#9AA5A6] block">Your Output:</span>
                                  <div className={`p-1.5 rounded bg-[#101314] ${res.passed ? 'text-white' : 'text-[#FF5C67]'}`}>
                                    {res.error ? `Error: ${res.error}` : JSON.stringify(res.actual)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="p-8 text-center text-xs text-[#9AA5A6] space-y-1">
                        <Terminal className="w-6 h-6 mx-auto text-[#667275]" />
                        <p>Click "Run" or "Submit" to execute code against test cases.</p>
                        <p className="text-[10px] text-[#667275]">Keyboard shortcut: ⌘↵ (Run) / ⇧⌘↵ (Submit)</p>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Stdout Tab */}
                {activeConsoleTab === 'console' && (
                  <div className="space-y-2">
                    <span className="text-[#9AA5A6] text-[11px] block">Captured Standard Output (console.log):</span>
                    {execReport && execReport.results.some(r => r.logs && r.logs.length > 0) ? (
                      execReport.results.map((r, idx) => (
                        r.logs && r.logs.length > 0 ? (
                          <div key={idx} className="p-2 rounded bg-[#101314] border border-[#253033] space-y-1">
                            <span className="text-[10px] text-[#FFAD42]">Case {r.index}:</span>
                            <pre className="text-xs text-[#CBD5E1] whitespace-pre-wrap">{r.logs.join('\n')}</pre>
                          </div>
                        ) : null
                      ))
                    ) : (
                      <div className="p-6 text-center text-xs text-[#667275]">
                        No console output logged. Add <code>console.log(...)</code> in your code to inspect variables.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

