'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  if (!mounted) {
    // Prevent hydration mismatch
    setTimeout(() => setMounted(true), 0);
    return null;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">NAVIAR CONSULT</h1>
        <p className="text-xl text-gray-600 mb-8">
          Professional Employee Consultation & HR Management Platform
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/auth/login"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Login
          </Link>
          <Link
            href="/auth/register"
            className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Register
          </Link>
        </div>
      </div>
    </main>
  );
}
