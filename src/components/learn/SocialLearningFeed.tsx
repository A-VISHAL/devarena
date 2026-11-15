import React, { useState } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Send, 
  Sparkles, 
  Flame, 
  CheckCircle2, 
  BookOpen, 
  Code2, 
  Trophy, 
  UserPlus, 
  UserCheck, 
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { SocialLearningPost } from '../../types/learn';
import { sound } from '../../utils/sound';
import { toggleFollowLearner, getFollowedLearners } from '../../services/learningActivityService';

interface SocialLearningFeedProps {
  onOpenTopic?: (topicId: string) => void;
  onOpenProblem?: (problemId: string) => void;
  onViewProfile?: (username: string) => void;
  onSharePost?: (post: SocialLearningPost) => void;
  onNewCommunityPost?: (text: string) => void;
}

const INITIAL_SOCIAL_LEARNING_POSTS: SocialLearningPost[] = [
  {
    id: 'post-learn-1',
    author: {
      id: 'u-kavya',
      name: 'Kavya Sharma',
      username: 'kavya_codes',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      headline: 'Full-Stack Developer @ TechScale • LeetCode 300+ Solved',
      rating: 1420
    },
    type: 'topic_completed',
    title: 'Completed Binary Trees & Lowest Common Ancestor',
    content: 'Just wrapped up all 5 curated Binary Tree problems in DEVARENA! Key lesson: if you need information calculated from child subtrees before processing the root, always use Post-Order (Left, Right, Root) recursion.',
    topicId: 'trees',
    topicTitle: 'Binary Trees',
    timestamp: '2026-11-15T08:15:00Z',
    timeAgo: '1h ago',
    likes: 12,
    hasLiked: false,
    comments: [
      {
        id: 'c1',
        author: 'alex_dev',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        text: 'LCA using divide-and-conquer is such an elegant pattern! Great milestone.',
        time: '45m ago'
      }
    ],
    tags: ['dsa', 'binarytrees', 'recursion', 'interviewprep'],
    verified: true
  },
  {
    id: 'post-learn-2',
    author: {
      id: 'u-marcus',
      name: 'Marcus Qin',
      username: 'marcus_q',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80',
      headline: 'Systems Engineer • Competitive Coding Specialist',
      rating: 1380
    },
    type: 'problem_streak',
    title: 'Hit a 7-Day Continuous Learning Streak!',
    content: 'Committed to solving at least 1 algorithmic problem daily for a full week. Today tackled Sliding Window non-repeating substrings. The contribution heatmap is looking green!',
    timestamp: '2026-11-14T20:30:00Z',
    timeAgo: 'Yesterday',
    likes: 18,
    hasLiked: true,
    comments: [],
    tags: ['streak', 'consistency', 'discipline', 'devarena'],
    verified: true
  },
  {
    id: 'post-learn-3',
    author: {
      id: 'u-vishal',
      name: 'Vishal',
      username: 'vishal_dev',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      headline: 'Algorithms Enthusiast & Open Source Contributor',
      rating: 1310
    },
    type: 'explanation_share',
    title: 'Kadane Algorithm Invariant Explained Visually',
    content: 'Why does Kadane work in O(N) time? At each index i, you only have two choices: extend the previous running subarray (current_sum + num), or discard the negative prefix and start fresh (num). You never need to look back further!',
    topicId: 'arrays',
    topicTitle: 'Arrays & Vectors',
    timestamp: '2026-11-14T11:00:00Z',
    timeAgo: '1d ago',
    likes: 24,
    hasLiked: false,
    comments: [
      {
        id: 'c2',
        author: 'sarah_m',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
        text: 'That single sentence clears up so much confusion. Thanks for sharing!',
        time: '18h ago'
      }
    ],
    tags: ['algorithms', 'arrays', 'kadane', 'dsa'],
    verified: true
  }
];

