import { create } from 'zustand';

interface ThemeStore {
  theme: 'dark' | 'light';
  viewMode: 'hub' | '3d';
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setViewMode: (mode: 'hub' | '3d') => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: 'dark',
  viewMode: '3d',
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
  setTheme: (theme) => set({ theme }),
  setViewMode: (viewMode) => set({ viewMode }),
}));
