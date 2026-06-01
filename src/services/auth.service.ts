import api from './api';
import { AuthResponse, LoginPayload, RegisterPayload, User } from '@/types/auth.types';

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', payload);
    return data;
  },
  async register(payload: RegisterPayload): Promise<{ message: string; user: User }> {
    const { data } = await api.post('/auth/register', payload);
    return data;
  },
  async me(): Promise<User> {
    const { data } = await api.get<User>('/auth/me');
    return data;
  },
};
