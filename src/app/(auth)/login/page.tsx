'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/auth.service';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!authLoading && user) router.replace('/dashboard');
  }, [user, authLoading, router]);

  /* ── Canvas particles ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const N = 80;
    const dots = Array.from({ length: N }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      a: Math.random(),
    }));

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const d of dots) {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0) d.x = canvas.width;
        if (d.x > canvas.width) d.x = 0;
        if (d.y < 0) d.y = canvas.height;
        if (d.y > canvas.height) d.y = 0;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(57,255,20,${d.a * 0.55})`;
        ctx.fill();
      }
      // líneas entre partículas cercanas
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.strokeStyle = `rgba(57,255,20,${(1 - dist / 110) * 0.08})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

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

        .gz-root {
          min-height: 100vh;
          background: #07080e;
          font-family: 'Outfit', sans-serif;
          display: flex; align-items: center; justify-content: center;
          position: relative; overflow: hidden; padding: 2rem 1rem;
        }

        /* orbs */
        .gz-orb {
          position: fixed; border-radius: 50%; filter: blur(100px);
          pointer-events: none; animation: gz-drift 14s ease-in-out infinite alternate;
        }
        .gz-o1 { width:500px;height:500px;top:-120px;left:-100px;background:rgba(57,255,20,.09); }
        .gz-o2 { width:400px;height:400px;bottom:-100px;right:-80px;background:rgba(120,60,255,.08);animation-delay:-6s;animation-duration:18s; }
        @keyframes gz-drift { 0%{transform:translate(0,0)} 100%{transform:translate(35px,-28px)} }

        /* grid floor */
        .gz-grid {
          position: fixed; bottom: 0; left: 0; right: 0; height: 38%;
          background:
            repeating-linear-gradient(90deg,rgba(57,255,20,.045) 0,rgba(57,255,20,.045) 1px,transparent 1px,transparent 70px),
            repeating-linear-gradient(0deg,rgba(57,255,20,.045) 0,rgba(57,255,20,.045) 1px,transparent 1px,transparent 70px);
          transform: perspective(500px) rotateX(50deg);
          transform-origin: bottom center;
          -webkit-mask-image: linear-gradient(to top, black 0%, transparent 100%);
          mask-image: linear-gradient(to top, black 0%, transparent 100%);
          pointer-events: none; z-index: 0;
        }

        /* canvas */
        .gz-canvas { position:fixed;inset:0;pointer-events:none;z-index:0; }

        /* card */
        .gz-card {
          position: relative; z-index: 2;
          width: 100%; max-width: 430px;
          background: rgba(10,11,18,.82);
          backdrop-filter: blur(32px);
          border: 1px solid rgba(57,255,20,.12);
          border-radius: 22px;
          padding: 2.6rem 2.4rem 2.2rem;
          box-shadow: 0 0 0 1px rgba(255,255,255,.04), 0 0 80px rgba(57,255,20,.06), 0 30px 70px rgba(0,0,0,.6);
          animation: gz-in .55s cubic-bezier(.22,.68,0,1.2) forwards;
        }
        .gz-card::before {
          content: ''; position: absolute; top: 0; left: 20%; right: 20%; height: 1px;
          background: linear-gradient(90deg,transparent,rgba(57,255,20,.7),transparent);
          border-radius: 99px;
        }
        @keyframes gz-in {
          from { opacity:0; transform:translateY(22px) scale(.97); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }

        /* ── LOGO ── */
        .gz-logo-wrap {
          display: flex; flex-direction: column;
          align-items: center; gap: 10px;
          margin-bottom: 1.8rem;
        }
        .gz-logo-icon {
          width: 52px; height: 52px; border-radius: 14px;
          background: linear-gradient(135deg, #39ff14, #00c853);
          display: grid; place-items: center;
          box-shadow: 0 0 28px rgba(57,255,20,.45), 0 0 60px rgba(57,255,20,.15);
          position: relative;
        }
        .gz-logo-icon::after {
          content: '';
          position: absolute; inset: -3px; border-radius: 17px;
          background: linear-gradient(135deg,rgba(57,255,20,.3),transparent,rgba(57,255,20,.15));
          z-index: -1;
        }
        .gz-logo-text {
          font-family: 'Orbitron', monospace;
          font-size: 1.45rem; font-weight: 900;
          letter-spacing: 5px; line-height: 1;
          display: flex; align-items: baseline; gap: 2px;
        }
        .gz-logo-game {
          color: #e8e8ec;
          text-shadow: 0 0 20px rgba(255,255,255,.15);
        }
        .gz-logo-zone {
          background: linear-gradient(135deg, #39ff14, #00e5ff);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0 0 8px rgba(57,255,20,.5));
        }
        .gz-logo-tag {
          font-family: 'Outfit', sans-serif;
          font-size: .65rem; font-weight: 400;
          letter-spacing: 4px; text-transform: uppercase;
          color: rgba(255,255,255,.25);
          margin-top: -4px;
        }

        /* heading */
        .gz-title { font-family:'Orbitron',monospace;font-size:1.35rem;font-weight:700;text-align:center;margin-bottom:.3rem;color:#e8e8ec; }
        .gz-sub { text-align:center;font-size:.88rem;color:#5a5a70;margin-bottom:1.8rem; }
        .gz-sub a { color:#39ff14;text-decoration:none;font-weight:500; }

        /* error */
        .gz-err { background:rgba(239,68,68,.07);border:1px solid rgba(239,68,68,.2);color:#f87171;border-radius:10px;padding:9px 13px;font-size:.83rem;margin-bottom:1.1rem;display:flex;align-items:center;gap:7px; }

        /* fields */
        .gz-field { display:flex;flex-direction:column;gap:5px;margin-bottom:1.1rem; }
        .gz-lbl { font-size:.71rem;font-weight:500;letter-spacing:1.5px;text-transform:uppercase;color:#4a4a60; }
        .gz-wrap { position:relative;border:1px solid rgba(255,255,255,.07);border-radius:11px;background:rgba(255,255,255,.025);transition:border-color .2s,box-shadow .2s; }
        .gz-wrap:focus-within { border-color:rgba(57,255,20,.38);box-shadow:0 0 0 3px rgba(57,255,20,.06); }
        .gz-wrap input { width:100%;padding:12px 14px 12px 44px;background:transparent;border:none;outline:none;color:#e8e8ec;font-family:'Outfit',sans-serif;font-size:.92rem; }
        .gz-wrap input::placeholder { color:#4a4a60;opacity:.7; }
        .gz-ico { position:absolute;left:13px;top:50%;transform:translateY(-50%);color:#4a4a60;transition:color .2s;pointer-events:none; }
        .gz-wrap:focus-within .gz-ico { color:#39ff14; }
        .gz-ferr { font-size:.71rem;color:#f87171;margin-top:1px; }

        /* remember */
        .gz-rem { display:flex;align-items:center;gap:7px;font-size:.8rem;color:#5a5a70;cursor:pointer;margin-top:3px; }
        .gz-rem input[type=checkbox] { appearance:none;width:14px;height:14px;border:1px solid rgba(255,255,255,.12);border-radius:4px;background:transparent;cursor:pointer;transition:all .18s;flex-shrink:0; }
        .gz-rem input[type=checkbox]:checked { background:#39ff14;border-color:#39ff14; }

        /* button */
        .gz-btn {
          width:100%;margin-top:1.5rem;padding:14px;border:none;border-radius:11px;
          background:linear-gradient(135deg,#39ff14,#1de920);
          color:#060d06;font-family:'Orbitron',monospace;
          font-size:.82rem;font-weight:700;letter-spacing:3px;
          cursor:pointer;position:relative;overflow:hidden;
          transition:transform .14s,box-shadow .2s;
          display:flex;align-items:center;justify-content:center;gap:8px;
        }
        .gz-btn:hover:not(:disabled) { transform:translateY(-2px);box-shadow:0 8px 30px rgba(57,255,20,.28),0 0 50px rgba(57,255,20,.12); }
        .gz-btn:disabled { opacity:.4;cursor:not-allowed; }
        .gz-btn::after { content:'';position:absolute;inset:0;background:linear-gradient(105deg,transparent 38%,rgba(255,255,255,.25) 44%,rgba(255,255,255,.25) 56%,transparent 62%);transform:translateX(-100%);transition:transform .5s; }
        .gz-btn:hover:not(:disabled)::after { transform:translateX(100%); }

        .gz-footer { text-align:center;margin-top:1.6rem;font-size:.68rem;color:rgba(255,255,255,.15); }

        @keyframes gz-spin { to{transform:rotate(360deg)} }
        .gz-spin { width:14px;height:14px;border:2px solid currentColor;border-top-color:transparent;border-radius:50%;display:inline-block;animation:gz-spin .7s linear infinite; }
      `}</style>

      <canvas ref={canvasRef} className="gz-canvas" />
      <div className="gz-orb gz-o1" />
      <div className="gz-orb gz-o2" />
      <div className="gz-grid" />

      <div className="gz-root">
        <div className="gz-card">

          {/* ── LOGO ── */}
          <div className="gz-logo-wrap">
            <div className="gz-logo-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#060d06" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 11h4M8 9v4"/>
                <circle cx="15" cy="10" r=".6" fill="#060d06"/>
                <circle cx="17" cy="12" r=".6" fill="#060d06"/>
                <path d="M2 8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"/>
              </svg>
            </div>
            <div className="gz-logo-text">
              <span className="gz-logo-game">GAME</span>
              <span className="gz-logo-zone">ZONE</span>
            </div>
            <span className="gz-logo-tag">Tu tienda gamer</span>
          </div>

          <h2 className="gz-title">Iniciar sesión</h2>
          <p className="gz-sub">¿Sin cuenta? <Link href="/register">Crear una gratis</Link></p>

          {errors.general && (
            <div className="gz-err"><span>⚠</span>{errors.general}</div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="gz-field">
              <label className="gz-lbl">Correo electrónico</label>
              <div className="gz-wrap">
                <svg className="gz-ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
                <input type="email" placeholder="tu@correo.com" autoComplete="email"
                  value={form.email} onChange={e => set('email', e.target.value)} />
              </div>
              {errors.email && <span className="gz-ferr">{errors.email}</span>}
            </div>

            <div className="gz-field">
              <label className="gz-lbl">Contraseña</label>
              <div className="gz-wrap">
                <svg className="gz-ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input type="password" placeholder="••••••••" autoComplete="current-password"
                  value={form.password} onChange={e => set('password', e.target.value)} />
              </div>
              {errors.password && <span className="gz-ferr">{errors.password}</span>}
              <label className="gz-rem"><input type="checkbox" /> Recordarme</label>
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
