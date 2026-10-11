'use client';

import { useMemo, useRef, useState, type KeyboardEvent } from 'react';
import {
  Bell,
  Building2,
  Check,
  Copy,
  Database,
  Download,
  KeyRound,
  Lock,
  Monitor,
  Plug,
  Plus,
  ScrollText,
  Smartphone,
  Trash2,
  Users,
} from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { useAnnounce } from '@/components/Announcer';
import { useAuth } from '@/hooks/useAuth';
import { useDemoData } from '@/components/DemoDataProvider';
import { Avatar, Badge, ConfirmDialog, EmptyState, Field, Modal, SearchField, SelectField, Switch } from '@/components/ui';
import { newId, type TeamMember, type TeamRole } from '@/lib/demo-data';
import { downloadFile, formatDateTime, isValidEmail, relativeTime, toCsv, toDateInputValue } from '@/lib/format';

const TABS = [
  { id: 'general', label: 'General', icon: Building2 },
  { id: 'users', label: 'Users & roles', icon: Users },
  { id: 'integrations', label: 'Integrations', icon: Plug },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'api', label: 'API & developer', icon: KeyRound },
  { id: 'audit', label: 'Audit log', icon: ScrollText },
  { id: 'data', label: 'Data', icon: Database },
] as const;
type TabId = (typeof TABS)[number]['id'];

const ROLE_LABEL: Record<TeamRole, string> = { admin: 'Admin', manager: 'Manager', consultant: 'Consultant', employee: 'Employee' };
const ROLES: TeamRole[] = ['admin', 'manager', 'consultant', 'employee'];

const PERMISSIONS: Array<[string, TeamRole[]]> = [
  ['View employee directory', ['admin', 'manager', 'consultant']],
  ['Edit employee profiles', ['admin', 'manager']],
  ['Book and change consultations', ['admin', 'manager', 'consultant']],
  ['Read consultation notes', ['admin', 'consultant']],
  ['See own consultations', ['admin', 'manager', 'consultant', 'employee']],
  ['Manage documents', ['admin', 'manager', 'consultant']],
  ['View analytics', ['admin', 'manager']],
  ['Manage settings and users', ['admin']],
];

interface Integration {
  id: string;
  name: string;
  purpose: string;
  connected: boolean;
  lastSync: string | null;
}

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  scope: 'read' | 'read-write';
  created: string;
  lastUsed: string | null;
}

interface Session {
  id: string;
  device: string;
  place: string;
  lastSeen: string;
  current: boolean;
}

const NOTIFICATION_EVENTS = [
  ['booking', 'New booking', 'When a consultation is booked with you or your team'],
  ['change', 'Booking changed or cancelled', 'Time, format or status changes'],
  ['reminder', 'Reminder', '24 hours before a consultation'],
  ['shared', 'Document shared with me', 'Someone gives you access to a document'],
  ['weekly', 'Weekly summary', 'Monday morning overview of the week ahead'],
] as const;
type NotificationKey = (typeof NOTIFICATION_EVENTS)[number][0];

