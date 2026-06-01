'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const handleLogout = () => { logout(); router.push('/login'); };

  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 1.5rem', height: '60px',
      background: 'rgba(8,10,18,0.95)', borderBottom: '1px solid var(--border)',
      backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 50,
    }}>
      <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(135deg, var(--accent) 0%, #00bfa5 100%)',
          boxShadow: '0 0 16px rgba(0,230,118,0.3)', fontSize: '1rem',
        }}>🎮</div>
        <span style={{ fontFamily: 'var(--font-head)', fontSize: '1.2rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text)' }}>
          GAME<span style={{ color: 'var(--accent)' }}>ZONE</span>
        </span>
      </Link>

      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: user.role === 'ADMIN' ? 'rgba(0,230,118,0.15)' : 'var(--surface2)',
              border: `1px solid ${user.role === 'ADMIN' ? 'rgba(0,230,118,0.3)' : 'var(--border)'}`,
              fontSize: '0.85rem',
            }}>
              {user.name[0].toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1.2 }}>{user.name}</div>
              <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: user.role === 'ADMIN' ? 'var(--accent)' : 'var(--muted)' }}>{user.role}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{
            padding: '0.4rem 0.9rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
            background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)',
            fontFamily: 'var(--font-body)',
          }}
            onMouseEnter={e => { (e.target as HTMLButtonElement).style.borderColor = 'rgba(255,23,68,0.3)'; (e.target as HTMLButtonElement).style.color = '#ff6b8a'; }}
            onMouseLeave={e => { (e.target as HTMLButtonElement).style.borderColor = 'var(--border)'; (e.target as HTMLButtonElement).style.color = 'var(--muted)'; }}>
            Salir
          </button>
        </div>
      )}
    </header>
  );
}
