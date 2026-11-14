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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-arena-surface border border-arena-border rounded-3xl overflow-hidden shadow-2xl p-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-violet-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-violet-500/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-extrabold text-white">Save Your DEVARENA Account</h3>
          <p className="text-xs text-slate-400 mt-1">
            Turn your guest progress into a permanent identity. All ratings, streaks, and achievements are preserved.
          </p>
        </div>

        {/* Current Guest Stats preserved */}
        <div className="grid grid-cols-3 gap-2 p-3 mb-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
          <div>
            <div className="text-[10px] text-slate-400">Current Rating</div>
            <div className="text-sm font-black text-violet-400 flex items-center justify-center gap-1">
              <Swords className="w-3.5 h-3.5" />
              <span>{user.rating}</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400">Active Streak</div>
            <div className="text-sm font-black text-amber-400 flex items-center justify-center gap-1">
              <Flame className="w-3.5 h-3.5" />
              <span>{user.streak}d</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400">Battles Won</div>
            <div className="text-sm font-black text-emerald-400">
              {user.battlesWon}/{user.battlesTotal}
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Choose Handle / Username
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-500 text-xs font-mono">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''));
                  setError('');
                }}
                placeholder="developer_name"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-7 pr-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                maxLength={24}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                setError('');
              }}
              placeholder="Your Full Name"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
              maxLength={32}
            />
          </div>

          {error && (
            <p className="text-xs text-rose-400 font-medium">{error}</p>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="w-full btn-primary py-2.5 gap-2 text-sm font-bold shadow-lg shadow-violet-500/20"
            >
              <UserCheck className="w-4 h-4" />
              <span>Create Permanent Profile</span>
            </button>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 mt-2">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Instant activation • No password fatigue</span>
          </div>
        </form>

      </div>
    </div>
  );
};

