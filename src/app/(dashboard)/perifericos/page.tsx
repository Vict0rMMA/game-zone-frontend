'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useCategories } from '@/hooks/useCategories';
import { useProducts } from '@/hooks/useProducts';
import { productService } from '@/services/product.service';
import { Product } from '@/types/product.types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';

const PERIPHERAL_NAMES = ['Teclados','Mouse','Audífonos','Controles','Monitores','Sillas','Micrófonos','Webcams','Alfombrillas'];

const CAT_META: Record<string, { icon: string; color: string }> = {
  Teclados:    { icon: '⌨️', color: '#1e88e5' },
  Mouse:       { icon: '🖱️', color: '#8e24aa' },
  Audífonos:   { icon: '🎧', color: '#00897b' },
  Controles:   { icon: '🎮', color: '#e53935' },
  Monitores:   { icon: '🖥️', color: '#fb8c00' },
  Sillas:      { icon: '🪑', color: '#546e7a' },
  Micrófonos:  { icon: '🎙️', color: '#43a047' },
  Webcams:     { icon: '📷', color: '#6d4c41' },
  Alfombrillas:{ icon: '🖱', color: '#37474f' },
};

const FALLBACK = 'https://images.unsplash.com/photo-1593640408182-31c228b6b20a?w=640&auto=format&fit=crop';

export default function PerifericosPage() {
  const { user } = useAuth();
  const { categories } = useCategories();
  const [catFilter, setCatFilter] = useState('');
  const [deleting, setDeleting] = useState<Product | null>(null);

  const peripheralCats = categories.filter(c => PERIPHERAL_NAMES.includes(c.name));

  const { products, meta, page, loading, error, refetch } = useProducts({
    categoryId: catFilter || undefined,
    type: 'peripheral',
  });

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await productService.remove(deleting.id);
      toast.success('Periférico eliminado');
      setDeleting(null);
      refetch(page);
    } catch { toast.error('Error al eliminar'); }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <div className="flex items-start justify-between flex-wrap gap-3 mb-5">
          <div>
            <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '1.75rem', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
              Periféricos Gaming
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>
              {meta ? `${meta.total} productos disponibles` : 'Equipamiento gaming de alta gama'}
            </p>
          </div>
          {user?.role === 'ADMIN' && (
            <Link href="/products/new" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.65rem 1.3rem', borderRadius: '10px', textDecoration: 'none',
              background: 'var(--accent2)', color: '#fff',
              fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.88rem', letterSpacing: '0.06em',
              boxShadow: '0 0 18px rgba(41,121,255,0.3)',
            }}>
              + Agregar periférico
            </Link>
          )}
        </div>

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setCatFilter('')} style={{
            padding: '0.45rem 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.78rem',
            background: catFilter === '' ? 'var(--accent2)' : 'var(--surface)',
            color: catFilter === '' ? '#fff' : 'var(--muted)',
          }}>Todos</button>
          {peripheralCats.map(cat => {
            const meta = CAT_META[cat.name] ?? { icon: '◈', color: '#555' };
            const active = catFilter === cat.id;
            return (
              <button key={cat.id} onClick={() => setCatFilter(cat.id)} style={{
                padding: '0.45rem 0.9rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem',
                background: active ? meta.color : 'var(--surface)',
                color: active ? '#fff' : 'var(--muted)',
                transition: 'all 0.15s',
              }}>
                {meta.icon} {cat.name}
              </button>
            );
          })}
        </div>
      </div>
      {!loading && peripheralCats.length === 0 && (
        <div className="text-center py-20 rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <p style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎧</p>
          <p style={{ fontWeight: 600, color: 'var(--text2)' }}>No hay categorías de periféricos</p>
          <p style={{ color: 'var(--muted)', fontSize: '0.82rem', marginTop: '0.4rem' }}>
            Ejecuta <code style={{ color: 'var(--accent)', fontFamily: 'monospace', fontSize: '0.8rem' }}>npm run seed</code> en el backend
          </p>
        </div>
      )}

      {loading && <LoadingSpinner />}
      {error && <p className="text-center py-8" style={{ color: 'var(--danger)' }}>{error}</p>}

      {!loading && products.length === 0 && peripheralCats.length > 0 && (
        <div className="text-center py-20" style={{ color: 'var(--muted)' }}>
          <p style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎧</p>
          <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text2)' }}>Sin productos en esta categoría</p>
          {user?.role === 'ADMIN' && (
            <Link href="/products/new" style={{ display: 'inline-block', marginTop: '1rem', padding: '0.55rem 1.2rem', borderRadius: '10px', background: 'var(--accent2)', color: '#fff', fontWeight: 700, textDecoration: 'none', fontSize: '0.85rem' }}>
              + Agregar primero
            </Link>
          )}
        </div>
      )}
      {!loading && products.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '1.25rem' }}>
          {products.map(p => (
            <PeriphCard key={p.id} product={p} isAdmin={user?.role === 'ADMIN'} onDelete={() => setDeleting(p)} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between mt-8" style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>
          <span>Página {page} de {meta.totalPages} · {meta.total} productos</span>
          <div className="flex gap-2">
            <button onClick={() => refetch(page - 1)} disabled={page === 1} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text2)', cursor: 'pointer', opacity: page === 1 ? 0.4 : 1, fontSize: '0.82rem' }}>← Anterior</button>
            <button onClick={() => refetch(page + 1)} disabled={page === meta.totalPages} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text2)', cursor: 'pointer', opacity: page === meta.totalPages ? 0.4 : 1, fontSize: '0.82rem' }}>Siguiente →</button>
          </div>
        </div>
      )}

      <Modal open={!!deleting} title="Eliminar periférico" onClose={() => setDeleting(null)}>
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

