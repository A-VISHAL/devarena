import React, { useState } from 'react';
import { 
  Palette, 
  Copy, 
  Check, 
  Sparkles, 
  Eye, 
  CheckCircle2, 
  XCircle 
} from 'lucide-react';
import { sound } from '../../../utils/sound';

export const ColorConverter: React.FC = () => {
  const [hexColor, setHexColor] = useState<string>('#00E5FF');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // HEX to RGB
  const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
    let clean = hex.replace('#', '');
    if (clean.length === 3) {
      clean = clean.split('').map(c => c + c).join('');
    }
    const num = parseInt(clean, 16);
    if (isNaN(num) || clean.length !== 6) return { r: 0, g: 229, b: 255 };
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  };

  const rgb = hexToRgb(hexColor);

  // RGB to HSL
  const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  // WCAG Luminance & Contrast
  const getLuminance = (r: number, g: number, b: number): number => {
    const a = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  const getContrastRatio = (lum1: number, lum2: number): number => {
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    return (lighter + 0.05) / (darker + 0.05);
  };

  const colorLum = getLuminance(rgb.r, rgb.g, rgb.b);
  const darkLum = getLuminance(16, 19, 20); // #101314
  const lightLum = getLuminance(255, 255, 255); // #FFFFFF

  const contrastDark = getContrastRatio(colorLum, darkLum);
  const contrastLight = getContrastRatio(colorLum, lightLum);

  const handleCopy = (text: string, key: string) => {
    sound.click();
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const PRESET_PALETTES = [
    { name: 'DevArena Cyan', hex: '#00E5FF' },
    { name: 'Neon Lime', hex: '#B5FF4A' },
    { name: 'Amber Orange', hex: '#FFAD42' },
    { name: 'Cyber Purple', hex: '#A855F7' },
    { name: 'Rose Red', hex: '#F43F5E' },
    { name: 'Emerald', hex: '#10B981' }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#1C2426] border border-[#252D30] rounded-xl p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20">
                COLOR STUDIO & WCAG
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                HEX • RGB • HSL • Accessibility Contrast
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">Color Converter & Studio</h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Inspect multi-format color representations, check WCAG accessibility contrast ratios, and generate tonal palettes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {PRESET_PALETTES.map(p => (
              <button
                key={p.name}
                onClick={() => {
                  sound.click();
                  setHexColor(p.hex);
                }}
                className="w-7 h-7 rounded-lg border border-neutral-600 hover:scale-110 transition-transform"
                style={{ backgroundColor: p.hex }}
                title={p.name}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Interactive Studio Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Swatch & Picker (4 cols) */}
        <div className="lg:col-span-4 bg-[#1C2426] border border-[#252D30] rounded-xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-3 block">
              Color Swatch Preview
            </span>
            <div
              className="w-full h-40 rounded-xl border border-neutral-700 shadow-inner flex items-center justify-center relative overflow-hidden"
              style={{ backgroundColor: hexColor }}
            >
              <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20 text-white font-mono font-bold text-sm tracking-wider">
                {hexColor.toUpperCase()}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[#252D30] flex items-center gap-3">
            <input
              type="color"
              value={hexColor}
              onChange={e => setHexColor(e.target.value)}
              className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
            />
            <input
              type="text"
              value={hexColor}
              onChange={e => setHexColor(e.target.value)}
              className="flex-1 bg-[#101314] text-xs font-mono text-white px-3 py-2 rounded-lg border border-[#252D30] focus:outline-none focus:border-[#00E5FF]"
            />
          </div>
        </div>

        {/* Format Conversions List (8 cols) */}
        <div className="lg:col-span-8 bg-[#1C2426] border border-[#252D30] rounded-xl p-5 shadow-xl space-y-3">
          <span className="text-xs font-mono font-bold text-white uppercase tracking-wider block mb-2">
            Color Formats
          </span>

          {/* HEX */}
          <div className="bg-[#101314] p-3 rounded-lg border border-[#252D30] flex items-center justify-between">
            <div>
              <div className="text-[10px] text-neutral-500 font-mono">HEX</div>
              <div className="text-sm font-mono font-bold text-white">{hexColor.toUpperCase()}</div>
            </div>
            <button
              onClick={() => handleCopy(hexColor.toUpperCase(), 'hex')}
              className="p-1.5 bg-[#252D30] hover:bg-[#2F383C] text-neutral-300 rounded transition-colors"
            >
              {copiedKey === 'hex' ? <Check className="w-3.5 h-3.5 text-[#B5FF4A]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* RGB */}
          <div className="bg-[#101314] p-3 rounded-lg border border-[#252D30] flex items-center justify-between">
            <div>
              <div className="text-[10px] text-neutral-500 font-mono">RGB</div>
              <div className="text-sm font-mono font-bold text-[#00E5FF]">
                rgb({rgb.r}, {rgb.g}, {rgb.b})
              </div>
            </div>
            <button
              onClick={() => handleCopy(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, 'rgb')}
              className="p-1.5 bg-[#252D30] hover:bg-[#2F383C] text-neutral-300 rounded transition-colors"
            >
              {copiedKey === 'rgb' ? <Check className="w-3.5 h-3.5 text-[#B5FF4A]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* HSL */}
          <div className="bg-[#101314] p-3 rounded-lg border border-[#252D30] flex items-center justify-between">
            <div>
              <div className="text-[10px] text-neutral-500 font-mono">HSL</div>
              <div className="text-sm font-mono font-bold text-[#B5FF4A]">
                hsl({hsl.h}, {hsl.s}%, {hsl.l}%)
              </div>
            </div>
            <button
              onClick={() => handleCopy(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`, 'hsl')}
              className="p-1.5 bg-[#252D30] hover:bg-[#2F383C] text-neutral-300 rounded transition-colors"
            >
              {copiedKey === 'hsl' ? <Check className="w-3.5 h-3.5 text-[#B5FF4A]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* WCAG Accessibility Contrast Calculator */}
      <div className="bg-[#1C2426] border border-[#252D30] rounded-xl p-5 shadow-xl">
        <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <Eye className="w-4 h-4 text-[#00E5FF]" />
          WCAG 2.1 Contrast Ratios
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Contrast on Dark Background */}
          <div className="bg-[#101314] p-4 rounded-xl border border-[#252D30]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-neutral-400">Against Dark Canvas (#101314)</span>
              <span className="text-base font-mono font-bold text-white">
                {contrastDark.toFixed(2)} : 1
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className={`px-2 py-0.5 rounded ${contrastDark >= 4.5 ? 'bg-[#B5FF4A]/10 text-[#B5FF4A]' : 'bg-rose-500/10 text-rose-400'}`}>
                AA Normal: {contrastDark >= 4.5 ? 'PASS' : 'FAIL'}
              </span>
              <span className={`px-2 py-0.5 rounded ${contrastDark >= 7 ? 'bg-[#B5FF4A]/10 text-[#B5FF4A]' : 'bg-neutral-800 text-neutral-500'}`}>
                AAA Normal: {contrastDark >= 7 ? 'PASS' : 'FAIL'}
              </span>
            </div>
          </div>

          {/* Contrast on Light Background */}
          <div className="bg-[#101314] p-4 rounded-xl border border-[#252D30]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-neutral-400">Against Light Canvas (#FFFFFF)</span>
              <span className="text-base font-mono font-bold text-white">
                {contrastLight.toFixed(2)} : 1
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className={`px-2 py-0.5 rounded ${contrastLight >= 4.5 ? 'bg-[#B5FF4A]/10 text-[#B5FF4A]' : 'bg-rose-500/10 text-rose-400'}`}>
                AA Normal: {contrastLight >= 4.5 ? 'PASS' : 'FAIL'}
              </span>
              <span className={`px-2 py-0.5 rounded ${contrastLight >= 7 ? 'bg-[#B5FF4A]/10 text-[#B5FF4A]' : 'bg-neutral-800 text-neutral-500'}`}>
                AAA Normal: {contrastLight >= 7 ? 'PASS' : 'FAIL'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

