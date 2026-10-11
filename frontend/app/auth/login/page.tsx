'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/hooks/useAuth';
import { Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, loading, error, clearError, startDemo } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [formError, setFormError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    clearError();

    if (!formData.email || !formData.password) {
      setFormError('Please fill in all fields');
      return;
    }

    try {
      const result = await login(formData.email, formData.password);
      if (result.meta.requestStatus === 'fulfilled') {
        router.push('/dashboard');
      } else {
        setFormError('Invalid email or password');
      }
    } catch (err) {
      setFormError('An error occurred. Please try again.');
    }
  };

  return (
    <main id="main" className="min-h-screen bg-paper flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card p-8 shadow-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <Logo width={192} className="mx-auto mb-4" />
            <h1 className="text-2xl">Sign in</h1>
          </div>

          {/* Error Message */}
          {(formError || error) && (
            <div className="mb-6 p-4 bg-danger-50 border border-danger-200 text-danger-700 rounded-lg text-sm">
              {formError || error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} aria-hidden="true" />
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-base pl-10"
                  placeholder="you@example.com"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} aria-hidden="true" />
                <input
                  type="password"
                  name="password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-base pl-10"
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex justify-between items-center text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" disabled={loading} />
                <span className="text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-primary-600 hover:text-primary-700">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button type="submit" disabled={loading} className="btn-primary w-full font-semibold py-2.5">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          {process.env.NODE_ENV === 'development' ? (
            <div className="mt-6 border-t border-line pt-6 text-center">
              <button
                type="button"
                className="btn-secondary w-full"
                onClick={() => {
                  startDemo();
                  router.push('/dashboard');
                }}
              >
                Continue with demo workspace
              </button>
              <p className="mt-2 text-xs text-muted">Development only — sample data, no backend needed.</p>
            </div>
          ) : null}

          {/* Footer */}
          <p className="text-center text-gray-600 text-sm mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-primary-600 font-semibold hover:text-primary-700">
              Create one
            </Link>
          </p>
        </div>

        {/* Terms */}
        <p className="text-center text-xs text-gray-600 mt-4">
          By signing in, you agree to our{' '}
          <a href="#" className="text-primary-600 hover:text-primary-700">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-primary-600 hover:text-primary-700">
            Privacy Policy
          </a>
        </p>
      </div>
    </main>
  );
}
