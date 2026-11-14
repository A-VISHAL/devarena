import React, { useEffect } from 'react';
import { 
  Home, 
  Gamepad2, 
  Swords, 
  Layers, 
  BookOpen, 
  Trophy, 
  Users, 
  User, 
  Settings, 
  PanelLeftClose, 
  PanelLeftOpen, 
  ChevronLeft, 
  ChevronRight,
  X,
  Sparkles,
  Flame,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NavigationTab } from '../../types';
import { sound } from '../../utils/sound';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenSettings: () => void;
}

interface NavItemDef {
  id: NavigationTab | 'settings';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  action?: () => void;
}

interface NavSectionDef {
  title: string;
  items: NavItemDef[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  onOpenSettings
}) => {
  const { activeTab, setActiveTab, user } = useApp();

  // Escape key listener to close mobile drawer
  useEffect(() => {
    if (!mobileOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseMobile();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen, onCloseMobile]);

  // Sections strictly matching spec in Section 3:
  // Main, Progress, Social, Account
  const navSections: NavSectionDef[] = [
    {
      title: 'Main',
      items: [
        { id: 'home', label: 'Home', icon: Home },
        { id: 'play', label: 'Play', icon: Gamepad2, badge: 'Daily' },
        { id: 'arena', label: 'Code Arena', icon: Swords, badge: '1v1' }
      ]
    },
    {
      title: 'Progress',
      items: [
        { id: 'cards', label: 'My Cards', icon: Layers, badge: `${user.unlockedCards?.length || 4}` },
        { id: 'learn', label: 'Learn', icon: BookOpen },
        { id: 'leaderboard', label: 'Leaderboard', icon: Trophy }
      ]
    },
    {
      title: 'Social',
      items: [
        { id: 'community', label: 'Community', icon: Users, badge: 'Feed' }
      ]
    },
    {
      title: 'Account',
      items: [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'settings', label: 'Settings', icon: Settings, action: onOpenSettings }
      ]
    }
  ];

  const handleItemClick = (item: NavItemDef) => {
    sound.playClick();
    if (item.action) {
      item.action();
    } else {
      setActiveTab(item.id as NavigationTab);
    }
    if (mobileOpen) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* ============================================================== */}
      {/* 1. DESKTOP COLLAPSIBLE SIDEBAR                                  */}
      {/* ============================================================== */}
      <aside
        className={`hidden md:flex flex-col bg-arena-bg border-r border-arena-border shrink-0 transition-[width] duration-250 ease-in-out select-none relative z-30 h-full ${
          isCollapsed ? 'w-[68px]' : 'w-60'
        }`}
      >
        {/* Top Control Bar: Collapse / Expand Toggle */}
        <div className={`flex items-center px-3.5 py-3 border-b border-arena-border/70 ${
          isCollapsed ? 'justify-center' : 'justify-between'
        }`}>
          {!isCollapsed && (
            <span className="text-[10px] font-mono font-bold tracking-widest text-arena-textSubtle uppercase">
              NAVIGATION
            </span>
          )}

          <button
            onClick={() => {
              sound.playClick();
              onToggleCollapse();
            }}
            title={isCollapsed ? 'Expand sidebar (240px)' : 'Collapse sidebar (68px)'}
            className="p-1.5 rounded-lg text-arena-textSecondary hover:text-arena-textPrimary hover:bg-arena-surface border border-transparent hover:border-arena-border transition-colors"
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-arena-amber" />
            ) : (
              <PanelLeftClose className="w-4 h-4 text-arena-textSubtle hover:text-arena-textPrimary" />
            )}
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-2.5 space-y-4 py-3">
          {navSections.map((section, idx) => (
            <div key={section.title} className="space-y-1">
              
              {/* Section Header */}
              {!isCollapsed ? (
                <div className="px-3 pt-1 pb-1 text-[10px] font-mono font-bold uppercase tracking-wider text-arena-textSubtle">
                  {section.title}
                </div>
              ) : idx > 0 ? (
                <div className="my-2 border-t border-[#2A373A]/60 w-8 mx-auto" />
              ) : null}

              {/* Section Nav Items */}
              {section.items.map(item => {
                const isActive = item.id !== 'settings' && activeTab === item.id;
                const IconComponent = item.icon;

                if (isCollapsed) {
                  return (
                    <div key={item.id} className="relative group flex justify-center">
                      <button
                        onClick={() => handleItemClick(item)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 ${
                          isActive
                            ? 'bg-[#E6A746]/15 text-arena-amber border border-arena-amber/40 shadow-sm'
                            : 'text-arena-textSecondary hover:bg-[#1D2427] hover:text-arena-textPrimary'
                        }`}
                      >
                        <IconComponent className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${
                          isActive ? 'text-arena-amber' : 'text-arena-textSubtle group-hover:text-arena-textPrimary'
                        }`} />
                      </button>

                      {/* Floating Tooltip to the Right */}
                      <div className="absolute left-full ml-3 px-3 py-1.5 rounded-xl bg-[#182225] border border-[#2B3B3F] text-xs font-semibold text-arena-textPrimary shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-50 whitespace-nowrap flex items-center gap-2">
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-arena-amber/15 text-arena-amber border border-arena-amber/30">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                }

                // Expanded Item View
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 group relative ${
                      isActive
                        ? 'bg-[#E6A746]/10 text-arena-amber border border-arena-amber/30 shadow-subtle'
                        : 'text-arena-textSecondary hover:bg-[#182326] hover:text-arena-textPrimary'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={isActive ? 'text-arena-amber' : 'text-arena-textSubtle group-hover:text-arena-textSecondary transition-colors'}>
                        <IconComponent className="w-4 h-4 shrink-0" />
                      </span>
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full border transition-colors ${
                        isActive 
                          ? 'bg-arena-amber/20 border-arena-amber/40 text-arena-amber font-bold'
                          : 'bg-[#111719] border-[#2A373A] text-arena-textSubtle group-hover:text-arena-textSecondary'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}

            </div>
          ))}
        </div>

        {/* Desktop Sidebar Footer */}
        <div className={`p-3 border-t border-arena-border/70 text-xs ${isCollapsed ? 'text-center' : ''}`}>
          {isCollapsed ? (
            <div className="w-2.5 h-2.5 rounded-full bg-arena-teal mx-auto ring-4 ring-arena-teal/15" title="Connected to DEVARENA" />
          ) : (
            <div className="flex items-center justify-between text-[11px] text-arena-textSubtle font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-arena-teal inline-block" />
                <span>ONLINE DUELS</span>
              </div>
              <span className="text-arena-teal">READY</span>
            </div>
          )}
        </div>
      </aside>

      {/* ============================================================== */}
      {/* 2. MOBILE OFF-CANVAS DRAWER                                    */}
      {/* ============================================================== */}
      {mobileOpen && (
        <div className="md:hidden">
          {/* Backdrop Overlay */}
          <div 
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 animate-in fade-in"
            aria-hidden="true"
          />

          {/* Sliding Off-canvas Drawer Panel */}
          <div className="fixed top-0 bottom-0 left-0 w-72 max-w-[85vw] bg-[#141B1D] border-r border-[#2B3B3F] z-50 shadow-2xl flex flex-col animate-in slide-in-from-left duration-250 select-none">
            
            {/* Drawer Header */}
            <div className="p-4 border-b border-[#232F32] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-arena-surface border border-arena-border flex items-center justify-center text-arena-amber font-bold text-xs shadow-sm">
                  DA
                </div>
                <div>
                  <span className="font-extrabold text-sm tracking-tight text-arena-textPrimary">DEVARENA</span>
                  <span className="text-[10px] text-arena-teal font-mono block">PORTAL NAVIGATION</span>
                </div>
              </div>

              <button
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg text-arena-textSecondary hover:text-arena-textPrimary hover:bg-[#1D2528] transition-colors"
                aria-label="Close navigation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Nav Sections */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {navSections.map(section => (
                <div key={section.title} className="space-y-1">
                  <div className="px-2 pb-1 text-[10px] font-mono font-bold uppercase tracking-wider text-arena-textSubtle">
                    {section.title}
                  </div>

                  {section.items.map(item => {
                    const isActive = item.id !== 'settings' && activeTab === item.id;
                    const IconComponent = item.icon;

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleItemClick(item)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-[#E6A746]/10 text-arena-amber border border-arena-amber/30'
                            : 'text-arena-textSecondary hover:bg-[#182326] hover:text-arena-textPrimary'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={isActive ? 'text-arena-amber' : 'text-arena-textSubtle'}>
                            <IconComponent className="w-4 h-4 shrink-0" />
                          </span>
                          <span>{item.label}</span>
                        </div>

                        {item.badge && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#111719] border border-[#2A373A] text-arena-textSubtle">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Mobile Drawer Bottom User Card */}
            <div className="p-4 border-t border-[#232F32] bg-[#111719] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <img
                    src={user.avatar}
                    alt={user.displayName}
                    className="w-8 h-8 rounded-lg object-cover border border-[#2B3B3F]"
                  />
                  <div>
                    <div className="font-bold text-arena-textPrimary leading-none">{user.displayName}</div>
                    <div className="text-[10px] text-arena-textSubtle font-mono mt-0.5">@{user.username}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-arena-amber font-mono font-bold text-xs">{user.rating} Elo</div>
                  <div className="text-[10px] text-arena-warning font-mono">{user.streak}d Streak</div>
                </div>
              </div>

              {user.isGuest && (
                <button
                  onClick={() => {
                    onCloseMobile();
                    onOpenSettings();
                  }}
                  className="w-full btn-primary py-2 text-xs font-bold justify-center"
                >
                  Save Guest Progress
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
};

