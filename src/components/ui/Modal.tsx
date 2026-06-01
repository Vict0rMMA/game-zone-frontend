'use client';
import { ReactNode } from 'react';

interface Props { open: boolean; title: string; children: ReactNode; onClose: () => void; }

export default function Modal({ open, title, children, onClose }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-md mx-4 rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="font-bold uppercase tracking-wider text-sm">{title}</h2>
          <button onClick={onClose} className="text-lg transition-colors" style={{ color: 'var(--muted)' }}
            onMouseEnter={e => (e.target as HTMLButtonElement).style.color = 'var(--text)'}
            onMouseLeave={e => (e.target as HTMLButtonElement).style.color = 'var(--muted)'}>✕</button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
