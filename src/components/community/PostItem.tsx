import React, { useState } from 'react';
import { 
  Heart, 
  MessageSquare, 
  Repeat2, 
  Share2, 
  Swords, 
  Bookmark, 
  MoreHorizontal, 
  Trash2, 
  ExternalLink, 
  Github, 
  Check, 
  ShieldCheck, 
  Sparkles,
  Send,
  UserPlus,
  UserCheck
} from 'lucide-react';
import { CommunityPost } from '../../types';
import { useApp } from '../../context/AppContext';
import { getUserCards, BASE_COLLECTIBLE_CARDS } from '../../data/collectibleCards';
import { CollectibleCardItem } from '../cards/CollectibleCardItem';
import { CollectibleCard } from '../../types/cards';
import { sound } from '../../utils/sound';

interface PostItemProps {
  post: CommunityPost;
  onInspectCard?: (card: CollectibleCard) => void;
  onShareCard?: (card: CollectibleCard) => void;
}

export const PostItem: React.FC<PostItemProps> = ({
  post,
  onInspectCard,
  onShareCard
}) => {
  const { 
    user, 
    likePost, 
    addComment, 
    deleteComment, 
    toggleFollowUser, 
    toggleSavePost, 
    repostPost, 
    deletePost, 
    setActiveBattleId, 
    setActiveTab 
  } = useApp();

  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const isLiked = post.likedBy.includes(user.id);
  const isReposted = (post.repostedBy || []).includes(user.id);
  const isSaved = (user.savedPostIds || []).includes(post.id);
  const isFollowing = (user.following || []).includes(post.author.username);
  const isOwnPost = post.author.id === user.id || post.author.username === user.username;

  // Retrieve attached collectible card if present
  const attachedCard: CollectibleCard | null = React.useMemo(() => {
    if (!post.collectibleCardId) return null;
    const all = getUserCards([post.collectibleCardId]);
    return all.find(c => c.id === post.collectibleCardId) || null;
  }, [post.collectibleCardId]);

  const handleLike = () => {
    sound.playClick();
    likePost(post.id);
  };

  const handleRepost = () => {
    repostPost(post.id);
  };

  const handleSave = () => {
    toggleSavePost(post.id);
    setShowMenu(false);
  };

  const handleCopyLink = () => {
    sound.playClick();
    const url = `${window.location.origin}/app/community?post=${post.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setShowMenu(false);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(post.id, commentText.trim());
    setCommentText('');
  };

  const handleChallenge = () => {
    sound.playClick();
    const newBattleCode = `DEV-${Math.floor(1000 + Math.random() * 9000)}`;
    setActiveBattleId(newBattleCode);
    setActiveTab('arena');
  };

  return (
    <article className="rounded-2xl bg-[#161F22] border border-[#2B3B3F] p-5 sm:p-6 shadow-card space-y-4 transition-all">
      
      {/* 1. Post Header Bar */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <img
            src={post.author.avatar}
            alt={post.author.displayName}
            className="w-11 h-11 rounded-xl object-cover border border-[#2B3B3F] shrink-0"
          />

          <div className="space-y-0.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-extrabold text-xs sm:text-sm text-arena-textPrimary hover:text-arena-amber cursor-pointer transition-colors">
                {post.author.displayName}
              </span>
              <span className="text-[11px] text-arena-textSubtle font-mono">
                @{post.author.username}
              </span>

              {post.author.rating && (
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#111719] border border-[#263539] text-arena-amber">
                  {post.author.rating} Elo
                </span>
              )}
            </div>

            <p className="text-[11px] text-arena-textSecondary leading-snug line-clamp-1">
              {post.author.headline || 'Software Engineer • DEVARENA Developer'}
            </p>

            <div className="flex items-center gap-1.5 text-[10px] text-arena-textSubtle">
              <span>{post.createdAt}</span>
              <span>•</span>
              <span className="capitalize text-arena-teal font-medium">
                {post.type.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* Right Action Menu & Follow */}
        <div className="flex items-center gap-2">
          {!isOwnPost && (
            <button
              onClick={() => toggleFollowUser(post.author.username)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                isFollowing
                  ? 'bg-[#1E2C30] border border-arena-teal/40 text-arena-teal'
                  : 'bg-[#182326] border border-[#2B3B3F] text-arena-textSecondary hover:text-arena-textPrimary hover:border-arena-borderHover'
              }`}
            >
              {isFollowing ? (
                <>
                  <UserCheck className="w-3 h-3 text-arena-teal" />
                  <span>Following</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-3 h-3 text-arena-amber" />
                  <span>Follow</span>
                </>
              )}
            </button>
          )}

          {/* More Options Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-lg text-arena-textSubtle hover:text-arena-textPrimary hover:bg-[#1E2B2E] transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-8 z-30 w-44 rounded-xl bg-[#141B1D] border border-[#2B3B3F] p-1.5 shadow-xl space-y-1 animate-in fade-in">
                <button
                  onClick={handleSave}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium text-arena-textSecondary hover:text-arena-textPrimary hover:bg-[#1C272A] flex items-center gap-2"
                >
                  <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isSaved ? 'Unsave Post' : 'Save Post'}</span>
                </button>

                <button
                  onClick={handleCopyLink}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium text-arena-textSecondary hover:text-arena-textPrimary hover:bg-[#1C272A] flex items-center gap-2"
                >
                  <Share2 className="w-3.5 h-3.5 text-arena-teal" />
                  <span>Copy Link</span>
                </button>

                {isOwnPost && (
                  <button
                    onClick={() => {
                      deletePost(post.id);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium text-arena-error hover:bg-arena-error/15 flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Post</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Post Title & Text Body */}
      <div className="space-y-2 text-left">
        <h3 className="font-extrabold text-sm sm:text-base text-arena-textPrimary leading-snug">
          {post.title}
        </h3>

        <p className="text-xs sm:text-[13px] text-arena-textSecondary leading-relaxed whitespace-pre-line">
          {post.content}
        </p>

        {/* Tech Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {post.tags.map((t, idx) => (
              <span
                key={idx}
                className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#111719] border border-[#243337] text-arena-teal hover:border-arena-teal/40 cursor-pointer transition-colors"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 3. Project Showcase Preview (if Project) */}
      {post.type === 'project_share' && (post.projectUrl || post.githubUrl) && (
        <div className="p-4 rounded-xl bg-[#111719] border border-[#27373B] space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Github className="w-4 h-4 text-arena-amber" />
              <span className="font-mono text-xs font-bold text-arena-textPrimary">
                Open Source Repository
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#182326] text-arena-teal border border-[#293A3E]">
              VERIFIED BUILD
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {post.githubUrl && (
              <a
                href={post.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary py-1.5 px-3 text-xs gap-1.5 inline-flex items-center"
              >
                <Github className="w-3.5 h-3.5" />
                <span>View on GitHub</span>
                <ExternalLink className="w-3 h-3 text-arena-textSubtle" />
              </a>
            )}

            {post.projectUrl && (
              <a
                href={post.projectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary py-1.5 px-3 text-xs font-bold gap-1.5 inline-flex items-center"
              >
                <span>Live Interactive Demo</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* 4. Embedded Collectible Card (if attached) */}
      {attachedCard && (
        <div className="pt-2">
          <div className="max-w-[320px] mx-auto scale-95 sm:scale-100">
            <CollectibleCardItem
              card={attachedCard}
              compact
              onInspect={() => onInspectCard && onInspectCard(attachedCard)}
              onShare={() => onShareCard && onShareCard(attachedCard)}
            />
          </div>
        </div>
      )}

      {/* 5. 1v1 Battle Result Banner (if Battle Victory) */}
      {post.type === 'battle_victory' && post.metadata && (
        <div className="p-3.5 rounded-xl bg-[#12181A] border border-[#27373B] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-arena-amber/15 border border-arena-amber/40 flex items-center justify-center text-arena-amber">
              <Swords className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-arena-textPrimary block">
                {post.metadata.problemTitle || 'Two Sum Algorithm Duel'}
              </span>
              <span className="text-[11px] text-arena-textSubtle">
                Verified Match Result vs @{post.metadata.opponentName || 'opponent'}
              </span>
            </div>
          </div>

          <span className="font-mono font-bold text-xs px-2.5 py-1 rounded bg-[#172225] border border-arena-teal/40 text-arena-teal">
            {post.metadata.score || '+26 Elo'}
          </span>
        </div>
      )}

      {/* 6. Post Footer Action Bar */}
      <div className="pt-3 border-t border-[#232F32] flex flex-wrap items-center justify-between gap-3 text-xs text-arena-textSecondary">
        
        {/* Interaction Metrics: Like, Comment, Repost */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 font-semibold transition-colors ${
              isLiked ? 'text-arena-error' : 'hover:text-arena-textPrimary'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-arena-error text-arena-error' : ''}`} />
            <span>{post.likesCount}</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setShowComments(!showComments);
            }}
            className="flex items-center gap-1.5 font-medium hover:text-arena-textPrimary transition-colors"
          >
            <MessageSquare className="w-4 h-4 text-arena-teal" />
            <span>{post.comments.length} Comments</span>
          </button>

          <button
            onClick={handleRepost}
            className={`flex items-center gap-1.5 font-medium transition-colors ${
              isReposted ? 'text-arena-amber' : 'hover:text-arena-textPrimary'
            }`}
          >
            <Repeat2 className="w-4 h-4" />
            <span>{post.repostsCount || 0}</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="p-1 rounded text-arena-textSubtle hover:text-arena-textPrimary transition-colors"
            title="Share Post Link"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Direct Challenge CTA Button */}
        {!isOwnPost && (
          <button
            onClick={handleChallenge}
            className="btn-secondary py-1.5 px-3 text-xs font-semibold gap-1.5 border-arena-amber/30 text-arena-amber hover:bg-arena-amber/10 transition-all shrink-0"
            title={`Challenge @${post.author.username} to instant 1v1 duel`}
          >
            <Swords className="w-3.5 h-3.5 text-arena-amber" />
            <span>Challenge Author</span>
          </button>
        )}

      </div>

      {/* 7. Threaded Expandable Comments Section */}
      {showComments && (
        <div className="pt-4 border-t border-[#232F32] space-y-3 animate-in fade-in text-left">
          
          {/* New Comment Input */}
          <form onSubmit={handleSendComment} className="flex gap-2.5">
            <img
              src={user.avatar}
              alt={user.displayName}
              className="w-7 h-7 rounded-lg object-cover border border-[#2B3B3F] shrink-0"
            />
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add your technical perspective or query..."
              className="flex-1 px-3 py-1.5 rounded-xl bg-[#111719] border border-[#27373B] text-xs text-arena-textPrimary placeholder-arena-textSubtle focus:outline-none focus:border-arena-amber"
            />
            <button
              type="submit"
              className="btn-primary py-1.5 px-3 text-xs font-bold shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Existing Comments List */}
          {post.comments.length > 0 && (
            <div className="space-y-2 pt-1">
              {post.comments.map((c) => (
                <div 
                  key={c.id}
                  className="p-3 rounded-xl bg-[#12181A] border border-[#243336] space-y-1"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <img
                        src={c.author.avatar}
                        alt=""
                        className="w-5 h-5 rounded-md object-cover border border-[#2B3B3F]"
                      />
                      <span className="font-bold text-arena-textPrimary">{c.author.displayName || c.author.username}</span>
                      <span className="text-[10px] text-arena-textSubtle font-mono">@{c.author.username}</span>
                    </div>

                    <span className="text-[10px] text-arena-textSubtle">{c.timestamp}</span>
                  </div>

                  <p className="text-xs text-arena-textSecondary leading-relaxed pl-7">
                    {c.text}
                  </p>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

    </article>
  );
};
