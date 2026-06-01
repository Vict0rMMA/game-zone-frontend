'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { productService } from '@/services/product.service';
import { Product, CreateProductPayload } from '@/types/product.types';
import ProductForm from '@/components/forms/ProductForm';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function EditProductPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== 'ADMIN') { router.replace('/products'); return; }
    productService.getById(id).then(setProduct).catch(() => {
      toast.error('Producto no encontrado');
      router.push('/products');
    }).finally(() => setLoading(false));
  }, [id, user, router]);

  const handleSubmit = async (data: CreateProductPayload) => {
    try {
      await productService.update(id, data);
      toast.success('Producto actualizado');
      router.push('/products');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error al actualizar';
      toast.error(msg);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/products" className="text-gray-400 hover:text-gray-600">←</Link>
        <h1 className="text-2xl font-bold">Editar Producto</h1>
      </div>
      <div className="bg-white rounded-xl shadow-sm border p-6">
        {product && (
          <ProductForm
            initial={{ name: product.name, description: product.description ?? '', price: product.price, stock: product.stock, categoryId: product.categoryId }}
            onSubmit={handleSubmit}
            submitLabel="Guardar cambios"
          />
        )}
      </div>
    </div>
  );
}
