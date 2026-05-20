import { apiClient } from './apiClient';
import { ApiResponse, AuthResponse, LoginFormData, RegisterFormData, User } from '../types';

export const authService = {
  async login(credentials: LoginFormData): Promise<AuthResponse> {
    const { data } = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    if (!data.data) throw new Error('Login failed');
    return data.data;
  },

  async register(userData: RegisterFormData): Promise<AuthResponse> {
    const { data } = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', userData);
    if (!data.data) throw new Error('Registration failed');
    return data.data;
  },

  async getProfile(): Promise<User> {
    const { data } = await apiClient.get<ApiResponse<{ user: User }>>('/auth/profile');
    if (!data.data?.user) throw new Error('Failed to fetch profile');
    return data.data.user;
  },

  setToken(token: string): void {
    localStorage.setItem('auth_token', token);
  },

  removeToken(): void {
    localStorage.removeItem('auth_token');
  },

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },
}; 
