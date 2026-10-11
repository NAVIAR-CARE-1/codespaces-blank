'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  CalendarPlus,
  Download,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Trash2,
  UserCheck,
  UserMinus,
  Users,
} from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { useAnnounce } from '@/components/Announcer';
import { useDemoData } from '@/components/DemoDataProvider';
import {
  Avatar,
  Badge,
  ConfirmDialog,
  EmptyState,
  Field,
  Modal,
  Pagination,
  SearchField,
  SelectField,
  StatTile,
} from '@/components/ui';
import {
  DEPARTMENTS,
  LOCATIONS,
  newId,
  type Department,
  type Employee,
  type EmployeeStatus,
  type Location,
} from '@/lib/demo-data';
import { downloadFile, formatDate, isValidEmail, toCsv, toDateInputValue } from '@/lib/format';

const PAGE_SIZE = 10;

const STATUS_LABEL: Record<EmployeeStatus, string> = {
  active: 'Active',
  onboarding: 'Onboarding',
  inactive: 'Inactive',
};

const STATUS_TONE = { active: 'green', onboarding: 'brass', inactive: 'muted' } as const;

type SortKey = 'name' | 'department' | 'startDate' | 'consultations';

interface FormState {
  name: string;
  email: string;
  phone: string;
  title: string;
  department: Department;
  location: Location;
  status: EmployeeStatus;
  startDate: string;
}

const EMPTY_FORM: FormState = {
  name: '',
  email: '',
  phone: '',
  title: '',
  department: 'Operations',
  location: 'Oslo',
  status: 'onboarding',
  startDate: toDateInputValue(new Date()),
};

type FormErrors = Partial<Record<keyof FormState, string>>;

