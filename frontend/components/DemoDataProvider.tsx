'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import {
  newId,
  seedAudit,
  seedConsultations,
  seedDocuments,
  seedEmployees,
  seedTeam,
  type AuditEntry,
  type Consultation,
  type DocRecord,
  type Employee,
  type TeamMember,
} from '@/lib/demo-data';

type Setter<T> = (update: T[] | ((prev: T[]) => T[])) => void;

interface DemoDataValue {
  employees: Employee[];
  setEmployees: Setter<Employee>;
  consultations: Consultation[];
  setConsultations: Setter<Consultation>;
  documents: DocRecord[];
  setDocuments: Setter<DocRecord>;
  team: TeamMember[];
  setTeam: Setter<TeamMember>;
  audit: AuditEntry[];
  logAudit: (actor: string, action: string, target: string) => void;
}

const DemoDataContext = createContext<DemoDataValue | null>(null);

function createInitialState() {
  const now = new Date();
  const employees = seedEmployees(now);
  return {
    employees,
    consultations: seedConsultations(employees, now),
    documents: seedDocuments(now),
    team: seedTeam(now),
    audit: seedAudit(now),
  };
}

export function DemoDataProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(createInitialState);
  const [employees, setEmployees] = useState<Employee[]>(initial.employees);
  const [consultations, setConsultations] = useState<Consultation[]>(initial.consultations);
  const [documents, setDocuments] = useState<DocRecord[]>(initial.documents);
  const [team, setTeam] = useState<TeamMember[]>(initial.team);
  const [audit, setAudit] = useState<AuditEntry[]>(initial.audit);

  const logAudit = useCallback((actor: string, action: string, target: string) => {
    setAudit((prev) => [{ id: newId('aud'), date: new Date().toISOString(), actor, action, target }, ...prev]);
  }, []);

  const value = useMemo<DemoDataValue>(
    () => ({
      employees,
      setEmployees,
      consultations,
      setConsultations,
      documents,
      setDocuments,
      team,
      setTeam,
      audit,
      logAudit,
    }),
    [employees, consultations, documents, team, audit, logAudit]
  );

  return <DemoDataContext.Provider value={value}>{children}</DemoDataContext.Provider>;
}

export function useDemoData(): DemoDataValue {
  const ctx = useContext(DemoDataContext);
  if (!ctx) throw new Error('useDemoData must be used inside DemoDataProvider');
  return ctx;
}
