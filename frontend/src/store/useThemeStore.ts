import { create } from 'zustand';

type ThemeMode = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';
type ViewMode = 'hub' | '3d';

interface ThemeStore {
  themeMode: ThemeMode;
  resolvedTheme: ResolvedTheme;
  viewMode: ViewMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  setViewMode: (mode: ViewMode) => void;
  initTheme: () => void;
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === 'system') return getSystemTheme();
  return mode;
}

function applyThemeClass(theme: ResolvedTheme) {
  const root = document.documentElement;
  root.classList.remove('theme-light', 'theme-dark');
  root.classList.add(`theme-${theme}`);
}

const savedTheme = (typeof window !== 'undefined'
  ? localStorage.getItem('erpflow-theme') as ThemeMode | null
  : null) || 'dark';

const savedView = (typeof window !== 'undefined'
  ? localStorage.getItem('erpflow-view') as ViewMode | null
  : null) || '3d';

export const useThemeStore = create<ThemeStore>((set, get) => ({
  themeMode: savedTheme,
  resolvedTheme: resolveTheme(savedTheme),
  viewMode: savedView,

  setThemeMode: (mode: ThemeMode) => {
    const resolved = resolveTheme(mode);
    localStorage.setItem('erpflow-theme', mode);
    applyThemeClass(resolved);
    set({ themeMode: mode, resolvedTheme: resolved });
  },

  toggleTheme: () => {
    const current = get().themeMode;
    const next: ThemeMode = current === 'dark' ? 'light' : current === 'light' ? 'system' : 'dark';
    get().setThemeMode(next);
  },

  setViewMode: (mode: ViewMode) => {
    localStorage.setItem('erpflow-view', mode);
    set({ viewMode: mode });
  },

  initTheme: () => {
    const mode = get().themeMode;
    const resolved = resolveTheme(mode);
    applyThemeClass(resolved);
    set({ resolvedTheme: resolved });

    // Listen for system theme changes
    if (mode === 'system') {
      const mql = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e: MediaQueryListEvent) => {
        if (get().themeMode === 'system') {
          const newResolved = e.matches ? 'dark' : 'light';
          applyThemeClass(newResolved as ResolvedTheme);
          set({ resolvedTheme: newResolved as ResolvedTheme });
        }
      };
      mql.addEventListener('change', handler);
    }
  },
}));

// Backward compatibility exports
export type { ThemeMode, ResolvedTheme, ViewMode };
