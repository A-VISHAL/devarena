import React, { useState } from 'react';
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  Swords, 
  UserPlus, 
  UserCheck, 
  Sparkles, 
  Trophy, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sound } from '../../utils/sound';

interface CommunityRightSidebarProps {
  onChallengeUser: (username: string) => void;
}

export const CommunityRightSidebar: React.FC<CommunityRightSidebarProps> = ({
  onChallengeUser
}) => {
  const { user, toggleFollowUser, setActiveTab } = useApp();
  const [registeredEvents, setRegisteredEvents] = useState<string[]>(['gauntlet-1']);

  const recommendedDevs = [
    {
      name: 'Elena V.',
      username: 'elena_v',
      headline: 'Full-Stack & Graph Theory Enthusiast',
      rating: 1740,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
      sharedReason: 'Also solves Dynamic Programming & Graphs'
    },
    {
      name: 'Rohit Verma',
      username: 'rohit_algo',
      headline: 'Competitive Algorithmic Coach • 1790 Elo',
      rating: 1790,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
      sharedReason: 'Shares your interest in Two Pointers'
    },
    {
      name: 'Priya Sharma',
      username: 'priya_algos',
      headline: 'Distributed Systems & Math Sprints',
      rating: 1845,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      sharedReason: 'Active in Daily Word Puzzles & Math'
    }
  ];

  const trendingTopics = [
    { tag: '#DynamicProgramming', posts: '1,420 duels', active: true },
    { tag: '#MonacoEditorRunner', posts: '890 posts', active: false },
    { tag: '#ZipTopologicalPath', posts: '640 solves', active: true },
    { tag: '#TwoPointersShrink', posts: '510 duels', active: false },
    { tag: '#MemoryRetentionBenchmark', posts: '380 posts', active: false }
  ];

  const upcomingEvents = [
    {
      id: 'gauntlet-1',
      title: 'Weekend Blitz Gauntlet',
      category: '1v1 Rapid Duel',
      date: 'Saturday, 18:00 UTC',
      participants: '348 Registered',
      reward: 'DA-EVT-001 Epic Card'
    },
    {
      id: 'puzzle-inv-2',
      title: 'Global Puzzle Invitational',
      category: 'Topological Logic',
      date: 'Next Tuesday, 14:00 UTC',
      participants: '1.2k Registered',
      reward: 'DA-EVT-002 Legendary Card'
    }
  ];

  const handleToggleEvent = (eventId: string) => {
    sound.playClick();
    setRegisteredEvents(prev => 
      prev.includes(eventId) ? prev.filter(id => id !== eventId) : [...prev, eventId]
    );
  };

  return (
    <aside className="space-y-4">
      
      {/* 1. People You May Know / Recommended Developers */}
      <div className="rounded-2xl bg-[#161F22] border border-[#2B3B3F] p-5 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-arena-teal" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-arena-textPrimary">
              PEOPLE YOU MAY KNOW
            </h3>
          </div>

          <button
            onClick={() => setActiveTab('leaderboard')}
            className="text-[11px] font-semibold text-arena-amber hover:underline flex items-center gap-0.5"
          >
            <span>Rankings</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-3">
          {recommendedDevs.map(dev => {
            const isFollowing = (user.following || []).includes(dev.username);

            return (
              <div
                key={dev.username}
                className="p-3 rounded-xl bg-[#12181A] border border-[#243336] space-y-2.5 transition-colors hover:border-[#2F3F44]"
              >
                <div className="flex items-start gap-2.5">
                  <img
                    src={dev.avatar}
                    alt={dev.name}
                    className="w-9 h-9 rounded-lg object-cover border border-[#2B3B3F] shrink-0"
                  />

                  <div className="space-y-0.5 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-arena-textPrimary truncate block">
                        {dev.name}
                      </span>
                      <span className="font-mono text-[10px] font-bold text-arena-amber shrink-0 ml-1">
                        {dev.rating} Elo
                      </span>
                    </div>

                    <p className="text-[10px] text-arena-textSubtle truncate font-mono">
                      @{dev.username}
                    </p>

                    <p className="text-[11px] text-arena-textSecondary line-clamp-1 leading-snug">
                      {dev.headline}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-[#1F2B2E] text-[10px]">
                  <span className="text-arena-textSubtle truncate max-w-[150px]">
                    {dev.sharedReason}
                  </span>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onChallengeUser(dev.username)}
                      className="p-1 rounded bg-[#182326] border border-[#2A3A3E] text-arena-amber hover:bg-[#202E32] transition-colors"
                      title={`Challenge @${dev.username} to 1v1 duel`}
                    >
                      <Swords className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => toggleFollowUser(dev.username)}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                        isFollowing
                          ? 'bg-[#1D2B2E] text-arena-teal border border-arena-teal/40'
                          : 'bg-[#1A2528] text-arena-textPrimary border border-[#2B3B3F] hover:border-arena-borderHover'
                      }`}
                    >
                      {isFollowing ? 'Following' : '+ Connect'}
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Trending in DEVARENA */}
      <div className="rounded-2xl bg-[#161F22] border border-[#2B3B3F] p-5 shadow-card space-y-3.5">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-arena-amber" />
          <h3 className="font-bold text-xs uppercase tracking-wider text-arena-textPrimary">
            TRENDING IN DEVARENA
          </h3>
        </div>

        <div className="space-y-2">
          {trendingTopics.map(t => (
            <div
              key={t.tag}
              className="p-2.5 rounded-xl bg-[#12181A] border border-[#233134] flex items-center justify-between text-xs hover:border-[#2C3B40] transition-colors cursor-pointer group"
            >
              <div>
                <span className="font-mono font-bold text-arena-textPrimary group-hover:text-arena-amber transition-colors block">
                  {t.tag}
                </span>
                <span className="text-[10px] text-arena-textSubtle">
                  {t.posts}
                </span>
              </div>

              {t.active && (
                <span className="w-2 h-2 rounded-full bg-arena-amber animate-pulse" title="Active Duels Running" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 3. Upcoming Tournaments & Events */}
      <div className="rounded-2xl bg-[#161F22] border border-[#2B3B3F] p-5 shadow-card space-y-3.5">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-amber-400" />
          <h3 className="font-bold text-xs uppercase tracking-wider text-arena-textPrimary">
            UPCOMING COMPETITIONS
          </h3>
        </div>

        <div className="space-y-3">
          {upcomingEvents.map(evt => {
            const isRegistered = registeredEvents.includes(evt.id);

            return (
              <div
                key={evt.id}
                className="p-3.5 rounded-xl bg-[#12181A] border border-[#243336] space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-bold text-xs text-arena-textPrimary block">
                      {evt.title}
                    </span>
                    <span className="text-[10px] text-arena-teal font-medium">
                      {evt.category} • {evt.date}
                    </span>
                  </div>

                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#182326] text-amber-400 border border-amber-400/30 shrink-0">
                    {evt.reward}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-[#1E2A2D]">
                  <span className="text-[10px] text-arena-textSubtle">
                    {evt.participants}
                  </span>

                  <button
                    onClick={() => handleToggleEvent(evt.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                      isRegistered
                        ? 'bg-arena-teal/15 text-arena-teal border border-arena-teal/40'
                        : 'btn-primary py-1 px-2.5 text-xs'
                    }`}
                  >
                    {isRegistered ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Registered</span>
                      </>
                    ) : (
                      <span>Join Event</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </aside>
  );
};

