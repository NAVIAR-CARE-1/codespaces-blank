'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BarChart3, Calendar, CalendarClock, FileText, Plus, Settings, Users } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { useDemoData } from '@/components/DemoDataProvider';
import { useAuth } from '@/hooks/useAuth';
import { Badge, StatTile } from '@/components/ui';
import { formatTime, formatWeekday, relativeTime } from '@/lib/format';

const MODULES = [
  { title: 'Employees', description: 'Directory, profiles and status', href: '/employees', icon: Users },
  { title: 'Consultations', description: 'Book, follow up and take notes', href: '/consultations', icon: Calendar },
  { title: 'Documents', description: 'Policies, contracts and reports', href: '/documents', icon: FileText },
  { title: 'Analytics', description: 'Activity by month, type and team', href: '/analytics', icon: BarChart3 },
  { title: 'Settings', description: 'Access, integrations and data', href: '/settings', icon: Settings },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const { employees, consultations, documents, audit } = useDemoData();
  const [now] = useState(() => new Date());

  const data = useMemo(() => {
    const in7 = now.getTime() + 7 * 86400000;
    const open = consultations.filter((c) => (c.status === 'scheduled' || c.status === 'rescheduled') && new Date(c.start) >= now);
    const followUpsDue = consultations.filter((c) => c.followUp && new Date(c.followUp) >= now && new Date(c.followUp).getTime() <= in7);
    return {
      next: open.slice(0, 5),
      week: open.filter((c) => new Date(c.start).getTime() <= in7).length,
      active: employees.filter((e) => e.status !== 'inactive').length,
      onboarding: employees.filter((e) => e.status === 'onboarding').length,
      docs: documents.filter((d) => !d.archived).length,
      followUpsDue: followUpsDue.length,
    };
  }, [consultations, employees, documents, now]);

  const nameOf = (id: string) => employees.find((e) => e.id === id)?.name ?? 'Former employee';
  const firstName = user?.name?.split(' ')[0] ?? '';

  return (
    <AppShell
      eyebrow="Overview"
      title={firstName ? `Good to see you, ${firstName}` : 'Overview'}
      description="What is coming up, and where to pick up."
      actions={
        <Link href="/consultations" className="btn-primary">
          <Plus size={16} aria-hidden="true" /> Book consultation
        </Link>
      }
    >
      <section aria-label="Summary" className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Consultations this week" value={data.week} hint="Next 7 days" icon={<CalendarClock size={18} />} />
        <StatTile label="Current employees" value={data.active} hint={`${data.onboarding} onboarding`} icon={<Users size={18} />} />
        <StatTile label="Follow-ups due" value={data.followUpsDue} hint="Next 7 days" />
        <StatTile label="Documents" value={data.docs} icon={<FileText size={18} />} />
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section aria-labelledby="next-heading" className="card min-w-0 xl:col-span-2">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 id="next-heading" className="text-base">
              Next consultations
            </h2>
            <Link href="/consultations" className="text-sm font-medium text-primary-600 underline-offset-2 hover:underline">
              See all
            </Link>
          </div>
          {data.next.length === 0 ? (
            <p className="px-5 py-8 text-sm text-muted">Nothing booked yet.</p>
          ) : (
            <ul className="divide-y divide-line">
              {data.next.map((c) => (
                <li key={c.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3">
                  <div className="w-32 shrink-0">
                    <p className="text-sm font-medium">{formatWeekday(c.start)}</p>
                    <p className="text-xs tabular-nums text-muted">{formatTime(c.start)}</p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{nameOf(c.employeeId)}</p>
                    <p className="truncate text-xs text-muted">
                      {c.type} · {c.consultant}
                    </p>
                  </div>
                  <Badge tone={c.status === 'rescheduled' ? 'brass' : 'green'}>{c.status === 'rescheduled' ? 'Rescheduled' : 'Scheduled'}</Badge>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="activity-heading" className="card min-w-0">
          <h2 id="activity-heading" className="border-b border-line px-5 py-4 text-base">
            Recent activity
          </h2>
          <ol className="divide-y divide-line">
            {audit.slice(0, 6).map((a) => (
              <li key={a.id} className="px-5 py-3 text-sm">
                <p>
                  <span className="font-medium">{a.actor}</span> <span className="text-ink-soft">{a.action.toLowerCase()}</span>
                </p>
                <p className="truncate text-xs text-muted">
                  {a.target} · {relativeTime(a.date, now)}
                </p>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <section aria-labelledby="modules-heading" className="mt-8">
        <h2 id="modules-heading" className="mb-4 text-xl">
          Modules
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map(({ title, description, href, icon: Icon }) => (
            <li key={href}>
              <Link href={href} className="card group flex h-full items-start gap-4 p-5 transition-colors duration-fast hover:border-primary-300 hover:bg-paper">
                <span aria-hidden="true" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded bg-mist text-primary-500">
                  <Icon size={20} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-ink">{title}</span>
                  <span className="block text-sm text-muted">{description}</span>
                </span>
                <ArrowRight size={16} aria-hidden="true" className="mt-1 text-muted transition-transform duration-fast group-hover:translate-x-0.5" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </AppShell>
  );
}