function PeriphCard({ product: p, isAdmin, onDelete }: { product: Product; isAdmin: boolean; onDelete: () => void }) {
  const price = Number(p.price);
  const catMeta = CAT_META[p.category.name] ?? { icon: '◈', color: '#1e88e5' };

  return (
    <div style={{
      borderRadius: '14px', overflow: 'hidden', background: 'var(--surface)',
      border: '1px solid var(--border)', display: 'flex', flexDirection: 'column',
      transition: 'transform 0.2s, box-shadow 0.2s',
    }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 16px 48px rgba(0,0,0,0.55)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = ''; }}>

      {/* Image — altura fija 180px, object-fit:cover */}
      <div style={{ position: 'relative', height: '180px', overflow: 'hidden', borderRadius: '12px 12px 0 0', background: '#0a0e1a', flexShrink: 0 }}>
        <img src={p.image || FALLBACK} alt={p.name}
          style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block', transition: 'transform 0.35s' }}
          onError={e => { (e.target as HTMLImageElement).src = FALLBACK; }}
          onMouseEnter={e => { (e.target as HTMLImageElement).style.transform = 'scale(1.06)'; }}
          onMouseLeave={e => { (e.target as HTMLImageElement).style.transform = 'scale(1)'; }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,10,20,0.65) 0%, transparent 60%)' }} />
        {/* Category chip */}
        <div style={{
          position: 'absolute', top: '0.6rem', left: '0.6rem',
          display: 'flex', alignItems: 'center', gap: '0.3rem',
          padding: '0.2rem 0.65rem', borderRadius: '6px', fontSize: '0.62rem',
          fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
          background: catMeta.color, color: '#fff',
        }}>
          {catMeta.icon} {p.category.name}
        </div>
        {/* Stock badge */}
        {p.stock === 0 && (
          <div style={{ position: 'absolute', top: '0.6rem', right: '0.6rem', padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.62rem', fontWeight: 700, background: 'rgba(255,23,68,0.85)', color: '#fff', textTransform: 'uppercase' }}>Sin stock</div>
        )}
        {p.stock > 0 && p.stock <= 5 && (
          <div style={{ position: 'absolute', top: '0.6rem', right: '0.6rem', padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.62rem', fontWeight: 700, background: 'rgba(255,171,0,0.85)', color: '#000', textTransform: 'uppercase' }}>¡Últimas!</div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '0.9rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
        <p style={{ fontWeight: 600, fontSize: '0.9rem', lineHeight: 1.3, color: 'var(--text)', margin: 0 }}>{p.name}</p>
        {p.description && (
          <p style={{ fontSize: '0.74rem', color: 'var(--muted)', lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: 0 }}>
            {p.description}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '0.3rem' }}>
          <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent)', letterSpacing: '0.02em' }}>
            ${price.toLocaleString('es-CO')}
          </span>
          <span style={{ fontSize: '0.68rem', color: p.stock > 0 && p.stock <= 10 ? 'var(--warning)' : 'var(--muted)' }}>
            {p.stock > 0 ? `${p.stock} uds` : ''}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.2rem' }}>
          <Link href={`/products/${p.id}`} style={{
            flex: 1, padding: '0.5rem', borderRadius: '8px', textAlign: 'center', textDecoration: 'none',
            fontSize: '0.78rem', fontWeight: 600,
            background: `${catMeta.color}18`, color: catMeta.color,
            border: `1px solid ${catMeta.color}30`,
          }}>Ver detalle</Link>
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
