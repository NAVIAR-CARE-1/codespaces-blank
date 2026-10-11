'use client';

import { useMemo, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Download, Minus, Printer } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { useAnnounce } from '@/components/Announcer';
import { useDemoData } from '@/components/DemoDataProvider';
import { BarList, ChartCard, ColumnChart, ShareBar, type Datum } from '@/components/charts';
import { SelectField, ToggleGroup } from '@/components/ui';
import { CONSULTANTS, CONSULTATION_TYPES, DEPARTMENTS, type Consultation, type Department } from '@/lib/demo-data';
import { downloadFile, toCsv, toDateInputValue } from '@/lib/format';

type Period = '3' | '6' | '12';

interface Metrics {
  held: number;
  cancelled: number;
  completionRate: number | null;
  avgDuration: number | null;
  reached: number;
  followUps: number;
}

function metricsFor(list: Consultation[]): Metrics {
  const held = list.filter((c) => c.status === 'completed');
  const cancelled = list.filter((c) => c.status === 'cancelled').length;
  const decided = held.length + cancelled;
  return {
    held: held.length,
    cancelled,
    completionRate: decided ? Math.round((held.length / decided) * 100) : null,
    avgDuration: held.length ? Math.round(held.reduce((s, c) => s + c.durationMin, 0) / held.length) : null,
    reached: new Set(held.map((c) => c.employeeId)).size,
    followUps: held.filter((c) => c.followUp).length,
  };
}

function Delta({ current, previous, unit, goodWhenUp = true }: { current: number | null; previous: number | null; unit: 'pct' | 'pts' | 'min'; goodWhenUp?: boolean }) {
  if (current === null || previous === null || (unit === 'pct' && previous === 0)) {
    return <p className="mt-1 text-xs text-muted">No comparable earlier period</p>;
  }
  const diff = unit === 'pct' ? Math.round(((current - previous) / previous) * 100) : current - previous;
  const suffix = unit === 'pct' ? '%' : unit === 'pts' ? ' pts' : ' min';
  if (diff === 0) {
    return (
      <p className="mt-1 flex items-center gap-1 text-xs text-muted">
        <Minus size={12} aria-hidden="true" /> Unchanged vs previous period
      </p>
    );
  }
  const up = diff > 0;
  const good = up === goodWhenUp;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <p className={`mt-1 flex items-center gap-1 text-xs ${good ? 'text-primary-500' : 'text-danger-700'}`}>
      <Icon size={12} aria-hidden="true" />
      {up ? 'Up' : 'Down'} {Math.abs(diff)}
      {suffix} vs previous period
    </p>
  );
}

function Kpi({ label, value, children }: { label: string; value: string; children?: React.ReactNode }) {
  return (
    <div className="card p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-ink">{value}</p>
      {children}
    </div>
  );
}

