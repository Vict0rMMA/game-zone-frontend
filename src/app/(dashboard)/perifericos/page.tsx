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

const PERIPHERAL_NAMES = ['Teclados', 'Mouse', 'Audífonos', 'Controles', 'Monitores', 'Sillas', 'Micrófonos', 'Webcams', 'Alfombrillas'];

const CAT_ICONS: Record<string, string> = {
  Teclados: '⌨️', Mouse: '🖱️', Audífonos: '🎧', Controles: '🎮',
  Monitores: '🖥️', Sillas: '🪑', Micrófonos: '🎙️', Webcams: '📷', Alfombrillas: '🟫',
};

const FALLBACK = 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=640&auto=format&fit=crop';

export default function PerifericosPage() {
  const { user } = useAuth();
  const { categories } = useCategories();
  const [catFilter, setCatFilter] = useState('');
  const [deleting, setDeleting] = useState<Product | null>(null);

  const peripheralCats = categories.filter(c => PERIPHERAL_NAMES.includes(c.name));
  const { products, meta, page, loading, error, refetch } = useProducts({ categoryId: catFilter || undefined });

  const shown = catFilter ? products : products.filter(p => PERIPHERAL_NAMES.includes(p.category.name));

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await productService.remove(deleting.id);
      toast.success('Periférico eliminado');
      setDeleting(null);
      refetch(page);
    } catch { toast.error('Error al eliminar'); }
  };

  const base = { borderRadius: '10px', fontFamily: 'var(--font-body)', fontWeight: 600, cursor: 'pointer', border: 'none', fontSize: '0.82rem' };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '1.6rem', fontWeight: 700, letterSpacing: '0.04em', marginBottom: '0.2rem' }}>
            Periféricos Gaming
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>
            {shown.length > 0 ? `${shown.length} productos${meta ? ` de ${meta.total}` : ''}` : 'Equipos gaming de alta gama'}
          </p>
        </div>
        {user?.role === 'ADMIN' && (
          <Link href="/products/new" style={{
            ...base, display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.6rem 1.25rem', textDecoration: 'none',
            background: 'var(--accent)', color: '#050d08', fontWeight: 700,
            boxShadow: '0 0 20px rgba(0,230,118,0.2)',
          }}>
            + Agregar periférico
          </Link>
        )}
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[{ id: '', name: 'Todos', icon: '◈' }, ...peripheralCats.map(c => ({ id: c.id, name: c.name, icon: CAT_ICONS[c.name] ?? '◈' }))].map(tab => (
          <button key={tab.id} onClick={() => { setCatFilter(tab.id); refetch(1); }}
            style={{
              ...base, padding: '0.55rem 1rem',
              background: catFilter === tab.id ? 'rgba(0,230,118,0.12)' : 'var(--surface)',
              color: catFilter === tab.id ? 'var(--accent)' : 'var(--muted)',
              border: `1px solid ${catFilter === tab.id ? 'rgba(0,230,118,0.3)' : 'var(--border)'}`,
            }}>
            {tab.icon} {tab.name}
          </button>
        ))}
      </div>

      {/* No categories notice */}
      {!loading && peripheralCats.length === 0 && (
        <div className="text-center py-16 rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <p className="text-5xl mb-4">🎧</p>
          <p style={{ fontWeight: 600, color: 'var(--text2)', fontSize: '1.05rem' }}>No hay categorías de periféricos aún</p>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: '0.4rem' }}>
            Ejecuta el seed del backend: <code style={{ color: 'var(--accent)', fontFamily: 'monospace' }}>npm run seed</code>
          </p>
        </div>
      )}

      {loading && <LoadingSpinner />}
      {error && <p className="text-center py-8" style={{ color: 'var(--danger)' }}>{error}</p>}

      {!loading && shown.length === 0 && peripheralCats.length > 0 && (
        <div className="text-center py-20" style={{ color: 'var(--muted)' }}>
          <p className="text-5xl mb-4">🎧</p>
          <p style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text2)' }}>Sin periféricos en esta categoría</p>
          {user?.role === 'ADMIN' && (
            <Link href="/products/new" style={{ display: 'inline-block', marginTop: '1rem', padding: '0.55rem 1.2rem', borderRadius: '10px', background: 'var(--accent)', color: '#050d08', fontWeight: 700, textDecoration: 'none', fontSize: '0.85rem' }}>
              + Agregar primero
            </Link>
          )}
        </div>
      )}

      {/* Grid */}
      {!loading && shown.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '1rem' }}>
          {shown.map(p => (
            <PeriphCard key={p.id} product={p} isAdmin={user?.role === 'ADMIN'} onDelete={() => setDeleting(p)} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && catFilter && (
        <div className="flex items-center justify-between mt-6" style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>
          <span>Página {page} de {meta.totalPages}</span>
          <div className="flex gap-2">
            <button onClick={() => refetch(page - 1)} disabled={page === 1}
              style={{ ...base, padding: '0.5rem 1rem', background: 'var(--surface)', color: 'var(--text2)', border: '1px solid var(--border)', opacity: page === 1 ? 0.4 : 1 }}>
              ← Anterior
            </button>
            <button onClick={() => refetch(page + 1)} disabled={page === meta.totalPages}
              style={{ ...base, padding: '0.5rem 1rem', background: 'var(--surface)', color: 'var(--text2)', border: '1px solid var(--border)', opacity: page === meta.totalPages ? 0.4 : 1 }}>
              Siguiente →
            </button>
          </div>
        </div>
      )}

      <Modal open={!!deleting} title="Eliminar periférico" onClose={() => setDeleting(null)}>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          ¿Eliminar <strong style={{ color: 'var(--text)' }}>{deleting?.name}</strong>? Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setDeleting(null)} style={{ ...base, padding: '0.6rem 1.2rem', background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)' }}>Cancelar</button>
          <button onClick={handleDelete} style={{ ...base, padding: '0.6rem 1.2rem', background: 'rgba(255,23,68,0.12)', color: '#ff6b8a', border: '1px solid rgba(255,23,68,0.25)' }}>Eliminar</button>
        </div>
      </Modal>
    </div>
  );
}

