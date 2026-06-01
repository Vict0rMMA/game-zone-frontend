'use client';
import { useState } from 'react';
import { useCategories } from '@/hooks/useCategories';
import { useAuth } from '@/contexts/AuthContext';
import { categoryService } from '@/services/category.service';
import { Category } from '@/types/product.types';
import Modal from '@/components/ui/Modal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

export default function CategoriesPage() {
  const { user } = useAuth();
  const { categories, loading, error, refetch } = useCategories();
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [formName, setFormName] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const openCreate = () => { setFormName(''); setFormError(''); setShowCreate(true); };
  const openEdit = (c: Category) => { setEditing(c); setFormName(c.name); setFormError(''); };

  const handleSave = async () => {
    if (!formName.trim()) { setFormError('El nombre es requerido'); return; }
    setSaving(true);
    try {
      if (editing) { await categoryService.update(editing.id, { name: formName.trim() }); toast.success('Género actualizado'); setEditing(null); }
      else { await categoryService.create({ name: formName.trim() }); toast.success('Género creado'); setShowCreate(false); }
      refetch();
    } catch (err: unknown) {
      setFormError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try { await categoryService.remove(deleting.id); toast.success('Género eliminado'); setDeleting(null); refetch(); }
    catch { toast.error('Error: puede tener juegos asociados'); }
  };

  const btn = (s: 'primary' | 'danger' | 'ghost') => ({
    primary: { background: 'rgba(57,255,20,0.12)', color: 'var(--accent)', border: '1px solid rgba(57,255,20,0.25)' },
    danger:  { background: 'rgba(255,71,87,0.1)',  color: 'var(--danger)', border: '1px solid rgba(255,71,87,0.25)' },
    ghost:   { background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)' },
  }[s]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black uppercase tracking-wider">🏷️ Géneros</h1>
        {user?.role === 'ADMIN' && (
          <button onClick={openCreate} className="px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wide" style={btn('primary')}>
            ➕ Nuevo género
          </button>
        )}
      </div>

      {loading && <LoadingSpinner />}
      {error && <div className="text-center py-8" style={{ color: 'var(--danger)' }}>{error}</div>}
      {!loading && categories.length === 0 && (
        <div className="text-center py-20" style={{ color: 'var(--muted)' }}>
          <div className="text-5xl mb-4">🏷️</div>
          <p>No hay géneros creados aún</p>
        </div>
      )}

      {!loading && categories.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map(c => (
            <div key={c.id} className="rounded-xl p-4 flex items-center justify-between" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div>
                <div className="font-bold">{c.name}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{new Date(c.createdAt).toLocaleDateString('es-CO')}</div>
              </div>
              {user?.role === 'ADMIN' && (
                <div className="flex gap-2">
                  <button onClick={() => openEdit(c)} className="px-2.5 py-1.5 rounded-lg text-xs font-bold" style={btn('ghost')}>✏️</button>
                  <button onClick={() => setDeleting(c)} className="px-2.5 py-1.5 rounded-lg text-xs font-bold" style={btn('danger')}>🗑</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={showCreate || !!editing} title={editing ? 'Editar género' : 'Nuevo género'} onClose={() => { setShowCreate(false); setEditing(null); }}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Nombre del género</label>
            <input value={formName} onChange={e => { setFormName(e.target.value); setFormError(''); }}
              placeholder="Ej: Acción, RPG, FPS..." className="px-4 py-3 rounded-xl text-sm outline-none"
              style={{ background: 'var(--bg2)', border: `1px solid ${formError ? 'var(--danger)' : 'var(--border)'}`, color: 'var(--text)' }} />
            {formError && <p className="text-xs" style={{ color: 'var(--danger)' }}>{formError}</p>}
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => { setShowCreate(false); setEditing(null); }} className="px-4 py-2 rounded-xl text-sm font-bold" style={{ background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)' }}>Cancelar</button>
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50"
              style={{ background: 'var(--accent)', color: '#050806' }}>
              {saving ? 'Guardando...' : editing ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={!!deleting} title="Eliminar género" onClose={() => setDeleting(null)}>
        <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>¿Eliminar el género <strong style={{ color: 'var(--text)' }}>{deleting?.name}</strong>?</p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setDeleting(null)} className="px-4 py-2 rounded-xl text-sm font-bold" style={{ background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)' }}>Cancelar</button>
          <button onClick={handleDelete} className="px-4 py-2 rounded-xl text-sm font-bold" style={{ background: 'rgba(255,71,87,0.1)', color: 'var(--danger)', border: '1px solid rgba(255,71,87,0.25)' }}>Eliminar</button>
        </div>
      </Modal>
    </div>
  );
}
