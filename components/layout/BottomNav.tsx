'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, BarChart3, User, Users, TrendingUp, Settings } from 'lucide-react';

interface BottomNavProps {
  role: 'representative' | 'leader';
}

export function BottomNav({ role }: BottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = {
    representative: [
      { href: '/representative', icon: Home, label: "Lead'ler" },
      { href: '/representative/dashboard', icon: BarChart3, label: 'Performans' },
      { href: '/representative/profile', icon: User, label: 'Profil' },
    ],
    leader: [
      { href: '/leader', icon: Users, label: 'Ekip' },
      { href: '/leader/dashboard', icon: BarChart3, label: 'Performans' },
      { href: '/leader/profile', icon: User, label: 'Profil' },
      { href: '/leader/settings', icon: Settings, label: 'Ayarlar' },
    ],
  };

  const items = navItems[role];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-20 safe-area-bottom">
      <div className={`grid ${role === 'leader' ? 'grid-cols-4' : 'grid-cols-3'} gap-1 px-2 py-2`}>
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl transition-all active:scale-95 ${
                isActive
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className={`text-xs ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
