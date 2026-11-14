import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  Bell, 
  Swords, 
  Flame, 
  User, 
  Volume2, 
  VolumeX, 
  Settings, 
  Compass, 
  ChevronDown, 
  Check, 
  Sparkles, 
  X,
  ExternalLink,
  ShieldCheck,
  Trophy,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sound } from '../../utils/sound';

interface TopHeaderProps {
  onOpenAccountModal: () => void;
  onToggleMobileSidebar: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onOpenAccountModal,
  onToggleMobileSidebar
}) => {
  const { 
    user, 
    activeTab, 
    setActiveTab, 
    isSoundMuted, 
    toggleSound,
    navigateToLanding 
  } = useApp();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(2);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notifications = [
    {
      id: 'notif-1',
      icon: <Swords className="w-4 h-4 text-arena-amber" />,
      title: '1v1 Duel Challenge',
      desc: '@alex_dev challenged you to Two Sum duel.',
      time: '5m ago',
      unread: true,
      actionTab: 'arena' as const
    },
    {
      id: 'notif-2',
      icon: <Flame className="w-4 h-4 text-arena-warning" />,
      title: 'Streak Reminder',
      desc: "Solve today's Daily Word Puzzle to keep your streak!",
      time: '1h ago',
      unread: true,
      actionTab: 'play' as const
    },
    {
      id: 'notif-3',
      icon: <Trophy className="w-4 h-4 text-arena-teal" />,
      title: 'Achievement Unlocked',
      desc: 'You unlocked the [Speed Thinker] card.',
      time: '3h ago',
      unread: false,
      actionTab: 'cards' as const
    }
  ];

  return (
    <header className="sticky top-0 z-40 bg-arena-bg/95 backdrop-blur-md border-b border-arena-border h-14 shrink-0 transition-colors">
      <div className="w-full h-full px-4 sm:px-6 flex items-center justify-between">
        
        {/* ================= LEFT: Brand & Mobile Trigger ================= */}
        <div className="flex items-center gap-3">
          {/* Mobile Off-canvas Drawer Trigger */}
          <button
            onClick={() => {
              sound.playClick();
              onToggleMobileSidebar();
            }}
            className="md:hidden p-1.5 -ml-1 rounded-lg text-arena-textSecondary hover:text-arena-textPrimary hover:bg-arena-surface border border-transparent hover:border-arena-border transition-colors"
            aria-label="Open sidebar menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Brand Logo & Name */}
          <div 
            onClick={() => {
              sound.playClick();
              setActiveTab('home');
            }}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-8 h-8 rounded-xl bg-arena-surface border border-arena-border flex items-center justify-center transition-all group-hover:border-arena-amber/50 shadow-sm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-arena-amber">
                <path d="M6 4L14 12L6 20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="18" cy="18" r="2.5" fill="#83B6A3"/>
              </svg>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-arena-textPrimary group-hover:text-arena-amber transition-colors">
                DEVARENA
              </span>
              <span className="hidden sm:inline-block text-[10px] font-mono text-arena-teal font-semibold tracking-wider">
                PLATFORM
              </span>
            </div>
          </div>

          {/* Tour Shortcut */}
          <button
            onClick={() => {
              sound.playClick();
              navigateToLanding();
            }}
            className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-arena-surface border border-arena-border text-xs text-arena-textSecondary hover:text-arena-amber hover:border-arena-amber/40 transition-all ml-1"
            title="View Public Marketing Landing Page"
          >
            <Compass className="w-3.5 h-3.5 text-arena-amber" />
            <span>Tour</span>
          </button>
        </div>

        {/* ================= RIGHT: Notifications, Stats, User ================= */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={isSoundMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
            className="p-2 rounded-xl bg-arena-surface hover:bg-arena-elevated border border-arena-border text-arena-textSecondary hover:text-arena-textPrimary transition-colors"
          >
            {isSoundMuted ? (
              <VolumeX className="w-4 h-4 text-arena-error" />
            ) : (
              <Volume2 className="w-4 h-4 text-arena-teal" />
            )}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => {
                sound.playClick();
                setNotificationsOpen(prev => !prev);
              }}
              className="p-2 rounded-xl bg-arena-surface hover:bg-arena-elevated border border-arena-border text-arena-textSecondary hover:text-arena-textPrimary transition-colors relative"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifications > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-arena-amber ring-2 ring-arena-bg" />
              )}
            </button>

            {/* Notifications Popover */}
            {notificationsOpen && (
              <div className="absolute right-0 top-12 w-80 sm:w-88 rounded-2xl bg-[#161F22] border border-[#2B3B3F] p-3 shadow-2xl space-y-2 z-50 animate-in fade-in">
                <div className="flex items-center justify-between px-2 py-1.5 border-b border-[#232F32]">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-arena-textPrimary">Notifications</span>
                    {unreadNotifications > 0 && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-arena-amber/15 text-arena-amber border border-arena-amber/30">
                        {unreadNotifications} new
                      </span>
                    )}
                  </div>
                  {unreadNotifications > 0 && (
                    <button
                      onClick={() => setUnreadNotifications(0)}
                      className="text-[11px] text-arena-textSubtle hover:text-arena-textSecondary"
                    >
                      Mark read
                    </button>
                  )}
                </div>

                <div className="space-y-1 max-h-72 overflow-y-auto">
                  {notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => {
                        sound.playClick();
                        setActiveTab(n.actionTab);
                        setNotificationsOpen(false);
                      }}
                      className={`p-2.5 rounded-xl cursor-pointer transition-all flex items-start gap-2.5 ${
                        n.unread ? 'bg-[#12181A] hover:bg-[#1A2427]' : 'hover:bg-[#12181A]/50 opacity-80'
                      }`}
                    >
                      <div className="p-1.5 rounded-lg bg-[#182326] border border-[#27373B] shrink-0 mt-0.5">
                        {n.icon}
                      </div>
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-arena-textPrimary truncate">{n.title}</span>
                          <span className="text-[10px] text-arena-textSubtle font-mono">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-arena-textSecondary leading-snug line-clamp-2">
                          {n.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Active Streak Indicator */}
          <div 
            title={`Active streak: ${user.streak} days`}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-arena-surface border border-arena-border text-xs font-semibold text-arena-textPrimary"
          >
            <Flame className="w-4 h-4 text-arena-warning fill-arena-warning/30" />
            <span className="font-mono font-bold text-arena-warning">{user.streak}d</span>
          </div>

          {/* Elo Rating Badge */}
          <div 
            title={`Competitive Coding Rating: ${user.rating} Elo`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-arena-surface border border-arena-border text-xs font-semibold text-arena-textPrimary font-mono"
          >
            <Swords className="w-3.5 h-3.5 text-arena-amber" />
            <span className="text-arena-amber font-bold">{user.rating}</span>
          </div>

          {/* User Profile Menu Dropdown */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => {
                sound.playClick();
                setProfileMenuOpen(prev => !prev);
              }}
              className="flex items-center gap-2 p-1 pr-2 sm:pr-2.5 rounded-xl bg-arena-surface hover:bg-arena-elevated border border-arena-border transition-all group"
            >
              <img 
                src={user.avatar} 
                alt={user.username} 
                className="w-7 h-7 rounded-lg object-cover border border-[#2B3B3F]" 
              />
              <span className="text-xs font-bold text-arena-textPrimary hidden sm:inline max-w-[90px] truncate">
                {user.displayName}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-arena-textSubtle group-hover:text-arena-textPrimary transition-colors" />
            </button>

            {/* Profile Dropdown Menu */}
            {profileMenuOpen && (
              <div className="absolute right-0 top-12 w-64 rounded-2xl bg-[#161F22] border border-[#2B3B3F] p-2.5 shadow-2xl space-y-1.5 z-50 animate-in fade-in text-left">
                
                {/* User Info Header */}
                <div className="p-2.5 rounded-xl bg-[#111719] border border-[#243336] space-y-1">
                  <div className="font-bold text-xs text-arena-textPrimary truncate">{user.displayName}</div>
                  <div className="text-[11px] text-arena-textSubtle font-mono truncate">@{user.username}</div>
                  <div className="flex items-center gap-3 pt-1 text-[10px] text-arena-textSecondary font-mono">
                    <span className="text-arena-amber">{user.rating} Elo</span>
                    <span>•</span>
                    <span className="text-arena-warning">{user.streak}d Streak</span>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="space-y-0.5 pt-1">
                  <button
                    onClick={() => {
                      sound.playClick();
                      setActiveTab('profile');
                      setProfileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-arena-textSecondary hover:text-arena-textPrimary hover:bg-[#1C272A] transition-colors"
                  >
                    <User className="w-4 h-4 text-arena-amber" />
                    <span>My Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      sound.playClick();
                      onOpenAccountModal();
                      setProfileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-arena-textSecondary hover:text-arena-textPrimary hover:bg-[#1C272A] transition-colors"
                  >
                    <Settings className="w-4 h-4 text-arena-teal" />
                    <span>Account Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      sound.playClick();
                      navigateToLanding();
                      setProfileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-arena-textSecondary hover:text-arena-textPrimary hover:bg-[#1C272A] transition-colors"
                  >
                    <Compass className="w-4 h-4 text-arena-amber" />
                    <span>Platform Tour</span>
                  </button>
                </div>

                {/* Guest Save Progress CTA */}
                {user.isGuest && (
                  <div className="pt-1.5 border-t border-[#232F32]">
                    <button
                      onClick={() => {
                        sound.playClick();
                        onOpenAccountModal();
                        setProfileMenuOpen(false);
                      }}
                      className="w-full btn-primary py-2 px-3 text-xs font-bold justify-center"
                    >
                      Save Guest Progress
                    </button>
                  </div>
                )}

              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
