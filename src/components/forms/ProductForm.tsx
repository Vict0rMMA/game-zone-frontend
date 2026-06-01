'use client';
import { useState } from 'react';
import { useCategories } from '@/hooks/useCategories';
import { CreateProductPayload } from '@/types/product.types';

interface Props {
  initial?: Partial<CreateProductPayload>;
  onSubmit: (data: CreateProductPayload) => Promise<void>;
  submitLabel?: string;
}

const inputStyle = { background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)' };
const labelStyle = { color: 'var(--muted)' };
const errorStyle = { color: 'var(--danger)' };

export default function ProductForm({ initial, onSubmit, submitLabel = 'Guardar' }: Props) {
  const { categories, loading: loadingCats } = useCategories();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<CreateProductPayload>({
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    price: initial?.price ?? 0,
    stock: initial?.stock ?? 0,
    categoryId: initial?.categoryId ?? '',
  });

  const set = (k: keyof CreateProductPayload, v: string | number) => setForm(prev => ({ ...prev, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'El título es requerido';
    if (form.price <= 0) e.price = 'El precio debe ser mayor a 0';
    if (form.stock < 0) e.stock = 'El stock no puede ser negativo';
    if (!form.categoryId) e.categoryId = 'Selecciona un género';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try { await onSubmit(form); } finally { setLoading(false); }
  };

  const fieldClass = "px-4 py-3 rounded-xl text-sm outline-none w-full";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold uppercase tracking-wider" style={labelStyle}>Título del juego *</label>
        <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ej: Elden Ring, GTA V..." className={fieldClass} style={{ ...inputStyle, border: `1px solid ${errors.name ? 'var(--danger)' : 'var(--border)'}` }} />
        {errors.name && <p className="text-xs" style={errorStyle}>{errors.name}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold uppercase tracking-wider" style={labelStyle}>Descripción</label>
        <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)}
          placeholder="Descripción del juego..." className={`${fieldClass} resize-none`}
          style={inputStyle} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider" style={labelStyle}>Precio (COP) *</label>
          <input type="number" step="100" min="0" value={form.price} onChange={e => set('price', Number(e.target.value))}
            className={fieldClass} style={{ ...inputStyle, border: `1px solid ${errors.price ? 'var(--danger)' : 'var(--border)'}` }} />
          {errors.price && <p className="text-xs" style={errorStyle}>{errors.price}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider" style={labelStyle}>Stock *</label>
          <input type="number" min="0" value={form.stock} onChange={e => set('stock', Number(e.target.value))}
            className={fieldClass} style={{ ...inputStyle, border: `1px solid ${errors.stock ? 'var(--danger)' : 'var(--border)'}` }} />
          {errors.stock && <p className="text-xs" style={errorStyle}>{errors.stock}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold uppercase tracking-wider" style={labelStyle}>Género *</label>
        <select value={form.categoryId} onChange={e => set('categoryId', e.target.value)}
          className={fieldClass} style={{ ...inputStyle, border: `1px solid ${errors.categoryId ? 'var(--danger)' : 'var(--border)'}` }}>
          <option value="">{loadingCats ? 'Cargando...' : 'Seleccionar género'}</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {errors.categoryId && <p className="text-xs" style={errorStyle}>{errors.categoryId}</p>}
      </div>

      <button type="submit" disabled={loading}
        className="py-3 rounded-xl font-black uppercase tracking-wider text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all mt-2"
        style={{ background: 'var(--accent)', color: '#050806', boxShadow: '0 0 20px rgba(57,255,20,0.2)' }}>
        {loading ? <><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> Guardando...</> : submitLabel}
      </button>
    </form>
  );
}
