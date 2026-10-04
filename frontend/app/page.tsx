'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle } from 'lucide-react';

const features = [
  {
    title: 'Employee Consultations',
    description: 'Schedule and manage professional consultations with ease',
    icon: '📅',
  },
  {
    title: 'Document Management',
    description: 'Securely store and share consultation documents',
    icon: '📄',
  },
  {
    title: 'Real-time Analytics',
    description: 'Track consultation metrics and performance insights',
    icon: '📊',
  },
  {
    title: 'Video Integration',
    description: 'Seamless video conferencing for remote consultations',
    icon: '🎥',
  },
  {
    title: 'Role-based Access',
    description: 'Control access with flexible permission settings',
    icon: '🔐',
  },
  {
    title: 'Calendar Sync',
    description: 'Integrate with your favorite calendar applications',
    icon: '🔗',
  },
];

const stats = [
  { label: 'Active Consultants', value: '500+' },
  { label: 'Organizations', value: '150+' },
  { label: 'Consultations', value: '10K+' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Navigation */}
      <nav className="container-base py-6 flex justify-between items-center">
        <div className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
          NAVIAR CONSULT
        </div>
        <div className="flex gap-4">
          <Link href="/auth/login" className="btn-secondary">
            Sign In
          </Link>
          <Link href="/auth/register" className="btn-primary">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container-base py-24 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          Professional Consultation
          <span className="block bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            Management Platform
          </span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Streamline employee consultations with integrated scheduling, video conferencing, and
          comprehensive analytics for modern organizations.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/auth/register" className="btn-primary text-lg px-8 py-3">
            Start Free Trial <ArrowRight className="inline ml-2" size={20} />
          </Link>
          <Link href="/auth/login" className="btn-outline text-lg px-8 py-3">
            Sign In
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container-base py-16 grid grid-cols-3 gap-8 text-center">
        {stats.map((stat) => (
          <div key={stat.label}>
            <div className="text-4xl font-bold text-primary-600 mb-2">{stat.value}</div>
            <div className="text-gray-600">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Features Section */}
      <section className="container-base py-24">
        <h2 className="text-4xl font-bold text-center mb-16">
          Powerful Features for Modern HR
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="card p-8 hover:shadow-lg transition-shadow hover:border-primary-200"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Integration Section */}
      <section className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-16">
        <div className="container-base text-center">
          <h2 className="text-3xl font-bold mb-8">Integrated with Your Favorite Tools</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {['Calendly', 'Whereby', 'SAP', 'Stripe'].map((tool) => (
              <div key={tool} className="text-lg font-medium opacity-90">
                {tool}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="container-base py-24">
        <h2 className="text-4xl font-bold text-center mb-16">Enterprise Security</h2>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="space-y-4">
              {[
                'End-to-end encrypted communications',
                'GDPR compliant data handling',
                'Role-based access control',
                'Comprehensive audit logging',
                'SOC 2 Type II certified',
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <CheckCircle className="text-secondary-600" size={24} />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gradient-to-br from-primary-100 to-secondary-100 rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">🔒</div>
            <p className="text-gray-700">Your data is protected with enterprise-grade security</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 text-white py-16">
        <div className="container-base text-center">
          <h2 className="text-4xl font-bold mb-8">Ready to Transform Your Consultations?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join hundreds of organizations already using NAVIAR CONSULT to streamline their HR
            processes.
          </p>
          <Link href="/auth/register" className="inline-block bg-white text-primary-600 font-bold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors">
            Get Started Free <ArrowRight className="inline ml-2" size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container-base text-center">
          <p className="mb-4">&copy; 2026 NAVIAR CONSULT. All rights reserved.</p>
          <div className="flex justify-center gap-8 text-sm">
            <a href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
