export interface Character {
  id: string
  name: string
  avatar: string
  description: string
  personality: string
  speakingStyle: string
  systemPrompt: string
  exampleDialogue: string
  firstMessage: string
  tags: string[]
  createdAt: number
  source?: 'manual' | 'novel'
  sourceNovel?: string
  agentConfig: {
    provider: string
    model: string
    temperature: number
    maxTokens: number
  }
}

export const DEFAULT_CHARACTER: Omit<Character, 'id' | 'createdAt'> = {
  name: '',
  avatar: '',
  description: '',
  personality: '',
  speakingStyle: '',
  systemPrompt: '',
  exampleDialogue: '',
  firstMessage: '',
  tags: [],
  source: 'manual',
  agentConfig: {
    provider: 'default',
    model: 'deepseek-chat',
    temperature: 0.8,
    maxTokens: 2048,
  },
}
