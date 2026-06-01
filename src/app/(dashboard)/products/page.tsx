'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useAuth } from '@/contexts/AuthContext';
import { productService } from '@/services/product.service';
import { Product } from '@/types/product.types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';

const GAME_CATEGORIES = ['Acción','RPG','FPS','Indie','Carreras','Aventura','Terror','Deportes'];
const FALLBACK = 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=640&auto=format&fit=crop';

const CAT_COLORS: Record<string, string> = {
  'Acción':   '#e53935', 'RPG':      '#8e24aa', 'FPS':     '#1e88e5',
  'Indie':    '#43a047', 'Carreras': '#fb8c00', 'Aventura':'#00897b',
  'Terror':   '#546e7a', 'Deportes': '#f4511e',
};

export default function ProductsPage() {
  const { user } = useAuth();
  const { categories } = useCategories();
  const [search, setSearch] = useState('');
  const [query, setQuery]   = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [deleting, setDeleting]   = useState<Product | null>(null);

  const gameCats = categories.filter(c => GAME_CATEGORIES.includes(c.name));
  const { products, meta, page, loading, error, refetch } = useProducts({
    search: query, categoryId: catFilter || undefined, type: 'game',
  });

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await productService.remove(deleting.id);
      toast.success('Juego eliminado del catálogo');
      setDeleting(null);
      refetch(page);
    } catch { toast.error('Error al eliminar'); }
  };

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div className="flex items-start justify-between flex-wrap gap-3 mb-5">
          <div>
            <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '1.75rem', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
              Catálogo de Juegos
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>
              {meta ? `${meta.total} títulos disponibles` : 'Gestión de videojuegos'}
            </p>
          </div>
          {user?.role === 'ADMIN' && (
            <Link href="/products/new" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.65rem 1.3rem', borderRadius: '10px', textDecoration: 'none',
              background: 'var(--accent)', color: '#050d08',
              fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.88rem', letterSpacing: '0.06em',
              boxShadow: '0 0 18px rgba(0,230,118,0.25)',
            }}>
              + Agregar juego
            </Link>
          )}
        </div>

        {/* Search */}
        <div className="flex gap-2 flex-wrap mb-4">
          <input value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && setQuery(search)}
            placeholder="Buscar juego..."
            style={{
              flex: 1, minWidth: '200px', padding: '0.65rem 1rem', borderRadius: '10px',
              background: 'var(--surface)', border: '1px solid var(--border2)',
              color: 'var(--text)', fontSize: '0.85rem', outline: 'none', fontFamily: 'var(--font-body)',
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(0,230,118,0.4)'}
            onBlur={e  => e.target.style.borderColor = 'var(--border2)'}
          />
          <button onClick={() => setQuery(search)} style={{
            padding: '0.65rem 1.25rem', borderRadius: '10px', border: 'none', cursor: 'pointer',
            background: 'var(--accent)', color: '#050d08', fontWeight: 700, fontSize: '0.85rem', fontFamily: 'var(--font-body)',
          }}>Buscar</button>
          {(query || catFilter) && (
            <button onClick={() => { setQuery(''); setSearch(''); setCatFilter(''); }} style={{
              padding: '0.65rem 1rem', borderRadius: '10px', cursor: 'pointer',
              background: 'var(--surface)', color: 'var(--muted)', border: '1px solid var(--border)', fontSize: '0.85rem', fontFamily: 'var(--font-body)',
            }}>✕ Limpiar</button>
          )}
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 flex-wrap">
          {[{ id: '', name: 'Todos' }, ...gameCats].map(tab => (
            <button key={tab.id} onClick={() => { setCatFilter(tab.id); refetch(1); }}
              style={{
                padding: '0.4rem 0.9rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.78rem',
                background: catFilter === tab.id ? (CAT_COLORS[tab.name] ?? 'var(--accent)') : 'var(--surface)',
                color: catFilter === tab.id ? '#fff' : 'var(--muted)',
                opacity: catFilter === tab.id ? 1 : 0.85,
                transition: 'all 0.15s',
              }}>
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      {loading && <LoadingSpinner />}
      {error && <p className="text-center py-8" style={{ color: 'var(--danger)' }}>{error}</p>}

      {!loading && products.length === 0 && (
        <div className="text-center py-24" style={{ color: 'var(--muted)' }}>
          <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎮</p>
          <p style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text2)' }}>Sin resultados</p>
          <p style={{ fontSize: '0.85rem', marginTop: '0.4rem' }}>Prueba con otro género o agrega un nuevo título</p>
        </div>
      )}

      {!loading && products.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '1.25rem' }}>
          {products.map(p => (
            <GameCard key={p.id} product={p} isAdmin={user?.role === 'ADMIN'} onDelete={() => setDeleting(p)} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between mt-8" style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>
          <span>Página {page} de {meta.totalPages} · {meta.total} juegos</span>
          <div className="flex gap-2">
            <button onClick={() => refetch(page - 1)} disabled={page === 1} style={{
              padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)',
              background: 'var(--surface)', color: 'var(--text2)', cursor: 'pointer', fontSize: '0.82rem',
              opacity: page === 1 ? 0.4 : 1,
            }}>← Anterior</button>
            <button onClick={() => refetch(page + 1)} disabled={page === meta.totalPages} style={{
              padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)',
              background: 'var(--surface)', color: 'var(--text2)', cursor: 'pointer', fontSize: '0.82rem',
              opacity: page === meta.totalPages ? 0.4 : 1,
            }}>Siguiente →</button>
          </div>
        </div>
      )}

      <Modal open={!!deleting} title="Eliminar juego" onClose={() => setDeleting(null)}>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          ¿Eliminar <strong style={{ color: 'var(--text)' }}>{deleting?.name}</strong>? Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setDeleting(null)} style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: '0.85rem' }}>Cancelar</button>
          <button onClick={handleDelete} style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', background: 'rgba(255,23,68,0.12)', color: '#ff6b8a', border: '1px solid rgba(255,23,68,0.25)', cursor: 'pointer', fontSize: '0.85rem' }}>Eliminar</button>
        </div>
      </Modal>
    </div>
  );
}

