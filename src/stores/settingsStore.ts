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

export const useSettingsStore = create<SettingsState>((set) => ({
  apiConfigs: DEFAULT_API_CONFIGS,
  selectedConfigId: 'deepseek',
  theme: 'dark',
  language: 'zh',

  addAPIConfig: (config) =>
    set((state) => ({ apiConfigs: [...state.apiConfigs, config] })),

  updateAPIConfig: (id, updates) =>
    set((state) => ({
      apiConfigs: state.apiConfigs.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    })),

  removeAPIConfig: (id) =>
    set((state) => ({
      apiConfigs: state.apiConfigs.filter((c) => c.id !== id),
    })),

  setSelectedConfig: (id) => set({ selectedConfigId: id }),
  setTheme: (theme) => set({ theme }),
}))
