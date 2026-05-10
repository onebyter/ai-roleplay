import { create } from 'zustand'
import { Message } from '@/types/message'
import { v4 as uuidv4 } from 'uuid'

interface ChatState {
  messages: Message[]
  isGenerating: boolean
  generatingAgentId: string | null
  streamingContent: string

  // Actions
  addMessage: (msg: Omit<Message, 'id' | 'timestamp'>) => Message
  updateMessage: (id: string, updates: Partial<Message>) => void
  appendToStreaming: (content: string) => void
  setStreaming: (isGenerating: boolean, agentId?: string) => void
  finishStreaming: (agentId: string, finalContent: string) => void
  clearMessages: () => void
  setMessages: (messages: Message[]) => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isGenerating: false,
  generatingAgentId: null,
  streamingContent: '',

  addMessage: (msg) => {
    const newMsg: Message = {
      ...msg,
      id: uuidv4(),
      timestamp: Date.now(),
    }
    set((state) => ({ messages: [...state.messages, newMsg] }))
    return newMsg
  },

  updateMessage: (id, updates) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      ),
    })),

  appendToStreaming: (content) =>
    set((state) => ({
      streamingContent: state.streamingContent + content,
    })),

  setStreaming: (isGenerating, agentId) =>
    set({
      isGenerating,
      generatingAgentId: agentId || null,
      streamingContent: isGenerating ? '' : get().streamingContent,
    }),

  finishStreaming: (agentId, finalContent) => {
    const state = get()
    // Add the final message
    const newMsg: Message = {
      id: uuidv4(),
      sessionId: '',
      characterId: agentId,
      characterName: '',
      content: finalContent,
      timestamp: Date.now(),
      type: 'dialogue',
    }
    set({
      messages: [...state.messages, newMsg],
      isGenerating: false,
      generatingAgentId: null,
      streamingContent: '',
    })
  },

  clearMessages: () => set({ messages: [], streamingContent: '' }),

  setMessages: (messages) => set({ messages }),
}))
