import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Copy, 
  Check, 
  RotateCcw, 
  Play, 
  Pause, 
  Calendar, 
  ArrowRightLeft, 
  Zap 
} from 'lucide-react';
import { sound } from '../../../utils/sound';

export const TimestampConverter: React.FC = () => {
  const [currentEpoch, setCurrentEpoch] = useState<number>(Math.floor(Date.now() / 1000));
  const [isClockRunning, setIsClockRunning] = useState<boolean>(true);
  const [inputEpoch, setInputEpoch] = useState<string>(Math.floor(Date.now() / 1000).toString());
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Live clock
  useEffect(() => {
    if (!isClockRunning) return;
    const interval = setInterval(() => {
      setCurrentEpoch(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isClockRunning]);

  // Handle epoch calculation
  const epochVal = parseInt(inputEpoch, 10);
  const isMillis = !isNaN(epochVal) && epochVal > 9999999999;
  const targetDate = !isNaN(epochVal) 
    ? new Date(isMillis ? epochVal : epochVal * 1000)
    : new Date();

  const isValidDate = !isNaN(targetDate.getTime());

  const handleCopy = (text: string, key: string) => {
    sound.click();
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const setRelativeTime = (secondsOffset: number) => {
    sound.click();
    const newTime = Math.floor(Date.now() / 1000) + secondsOffset;
    setInputEpoch(newTime.toString());
  };

  const getRelativeString = (d: Date): string => {
    const diffSec = Math.round((d.getTime() - Date.now()) / 1000);
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    if (Math.abs(diffSec) < 60) return rtf.format(diffSec, 'second');
    const diffMin = Math.round(diffSec / 60);
    if (Math.abs(diffMin) < 60) return rtf.format(diffMin, 'minute');
    const diffHours = Math.round(diffMin / 60);
    if (Math.abs(diffHours) < 24) return rtf.format(diffHours, 'hour');
    const diffDays = Math.round(diffHours / 24);
    return rtf.format(diffDays, 'day');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Live Clock */}
      <div className="bg-[#1C2426] border border-[#252D30] rounded-xl p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20">
                EPOCH CLOCK
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                UTC & Localized Timezone Formatter
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">Unix Timestamp Converter</h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Bidirectional epoch converter supporting seconds, milliseconds, ISO 8601, and human-readable date parsing.
            </p>
          </div>

          {/* Live Epoch Counter */}
          <div className="bg-[#101314] px-4 py-2.5 rounded-xl border border-[#252D30] flex items-center gap-3">
            <div>
              <div className="text-[10px] uppercase font-mono text-neutral-500">Current Epoch</div>
              <div className="text-lg font-mono font-bold text-[#00E5FF] tracking-wider">
                {currentEpoch}
              </div>
            </div>
            <button
              onClick={() => setIsClockRunning(!isClockRunning)}
              className="p-1.5 rounded-lg bg-[#252D30] hover:bg-[#2F383C] text-neutral-300 transition-colors"
              title={isClockRunning ? 'Pause live clock' : 'Resume live clock'}
            >
              {isClockRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Quick Shift Presets */}
        <div className="mt-4 pt-4 border-t border-[#252D30] flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs text-neutral-400 font-mono shrink-0 mr-1">Quick Select:</span>
          <button
            onClick={() => setRelativeTime(0)}
            className="px-2.5 py-1 bg-[#00E5FF]/15 border border-[#00E5FF]/30 text-[#00E5FF] rounded-lg text-xs font-mono font-bold"
          >
            Now
          </button>
          <button
            onClick={() => setRelativeTime(-86400)}
            className="px-2.5 py-1 bg-[#101314] hover:bg-[#252D30] text-neutral-300 rounded-lg text-xs font-mono border border-[#252D30]"
          >
            -1 Day
          </button>
          <button
            onClick={() => setRelativeTime(3600)}
            className="px-2.5 py-1 bg-[#101314] hover:bg-[#252D30] text-neutral-300 rounded-lg text-xs font-mono border border-[#252D30]"
          >
            +1 Hour
          </button>
          <button
            onClick={() => setRelativeTime(86400)}
            className="px-2.5 py-1 bg-[#101314] hover:bg-[#252D30] text-neutral-300 rounded-lg text-xs font-mono border border-[#252D30]"
          >
            +1 Day
          </button>
          <button
            onClick={() => setRelativeTime(86400 * 7)}
            className="px-2.5 py-1 bg-[#101314] hover:bg-[#252D30] text-neutral-300 rounded-lg text-xs font-mono border border-[#252D30]"
          >
            +7 Days
          </button>
        </div>
      </div>

      {/* Input Epoch Bar */}
      <div className="bg-[#1C2426] border border-[#252D30] rounded-xl p-5 shadow-lg space-y-4">
        <div>
          <label className="text-xs font-mono font-bold text-white uppercase tracking-wider block mb-2">
            Enter Unix Timestamp (Seconds or Milliseconds)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputEpoch}
              onChange={e => setInputEpoch(e.target.value)}
              placeholder="e.g. 1731672000"
              className="flex-1 bg-[#101314] text-base font-mono text-white px-3.5 py-2.5 rounded-lg border border-[#252D30] focus:outline-none focus:border-[#00E5FF]"
            />
            <button
              onClick={() => setInputEpoch(Math.floor(Date.now() / 1000).toString())}
              className="px-3.5 py-2.5 bg-[#252D30] hover:bg-[#2F383C] text-neutral-200 text-xs font-mono rounded-lg transition-colors border border-neutral-700"
            >
              Reset to Now
            </button>
          </div>
          <div className="mt-1.5 text-[11px] font-mono text-neutral-500">
            Detected format: <strong className="text-neutral-300">{isMillis ? 'Milliseconds (13 digits)' : 'Seconds (10 digits)'}</strong>
          </div>
        </div>
      </div>

      {/* Formatted Date Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* UTC Time */}
        <div className="bg-[#1C2426] border border-[#252D30] rounded-xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <div className="text-[10px] font-mono uppercase text-neutral-500">UTC / GMT (ISO 8601)</div>
            <div className="text-sm font-mono font-bold text-white mt-1">
              {isValidDate ? targetDate.toISOString() : 'Invalid Date'}
            </div>
          </div>
          <button
            onClick={() => handleCopy(targetDate.toISOString(), 'iso')}
            className="p-2 bg-[#252D30] hover:bg-[#2F383C] text-neutral-300 rounded-lg transition-colors border border-neutral-700"
          >
            {copiedKey === 'iso' ? <Check className="w-3.5 h-3.5 text-[#B5FF4A]" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Local Time */}
        <div className="bg-[#1C2426] border border-[#252D30] rounded-xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <div className="text-[10px] font-mono uppercase text-neutral-500">Your Local Time</div>
            <div className="text-sm font-mono font-bold text-[#00E5FF] mt-1">
              {isValidDate ? targetDate.toString() : 'Invalid Date'}
            </div>
          </div>
          <button
            onClick={() => handleCopy(targetDate.toString(), 'local')}
            className="p-2 bg-[#252D30] hover:bg-[#2F383C] text-neutral-300 rounded-lg transition-colors border border-neutral-700"
          >
            {copiedKey === 'local' ? <Check className="w-3.5 h-3.5 text-[#B5FF4A]" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Relative Time */}
        <div className="bg-[#1C2426] border border-[#252D30] rounded-xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <div className="text-[10px] font-mono uppercase text-neutral-500">Relative Offset</div>
            <div className="text-sm font-mono font-bold text-[#B5FF4A] mt-1">
              {isValidDate ? getRelativeString(targetDate) : 'Invalid'}
            </div>
          </div>
          <button
            onClick={() => handleCopy(getRelativeString(targetDate), 'rel')}
            className="p-2 bg-[#252D30] hover:bg-[#2F383C] text-neutral-300 rounded-lg transition-colors border border-neutral-700"
          >
            {copiedKey === 'rel' ? <Check className="w-3.5 h-3.5 text-[#B5FF4A]" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* RFC 2822 Format */}
        <div className="bg-[#1C2426] border border-[#252D30] rounded-xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <div className="text-[10px] font-mono uppercase text-neutral-500">RFC 2822</div>
            <div className="text-sm font-mono font-bold text-neutral-300 mt-1">
              {isValidDate ? targetDate.toUTCString() : 'Invalid Date'}
            </div>
          </div>
          <button
            onClick={() => handleCopy(targetDate.toUTCString(), 'rfc')}
            className="p-2 bg-[#252D30] hover:bg-[#2F383C] text-neutral-300 rounded-lg transition-colors border border-neutral-700"
          >
            {copiedKey === 'rfc' ? <Check className="w-3.5 h-3.5 text-[#B5FF4A]" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

