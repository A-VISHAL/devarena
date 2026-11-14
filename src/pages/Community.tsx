import React, { useState } from 'react';
import { 
  Users, 
  Heart, 
  MessageSquare, 
  Swords, 
  PlusCircle, 
  Send, 
  Sparkles,
  Gamepad2,
  Trophy
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CommunityPost } from '../types';
import { sound } from '../utils/sound';

export const Community: React.FC = () => {
  const { 
    user, 
    posts, 
    addPost, 
    likePost, 
    addComment, 
    setActiveBattleId, 
    setActiveTab 
  } = useApp();

  const [filter, setFilter] = useState<'all' | 'coding' | 'games' | 'achievements'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');

  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postType, setPostType] = useState<CommunityPost['type']>('discussion');

  const filteredPosts = posts.filter(p => {
    if (filter === 'coding') return p.type === 'battle_victory';
    if (filter === 'games') return p.type === 'puzzle_streak';
    if (filter === 'achievements') return p.type === 'achievement_unlocked';
    return true;
  });

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) return;

    sound.playCorrect();
    addPost({
      author: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        rating: user.rating
      },
      type: postType,
      title: postTitle.trim(),
      content: postContent.trim()
    });

    setPostTitle('');
    setPostContent('');
    setShowCreateModal(false);
  };

  const handleSendComment = (postId: string) => {
    if (!commentInput.trim()) return;
    addComment(postId, commentInput.trim());
    setCommentInput('');
  };

  const handleChallengeUser = (username: string) => {
    sound.playClick();
    const newBattleCode = `DEV-${Math.floor(1000 + Math.random() * 9000)}`;
    setActiveBattleId(newBattleCode);
    setActiveTab('arena');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-in fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-arena-border">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-arena-teal" />
            <h1 className="text-2xl font-bold text-arena-textPrimary">Community Feed</h1>
          </div>
          <p className="text-xs text-arena-textSecondary mt-1">
            Real activity from DEVARENA: battle outcomes, daily puzzle streaks, project showcases, and challenges.
          </p>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            setShowCreateModal(true);
          }}
          className="btn-primary py-2 px-3.5 text-xs font-semibold gap-1.5 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Post</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: 'all', label: 'All Feed' },
          { id: 'coding', label: 'Coding Battles', icon: <Swords className="w-3.5 h-3.5 text-arena-blue" /> },
          { id: 'games', label: 'Casual Puzzles', icon: <Gamepad2 className="w-3.5 h-3.5 text-arena-teal" /> },
          { id: 'achievements', label: 'Achievements', icon: <Trophy className="w-3.5 h-3.5 text-arena-warning" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              sound.playClick();
              setFilter(tab.id as any);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === tab.id
                ? 'bg-arena-elevated text-arena-textPrimary border border-arena-border shadow-subtle'
                : 'bg-arena-surface text-arena-textSecondary hover:text-arena-textPrimary border border-arena-border'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Post Feed */}
      <div className="space-y-3.5">
        {filteredPosts.map((post) => {
          const isLiked = post.likedBy.includes(user.id);
          const showComments = activeCommentPostId === post.id;

          return (
            <div key={post.id} className="arena-card p-5 space-y-3.5">
              
              {/* Author Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={post.author.avatar}
                    alt={post.author.username}
                    className="w-9 h-9 rounded-md object-cover border border-arena-border"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-arena-textPrimary">{post.author.displayName}</span>
                      <span className="text-[11px] text-arena-textSubtle">@{post.author.username}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-arena-textSubtle mt-0.5">
                      <span className="text-arena-blue font-medium">{post.author.rating} Elo</span>
                      <span>•</span>
                      <span>{post.createdAt}</span>
                    </div>
                  </div>
                </div>

                {post.author.id !== user.id && (
                  <button
                    onClick={() => handleChallengeUser(post.author.username)}
                    className="btn-secondary py-1 px-2.5 text-xs gap-1.5 font-medium"
                  >
                    <Swords className="w-3.5 h-3.5 text-arena-blue" />
                    <span className="hidden sm:inline">Challenge</span>
                  </button>
                )}
              </div>

              {/* Title & Body */}
              <div className="space-y-1">
                <h3 className="font-semibold text-sm text-arena-textPrimary">{post.title}</h3>
                <p className="text-xs text-arena-textSecondary leading-relaxed whitespace-pre-line">
                  {post.content}
                </p>
              </div>

              {/* Attached Metadata Banner */}
              {post.metadata && (
                <div className="p-2.5 rounded-lg bg-arena-elevated border border-arena-border flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-arena-teal" />
                    <span className="font-medium text-arena-textPrimary">{post.metadata.gameName || post.metadata.problemTitle || 'Challenge Result'}</span>
                  </div>
                  {post.metadata.score && (
                    <span className="font-semibold text-arena-blue">{post.metadata.score}</span>
                  )}
                </div>
              )}

              {/* Interaction Bar */}
              <div className="pt-3 border-t border-arena-border flex items-center justify-between text-xs text-arena-textSecondary">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => likePost(post.id)}
                    className={`flex items-center gap-1.5 font-medium transition-colors ${
                      isLiked ? 'text-arena-error' : 'hover:text-arena-textPrimary'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-arena-error text-arena-error' : ''}`} />
                    <span>{post.likesCount}</span>
                  </button>

                  <button
                    onClick={() => {
                      sound.playClick();
                      setActiveCommentPostId(showComments ? null : post.id);
                    }}
                    className="flex items-center gap-1.5 hover:text-arena-textPrimary transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{post.comments.length} Comments</span>
                  </button>
                </div>
              </div>

              {/* Comments Accordion */}
              {showComments && (
                <div className="pt-3 border-t border-arena-border space-y-2.5 animate-in fade-in">
                  <div className="space-y-1.5">
                    {post.comments.map((c) => (
                      <div key={c.id} className="p-2.5 rounded-lg bg-arena-elevated border border-arena-border text-xs space-y-0.5">
                        <div className="flex items-center justify-between text-[10px] text-arena-textSubtle">
                          <span className="font-semibold text-arena-textPrimary">@{c.author.username}</span>
                          <span>{c.timestamp}</span>
                        </div>
                        <p className="text-arena-textSecondary">{c.text}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      placeholder="Write a comment..."
                      className="flex-1 bg-arena-elevated border border-arena-border rounded-lg px-2.5 py-1 text-xs text-arena-textPrimary focus:outline-none focus:border-arena-borderHover"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSendComment(post.id);
                      }}
                    />
                    <button
                      onClick={() => handleSendComment(post.id)}
                      className="btn-primary py-1 px-3 text-xs"
                    >
                      <Send className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* CREATE POST MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-arena-bg/85 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-arena-surface border border-arena-border rounded-2xl p-6 space-y-4 shadow-card">
            <h3 className="text-base font-bold text-arena-textPrimary">New Community Post</h3>

            <form onSubmit={handleCreatePost} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-arena-textSubtle mb-1">Category</label>
                <select
                  value={postType}
                  onChange={(e) => setPostType(e.target.value as any)}
                  className="w-full bg-arena-elevated border border-arena-border rounded-lg p-2 text-xs text-arena-textPrimary focus:outline-none"
                >
                  <option value="discussion">General Discussion</option>
                  <option value="battle_victory">Coding Battle Victory</option>
                  <option value="puzzle_streak">Game Puzzle Streak</option>
                  <option value="project_share">Project Showcase</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-arena-textSubtle mb-1">Title</label>
                <input
                  type="text"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="e.g. Mastered Two Pointers on Container With Most Water"
                  className="w-full bg-arena-elevated border border-arena-border rounded-lg px-3 py-1.5 text-xs text-arena-textPrimary focus:outline-none focus:border-arena-borderHover"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-arena-textSubtle mb-1">Content</label>
                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Share your algorithm strategies, game records, or challenges..."
                  rows={4}
                  className="w-full bg-arena-elevated border border-arena-border rounded-lg p-2.5 text-xs text-arena-textPrimary focus:outline-none focus:border-arena-borderHover resize-none"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary flex-1 py-1.5 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1 py-1.5 text-xs font-semibold"
                >
                  Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
