'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { href: '/dashboard', label: '📊 Dashboard', roles: ['ADMIN', 'USER'] },
  { href: '/products', label: '🎮 Catálogo', roles: ['ADMIN', 'USER'] },
  { href: '/categories', label: '🏷️ Géneros', roles: ['ADMIN', 'USER'] },
  { href: '/admin', label: '⚙️ Admin', roles: ['ADMIN'] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside className="w-52 py-6 flex-shrink-0" style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}>
      <nav className="flex flex-col gap-1 px-3">
        {navItems
          .filter(item => user && item.roles.includes(user.role))
          .map(item => {
            const active = pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}
                className="px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={active
                  ? { background: 'rgba(57,255,20,0.12)', color: 'var(--accent)', border: '1px solid rgba(57,255,20,0.2)', boxShadow: '0 0 12px rgba(57,255,20,0.08)' }
                  : { color: 'var(--muted)', border: '1px solid transparent' }}>
                {item.label}
              </Link>
            );
          })}
      </nav>
    </aside>
  );
}
