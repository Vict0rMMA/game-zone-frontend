'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const nav = [
  { href: '/dashboard',   icon: '▦',  label: 'Dashboard',    roles: ['ADMIN', 'USER'] },
  { href: '/products',    icon: '◈',  label: 'Catálogo',     roles: ['ADMIN', 'USER'] },
  { href: '/perifericos', icon: '🎧', label: 'Periféricos',  roles: ['ADMIN', 'USER'] },
  { href: '/categories',  icon: '◉',  label: 'Géneros',      roles: ['ADMIN', 'USER'] },
  { href: '/admin',       icon: '◆',  label: 'Admin',        roles: ['ADMIN'] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside style={{
      width: '220px', flexShrink: 0, background: 'var(--bg2)',
      borderRight: '1px solid var(--border)', padding: '1.5rem 0.75rem',
      display: 'flex', flexDirection: 'column', gap: '0.25rem',
    }}>
      <p style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--muted)', padding: '0 0.75rem', marginBottom: '0.75rem' }}>
        Navegación
      </p>
      {nav.filter(i => user && i.roles.includes(user.role)).map(item => {
        const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
        return (
          <Link key={item.href} href={item.href} style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.6rem 0.75rem', borderRadius: '10px', textDecoration: 'none',
            fontSize: '0.88rem', fontWeight: active ? 600 : 400,
            background: active ? 'rgba(0,230,118,0.08)' : 'transparent',
            color: active ? 'var(--accent)' : 'var(--text2)',
            border: `1px solid ${active ? 'rgba(0,230,118,0.15)' : 'transparent'}`,
          }}
            onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--surface)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text)'; } }}
            onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text2)'; } }}>
            <span style={{ fontSize: '0.9rem', opacity: active ? 1 : 0.55 }}>{item.icon}</span>
            {item.label}
            {active && <span style={{ marginLeft: 'auto', width: '5px', height: '5px', borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 6px var(--accent)' }} />}
          </Link>
        );
      })}

      {/* Separator + peripheral categories shortcut */}
      <div style={{ height: '1px', background: 'var(--border)', margin: '0.75rem 0.5rem' }} />
      <p style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--muted)', padding: '0 0.75rem', marginBottom: '0.5rem' }}>
        Acceso rápido
      </p>
      {[
        { href: '/products?categoryId=accion', label: '⚔️ Acción' },
        { href: '/products?categoryId=rpg',    label: '⚡ RPG' },
        { href: '/perifericos',                label: '🎧 Periféricos' },
      ].map(s => (
        <Link key={s.href} href={s.href} style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.75rem',
          borderRadius: '8px', textDecoration: 'none', fontSize: '0.78rem',
          color: 'var(--muted)',
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text2)'; (e.currentTarget as HTMLAnchorElement).style.background = 'var(--surface)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--muted)'; (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; }}>
          {s.label}
        </Link>
      ))}
    </aside>
  );
}
