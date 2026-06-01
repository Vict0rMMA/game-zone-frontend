'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const FALLBACK = 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=460&auto=format&fit=crop';

function CheckoutContent() {
  const params = useSearchParams();
  const router = useRouter();
  const name  = params.get('name') ?? 'Juego';
  const price = Number(params.get('price') ?? 0);
  const image = params.get('image') ?? '';

  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');
  const [form, setForm] = useState({ card: '', expiry: '', cvv: '', holder: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const formatCard = (v: string) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const formatExpiry = (v: string) => { const d = v.replace(/\D/g, '').slice(0, 4); return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d; };

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.card.replace(/\s/g, '').length < 16) e.card = 'Número de tarjeta inválido';
    if (form.expiry.length < 5) e.expiry = 'Fecha inválida';
    if (form.cvv.length < 3) e.cvv = 'CVV inválido';
    if (form.holder.trim().length < 3) e.holder = 'Nombre requerido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setStep('processing');
    setTimeout(() => setStep('success'), 2500);
  };

  const inputStyle = (field: string) => ({
    background: 'var(--bg2)',
    border: `1px solid ${errors[field] ? 'var(--danger)' : 'var(--border)'}`,
    color: 'var(--text)',
  });

  if (step === 'processing') return (
    <div className="max-w-md mx-auto text-center py-20">
      <div className="w-16 h-16 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-6"
        style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
      <h2 className="text-xl font-black uppercase tracking-wider mb-2">Procesando pago</h2>
      <p style={{ color: 'var(--muted)' }}>No cierres esta ventana...</p>
    </div>
  );

  if (step === 'success') return (
    <div className="max-w-md mx-auto text-center py-16">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl"
        style={{ background: 'rgba(57,255,20,0.12)', border: '2px solid var(--accent)', boxShadow: '0 0 40px rgba(57,255,20,0.2)' }}>
        ✓
      </div>
      <h2 className="text-2xl font-black uppercase tracking-wider mb-2" style={{ color: 'var(--accent)' }}>¡Pago exitoso!</h2>
      <p className="text-sm mb-2" style={{ color: 'var(--muted)' }}>
        Compraste <strong style={{ color: 'var(--text)' }}>{name}</strong>
      </p>
      <p className="text-sm mb-8" style={{ color: 'var(--muted)' }}>
        Recibirás el código de descarga en tu correo en los próximos minutos.
      </p>

      <div className="rounded-2xl p-4 mb-8 text-left" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="flex justify-between text-sm mb-2">
          <span style={{ color: 'var(--muted)' }}>Orden #</span>
          <span className="font-mono font-bold">GZ-{Math.floor(Math.random() * 900000 + 100000)}</span>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span style={{ color: 'var(--muted)' }}>Producto</span>
          <span>{name}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span style={{ color: 'var(--muted)' }}>Total pagado</span>
          <span className="font-black" style={{ color: 'var(--accent)' }}>
            {price === 0 ? 'Gratis' : `$${price.toLocaleString('es-CO')}`}
          </span>
        </div>
      </div>

      <Link href="/products" className="block py-3 rounded-xl font-black uppercase tracking-wider text-sm text-center"
        style={{ background: 'var(--accent)', color: '#050806', boxShadow: '0 0 20px rgba(57,255,20,0.25)' }}>
        🎮 Seguir comprando
      </Link>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} style={{ color: 'var(--muted)' }}>←</button>
        <h1 className="text-2xl font-black uppercase tracking-wider">💳 Checkout</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Resumen del pedido */}
        <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h2 className="font-bold uppercase tracking-wider text-sm mb-4" style={{ color: 'var(--muted)' }}>Resumen</h2>
          <div className="rounded-xl overflow-hidden mb-4 aspect-video">
            <img src={image || FALLBACK} alt={name} className="w-full h-full object-cover"
              onError={e => { (e.target as HTMLImageElement).src = FALLBACK; }} />
          </div>
          <p className="font-bold mb-3">{name}</p>
          <div className="space-y-2 text-sm" style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
            <div className="flex justify-between"><span style={{ color: 'var(--muted)' }}>Subtotal</span><span>{price === 0 ? 'Gratis' : `$${price.toLocaleString('es-CO')}`}</span></div>
            <div className="flex justify-between"><span style={{ color: 'var(--muted)' }}>Descuento</span><span style={{ color: 'var(--accent)' }}>$0</span></div>
            <div className="flex justify-between font-black text-base pt-2" style={{ borderTop: '1px solid var(--border)' }}>
              <span>Total</span>
              <span style={{ color: 'var(--accent)' }}>{price === 0 ? 'Gratis' : `$${price.toLocaleString('es-CO')}`}</span>
            </div>
          </div>
        </div>

        {/* Formulario de pago */}
        <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h2 className="font-bold uppercase tracking-wider text-sm mb-4" style={{ color: 'var(--muted)' }}>Datos de pago</h2>

          {/* Logos tarjetas */}
          <div className="flex gap-2 mb-4">
            {['VISA', 'MC', 'AMEX'].map(b => (
              <span key={b} className="px-2 py-1 rounded text-xs font-black" style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--muted)' }}>{b}</span>
            ))}
          </div>

          <form onSubmit={handlePay} className="flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Nombre en la tarjeta</label>
              <input value={form.holder} onChange={e => set('holder', e.target.value.toUpperCase())}
                placeholder="JUAN PÉREZ" className="px-4 py-3 rounded-xl text-sm outline-none" style={inputStyle('holder')} />
              {errors.holder && <p className="text-xs" style={{ color: 'var(--danger)' }}>{errors.holder}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Número de tarjeta</label>
              <input value={form.card} onChange={e => set('card', formatCard(e.target.value))}
                placeholder="1234 5678 9012 3456" maxLength={19} className="px-4 py-3 rounded-xl text-sm font-mono outline-none" style={inputStyle('card')} />
              {errors.card && <p className="text-xs" style={{ color: 'var(--danger)' }}>{errors.card}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Vencimiento</label>
                <input value={form.expiry} onChange={e => set('expiry', formatExpiry(e.target.value))}
                  placeholder="MM/AA" maxLength={5} className="px-4 py-3 rounded-xl text-sm font-mono outline-none" style={inputStyle('expiry')} />
                {errors.expiry && <p className="text-xs" style={{ color: 'var(--danger)' }}>{errors.expiry}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>CVV</label>
                <input value={form.cvv} onChange={e => set('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="•••" maxLength={4} type="password" className="px-4 py-3 rounded-xl text-sm font-mono outline-none" style={inputStyle('cvv')} />
                {errors.cvv && <p className="text-xs" style={{ color: 'var(--danger)' }}>{errors.cvv}</p>}
              </div>
            </div>

            <button type="submit" className="py-3 rounded-xl font-black uppercase tracking-wider text-sm mt-2"
              style={{ background: 'var(--accent)', color: '#050806', boxShadow: '0 0 20px rgba(57,255,20,0.25)' }}>
              🔒 {price === 0 ? 'Obtener gratis' : `Pagar $${price.toLocaleString('es-CO')}`}
            </button>

            <p className="text-center text-xs" style={{ color: 'var(--muted)' }}>
              🔒 Pago seguro · SSL cifrado · Demo educativa
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} /></div>}>
      <CheckoutContent />
    </Suspense>
  );
}
