'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-base py-12">
        <Link href="/dashboard" className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-8">
          <ArrowLeft size={20} />
          Back to Dashboard
        </Link>

        <div className="card p-12 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h1 className="text-3xl font-bold mb-4">Analytics Module</h1>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            This module is coming soon. Get actionable insights with comprehensive reports and visualizations.
          </p>
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 max-w-md mx-auto text-left">
            <h3 className="font-semibold text-primary-900 mb-3">Planned Features:</h3>
            <ul className="space-y-2 text-sm text-primary-800">
              <li>✓ Real-time metrics dashboard</li>
              <li>✓ Custom report builder</li>
              <li>✓ Data visualization charts</li>
              <li>✓ Performance trends</li>
              <li>✓ Export functionality</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
