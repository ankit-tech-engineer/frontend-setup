'use client';

import React, { useEffect } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useLayoutStore } from '@/core/store/useLayoutStore';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { isSidebarCollapsed, theme } = useLayoutStore();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
      <Sidebar />
      <div 
        className={cn(
          "flex flex-col flex-1 transition-all duration-300 ease-in-out",
          isSidebarCollapsed ? "pl-20" : "pl-64"
        )}
      >
        <Header />
      <main className="flex-1 flex flex-col min-h-[calc(100vh-64px)] overflow-x-hidden bg-background transition-colors duration-300">
        <div className="flex-1 p-2 sm:p-2 lg:p-4 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
      </div>
    </div>
  );
};