export default function EmployeesPage() {
  const { employees, setEmployees, consultations, logAudit } = useDemoData();
  const announce = useAnnounce();

  const [query, setQuery] = useState('');
  const [department, setDepartment] = useState<'all' | Department>('all');
  const [status, setStatus] = useState<'all' | EmployeeStatus>('all');
  const [sort, setSort] = useState<SortKey>('name');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [profile, setProfile] = useState<Employee | null>(null);
  const [editing, setEditing] = useState<Employee | 'new' | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [toDelete, setToDelete] = useState<Employee[] | null>(null);

  const consultationCount = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of consultations) map.set(c.employeeId, (map.get(c.employeeId) ?? 0) + 1);
    return map;
  }, [consultations]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = employees.filter((e) => {
      if (department !== 'all' && e.department !== department) return false;
      if (status !== 'all' && e.status !== status) return false;
      if (!q) return true;
      return [e.name, e.email, e.title, e.location].some((v) => v.toLowerCase().includes(q));
    });
    return [...list].sort((a, b) => {
      if (sort === 'department') return a.department.localeCompare(b.department) || a.name.localeCompare(b.name);
      if (sort === 'startDate') return b.startDate.localeCompare(a.startDate);
      if (sort === 'consultations') return (consultationCount.get(b.id) ?? 0) - (consultationCount.get(a.id) ?? 0);
      return a.name.localeCompare(b.name, 'nb');
    });
  }, [employees, query, department, status, sort, consultationCount]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const stats = useMemo(() => {
    const byDept = new Map<Department, number>();
    for (const e of employees) byDept.set(e.department, (byDept.get(e.department) ?? 0) + 1);
    return {
      total: employees.length,
      active: employees.filter((e) => e.status === 'active').length,
      onboarding: employees.filter((e) => e.status === 'onboarding').length,
      byDept,
    };
  }, [employees]);

  const resetPage = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setPage(1);
  };

  const allOnPageSelected = pageItems.length > 0 && pageItems.every((e) => selected.has(e.id));
  const toggleAllOnPage = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) pageItems.forEach((e) => next.delete(e.id));
      else pageItems.forEach((e) => next.add(e.id));
      return next;
    });
  };
  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedEmployees = filtered.filter((e) => selected.has(e.id));

  const exportCsv = (list: Employee[]) => {
    const csv = toCsv(
      ['Name', 'Email', 'Phone', 'Title', 'Department', 'Location', 'Status', 'Start date', 'Manager'],
      list.map((e) => [e.name, e.email, e.phone, e.title, e.department, e.location, STATUS_LABEL[e.status], toDateInputValue(new Date(e.startDate)), e.manager])
    );
    downloadFile(`employees-${toDateInputValue(new Date())}.csv`, csv, 'text/csv');
    announce(`Exported ${list.length} employee${list.length === 1 ? '' : 's'} to CSV.`);
  };

  const setBulkStatus = (next: EmployeeStatus) => {
    const ids = new Set(selectedEmployees.map((e) => e.id));
    setEmployees((prev) => prev.map((e) => (ids.has(e.id) ? { ...e, status: next } : e)));
    logAudit('Demo Admin', 'Changed employee status', `${ids.size} employees → ${STATUS_LABEL[next]}`);
    announce(`${ids.size} employee${ids.size === 1 ? '' : 's'} set to ${STATUS_LABEL[next].toLowerCase()}.`);
    setSelected(new Set());
  };

  const openNew = () => {
    setForm({ ...EMPTY_FORM, startDate: toDateInputValue(new Date()) });
    setErrors({});
    setEditing('new');
  };

  const openEdit = (e: Employee) => {
    setForm({
      name: e.name,
      email: e.email,
      phone: e.phone,
      title: e.title,
      department: e.department,
      location: e.location,
      status: e.status,
      startDate: toDateInputValue(new Date(e.startDate)),
    });
    setErrors({});
    setProfile(null);
    setEditing(e);
  };

  const validate = (f: FormState): FormErrors => {
    const err: FormErrors = {};
    if (f.name.trim().length < 2) err.name = 'Enter the full name.';
    if (!isValidEmail(f.email)) err.email = 'Enter a valid email address.';
    else if (
      employees.some((e) => e.email.toLowerCase() === f.email.trim().toLowerCase() && (editing === 'new' || e.id !== editing?.id))
    )
      err.email = 'Another employee already uses this email.';
    if (!f.title.trim()) err.title = 'Enter a job title.';
    if (!f.startDate) err.startDate = 'Choose a start date.';
    return err;
  };

  const save = () => {
    const err = validate(form);
    setErrors(err);
    if (Object.keys(err).length > 0) return;
    const base = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      title: form.title.trim(),
      department: form.department,
      location: form.location,
      status: form.status,
      startDate: new Date(`${form.startDate}T09:00:00`).toISOString(),
    };
    if (editing === 'new') {
      const created: Employee = { id: newId('emp'), manager: '—', ...base };
      setEmployees((prev) => [...prev, created]);
      logAudit('Demo Admin', 'Added employee', created.name);
      announce(`${created.name} added.`);
    } else if (editing) {
      setEmployees((prev) => prev.map((e) => (e.id === editing.id ? { ...e, ...base } : e)));
      logAudit('Demo Admin', 'Updated employee', base.name);
      announce(`${base.name} updated.`);
    }
    setEditing(null);
  };

  const remove = (list: Employee[]) => {
    const ids = new Set(list.map((e) => e.id));
    setEmployees((prev) => prev.filter((e) => !ids.has(e.id)));
    setSelected((prev) => new Set([...prev].filter((id) => !ids.has(id))));
    logAudit('Demo Admin', 'Removed employee', list.map((e) => e.name).join(', '));
    announce(list.length === 1 ? `${list[0]?.name ?? 'Employee'} removed.` : `${list.length} employees removed.`);
    setProfile(null);
  };

  const fieldProps = (key: keyof FormState) => ({
    id: `emp-${key}`,
    'aria-invalid': errors[key] ? true : undefined,
    'aria-describedby': errors[key] ? `emp-${key}-error` : undefined,
  });

  const hasFilters = query || department !== 'all' || status !== 'all';

  return (
    <AppShell
      eyebrow="People"
      title="Employees"
      description="Directory of everyone you plan consultations with. Search, filter, update profiles and book follow-up."
      actions={
        <>
          <button type="button" className="btn-outline" onClick={() => exportCsv(filtered)}>
            <Download size={16} aria-hidden="true" /> Export
          </button>
          <button type="button" className="btn-primary" onClick={openNew}>
            <Plus size={16} aria-hidden="true" /> Add employee
          </button>
        </>
      }
    >
      <section aria-label="Summary" className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Employees" value={stats.total} icon={<Users size={18} />} />
        <StatTile label="Active" value={stats.active} hint={`${Math.round((stats.active / Math.max(1, stats.total)) * 100)}% of directory`} />
        <StatTile label="Onboarding" value={stats.onboarding} hint="Started in the last 60 days" />
        <StatTile label="Departments" value={stats.byDept.size} icon={<Building2 size={18} />} />
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_240px]">
        <section aria-labelledby="directory-heading" className="card min-w-0">
          <h2 id="directory-heading" className="sr-only">
            Directory
          </h2>
          <div className="flex flex-col gap-3 border-b border-line p-4 md:flex-row md:items-end">
            <SearchField value={query} onChange={resetPage(setQuery)} label="Search employees" placeholder="Search name, email, title or location" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:w-auto">
              <SelectField
                label="Department"
                hideLabel
                value={department}
                onChange={(v) => resetPage(setDepartment)(v as 'all' | Department)}
                options={[{ value: 'all', label: 'All departments' }, ...DEPARTMENTS.map((d) => ({ value: d, label: d }))]}
              />
              <SelectField
                label="Status"
                hideLabel
                value={status}
                onChange={(v) => resetPage(setStatus)(v as 'all' | EmployeeStatus)}
                options={[
                  { value: 'all', label: 'All statuses' },
                  { value: 'active', label: 'Active' },
                  { value: 'onboarding', label: 'Onboarding' },
                  { value: 'inactive', label: 'Inactive' },
                ]}
              />
              <SelectField
                label="Sort by"
                hideLabel
                value={sort}
                onChange={(v) => setSort(v as SortKey)}
                options={[
                  { value: 'name', label: 'Sort: Name' },
                  { value: 'department', label: 'Sort: Department' },
                  { value: 'startDate', label: 'Sort: Newest' },
                  { value: 'consultations', label: 'Sort: Consultations' },
                ]}
              />
            </div>
          </div>

          {selectedEmployees.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2 border-b border-line bg-mist px-4 py-2.5 text-sm">
              <span className="mr-2 font-medium">{selectedEmployees.length} selected</span>
              <button type="button" className="btn-outline btn-sm" onClick={() => setBulkStatus('active')}>
                <UserCheck size={14} aria-hidden="true" /> Mark active
              </button>
              <button type="button" className="btn-outline btn-sm" onClick={() => setBulkStatus('inactive')}>
                <UserMinus size={14} aria-hidden="true" /> Mark inactive
              </button>
              <button type="button" className="btn-outline btn-sm" onClick={() => exportCsv(selectedEmployees)}>
                <Download size={14} aria-hidden="true" /> Export
              </button>
              <button type="button" className="btn-outline btn-sm text-danger-700" onClick={() => setToDelete(selectedEmployees)}>
                <Trash2 size={14} aria-hidden="true" /> Remove
              </button>
              <button type="button" className="btn-ghost btn-sm ml-auto" onClick={() => setSelected(new Set())}>
                Clear selection
              </button>
            </div>
          ) : null}

          {filtered.length === 0 ? (
            <EmptyState icon={<Users size={32} />} title="No employees match">
              {hasFilters ? (
                <button
                  type="button"
                  className="mt-2 font-medium text-primary-600 underline underline-offset-2"
                  onClick={() => {
                    setQuery('');
                    setDepartment('all');
                    setStatus('all');
                  }}
                >
                  Clear filters
                </button>
              ) : (
                'Add your first employee to get started.'
              )}
            </EmptyState>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="table-base">
                  <thead>
                    <tr>
                      <th scope="col" className="w-10">
                        <input
                          type="checkbox"
                          checked={allOnPageSelected}
                          onChange={toggleAllOnPage}
                          aria-label="Select all on this page"
                          className="h-4 w-4 accent-primary-600"
                        />
                      </th>
                      <th scope="col">Name</th>
                      <th scope="col">Department</th>
                      <th scope="col" className="hidden lg:table-cell">Location</th>
                      <th scope="col">Status</th>
                      <th scope="col" className="text-right">Consultations</th>
                      <th scope="col">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.map((e) => (
                      <tr key={e.id} className={selected.has(e.id) ? 'bg-mist/60' : 'hover:bg-paper'}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selected.has(e.id)}
                            onChange={() => toggleOne(e.id)}
                            aria-label={`Select ${e.name}`}
                            className="h-4 w-4 accent-primary-600"
                          />
                        </td>
                        <td>
                          <button type="button" onClick={() => setProfile(e)} className="flex items-center gap-3 text-left">
                            <Avatar name={e.name} size="sm" />
                            <span className="min-w-0">
                              <span className="block font-medium text-ink hover:underline">{e.name}</span>
                              <span className="block text-xs text-muted">{e.title}</span>
                            </span>
                          </button>
                        </td>
                        <td className="text-ink-soft">{e.department}</td>
                        <td className="hidden text-ink-soft lg:table-cell">{e.location}</td>
                        <td>
                          <Badge tone={STATUS_TONE[e.status]}>{STATUS_LABEL[e.status]}</Badge>
                        </td>
                        <td className="text-right tabular-nums">{consultationCount.get(e.id) ?? 0}</td>
                        <td>
                          <div className="flex justify-end gap-1">
                            <Link href={`/consultations?book=${e.id}`} className="btn-ghost btn-sm" title="Book consultation">
                              <CalendarPlus size={16} aria-hidden="true" />
                              <span className="sr-only">Book consultation with {e.name}</span>
                            </Link>
                            <button type="button" className="btn-ghost btn-sm" onClick={() => openEdit(e)} title="Edit">
                              <Pencil size={16} aria-hidden="true" />
                              <span className="sr-only">Edit {e.name}</span>
                            </button>
                            <button type="button" className="btn-ghost btn-sm" onClick={() => setToDelete([e])} title="Remove">
                              <Trash2 size={16} aria-hidden="true" />
                              <span className="sr-only">Remove {e.name}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <ul className="divide-y divide-line md:hidden">
                {pageItems.map((e) => (
                  <li key={e.id} className="flex items-start gap-3 p-4">
                    <input
                      type="checkbox"
                      checked={selected.has(e.id)}
                      onChange={() => toggleOne(e.id)}
                      aria-label={`Select ${e.name}`}
                      className="mt-3 h-4 w-4 accent-primary-600"
                    />
                    <button type="button" onClick={() => setProfile(e)} className="flex min-w-0 flex-1 items-start gap-3 text-left">
                      <Avatar name={e.name} size="sm" />
                      <span className="min-w-0">
                        <span className="block font-medium text-ink">{e.name}</span>
                        <span className="block text-xs text-muted">
                          {e.title} · {e.department}
                        </span>
                        <span className="mt-1.5 flex flex-wrap gap-2">
                          <Badge tone={STATUS_TONE[e.status]}>{STATUS_LABEL[e.status]}</Badge>
                          <span className="text-xs text-muted">{consultationCount.get(e.id) ?? 0} consultations</span>
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>

              <Pagination page={currentPage} pageCount={pageCount} total={filtered.length} pageSize={PAGE_SIZE} onPage={setPage} />
            </>
          )}
        </section>

        <aside aria-labelledby="dept-heading" className="card h-fit p-4">
          <h2 id="dept-heading" className="mb-3 text-base">
            Departments
          </h2>
          <ul className="space-y-0.5">
            {DEPARTMENTS.map((d) => (
              <li key={d}>
                <button
                  type="button"
                  aria-pressed={department === d}
                  onClick={() => resetPage(setDepartment)(department === d ? 'all' : d)}
                  className={`flex w-full items-center justify-between rounded px-2.5 py-1.5 text-sm transition-colors duration-fast ${
                    department === d ? 'bg-primary-600 text-white' : 'text-ink-soft hover:bg-mist'
                  }`}
                >
                  <span className="truncate">{d}</span>
                  <span className="tabular-nums">{stats.byDept.get(d) ?? 0}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      <Modal
        open={profile !== null}
        title={profile?.name ?? ''}
        description={profile ? `${profile.title} · ${profile.department}` : ''}
        onClose={() => setProfile(null)}
        footer={
          profile ? (
            <>
              <button type="button" className="btn-outline" onClick={() => openEdit(profile)}>
                <Pencil size={16} aria-hidden="true" /> Edit
              </button>
              <Link href={`/consultations?book=${profile.id}`} className="btn-primary">
                <CalendarPlus size={16} aria-hidden="true" /> Book consultation
              </Link>
            </>
          ) : null
        }
      >
        {profile ? (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar name={profile.name} size="lg" />
              <Badge tone={STATUS_TONE[profile.status]}>{STATUS_LABEL[profile.status]}</Badge>
            </div>
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted">Email</dt>
                <dd className="flex items-center gap-2 break-all">
                  <Mail size={14} aria-hidden="true" className="shrink-0 text-muted" />
                  <a href={`mailto:${profile.email}`} className="text-primary-600 underline underline-offset-2">
                    {profile.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-muted">Phone</dt>
                <dd className="flex items-center gap-2">
                  <Phone size={14} aria-hidden="true" className="text-muted" />
                  {profile.phone || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-muted">Location</dt>
                <dd className="flex items-center gap-2">
                  <MapPin size={14} aria-hidden="true" className="text-muted" />
                  {profile.location}
                </dd>
              </div>
              <div>
                <dt className="text-muted">Manager</dt>
                <dd>{profile.manager}</dd>
              </div>
              <div>
                <dt className="text-muted">Start date</dt>
                <dd>{formatDate(profile.startDate)}</dd>
              </div>
              <div>
                <dt className="text-muted">Consultations</dt>
                <dd className="tabular-nums">{consultationCount.get(profile.id) ?? 0}</dd>
              </div>
            </dl>
            <div>
              <h3 className="mb-2 text-sm font-semibold">Recent consultations</h3>
              <ul className="divide-y divide-line rounded border border-line text-sm">
                {consultations
                  .filter((c) => c.employeeId === profile.id)
                  .slice(-4)
                  .reverse()
                  .map((c) => (
                    <li key={c.id} className="flex items-center justify-between gap-3 px-3 py-2">
                      <span className="min-w-0 truncate">{c.type}</span>
                      <span className="shrink-0 text-xs text-muted">{formatDate(c.start)}</span>
                    </li>
                  ))}
                {consultationCount.get(profile.id) ? null : <li className="px-3 py-2 text-muted">No consultations yet.</li>}
              </ul>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={editing !== null}
        title={editing === 'new' ? 'Add employee' : 'Edit employee'}
        onClose={() => setEditing(null)}
        footer={
          <>
            <button type="button" className="btn-outline" onClick={() => setEditing(null)}>
              Cancel
            </button>
            <button type="button" className="btn-primary" onClick={save}>
              {editing === 'new' ? 'Add employee' : 'Save changes'}
            </button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Full name" htmlFor="emp-name" error={errors.name}>
              <input {...fieldProps('name')} className="input-base" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="off" />
            </Field>
          </div>
          <Field label="Email" htmlFor="emp-email" error={errors.email}>
            <input {...fieldProps('email')} type="email" className="input-base" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="off" />
          </Field>
          <Field label="Phone (optional)" htmlFor="emp-phone">
            <input {...fieldProps('phone')} type="tel" className="input-base" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} autoComplete="off" />
          </Field>
          <Field label="Job title" htmlFor="emp-title" error={errors.title}>
            <input {...fieldProps('title')} className="input-base" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
          <Field label="Start date" htmlFor="emp-startDate" error={errors.startDate}>
            <input {...fieldProps('startDate')} type="date" className="input-base" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
          </Field>
          <SelectField
            label="Department"
            value={form.department}
            onChange={(v) => setForm({ ...form, department: v as Department })}
            options={DEPARTMENTS.map((d) => ({ value: d, label: d }))}
          />
          <SelectField
            label="Location"
            value={form.location}
            onChange={(v) => setForm({ ...form, location: v as Location })}
            options={LOCATIONS.map((l) => ({ value: l, label: l }))}
          />
          <SelectField
            label="Status"
            value={form.status}
            onChange={(v) => setForm({ ...form, status: v as EmployeeStatus })}
            options={[
              { value: 'onboarding', label: 'Onboarding' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />
        </div>
      </Modal>

      <ConfirmDialog
        open={toDelete !== null}
        title={toDelete && toDelete.length > 1 ? `Remove ${toDelete.length} employees?` : 'Remove employee?'}
        message={
          toDelete && toDelete.length === 1
            ? `${toDelete[0]?.name ?? ''} will be removed from the directory. Their consultation history stays in reports.`
            : 'The selected employees will be removed from the directory. Their consultation history stays in reports.'
        }
        confirmLabel="Remove"
        onConfirm={() => toDelete && remove(toDelete)}
        onClose={() => setToDelete(null)}
      />
    </AppShell>
  );
}