export const SocialLearningFeed: React.FC<SocialLearningFeedProps> = ({
  onOpenTopic,
  onOpenProblem,
  onViewProfile,
  onSharePost,
  onNewCommunityPost
}) => {
  const [posts, setPosts] = useState<SocialLearningPost[]>(INITIAL_SOCIAL_LEARNING_POSTS);
  const [followedUsers, setFollowedUsers] = useState<string[]>(getFollowedLearners());
  const [feedFilter, setFeedFilter] = useState<'all' | 'milestones' | 'explanations'>('all');
  const [userPostText, setUserPostText] = useState('');
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const handleToggleLike = (postId: string) => {
    sound.playClick();
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const nextLiked = !p.hasLiked;
        return {
          ...p,
          hasLiked: nextLiked,
          likes: nextLiked ? p.likes + 1 : Math.max(0, p.likes - 1)
        };
      }
      return p;
    }));
  };

  const handleToggleFollow = (username: string) => {
    sound.playClick();
    const isNowFollowing = toggleFollowLearner(username);
    setFollowedUsers(getFollowedLearners());
  };

  const handleAddComment = (postId: string) => {
    const text = (commentInputs[postId] || '').trim();
    if (!text) return;
    sound.playClick();

    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          comments: [
            ...p.comments,
            {
              id: `c_${Date.now()}`,
              author: 'You (Guest #5128)',
              avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
              text,
              time: 'Just now'
            }
          ]
        };
      }
      return p;
    }));

    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
  };

  const handleCreateUserPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userPostText.trim()) return;
    sound.playVictory();

    const created: SocialLearningPost = {
      id: `post_${Date.now()}`,
      author: {
        id: 'u-me',
        name: 'Guest Developer',
        username: 'dev_guest',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
        headline: 'DSA Learner on DEVARENA',
        rating: 1200
      },
      type: 'explanation_share',
      title: 'Learning Update',
      content: userPostText.trim(),
      timestamp: new Date().toISOString(),
      timeAgo: 'Just now',
      likes: 1,
      hasLiked: true,
      comments: [],
      tags: ['learningshare', 'dsa', 'devarena'],
      verified: true
    };

    setPosts(prev => [created, ...prev]);
    if (onNewCommunityPost) onNewCommunityPost(userPostText.trim());
    setUserPostText('');
  };

  const filteredPosts = posts.filter(p => {
    if (feedFilter === 'milestones') return p.type === 'topic_completed' || p.type === 'problem_streak';
    if (feedFilter === 'explanations') return p.type === 'explanation_share';
    return true;
  });

  return (
    <div className="space-y-5 select-none">
      
      {/* Create Learning Update Composer */}
      <div className="rounded-2xl bg-[#141A1C] border border-[#253235] p-5 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-white">
          <Sparkles className="w-4 h-4 text-[#FFAD42]" />
          <span>Share a Learning Milestone or Concept Breakdown</span>
        </div>

        <form onSubmit={handleCreateUserPost} className="space-y-3">
          <textarea
            value={userPostText}
            onChange={(e) => setUserPostText(e.target.value)}
            rows={2}
            placeholder="What algorithm or invariant did you master today? Share with fellow learners..."
            className="w-full bg-[#0F1416] border border-[#222E31] rounded-xl p-3 text-xs text-white placeholder-[#6E7F84] focus:outline-none focus:border-[#FFAD42]/60 resize-none leading-relaxed"
          />

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-[#78888D] font-mono">
              Shares automatically with the DEVARENA Community Feed
            </span>

            <button
              type="submit"
              disabled={!userPostText.trim()}
              className="px-4 py-2 rounded-xl bg-[#FFAD42] hover:bg-[#F29F30] disabled:opacity-40 text-[#101314] text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <span>Publish Update</span>
              <Send className="w-3 h-3" />
            </button>
          </div>
        </form>
      </div>

      {/* Feed Filter Header */}
      <div className="flex items-center justify-between pb-1 border-b border-[#202C2F]">
        <div className="flex items-center gap-2">
          {(['all', 'milestones', 'explanations'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => {
                sound.playClick();
                setFeedFilter(tab);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                feedFilter === tab
                  ? 'bg-[#1C2528] text-white border border-[#2D3C40] shadow-sm'
                  : 'text-[#8A999E] hover:text-white hover:bg-[#141A1C]'
              }`}
            >
              {tab === 'all' ? 'All Activity' : tab}
            </button>
          ))}
        </div>

        <span className="text-[11px] text-[#78888D] font-mono">
          {filteredPosts.length} Updates
        </span>
      </div>

      {/* Social Posts List */}
      <div className="space-y-4">
        {filteredPosts.map((post) => {
          const isFollowingAuthor = followedUsers.includes(post.author.username);

          return (
            <div
              key={post.id}
              className="rounded-2xl bg-[#141A1C] border border-[#253235] p-5 space-y-3.5 hover:border-[#2C3B40] transition-colors text-left"
            >
              {/* Author Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-10 h-10 rounded-xl object-cover border border-[#28383B] shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white truncate">{post.author.name}</span>
                      <span className="text-[11px] text-[#78888D] font-mono truncate">@{post.author.username}</span>
                      {post.verified && (
                        <span title="Verified Learner">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#00E5FF] shrink-0" />
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-[#78888D] truncate max-w-sm mt-0.5">
                      {post.author.headline}
                    </p>
                  </div>
                </div>

                {/* Follow Button & Timestamp */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-[#6E7F84] font-mono">{post.timeAgo}</span>
                  {post.author.username !== 'dev_guest' && (
                    <button
                      onClick={() => handleToggleFollow(post.author.username)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                        isFollowingAuthor
                          ? 'bg-[#182326] text-[#00E5FF] border border-[#00E5FF]/30'
                          : 'bg-[#FFAD42]/10 hover:bg-[#FFAD42]/20 text-[#FFAD42] border border-[#FFAD42]/30'
                      }`}
                    >
                      {isFollowingAuthor ? (
                        <>
                          <UserCheck className="w-3 h-3" />
                          <span>Following</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3 h-3" />
                          <span>Follow</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Post Content */}
              <div className="space-y-1.5 pt-1">
                <h4 className="text-sm font-bold text-white tracking-tight">{post.title}</h4>
                <p className="text-xs text-[#A2B1B6] leading-relaxed whitespace-pre-line">
                  {post.content}
                </p>
              </div>

              {/* Topic / Problem Link Pill */}
              {post.topicId && onOpenTopic && (
                <div className="pt-1">
                  <button
                    onClick={() => onOpenTopic(post.topicId!)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0F1416] hover:bg-[#182225] border border-[#222E31] text-xs font-semibold text-[#00E5FF] transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Open Topic: {post.topicTitle || post.topicId}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Tags Row */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {post.tags.map((t, idx) => (
                    <span key={idx} className="text-[10px] font-mono text-[#6E7F84]">
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              {/* Post Action Bar (Like, Comment, Share) */}
              <div className="flex items-center justify-between pt-2 border-t border-[#202C2F] text-xs text-[#8A999E]">
                <div className="flex items-center gap-4">
                  {/* Like Button */}
                  <button
                    onClick={() => handleToggleLike(post.id)}
                    className={`flex items-center gap-1.5 transition-colors ${
                      post.hasLiked ? 'text-red-400 font-bold' : 'hover:text-white'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${post.hasLiked ? 'fill-current' : ''}`} />
                    <span>{post.likes}</span>
                  </button>

                  {/* Comments Count */}
                  <div className="flex items-center gap-1.5 text-[#8A999E]">
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.comments.length}</span>
                  </div>
                </div>

                {/* Share Button */}
                <button
                  onClick={() => onSharePost && onSharePost(post)}
                  className="flex items-center gap-1.5 text-xs text-[#8A999E] hover:text-[#00E5FF] transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>
              </div>

              {/* Comments Thread */}
              {post.comments.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[#1C2629]">
                  {post.comments.map(c => (
                    <div key={c.id} className="p-2.5 rounded-xl bg-[#0F1416] border border-[#202C2F] text-xs flex items-start gap-2.5">
                      <img src={c.avatar} alt="" className="w-5 h-5 rounded-md object-cover border border-[#253235] shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-[11px]">{c.author}</span>
                          <span className="text-[9px] text-[#6E7F84] font-mono">{c.time}</span>
                        </div>
                        <p className="text-[11px] text-[#8A999E] mt-0.5 leading-snug">{c.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Comment Input */}
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={commentInputs[post.id] || ''}
                  onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddComment(post.id);
                    }
                  }}
                  placeholder="Leave a comment or question..."
                  className="flex-1 bg-[#0F1416] border border-[#202C2F] rounded-xl px-3 py-1.5 text-xs text-white placeholder-[#6E7F84] focus:outline-none focus:border-[#FFAD42]/60 font-sans"
                />
                <button
                  onClick={() => handleAddComment(post.id)}
                  disabled={!(commentInputs[post.id] || '').trim()}
                  className="px-3 py-1.5 rounded-xl bg-[#1C2528] hover:bg-[#253235] disabled:opacity-40 text-xs font-semibold text-white transition-colors"
                >
                  Send
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
