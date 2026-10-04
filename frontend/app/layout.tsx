import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { Providers } from '@/components/layout/Provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'NAVIAR CONSULT - Employee Consultation Platform',
  description: 'Professional consultation and HR management platform',
  viewport: 'width=device-width, initial-scale=1'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans">
        <Providers>
          <div className="min-h-screen">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
