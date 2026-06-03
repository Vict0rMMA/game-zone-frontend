'use client';
import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
function NequiLogo({ size = 38 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.82} viewBox="0 0 46 38" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Teal shape — back-left */}
      <rect x="1" y="5" width="26" height="26" rx="7"
        fill="#00C4B4"
        transform="rotate(-22 14 18)" />
      {/* Pink/magenta shape — back-right */}
      <rect x="19" y="5" width="26" height="26" rx="7"
        fill="#E91E8C"
        transform="rotate(22 32 18)" />
      {/* Dark navy shape — front-center */}
      <rect x="10" y="2" width="26" height="26" rx="7"
        fill="#1B1464"
        transform="rotate(0 23 15)" />
    </svg>
  );
}

function BancolombiaoLogo({ size = 42 }: { size?: number }) {
  const h = size * 0.7;
  return (
    <svg width={size} height={h} viewBox="0 0 60 42" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Blue stripe */}
      <path d="M3 4 Q30 -1 57 7 L55 17 Q28 9 3 14 Z" fill="#003DA5" />
      {/* Yellow stripe */}
      <path d="M3 17 Q30 10 57 18 L55 28 Q28 20 3 25 Z" fill="#F5C400" />
      {/* Red stripe */}
      <path d="M3 28 Q30 22 57 30 L55 40 Q28 32 3 37 Z" fill="#E31837" />
    </svg>
  );
}

const FALLBACK = 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=460&auto=format&fit=crop';

const inp = (err: boolean): React.CSSProperties => ({
  width: '100%', padding: '0.85rem 1rem', borderRadius: '10px', fontSize: '0.88rem',
  background: 'var(--surface2)', color: 'var(--text)', outline: 'none',
  border: `1px solid ${err ? 'rgba(255,23,68,0.5)' : 'rgba(255,255,255,0.1)'}`,
  fontFamily: 'var(--font-body)',
});

