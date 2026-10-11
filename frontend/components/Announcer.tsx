'use client';

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';

const AnnounceContext = createContext<(message: string) => void>(() => {});

export function useAnnounce() {
  return useContext(AnnounceContext);
}

// The page's single live region: a visible toast that is also read out by screen readers.
export function AnnouncerProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState('');
  const clearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const announce = useCallback((text: string) => {
    setMessage('');
    requestAnimationFrame(() => setMessage(text));
    if (clearTimer.current) clearTimeout(clearTimer.current);
    clearTimer.current = setTimeout(() => setMessage(''), 5000);
  }, []);

  return (
    <AnnounceContext.Provider value={announce}>
      {children}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={`pointer-events-none fixed bottom-4 right-4 z-[90] max-w-[calc(100vw-2rem)] rounded bg-ink px-4 py-3 text-sm text-paper shadow-lg transition-opacity duration-medium sm:max-w-sm ${
          message ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {message}
      </div>
    </AnnounceContext.Provider>
  );
}
