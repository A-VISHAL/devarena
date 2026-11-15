import React, { useState, useEffect } from 'react';
import { 
  User, 
  Palette, 
  Bell, 
  Shield, 
  Gamepad2, 
  Code2, 
  Save, 
  RotateCcw, 
  Check, 
  Trash2, 
  Download, 
  Sparkles, 
  ExternalLink, 
  Volume2, 
  VolumeX, 
  Eye, 
  EyeOff, 
  Monitor, 
  Sun, 
  Moon, 
  Smartphone, 
  AlertTriangle,
  X,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AppSettings, DEFAULT_APP_SETTINGS } from '../types';
import { sound } from '../utils/sound';

type SettingsSection = 'account' | 'appearance' | 'notifications' | 'privacy' | 'gameplay' | 'editor';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
];

interface SettingsProps {
  onOpenAccountModal?: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onOpenAccountModal }) => {
  const { 
    user, 
    updateUserProfile, 
    settings, 
    updateSettings, 
    resetSettingsToDefault, 
    clearCodeCache 
  } = useApp();

  const [activeSection, setActiveSection] = useState<SettingsSection>('account');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [notificationTestToast, setNotificationTestToast] = useState<{ msg: string; success: boolean } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    action: () => void;
  } | null>(null);

  const handleTestNotification = () => {
    sound.playClick();
    const anyEnabled = settings.battleInvites || settings.friendActivity || settings.dailyReminders || settings.achievementAlerts;
    if (anyEnabled) {
      if (settings.soundEffects) sound.playVictory();
      setNotificationTestToast({
        msg: '✓ Test notification delivered! Notice the active bell in the top navigation bar.',
        success: true
      });
    } else {
      setNotificationTestToast({
        msg: '⚠ All notification categories are currently turned off. Toggle at least one on to receive alerts.',
        success: false
      });
    }
    setTimeout(() => setNotificationTestToast(null), 4500);
  };

  // Form states for account settings
  const [displayName, setDisplayName] = useState(user.displayName);
  const [username, setUsername] = useState(user.username);
  const [headline, setHeadline] = useState(user.headline || 'Full-Stack Engineer & Competitive Problem Solver');
  const [bio, setBio] = useState(user.bio || '');
  const [githubUrl, setGithubUrl] = useState(user.githubUrl || 'https://github.com');
  const [email, setEmail] = useState(user.email || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatar);
  const [skillsText, setSkillsText] = useState((user.skills || []).join(', '));

  // Sync state if user changes externally
  useEffect(() => {
    setDisplayName(user.displayName);
    setUsername(user.username);
    setHeadline(user.headline || 'Full-Stack Engineer & Competitive Problem Solver');
    setBio(user.bio || '');
    setGithubUrl(user.githubUrl || 'https://github.com');
    setEmail(user.email || '');
    setSelectedAvatar(user.avatar);
    setSkillsText((user.skills || []).join(', '));
  }, [user]);

  const showSaveToast = () => {
    setSaveSuccess(true);
    sound.playCorrect();
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();

    const parsedSkills = skillsText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    updateUserProfile({
      displayName: displayName.trim(),
      username: username.trim().toLowerCase().replace(/[^a-z0-9_]/g, ''),
      headline: headline.trim(),
      bio: bio.trim(),
      githubUrl: githubUrl.trim(),
      email: email.trim(),
      avatar: selectedAvatar,
      skills: parsedSkills.length > 0 ? parsedSkills : user.skills
    });

    showSaveToast();
  };

  const handleUpdateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    sound.playClick();
    updateSettings({ [key]: value });
    showSaveToast();
  };

  const handleResetDefaults = () => {
    setConfirmDialog({
      open: true,
      title: 'Reset Preferences to Default?',
      message: 'This will reset your appearance, notification, privacy, gameplay, and code editor settings back to standard defaults. Your solved problems, rating, streak, and cards will NOT be deleted.',
      action: () => {
        resetSettingsToDefault();
        sound.playClick();
        showSaveToast();
      }
    });
  };

  const handleClearCode = () => {
    setConfirmDialog({
      open: true,
      title: 'Clear Local Problem Code Cache?',
      message: 'This will remove all locally saved draft solutions across all problems in your browser. Solved problem statuses and achievements will remain preserved.',
      action: () => {
        clearCodeCache();
        sound.playClick();
        showSaveToast();
      }
    });
  };

  const handleExportData = () => {
    sound.playClick();
    try {
      const exportObject = {
        exportedAt: new Date().toISOString(),
        profile: user,
        settings,
        savedCode: JSON.parse(localStorage.getItem('devarena_code_cache') || '{}'),
        bookmarkedProblems: JSON.parse(localStorage.getItem('devarena_bookmarked_problems') || '[]'),
        attemptedProblems: JSON.parse(localStorage.getItem('devarena_attempted_problems') || '[]')
      };

      const blob = new Blob([JSON.stringify(exportObject, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `devarena-backup-${user.username}-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Export failed', e);
    }
  };

  const navItems: { id: SettingsSection; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'account', label: 'Account', icon: <User className="w-4 h-4" />, desc: 'Profile identity & developer handle' },
    { id: 'appearance', label: 'Appearance', icon: <Palette className="w-4 h-4" />, desc: 'Theme, density & accent palette' },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" />, desc: '1v1 invites, streaks & milestones' },
    { id: 'privacy', label: 'Privacy', icon: <Shield className="w-4 h-4" />, desc: 'Profile visibility & online presence' },
    { id: 'gameplay', label: 'Gameplay', icon: <Gamepad2 className="w-4 h-4" />, desc: 'Audio SFX & matchmaking filters' },
    { id: 'editor', label: 'Editor Preferences', icon: <Code2 className="w-4 h-4" />, desc: 'Language, font size & tab sizing' },
  ];

  return (
    <div className="page-container py-8 max-w-6xl mx-auto space-y-6 animate-in fade-in select-none">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#253235]">
        <div>
          <h1 className="text-2xl font-bold text-[#F5F5F5] tracking-tight">Settings</h1>
          <p className="text-xs text-[#8A999E] mt-1">
            Manage your personal identity, visual theme, gameplay acoustics, and coding editor preferences.
          </p>
        </div>

        {/* Global Save Status Indicator */}
        <div className="flex items-center gap-2">
          {saveSuccess && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#B5FF4A]/10 border border-[#B5FF4A]/30 text-xs font-semibold text-[#B5FF4A] animate-in fade-in">
              <Check className="w-3.5 h-3.5" />
              <span>Preferences saved</span>
            </div>
          )}
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#182124] hover:bg-[#222E31] border border-[#2B393D] text-xs font-medium text-[#8A999E] hover:text-[#F5F5F5] transition-colors"
            title="Reset preferences to standard factory values"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* ============================================================== */}
        {/* LEFT NAVIGATION COLUMN (4 Cols on Desktop)                     */}
        {/* ============================================================== */}
        <div className="md:col-span-4 lg:col-span-3 space-y-1 bg-[#141A1C] border border-[#253235] p-2 rounded-2xl sticky top-20">
          <div className="px-3 py-2 text-[10px] font-mono font-bold uppercase tracking-wider text-[#6A7B80]">
            CONFIGURATION
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    sound.playClick();
                    setActiveSection(item.id);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-all ${
                    isActive
                      ? 'bg-[#1C2528] text-white border border-[#2F3E42] shadow-sm'
                      : 'text-[#8A999E] hover:text-[#F5F5F5] hover:bg-[#1A2225] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={isActive ? 'text-[#FFAD42]' : 'text-[#6A7B80]'}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] shadow-[0_0_6px_#00E5FF]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Data Backup Utility in Nav Footer */}
          <div className="pt-3 mt-3 border-t border-[#202B2E] px-2 space-y-1.5">
            <button
              onClick={handleExportData}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-[#8A999E] hover:text-[#F5F5F5] hover:bg-[#1A2225] transition-colors"
              title="Download your full profile, history, and code as JSON"
            >
              <Download className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span>Export Data (JSON)</span>
            </button>
            <button
              onClick={handleClearCode}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Clear cached editor code drafts from localStorage"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Code Cache</span>
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* RIGHT CONTENT PANEL (8/9 Cols on Desktop)                      */}
        {/* ============================================================== */}
        <div className="md:col-span-8 lg:col-span-9 bg-[#141A1C] border border-[#253235] rounded-2xl p-6 sm:p-7 space-y-6">

          {/* ============================================================ */}
          {/* SECTION 1: ACCOUNT                                           */}
          {/* ============================================================ */}
          {activeSection === 'account' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="pb-4 border-b border-[#222E31]">
                <h2 className="text-base font-bold text-[#F5F5F5]">Account & Developer Identity</h2>
                <p className="text-xs text-[#8A999E] mt-0.5">
                  Your public profile information, developer handle, and account status.
                </p>
              </div>

              {/* Account Status Card */}
              <div className="p-4 rounded-xl bg-[#0F1416] border border-[#222E31] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                    user.isGuest 
                      ? 'bg-[#1C2528] border-[#2E3C40] text-[#00E5FF]' 
                      : 'bg-[#B5FF4A]/10 border-[#B5FF4A]/30 text-[#B5FF4A]'
                  }`}>
                    {user.isGuest ? <ShieldCheck className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">
                        {user.isGuest ? 'Guest Session' : 'Permanent Developer Account'}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.2 rounded-full border ${
                        user.isGuest 
                          ? 'bg-[#00E5FF]/10 text-[#00E5FF] border-[#00E5FF]/30' 
                          : 'bg-[#B5FF4A]/10 text-[#B5FF4A] border-[#B5FF4A]/30'
                      }`}>
                        {user.isGuest ? 'Local Storage' : 'Verified'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#78888D] mt-0.5">
                      {user.isGuest 
                        ? 'Your statistics and streak are stored in this browser. Convert to permanent identity anytime.' 
                        : 'Your developer account is registered and persisted locally.'}
                    </p>
                  </div>
                </div>

                {user.isGuest && onOpenAccountModal && (
                  <button
                    onClick={() => {
                      sound.playClick();
                      onOpenAccountModal();
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-[#FFAD42] hover:bg-[#F29F30] text-[#101314] text-xs font-bold shrink-0 transition-colors"
                  >
                    Claim Account
                  </button>
                )}
              </div>

              {/* Profile Picture Selector */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-[#D4DCDE]">
                  Profile Avatar
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <img
                    src={selectedAvatar}
                    alt={displayName}
                    className="w-14 h-14 rounded-xl object-cover border-2 border-[#FFAD42] shadow-sm shrink-0"
                  />
                  <div className="space-y-2 flex-1 min-w-[200px]">
                    <div className="text-[11px] text-[#8A999E]">Choose from preset developer avatars:</div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {AVATAR_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            sound.playClick();
                            setSelectedAvatar(preset);
                          }}
                          className={`w-9 h-9 rounded-lg overflow-hidden border transition-all ${
                            selectedAvatar === preset 
                              ? 'border-[#FFAD42] scale-105 shadow-sm ring-2 ring-[#FFAD42]/30' 
                              : 'border-[#29373B] hover:border-[#8A999E] opacity-75 hover:opacity-100'
                          }`}
                        >
                          <img src={preset} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Details Form */}
              <form onSubmit={handleSaveAccount} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Username Handle */}
                  <div>
                    <label className="block text-xs font-semibold text-[#D4DCDE] mb-1.5">
                      Username Handle
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-[#6E7F84] text-xs font-mono">@</span>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        className="w-full bg-[#182225] border border-[#28373B] rounded-xl pl-7 pr-3 py-2 text-xs text-[#F5F5F5] font-mono focus:outline-none focus:border-[#FFAD42]/60 focus:ring-1 focus:ring-[#FFAD42]/30"
                        maxLength={24}
                        required
                      />
                    </div>
                    <span className="text-[10px] text-[#6E7F84] mt-1 block font-mono">
                      devarena.io/@{username}
                    </span>
                  </div>

                  {/* Display Name */}
                  <div>
                    <label className="block text-xs font-semibold text-[#D4DCDE] mb-1.5">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-[#182225] border border-[#28373B] rounded-xl px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#FFAD42]/60 focus:ring-1 focus:ring-[#FFAD42]/30"
                      maxLength={32}
                      required
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-[#D4DCDE]">
                      Contact Email (Optional)
                    </label>
                    <span className="text-[10px] text-[#6E7F84]">Stored locally for profile exports</span>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="developer@domain.com"
                    className="w-full bg-[#182225] border border-[#28373B] rounded-xl px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#FFAD42]/60 focus:ring-1 focus:ring-[#FFAD42]/30"
                  />
                </div>

                {/* Developer Headline */}
                <div>
                  <label className="block text-xs font-semibold text-[#D4DCDE] mb-1.5">
                    Professional Headline
                  </label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="e.g. Distributed Systems Engineer & LeetCode Specialist"
                    className="w-full bg-[#182225] border border-[#28373B] rounded-xl px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#FFAD42]/60 focus:ring-1 focus:ring-[#FFAD42]/30"
                    maxLength={70}
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-xs font-semibold text-[#D4DCDE] mb-1.5">
                    Bio
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    placeholder="Briefly introduce your focus areas, interests, or background..."
                    className="w-full bg-[#182225] border border-[#28373B] rounded-xl p-3 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#FFAD42]/60 focus:ring-1 focus:ring-[#FFAD42]/30 resize-none leading-relaxed"
                    maxLength={200}
                  />
                  <div className="text-right text-[10px] text-[#6E7F84] mt-0.5 font-mono">
                    {bio.length}/200
                  </div>
                </div>

                {/* GitHub & Skills */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#D4DCDE] mb-1.5">
                      GitHub URL
                    </label>
                    <input
                      type="url"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/username"
                      className="w-full bg-[#182225] border border-[#28373B] rounded-xl px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#FFAD42]/60 focus:ring-1 focus:ring-[#FFAD42]/30 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#D4DCDE] mb-1.5">
                      Skills (Comma separated)
                    </label>
                    <input
                      type="text"
                      value={skillsText}
                      onChange={(e) => setSkillsText(e.target.value)}
                      placeholder="Algorithms, TypeScript, React, Go"
                      className="w-full bg-[#182225] border border-[#28373B] rounded-xl px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#FFAD42]/60 focus:ring-1 focus:ring-[#FFAD42]/30"
                    />
                  </div>
                </div>

                {/* Save Account Button */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#FFAD42] hover:bg-[#F29F30] text-[#101314] text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Account Profile</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ============================================================ */}
          {/* SECTION 2: APPEARANCE                                        */}
          {/* ============================================================ */}
          {activeSection === 'appearance' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="pb-4 border-b border-[#222E31]">
                <h2 className="text-base font-bold text-[#F5F5F5]">Appearance & UI Theme</h2>
                <p className="text-xs text-[#8A999E] mt-0.5">
                  Customize the interface theme, accent highlights, and information density.
                </p>
              </div>

              {/* Active Visual Preset Banner */}
              <div className="p-3.5 rounded-xl bg-[#0F1416] border border-[#222E31] flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[#8A999E]">Active Style:</span>
                  <span className="px-2 py-0.5 rounded-md font-mono text-[11px] font-bold bg-[#182326] text-white border border-[#28383B]">
                    {settings.theme === 'midnight' ? 'Pure Midnight #050708' : settings.theme === 'dim' ? 'Dim Charcoal #161C1E' : 'Dark Default #101314'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-[11px] text-[#8A999E]">
                    Accent: <strong className="text-white capitalize">{settings.accentColor}</strong>
                  </span>
                  <span>•</span>
                  <span className="text-[11px] text-[#8A999E]">
                    Density: <strong className="text-white capitalize">{settings.layoutDensity}</strong>
                  </span>
                </div>
              </div>

              {/* Theme Selector */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-[#D4DCDE]">
                  Base Surface Theme
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'dark', title: 'Dark (Default)', desc: 'Standard deep charcoal #101314', bg: 'bg-[#101314]', border: 'border-[#293639]' },
                    { id: 'dim', title: 'Dim Charcoal', desc: 'Slightly lighter slate #161C1E', bg: 'bg-[#161C1E]', border: 'border-[#2C383C]' },
                    { id: 'midnight', title: 'Pure Midnight', desc: 'High-contrast true black #0A0C0D', bg: 'bg-[#0A0C0D]', border: 'border-[#202729]' }
                  ].map((theme) => {
                    const isSelected = settings.theme === theme.id;
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => handleUpdateSetting('theme', theme.id as any)}
                        className={`p-3.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-[#00E5FF] bg-[#1A2528] ring-1 ring-[#00E5FF]/40'
                            : 'border-[#253235] bg-[#101517] hover:border-[#38494E]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-white">{theme.title}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#00E5FF]" />}
                        </div>
                        <div className={`h-8 rounded-lg ${theme.bg} border ${theme.border} mb-2`} />
                        <p className="text-[11px] text-[#78888D] leading-tight">{theme.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Accent Color Palette */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-semibold text-[#D4DCDE]">
                  Interface Accent Color
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'orange', name: 'Amber Orange', hex: '#FFAD42', label: 'Default DEVARENA' },
                    { id: 'cyan', name: 'Cyber Cyan', hex: '#00E5FF', label: 'Ranked Arena' },
                    { id: 'emerald', name: 'Emerald Teal', hex: '#83B6A3', label: 'Balanced Slate' },
                    { id: 'lime', name: 'Lime Green', hex: '#B5FF4A', label: 'Victory & Success' }
                  ].map((accent) => {
                    const isSelected = settings.accentColor === accent.id;
                    return (
                      <button
                        key={accent.id}
                        type="button"
                        onClick={() => handleUpdateSetting('accentColor', accent.id as any)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-[#00E5FF] bg-[#1A2528] ring-1 ring-[#00E5FF]/40'
                            : 'border-[#253235] bg-[#101517] hover:border-[#38494E]'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="w-4 h-4 rounded-full border border-black/30" style={{ backgroundColor: accent.hex }} />
                          <span className="text-xs font-bold text-white">{accent.name}</span>
                        </div>
                        <div className="text-[10px] text-[#78888D]">{accent.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Information Density */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-semibold text-[#D4DCDE]">
                  Layout Density
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: 'comfortable', title: 'Comfortable (Standard)', desc: 'Generous padding and relaxed breathing room for laptop screens.' },
                    { id: 'compact', title: 'Compact (High Density)', desc: 'Tighter tables and condensed headers for multi-window developer setups.' }
                  ].map((density) => {
                    const isSelected = settings.layoutDensity === density.id;
                    return (
                      <button
                        key={density.id}
                        type="button"
                        onClick={() => handleUpdateSetting('layoutDensity', density.id as any)}
                        className={`p-3.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-[#00E5FF] bg-[#1A2528] ring-1 ring-[#00E5FF]/40'
                            : 'border-[#253235] bg-[#101517] hover:border-[#38494E]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-white">{density.title}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#00E5FF]" />}
                        </div>
                        <p className="text-[11px] text-[#78888D]">{density.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* SECTION 3: NOTIFICATIONS                                     */}
          {/* ============================================================ */}
          {activeSection === 'notifications' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="pb-4 border-b border-[#222E31]">
                <h2 className="text-base font-bold text-[#F5F5F5]">Notification Preferences</h2>
                <p className="text-xs text-[#8A999E] mt-0.5">
                  Control in-app alerts, duel challenge banners, and daily streak reminders.
                </p>
              </div>

              {notificationTestToast && (
                <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 animate-in fade-in ${
                  notificationTestToast.success
                    ? 'bg-[#B5FF4A]/10 border-[#B5FF4A]/30 text-[#B5FF4A]'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                }`}>
                  <Bell className="w-4 h-4 shrink-0" />
                  <span>{notificationTestToast.msg}</span>
                </div>
              )}

              <div className="space-y-3">
                {[
                  {
                    key: 'battleInvites' as const,
                    title: '1v1 Battle Invitations',
                    desc: 'Display instant challenge alerts when an opponent invites you to a coding battle.'
                  },
                  {
                    key: 'friendActivity' as const,
                    title: 'Community Activity & Mentions',
                    desc: 'Notify when friends complete daily challenges or comment on your submissions.'
                  },
                  {
                    key: 'dailyReminders' as const,
                    title: 'Daily Challenge Reminders',
                    desc: 'Show unobtrusive reminders when new word puzzles or coding problems become available.'
                  },
                  {
                    key: 'achievementAlerts' as const,
                    title: 'Achievement Unlocks & Cards',
                    desc: 'Display modal celebrations and trigger victory card unlock fanfare.'
                  }
                ].map((item) => {
                  const enabled = settings[item.key];
                  return (
                    <div
                      key={item.key}
                      className="p-4 rounded-xl bg-[#0F1416] border border-[#222E31] flex items-center justify-between gap-4"
                    >
                      <div>
                        <div className="text-xs font-bold text-white">{item.title}</div>
                        <p className="text-[11px] text-[#78888D] mt-0.5 leading-relaxed">{item.desc}</p>
                      </div>

                      {/* Accessible Custom Toggle Switch */}
                      <button
                        type="button"
                        onClick={() => handleUpdateSetting(item.key, !enabled)}
                        className={`w-11 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer ${
                          enabled ? 'bg-[#FFAD42]' : 'bg-[#253235]'
                        }`}
                      >
                        <span
                          className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-[#101314] transition-transform ${
                            enabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Real-time Notification Verification Simulator */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#0F1416] border border-[#222E31]">
                <div>
                  <div className="text-xs font-bold text-white">Live Notification Verification</div>
                  <p className="text-[11px] text-[#78888D] mt-0.5">
                    Test your configured in-app alert rules with a real simulator.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleTestNotification}
                  className="px-3.5 py-1.5 rounded-lg bg-[#FFAD42]/15 hover:bg-[#FFAD42]/25 border border-[#FFAD42]/40 text-xs font-semibold text-[#FFAD42] transition-colors shrink-0 flex items-center gap-1.5"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Send Test Alert</span>
                </button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* SECTION 4: PRIVACY                                           */}
          {/* ============================================================ */}
          {activeSection === 'privacy' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="pb-4 border-b border-[#222E31]">
                <h2 className="text-base font-bold text-[#F5F5F5]">Privacy & Security</h2>
                <p className="text-xs text-[#8A999E] mt-0.5">
                  Control how your rating, battle logs, and activity appear to other developers.
                </p>
              </div>

              {/* Real-time Status Indicator Pill */}
              <div className="p-3.5 rounded-xl bg-[#0F1416] border border-[#222E31] flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[#8A999E]">Sidebar Presence:</span>
                  <span className={`px-2 py-0.5 rounded-full font-mono font-bold text-[10px] flex items-center gap-1.5 border ${
                    settings.onlineStatus === 'invisible'
                      ? 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${settings.onlineStatus === 'invisible' ? 'bg-slate-500' : 'bg-emerald-400 animate-pulse'}`} />
                    {settings.onlineStatus === 'invisible' ? 'Invisible (Concealed)' : 'Online Duels Ready'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[#8A999E]">Ranking Visibility:</span>
                  <span className="px-2 py-0.5 rounded-full font-mono font-bold text-[10px] bg-[#182326] text-white border border-[#2B3B3F]">
                    {settings.profileVisibility === 'private' ? 'Concealed' : settings.profileVisibility === 'friends' ? 'Direct Only' : 'Public Global'}
                  </span>
                </div>
              </div>

              {/* Profile Visibility */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-[#D4DCDE]">
                  Profile Visibility
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'public', title: 'Public (Recommended)', desc: 'Visible on global leaderboards and shareable profile URLs.' },
                    { id: 'friends', title: 'Direct Only', desc: 'Visible only to players who receive your direct battle links.' },
                    { id: 'private', title: 'Concealed', desc: 'Completely hides rating badges from public rankings.' }
                  ].map((opt) => {
                    const isSelected = settings.profileVisibility === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleUpdateSetting('profileVisibility', opt.id as any)}
                        className={`p-3.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-[#00E5FF] bg-[#1A2528] ring-1 ring-[#00E5FF]/40'
                            : 'border-[#253235] bg-[#101517] hover:border-[#38494E]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-white">{opt.title}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#00E5FF]" />}
                        </div>
                        <p className="text-[11px] text-[#78888D]">{opt.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Online Presence */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-semibold text-[#D4DCDE]">
                  Online Status Indicator
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: 'online', title: 'Show as Online', desc: 'Displays green pulse indicator to allow opponents to request 1v1 duels.' },
                    { id: 'invisible', title: 'Invisible Mode', desc: 'Appear offline while solving problems and practicing quietly.' }
                  ].map((opt) => {
                    const isSelected = settings.onlineStatus === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleUpdateSetting('onlineStatus', opt.id as any)}
                        className={`p-3.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-[#00E5FF] bg-[#1A2528] ring-1 ring-[#00E5FF]/40'
                            : 'border-[#253235] bg-[#101517] hover:border-[#38494E]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-white">{opt.title}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#00E5FF]" />}
                        </div>
                        <p className="text-[11px] text-[#78888D]">{opt.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Match Activity Visibility */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-semibold text-[#D4DCDE]">
                  Battle Activity Log
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: 'public', title: 'Publish Match Results', desc: 'Allows your verified battle victories to appear in the Community Feed.' },
                    { id: 'concealed', title: 'Keep Matches Private', desc: 'Restricts match outcomes solely to your private history tab.' }
                  ].map((opt) => {
                    const isSelected = settings.activityVisibility === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleUpdateSetting('activityVisibility', opt.id as any)}
                        className={`p-3.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-[#00E5FF] bg-[#1A2528] ring-1 ring-[#00E5FF]/40'
                            : 'border-[#253235] bg-[#101517] hover:border-[#38494E]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-white">{opt.title}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#00E5FF]" />}
                        </div>
                        <p className="text-[11px] text-[#78888D]">{opt.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* SECTION 5: GAMEPLAY                                          */}
          {/* ============================================================ */}
          {activeSection === 'gameplay' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="pb-4 border-b border-[#222E31]">
                <h2 className="text-base font-bold text-[#F5F5F5]">Gameplay & Acoustics</h2>
                <p className="text-xs text-[#8A999E] mt-0.5">
                  Audio synthesis, animation behavior, and 1v1 matchmaking parameters.
                </p>
              </div>

              {/* Audio SFX Toggle */}
              <div className="p-4 rounded-xl bg-[#0F1416] border border-[#222E31] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1C2528] border border-[#2B393D] text-[#FFAD42] flex items-center justify-center">
                    {settings.soundEffects ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-[#6E7F84]" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Procedural Web Audio SFX</div>
                    <p className="text-[11px] text-[#78888D] mt-0.5">
                      Synthesizes button clicks, test case passes, and victory fanfare without audio files.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  {settings.soundEffects && (
                    <button
                      type="button"
                      onClick={() => {
                        sound.playVictory();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#182326] hover:bg-[#202F33] border border-[#27373B] text-[11px] font-mono text-[#FFAD42] transition-colors"
                      title="Play procedural sound test"
                    >
                      Test Chime ♫
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleUpdateSetting('soundEffects', !settings.soundEffects)}
                    className={`w-11 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer ${
                      settings.soundEffects ? 'bg-[#FFAD42]' : 'bg-[#253235]'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-[#101314] transition-transform ${
                        settings.soundEffects ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Reduced Motion Toggle */}
              <div className="p-4 rounded-xl bg-[#0F1416] border border-[#222E31] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1C2528] border border-[#2B393D] text-[#00E5FF] flex items-center justify-center">
                    <Monitor className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Reduced Motion Mode</div>
                    <p className="text-[11px] text-[#78888D] mt-0.5">
                      Suppresses decorative confetti, pulsing halos, and micro-transitions for low-power devices.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleUpdateSetting('reducedMotion', !settings.reducedMotion)}
                  className={`w-11 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer ${
                    settings.reducedMotion ? 'bg-[#00E5FF]' : 'bg-[#253235]'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-[#101314] transition-transform ${
                      settings.reducedMotion ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Matchmaking Preferences */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-semibold text-[#D4DCDE]">
                  1v1 Battle Matchmaking Queue
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'open', title: 'Open Pool (Default)', desc: 'Matches with the fastest available challenger regardless of exact Elo rating.' },
                    { id: 'ranked_only', title: 'Strict Ranked Elo', desc: 'Restricts matchmaking strictly to opponents within ±150 rating points.' },
                    { id: 'casual_only', title: 'Casual Warmup', desc: 'Prioritizes casual fun without unranked stakes.' }
                  ].map((opt) => {
                    const isSelected = settings.matchmakingPref === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleUpdateSetting('matchmakingPref', opt.id as any)}
                        className={`p-3.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-[#00E5FF] bg-[#1A2528] ring-1 ring-[#00E5FF]/40'
                            : 'border-[#253235] bg-[#101517] hover:border-[#38494E]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-white">{opt.title}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#00E5FF]" />}
                        </div>
                        <p className="text-[11px] text-[#78888D]">{opt.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* SECTION 6: EDITOR PREFERENCES                                */}
          {/* ============================================================ */}
          {activeSection === 'editor' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="pb-4 border-b border-[#222E31]">
                <h2 className="text-base font-bold text-[#F5F5F5]">Monaco Code Editor Configuration</h2>
                <p className="text-xs text-[#8A999E] mt-0.5">
                  Set default programming language, font dimensions, indentation, and wrap rules.
                </p>
              </div>

              {/* Default Language */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-[#D4DCDE]">
                  Default Programming Language
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {[
                    { id: 'javascript', label: 'JavaScript', badge: 'Native ES' },
                    { id: 'typescript', label: 'TypeScript', badge: 'Transpiled' },
                    { id: 'python', label: 'Python', badge: 'Simulated' },
                    { id: 'java', label: 'Java', badge: 'Simulated' },
                    { id: 'cpp', label: 'C++', badge: 'Simulated' }
                  ].map((lang) => {
                    const isSelected = settings.defaultLanguage === lang.id;
                    return (
                      <button
                        key={lang.id}
                        type="button"
                        onClick={() => handleUpdateSetting('defaultLanguage', lang.id as any)}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          isSelected
                            ? 'border-[#FFAD42] bg-[#1F2729] ring-1 ring-[#FFAD42]/40 text-white'
                            : 'border-[#253235] bg-[#101517] hover:border-[#38494E] text-[#8A999E]'
                        }`}
                      >
                        <div className="text-xs font-bold font-mono">{lang.label}</div>
                        <div className="text-[9px] text-[#6E7F84] mt-0.5 font-mono">{lang.badge}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Font Size & Tab Size */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Font Size */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-[#D4DCDE]">
                    Editor Font Size ({settings.fontSize}px)
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {[12, 13, 14, 16, 18].map((size) => {
                      const isSelected = settings.fontSize === size;
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => handleUpdateSetting('fontSize', size)}
                          className={`py-2 rounded-lg border text-center font-mono text-xs font-bold transition-all ${
                            isSelected
                              ? 'border-[#00E5FF] bg-[#1A2528] text-[#00E5FF]'
                              : 'border-[#253235] bg-[#101517] text-[#8A999E] hover:border-[#38494E]'
                          }`}
                        >
                          {size}px
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tab Size */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-[#D4DCDE]">
                    Indentation Tab Size
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { size: 2, label: '2 Spaces (Standard)' },
                      { size: 4, label: '4 Spaces (Python/Java)' }
                    ].map((tab) => {
                      const isSelected = settings.tabSize === tab.size;
                      return (
                        <button
                          key={tab.size}
                          type="button"
                          onClick={() => handleUpdateSetting('tabSize', tab.size)}
                          className={`py-2 px-3 rounded-lg border text-left font-mono text-xs transition-all ${
                            isSelected
                              ? 'border-[#00E5FF] bg-[#1A2528] text-white'
                              : 'border-[#253235] bg-[#101517] text-[#8A999E] hover:border-[#38494E]'
                          }`}
                        >
                          <div className="font-bold">{tab.label}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Word Wrap & Theme */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Word Wrap */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-[#D4DCDE]">
                    Word Wrap
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { val: 'on', label: 'Enabled (Wrap Lines)' },
                      { val: 'off', label: 'Disabled (Scroll)' }
                    ].map((wrap) => {
                      const isSelected = settings.wordWrap === wrap.val;
                      return (
                        <button
                          key={wrap.val}
                          type="button"
                          onClick={() => handleUpdateSetting('wordWrap', wrap.val as any)}
                          className={`py-2 px-3 rounded-lg border text-left text-xs transition-all ${
                            isSelected
                              ? 'border-[#00E5FF] bg-[#1A2528] text-white font-bold'
                              : 'border-[#253235] bg-[#101517] text-[#8A999E] hover:border-[#38494E]'
                          }`}
                        >
                          {wrap.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Editor Theme */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-[#D4DCDE]">
                    Monaco Syntax Theme
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'vs-dark', label: 'VS Dark (Default)' },
                      { id: 'hc-black', label: 'High Contrast (Pure Black)' }
                    ].map((theme) => {
                      const isSelected = settings.editorTheme === theme.id;
                      return (
                        <button
                          key={theme.id}
                          type="button"
                          onClick={() => handleUpdateSetting('editorTheme', theme.id as any)}
                          className={`py-2 px-3 rounded-lg border text-left text-xs transition-all ${
                            isSelected
                              ? 'border-[#00E5FF] bg-[#1A2528] text-white font-bold'
                              : 'border-[#253235] bg-[#101517] text-[#8A999E] hover:border-[#38494E]'
                          }`}
                        >
                          {theme.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Editor Preview Sandbox Preview */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[11px] text-[#8A999E] font-mono">LIVE EDITOR PREVIEW</div>
                  <div className="text-[10px] text-arena-cyan font-mono capitalize">
                    {settings.defaultLanguage} • {settings.fontSize}px • {settings.tabSize} spaces • Wrap: {settings.wordWrap}
                  </div>
                </div>
                <div 
                  className={`p-4 rounded-xl border border-[#253235] font-mono leading-relaxed overflow-x-auto ${
                    settings.editorTheme === 'hc-black' ? 'bg-[#000000]' : 'bg-[#101314]'
                  }`}
                  style={{ 
                    fontSize: `${settings.fontSize}px`,
                    whiteSpace: settings.wordWrap === 'on' ? 'pre-wrap' : 'pre',
                    tabSize: settings.tabSize
                  }}
                >
                  {settings.defaultLanguage === 'python' ? (
                    <>
                      <span className="text-[#FFAD42]">def</span> <span className="text-[#00E5FF]">two_sum</span>(nums: list[int], target: int) -&gt; list[int]:{'\n'}
                      {' '.repeat(settings.tabSize)}seen = {'{}'}{'\n'}
                      {' '.repeat(settings.tabSize)}<span className="text-[#FFAD42]">for</span> i, num <span className="text-[#FFAD42]">in</span> enumerate(nums):{'\n'}
                      {' '.repeat(settings.tabSize * 2)}diff = target - num{'\n'}
                      {' '.repeat(settings.tabSize * 2)}<span className="text-[#FFAD42]">if</span> diff <span className="text-[#FFAD42]">in</span> seen:{'\n'}
                      {' '.repeat(settings.tabSize * 3)}<span className="text-[#FFAD42]">return</span> [seen[diff], i]{'\n'}
                      {' '.repeat(settings.tabSize * 2)}seen[num] = i{'\n'}
                      {' '.repeat(settings.tabSize)}<span className="text-[#FFAD42]">return</span> []
                    </>
                  ) : settings.defaultLanguage === 'cpp' ? (
                    <>
                      <span className="text-[#FFAD42]">class</span> <span className="text-[#00E5FF]">Solution</span> {'{\n'}
                      <span className="text-[#FFAD42]">public:</span>{'\n'}
                      {' '.repeat(settings.tabSize)}vector&lt;<span className="text-[#00E5FF]">int</span>&gt; twoSum(vector&lt;<span className="text-[#00E5FF]">int</span>&gt;&amp; nums, <span className="text-[#00E5FF]">int</span> target) {'{\n'}
                      {' '.repeat(settings.tabSize * 2)}unordered_map&lt;<span className="text-[#00E5FF]">int</span>, <span className="text-[#00E5FF]">int</span>&gt; prev;{'\n'}
                      {' '.repeat(settings.tabSize * 2)}<span className="text-[#FFAD42]">for</span> (<span className="text-[#00E5FF]">int</span> i = 0; i &lt; nums.size(); ++i) {'{\n'}
                      {' '.repeat(settings.tabSize * 3)}<span className="text-[#00E5FF]">int</span> diff = target - nums[i];{'\n'}
                      {' '.repeat(settings.tabSize * 3)}<span className="text-[#FFAD42]">if</span> (prev.count(diff)) <span className="text-[#FFAD42]">return</span> {'{prev[diff], i}'};{'\n'}
                      {' '.repeat(settings.tabSize * 3)}prev[nums[i]] = i;{'\n'}
                      {' '.repeat(settings.tabSize * 2)}{'}\n'}
                      {' '.repeat(settings.tabSize * 2)}<span className="text-[#FFAD42]">return</span> {'{}'};\n
                      {' '.repeat(settings.tabSize)}{'}\n'}
                      {'}'};
                    </>
                  ) : settings.defaultLanguage === 'java' ? (
                    <>
                      <span className="text-[#FFAD42]">class</span> <span className="text-[#00E5FF]">Solution</span> {'{\n'}
                      {' '.repeat(settings.tabSize)}<span className="text-[#FFAD42]">public</span> <span className="text-[#00E5FF]">int</span>[] twoSum(<span className="text-[#00E5FF]">int</span>[] nums, <span className="text-[#00E5FF]">int</span> target) {'{\n'}
                      {' '.repeat(settings.tabSize * 2)}Map&lt;Integer, Integer&gt; map = <span className="text-[#FFAD42]">new</span> HashMap&lt;&gt;();{'\n'}
                      {' '.repeat(settings.tabSize * 2)}<span className="text-[#FFAD42]">for</span> (<span className="text-[#00E5FF]">int</span> i = 0; i &lt; nums.length; i++) {'{\n'}
                      {' '.repeat(settings.tabSize * 3)}<span className="text-[#00E5FF]">int</span> complement = target - nums[i];{'\n'}
                      {' '.repeat(settings.tabSize * 3)}<span className="text-[#FFAD42]">if</span> (map.containsKey(complement)) <span className="text-[#FFAD42]">return new int</span>[] {'{map.get(complement), i}'};{'\n'}
                      {' '.repeat(settings.tabSize * 3)}map.put(nums[i], i);{'\n'}
                      {' '.repeat(settings.tabSize * 2)}{'}\n'}
                      {' '.repeat(settings.tabSize * 2)}<span className="text-[#FFAD42]">return new int</span>[] {'{}'};\n
                      {' '.repeat(settings.tabSize)}{'}\n'}
                      {'}'};
                    </>
                  ) : (
                    <>
                      <span className="text-[#FFAD42]">function</span> <span className="text-[#00E5FF]">twoSum</span>(nums{settings.defaultLanguage === 'typescript' ? ': number[]' : ''}, target{settings.defaultLanguage === 'typescript' ? ': number' : ''}){settings.defaultLanguage === 'typescript' ? ': number[]' : ''} {'{\n'}
                      {' '.repeat(settings.tabSize)}<span className="text-[#FFAD42]">const</span> map = <span className="text-[#FFAD42]">new</span> Map();{'\n'}
                      {' '.repeat(settings.tabSize)}<span className="text-[#FFAD42]">for</span> (<span className="text-[#FFAD42]">let</span> i = 0; i &lt; nums.length; i++) {'{\n'}
                      {' '.repeat(settings.tabSize * 2)}<span className="text-[#FFAD42]">const</span> complement = target - nums[i];{'\n'}
                      {' '.repeat(settings.tabSize * 2)}<span className="text-[#FFAD42]">if</span> (map.has(complement)) <span className="text-[#FFAD42]">return</span> [map.get(complement), i];{'\n'}
                      {' '.repeat(settings.tabSize * 2)}map.set(nums[i], i);{'\n'}
                      {' '.repeat(settings.tabSize)}{'}\n'}
                      {' '.repeat(settings.tabSize)}<span className="text-[#FFAD42]">return</span> [];{'\n'}
                      {'}'}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Confirmation Modal for Destructive Actions */}
      {confirmDialog && confirmDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0D0E]/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-sm bg-[#141A1C] border border-[#28383B] rounded-2xl p-6 shadow-2xl text-left space-y-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-white">{confirmDialog.title}</h3>
              <p className="text-xs text-[#8A999E] mt-1 leading-relaxed">
                {confirmDialog.message}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="px-3.5 py-1.5 rounded-lg bg-[#1C2528] hover:bg-[#253235] text-xs font-semibold text-[#8A999E] hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmDialog.action();
                  setConfirmDialog(null);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
