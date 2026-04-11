import { apiClient } from './apiClient';

export interface User {
  id: number;
  phone: string;
  role: 'patient' | 'doctor' | 'admin' | 'staff';
  name: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
  pendingApproval?: boolean;
}

export const authService = {
  async login(phone: string, password?: string): Promise<AuthResponse> {
    const payload = password ? { phone, password } : { phone };
    return apiClient('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async register(data: any): Promise<AuthResponse> {
    return apiClient('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async sendOtp(phone: string): Promise<any> {
    return apiClient('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, purpose: 'login' }),
    });
  },

  async verifyOtp(phone: string, otp: string): Promise<AuthResponse> {
    return apiClient('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp }),
    });
  },

  async me(): Promise<AuthResponse> {
    return apiClient('/auth/me');
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },
};
