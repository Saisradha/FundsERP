import { create } from 'zustand';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('erpflow_user') || 'null'),
  token: localStorage.getItem('erpflow_token'),
  isAuthenticated: !!localStorage.getItem('erpflow_token'),
  setAuth: (user, token) => {
    localStorage.setItem('erpflow_user', JSON.stringify(user));
    localStorage.setItem('erpflow_token', token);
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('erpflow_user');
    localStorage.removeItem('erpflow_token');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
