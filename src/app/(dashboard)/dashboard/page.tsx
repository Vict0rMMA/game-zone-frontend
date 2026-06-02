'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { productService } from '@/services/product.service';
import { categoryService } from '@/services/category.service';
import Link from 'next/link';
import { Product } from '@/types/product.types';

const FALLBACK = 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=460&auto=format&fit=crop';
const PERIPHERAL_NAMES = ['Teclados', 'Mouse', 'Audífonos', 'Controles', 'Monitores', 'Sillas', 'Micrófonos', 'Webcams', 'Alfombrillas'];

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ games: 0, genres: 0, stock: 0, peripherals: 0 });
  const [recent, setRecent] = useState<Product[]>([]);
  const [lowStock, setLowStock] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      productService.getAll({ limit: 100 }),
      categoryService.getAll({ limit: 100 }),
    ]).then(([prods, cats]) => {
      const games = prods.data.filter(p => !PERIPHERAL_NAMES.includes(p.category.name));
      const peripherals = prods.data.filter(p => PERIPHERAL_NAMES.includes(p.category.name));
      setStats({
        games: prods.meta.total,
        genres: cats.meta.total,
        stock: prods.data.reduce((s, p) => s + p.stock, 0),
        peripherals: peripherals.length,
      });
      setRecent(games.slice(0, 6));
      setLowStock(prods.data.filter(p => p.stock > 0 && p.stock <= 5).slice(0, 4));
    }).finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: 'Juegos en catálogo', value: stats.games, icon: '🎮', color: 'var(--accent)', glow: 'rgba(0,230,118,0.15)', href: '/products' },
    { label: 'Periféricos',        value: stats.peripherals, icon: '🎧', color: 'var(--accent2)', glow: 'rgba(41,121,255,0.15)', href: '/perifericos' },
    { label: 'Géneros / Tipos',    value: stats.genres,      icon: '◈',  color: 'var(--warning)', glow: 'rgba(255,171,0,0.15)', href: '/categories' },
    { label: 'Unidades en stock',  value: stats.stock,       icon: '◉',  color: '#ff6b8a',        glow: 'rgba(255,71,87,0.12)',  href: '/products' },
  ];

  const Skeleton = ({ h = '60px' }: { h?: string }) => (
    <div style={{ height: h, borderRadius: '8px', background: 'var(--surface2)', animation: 'pulse 1.5s infinite' }} />
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Welcome */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '2rem', fontWeight: 700, letterSpacing: '0.03em', marginBottom: '0.25rem' }}>
            Bienvenido, <span style={{ color: 'var(--accent)' }}>{user?.name}</span>
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>
            {user?.role === 'ADMIN' ? '⚡ Panel de administración · GameZone Inventory' : 'Tu panel de control'}
          </p>
        </div>
        {user?.role === 'ADMIN' && (
          <Link href="/products/new" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.65rem 1.25rem', borderRadius: '10px', textDecoration: 'none',
            background: 'var(--accent)', color: '#050806', fontFamily: 'var(--font-head)',
            fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.06em',
            boxShadow: '0 0 20px rgba(0,230,118,0.25)',
          }}>
            + NUEVO JUEGO
          </Link>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '1rem' }}>
        {statCards.map(s => (
          <Link key={s.label} href={s.href} style={{ textDecoration: 'none' }}>
            <div style={{
              borderRadius: '16px', padding: '1.25rem 1.4rem',
              background: 'var(--surface)', border: '1px solid var(--border)',
              boxShadow: `0 0 28px ${s.glow}`,
              transition: 'transform 0.18s, box-shadow 0.18s',
              cursor: 'pointer',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 32px ${s.glow}`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 28px ${s.glow}`; }}>
              {loading ? <Skeleton h="70px" /> : (
                <>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>{s.icon}</div>
                  <div style={{ fontFamily: 'var(--font-head)', fontSize: '2.4rem', fontWeight: 700, color: s.color, lineHeight: 1, marginBottom: '0.3rem' }}>
                    {s.value.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--muted)' }}>{s.label}</div>
                </>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Recent games + low stock row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1.5rem', alignItems: 'start' }}>
        {/* Recent games */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '1rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text2)', textTransform: 'uppercase' }}>
              Últimos juegos
            </h2>
            <Link href="/products" style={{ fontSize: '0.78rem', color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>Ver todos →</Link>
          </div>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
              {[1,2,3,4,5,6].map(i => <div key={i} style={{ borderRadius: '12px', height: '150px', background: 'var(--surface)' }} />)}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem' }}>
              {recent.map(p => (
                <Link key={p.id} href={`/products/${p.id}`} style={{
                  borderRadius: '12px', overflow: 'hidden', textDecoration: 'none', display: 'block',
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  transition: 'transform 0.18s, box-shadow 0.18s',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 12px 32px rgba(0,0,0,0.5)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = ''; (e.currentTarget as HTMLAnchorElement).style.boxShadow = ''; }}>
                  <div style={{ paddingTop: '56.25%', position: 'relative', background: '#0a0c18' }}>
                    <img src={p.image || FALLBACK} alt={p.name}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => { (e.target as HTMLImageElement).src = FALLBACK; }} />
                    <div style={{ position: 'absolute', top: '0.4rem', left: '0.4rem', padding: '0.15rem 0.5rem', borderRadius: '99px', fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', background: 'rgba(0,0,0,0.6)', color: 'var(--text2)', backdropFilter: 'blur(6px)' }}>
                      {p.category.name}
                    </div>
                  </div>
                  <div style={{ padding: '0.65rem 0.75rem' }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</p>
                    <p style={{ fontFamily: 'var(--font-head)', fontSize: '0.92rem', fontWeight: 700, color: Number(p.price) === 0 ? 'var(--accent)' : 'var(--text2)' }}>
                      {Number(p.price) === 0 ? 'GRATIS' : `$${Number(p.price).toLocaleString('es-CO')}`}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Low stock alerts */}
        {lowStock.length > 0 && (
          <div style={{ minWidth: '240px' }}>
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '1rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text2)', textTransform: 'uppercase', marginBottom: '1rem' }}>
              ⚠ Stock bajo
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {lowStock.map(p => (
                <Link key={p.id} href={`/products/${p.id}/edit`} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.85rem',
                  borderRadius: '12px', textDecoration: 'none',
                  background: 'rgba(255,171,0,0.05)', border: '1px solid rgba(255,171,0,0.18)',
                  transition: 'background 0.18s',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,171,0,0.1)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,171,0,0.05)'; }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                    <img src={p.image || FALLBACK} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).src = FALLBACK; }} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</p>
                    <p style={{ fontSize: '0.72rem', color: 'var(--warning)', fontWeight: 700 }}>Solo {p.stock} unidades</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick actions (admin) */}
      {user?.role === 'ADMIN' && (
        <div style={{ borderRadius: '16px', padding: '1.4rem 1.5rem', background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '1rem' }}>
            Acciones rápidas
          </h2>
          <div className="flex gap-3 flex-wrap">
            {[
              { href: '/products/new',  label: '+ Nuevo juego',         style: { background: 'rgba(0,230,118,0.08)',  color: 'var(--accent)',  border: '1px solid rgba(0,230,118,0.2)'  } },
              { href: '/perifericos',   label: '🎧 Ver periféricos',     style: { background: 'rgba(41,121,255,0.08)', color: 'var(--accent2)', border: '1px solid rgba(41,121,255,0.2)' } },
              { href: '/categories',    label: '◉ Gestionar géneros',    style: { background: 'rgba(255,171,0,0.06)',  color: 'var(--warning)', border: '1px solid rgba(255,171,0,0.2)'  } },
              { href: '/admin',         label: '◆ Panel Admin',          style: { background: 'var(--surface2)',       color: 'var(--text2)',   border: '1px solid var(--border)'         } },
            ].map(a => (
              <Link key={a.href} href={a.href} style={{
                padding: '0.6rem 1.15rem', borderRadius: '10px', textDecoration: 'none',
                fontSize: '0.83rem', fontWeight: 700, fontFamily: 'var(--font-body)', ...a.style,
              }}>{a.label}</Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
