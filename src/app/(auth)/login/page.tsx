'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/auth.service';
import toast from 'react-hot-toast';

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
    setErrors(e); return Object.keys(e).length === 0;
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
    <div className="min-h-screen flex" style={{ background: 'var(--bg)', fontFamily: 'var(--font-body)' }}>
      {/* LEFT — Visual */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center p-16"
        style={{ background: 'linear-gradient(135deg, #080a12 0%, #0c0f1e 100%)' }}>
        {/* BG effects */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 25% 35%, rgba(0,230,118,0.07) 0%, transparent 50%), radial-gradient(circle at 75% 65%, rgba(41,121,255,0.06) 0%, transparent 50%)',
        }} />
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        <div className="relative z-10 max-w-lg">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ background: 'linear-gradient(135deg, var(--accent), #00bfa5)', boxShadow: '0 0 24px var(--accent-glow)' }}>
              🎮
            </div>
            <span style={{ fontFamily: 'var(--font-head)', fontSize: '1.6rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text)' }}>
              GAME<span style={{ color: 'var(--accent)' }}>ZONE</span>
            </span>
          </div>

          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '3.5rem', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.01em', color: 'var(--text)', marginBottom: '1.5rem' }}>
            Tu universo<br />
            <span style={{ color: 'var(--accent)' }}>gaming</span><br />
            empieza aquí.
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '3rem' }}>
            Más de 200 títulos, periféricos pro y ofertas exclusivas cada semana para los verdaderos gamers.
          </p>

          <div className="grid grid-cols-3 gap-4">
            {[['200+', 'Juegos'], ['50+', 'Marcas'], ['24/7', 'Soporte']].map(([v, l]) => (
              <div key={l} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                <div style={{ fontFamily: 'var(--font-head)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent)', lineHeight: 1 }}>{v}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '0.25rem' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT — Form */}
      <div className="w-full lg:w-[480px] flex items-center justify-center p-8 relative"
        style={{ background: 'var(--bg2)', borderLeft: '1px solid var(--border)' }}>
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(0,230,118,0.04) 0%, transparent 50%)',
          pointerEvents: 'none',
        }} />

        <div className="relative w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <span className="text-2xl">🎮</span>
            <span style={{ fontFamily: 'var(--font-head)', fontSize: '1.4rem', fontWeight: 700, letterSpacing: '0.08em' }}>
              GAME<span style={{ color: 'var(--accent)' }}>ZONE</span>
            </span>
          </div>

          <div className="mb-8">
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '1.75rem', fontWeight: 700, letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
              Iniciar sesión
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
              ¿Sin cuenta?{' '}
              <Link href="/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>Crear una gratis</Link>
            </p>
          </div>

          {errors.general && (
            <div className="mb-5 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
              style={{ background: 'rgba(255,23,68,0.08)', border: '1px solid rgba(255,23,68,0.2)', color: '#ff6b8a' }}>
              <span>⚠</span> {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            {[
              { key: 'email', label: 'Correo electrónico', type: 'email', placeholder: 'tu@correo.com', auto: 'email' },
              { key: 'password', label: 'Contraseña', type: 'password', placeholder: '••••••••', auto: 'current-password' },
            ].map(({ key, label, type, placeholder, auto }) => (
              <div key={key}>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: '0.5rem' }}>
                  {label}
                </label>
                <input type={type} value={form[key as keyof typeof form]} onChange={e => set(key, e.target.value)}
                  placeholder={placeholder} autoComplete={auto}
                  style={{
                    width: '100%', padding: '0.875rem 1rem', borderRadius: '0.75rem', fontSize: '0.9rem',
                    background: 'var(--surface)', border: `1px solid ${errors[key] ? 'rgba(255,23,68,0.4)' : 'var(--border2)'}`,
                    color: 'var(--text)', outline: 'none', fontFamily: 'var(--font-body)',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(0,230,118,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,230,118,0.06)'; }}
                  onBlur={e => { e.target.style.borderColor = errors[key] ? 'rgba(255,23,68,0.4)' : 'var(--border2)'; e.target.style.boxShadow = 'none'; }}
                />
                {errors[key] && <p style={{ color: '#ff6b8a', fontSize: '0.75rem', marginTop: '0.3rem' }}>{errors[key]}</p>}
              </div>
            ))}

            <button type="submit" disabled={loading}
              className="flex items-center justify-center gap-2"
              style={{
                width: '100%', padding: '0.9rem', borderRadius: '0.75rem', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                background: loading ? 'rgba(0,230,118,0.4)' : 'var(--accent)', color: '#050d08',
                fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.08em',
                boxShadow: loading ? 'none' : '0 0 24px rgba(0,230,118,0.25), 0 4px 12px rgba(0,0,0,0.3)',
              }}>
              {loading ? <><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />ENTRANDO...</> : 'ENTRAR →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
