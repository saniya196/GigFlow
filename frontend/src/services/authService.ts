import { apiClient } from './apiClient';
import { ApiResponse, AuthResponse, LoginFormData, RegisterFormData, User } from '../types';

const login = async (credentials: LoginFormData): Promise<AuthResponse> => {
  const { data } = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
  if (!data.data) throw new Error('Login failed');
  return data.data;
};

const register = async (userData: RegisterFormData): Promise<AuthResponse> => {
  const { data } = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', userData);
  if (!data.data) throw new Error('Registration failed');
  return data.data;
};

const forgotPassword = async (email: string): Promise<void> => {
  const { data } = await apiClient.post<ApiResponse<void>>('/auth/forgot-password', { email });
  if (!data.data) throw new Error('Failed to send reset email');
};

const resetPassword = async (email: string, token: string, newPassword: string): Promise<void> => {
  const { data } = await apiClient.post<ApiResponse<void>>('/auth/reset-password', {
    email,
    token,
    newPassword,
  });
  if (!data.data) throw new Error('Password reset failed');
};

const getProfile = async (): Promise<User> => {
  const { data } = await apiClient.get<ApiResponse<{ user: User }>>('/auth/profile');
  if (!data.data?.user) throw new Error('Failed to fetch profile');
  return data.data.user;
};

const setToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

const removeToken = (): void => {
  localStorage.removeItem('auth_token');
};

const getToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

export const authService = {
  login,
  register,
  forgotPassword,
  resetPassword,
  getProfile,
  setToken,
  removeToken,
  getToken,
};
