import React, { useState, useMemo, useCallback } from 'react';
import { 
  FileSpreadsheet, 
  Search, 
  Filter, 
  CheckCircle2, 
  CircleDot, 
  ArrowRight, 
  ArrowLeft, 
  Trophy, 
  Flame, 
  Sparkles, 
  Bookmark, 
  BookmarkCheck, 
  Code2, 
  ExternalLink, 
  Building2, 
  BarChart3, 
  ChevronRight, 
  Clock, 
  Layers, 
  Check, 
  Activity, 
  TrendingUp, 
  ShieldCheck,
  Zap,
  ListOrdered
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DSA_SHEETS } from '../data/dsaSheets';
import { COMPANY_SHEETS } from '../data/companySheets';
import { DsaSheetDef, DsaSheetItem, CompanySheetDef, SheetId } from '../types';
import { sound } from '../utils/sound';

export const DsaSheetsPage: React.FC = () => {
  const { 
    user, 
    openProblemInArena, 
    bookmarkedProblemIds, 
    toggleBookmarkProblem, 
    toggleMarkProblemSolved 
  } = useApp();

  // Top Category Tabs: 'curated' | 'companies' | 'analytics'
  const [activeCategory, setActiveCategory] = useState<'curated' | 'companies' | 'analytics'>('curated');

  // Active Selected Sheet View: null = Dashboard overview, or Sheet object
  const [selectedSheet, setSelectedSheet] = useState<DsaSheetDef | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<CompanySheetDef | null>(null);

  // Sheet Question Table Filters
  const [questionSearch, setQuestionSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const [topicFilter, setTopicFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Solved' | 'Todo'>('All');
  const [companyFreqFilter, setCompanyFreqFilter] = useState<'All' | 'Very High' | 'High'>('All');

  // Compute solved status dynamically across all sheets
  const solvedSet = useMemo(() => new Set(user.problemsSolved), [user.problemsSolved]);

  // Overall statistics
  const totalUniqueProblemsInSheets = useMemo(() => {
    const set = new Set<string>();
    DSA_SHEETS.forEach(s => s.questions.forEach(q => set.add(q.id)));
    return set.size;
  }, []);

  const totalSolvedCount = user.problemsSolved.length;
  const overallPercentage = Math.min(100, Math.round((totalSolvedCount / Math.max(1, totalUniqueProblemsInSheets)) * 100));

  // Compute stats for a specific curated sheet
  const getSheetStats = useCallback((sheet: DsaSheetDef) => {
    const total = sheet.totalQuestions;
    const solved = sheet.questions.filter(q => solvedSet.has(q.id)).length;
    const percent = Math.min(100, Math.round((solved / total) * 100));
    return { solved, total, percent };
  }, [solvedSet]);

  // Compute stats for a company sheet
  const getCompanyStats = useCallback((comp: CompanySheetDef) => {
    const total = comp.questionsCount;
    const solved = comp.questions.filter(q => solvedSet.has(q.id)).length;
    const percent = Math.min(100, Math.round((solved / total) * 100));
    return { solved, total, percent };
  }, [solvedSet]);

  // Filtered Questions for Active Selected Curated Sheet
  const filteredSheetQuestions = useMemo(() => {
    if (!selectedSheet) return [];
    return selectedSheet.questions.filter(q => {
      if (questionSearch.trim()) {
        const query = questionSearch.toLowerCase().trim();
        const matchesTitle = q.title.toLowerCase().includes(query);
        const matchesTopic = q.topic.toLowerCase().includes(query);
        const matchesNum = String(q.sheetProblemNumber).includes(query);
        if (!matchesTitle && !matchesTopic && !matchesNum) return false;
      }
      if (difficultyFilter !== 'All' && q.difficulty !== difficultyFilter) return false;
      if (topicFilter !== 'All' && !q.topic.toLowerCase().includes(topicFilter.toLowerCase())) return false;
      const isSolved = solvedSet.has(q.id);
      if (statusFilter === 'Solved' && !isSolved) return false;
      if (statusFilter === 'Todo' && isSolved) return false;
      return true;
    });
  }, [selectedSheet, questionSearch, difficultyFilter, topicFilter, statusFilter, solvedSet]);

  // Filtered Questions for Active Selected Company Sheet
  const filteredCompanyQuestions = useMemo(() => {
    if (!selectedCompany) return [];
    return selectedCompany.questions.filter(q => {
      if (questionSearch.trim()) {
        const query = questionSearch.toLowerCase().trim();
        const matchesTitle = q.title.toLowerCase().includes(query);
        const matchesTopic = q.topic.toLowerCase().includes(query);
        if (!matchesTitle && !matchesTopic) return false;
      }
      if (difficultyFilter !== 'All' && q.difficulty !== difficultyFilter) return false;
      if (topicFilter !== 'All' && !q.topic.toLowerCase().includes(topicFilter.toLowerCase())) return false;
      if (companyFreqFilter !== 'All' && q.frequency !== companyFreqFilter) return false;
      const isSolved = solvedSet.has(q.id);
      if (statusFilter === 'Solved' && !isSolved) return false;
      if (statusFilter === 'Todo' && isSolved) return false;
      return true;
    });
  }, [selectedCompany, questionSearch, difficultyFilter, topicFilter, companyFreqFilter, statusFilter, solvedSet]);

  // Next unsolved question finder
  const nextUnsolvedQuestion = useMemo(() => {
    if (!selectedSheet) return null;
    return selectedSheet.questions.find(q => !solvedSet.has(q.id)) || selectedSheet.questions[0];
  }, [selectedSheet, solvedSet]);

  // Topic mastery calculation for analytics
  const topicMasteryList = useMemo(() => {
    const topicMap: Record<string, { total: number; solved: number }> = {};
    DSA_SHEETS.forEach(s => {
      s.questions.forEach(q => {
        if (!topicMap[q.topic]) topicMap[q.topic] = { total: 0, solved: 0 };
        topicMap[q.topic].total++;
        if (solvedSet.has(q.id)) topicMap[q.topic].solved++;
      });
    });
    return Object.entries(topicMap)
      .map(([topic, data]) => ({
        topic,
        solved: data.solved,
        total: data.total,
        percentage: Math.min(100, Math.round((data.solved / Math.max(1, data.total)) * 100))
      }))
      .sort((a, b) => b.percentage - a.percentage);
  }, [solvedSet]);

  // Reset filters helper
  const handleResetFilters = () => {
    setQuestionSearch('');
    setDifficultyFilter('All');
    setTopicFilter('All');
    setStatusFilter('All');
    setCompanyFreqFilter('All');
  };

  return (
    <div className="page-container py-6 sm:py-8 space-y-8 animate-in fade-in max-w-7xl mx-auto font-sans">
      
      {/* ============================================================== */}
      {/* 1. TOP HEADER & OVERALL PROGRESS TELEMETRY                      */}
      {/* ============================================================== */}
      <div className="rounded-2xl bg-[#141A1C] border border-[#253033] p-6 sm:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#FFAD42]/10 border border-[#FFAD42]/30 text-[#FFAD42] text-xs font-mono font-medium">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>CURATED CODING INTERVIEW ROADMAPS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              DSA Sheets & Problem Collections
            </h1>
            <p className="text-xs sm:text-sm text-[#9AA5A6] max-w-2xl leading-relaxed">
              Master algorithm patterns with battle-tested interview collections: Blind 75, NeetCode 150, Striver A2Z, and verified company interview questions. Click Solve to code directly in DEVARENA's Code Arena.
            </p>
          </div>

          {/* Progress Snapshot Card */}
          <div className="flex items-center gap-4 bg-[#101314] px-5 py-4 rounded-xl border border-[#253033] shrink-0 font-mono">
            <div>
              <div className="text-[10px] text-[#64748B] uppercase">Solved Overall</div>
              <div className="text-xl font-bold text-[#FFAD42]">
                {totalSolvedCount} <span className="text-xs text-[#9AA5A6] font-normal">/ {totalUniqueProblemsInSheets}</span>
              </div>
            </div>
            <div className="h-8 w-px bg-[#253033]" />
            <div>
              <div className="text-[10px] text-[#64748B] uppercase">Completion</div>
              <div className="text-xl font-bold text-[#B5FF4A]">{overallPercentage}%</div>
            </div>
            <div className="h-8 w-px bg-[#253033]" />
            <div>
              <div className="text-[10px] text-[#64748B] uppercase">Daily Streak</div>
              <div className="text-xl font-bold text-[#00E5FF] flex items-center gap-1">
                <Flame className="w-4 h-4 text-[#FFAD42] fill-[#FFAD42]" />
                <span>{user.streak}d</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Switcher Tabs */}
        {!selectedSheet && !selectedCompany && (
          <div className="flex items-center gap-1 pt-2 border-t border-[#253033] overflow-x-auto text-xs font-medium">
            <button
              onClick={() => {
                sound.playClick();
                setActiveCategory('curated');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeCategory === 'curated'
                  ? 'bg-[#1C2426] text-white border border-[#3E4C50] font-semibold shadow-subtle'
                  : 'text-[#9AA5A6] hover:text-white hover:bg-[#182022]'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-[#FFAD42]" />
              <span>Curated Industry Sheets</span>
              <span className="px-1.5 py-0.2 rounded-full bg-[#252D30] text-[10px] text-[#9AA5A6]">
                {DSA_SHEETS.length}
              </span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setActiveCategory('companies');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeCategory === 'companies'
                  ? 'bg-[#1C2426] text-white border border-[#3E4C50] font-semibold shadow-subtle'
                  : 'text-[#9AA5A6] hover:text-white hover:bg-[#182022]'
              }`}
            >
              <Building2 className="w-4 h-4 text-[#00E5FF]" />
              <span>Company-Wise Question Sets</span>
              <span className="px-1.5 py-0.2 rounded-full bg-[#252D30] text-[10px] text-[#9AA5A6]">
                {COMPANY_SHEETS.length}
              </span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setActiveCategory('analytics');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeCategory === 'analytics'
                  ? 'bg-[#1C2426] text-white border border-[#3E4C50] font-semibold shadow-subtle'
                  : 'text-[#9AA5A6] hover:text-white hover:bg-[#182022]'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-[#B5FF4A]" />
              <span>My DSA Progress & Analytics</span>
            </button>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 2. VIEW A: CURATED SHEETS DASHBOARD                            */}
      {/* ============================================================== */}
      {activeCategory === 'curated' && !selectedSheet && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FFAD42]" />
                <span>Featured Interview Preparation Roadmaps</span>
              </h2>
              <p className="text-xs text-[#9AA5A6]">
                Select any sheet to view structured problems, track personal progress, and practice directly.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {DSA_SHEETS.map((sheet) => {
              const stats = getSheetStats(sheet);
              const isComplete = stats.percent === 100;

              return (
                <div
                  key={sheet.id}
                  onClick={() => {
                    sound.playClick();
                    setSelectedSheet(sheet);
                    handleResetFilters();
                  }}
                  className="rounded-2xl bg-[#141A1C] border border-[#253033] hover:border-[#FFAD42]/50 hover:bg-[#182022] p-5 flex flex-col justify-between cursor-pointer transition-all space-y-4 group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-medium text-[#FFAD42] px-2 py-0.5 rounded bg-[#FFAD42]/10 border border-[#FFAD42]/20">
                        {sheet.totalQuestions} Questions
                      </span>
                      {sheet.estimatedHours && (
                        <span className="text-[10px] text-[#64748B] font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{sheet.estimatedHours}</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-[#FFAD42] transition-colors flex items-center gap-2">
                      <span>{sheet.name}</span>
                      {isComplete && <CheckCircle2 className="w-4 h-4 text-[#B5FF4A]" />}
                    </h3>

                    <p className="text-xs text-[#9AA5A6] line-clamp-2 leading-relaxed">
                      {sheet.shortDescription}
                    </p>
                  </div>

                  {/* Progress Meter */}
                  <div className="space-y-3 pt-2 border-t border-[#253033]">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-[#9AA5A6]">Solved</span>
                        <span className="text-white font-bold">{stats.solved} / {stats.total} ({stats.percent}%)</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-[#101314] overflow-hidden">
                        <div
                          style={{ width: `${stats.percent}%` }}
                          className={`h-full rounded-full transition-all duration-500 ${
                            isComplete ? 'bg-[#B5FF4A]' : 'bg-[#FFAD42]'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Difficulty Pills Breakdown */}
                    <div className="flex items-center gap-2 text-[10px] font-mono text-[#9AA5A6]">
                      <span className="text-[#B5FF4A]">Easy: {sheet.difficultyBreakdown.easy}</span>
                      <span>•</span>
                      <span className="text-[#FFAD42]">Med: {sheet.difficultyBreakdown.medium}</span>
                      <span>•</span>
                      <span className="text-[#FF5C67]">Hard: {sheet.difficultyBreakdown.hard}</span>
                    </div>

                    <div className="pt-1 flex items-center justify-between text-xs font-semibold text-[#FFAD42] group-hover:translate-x-1 transition-transform">
                      <span>{stats.solved > 0 ? 'Continue Sheet' : 'Start Learning'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. VIEW B: COMPANY-WISE INTERVIEW SETS                         */}
      {/* ============================================================== */}
      {activeCategory === 'companies' && !selectedCompany && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#00E5FF]" />
                <span>Target Tech Giant Question Collections</span>
              </h2>
              <p className="text-xs text-[#9AA5A6]">
                Curated question collections frequently reported in interviews at leading tech companies.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {COMPANY_SHEETS.map((comp) => {
              const stats = getCompanyStats(comp);

              return (
                <div
                  key={comp.id}
                  onClick={() => {
                    sound.playClick();
                    setSelectedCompany(comp);
                    handleResetFilters();
                  }}
                  className="rounded-2xl bg-[#141A1C] border border-[#253033] hover:border-[#00E5FF]/50 hover:bg-[#182022] p-5 flex flex-col justify-between cursor-pointer transition-all space-y-4 group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-lg bg-[#101314] border border-[#253033] flex items-center justify-center font-bold text-sm text-white font-mono">
                        {comp.logoText}
                      </div>
                      <span className="text-[11px] font-mono text-[#00E5FF] px-2 py-0.5 rounded bg-[#00E5FF]/10 border border-[#00E5FF]/20">
                        {comp.questionsCount} Questions
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-[#00E5FF] transition-colors">
                      {comp.name}
                    </h3>

                    <p className="text-xs text-[#9AA5A6] line-clamp-2 leading-relaxed">
                      {comp.description}
                    </p>
                  </div>

                  {/* Top Topics Tags */}
                  <div className="flex flex-wrap gap-1 text-[10px]">
                    {comp.topTopics.slice(0, 3).map(t => (
                      <span key={t} className="px-1.5 py-0.5 rounded bg-[#101314] text-[#9AA5A6]">
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2 pt-2 border-t border-[#253033]">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[#9AA5A6]">Solved</span>
                      <span className="text-white font-bold">{stats.solved} / {stats.total} ({stats.percent}%)</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-[#101314] overflow-hidden">
                      <div
                        style={{ width: `${stats.percent}%` }}
                        className="h-full rounded-full bg-[#00E5FF] transition-all duration-500"
                      />
                    </div>

                    <div className="pt-1 flex items-center justify-between text-xs font-semibold text-[#00E5FF] group-hover:translate-x-1 transition-transform">
                      <span>Practice {comp.name} Questions</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. VIEW C: PERSONAL PROGRESS DASHBOARD & ANALYTICS             */}
      {/* ============================================================== */}
      {activeCategory === 'analytics' && (
        <div className="space-y-6">
          {/* Top 3 Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#141A1C] border border-[#253033] space-y-1">
              <span className="text-[11px] font-mono text-[#9AA5A6] uppercase">Total Solved</span>
              <div className="text-3xl font-extrabold text-[#FFAD42]">{totalSolvedCount}</div>
              <p className="text-[11px] text-[#64748B]">Across all curated sheets</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#141A1C] border border-[#253033] space-y-1">
              <span className="text-[11px] font-mono text-[#9AA5A6] uppercase">Active Streak</span>
              <div className="text-3xl font-extrabold text-[#00E5FF] flex items-center gap-1.5">
                <Flame className="w-6 h-6 text-[#FFAD42] fill-[#FFAD42]" />
                <span>{user.streak} Days</span>
              </div>
              <p className="text-[11px] text-[#64748B]">Consecutive daily practice</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#141A1C] border border-[#253033] space-y-1">
              <span className="text-[11px] font-mono text-[#9AA5A6] uppercase">Elo Duel Rating</span>
              <div className="text-3xl font-extrabold text-[#B5FF4A]">{user.rating}</div>
              <p className="text-[11px] text-[#64748B]">{user.battlesWon} wins / {user.battlesTotal} battles</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#141A1C] border border-[#253033] space-y-1">
              <span className="text-[11px] font-mono text-[#9AA5A6] uppercase">Bookmarked</span>
              <div className="text-3xl font-extrabold text-white">{bookmarkedProblemIds.length}</div>
              <p className="text-[11px] text-[#64748B]">Saved for interview revision</p>
            </div>
          </div>

          {/* Topic-Wise Progress Grid */}
          <div className="p-6 rounded-2xl bg-[#141A1C] border border-[#253033] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#253033]">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#FFAD42]" />
                <span>Topic-Wise Mastery Distribution</span>
              </h3>
              <span className="text-xs text-[#9AA5A6] font-mono">
                {topicMasteryList.length} Categories Tracked
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topicMasteryList.map(item => (
                <div key={item.topic} className="p-3.5 rounded-xl bg-[#101314] border border-[#253033] space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-white font-medium">{item.topic}</span>
                    <span className="text-[#FFAD42] font-bold">{item.solved}/{item.total}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[#1C2426] overflow-hidden">
                    <div
                      style={{ width: `${item.percentage}%` }}
                      className="h-full rounded-full bg-[#FFAD42] transition-all duration-500"
                    />
                  </div>
                  <div className="text-[10px] text-[#64748B] text-right font-mono">
                    {item.percentage}% Complete
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. INDIVIDUAL SHEET TABLE VIEW (CURATED)                       */}
      {/* ============================================================== */}
      {selectedSheet && (
        <div className="space-y-6">
          
          {/* Back button & Breadcrumb */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedSheet(null)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141A1C] hover:bg-[#1C2426] border border-[#253033] text-xs font-medium text-[#9AA5A6] hover:text-white transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#FFAD42]" />
              <span>Back to All Curated Sheets</span>
            </button>

            <div className="text-xs font-mono text-[#9AA5A6] hidden sm:block">
              {selectedSheet.name} • {selectedSheet.totalQuestions} Questions
            </div>
          </div>

          {/* Sheet Header Banner */}
          <div className="rounded-2xl bg-[#141A1C] border border-[#253033] p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-[#FFAD42]/10 text-[#FFAD42] text-xs font-mono font-medium">
                {selectedSheet.category.toUpperCase()} SHEET
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">{selectedSheet.name}</h2>
              <p className="text-xs text-[#9AA5A6] max-w-xl">{selectedSheet.shortDescription}</p>
            </div>

            {/* Quick Action: Continue Last Unsolved */}
            {nextUnsolvedQuestion && (
              <button
                onClick={() => openProblemInArena(nextUnsolvedQuestion.id)}
                className="px-4 py-2.5 rounded-xl bg-[#FFAD42] hover:bg-[#E59830] text-[#101314] font-bold text-xs flex items-center gap-2 shadow-subtle shrink-0"
              >
                <Code2 className="w-4 h-4" />
                <span>Continue: {nextUnsolvedQuestion.title}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Bar */}
          <div className="p-4 rounded-xl bg-[#141A1C] border border-[#253033] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-[#667275] absolute left-3 top-2.5" />
              <input
                type="text"
                value={questionSearch}
                onChange={(e) => setQuestionSearch(e.target.value)}
                placeholder="Search questions in this sheet..."
                className="w-full bg-[#101314] border border-[#253033] focus:border-[#FFAD42] text-xs text-white pl-9 pr-3 py-1.5 rounded-lg focus:outline-none placeholder-[#667275]"
              />
            </div>

            {/* Difficulty Filter */}
            <div className="flex items-center gap-1 bg-[#101314] p-1 rounded-lg border border-[#253033] text-[11px]">
              {(['All', 'Easy', 'Medium', 'Hard'] as const).map(d => (
                <button
                  key={d}
                  onClick={() => setDifficultyFilter(d)}
                  className={`px-2.5 py-1 rounded transition-all ${
                    difficultyFilter === d ? 'bg-[#1C2426] text-white font-semibold' : 'text-[#9AA5A6]'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            {/* Topic Filter */}
            <select
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value)}
              className="bg-[#101314] border border-[#253033] text-xs text-[#9AA5A6] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#FFAD42]"
            >
              <option value="All">All Topics</option>
              {selectedSheet.topicsCovered.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-[#101314] border border-[#253033] text-xs text-[#9AA5A6] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#FFAD42]"
            >
              <option value="All">All Status</option>
              <option value="Solved">Solved</option>
              <option value="Todo">Todo</option>
            </select>
          </div>

          {/* Structured Question Table */}
          <div className="rounded-2xl bg-[#141A1C] border border-[#253033] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#101314] border-b border-[#253033] text-[#9AA5A6] uppercase text-[10px] tracking-wider font-mono">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">Status</th>
                    <th className="py-3 px-3 w-14">#</th>
                    <th className="py-3 px-4">Problem</th>
                    <th className="py-3 px-4 w-28">Difficulty</th>
                    <th className="py-3 px-4">Topic</th>
                    <th className="py-3 px-4 w-28 text-center">Practice</th>
                    <th className="py-3 px-3 w-16 text-center">Ref</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#253033]">
                  {filteredSheetQuestions.map((q) => {
                    const isSolved = solvedSet.has(q.id);
                    const isBookmarked = bookmarkedProblemIds.includes(q.id);

                    return (
                      <tr key={q.id} className="hover:bg-[#182022] transition-colors group">
                        
                        {/* Status Checkbox */}
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => toggleMarkProblemSolved(q.id)}
                            className="p-1 hover:opacity-80 transition-opacity"
                            title={isSolved ? "Mark as Todo" : "Mark as Solved"}
                          >
                            {isSolved ? (
                              <CheckCircle2 className="w-4 h-4 text-[#B5FF4A]" />
                            ) : (
                              <span className="w-4 h-4 rounded-full border border-[#3E4C50] inline-block hover:border-[#FFAD42]" />
                            )}
                          </button>
                        </td>

                        {/* Sheet Problem Number */}
                        <td className="py-3 px-3 font-mono text-[#64748B]">
                          #{q.sheetProblemNumber}
                        </td>

                        {/* Title & Bookmark */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleBookmarkProblem(q.id)}
                              className="text-[#64748B] hover:text-[#FFAD42]"
                              title={isBookmarked ? "Remove Bookmark" : "Bookmark Question"}
                            >
                              {isBookmarked ? (
                                <BookmarkCheck className="w-3.5 h-3.5 text-[#FFAD42]" />
                              ) : (
                                <Bookmark className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <span 
                              onClick={() => openProblemInArena(q.id)}
                              className="font-medium text-white hover:text-[#FFAD42] cursor-pointer transition-colors"
                            >
                              {q.title}
                            </span>
                          </div>
                        </td>

                        {/* Difficulty Badge */}
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                            q.difficulty === 'Easy'
                              ? 'bg-[#B5FF4A]/10 text-[#B5FF4A] border-[#B5FF4A]/30'
                              : q.difficulty === 'Medium'
                              ? 'bg-[#FFAD42]/10 text-[#FFAD42] border-[#FFAD42]/30'
                              : 'bg-[#FF5C67]/10 text-[#FF5C67] border-[#FF5C67]/30'
                          }`}>
                            {q.difficulty}
                          </span>
                        </td>

                        {/* Topic */}
                        <td className="py-3 px-4 text-[#9AA5A6] font-mono text-[11px]">
                          {q.topic}
                        </td>

                        {/* Solve Button -> Opens Code Arena */}
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => openProblemInArena(q.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#1C2426] hover:bg-[#FFAD42] text-[#FFAD42] hover:text-[#101314] border border-[#2B3538] hover:border-[#FFAD42] font-semibold text-xs transition-all shadow-subtle"
                          >
                            <Code2 className="w-3.5 h-3.5" />
                            <span>Solve</span>
                          </button>
                        </td>

                        {/* External Reference */}
                        <td className="py-3 px-3 text-center">
                          {q.externalLink && (
                            <a
                              href={q.externalLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#64748B] hover:text-[#00E5FF] p-1 inline-block transition-colors"
                              title="View LeetCode reference"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredSheetQuestions.length === 0 && (
              <div className="p-8 text-center text-xs text-[#9AA5A6] space-y-2">
                <p>No questions matched your filter criteria.</p>
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-[#FFAD42] hover:underline"
                >
                  Reset filters
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. INDIVIDUAL COMPANY SHEET TABLE VIEW                          */}
      {/* ============================================================== */}
      {selectedCompany && (
        <div className="space-y-6">
          
          {/* Back button */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedCompany(null)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141A1C] hover:bg-[#1C2426] border border-[#253033] text-xs font-medium text-[#9AA5A6] hover:text-white transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span>Back to All Company Collections</span>
            </button>

            <div className="text-xs font-mono text-[#9AA5A6]">
              {selectedCompany.name} • {selectedCompany.questionsCount} Interview Questions
            </div>
          </div>

          {/* Company Header */}
          <div className="rounded-2xl bg-[#141A1C] border border-[#253033] p-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#101314] border border-[#253033] flex items-center justify-center font-bold text-base text-white font-mono">
                {selectedCompany.logoText}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">{selectedCompany.name}</h2>
                <div className="text-xs text-[#9AA5A6] flex items-center gap-2 mt-0.5">
                  <span>Verified Interview Questions</span>
                  <span>•</span>
                  <span className="text-[#00E5FF] font-mono">{selectedCompany.questionsCount} Problems</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-[#CBD5E1] leading-relaxed max-w-2xl">{selectedCompany.description}</p>
          </div>

          {/* Company Question Table */}
          <div className="rounded-2xl bg-[#141A1C] border border-[#253033] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#101314] border-b border-[#253033] text-[#9AA5A6] uppercase text-[10px] tracking-wider font-mono">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">Status</th>
                    <th className="py-3 px-4">Problem</th>
                    <th className="py-3 px-4 w-28">Difficulty</th>
                    <th className="py-3 px-4">Topic</th>
                    <th className="py-3 px-4 w-28 text-center">Frequency</th>
                    <th className="py-3 px-4 w-28 text-center">Source</th>
                    <th className="py-3 px-4 w-24 text-center">Practice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#253033]">
                  {filteredCompanyQuestions.map((q) => {
                    const isSolved = solvedSet.has(q.id);

                    return (
                      <tr key={q.id} className="hover:bg-[#182022] transition-colors">
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => toggleMarkProblemSolved(q.id)}
                            className="p-1 hover:opacity-80 transition-opacity"
                            title={isSolved ? "Mark as Todo" : "Mark as Solved"}
                          >
                            {isSolved ? (
                              <CheckCircle2 className="w-4 h-4 text-[#B5FF4A]" />
                            ) : (
                              <span className="w-4 h-4 rounded-full border border-[#3E4C50] inline-block hover:border-[#00E5FF]" />
                            )}
                          </button>
                        </td>

                        <td className="py-3 px-4 font-medium text-white">
                          <span 
                            onClick={() => openProblemInArena(q.id)}
                            className="hover:text-[#00E5FF] cursor-pointer transition-colors"
                          >
                            {q.title}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                            q.difficulty === 'Easy'
                              ? 'bg-[#B5FF4A]/10 text-[#B5FF4A] border-[#B5FF4A]/30'
                              : q.difficulty === 'Medium'
                              ? 'bg-[#FFAD42]/10 text-[#FFAD42] border-[#FFAD42]/30'
                              : 'bg-[#FF5C67]/10 text-[#FF5C67] border-[#FF5C67]/30'
                          }`}>
                            {q.difficulty}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-[#9AA5A6] font-mono text-[11px]">
                          {q.topic}
                        </td>

                        {/* Frequency */}
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                            q.frequency === 'Very High'
                              ? 'text-[#FFAD42] bg-[#FFAD42]/10 font-bold'
                              : 'text-[#9AA5A6] bg-[#101314]'
                          }`}>
                            {q.frequency}
                          </span>
                        </td>

                        {/* Source Tag */}
                        <td className="py-3 px-4 text-center text-[10px] font-mono text-[#64748B]">
                          {q.isVerifiedHistorical ? 'Verified Historical' : 'Community'}
                        </td>

                        {/* Practice Button */}
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => openProblemInArena(q.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#1C2426] hover:bg-[#00E5FF] text-[#00E5FF] hover:text-[#101314] border border-[#2B3538] hover:border-[#00E5FF] font-semibold text-xs transition-all shadow-subtle"
                          >
                            <Code2 className="w-3.5 h-3.5" />
                            <span>Solve</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
