import React from 'react';
import { 
  CheckCircle2, 
  Lock, 
  Sparkles, 
  Share2, 
  Trophy, 
  ShieldCheck,
  QrCode,
  Flame,
  Swords,
  Gamepad2,
  Calendar,
  Layers,
  Pin
} from 'lucide-react';
import { CollectibleCard, CardRarity } from '../../types/cards';
import { CardArtwork } from './CardArtwork';
import { sound } from '../../utils/sound';

interface CollectibleCardItemProps {
  card: CollectibleCard;
  isFlipped?: boolean;
  onFlip?: () => void;
  onInspect?: (card: CollectibleCard) => void;
  onShare?: (card: CollectibleCard) => void;
  isPinned?: boolean;
  onTogglePin?: (card: CollectibleCard) => void;
  compact?: boolean;
}

export const CollectibleCardItem: React.FC<CollectibleCardItemProps> = ({
  card,
  isFlipped = false,
  onFlip,
  onInspect,
  onShare,
  isPinned = false,
  onTogglePin,
  compact = false
}) => {
  const { rarity, unlocked } = card;

  // Rarity-driven aesthetics
  const getRarityConfig = (r: CardRarity) => {
    switch (r) {
      case 'legendary':
        return {
          label: 'LEGENDARY',
          badgeBg: 'bg-amber-500/15 text-[#F5AA3B] border-amber-500/40',
          borderClass: 'border-[#F5AA3B]/50 hover:border-[#F5AA3B]',
          surfaceClass: 'bg-gradient-to-b from-[#1C2528] via-[#161D20] to-[#12181A]',
          glowShadow: 'shadow-[0_12px_36px_-8px_rgba(245,170,59,0.22)]',
          accentText: 'text-[#F5AA3B]',
          animatedBorder: true,
          sealIcon: <Trophy className="w-3 h-3 text-[#F5AA3B]" />
        };
      case 'epic':
        return {
          label: 'EPIC',
          badgeBg: 'bg-amber-400/10 text-amber-300 border-amber-400/30',
          borderClass: 'border-[#4D3F28] hover:border-amber-400/60',
          surfaceClass: 'bg-gradient-to-b from-[#1B2426] via-[#151D1F] to-[#111719]',
          glowShadow: 'shadow-[0_8px_28px_-6px_rgba(214,158,46,0.18)]',
          accentText: 'text-amber-400',
          animatedBorder: false,
          sealIcon: <Sparkles className="w-3 h-3 text-amber-400" />
        };
      case 'rare':
        return {
          label: 'RARE',
          badgeBg: 'bg-amber-500/10 text-arena-amber border-arena-amber/30',
          borderClass: 'border-[#423726] hover:border-arena-amber/50',
          surfaceClass: 'bg-[#192224]',
          glowShadow: 'shadow-[0_6px_20px_-4px_rgba(230,167,70,0.12)]',
          accentText: 'text-arena-amber',
          animatedBorder: false,
          sealIcon: <ShieldCheck className="w-3 h-3 text-arena-amber" />
        };
      case 'uncommon':
        return {
          label: 'UNCOMMON',
          badgeBg: 'bg-teal-500/10 text-arena-teal border-arena-teal/30',
          borderClass: 'border-[#28383B] hover:border-arena-teal/50',
          surfaceClass: 'bg-[#172022]',
          glowShadow: 'shadow-[0_6px_20px_-4px_rgba(105,185,167,0.1)]',
          accentText: 'text-arena-teal',
          animatedBorder: false,
          sealIcon: <ShieldCheck className="w-3 h-3 text-arena-teal" />
        };
      case 'common':
      default:
        return {
          label: 'COMMON',
          badgeBg: 'bg-[#243033] text-arena-textSecondary border-[#344447]',
          borderClass: 'border-[#2D3A3D] hover:border-[#3D4F53]',
          surfaceClass: 'bg-[#171E20]',
          glowShadow: 'shadow-card',
          accentText: 'text-arena-textPrimary',
          animatedBorder: false,
          sealIcon: <CheckCircle2 className="w-3 h-3 text-arena-textSubtle" />
        };
    }
  };

  const config = getRarityConfig(rarity);

  const getCategoryIcon = () => {
    switch (card.category) {
      case 'coding':
        return <Swords className="w-3 h-3 text-arena-amber" />;
      case 'events':
        return <Trophy className="w-3 h-3 text-amber-400" />;
      case 'casual':
      default:
        return <Gamepad2 className="w-3 h-3 text-arena-teal" />;
    }
  };

  return (
    <div 
      className={`group relative rounded-2xl select-none transition-all duration-300 preserve-3d ${
        unlocked 
          ? `cursor-pointer ${config.glowShadow} hover:-translate-y-1.5` 
          : 'opacity-70 grayscale-[35%] hover:opacity-85'
      }`}
      onClick={() => {
        if (onInspect) onInspect(card);
      }}
    >
      {/* Legendary Conic Animated Glow Border */}
      {unlocked && config.animatedBorder && (
        <div className="absolute -inset-[1.5px] rounded-2xl bg-[conic-gradient(from_0deg,#F5AA3B,#69B9A7,#F5AA3B)] opacity-60 blur-[1px] animate-spin-slow pointer-events-none -z-10" />
      )}

      {/* Main Card Body */}
      <div className={`relative rounded-2xl border ${config.borderClass} ${config.surfaceClass} p-4 sm:p-5 flex flex-col justify-between overflow-hidden ${compact ? 'h-[360px]' : 'h-[430px]'}`}>
        
        {/* Subtle Tech Watermark Background Text */}
        <div className="absolute right-2 top-10 text-[64px] font-mono font-black text-white/[0.015] pointer-events-none select-none uppercase">
          {card.cardId.slice(-3)}
        </div>

        {/* Card Header Bar */}
        <div>
          <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-[#253236]">
            
            {/* Brand Logo & Card ID */}
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded bg-[#111719] border border-[#2B3B3F] flex items-center justify-center text-[9px] font-black font-mono text-arena-amber">
                DA
              </div>
              <span className="font-mono font-bold text-[11px] text-arena-textSecondary tracking-wider">
                {card.cardId}
              </span>
            </div>

            {/* Rarity & Verified Seal */}
            <div className="flex items-center gap-1.5">
              <span className={`text-[9px] font-mono font-black px-2 py-0.5 rounded border uppercase tracking-wider ${config.badgeBg}`}>
                {config.label}
              </span>

              {unlocked && onTogglePin && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    sound.playClick();
                    onTogglePin(card);
                  }}
                  className={`p-1 rounded hover:bg-[#202D30] transition-colors ${
                    isPinned ? 'text-arena-amber' : 'text-arena-textSubtle hover:text-arena-textSecondary'
                  }`}
                  title={isPinned ? 'Pinned on Profile' : 'Pin to Profile Showcase'}
                >
                  <Pin className="w-3.5 h-3.5 fill-current" />
                </button>
              )}
            </div>
          </div>

          {/* Central Unique Artwork Frame */}
          <div className="relative w-full h-36 sm:h-40 rounded-xl overflow-hidden border border-[#273539] bg-[#12181A] shadow-inner mb-3">
            <CardArtwork
              artworkType={card.artworkType}
              rarity={card.rarity}
              unlocked={unlocked}
            />

            {/* Locked Padlock Overlay */}
            {!unlocked && (
              <div className="absolute inset-0 bg-[#0F1416]/85 backdrop-blur-[2px] flex flex-col items-center justify-center p-3 text-center">
                <div className="w-9 h-9 rounded-full bg-[#182124] border border-[#2A393D] flex items-center justify-center text-arena-textSubtle mb-1.5 shadow-md">
                  <Lock className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-arena-textSecondary">
                  LOCKED COLLECTIBLE
                </span>
              </div>
            )}

            {/* Top-Right Category Pill */}
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-[#12181A]/90 border border-[#2B3B3F] backdrop-blur-md flex items-center gap-1 text-[10px] font-semibold text-arena-textSecondary capitalize">
              {getCategoryIcon()}
              <span>{card.category}</span>
            </div>
          </div>

          {/* Card Title & Description */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm sm:text-base text-arena-textPrimary tracking-tight line-clamp-1 group-hover:text-arena-amber transition-colors">
                {card.title}
              </h3>
              {unlocked && (
                <span className="text-[10px] font-mono text-arena-teal font-semibold shrink-0">
                  {card.benchmarkPercentile || 'Verified'}
                </span>
              )}
            </div>

            <p className="text-[11px] text-arena-textSecondary leading-relaxed line-clamp-2">
              {card.description}
            </p>
          </div>
        </div>

        {/* Card Footer: Verified Metrics & Unlock Status */}
        <div className="pt-3 mt-1 border-t border-[#232F32] space-y-2">
          
          {/* Metrics Preview if unlocked */}
          {unlocked && card.metrics && card.metrics.length > 0 ? (
            <div className="grid grid-cols-2 gap-1.5 p-1.5 rounded-lg bg-[#12181A] border border-[#243336]">
              {card.metrics.map((m, idx) => (
                <div key={idx} className="text-left">
                  <span className="block text-[9px] uppercase font-bold text-arena-textSubtle leading-none">
                    {m.label}
                  </span>
                  <span className="font-mono text-[11px] font-bold text-arena-textPrimary truncate block mt-0.5">
                    {m.value}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-2 rounded-lg bg-[#141B1D] border border-[#232E30] text-[11px] text-arena-textSubtle flex items-start gap-1.5">
              <Lock className="w-3.5 h-3.5 text-arena-amber shrink-0 mt-0.5" />
              <span className="line-clamp-2 leading-tight">
                {card.unlockCriteria}
              </span>
            </div>
          )}

          {/* Bottom Action / Status Line */}
          <div className="flex items-center justify-between text-[10px] text-arena-textSubtle pt-0.5">
            {unlocked ? (
              <span className="flex items-center gap-1 text-arena-teal font-semibold">
                <ShieldCheck className="w-3 h-3 text-arena-teal" />
                <span>Verified Achievement</span>
              </span>
            ) : (
              <span className="text-arena-textSubtle font-mono">
                Req: {card.gameId || 'Code Arena'}
              </span>
            )}

            <div className="flex items-center gap-2">
              {unlocked && onShare && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    sound.playClick();
                    onShare(card);
                  }}
                  className="p-1 rounded text-arena-textSecondary hover:text-arena-amber hover:bg-[#202D30] transition-colors"
                  title="Share Achievement Card"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              )}

              <span className="font-mono font-bold text-arena-textSecondary group-hover:text-arena-amber transition-colors">
                Inspect →
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

