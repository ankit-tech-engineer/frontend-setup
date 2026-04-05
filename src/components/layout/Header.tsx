'use client';

import React from 'react';
import { useAuthStore } from '@/core/store/useAuthStore';
import { useLayoutStore } from '@/core/store/useLayoutStore';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { 
  LogOut, 
  User as UserIcon, 
  Bell, 
  Search, 
  Menu, 
  ChevronLeft, 
  Sun, 
  Moon,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

export const Header: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { isSidebarCollapsed, toggleSidebar, theme, setTheme } = useLayoutStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    Cookies.remove('accessToken');
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-card px-4 shadow-sm transition-colors duration-300 border-border">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-2 text-muted-foreground hover:bg-muted transition-colors"
          title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isSidebarCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
        </button>
      </div>

      <div className="flex flex-1 items-center gap-4 px-4">
        <div className="relative w-96 max-w-full hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search..."
            className="w-full rounded-lg bg-muted pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-foreground"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2 md:gap-4">
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="rounded-full p-2 text-muted-foreground hover:bg-muted transition-colors"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5" />}
        </button>

        <button className="rounded-full p-2 text-muted-foreground hover:bg-muted relative transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border-2 border-card"></span>
        </button>
        
        <div className="flex items-center gap-2 md:gap-3 border-l pl-2 md:pl-4 border-border">
          <div className="hidden sm:flex flex-col items-end mr-2">
            <span className="text-sm font-medium text-foreground">{user?.name || 'User'}</span>
            <span className="text-xs text-muted-foreground capitalize">
              {user?.roles?.[0]?.name || 'Member'}
            </span>
          </div>
          <div className="h-9 w-9 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-800">
            {user?.name?.charAt(0) || <UserIcon className="h-5 w-5" />}
          </div>
          <button 
            onClick={handleLogout}
            className="ml-1 md:ml-2 rounded-lg p-2 text-muted-foreground hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 transition-colors"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
