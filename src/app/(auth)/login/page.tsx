'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/auth.service';
import toast from 'react-hot-toast';

const BG = 'https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/library_hero.jpg';

export default function LoginPage() {
  const { login, user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) router.replace('/dashboard');
  }, [user, authLoading, router]);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ email: '', password: '' });
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Correo inválido';
    if (form.password.length < 6) e.password = 'Mínimo 6 caracteres';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const result = await authService.login(form);
      login(result.token, result.user);
      toast.success(`Bienvenido, ${result.user.name}`);
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Credenciales incorrectas';
      setErrors({ general: msg });
    } finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'var(--font-body)', background: '#07090f' }}>

      {/* ── IZQUIERDA — imagen con overlay ─────────────────────────── */}
      <div style={{
        flex: 1, position: 'relative', overflow: 'hidden',
        display: 'none',
      }} className="lg:block" >
        {/* Imagen de fondo */}
        <img
          src={BG}
          alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        {/* Gradiente oscuro */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to right, rgba(7,9,15,0.15) 0%, rgba(7,9,15,0.6) 70%, rgba(7,9,15,0.98) 100%)',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(7,9,15,0.9) 0%, transparent 50%)',
        }} />

        {/* Contenido sobre la imagen */}
        <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '2.5rem 3rem' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem',
            }}>🎮</div>
            <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1.4rem', letterSpacing: '0.1em', color: '#fff' }}>
              GAME<span style={{ color: 'var(--accent)' }}>ZONE</span>
            </span>
          </div>

          {/* Texto inferior */}
          <div>
            <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '0.75rem' }}>
              Tu tienda gamer
            </p>
            <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '3rem', fontWeight: 700, lineHeight: 1.15, color: '#fff', marginBottom: '1.25rem', letterSpacing: '0.02em' }}>
              Juegos, periféricos<br />y mucho más.
            </h1>
            <div style={{ display: 'flex', gap: '2rem' }}>
              {[['200+', 'Títulos'], ['26', 'Géneros'], ['24/7', 'Soporte']].map(([v, l]) => (
                <div key={l}>
                  <div style={{ fontFamily: 'var(--font-head)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--accent)', lineHeight: 1 }}>{v}</div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 3 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── DERECHA — formulario ────────────────────────────────────── */}
      <div style={{
        width: '100%', maxWidth: 460,
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '3rem 2.5rem',
        background: '#07090f',
        borderLeft: '1px solid rgba(255,255,255,0.05)',
      }}>
        {/* Logo móvil */}
        <div className="lg:hidden" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2.5rem' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>🎮</div>
          <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1.3rem', letterSpacing: '0.1em' }}>
            GAME<span style={{ color: 'var(--accent)' }}>ZONE</span>
          </span>
        </div>

        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#fff', marginBottom: '0.35rem', fontFamily: 'var(--font-head)', letterSpacing: '0.03em' }}>
          Iniciar sesión
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--muted)', marginBottom: '2rem' }}>
          ¿Sin cuenta?{' '}
          <Link href="/register" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
            Crear una gratis
          </Link>
        </p>

        {errors.general && (
          <div style={{
            marginBottom: '1.25rem', padding: '0.75rem 1rem', borderRadius: 10, fontSize: '0.85rem',
            background: 'rgba(255,23,68,0.07)', border: '1px solid rgba(255,23,68,0.18)', color: '#ff6b8a',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}>
            <span style={{ fontSize: '0.9rem' }}>⚠</span> {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }} noValidate>
          {[
            { key: 'email',    label: 'Correo electrónico', type: 'email',    placeholder: 'tu@correo.com', auto: 'email' },
            { key: 'password', label: 'Contraseña',         type: 'password', placeholder: '••••••••',      auto: 'current-password' },
          ].map(({ key, label, type, placeholder, auto }) => (
            <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.04em' }}>
                {label}
              </label>
              <input
                type={type}
                value={form[key as keyof typeof form]}
                onChange={e => set(key, e.target.value)}
                placeholder={placeholder}
                autoComplete={auto}
                style={{
                  padding: '0.8rem 1rem', borderRadius: 10, fontSize: '0.9rem',
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${errors[key] ? 'rgba(255,23,68,0.35)' : 'rgba(255,255,255,0.09)'}`,
                  color: '#e8eaf6', outline: 'none', fontFamily: 'var(--font-body)',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
                onFocus={e => {
                  e.target.style.borderColor = 'rgba(0,230,118,0.35)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(0,230,118,0.05)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = errors[key] ? 'rgba(255,23,68,0.35)' : 'rgba(255,255,255,0.09)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              {errors[key] && <p style={{ fontSize: '0.73rem', color: '#ff6b8a', marginTop: 1 }}>{errors[key]}</p>}
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '0.5rem', padding: '0.85rem', borderRadius: 10, border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              background: loading ? 'rgba(0,230,118,0.35)' : 'var(--accent)',
              color: '#040d06',
              fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.08em',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              transition: 'opacity 0.15s, transform 0.15s',
            }}
            onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.opacity = '0.88'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
          >
            {loading
              ? <><span style={{ width: 16, height: 16, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />ENTRANDO...</>
              : 'ENTRAR →'}
          </button>
        </form>

        <p style={{ marginTop: '2rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}>
          GameZone · Todos los derechos reservados
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (min-width: 1024px) { .lg\\:block { display: block !important; } .lg\\:hidden { display: none !important; } }
      `}</style>
    </div>
  );
}
