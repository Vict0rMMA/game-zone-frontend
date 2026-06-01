'use client';
import { useState, useEffect } from 'react';
import { Category } from '@/types/product.types';
import { categoryService } from '@/services/category.service';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const result = await categoryService.getAll({ limit: 100 });
      setCategories(result.data);
    } catch {
      setError('Error al cargar las categorías');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  return { categories, loading, error, refetch: fetch };
}
