'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useCategories } from '@/hooks/useCategories';
import { productService } from '@/services/product.service';
import { Product } from '@/types/product.types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';

const FALLBACK = 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=640&auto=format&fit=crop';
const GAME_CATEGORIES = ['Acción','RPG','FPS','Indie','Carreras','Aventura','Terror','Deportes'];

// ── Datos estáticos por juego ──────────────────────────────────────────────
const PLATFORMS: Record<string, string> = {
  'Hollow Knight':             'PC / PS5 / Xbox / Switch',
  'Hades':                     'PC / PS5 / Xbox / Switch',
  'Stardew Valley':            'PC / PS5 / Xbox / Switch',
  'Celeste':                   'PC / PS5 / Xbox / Switch',
  'Palworld':                  'PC / Xbox',
  'Persona 5 Royal':           'PC / PS5 / Xbox / Switch',
  'Zelda: Tears of the Kingdom': 'Nintendo Switch',
  'Gran Turismo 7':            'PS5',
  'God of War Ragnarök':       'PS5 / PC',
  'The Last of Us Part I':     'PS5 / PC',
  "Marvel's Spider-Man 2":     'PS5 / PC',
};
const getPlatforms = (name: string) => PLATFORMS[name] ?? 'PC / PS5 / Xbox';

const RATINGS: Record<string, number> = {
  'Elden Ring':5,'The Witcher 3: Wild Hunt':5,"Baldur's Gate 3":5,'Persona 5 Royal':5,
  'God of War Ragnarök':5,'Hades':5,'Hollow Knight':5,'Stardew Valley':4.5,
  'Cyberpunk 2077':4.5,'GTA V':4.5,'Red Dead Redemption 2':4.5,'Dark Souls III':4.5,
  'Hogwarts Legacy':4.5,"Marvel's Spider-Man 2":4.5,'Sekiro: Shadows Die Twice':4.5,
  'Resident Evil Village':4.5,'Celeste':4.5,"Devil May Cry 5":4,
};
const getRating = (name: string) => RATINGS[name] ?? 4.0;

const BADGES: Record<string, { label: string; bg: string }> = {
  'Cyberpunk 2077':            { label: 'Popular',    bg: '#db2777' },
  'Elden Ring':                { label: 'Hot',        bg: '#ea580c' },
  'GTA V':                     { label: 'Popular',    bg: '#db2777' },
  "Baldur's Gate 3":           { label: 'GOTY',       bg: '#d97706' },
  'The Witcher 3: Wild Hunt':  { label: 'Legendario', bg: '#7c3aed' },
  'Dark Souls III':            { label: 'Difícil',    bg: '#dc2626' },
  'Sekiro: Shadows Die Twice': { label: 'Difícil',    bg: '#dc2626' },
  'Persona 5 Royal':           { label: 'Nuevo',      bg: '#0891b2' },
  'Hogwarts Legacy':           { label: 'Magia',      bg: '#6d28d9' },
  'Helldivers 2':              { label: 'Viral',      bg: '#1d4ed8' },
  'Palworld':                  { label: 'Viral',      bg: '#1d4ed8' },
  'God of War Ragnarök':       { label: 'Épico',      bg: '#b45309' },
  'Hades':                     { label: 'Indie',      bg: '#047857' },
  'Stardew Valley':            { label: 'Relax',      bg: '#059669' },
  'Counter-Strike 2':          { label: 'Gratis',     bg: '#16a34a' },
  'Apex Legends':              { label: 'Gratis',     bg: '#16a34a' },
  'Rocket League':             { label: 'Gratis',     bg: '#16a34a' },
  'CoD Warzone':               { label: 'Gratis',     bg: '#16a34a' },
  'Warframe':                  { label: 'Gratis',     bg: '#16a34a' },
  'Destiny 2':                 { label: 'Gratis',     bg: '#16a34a' },
  'Rust':                      { label: 'Survival',   bg: '#92400e' },
  'Terraria':                  { label: 'Clásico',    bg: '#065f46' },
  'Resident Evil 4 Remake':    { label: 'Remake',     bg: '#dc2626' },
  'Starfield':                 { label: 'Nuevo',      bg: '#1d4ed8' },
};

