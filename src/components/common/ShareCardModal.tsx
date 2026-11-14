import React, { useState, useRef } from 'react';
import { X, Copy, Check, Share2, Sparkles, Trophy, Download } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sound } from '../../utils/sound';

export const ShareCardModal: React.FC = () => {
  const { shareCardData, closeShareModal, user } = useApp();
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!shareCardData) return null;

  const shareUrl = window.location.origin;

  const generateShareText = () => {
    return `🔥 DEVARENA Competition:
🎮 ${shareCardData.gameOrBattle}
🏆 ${shareCardData.scoreOrResult}
👤 Player: ${user.username}
⚡ Rating: ${user.rating} Elo • Streak: ${user.streak}d

Can you beat my score? Challenge me on DEVARENA:
${shareUrl}`;
  };

  const handleCopy = () => {
    sound.playClick();
    navigator.clipboard.writeText(generateShareText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-arena-surface border border-arena-border rounded-3xl overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-arena-border">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-400" />
            <h3 className="font-bold text-white text-base">Shareable Result Card</h3>
          </div>
          <button 
            onClick={closeShareModal}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Preview */}
        <div className="p-6">
          <div 
            ref={cardRef}
            className="relative p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-arena-card to-slate-950 border border-violet-500/30 shadow-xl overflow-hidden"
          >
            {/* Ambient background glows */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-violet-600/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-cyan-600/20 rounded-full blur-2xl pointer-events-none" />

            {/* Brand Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center font-black text-xs text-white">
                  DA
                </div>
                <div>
                  <span className="font-extrabold text-sm tracking-tight text-white">DEVARENA</span>
                  <p className="text-[10px] text-slate-400 font-medium">Casual Gaming & Developer Arena</p>
                </div>
              </div>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/30">
                VERIFIED
              </span>
            </div>

            {/* Game / Challenge Info */}
            <div className="text-center py-4 my-2 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                {shareCardData.gameOrBattle}
              </span>
              <div className="mt-1 font-black text-2xl sm:text-3xl bg-gradient-to-r from-violet-300 via-white to-cyan-300 bg-clip-text text-transparent">
                {shareCardData.scoreOrResult}
              </div>
              {shareCardData.subtitle && (
                <p className="text-xs text-slate-400 mt-1 font-medium">{shareCardData.subtitle}</p>
              )}
            </div>

            {/* Player details */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
              <div className="flex items-center gap-2">
                <img 
                  src={user.avatar} 
                  alt={user.username} 
                  className="w-7 h-7 rounded-full object-cover border border-violet-500/40" 
                />
                <div>
                  <div className="font-bold text-slate-200">{user.displayName}</div>
                  <div className="text-[10px] text-slate-400">@{user.username}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-bold text-violet-400">{user.rating} Elo</div>
                <div className="text-[10px] text-amber-400 font-semibold">{user.streak}d Streak 🔥</div>
              </div>
            </div>

            {/* Custom metadata items if any */}
            {shareCardData.customStats && (
              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800/50">
                {shareCardData.customStats.map((stat, idx) => (
                  <div key={idx} className="bg-slate-950/40 p-2 rounded-lg text-center">
                    <div className="text-[10px] text-slate-400">{stat.label}</div>
                    <div className="text-xs font-bold text-white">{stat.value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mt-5">
            <button
              onClick={handleCopy}
              className="flex-1 btn-primary py-2.5 gap-2 text-sm"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Share Text'}</span>
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
              className="btn-secondary py-2.5 px-4 gap-2 text-sm"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

