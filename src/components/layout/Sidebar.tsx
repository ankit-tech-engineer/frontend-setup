'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as LucideIcons from 'lucide-react';
import { menuConfig } from '@/core/menu/menuConfig';
import { useAuthStore } from '@/core/store/useAuthStore';
import { useLayoutStore } from '@/core/store/useLayoutStore';
import { cn } from '@/lib/utils';

const SidebarItem = ({ item, depth = 0, isCollapsed }: { item: any, depth?: number, isCollapsed: boolean }) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(pathname.startsWith(item.link) && item.link !== '/');
  const isActive = pathname === item.link;
  const hasChildren = item.children && item.children.length > 0;
  
  const Icon = (LucideIcons as any)[item.icon] || LucideIcons.HelpCircle;

  return (
    <div className="flex flex-col relative group">
      <Link
        href={hasChildren ? '#' : item.link}
        onClick={(e) => {
          if (hasChildren) {
            e.preventDefault();
            if (!isCollapsed) {
              setIsOpen(!isOpen);
            }
          }
        }}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200 cursor-pointer",
          isActive 
            ? "bg-indigo-600 text-white font-medium shadow-md shadow-indigo-200 dark:shadow-none" 
            : "text-muted-foreground hover:bg-muted hover:text-indigo-600 dark:hover:text-indigo-400",
          depth > 0 && !isCollapsed && "ml-4",
          isCollapsed && "flex-col items-center justify-center gap-1 px-1 py-1.5"
        )}
      >
        <Icon className={cn("h-5 w-5 shrink-0", isActive ? "text-white" : "text-muted-foreground")} />
        {isCollapsed ? (
          <span className={cn(
            "text-[8px] font-bold text-center leading-tight truncate w-full px-0.5 tracking-tighter opacity-80",
            isActive ? "text-white/90" : "text-muted-foreground"
          )}>
            {item.title.length > 10 ? `${item.title.substring(0, 10)}...` : item.title}
          </span>
        ) : (
          <>
            <span className="flex-1 truncate">{item.title}</span>
            {hasChildren && (
              isOpen ? <LucideIcons.ChevronDown className="h-4 w-4" /> : <LucideIcons.ChevronRight className="h-4 w-4" />
            )}
          </>
        )}
      </Link>
      
      {/* Expanded View Children */}
      {hasChildren && isOpen && !isCollapsed && (
        <div className="mt-1 flex flex-col gap-0.5 border-l-2 border-border ml-4 pl-1">
          {item.children.map((child: any) => (
            <SidebarItem key={child.key} item={child} depth={depth + 1} isCollapsed={isCollapsed} />
          ))}
        </div>
      )}

      {/* Collapsed View Popover */}
      {hasChildren && isCollapsed && (
        <div className="absolute left-full top-0 ml-4 hidden group-hover:block z-50 min-w-[200px] animate-in fade-in slide-in-from-left-2 duration-200 before:absolute before:-left-4 before:top-0 before:h-full before:w-4 before:content-['']">
          <div className="bg-card border border-border rounded-lg shadow-xl p-2 flex flex-col gap-1 mt-0">
            <div className="px-3 py-1.5 mb-1 border-b border-border text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2 uppercase tracking-wider">
               <Icon className="h-3.5 w-3.5" />
               {item.title}
            </div>
            {item.children.map((child: any) => (
              <SidebarItem key={child.key} item={child} depth={0} isCollapsed={false} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const Sidebar: React.FC = () => {
  const { user } = useAuthStore();
  const { isSidebarCollapsed } = useLayoutStore();
  
  const userRoleKeys = user?.roles?.map(r => r.key) || [];

  const filteredMenu = menuConfig.filter(item => {
    if (item.is_deleted || item.status !== 'active') return false;

    const isAllowed = item.allowed_roles.includes('*') || 
                      item.allowed_roles.some((role: string) => userRoleKeys.includes(role));

    if (!isAllowed) return false;

    if (item.children && item.children.length > 0) {
      item.children = item.children.filter((child: any) => {
         return child.allowed_roles.includes('*') || 
                child.allowed_roles.some((role: string) => userRoleKeys.includes(role));
      });
    }

    return true;
  });

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 z-40 h-full flex-col border-r bg-card flex transition-all duration-300 ease-in-out border-border",
        isSidebarCollapsed ? "w-20" : "w-64"
      )}
    >
      <div 
        className={cn(
          "flex h-16 items-center border-b px-4 transition-all duration-300 bg-indigo-700 dark:bg-indigo-900 border-indigo-800 dark:border-indigo-950",
          isSidebarCollapsed ? "justify-center px-0" : "px-6"
        )}
      >
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 shrink-0 rounded-lg bg-white dark:bg-indigo-100 flex items-center justify-center shadow-sm">
            <LucideIcons.ShieldCheck className="h-6 w-6 text-indigo-700" />
          </div>
          {!isSidebarCollapsed && (
            <span className="text-lg font-bold text-white tracking-wide uppercase truncate">SaaS Framework</span>
          )}
        </div>
      </div>
      
      <nav className={cn(
        "flex-1 space-y-1 px-3 py-6 scrollbar-hide",
        isSidebarCollapsed ? "overflow-y-visible" : "overflow-y-auto"
      )}>
        <div className={cn(
          "mb-4 px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest",
          isSidebarCollapsed && "text-center px-0"
        )}>
          {isSidebarCollapsed ? "•••" : "Navigation"}
        </div>
        <div className="space-y-1">
          {filteredMenu.map((item) => (
            <SidebarItem key={item.key} item={item} isCollapsed={isSidebarCollapsed} />
          ))}
        </div>
      </nav>
      
      <div className="border-t p-4 bg-muted/30 border-border">
        <div className={cn(
          "flex items-center gap-3 rounded-xl bg-card p-2 shadow-sm border border-border transition-all duration-300",
          isSidebarCollapsed ? "justify-center" : "p-3"
        )}>
           {!isSidebarCollapsed && (
             <div className="flex-1 truncate">
               <p className="text-xs font-semibold text-foreground truncate">{user?.name}</p>
               <p className="text-[10px] text-muted-foreground font-medium truncate">{user?.email}</p>
             </div>
           )}
           <div className={cn(
             "h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold shrink-0",
             !isSidebarCollapsed && "hidden sm:flex"
           )}>
             {user?.name?.charAt(0)}
           </div>
        </div>
      </div>
    </aside>
  );
};
