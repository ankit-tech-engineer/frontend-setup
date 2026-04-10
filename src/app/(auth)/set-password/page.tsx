'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { setPassword } from '@/core/api/auth/auth';
import { Button, Input, Label } from '@/components/ui';

function SetPasswordContent() {
  const [password, setPwd] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  useEffect(() => {
    if (!email) {
      router.push('/register');
    }
  }, [email, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const response = await setPassword({ email, password });
      if (response.success) {
        router.push('/login');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to set password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-slate-900 dark:text-white">
            Set Password
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Create a secure password for your account
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm text-center">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                required
                className="mt-1"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPwd(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                required
                className="mt-1"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Button type="submit" className="w-full py-3" disabled={loading}>
              {loading ? 'Setting password...' : 'Complete Setup'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SetPasswordContent />
    </Suspense>
  );
}
