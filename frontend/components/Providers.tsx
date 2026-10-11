'use client';

import React, { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import { DemoDataProvider } from '@/components/DemoDataProvider';
import { AnnouncerProvider } from '@/components/Announcer';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <DemoDataProvider>
        <AnnouncerProvider>{children}</AnnouncerProvider>
      </DemoDataProvider>
    </Provider>
  );
}
