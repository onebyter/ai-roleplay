import { create } from 'zustand'
import { Session } from '@/types/session'
import { SessionMode, WorldSetting, WorldState } from '@/types/agent'
import { v4 as uuidv4 } from 'uuid'

interface SessionState {
  currentSession: Session | null
  sessions: { id: string; name: string; updatedAt: number }[]

  // Actions
  createSession: (name: string, worldSetting?: Partial<WorldSetting>) => Session
  setCurrentSession: (session: Session | null) => void
  updateSession: (updates: Partial<Session>) => void
  setMode: (mode: SessionMode) => void
  setUserRole: (role: 'player' | 'gm', characterId?: string) => void
  updateWorldState: (state: Partial<WorldState>) => void
  setSessions: (sessions: { id: string; name: string; updatedAt: number }[]) => void
}

const DEFAULT_WORLD_SETTING: WorldSetting = {
  id: 'default',
  name: '默认世界',
  description: '一个开放的幻想世界，等待你的探索。',
  rules: ['保持角色一致性', '不要破坏已建立的世界观'],
  loreEntries: [],
  systemPrompt: '你正在参与一个多角色故事。请保持角色扮演的沉浸感。',
}

const DEFAULT_WORLD_STATE: WorldState = {
  currentTime: '未知',
  location: '起始之地',
  environment: '一片宁静的区域',
  activeEvents: [],
  customFields: {},
}

export const useSessionStore = create<SessionState>((set, get) => ({
  currentSession: null,
  sessions: [],

  createSession: (name, worldSetting) => {
    const session: Session = {
      id: uuidv4(),
      name,
      mode: 'gm-led',
      worldSetting: { ...DEFAULT_WORLD_SETTING, ...worldSetting },
      characters: [],
      messages: [],
      worldState: { ...DEFAULT_WORLD_STATE },
      agentMemories: {},
      userRole: 'gm',
      turnOrder: [],
      currentTurn: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    set({ currentSession: session })
    return session
  },

  setCurrentSession: (session) => set({ currentSession: session }),

  updateSession: (updates) =>
    set((state) => ({
      currentSession: state.currentSession
        ? { ...state.currentSession, ...updates, updatedAt: Date.now() }
        : null,
    })),

  setMode: (mode) =>
    set((state) => ({
      currentSession: state.currentSession
        ? { ...state.currentSession, mode, updatedAt: Date.now() }
        : null,
    })),

  setUserRole: (role, characterId) =>
    set((state) => ({
      currentSession: state.currentSession
        ? {
            ...state.currentSession,
            userRole: role,
            userCharacterId: characterId,
            updatedAt: Date.now(),
          }
        : null,
    })),

  updateWorldState: (worldState) =>
    set((state) => ({
      currentSession: state.currentSession
        ? {
            ...state.currentSession,
            worldState: { ...state.currentSession.worldState, ...worldState },
            updatedAt: Date.now(),
          }
        : null,
    })),

  setSessions: (sessions) => set({ sessions }),
}))
