import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Sparkles, 
  Swords, 
  Filter, 
  FolderGit2, 
  MessageSquareCode, 
  Trophy, 
  Layers, 
  Bookmark,
  TrendingUp,
  Search
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CommunityPost } from '../types';
import { CollectibleCard } from '../types/cards';
import { CommunityLeftSidebar } from '../components/community/CommunityLeftSidebar';
import { PostComposer } from '../components/community/PostComposer';
import { PostItem } from '../components/community/PostItem';
import { CommunityRightSidebar } from '../components/community/CommunityRightSidebar';
import { CreatePostModal } from '../components/community/CreatePostModal';
import { CardDetailModal } from '../components/cards/CardDetailModal';
import { CardShareStudioModal } from '../components/cards/CardShareStudioModal';
import { sound } from '../utils/sound';

type FeedFilter = 'for_you' | 'following' | 'projects' | 'discussions' | 'achievements';

export const Community: React.FC = () => {
  const { user, posts, setActiveBattleId, setActiveTab } = useApp();

  // Navigation & Filtering State
  const [activeView, setActiveView] = useState<'feed' | 'my_posts' | 'saved'>('feed');
  const [feedFilter, setFeedFilter] = useState<FeedFilter>('for_you');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createModalDefaultType, setCreateModalDefaultType] = useState<'discussion' | 'project_share' | 'battle_victory' | 'achievement_unlocked'>('discussion');
  const [inspectingCard, setInspectingCard] = useState<CollectibleCard | null>(null);
  const [sharingCard, setSharingCard] = useState<CollectibleCard | null>(null);

  // Challenge user handler
  const handleChallengeUser = (opponentUsername: string) => {
    sound.playClick();
    const newBattleCode = `DEV-${Math.floor(1000 + Math.random() * 9000)}`;
    setActiveBattleId(newBattleCode);
    setActiveTab('arena');
  };

  const savedPostIds = useMemo(() => user.savedPostIds || ['post-1'], [user.savedPostIds]);
  const followingList = useMemo(() => user.following || ['kavya_codes', 'alex_dev'], [user.following]);

  // Filtered posts based on activeView & feedFilter
  const displayedPosts = useMemo(() => {
    return posts.filter(post => {
      // 1. View Filter (Feed vs Saved vs My Posts)
      if (activeView === 'saved') {
        if (!savedPostIds.includes(post.id)) return false;
      } else if (activeView === 'my_posts') {
        if (post.author.id !== user.id && post.author.username !== user.username) return false;
      }

      // 2. Feed Category Filter (when in main feed view)
      if (activeView === 'feed') {
        if (feedFilter === 'following') {
          if (!followingList.includes(post.author.username) && post.author.id !== user.id) return false;
        } else if (feedFilter === 'projects') {
          if (post.type !== 'project_share') return false;
        } else if (feedFilter === 'discussions') {
          if (post.type !== 'discussion') return false;
        } else if (feedFilter === 'achievements') {
          if (post.type !== 'battle_victory' && post.type !== 'achievement_unlocked' && post.type !== 'puzzle_streak') return false;
        }
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = post.title.toLowerCase().includes(q);
        const matchContent = post.content.toLowerCase().includes(q);
        const matchAuthor = post.author.displayName.toLowerCase().includes(q) || post.author.username.toLowerCase().includes(q);
        const matchTags = (post.tags || []).some(t => t.toLowerCase().includes(q));
        if (!matchTitle && !matchContent && !matchAuthor && !matchTags) return false;
      }

      return true;
    });
  }, [posts, activeView, feedFilter, searchQuery, savedPostIds, followingList, user.id, user.username]);

  const myPostsCount = useMemo(() => {
    return posts.filter(p => p.author.id === user.id || p.author.username === user.username).length;
  }, [posts, user.id, user.username]);

  return (
    <div className="page-container py-8 space-y-6 animate-in fade-in">
      
      {/* Three-Column Professional Desktop Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ================= LEFT SIDEBAR (3 Columns) ================= */}
        <div className="lg:col-span-3 space-y-4">
          <CommunityLeftSidebar
            activeView={activeView}
            setActiveView={setActiveView}
            savedCount={savedPostIds.length}
            myPostsCount={myPostsCount}
          />
        </div>

        {/* ================= CENTER FEED (6 Columns) ================= */}
        <div className="lg:col-span-6 space-y-5">
          
          {/* Post Composer */}
          <PostComposer
            onOpenCreateModal={(defaultType = 'discussion') => {
              setCreateModalDefaultType(defaultType);
              setIsCreateModalOpen(true);
            }}
          />

          {/* Feed Filter Bar & Search */}
          <div className="rounded-2xl bg-[#161F22] border border-[#2B3B3F] p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-card">
            
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'for_you', label: 'For You' },
                { id: 'following', label: 'Following' },
                { id: 'projects', label: 'Projects' },
                { id: 'discussions', label: 'Discussions' },
                { id: 'achievements', label: 'Achievements' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    sound.playClick();
                    setActiveView('feed');
                    setFeedFilter(tab.id as FeedFilter);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeView === 'feed' && feedFilter === tab.id
                      ? 'bg-arena-amber text-[#111719] shadow-sm font-bold'
                      : 'bg-[#12191B] text-arena-textSecondary hover:text-arena-textPrimary hover:bg-[#1A2528]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Quick Search Input */}
            <div className="relative sm:w-44">
              <Search className="w-3.5 h-3.5 text-arena-textSubtle absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search feed..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-7 pr-2.5 py-1 text-xs rounded-lg bg-[#111719] border border-[#243336] text-arena-textPrimary placeholder-arena-textSubtle focus:outline-none focus:border-arena-amber"
              />
            </div>

          </div>

          {/* Active View Header if not 'feed' */}
          {activeView !== 'feed' && (
            <div className="flex items-center justify-between px-2 py-1 text-xs font-bold uppercase tracking-wider text-arena-textSecondary">
              <span>{activeView === 'saved' ? 'Saved Posts' : 'My Published Posts'} ({displayedPosts.length})</span>
              <button
                onClick={() => setActiveView('feed')}
                className="text-arena-amber hover:underline capitalize"
              >
                Back to Feed →
              </button>
            </div>
          )}

          {/* Posts List */}
          {displayedPosts.length > 0 ? (
            <div className="space-y-4">
              {displayedPosts.map(post => (
                <PostItem
                  key={post.id}
                  post={post}
                  onInspectCard={(card) => setInspectingCard(card)}
                  onShareCard={(card) => setSharingCard(card)}
                />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl bg-[#161F22] border border-[#2B3B3F] space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#111719] border border-[#263539] flex items-center justify-center text-arena-textSubtle mx-auto">
                <Filter className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-arena-textPrimary">No Posts Found</h3>
              <p className="text-xs text-arena-textSecondary max-w-sm mx-auto">
                {activeView === 'saved'
                  ? "You haven't saved any posts yet. Click the three dots on any post to bookmark it here."
                  : activeView === 'my_posts'
                  ? "You haven't published any posts yet. Use the composer above to share your first technical breakthrough!"
                  : "No community posts match your selected filter. Switch filters or clear your search query."}
              </p>
              <button
                onClick={() => {
                  setActiveView('feed');
                  setFeedFilter('for_you');
                  setSearchQuery('');
                }}
                className="btn-secondary py-1.5 px-4 text-xs font-semibold"
              >
                Reset Feed View
              </button>
            </div>
          )}

        </div>

        {/* ================= RIGHT SIDEBAR (3 Columns) ================= */}
        <div className="lg:col-span-3 space-y-4">
          <CommunityRightSidebar
            onChallengeUser={handleChallengeUser}
          />
        </div>

      </div>

      {/* Post Creation Modal */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        defaultType={createModalDefaultType}
      />

      {/* Collectible 3D Card Detail Modal */}
      <CardDetailModal
        card={inspectingCard}
        onClose={() => setInspectingCard(null)}
        onShare={(c) => {
          setInspectingCard(null);
          setSharingCard(c);
        }}
      />

      {/* Collectible Studio Share Modal */}
      <CardShareStudioModal
        card={sharingCard}
        user={user}
        onClose={() => setSharingCard(null)}
      />

    </div>
  );
};
