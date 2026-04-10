'use client';

import { useAuthStore } from '@/core/store/useAuthStore';
import { clearAuthCookies } from '@/core/utils/cookies';
import { Button } from '@/components/ui';
import { useRouter } from 'next/navigation';
import { logout as apiLogout } from '@/core/api/auth/auth';

export default function GuestDashboard() {
  const user = useAuthStore((state) => state.user);
  const logoutStore = useAuthStore((state) => state.logout);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch (e) {
      console.error('Logout failed', e);
    } finally {
      clearAuthCookies();
      logoutStore();
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-4">Guest View</h1>
        <p className="mb-8">Welcome, {user?.name}. You have limited access.</p>
        <Button onClick={handleLogout} variant="outline">Logout</Button>
      </div>
    </div>
  );
}
