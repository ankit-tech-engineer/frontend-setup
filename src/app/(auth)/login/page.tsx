'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/core/api/auth/auth';
import { setAuthCookies } from '@/core/utils/cookies';
import { useAuthStore } from '@/core/store/useAuthStore';
import { Button, Input, Label } from '@/components/ui';
import { toast } from 'sonner';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  // Hydration safety: ensure component is mounted before rendering interactive parts
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const response = await login({ email, password });
      if (response.success) {
        const { accessToken, refreshToken, user } = response.data;
        setAuthCookies(accessToken, refreshToken);
        setAuth(user);
        toast.success('Welcome back!');

        // Role-based redirection logic
        const roles = user.roles.map((r: any) => r.key);
        if (roles.includes('super_admin')) {
          router.push('/dashboard/super-admin');
        } else if (roles.includes('admin')) {
          router.push('/dashboard/admin');
        } else {
          router.push('/dashboard/guest');
        }
      } else {
        toast.error(response.message || 'Invalid credentials');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Prevent flash of unstyled content and hydration mismatches
  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950 font-sans">
      {/* Background Mesh Gradient */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px] animate-pulse" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6 py-12">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Welcome Back
            </h1>
            <p className="text-slate-400 font-medium">
              Enter your credentials to access your dashboard
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit} suppressHydrationWarning>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">Email Address</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder="name@company.com"
                    className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all rounded-xl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    suppressHydrationWarning
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-slate-300">Password</Label>
                  <a href="#" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                    Forgot password?
                  </a>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                  <Input
                    id="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all rounded-xl"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    suppressHydrationWarning
                  />
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-lg font-semibold bg-indigo-600 hover:bg-indigo-500 text-white border-none transition-all duration-200 group rounded-xl shadow-lg shadow-indigo-900/20 active:scale-[0.98]" 
              disabled={loading}
              suppressHydrationWarning
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Sign In <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-slate-400 text-sm">
              Don&apos;t have an account?{' '}
              <a href="/register" className="font-bold text-indigo-400 hover:text-indigo-300 hover:underline decoration-2 underline-offset-4 transition-all">
                Register now
              </a>
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center text-slate-500 text-xs">
          <p>© 2026 Framework Setup UI. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
