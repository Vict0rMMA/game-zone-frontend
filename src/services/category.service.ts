import api from './api';
import { Category, PaginatedResponse, CreateCategoryPayload } from '@/types/product.types';

export const categoryService = {
  async getAll(params?: { page?: number; limit?: number }) {
    const { data } = await api.get<PaginatedResponse<Category>>('/categories', { params });
    return data;
  },
  async getById(id: string) {
    const { data } = await api.get<Category>(`/categories/${id}`);
    return data;
  },
  async create(payload: CreateCategoryPayload) {
    const { data } = await api.post<Category>('/categories', payload);
    return data;
  },
  async update(id: string, payload: CreateCategoryPayload) {
    const { data } = await api.put<Category>(`/categories/${id}`, payload);
    return data;
  },
  async remove(id: string) {
    await api.delete(`/categories/${id}`);
  },
};
