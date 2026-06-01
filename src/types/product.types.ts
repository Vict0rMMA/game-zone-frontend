export interface Category { id: string; name: string; createdAt: string; updatedAt: string }

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  image: string | null;
  categoryId: string;
  category: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta { total: number; page: number; limit: number; totalPages: number }
export interface PaginatedResponse<T> { data: T[]; meta: PaginationMeta }

export interface CreateProductPayload {
  name: string;
  description?: string;
  price: number;
  stock: number;
  image?: string;
  categoryId: string;
}

export interface CreateCategoryPayload { name: string }
