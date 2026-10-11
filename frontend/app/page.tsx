import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { ArrowRight, BarChart3, Calendar, FileText, Plug, ShieldCheck, Users } from 'lucide-react';

const MODULES = [
  { title: 'Employees', description: 'One directory for everyone you plan conversations with, with department and status.', icon: Users },
  { title: 'Consultations', description: 'Book video, phone or in-person sessions. Overlaps in a consultant’s calendar are caught before saving.', icon: Calendar },
  { title: 'Documents', description: 'Policies, contracts and meeting notes with access levels and version history.', icon: FileText },
  { title: 'Analytics', description: 'Activity by month, type, department and format — aggregated, never a score of a person.', icon: BarChart3 },
];

const PRINCIPLES = [
  'Role-based access: consultation notes are limited to consultants and admins',
  'An audit log records every change in the workspace',
  'Note fields remind consultants to leave out health information',
  'Workspace data can be exported in full at any time',
];

const INTEGRATIONS = ['Whereby', 'Calendly', 'SAP SuccessFactors', 'Visma', 'Stripe'];

export default function Home() {
  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line bg-paper">
        <div className="container-base flex items-center justify-between gap-4 py-5">
          <Link href="/" className="block w-36 sm:w-44">
            <Logo width={176} className="h-auto w-full" />
          </Link>
          <nav aria-label="Account" className="flex gap-2">
            <Link href="/auth/login" className="btn-outline">
              Sign in
            </Link>
            <Link href="/auth/register" className="btn-primary hidden sm:inline-flex">
              Create account
            </Link>
          </nav>
        </div>
      </header>

      <main id="main">
        <section className="container-base py-[clamp(72px,9vw,120px)]">
          <p className="eyebrow mb-5">Consultation workspace</p>
          <h1 className="max-w-3xl text-[clamp(2.25rem,5vw,3.75rem)]">Plan, hold and follow up employee consultations in one place.</h1>
          <p className="mt-6 max-w-reading text-lg text-ink-soft">
            NAVIAR Consult brings the employee directory, consultation calendar, documents and reporting together, so the next step after
            every conversation is clear.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/auth/register" className="btn-primary px-6 py-3 text-base">
              Create account <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link href="/auth/login" className="btn-outline px-6 py-3 text-base">
              Sign in
            </Link>
          </div>
        </section>

        <section aria-labelledby="modules-heading" className="border-t border-line bg-white py-[clamp(72px,9vw,120px)]">
          <div className="container-base">
            <p className="eyebrow mb-3">What is inside</p>
            <h2 id="modules-heading" className="mb-12 max-w-2xl text-[clamp(1.75rem,3vw,2.5rem)]">
              Four modules, one record of each conversation
            </h2>
            <ul className="grid gap-px overflow-hidden rounded border border-line bg-line sm:grid-cols-2">
              {MODULES.map(({ title, description, icon: Icon }) => (
                <li key={title} className="bg-white p-8">
                  <Icon size={22} aria-hidden="true" className="text-accent-500" />
                  <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                  <p className="mt-2 max-w-reading text-ink-soft">{description}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section aria-labelledby="principles-heading" className="py-[clamp(72px,9vw,120px)]">
          <div className="container-base grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="eyebrow mb-3">How data is handled</p>
              <h2 id="principles-heading" className="text-[clamp(1.75rem,3vw,2.5rem)]">
                Built around what a consultation record needs — and what it must leave out
              </h2>
            </div>
            <ul className="space-y-4 lg:col-span-7">
              {PRINCIPLES.map((p) => (
                <li key={p} className="flex items-start gap-3 border-b border-line pb-4">
                  <ShieldCheck size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-primary-500" />
                  <span className="text-ink-soft">{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section aria-labelledby="integrations-heading" className="on-dark bg-primary-700 py-16 text-paper">
          <div className="container-base flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent-300">Integrations</p>
              <h2 id="integrations-heading" className="mt-2 text-2xl">
                Connects to the tools you already use
              </h2>
            </div>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-paper/90">
              {INTEGRATIONS.map((tool) => (
                <li key={tool} className="flex items-center gap-2">
                  <Plug size={14} aria-hidden="true" className="text-accent-300" />
                  {tool}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-paper py-10">
        <div className="container-base flex flex-col gap-2 text-sm text-muted sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} NAVIAR Consult</p>
          <p>Workspace preview — not for production data.</p>
        </div>
      </footer>
    </div>
  );
}
