import React, { useState, useMemo } from 'react';
import { 
  Link as LinkIcon, 
  ArrowRightLeft, 
  Copy, 
  Check, 
  Trash2, 
  Table, 
  Sparkles, 
  AlertCircle 
} from 'lucide-react';
import { sound } from '../../../utils/sound';

const SAMPLE_URL = 'https://devarena.io/app/tools?category=dsa&tool=binary-search&source=featured_banner&utm_campaign=hackon#playground';

export const UrlConverter: React.FC = () => {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [inputUrl, setInputUrl] = useState<string>(SAMPLE_URL);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const resultUrl = useMemo(() => {
    if (!inputUrl.trim()) return '';
    setError(null);
    try {
      if (mode === 'encode') {
        return encodeURI(inputUrl);
      } else {
        return decodeURIComponent(inputUrl);
      }
    } catch (err: any) {
      setError(err.message || 'URI conversion error.');
      return '';
    }
  }, [inputUrl, mode]);

  // Breakdown URL & Query Parameters Table
  const parsedDetails = useMemo(() => {
    try {
      const urlObj = new URL(inputUrl);
      const params: { key: string; value: string }[] = [];
      urlObj.searchParams.forEach((value, key) => {
        params.push({ key, value });
      });

      return {
        protocol: urlObj.protocol,
        hostname: urlObj.hostname,
        pathname: urlObj.pathname,
        hash: urlObj.hash,
        params,
        isValidUrl: true
      };
    } catch {
      return {
        protocol: '-',
        hostname: '-',
        pathname: '-',
        hash: '-',
        params: [],
        isValidUrl: false
      };
    }
  }, [inputUrl]);

  const handleCopy = () => {
    sound.click();
    navigator.clipboard.writeText(resultUrl || inputUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSwap = () => {
    sound.click();
    if (resultUrl && !error) {
      setInputUrl(resultUrl);
      setMode(mode === 'encode' ? 'decode' : 'encode');
    } else {
      setMode(mode === 'encode' ? 'decode' : 'encode');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#1C2426] border border-[#252D30] rounded-xl p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20">
                URI COMPONENT ENGINE
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                RFC 3986 Standard URI Escaping & Query Parser
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">URL Encoder & Query Parser</h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Safely encode and decode Uniform Resource Identifiers (URIs) and inspect structured query parameters in tabular form.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.click();
                setInputUrl(SAMPLE_URL);
              }}
              className="px-3 py-1.5 bg-[#252D30] hover:bg-[#2F383C] text-neutral-200 rounded-lg text-xs font-mono transition-colors border border-neutral-700/50 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#00E5FF]" /> Load Sample
            </button>
            <button
              onClick={handleSwap}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#252D30] hover:bg-[#2F383C] text-neutral-200 rounded-lg text-xs font-mono transition-colors border border-neutral-700/50"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-[#FFAD42]" /> Swap Mode
            </button>
          </div>
        </div>

        {/* Mode Toggle Bar */}
        <div className="mt-4 pt-4 border-t border-[#252D30] flex items-center justify-between">
          <div className="flex items-center bg-[#101314] rounded-lg border border-[#252D30] p-1">
            <button
              onClick={() => {
                sound.click();
                setMode('encode');
              }}
              className={`px-4 py-1.5 rounded text-xs font-mono font-bold transition-colors ${
                mode === 'encode' ? 'bg-[#00E5FF] text-black shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Encode URI
            </button>
            <button
              onClick={() => {
                sound.click();
                setMode('decode');
              }}
              className={`px-4 py-1.5 rounded text-xs font-mono font-bold transition-colors ${
                mode === 'decode' ? 'bg-[#00E5FF] text-black shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Decode URI
            </button>
          </div>

          <button
            onClick={() => {
              sound.click();
              setInputUrl('');
            }}
            className="text-neutral-400 hover:text-white p-1 rounded transition-colors text-xs font-mono flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-3.5 flex items-center gap-2 text-rose-300 text-xs font-mono">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Input / Output Editors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1C2426] border border-[#252D30] rounded-xl p-4 flex flex-col shadow-lg">
          <span className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-2">
            {mode === 'encode' ? 'Decoded / Plain URL' : 'Encoded URI Component'}
          </span>
          <textarea
            value={inputUrl}
            onChange={e => setInputUrl(e.target.value)}
            rows={6}
            placeholder="Enter URL to encode or decode..."
            className="w-full bg-[#101314] text-xs font-mono text-neutral-200 p-3.5 rounded-lg border border-[#252D30] focus:outline-none focus:border-[#00E5FF] leading-relaxed resize-y"
            spellCheck={false}
          />
        </div>

        <div className="bg-[#1C2426] border border-[#252D30] rounded-xl p-4 flex flex-col justify-between shadow-lg">
          <div>
            <span className="text-xs font-mono font-bold text-[#00E5FF] uppercase tracking-wider mb-2 block">
              {mode === 'encode' ? 'Encoded URI Result' : 'Decoded URL Result'}
            </span>
            <textarea
              value={resultUrl}
              readOnly
              rows={4}
              placeholder="Conversion result..."
              className="w-full bg-[#101314] text-xs font-mono text-[#00E5FF]/90 p-3.5 rounded-lg border border-[#252D30] focus:outline-none leading-relaxed resize-y"
              spellCheck={false}
            />
          </div>

          <div className="mt-3 flex justify-end">
            <button
              onClick={handleCopy}
              disabled={!resultUrl}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#00E5FF] text-black hover:brightness-110 font-bold rounded-lg text-xs transition-all shadow-md shadow-[#00E5FF]/20 disabled:opacity-40"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Output'}
            </button>
          </div>
        </div>
      </div>

      {/* Query Parameters Breakdown Inspector */}
      {parsedDetails.isValidUrl && (
        <div className="bg-[#1C2426] border border-[#252D30] rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Table className="w-4 h-4 text-[#00E5FF]" />
              URI Anatomy & Query Parameter Inspector
            </h4>
            <span className="text-[10px] font-mono text-neutral-400">
              {parsedDetails.params.length} query parameters found
            </span>
          </div>

          {/* Path Details Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono">
            <div className="bg-[#101314] p-2.5 rounded border border-[#252D30]">
              <div className="text-[10px] text-neutral-500 uppercase">Protocol</div>
              <div className="text-white font-bold mt-0.5 truncate">{parsedDetails.protocol}</div>
            </div>
            <div className="bg-[#101314] p-2.5 rounded border border-[#252D30]">
              <div className="text-[10px] text-neutral-500 uppercase">Host</div>
              <div className="text-white font-bold mt-0.5 truncate">{parsedDetails.hostname}</div>
            </div>
            <div className="bg-[#101314] p-2.5 rounded border border-[#252D30]">
              <div className="text-[10px] text-neutral-500 uppercase">Path</div>
              <div className="text-white font-bold mt-0.5 truncate">{parsedDetails.pathname}</div>
            </div>
            <div className="bg-[#101314] p-2.5 rounded border border-[#252D30]">
              <div className="text-[10px] text-neutral-500 uppercase">Hash Fragment</div>
              <div className="text-white font-bold mt-0.5 truncate">{parsedDetails.hash || 'None'}</div>
            </div>
          </div>

          {/* Key-Value Query Params Table */}
          {parsedDetails.params.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="border-b border-[#252D30] text-neutral-400 bg-[#101314]/80">
                    <th className="py-2 px-3 w-1/3 uppercase font-bold text-[10px]">Parameter Key</th>
                    <th className="py-2 px-3 uppercase font-bold text-[10px]">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#252D30]/60">
                  {parsedDetails.params.map((p, idx) => (
                    <tr key={idx} className="hover:bg-[#252D30]/30 transition-colors">
                      <td className="py-2.5 px-3 text-[#FFAD42] font-bold">{p.key}</td>
                      <td className="py-2.5 px-3 text-neutral-200">{p.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

