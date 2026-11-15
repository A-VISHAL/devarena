import React from 'react';
import { Sparkles, Gamepad2, Swords, Layers, BookOpen, User, FileSpreadsheet, Wrench } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NavigationTab } from '../../types';

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  const tabs: { id: NavigationTab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'arena', label: 'Arena', icon: <Swords className="w-4 h-4" /> },
    { id: 'tools', label: 'Tools', icon: <Wrench className="w-4 h-4" /> },
    { id: 'dsa-sheets', label: 'Sheets', icon: <FileSpreadsheet className="w-4 h-4" /> },
    { id: 'play', label: 'Play', icon: <Gamepad2 className="w-4 h-4" /> },
    { id: 'cards', label: 'Cards', icon: <Layers className="w-4 h-4" /> },
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-arena-bg/95 backdrop-blur-md border-t border-arena-border px-3 py-1.5 flex items-center justify-around">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-all ${
              isActive 
                ? 'text-arena-textPrimary' 
                : 'text-arena-textSubtle hover:text-arena-textSecondary'
            }`}
          >
            <div className={`p-1 rounded-md ${isActive ? 'text-arena-amber' : ''}`}>
              {tab.icon}
            </div>
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
