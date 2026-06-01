import api from './api';
import { Product, PaginatedResponse, CreateProductPayload } from '@/types/product.types';

export const productService = {
  async getAll(params?: { page?: number; limit?: number; search?: string; categoryId?: string }) {
    const { data } = await api.get<PaginatedResponse<Product>>('/products', { params });
    return data;
  },
  async getById(id: string) {
    const { data } = await api.get<Product>(`/products/${id}`);
    return data;
  },
  async create(payload: CreateProductPayload) {
    const { data } = await api.post<Product>('/products', payload);
    return data;
  },
  async update(id: string, payload: Partial<CreateProductPayload>) {
    const { data } = await api.put<Product>(`/products/${id}`, payload);
    return data;
  },
  async remove(id: string) {
    await api.delete(`/products/${id}`);
  },
};
