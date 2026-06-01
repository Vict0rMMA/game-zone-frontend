'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useProducts } from '@/hooks/useProducts';
import { useAuth } from '@/contexts/AuthContext';
import { productService } from '@/services/product.service';
import { Product } from '@/types/product.types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';

export default function ProductsPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const { products, meta, page, loading, error, refetch } = useProducts({ search: query });
  const [deleting, setDeleting] = useState<Product | null>(null);

  const handleDelete = async () => {
    if (!deleting) return;
    try { await productService.remove(deleting.id); toast.success('Juego eliminado'); setDeleting(null); refetch(page); }
    catch { toast.error('Error al eliminar'); }
  };

  const btn = (style: 'primary' | 'danger' | 'ghost') => ({
    primary: { background: 'rgba(57,255,20,0.12)', color: 'var(--accent)', border: '1px solid rgba(57,255,20,0.25)' },
    danger:  { background: 'rgba(255,71,87,0.1)',  color: 'var(--danger)', border: '1px solid rgba(255,71,87,0.25)' },
    ghost:   { background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)' },
  }[style]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <h1 className="text-2xl font-black uppercase tracking-wider">🎮 Catálogo de Juegos</h1>
        {user?.role === 'ADMIN' && (
          <Link href="/products/new" className="px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wide transition-all" style={btn('primary')}>
            ➕ Nuevo juego
          </Link>
        )}
      </div>

      <div className="flex gap-2 mb-6">
        <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && setQuery(search)}
          placeholder="Buscar juego..." className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }} />
        <button onClick={() => setQuery(search)} className="px-4 py-2 rounded-xl text-sm font-bold" style={btn('primary')}>Buscar</button>
        {query && <button onClick={() => { setQuery(''); setSearch(''); }} className="px-3 py-2 rounded-xl text-sm" style={btn('ghost')}>✕</button>}
      </div>

      {loading && <LoadingSpinner />}
      {error && <div className="text-center py-8" style={{ color: 'var(--danger)' }}>{error}</div>}
      {!loading && products.length === 0 && (
        <div className="text-center py-20" style={{ color: 'var(--muted)' }}>
          <div className="text-6xl mb-4">🎮</div>
          <p className="text-lg font-medium">No hay juegos en el catálogo</p>
          {user?.role === 'ADMIN' && <p className="text-sm mt-1">Agrega el primer juego con el botón de arriba</p>}
        </div>
      )}

      {!loading && products.length > 0 && (
        <>
          <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <table className="w-full text-sm">
              <thead style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--border)' }}>
                <tr>
                  <th className="text-left px-5 py-3 font-bold uppercase tracking-wider text-xs" style={{ color: 'var(--muted)' }}>Juego</th>
                  <th className="text-left px-4 py-3 font-bold uppercase tracking-wider text-xs" style={{ color: 'var(--muted)' }}>Género</th>
                  <th className="text-right px-4 py-3 font-bold uppercase tracking-wider text-xs" style={{ color: 'var(--muted)' }}>Precio</th>
                  <th className="text-right px-4 py-3 font-bold uppercase tracking-wider text-xs" style={{ color: 'var(--muted)' }}>Stock</th>
                  {user?.role === 'ADMIN' && <th className="px-4 py-3" />}
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => (
                  <tr key={p.id} style={{ borderBottom: i < products.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <td className="px-5 py-4">
                      <div className="font-bold">{p.name}</div>
                      {p.description && <div className="text-xs mt-0.5 truncate max-w-xs" style={{ color: 'var(--muted)' }}>{p.description}</div>}
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-1 rounded-lg text-xs font-medium"
                        style={{ background: 'rgba(0,212,255,0.1)', color: 'var(--accent2)', border: '1px solid rgba(0,212,255,0.15)' }}>
                        {p.category.name}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right font-bold" style={{ color: 'var(--accent)' }}>
                      ${Number(p.price).toLocaleString('es-CO')}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="px-2 py-1 rounded-full text-xs font-bold"
                        style={p.stock === 0
                          ? { background: 'rgba(255,71,87,0.1)', color: 'var(--danger)' }
                          : p.stock < 5
                          ? { background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }
                          : { background: 'rgba(57,255,20,0.1)', color: 'var(--accent)' }}>
                        {p.stock}
                      </span>
                    </td>
                    {user?.role === 'ADMIN' && (
                      <td className="px-4 py-4">
                        <div className="flex gap-2 justify-end">
                          <Link href={`/products/${p.id}/edit`} className="px-3 py-1.5 rounded-lg text-xs font-bold" style={btn('ghost')}>Editar</Link>
                          <button onClick={() => setDeleting(p)} className="px-3 py-1.5 rounded-lg text-xs font-bold" style={btn('danger')}>Eliminar</button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm" style={{ color: 'var(--muted)' }}>
              <span>{meta.total} juegos · Página {page}/{meta.totalPages}</span>
              <div className="flex gap-2">
                <button onClick={() => refetch(page - 1)} disabled={page === 1} className="px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-30" style={btn('ghost')}>‹ Ant</button>
                <button onClick={() => refetch(page + 1)} disabled={page === meta.totalPages} className="px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-30" style={btn('ghost')}>Sig ›</button>
              </div>
            </div>
          )}
        </>
      )}

      <Modal open={!!deleting} title="Eliminar juego" onClose={() => setDeleting(null)}>
        <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>¿Eliminar <strong style={{ color: 'var(--text)' }}>{deleting?.name}</strong>? Esta acción no se puede deshacer.</p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setDeleting(null)} className="px-4 py-2 rounded-xl text-sm font-bold" style={btn('ghost')}>Cancelar</button>
          <button onClick={handleDelete} className="px-4 py-2 rounded-xl text-sm font-bold" style={btn('danger')}>Eliminar</button>
        </div>
      </Modal>
    </div>
  );
}
