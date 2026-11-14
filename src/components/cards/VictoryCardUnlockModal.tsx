import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  Sparkles, 
  Share2, 
  CheckCircle2, 
  ShieldCheck, 
  X, 
  ArrowRight 
} from 'lucide-react';
import { CollectibleCard } from '../../types/cards';
import { CollectibleCardItem } from './CollectibleCardItem';
import { sound } from '../../utils/sound';

interface VictoryCardUnlockModalProps {
  card: CollectibleCard | null;
  onClose: () => void;
  onInspect: (card: CollectibleCard) => void;
  onShare: (card: CollectibleCard) => void;
}

export const VictoryCardUnlockModal: React.FC<VictoryCardUnlockModalProps> = ({
  card,
  onClose,
  onInspect,
  onShare
}) => {
  useEffect(() => {
    if (card) {
      sound.playVictory();
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#F5AA3B', '#69B9A7', '#F3F1E9']
        });
      } catch (e) {
        // ignore
      }
    }
  }, [card]);

  if (!card) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090C0E]/90 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md bg-[#141B1D] border border-arena-amber/50 rounded-3xl p-6 sm:p-8 text-center shadow-[0_0_50px_rgba(245,170,59,0.25)] space-y-6">
        
        {/* Top Eyebrow Badge - Neon Lime */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-arena-lime/15 border border-arena-lime/40 text-arena-lime text-xs font-bold uppercase tracking-wider shadow-[0_0_12px_rgba(181,255,74,0.25)]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>New Collectible Card Earned!</span>
        </div>

        {/* Card Display with subtle hover */}
        <div className="w-full max-w-[280px] mx-auto scale-95 sm:scale-100">
          <CollectibleCardItem
            card={card}
            compact
            onInspect={() => onInspect(card)}
          />
        </div>

        {/* Narrative text */}
        <div className="space-y-1">
          <h3 className="text-xl font-black text-arena-textPrimary">
            {card.title}
          </h3>
          <p className="text-xs text-arena-textSecondary leading-relaxed">
            {card.description}
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-2.5 pt-2">
          <div className="flex gap-2.5">
            <button
              onClick={() => onShare(card)}
              className="btn-primary flex-1 py-2.5 text-xs font-bold gap-2 shadow-[0_0_16px_rgba(230,167,70,0.3)] flex items-center justify-center"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Card</span>
            </button>

            <button
              onClick={() => onInspect(card)}
              className="btn-secondary flex-1 py-2.5 text-xs font-semibold gap-2 flex items-center justify-center"
            >
              <span>Inspect Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2 text-xs font-medium text-arena-textSubtle hover:text-arena-textSecondary transition-colors"
          >
            Continue to Game
          </button>
        </div>

      </div>
    </div>
  );
};