export default function AnalyticsPage() {
  const { consultations, employees } = useDemoData();
  const announce = useAnnounce();
  const [now] = useState(() => new Date());
  const [period, setPeriod] = useState<Period>('6');
  const [department, setDepartment] = useState<'all' | Department>('all');
  const [consultant, setConsultant] = useState('all');

  const deptOf = useMemo(() => new Map(employees.map((e) => [e.id, e.department])), [employees]);
  const months = Number(period);

  const scoped = useMemo(
    () =>
      consultations.filter(
        (c) =>
          (department === 'all' || deptOf.get(c.employeeId) === department) && (consultant === 'all' || c.consultant === consultant)
      ),
    [consultations, department, consultant, deptOf]
  );

  const { current, previous, periodStart } = useMemo(() => {
    const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);
    const prevStart = new Date(now.getFullYear(), now.getMonth() - (2 * months - 1), 1);
    const inRange = (c: Consultation, from: Date, to: Date) => {
      const d = new Date(c.start);
      return d >= from && d < to;
    };
    return {
      periodStart: start,
      current: scoped.filter((c) => inRange(c, start, now)),
      previous: scoped.filter((c) => inRange(c, prevStart, start)),
    };
  }, [scoped, months, now]);

  const m = metricsFor(current);
  const p = metricsFor(previous);
  const hasPrevious = previous.length > 0;
  const eligible = employees.filter((e) => e.status !== 'inactive' && (department === 'all' || e.department === department)).length;

  const monthly: Datum[] = useMemo(
    () =>
      Array.from({ length: months }, (_, i) => {
        const d = new Date(periodStart.getFullYear(), periodStart.getMonth() + i, 1);
        const value = current.filter((c) => {
          const s = new Date(c.start);
          return c.status === 'completed' && s.getMonth() === d.getMonth() && s.getFullYear() === d.getFullYear();
        }).length;
        return {
          label: d.toLocaleDateString('en-GB', { month: 'short' }),
          detail: d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
          value,
        };
      }),
    [current, months, periodStart]
  );

  const held = current.filter((c) => c.status === 'completed');

  const byType: Datum[] = CONSULTATION_TYPES.map((t) => ({ label: t, value: held.filter((c) => c.type === t).length })).sort(
    (a, b) => b.value - a.value
  );

  const byDept: Datum[] = DEPARTMENTS.map((d) => ({ label: d, value: held.filter((c) => deptOf.get(c.employeeId) === d).length })).sort(
    (a, b) => b.value - a.value
  );

  const byMode: Datum[] = [
    { label: 'Video', value: held.filter((c) => c.mode === 'video').length },
    { label: 'In person', value: held.filter((c) => c.mode === 'in-person').length },
    { label: 'Phone', value: held.filter((c) => c.mode === 'phone').length },
  ];

  const upcoming = scoped.filter((c) => (c.status === 'scheduled' || c.status === 'rescheduled') && new Date(c.start) >= now);
  const upcomingByWeek: Datum[] = Array.from({ length: 5 }, (_, w) => {
    const from = new Date(now.getTime() + w * 7 * 86400000);
    const to = new Date(now.getTime() + (w + 1) * 7 * 86400000);
    return {
      label: w === 0 ? 'This wk' : `+${w} wk`,
      detail: `${from.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${to.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`,
      value: upcoming.filter((c) => new Date(c.start) >= from && new Date(c.start) < to).length,
    };
  });

  const periodLabel = `Last ${months} months`;

  const exportCsv = () => {
    const rows = current.map((c) => [
      c.start.slice(0, 10),
      c.type,
      deptOf.get(c.employeeId) ?? '',
      c.consultant,
      c.mode,
      c.status,
      c.durationMin,
    ]);
    downloadFile(
      `consultations-${toDateInputValue(periodStart)}-to-${toDateInputValue(now)}.csv`,
      toCsv(['Date', 'Type', 'Department', 'Consultant', 'Format', 'Status', 'Duration (min)'], rows),
      'text/csv'
    );
    announce(`Exported ${rows.length} consultations to CSV.`);
  };

  return (
    <AppShell
      eyebrow="Insight"
      title="Analytics"
      description="Activity across consultations, aggregated by month, type, department and format. No individual is scored."
      actions={
        <>
          <button type="button" className="btn-outline no-print" onClick={() => window.print()}>
            <Printer size={16} aria-hidden="true" /> Print / PDF
          </button>
          <button type="button" className="btn-primary no-print" onClick={exportCsv}>
            <Download size={16} aria-hidden="true" /> Export CSV
          </button>
        </>
      }
    >
      <div className="no-print mb-6 flex flex-col gap-3 md:flex-row md:items-end">
        <ToggleGroup
          label="Period"
          value={period}
          onChange={setPeriod}
          options={[
            { value: '3', label: '3 months' },
            { value: '6', label: '6 months' },
            { value: '12', label: '12 months' },
          ]}
        />
        <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 md:max-w-lg">
          <SelectField
            label="Department"
            hideLabel
            value={department}
            onChange={(v) => setDepartment(v as 'all' | Department)}
            options={[{ value: 'all', label: 'All departments' }, ...DEPARTMENTS.map((d) => ({ value: d, label: d }))]}
          />
          <SelectField
            label="Consultant"
            hideLabel
            value={consultant}
            onChange={setConsultant}
            options={[{ value: 'all', label: 'All consultants' }, ...CONSULTANTS.map((c) => ({ value: c, label: c }))]}
          />
        </div>
      </div>

      <section aria-label="Key figures" className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Consultations held" value={String(m.held)}>
          <Delta current={m.held} previous={hasPrevious ? p.held : null} unit="pct" />
        </Kpi>
        <Kpi label="Completion rate" value={m.completionRate === null ? '—' : `${m.completionRate}%`}>
          <Delta current={m.completionRate} previous={hasPrevious ? p.completionRate : null} unit="pts" />
        </Kpi>
        <Kpi label="Average duration" value={m.avgDuration === null ? '—' : `${m.avgDuration} min`}>
          <p className="mt-1 text-xs text-muted">Completed consultations</p>
        </Kpi>
        <Kpi label="Employees reached" value={`${m.reached}`}>
          <p className="mt-1 text-xs text-muted">
            of {eligible} current employees{eligible ? ` · ${Math.round((m.reached / eligible) * 100)}%` : ''}
          </p>
        </Kpi>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ChartCard
            title="Consultations held per month"
            subtitle={`${periodLabel} · completed only`}
            table={{ columns: ['Month', 'Consultations'], rows: monthly.map((d) => [d.detail ?? d.label, d.value]) }}
          >
            <ColumnChart data={monthly} unit="consultations held" />
          </ChartCard>
        </div>
        <ChartCard
          title="Format"
          subtitle={`${periodLabel} · share of completed`}
          table={{ columns: ['Format', 'Consultations'], rows: byMode.map((d) => [d.label, d.value]) }}
        >
          <ShareBar data={byMode} unit="consultations" />
          <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-line pt-4 text-sm">
            <div>
              <dt className="text-muted">Cancelled</dt>
              <dd className="text-lg font-semibold tabular-nums">{m.cancelled}</dd>
            </div>
            <div>
              <dt className="text-muted">Follow-ups planned</dt>
              <dd className="text-lg font-semibold tabular-nums">{m.followUps}</dd>
            </div>
          </dl>
        </ChartCard>

        <ChartCard
          title="By consultation type"
          subtitle={periodLabel}
          table={{ columns: ['Type', 'Consultations'], rows: byType.map((d) => [d.label, d.value]) }}
        >
          <BarList data={byType} unit="consultations" />
        </ChartCard>
        <ChartCard
          title="By department"
          subtitle={periodLabel}
          table={{ columns: ['Department', 'Consultations'], rows: byDept.map((d) => [d.label, d.value]) }}
        >
          <BarList data={byDept} unit="consultations" />
        </ChartCard>
        <ChartCard
          title="Booked ahead"
          subtitle="Scheduled consultations, next 5 weeks"
          table={{ columns: ['Week', 'Scheduled'], rows: upcomingByWeek.map((d) => [d.detail ?? d.label, d.value]) }}
        >
          <ColumnChart data={upcomingByWeek} unit="scheduled" height={220} />
        </ChartCard>
      </div>

      <p className="mt-6 max-w-reading text-xs text-muted">
        Figures are calculated from the sample consultations in this demo workspace. Analytics stay at aggregate level: they show
        activity, not ratings of employees or consultants.
      </p>
    </AppShell>
  );
}
