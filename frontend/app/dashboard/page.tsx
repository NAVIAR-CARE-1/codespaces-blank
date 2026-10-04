'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, loading, router]);

  if (!mounted || loading || !isAuthenticated) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>
      </header>

      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Welcome Card */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="text-lg font-semibold text-gray-900">Welcome</h2>
            <p className="mt-2 text-gray-600">Hello, {user?.name}!</p>
            <p className="text-sm text-gray-500">Role: {user?.role}</p>
          </div>

          {/* Quick Stats */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="text-lg font-semibold text-gray-900">Consultations</h2>
            <p className="mt-2 text-3xl font-bold text-blue-600">0</p>
            <p className="text-sm text-gray-500">This month</p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="text-lg font-semibold text-gray-900">Documents</h2>
            <p className="mt-2 text-3xl font-bold text-green-600">0</p>
            <p className="text-sm text-gray-500">Total uploaded</p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4 hover:shadow transition">
            <a href="/employees" className="block">
              <h3 className="font-semibold text-gray-900">Employees</h3>
              <p className="mt-1 text-sm text-gray-600">Manage employees</p>
            </a>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 hover:shadow transition">
            <a href="/consultations" className="block">
              <h3 className="font-semibold text-gray-900">Consultations</h3>
              <p className="mt-1 text-sm text-gray-600">Schedule meetings</p>
            </a>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 hover:shadow transition">
            <a href="/documents" className="block">
              <h3 className="font-semibold text-gray-900">Documents</h3>
              <p className="mt-1 text-sm text-gray-600">Upload files</p>
            </a>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 hover:shadow transition">
            <a href="/analytics" className="block">
              <h3 className="font-semibold text-gray-900">Analytics</h3>
              <p className="mt-1 text-sm text-gray-600">View reports</p>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
