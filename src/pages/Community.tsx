import React, { useState } from 'react';
import { 
  Users, 
  Heart, 
  MessageSquare, 
  Share2, 
  Swords, 
  Flame, 
  Trophy, 
  PlusCircle, 
  Send, 
  Check, 
  Sparkles,
  Gamepad2,
  Code2
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
    setActiveGame, 
    setActiveTab 
  } = useApp();

  const [filter, setFilter] = useState<'all' | 'coding' | 'games' | 'achievements'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');

  // New post form state
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
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 animate-in fade-in">
      
      {/* Header & Create Post trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-arena-border">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl font-black text-white">Community Arena</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real activity from DEVARENA: coding battle victories, game scores, reflections, and challenges.
          </p>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            setShowCreateModal(true);
          }}
          className="btn-primary py-2.5 px-4 text-xs font-bold gap-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Share Achievement or Post</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: 'all', label: 'All Feed' },
          { id: 'coding', label: 'Coding Battles', icon: <Swords className="w-3.5 h-3.5 text-violet-400" /> },
          { id: 'games', label: 'Casual Puzzles', icon: <Gamepad2 className="w-3.5 h-3.5 text-emerald-400" /> },
          { id: 'achievements', label: 'Verified Badges', icon: <Trophy className="w-3.5 h-3.5 text-yellow-400" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              sound.playClick();
              setFilter(tab.id as any);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === tab.id
                ? 'bg-violet-600/30 text-white border border-violet-500/40 shadow-sm shadow-violet-500/20'
                : 'bg-arena-surface text-slate-400 hover:text-white border border-arena-border hover:bg-slate-800'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Post Feed */}
      <div className="space-y-4">
        {filteredPosts.map((post) => {
          const isLiked = post.likedBy.includes(user.id);
          const showComments = activeCommentPostId === post.id;

          return (
            <div key={post.id} className="arena-card p-5 space-y-4">
              
              {/* Author Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={post.author.avatar}
                    alt={post.author.username}
                    className="w-10 h-10 rounded-full object-cover border-2 border-violet-500/30"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-white">{post.author.displayName}</span>
                      <span className="text-xs text-slate-400 font-medium">@{post.author.username}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                      <span className="text-violet-400 font-bold">{post.author.rating} Elo</span>
                      <span>•</span>
                      <span>{post.createdAt}</span>
                    </div>
                  </div>
                </div>

                {post.author.id !== user.id && (
                  <button
                    onClick={() => handleChallengeUser(post.author.username)}
                    className="btn-secondary py-1.5 px-3 text-xs gap-1.5 font-bold hover:border-violet-500/50"
                  >
                    <Swords className="w-3.5 h-3.5 text-violet-400" />
                    <span className="hidden sm:inline">Challenge</span>
                  </button>
                )}
              </div>

              {/* Title & Body */}
              <div className="space-y-1.5">
                <h3 className="font-bold text-sm sm:text-base text-slate-100">{post.title}</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                  {post.content}
                </p>
              </div>

              {/* Attached Metadata Banner if any */}
              {post.metadata && (
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold text-slate-200">{post.metadata.gameName || post.metadata.problemTitle || 'Challenge Result'}</span>
                  </div>
                  {post.metadata.score && (
                    <span className="font-black text-violet-400">{post.metadata.score}</span>
                  )}
                </div>
              )}

              {/* Interaction Bar */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => likePost(post.id)}
                    className={`flex items-center gap-1.5 font-bold transition-colors ${
                      isLiked ? 'text-rose-400' : 'hover:text-rose-400'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-400 text-rose-400' : ''}`} />
                    <span>{post.likesCount}</span>
                  </button>

                  <button
                    onClick={() => {
                      sound.playClick();
                      setActiveCommentPostId(showComments ? null : post.id);
                    }}
                    className="flex items-center gap-1.5 hover:text-white transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{post.comments.length} Comments</span>
                  </button>
                </div>
              </div>

              {/* Comments Accordion */}
              {showComments && (
                <div className="pt-3 border-t border-slate-800 space-y-3 animate-in fade-in">
                  <div className="space-y-2">
                    {post.comments.map((c) => (
                      <div key={c.id} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                        <div className="flex items-center justify-between text-slate-400 text-[11px]">
                          <span className="font-bold text-slate-300">@{c.author.username}</span>
                          <span>{c.timestamp}</span>
                        </div>
                        <p className="text-slate-200">{c.text}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      placeholder="Write a comment..."
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSendComment(post.id);
                      }}
                    />
                    <button
                      onClick={() => handleSendComment(post.id)}
                      className="btn-primary py-1.5 px-3 text-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg bg-arena-surface border border-arena-border rounded-3xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-black text-white">Create Community Post</h3>

            <form onSubmit={handleCreatePost} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Post Category</label>
                <select
                  value={postType}
                  onChange={(e) => setPostType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white"
                >
                  <option value="discussion">General Discussion</option>
                  <option value="battle_victory">Coding Battle Victory</option>
                  <option value="puzzle_streak">Game Puzzle Streak</option>
                  <option value="project_share">Project Showcase</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="e.g. Mastered Two Pointers on Container With Most Water!"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Content</label>
                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Share your thoughts, strategies, code tricks, or challenge details..."
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-violet-500 resize-none"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary flex-1 py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1 py-2 text-xs font-bold"
                >
                  Publish Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

