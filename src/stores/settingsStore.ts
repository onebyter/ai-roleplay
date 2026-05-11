import { create } from 'zustand'
import { APIConfig, DEFAULT_API_CONFIGS } from '@/types/agent'

interface SettingsState {
  apiConfigs: APIConfig[]
  selectedConfigId: string
  theme: 'dark' | 'light'
  language: 'zh' | 'en'

  // Actions
  addAPIConfig: (config: APIConfig) => void
  updateAPIConfig: (id: string, updates: Partial<APIConfig>) => void
  removeAPIConfig: (id: string) => void
  setSelectedConfig: (id: string) => void
  setTheme: (theme: 'dark' | 'light') => void
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key)
    if (data) return JSON.parse(data)
  } catch {}
  return fallback
}

function saveToStorage(key: string, value: any) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

function getInitialTheme(): 'dark' | 'light' {
  try {
    const saved = localStorage.getItem('theme')
    if (saved === 'light' || saved === 'dark') return saved
  } catch {}
  return 'dark'
}

export const useSettingsStore = create<SettingsState>((set) => ({
  apiConfigs: loadFromStorage<APIConfig[]>('apiConfigs', DEFAULT_API_CONFIGS),
  selectedConfigId: loadFromStorage<string>('selectedConfigId', 'deepseek'),
  theme: getInitialTheme(),
  language: 'zh',

  addAPIConfig: (config) =>
    set((state) => {
      const apiConfigs = [...state.apiConfigs, config]
      saveToStorage('apiConfigs', apiConfigs)
      return { apiConfigs }
    }),

  updateAPIConfig: (id, updates) =>
    set((state) => {
      const apiConfigs = state.apiConfigs.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      )
      saveToStorage('apiConfigs', apiConfigs)
      return { apiConfigs }
    }),

  removeAPIConfig: (id) =>
    set((state) => {
      const apiConfigs = state.apiConfigs.filter((c) => c.id !== id)
      saveToStorage('apiConfigs', apiConfigs)
      return { apiConfigs }
    }),

  setSelectedConfig: (id) => {
    saveToStorage('selectedConfigId', id)
    set({ selectedConfigId: id })
  },
  setTheme: (theme) => set({ theme }),
}))
