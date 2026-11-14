import React, { useState } from 'react';
import { TopHeader } from './TopHeader';
import { Sidebar } from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
  onOpenAccountModal: () => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ 
  children, 
  onOpenAccountModal 
}) => {
  // Remember sidebar preference between navigation and reloads
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('devarena_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const [mobileOpen, setMobileOpen] = useState(false);

  const handleToggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('devarena_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-arena-bg text-arena-textPrimary selection:bg-arena-amber/25 selection:text-white antialiased overflow-x-hidden">
      
      {/* 1. Minimal Top Header */}
      <TopHeader 
        onOpenAccountModal={onOpenAccountModal}
        onToggleMobileSidebar={() => setMobileOpen(true)}
      />

      {/* 2. Hybrid Application Layout: Sidebar + Full Remaining Width Main Content */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Collapsible Sidebar */}
        <Sidebar 
          isCollapsed={isCollapsed}
          onToggleCollapse={handleToggleCollapse}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
          onOpenSettings={onOpenAccountModal}
        />

        {/* Main Content Area - occupying all remaining available width without overlap */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          {children}
        </main>

      </div>
    </div>
  );
};
