'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { register } from '@/core/api/auth';
import { Button, Input, Label } from '@/components/ui';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    vendorName: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await register(formData);
      if (response.success) {
        // Redirect to OTP verification with email as query param
        router.push(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-slate-900 dark:text-white">
            Create an Account
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Join our platform and scale your business
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                required
                className="mt-1"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                required
                className="mt-1"
                placeholder="john@yopmail.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="vendorName">Vendor Name</Label>
              <Input
                id="vendorName"
                type="text"
                required
                className="mt-1"
                placeholder="Acme Corp"
                value={formData.vendorName}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                required
                className="mt-1"
                placeholder="9834567890"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <Button type="submit" className="w-full py-3" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </div>

          <div className="text-center text-sm">
            <span className="text-slate-600 dark:text-slate-400">Already have an account? </span>
            <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign in
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
