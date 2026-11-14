import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  FolderGit2, 
  MessageSquareCode, 
  Trophy, 
  Layers, 
  Code2, 
  Link as LinkIcon,
  Github
} from 'lucide-react';
import { CommunityPost } from '../../types';
import { useApp } from '../../context/AppContext';
import { getUserCards } from '../../data/collectibleCards';
import { sound } from '../../utils/sound';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'discussion' | 'project_share' | 'battle_victory' | 'achievement_unlocked';
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'discussion'
}) => {
  const { user, addPost } = useApp();

  const [postType, setPostType] = useState<CommunityPost['type']>(defaultType);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('#Algorithms, #TypeScript');
  const [githubUrl, setGithubUrl] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [selectedCardId, setSelectedCardId] = useState('');

  if (!isOpen) return null;

  // Unlocked cards available for embedding
  const userUnlockedCards = getUserCards(user.unlockedCards || ['speed_thinker', 'daily_challenger', 'first_blood', 'perfect_submission']).filter(c => c.unlocked);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    sound.playVictory();

    // Parse tags into array
    const parsedTags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)
      .map(t => (t.startsWith('#') ? t : `#${t}`));

    addPost({
      author: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        headline: user.headline || 'Full-Stack Developer • Competitive Algorithmic Duelist',
        avatar: user.avatar,
        rating: user.rating
      },
      type: postType,
      title: title.trim(),
      content: content.trim(),
      tags: parsedTags.length > 0 ? parsedTags : undefined,
      githubUrl: githubUrl.trim() || undefined,
      projectUrl: projectUrl.trim() || undefined,
      collectibleCardId: selectedCardId || undefined,
      metadata: postType === 'battle_victory' ? {
        gameName: '1v1 Code Duel',
        score: '+24 Elo'
      } : undefined
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090C0E]/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-xl bg-[#141B1D] border border-[#2B3B3F] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#232F32]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-arena-amber/15 border border-arena-amber/40 flex items-center justify-center text-arena-amber">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-arena-textPrimary">Create Professional Post</h3>
              <p className="text-[11px] text-arena-textSubtle">Share technical knowledge, projects, or verified accomplishments</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-arena-textSubtle hover:text-arena-textPrimary hover:bg-[#202C2F] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          
          {/* Post Category Selector */}
          <div>
            <label className="block text-[11px] font-mono uppercase font-bold text-arena-textSubtle mb-1.5">
              POST CATEGORY
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'discussion', label: 'Discussion', icon: <MessageSquareCode className="w-3.5 h-3.5" /> },
                { id: 'project_share', label: 'Project', icon: <FolderGit2 className="w-3.5 h-3.5" /> },
                { id: 'battle_victory', label: '1v1 Victory', icon: <Trophy className="w-3.5 h-3.5" /> },
                { id: 'achievement_unlocked', label: 'Collectible', icon: <Layers className="w-3.5 h-3.5" /> },
              ].map(cat => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setPostType(cat.id as any)}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold transition-all border ${
                    postType === cat.id
                      ? 'bg-arena-amber text-[#111719] border-arena-amber font-bold'
                      : 'bg-[#111719] border-[#253438] text-arena-textSecondary hover:border-arena-borderHover'
                  }`}
                >
                  {cat.icon}
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Post Headline / Title */}
          <div>
            <label className="block text-[11px] font-mono uppercase font-bold text-arena-textSubtle mb-1.5">
              POST HEADLINE
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Mastered O(N) Two Pointers on Container With Most Water"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#111719] border border-[#27373B] text-xs text-arena-textPrimary placeholder-arena-textSubtle focus:outline-none focus:border-arena-amber"
              required
            />
          </div>

          {/* Post Body Text */}
          <div>
            <label className="block text-[11px] font-mono uppercase font-bold text-arena-textSubtle mb-1.5">
              CONTENT
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Explain your approach, engineering trade-offs, or share your solution..."
              rows={5}
              className="w-full p-3.5 rounded-xl bg-[#111719] border border-[#27373B] text-xs text-arena-textPrimary placeholder-arena-textSubtle focus:outline-none focus:border-arena-amber resize-none leading-relaxed"
              required
            />
          </div>

          {/* Technology Tags */}
          <div>
            <label className="block text-[11px] font-mono uppercase font-bold text-arena-textSubtle mb-1.5">
              TECHNOLOGY TAGS (COMMA SEPARATED)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. #TypeScript, #Algorithms, #SystemDesign"
              className="w-full px-3.5 py-2 rounded-xl bg-[#111719] border border-[#27373B] text-xs text-arena-textPrimary placeholder-arena-textSubtle focus:outline-none focus:border-arena-amber font-mono"
            />
          </div>

          {/* Project Details (if Project Showcase) */}
          {postType === 'project_share' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#111719] border border-[#253438]">
              <div>
                <label className="block text-[10px] font-mono uppercase font-bold text-arena-textSubtle mb-1 flex items-center gap-1">
                  <Github className="w-3 h-3" />
                  <span>GITHUB REPOSITORY URL</span>
                </label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/username/project"
                  className="w-full px-3 py-1.5 rounded-lg bg-[#162023] border border-[#2B3B3F] text-xs text-arena-textPrimary placeholder-arena-textSubtle focus:outline-none focus:border-arena-teal"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase font-bold text-arena-textSubtle mb-1 flex items-center gap-1">
                  <LinkIcon className="w-3 h-3" />
                  <span>LIVE DEMO URL</span>
                </label>
                <input
                  type="url"
                  value={projectUrl}
                  onChange={(e) => setProjectUrl(e.target.value)}
                  placeholder="https://my-demo-app.dev"
                  className="w-full px-3 py-1.5 rounded-lg bg-[#162023] border border-[#2B3B3F] text-xs text-arena-textPrimary placeholder-arena-textSubtle focus:outline-none focus:border-arena-teal"
                />
              </div>
            </div>
          )}

          {/* Collectible Embed Selector (if Achievement/Collectible) */}
          {(postType === 'achievement_unlocked' || postType === 'battle_victory') && (
            <div className="p-3.5 rounded-xl bg-[#111719] border border-[#253438] space-y-1.5">
              <label className="block text-[10px] font-mono uppercase font-bold text-arena-amber flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>ATTACH EARNED COLLECTIBLE CARD</span>
              </label>

              <select
                value={selectedCardId}
                onChange={(e) => setSelectedCardId(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-[#162023] border border-[#2B3B3F] text-xs text-arena-textPrimary focus:outline-none focus:border-arena-amber font-mono"
              >
                <option value="">None (Don't attach collectible)</option>
                {userUnlockedCards.map(c => (
                  <option key={c.id} value={c.id}>
                    [{c.rarity.toUpperCase()}] {c.title} ({c.cardId})
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-arena-textSubtle block">
                The embedded card will display with verified rarity styling, cryptographic hash, and telemetry.
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2.5 pt-3 border-t border-[#232F32]">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1 py-2.5 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1 py-2.5 text-xs font-bold gap-2 shadow-[0_0_16px_rgba(230,167,70,0.3)]"
            >
              <span>Publish Post</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
