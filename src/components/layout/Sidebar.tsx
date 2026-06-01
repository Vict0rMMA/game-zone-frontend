'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { href: '/dashboard', label: '📊 Dashboard', roles: ['ADMIN', 'USER'] },
  { href: '/products', label: '📦 Productos', roles: ['ADMIN', 'USER'] },
  { href: '/categories', label: '🏷️ Categorías', roles: ['ADMIN', 'USER'] },
  { href: '/admin', label: '⚙️ Panel Admin', roles: ['ADMIN'] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside className="w-56 bg-gray-50 border-r min-h-full py-6">
      <nav className="flex flex-col gap-1 px-3">
        {navItems
          .filter(item => user && item.roles.includes(user.role))
          .map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname.startsWith(item.href)
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              {item.label}
            </Link>
          ))}
      </nav>
    </aside>
  );
}
