'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  List,
  MapPin,
  Phone,
  Plus,
  Users,
  Video,
  XCircle,
} from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { useAnnounce } from '@/components/Announcer';
import { useDemoData } from '@/components/DemoDataProvider';
import {
  Badge,
  ConfirmDialog,
  EmptyState,
  Field,
  Modal,
  Pagination,
  SearchField,
  SelectField,
  StatTile,
  ToggleGroup,
} from '@/components/ui';
import {
  CONSULTANTS,
  CONSULTATION_TYPES,
  newId,
  type Consultation,
  type ConsultationMode,
  type ConsultationStatus,
  type ConsultationType,
} from '@/lib/demo-data';
import { formatDate, formatDateTime, formatMonth, formatTime, formatWeekday, sameDay, toDateInputValue } from '@/lib/format';

const PAGE_SIZE = 10;

const STATUS_LABEL: Record<ConsultationStatus, string> = {
  scheduled: 'Scheduled',
  rescheduled: 'Rescheduled',
  completed: 'Completed',
  cancelled: 'Cancelled',
};
const STATUS_TONE = { scheduled: 'green', rescheduled: 'brass', completed: 'blue', cancelled: 'muted' } as const;

const MODE_LABEL: Record<ConsultationMode, string> = { video: 'Video', 'in-person': 'In person', phone: 'Phone' };
const MODE_ICON: Record<ConsultationMode, typeof Video> = { video: Video, 'in-person': MapPin, phone: Phone };

type Scope = 'upcoming' | 'past' | 'all';
type View = 'list' | 'calendar';

interface BookingForm {
  employeeId: string;
  type: ConsultationType;
  consultant: string;
  date: string;
  time: string;
  durationMin: number;
  mode: ConsultationMode;
  room: string;
  agenda: string;
}

type BookingErrors = Partial<Record<keyof BookingForm, string>>;

const isOpen = (c: Consultation) => c.status === 'scheduled' || c.status === 'rescheduled';

function endOf(c: { start: string; durationMin: number }) {
  return new Date(c.start).getTime() + c.durationMin * 60000;
}

