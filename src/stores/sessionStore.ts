import { create } from 'zustand'
import { Session } from '@/types/session'
import { SessionMode, WorldSetting, WorldState } from '@/types/agent'
import { v4 as uuidv4 } from 'uuid'

interface SessionSummary {
  id: string
  name: string
  createdAt: number
  updatedAt: number
}

interface SessionState {
  currentSession: Session | null
  sessions: SessionSummary[]

  // Actions
  createSession: (name: string, worldSetting?: Partial<WorldSetting>) => Session
  loadSession: (id: string) => Promise<void>
  setCurrentSession: (session: Session | null) => void
  updateSession: (updates: Partial<Session>) => void
  saveCurrentSession: () => Promise<void>
  loadSessionList: () => Promise<void>
  deleteSession: (id: string) => Promise<void>
  setMode: (mode: SessionMode) => void
  setUserRole: (role: 'player' | 'gm', characterId?: string) => void
  updateWorldState: (state: Partial<WorldState>) => void
  setSessions: (sessions: SessionSummary[]) => void
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
    set((state) => ({
      currentSession: session,
      sessions: [
        { id: session.id, name: session.name, createdAt: session.createdAt, updatedAt: session.updatedAt },
        ...state.sessions,
      ],
    }))
    // Persist to database
    window.electronAPI.db.saveSession(session).catch(console.error)
    return session
  },

  loadSession: async (id) => {
    try {
      const session = await window.electronAPI.db.loadSession(id)
      if (session) {
        set({ currentSession: session })
      }
    } catch (error) {
      console.error('Failed to load session:', error)
    }
  },

  setCurrentSession: (session) => set({ currentSession: session }),

  updateSession: (updates) =>
    set((state) => {
      if (!state.currentSession) return state
      const updated = { ...state.currentSession, ...updates, updatedAt: Date.now() }
      // Auto-save
      window.electronAPI.db.saveSession(updated).catch(console.error)
      // Update sessions list
      const sessions = state.sessions.map((s) =>
        s.id === updated.id ? { ...s, name: updated.name, updatedAt: updated.updatedAt } : s
      )
      return { currentSession: updated, sessions }
    }),

  saveCurrentSession: async () => {
    const { currentSession } = get()
    if (currentSession) {
      await window.electronAPI.db.saveSession(currentSession)
    }
  },

  loadSessionList: async () => {
    try {
      const rows = await window.electronAPI.db.listSessions()
      set({ sessions: rows as SessionSummary[] })
    } catch (error) {
      console.error('Failed to load session list:', error)
    }
  },

  deleteSession: async (id) => {
    try {
      await window.electronAPI.db.deleteSession(id)
      set((state) => ({
        sessions: state.sessions.filter((s) => s.id !== id),
        currentSession: state.currentSession?.id === id ? null : state.currentSession,
      }))
    } catch (error) {
      console.error('Failed to delete session:', error)
    }
  },

  setMode: (mode) =>
    set((state) => {
      if (!state.currentSession) return state
      const updated = { ...state.currentSession, mode, updatedAt: Date.now() }
      window.electronAPI.db.saveSession(updated).catch(console.error)
      return { currentSession: updated }
    }),

  setUserRole: (role, characterId) =>
    set((state) => {
      if (!state.currentSession) return state
      const updated = { ...state.currentSession, userRole: role, userCharacterId: characterId, updatedAt: Date.now() }
      window.electronAPI.db.saveSession(updated).catch(console.error)
      return { currentSession: updated }
    }),

  updateWorldState: (worldState) =>
    set((state) => {
      if (!state.currentSession) return state
      const updated = {
        ...state.currentSession,
        worldState: { ...state.currentSession.worldState, ...worldState },
        updatedAt: Date.now(),
      }
      window.electronAPI.db.saveSession(updated).catch(console.error)
      return { currentSession: updated }
    }),

  setSessions: (sessions) => set({ sessions }),
}))
