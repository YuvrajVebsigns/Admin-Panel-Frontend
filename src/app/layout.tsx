import type { Metadata } from 'next';
import { Roboto, Open_Sans } from 'next/font/google';
import './globals.css';
import 'flatpickr/dist/flatpickr.css';
import QueryProvider from '@/providers/QueryProvider';
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToasterProvider } from '@/components/providers/ToasterProvider';
import { ModalProvider } from '@/context/ModalContext';
import { GlobalModal } from '@/components/ui/modal/GlobalModal';

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-roboto',
  display: 'swap',
});

const openSans = Open_Sans({
  subsets: ['latin'],
  variable: '--font-open-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Core Media Admin',
  description: 'Core Media Administration Dashboard — Manage users, media, and system settings.',
  keywords: ['admin', 'dashboard', 'core media', 'management'],
  robots: 'noindex, nofollow',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${roboto.variable} ${openSans.variable}`}>
      <body className={`${openSans.className} dark:bg-gray-900`}>
        <ToasterProvider />
        <ModalProvider>
          <ThemeProvider>
            <SidebarProvider>
              <QueryProvider>{children}</QueryProvider>
            </SidebarProvider>
          </ThemeProvider>
          <GlobalModal />
        </ModalProvider>
      </body>
    </html>
  );
}
