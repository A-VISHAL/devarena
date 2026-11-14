import React, { useState } from 'react';
import { 
  Flame, 
  Swords, 
  Gamepad2, 
  BookOpen, 
  Users, 
  Trophy, 
  User, 
  Volume2, 
  VolumeX, 
  Sparkles,
  Menu,
  X,
  Share2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NavigationTab } from '../../types';

interface NavbarProps {
  onOpenAccountModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAccountModal }) => {
  const { 
    user, 
    activeTab, 
    setActiveTab, 
    isSoundMuted, 
    toggleSound, 
    openShareModal 
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: NavigationTab; label: string; icon: React.ReactNode; isDev?: boolean }[] = [
    { id: 'home', label: 'Home', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'play', label: 'Play', icon: <Gamepad2 className="w-4 h-4 text-emerald-400" /> },
    { id: 'arena', label: 'Code Arena', icon: <Swords className="w-4 h-4 text-violet-400" />, isDev: true },
    { id: 'learn', label: 'Learn DSA', icon: <BookOpen className="w-4 h-4 text-cyan-400" />, isDev: true },
    { id: 'community', label: 'Community', icon: <Users className="w-4 h-4 text-amber-400" /> },
    { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy className="w-4 h-4 text-yellow-400" /> },
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 bg-arena-bg/80 backdrop-blur-xl border-b border-arena-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 p-[1.5px] shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/40 transition-all">
            <div className="w-full h-full bg-arena-bg rounded-[10px] flex items-center justify-center font-black tracking-tighter text-lg">
              <span className="text-violet-400">D</span>
              <span className="text-cyan-400">A</span>
            </div>
          </div>
          <div>
            <div className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent flex items-center gap-1.5">
              DEVARENA
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20">PRO</span>
            </div>
            <p className="text-[10px] font-medium text-slate-400 hidden sm:block">Play. Think. Code.</p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-arena-surface/80 p-1 rounded-2xl border border-arena-border">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-600/30 to-indigo-600/30 text-white border border-violet-500/40 shadow-sm shadow-violet-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.isDev && (
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse-subtle" />
                )}
              </button>
            );
          })}
        </nav>

        {/* User Stats & Actions */}
        <div className="flex items-center gap-2.5">
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={isSoundMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
            className="p-2 rounded-xl bg-arena-surface hover:bg-arena-surfaceLight border border-arena-border text-slate-400 hover:text-slate-200 transition-colors"
          >
            {isSoundMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Streak indicator */}
          <div 
            title={`${user.streak} day streak! Keep playing to maintain it.`}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold"
          >
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400/20 animate-pulse" />
            <span>{user.streak}d</span>
          </div>

          {/* Dev Rating */}
          <div 
            title={`Competitive Coding Rating: ${user.rating} Elo`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-bold"
          >
            <Swords className="w-3.5 h-3.5 text-violet-400" />
            <span>{user.rating}</span>
          </div>

          {/* Guest vs Account Pill */}
          {user.isGuest ? (
            <button
              onClick={onOpenAccountModal}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600/30 to-violet-600/30 hover:from-cyan-600/50 hover:to-violet-600/50 border border-cyan-500/30 text-cyan-200 text-xs font-semibold transition-all shadow-sm shadow-cyan-500/10"
            >
              <span>Save Account</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-2 p-1 pr-3 rounded-full bg-arena-surface border border-arena-border hover:border-violet-500/40 transition-colors"
            >
              <img 
                src={user.avatar} 
                alt={user.username} 
                className="w-7 h-7 rounded-full object-cover border border-violet-500/30" 
              />
              <span className="text-xs font-bold text-slate-200 hidden sm:inline">{user.username}</span>
            </button>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 md:hidden rounded-xl bg-arena-surface border border-arena-border text-slate-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-arena-surface border-b border-arena-border px-4 py-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold ${
                activeTab === item.id 
                  ? 'bg-violet-600/20 text-white border border-violet-500/30' 
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.isDev && (
                <span className="text-[10px] uppercase font-bold text-violet-400 px-1.5 py-0.5 rounded bg-violet-500/10 border border-violet-500/20">DEV</span>
              )}
            </button>
          ))}
          {user.isGuest && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAccountModal();
              }}
              className="w-full mt-2 py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-600 to-violet-600 text-white text-xs font-bold text-center"
            >
              Convert Guest to Full Account
            </button>
          )}
        </div>
      )}
    </header>
  );
};

