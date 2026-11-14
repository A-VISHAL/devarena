import React, { useState } from 'react';
import { 
  X, 
  RotateCw, 
  Share2, 
  Pin, 
  ShieldCheck, 
  CheckCircle2, 
  Copy, 
  Check, 
  Trophy, 
  Lock, 
  Sparkles,
  QrCode,
  ExternalLink,
  Code2
} from 'lucide-react';
import { CollectibleCard } from '../../types/cards';
import { CardArtwork } from './CardArtwork';
import { sound } from '../../utils/sound';

interface CardDetailModalProps {
  card: CollectibleCard | null;
  onClose: () => void;
  onShare: (card: CollectibleCard) => void;
  isPinned?: boolean;
  onTogglePin?: (card: CollectibleCard) => void;
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({
  card,
  onClose,
  onShare,
  isPinned = false,
  onTogglePin
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!card) return null;

  const { rarity, unlocked } = card;

  const handleFlip = () => {
    sound.playClick();
    setIsFlipped(!isFlipped);
  };

  const handleCopyLink = () => {
    sound.playClick();
    const url = `${window.location.origin}/app/cards?id=${card.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0F10]/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg bg-[#141B1D] border border-[#2A373B] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Modal Top Navigation Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#232F32]">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-[#1A2326] border border-[#2B3B3F] flex items-center justify-center text-[10px] font-mono font-bold text-arena-amber">
              DA
            </div>
            <div>
              <span className="font-mono text-xs font-bold text-arena-textSecondary block leading-none">
                {card.cardId}
              </span>
              <span className="text-[10px] text-arena-textSubtle uppercase tracking-wider font-semibold">
                Collectible Inspector
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleFlip}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1A2426] border border-[#2B393C] text-xs font-semibold text-arena-textSecondary hover:text-arena-textPrimary hover:border-arena-borderHover transition-all"
              title="Flip Card between Artwork and Technical Telemetry"
            >
              <RotateCw className="w-3.5 h-3.5 text-arena-amber" />
              <span>{isFlipped ? 'Front' : 'Flip Details'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-arena-textSubtle hover:text-arena-textPrimary hover:bg-[#202C2F] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {/* Card Presentation Container with Flip animation */}
          <div className="w-full max-w-sm mx-auto perspective-1000">
            <div 
              onClick={handleFlip}
              className={`relative w-full rounded-2xl border transition-all duration-500 preserve-3d cursor-pointer ${
                rarity === 'legendary' 
                  ? 'border-[#F5AA3B]/60 shadow-[0_16px_40px_-10px_rgba(245,170,59,0.3)]' 
                  : rarity === 'epic'
                  ? 'border-amber-400/40 shadow-[0_12px_32px_-8px_rgba(214,158,46,0.2)]'
                  : 'border-[#303E42] shadow-xl'
              }`}
              style={{
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                transformStyle: 'preserve-3d'
              }}
            >
              {/* ================= FRONT FACE ================= */}
              <div 
                className={`w-full rounded-2xl p-5 bg-gradient-to-b from-[#1A2326] via-[#151D1F] to-[#111719] space-y-4 backface-hidden ${
                  isFlipped ? 'pointer-events-none' : ''
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[#253235]">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-arena-textPrimary">DEVARENA</span>
                    <span className="text-[10px] font-mono text-arena-textSubtle">• {card.cardId}</span>
                  </div>

                  <span className="text-[10px] font-mono font-black px-2.5 py-0.5 rounded border border-arena-amber/40 bg-arena-amber/15 text-arena-amber uppercase tracking-wider">
                    {card.rarity}
                  </span>
                </div>

                {/* Artwork */}
                <div className="relative w-full h-44 rounded-xl overflow-hidden border border-[#273539] bg-[#12181A]">
                  <CardArtwork
                    artworkType={card.artworkType}
                    rarity={card.rarity}
                    unlocked={unlocked}
                  />

                  {!unlocked && (
                    <div className="absolute inset-0 bg-[#0F1416]/90 flex flex-col items-center justify-center p-4 text-center">
                      <Lock className="w-8 h-8 text-arena-amber mb-2" />
                      <span className="text-xs font-bold text-arena-textPrimary uppercase tracking-wider">
                        LOCKED ACHIEVEMENT
                      </span>
                      <p className="text-[11px] text-arena-textSecondary mt-1 max-w-xs">
                        {card.unlockCriteria}
                      </p>
                    </div>
                  )}
                </div>

                {/* Title & Description */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-lg text-arena-textPrimary">
                      {card.title}
                    </h3>
                    <span className="text-xs font-mono font-bold text-arena-teal">
                      {card.benchmarkPercentile || 'Verified'}
                    </span>
                  </div>

                  <p className="text-xs text-arena-textSecondary leading-relaxed">
                    {card.description}
                  </p>
                </div>

                {/* Verified Metrics */}
                {card.metrics && card.metrics.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-[#12181A] border border-[#253337]">
                    {card.metrics.map((m, idx) => (
                      <div key={idx} className="text-left">
                        <span className="block text-[10px] uppercase font-bold text-arena-textSubtle">
                          {m.label}
                        </span>
                        <span className="font-mono text-xs font-bold text-arena-textPrimary block mt-0.5">
                          {m.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Footer seal */}
                <div className="flex items-center justify-between text-[11px] text-arena-textSubtle pt-1 border-t border-[#232F32]">
                  <div className="flex items-center gap-1.5 text-arena-teal font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Cryptographically Verified</span>
                  </div>
                  <span className="font-mono text-[10px] text-arena-amber">
                    Click to flip ↻
                  </span>
                </div>
              </div>

              {/* ================= BACK FACE (Technical Telemetry) ================= */}
              <div 
                className={`absolute inset-0 w-full h-full rounded-2xl p-5 bg-gradient-to-b from-[#182124] to-[#101517] space-y-4 backface-hidden rotate-y-180 flex flex-col justify-between ${
                  !isFlipped ? 'pointer-events-none' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-[#253235]">
                    <div className="flex items-center gap-1.5">
                      <Code2 className="w-4 h-4 text-arena-teal" />
                      <span className="font-mono font-bold text-xs text-arena-textPrimary">
                        TECHNICAL TELEMETRY
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-arena-amber font-bold">
                      {card.engineBuild || 'DEVARENA-V2.4'}
                    </span>
                  </div>

                  {/* Verification Key Block */}
                  <div className="mt-3 p-3 rounded-xl bg-[#111719] border border-[#263438] space-y-2">
                    <div className="text-left">
                      <span className="text-[9px] font-mono uppercase text-arena-textSubtle block">
                        VERIFICATION HASH
                      </span>
                      <span className="font-mono text-xs text-arena-teal font-bold tracking-wider">
                        {card.verifiedHash || '0xDA88-9B21-EF4A'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#202C2F] text-left">
                      <div>
                        <span className="text-[9px] font-mono uppercase text-arena-textSubtle block">
                          EARNED DATE
                        </span>
                        <span className="font-mono text-xs text-arena-textPrimary font-semibold">
                          {card.unlockedAt || 'Locked'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] font-mono uppercase text-arena-textSubtle block">
                          PERCENTILE
                        </span>
                        <span className="font-mono text-xs text-arena-amber font-semibold">
                          {card.benchmarkPercentile || 'Top 10%'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Criteria Log */}
                  <div className="mt-3 text-left space-y-1">
                    <span className="text-[10px] uppercase font-bold text-arena-textSubtle block">
                      ACCOMPLISHMENT AUDIT
                    </span>
                    <p className="text-xs font-mono text-arena-textSecondary leading-relaxed bg-[#131A1C] p-2.5 rounded-lg border border-[#232F32]">
                      &gt; {card.unlockCriteria}
                      <br />
                      &gt; Status: {unlocked ? 'PASSED_AND_SEALED' : 'AWAITING_CRITERIA'}
                    </p>
                  </div>
                </div>

                {/* Back Footer Signature */}
                <div className="pt-2 border-t border-[#232F32] flex items-center justify-between text-[11px] text-arena-textSubtle">
                  <span className="font-mono text-[10px] text-arena-textSubtle">
                    Earn your own. Challenge on DEVARENA.
                  </span>
                  <span className="font-mono text-[10px] text-arena-amber">
                    Click to flip ↻
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <div className="flex flex-col sm:flex-row gap-2.5">
              {unlocked ? (
                <button
                  onClick={() => onShare(card)}
                  className="btn-primary flex-1 py-2.5 px-4 text-xs font-bold gap-2 shadow-[0_0_16px_rgba(230,167,70,0.3)]"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share & Export Card</span>
                </button>
              ) : (
                <div className="flex-1 py-2.5 px-4 rounded-xl bg-[#182124] border border-[#28363A] text-xs font-semibold text-arena-textSubtle flex items-center justify-center gap-2">
                  <Lock className="w-4 h-4 text-arena-amber" />
                  <span>Locked: Complete criteria to earn card</span>
                </div>
              )}

              {unlocked && onTogglePin && (
                <button
                  onClick={() => {
                    sound.playClick();
                    onTogglePin(card);
                  }}
                  className={`btn-secondary py-2.5 px-4 text-xs font-semibold gap-2 transition-all ${
                    isPinned ? 'border-arena-amber text-arena-amber' : ''
                  }`}
                >
                  <Pin className="w-4 h-4" />
                  <span>{isPinned ? 'Pinned on Profile' : 'Pin to Profile'}</span>
                </button>
              )}
            </div>

            <button
              onClick={handleCopyLink}
              className="w-full py-2 px-3 rounded-xl bg-[#162022] border border-[#28373A] text-xs font-medium text-arena-textSecondary hover:text-arena-textPrimary hover:bg-[#1E292C] flex items-center justify-center gap-1.5 transition-all"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-arena-teal" />
                  <span className="text-arena-teal">Achievement link copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-arena-textSubtle" />
                  <span>Copy Direct Card Link</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