export default function ConsultationsPage() {
  const { consultations, setConsultations, employees, logAudit } = useDemoData();
  const announce = useAnnounce();
  const [now] = useState(() => new Date());

  const [view, setView] = useState<View>('list');
  const [scope, setScope] = useState<Scope>('upcoming');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | ConsultationStatus>('all');
  const [consultant, setConsultant] = useState<string>('all');
  const [type, setType] = useState<'all' | ConsultationType>('all');
  const [page, setPage] = useState(1);
  const [month, setMonth] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState<Date>(now);

  const [detailId, setDetailId] = useState<string | null>(null);
  const [booking, setBooking] = useState<BookingForm | null>(null);
  const [bookingErrors, setBookingErrors] = useState<BookingErrors>({});
  const [reschedule, setReschedule] = useState<{ id: string; date: string; time: string; error: string } | null>(null);
  const [toCancel, setToCancel] = useState<Consultation | null>(null);
  const [noteText, setNoteText] = useState('');

  const employeeById = useMemo(() => new Map(employees.map((e) => [e.id, e])), [employees]);
  const nameOf = (id: string) => employeeById.get(id)?.name ?? 'Former employee';
  const detail = consultations.find((c) => c.id === detailId) ?? null;

  const defaultBooking = (employeeId = ''): BookingForm => {
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    return {
      employeeId,
      type: 'Career development',
      consultant: CONSULTANTS[0],
      date: toDateInputValue(d),
      time: '10:00',
      durationMin: 60,
      mode: 'video',
      room: 'Room Fjord',
      agenda: '',
    };
  };

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('book');
    if (id && employees.some((e) => e.id === id && e.status !== 'inactive')) {
      setBooking(defaultBooking(id));
      window.history.replaceState(null, '', '/consultations');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(() => {
    const in30 = now.getTime() + 30 * 86400000;
    const yearAgo = now.getTime() - 365 * 86400000;
    const past = consultations.filter((c) => new Date(c.start) < now && new Date(c.start).getTime() >= yearAgo);
    const cancelled = past.filter((c) => c.status === 'cancelled').length;
    return {
      upcoming: consultations.filter((c) => isOpen(c) && new Date(c.start) >= now && new Date(c.start).getTime() <= in30).length,
      thisMonth: consultations.filter((c) => {
        const d = new Date(c.start);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && c.status !== 'cancelled';
      }).length,
      completed: past.filter((c) => c.status === 'completed').length,
      cancelRate: past.length ? Math.round((cancelled / past.length) * 100) : 0,
    };
  }, [consultations, now]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = consultations.filter((c) => {
      const start = new Date(c.start);
      if (view === 'list') {
        if (scope === 'upcoming' && start < now) return false;
        if (scope === 'past' && start >= now) return false;
      }
      if (status !== 'all' && c.status !== status) return false;
      if (consultant !== 'all' && c.consultant !== consultant) return false;
      if (type !== 'all' && c.type !== type) return false;
      if (!q) return true;
      return [nameOf(c.employeeId), c.type, c.consultant].some((v) => v.toLowerCase().includes(q));
    });
    return scope === 'upcoming' && view === 'list' ? list : [...list].reverse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consultations, query, status, consultant, type, scope, view, now, employeeById]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const reset = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setPage(1);
  };

  const conflictFor = (consultantName: string, start: Date, durationMin: number, ignoreId?: string) =>
    consultations.find(
      (c) =>
        c.id !== ignoreId &&
        c.consultant === consultantName &&
        isOpen(c) &&
        new Date(c.start).getTime() < start.getTime() + durationMin * 60000 &&
        endOf(c) > start.getTime()
    );

  const submitBooking = () => {
    if (!booking) return;
    const err: BookingErrors = {};
    if (!booking.employeeId) err.employeeId = 'Choose an employee.';
    const start = new Date(`${booking.date}T${booking.time}:00`);
    if (!booking.date || !booking.time || Number.isNaN(start.getTime())) err.date = 'Choose a date and time.';
    else if (start <= new Date()) err.date = 'Choose a time in the future.';
    else if (start.getDay() === 0 || start.getDay() === 6) err.date = 'Consultations are booked on weekdays.';
    else {
      const clash = conflictFor(booking.consultant, start, booking.durationMin);
      if (clash) err.time = `${booking.consultant} is already booked ${formatTime(clash.start)}–${formatTime(new Date(endOf(clash)).toISOString())}.`;
    }
    setBookingErrors(err);
    if (Object.keys(err).length) return;

    const created: Consultation = {
      id: newId('con'),
      type: booking.type,
      employeeId: booking.employeeId,
      consultant: booking.consultant,
      start: start.toISOString(),
      durationMin: booking.durationMin,
      mode: booking.mode,
      status: 'scheduled',
      location: booking.mode === 'video' ? 'Whereby' : booking.mode === 'phone' ? 'Phone' : booking.room,
      notes: booking.agenda.trim()
        ? [{ id: newId('note'), author: 'Demo Admin', date: new Date().toISOString(), text: `Agenda: ${booking.agenda.trim()}` }]
        : [],
      followUp: null,
    };
    setConsultations((prev) => [...prev, created].sort((a, b) => a.start.localeCompare(b.start)));
    logAudit('Demo Admin', 'Booked consultation', `${created.type} – ${nameOf(created.employeeId)}`);
    announce(`Consultation booked for ${nameOf(created.employeeId)} on ${formatDateTime(created.start)}.`);
    setBooking(null);
  };

  const update = (id: string, patch: Partial<Consultation>, auditAction: string, message: string) => {
    const target = consultations.find((c) => c.id === id);
    setConsultations((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)).sort((a, b) => a.start.localeCompare(b.start)));
    if (target) logAudit('Demo Admin', auditAction, `${target.type} – ${nameOf(target.employeeId)}`);
    announce(message);
  };

  const submitReschedule = () => {
    if (!reschedule) return;
    const target = consultations.find((c) => c.id === reschedule.id);
    if (!target) return;
    const start = new Date(`${reschedule.date}T${reschedule.time}:00`);
    let error = '';
    if (Number.isNaN(start.getTime()) || start <= new Date()) error = 'Choose a time in the future.';
    else if (start.getDay() === 0 || start.getDay() === 6) error = 'Consultations are booked on weekdays.';
    else if (conflictFor(target.consultant, start, target.durationMin, target.id)) error = `${target.consultant} is already booked at that time.`;
    if (error) {
      setReschedule({ ...reschedule, error });
      return;
    }
    update(target.id, { start: start.toISOString(), status: 'rescheduled' }, 'Rescheduled consultation', `Moved to ${formatDateTime(start.toISOString())}.`);
    setReschedule(null);
  };

  const addNote = () => {
    if (!detail || !noteText.trim()) return;
    const note = { id: newId('note'), author: 'Demo Admin', date: new Date().toISOString(), text: noteText.trim() };
    update(detail.id, { notes: [...detail.notes, note] }, 'Added consultation note', 'Note added.');
    setNoteText('');
  };

  const calendarDays = useMemo(() => {
    const first = new Date(month);
    const offset = (first.getDay() + 6) % 7;
    const start = new Date(first);
    start.setDate(first.getDate() - offset);
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [month]);

  const byDay = useMemo(() => {
    const map = new Map<string, Consultation[]>();
    for (const c of filtered) {
      const key = toDateInputValue(new Date(c.start));
      const arr = map.get(key) ?? [];
      arr.push(c);
      map.set(key, arr);
    }
    map.forEach((arr) => arr.sort((a, b) => a.start.localeCompare(b.start)));
    return map;
  }, [filtered]);

  const dayItems = byDay.get(toDateInputValue(selectedDay)) ?? [];

  const activeEmployees = employees.filter((e) => e.status !== 'inactive').sort((a, b) => a.name.localeCompare(b.name, 'nb'));

  const row = (c: Consultation) => {
    const ModeIcon = MODE_ICON[c.mode];
    return (
      <button
        type="button"
        onClick={() => {
          setDetailId(c.id);
          setNoteText('');
        }}
        className="flex w-full flex-col gap-2 px-4 py-3 text-left transition-colors duration-fast hover:bg-paper sm:flex-row sm:items-center sm:gap-4"
      >
        <div className="w-full shrink-0 sm:w-40">
          <p className="text-sm font-medium text-ink">{formatWeekday(c.start)}</p>
          <p className="text-xs text-muted tabular-nums">
            {formatTime(c.start)} · {c.durationMin} min
          </p>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-ink">{nameOf(c.employeeId)}</p>
          <p className="truncate text-xs text-muted">
            {c.type} · with {c.consultant}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="inline-flex items-center gap-1 text-xs text-muted">
            <ModeIcon size={14} aria-hidden="true" />
            {MODE_LABEL[c.mode]}
          </span>
          <Badge tone={STATUS_TONE[c.status]}>{STATUS_LABEL[c.status]}</Badge>
        </div>
      </button>
    );
  };

  return (
    <AppShell
      eyebrow="Planning"
      title="Consultations"
      description="Book, follow up and document consultations. Conflicts are checked against each consultant's calendar."
      actions={
        <button
          type="button"
          className="btn-primary"
          onClick={() => {
            setBooking(defaultBooking());
            setBookingErrors({});
          }}
        >
          <Plus size={16} aria-hidden="true" /> Book consultation
        </button>
      }
    >
      <section aria-label="Summary" className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Upcoming" value={stats.upcoming} hint="Next 30 days" icon={<CalendarClock size={18} />} />
        <StatTile label="This month" value={stats.thisMonth} hint={formatMonth(now)} icon={<CalendarDays size={18} />} />
        <StatTile label="Completed" value={stats.completed} hint="Last 12 months" icon={<CalendarCheck size={18} />} />
        <StatTile label="Cancellation rate" value={`${stats.cancelRate}%`} hint="Last 12 months" icon={<XCircle size={18} />} />
      </section>

      <section aria-labelledby="list-heading" className="card min-w-0">
        <h2 id="list-heading" className="sr-only">
          Consultations
        </h2>
        <div className="flex flex-col gap-3 border-b border-line p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <ToggleGroup
              label="View"
              value={view}
              onChange={(v) => setView(v)}
              options={[
                { value: 'list', label: 'List', icon: <List size={14} aria-hidden="true" /> },
                { value: 'calendar', label: 'Calendar', icon: <CalendarDays size={14} aria-hidden="true" /> },
              ]}
            />
            {view === 'list' ? (
              <ToggleGroup
                label="Time range"
                value={scope}
                onChange={reset(setScope)}
                options={[
                  { value: 'upcoming', label: 'Upcoming' },
                  { value: 'past', label: 'Past' },
                  { value: 'all', label: 'All' },
                ]}
              />
            ) : null}
          </div>
          <div className="flex flex-col gap-3 lg:flex-row">
            <SearchField value={query} onChange={reset(setQuery)} label="Search consultations" placeholder="Search employee, type or consultant" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <SelectField
                label="Status"
                hideLabel
                value={status}
                onChange={(v) => reset(setStatus)(v as 'all' | ConsultationStatus)}
                options={[{ value: 'all', label: 'All statuses' }, ...Object.entries(STATUS_LABEL).map(([value, label]) => ({ value, label }))]}
              />
              <SelectField
                label="Consultant"
                hideLabel
                value={consultant}
                onChange={reset(setConsultant)}
                options={[{ value: 'all', label: 'All consultants' }, ...CONSULTANTS.map((c) => ({ value: c, label: c }))]}
              />
              <SelectField
                label="Type"
                hideLabel
                value={type}
                onChange={(v) => reset(setType)(v as 'all' | ConsultationType)}
                options={[{ value: 'all', label: 'All types' }, ...CONSULTATION_TYPES.map((t) => ({ value: t, label: t }))]}
              />
            </div>
          </div>
        </div>

        {view === 'list' ? (
          filtered.length === 0 ? (
            <EmptyState icon={<CalendarDays size={32} />} title="No consultations match">
              Try another time range or clear the filters.
            </EmptyState>
          ) : (
            <>
              <ul className="divide-y divide-line">
                {pageItems.map((c) => (
                  <li key={c.id}>{row(c)}</li>
                ))}
              </ul>
              <Pagination page={currentPage} pageCount={pageCount} total={filtered.length} pageSize={PAGE_SIZE} onPage={setPage} />
            </>
          )
        ) : (
          <div className="p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
              >
                <ChevronLeft size={18} aria-hidden="true" />
                <span className="sr-only">Previous month</span>
              </button>
              <h3 className="font-display text-lg font-semibold">
                {formatMonth(month)}
              </h3>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
              >
                <ChevronRight size={18} aria-hidden="true" />
                <span className="sr-only">Next month</span>
              </button>
            </div>
            <div className="grid grid-cols-7 gap-px overflow-hidden rounded border border-line bg-line text-xs">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                <div key={d} className="bg-warm px-1 py-1.5 text-center font-medium text-muted">
                  {d}
                </div>
              ))}
              {calendarDays.map((d) => {
                const key = toDateInputValue(d);
                const items = byDay.get(key) ?? [];
                const inMonth = d.getMonth() === month.getMonth();
                const isSelected = sameDay(d, selectedDay);
                const isToday = sameDay(d, now);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedDay(d)}
                    aria-pressed={isSelected}
                    aria-label={`${formatDate(d.toISOString())}, ${items.length} consultation${items.length === 1 ? '' : 's'}`}
                    className={`flex min-h-[3.25rem] flex-col items-stretch gap-1 p-1 text-left transition-colors duration-fast sm:min-h-[5.5rem] ${
                      isSelected ? 'bg-mist ring-2 ring-inset ring-primary-500' : inMonth ? 'bg-white hover:bg-paper' : 'bg-paper text-muted'
                    }`}
                  >
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center self-start rounded-full tabular-nums ${
                        isToday ? 'bg-primary-600 font-semibold text-white' : ''
                      }`}
                    >
                      {d.getDate()}
                    </span>
                    <span className="hidden flex-col gap-0.5 sm:flex">
                      {items.slice(0, 2).map((c) => (
                        <span
                          key={c.id}
                          className={`truncate rounded px-1 py-0.5 ${c.status === 'cancelled' ? 'bg-warm text-muted line-through' : 'bg-primary-100 text-primary-700'}`}
                        >
                          {formatTime(c.start)} {nameOf(c.employeeId).split(' ')[0]}
                        </span>
                      ))}
                      {items.length > 2 ? <span className="px-1 text-muted">+{items.length - 2} more</span> : null}
                    </span>
                    {items.length > 0 ? (
                      <span className="text-[0.7rem] font-medium text-primary-600 sm:hidden">{items.length}</span>
                    ) : null}
                  </button>
                );
              })}
            </div>
            <div className="mt-5">
              <h3 className="mb-2 text-sm font-semibold">{formatDate(selectedDay.toISOString())}</h3>
              {dayItems.length === 0 ? (
                <p className="text-sm text-muted">Nothing booked this day.</p>
              ) : (
                <ul className="divide-y divide-line rounded border border-line">
                  {dayItems.map((c) => (
                    <li key={c.id}>{row(c)}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </section>

      <Modal
        open={booking !== null}
        title="Book consultation"
        description="The consultant's calendar is checked for overlapping bookings."
        onClose={() => setBooking(null)}
        footer={
          <>
            <button type="button" className="btn-outline" onClick={() => setBooking(null)}>
              Cancel
            </button>
            <button type="button" className="btn-primary" onClick={submitBooking}>
              Book
            </button>
          </>
        }
      >
        {booking ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Employee" htmlFor="book-employee" error={bookingErrors.employeeId}>
                <select
                  id="book-employee"
                  className="input-base"
                  value={booking.employeeId}
                  aria-invalid={bookingErrors.employeeId ? true : undefined}
                  onChange={(e) => setBooking({ ...booking, employeeId: e.target.value })}
                >
                  <option value="">Choose employee…</option>
                  {activeEmployees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} — {e.department}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <SelectField
              label="Type"
              value={booking.type}
              onChange={(v) => setBooking({ ...booking, type: v as ConsultationType })}
              options={CONSULTATION_TYPES.map((t) => ({ value: t, label: t }))}
            />
            <SelectField
              label="Consultant"
              value={booking.consultant}
              onChange={(v) => setBooking({ ...booking, consultant: v })}
              options={CONSULTANTS.map((c) => ({ value: c, label: c }))}
            />
            <Field label="Date" htmlFor="book-date" error={bookingErrors.date}>
              <input
                id="book-date"
                type="date"
                className="input-base"
                min={toDateInputValue(new Date())}
                value={booking.date}
                aria-invalid={bookingErrors.date ? true : undefined}
                onChange={(e) => setBooking({ ...booking, date: e.target.value })}
              />
            </Field>
            <Field label="Start time" htmlFor="book-time" error={bookingErrors.time}>
              <input
                id="book-time"
                type="time"
                step={900}
                className="input-base"
                value={booking.time}
                aria-invalid={bookingErrors.time ? true : undefined}
                onChange={(e) => setBooking({ ...booking, time: e.target.value })}
              />
            </Field>
            <SelectField
              label="Duration"
              value={String(booking.durationMin)}
              onChange={(v) => setBooking({ ...booking, durationMin: Number(v) })}
              options={[30, 45, 60, 90].map((m) => ({ value: String(m), label: `${m} minutes` }))}
            />
            <SelectField
              label="Format"
              value={booking.mode}
              onChange={(v) => setBooking({ ...booking, mode: v as ConsultationMode })}
              options={[
                { value: 'video', label: 'Video (Whereby)' },
                { value: 'in-person', label: 'In person' },
                { value: 'phone', label: 'Phone' },
              ]}
            />
            {booking.mode === 'in-person' ? (
              <SelectField
                label="Room"
                value={booking.room}
                onChange={(v) => setBooking({ ...booking, room: v })}
                options={['Room Fjord', 'Room Vidde', 'Room Kyst', 'Client office'].map((r) => ({ value: r, label: r }))}
              />
            ) : null}
            <div className="sm:col-span-2">
              <Field label="Agenda (optional)" htmlFor="book-agenda" hint="Keep it to the topic — no health details.">
                <textarea
                  id="book-agenda"
                  rows={3}
                  className="input-base"
                  value={booking.agenda}
                  onChange={(e) => setBooking({ ...booking, agenda: e.target.value })}
                />
              </Field>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={detail !== null}
        title={detail ? `${detail.type} — ${nameOf(detail.employeeId)}` : ''}
        description={detail ? formatDateTime(detail.start) : ''}
        onClose={() => setDetailId(null)}
        size="lg"
        footer={
          detail && isOpen(detail) ? (
            <>
              <button type="button" className="btn-outline text-danger-700" onClick={() => setToCancel(detail)}>
                Cancel consultation
              </button>
              <button
                type="button"
                className="btn-outline"
                onClick={() => {
                  const d = new Date(detail.start);
                  setReschedule({ id: detail.id, date: toDateInputValue(d), time: formatTime(detail.start), error: '' });
                }}
              >
                Reschedule
              </button>
              <button
                type="button"
                className="btn-primary"
                disabled={new Date(detail.start) > now}
                title={new Date(detail.start) > now ? 'Available after the start time' : undefined}
                onClick={() => update(detail.id, { status: 'completed' }, 'Completed consultation', 'Marked as completed.')}
              >
                Mark completed
              </button>
            </>
          ) : null
        }
      >
        {detail ? (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={STATUS_TONE[detail.status]}>{STATUS_LABEL[detail.status]}</Badge>
              {detail.followUp ? <Badge tone="brass">Follow-up {formatDate(detail.followUp)}</Badge> : null}
            </div>
            <dl className="grid gap-4 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-muted">Employee</dt>
                <dd className="flex items-center gap-1.5">
                  <Users size={14} aria-hidden="true" className="text-muted" />
                  {nameOf(detail.employeeId)}
                </dd>
              </div>
              <div>
                <dt className="text-muted">Consultant</dt>
                <dd>{detail.consultant}</dd>
              </div>
              <div>
                <dt className="text-muted">Time</dt>
                <dd className="flex items-center gap-1.5">
                  <Clock size={14} aria-hidden="true" className="text-muted" />
                  {formatTime(detail.start)}–{formatTime(new Date(endOf(detail)).toISOString())}
                </dd>
              </div>
              <div>
                <dt className="text-muted">Format</dt>
                <dd>{MODE_LABEL[detail.mode]}</dd>
              </div>
              <div>
                <dt className="text-muted">Location</dt>
                <dd>{detail.location}</dd>
              </div>
              {detail.mode === 'video' && isOpen(detail) ? (
                <div>
                  <dt className="text-muted">Video room</dt>
                  <dd>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 font-medium text-primary-600 underline underline-offset-2"
                      onClick={() => announce('Video room links are not generated in this preview.')}
                    >
                      <Video size={14} aria-hidden="true" /> Join video
                    </button>
                  </dd>
                </div>
              ) : null}
            </dl>

            <div>
              <h3 className="mb-2 text-sm font-semibold">Notes</h3>
              {detail.notes.length === 0 ? (
                <p className="text-sm text-muted">No notes yet.</p>
              ) : (
                <ul className="space-y-2">
                  {detail.notes.map((n) => (
                    <li key={n.id} className="rounded border border-line bg-paper px-3 py-2 text-sm">
                      <p className="max-w-reading">{n.text}</p>
                      <p className="mt-1 text-xs text-muted">
                        {n.author} · {formatDateTime(n.date)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-3">
                <label htmlFor="note-text" className="label">
                  Add note
                </label>
                <textarea
                  id="note-text"
                  rows={3}
                  className="input-base"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Agreed actions, owners and dates"
                />
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-muted">Write facts and actions only. Do not record health information.</p>
                  <button type="button" className="btn-secondary btn-sm" onClick={addNote} disabled={!noteText.trim()}>
                    Save note
                  </button>
                </div>
              </div>
            </div>

            {detail.status === 'completed' ? (
              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <label htmlFor="follow-up" className="label">
                    Follow-up date
                  </label>
                  <input
                    id="follow-up"
                    type="date"
                    className="input-base"
                    value={detail.followUp ? toDateInputValue(new Date(detail.followUp)) : ''}
                    onChange={(e) =>
                      update(
                        detail.id,
                        { followUp: e.target.value ? new Date(`${e.target.value}T09:00:00`).toISOString() : null },
                        'Set follow-up',
                        e.target.value ? `Follow-up set for ${formatDate(new Date(`${e.target.value}T09:00:00`).toISOString())}.` : 'Follow-up removed.'
                      )
                    }
                  />
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </Modal>

      <Modal
        open={reschedule !== null}
        title="Reschedule consultation"
        size="sm"
        onClose={() => setReschedule(null)}
        footer={
          <>
            <button type="button" className="btn-outline" onClick={() => setReschedule(null)}>
              Cancel
            </button>
            <button type="button" className="btn-primary" onClick={submitReschedule}>
              Save new time
            </button>
          </>
        }
      >
        {reschedule ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Date" htmlFor="res-date">
              <input
                id="res-date"
                type="date"
                className="input-base"
                min={toDateInputValue(new Date())}
                value={reschedule.date}
                onChange={(e) => setReschedule({ ...reschedule, date: e.target.value, error: '' })}
              />
            </Field>
            <Field label="Start time" htmlFor="res-time">
              <input
                id="res-time"
                type="time"
                step={900}
                className="input-base"
                value={reschedule.time}
                onChange={(e) => setReschedule({ ...reschedule, time: e.target.value, error: '' })}
              />
            </Field>
            {reschedule.error ? <p className="field-error sm:col-span-2">{reschedule.error}</p> : null}
          </div>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={toCancel !== null}
        title="Cancel consultation?"
        message={toCancel ? `${toCancel.type} with ${nameOf(toCancel.employeeId)} on ${formatDateTime(toCancel.start)} will be cancelled.` : ''}
        confirmLabel="Cancel consultation"
        onConfirm={() => toCancel && update(toCancel.id, { status: 'cancelled' }, 'Cancelled consultation', 'Consultation cancelled.')}
        onClose={() => setToCancel(null)}
      />
    </AppShell>
  );
}
