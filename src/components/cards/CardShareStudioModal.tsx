import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Download, 
  Share2, 
  Copy, 
  Check, 
  Linkedin, 
  Send, 
  Sparkles, 
  ShieldCheck,
  Trophy,
  Users,
  ExternalLink,
  MessageSquare,
  Award
} from 'lucide-react';
import { CollectibleCard } from '../../types/cards';
import { UserProfile } from '../../types';
import { sound } from '../../utils/sound';
import { useApp } from '../../context/AppContext';

interface CardShareStudioModalProps {
  card: CollectibleCard | null;
  user: UserProfile;
  onClose: () => void;
}

// Cross-browser safe rounded rectangle drawer for HTML5 Canvas
function drawSafeRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, r);
  } else {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.arcTo(x + w, y, x + w, y + radius, radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.arcTo(x + w, y + h, x + w - radius, y + h, radius);
    ctx.lineTo(x + radius, y + h);
    ctx.arcTo(x, y + h, x, y + h - radius, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.closePath();
  }
}

// Fallback clipboard writer that works across all browser security environments
async function safeCopyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {}
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch {}
  return false;
}

export const CardShareStudioModal: React.FC<CardShareStudioModalProps> = ({
  card,
  user,
  onClose
}) => {
  const { addPost, setActiveTab } = useApp();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedDiscord, setCopiedDiscord] = useState(false);
  const [copiedLinkedIn, setCopiedLinkedIn] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [postedToCommunity, setPostedToCommunity] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);

  // Safe variables
  const safeUsername = user?.username || 'developer';
  const safeDisplayName = user?.displayName || 'Developer';
  const safeRating = user?.rating ?? 1200;
  const safeStreak = user?.streak ?? 0;

  const cardTitle = card?.title || 'DEVARENA Collectible';
  const cardDesc = card?.description || 'Earned through verified algorithmic duel performance on DEVARENA.';
  const cardRarity = card?.rarity || 'epic';
  const cardId = card?.cardId || 'DA-CARD-001';
  const verifiedHash = card?.verifiedHash || '0xDA-VERIFIED-771B';
  const benchmarkPercentile = card?.benchmarkPercentile || 'Top 3.8%';

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://devarena-ten.vercel.app';
  const shareUrl = `${origin}/app/profile?ref=${encodeURIComponent(safeUsername)}&milestone=${encodeURIComponent(card?.id || 'card')}`;
  const shareText = `🏆 Proud to unlock the verified [${cardTitle}] (${cardRarity.toUpperCase()}) milestone on DEVARENA!\n\n"${cardDesc}"\n\n🎯 Rank: ${safeRating} Elo | Benchmark: ${benchmarkPercentile}\nCan you beat my score? Challenge me on DEVARENA:\n👉 ${shareUrl}`;

  // Draw card onto high-resolution Canvas for PNG download
  useEffect(() => {
    if (!card) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      // Canvas size (800 x 1000 high-res)
      canvas.width = 800;
      canvas.height = 1000;

      // 1. Dark Background Fill
      ctx.fillStyle = '#111719';
      ctx.fillRect(0, 0, 800, 1000);

      // 2. Subtle Grid Background Pattern
      ctx.strokeStyle = 'rgba(105, 185, 167, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < 800; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 1000);
        ctx.stroke();
      }
      for (let y = 0; y < 1000; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(800, y);
        ctx.stroke();
      }

      // 3. Card Outer Frame with Rarity Accent
      const accentColor = cardRarity === 'legendary' 
        ? '#F5AA3B' 
        : cardRarity === 'epic' 
        ? '#E5A33D' 
        : cardRarity === 'rare' 
        ? '#E6A746' 
        : cardRarity === 'uncommon' 
        ? '#69B9A7' 
        : '#7E8E91';

      // Rounded Card Container
      ctx.fillStyle = '#161F22';
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 3;
      drawSafeRoundRect(ctx, 50, 50, 700, 900, 24);
      ctx.fill();
      ctx.stroke();

      // 4. Header Bar
      ctx.fillStyle = '#111719';
      ctx.fillRect(50, 50, 700, 80);
      ctx.strokeStyle = '#273438';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(50, 130);
      ctx.lineTo(750, 130);
      ctx.stroke();

      // Brand Logo & Title
      ctx.fillStyle = '#F5AA3B';
      ctx.font = 'bold 22px monospace';
      ctx.fillText('DEVARENA', 80, 98);

      ctx.fillStyle = '#A5AAA5';
      ctx.font = '14px monospace';
      ctx.fillText(`// ${cardId}`, 230, 98);

      // Rarity Badge Pill
      ctx.fillStyle = accentColor;
      drawSafeRoundRect(ctx, 600, 75, 120, 32, 8);
      ctx.fill();

      ctx.fillStyle = '#111719';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(cardRarity.toUpperCase(), 660, 96);
      ctx.textAlign = 'left';

      // 5. Card Artwork Box
      ctx.fillStyle = '#111719';
      ctx.strokeStyle = '#2A3A3E';
      ctx.lineWidth = 2;
      drawSafeRoundRect(ctx, 85, 160, 630, 350, 16);
      ctx.fill();
      ctx.stroke();

      // Central geometric icon
      ctx.beginPath();
      ctx.arc(400, 310, 64, 0, Math.PI * 2);
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = '#F3F1E9';
      ctx.font = 'bold 44px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(card?.category === 'coding' ? '⌨' : card?.category === 'events' ? '🏆' : '🧩', 400, 325);

      // Benchmark Percentile Ribbon
      ctx.fillStyle = '#161F22';
      ctx.fillRect(250, 420, 300, 40);
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(250, 420, 300, 40);

      ctx.fillStyle = accentColor;
      ctx.font = 'bold 16px monospace';
      ctx.fillText(`VERIFIED: ${benchmarkPercentile}`, 400, 445);
      ctx.textAlign = 'left';

      // 6. Card Title & Description
      ctx.fillStyle = '#F3F1E9';
      ctx.font = 'bold 34px sans-serif';
      ctx.fillText(cardTitle, 85, 560);

      ctx.fillStyle = '#9BA8A8';
      ctx.font = '16px sans-serif';
      ctx.fillText(cardDesc.slice(0, 75), 85, 600);
      if (cardDesc.length > 75) {
        ctx.fillText(cardDesc.slice(75, 150), 85, 625);
      }

      // 7. Player Stats Bar
      ctx.fillStyle = '#111719';
      ctx.strokeStyle = '#273438';
      ctx.lineWidth = 1.5;
      drawSafeRoundRect(ctx, 85, 660, 630, 100, 14);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#F3F1E9';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(safeDisplayName, 115, 702);

      ctx.fillStyle = '#7E8E91';
      ctx.font = '14px monospace';
      ctx.fillText(`@${safeUsername}`, 115, 730);

      // Rating & Streak
      ctx.fillStyle = '#F5AA3B';
      ctx.font = 'bold 18px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${safeRating} Elo`, 685, 702);

      ctx.fillStyle = '#69B9A7';
      ctx.font = '13px monospace';
      ctx.fillText(`${safeStreak}d Streak 🔥`, 685, 730);
      ctx.textAlign = 'left';

      // 8. Verified Metrics Box
      if (Array.isArray(card?.metrics) && card.metrics.length > 0) {
        ctx.fillStyle = '#1A2528';
        ctx.strokeStyle = '#2D3D41';
        drawSafeRoundRect(ctx, 85, 780, 630, 70, 10);
        ctx.fill();
        ctx.stroke();

        card.metrics.forEach((m, idx) => {
          if (!m) return;
          const xOffset = 115 + idx * 300;
          ctx.fillStyle = '#7E8E91';
          ctx.font = 'bold 11px monospace';
          ctx.fillText(String(m.label || '').toUpperCase(), xOffset, 805);

          ctx.fillStyle = '#F3F1E9';
          ctx.font = 'bold 18px monospace';
          ctx.fillText(String(m.value || ''), xOffset, 832);
        });
      }

      // 9. Footer Signature
      ctx.fillStyle = '#A5AAA5';
      ctx.font = 'italic 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('“Earn your own. Challenge me on DEVARENA.”', 400, 895);

      ctx.fillStyle = '#69B9A7';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(`VERIFICATION HASH: ${verifiedHash} • DEVARENA.APP`, 400, 925);
      ctx.textAlign = 'left';

      setCanvasReady(true);
    } catch (err) {
      console.error('[CardShareStudioModal] Canvas render warning:', err);
      setCanvasReady(true);
    }
  }, [card, safeUsername, safeDisplayName, safeRating, safeStreak, cardTitle, cardDesc, cardRarity, cardId, verifiedHash, benchmarkPercentile]);

  if (!card) return null;

  // Handle Post to DEVARENA Community Feed
  const handlePostCardToCommunity = () => {
    sound.playVictory();
    try {
      addPost({
        title: `🏆 Unlocked Card: ${cardTitle}`,
        content: `Just unlocked the verified [${cardTitle}] (${cardRarity.toUpperCase()}) collectible card on DEVARENA!\n\n"${cardDesc}"\n\nRarity: ${cardRarity.toUpperCase()} • Benchmark: ${benchmarkPercentile} • Verification: ${verifiedHash}`,
        type: 'achievement_unlocked',
        collectibleCardId: card.id,
        author: {
          id: user?.id || 'guest',
          username: safeUsername,
          displayName: safeDisplayName,
          headline: user?.headline || 'Ranked Duelist & Algorithm Solver',
          avatar: user?.avatar,
          rating: safeRating
        },
        tags: [
          'achievement',
          card.category || 'coding',
          cardRarity,
          'devarena'
        ],
        metadata: {
          badgeName: cardTitle,
          score: cardRarity.toUpperCase()
        }
      });
      setPostedToCommunity(true);
    } catch (e) {
      console.error('Error posting to community:', e);
      setPostedToCommunity(true);
    }
  };

  const handleGoToCommunity = () => {
    sound.playClick();
    onClose();
    if (typeof setActiveTab === 'function') {
      setActiveTab('community');
    }
  };

  // Handle LinkedIn Share
  const handleLinkedInShare = async () => {
    sound.playClick();
    await safeCopyToClipboard(shareText);
    setCopiedLinkedIn(true);
    setTimeout(() => setCopiedLinkedIn(false), 4000);

    // Official LinkedIn Share dialog
    const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(linkedInShareUrl, '_blank', 'noopener,noreferrer');
  };

  // Handle PNG Download
  const handleDownloadPNG = () => {
    sound.playVictory();
    setIsGenerating(true);
    const canvas = canvasRef.current;
    if (!canvas) {
      setIsGenerating(false);
      return;
    }

    try {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `devarena-card-${cardId.toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.warn('Canvas download error', e);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Native Share
  const handleNativeShare = async () => {
    sound.playClick();
    if (navigator?.share) {
      try {
        await navigator.share({
          title: `DEVARENA: ${cardTitle}`,
          text: shareText,
          url: shareUrl
        });
      } catch {
        // cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  // Handle Twitter / X Share
  const handleTwitterShare = async () => {
    sound.playClick();
    await safeCopyToClipboard(shareText);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
  };

  // Handle WhatsApp Share
  const handleWhatsAppShare = async () => {
    sound.playClick();
    await safeCopyToClipboard(shareText);
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  // Handle Discord Share
  const handleDiscordShare = async () => {
    sound.playClick();
    const discordFormatted = `🏆 **DEVARENA Verified Milestone: [${cardTitle}]**\n> "${cardDesc}"\n> **Tier:** ${cardRarity.toUpperCase()} • **Player:** ${safeDisplayName} (@${safeUsername}) • **Elo:** ${safeRating}\n\n⚡ Take on the challenge:\n👉 ${shareUrl}`;
    await safeCopyToClipboard(discordFormatted);
    setCopiedDiscord(true);
    setTimeout(() => setCopiedDiscord(false), 2500);
    window.open('https://discord.com/channels/@me', '_blank', 'noopener,noreferrer');
  };

  // Handle Copy Link
  const handleCopyLink = async () => {
    sound.playClick();
    const ok = await safeCopyToClipboard(shareUrl);
    if (ok) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080B0C]/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-[#141B1D] border border-[#2B383C] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[94vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#232F32]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white font-mono flex items-center gap-2">
                <span>Victory Studio — Share Card</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#252D30] text-amber-400 border border-amber-500/30">
                  {cardId}
                </span>
              </h3>
              <p className="text-[11px] text-neutral-400 font-mono">Export high-resolution card & share achievement to LinkedIn and Community</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#202C2F] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Studio Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {/* Card Export Preview Canvas */}
          <div className="flex flex-col items-center">
            <div className="relative w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl border border-[#2F3E42] bg-[#111719]">
              <canvas
                ref={canvasRef}
                className="w-full h-auto block"
              />
            </div>
            <span className="text-[10px] text-neutral-500 mt-2 font-mono">
              Ready for 800×1000 High-Res PNG Export
            </span>
          </div>

          {/* Primary Action 1: Post Card to Community Feed */}
          <div className="space-y-3">
            {!postedToCommunity ? (
              <button
                onClick={handlePostCardToCommunity}
                className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold text-xs sm:text-sm font-mono flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-amber-500/20 active:scale-[0.99]"
              >
                <Users className="w-4 h-4 text-black shrink-0" />
                <span>Post Card to DEVARENA Community Feed</span>
                <Send className="w-3.5 h-3.5 text-black" />
              </button>
            ) : (
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between text-xs font-mono animate-in fade-in">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Card Published to DEVARENA Community Feed!</span>
                </div>
                <button
                  onClick={handleGoToCommunity}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-400 text-black font-bold hover:bg-emerald-300 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <span>View in Feed</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Primary Action 2: Share to LinkedIn */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleLinkedInShare}
                className="py-3 px-4 rounded-xl bg-[#0A66C2] hover:bg-[#084e96] text-white text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-[#0A66C2]/25"
              >
                <Linkedin className="w-4 h-4 fill-current shrink-0" />
                <span>Share to LinkedIn</span>
              </button>

              {/* Download PNG */}
              <button
                onClick={handleDownloadPNG}
                disabled={isGenerating}
                className="py-3 px-4 rounded-xl bg-[#252D30] hover:bg-[#2F383C] text-neutral-200 border border-neutral-700 hover:border-amber-500/50 text-xs font-mono font-bold gap-2 flex items-center justify-center transition-all"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>Download High-Res PNG</span>
              </button>
            </div>

            {/* LinkedIn Copy Notification */}
            {copiedLinkedIn && (
              <div className="p-2.5 rounded-lg bg-[#0A66C2]/15 border border-[#0A66C2]/40 text-xs font-mono text-[#70B5F9] flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 shrink-0 text-[#70B5F9]" />
                <span>Formatted achievement post copied to clipboard! Paste it into your LinkedIn post dialog.</span>
              </div>
            )}

            {/* Secondary Sharing Platforms */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              {/* WhatsApp */}
              <button
                onClick={handleWhatsAppShare}
                className="py-2.5 px-3 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-[#25D366] text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>

              {/* Discord */}
              <button
                onClick={handleDiscordShare}
                className="py-2.5 px-3 rounded-xl bg-[#5865F2]/15 hover:bg-[#5865F2]/25 border border-[#5865F2]/40 text-[#5865F2] text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-all"
                title="Copy Discord formatted message and open Discord"
              >
                <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028z" />
                </svg>
                <span>{copiedDiscord ? 'Copied!' : 'Discord'}</span>
              </button>

              {/* Twitter / X */}
              <button
                onClick={handleTwitterShare}
                className="py-2.5 px-3 rounded-xl bg-[#101314] hover:bg-[#1C2426] border border-[#2B383C] text-white text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span>Share on X</span>
              </button>

              {/* Native Device Share */}
              <button
                onClick={handleNativeShare}
                className="py-2.5 px-3 rounded-xl bg-[#252D30] hover:bg-[#2F383C] text-neutral-300 text-xs font-mono font-semibold gap-1.5 flex items-center justify-center border border-neutral-700"
              >
                <Share2 className="w-3.5 h-3.5 text-amber-400" />
                <span>More</span>
              </button>
            </div>

            {/* Direct Link Copy Bar */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#101314] border border-[#253337]">
              <span className="font-mono text-xs text-neutral-300 truncate flex-1 px-2">
                {shareUrl}
              </span>
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 bg-[#252D30] hover:bg-[#2F383C] text-neutral-200 text-xs font-mono rounded-lg transition-colors flex items-center gap-1.5 shrink-0 border border-neutral-700"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>

            {/* Helper Notice */}
            <p className="text-[11px] text-neutral-500 font-mono text-center">
              Sharing copies verified milestone signature: <br />
              <span className="text-neutral-400 italic">“Earn your own. Challenge me on DEVARENA.”</span>
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
