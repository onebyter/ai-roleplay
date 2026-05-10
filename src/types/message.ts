export type MessageType = 'dialogue' | 'narration' | 'system' | 'ooc'

export interface Message {
  id: string
  sessionId: string
  characterId: string
  characterName: string
  content: string
  timestamp: number
  type: MessageType
  isStreaming?: boolean
  metadata?: {
    isGM: boolean
    worldStateChange?: string
    turnNumber: number
  }
}