function CheckoutContent() {
  const params = useSearchParams();
  const router = useRouter();
  const name  = params.get('name')  ?? 'Juego';
  const price = Number(params.get('price') ?? 0);
  const image = params.get('image') ?? '';

  const [step,    setStep]    = useState<'form' | 'processing' | 'success'>('form');
  const [method,  setMethod]  = useState<'card' | 'nequi' | 'bancolombia'>('card');
  const [form,    setForm]    = useState({ card: '', expiry: '', cvv: '', holder: '', phone: '', accountType: 'ahorros', accountNum: '' });
  const [errors,  setErrors]  = useState<Record<string, string>>({});

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));
  const fmtCard   = (v: string) => v.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim();
  const fmtExpiry = (v: string) => { const d = v.replace(/\D/g,'').slice(0,4); return d.length>2?`${d.slice(0,2)}/${d.slice(2)}`:d; };

  const validate = () => {
    const e: Record<string,string> = {};
    if (method === 'card') {
      if (form.card.replace(/\s/g,'').length < 16) e.card = 'Número inválido';
      if (form.expiry.length < 5)                   e.expiry = 'Fecha inválida';
      if (form.cvv.length < 3)                      e.cvv = 'CVV inválido';
      if (form.holder.trim().length < 3)             e.holder = 'Nombre requerido';
    } else if (method === 'nequi') {
      if (form.phone.replace(/\D/g,'').length < 10) e.phone = 'Número de celular inválido';
    } else {
      if (form.accountNum.replace(/\D/g,'').length < 6) e.accountNum = 'Número de cuenta inválido';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setStep('processing');
    setTimeout(() => setStep('success'), 2500);
  };

  const methodBtn = (id: typeof method, label: string, logo: React.ReactNode) => (
    <button type="button" onClick={() => setMethod(id)} style={{
      flex: 1, padding: '0.75rem 0.5rem', borderRadius: '12px', cursor: 'pointer',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem',
      background: method === id ? 'rgba(0,230,118,0.08)' : 'var(--surface2)',
      border: `2px solid ${method === id ? 'rgba(0,230,118,0.4)' : 'rgba(255,255,255,0.07)'}`,
      transition: 'all 0.18s', fontFamily: 'var(--font-body)',
    }}>
      {logo}
      <span style={{ fontSize: '0.65rem', fontWeight: 600, color: method === id ? 'var(--accent)' : 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
    </button>
  );
  if (step === 'processing') return (
    <div className="max-w-sm mx-auto text-center py-20">
      <div style={{ width: 64, height: 64, borderRadius: '50%', border: '4px solid rgba(0,230,118,0.2)', borderTopColor: 'var(--accent)', animation: 'spin 0.8s linear infinite', margin: '0 auto 1.5rem' }} />
      <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '1.3rem', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
        {method === 'nequi' ? 'Esperando confirmación Nequi...' : method === 'bancolombia' ? 'Conectando con Bancolombia...' : 'Procesando pago...'}
      </h2>
      <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>No cierres esta ventana</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
  if (step === 'success') return (
    <div className="max-w-sm mx-auto text-center py-12">
      <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(0,230,118,0.1)', border: '2px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '2rem', boxShadow: '0 0 40px rgba(0,230,118,0.2)' }}>✓</div>
      <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--accent)', marginBottom: '0.5rem' }}>¡Pago exitoso!</h2>
      <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginBottom: '0.25rem' }}>Compraste <strong style={{ color: 'var(--text)' }}>{name}</strong></p>
      <p style={{ color: 'var(--muted)', fontSize: '0.82rem', marginBottom: '2rem' }}>Recibirás el código en tu correo en los próximos minutos.</p>

      <div style={{ borderRadius: '14px', padding: '1.1rem 1.25rem', background: 'var(--surface)', border: '1px solid var(--border)', marginBottom: '1.5rem', textAlign: 'left' }}>
        {[
          ['Orden #', `GZ-${Math.floor(Math.random()*900000+100000)}`],
          ['Producto', name],
          ['Método', method === 'card' ? 'Tarjeta débito/crédito' : method === 'nequi' ? 'Nequi' : 'PSE Bancolombia'],
          ['Total', price === 0 ? 'Gratis' : `$${price.toLocaleString('es-CO')}`],
        ].map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', padding: '0.4rem 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--muted)' }}>{k}</span>
            <span style={{ fontWeight: 600 }}>{v}</span>
          </div>
        ))}
      </div>

      <Link href="/products" style={{ display: 'block', padding: '0.85rem', borderRadius: '12px', background: 'var(--accent)', color: '#050806', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.06em', textDecoration: 'none', textAlign: 'center', boxShadow: '0 0 20px rgba(0,230,118,0.25)' }}>
        🎮 Seguir comprando
      </Link>
    </div>
  );
  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '1.2rem' }}>←</button>
        <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.04em' }}>Finalizar compra</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>
        <form onSubmit={handlePay} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }} noValidate>

          {/* Payment method selector */}
          <div style={{ borderRadius: '16px', padding: '1.25rem', background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: '1rem' }}>Método de pago</p>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              {methodBtn('card', 'Tarjeta débito/crédito',
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <div style={{ width: 28, height: 18, borderRadius: 4, background: '#1A1F71', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: '#fff', fontSize: '0.55rem', fontWeight: 900, fontStyle: 'italic' }}>VISA</span>
                  </div>
                  <div style={{ width: 24, height: 18, borderRadius: 4, overflow: 'hidden', display: 'flex' }}>
                    <div style={{ flex: 1, background: '#EB001B' }} />
                    <div style={{ flex: 1, background: '#F79E1B' }} />
                  </div>
                </div>
              )}
              {methodBtn('nequi', 'Nequi',
                <NequiLogo size={38} />
              )}
              {methodBtn('bancolombia', 'Bancolombia',
                <BancolombiaoLogo size={42} />
              )}
            </div>
          </div>

          {/* Card form */}
          {method === 'card' && (
            <div style={{ borderRadius: '16px', padding: '1.25rem', background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)' }}>Datos de la tarjeta</p>

              {/* Card brands */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {[
                  { label: 'VISA',   bg: '#1A1F71', color: '#fff'   },
                  { label: 'MC',     bg: '#EB001B', color: '#fff'   },
                  { label: 'AMEX',   bg: '#007BC1', color: '#fff'   },
                  { label: 'DINERS', bg: '#004A97', color: '#fff'   },
                ].map(b => (
                  <div key={b.label} style={{ padding: '0.25rem 0.7rem', borderRadius: '6px', background: b.bg, color: b.color, fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.05em' }}>{b.label}</div>
                ))}
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.4rem' }}>Nombre en la tarjeta</label>
                <input value={form.holder} onChange={e => set('holder', e.target.value.toUpperCase())} placeholder="JUAN PÉREZ" style={inp(!!errors.holder)}
                  onFocus={e => e.target.style.borderColor='rgba(0,230,118,0.4)'} onBlur={e => e.target.style.borderColor=errors.holder?'rgba(255,23,68,0.5)':'rgba(255,255,255,0.1)'} />
                {errors.holder && <p style={{ color:'#ff6b8a', fontSize:'0.72rem', marginTop:'0.25rem' }}>{errors.holder}</p>}
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.4rem' }}>Número de tarjeta</label>
                <input value={form.card} onChange={e => set('card', fmtCard(e.target.value))} placeholder="1234 5678 9012 3456" maxLength={19} style={{ ...inp(!!errors.card), fontFamily: 'monospace', letterSpacing: '0.1em' }}
                  onFocus={e => e.target.style.borderColor='rgba(0,230,118,0.4)'} onBlur={e => e.target.style.borderColor=errors.card?'rgba(255,23,68,0.5)':'rgba(255,255,255,0.1)'} />
                {errors.card && <p style={{ color:'#ff6b8a', fontSize:'0.72rem', marginTop:'0.25rem' }}>{errors.card}</p>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.4rem' }}>Vencimiento</label>
                  <input value={form.expiry} onChange={e => set('expiry', fmtExpiry(e.target.value))} placeholder="MM/AA" maxLength={5} style={{ ...inp(!!errors.expiry), fontFamily: 'monospace' }}
                    onFocus={e => e.target.style.borderColor='rgba(0,230,118,0.4)'} onBlur={e => e.target.style.borderColor=errors.expiry?'rgba(255,23,68,0.5)':'rgba(255,255,255,0.1)'} />
                  {errors.expiry && <p style={{ color:'#ff6b8a', fontSize:'0.72rem', marginTop:'0.25rem' }}>{errors.expiry}</p>}
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.4rem' }}>CVV</label>
                  <input value={form.cvv} onChange={e => set('cvv', e.target.value.replace(/\D/g,'').slice(0,4))} placeholder="•••" maxLength={4} type="password" style={{ ...inp(!!errors.cvv), fontFamily: 'monospace' }}
                    onFocus={e => e.target.style.borderColor='rgba(0,230,118,0.4)'} onBlur={e => e.target.style.borderColor=errors.cvv?'rgba(255,23,68,0.5)':'rgba(255,255,255,0.1)'} />
                  {errors.cvv && <p style={{ color:'#ff6b8a', fontSize:'0.72rem', marginTop:'0.25rem' }}>{errors.cvv}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Nequi / PSE form */}
          {(method === 'nequi' || method === 'bancolombia') && (
            <div style={{ borderRadius: '16px', padding: '1.25rem', background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '10px', background: method === 'nequi' ? 'rgba(108,27,198,0.08)' : 'rgba(0,44,118,0.08)', border: `1px solid ${method === 'nequi' ? 'rgba(108,27,198,0.25)' : 'rgba(0,44,118,0.25)'}` }}>
                <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                  {method === 'nequi' ? <NequiLogo size={42} /> : <BancolombiaoLogo size={48} />}
                </div>
                <div>
                  <p style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.1rem' }}>{method === 'nequi' ? 'Pago con Nequi' : 'PSE — Bancolombia'}</p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{method === 'nequi' ? 'Recibirás una notificación push para aprobar el pago' : 'Serás redirigido al portal PSE de Bancolombia'}</p>
                </div>
              </div>
              {method === 'nequi' ? (
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.4rem' }}>Número de celular</label>
                  <input value={form.phone} onChange={e => set('phone', e.target.value.replace(/\D/g,'').slice(0,10))} placeholder="300 123 4567" style={{ ...inp(!!errors.phone), fontFamily: 'monospace', letterSpacing: '0.08em' }}
                    onFocus={e => e.target.style.borderColor='rgba(0,230,118,0.4)'} onBlur={e => e.target.style.borderColor=errors.phone?'rgba(255,23,68,0.5)':'rgba(255,255,255,0.1)'} />
                  {errors.phone && <p style={{ color:'#ff6b8a', fontSize:'0.72rem', marginTop:'0.25rem' }}>{errors.phone}</p>}
                </div>
              ) : (
                <>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.4rem' }}>Tipo de cuenta</label>
                    <select value={form.accountType} onChange={e => set('accountType', e.target.value)}
                      style={{ ...inp(false), cursor: 'pointer' }}>
                      <option value="ahorros">Cuenta de Ahorros</option>
                      <option value="corriente">Cuenta Corriente</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.4rem' }}>Número de cuenta</label>
                    <input value={form.accountNum} onChange={e => set('accountNum', e.target.value.replace(/\D/g,'').slice(0,16))} placeholder="0000000000000000" style={{ ...inp(!!errors.accountNum), fontFamily: 'monospace', letterSpacing: '0.08em' }}
                      onFocus={e => e.target.style.borderColor='rgba(0,230,118,0.4)'} onBlur={e => e.target.style.borderColor=errors.accountNum?'rgba(255,23,68,0.5)':'rgba(255,255,255,0.1)'} />
                    {errors.accountNum && <p style={{ color:'#ff6b8a', fontSize:'0.72rem', marginTop:'0.25rem' }}>{errors.accountNum}</p>}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Pay button */}
          <button type="submit" style={{
            width: '100%', padding: '1rem', borderRadius: '12px', border: 'none', cursor: 'pointer',
            background: 'var(--accent)', color: '#050806',
            fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1rem', letterSpacing: '0.08em',
            boxShadow: '0 0 24px rgba(0,230,118,0.3)',
          }}>
            🔒 {price === 0 ? 'OBTENER GRATIS' : `PAGAR $${price.toLocaleString('es-CO')}`}
          </button>

          <p style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--muted)' }}>
            🔒 Transacción segura · SSL 256-bit · Demo educativa
          </p>
        </form>
        <div style={{ borderRadius: '16px', padding: '1.25rem', background: 'var(--surface)', border: '1px solid var(--border)', position: 'sticky', top: '1rem' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: '1rem' }}>Resumen del pedido</p>

          <div style={{ borderRadius: '10px', overflow: 'hidden', marginBottom: '1rem', height: '160px' }}>
            <img src={image || FALLBACK} alt={name} style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }}
              onError={e => { (e.target as HTMLImageElement).src = FALLBACK; }} />
          </div>

          <p style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem', lineHeight: 1.3 }}>{name}</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.82rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--muted)' }}>Subtotal</span>
              <span>{price === 0 ? 'Gratis' : `$${price.toLocaleString('es-CO')}`}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--muted)' }}>Descuento</span>
              <span style={{ color: 'var(--accent)' }}>$0</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1rem', borderTop: '1px solid var(--border)', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
              <span>Total</span>
              <span style={{ color: 'var(--accent)' }}>{price === 0 ? 'Gratis' : `$${price.toLocaleString('es-CO')}`}</span>
            </div>
          </div>

          {/* Payment logos */}
          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
            <p style={{ fontSize: '0.62rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Métodos aceptados</p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {/* VISA */}
              <div style={{ padding: '0.3rem 0.65rem', borderRadius: '6px', background: '#1A1F71', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 28 }}>
                <span style={{ color: '#fff', fontSize: '0.65rem', fontWeight: 900, fontStyle: 'italic', letterSpacing: '0.05em' }}>VISA</span>
              </div>
              {/* Mastercard */}
              <div style={{ borderRadius: '6px', overflow: 'hidden', display: 'flex', height: 28, width: 44 }}>
                <div style={{ flex: 1, background: '#EB001B' }} />
                <div style={{ flex: 1, background: '#F79E1B' }} />
              </div>
              {/* Nequi logo */}
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '6px', padding: '2px 6px', height: 28, display: 'flex', alignItems: 'center' }}>
                <NequiLogo size={30} />
              </div>
              {/* Bancolombia logo */}
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '6px', padding: '3px 6px', height: 28, display: 'flex', alignItems: 'center' }}>
                <BancolombiaoLogo size={36} />
              </div>
              {/* AMEX */}
              <div style={{ padding: '0.3rem 0.55rem', borderRadius: '6px', background: '#007BC1', display: 'flex', alignItems: 'center', height: 28 }}>
                <span style={{ color: '#fff', fontSize: '0.58rem', fontWeight: 800 }}>AMEX</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}><div style={{ width: 36, height: 36, borderRadius: '50%', border: '4px solid rgba(0,230,118,0.2)', borderTopColor: 'var(--accent)', animation: 'spin 0.8s linear infinite' }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>}>
      <CheckoutContent />
    </Suspense>
  );
}
