import { Character } from './character'
import { Message } from './message'
import { AgentMemory, SessionMode, WorldSetting, WorldState } from './agent'

export interface Session {
  id: string
  name: string
  mode: SessionMode
  worldSetting: WorldSetting
  characters: Character[]
  messages: Message[]
  worldState: WorldState
  agentMemories: Record<string, AgentMemory>
  userRole: 'player' | 'gm'
  userCharacterId?: string
  turnOrder: string[]
  currentTurn: number
  createdAt: number
  updatedAt: number
}
