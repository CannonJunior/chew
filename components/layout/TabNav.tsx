'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const tabs = [
  { href: '/pantry',   label: 'Pantry',   emoji: '🥦' },
  { href: '/wiki',     label: 'Wiki',     emoji: '📖' },
  { href: '/recipes',  label: 'Recipes',  emoji: '🍳' },
  { href: '/kitchen',  label: 'Kitchen',  emoji: '🏠' },
  { href: '/social',   label: 'Social',   emoji: '📱' },
  { href: '/yes-chef', label: 'Yes Chef', emoji: '👨‍🍳' },
];

export function TabNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex h-14 items-center gap-1">
          {/* Logo */}
          <Link href="/pantry" className="mr-4 flex items-center gap-2 font-bold text-lg">
            <span>🥦</span>
            <span>chew</span>
          </Link>

          {/* Nav tabs */}
          <nav className="flex items-center gap-0.5 flex-1">
            {tabs.map((tab) => {
              const isActive = pathname.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <span>{tab.emoji}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Settings */}
          <Link
            href="/settings"
            className="text-muted-foreground hover:text-foreground p-2 rounded-md hover:bg-muted transition-colors"
            title="Settings"
          >
            ⚙️
          </Link>
        </div>
      </div>
    </header>
  );
}
