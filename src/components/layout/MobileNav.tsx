import React from 'react';
import { Sparkles, Gamepad2, Swords, BookOpen, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NavigationTab } from '../../types';

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  const tabs: { id: NavigationTab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'play', label: 'Play', icon: <Gamepad2 className="w-5 h-5 text-emerald-400" /> },
    { id: 'arena', label: 'Arena', icon: <Swords className="w-5 h-5 text-violet-400" /> },
    { id: 'learn', label: 'Learn', icon: <BookOpen className="w-5 h-5 text-cyan-400" /> },
    { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-arena-bg/95 backdrop-blur-xl border-t border-arena-border px-3 py-2 flex items-center justify-around">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
              isActive 
                ? 'text-white scale-105' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <div className={`p-1 rounded-lg ${isActive ? 'bg-violet-600/20' : ''}`}>
              {tab.icon}
            </div>
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

