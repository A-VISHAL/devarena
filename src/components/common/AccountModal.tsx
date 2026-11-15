import React, { useState } from 'react';
import { X, Sparkles, ShieldCheck, UserCheck, Flame, Swords, Trophy, CheckCircle2, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sound } from '../../utils/sound';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose }) => {
  const { user, upgradeGuestToAccount, updateUserProfile } = useApp();
  const [username, setUsername] = useState(
    user.username.startsWith('Player_') || user.username.startsWith('guest_')
      ? user.username.replace(/^(Player_|guest_)/, 'dev_')
      : user.username
  );
  const [displayName, setDisplayName] = useState(user.displayName);
  const [headline, setHeadline] = useState(user.headline || 'Full-Stack Developer & Algorithm Solver');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    
    if (!cleanUsername || cleanUsername.length < 3) {
      setError('Username must be at least 3 characters (letters, numbers, underscores).');
      sound.playWrong();
      return;
    }
    if (cleanUsername.length > 20) {
      setError('Username cannot exceed 20 characters.');
      sound.playWrong();
      return;
    }
    if (!displayName.trim()) {
      setError('Display name is required.');
      sound.playWrong();
      return;
    }

    setIsSubmitting(true);
    sound.playVictory();
    
    upgradeGuestToAccount(cleanUsername, displayName.trim());
    if (headline.trim()) {
      updateUserProfile({ headline: headline.trim() });
    }

    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0D0E]/80 backdrop-blur-md animate-in fade-in">
      <div 
        className="relative w-full max-w-md bg-[#141A1C] border border-[#253235] rounded-2xl overflow-hidden shadow-2xl p-6 sm:p-7 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-5 right-5 p-1.5 rounded-lg text-[#8A999E] hover:text-[#F5F5F5] hover:bg-[#1C2528] border border-transparent hover:border-[#2B393D] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-11 h-11 rounded-xl bg-[#1A2326] border border-[#2E3C40] text-[#FFAD42] flex items-center justify-center mx-auto mb-3 shadow-sm">
            <Sparkles className="w-5 h-5 text-[#FFAD42]" />
          </div>
          <h2 className="text-lg font-bold text-[#F5F5F5] tracking-tight">Claim Developer Account</h2>
          <p className="text-xs text-[#8A999E] leading-relaxed max-w-xs mx-auto mt-1">
            Convert your guest session into a permanent identity with a custom handle. All stats and unlocked cards stay saved.
          </p>
        </div>

        {/* Subtle Session Telemetry Banner */}
        <div className="grid grid-cols-4 gap-2 p-3 mb-5 rounded-xl bg-[#0F1416] border border-[#222E31] text-center">
          <div className="p-1">
            <div className="text-[10px] text-[#718287] font-medium uppercase tracking-wider">Rating</div>
            <div className="text-xs font-bold text-[#00E5FF] mt-0.5 font-mono">{user.rating} Elo</div>
          </div>
          <div className="p-1 border-l border-[#1D272A]">
            <div className="text-[10px] text-[#718287] font-medium uppercase tracking-wider">Streak</div>
            <div className="text-xs font-bold text-[#FFAD42] mt-0.5 font-mono">{user.streak}d</div>
          </div>
          <div className="p-1 border-l border-[#1D272A]">
            <div className="text-[10px] text-[#718287] font-medium uppercase tracking-wider">Wins</div>
            <div className="text-xs font-bold text-[#B5FF4A] mt-0.5 font-mono">{user.battlesWon}W</div>
          </div>
          <div className="p-1 border-l border-[#1D272A]">
            <div className="text-[10px] text-[#718287] font-medium uppercase tracking-wider">Solved</div>
            <div className="text-xs font-bold text-[#F5F5F5] mt-0.5 font-mono">{user.problemsSolved?.length || 0}</div>
          </div>
        </div>

        {/* Account Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Username Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#D4DCDE]">
                Username Handle
              </label>
              <span className="text-[10px] font-mono text-[#718287]">
                {username.length}/20 chars
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-[#718287] text-xs font-mono select-none">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''));
                  setError('');
                }}
                placeholder="developer_handle"
                className="w-full bg-[#1A2225] border border-[#29373B] rounded-xl pl-7 pr-3 py-2 text-xs text-[#F5F5F5] placeholder-[#57676B] focus:outline-none focus:border-[#FFAD42]/60 focus:ring-1 focus:ring-[#FFAD42]/30 font-mono transition-colors"
                maxLength={20}
                required
              />
            </div>
            <div className="mt-1 flex items-center justify-between text-[10px] text-[#718287] font-mono">
              <span>devarena.io/@{username || 'handle'}</span>
              <span>Letters, numbers, underscores</span>
            </div>
          </div>

          {/* Display Name Input */}
          <div>
            <label className="block text-xs font-semibold text-[#D4DCDE] mb-1.5">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                setError('');
              }}
              placeholder="e.g. Alex Rivera"
              className="w-full bg-[#1A2225] border border-[#29373B] rounded-xl px-3 py-2 text-xs text-[#F5F5F5] placeholder-[#57676B] focus:outline-none focus:border-[#FFAD42]/60 focus:ring-1 focus:ring-[#FFAD42]/30 transition-colors"
              maxLength={32}
              required
            />
          </div>

          {/* Developer Headline */}
          <div>
            <label className="block text-xs font-semibold text-[#D4DCDE] mb-1.5">
              Headline (Optional)
            </label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Competitive Problem Solver & React Engineer"
              className="w-full bg-[#1A2225] border border-[#29373B] rounded-xl px-3 py-2 text-xs text-[#F5F5F5] placeholder-[#57676B] focus:outline-none focus:border-[#FFAD42]/60 focus:ring-1 focus:ring-[#FFAD42]/30 transition-colors"
              maxLength={64}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400 font-medium">
              {error}
            </div>
          )}

          {/* Prominent Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-[#FFAD42] hover:bg-[#F29F30] active:scale-[0.99] text-[#101314] text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="w-4 h-4 border-2 border-[#101314] border-t-transparent rounded-full animate-spin" />
              ) : (
                <UserCheck className="w-4 h-4" />
              )}
              <span>Create Account</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Subtle Security & Architecture Note */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#718287] pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span>Instant local activation • Zero passwords required</span>
          </div>

        </form>
      </div>
    </div>
  );
};
