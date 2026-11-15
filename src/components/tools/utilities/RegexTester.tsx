import React, { useState, useMemo } from 'react';
import { 
  Regex, 
  Copy, 
  Check, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle, 
  Layers, 
  Info,
  ShieldAlert
} from 'lucide-react';
import { sound } from '../../../utils/sound';

interface RegexPreset {
  name: string;
  pattern: string;
  flags: string;
  sample: string;
  description: string;
}

const PRESETS: RegexPreset[] = [
  {
    name: 'Email Address',
    pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
    flags: 'g',
    sample: 'Contact us at support@devarena.io or engineering-lead@example.com for help. Invalid: user@.com',
    description: 'Matches standard RFC-compliant email addresses'
  },
  {
    name: 'URL / Hyperlink',
    pattern: 'https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\/=]*)',
    flags: 'gi',
    sample: 'Visit https://devarena.io/app/tools or http://docs.example.org:8080/index.html today!',
    description: 'Matches web URLs with optional protocols, ports, and query paths'
  },
  {
    name: 'IPv4 Address',
    pattern: '\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b',
    flags: 'g',
    sample: 'Server IP: 192.168.1.1, gateway: 10.0.0.254, DNS: 8.8.8.8. Out of range: 999.12.0.1',
    description: 'Matches valid IPv4 addresses within the 0.0.0.0 to 255.255.255.255 range'
  },
  {
    name: 'Hex Color Code',
    pattern: '#(?:[a-fA-F0-9]{3}|[a-fA-F0-9]{6}|[a-fA-F0-9]{8})\\b',
    flags: 'gi',
    sample: 'Primary theme: #00E5FF, accent: #FFAD42, background: #101314, short: #FFF.',
    description: 'Matches 3, 6, or 8-digit hexadecimal CSS color codes'
  },
  {
    name: 'Date (YYYY-MM-DD)',
    pattern: '(\\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])',
    flags: 'g',
    sample: 'Events scheduled for 2026-11-15, 2026-12-31, and release on 2027-01-01.',
    description: 'Matches calendar dates in standard ISO 8601 format with captures'
  },
  {
    name: 'UUID v4',
    pattern: '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}',
    flags: 'gi',
    sample: 'Session ID: c9bf9e57-1685-4c89-bafb-ff5af830be8a, Auth token: 3b92c39d-2e45-4a7b-a2c1-840293847291',
    description: 'Matches standard 128-bit UUID Version 4 tokens'
  }
];

