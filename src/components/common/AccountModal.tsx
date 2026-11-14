import React, { useState } from 'react';
import { X, Sparkles, ShieldCheck, UserCheck, Flame, Swords } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sound } from '../../utils/sound';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose }) => {
  const { user, upgradeGuestToAccount } = useApp();
  const [username, setUsername] = useState(user.username.replace('Player_', 'dev_'));
  const [displayName, setDisplayName] = useState(user.displayName);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || username.trim().length < 3) {
      setError('Username must be at least 3 characters.');
      sound.playWrong();
      return;
    }
    if (!displayName.trim()) {
      setError('Display name is required.');
      sound.playWrong();
      return;
    }

    upgradeGuestToAccount(username, displayName);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-arena-bg/85 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-sm bg-arena-surface border border-arena-border rounded-2xl overflow-hidden shadow-card p-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-arena-textSecondary hover:text-arena-textPrimary hover:bg-arena-elevated transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <div className="w-10 h-10 rounded-lg bg-arena-elevated border border-arena-border text-arena-blue flex items-center justify-center mx-auto mb-2">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-arena-textPrimary">Save Your Account</h3>
          <p className="text-xs text-arena-textSecondary mt-1 leading-relaxed">
            Preserve your guest ratings, streaks, and achievements into a permanent identity.
          </p>
        </div>

        {/* Current Guest Stats preserved */}
        <div className="grid grid-cols-3 gap-2 p-2.5 mb-4 rounded-xl bg-arena-elevated border border-arena-border text-center">
          <div>
            <div className="text-[10px] text-arena-textSubtle font-medium">Rating</div>
            <div className="text-xs font-bold text-arena-blue mt-0.5">{user.rating} Elo</div>
          </div>
          <div>
            <div className="text-[10px] text-arena-textSubtle font-medium">Streak</div>
            <div className="text-xs font-bold text-arena-warning mt-0.5">{user.streak}d</div>
          </div>
          <div>
            <div className="text-[10px] text-arena-textSubtle font-medium">Battles</div>
            <div className="text-xs font-bold text-arena-teal mt-0.5">{user.battlesWon}W</div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-semibold text-arena-textSubtle mb-1">
              Choose Username
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-arena-textSubtle text-xs font-mono">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''));
                  setError('');
                }}
                placeholder="handle"
                className="w-full bg-arena-elevated border border-arena-border rounded-lg pl-7 pr-3 py-1.5 text-xs text-arena-textPrimary focus:outline-none focus:border-arena-borderHover font-mono"
                maxLength={24}
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-arena-textSubtle mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                setError('');
              }}
              placeholder="Your Name"
              className="w-full bg-arena-elevated border border-arena-border rounded-lg px-3 py-1.5 text-xs text-arena-textPrimary focus:outline-none focus:border-arena-borderHover"
              maxLength={32}
            />
          </div>

          {error && (
            <p className="text-xs text-arena-error font-medium">{error}</p>
          )}

          <div className="pt-1">
            <button
              type="submit"
              className="w-full btn-primary py-2 text-xs font-semibold"
            >
              <UserCheck className="w-3.5 h-3.5 mr-1.5" />
              <span>Create Account</span>
            </button>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-arena-textSubtle">
            <ShieldCheck className="w-3.5 h-3.5 text-arena-teal" />
            <span>Instant activation</span>
          </div>
        </form>

      </div>
    </div>
  );
};