const GENRE_ICONS: Record<string, string> = {
  'Acción':'⚔','RPG':'⚡','FPS':'🎯','Indie':'🌟',
  'Carreras':'🏎','Aventura':'🗺','Terror':'💀','Deportes':'⚽',
};

// ── Estrellas ──────────────────────────────────────────────────────────────
function Stars({ v }: { v: number }) {
  return (
    <div style={{ display:'flex', gap:'1px' }}>
      {[1,2,3,4,5].map(i => {
        const full = i <= Math.floor(v);
        const half = !full && i === Math.ceil(v) && v % 1 >= 0.5;
        return (
          <span key={i} style={{ fontSize:'0.7rem', color: full || half ? '#fbbf24' : '#374151' }}>★</span>
        );
      })}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function ProductsPage() {
  const { user } = useAuth();
  const { categories } = useCategories();
  const [all, setAll]           = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [query,  setQuery]      = useState('');
  const [catId,  setCatId]      = useState('');
  const [deleting, setDeleting] = useState<Product | null>(null);

  // Fetch all games once
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const r = await productService.getAll({ type: 'game', limit: 100 });
      setAll(r.data);
    } catch { toast.error('Error al cargar juegos'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Client-side filter
  const gameCats = categories.filter(c => GAME_CATEGORIES.includes(c.name));
  const filtered = all.filter(p =>
    (!catId  || p.categoryId === catId) &&
    (!query  || p.name.toLowerCase().includes(query.toLowerCase()))
  );

  // Counts per category
  const counts: Record<string, number> = {};
  for (const p of all) counts[p.categoryId] = (counts[p.categoryId] ?? 0) + 1;

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await productService.remove(deleting.id);
      toast.success('Juego eliminado');
      setDeleting(null);
      fetchAll();
    } catch { toast.error('Error al eliminar'); }
  };

  return (
    <div>
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div>
          <h1 style={{ fontFamily:'var(--font-head)', fontSize:'1.6rem', fontWeight:700, letterSpacing:'0.04em' }}>
            Catálogo de Juegos
          </h1>
          <p style={{ color:'var(--muted)', fontSize:'0.8rem', marginTop:'0.15rem' }}>
            {all.length} títulos disponibles
          </p>
        </div>
        {user?.role === 'ADMIN' && (
          <Link href="/products/new" style={{
            display:'inline-flex', alignItems:'center', gap:'0.4rem',
            padding:'0.6rem 1.2rem', borderRadius:'10px', textDecoration:'none',
            background:'var(--accent)', color:'#050d08',
            fontFamily:'var(--font-head)', fontWeight:700, fontSize:'0.85rem', letterSpacing:'0.06em',
            boxShadow:'0 0 16px rgba(0,230,118,0.25)',
          }}>+ Nuevo juego</Link>
        )}
      </div>

      {/* ── Search ── */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <input value={search} onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && setQuery(search)}
          placeholder="Buscar juego..."
          style={{ flex:1, minWidth:'180px', padding:'0.6rem 1rem', borderRadius:'10px',
            background:'var(--surface)', border:'1px solid var(--border2)',
            color:'var(--text)', fontSize:'0.85rem', outline:'none', fontFamily:'var(--font-body)' }}
          onFocus={e => e.target.style.borderColor='rgba(0,230,118,0.4)'}
          onBlur={e  => e.target.style.borderColor='var(--border2)'}
        />
        <button onClick={() => setQuery(search)} style={{ padding:'0.6rem 1.2rem', borderRadius:'10px', border:'none', cursor:'pointer', background:'var(--accent)', color:'#050d08', fontWeight:700, fontSize:'0.84rem', fontFamily:'var(--font-body)' }}>Buscar</button>
        {(query || catId) && (
          <button onClick={() => { setQuery(''); setSearch(''); setCatId(''); }} style={{ padding:'0.6rem 0.9rem', borderRadius:'10px', cursor:'pointer', background:'var(--surface)', color:'var(--muted)', border:'1px solid var(--border)', fontSize:'0.84rem', fontFamily:'var(--font-body)' }}>✕</button>
        )}
      </div>

      {/* ── Genre tabs ── */}
      <div className="flex gap-2 flex-wrap mb-6">
        {[{ id:'', name:'TODOS', count: all.length, icon:'🎮' },
          ...gameCats.map(c => ({ id: c.id, name: c.name.toUpperCase(), count: counts[c.id] ?? 0, icon: GENRE_ICONS[c.name] ?? '◈' }))
        ].map(tab => (
          <button key={tab.id} onClick={() => setCatId(tab.id)} style={{
            display:'inline-flex', alignItems:'center', gap:'0.35rem',
            padding:'0.4rem 0.85rem', borderRadius:'99px', border:'1px solid transparent', cursor:'pointer',
            fontFamily:'var(--font-body)', fontWeight:600, fontSize:'0.74rem',
            background: catId === tab.id ? 'rgba(0,230,118,0.12)' : 'var(--surface)',
            color:       catId === tab.id ? 'var(--accent)' : 'var(--text2)',
            borderColor: catId === tab.id ? 'rgba(0,230,118,0.3)' : 'var(--border)',
            transition:'all 0.15s',
          }}>
            <span>{tab.icon}</span>
            {tab.name}
            <span style={{ fontSize:'0.68rem', opacity:0.75 }}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* ── Grid ── */}
      {loading && <LoadingSpinner />}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-20" style={{ color:'var(--muted)' }}>
          <p style={{ fontSize:'2.5rem', marginBottom:'0.75rem' }}>🎮</p>
          <p style={{ fontWeight:600, color:'var(--text2)' }}>Sin resultados</p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(205px, 1fr))', gap:'1.1rem' }}>
          {filtered.map(p => (
            <GameCard key={p.id} product={p} isAdmin={user?.role === 'ADMIN'} onDelete={() => setDeleting(p)} />
          ))}
        </div>
      )}

      {/* ── Footer ── */}
      {!loading && (
        <p style={{ textAlign:'center', marginTop:'2rem', fontSize:'0.78rem', color:'var(--muted)' }}>
          ¿No encuentras tu juego?{' '}
          <span style={{ color:'var(--accent2)', cursor:'pointer', fontWeight:600 }}>Escríbenos y te lo cotizamos.</span>
          {' · '}
          <span onClick={() => setCatId('')} style={{ color:'var(--accent)', cursor:'pointer', fontWeight:600 }}>
            Ver catálogo completo →
          </span>
        </p>
      )}

      {/* ── Delete modal ── */}
      <Modal open={!!deleting} title="Eliminar juego" onClose={() => setDeleting(null)}>
        <p style={{ color:'var(--muted)', fontSize:'0.9rem', marginBottom:'1.5rem' }}>
          ¿Eliminar <strong style={{ color:'var(--text)' }}>{deleting?.name}</strong>?
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setDeleting(null)} style={{ padding:'0.6rem 1.2rem', borderRadius:'8px', background:'transparent', color:'var(--muted)', border:'1px solid var(--border)', cursor:'pointer', fontSize:'0.85rem' }}>Cancelar</button>
          <button onClick={handleDelete} style={{ padding:'0.6rem 1.2rem', borderRadius:'8px', background:'rgba(255,23,68,0.12)', color:'#ff6b8a', border:'1px solid rgba(255,23,68,0.25)', cursor:'pointer', fontSize:'0.85rem' }}>Eliminar</button>
        </div>
      </Modal>
    </div>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────
function GameCard({ product: p, isAdmin, onDelete }: { product: Product; isAdmin: boolean; onDelete: () => void }) {
  const price    = Number(p.price);
  const isFree   = price === 0;
  const badge    = BADGES[p.name] ?? (isFree ? { label:'Gratis', bg:'#16a34a' } : null);
  const rating   = getRating(p.name);
  const platform = getPlatforms(p.name);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius:'14px', overflow:'hidden', background:'var(--surface)',
        border:'1px solid var(--border)', display:'flex', flexDirection:'column',
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered ? '0 16px 48px rgba(0,0,0,0.6)' : 'none',
        transition:'transform 0.2s, box-shadow 0.2s',
      }}>

      {/* Image — altura fija 180px, object-fit:cover */}
      <div style={{ position:'relative', height:'180px', overflow:'hidden', borderRadius:'12px 12px 0 0', background:'#070a14', flexShrink:0 }}>
        <img src={p.image || FALLBACK} alt={p.name}
          style={{ width:'100%', height:'180px', objectFit:'cover', display:'block',
            transform: hovered ? 'scale(1.05)' : 'scale(1)', transition:'transform 0.35s' }}
          onError={e => { (e.target as HTMLImageElement).src = FALLBACK; }}
        />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(7,10,20,0.75) 0%, transparent 60%)' }} />
        {badge && (
          <div style={{ position:'absolute', top:'0.55rem', left:'0.55rem',
            padding:'0.18rem 0.6rem', borderRadius:'5px', fontSize:'0.62rem',
            fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em',
            background: badge.bg, color:'#fff', fontFamily:'var(--font-body)' }}>
            {badge.label}
          </div>
        )}
        {p.stock === 0 && (
          <div style={{ position:'absolute', top:'0.55rem', right:'0.55rem',
            padding:'0.18rem 0.55rem', borderRadius:'5px', fontSize:'0.62rem',
            fontWeight:700, background:'rgba(220,38,38,0.9)', color:'#fff', textTransform:'uppercase' }}>
            Agotado
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding:'0.8rem 0.85rem 0.75rem', flex:1, display:'flex', flexDirection:'column', gap:'0.3rem' }}>
        <p style={{ fontWeight:700, fontSize:'0.9rem', lineHeight:1.3, color:'var(--text)', margin:0,
          display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
          {p.name}
        </p>
        <p style={{ fontSize:'0.68rem', color:'var(--muted)', margin:0 }}>{platform}</p>
        <Stars v={rating} />

        <div style={{ marginTop:'auto', paddingTop:'0.5rem' }}>
          <p style={{ fontWeight:700, fontSize:'1rem', margin:'0 0 0.5rem',
            color: isFree ? 'var(--text)' : 'var(--text)' }}>
            {isFree ? 'Gratis' : `$${price.toLocaleString('es-CO')}`}
          </p>

          <div style={{ display:'flex', gap:'0.4rem' }}>
            <button style={{
              flex:1, padding:'0.55rem 0.5rem', borderRadius:'8px', border:'none', cursor:'pointer',
              background:'#3b82f6', color:'#fff', fontWeight:700, fontSize:'0.78rem',
              fontFamily:'var(--font-body)', transition:'background 0.15s',
            }}
              onMouseEnter={e => (e.target as HTMLButtonElement).style.background='#2563eb'}
              onMouseLeave={e => (e.target as HTMLButtonElement).style.background='#3b82f6'}
              onClick={() => toast.success(`${p.name} añadido al carrito`)}>
              + Carrito
            </button>
            <Link href={`/products/${p.id}`} style={{
              display:'flex', alignItems:'center', justifyContent:'center',
              width:'34px', borderRadius:'8px', textDecoration:'none',
              background:'var(--surface2)', color:'var(--muted)',
              border:'1px solid var(--border)', fontSize:'0.8rem', flexShrink:0,
            }}>↗</Link>
            {isAdmin && (
              <>
                <Link href={`/products/${p.id}/edit`} style={{ display:'flex', alignItems:'center', justifyContent:'center', width:'34px', borderRadius:'8px', textDecoration:'none', background:'var(--surface2)', color:'var(--muted)', border:'1px solid var(--border)', fontSize:'0.75rem', flexShrink:0 }}>✏</Link>
                <button onClick={onDelete} style={{ display:'flex', alignItems:'center', justifyContent:'center', width:'34px', borderRadius:'8px', border:'1px solid rgba(255,23,68,0.2)', background:'rgba(255,23,68,0.06)', color:'#ff6b8a', cursor:'pointer', fontSize:'0.75rem', flexShrink:0 }}>✕</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
