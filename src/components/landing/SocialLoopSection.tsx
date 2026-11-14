import React, { useState } from 'react';
import { 
  Users, 
  ArrowRight, 
  Share2, 
  Copy, 
  Check, 
  Sparkles, 
  Gamepad2, 
  Swords, 
  MessageSquare, 
  Trophy 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useInView } from '../../hooks/useScrollReveal';
import { sound } from '../../utils/sound';

export const SocialLoopSection: React.FC = () => {
  const { navigateToApp } = useApp();
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(1);
  const { ref, hasAnimated } = useInView({ threshold: 0.15 });

  const sampleRoomCode = 'DEV-8492';

  const handleCopyLink = () => {
    sound.playClick();
    navigator.clipboard.writeText(`https://devarena.com/?room=${sampleRoomCode}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <section ref={ref} id="social-loop" className="py-24 relative bg-[#101314]">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-arena-teal/5 rounded-full filter blur-[140px] pointer-events-none -z-10" />

      <div className="w-[94%] max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className={`text-center max-w-3xl mx-auto space-y-4 reveal-init ${hasAnimated ? 'revealed' : ''}`}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-arena-surface border border-arena-border text-xs font-semibold text-arena-teal">
            <Users className="w-3.5 h-3.5 text-arena-teal" />
            <span>THE SOCIAL VIRAL LOOP</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-arena-textPrimary tracking-tight">
            Better together. <br />
            <span className="text-arena-teal">Invite friends in seconds.</span>
          </h2>

          <p className="text-sm sm:text-base text-arena-textSecondary leading-relaxed">
            DEVARENA thrives on social challenges. No tedious onboarding or mandatory registration walls. Create a challenge, copy the link, and battle friends in real time.
          </p>
        </div>

        {/* Animated Visual Flow of a Challenge Journey */}
        <div className={`rounded-2xl bg-arena-surface border border-arena-border p-6 sm:p-10 shadow-2xl space-y-8 reveal-scale-init ${hasAnimated ? 'revealed' : ''}`}>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            
            {/* Step 1: Create Challenge */}
            <div 
              onClick={() => setActiveStep(1)}
              className={`p-5 rounded-xl border transition-all cursor-pointer ${
                activeStep === 1 
                  ? 'bg-arena-elevated border-arena-teal shadow-lg' 
                  : 'bg-[#141719] border-arena-border hover:bg-arena-elevated'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-arena-teal/15 text-arena-teal border border-arena-teal/30 flex items-center justify-center font-bold font-mono text-sm mb-3">
                1
              </div>
              <h3 className="font-bold text-sm text-arena-textPrimary">
                Create Private Room
              </h3>
              <p className="text-xs text-arena-textSecondary mt-1 leading-relaxed">
                Start a 1v1 Quick Math duel or casual puzzle room. Instant unique room code generated.
              </p>

              <div className="mt-4 p-2.5 rounded-lg bg-[#111416] border border-arena-border flex items-center justify-between font-mono text-xs">
                <span className="text-arena-amber font-bold">{sampleRoomCode}</span>
                <span className="text-[10px] text-arena-teal">Ready</span>
              </div>
            </div>

            {/* Step 2: Share With Friend */}
            <div 
              onClick={() => setActiveStep(2)}
              className={`p-5 rounded-xl border transition-all cursor-pointer ${
                activeStep === 2 
                  ? 'bg-arena-elevated border-arena-amber shadow-lg' 
                  : 'bg-[#141719] border-arena-border hover:bg-arena-elevated'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-arena-amber/15 text-arena-amber border border-arena-amber/30 flex items-center justify-center font-bold font-mono text-sm mb-3">
                2
              </div>
              <h3 className="font-bold text-sm text-arena-textPrimary">
                Send Shareable Link
              </h3>
              <p className="text-xs text-arena-textSecondary mt-1 leading-relaxed">
                Copy link with one click. Send on WhatsApp, Discord, or Slack. Opponents join directly as guests.
              </p>

              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={handleCopyLink}
                  className="btn-secondary w-full py-2 text-xs gap-1.5 font-mono"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-arena-success" /> : <Copy className="w-3.5 h-3.5 text-arena-amber" />}
                  <span>{copiedLink ? 'Link Copied!' : 'Copy Room Link'}</span>
                </button>
              </div>
            </div>

            {/* Step 3: Compete & Share Results */}
            <div 
              onClick={() => setActiveStep(3)}
              className={`p-5 rounded-xl border transition-all cursor-pointer ${
                activeStep === 3 
                  ? 'bg-arena-elevated border-arena-success shadow-lg' 
                  : 'bg-[#141719] border-arena-border hover:bg-arena-elevated'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-arena-success/15 text-arena-success border border-arena-success/30 flex items-center justify-center font-bold font-mono text-sm mb-3">
                3
              </div>
              <h3 className="font-bold text-sm text-arena-textPrimary">
                Live Duel & Rematch
              </h3>
              <p className="text-xs text-arena-textSecondary mt-1 leading-relaxed">
                Both players sync live scores. The winner takes the glory, and a rematch room is spawned instantly.
              </p>

              <div className="mt-4 p-2.5 rounded-lg bg-[#111416] border border-arena-border flex items-center justify-between text-xs font-mono">
                <span className="text-arena-textPrimary">Priya: 840 pts</span>
                <span className="text-arena-success font-bold">Rahul: 900 pts 🏆</span>
              </div>
            </div>

          </div>

          {/* Social Pillars Row */}
          <div className="pt-6 border-t border-arena-border grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            <div>
              <div className="font-bold text-sm text-arena-textPrimary flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-arena-teal" />
                <span>Zero Barrier Access</span>
              </div>
              <p className="text-xs text-arena-textSecondary mt-1">
                Anyone can play without downloading an app or creating a mandatory account first.
              </p>
            </div>

            <div>
              <div className="font-bold text-sm text-arena-textPrimary flex items-center gap-2">
                <Share2 className="w-4 h-4 text-arena-amber" />
                <span>Spoiler-Free Share Cards</span>
              </div>
              <p className="text-xs text-arena-textSecondary mt-1">
                Export clean visual cards for Wordle and Zip puzzles that show your streak without ruining answers.
              </p>
            </div>

            <div>
              <div className="font-bold text-sm text-arena-textPrimary flex items-center gap-2">
                <Trophy className="w-4 h-4 text-arena-teal" />
                <span>Friends Leaderboard</span>
              </div>
              <p className="text-xs text-arena-textSecondary mt-1">
                Filter global ladders to see weekly bragging rights across your circle.
              </p>
            </div>
          </div>

          {/* Call to action */}
          <div className="pt-4 text-center">
            <button
              onClick={() => {
                sound.playVictory();
                navigateToApp('play', 'multiplayer-math');
              }}
              className="btn-primary py-3 px-8 text-xs font-bold gap-2 shadow-lg"
            >
              <span>Challenge Your Friends Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};

