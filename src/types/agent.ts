export interface AgentMemory {
  agentId: string
  shortTerm: string[]      // Recent dialogue summaries
  longTerm: string[]       // Key events and facts
  relationships: Record<string, string>  // How this agent sees others
}

export interface AgentState {
  id: string
  characterId: string
  isActive: boolean
  isGenerating: boolean
  currentContent: string
}

export interface APIConfig {
  id: string
  name: string
  baseURL: string
  apiKey: string
  models: string[]
}

export const DEFAULT_API_CONFIGS: APIConfig[] = [
  {
    id: 'deepseek',
    name: 'DeepSeek',
    baseURL: 'https://api.deepseek.com',
    apiKey: '',
    models: ['deepseek-chat', 'deepseek-reasoner'],
  },
  {
    id: 'openai',
    name: 'OpenAI',
    baseURL: 'https://api.openai.com/v1',
    apiKey: '',
    models: ['gpt-4o', 'gpt-4o-mini'],
  },
]

export type SessionMode = 'gm-led' | 'free-chat'

export interface WorldState {
  currentTime: string
  location: string
  environment: string
  activeEvents: string[]
  customFields: Record<string, string>
}

export interface WorldSetting {
  id: string
  name: string
  description: string
  rules: string[]
  loreEntries: LoreEntry[]
  systemPrompt: string
}

export interface LoreEntry {
  id: string
  keywords: string[]
  content: string
  priority: number
}
