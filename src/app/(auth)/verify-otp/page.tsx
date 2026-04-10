'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { verifyOtp, resendOtp } from '@/core/api/auth/auth';
import { Button, Input, Label } from '@/components/ui';

function VerifyOtpContent() {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
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
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await verifyOtp({ email, otp });
      if (response.success) {
        setSuccess(response.message);
        setTimeout(() => {
          router.push(`/set-password?email=${encodeURIComponent(email)}`);
        }, 1500);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    setSuccess('');
    try {
      const response = await resendOtp(email);
      if (response.success) {
        setSuccess(response.message);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-slate-900 dark:text-white">
            Verify OTP
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            We've sent a code to <span className="font-medium text-slate-900 dark:text-white">{email}</span>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm text-center">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded text-sm text-center">
              {success}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <Label htmlFor="otp" className="text-center block mb-2">Verification Code</Label>
              <Input
                id="otp"
                type="text"
                maxLength={6}
                required
                className="mt-1 text-center text-2xl tracking-[1em] h-14"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Button type="submit" className="w-full py-3" disabled={loading || otp.length < 6}>
              {loading ? 'Verifying...' : 'Verify Email'}
            </Button>
          </div>

          <div className="text-center text-sm">
            <span className="text-slate-600 dark:text-slate-400">Didn't receive the code? </span>
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="font-medium text-indigo-600 hover:text-indigo-500 disabled:opacity-50"
            >
              {resending ? 'Resending...' : 'Resend OTP'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyOtpContent />
    </Suspense>
  );
}
