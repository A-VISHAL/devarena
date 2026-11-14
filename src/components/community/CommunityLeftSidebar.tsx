import React from 'react';
import { 
  User, 
  Users, 
  Bookmark, 
  FileText, 
  Hash, 
  Calendar, 
  Sparkles, 
  ShieldCheck, 
  Trophy, 
  Flame,
  ArrowRight,
  Layers
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sound } from '../../utils/sound';

interface CommunityLeftSidebarProps {
  activeView: 'feed' | 'my_posts' | 'saved';
  setActiveView: (view: 'feed' | 'my_posts' | 'saved') => void;
  savedCount: number;
  myPostsCount: number;
}

export const CommunityLeftSidebar: React.FC<CommunityLeftSidebarProps> = ({
  activeView,
  setActiveView,
  savedCount,
  myPostsCount
}) => {
  const { user, setActiveTab } = useApp();

  return (
    <aside className="space-y-4">
      
      {/* 1. Professional Compact Profile Card */}
      <div className="rounded-2xl bg-[#161F22] border border-[#2B3B3F] overflow-hidden shadow-card">
        
        {/* Cover Area */}
        <div className="relative h-20 bg-gradient-to-r from-[#1E292C] via-[#243337] to-[#1A2528] border-b border-[#2B3B3F] overflow-hidden">
          {/* Subtle circuit lines overlay */}
          <svg className="absolute inset-0 w-full h-full opacity-15" xmlns="http://www.w3.org/2000/svg">
            <line x1="0" y1="20" x2="200" y2="80" stroke="#F5AA3B" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="150" y1="0" x2="350" y2="80" stroke="#69B9A7" strokeWidth="1" strokeDasharray="4 4" />
          </svg>
        </div>

        {/* Profile Details */}
        <div className="p-4 sm:p-5 pt-0 -mt-10 text-center relative z-10 space-y-3">
          <div className="inline-block relative">
            <img
              src={user.avatar}
              alt={user.displayName}
              className="w-16 h-16 rounded-xl object-cover border-2 border-[#161F22] shadow-md mx-auto"
            />
            {user.streak > 0 && (
              <div 
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-arena-amber text-[#111719] flex items-center justify-center shadow"
                title={`${user.streak} Day Active Streak`}
              >
                <Flame className="w-3 h-3 fill-current" />
              </div>
            )}
          </div>

          <div className="space-y-1">
            <h2 className="font-extrabold text-sm text-arena-textPrimary truncate hover:text-arena-amber transition-colors">
              {user.displayName}
            </h2>
            <p className="text-[11px] text-arena-textSubtle font-mono">
              @{user.username}
            </p>
            <p className="text-[11px] text-arena-textSecondary line-clamp-2 leading-relaxed pt-0.5">
              {user.headline || 'Full-Stack Developer • Competitive Algorithmic Duelist'}
            </p>
          </div>

          {/* Metrics Pill Grid */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#263539] text-left">
            <div className="p-2 rounded-lg bg-[#111719] border border-[#233134]">
              <span className="text-[9px] uppercase font-bold text-arena-textSubtle block leading-none">
                ARENA RATING
              </span>
              <span className="font-mono text-xs font-black text-arena-amber block mt-1">
                {user.rating} Elo
              </span>
            </div>

            <div className="p-2 rounded-lg bg-[#111719] border border-[#233134]">
              <span className="text-[9px] uppercase font-bold text-arena-textSubtle block leading-none">
                NETWORK
              </span>
              <span className="font-mono text-xs font-black text-arena-teal block mt-1">
                {user.followingCount || 142} Peering
              </span>
            </div>
          </div>

          {/* View Profile Action */}
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('profile');
            }}
            className="w-full py-2 px-3 rounded-xl bg-[#1A2528] border border-[#2B3B3F] hover:bg-[#202E32] hover:border-arena-borderHover text-xs font-semibold text-arena-textPrimary flex items-center justify-center gap-1.5 transition-all"
          >
            <User className="w-3.5 h-3.5 text-arena-amber" />
            <span>View Full Profile</span>
          </button>
        </div>
      </div>

      {/* 2. Professional Network & Activity Nav Links */}
      <div className="rounded-2xl bg-[#161F22] border border-[#2B3B3F] p-3 space-y-1 shadow-card">
        
        <button
          onClick={() => {
            sound.playClick();
            setActiveView('feed');
          }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeView === 'feed'
              ? 'bg-[#1F2C30] text-arena-amber border border-arena-amber/30'
              : 'text-arena-textSecondary hover:bg-[#1B2629] hover:text-arena-textPrimary'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <FileText className="w-4 h-4 text-arena-amber" />
            <span>Community Feed</span>
          </div>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveView('my_posts');
          }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeView === 'my_posts'
              ? 'bg-[#1F2C30] text-arena-amber border border-arena-amber/30'
              : 'text-arena-textSecondary hover:bg-[#1B2629] hover:text-arena-textPrimary'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <User className="w-4 h-4 text-arena-teal" />
            <span>My Posts</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#111719] border border-[#27373B] text-arena-textSubtle">
            {myPostsCount}
          </span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveView('saved');
          }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeView === 'saved'
              ? 'bg-[#1F2C30] text-arena-amber border border-arena-amber/30'
              : 'text-arena-textSecondary hover:bg-[#1B2629] hover:text-arena-textPrimary'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Bookmark className="w-4 h-4 text-amber-400" />
            <span>Saved Posts</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#111719] border border-[#27373B] text-arena-textSubtle">
            {savedCount}
          </span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('cards');
          }}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-arena-textSecondary hover:bg-[#1B2629] hover:text-arena-textPrimary transition-all"
        >
          <div className="flex items-center gap-2.5">
            <Layers className="w-4 h-4 text-arena-teal" />
            <span>My Collectibles</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#111719] border border-[#27373B] text-arena-amber font-bold">
            {user.unlockedCards?.length || 4}
          </span>
        </button>

        <div className="pt-2 mt-2 border-t border-[#233134] px-3">
          <span className="text-[10px] uppercase font-bold text-arena-textSubtle tracking-wider block mb-2">
            DEVELOPER GUILDS
          </span>
          <div className="space-y-1.5">
            {[
              { tag: '#algorithms', count: '1.2k posts' },
              { tag: '#system-design', count: '850 posts' },
              { tag: '#monaco-editor', count: '420 posts' },
              { tag: '#webassembly', count: '290 posts' },
            ].map(g => (
              <div 
                key={g.tag}
                className="flex items-center justify-between text-xs text-arena-textSecondary hover:text-arena-amber cursor-pointer transition-colors py-0.5"
              >
                <span className="font-mono">{g.tag}</span>
                <span className="text-[10px] text-arena-textSubtle">{g.count}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </aside>
  );
};
