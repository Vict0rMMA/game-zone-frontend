'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { productService } from '@/services/product.service';
import { categoryService } from '@/services/category.service';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ games: 0, genres: 0, stock: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([productService.getAll({ limit: 100 }), categoryService.getAll({ limit: 100 })])
      .then(([prods, cats]) => setStats({ games: prods.meta.total, genres: cats.meta.total, stock: prods.data.reduce((s, p) => s + p.stock, 0) }))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Juegos en catálogo', value: stats.games, icon: '🎮', color: 'var(--accent)', href: '/products' },
    { label: 'Géneros', value: stats.genres, icon: '🏷️', color: 'var(--accent2)', href: '/categories' },
    { label: 'Unidades en stock', value: stats.stock, icon: '📦', color: '#f59e0b', href: '/products' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black uppercase tracking-wider mb-1">Dashboard</h1>
        <p style={{ color: 'var(--muted)' }}>
          Bienvenido de vuelta, <span style={{ color: 'var(--accent)' }}>{user?.name}</span> 👾
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {cards.map(card => (
          <Link key={card.label} href={card.href}
            className="rounded-2xl p-6 transition-all hover:scale-[1.02]"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: `0 0 20px ${card.color}10` }}>
            {loading ? (
              <div className="h-16 rounded-xl animate-pulse" style={{ background: 'var(--surface2)' }} />
            ) : (
              <>
                <div className="text-2xl mb-3">{card.icon}</div>
                <div className="text-4xl font-black mb-1" style={{ color: card.color }}>{card.value}</div>
                <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--muted)' }}>{card.label}</div>
              </>
            )}
          </Link>
        ))}
      </div>

      <div className="rounded-2xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h2 className="font-bold uppercase tracking-wider text-sm mb-4" style={{ color: 'var(--muted)' }}>Acciones rápidas</h2>
        <div className="flex gap-3 flex-wrap">
          <Link href="/products" className="px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wide transition-all"
            style={{ background: 'rgba(57,255,20,0.1)', color: 'var(--accent)', border: '1px solid rgba(57,255,20,0.2)' }}>
            🎮 Ver catálogo
          </Link>
          {user?.role === 'ADMIN' && (
            <>
              <Link href="/products/new" className="px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wide transition-all"
                style={{ background: 'rgba(0,212,255,0.1)', color: 'var(--accent2)', border: '1px solid rgba(0,212,255,0.2)' }}>
                ➕ Agregar juego
              </Link>
              <Link href="/categories" className="px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wide transition-all"
                style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--muted)', border: '1px solid var(--border)' }}>
                🏷️ Gestionar géneros
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
