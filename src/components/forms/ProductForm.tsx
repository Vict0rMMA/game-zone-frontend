'use client';
import { useState } from 'react';
import { useCategories } from '@/hooks/useCategories';
import { CreateProductPayload } from '@/types/product.types';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface Props {
  initial?: Partial<CreateProductPayload>;
  onSubmit: (data: CreateProductPayload) => Promise<void>;
  submitLabel?: string;
}

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

  const set = (k: keyof CreateProductPayload, v: string | number) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'El nombre es requerido';
    if (form.price <= 0) e.price = 'El precio debe ser mayor a 0';
    if (form.stock < 0) e.stock = 'El stock no puede ser negativo';
    if (!form.categoryId) e.categoryId = 'Selecciona una categoría';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try { await onSubmit(form); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input label="Nombre *" id="name" value={form.name} onChange={e => set('name', e.target.value)} error={errors.name} placeholder="Ej: Laptop Dell XPS" />
      <div className="flex flex-col gap-1">
        <label htmlFor="desc" className="text-sm font-medium text-gray-700">Descripción</label>
        <textarea id="desc" rows={3} value={form.description} onChange={e => set('description', e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 resize-none" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Precio *" id="price" type="number" step="0.01" min="0" value={form.price} onChange={e => set('price', Number(e.target.value))} error={errors.price} />
        <Input label="Stock *" id="stock" type="number" min="0" value={form.stock} onChange={e => set('stock', Number(e.target.value))} error={errors.stock} />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="cat" className="text-sm font-medium text-gray-700">Categoría *</label>
        <select id="cat" value={form.categoryId} onChange={e => set('categoryId', e.target.value)}
          className={`border rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 ${errors.categoryId ? 'border-red-500' : 'border-gray-300'}`}>
          <option value="">{loadingCats ? 'Cargando...' : 'Seleccionar categoría'}</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {errors.categoryId && <p className="text-xs text-red-600">{errors.categoryId}</p>}
      </div>
      <Button type="submit" loading={loading}>{submitLabel}</Button>
    </form>
  );
}
