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
    <div className="h-screen w-full flex flex-col bg-arena-bg text-arena-textPrimary selection:bg-arena-amber/25 selection:text-white antialiased overflow-hidden">
      
      {/* 1. Minimal Top Header - permanently fixed at the top */}
      <TopHeader 
        onOpenAccountModal={onOpenAccountModal}
        onToggleMobileSidebar={() => setMobileOpen(true)}
      />

      {/* 2. Hybrid Application Layout: Pinned Sidebar + Scrollable Main Content */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        
        {/* Left Collapsible Sidebar */}
        <Sidebar 
          isCollapsed={isCollapsed}
          onToggleCollapse={handleToggleCollapse}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
          onOpenSettings={onOpenAccountModal}
        />

        {/* Main Content Area - only the main content scrolls, navbar stays fixed */}
        <main className="flex-1 min-w-0 h-full overflow-y-auto overflow-x-hidden">
          {children}
        </main>

      </div>
    </div>
  );
};

