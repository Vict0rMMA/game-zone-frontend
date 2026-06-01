'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { productService } from '@/services/product.service';
import { CreateProductPayload } from '@/types/product.types';
import ProductForm from '@/components/forms/ProductForm';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function NewProductPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== 'ADMIN') router.replace('/products');
  }, [user, router]);

  const handleSubmit = async (data: CreateProductPayload) => {
    try {
      await productService.create(data);
      toast.success('Producto creado exitosamente');
      router.push('/products');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error al crear el producto';
      toast.error(msg);
    }
  };

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/products" style={{ color: 'var(--muted)' }} className="text-lg">←</Link>
        <h1 className="text-2xl font-black uppercase tracking-wider">Nuevo juego</h1>
      </div>
      <div className="rounded-2xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <ProductForm onSubmit={handleSubmit} submitLabel="Crear juego" />
      </div>
    </div>
  );
}
