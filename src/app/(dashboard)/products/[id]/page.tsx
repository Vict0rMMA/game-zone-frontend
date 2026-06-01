'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { productService } from '@/services/product.service';
import { useAuth } from '@/contexts/AuthContext';
import { Product } from '@/types/product.types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const FALLBACK = 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=460&auto=format&fit=crop';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productService.getById(id).then(setProduct).catch(() => router.push('/products')).finally(() => setLoading(false));
  }, [id, router]);

  if (loading) return <LoadingSpinner />;
  if (!product) return null;

  const price = Number(product.price);
  const isFree = price === 0;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-lg transition-colors" style={{ color: 'var(--muted)' }}>←</button>
        <h1 className="text-2xl font-black uppercase tracking-wider truncate">{product.name}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Imagen */}
        <div className="rounded-2xl overflow-hidden aspect-video relative" style={{ background: 'var(--surface2)' }}>
          <img src={product.image || FALLBACK} alt={product.name} className="w-full h-full object-cover"
            onError={e => { (e.target as HTMLImageElement).src = FALLBACK; }} />
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl p-5 flex flex-col gap-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div>
              <span className="px-3 py-1 rounded-full text-xs font-bold mr-2"
                style={{ background: 'rgba(0,212,255,0.15)', color: 'var(--accent2)', border: '1px solid rgba(0,212,255,0.2)' }}>
                {product.category.name}
              </span>
            </div>

            <div>
              <div className="text-4xl font-black mb-1" style={{ color: isFree ? 'var(--accent)' : 'var(--text)' }}>
                {isFree ? 'GRATIS' : `$${price.toLocaleString('es-CO')}`}
              </div>
              {!isFree && <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--muted)' }}>IVA incluido</div>}
            </div>

            {product.description && (
              <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{product.description}</p>
            )}

            <div className="flex items-center gap-2 text-sm">
              <span style={{ color: 'var(--muted)' }}>Stock:</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                style={product.stock === 0
                  ? { background: 'rgba(255,71,87,0.1)', color: 'var(--danger)' }
                  : { background: 'rgba(57,255,20,0.1)', color: 'var(--accent)' }}>
                {product.stock === 0 ? 'Sin stock' : `${product.stock} disponibles`}
              </span>
            </div>

            {/* Botones */}
            <div className="flex flex-col gap-2 mt-2">
              {product.stock > 0 && (
                <Link href={`/checkout?product=${product.id}&name=${encodeURIComponent(product.name)}&price=${price}&image=${encodeURIComponent(product.image || '')}`}
                  className="py-3 rounded-xl font-black uppercase tracking-wider text-sm text-center transition-all"
                  style={{ background: 'var(--accent)', color: '#050806', boxShadow: '0 0 20px rgba(57,255,20,0.25)' }}>
                  {isFree ? '⬇️ Obtener gratis' : '🛒 Comprar ahora'}
                </Link>
              )}
              {user?.role === 'ADMIN' && (
                <Link href={`/products/${product.id}/edit`}
                  className="py-2.5 rounded-xl text-sm font-bold text-center"
                  style={{ background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)' }}>
                  ✏️ Editar juego
                </Link>
              )}
            </div>
          </div>

          <div className="rounded-xl p-4 text-xs" style={{ background: 'rgba(57,255,20,0.04)', border: '1px solid rgba(57,255,20,0.1)' }}>
            <p className="font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--accent)' }}>✓ Incluye</p>
            <ul className="flex flex-col gap-1" style={{ color: 'var(--muted)' }}>
              <li>✓ Licencia digital permanente</li>
              <li>✓ Acceso inmediato tras la compra</li>
              <li>✓ Soporte GameZone 24/7</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
