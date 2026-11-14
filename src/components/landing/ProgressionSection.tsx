import React from 'react';
import { 
  Trophy, 
  Flame, 
  Swords, 
  Medal, 
  Sparkles, 
  Award, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  ArrowRight 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useInView } from '../../hooks/useScrollReveal';
import { sound } from '../../utils/sound';

export const ProgressionSection: React.FC = () => {
  const { navigateToApp } = useApp();
  const { ref, hasAnimated } = useInView({ threshold: 0.15 });

  const achievements = [
    {
      id: 'first-blood',
      title: 'First Blood',
      desc: 'Won a live 1v1 coding battle in Monaco Arena.',
      icon: <Swords className="w-5 h-5 text-arena-amber" />,
      tier: 'Gold',
      status: 'Unlocked'
    },
    {
      id: 'sub-200',
      title: 'Synapse Spark',
      desc: 'Clocked a sub-200ms reflex reaction benchmark.',
      icon: <Sparkles className="w-5 h-5 text-arena-teal" />,
      tier: 'Diamond',
      status: 'Unlocked'
    },
    {
      id: 'streak-master',
      title: 'Streak Sentinel',
      desc: 'Maintained a 5-day active daily puzzle completion streak.',
      icon: <Flame className="w-5 h-5 text-arena-amber" />,
      tier: 'Gold',
      status: 'Unlocked'
    },
    {
      id: 'algorithm-ace',
      title: 'Pattern Decoded',
      desc: 'Mastered all Two-Pointer & Sliding Window milestones.',
      icon: <Award className="w-5 h-5 text-arena-teal" />,
      tier: 'Silver',
      status: 'Unlocked'
    }
  ];

  return (
    <section ref={ref} id="progression" className="py-24 relative bg-[#141719]">
      <div className="w-[94%] max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className={`text-center max-w-3xl mx-auto space-y-4 reveal-init ${hasAnimated ? 'revealed' : ''}`}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-arena-surface border border-arena-border text-xs font-semibold text-arena-amber">
            <Trophy className="w-3.5 h-3.5 text-arena-amber" />
            <span>PROGRESSION & RECOGNITION</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-arena-textPrimary tracking-tight">
            Every move counts. <br />
            <span className="text-arena-amber">Build a verified developer profile.</span>
          </h2>

          <p className="text-sm sm:text-base text-arena-textSecondary leading-relaxed">
            Your performance creates real proof of skill. Track your algorithmic rating, personal speed records, streak multipliers, and collectible achievements.
          </p>
        </div>

        {/* 3-Column Progression Dashboard Grid */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch reveal-scale-init ${hasAnimated ? 'revealed' : ''}`}>
          
          {/* Card 1: Coding Rating & Elo Status */}
          <div className="p-6 rounded-2xl bg-arena-surface border border-arena-border space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-arena-amber/15 border border-arena-amber text-arena-amber flex items-center justify-center">
                  <Swords className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-arena-elevated border border-arena-border text-arena-teal">
                  Top 12%
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-arena-textSubtle tracking-wider block">
                  ALGORITHMIC RATING
                </span>
                <div className="text-3xl font-black text-arena-textPrimary font-mono mt-0.5">
                  1444 Elo
                </div>
                <p className="text-xs text-arena-textSecondary mt-1">
                  Ranked Arena tier based on live 1v1 match performance.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#111416] border border-arena-border space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-arena-textSecondary">Matches Played</span>
                  <span className="text-arena-textPrimary font-bold">28 Duels</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-arena-textSecondary">Win Rate</span>
                  <span className="text-arena-success font-bold">75% (21W / 7L)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-arena-textSecondary">Peak Rating</span>
                  <span className="text-arena-amber font-bold">1480 Elo</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-arena-border text-[11px] text-arena-textSubtle flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-arena-teal" />
              <span>Verified anti-cheat code execution</span>
            </div>
          </div>

          {/* Card 2: Daily Streak & Multipliers */}
          <div className="p-6 rounded-2xl bg-arena-surface border border-arena-border space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-arena-amber/15 border border-arena-amber text-arena-amber flex items-center justify-center">
                  <Flame className="w-5 h-5 text-arena-amber animate-pulse" />
                </div>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-arena-elevated border border-arena-border text-arena-amber">
                  1.5x XP Boost
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-arena-textSubtle tracking-wider block">
                  DAILY PUZZLE STREAK
                </span>
                <div className="text-3xl font-black text-arena-amber font-mono mt-0.5 flex items-center gap-2">
                  <span>5 Days</span>
                  <Flame className="w-6 h-6 fill-current animate-bounce" />
                </div>
                <p className="text-xs text-arena-textSecondary mt-1">
                  Consecutive days completing at least one daily puzzle or battle.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#111416] border border-arena-border space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-arena-textSecondary">Zip #42 Personal Best</span>
                  <span className="text-arena-teal font-bold">48s (14 moves)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-arena-textSecondary">Reaction Record</span>
                  <span className="text-arena-teal font-bold">194 ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-arena-textSecondary">Math Sprint High</span>
                  <span className="text-arena-amber font-bold">980 Pts</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-arena-border text-[11px] text-arena-textSubtle flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-arena-amber" />
              <span>Resets daily at 00:00 UTC</span>
            </div>
          </div>

          {/* Card 3: Collectible Badges & Achievements */}
          <div className="p-6 rounded-2xl bg-arena-surface border border-arena-border space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-arena-textSubtle tracking-wider block">
                  RECENT MILESTONES
                </span>
                <span className="text-xs font-mono text-arena-teal font-bold">
                  4/12 Unlocked
                </span>
              </div>

              <div className="space-y-2">
                {achievements.map((ach) => (
                  <div key={ach.id} className="p-2.5 rounded-xl bg-[#111416] border border-arena-border flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-arena-surface border border-arena-border flex items-center justify-center shrink-0">
                      {ach.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-arena-textPrimary flex items-center gap-1.5">
                        <span>{ach.title}</span>
                        <span className="text-[9px] px-1 py-0.2 rounded bg-arena-elevated border border-arena-border text-arena-amber font-mono">
                          {ach.tier}
                        </span>
                      </div>
                      <p className="text-[10px] text-arena-textSecondary truncate mt-0.5">
                        {ach.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                navigateToApp('profile');
              }}
              className="btn-secondary w-full py-2 text-xs font-semibold gap-1.5"
            >
              <span>View Full Profile & Medals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};