function PeriphCard({ product: p, isAdmin, onDelete }: { product: Product; isAdmin: boolean; onDelete: () => void }) {
  const price = Number(p.price);
  const icon = CAT_ICONS[p.category.name] ?? '◈';

  return (
    <div style={{
      borderRadius: '14px', overflow: 'hidden', display: 'flex', flexDirection: 'column',
      background: 'var(--surface)', border: '1px solid var(--border)', transition: 'transform 0.18s, box-shadow 0.18s',
    }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 40px rgba(0,0,0,0.5)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}>

      {/* Image */}
      <div style={{ position: 'relative', paddingTop: '60%', background: '#0a0c18', overflow: 'hidden' }}>
        <img src={p.image || FALLBACK} alt={p.name}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
          onError={e => { (e.target as HTMLImageElement).src = FALLBACK; }}
          onMouseEnter={e => { (e.target as HTMLImageElement).style.transform = 'scale(1.05)'; }}
          onMouseLeave={e => { (e.target as HTMLImageElement).style.transform = 'scale(1)'; }}
        />
        <div style={{ position: 'absolute', top: '0.6rem', left: '0.6rem', padding: '0.2rem 0.65rem', borderRadius: '99px', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(41,121,255,0.7)', color: '#fff', backdropFilter: 'blur(8px)' }}>
          {icon} {p.category.name}
        </div>
        {p.stock === 0 && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.65)' }}>
            <span style={{ padding: '0.35rem 0.85rem', borderRadius: '99px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', background: 'var(--danger)', color: '#fff' }}>Sin stock</span>
          </div>
        )}
        {p.stock > 0 && p.stock < 10 && (
          <div style={{ position: 'absolute', top: '0.6rem', right: '0.6rem', padding: '0.2rem 0.6rem', borderRadius: '99px', fontSize: '0.65rem', fontWeight: 700, background: 'rgba(255,171,0,0.85)', color: '#000' }}>
            ¡Últimas {p.stock}!
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '0.9rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '0.65rem' }}>
        <p style={{ fontWeight: 600, fontSize: '0.88rem', lineHeight: 1.3, color: 'var(--text)' }}>{p.name}</p>
        {p.description && (
          <p style={{ fontSize: '0.74rem', color: 'var(--muted)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {p.description}
          </p>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
          <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent)', letterSpacing: '0.02em' }}>
            ${price.toLocaleString('es-CO')}
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>
            {p.stock > 0 ? `${p.stock} uds` : ''}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <Link href={`/products/${p.id}`} style={{
            flex: 1, padding: '0.55rem', borderRadius: '8px', textAlign: 'center', textDecoration: 'none',
            fontSize: '0.78rem', fontWeight: 600, background: 'rgba(41,121,255,0.1)', color: 'var(--accent2)',
            border: '1px solid rgba(41,121,255,0.2)',
          }}>
            Ver detalle
          </Link>
          {isAdmin && (
            <>
              <Link href={`/products/${p.id}/edit`} style={{ padding: '0.55rem 0.7rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.82rem', background: 'var(--surface2)', color: 'var(--muted)', border: '1px solid var(--border)' }}>✏</Link>
              <button onClick={onDelete} style={{ padding: '0.55rem 0.7rem', borderRadius: '8px', border: '1px solid rgba(255,23,68,0.2)', background: 'rgba(255,23,68,0.06)', color: '#ff6b8a', cursor: 'pointer', fontSize: '0.82rem' }}>✕</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
