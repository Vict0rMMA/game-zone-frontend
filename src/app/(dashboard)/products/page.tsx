'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useProducts } from '@/hooks/useProducts';
import { useAuth } from '@/contexts/AuthContext';
import { productService } from '@/services/product.service';
import { Product } from '@/types/product.types';
import Button from '@/components/ui/Button';
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
    try {
      await productService.remove(deleting.id);
      toast.success('Producto eliminado');
      setDeleting(null);
      refetch(page);
    } catch {
      toast.error('Error al eliminar el producto');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <h1 className="text-2xl font-bold">Productos</h1>
        {user?.role === 'ADMIN' && (
          <Link href="/products/new">
            <Button>+ Nuevo producto</Button>
          </Link>
        )}
      </div>

      <div className="flex gap-2 mb-4">
        <input value={search} onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && setQuery(search)}
          placeholder="Buscar producto..." className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 outline-none focus:border-indigo-500" />
        <Button variant="secondary" onClick={() => setQuery(search)}>Buscar</Button>
        {query && <Button variant="ghost" onClick={() => { setQuery(''); setSearch(''); }}>✕</Button>}
      </div>

      {loading && <LoadingSpinner />}
      {error && <div className="text-center py-8 text-red-500">{error}</div>}
      {!loading && !error && products.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-2">📦</div>
          <p>No hay productos. {user?.role === 'ADMIN' && 'Crea uno para comenzar.'}</p>
        </div>
      )}

      {!loading && products.length > 0 && (
        <>
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Producto</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Categoría</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Precio</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Stock</th>
                  {user?.role === 'ADMIN' && <th className="px-4 py-3" />}
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => (
                  <tr key={p.id} className={`border-b last:border-0 ${i % 2 === 0 ? '' : 'bg-gray-50/50'}`}>
                    <td className="px-4 py-3">
                      <div className="font-medium">{p.name}</div>
                      {p.description && <div className="text-xs text-gray-500 truncate max-w-xs">{p.description}</div>}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{p.category.name}</td>
                    <td className="px-4 py-3 text-right font-medium">${Number(p.price).toLocaleString('es-CO')}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.stock === 0 ? 'bg-red-100 text-red-700' : p.stock < 10 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                        {p.stock}
                      </span>
                    </td>
                    {user?.role === 'ADMIN' && (
                      <td className="px-4 py-3">
                        <div className="flex gap-2 justify-end">
                          <Link href={`/products/${p.id}/edit`}><Button variant="secondary" className="text-xs py-1 px-2">Editar</Button></Link>
                          <Button variant="danger" className="text-xs py-1 px-2" onClick={() => setDeleting(p)}>Eliminar</Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
              <span>Página {page} de {meta.totalPages} · {meta.total} productos</span>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => refetch(page - 1)} disabled={page === 1}>‹ Anterior</Button>
                <Button variant="secondary" onClick={() => refetch(page + 1)} disabled={page === meta.totalPages}>Siguiente ›</Button>
              </div>
            </div>
          )}
        </>
      )}

      <Modal open={!!deleting} title="Confirmar eliminación" onClose={() => setDeleting(null)}>
        <p className="text-sm text-gray-600 mb-4">¿Eliminar <strong>{deleting?.name}</strong>? Esta acción no se puede deshacer.</p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setDeleting(null)}>Cancelar</Button>
          <Button variant="danger" onClick={handleDelete}>Eliminar</Button>
        </div>
      </Modal>
    </div>
  );
}
