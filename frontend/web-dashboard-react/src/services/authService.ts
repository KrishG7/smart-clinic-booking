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
}

export const authService = {
  async login(phone: string, password?: string): Promise<AuthResponse> {
    const payload = password ? { phone, password } : { phone };
    const res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async register(data: any): Promise<AuthResponse> {
    const res = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async sendOtp(phone: string): Promise<any> {
    const res = await fetch('http://localhost:3000/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, purpose: 'login' }),
    });
    return res.json();
  },

  async verifyOtp(phone: string, otp: string): Promise<AuthResponse> {
    const res = await fetch('http://localhost:3000/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp }),
    });
    return res.json();
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
