'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import toast from 'react-hot-toast';

const FALLBACK = 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=200&auto=format&fit=crop';

export default function CartPage() {
  const { items, count, total, removeItem, updateQty, clear } = useCart();
  const router = useRouter();

  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <p style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛒</p>
        <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Tu carrito está vacío
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
          Agrega juegos o periféricos desde el catálogo.
        </p>
        <Link href="/products" style={{
          display: 'inline-block', padding: '0.7rem 1.5rem', borderRadius: '10px',
          background: 'var(--accent)', color: '#050806',
          fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.88rem',
          letterSpacing: '0.06em', textDecoration: 'none',
        }}>
          Ver catálogo →
        </Link>
      </div>
    );
  }

  const handleCheckout = () => {
    if (items.length === 1) {
      const item = items[0];
      router.push(`/checkout?name=${encodeURIComponent(item.name)}&price=${item.price * item.quantity}&image=${encodeURIComponent(item.image ?? '')}`);
    } else {
      router.push(`/checkout?name=${encodeURIComponent(`${count} productos`)}&price=${total}&image=`);
    }
  };

  return (
    <div style={{ maxWidth: 780, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '1.6rem', fontWeight: 700, letterSpacing: '0.04em', marginBottom: '0.2rem' }}>
            Carrito de compras
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>{count} {count === 1 ? 'artículo' : 'artículos'}</p>
        </div>
        <button
          onClick={() => { clear(); toast.success('Carrito vaciado'); }}
          style={{
            padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer',
            background: 'rgba(255,23,68,0.08)', color: '#ff6b8a',
            border: '1px solid rgba(255,23,68,0.22)', fontSize: '0.82rem', fontFamily: 'var(--font-body)',
          }}>
          Vaciar carrito
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {items.map(item => (
          <div key={item.id} style={{
            display: 'flex', alignItems: 'center', gap: '1rem',
            padding: '0.85rem 1rem', borderRadius: '14px',
            background: 'var(--surface)', border: '1px solid var(--border)',
          }}>
            <img
              src={item.image || FALLBACK}
              alt={item.name}
              style={{ width: 80, height: 52, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
              onError={e => { (e.target as HTMLImageElement).src = FALLBACK; }}
            />

            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.name}
              </p>
              <p style={{ color: 'var(--accent)', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.95rem' }}>
                {item.price === 0 ? 'Gratis' : `$${(item.price * item.quantity).toLocaleString('es-CO')}`}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
              <button
                onClick={() => updateQty(item.id, item.quantity - 1)}
                style={{ width: 30, height: 30, borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                −
              </button>
              <span style={{ minWidth: 24, textAlign: 'center', fontWeight: 700, fontSize: '0.9rem' }}>{item.quantity}</span>
              <button
                onClick={() => updateQty(item.id, item.quantity + 1)}
                style={{ width: 30, height: 30, borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                +
              </button>
            </div>

            <button
              onClick={() => { removeItem(item.id); toast.success('Eliminado del carrito'); }}
              style={{ width: 32, height: 32, borderRadius: '8px', border: '1px solid rgba(255,23,68,0.22)', background: 'rgba(255,23,68,0.06)', color: '#ff6b8a', cursor: 'pointer', fontSize: '0.9rem', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              ✕
            </button>
          </div>
        ))}
      </div>

      <div style={{ borderRadius: '16px', padding: '1.25rem', background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
          <span style={{ color: 'var(--muted)' }}>Subtotal ({count} artículos)</span>
          <span>${total.toLocaleString('es-CO')}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '1rem' }}>
          <span style={{ color: 'var(--muted)' }}>Descuento</span>
          <span style={{ color: 'var(--accent)' }}>$0</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: 700, paddingTop: '0.75rem', borderTop: '1px solid var(--border)', marginBottom: '1.25rem' }}>
          <span>Total</span>
          <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-head)' }}>${total.toLocaleString('es-CO')}</span>
        </div>
        <button
          onClick={handleCheckout}
          style={{
            width: '100%', padding: '0.9rem', borderRadius: '12px', border: 'none', cursor: 'pointer',
            background: 'var(--accent)', color: '#050806',
            fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1rem', letterSpacing: '0.06em',
            boxShadow: '0 0 20px rgba(0,230,118,0.25)',
          }}>
          🔒 Proceder al pago
        </button>
        <Link href="/products" style={{ display: 'block', textAlign: 'center', marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--muted)', textDecoration: 'none' }}>
          ← Seguir comprando
        </Link>
      </div>
    </div>
  );
}
