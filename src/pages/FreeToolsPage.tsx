import React, { useState, useEffect, useMemo } from 'react';
import { 
  Wrench, 
  Search, 
  Sparkles, 
  ArrowLeft, 
  Zap, 
  BarChart3, 
  TrendingUp, 
  Workflow, 
  FileJson, 
  Regex, 
  Play, 
  Database, 
  Table, 
  Clock, 
  Binary, 
  Link as LinkIcon, 
  ShieldCheck, 
  Palette, 
  ExternalLink, 
  ChevronRight,
  Code2,
  GitBranch,
  Filter,
  History
} from 'lucide-react';
import { 
  DEVELOPER_TOOLS, 
  TOOL_CATEGORIES, 
  getToolById, 
  getRelatedTools 
} from '../data/toolsRegistry';
import { DeveloperToolMeta, ToolCategory } from '../types/tools';
import { sound } from '../utils/sound';

// Tool Components
import { SortingVisualizer } from '../components/tools/dsa/SortingVisualizer';
import { BinarySearchVisualizer } from '../components/tools/dsa/BinarySearchVisualizer';
import { BigOAnalyzer } from '../components/tools/dsa/BigOAnalyzer';
import { DsaPatternVisualizer } from '../components/tools/dsa/DsaPatternVisualizer';
import { JsonFormatter } from '../components/tools/utilities/JsonFormatter';
import { RegexTester } from '../components/tools/utilities/RegexTester';
import { JsPlayground } from '../components/tools/utilities/JsPlayground';
import { SqlPlayground } from '../components/tools/data/SqlPlayground';
import { CsvViewer } from '../components/tools/data/CsvViewer';
import { TimestampConverter } from '../components/tools/productivity/TimestampConverter';
import { Base64Converter } from '../components/tools/productivity/Base64Converter';
import { UrlConverter } from '../components/tools/productivity/UrlConverter';
import { HashGenerator } from '../components/tools/productivity/HashGenerator';
import { ColorConverter } from '../components/tools/productivity/ColorConverter';