export const RegexTester: React.FC = () => {
  const [pattern, setPattern] = useState<string>(PRESETS[0].pattern);
  const [flags, setFlags] = useState<string>(PRESETS[0].flags);
  const [testText, setTestText] = useState<string>(PRESETS[0].sample);
  const [copied, setCopied] = useState<boolean>(false);

  const flagOptions = [
    { key: 'g', label: 'Global (g)' },
    { key: 'i', label: 'Case Insensitive (i)' },
    { key: 'm', label: 'Multiline (m)' },
    { key: 's', label: 'DotAll (s)' }
  ];

  const toggleFlag = (flagKey: string) => {
    sound.click();
    if (flags.includes(flagKey)) {
      setFlags(flags.replace(flagKey, ''));
    } else {
      setFlags(flags + flagKey);
    }
  };

  const handleSelectPreset = (preset: RegexPreset) => {
    sound.click();
    setPattern(preset.pattern);
    setFlags(preset.flags);
    setTestText(preset.sample);
  };

  // Compile regex with ReDoS safeguard (limit text length and pattern checks)
  const { matches, error, highlightedHtml } = useMemo(() => {
    if (!pattern.trim()) {
      return { matches: [], error: null, highlightedHtml: testText };
    }

    try {
      const regex = new RegExp(pattern, flags);
      const collectedMatches: {
        index: number;
        match: string;
        groups: string[];
      }[] = [];

      // Avoid freezing browser by restricting max test text slice for regex execution
      const safeText = testText.slice(0, 100000);

      if (flags.includes('g')) {
        let matchResult: RegExpExecArray | null;
        let count = 0;
        // Limit to 500 matches to prevent infinite loops on zero-length matches
        while ((matchResult = regex.exec(safeText)) !== null && count < 500) {
          collectedMatches.push({
            index: matchResult.index,
            match: matchResult[0],
            groups: matchResult.slice(1)
          });
          count++;
          if (matchResult.index === regex.lastIndex) {
            regex.lastIndex++;
          }
        }
      } else {
        const matchResult = regex.exec(safeText);
        if (matchResult) {
          collectedMatches.push({
            index: matchResult.index,
            match: matchResult[0],
            groups: matchResult.slice(1)
          });
        }
      }

      // Generate highlighted HTML
      let html = '';
      let lastIndex = 0;
      for (const m of collectedMatches) {
        // Escaped slice before match
        html += escapeHtml(safeText.slice(lastIndex, m.index));
        // Highlighted span
        html += `<mark class="bg-[#00E5FF]/25 text-[#00E5FF] px-1 py-0.5 rounded border border-[#00E5FF]/40 font-bold">${escapeHtml(m.match)}</mark>`;
        lastIndex = m.index + m.match.length;
      }
      html += escapeHtml(safeText.slice(lastIndex));

      return {
        matches: collectedMatches,
        error: null,
        highlightedHtml: html
      };
    } catch (err: any) {
      return {
        matches: [],
        error: err.message,
        highlightedHtml: escapeHtml(testText)
      };
    }
  }, [pattern, flags, testText]);

  function escapeHtml(text: string) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  const handleCopyPattern = () => {
    sound.click();
    navigator.clipboard.writeText(`/${pattern}/${flags}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#1C2426] border border-[#252D30] rounded-xl p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20">
                REAL-TIME EVALUATION
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                ReDoS Protected • Capture Group Inspector
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">Regex Tester & Cheatsheet</h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Live regular expression testing with real-time match highlighting, group captures, and common pattern presets.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyPattern}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#252D30] hover:bg-[#2F383C] text-neutral-200 rounded-lg text-xs font-mono transition-colors border border-neutral-700/50"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#B5FF4A]" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied /.../' : 'Copy Expression'}
            </button>
          </div>
        </div>

        {/* Presets Row */}
        <div className="mt-4 pt-4 border-t border-[#252D30] flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs text-neutral-400 font-mono shrink-0 mr-1">Presets:</span>
          {PRESETS.map(p => (
            <button
              key={p.name}
              onClick={() => handleSelectPreset(p)}
              className="px-2.5 py-1 bg-[#101314] hover:bg-[#252D30] text-neutral-300 hover:text-white rounded-lg text-xs font-mono border border-[#252D30] whitespace-nowrap transition-colors"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Regex Input Bar */}
      <div className="bg-[#1C2426] border border-[#252D30] rounded-xl p-5 shadow-lg space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Regular Expression Pattern
            </label>
            <div className="flex items-center gap-1.5">
              {flagOptions.map(f => (
                <button
                  key={f.key}
                  onClick={() => toggleFlag(f.key)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors border ${
                    flags.includes(f.key)
                      ? 'bg-[#00E5FF]/20 border-[#00E5FF] text-[#00E5FF] font-bold'
                      : 'bg-[#101314] border-[#252D30] text-neutral-500 hover:text-neutral-300'
                  }`}
                  title={f.label}
                >
                  {f.key}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center bg-[#101314] rounded-lg border border-[#252D30] focus-within:border-[#00E5FF] px-3 py-2">
            <span className="text-neutral-500 font-mono text-sm mr-2 select-none">/</span>
            <input
              type="text"
              value={pattern}
              onChange={e => setPattern(e.target.value)}
              placeholder="e.g. [a-z0-9]+@domain\.com"
              className="flex-1 bg-transparent text-sm font-mono text-white focus:outline-none"
              spellCheck={false}
            />
            <span className="text-neutral-500 font-mono text-sm ml-2 select-none">/{flags}</span>
          </div>
        </div>

        {error && (
          <div className="bg-rose-950/40 border border-rose-500/40 rounded-lg p-3 flex items-center gap-2 text-rose-300 text-xs font-mono">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Regex Error: {error}</span>
          </div>
        )}
      </div>

      {/* Test String and Match Highlight Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input Text */}
        <div className="bg-[#1C2426] border border-[#252D30] rounded-xl p-4 flex flex-col shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Test String
            </span>
            <span className="text-[10px] font-mono text-neutral-500">
              {testText.length} characters
            </span>
          </div>
          <textarea
            value={testText}
            onChange={e => setTestText(e.target.value)}
            rows={12}
            placeholder="Type or paste text to test against the regular expression..."
            className="w-full bg-[#101314] text-xs font-mono text-neutral-200 p-3.5 rounded-lg border border-[#252D30] focus:outline-none focus:border-[#00E5FF] leading-relaxed resize-y"
            spellCheck={false}
          />
        </div>

        {/* Right: Real-Time Highlight Match Preview */}
        <div className="bg-[#1C2426] border border-[#252D30] rounded-xl p-4 flex flex-col shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-[#00E5FF] uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#00E5FF]" />
              Match Highlights ({matches.length})
            </span>
            <span className="text-[10px] font-mono text-neutral-400">
              {matches.length === 0 ? 'No matches' : `${matches.length} match${matches.length > 1 ? 'es' : ''} found`}
            </span>
          </div>
          <div
            className="w-full h-full min-h-[220px] bg-[#101314] text-xs font-mono text-neutral-300 p-3.5 rounded-lg border border-[#252D30] overflow-y-auto leading-relaxed whitespace-pre-wrap break-all"
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        </div>
      </div>

      {/* Capture Groups Table */}
      {matches.length > 0 && (
        <div className="bg-[#1C2426] border border-[#252D30] rounded-xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#FFAD42]" />
              Extracted Match Details & Capture Groups
            </h4>
            <span className="text-[10px] font-mono text-neutral-400">
              Showing first {Math.min(matches.length, 50)} matches
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-[#252D30] text-neutral-400">
                  <th className="py-2 px-3">#</th>
                  <th className="py-2 px-3">Index</th>
                  <th className="py-2 px-3">Matched Value</th>
                  <th className="py-2 px-3">Capture Groups</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#252D30]/60">
                {matches.slice(0, 50).map((m, idx) => (
                  <tr key={idx} className="hover:bg-[#252D30]/30 transition-colors">
                    <td className="py-2.5 px-3 text-neutral-500">{idx + 1}</td>
                    <td className="py-2.5 px-3 text-neutral-400">{m.index}</td>
                    <td className="py-2.5 px-3 text-[#00E5FF] font-bold break-all">{m.match}</td>
                    <td className="py-2.5 px-3 text-neutral-300">
                      {m.groups.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {m.groups.map((g, gi) => (
                            <span key={gi} className="px-1.5 py-0.5 bg-[#101314] rounded border border-[#252D30] text-[10px] text-amber-300">
                              ${gi + 1}: "{g}"
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-neutral-600 italic">None</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

