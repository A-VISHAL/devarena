import React, { useState, useMemo } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Share2, 
  Sparkles, 
  Link as LinkIcon, 
  FileText, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sound } from '../../utils/sound';
import { 
  generateLinkedInPostText, 
  buildShareableResultUrl, 
  saveSharedResult, 
  copyTextToClipboard,
  getLinkedInShareUrl 
} from '../../utils/resultShare';
import { PublicSharedResult } from '../../types';

export const ShareCardModal: React.FC = () => {
  const { shareCardData, closeShareModal, user } = useApp();
  
  const [copiedText, setCopiedText] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showLinkedInNotice, setShowLinkedInNotice] = useState(false);
  const [showPostPreview, setShowPostPreview] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);

  // Generate public result model & URL once per modal open
  const { publicResult, publicResultUrl, linkedInPostText } = useMemo(() => {
    if (!shareCardData) {
      return { publicResult: null, publicResultUrl: '', linkedInPostText: '' };
    }

    const resultId = shareCardData.shareId || `da_res_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

    const res: PublicSharedResult = {
      id: resultId,
      title: shareCardData.title,
      gameOrBattle: shareCardData.gameOrBattle,
      scoreOrResult: shareCardData.scoreOrResult,
      subtitle: shareCardData.subtitle,
      ratingChange: shareCardData.ratingChange,
      badge: shareCardData.badge,
      customStats: shareCardData.customStats,
      gameId: shareCardData.gameId,
      gameTitle: shareCardData.gameTitle,
      score: shareCardData.score,
      roundsOrMoves: shareCardData.roundsOrMoves,
      streak: shareCardData.streak !== undefined ? shareCardData.streak : user.streak,
      timeTakenSec: shareCardData.timeTakenSec,
      isBattle: shareCardData.isBattle,
      problemTitle: shareCardData.problemTitle,
      opponentName: shareCardData.opponentName,
      battleResult: shareCardData.battleResult,
      executionTime: shareCardData.executionTime,
      testCasesPassed: shareCardData.testCasesPassed,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      player: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        headline: user.headline || 'Software Developer & Algorithmic Duelist',
        avatar: user.avatar,
        rating: user.rating,
        streak: user.streak
      }
    };

    // Save to persistent storage and cache
    saveSharedResult(res);

    const url = buildShareableResultUrl(res);
    const postText = generateLinkedInPostText(shareCardData, user, url);

    return {
      publicResult: res,
      publicResultUrl: url,
      linkedInPostText: postText
    };
  }, [shareCardData, user]);

  if (!shareCardData || !publicResult) return null;

  // 1. Share on LinkedIn
  const handleShareOnLinkedIn = async () => {
    sound.playClick();
    setCopyError(null);

    // 1 & 2: URL & Post text are generated above
    // 3: Copy generated post text to clipboard
    const copied = await copyTextToClipboard(linkedInPostText);
    
    if (copied) {
      setShowLinkedInNotice(true);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 3000);
    } else {
      setCopyError('Could not auto-copy post text. Please use the "Copy Post Text" button below.');
    }

    // 4: Open LinkedIn's official share URL
    const linkedInShareUrl = getLinkedInShareUrl(publicResultUrl);
    window.open(linkedInShareUrl, '_blank', 'noopener,noreferrer');
  };

  // 2. Copy Post Text
  const handleCopyPostText = async () => {
    sound.playClick();
    setCopyError(null);
    const copied = await copyTextToClipboard(linkedInPostText);
    if (copied) {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    } else {
      setCopyError('Clipboard access denied. Please manually select and copy text.');
    }
  };

  // 3. Copy Result Link
  const handleCopyLink = async () => {
    sound.playClick();
    setCopyError(null);
    const copied = await copyTextToClipboard(publicResultUrl);
    if (copied) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } else {
      setCopyError('Clipboard access denied. Please manually copy the URL.');
    }
  };

  // 4. Native Share (mobile / tablet support)
  const handleNativeShare = async () => {
    sound.playClick();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `DEVARENA: ${shareCardData.gameOrBattle}`,
          text: linkedInPostText,
          url: publicResultUrl
        });
      } catch (e) {
        // User cancelled or unsupported
      }
    } else {
      handleShareOnLinkedIn();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-arena-bg/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md bg-arena-surface border border-arena-border rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-arena-border shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-arena-amber" />
            <h3 className="font-bold text-arena-textPrimary text-sm">Share Result</h3>
          </div>
          <button 
            onClick={closeShareModal}
            className="p-1.5 rounded-lg text-arena-textSecondary hover:text-arena-textPrimary hover:bg-arena-elevated transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 space-y-4 overflow-y-auto">
          
          {/* 1. DEVARENA Result Card Preview (Preserving Midnight & Amber Identity) */}
          <div className="p-5 rounded-xl bg-arena-elevated border border-arena-border space-y-4 shadow-sm">
            
            {/* Brand Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-arena-surface border border-arena-border flex items-center justify-center text-arena-amber font-bold text-xs">
                  DA
                </div>
                <span className="font-bold text-xs tracking-tight text-arena-textPrimary">DEVARENA</span>
              </div>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-arena-lime/10 text-arena-lime border border-arena-lime/30 flex items-center gap-1">
                <Check className="w-3 h-3 text-arena-lime" />
                VERIFIED
              </span>
            </div>

            {/* Game / Challenge Info */}
            <div className="text-center py-3.5 px-3 rounded-lg bg-arena-surface border border-arena-border">
              <span className="text-[10px] uppercase tracking-wider text-arena-textSubtle font-semibold block">
                {shareCardData.gameOrBattle}
              </span>
              <div className="mt-1 font-extrabold text-2xl text-arena-textPrimary">
                {shareCardData.scoreOrResult}
              </div>
              {shareCardData.subtitle && (
                <p className="text-[11px] text-arena-textSecondary mt-1 leading-snug">
                  {shareCardData.subtitle}
                </p>
              )}
            </div>

            {/* Player details */}
            <div className="flex items-center justify-between pt-2 border-t border-arena-border text-xs">
              <div className="flex items-center gap-2.5">
                <img 
                  src={user.avatar} 
                  alt={user.username} 
                  className="w-7 h-7 rounded-lg object-cover border border-arena-border" 
                />
                <div>
                  <div className="font-semibold text-arena-textPrimary text-xs leading-none">
                    {user.displayName}
                  </div>
                  <div className="text-[10px] text-arena-textSubtle font-mono mt-0.5">
                    @{user.username}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-bold text-arena-amber font-mono text-xs">{user.rating} Elo</div>
                <div className="text-[10px] text-arena-warning font-semibold">{user.streak}d Streak 🔥</div>
              </div>
            </div>

            {/* Custom Stats Grid */}
            {shareCardData.customStats && shareCardData.customStats.length > 0 && (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-arena-border">
                {shareCardData.customStats.map((stat, idx) => (
                  <div key={idx} className="bg-arena-surface p-2 rounded-lg text-center border border-arena-border">
                    <div className="text-[9px] text-arena-textSubtle uppercase font-mono">{stat.label}</div>
                    <div className="text-xs font-bold text-arena-textPrimary mt-0.5">{stat.value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. Instruction Banner when LinkedIn Share clicked */}
          {showLinkedInNotice && (
            <div className="p-3.5 rounded-xl bg-arena-amber/10 border border-arena-amber/40 text-arena-textPrimary text-xs space-y-1 animate-in fade-in">
              <div className="flex items-center gap-1.5 font-bold text-arena-amber">
                <Check className="w-4 h-4 text-arena-amber shrink-0" />
                <span>Your post text has been copied!</span>
              </div>
              <p className="text-[11px] text-arena-textSecondary leading-relaxed pl-5.5">
                Paste it into your LinkedIn post when the sharing window opens.
              </p>
            </div>
          )}

          {/* Error Notice if clipboard failed */}
          {copyError && (
            <div className="p-3 rounded-xl bg-arena-error/15 border border-arena-error/40 text-arena-error text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{copyError}</span>
            </div>
          )}

          {/* 3. PRIMARY SOCIAL ACTION: Share on LinkedIn */}
          <button
            onClick={handleShareOnLinkedIn}
            className="w-full py-3 px-4 rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-[0.99]"
          >
            {/* LinkedIn Official Logo SVG */}
            <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.62 1.62 0 1 0 0-3.24 1.62 1.62 0 0 0 0 3.24M7.86 18.5V10.13H5.07V18.5h2.79Z" />
            </svg>
            <span>Share on LinkedIn</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </button>

          {/* 4. Secondary Action Buttons Row */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleCopyPostText}
              className="btn-secondary py-2.5 px-3 text-xs font-semibold gap-1.5 flex items-center justify-center"
              title="Copy the generated post text to your clipboard"
            >
              {copiedText ? (
                <>
                  <Check className="w-3.5 h-3.5 text-arena-lime" />
                  <span className="text-arena-lime">Copied Text!</span>
                </>
              ) : (
                <>
                  <FileText className="w-3.5 h-3.5 text-arena-amber" />
                  <span>Copy Post Text</span>
                </>
              )}
            </button>

            <button
              onClick={handleCopyLink}
              className="btn-secondary py-2.5 px-3 text-xs font-semibold gap-1.5 flex items-center justify-center"
              title="Copy the public result link"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-arena-lime" />
                  <span className="text-arena-lime">Copied Link!</span>
                </>
              ) : (
                <>
                  <LinkIcon className="w-3.5 h-3.5 text-arena-cyan" />
                  <span>Copy Result Link</span>
                </>
              )}
            </button>
          </div>

          {/* Native Share button (where supported / mobile) */}
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              onClick={handleNativeShare}
              className="w-full py-2 px-3 rounded-lg bg-arena-surface border border-arena-border text-xs text-arena-textSecondary hover:text-arena-textPrimary hover:bg-arena-elevated flex items-center justify-center gap-1.5 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 text-arena-cyan" />
              <span>More Share Options...</span>
            </button>
          )}

          {/* 5. Collapsible Generated Post Text Preview */}
          <div className="pt-2 border-t border-arena-border">
            <button
              onClick={() => setShowPostPreview(!showPostPreview)}
              className="w-full flex items-center justify-between text-left text-xs font-semibold text-arena-textSecondary hover:text-arena-textPrimary py-1"
            >
              <div className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-arena-textSubtle" />
                <span>Preview Generated Post Content</span>
              </div>
              {showPostPreview ? (
                <ChevronUp className="w-3.5 h-3.5 text-arena-textSubtle" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-arena-textSubtle" />
              )}
            </button>

            {showPostPreview && (
              <div className="mt-2 p-3 rounded-xl bg-arena-bg border border-arena-border text-[11px] font-mono text-arena-textSecondary whitespace-pre-wrap leading-relaxed animate-in fade-in select-all max-h-48 overflow-y-auto">
                {linkedInPostText}
              </div>
            )}
          </div>

          {/* Public Result URL Notice */}
          <div className="text-center pt-1">
            <span className="text-[10px] text-arena-textSubtle">
              Generates a verified, publicly accessible result URL without login requirement.
            </span>
          </div>

        </div>

      </div>
    </div>
  );
};