export const FreeToolsPage: React.FC = () => {
  const [selectedToolId, setSelectedToolId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<ToolCategory | 'all'>('all');
  const [recentToolIds, setRecentToolIds] = useState<string[]>([]);

  // Read URL query parameter ?tool=<id> on mount & handle popstate
  useEffect(() => {
    const parseUrlTool = () => {
      const params = new URLSearchParams(window.location.search);
      const toolParam = params.get('tool');
      if (toolParam && getToolById(toolParam)) {
        setSelectedToolId(toolParam);
      } else {
        setSelectedToolId(null);
      }
    };

    parseUrlTool();
    window.addEventListener('popstate', parseUrlTool);

    // Read recent tools from localStorage
    try {
      const stored = localStorage.getItem('devarena_recent_tools');
      if (stored) {
        setRecentToolIds(JSON.parse(stored));
      }
    } catch {
      // ignore
    }

    return () => {
      window.removeEventListener('popstate', parseUrlTool);
    };
  }, []);

  const openTool = (toolId: string) => {
    sound.click();
    setSelectedToolId(toolId);
    window.history.pushState({}, '', `/app/tools?tool=${toolId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Update recent tools
    setRecentToolIds(prev => {
      const next = [toolId, ...prev.filter(id => id !== toolId)].slice(0, 4);
      try {
        localStorage.setItem('devarena_recent_tools', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const closeTool = () => {
    sound.click();
    setSelectedToolId(null);
    window.history.pushState({}, '', '/app/tools');
  };

  // Filtered tools
  const filteredTools = useMemo(() => {
    let list = DEVELOPER_TOOLS;

    if (activeCategory !== 'all') {
      list = list.filter(t => t.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(t => 
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some(tag => tag.toLowerCase().includes(q))
      );
    }

    return list;
  }, [activeCategory, searchQuery]);

  // Dynamic Lucide Icon Mapper
  const renderToolIcon = (iconName: string, className: string = 'w-5 h-5') => {
    switch (iconName) {
      case 'BarChart3': return <BarChart3 className={className} />;
      case 'Search': return <Search className={className} />;
      case 'TrendingUp': return <TrendingUp className={className} />;
      case 'Workflow': return <Workflow className={className} />;
      case 'FileJson': return <FileJson className={className} />;
      case 'Regex': return <Regex className={className} />;
      case 'Play': return <Play className={className} />;
      case 'Database': return <Database className={className} />;
      case 'Table': return <Table className={className} />;
      case 'Clock': return <Clock className={className} />;
      case 'Binary': return <Binary className={className} />;
      case 'Link': return <LinkIcon className={className} />;
      case 'ShieldCheck': return <ShieldCheck className={className} />;
      case 'Palette': return <Palette className={className} />;
      case 'GitBranch': return <GitBranch className={className} />;
      case 'Code2': return <Code2 className={className} />;
      case 'Zap': return <Zap className={className} />;
      default: return <Wrench className={className} />;
    }
  };

  // Active Tool Renderer
  const renderActiveToolComponent = (id: string) => {
    switch (id) {
      case 'sorting-visualizer': return <SortingVisualizer />;
      case 'binary-search': return <BinarySearchVisualizer />;
      case 'big-o-analyzer': return <BigOAnalyzer />;
      case 'dsa-patterns': return <DsaPatternVisualizer />;
      case 'json-formatter': return <JsonFormatter />;
      case 'regex-tester': return <RegexTester />;
      case 'js-playground': return <JsPlayground />;
      case 'sql-playground': return <SqlPlayground />;
      case 'csv-viewer': return <CsvViewer />;
      case 'timestamp-converter': return <TimestampConverter />;
      case 'base64-converter': return <Base64Converter />;
      case 'url-converter': return <UrlConverter />;
      case 'hash-generator': return <HashGenerator />;
      case 'color-converter': return <ColorConverter />;
      default: return <div className="text-neutral-400">Tool not found.</div>;
    }
  };

  const activeTool = selectedToolId ? getToolById(selectedToolId) : null;
  const relatedTools = selectedToolId ? getRelatedTools(selectedToolId, 3) : [];

  return (
    <div className="min-h-screen bg-[#101314] text-neutral-200 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* VIEW 1: ACTIVE TOOL RUNNER */}
        {activeTool ? (
          <div className="space-y-6 animate-fadeIn">
            {/* Top Breadcrumb Bar */}
            <div className="flex items-center justify-between">
              <button
                onClick={closeTool}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1C2426] hover:bg-[#252D30] text-neutral-300 hover:text-white text-xs font-mono transition-colors border border-[#252D30]"
              >
                <ArrowLeft className="w-4 h-4 text-[#00E5FF]" />
                Back to All Free Tools
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-neutral-400">
                  {activeTool.categoryName}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
                <span className="text-xs font-mono font-bold text-white">
                  {activeTool.title}
                </span>
              </div>
            </div>

            {/* Tool Interactive Component */}
            {renderActiveToolComponent(activeTool.id)}

            {/* Related Tools Section */}
            <div className="mt-12 pt-8 border-t border-[#252D30] space-y-4">
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FFAD42]" />
                Explore Related Developer Tools
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {relatedTools.map(rt => (
                  <div
                    key={rt.id}
                    onClick={() => openTool(rt.id)}
                    className="bg-[#1C2426] hover:bg-[#252D30] border border-[#252D30] hover:border-[#00E5FF]/40 rounded-xl p-4 cursor-pointer transition-all duration-200 group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 rounded-lg bg-[#101314] text-[#00E5FF] group-hover:scale-105 transition-transform">
                          {renderToolIcon(rt.iconName, 'w-4 h-4')}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white font-mono group-hover:text-[#00E5FF] transition-colors">
                            {rt.title}
                          </h4>
                          <span className="text-[10px] text-neutral-500 font-mono">
                            {rt.categoryName}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-neutral-400 line-clamp-2 mt-1">
                        {rt.tagline}
                      </p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-[#252D30] flex items-center justify-between text-[11px] font-mono text-[#00E5FF]">
                      <span>Launch Tool</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* VIEW 2: MASTER TOOLS HUB LANDING PAGE */
          <div className="space-y-8 animate-fadeIn">
            {/* Hero Header */}
            <div className="bg-[#1C2426] border border-[#252D30] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#00E5FF]/10 via-[#FFAD42]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 max-w-3xl">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20 flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5" /> FREE FOREVER
                  </span>
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-[#B5FF4A]/10 text-[#B5FF4A] border border-[#B5FF4A]/20">
                    ZERO SIGNUP • 100% CLIENT-SIDE
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Free Developer Tools
                </h1>
                <p className="text-sm sm:text-base text-neutral-300 mt-2 leading-relaxed">
                  Powerful tools for developers. Free forever. No signup required. Algorithm visualizers, SQL playground, syntax validators, and productivity utilities that run entirely in your browser.
                </p>

                {/* Search Bar */}
                <div className="mt-6 relative max-w-xl">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search tools (e.g. sorting, regex, sql, base64, big o)..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-[#101314] text-xs sm:text-sm font-mono text-white pl-10 pr-4 py-3 rounded-xl border border-[#252D30] focus:outline-none focus:border-[#00E5FF] transition-all shadow-inner"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white text-xs font-mono"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <button
                onClick={() => {
                  sound.click();
                  setActiveCategory('all');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all border ${
                  activeCategory === 'all'
                    ? 'bg-[#00E5FF] text-black shadow-md shadow-[#00E5FF]/20'
                    : 'bg-[#1C2426] border-[#252D30] text-neutral-400 hover:text-white hover:border-neutral-700'
                }`}
              >
                All Tools ({DEVELOPER_TOOLS.length})
              </button>

              {TOOL_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    sound.click();
                    setActiveCategory(cat.id);
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono transition-all border whitespace-nowrap ${
                    activeCategory === cat.id
                      ? 'bg-[#00E5FF] text-black font-bold shadow-md shadow-[#00E5FF]/20'
                      : 'bg-[#1C2426] border-[#252D30] text-neutral-400 hover:text-white hover:border-neutral-700'
                  }`}
                >
                  {renderToolIcon(cat.iconName, 'w-3.5 h-3.5')}
                  <span>{cat.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    activeCategory === cat.id ? 'bg-black/20 text-black' : 'bg-[#101314] text-neutral-400'
                  }`}>
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Recently Used Tools (if any exist in localStorage) */}
            {recentToolIds.length > 0 && !searchQuery && activeCategory === 'all' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-[#FFAD42]" />
                  <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                    Recently Used Tools
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {recentToolIds
                    .map(id => getToolById(id))
                    .filter((t): t is DeveloperToolMeta => Boolean(t))
                    .map(tool => (
                      <div
                        key={tool.id}
                        onClick={() => openTool(tool.id)}
                        className="bg-[#1C2426] hover:bg-[#252D30] border border-[#252D30] hover:border-[#00E5FF]/40 rounded-xl p-3.5 cursor-pointer transition-all group flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-[#101314] text-[#00E5FF]">
                            {renderToolIcon(tool.iconName, 'w-4 h-4')}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white font-mono group-hover:text-[#00E5FF] transition-colors">
                              {tool.title}
                            </h4>
                            <span className="text-[10px] text-neutral-500 font-mono">
                              {tool.categoryName}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-[#00E5FF] group-hover:translate-x-0.5 transition-all" />
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Master Tools Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-neutral-400">
                  Showing <strong className="text-white">{filteredTools.length}</strong> developer tools
                </span>
              </div>

              {filteredTools.length === 0 ? (
                <div className="bg-[#1C2426] border border-[#252D30] rounded-2xl p-12 text-center space-y-3">
                  <Wrench className="w-8 h-8 text-neutral-600 mx-auto" />
                  <h3 className="text-base font-bold text-white">No tools found</h3>
                  <p className="text-xs text-neutral-400">
                    Try adjusting your search query or switching categories.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setActiveCategory('all');
                    }}
                    className="px-3.5 py-1.5 bg-[#252D30] hover:bg-[#2F383C] text-xs font-mono text-white rounded-lg transition-colors border border-neutral-700"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredTools.map(tool => (
                    <div
                      key={tool.id}
                      onClick={() => openTool(tool.id)}
                      className="bg-[#1C2426] hover:bg-[#252D30] border border-[#252D30] hover:border-[#00E5FF]/40 rounded-2xl p-5 cursor-pointer transition-all duration-200 group flex flex-col justify-between shadow-lg hover:shadow-xl hover:-translate-y-0.5 relative overflow-hidden"
                    >
                      {/* Top Bar with Icon & Badge */}
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="p-3 rounded-xl bg-[#101314] text-[#00E5FF] group-hover:scale-110 transition-transform shadow-inner">
                            {renderToolIcon(tool.iconName, 'w-5 h-5')}
                          </div>

                          <div className="flex items-center gap-1.5">
                            {tool.badge && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FFAD42]/10 text-[#FFAD42] border border-[#FFAD42]/20">
                                {tool.badge}
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#101314] text-neutral-400 border border-[#252D30]">
                              {tool.categoryName}
                            </span>
                          </div>
                        </div>

                        {/* Title & Description */}
                        <h3 className="text-base font-bold text-white font-mono group-hover:text-[#00E5FF] transition-colors">
                          {tool.title}
                        </h3>
                        <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed line-clamp-2">
                          {tool.description}
                        </p>
                      </div>

                      {/* Bottom Footer Action */}
                      <div className="mt-5 pt-4 border-t border-[#252D30] flex items-center justify-between text-xs font-mono">
                        <span className="text-[#00E5FF] font-bold flex items-center gap-1">
                          Open Tool <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </span>
                        <span className="text-[10px] text-neutral-500">
                          Free Forever
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

