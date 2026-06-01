'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useAuth } from '@/contexts/AuthContext';
import { productService } from '@/services/product.service';
import { Product } from '@/types/product.types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';

const FALLBACK = 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=460&auto=format&fit=crop';

export default function ProductsPage() {
  const { user } = useAuth();
  const { categories } = useCategories();
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const { products, meta, page, loading, error, refetch } = useProducts({ search: query, categoryId: catFilter || undefined });
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const handleDelete = async () => {
    if (!deleting) return;
    try { await productService.remove(deleting.id); toast.success('Juego eliminado'); setDeleting(null); refetch(page); }
    catch { toast.error('Error al eliminar'); }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
        <h1 className="text-2xl font-black uppercase tracking-wider">🎮 Catálogo</h1>
        <div className="flex gap-2 items-center">
          <button onClick={() => setView('grid')} className="px-3 py-1.5 rounded-lg text-sm font-bold"
            style={view === 'grid' ? { background: 'var(--accent)', color: '#050806' } : { background: 'var(--surface2)', color: 'var(--muted)', border: '1px solid var(--border)' }}>⊞</button>
          <button onClick={() => setView('list')} className="px-3 py-1.5 rounded-lg text-sm font-bold"
            style={view === 'list' ? { background: 'var(--accent)', color: '#050806' } : { background: 'var(--surface2)', color: 'var(--muted)', border: '1px solid var(--border)' }}>☰</button>
          {user?.role === 'ADMIN' && (
            <Link href="/products/new" className="px-4 py-2 rounded-xl text-sm font-black uppercase tracking-wide"
              style={{ background: 'var(--accent)', color: '#050806', boxShadow: '0 0 16px rgba(57,255,20,0.25)' }}>
              ➕ Nuevo
            </Link>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-5 flex-wrap">
        <input value={search} onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && setQuery(search)}
          placeholder="Buscar juego..." className="flex-1 min-w-40 px-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }} />
        <select value={catFilter} onChange={e => { setCatFilter(e.target.value); setQuery(search); }}
          className="px-3 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: catFilter ? 'var(--text)' : 'var(--muted)' }}>
          <option value="">Todos los géneros</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button onClick={() => setQuery(search)}
          className="px-4 py-2 rounded-xl text-sm font-bold"
          style={{ background: 'rgba(57,255,20,0.12)', color: 'var(--accent)', border: '1px solid rgba(57,255,20,0.25)' }}>
          Buscar
        </button>
        {(query || catFilter) && (
          <button onClick={() => { setQuery(''); setSearch(''); setCatFilter(''); }}
            className="px-3 py-2 rounded-xl text-sm"
            style={{ background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)' }}>✕</button>
        )}
      </div>

      {loading && <LoadingSpinner />}
      {error && <p className="text-center py-8" style={{ color: 'var(--danger)' }}>{error}</p>}

      {!loading && products.length === 0 && (
        <div className="text-center py-20" style={{ color: 'var(--muted)' }}>
          <div className="text-6xl mb-4">🎮</div>
          <p className="text-lg font-medium">No hay juegos en el catálogo</p>
        </div>
      )}

      {/* Grid view */}
      {!loading && products.length > 0 && view === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(p => (
            <div key={p.id} className="rounded-xl overflow-hidden flex flex-col transition-transform hover:scale-[1.02]"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
              <div className="relative w-full aspect-video bg-gray-900 overflow-hidden">
                <img src={p.image || FALLBACK} alt={p.name}
                  className="w-full h-full object-cover"
                  onError={e => { (e.target as HTMLImageElement).src = FALLBACK; }} />
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                    style={{ background: 'rgba(0,212,255,0.85)', color: '#050806' }}>
                    {p.category.name}
                  </span>
                </div>
                {p.stock === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,0.6)' }}>
                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase" style={{ background: 'var(--danger)', color: '#fff' }}>Sin stock</span>
                  </div>
                )}
              </div>
              <div className="p-3 flex flex-col flex-1">
                <p className="font-bold text-sm truncate mb-1">{p.name}</p>
                <p className="font-black text-base mb-3" style={{ color: 'var(--accent)' }}>
                  {p.price === 0 ? 'Gratis' : `$${Number(p.price).toLocaleString('es-CO')}`}
                </p>
                <div className="mt-auto flex gap-2">
                  <Link href={`/products/${p.id}`} className="flex-1 py-1.5 rounded-lg text-xs font-bold text-center"
                    style={{ background: 'rgba(57,255,20,0.12)', color: 'var(--accent)', border: '1px solid rgba(57,255,20,0.2)' }}>
                    Ver
                  </Link>
                  {user?.role === 'ADMIN' && (
                    <>
                      <Link href={`/products/${p.id}/edit`} className="px-2.5 py-1.5 rounded-lg text-xs font-bold"
                        style={{ background: 'var(--surface2)', color: 'var(--muted)', border: '1px solid var(--border)' }}>✏️</Link>
                      <button onClick={() => setDeleting(p)} className="px-2.5 py-1.5 rounded-lg text-xs font-bold"
                        style={{ background: 'rgba(255,71,87,0.1)', color: 'var(--danger)', border: '1px solid rgba(255,71,87,0.2)' }}>🗑</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List view */}
      {!loading && products.length > 0 && view === 'list' && (
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <table className="w-full text-sm">
            <thead style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--border)' }}>
              <tr>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Juego</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Género</th>
                <th className="text-right px-4 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Precio</th>
                <th className="text-right px-4 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Stock</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: i < products.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.image || FALLBACK} alt={p.name} className="w-12 h-7 object-cover rounded"
                        onError={e => { (e.target as HTMLImageElement).src = FALLBACK; }} />
                      <span className="font-semibold">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs" style={{ background: 'rgba(0,212,255,0.1)', color: 'var(--accent2)' }}>{p.category.name}</span></td>
                  <td className="px-4 py-3 text-right font-bold" style={{ color: 'var(--accent)' }}>{p.price === 0 ? 'Gratis' : `$${Number(p.price).toLocaleString('es-CO')}`}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                      style={p.stock === 0 ? { background: 'rgba(255,71,87,0.1)', color: 'var(--danger)' } : { background: 'rgba(57,255,20,0.1)', color: 'var(--accent)' }}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <Link href={`/products/${p.id}`} className="px-3 py-1.5 rounded-lg text-xs font-bold"
                        style={{ background: 'rgba(57,255,20,0.1)', color: 'var(--accent)', border: '1px solid rgba(57,255,20,0.2)' }}>Ver</Link>
                      {user?.role === 'ADMIN' && (
                        <>
                          <Link href={`/products/${p.id}/edit`} className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: 'var(--surface2)', color: 'var(--muted)', border: '1px solid var(--border)' }}>Editar</Link>
                          <button onClick={() => setDeleting(p)} className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: 'rgba(255,71,87,0.1)', color: 'var(--danger)', border: '1px solid rgba(255,71,87,0.2)' }}>Eliminar</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginación */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between mt-5 text-sm" style={{ color: 'var(--muted)' }}>
          <span>{meta.total} juegos · Página {page}/{meta.totalPages}</span>
          <div className="flex gap-2">
            <button onClick={() => refetch(page - 1)} disabled={page === 1} className="px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-30"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}>‹ Anterior</button>
            <button onClick={() => refetch(page + 1)} disabled={page === meta.totalPages} className="px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-30"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}>Siguiente ›</button>
          </div>
        </div>
      )}

      <Modal open={!!deleting} title="Eliminar juego" onClose={() => setDeleting(null)}>
        <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>¿Eliminar <strong style={{ color: 'var(--text)' }}>{deleting?.name}</strong>?</p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setDeleting(null)} className="px-4 py-2 rounded-xl text-sm font-bold"
            style={{ background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)' }}>Cancelar</button>
          <button onClick={handleDelete} className="px-4 py-2 rounded-xl text-sm font-bold"
            style={{ background: 'rgba(255,71,87,0.1)', color: 'var(--danger)', border: '1px solid rgba(255,71,87,0.25)' }}>Eliminar</button>
        </div>
      </Modal>
    </div>
  );
}
