import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center" style={{ background: 'var(--bg)' }}>
      <div className="text-8xl font-black" style={{ color: 'var(--accent)', textShadow: '0 0 40px rgba(57,255,20,0.4)' }}>404</div>
      <h2 className="text-2xl font-bold">Página no encontrada</h2>
      <p style={{ color: 'var(--muted)' }}>Esta zona del mapa no existe.</p>
      <Link href="/dashboard" className="px-6 py-3 rounded-xl font-bold uppercase tracking-wider transition-all"
        style={{ background: 'var(--accent)', color: '#050806', boxShadow: '0 0 20px rgba(57,255,20,0.3)' }}>
        Volver al inicio
      </Link>
    </div>
  );
}
