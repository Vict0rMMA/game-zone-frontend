'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/auth.service';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
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
      toast.success(`Bienvenido, ${result.user.name} 🎮`);
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error al iniciar sesión';
      setErrors({ general: msg });
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: 'var(--accent)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-8 blur-3xl" style={{ background: 'var(--accent2)' }} />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🎮</div>
          <h1 className="text-3xl font-black tracking-widest uppercase" style={{ color: 'var(--accent)', textShadow: '0 0 30px rgba(57,255,20,0.4)' }}>
            GAME<span style={{ color: 'var(--text)' }}>ZONE</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Tu tienda de videojuegos</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 0 40px rgba(57,255,20,0.05)' }}>
          <h2 className="text-lg font-bold mb-6 uppercase tracking-wider">Iniciar sesión</h2>

          {errors.general && (
            <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.3)', color: 'var(--danger)' }}>
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Correo electrónico</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                placeholder="tu@correo.com" autoComplete="email"
                className="px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{ background: 'var(--bg2)', border: `1px solid ${errors.email ? 'var(--danger)' : 'var(--border)'}`, color: 'var(--text)' }} />
              {errors.email && <p className="text-xs" style={{ color: 'var(--danger)' }}>{errors.email}</p>}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Contraseña</label>
              <input type="password" value={form.password} onChange={e => set('password', e.target.value)}
                placeholder="••••••••" autoComplete="current-password"
                className="px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{ background: 'var(--bg2)', border: `1px solid ${errors.password ? 'var(--danger)' : 'var(--border)'}`, color: 'var(--text)' }} />
              {errors.password && <p className="text-xs" style={{ color: 'var(--danger)' }}>{errors.password}</p>}
            </div>

            <button type="submit" disabled={loading}
              className="mt-2 py-3 rounded-xl font-black uppercase tracking-wider text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: 'var(--accent)', color: '#050806', boxShadow: loading ? 'none' : '0 0 20px rgba(57,255,20,0.3)' }}>
              {loading ? <><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> Entrando...</> : 'ENTRAR →'}
            </button>
          </form>

          <div className="mt-6 pt-6 text-center text-sm" style={{ borderTop: '1px solid var(--border)', color: 'var(--muted)' }}>
            ¿Sin cuenta?{' '}
            <Link href="/register" className="font-bold" style={{ color: 'var(--accent2)' }}>Regístrate gratis</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
