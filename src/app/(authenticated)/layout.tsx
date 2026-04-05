'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import { useAuthStore } from '@/core/store/useAuthStore';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const accessToken = Cookies.get('accessToken');
    
    // Safety check for authentication
    if (!accessToken || !isAuthenticated) {
      router.push('/login');
      return;
    }
    
    setIsLoading(false);
  }, [isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="relative flex flex-col items-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent shadow-xl"></div>
          <span className="mt-4 text-xs font-medium text-gray-500 uppercase tracking-widest animate-pulse">Loading context...</span>
        </div>
      </div>
    );
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
