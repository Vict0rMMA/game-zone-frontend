'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/auth.service';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) router.replace('/dashboard');
  }, [user, authLoading, router]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e.name = 'Mínimo 2 caracteres';
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
      await authService.register(form);
      toast.success('Cuenta creada. ¡A jugar! 🎮');
      router.push('/login');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error al registrarse';
      setErrors({ general: msg });
    } finally { setLoading(false); }
  };

  const inputStyle = (field: string) => ({
    background: 'var(--bg2)', border: `1px solid ${errors[field] ? 'var(--danger)' : 'var(--border)'}`, color: 'var(--text)'
  });

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: 'var(--bg)' }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full opacity-8 blur-3xl" style={{ background: 'var(--accent2)' }} />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🕹️</div>
          <h1 className="text-3xl font-black tracking-widest uppercase" style={{ color: 'var(--accent)', textShadow: '0 0 30px rgba(57,255,20,0.4)' }}>
            GAME<span style={{ color: 'var(--text)' }}>ZONE</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Únete a la comunidad gamer</p>
        </div>

        <div className="rounded-2xl p-8" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 0 40px rgba(0,212,255,0.05)' }}>
          <h2 className="text-lg font-bold mb-6 uppercase tracking-wider">Crear cuenta</h2>

          {errors.general && (
            <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.3)', color: 'var(--danger)' }}>
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            {[
              { key: 'name', label: 'Nombre de usuario', type: 'text', placeholder: 'ProGamer123', auto: 'name' },
              { key: 'email', label: 'Correo electrónico', type: 'email', placeholder: 'tu@correo.com', auto: 'email' },
              { key: 'password', label: 'Contraseña', type: 'password', placeholder: '••••••••', auto: 'new-password' },
            ].map(({ key, label, type, placeholder, auto }) => (
              <div key={key} className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>{label}</label>
                <input type={type} value={form[key as keyof typeof form]} onChange={e => set(key, e.target.value)}
                  placeholder={placeholder} autoComplete={auto}
                  className="px-4 py-3 rounded-xl text-sm outline-none"
                  style={inputStyle(key)} />
                {errors[key] && <p className="text-xs" style={{ color: 'var(--danger)' }}>{errors[key]}</p>}
              </div>
            ))}

            <button type="submit" disabled={loading}
              className="mt-2 py-3 rounded-xl font-black uppercase tracking-wider text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: 'var(--accent2)', color: '#050806', boxShadow: loading ? 'none' : '0 0 20px rgba(0,212,255,0.3)' }}>
              {loading ? <><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> Creando...</> : 'CREAR CUENTA →'}
            </button>
          </form>

          <div className="mt-6 pt-6 text-center text-sm" style={{ borderTop: '1px solid var(--border)', color: 'var(--muted)' }}>
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="font-bold" style={{ color: 'var(--accent)' }}>Iniciar sesión</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
