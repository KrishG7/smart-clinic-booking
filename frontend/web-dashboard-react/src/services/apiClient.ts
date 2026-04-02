// Centralized API Client for WaitZero Web Dashboard
const API_BASE = 'http://localhost:3000/api';

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

export const apiClient = async (endpoint: string, options: FetchOptions = {}) => {
  const token = localStorage.getItem('token');
  
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  // Only auto-redirect on 401 if the user HAD a token (session expired).
  // Auth endpoints (login, register, etc.) legitimately return 401 for bad credentials.
  const isAuthEndpoint = endpoint.startsWith('/auth/login') ||
                         endpoint.startsWith('/auth/register') ||
                         endpoint.startsWith('/auth/verify-otp') ||
                         endpoint.startsWith('/auth/send-otp');

  if (response.status === 401 && token && !isAuthEndpoint) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Session expired');
  }

  return response.json();
};
