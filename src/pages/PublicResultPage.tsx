import React, { useEffect, useState } from 'react';
import { 
  Trophy, 
  Sparkles, 
  Swords, 
  Play, 
  ArrowRight, 
  Check, 
  Share2, 
  Copy, 
  FileText, 
  ExternalLink,
  Flame,
  Zap,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PublicSharedResult } from '../types';
import { 
  getSharedResult, 
  copyTextToClipboard, 
  getLinkedInShareUrl,
  generateLinkedInPostText,
  buildShareableResultUrl 
} from '../utils/resultShare';
import { sound } from '../utils/sound';

export const PublicResultPage: React.FC = () => {
  const { navigateToApp, user } = useApp();
  
  const [result, setResult] = useState<PublicSharedResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [showNotice, setShowNotice] = useState(false);

  useEffect(() => {
    async function loadResult() {
      try {
        const params = new URLSearchParams(window.location.search);
        const resultId = params.get('result') || params.get('id') || 'da_res_default';
        const encodedPayload = params.get('d') || params.get('data') || undefined;

        const data = await getSharedResult(resultId, encodedPayload);
        setResult(data);

        if (data) {
          // Dynamically update document title for sharing
          document.title = `${data.player.displayName} scored ${data.scoreOrResult} in ${data.gameOrBattle} — DEVARENA`;

          // Dynamically update Open Graph metadata in DOM if elements exist
          const ogTitle = document.querySelector('meta[property="og:title"]');
          if (ogTitle) ogTitle.setAttribute('content', `${data.player.displayName} scored ${data.scoreOrResult} on DEVARENA`);
          
          const ogDesc = document.querySelector('meta[property="og:description"]');
          if (ogDesc) ogDesc.setAttribute('content', `${data.subtitle || `Verified score on DEVARENA.`} Can you beat my score?`);
        }
      } catch (err) {
        console.error('Failed to load shared result', err);
      } finally {
        setLoading(false);
      }
    }

    loadResult();
  }, []);

  const handlePlayChallenge = () => {
    sound.playClick();
    if (!result) {
      navigateToApp('play');
      return;
    }

    if (result.isBattle) {
      navigateToApp('arena');
    } else if (result.gameId && result.gameId !== 'arena') {
      navigateToApp('play', result.gameId);
    } else {
      navigateToApp('play');
    }
  };

  const handleCopyLink = async () => {
    sound.playClick();
    if (!result) return;
    const url = buildShareableResultUrl(result);
    const copied = await copyTextToClipboard(url);
    if (copied) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleShareOnLinkedIn = async () => {
    sound.playClick();
    if (!result) return;
    const url = buildShareableResultUrl(result);
    const postText = generateLinkedInPostText(result, result.player, url);
    await copyTextToClipboard(postText);
    setShowNotice(true);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 3000);
    window.open(getLinkedInShareUrl(url), '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-arena-bg flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-arena-surface border border-arena-border flex items-center justify-center text-arena-amber animate-pulse">
          <Sparkles className="w-6 h-6" />
        </div>
        <div className="font-mono text-xs text-arena-textSecondary tracking-wider uppercase">
          Verifying DEVARENA Result Record...
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-arena-bg flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-arena-surface border border-arena-border flex items-center justify-center text-arena-error">
          <Trophy className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-arena-textPrimary">Result Not Found</h2>
        <p className="text-xs text-arena-textSecondary max-w-sm">
          This challenge result link may have expired or is unavailable. You can still test your mental reflexes and compete in the arena!
        </p>
        <button
          onClick={() => navigateToApp('play')}
          className="btn-primary py-2.5 px-5 text-xs font-semibold gap-2"
        >
          <span>Explore DEVARENA</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-arena-bg text-arena-textPrimary flex flex-col selection:bg-arena-amber/20 selection:text-white">
      
      {/* 1. Public Top Navigation Header */}
      <header className="w-full border-b border-arena-border/60 bg-arena-surface/80 backdrop-blur-md sticky top-0 z-40">
        <div className="w-[94%] max-w-[1400px] mx-auto px-4 py-3.5 flex items-center justify-between">
          
          {/* Logo */}
          <div 
            onClick={() => navigateToApp('home')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-[#172023] border border-[#2B3B3F] flex items-center justify-center text-arena-amber font-extrabold text-xs shadow-sm group-hover:border-arena-amber/40 transition-colors">
              DA
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-arena-textPrimary">DEVARENA</span>
              <span className="text-[10px] text-arena-teal font-mono ml-2 hidden sm:inline-block">PUBLIC VERIFIER</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateToApp('play')}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-arena-textSecondary hover:text-arena-textPrimary px-3 py-1.5 rounded-lg transition-colors"
            >
              <span>Casual Puzzles</span>
            </button>

            <button
              onClick={() => navigateToApp('arena')}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-arena-textSecondary hover:text-arena-textPrimary px-3 py-1.5 rounded-lg transition-colors"
            >
              <span>1v1 Code Duel</span>
            </button>

            <button
              onClick={handlePlayChallenge}
              className="btn-primary py-2 px-4 text-xs font-bold gap-1.5 shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Play Now (Guest)</span>
            </button>
          </div>

        </div>
      </header>

      {/* 2. Main Public Hero & Result Showcase */}
      <main className="flex-1 w-[94%] max-w-4xl mx-auto px-4 py-10 sm:py-14 space-y-8 flex flex-col items-center justify-center animate-in fade-in">
        
        {/* Verification Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#182326] border border-[#2A3B3F] text-arena-teal text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-arena-teal" />
          <span>VERIFIED PERFORMANCE CERTIFICATE</span>
          <span className="text-arena-textSubtle">•</span>
          <span className="text-arena-textSecondary">{result.createdAt}</span>
        </div>

        {/* Hero Title */}
        <div className="text-center space-y-2 max-w-xl">
          <h1 className="text-2xl sm:text-4xl font-black text-arena-textPrimary tracking-tight">
            {result.player.displayName} challenged you on DEVARENA!
          </h1>
          <p className="text-xs sm:text-sm text-arena-textSecondary leading-relaxed">
            {result.isBattle
              ? `Completed an algorithmic 1v1 battle on ${result.problemTitle || result.gameOrBattle}. Think you can beat their code execution speed?`
              : `Scored ${result.scoreOrResult} in ${result.gameOrBattle}. Test your cognitive reflexes and see how you rank!`}
          </p>
        </div>

        {/* 3. Original DEVARENA Result Card (High Polish Midnight & Amber) */}
        <div className="w-full max-w-md p-6 sm:p-7 rounded-2xl bg-[#161F22] border border-[#2B3B3F] shadow-2xl space-y-5 relative overflow-hidden">
          
          {/* Subtle Ambient Radial Highlight */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-arena-amber/10 rounded-full blur-2xl pointer-events-none" />

          {/* Card Top Brand Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#111719] border border-[#2A3B3F] flex items-center justify-center text-arena-amber font-bold text-xs">
                DA
              </div>
              <span className="font-extrabold text-xs tracking-tight text-arena-textPrimary">DEVARENA</span>
            </div>

            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#111719] border border-arena-teal/40 text-arena-teal text-[10px] font-mono font-bold">
              <Check className="w-3 h-3" />
              <span>OFFICIAL SCORE</span>
            </div>
          </div>

          {/* Core Game Score Display */}
          <div className="text-center py-4 px-3 rounded-xl bg-[#111719] border border-[#263539] space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-arena-textSubtle font-semibold font-mono">
              {result.gameOrBattle}
            </span>
            <div className="text-3xl font-black text-arena-amber tracking-tight font-mono">
              {result.scoreOrResult}
            </div>
            {result.subtitle && (
              <p className="text-xs text-arena-textSecondary leading-snug">
                {result.subtitle}
              </p>
            )}
          </div>

          {/* Player Identity Row */}
          <div className="flex items-center justify-between pt-2 border-t border-[#232F32]">
            <div className="flex items-center gap-3">
              <img
                src={result.player.avatar}
                alt={result.player.displayName}
                className="w-10 h-10 rounded-xl object-cover border border-[#2B3B3F]"
              />
              <div className="text-left">
                <div className="font-bold text-sm text-arena-textPrimary leading-snug">
                  {result.player.displayName}
                </div>
                <div className="text-[11px] text-arena-textSubtle font-mono">
                  @{result.player.username}
                </div>
              </div>
            </div>

            <div className="text-right space-y-0.5">
              <div className="font-bold text-arena-amber font-mono text-xs">
                {result.player.rating} Elo
              </div>
              <div className="text-[10px] text-arena-warning font-semibold flex items-center justify-end gap-1">
                <Flame className="w-3 h-3 fill-current" />
                <span>{result.player.streak || 1}d Streak</span>
              </div>
            </div>
          </div>

          {/* Metrics Telemetry Grid */}
          {result.customStats && result.customStats.length > 0 && (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#232F32]">
              {result.customStats.map((stat, idx) => (
                <div key={idx} className="bg-[#111719] p-2.5 rounded-xl text-center border border-[#263539]">
                  <div className="text-[9px] text-arena-textSubtle uppercase font-mono tracking-wider">{stat.label}</div>
                  <div className="text-xs font-bold text-arena-textPrimary mt-0.5">{stat.value}</div>
                </div>
              ))}
            </div>
          )}

          {/* Platform Tagline Footer */}
          <div className="text-center pt-1 border-t border-[#232F32]">
            <span className="text-[10px] text-arena-textSubtle font-mono">
              Play together. Think faster. Code stronger.
            </span>
          </div>

        </div>

        {/* 4. Action Banner & Call to Action Buttons */}
        {showNotice && (
          <div className="w-full max-w-md p-3.5 rounded-xl bg-arena-amber/15 border border-arena-amber/40 text-arena-textPrimary text-xs space-y-1 animate-in fade-in">
            <div className="flex items-center gap-1.5 font-bold text-arena-amber">
              <Check className="w-4 h-4 text-arena-amber shrink-0" />
              <span>Post content copied to clipboard!</span>
            </div>
            <p className="text-[11px] text-arena-textSecondary leading-relaxed pl-5.5">
              Paste it directly into your LinkedIn post window.
            </p>
          </div>
        )}

        <div className="w-full max-w-md space-y-3">
          
          {/* PRIMARY CTA: Play This Challenge */}
          <button
            onClick={handlePlayChallenge}
            className="w-full py-3.5 px-6 rounded-xl bg-arena-amber hover:bg-[#EAA030] text-[#111719] font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.99]"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Play This Challenge (No Login Needed)</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* LinkedIn Re-Share Button */}
          <button
            onClick={handleShareOnLinkedIn}
            className="w-full py-3 px-4 rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
          >
            <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.62 1.62 0 1 0 0-3.24 1.62 1.62 0 0 0 0 3.24M7.86 18.5V10.13H5.07V18.5h2.79Z" />
            </svg>
            <span>Share This Result on LinkedIn</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </button>

          {/* Copy Link Button */}
          <button
            onClick={handleCopyLink}
            className="w-full btn-secondary py-2.5 px-4 text-xs font-semibold flex items-center justify-center gap-2"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-arena-teal" />
                <span className="text-arena-teal">Copied Public Result Link!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Public Result Link</span>
              </>
            )}
          </button>

        </div>

      </main>

      {/* 5. Clean Public Footer */}
      <footer className="w-full border-t border-arena-border/40 py-6 text-center text-xs text-arena-textSubtle">
        <p>© 2026 DEVARENA. The Social Gaming & Competitive Developer Platform.</p>
      </footer>

    </div>
  );
};

