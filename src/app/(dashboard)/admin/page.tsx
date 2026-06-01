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
        <div className="rounded-xl p-6" style={{ background: 'rgba(0,230,118,0.06)', border: '1px solid rgba(0,230,118,0.2)' }}>
          <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--muted)' }}>Usuario actual</div>
          <div className="text-xl font-black" style={{ color: 'var(--text)' }}>{user?.name}</div>
          <div className="text-sm mt-1" style={{ color: 'var(--muted)' }}>{user?.email}</div>
          <span className="mt-2 inline-block text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(0,230,118,0.15)', color: 'var(--accent)', border: '1px solid rgba(0,230,118,0.25)' }}>{user?.role}</span>
        </div>
        <div className="rounded-xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--muted)' }}>Acceso</div>
          <div className="text-xl font-black" style={{ color: 'var(--accent)' }}>✓ Administrador</div>
          <p className="text-xs mt-2" style={{ color: 'var(--muted)' }}>Puedes crear, editar y eliminar productos y categorías.</p>
        </div>
      </div>

      <div className="rounded-xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h2 className="font-bold uppercase tracking-wider text-sm mb-4" style={{ color: 'var(--muted)' }}>Información del sistema</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div style={{ color: 'var(--muted)' }}>Versión</div><div>1.0.0</div>
          <div style={{ color: 'var(--muted)' }}>Backend</div><div>Node.js + Express + TypeScript</div>
          <div style={{ color: 'var(--muted)' }}>Frontend</div><div>Next.js 14 + TypeScript</div>
          <div style={{ color: 'var(--muted)' }}>Base de datos</div><div>PostgreSQL + Prisma ORM</div>
          <div style={{ color: 'var(--muted)' }}>Autenticación</div><div>JWT + bcrypt</div>
          <div style={{ color: 'var(--muted)' }}>Arquitectura</div><div>Clean Architecture</div>
        </div>
      </div>
    </div>
  );
}
