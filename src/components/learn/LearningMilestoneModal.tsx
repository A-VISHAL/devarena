import React, { useState } from 'react';
import { 
  X, 
  Trophy, 
  Award, 
  Flame, 
  Sparkles, 
  Share2, 
  Send, 
  Copy, 
  Check, 
  Users, 
  ExternalLink,
  ShieldCheck,
  Code2
} from 'lucide-react';
import { LearningMilestone } from '../../types/learn';
import { sound } from '../../utils/sound';
import { copyTextToClipboard, getLinkedInShareUrl, getWhatsAppShareUrl } from '../../utils/resultShare';

interface LearningMilestoneModalProps {
  milestone: LearningMilestone | null;
  onClose: () => void;
  onPostToCommunity?: (milestone: LearningMilestone) => void;
}

export const LearningMilestoneModal: React.FC<LearningMilestoneModalProps> = ({
  milestone,
  onClose,
  onPostToCommunity
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [postedToCommunity, setPostedToCommunity] = useState(false);

  if (!milestone) return null;

  const shareText = `🏆 Proud to unlock the verified [${milestone.title}] milestone on DEVARENA!\n\n${milestone.description}\n\nTrack your algorithmic interview journey with daily contribution heatmaps and interactive roadmaps:\n${window.location.origin}/app/learn`;

  const handleCopyLink = async () => {
    sound.playClick();
    await copyTextToClipboard(shareText);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleShareLinkedIn = async () => {
    sound.playClick();
    await copyTextToClipboard(shareText);
    const url = getLinkedInShareUrl(window.location.href, shareText);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShareWhatsApp = async () => {
    sound.playClick();
    await copyTextToClipboard(shareText);
    const url = getWhatsAppShareUrl(shareText);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handlePublishCommunity = () => {
    sound.playVictory();
    if (onPostToCommunity) {
      onPostToCommunity(milestone);
    }
    setPostedToCommunity(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in select-none">
      <div className="relative w-full max-w-md bg-[#141A1C] border border-[#2B3B3F] rounded-2xl p-6 shadow-2xl text-left space-y-5">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[#1E282B] text-[#8A999E] hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Milestone Branded Graphic Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-b from-[#1C2528] to-[#101416] border border-[#2E3D42] text-center space-y-3 relative overflow-hidden shadow-card">
          <div className="w-14 h-14 rounded-2xl bg-[#FFAD42]/15 border border-[#FFAD42]/40 text-[#FFAD42] mx-auto flex items-center justify-center shadow-[0_0_20px_rgba(255,173,66,0.3)]">
            <Trophy className="w-7 h-7" />
          </div>

          <div>
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#00E5FF] uppercase block">
              {milestone.badge}
            </span>
            <h3 className="text-xl font-extrabold text-white mt-1">{milestone.title}</h3>
            <p className="text-xs text-[#8A999E] mt-1 leading-relaxed">
              {milestone.description}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B5FF4A]/10 border border-[#B5FF4A]/30 text-xs font-mono font-bold text-[#B5FF4A]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified Execution Milestone</span>
          </div>
        </div>

        {/* Actions & Sharing Channels */}
        <div className="space-y-2.5">
          {/* Post to DEVARENA Community */}
          {!postedToCommunity ? (
            <button
              onClick={handlePublishCommunity}
              className="w-full py-3 px-4 rounded-xl bg-[#FFAD42] hover:bg-[#F29F30] text-[#101314] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99]"
            >
              <Users className="w-4 h-4" />
              <span>Post to DEVARENA Community</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="p-3 rounded-xl bg-[#B5FF4A]/15 border border-[#B5FF4A]/40 flex items-center justify-between text-xs animate-in fade-in">
              <div className="flex items-center gap-2 text-[#B5FF4A] font-bold">
                <Check className="w-4 h-4" />
                <span>Published to Community Feed!</span>
              </div>
              <span className="text-[10px] font-mono text-[#8A999E]">Visible in /app/community</span>
            </div>
          )}

          {/* Social Buttons (LinkedIn & WhatsApp) */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleShareLinkedIn}
              className="py-2.5 px-3 rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.62 1.62 0 1 0 0-3.24 1.62 1.62 0 0 0 0 3.24M7.86 18.5V10.13H5.07V18.5h2.79Z" />
              </svg>
              <span>Share on LinkedIn</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="py-2.5 px-3 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/35 text-[#25D366] text-xs font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Share WhatsApp</span>
            </button>
          </div>

          {/* Copy Link Button */}
          <button
            onClick={handleCopyLink}
            className="w-full py-2.5 px-3 rounded-xl bg-[#182326] hover:bg-[#202E32] border border-[#26363A] text-xs font-medium text-white flex items-center justify-center gap-2 transition-colors"
          >
            {copiedLink ? <Check className="w-4 h-4 text-[#B5FF4A]" /> : <Copy className="w-4 h-4 text-[#00E5FF]" />}
            <span>{copiedLink ? 'Copied Milestone Summary!' : 'Copy Milestone Link'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};

