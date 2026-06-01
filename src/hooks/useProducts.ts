'use client';
import { useState, useEffect, useCallback } from 'react';
import { Product, PaginationMeta } from '@/types/product.types';
import { productService } from '@/services/product.service';

export function useProducts(filters?: { search?: string; categoryId?: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async (p = 1) => {
    setLoading(true);
    setError(null);
    try {
      const result = await productService.getAll({ page: p, limit: 10, ...filters });
      setProducts(result.data);
      setMeta(result.meta);
      setPage(p);
    } catch {
      setError('Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  }, [filters?.search, filters?.categoryId]);

  useEffect(() => { fetch(1); }, [fetch]);

  return { products, meta, page, loading, error, refetch: fetch };
}
