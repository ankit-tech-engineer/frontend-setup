'use client';

import { useAuthStore } from '@/core/store/useAuthStore';
import { clearAuthCookies } from '@/core/utils/cookies';
import { Button } from '@/components/ui';
import { useRouter } from 'next/navigation';
import { logout as apiLogout } from '@/core/api/auth/auth';

export default function AdminDashboard() {
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
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
          <Button onClick={handleLogout} className="bg-indigo-600 hover:bg-indigo-700">Logout</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold mb-2">Welcome, {user?.name}</h3>
            <p className="text-slate-600 dark:text-slate-400">Account Key: {user?.account_key}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
