import React, { useState } from 'react';
import { 
  FileJson, 
  Copy, 
  Check, 
  Trash2, 
  Code2, 
  Minimize2, 
  Maximize2, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  Download
} from 'lucide-react';
import { sound } from '../../../utils/sound';

const SAMPLE_JSON = `{
  "platform": "DEVARENA",
  "version": "2.4.0",
  "developer": {
    "handle": "coder_pro",
    "level": 42,
    "verified": true,
    "skills": ["Algorithms", "TypeScript", "React", "Rust"]
  },
  "stats": {
    "problemsSolved": 128,
    "eloRating": 1845,
    "streakDays": 14,
    "winRate": 0.72
  },
  "achievements": [
    { "id": "speed_demon", "tier": "Gold", "points": 500 },
    { "id": "algorithm_master", "tier": "Platinum", "points": 1000 }
  ]
}`;

export const JsonFormatter: React.FC = () => {
  const [inputJson, setInputJson] = useState<string>(SAMPLE_JSON);
  const [outputJson, setOutputJson] = useState<string>('');
  const [error, setError] = useState<{ message: string; line?: number; column?: number } | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [indentation, setIndentation] = useState<number | string>(2);

  const formatJson = (spaces: number | string = indentation) => {
    sound.click();
    if (!inputJson.trim()) {
      setOutputJson('');
      setError(null);
      return;
    }

    try {
      const parsed = JSON.parse(inputJson);
      const indent = spaces === 'tab' ? '\t' : Number(spaces);
      const formatted = JSON.stringify(parsed, null, indent);
      setOutputJson(formatted);
      setError(null);
      sound.success();
    } catch (err: any) {
      sound.defeat();
      parseJsonError(err.message, inputJson);
    }
  };

  const minifyJson = () => {
    sound.click();
    if (!inputJson.trim()) {
      setOutputJson('');
      setError(null);
      return;
    }

    try {
      const parsed = JSON.parse(inputJson);
      const minified = JSON.stringify(parsed);
      setOutputJson(minified);
      setError(null);
      sound.success();
    } catch (err: any) {
      sound.defeat();
      parseJsonError(err.message, inputJson);
    }
  };

  const validateJsonOnly = () => {
    sound.click();
    if (!inputJson.trim()) {
      setError({ message: 'Input is empty.' });
      return;
    }

    try {
      JSON.parse(inputJson);
      setError(null);
      sound.success();
    } catch (err: any) {
      sound.defeat();
      parseJsonError(err.message, inputJson);
    }
  };

  const parseJsonError = (rawMsg: string, text: string) => {
    // Attempt extracting line/column from message like "at position 45" or "line 3 column 5"
    let line: number | undefined;
    let column: number | undefined;

    const lineColMatch = rawMsg.match(/line (\d+) column (\d+)/i);
    if (lineColMatch) {
      line = parseInt(lineColMatch[1], 10);
      column = parseInt(lineColMatch[2], 10);
    } else {
      const posMatch = rawMsg.match(/at position (\d+)/i);
      if (posMatch) {
        const position = parseInt(posMatch[1], 10);
        const sub = text.substring(0, position);
        const lines = sub.split('\n');
        line = lines.length;
        column = lines[lines.length - 1].length + 1;
      }
    }

    setError({
      message: rawMsg,
      line,
      column
    });
  };

  const handleCopy = () => {
    const textToCopy = outputJson || inputJson;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    sound.click();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    sound.click();
    setInputJson('');
    setOutputJson('');
    setError(null);
  };

  const handleLoadSample = () => {
    sound.click();
    setInputJson(SAMPLE_JSON);
    setOutputJson('');
    setError(null);
  };

  const handleDownload = () => {
    sound.click();
    const content = outputJson || inputJson;
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calculate quick stats
  const getStats = (str: string) => {
    try {
      const obj = JSON.parse(str);
      const isArray = Array.isArray(obj);
      const keyCount = isArray ? obj.length : Object.keys(obj).length;
      const sizeBytes = new Blob([str]).size;
      return { valid: true, isArray, keyCount, sizeBytes };
    } catch {
      return { valid: false, isArray: false, keyCount: 0, sizeBytes: new Blob([str]).size };
    }
  };

  const currentContent = outputJson || inputJson;
  const stats = getStats(currentContent);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#1C2426] border border-[#252D30] rounded-xl p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20">
                CLIENT-SIDE ENGINE
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                100% In-Browser • Zero Network Overhead
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">JSON Formatter & Validator</h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Format, minify, validate syntax, and inspect JSON payloads with exact line and column error indicators.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleLoadSample}
              className="px-3 py-1.5 bg-[#252D30] hover:bg-[#2F383C] text-neutral-200 rounded-lg text-xs font-mono transition-colors border border-neutral-700/50 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#00E5FF]" /> Load Sample
            </button>
            <button
              onClick={handleClear}
              className="px-3 py-1.5 bg-[#252D30] hover:bg-[#2F383C] text-neutral-300 rounded-lg text-xs font-mono transition-colors border border-neutral-700/50 flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear
            </button>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="mt-4 pt-4 border-t border-[#252D30] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-[#101314] rounded-lg border border-[#252D30] p-1">
              <button
                onClick={() => {
                  setIndentation(2);
                  formatJson(2);
                }}
                className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                  indentation === 2 ? 'bg-[#00E5FF]/20 text-[#00E5FF] font-bold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                2 Spaces
              </button>
              <button
                onClick={() => {
                  setIndentation(4);
                  formatJson(4);
                }}
                className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                  indentation === 4 ? 'bg-[#00E5FF]/20 text-[#00E5FF] font-bold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                4 Spaces
              </button>
              <button
                onClick={() => {
                  setIndentation('tab');
                  formatJson('tab');
                }}
                className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                  indentation === 'tab' ? 'bg-[#00E5FF]/20 text-[#00E5FF] font-bold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Tabs
              </button>
            </div>

            <button
              onClick={minifyJson}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#252D30] hover:bg-[#2F383C] text-neutral-200 rounded-lg text-xs font-mono transition-colors border border-neutral-700/50"
            >
              <Minimize2 className="w-3.5 h-3.5 text-amber-400" /> Minify
            </button>

            <button
              onClick={validateJsonOnly}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#252D30] hover:bg-[#2F383C] text-neutral-200 rounded-lg text-xs font-mono transition-colors border border-neutral-700/50"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#B5FF4A]" /> Validate
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#00E5FF] text-black hover:brightness-110 rounded-lg text-xs font-bold transition-all shadow-md shadow-[#00E5FF]/20"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Result'}
            </button>
            <button
              onClick={handleDownload}
              className="p-1.5 bg-[#252D30] hover:bg-[#2F383C] text-neutral-300 rounded-lg transition-colors border border-neutral-700"
              title="Download JSON"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Error or Success Alert */}
      {error ? (
        <div className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="text-xs font-mono font-bold text-rose-300">
              INVALID JSON SYNTAX {error.line && `(Line ${error.line}${error.column ? `, Column ${error.column}` : ''})`}
            </div>
            <p className="text-xs font-mono text-rose-200/90 mt-1">{error.message}</p>
          </div>
        </div>
      ) : (
        <div className="bg-[#1C2426] border border-[#252D30] rounded-xl px-4 py-2.5 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-[#B5FF4A]">
            <CheckCircle2 className="w-4 h-4" />
            <span>Valid JSON Structure</span>
          </div>
          <div className="flex items-center gap-4 text-neutral-400">
            <span>Size: <strong className="text-white">{(stats.sizeBytes / 1024).toFixed(2)} KB</strong></span>
            <span>Root {stats.isArray ? 'Elements' : 'Keys'}: <strong className="text-white">{stats.keyCount}</strong></span>
          </div>
        </div>
      )}

      {/* Dual Column Editor / Output View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input Textarea */}
        <div className="bg-[#1C2426] border border-[#252D30] rounded-xl p-4 flex flex-col shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Input Raw JSON
            </span>
            <span className="text-[10px] font-mono text-neutral-500">
              {inputJson.split('\n').length} lines
            </span>
          </div>
          <textarea
            value={inputJson}
            onChange={e => {
              setInputJson(e.target.value);
              setError(null);
            }}
            placeholder="Paste raw unformatted or minified JSON here..."
            rows={18}
            className="w-full bg-[#101314] text-xs font-mono text-neutral-200 p-3.5 rounded-lg border border-[#252D30] focus:outline-none focus:border-[#00E5FF] leading-relaxed resize-y"
            spellCheck={false}
          />
        </div>

        {/* Right: Output Textarea */}
        <div className="bg-[#1C2426] border border-[#252D30] rounded-xl p-4 flex flex-col shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-[#00E5FF] uppercase tracking-wider">
              Formatted Output
            </span>
            <span className="text-[10px] font-mono text-neutral-500">
              {(outputJson || inputJson).split('\n').length} lines
            </span>
          </div>
          <textarea
            value={outputJson || inputJson}
            readOnly
            rows={18}
            placeholder="Formatted output will appear here..."
            className="w-full bg-[#101314] text-xs font-mono text-[#00E5FF]/90 p-3.5 rounded-lg border border-[#252D30] focus:outline-none leading-relaxed resize-y"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
};

