import ThemeTogglerTwo from '@/components/common/ThemeTogglerTwo';
import { ThemeProvider } from '@/context/ThemeContext';
import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <ThemeProvider>
        <div className="relative min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4 sm:p-6">
          <div className="w-full relative z-1">{children}</div>
          <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
            <ThemeTogglerTwo />
          </div>
        </div>
      </ThemeProvider>
    </div>
  );
}
