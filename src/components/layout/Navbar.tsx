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
  Menu,
  X,
  Sparkles
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
    toggleSound 
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: NavigationTab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'play', label: 'Play', icon: <Gamepad2 className="w-3.5 h-3.5" /> },
    { id: 'arena', label: 'Code Arena', icon: <Swords className="w-3.5 h-3.5" /> },
    { id: 'learn', label: 'Learn', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'community', label: 'Community', icon: <Users className="w-3.5 h-3.5" /> },
    { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy className="w-3.5 h-3.5" /> },
    { id: 'profile', label: 'Profile', icon: <User className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="sticky top-0 z-50 bg-arena-bg border-b border-arena-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        
        {/* Brand Logo - Minimal & Refined */}
        <div 
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-7 h-7 rounded-lg bg-arena-surface border border-arena-border flex items-center justify-center transition-colors group-hover:border-arena-borderHover">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-arena-blue">
              <path d="M6 4L14 12L6 20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="18" cy="18" r="2.5" fill="#39C6B5"/>
            </svg>
          </div>
          <span className="font-bold text-sm tracking-tight text-arena-textPrimary">
            DEVARENA
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-arena-surface p-1 rounded-lg border border-arena-border">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-arena-elevated text-arena-textPrimary border border-arena-border shadow-subtle'
                    : 'text-arena-textSecondary hover:text-arena-textPrimary hover:bg-arena-elevated/50'
                }`}
              >
                <span className={isActive ? 'text-arena-blue' : 'text-arena-textSubtle'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Stats & Actions */}
        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={isSoundMuted ? 'Unmute Sound' : 'Mute Sound'}
            className="p-1.5 rounded-lg bg-arena-surface hover:bg-arena-elevated border border-arena-border text-arena-textSecondary hover:text-arena-textPrimary transition-colors"
          >
            {isSoundMuted ? (
              <VolumeX className="w-4 h-4 text-arena-error" />
            ) : (
              <Volume2 className="w-4 h-4 text-arena-teal" />
            )}
          </button>

          {/* Streak Indicator */}
          <div 
            title={`${user.streak} day streak`}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-arena-surface border border-arena-border text-xs font-semibold text-arena-textPrimary"
          >
            <Flame className="w-3.5 h-3.5 text-arena-warning" />
            <span>{user.streak}d</span>
          </div>

          {/* Dev Rating Badge */}
          <div 
            title={`Rating: ${user.rating} Elo`}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-arena-surface border border-arena-border text-xs font-semibold text-arena-textPrimary"
          >
            <Swords className="w-3.5 h-3.5 text-arena-blue" />
            <span>{user.rating}</span>
          </div>

          {/* Guest vs Account Pill */}
          {user.isGuest ? (
            <button
              onClick={onOpenAccountModal}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-arena-elevated hover:bg-[#293443] border border-arena-border text-xs font-medium text-arena-textPrimary transition-colors"
            >
              <span>Save Progress</span>
              <span className="w-1.5 h-1.5 rounded-full bg-arena-blue" />
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-2 p-0.5 pr-2.5 rounded-lg bg-arena-surface border border-arena-border hover:border-arena-borderHover transition-colors"
            >
              <img 
                src={user.avatar} 
                alt={user.username} 
                className="w-6 h-6 rounded-md object-cover" 
              />
              <span className="text-xs font-medium text-arena-textPrimary hidden sm:inline">{user.username}</span>
            </button>
          )}

          {/* Mobile menu toggle button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 md:hidden rounded-lg bg-arena-surface border border-arena-border text-arena-textSecondary hover:text-arena-textPrimary"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
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
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium ${
                activeTab === item.id 
                  ? 'bg-arena-elevated text-arena-textPrimary border border-arena-border' 
                  : 'text-arena-textSecondary hover:bg-arena-elevated/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={activeTab === item.id ? 'text-arena-blue' : 'text-arena-textSubtle'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
            </button>
          ))}
          {user.isGuest && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAccountModal();
              }}
              className="w-full mt-2 py-2 px-3 rounded-lg btn-primary text-xs font-medium text-center"
            >
              Save Guest Progress to Account
            </button>
          )}
        </div>
      )}
    </header>
  );
};
