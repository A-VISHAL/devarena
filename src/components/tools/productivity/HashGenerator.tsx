import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Copy, 
  Check, 
  Trash2, 
  Upload, 
  Sparkles, 
  FileText, 
  Lock 
} from 'lucide-react';
import { sound } from '../../../utils/sound';

interface HashResults {
  sha256: string;
  sha384: string;
  sha512: string;
  sha1: string;
}

export const HashGenerator: React.FC = () => {
  const [inputText, setInputText] = useState<string>('DEVARENA Web Platform Security');
  const [hashes, setHashes] = useState<HashResults>({
    sha256: '',
    sha384: '',
    sha512: '',
    sha1: ''
  });
  const [isUppercase, setIsUppercase] = useState<boolean>(false);
  const [copiedAlgo, setCopiedAlgo] = useState<string | null>(null);

  // Compute Hashes using Web Crypto API
  useEffect(() => {
    let isCancelled = false;

    const generateHashes = async () => {
      if (!inputText) {
        setHashes({ sha256: '', sha384: '', sha512: '', sha1: '' });
        return;
      }

      const encoder = new TextEncoder();
      const data = encoder.encode(inputText);

      const bufferToHex = (buffer: ArrayBuffer): string => {
        const hashArray = Array.from(new Uint8Array(buffer));
        const hex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return isUppercase ? hex.toUpperCase() : hex.toLowerCase();
      };

      try {
        const [h256, h384, h512, h1] = await Promise.all([
          crypto.subtle.digest('SHA-256', data),
          crypto.subtle.digest('SHA-384', data),
          crypto.subtle.digest('SHA-512', data),
          crypto.subtle.digest('SHA-1', data)
        ]);

        if (!isCancelled) {
          setHashes({
            sha256: bufferToHex(h256),
            sha384: bufferToHex(h384),
            sha512: bufferToHex(h512),
            sha1: bufferToHex(h1)
          });
        }
      } catch (err) {
        console.error('Crypto error:', err);
      }
    };

    generateHashes();

    return () => {
      isCancelled = true;
    };
  }, [inputText, isUppercase]);

  const handleCopy = (text: string, algo: string) => {
    sound.click();
    navigator.clipboard.writeText(text);
    setCopiedAlgo(algo);
    setTimeout(() => setCopiedAlgo(null), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = evt => {
        const text = evt.target?.result as string;
        if (text) {
          setInputText(text);
          sound.success();
        }
      };
      reader.readAsText(file);
    }
  };

  const hashList = [
    { algo: 'SHA-256', key: 'sha256', value: hashes.sha256, bits: 256, secure: true },
    { algo: 'SHA-512', key: 'sha512', value: hashes.sha512, bits: 512, secure: true },
    { algo: 'SHA-384', key: 'sha384', value: hashes.sha384, bits: 384, secure: true },
    { algo: 'SHA-1 (Legacy)', key: 'sha1', value: hashes.sha1, bits: 160, secure: false }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#1C2426] border border-[#252D30] rounded-xl p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#B5FF4A]/10 text-[#B5FF4A] border border-[#B5FF4A]/20">
                WEB CRYPTO API
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                Hardware Accelerated • FIPS 180-4 Standards
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">Cryptographic Hash Generator</h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Generate SHA-256, SHA-384, SHA-512, and SHA-1 checksums natively in the browser with zero cloud transmissions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.click();
                setIsUppercase(!isUppercase);
              }}
              className="px-3 py-1.5 bg-[#252D30] hover:bg-[#2F383C] text-neutral-200 rounded-lg text-xs font-mono transition-colors border border-neutral-700/50"
            >
              Case: {isUppercase ? 'UPPERCASE' : 'lowercase'}
            </button>
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-[#1C2426] border border-[#252D30] rounded-xl p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono font-bold text-white uppercase tracking-wider">
            Raw String / Payload Input
          </label>
          <div className="flex items-center gap-2">
            <label className="cursor-pointer px-2.5 py-1 bg-[#101314] hover:bg-[#252D30] text-neutral-300 text-xs font-mono rounded border border-[#252D30] flex items-center gap-1.5 transition-colors">
              <Upload className="w-3 h-3 text-[#00E5FF]" /> Upload File
              <input type="file" onChange={handleFileUpload} className="hidden" />
            </label>
            <button
              onClick={() => {
                sound.click();
                setInputText('');
              }}
              className="text-neutral-400 hover:text-white p-1 rounded transition-colors"
              title="Clear text"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <textarea
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          rows={4}
          placeholder="Enter text to hash..."
          className="w-full bg-[#101314] text-xs font-mono text-neutral-200 p-3.5 rounded-lg border border-[#252D30] focus:outline-none focus:border-[#00E5FF] leading-relaxed resize-y"
          spellCheck={false}
        />
        <div className="text-[11px] font-mono text-neutral-500">
          Length: {inputText.length} characters ({new Blob([inputText]).size} bytes)
        </div>
      </div>

      {/* Computed Hashes List */}
      <div className="space-y-3">
        {hashList.map(h => (
          <div key={h.key} className="bg-[#1C2426] border border-[#252D30] rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-[#00E5FF]" />
                <span className="text-xs font-mono font-bold text-white uppercase">
                  {h.algo}
                </span>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                  h.secure 
                    ? 'bg-[#B5FF4A]/10 text-[#B5FF4A] border border-[#B5FF4A]/20' 
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  {h.secure ? 'Cryptographically Secure' : 'Deprecated for Signatures'}
                </span>
              </div>

              <button
                onClick={() => handleCopy(h.value, h.key)}
                disabled={!h.value}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-[#252D30] hover:bg-[#2F383C] text-neutral-200 text-xs font-mono rounded transition-colors border border-neutral-700/50 disabled:opacity-40"
              >
                {copiedAlgo === h.key ? <Check className="w-3 h-3 text-[#B5FF4A]" /> : <Copy className="w-3 h-3" />}
                {copiedAlgo === h.key ? 'Copied' : 'Copy'}
              </button>
            </div>

            <div className="bg-[#101314] p-3 rounded-lg border border-[#252D30] text-xs font-mono text-[#00E5FF] break-all select-all">
              {h.value || <span className="text-neutral-600 italic">Awaiting input...</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

