import React from 'react';
import { 
  FolderGit2, 
  MessageSquareCode, 
  Trophy, 
  Layers, 
  Edit3,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sound } from '../../utils/sound';

interface PostComposerProps {
  onOpenCreateModal: (defaultType?: 'discussion' | 'project_share' | 'battle_victory' | 'achievement_unlocked') => void;
}

export const PostComposer: React.FC<PostComposerProps> = ({ onOpenCreateModal }) => {
  const { user } = useApp();

  return (
    <div className="rounded-2xl bg-[#161F22] border border-[#2B3B3F] p-4 sm:p-5 shadow-card space-y-3.5">
      
      {/* Top Input Trigger Row */}
      <div className="flex items-center gap-3">
        <img
          src={user.avatar}
          alt={user.displayName}
          className="w-10 h-10 rounded-xl object-cover border border-[#2B3B3F] shrink-0"
        />

        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onOpenCreateModal('discussion');
          }}
          className="flex-1 text-left px-4 py-2.5 rounded-xl bg-[#111719] border border-[#26363A] hover:border-arena-borderHover text-xs text-arena-textSubtle hover:text-arena-textSecondary transition-all flex items-center justify-between group"
        >
          <span className="truncate">Start a post, share a project, or debate algorithms...</span>
          <Edit3 className="w-3.5 h-3.5 text-arena-textSubtle group-hover:text-arena-amber transition-colors shrink-0 ml-2" />
        </button>
      </div>

      {/* Quick Action Button Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#233134]">
        
        {/* 1. Project Showcase */}
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onOpenCreateModal('project_share');
          }}
          className="flex items-center justify-center gap-2 py-2 px-2.5 rounded-xl bg-[#12191B] border border-[#223033] hover:border-arena-teal/50 hover:bg-[#182326] transition-all text-xs font-semibold text-arena-textSecondary group"
        >
          <FolderGit2 className="w-4 h-4 text-arena-teal group-hover:scale-110 transition-transform" />
          <span className="group-hover:text-arena-textPrimary">Project</span>
        </button>

        {/* 2. Technical Discussion */}
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onOpenCreateModal('discussion');
          }}
          className="flex items-center justify-center gap-2 py-2 px-2.5 rounded-xl bg-[#12191B] border border-[#223033] hover:border-arena-amber/50 hover:bg-[#182326] transition-all text-xs font-semibold text-arena-textSecondary group"
        >
          <MessageSquareCode className="w-4 h-4 text-arena-amber group-hover:scale-110 transition-transform" />
          <span className="group-hover:text-arena-textPrimary">Discussion</span>
        </button>

        {/* 3. Battle Achievement */}
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onOpenCreateModal('battle_victory');
          }}
          className="flex items-center justify-center gap-2 py-2 px-2.5 rounded-xl bg-[#12191B] border border-[#223033] hover:border-amber-400/50 hover:bg-[#182326] transition-all text-xs font-semibold text-arena-textSecondary group"
        >
          <Trophy className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          <span className="group-hover:text-arena-textPrimary">Achievement</span>
        </button>

        {/* 4. Collectible Card */}
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onOpenCreateModal('achievement_unlocked');
          }}
          className="flex items-center justify-center gap-2 py-2 px-2.5 rounded-xl bg-[#12191B] border border-[#223033] hover:border-arena-amber/50 hover:bg-[#182326] transition-all text-xs font-semibold text-arena-textSecondary group"
        >
          <Layers className="w-4 h-4 text-arena-amber group-hover:scale-110 transition-transform" />
          <span className="group-hover:text-arena-textPrimary">Collectible</span>
        </button>

      </div>

    </div>
  );
};

