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
        <Link href="/products" className="text-gray-400 hover:text-gray-600">←</Link>
        <h1 className="text-2xl font-bold">Nuevo Producto</h1>
      </div>
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <ProductForm onSubmit={handleSubmit} submitLabel="Crear producto" />
      </div>
    </div>
  );
}
