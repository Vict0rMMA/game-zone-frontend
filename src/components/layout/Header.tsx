'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => { logout(); router.push('/login'); };

  return (
    <header className="flex items-center justify-between px-6 py-3 sticky top-0 z-50" style={{ background: 'rgba(10,11,15,0.9)', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(12px)' }}>
      <Link href="/dashboard" className="flex items-center gap-2">
        <span className="text-xl">🎮</span>
        <span className="font-black text-lg tracking-widest uppercase" style={{ color: 'var(--accent)', textShadow: '0 0 16px rgba(57,255,20,0.4)' }}>
          GAME<span style={{ color: 'var(--text)' }}>ZONE</span>
        </span>
      </Link>

      {user && (
        <div className="flex items-center gap-4">
          <span className="text-sm hidden sm:block" style={{ color: 'var(--muted)' }}>
            👾 {user.name}
          </span>
          <span className="text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wider"
            style={user.role === 'ADMIN'
              ? { background: 'rgba(57,255,20,0.12)', color: 'var(--accent)', border: '1px solid rgba(57,255,20,0.25)' }
              : { background: 'rgba(255,255,255,0.06)', color: 'var(--muted)', border: '1px solid var(--border)' }}>
            {user.role}
          </span>
          <button onClick={handleLogout}
            className="text-sm px-3 py-1 rounded-lg transition-all"
            style={{ color: 'var(--muted)', border: '1px solid var(--border)' }}
            onMouseEnter={e => { (e.target as HTMLButtonElement).style.color = 'var(--danger)'; (e.target as HTMLButtonElement).style.borderColor = 'rgba(255,71,87,0.3)'; }}
            onMouseLeave={e => { (e.target as HTMLButtonElement).style.color = 'var(--muted)'; (e.target as HTMLButtonElement).style.borderColor = 'var(--border)'; }}>
            Salir
          </button>
        </div>
      )}
    </header>
  );
}
