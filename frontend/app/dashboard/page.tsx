'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import {
  LogOut,
  Users,
  Calendar,
  FileText,
  BarChart3,
  Settings,
  Menu,
  X,
} from 'lucide-react';

const modules = [
  {
    title: 'Employees',
    description: 'Manage employee directory and profiles',
    icon: <Users size={32} className="text-primary-600" />,
    href: '/employees',
    color: 'from-primary-100 to-primary-50',
  },
  {
    title: 'Consultations',
    description: 'Schedule and manage consultations',
    icon: <Calendar size={32} className="text-secondary-600" />,
    href: '/consultations',
    color: 'from-secondary-100 to-secondary-50',
  },
  {
    title: 'Documents',
    description: 'Store and organize consultation files',
    icon: <FileText size={32} className="text-accent-600" />,
    href: '/documents',
    color: 'from-accent-100 to-accent-50',
  },
  {
    title: 'Analytics',
    description: 'View reports and insights',
    icon: <BarChart3 size={32} className="text-primary-600" />,
    href: '/analytics',
    color: 'from-primary-100 to-primary-50',
  },
  {
    title: 'Settings',
    description: 'Configure organization and preferences',
    icon: <Settings size={32} className="text-gray-600" />,
    href: '/settings',
    color: 'from-gray-100 to-gray-50',
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, restoreSession } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated) {
      restoreSession();
    }
  }, [isAuthenticated, restoreSession]);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      const timer = setTimeout(() => {
        router.push('/auth/login');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [mounted, isAuthenticated, router]);

  if (!mounted || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="text-center">
          <div className="text-4xl font-bold mb-4">Loading...</div>
          <div className="text-gray-600">Redirecting to login...</div>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="container-base py-4 flex justify-between items-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            NAVIAR CONSULT
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-700 font-semibold text-sm">
                  {user?.name?.[0]?.toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium text-sm text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-600 capitalize">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 btn-outline px-3 py-2"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white p-4 space-y-3">
            <div className="flex items-center gap-3 pb-4 border-b">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-700 font-semibold text-sm">
                  {user?.name?.[0]?.toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium text-sm text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-600 capitalize">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 btn-outline px-3 py-2 justify-center"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <div className="container-base py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-3">
            Welcome back, <span className="text-primary-600">{user?.name?.split(' ')[0]}</span>!
          </h1>
          <p className="text-gray-600">Here&apos;s what&apos;s happening today</p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="card p-6">
            <div className="text-sm text-gray-600 mb-2">Upcoming Consultations</div>
            <div className="text-3xl font-bold text-primary-600">8</div>
            <p className="text-xs text-gray-500 mt-2">This week</p>
          </div>
          <div className="card p-6">
            <div className="text-sm text-gray-600 mb-2">Active Employees</div>
            <div className="text-3xl font-bold text-secondary-600">124</div>
            <p className="text-xs text-gray-500 mt-2">In your organization</p>
          </div>
          <div className="card p-6">
            <div className="text-sm text-gray-600 mb-2">Documents Stored</div>
            <div className="text-3xl font-bold text-accent-600">356</div>
            <p className="text-xs text-gray-500 mt-2">Total files</p>
          </div>
        </div>

        {/* Modules Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Modules</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module) => (
              <Link
                key={module.href}
                href={module.href}
                className="card p-8 hover:shadow-lg hover:border-primary-200 transition-all hover:-translate-y-1 group"
              >
                <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${module.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  {module.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">{module.title}</h3>
                <p className="text-sm text-gray-600">{module.description}</p>
                <div className="mt-4 text-primary-600 font-medium text-sm flex items-center gap-2">
                  Open →
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-12 card p-8">
          <h3 className="text-lg font-semibold mb-6">Recent Activity</h3>
          <div className="space-y-4 text-sm text-gray-600">
            <div className="flex items-center justify-between py-3 border-b">
              <div>Consultation scheduled with John Smith</div>
              <span className="text-xs text-gray-500">2 hours ago</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <div>Document uploaded: Q4 Report</div>
              <span className="text-xs text-gray-500">5 hours ago</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>Employee profile updated</div>
              <span className="text-xs text-gray-500">Yesterday</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
