'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/core/store/useAuthStore';
import Cookies from 'js-cookie';

export default function RootPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get('accessToken');
    
    if (!token) {
      router.push('/login');
      return;
    }

    if (user) {
      const roles = user.roles.map((r: any) => r.key);
      if (roles.includes('super_admin')) {
        router.push('/dashboard/super-admin');
      } else if (roles.includes('admin')) {
        router.push('/dashboard/admin');
      } else {
        router.push('/dashboard/guest');
      }
    }
  }, [user, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );
}
