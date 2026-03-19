import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Geist_Mono } from 'next/font/google';
import './globals.css';
import { TabNav } from '@/components/layout/TabNav';
import { Toaster } from '@/components/ui/sonner';

const bangers = localFont({ src: '../public/Bangers.woff2', variable: '--font-bangers', weight: '400' });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Chew — Food Intelligence',
  description: 'Your personal food intelligence platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${bangers.variable} ${geistMono.variable} antialiased bg-background text-foreground`}>
        <div className="flex flex-col min-h-screen">
          <TabNav />
          <main className="flex-1 container mx-auto px-4 py-6 max-w-7xl">
            {children}
          </main>
        </div>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
