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
  Gamepad2,
  Swords,
  QrCode
} from 'lucide-react';
import { CollectibleCard } from '../../types/cards';
import { UserProfile } from '../../types';
import { sound } from '../../utils/sound';

interface CardShareStudioModalProps {
  card: CollectibleCard | null;
  user: UserProfile;
  onClose: () => void;
}

export const CardShareStudioModal: React.FC<CardShareStudioModalProps> = ({
  card,
  user,
  onClose
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasShared, setHasShared] = useState(false);

  if (!card) return null;

  const shareUrl = `${window.location.origin}/app/cards?id=${card.id}&user=${user.username}`;
  const shareText = `🏆 Just unlocked the verified [${card.title}] (${card.rarity.toUpperCase()}) card on DEVARENA!\n\n${card.description}\n\nEarn your own. Challenge me on DEVARENA:\n${shareUrl}`;

  // Draw card onto high-resolution Canvas for PNG download
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

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
    const accentColor = card.rarity === 'legendary' 
      ? '#F5AA3B' 
      : card.rarity === 'epic' 
      ? '#E5A33D' 
      : card.rarity === 'rare' 
      ? '#E6A746' 
      : card.rarity === 'uncommon' 
      ? '#69B9A7' 
      : '#7E8E91';

    // Rounded Card Container
    ctx.fillStyle = '#161F22';
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(50, 50, 700, 900, 24);
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
    ctx.fillText(`// ${card.cardId}`, 230, 98);

    // Rarity Badge Pill
    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.roundRect(610, 75, 110, 30, 8);
    ctx.fill();

    ctx.fillStyle = '#111719';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(card.rarity.toUpperCase(), 665, 95);
    ctx.textAlign = 'left';

    // 5. Card Artwork Placeholder / Geometric Center
    ctx.fillStyle = '#111719';
    ctx.strokeStyle = '#2A3A3E';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(85, 160, 630, 350, 16);
    ctx.fill();
    ctx.stroke();

    // Central geometric icon
    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.arc(400, 310, 64, 0, Math.PI * 2);
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = '#F3F1E9';
    ctx.font = 'bold 44px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(card.category === 'coding' ? '⌨' : card.category === 'events' ? '🏆' : '🧩', 400, 325);

    // Benchmark Percentile Ribbon
    ctx.fillStyle = '#161F22';
    ctx.fillRect(250, 420, 300, 40);
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(250, 420, 300, 40);

    ctx.fillStyle = accentColor;
    ctx.font = 'bold 16px monospace';
    ctx.fillText(`VERIFIED: ${card.benchmarkPercentile || 'TOP PERCENTILE'}`, 400, 445);
    ctx.textAlign = 'left';

    // 6. Card Title & Description
    ctx.fillStyle = '#F3F1E9';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText(card.title, 85, 560);

    ctx.fillStyle = '#9BA8A8';
    ctx.font = '16px sans-serif';
    ctx.fillText(card.description.slice(0, 75), 85, 600);
    if (card.description.length > 75) {
      ctx.fillText(card.description.slice(75, 150), 85, 625);
    }

    // 7. Player Stats Bar
    ctx.fillStyle = '#111719';
    ctx.strokeStyle = '#273438';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(85, 660, 630, 100, 14);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#F3F1E9';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(user.displayName, 115, 702);

    ctx.fillStyle = '#7E8E91';
    ctx.font = '14px monospace';
    ctx.fillText(`@${user.username}`, 115, 730);

    // Rating & Streak
    ctx.fillStyle = '#F5AA3B';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`${user.rating} Elo`, 685, 702);

    ctx.fillStyle = '#69B9A7';
    ctx.font = '13px monospace';
    ctx.fillText(`${user.streak}d Streak 🔥`, 685, 730);
    ctx.textAlign = 'left';

    // 8. Verified Metrics Box
    if (card.metrics && card.metrics.length > 0) {
      ctx.fillStyle = '#1A2528';
      ctx.strokeStyle = '#2D3D41';
      ctx.beginPath();
      ctx.roundRect(85, 780, 630, 70, 10);
      ctx.fill();
      ctx.stroke();

      card.metrics.forEach((m, idx) => {
        const xOffset = 115 + idx * 300;
        ctx.fillStyle = '#7E8E91';
        ctx.font = 'bold 11px monospace';
        ctx.fillText(m.label.toUpperCase(), xOffset, 805);

        ctx.fillStyle = '#F3F1E9';
        ctx.font = 'bold 18px monospace';
        ctx.fillText(m.value, xOffset, 832);
      });
    }

    // 9. Footer Signature & Call to Action
    ctx.fillStyle = '#A5AAA5';
    ctx.font = 'italic 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('“Earn your own. Challenge me on DEVARENA.”', 400, 895);

    ctx.fillStyle = '#69B9A7';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(`VERIFICATION HASH: ${card.verifiedHash || '0xDA88-9B21-EF4A'} • DEVARENA.APP`, 400, 925);
    ctx.textAlign = 'left';

  }, [card, user]);

  // Handle PNG Download
  const handleDownloadPNG = () => {
    sound.playVictory();
    setIsGenerating(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `devarena-card-${card.cardId.toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.warn('Canvas download error', e);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Web Share
  const handleNativeShare = async () => {
    sound.playClick();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `DEVARENA: ${card.title}`,
          text: shareText,
          url: shareUrl
        });
        setHasShared(true);
      } catch (e) {
        // user cancelled or share failed
      }
    } else {
      handleCopyLink();
    }
  };

  // Handle LinkedIn Share
  const handleLinkedInShare = () => {
    sound.playClick();
    navigator.clipboard.writeText(shareText);
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(linkedInUrl, '_blank', 'noopener,noreferrer');
  };

  // Handle WhatsApp Share
  const handleWhatsAppShare = () => {
    sound.playClick();
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  // Handle Copy Link
  const handleCopyLink = () => {
    sound.playClick();
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080B0C]/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-[#141B1D] border border-[#2B383C] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[94vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#232F32]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-arena-amber/15 border border-arena-amber/40 flex items-center justify-center text-arena-amber">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-arena-textPrimary">Victory Studio — Share Card</h3>
              <p className="text-[11px] text-arena-textSubtle">Export high-resolution collectible card & share verified achievement</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-arena-textSubtle hover:text-arena-textPrimary hover:bg-[#202C2F] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Studio Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Card Export Preview Canvas */}
          <div className="flex flex-col items-center">
            <div className="relative w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl border border-[#2F3E42] bg-[#111719]">
              <canvas
                ref={canvasRef}
                className="w-full h-auto block"
              />
            </div>
            <span className="text-[10px] text-arena-textSubtle mt-2 font-mono">
              Ready for 800x1000 High-Res PNG Export
            </span>
          </div>

          {/* Sharing Channel Actions */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Download PNG */}
              <button
                onClick={handleDownloadPNG}
                disabled={isGenerating}
                className="btn-primary py-3 px-4 text-xs font-bold gap-2 shadow-[0_0_16px_rgba(230,167,70,0.3)] flex items-center justify-center"
              >
                <Download className="w-4 h-4" />
                <span>Download High-Res PNG</span>
              </button>

              {/* LinkedIn Share */}
              <button
                onClick={handleLinkedInShare}
                className="py-3 px-4 rounded-xl bg-[#0A66C2] hover:bg-[#095196] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <Linkedin className="w-4 h-4 fill-current" />
                <span>Share to LinkedIn</span>
              </button>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* WhatsApp Share */}
              <button
                onClick={handleWhatsAppShare}
                className="py-2.5 px-4 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-[#25D366] text-xs font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Share via WhatsApp</span>
              </button>

              {/* Native Device Share / Copy */}
              <button
                onClick={handleNativeShare}
                className="btn-secondary py-2.5 px-4 text-xs font-semibold gap-2 flex items-center justify-center"
              >
                <Share2 className="w-3.5 h-3.5 text-arena-amber" />
                <span>Native Device Share</span>
              </button>

            </div>

            {/* Direct Link Copy Bar */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#12181A] border border-[#253337]">
              <span className="font-mono text-xs text-arena-textSecondary truncate flex-1 px-2">
                {shareUrl}
              </span>
              <button
                onClick={handleCopyLink}
                className="btn-secondary py-1.5 px-3 text-xs font-semibold gap-1.5 shrink-0"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-arena-teal" />
                    <span className="text-arena-teal">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-arena-textSubtle" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>

            {/* LinkedIn Copy Helper Notice */}
            <p className="text-[11px] text-arena-textSubtle text-center">
              Sharing copies verified achievement text with signature: <br />
              <span className="text-arena-textSecondary italic">“Earn your own. Challenge me on DEVARENA.”</span>
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};

