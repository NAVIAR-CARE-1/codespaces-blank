'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Lock, Mail, User, Shield } from 'lucide-react';

const roles = [
  { value: 'admin', label: 'Administrator', icon: '👑' },
  { value: 'consultant', label: 'Consultant', icon: '👔' },
  { value: 'manager', label: 'Manager', icon: '📊' },
];

export default function RegisterPage() {
  const router = useRouter();
  const { register, loading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    type: 'consultant',
  });
  const [formError, setFormError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    clearError();

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setFormError('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setFormError('Password must be at least 8 characters');
      return;
    }

    try {
      const result = await register(
        formData.email,
        formData.password,
        formData.name,
        formData.type
      );
      if (result.meta.requestStatus === 'fulfilled') {
        router.push('/dashboard');
      } else {
        setFormError('Registration failed. Please try again.');
      }
    } catch (err) {
      setFormError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-md">
        <div className="card p-8 shadow-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-2">
              NAVIAR CONSULT
            </div>
            <p className="text-gray-600">Create your account</p>
          </div>

          {/* Error Message */}
          {(formError || error) && (
            <div className="mb-6 p-4 bg-danger-50 border border-danger-200 text-danger-700 rounded-lg text-sm">
              {formError || error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-base pl-10"
                  placeholder="John Doe"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
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

            {/* Role Field */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-3 text-gray-400" size={20} />
                <select
                  name="type"
                  id="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="input-base pl-10"
                  disabled={loading}
                >
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.icon} {role.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="password"
                  name="password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-base pl-10"
                  placeholder="At least 8 characters"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="password"
                  name="confirmPassword"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input-base pl-10"
                  placeholder="Confirm your password"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Terms Checkbox */}
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" disabled={loading} required />
              <span className="text-sm text-gray-600">
                I agree to the{' '}
                <a href="#" className="text-primary-600 hover:text-primary-700">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-primary-600 hover:text-primary-700">
                  Privacy Policy
                </a>
              </span>
            </label>

            {/* Submit Button */}
            <button type="submit" disabled={loading} className="btn-primary w-full font-semibold py-2.5">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-gray-600 text-sm mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary-600 font-semibold hover:text-primary-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
