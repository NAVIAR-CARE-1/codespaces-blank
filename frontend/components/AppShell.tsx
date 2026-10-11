'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BarChart3, Calendar, FileText, LayoutDashboard, LogOut, Menu, Settings, Users, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Avatar } from '@/components/ui';
import { Logo } from '@/components/Logo';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/employees', label: 'Employees', icon: Users },
  { href: '/consultations', label: 'Consultations', icon: Calendar },
  { href: '/documents', label: 'Documents', icon: FileText },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
] as const;

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <ul className="space-y-0.5">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <li key={href}>
            <Link
              href={href}
              {...(onNavigate ? { onClick: onNavigate } : {})}
              aria-current={active ? 'page' : undefined}
              className={`relative flex items-center gap-3 rounded px-3 py-2 text-sm transition-colors duration-fast ${
                active ? 'bg-mist font-medium text-primary-700' : 'text-muted hover:bg-mist hover:text-ink'
              }`}
            >
              {active ? <span aria-hidden="true" className="absolute inset-y-1.5 left-0 w-0.5 bg-accent-500" /> : null}
              <Icon size={18} aria-hidden="true" />
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function AppShell({
  eyebrow,
  title,
  description,
  actions,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout, restoreSession } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [checked, setChecked] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated) restoreSession();
    const t = setTimeout(() => setChecked(true), 150);
    return () => clearTimeout(t);
  }, [isAuthenticated, restoreSession]);

  useEffect(() => {
    if (checked && !isAuthenticated) router.replace('/auth/login');
  }, [checked, isAuthenticated, router]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        menuButton.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);


  if (!mounted || !isAuthenticated) {
    return (
      <main id="main" className="flex min-h-screen items-center justify-center bg-paper">
        <p className="text-sm text-muted">
          Loading workspace…
        </p>
      </main>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const userBlock = (
    <div className="flex items-center gap-3">
      <Avatar name={user?.name ?? 'User'} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">{user?.name}</p>
        <p className="text-xs capitalize text-muted">{user?.role}</p>
      </div>
      <button type="button" onClick={handleLogout} className="btn-ghost">
        <LogOut size={16} aria-hidden="true" />
        <span className="sr-only">Sign out</span>
      </button>
    </div>
  );

  return (
    <>
      <div className="min-h-screen bg-paper lg:flex">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-white lg:sticky lg:top-0 lg:flex lg:h-screen">
          <div className="border-b border-line px-5 py-5">
            <Link href="/dashboard" className="block w-40">
              <Logo width={160} className="h-auto w-full" />
            </Link>
          </div>
          <nav aria-label="Main" className="flex-1 overflow-y-auto px-3 py-4">
            <NavLinks pathname={pathname} />
          </nav>
          <div className="border-t border-line p-4">{userBlock}</div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-[80] border-b border-line bg-white/95 backdrop-blur lg:hidden">
            <div className="flex items-center justify-between px-4 py-3">
              <Link href="/dashboard" className="block w-32">
                <Logo width={128} className="h-auto w-full" />
              </Link>
              <button
                ref={menuButton}
                type="button"
                className="btn-ghost"
                aria-expanded={menuOpen}
                aria-controls="mobile-nav"
                onClick={() => setMenuOpen((o) => !o)}
              >
                {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
                <span className="sr-only">{menuOpen ? 'Close menu' : 'Open menu'}</span>
              </button>
            </div>
            {menuOpen ? (
              <nav id="mobile-nav" aria-label="Main" className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-line px-3 py-3">
                <NavLinks pathname={pathname} onNavigate={() => setMenuOpen(false)} />
                <div className="mt-3 border-t border-line px-1 pt-3">{userBlock}</div>
              </nav>
            ) : null}
          </header>

          <main id="main" className="container-base py-8 lg:py-10">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded bg-accent-100 px-2 py-0.5 text-xs font-medium text-accent-800">Demo workspace</span>
              <span className="text-xs text-muted">Sample data — changes last until the page is reloaded.</span>
            </div>
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="min-w-0">
                {eyebrow ? <p className="eyebrow mb-2">{eyebrow}</p> : null}
                <h1 className="text-[clamp(1.75rem,3vw,2.25rem)]">{title}</h1>
                {description ? <p className="mt-2 max-w-reading text-muted">{description}</p> : null}
              </div>
              {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
            </div>
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
