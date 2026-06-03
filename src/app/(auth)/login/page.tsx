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
  const [errors, setErrors]   = useState<Record<string, string>>({});
  const [form, setForm]       = useState({ email: '', password: '' });
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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Outfit:wght@300;400;500;600&display=swap');

        .gz-page {
          min-height: 100vh;
          background: #0a0a0f;
          font-family: 'Outfit', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          padding: 2rem 1rem;
        }

        /* ── Fondo animado ── */
        .gz-bg-orb {
          position: fixed; border-radius: 50%; filter: blur(90px);
          animation: gz-drift 12s ease-in-out infinite alternate;
          pointer-events: none;
        }
        .gz-orb1 { width:380px;height:380px;top:-60px;left:-80px;background:rgba(57,255,20,.07); }
        .gz-orb2 { width:300px;height:300px;bottom:-60px;right:-60px;background:rgba(139,92,246,.07);animation-delay:-5s;animation-duration:16s; }
        .gz-orb3 { width:200px;height:200px;bottom:30%;left:35%;background:rgba(57,255,20,.04);animation-delay:-9s;animation-duration:20s; }
        @keyframes gz-drift { 0%{transform:translate(0,0) scale(1)} 100%{transform:translate(30px,-25px) scale(1.1)} }

        .gz-grid {
          position: fixed; bottom: 0; left: 0; right: 0; height: 40%;
          background:
            repeating-linear-gradient(90deg,rgba(57,255,20,.035) 0px,rgba(57,255,20,.035) 1px,transparent 1px,transparent 80px),
            repeating-linear-gradient(0deg,rgba(57,255,20,.035) 0px,rgba(57,255,20,.035) 1px,transparent 1px,transparent 80px);
          transform: perspective(600px) rotateX(48deg);
          transform-origin: bottom center;
          -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,.4), transparent);
          mask-image: linear-gradient(to top, rgba(0,0,0,.4), transparent);
          pointer-events: none;
        }

        /* ── Partículas ── */
        .gz-p {
          position: fixed; width: 2px; height: 2px;
          background: #39ff14; border-radius: 50%; opacity: 0;
          animation: gz-float 6s ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes gz-float {
          0%{opacity:0;transform:translateY(0)}
          20%{opacity:.7}
          80%{opacity:.2}
          100%{opacity:0;transform:translateY(-100px) translateX(15px)}
        }

        /* ── Card ── */
        .gz-card {
          position: relative; z-index: 1;
          width: 100%; max-width: 440px;
          background: rgba(12,12,20,.75);
          backdrop-filter: blur(40px);
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 20px;
          padding: 2.8rem 2.5rem;
          box-shadow: 0 0 60px rgba(57,255,20,.04), 0 24px 60px rgba(0,0,0,.5);
          animation: gz-in .6s ease forwards;
        }
        .gz-card::before {
          content: '';
          position: absolute; top: 0; left: 15%; right: 15%; height: 1px;
          background: linear-gradient(90deg, transparent, #39ff14, transparent);
          opacity: .6; border-radius: 99px;
        }
        @keyframes gz-in {
          from { opacity:0; transform:translateY(24px) scale(.98); }
          to   { opacity:1; transform:translateY(0)    scale(1);   }
        }

        /* Logo */
        .gz-logo {
          display: flex; align-items: center; gap: 10px;
          justify-content: center; margin-bottom: 2rem;
        }
        .gz-logo-icon {
          width: 38px; height: 38px; border-radius: 9px;
          background: #39ff14;
          display: grid; place-items: center;
          box-shadow: 0 0 20px rgba(57,255,20,.35);
        }
        .gz-logo-name {
          font-family: 'Orbitron', monospace;
          font-weight: 700; font-size: 1.15rem; letter-spacing: 3px;
        }
        .gz-logo-name span { color: #39ff14; }

        /* Heading */
        .gz-title {
          font-family: 'Orbitron', monospace;
          font-size: 1.45rem; font-weight: 700;
          text-align: center; margin-bottom: .35rem;
          color: #e8e8ec;
        }
        .gz-sub {
          text-align: center; font-size: .9rem;
          color: #6b6b80; margin-bottom: 2rem;
        }
        .gz-sub a { color: #39ff14; text-decoration: none; font-weight: 500; }

        /* Error */
        .gz-err {
          background: rgba(239,68,68,.07);
          border: 1px solid rgba(239,68,68,.2);
          color: #f87171; border-radius: 10px;
          padding: 10px 14px; font-size: .84rem;
          margin-bottom: 1.2rem;
          display: flex; align-items: center; gap: 8px;
        }

        /* Fields */
        .gz-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 1.2rem; }
        .gz-label {
          font-size: .75rem; font-weight: 500; letter-spacing: 1.5px;
          text-transform: uppercase; color: #6b6b80;
        }
        .gz-wrap {
          position: relative;
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 12px;
          background: rgba(255,255,255,.025);
          transition: border-color .22s, box-shadow .22s;
        }
        .gz-wrap:focus-within {
          border-color: rgba(57,255,20,.4);
          box-shadow: 0 0 0 3px rgba(57,255,20,.07);
        }
        .gz-wrap input {
          width: 100%; padding: 13px 14px 13px 46px;
          background: transparent; border: none; outline: none;
          color: #e8e8ec; font-family: 'Outfit', sans-serif; font-size: .93rem;
        }
        .gz-wrap input::placeholder { color: #6b6b80; opacity: .6; }
        .gz-ico {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          color: #6b6b80; transition: color .22s; pointer-events: none;
        }
        .gz-wrap:focus-within .gz-ico { color: #39ff14; }
        .gz-ferr { font-size: .72rem; color: #f87171; margin-top: 2px; }

        /* Recordarme */
        .gz-remember {
          display: flex; align-items: center; gap: 8px;
          font-size: .82rem; color: #6b6b80; cursor: pointer; margin-top: 4px;
        }
        .gz-remember input[type=checkbox] {
          appearance: none; width: 15px; height: 15px;
          border: 1px solid rgba(255,255,255,.12); border-radius: 4px;
          background: transparent; cursor: pointer; transition: all .18s;
          flex-shrink: 0;
        }
        .gz-remember input[type=checkbox]:checked {
          background: #39ff14; border-color: #39ff14;
        }

        /* Button */
        .gz-btn {
          width: 100%; margin-top: 1.6rem; padding: 15px;
          border: none; border-radius: 12px;
          background: #39ff14; color: #080a0c;
          font-family: 'Orbitron', monospace;
          font-size: .85rem; font-weight: 700; letter-spacing: 3px;
          cursor: pointer; position: relative; overflow: hidden;
          transition: transform .15s, box-shadow .22s, opacity .15s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .gz-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(57,255,20,.25), 0 0 50px rgba(57,255,20,.12);
        }
        .gz-btn:disabled { opacity: .45; cursor: not-allowed; }
        .gz-btn::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(105deg,transparent 38%,rgba(255,255,255,.28) 44%,rgba(255,255,255,.28) 56%,transparent 62%);
          transform: translateX(-100%); transition: transform .5s;
        }
        .gz-btn:hover:not(:disabled)::after { transform: translateX(100%); }

        .gz-footer {
          text-align: center; margin-top: 1.8rem;
          font-size: .72rem; color: rgba(255,255,255,.18);
        }

        @keyframes gz-spin { to { transform: rotate(360deg); } }
        .gz-spin {
          width: 15px; height: 15px;
          border: 2px solid currentColor; border-top-color: transparent;
          border-radius: 50%; display: inline-block;
          animation: gz-spin .7s linear infinite;
        }
      `}</style>

      {/* BG */}
      <div className="gz-bg-orb gz-orb1" />
      <div className="gz-bg-orb gz-orb2" />
      <div className="gz-bg-orb gz-orb3" />
      <div className="gz-grid" />
      {[{l:'8%',b:'25%',d:'0s'},{l:'22%',b:'15%',d:'1.8s'},{l:'50%',b:'20%',d:'3.2s'},{l:'72%',b:'30%',d:'1s'},{l:'88%',b:'18%',d:'2.5s'}].map((p,i) => (
        <div key={i} className="gz-p" style={{ left:p.l, bottom:p.b, animationDelay:p.d }} />
      ))}

      <div className="gz-page">
        <div className="gz-card">

          {/* Logo */}
          <div className="gz-logo">
            <div className="gz-logo-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#080a0c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 11h4M8 9v4"/>
                <circle cx="15" cy="10" r=".5" fill="#080a0c"/>
                <circle cx="17" cy="12" r=".5" fill="#080a0c"/>
                <path d="M2 8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"/>
              </svg>
            </div>
            <div className="gz-logo-name">GAME<span>ZONE</span></div>
          </div>

          <h2 className="gz-title">Iniciar sesión</h2>
          <p className="gz-sub">¿Sin cuenta? <Link href="/register">Crear una gratis</Link></p>

          {errors.general && (
            <div className="gz-err"><span>⚠</span> {errors.general}</div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="gz-field">
              <label className="gz-label">Correo electrónico</label>
              <div className="gz-wrap">
                <svg className="gz-ico" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
                <input type="email" placeholder="tu@correo.com" autoComplete="email"
                  value={form.email} onChange={e => set('email', e.target.value)} />
              </div>
              {errors.email && <span className="gz-ferr">{errors.email}</span>}
            </div>

            {/* Password */}
            <div className="gz-field">
              <label className="gz-label">Contraseña</label>
              <div className="gz-wrap">
                <svg className="gz-ico" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input type="password" placeholder="••••••••" autoComplete="current-password"
                  value={form.password} onChange={e => set('password', e.target.value)} />
              </div>
              {errors.password && <span className="gz-ferr">{errors.password}</span>}
              <label className="gz-remember">
                <input type="checkbox" /> Recordarme
              </label>
            </div>

            <button className="gz-btn" type="submit" disabled={loading}>
              {loading ? <><span className="gz-spin" />ENTRANDO...</> : 'ENTRAR →'}
            </button>
          </form>

          <p className="gz-footer">GameZone · Todos los derechos reservados</p>
        </div>
      </div>
    </>
  );
}
