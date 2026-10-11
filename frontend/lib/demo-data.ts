// Sample records for the demo workspace. Names, numbers and notes are fictional.

export const DEPARTMENTS = [
  'People & Culture',
  'Operations',
  'Finance',
  'Technology',
  'Sales',
  'Customer Service',
] as const;
export type Department = (typeof DEPARTMENTS)[number];

export const LOCATIONS = ['Oslo', 'Bergen', 'Trondheim', 'Stavanger', 'Remote'] as const;
export type Location = (typeof LOCATIONS)[number];

export type EmployeeStatus = 'active' | 'onboarding' | 'inactive';

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  title: string;
  department: Department;
  location: Location;
  status: EmployeeStatus;
  startDate: string;
  manager: string;
}

export const CONSULTATION_TYPES = [
  'Onboarding',
  'Career development',
  'Workplace adaptation',
  'Team dynamics',
  'Leadership coaching',
  'Exit conversation',
] as const;
export type ConsultationType = (typeof CONSULTATION_TYPES)[number];

export type ConsultationStatus = 'scheduled' | 'rescheduled' | 'completed' | 'cancelled';
export type ConsultationMode = 'video' | 'in-person' | 'phone';

export interface ConsultationNote {
  id: string;
  author: string;
  date: string;
  text: string;
}

export interface Consultation {
  id: string;
  type: ConsultationType;
  employeeId: string;
  consultant: string;
  start: string;
  durationMin: number;
  mode: ConsultationMode;
  status: ConsultationStatus;
  location: string;
  notes: ConsultationNote[];
  followUp: string | null;
}

export const CONSULTANTS = ['Ingrid Solberg', 'Emre Kaya', 'Maria Lindqvist', 'Jonas Berg'] as const;

export const DOC_CATEGORIES = ['HR policies', 'Contracts', 'Reports', 'Templates', 'Meeting notes'] as const;
export type DocCategory = (typeof DOC_CATEGORIES)[number];
export type FileKind = 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'image' | 'other';
export type AccessLevel = 'private' | 'team' | 'organization';

export interface DocVersion {
  version: number;
  date: string;
  author: string;
  note: string;
}

export interface DocRecord {
  id: string;
  name: string;
  category: DocCategory;
  kind: FileKind;
  sizeKB: number;
  owner: string;
  uploadedAt: string;
  updatedAt: string;
  tags: string[];
  access: AccessLevel;
  sharedWith: string[];
  versions: DocVersion[];
  starred: boolean;
  archived: boolean;
  fileUrl: string | null;
}

export type TeamRole = 'admin' | 'manager' | 'consultant' | 'employee';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  status: 'active' | 'invited';
  lastActive: string | null;
}

export interface AuditEntry {
  id: string;
  date: string;
  actor: string;
  action: string;
  target: string;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rand: () => number, list: readonly T[]): T {
  const item = list[Math.floor(rand() * list.length)];
  if (item === undefined) throw new Error('pick() on empty list');
  return item;
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/ø/g, 'o')
    .replace(/æ/g, 'ae')
    .replace(/å/g, 'a')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.|\.$/g, '');
}

