import React, { useState } from 'react';
import { X, Copy, Check, Share2, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sound } from '../../utils/sound';

export const ShareCardModal: React.FC = () => {
  const { shareCardData, closeShareModal, user } = useApp();
  const [copied, setCopied] = useState(false);

  if (!shareCardData) return null;

  const shareUrl = window.location.origin;

  const generateShareText = () => {
    return `DEVARENA:
${shareCardData.gameOrBattle}
${shareCardData.scoreOrResult}
Player: @${user.username} (${user.rating} Elo • ${user.streak}d streak)

Can you beat my score?
${shareUrl}`;
  };

  const handleCopy = () => {
    sound.playClick();
    navigator.clipboard.writeText(generateShareText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-arena-bg/85 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-sm bg-arena-surface border border-arena-border rounded-2xl overflow-hidden shadow-card">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-arena-border">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-arena-blue" />
            <h3 className="font-bold text-arena-textPrimary text-sm">Share Result</h3>
          </div>
          <button 
            onClick={closeShareModal}
            className="p-1 rounded-lg text-arena-textSecondary hover:text-arena-textPrimary hover:bg-arena-elevated"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Card Preview */}
        <div className="p-5">
          <div className="p-5 rounded-xl bg-arena-elevated border border-arena-border space-y-4">
            
            {/* Brand Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-arena-surface border border-arena-border flex items-center justify-center text-arena-blue font-bold text-xs">
                  DA
                </div>
                <span className="font-bold text-xs tracking-tight text-arena-textPrimary">DEVARENA</span>
              </div>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.2 rounded bg-arena-surface text-arena-teal border border-arena-border">
                VERIFIED
              </span>
            </div>

            {/* Game Info */}
            <div className="text-center py-3 rounded-lg bg-arena-surface border border-arena-border">
              <span className="text-[10px] uppercase tracking-wider text-arena-textSubtle font-semibold">
                {shareCardData.gameOrBattle}
              </span>
              <div className="mt-0.5 font-extrabold text-2xl text-arena-textPrimary">
                {shareCardData.scoreOrResult}
              </div>
              {shareCardData.subtitle && (
                <p className="text-[11px] text-arena-textSecondary mt-0.5">{shareCardData.subtitle}</p>
              )}
            </div>

            {/* Player details */}
            <div className="flex items-center justify-between pt-2 border-t border-arena-border text-xs">
              <div className="flex items-center gap-2">
                <img 
                  src={user.avatar} 
                  alt={user.username} 
                  className="w-6 h-6 rounded-md object-cover border border-arena-border" 
                />
                <div>
                  <div className="font-semibold text-arena-textPrimary text-xs">{user.displayName}</div>
                  <div className="text-[10px] text-arena-textSubtle">@{user.username}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-bold text-arena-blue">{user.rating} Elo</div>
                <div className="text-[10px] text-arena-warning font-semibold">{user.streak}d Streak</div>
              </div>
            </div>

            {shareCardData.customStats && (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-arena-border">
                {shareCardData.customStats.map((stat, idx) => (
                  <div key={idx} className="bg-arena-surface p-1.5 rounded text-center border border-arena-border">
                    <div className="text-[9px] text-arena-textSubtle uppercase">{stat.label}</div>
                    <div className="text-xs font-bold text-arena-textPrimary">{stat.value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2.5 mt-4">
            <button
              onClick={handleCopy}
              className="flex-1 btn-primary py-2 gap-1.5 text-xs font-semibold"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>
            <button
              onClick={() => {
                sound.playClick();
                if (navigator.share) {
                  navigator.share({
                    title: 'DEVARENA Score',
                    text: generateShareText(),
                    url: shareUrl
                  }).catch(() => {});
                } else {
                  handleCopy();
                }
              }}
              className="btn-secondary py-2 px-3.5 gap-1.5 text-xs font-medium"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
