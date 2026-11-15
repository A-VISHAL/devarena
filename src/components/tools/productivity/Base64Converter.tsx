import React, { useState } from 'react';
import { 
  Binary, 
  ArrowRightLeft, 
  Copy, 
  Check, 
  Trash2, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';
import { sound } from '../../../utils/sound';

export const Base64Converter: React.FC = () => {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [inputText, setInputText] = useState<string>('Welcome to DEVARENA Developer Tools!');
  const [urlSafe, setUrlSafe] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // UTF-8 safe Base64 encoder/decoder
  const computeResult = (): string => {
    if (!inputText) return '';
    setError(null);

    try {
      if (mode === 'encode') {
        const bytes = new TextEncoder().encode(inputText);
        let binString = '';
        bytes.forEach(b => (binString += String.fromCharCode(b)));
        let b64 = btoa(binString);

        if (urlSafe) {
          b64 = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        }
        return b64;
      } else {
        let b64 = inputText.trim();
        if (urlSafe || b64.includes('-') || b64.includes('_')) {
          b64 = b64.replace(/-/g, '+').replace(/_/g, '/');
          while (b64.length % 4 !== 0) {
            b64 += '=';
          }
        }
        const binString = atob(b64);
        const bytes = Uint8Array.from(binString, c => c.charCodeAt(0));
        return new TextDecoder().decode(bytes);
      }
    } catch (err: any) {
      setError(mode === 'decode' ? 'Invalid Base64 sequence.' : err.message);
      return '';
    }
  };

  const resultText = computeResult();

  const handleCopy = () => {
    sound.click();
    if (!resultText) return;
    navigator.clipboard.writeText(resultText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSwap = () => {
    sound.click();
    if (resultText && !error) {
      setInputText(resultText);
      setMode(mode === 'encode' ? 'decode' : 'encode');
    } else {
      setMode(mode === 'encode' ? 'decode' : 'encode');
    }
  };

  const handleClear = () => {
    sound.click();
    setInputText('');
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#1C2426] border border-[#252D30] rounded-xl p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20">
                UTF-8 COMPLIANT
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                RFC 4648 Base64 & URL-Safe Encoding
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">Base64 Encoder / Decoder</h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Encode strings to standard Base64 representation or decode Base64 back to plain text. Includes URL-safe mode.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.click();
                setUrlSafe(!urlSafe);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors border ${
                urlSafe
                  ? 'bg-[#00E5FF]/20 border-[#00E5FF] text-[#00E5FF] font-bold'
                  : 'bg-[#252D30] border-neutral-700 text-neutral-400 hover:text-white'
              }`}
            >
              URL-Safe Mode {urlSafe ? '(ON)' : '(OFF)'}
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
              Encode (Text → Base64)
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
              Decode (Base64 → Text)
            </button>
          </div>

          <button
            onClick={handleClear}
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

      {/* Input / Output Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Textarea */}
        <div className="bg-[#1C2426] border border-[#252D30] rounded-xl p-4 flex flex-col shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              {mode === 'encode' ? 'Plain Text Input' : 'Base64 Encoded Input'}
            </span>
            <span className="text-[10px] font-mono text-neutral-500">
              {new Blob([inputText]).size} bytes
            </span>
          </div>
          <textarea
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            rows={12}
            placeholder={mode === 'encode' ? 'Type or paste plain text here...' : 'Paste Base64 payload here...'}
            className="w-full bg-[#101314] text-xs font-mono text-neutral-200 p-3.5 rounded-lg border border-[#252D30] focus:outline-none focus:border-[#00E5FF] leading-relaxed resize-y"
            spellCheck={false}
          />
        </div>

        {/* Output Textarea */}
        <div className="bg-[#1C2426] border border-[#252D30] rounded-xl p-4 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-[#00E5FF] uppercase tracking-wider">
                {mode === 'encode' ? 'Base64 Result' : 'Decoded Plain Text'}
              </span>
              <span className="text-[10px] font-mono text-neutral-500">
                {new Blob([resultText]).size} bytes
              </span>
            </div>
            <textarea
              value={resultText}
              readOnly
              rows={10}
              placeholder="Result will appear here..."
              className="w-full bg-[#101314] text-xs font-mono text-[#00E5FF]/90 p-3.5 rounded-lg border border-[#252D30] focus:outline-none leading-relaxed resize-y"
              spellCheck={false}
            />
          </div>

          <div className="mt-4 pt-3 border-t border-[#252D30] flex items-center justify-end">
            <button
              onClick={handleCopy}
              disabled={!resultText}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#00E5FF] text-black hover:brightness-110 font-bold rounded-lg text-xs transition-all shadow-md shadow-[#00E5FF]/20 disabled:opacity-40"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Output'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

