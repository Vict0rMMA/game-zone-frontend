'use client';
import { useState, useRef } from 'react';
import { useCategories } from '@/hooks/useCategories';
import { CreateProductPayload } from '@/types/product.types';
import api from '@/services/api';

interface Props {
  initial?: Partial<CreateProductPayload>;
  onSubmit: (data: CreateProductPayload) => Promise<void>;
  submitLabel?: string;
}

const field = { background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)' };
const err   = { color: 'var(--danger)' };
const lbl   = { color: 'var(--muted)' };

export default function ProductForm({ initial, onSubmit, submitLabel = 'Guardar' }: Props) {
  const { categories, loading: loadingCats } = useCategories();
  const [loading, setLoading]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors]     = useState<Record<string, string>>({});
  const [preview, setPreview]   = useState<string>(initial?.image ?? '');
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<CreateProductPayload>({
    name:        initial?.name        ?? '',
    description: initial?.description ?? '',
    price:       initial?.price       ?? 0,
    stock:       initial?.stock       ?? 0,
    image:       initial?.image       ?? '',
    categoryId:  initial?.categoryId  ?? '',
  });

  const set = (k: keyof CreateProductPayload, v: string | number) => {
    setForm(prev => ({ ...prev, [k]: v }));
    if (k === 'image') setPreview(v as string);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const { data } = await api.post<{ url: string }>('/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      set('image', data.url);
    } catch {
      setErrors(prev => ({ ...prev, image: 'Error al subir la imagen' }));
    } finally {
      setUploading(false);
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'El título es requerido';
    if (form.price < 0)    e.price = 'El precio no puede ser negativo';
    if (form.stock < 0)    e.stock = 'El stock no puede ser negativo';
    if (!form.categoryId)  e.categoryId = 'Selecciona un género';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try { await onSubmit(form); } finally { setLoading(false); }
  };

  const inputCls = 'px-4 py-3 rounded-xl text-sm outline-none w-full';

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">

      {/* Título */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold uppercase tracking-wider" style={lbl}>Título *</label>
        <input value={form.name} onChange={e => set('name', e.target.value)}
          placeholder="Ej: Elden Ring, GTA V..." className={inputCls}
          style={{ ...field, border: `1px solid ${errors.name ? 'var(--danger)' : 'var(--border)'}` }} />
        {errors.name && <p className="text-xs" style={err}>{errors.name}</p>}
      </div>

      {/* Imagen — upload + URL */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold uppercase tracking-wider" style={lbl}>Imagen</label>

        {/* Preview */}
        {preview && (
          <div style={{ borderRadius: 10, overflow: 'hidden', height: 140, background: 'var(--surface2)', position: 'relative' }}>
            <img src={preview} alt="preview"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={() => setPreview('')} />
            <button type="button" onClick={() => { set('image', ''); if (fileRef.current) fileRef.current.value = ''; }}
              style={{ position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              ✕
            </button>
          </div>
        )}

        {/* Botón subir archivo */}
        <button type="button" onClick={() => fileRef.current?.click()}
          disabled={uploading}
          style={{
            padding: '0.65rem 1rem', borderRadius: 10, border: '1px dashed var(--border2)',
            background: 'transparent', color: uploading ? 'var(--muted)' : 'var(--accent2)',
            cursor: uploading ? 'not-allowed' : 'pointer', fontSize: '0.82rem', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center',
            transition: 'border-color 0.15s',
          }}
          onMouseEnter={e => { if (!uploading) (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent2)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border2)'; }}>
          {uploading
            ? <><span style={{ width: 14, height: 14, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />Subiendo...</>
            : <>📁 Subir imagen desde archivo</>}
        </button>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />

        {/* O URL manual */}
        <input value={form.image ?? ''} onChange={e => set('image', e.target.value)}
          placeholder="O pega una URL: https://..." className={inputCls} style={field} />
        {errors.image && <p className="text-xs" style={err}>{errors.image}</p>}
      </div>

      {/* Descripción */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold uppercase tracking-wider" style={lbl}>Descripción</label>
        <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)}
          placeholder="Descripción del juego..." className={`${inputCls} resize-none`} style={field} />
      </div>

      {/* Precio y Stock */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider" style={lbl}>Precio (COP) *</label>
          <input type="number" step="100" min="0" value={form.price}
            onChange={e => set('price', Number(e.target.value))} className={inputCls}
            style={{ ...field, border: `1px solid ${errors.price ? 'var(--danger)' : 'var(--border)'}` }} />
          {errors.price && <p className="text-xs" style={err}>{errors.price}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider" style={lbl}>Stock *</label>
          <input type="number" min="0" value={form.stock}
            onChange={e => set('stock', Number(e.target.value))} className={inputCls}
            style={{ ...field, border: `1px solid ${errors.stock ? 'var(--danger)' : 'var(--border)'}` }} />
          {errors.stock && <p className="text-xs" style={err}>{errors.stock}</p>}
        </div>
      </div>

      {/* Categoría */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold uppercase tracking-wider" style={lbl}>Género *</label>
        <select value={form.categoryId} onChange={e => set('categoryId', e.target.value)}
          className={inputCls}
          style={{ ...field, border: `1px solid ${errors.categoryId ? 'var(--danger)' : 'var(--border)'}` }}>
          <option value="">{loadingCats ? 'Cargando...' : 'Seleccionar género'}</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {errors.categoryId && <p className="text-xs" style={err}>{errors.categoryId}</p>}
      </div>

      <button type="submit" disabled={loading || uploading}
        className="py-3 rounded-xl font-black uppercase tracking-wider text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all mt-2"
        style={{ background: 'var(--accent)', color: '#050806', boxShadow: '0 0 20px rgba(57,255,20,0.2)' }}>
        {loading
          ? <><span style={{ width: 16, height: 16, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />Guardando...</>
          : submitLabel}
      </button>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </form>
  );
}
