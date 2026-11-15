import React, { useState } from 'react';
import { 
  Users, 
  Sparkles, 
  Flame, 
  UserPlus, 
  UserCheck, 
  BookOpen, 
  Trophy, 
  Check, 
  ChevronRight,
  TrendingUp,
  MessageCircle,
  ExternalLink
} from 'lucide-react';
import { FellowLearner } from '../../types/learn';
import { sound } from '../../utils/sound';
import { toggleFollowLearner, getFollowedLearners } from '../../services/learningActivityService';

interface LearningTogetherSectionProps {
  currentTopicId: string;
  userSolvedCount: number;
  onOpenTopic: (topicId: string) => void;
}

const PEER_LEARNERS: FellowLearner[] = [
  {
    id: 'p1',
    name: 'Kavya Sharma',
    username: 'kavya_codes',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    headline: 'Prepping for SDE II • Graph & Tree Specialist',
    currentTopic: 'Trees & LCA',
    topicProgress: 75,
    currentSheet: 'Blind 75',
    streak: 5,
    problemsSolved: 84,
    isFollowing: true,
    sharedTopicId: 'trees'
  },
  {
    id: 'p2',
    name: 'Marcus Qin',
    username: 'marcus_q',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80',
    headline: 'Mastering Dynamic Programming & State Machines',
    currentTopic: 'Dynamic Programming',
    topicProgress: 60,
    currentSheet: 'NeetCode 150',
    streak: 7,
    problemsSolved: 112,
    isFollowing: true,
    sharedTopicId: 'dynamic-programming'
  },
  {
    id: 'p3',
    name: 'Alex Rivera',
    username: 'alex_dev',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    headline: 'Full-Stack Developer • Two Pointers & Sliding Window',
    currentTopic: 'Sliding Window',
    topicProgress: 90,
    currentSheet: 'Striver A2Z',
    streak: 4,
    problemsSolved: 48,
    isFollowing: false,
    sharedTopicId: 'sliding-window'
  },
  {
    id: 'p4',
    name: 'Sarah Chen',
    username: 'sarah_c',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    headline: 'Competitive Programmer • Graph & Dijkstra Focus',
    currentTopic: 'Graphs & Networks',
    topicProgress: 50,
    currentSheet: 'Top Interview 150',
    streak: 12,
    problemsSolved: 135,
    isFollowing: false,
    sharedTopicId: 'graphs'
  }
];

export const LearningTogetherSection: React.FC<LearningTogetherSectionProps> = ({
  currentTopicId,
  userSolvedCount,
  onOpenTopic
}) => {
  const [followedList, setFollowedList] = useState<string[]>(getFollowedLearners());
  const [kudosSent, setKudosSent] = useState<Record<string, string>>({});

  const handleToggleFollow = (username: string) => {
    sound.playClick();
    toggleFollowLearner(username);
    setFollowedList(getFollowedLearners());
  };

  const handleSendKudos = (userId: string, emoji: string) => {
    sound.playVictory();
    setKudosSent(prev => ({ ...prev, [userId]: emoji }));
    setTimeout(() => {
      setKudosSent(prev => {
        const copy = { ...prev };
        delete copy[userId];
        return copy;
      });
    }, 3000);
  };

  return (
    <div className="rounded-2xl bg-[#141A1C] border border-[#253235] p-5 sm:p-6 space-y-5 select-none">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#202C2F]">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#00E5FF]" />
            <h3 className="text-base font-bold text-white tracking-tight">Learning With Others</h3>
          </div>
          <p className="text-xs text-[#8A999E] mt-0.5">
            Discover fellow developers studying the same algorithms and interview sheets.
          </p>
        </div>

        <span className="text-[10px] font-mono text-[#00E5FF] px-2 py-0.5 rounded bg-[#00E5FF]/10 border border-[#00E5FF]/30 font-semibold self-start sm:self-auto">
          Collaborative Study Hub
        </span>
      </div>

      {/* Peer Learners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {PEER_LEARNERS.map((peer) => {
          const isFollowing = followedList.includes(peer.username);
          const kudos = kudosSent[peer.id];

          return (
            <div
              key={peer.id}
              className="p-4 rounded-xl bg-[#0F1416] border border-[#222E31] hover:border-[#2C3B40] transition-colors space-y-3 flex flex-col justify-between"
            >
              {/* Peer Profile Summary */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={peer.avatar}
                    alt={peer.name}
                    className="w-10 h-10 rounded-xl object-cover border border-[#28383B] shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-white truncate">{peer.name}</div>
                    <div className="text-[10px] text-[#78888D] font-mono truncate">@{peer.username}</div>
                    <div className="text-[10px] text-[#A2B1B6] truncate mt-0.5">{peer.headline}</div>
                  </div>
                </div>

                {/* Follow Button */}
                <button
                  onClick={() => handleToggleFollow(peer.username)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all flex items-center gap-1 ${
                    isFollowing
                      ? 'bg-[#182326] text-[#00E5FF] border border-[#00E5FF]/30'
                      : 'bg-[#FFAD42]/10 hover:bg-[#FFAD42]/20 text-[#FFAD42] border border-[#FFAD42]/30'
                  }`}
                >
                  {isFollowing ? (
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
              </div>

              {/* Real-time Study Progress Comparison */}
              <div className="p-3 rounded-xl bg-[#141B1D] border border-[#202C2F] space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#8A999E]">Currently Studying:</span>
                  <button
                    onClick={() => onOpenTopic(peer.sharedTopicId)}
                    className="font-bold text-white hover:text-[#00E5FF] flex items-center gap-1 transition-colors"
                  >
                    <span>{peer.currentTopic}</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Comparative Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#6E7F84]">
                    <span>Topic Progress</span>
                    <span className="text-[#00E5FF] font-bold">{peer.topicProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#182225] overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-[#00E5FF] transition-all"
                      style={{ width: `${peer.topicProgress}%` }}
                    />
                  </div>
                </div>

                {/* Shared Sheet & Streak */}
                <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-[#78888D]">
                  <span className="px-2 py-0.5 rounded bg-[#182326] border border-[#253235]">
                    Sheet: {peer.currentSheet}
                  </span>
                  <span className="flex items-center gap-1 text-[#FFAD42] font-bold">
                    <Flame className="w-3 h-3" />
                    <span>{peer.streak}d streak</span>
                  </span>
                </div>
              </div>

              {/* Encouragement Reaction Actions */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-[10px] text-[#6E7F84]">Send Encouragement:</span>
                
                {kudos ? (
                  <span className="text-[11px] font-bold text-[#B5FF4A] flex items-center gap-1 animate-in fade-in">
                    <span>{kudos} Kudos Delivered!</span>
                  </span>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleSendKudos(peer.id, '🔥')}
                      className="px-2 py-0.5 rounded-lg bg-[#182326] hover:bg-[#202E32] border border-[#253235] text-[11px] transition-colors"
                      title="Send Fire Kudos"
                    >
                      🔥 Kudos
                    </button>
                    <button
                      onClick={() => handleSendKudos(peer.id, '✋')}
                      className="px-2 py-0.5 rounded-lg bg-[#182326] hover:bg-[#202E32] border border-[#253235] text-[11px] transition-colors"
                      title="Send High Five"
                    >
                      ✋ High Five
                    </button>
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};

