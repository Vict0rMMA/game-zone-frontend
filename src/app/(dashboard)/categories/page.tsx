'use client';
import { useState } from 'react';
import { useCategories } from '@/hooks/useCategories';
import { useAuth } from '@/contexts/AuthContext';
import { categoryService } from '@/services/category.service';
import { Category } from '@/types/product.types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
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
      if (editing) {
        await categoryService.update(editing.id, { name: formName.trim() });
        toast.success('Categoría actualizada');
        setEditing(null);
      } else {
        await categoryService.create({ name: formName.trim() });
        toast.success('Categoría creada');
        setShowCreate(false);
      }
      refetch();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error';
      setFormError(msg);
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await categoryService.remove(deleting.id);
      toast.success('Categoría eliminada');
      setDeleting(null);
      refetch();
    } catch { toast.error('Error al eliminar. Puede tener productos asociados.'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Categorías</h1>
        {user?.role === 'ADMIN' && <Button onClick={openCreate}>+ Nueva categoría</Button>}
      </div>

      {loading && <LoadingSpinner />}
      {error && <div className="text-center py-8 text-red-500">{error}</div>}
      {!loading && categories.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-2">🏷️</div>
          <p>No hay categorías aún.</p>
        </div>
      )}

      {!loading && categories.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Nombre</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Creada</th>
                {user?.role === 'ADMIN' && <th className="px-4 py-3" />}
              </tr>
            </thead>
            <tbody>
              {categories.map((c, i) => (
                <tr key={c.id} className={`border-b last:border-0 ${i % 2 === 0 ? '' : 'bg-gray-50/50'}`}>
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(c.createdAt).toLocaleDateString('es-CO')}</td>
                  {user?.role === 'ADMIN' && (
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <Button variant="secondary" className="text-xs py-1 px-2" onClick={() => openEdit(c)}>Editar</Button>
                        <Button variant="danger" className="text-xs py-1 px-2" onClick={() => setDeleting(c)}>Eliminar</Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showCreate || !!editing} title={editing ? 'Editar categoría' : 'Nueva categoría'} onClose={() => { setShowCreate(false); setEditing(null); }}>
        <div className="flex flex-col gap-4">
          <Input label="Nombre *" id="cat-name" value={formName} onChange={e => { setFormName(e.target.value); setFormError(''); }} error={formError} placeholder="Ej: Electrónica" />
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => { setShowCreate(false); setEditing(null); }}>Cancelar</Button>
            <Button loading={saving} onClick={handleSave}>{editing ? 'Guardar' : 'Crear'}</Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!deleting} title="Confirmar eliminación" onClose={() => setDeleting(null)}>
        <p className="text-sm text-gray-600 mb-4">¿Eliminar la categoría <strong>{deleting?.name}</strong>?</p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setDeleting(null)}>Cancelar</Button>
          <Button variant="danger" onClick={handleDelete}>Eliminar</Button>
        </div>
      </Modal>
    </div>
  );
}
