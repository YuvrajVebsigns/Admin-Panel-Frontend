import AuthThemeToggle from '@/components/auth/AuthThemeToggle';
import { ThemeProvider } from '@/context/ThemeContext';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <div className="min-h-dvh min-w-0 bg-white font-open-sans dark:bg-navy-900 lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <aside
          className="hidden min-h-dvh flex-col justify-between bg-gray-900 p-10 text-white lg:flex xl:p-14"
          aria-label="Core Media"
        >
          <Image
            src="/images/logo/logo-dark.svg"
            alt="Core Media"
            width={240}
            height={72}
            priority
            className="h-14 w-auto self-start"
          />
          <div className="my-16 max-w-md">
            <span className="mb-8 block h-1 w-12 bg-brand-500" aria-hidden="true" />
            <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-navy-300">
              The Core Media workspace
            </p>
            <h2 className="font-roboto text-4xl font-medium leading-tight xl:text-5xl">
              Great stories.
              <br />
              Connected communities.
            </h2>
            <p className="mt-6 max-w-sm text-base leading-relaxed text-navy-300">
              One place to manage your publishing properties, content, and events.
            </p>
          </div>
          <p className="border-t border-white/15 pt-6 text-xs text-navy-300">
            Core Media · Administration
          </p>
        </aside>
        <div className="flex min-w-0 flex-col">
          <header className="flex items-center justify-between gap-4 px-5 py-5 sm:px-10 lg:justify-end">
            <Link
              href="/login"
              aria-label="Core Media sign in"
              className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 lg:hidden"
            >
              <Image
                src="/images/logo/logo.svg"
                alt="Core Media"
                width={180}
                height={54}
                priority
                className="h-10 w-auto dark:hidden"
              />
              <Image
                src="/images/logo/logo-dark.svg"
                alt="Core Media"
                width={180}
                height={54}
                priority
                className="hidden h-10 w-auto dark:block"
              />
            </Link>
            <AuthThemeToggle />
          </header>
          <main className="flex flex-1 items-center px-5 py-8 sm:px-10 sm:py-12 lg:px-14">
            {children}
          </main>
          <footer className="px-5 py-6 text-center text-xs text-gray-500 dark:text-gray-400 sm:px-10">
            Core Media administration workspace
          </footer>
        </div>
      </div>
    </ThemeProvider>
  );
}
