'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="bg-white border-b px-6 py-3 flex items-center justify-between">
      <Link href="/dashboard" className="font-bold text-indigo-600 text-lg">
        📦 Inventario
      </Link>
      <div className="flex items-center gap-4">
        {user && (
          <>
            <span className="text-sm text-gray-600">
              {user.name}
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${user.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>
                {user.role}
              </span>
            </span>
            <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-600 transition-colors">
              Cerrar sesión
            </button>
          </>
        )}
      </div>
    </header>
  );
}