let idCounter = 0;
export function newId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`;
}

const EMPLOYEE_NAMES = [
  'Anders Haugen', 'Silje Johansen', 'Mehmet Yılmaz', 'Ingeborg Lie', 'Thomas Dahl', 'Ayşe Demir',
  'Lars Eriksen', 'Nora Bakken', 'Kristian Moen', 'Elif Şahin', 'Sofie Andersen', 'Magnus Pedersen',
  'Hanne Larsen', 'Ole Kristiansen', 'Zeynep Arslan', 'Emil Nilsen', 'Ida Hansen', 'Henrik Strand',
  'Camilla Holm', 'Fatma Çelik', 'Martin Lund', 'Tuva Olsen', 'Sindre Vik', 'Maja Halvorsen',
  'Can Öztürk', 'Ragnhild Aas', 'Petter Sæther', 'Linnea Brekke',
];

const TITLES: Record<Department, readonly string[]> = {
  'People & Culture': ['HR Advisor', 'HR Business Partner', 'Recruiter'],
  Operations: ['Operations Coordinator', 'Logistics Planner', 'Facilities Manager'],
  Finance: ['Accountant', 'Financial Controller', 'Payroll Specialist'],
  Technology: ['Software Engineer', 'IT Support Specialist', 'Data Analyst'],
  Sales: ['Account Manager', 'Sales Representative', 'Key Account Lead'],
  'Customer Service': ['Customer Advisor', 'Support Team Lead', 'Service Coordinator'],
};

const MANAGERS: Record<Department, string> = {
  'People & Culture': 'Hilde Rønning',
  Operations: 'Bjørn Iversen',
  Finance: 'Selin Aydın',
  Technology: 'Erik Solheim',
  Sales: 'Mona Fjeld',
  'Customer Service': 'Karim Haddad',
};

const NOTE_TEXTS = [
  'Reviewed goals for the coming quarter and agreed on two concrete next steps.',
  'Discussed workload distribution in the team; manager to follow up on priorities.',
  'Walked through the onboarding plan and introduced key contacts.',
  'Explored interest in the leadership programme; employee drafts a development plan.',
  'Agreed on temporary adjustments to working hours for the next six weeks.',
  'Clarified role expectations after the reorganisation.',
  'Summarised feedback from the team workshop and agreed on actions.',
  'Mapped training needs and shortlisted two relevant courses.',
];

const MEETING_ROOMS = ['Room Fjord', 'Room Vidde', 'Room Kyst', 'Client office'];

function businessHour(rand: () => number, base: Date): Date {
  const d = new Date(base);
  const day = d.getDay();
  if (day === 0) d.setDate(d.getDate() + 1);
  if (day === 6) d.setDate(d.getDate() + 2);
  d.setHours(8 + Math.floor(rand() * 8), rand() < 0.5 ? 0 : 30, 0, 0);
  return d;
}

export function seedEmployees(now: Date = new Date()): Employee[] {
  const rand = mulberry32(7);
  return EMPLOYEE_NAMES.map((name, i) => {
    const department = DEPARTMENTS[i % DEPARTMENTS.length] ?? 'Operations';
    const status: EmployeeStatus = i % 10 === 4 ? 'onboarding' : i % 9 === 8 ? 'inactive' : 'active';
    const start = new Date(now);
    if (status === 'onboarding') start.setDate(start.getDate() - Math.floor(rand() * 45) - 3);
    else start.setDate(start.getDate() - Math.floor(rand() * 2900) - 120);
    return {
      id: `emp-${i + 1}`,
      name,
      email: `${slugify(name)}@example.com`,
      phone: `+47 000 00 ${String(100 + i).padStart(3, '0')}`,
      title: pick(rand, TITLES[department]),
      department,
      location: pick(rand, LOCATIONS),
      status,
      startDate: start.toISOString(),
      manager: MANAGERS[department],
    };
  });
}

export function seedConsultations(employees: Employee[], now: Date = new Date()): Consultation[] {
  const rand = mulberry32(42);
  const list: Consultation[] = [];
  const eligible = employees.filter((e) => e.status !== 'inactive');
  let n = 0;

  const make = (start: Date, past: boolean): Consultation => {
    n += 1;
    const employee = pick(rand, eligible);
    const isOnboarding = employee.status === 'onboarding';
    const type: ConsultationType = isOnboarding ? 'Onboarding' : pick(rand, CONSULTATION_TYPES.slice(1));
    const mode: ConsultationMode = rand() < 0.55 ? 'video' : rand() < 0.75 ? 'in-person' : 'phone';
    const r = rand();
    const status: ConsultationStatus = past
      ? r < 0.88
        ? 'completed'
        : 'cancelled'
      : r < 0.85
        ? 'scheduled'
        : 'rescheduled';
    const consultant = pick(rand, CONSULTANTS);
    const notes: ConsultationNote[] =
      status === 'completed'
        ? [{ id: `note-${n}`, author: consultant, date: start.toISOString(), text: pick(rand, NOTE_TEXTS) }]
        : [];
    const followUpDate = new Date(start);
    followUpDate.setDate(followUpDate.getDate() + 21);
    return {
      id: `con-${n}`,
      type,
      employeeId: employee.id,
      consultant,
      start: start.toISOString(),
      durationMin: pick(rand, [30, 45, 60, 60, 90]),
      mode,
      status,
      location: mode === 'video' ? 'Whereby' : mode === 'phone' ? 'Phone' : pick(rand, MEETING_ROOMS),
      notes,
      followUp: status === 'completed' && rand() < 0.35 ? followUpDate.toISOString() : null,
    };
  };

  for (let m = 11; m >= 0; m -= 1) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const daysInMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();
    const seasonal = m === 6 || m === 7 ? 0.6 : 1;
    const count = Math.round((12 + Math.floor(rand() * 9) + (11 - m) * 0.6) * seasonal);
    for (let k = 0; k < count; k += 1) {
      const day = new Date(monthStart);
      day.setDate(1 + Math.floor(rand() * daysInMonth));
      const start = businessHour(rand, day);
      if (start.getTime() >= now.getTime()) continue;
      list.push(make(start, true));
    }
  }

  for (let k = 0; k < 18; k += 1) {
    const day = new Date(now);
    day.setDate(day.getDate() + 1 + Math.floor(rand() * 30));
    list.push(make(businessHour(rand, day), false));
  }

  return list.sort((a, b) => a.start.localeCompare(b.start));
}

const DOC_SEED: Array<[string, DocCategory, FileKind, string[]]> = [
  ['Employee handbook 2026.pdf', 'HR policies', 'pdf', ['handbook', 'policy']],
  ['Remote work policy.docx', 'HR policies', 'docx', ['policy', 'remote']],
  ['Whistleblowing routine.pdf', 'HR policies', 'pdf', ['policy', 'compliance']],
  ['Code of conduct.pdf', 'HR policies', 'pdf', ['policy']],
  ['Travel and expenses policy.docx', 'HR policies', 'docx', ['policy', 'finance']],
  ['Framework agreement – consulting services.pdf', 'Contracts', 'pdf', ['contract', 'framework']],
  ['Data processing agreement.pdf', 'Contracts', 'pdf', ['contract', 'privacy']],
  ['Employment contract template.docx', 'Contracts', 'docx', ['contract', 'template']],
  ['Non-disclosure agreement.pdf', 'Contracts', 'pdf', ['contract']],
  ['Q2 consultation summary.pdf', 'Reports', 'pdf', ['quarterly', 'summary']],
  ['Q3 consultation summary.pdf', 'Reports', 'pdf', ['quarterly', 'summary']],
  ['Workforce overview 2026.xlsx', 'Reports', 'xlsx', ['workforce', 'data']],
  ['Training needs mapping.xlsx', 'Reports', 'xlsx', ['training']],
  ['Board update – people agenda.pptx', 'Reports', 'pptx', ['board', 'presentation']],
  ['Onboarding checklist.docx', 'Templates', 'docx', ['onboarding', 'checklist']],
  ['Development conversation guide.docx', 'Templates', 'docx', ['career', 'guide']],
  ['Exit conversation guide.docx', 'Templates', 'docx', ['offboarding', 'guide']],
  ['Workshop slides – team dynamics.pptx', 'Templates', 'pptx', ['workshop', 'team']],
  ['Org chart.png', 'Templates', 'image', ['organisation']],
  ['Team workshop – Operations.docx', 'Meeting notes', 'docx', ['workshop', 'operations']],
  ['Leadership forum notes.docx', 'Meeting notes', 'docx', ['leadership']],
  ['Steering group minutes – September.pdf', 'Meeting notes', 'pdf', ['steering group']],
  ['Kick-off notes – Customer Service.docx', 'Meeting notes', 'docx', ['kick-off']],
  ['Retrospective – Technology.docx', 'Meeting notes', 'docx', ['retrospective']],
];

const DOC_OWNERS = ['Ingrid Solberg', 'Emre Kaya', 'Maria Lindqvist', 'Jonas Berg', 'Demo Admin'];
const VERSION_NOTES = ['Initial upload', 'Updated wording', 'Added appendix', 'Reviewed by legal', 'Minor corrections'];

export function seedDocuments(now: Date = new Date()): DocRecord[] {
  const rand = mulberry32(99);
  return DOC_SEED.map(([name, category, kind, tags], i) => {
    const owner = pick(rand, DOC_OWNERS);
    const uploaded = new Date(now);
    uploaded.setDate(uploaded.getDate() - Math.floor(rand() * 300) - 10);
    const versionCount = 1 + Math.floor(rand() * 3);
    const versions: DocVersion[] = [];
    for (let v = 1; v <= versionCount; v += 1) {
      const d = new Date(uploaded);
      d.setDate(d.getDate() + (v - 1) * Math.floor(5 + rand() * 30));
      if (d > now) d.setTime(now.getTime() - 86400000);
      versions.push({
        version: v,
        date: d.toISOString(),
        author: v === 1 ? owner : pick(rand, DOC_OWNERS),
        note: v === 1 ? 'Initial upload' : pick(rand, VERSION_NOTES.slice(1)),
      });
    }
    const last = versions[versions.length - 1];
    const access: AccessLevel = category === 'HR policies' ? 'organization' : rand() < 0.5 ? 'team' : 'private';
    return {
      id: `doc-${i + 1}`,
      name,
      category,
      kind,
      sizeKB: Math.round(kind === 'pptx' ? 2400 + rand() * 6000 : kind === 'image' ? 600 + rand() * 1600 : 80 + rand() * 1400),
      owner,
      uploadedAt: uploaded.toISOString(),
      updatedAt: last ? last.date : uploaded.toISOString(),
      tags,
      access,
      sharedWith: access === 'team' ? ['People & Culture'] : [],
      versions,
      starred: i % 7 === 0,
      archived: i === 21,
      fileUrl: null,
    };
  });
}

export function seedTeam(now: Date = new Date()): TeamMember[] {
  const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600000).toISOString();
  return [
    { id: 'usr-1', name: 'Demo Admin', email: 'demo@example.com', role: 'admin', status: 'active', lastActive: hoursAgo(0) },
    { id: 'usr-2', name: 'Ingrid Solberg', email: 'ingrid.solberg@example.com', role: 'consultant', status: 'active', lastActive: hoursAgo(2) },
    { id: 'usr-3', name: 'Emre Kaya', email: 'emre.kaya@example.com', role: 'consultant', status: 'active', lastActive: hoursAgo(5) },
    { id: 'usr-4', name: 'Maria Lindqvist', email: 'maria.lindqvist@example.com', role: 'consultant', status: 'active', lastActive: hoursAgo(26) },
    { id: 'usr-5', name: 'Jonas Berg', email: 'jonas.berg@example.com', role: 'consultant', status: 'active', lastActive: hoursAgo(50) },
    { id: 'usr-6', name: 'Hilde Rønning', email: 'hilde.ronning@example.com', role: 'manager', status: 'active', lastActive: hoursAgo(8) },
    { id: 'usr-7', name: 'Selin Aydın', email: 'selin.aydin@example.com', role: 'manager', status: 'invited', lastActive: null },
  ];
}

export function seedAudit(now: Date = new Date()): AuditEntry[] {
  const ago = (h: number) => new Date(now.getTime() - h * 3600000).toISOString();
  return [
    { id: 'aud-1', date: ago(1), actor: 'Ingrid Solberg', action: 'Completed consultation', target: 'Career development' },
    { id: 'aud-2', date: ago(3), actor: 'Demo Admin', action: 'Uploaded document', target: 'Q3 consultation summary.pdf' },
    { id: 'aud-3', date: ago(6), actor: 'Emre Kaya', action: 'Booked consultation', target: 'Onboarding' },
    { id: 'aud-4', date: ago(20), actor: 'Demo Admin', action: 'Invited user', target: 'selin.aydin@example.com' },
    { id: 'aud-5', date: ago(28), actor: 'Maria Lindqvist', action: 'Shared document', target: 'Development conversation guide.docx' },
    { id: 'aud-6', date: ago(49), actor: 'Demo Admin', action: 'Changed security setting', target: 'Session timeout: 30 minutes' },
    { id: 'aud-7', date: ago(73), actor: 'Jonas Berg', action: 'Signed in', target: 'Web' },
    { id: 'aud-8', date: ago(98), actor: 'Demo Admin', action: 'Connected integration', target: 'Whereby' },
  ];
}