function GameCard({ product: p, isAdmin, onDelete }: { product: Product; isAdmin: boolean; onDelete: () => void }) {
  const price = Number(p.price);
  const isFree = price === 0;
  const catColor = CAT_COLORS[p.category.name] ?? '#666';

  return (
    <div style={{
      borderRadius: '14px', overflow: 'hidden', background: 'var(--surface)',
      border: '1px solid var(--border)', display: 'flex', flexDirection: 'column',
      transition: 'transform 0.2s, box-shadow 0.2s',
    }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 16px 48px rgba(0,0,0,0.55)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = ''; }}>

      {/* Image with gradient */}
      <div style={{ position: 'relative', paddingTop: '56.25%', background: '#080a14', flexShrink: 0 }}>
        <img src={p.image || FALLBACK} alt={p.name}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.35s' }}
          onError={e => { (e.target as HTMLImageElement).src = FALLBACK; }}
          onMouseEnter={e => { (e.target as HTMLImageElement).style.transform = 'scale(1.06)'; }}
          onMouseLeave={e => { (e.target as HTMLImageElement).style.transform = 'scale(1)'; }}
        />
        {/* Bottom gradient */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,10,20,0.85) 0%, transparent 50%)' }} />
        {/* Category badge */}
        <div style={{
          position: 'absolute', top: '0.55rem', left: '0.55rem',
          padding: '0.18rem 0.6rem', borderRadius: '6px', fontSize: '0.62rem',
          fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em',
          background: catColor, color: '#fff',
        }}>{p.category.name}</div>
        {/* Stock badge */}
        {p.stock === 0 && (
          <div style={{ position: 'absolute', top: '0.55rem', right: '0.55rem', padding: '0.18rem 0.55rem', borderRadius: '6px', fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', background: 'rgba(255,23,68,0.85)', color: '#fff' }}>Agotado</div>
        )}
        {isFree && p.stock > 0 && (
          <div style={{ position: 'absolute', top: '0.55rem', right: '0.55rem', padding: '0.18rem 0.55rem', borderRadius: '6px', fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', background: 'rgba(0,230,118,0.85)', color: '#050d08' }}>Gratis</div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '0.85rem 0.9rem 0.7rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
        <p style={{ fontWeight: 600, fontSize: '0.88rem', lineHeight: 1.35, color: 'var(--text)', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {p.name}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
          <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '0.02em', color: isFree ? 'var(--accent)' : 'var(--text)' }}>
            {isFree ? 'GRATIS' : `$${price.toLocaleString('es-CO')}`}
          </span>
          {p.stock > 0 && p.stock <= 10 && (
            <span style={{ fontSize: '0.65rem', color: 'var(--warning)', fontWeight: 600 }}>¡Quedan {p.stock}!</span>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.25rem' }}>
          <Link href={`/products/${p.id}`} style={{
            flex: 1, padding: '0.5rem', borderRadius: '8px', textAlign: 'center', textDecoration: 'none',
            fontSize: '0.78rem', fontWeight: 600, background: 'rgba(0,230,118,0.08)', color: 'var(--accent)',
            border: '1px solid rgba(0,230,118,0.18)',
          }}>Ver detalles</Link>
          {isAdmin && (
            <>
              <Link href={`/products/${p.id}/edit`} style={{ padding: '0.5rem 0.65rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.8rem', background: 'var(--surface2)', color: 'var(--muted)', border: '1px solid var(--border)' }}>✏</Link>
              <button onClick={onDelete} style={{ padding: '0.5rem 0.65rem', borderRadius: '8px', border: '1px solid rgba(255,23,68,0.2)', background: 'rgba(255,23,68,0.06)', color: '#ff6b8a', cursor: 'pointer', fontSize: '0.8rem' }}>✕</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