function randomKey(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return `nvc_live_${Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')}`;
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="card p-5">
      <h3 className="font-display text-base font-semibold">{title}</h3>
      {description ? <p className="mt-0.5 max-w-reading text-sm text-muted">{description}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function SettingsPage() {
  const announce = useAnnounce();
  const { user } = useAuth();
  const actor = user?.name ?? 'Demo Admin';
  const { team, setTeam, audit, logAudit, employees, consultations, documents, setEmployees, setConsultations, setDocuments } = useDemoData();
  const [now] = useState(() => new Date());
  const ago = (h: number) => new Date(now.getTime() - h * 3600000).toISOString();

  const [tab, setTab] = useState<TabId>('general');
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const [org, setOrg] = useState({
    name: 'Demo Organisation AS',
    orgNumber: '000 000 000',
    timezone: 'Europe/Oslo',
    language: 'nb',
    dateFormat: 'dd.mm.yyyy',
  });
  const [savedOrg, setSavedOrg] = useState(org);
  const orgDirty = JSON.stringify(org) !== JSON.stringify(savedOrg);

  const [invite, setInvite] = useState<{ name: string; email: string; role: TeamRole; error: string } | null>(null);
  const [removeMember, setRemoveMember] = useState<TeamMember | null>(null);

  const [integrations, setIntegrations] = useState<Integration[]>([
    { id: 'whereby', name: 'Whereby', purpose: 'Video rooms for remote consultations', connected: true, lastSync: ago(1) },
    { id: 'calendly', name: 'Calendly', purpose: 'Let employees pick a time from consultant availability', connected: false, lastSync: null },
    { id: 'sap', name: 'SAP SuccessFactors', purpose: 'Import employees and departments', connected: false, lastSync: null },
    { id: 'visma', name: 'Visma', purpose: 'Sync employees from HR and payroll', connected: true, lastSync: ago(20) },
    { id: 'stripe', name: 'Stripe', purpose: 'Subscription billing and invoices', connected: false, lastSync: null },
  ]);

  const [security, setSecurity] = useState({ minLength: '12', require2fa: true, sso: false, timeout: '30', lockout: '5' });
  const [sessions, setSessions] = useState<Session[]>([
    { id: 's1', device: 'Chrome on macOS', place: 'Oslo, Norway', lastSeen: ago(0), current: true },
    { id: 's2', device: 'Safari on iPhone', place: 'Oslo, Norway', lastSeen: ago(9), current: false },
    { id: 's3', device: 'Edge on Windows', place: 'Bergen, Norway', lastSeen: ago(52), current: false },
  ]);

  const [notify, setNotify] = useState<Record<NotificationKey, { email: boolean; app: boolean }>>({
    booking: { email: true, app: true },
    change: { email: true, app: true },
    reminder: { email: true, app: false },
    shared: { email: false, app: true },
    weekly: { email: true, app: false },
  });

  const [keys, setKeys] = useState<ApiKey[]>([
    { id: 'k1', name: 'HR system sync', prefix: 'nvc_live_3f9a', scope: 'read', created: ago(24 * 40), lastUsed: ago(3) },
    { id: 'k2', name: 'Reporting export', prefix: 'nvc_live_b21c', scope: 'read', created: ago(24 * 90), lastUsed: ago(24 * 6) },
  ]);
  const [newKey, setNewKey] = useState<{ name: string; scope: 'read' | 'read-write'; error: string; secret: string | null } | null>(null);
  const [revokeKey, setRevokeKey] = useState<ApiKey | null>(null);
  const [webhook, setWebhook] = useState('');
  const [webhookError, setWebhookError] = useState('');

  const [auditQuery, setAuditQuery] = useState('');
  const [auditActor, setAuditActor] = useState('all');

  const [retention, setRetention] = useState('24');
  const [wipeOpen, setWipeOpen] = useState(false);
  const [wipeText, setWipeText] = useState('');

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (index + 1) % TABS.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (index - 1 + TABS.length) % TABS.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = TABS.length - 1;
    else return;
    e.preventDefault();
    const t = TABS[next];
    if (t) setTab(t.id);
    tabRefs.current[next]?.focus();
  };

  const saveOrg = () => {
    setSavedOrg(org);
    logAudit(actor, 'Updated organisation settings', org.name);
    announce('Organisation settings saved.');
  };

  const submitInvite = () => {
    if (!invite) return;
    const email = invite.email.trim().toLowerCase();
    let error = '';
    if (invite.name.trim().length < 2) error = 'Enter a name.';
    else if (!isValidEmail(email)) error = 'Enter a valid email address.';
    else if (team.some((m) => m.email === email)) error = 'This person already has access.';
    if (error) {
      setInvite({ ...invite, error });
      return;
    }
    setTeam((prev) => [...prev, { id: newId('usr'), name: invite.name.trim(), email, role: invite.role, status: 'invited', lastActive: null }]);
    logAudit(actor, 'Invited user', `${email} (${ROLE_LABEL[invite.role]})`);
    announce(`Invitation recorded for ${email}.`);
    setInvite(null);
  };

  const changeRole = (m: TeamMember, role: TeamRole) => {
    const admins = team.filter((x) => x.role === 'admin' && x.status === 'active');
    if (m.role === 'admin' && role !== 'admin' && admins.length <= 1) {
      announce('The workspace needs at least one active admin.');
      return;
    }
    setTeam((prev) => prev.map((x) => (x.id === m.id ? { ...x, role } : x)));
    logAudit(actor, 'Changed role', `${m.email} → ${ROLE_LABEL[role]}`);
    announce(`${m.name} is now ${ROLE_LABEL[role].toLowerCase()}.`);
  };

  const toggleIntegration = (i: Integration) => {
    setIntegrations((prev) =>
      prev.map((x) => (x.id === i.id ? { ...x, connected: !x.connected, lastSync: !x.connected ? new Date().toISOString() : null } : x))
    );
    logAudit(actor, i.connected ? 'Disconnected integration' : 'Connected integration', i.name);
    announce(i.connected ? `${i.name} disconnected.` : `${i.name} marked as connected in this preview. Live connections need server credentials.`);
  };

  const setSecurityValue = <K extends keyof typeof security>(key: K, value: (typeof security)[K], label: string) => {
    setSecurity((prev) => ({ ...prev, [key]: value }));
    logAudit(actor, 'Changed security setting', label);
    announce(`${label} saved.`);
  };

  const createKey = () => {
    if (!newKey) return;
    if (newKey.name.trim().length < 3) {
      setNewKey({ ...newKey, error: 'Give the key a descriptive name.' });
      return;
    }
    const secret = randomKey();
    setKeys((prev) => [
      { id: newId('key'), name: newKey.name.trim(), prefix: secret.slice(0, 13), scope: newKey.scope, created: new Date().toISOString(), lastUsed: null },
      ...prev,
    ]);
    logAudit(actor, 'Created API key', newKey.name.trim());
    setNewKey({ ...newKey, error: '', secret });
  };

  const saveWebhook = () => {
    let valid = false;
    try {
      valid = new URL(webhook).protocol === 'https:';
    } catch {
      valid = false;
    }
    if (!valid) {
      setWebhookError('Use a full https:// address.');
      return;
    }
    setWebhookError('');
    logAudit(actor, 'Updated webhook', new URL(webhook).host);
    announce('Webhook address saved.');
  };

  const actors = useMemo(() => Array.from(new Set(audit.map((a) => a.actor))).sort(), [audit]);
  const auditRows = useMemo(() => {
    const q = auditQuery.trim().toLowerCase();
    return audit.filter(
      (a) =>
        (auditActor === 'all' || a.actor === auditActor) &&
        (!q || a.action.toLowerCase().includes(q) || a.target.toLowerCase().includes(q))
    );
  }, [audit, auditQuery, auditActor]);

  const exportWorkspace = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      organisation: savedOrg,
      employees,
      consultations,
      documents: documents.map(({ fileUrl: _fileUrl, ...rest }) => rest),
      team,
      audit,
    };
    downloadFile(`naviar-workspace-${toDateInputValue(new Date())}.json`, JSON.stringify(payload, null, 2), 'application/json');
    logAudit(actor, 'Exported workspace data', 'JSON');
    announce('Workspace data exported.');
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      announce('Copied to clipboard.');
    } catch {
      announce('Copy failed — select the text and copy it manually.');
    }
  };

  const panel = () => {
    switch (tab) {
      case 'general':
        return (
          <Section title="Organisation" description="Shown on invitations, exports and calendar invites.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Organisation name" htmlFor="org-name">
                <input id="org-name" className="input-base" value={org.name} onChange={(e) => setOrg({ ...org, name: e.target.value })} />
              </Field>
              <Field label="Organisation number" htmlFor="org-number">
                <input id="org-number" className="input-base" value={org.orgNumber} onChange={(e) => setOrg({ ...org, orgNumber: e.target.value })} />
              </Field>
              <SelectField
                label="Time zone"
                value={org.timezone}
                onChange={(v) => setOrg({ ...org, timezone: v })}
                options={[
                  { value: 'Europe/Oslo', label: 'Europe/Oslo (CET)' },
                  { value: 'Europe/Istanbul', label: 'Europe/Istanbul (TRT)' },
                  { value: 'Europe/London', label: 'Europe/London (GMT)' },
                  { value: 'UTC', label: 'UTC' },
                ]}
              />
              <SelectField
                label="Default language"
                value={org.language}
                onChange={(v) => setOrg({ ...org, language: v })}
                options={[
                  { value: 'nb', label: 'Norsk (bokmål)' },
                  { value: 'en', label: 'English' },
                  { value: 'tr', label: 'Türkçe' },
                ]}
              />
              <SelectField
                label="Date format"
                value={org.dateFormat}
                onChange={(v) => setOrg({ ...org, dateFormat: v })}
                options={[
                  { value: 'dd.mm.yyyy', label: '31.12.2026' },
                  { value: 'yyyy-mm-dd', label: '2026-12-31' },
                  { value: 'd mmm yyyy', label: '31 Dec 2026' },
                ]}
              />
            </div>
            <div className="mt-5 flex items-center justify-end gap-2 border-t border-line pt-4">
              {orgDirty ? <span className="mr-auto text-xs text-muted">Unsaved changes</span> : null}
              <button type="button" className="btn-outline" disabled={!orgDirty} onClick={() => setOrg(savedOrg)}>
                Discard
              </button>
              <button type="button" className="btn-primary" disabled={!orgDirty || !org.name.trim()} onClick={saveOrg}>
                Save changes
              </button>
            </div>
          </Section>
        );

      case 'users':
        return (
          <div className="space-y-6">
            <Section title="People with access" description="Invite colleagues and choose what they can do.">
              <div className="mb-3 flex justify-end">
                <button type="button" className="btn-primary" onClick={() => setInvite({ name: '', email: '', role: 'consultant', error: '' })}>
                  <Plus size={16} aria-hidden="true" /> Invite user
                </button>
              </div>
              <ul className="divide-y divide-line rounded border border-line">
                {team.map((m) => (
                  <li key={m.id} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <Avatar name={m.name} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {m.name} {m.status === 'invited' ? <Badge tone="brass">Invited</Badge> : null}
                        </p>
                        <p className="truncate text-xs text-muted">
                          {m.email} · {m.lastActive ? `active ${relativeTime(m.lastActive, now)}` : 'not signed in yet'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <SelectField
                        label={`Role for ${m.name}`}
                        hideLabel
                        value={m.role}
                        onChange={(v) => changeRole(m, v as TeamRole)}
                        options={ROLES.map((r) => ({ value: r, label: ROLE_LABEL[r] }))}
                      />
                      <button type="button" className="btn-ghost" onClick={() => setRemoveMember(m)} disabled={m.email === user?.email}>
                        <Trash2 size={16} aria-hidden="true" />
                        <span className="sr-only">Remove {m.name}</span>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </Section>
            <Section title="Roles and permissions" description="Fixed role definitions. Consultation notes are limited to consultants and admins.">
              <div className="overflow-x-auto">
                <table className="table-base">
                  <thead>
                    <tr>
                      <th scope="col">Permission</th>
                      {ROLES.map((r) => (
                        <th key={r} scope="col" className="text-center">
                          {ROLE_LABEL[r]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {PERMISSIONS.map(([label, allowed]) => (
                      <tr key={label}>
                        <th scope="row" className="!bg-white !text-sm !font-normal !normal-case !tracking-normal !text-ink">
                          {label}
                        </th>
                        {ROLES.map((r) => (
                          <td key={r} className="text-center">
                            {allowed.includes(r) ? (
                              <>
                                <Check size={16} aria-hidden="true" className="inline text-primary-500" />
                                <span className="sr-only">Allowed</span>
                              </>
                            ) : (
                              <>
                                <span aria-hidden="true" className="text-muted">—</span>
                                <span className="sr-only">Not allowed</span>
                              </>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          </div>
        );

      case 'integrations':
        return (
          <Section title="Integrations" description="Credentials live on the server (.env). Here you choose which connections the workspace uses.">
            <ul className="grid gap-3 md:grid-cols-2">
              {integrations.map((i) => (
                <li key={i.id} className="flex flex-col rounded border border-line p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium">{i.name}</p>
                      <p className="text-sm text-muted">{i.purpose}</p>
                    </div>
                    <Badge tone={i.connected ? 'green' : 'muted'}>{i.connected ? 'Connected' : 'Not connected'}</Badge>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-2">
                    <span className="text-xs text-muted">{i.lastSync ? `Last sync ${relativeTime(i.lastSync, new Date())}` : ' '}</span>
                    <button type="button" className={i.connected ? 'btn-outline btn-sm' : 'btn-primary btn-sm'} onClick={() => toggleIntegration(i)}>
                      {i.connected ? 'Disconnect' : 'Connect'}<span className="sr-only"> {i.name}</span>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </Section>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <Section title="Sign-in policy" description="Stored for review. Enforcement is not connected in this preview.">
              <div className="grid gap-4 sm:grid-cols-3">
                <SelectField
                  label="Minimum password length"
                  value={security.minLength}
                  onChange={(v) => setSecurityValue('minLength', v, `Minimum password length: ${v}`)}
                  options={['8', '10', '12', '14'].map((n) => ({ value: n, label: `${n} characters` }))}
                />
                <SelectField
                  label="Sign out after inactivity"
                  value={security.timeout}
                  onChange={(v) => setSecurityValue('timeout', v, `Session timeout: ${v} minutes`)}
                  options={['15', '30', '60', '240'].map((n) => ({ value: n, label: `${n} minutes` }))}
                />
                <SelectField
                  label="Lock account after"
                  value={security.lockout}
                  onChange={(v) => setSecurityValue('lockout', v, `Lockout after ${v} failed attempts`)}
                  options={['3', '5', '10'].map((n) => ({ value: n, label: `${n} failed attempts` }))}
                />
              </div>
              <div className="mt-4 divide-y divide-line border-t border-line">
                <Switch
                  label="Require two-step verification"
                  description="Everyone signs in with a code from an authenticator app."
                  checked={security.require2fa}
                  onChange={(v) => setSecurityValue('require2fa', v, `Two-step verification ${v ? 'required' : 'optional'}`)}
                />
                <Switch
                  label="Single sign-on (SAML)"
                  description="Let people sign in with the organisation's identity provider."
                  checked={security.sso}
                  onChange={(v) => setSecurityValue('sso', v, `Single sign-on ${v ? 'on' : 'off'}`)}
                />
              </div>
            </Section>
            <Section title="Your active sessions">
              <ul className="divide-y divide-line rounded border border-line">
                {sessions.map((s) => (
                  <li key={s.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                    {s.device.includes('iPhone') ? (
                      <Smartphone size={18} aria-hidden="true" className="text-muted" />
                    ) : (
                      <Monitor size={18} aria-hidden="true" className="text-muted" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">
                        {s.device} {s.current ? <Badge tone="green">This device</Badge> : null}
                      </p>
                      <p className="text-xs text-muted">
                        {s.place} · {s.current ? 'now' : relativeTime(s.lastSeen, now)}
                      </p>
                    </div>
                    {!s.current ? (
                      <button
                        type="button"
                        className="btn-outline btn-sm"
                        onClick={() => {
                          setSessions((prev) => prev.filter((x) => x.id !== s.id));
                          logAudit(actor, 'Signed out session', s.device);
                          announce(`${s.device} signed out.`);
                        }}
                      >
                        Sign out<span className="sr-only"> {s.device}</span>
                      </button>
                    ) : null}
                  </li>
                ))}
              </ul>
            </Section>
          </div>
        );

      case 'notifications':
        return (
          <Section title="Notifications" description="Choose how you hear about activity. Applies to your account only.">
            <div className="overflow-x-auto">
              <table className="table-base">
                <thead>
                  <tr>
                    <th scope="col">Event</th>
                    <th scope="col" className="text-center">Email</th>
                    <th scope="col" className="text-center">In app</th>
                  </tr>
                </thead>
                <tbody>
                  {NOTIFICATION_EVENTS.map(([key, label, help]) => (
                    <tr key={key}>
                      <td>
                        <p className="font-medium">{label}</p>
                        <p className="text-xs text-muted">{help}</p>
                      </td>
                      {(['email', 'app'] as const).map((channel) => (
                        <td key={channel} className="text-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 accent-primary-600"
                            aria-label={`${label} by ${channel === 'email' ? 'email' : 'in-app notification'}`}
                            checked={notify[key][channel]}
                            onChange={(e) => {
                              setNotify((prev) => ({ ...prev, [key]: { ...prev[key], [channel]: e.target.checked } }));
                              announce('Notification preference saved.');
                            }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        );

      case 'api':
        return (
          <div className="space-y-6">
            <Section title="API keys" description="Keys are created here and shown once. Key checks are not connected in this preview.">
              <div className="mb-3 flex justify-end">
                <button type="button" className="btn-primary" onClick={() => setNewKey({ name: '', scope: 'read', error: '', secret: null })}>
                  <Plus size={16} aria-hidden="true" /> Create key
                </button>
              </div>
              {keys.length === 0 ? (
                <EmptyState icon={<KeyRound size={28} />} title="No API keys" />
              ) : (
                <ul className="divide-y divide-line rounded border border-line">
                  {keys.map((k) => (
                    <li key={k.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">
                          {k.name} <Badge tone={k.scope === 'read' ? 'neutral' : 'brass'}>{k.scope === 'read' ? 'Read' : 'Read & write'}</Badge>
                        </p>
                        <p className="font-mono text-xs text-muted">
                          {k.prefix}… · created {relativeTime(k.created, now)} · {k.lastUsed ? `used ${relativeTime(k.lastUsed, now)}` : 'never used'}
                        </p>
                      </div>
                      <button type="button" className="btn-outline btn-sm text-danger-700" onClick={() => setRevokeKey(k)}>
                        Revoke<span className="sr-only"> {k.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Section>
            <Section title="Webhook" description="Saved for later use. Events are not sent in this preview.">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
                <div className="flex-1">
                  <label htmlFor="webhook" className="sr-only">
                    Webhook URL
                  </label>
                  <input
                    id="webhook"
                    type="url"
                    className="input-base"
                    placeholder="https://example.com/hooks/naviar"
                    value={webhook}
                    aria-invalid={webhookError ? true : undefined}
                    aria-describedby={webhookError ? 'webhook-error' : undefined}
                    onChange={(e) => setWebhook(e.target.value)}
                  />
                  {webhookError ? (
                    <p id="webhook-error" className="field-error">
                      {webhookError}
                    </p>
                  ) : null}
                </div>
                <button type="button" className="btn-outline" onClick={saveWebhook} disabled={!webhook.trim()}>
                  Save
                </button>
              </div>
            </Section>
          </div>
        );

      case 'audit':
        return (
          <Section title="Audit log" description="Every change in this workspace, newest first.">
            <div className="mb-3 flex flex-col gap-3 sm:flex-row">
              <SearchField value={auditQuery} onChange={setAuditQuery} label="Search audit log" placeholder="Search action or target" />
              <SelectField
                label="Person"
                hideLabel
                value={auditActor}
                onChange={setAuditActor}
                options={[{ value: 'all', label: 'Everyone' }, ...actors.map((a) => ({ value: a, label: a }))]}
              />
              <button
                type="button"
                className="btn-outline"
                onClick={() => {
                  downloadFile(
                    `audit-log-${toDateInputValue(new Date())}.csv`,
                    toCsv(['Time', 'Person', 'Action', 'Target'], auditRows.map((a) => [a.date, a.actor, a.action, a.target])),
                    'text/csv'
                  );
                  announce(`Exported ${auditRows.length} audit entries.`);
                }}
              >
                <Download size={16} aria-hidden="true" /> Export
              </button>
            </div>
            {auditRows.length === 0 ? (
              <EmptyState icon={<ScrollText size={28} />} title="No entries match" />
            ) : (
              <ol className="divide-y divide-line rounded border border-line">
                {auditRows.slice(0, 50).map((a) => (
                  <li key={a.id} className="flex flex-col gap-0.5 px-4 py-2.5 text-sm sm:flex-row sm:items-center sm:gap-4">
                    <span className="w-40 shrink-0 text-xs tabular-nums text-muted">{formatDateTime(a.date)}</span>
                    <span className="min-w-0 flex-1">
                      <span className="font-medium">{a.actor}</span> <span className="text-ink-soft">{a.action.toLowerCase()}</span>{' '}
                      <span className="break-words text-muted">· {a.target}</span>
                    </span>
                  </li>
                ))}
              </ol>
            )}
            {auditRows.length > 50 ? <p className="mt-2 text-xs text-muted">Showing the latest 50 of {auditRows.length}. Export for the full log.</p> : null}
          </Section>
        );

      case 'data':
        return (
          <div className="space-y-6">
            <Section title="Export" description="Download everything in this workspace as one JSON file.">
              <button type="button" className="btn-outline" onClick={exportWorkspace}>
                <Download size={16} aria-hidden="true" /> Export workspace data
              </button>
            </Section>
            <Section title="Retention" description="How long consultation notes should be kept after the consultation date. Not enforced in this preview.">
              <SelectField
                label="Keep consultation notes for"
                value={retention}
                onChange={(v) => {
                  setRetention(v);
                  logAudit(actor, 'Changed retention', `Consultation notes: ${v} months`);
                  announce(`Retention set to ${v} months.`);
                }}
                options={['12', '24', '36'].map((n) => ({ value: n, label: `${n} months` }))}
                className="max-w-xs"
              />
            </Section>
            <section className="rounded border border-danger-200 bg-danger-50 p-5">
              <h3 className="font-display text-base font-semibold text-danger-700">Delete all workspace data</h3>
              <p className="mt-1 max-w-reading text-sm text-ink-soft">
                Removes every employee, consultation and document from this workspace. Users, settings and the audit log stay.
              </p>
              <button type="button" className="btn-danger mt-4" onClick={() => setWipeOpen(true)}>
                <Trash2 size={16} aria-hidden="true" /> Delete data…
              </button>
            </section>
          </div>
        );
    }
  };

  return (
    <AppShell eyebrow="Workspace" title="Settings" description="Organisation details, access, integrations, security and data handling.">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
        <div className="min-w-0">
          <div
            role="tablist"
            aria-label="Settings sections"
            aria-orientation="vertical"
            className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible"
          >
            {TABS.map((t, i) => (
              <button
                key={t.id}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`tab-${t.id}`}
                aria-selected={tab === t.id}
                aria-controls={tab === t.id ? `panel-${t.id}` : undefined}
                tabIndex={tab === t.id ? 0 : -1}
                onClick={() => setTab(t.id)}
                onKeyDown={(e) => onTabKey(e, i)}
                className={`flex shrink-0 items-center gap-2 rounded px-3 py-2 text-left text-sm transition-colors duration-fast ${
                  tab === t.id ? 'bg-primary-600 text-white' : 'text-ink-soft hover:bg-mist'
                }`}
              >
                <t.icon size={16} aria-hidden="true" />
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} tabIndex={0} className="min-w-0">
          {panel()}
        </div>
      </div>

      <Modal
        open={invite !== null}
        title="Invite user"
        description="The invitation is recorded here; email sending is not connected in this preview."
        size="sm"
        onClose={() => setInvite(null)}
        footer={
          <>
            <button type="button" className="btn-outline" onClick={() => setInvite(null)}>
              Cancel
            </button>
            <button type="button" className="btn-primary" onClick={submitInvite}>
              Send invitation
            </button>
          </>
        }
      >
        {invite ? (
          <div className="space-y-4">
            <Field label="Name" htmlFor="inv-name">
              <input id="inv-name" className="input-base" value={invite.name} onChange={(e) => setInvite({ ...invite, name: e.target.value, error: '' })} />
            </Field>
            <Field label="Email" htmlFor="inv-email">
              <input id="inv-email" type="email" className="input-base" value={invite.email} onChange={(e) => setInvite({ ...invite, email: e.target.value, error: '' })} />
            </Field>
            <SelectField label="Role" value={invite.role} onChange={(v) => setInvite({ ...invite, role: v as TeamRole })} options={ROLES.map((r) => ({ value: r, label: ROLE_LABEL[r] }))} />
            {invite.error ? <p className="field-error">{invite.error}</p> : null}
          </div>
        ) : null}
      </Modal>

      <Modal
        open={newKey !== null}
        title={newKey?.secret ? 'Copy your new key' : 'Create API key'}
        size="sm"
        onClose={() => setNewKey(null)}
        footer={
          newKey?.secret ? (
            <button type="button" className="btn-primary" onClick={() => setNewKey(null)}>
              I have stored it
            </button>
          ) : (
            <>
              <button type="button" className="btn-outline" onClick={() => setNewKey(null)}>
                Cancel
              </button>
              <button type="button" className="btn-primary" onClick={createKey}>
                Create
              </button>
            </>
          )
        }
      >
        {newKey ? (
          newKey.secret ? (
            <div className="space-y-3">
              <p className="text-sm text-ink-soft">This is the only time the full key is shown. Store it in your secret manager.</p>
              <div className="flex items-center gap-2 rounded border border-line bg-paper p-2">
                <code className="min-w-0 flex-1 break-all font-mono text-xs">{newKey.secret}</code>
                <button type="button" className="btn-ghost btn-sm" onClick={() => newKey.secret && copy(newKey.secret)}>
                  <Copy size={14} aria-hidden="true" />
                  <span className="sr-only">Copy key</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Field label="Name" htmlFor="key-name" error={newKey.error || undefined}>
                <input
                  id="key-name"
                  className="input-base"
                  placeholder="e.g. Payroll sync"
                  value={newKey.name}
                  onChange={(e) => setNewKey({ ...newKey, name: e.target.value, error: '' })}
                />
              </Field>
              <SelectField
                label="Access"
                value={newKey.scope}
                onChange={(v) => setNewKey({ ...newKey, scope: v as 'read' | 'read-write' })}
                options={[
                  { value: 'read', label: 'Read only' },
                  { value: 'read-write', label: 'Read and write' },
                ]}
              />
            </div>
          )
        ) : null}
      </Modal>

      <ConfirmDialog
        open={revokeKey !== null}
        title="Revoke API key?"
        message={revokeKey ? `Revoking “${revokeKey.name}” removes it from this list.` : ''}
        confirmLabel="Revoke key"
        onConfirm={() => {
          if (!revokeKey) return;
          setKeys((prev) => prev.filter((k) => k.id !== revokeKey.id));
          logAudit(actor, 'Revoked API key', revokeKey.name);
          announce('API key revoked.');
        }}
        onClose={() => setRevokeKey(null)}
      />

      <ConfirmDialog
        open={removeMember !== null}
        title="Remove access?"
        message={removeMember ? `${removeMember.name} can no longer sign in to this workspace.` : ''}
        confirmLabel="Remove"
        onConfirm={() => {
          if (!removeMember) return;
          const activeAdmins = team.filter((x) => x.role === 'admin' && x.status === 'active');
          if (removeMember.role === 'admin' && activeAdmins.length <= 1) {
            announce('The workspace needs at least one active admin.');
            return;
          }
          setTeam((prev) => prev.filter((m) => m.id !== removeMember.id));
          logAudit(actor, 'Removed user', removeMember.email);
          announce(`${removeMember.name} removed.`);
        }}
        onClose={() => setRemoveMember(null)}
      />

      <Modal
        open={wipeOpen}
        title="Delete all workspace data?"
        size="sm"
        onClose={() => {
          setWipeOpen(false);
          setWipeText('');
        }}
        footer={
          <>
            <button
              type="button"
              className="btn-outline"
              onClick={() => {
                setWipeOpen(false);
                setWipeText('');
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-danger"
              disabled={wipeText !== savedOrg.name}
              onClick={() => {
                setEmployees([]);
                setConsultations([]);
                setDocuments([]);
                logAudit(actor, 'Deleted workspace data', 'Employees, consultations, documents');
                announce('Workspace data deleted. Reload the page to restore the sample data.');
                setWipeOpen(false);
                setWipeText('');
              }}
            >
              Delete everything
            </button>
          </>
        }
      >
        <Field label={`Type “${savedOrg.name}” to confirm`} htmlFor="wipe-confirm">
          <input id="wipe-confirm" className="input-base" value={wipeText} onChange={(e) => setWipeText(e.target.value)} autoComplete="off" />
        </Field>
      </Modal>
    </AppShell>
  );
}
