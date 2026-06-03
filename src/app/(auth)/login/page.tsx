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

        :root {
          --neon: #39ff14;
          --neon-dim: #39ff1440;
          --neon-glow: #39ff1480;
          --bg-deep: #0a0a0f;
          --border-c: rgba(255,255,255,0.06);
          --text-c: #e8e8ec;
          --text-dim: #6b6b80;
          --accent-purple: #8b5cf6;
        }

        .gz-body { font-family:'Outfit',sans-serif; background:var(--bg-deep); color:var(--text-c); overflow:hidden; height:100vh; min-height:600px; }

        /* BG */
        .gz-bg { position:fixed; inset:0; z-index:0;
          background: radial-gradient(ellipse 80% 60% at 20% 80%,rgba(57,255,20,.06) 0%,transparent 60%),
                      radial-gradient(ellipse 60% 50% at 80% 20%,rgba(139,92,246,.05) 0%,transparent 60%),
                      var(--bg-deep); }
        .gz-grid { position:absolute; bottom:0; left:0; right:0; height:45%;
          background: linear-gradient(transparent 0%,rgba(57,255,20,.03) 100%),
            repeating-linear-gradient(90deg,rgba(57,255,20,.04) 0px,rgba(57,255,20,.04) 1px,transparent 1px,transparent 80px),
            repeating-linear-gradient(0deg,rgba(57,255,20,.04) 0px,rgba(57,255,20,.04) 1px,transparent 1px,transparent 80px);
          transform:perspective(500px) rotateX(45deg); transform-origin:bottom center;
          -webkit-mask-image:linear-gradient(to top,rgba(0,0,0,.5),transparent); mask-image:linear-gradient(to top,rgba(0,0,0,.5),transparent); }
        .gz-orb { position:absolute; border-radius:50%; filter:blur(80px); animation:gz-drift 12s ease-in-out infinite alternate; }
        .gz-orb1 { width:300px;height:300px;top:10%;left:5%;background:rgba(57,255,20,.08); }
        .gz-orb2 { width:250px;height:250px;bottom:20%;right:10%;background:rgba(139,92,246,.07);animation-delay:-4s;animation-duration:15s; }
        .gz-orb3 { width:180px;height:180px;top:50%;left:50%;background:rgba(57,255,20,.05);animation-delay:-8s;animation-duration:18s; }
        @keyframes gz-drift { 0%{transform:translate(0,0) scale(1)} 100%{transform:translate(40px,-30px) scale(1.15)} }

        /* Layout */
        .gz-page { position:relative;z-index:1;display:grid;grid-template-columns:1fr 480px;height:100vh; }

        /* Hero */
        .gz-hero { display:flex;flex-direction:column;justify-content:center;padding:4rem 5rem;position:relative; }
        .gz-brand { position:absolute;top:2.5rem;left:5rem;display:flex;align-items:center;gap:12px; }
        .gz-brand-icon { width:42px;height:42px;background:var(--neon);border-radius:10px;display:grid;place-items:center;box-shadow:0 0 20px var(--neon-dim); }
        .gz-brand-name { font-family:'Orbitron',monospace;font-weight:700;font-size:1.15rem;letter-spacing:3px; }
        .gz-brand-name span { color:var(--neon); }
        .gz-tag { font-family:'Orbitron',monospace;font-size:.7rem;font-weight:600;letter-spacing:5px;color:var(--neon);text-transform:uppercase;margin-bottom:1.2rem;
          opacity:0;animation:gz-up .6s .3s forwards; }
        .gz-h1 { font-family:'Orbitron',monospace;font-size:clamp(2rem,4vw,3.2rem);font-weight:900;line-height:1.2;letter-spacing:-.5px;margin-bottom:1.5rem;
          opacity:0;animation:gz-up .6s .45s forwards; }
        .gz-h1 em { font-style:normal;background:linear-gradient(135deg,var(--neon),var(--accent-purple));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text; }
        .gz-desc { font-size:1.05rem;line-height:1.7;color:var(--text-dim);max-width:440px;opacity:0;animation:gz-up .6s .6s forwards; }
        .gz-stats { display:flex;gap:3rem;margin-top:3rem;opacity:0;animation:gz-up .6s .75s forwards; }
        .gz-stat-val { font-family:'Orbitron',monospace;font-size:1.7rem;font-weight:700;color:var(--neon);text-shadow:0 0 18px var(--neon-dim); }
        .gz-stat-lbl { font-size:.72rem;letter-spacing:2px;text-transform:uppercase;color:var(--text-dim);margin-top:4px; }

        /* Particles */
        .gz-p { position:absolute;width:2px;height:2px;background:var(--neon);border-radius:50%;opacity:0;animation:gz-float 6s ease-in-out infinite; }
        @keyframes gz-float { 0%{opacity:0;transform:translateY(0)} 20%{opacity:.6} 80%{opacity:.3} 100%{opacity:0;transform:translateY(-120px) translateX(20px)} }

        /* Auth panel */
        .gz-panel { display:flex;flex-direction:column;justify-content:center;padding:3rem 2.8rem;
          background:rgba(12,12,20,.7);backdrop-filter:blur(40px);
          border-left:1px solid var(--border-c);position:relative;overflow:hidden; }
        .gz-panel::before { content:'';position:absolute;top:0;left:0;right:0;height:2px;
          background:linear-gradient(90deg,transparent,var(--neon),transparent);opacity:.5; }
        .gz-panel h2 { font-family:'Orbitron',monospace;font-size:1.5rem;font-weight:700;margin-bottom:.4rem;
          opacity:0;animation:gz-up .5s .5s forwards; }
        .gz-sub { color:var(--text-dim);font-size:.92rem;margin-bottom:2.2rem;opacity:0;animation:gz-up .5s .6s forwards; }
        .gz-sub a { color:var(--neon);text-decoration:none; }

        /* Inputs */
        .gz-field { opacity:0;animation:gz-up .5s forwards; }
        .gz-field:nth-child(1){animation-delay:.7s} .gz-field:nth-child(2){animation-delay:.8s}
        .gz-field label { display:block;font-size:.78rem;font-weight:500;letter-spacing:1px;text-transform:uppercase;color:var(--text-dim);margin-bottom:8px; }
        .gz-wrap { position:relative;border:1px solid var(--border-c);border-radius:12px;background:rgba(255,255,255,.02);transition:border-color .25s,box-shadow .25s; }
        .gz-wrap:focus-within { border-color:var(--neon);box-shadow:0 0 0 3px var(--neon-dim),inset 0 0 20px rgba(57,255,20,.03); }
        .gz-wrap input { width:100%;padding:14px 16px 14px 48px;background:transparent;border:none;outline:none;color:var(--text-c);font-family:'Outfit',sans-serif;font-size:.95rem; }
        .gz-wrap input::placeholder { color:var(--text-dim);opacity:.5; }
        .gz-ico { position:absolute;left:16px;top:50%;transform:translateY(-50%);color:var(--text-dim);transition:color .25s; }
        .gz-wrap:focus-within .gz-ico { color:var(--neon); }
        .gz-extra { display:flex;justify-content:space-between;align-items:center;margin-top:6px; }
        .gz-remember { display:flex;align-items:center;gap:8px;font-size:.82rem;color:var(--text-dim);cursor:pointer; }
        .gz-remember input[type=checkbox] { appearance:none;width:16px;height:16px;border:1px solid var(--border-c);border-radius:4px;background:rgba(255,255,255,.02);cursor:pointer;transition:all .2s; }
        .gz-remember input[type=checkbox]:checked { background:var(--neon);border-color:var(--neon); }

        /* Button */
        .gz-btn { margin-top:.8rem;padding:16px;border:none;border-radius:12px;background:var(--neon);color:#0a0a0f;
          font-family:'Orbitron',monospace;font-size:.85rem;font-weight:700;letter-spacing:3px;cursor:pointer;
          position:relative;overflow:hidden;transition:transform .15s,box-shadow .25s;width:100%;
          display:flex;align-items:center;justify-content:center;gap:8px;
          opacity:0;animation:gz-up .5s .9s forwards; }
        .gz-btn:hover:not(:disabled) { transform:translateY(-2px);box-shadow:0 8px 30px var(--neon-dim),0 0 60px rgba(57,255,20,.15); }
        .gz-btn:disabled { opacity:.5;cursor:not-allowed; }
        .gz-btn::after { content:'';position:absolute;inset:0;background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,.3) 45%,rgba(255,255,255,.3) 55%,transparent 60%);transform:translateX(-100%);transition:transform .5s; }
        .gz-btn:hover:not(:disabled)::after { transform:translateX(100%); }

        /* Divider */
        .gz-divider { display:flex;align-items:center;gap:16px;margin:1.6rem 0;opacity:0;animation:gz-up .5s 1s forwards; }
        .gz-divider::before,.gz-divider::after { content:'';flex:1;height:1px;background:var(--border-c); }
        .gz-divider span { font-size:.75rem;color:var(--text-dim);letter-spacing:1px;text-transform:uppercase; }

        /* Socials */
        .gz-socials { display:grid;grid-template-columns:1fr 1fr;gap:12px;opacity:0;animation:gz-up .5s 1.1s forwards; }
        .gz-social { display:flex;align-items:center;justify-content:center;gap:10px;padding:12px;border:1px solid var(--border-c);border-radius:12px;background:rgba(255,255,255,.02);color:var(--text-c);font-family:'Outfit',sans-serif;font-size:.85rem;cursor:pointer;transition:border-color .2s,background .2s; }
        .gz-social:hover { border-color:rgba(255,255,255,.15);background:rgba(255,255,255,.05); }

        .gz-footer { text-align:center;margin-top:2rem;font-size:.75rem;color:var(--text-dim);opacity:0;animation:gz-up .5s 1.2s forwards; }
        .gz-err { background:rgba(239,68,68,.07);border:1px solid rgba(239,68,68,.2);color:#f87171;border-radius:10px;padding:10px 14px;font-size:.84rem;margin-bottom:1rem;display:flex;align-items:center;gap:8px;opacity:0;animation:gz-up .3s forwards; }

        @keyframes gz-up { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes gz-spin { to{transform:rotate(360deg)} }
        .gz-spin { width:16px;height:16px;border:2px solid currentColor;border-top-color:transparent;border-radius:50%;display:inline-block;animation:gz-spin .7s linear infinite; }

        @media(max-width:900px) {
          .gz-page { grid-template-columns:1fr;grid-template-rows:auto 1fr; }
          .gz-hero { padding:2rem 2rem 1.5rem;min-height:auto; }
          .gz-brand { position:static;margin-bottom:2rem; }
          .gz-h1 { font-size:1.6rem; }
          .gz-desc { display:none; }
          .gz-stats { gap:2rem;margin-top:1.5rem; }
          .gz-stat-val { font-size:1.2rem; }
          .gz-panel { border-left:none;border-top:1px solid var(--border-c);padding:2rem 1.8rem; }
          .gz-grid { display:none; }
        }
      `}</style>

      <div className="gz-body">
        {/* BG */}
        <div className="gz-bg">
          <div className="gz-grid" />
          <div className="gz-orb gz-orb1" />
          <div className="gz-orb gz-orb2" />
          <div className="gz-orb gz-orb3" />
        </div>

        <div className="gz-page">
          {/* ── HERO ── */}
          <section className="gz-hero">
            <div className="gz-brand">
              <div className="gz-brand-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0a0a0f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 11h4M8 9v4"/><circle cx="15" cy="10" r=".5" fill="#0a0a0f"/><circle cx="17" cy="12" r=".5" fill="#0a0a0f"/>
                  <path d="M2 8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"/>
                </svg>
              </div>
              <div className="gz-brand-name">GAME<span>ZONE</span></div>
            </div>

            <p className="gz-tag">Tu tienda gamer</p>
            <h1 className="gz-h1">Donde el<br />gaming cobra<br /><em>vida real.</em></h1>
            <p className="gz-desc">Descubre los mejores títulos, periféricos premium y todo lo que necesitas para llevar tu setup al siguiente nivel.</p>

            <div className="gz-stats">
              {[['200+','Títulos'],['26','Géneros'],['24/7','Soporte']].map(([v,l]) => (
                <div key={l}>
                  <div className="gz-stat-val">{v}</div>
                  <div className="gz-stat-lbl">{l}</div>
                </div>
              ))}
            </div>

            {[{l:'12%',b:'30%',d:'0s'},{l:'25%',b:'18%',d:'1.5s'},{l:'45%',b:'25%',d:'3s'},{l:'60%',b:'35%',d:'0.8s'},{l:'78%',b:'20%',d:'2.2s'}].map((p,i) => (
              <div key={i} className="gz-p" style={{ left:p.l, bottom:p.b, animationDelay:p.d }} />
            ))}
          </section>

          {/* ── PANEL ── */}
          <aside className="gz-panel">
            <h2>Iniciar sesión</h2>
            <p className="gz-sub">¿Sin cuenta?{' '}<Link href="/register">Crear una gratis</Link></p>

            {errors.general && (
              <div className="gz-err"><span>⚠</span> {errors.general}</div>
            )}

            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1.4rem' }} noValidate>
              {/* Email */}
              <div className="gz-field">
                <label>Correo electrónico</label>
                <div className="gz-wrap">
                  <svg className="gz-ico" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                  <input type="email" placeholder="tu@correo.com" autoComplete="email"
                    value={form.email} onChange={e => set('email', e.target.value)}
                    style={{ borderColor: errors.email ? '#ef4444' : undefined }} />
                </div>
                {errors.email && <p style={{ color:'#f87171', fontSize:'.73rem', marginTop:4 }}>{errors.email}</p>}
              </div>

              {/* Password */}
              <div className="gz-field">
                <label>Contraseña</label>
                <div className="gz-wrap">
                  <svg className="gz-ico" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <input type="password" placeholder="••••••••" autoComplete="current-password"
                    value={form.password} onChange={e => set('password', e.target.value)} />
                </div>
                {errors.password && <p style={{ color:'#f87171', fontSize:'.73rem', marginTop:4 }}>{errors.password}</p>}
                <div className="gz-extra">
                  <label className="gz-remember"><input type="checkbox" /> Recordarme</label>
                </div>
              </div>

              <button className="gz-btn" type="submit" disabled={loading}>
                {loading ? <><span className="gz-spin" />ENTRANDO...</> : 'ENTRAR →'}
              </button>
            </form>

            <div className="gz-divider"><span>o continúa con</span></div>

            <div className="gz-socials">
              <button className="gz-social" type="button">
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
              <button className="gz-social" type="button">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/>
                </svg>
                Facebook
              </button>
            </div>

            <p className="gz-footer">GameZone · Todos los derechos reservados</p>
          </aside>
        </div>
      </div>
    </>
  );
}
