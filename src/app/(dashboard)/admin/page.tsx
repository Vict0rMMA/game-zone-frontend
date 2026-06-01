'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import { User } from '@/types/auth.types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== 'ADMIN') { router.replace('/dashboard'); return; }
    api.get<{ data: User[] }>('/auth/users').then(r => setUsers(r.data.data)).catch(() => {
      setUsers([user!]);
    }).finally(() => setLoading(false));
  }, [user, router]);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Panel de Administración</h1>
      <p className="text-gray-500 mb-6 text-sm">Vista exclusiva para administradores.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-indigo-600 text-white rounded-xl p-6 shadow">
          <div className="text-sm opacity-75 mb-1">Usuario actual</div>
          <div className="text-xl font-bold">{user?.name}</div>
          <div className="text-sm opacity-75 mt-1">{user?.email}</div>
          <span className="mt-2 inline-block bg-white/20 text-xs px-2 py-0.5 rounded-full">{user?.role}</span>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="text-sm text-gray-500 mb-1">Acceso</div>
          <div className="text-xl font-bold text-green-600">✓ Administrador</div>
          <p className="text-xs text-gray-400 mt-2">Puedes crear, editar y eliminar productos y categorías.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="font-semibold mb-4">Información del sistema</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="text-gray-500">Versión</div><div>1.0.0</div>
          <div className="text-gray-500">Backend</div><div>Node.js + Express + TypeScript</div>
          <div className="text-gray-500">Frontend</div><div>Next.js 14 + TypeScript</div>
          <div className="text-gray-500">Base de datos</div><div>PostgreSQL + Prisma ORM</div>
          <div className="text-gray-500">Autenticación</div><div>JWT + bcrypt</div>
          <div className="text-gray-500">Arquitectura</div><div>Clean Architecture</div>
        </div>
      </div>
    </div>
  );
}
