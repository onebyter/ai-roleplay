import { APIConfig, AgentMemory } from '@/types/agent'
import { Character } from '@/types/character'
import { Message } from '@/types/message'

declare global {
  interface Window {
    electronAPI: {
      db: {
        query: (sql: string, params?: any[]) => Promise<any[]>
        run: (sql: string, params?: any[]) => Promise<any>
        saveSession: (session: any) => Promise<any>
        loadSession: (id: string) => Promise<any>
        listSessions: () => Promise<any[]>
        deleteSession: (id: string) => Promise<any>
      }
      llm: {
        streamChat: (config: any, messages: any[], agentId: string) => Promise<any>
        stopStream: (agentId: string) => Promise<any>
      }
      file: {
        readTxt: (filePath: string) => Promise<any>
        openFile: () => Promise<any>
        saveFile: (content: string, defaultName?: string) => Promise<any>
      }
      onStreamChunk: (callback: (data: { agentId: string; chunk: string }) => void) => () => void
      onStreamEnd: (callback: (data: { agentId: string }) => void) => () => void
      onStreamError: (callback: (data: { agentId: string; error: string }) => void) => () => void
    }
  }
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export function buildCharacterPrompt(
  character: Character,
  worldDescription: string,
  memory?: AgentMemory
): string {
  const parts = [
    `你正在参与一个多角色故事。以下是你的角色信息：`,
    ``,
    `## 角色名称`,
    character.name,
    ``,
    `## 角色描述`,
    character.description,
    ``,
    `## 性格特征`,
    character.personality,
    ``,
    `## 说话风格`,
    character.speakingStyle,
    ``,
    `## 当前世界设定`,
    worldDescription,
  ]

  if (memory && memory.longTerm.length > 0) {
    parts.push(
      ``,
      `## 你的记忆`,
      ...memory.longTerm
    )
  }

  if (character.exampleDialogue) {
    parts.push(
      ``,
      `## 示例对话`,
      character.exampleDialogue
    )
  }

  parts.push(
    ``,
    `## 规则`,
    `- 始终以 ${character.name} 的身份发言`,
    `- 保持角色一致性`,
    `- 不要替其他角色发言`,
    `- 回复使用 ${character.speakingStyle} 的风格`,
    `- 回复简洁自然，像真实对话一样`,
    `- 使用中文回复`
  )

  return parts.join('\n')
}

export function buildGMPrompt(worldDescription: string): string {
  return `你是一个故事的游戏主持人(GM)。你的职责是：
- 推进故事发展
- 描述环境和场景
- 控制NPC的行为
- 判定角色行动的结果
- 保持故事的连贯性和趣味性

## 世界设定
${worldDescription}

## 规则
- 用旁白的方式描述场景和环境
- 用对话的方式控制NPC
- 判定要公平合理
- 保持故事节奏，不要过于拖沓
- 使用中文回复`
}

export function buildMessagesForAgent(
  history: Message[],
  maxMessages: number = 20
): ChatMessage[] {
  return history.slice(-maxMessages).map((msg) => ({
    role: msg.characterId === 'user' ? 'user' as const : 'assistant' as const,
    content: `[${msg.characterName}]: ${msg.content}`,
  }))
}

export async function* streamChat(
  config: APIConfig,
  systemPrompt: string,
  messages: ChatMessage[],
  agentId: string
): AsyncGenerator<string> {
  const llmMessages = [
    { role: 'system' as const, content: systemPrompt },
    ...messages,
  ]

  // Start streaming via IPC
  window.electronAPI.llm.streamChat(
    {
      baseURL: config.baseURL,
      apiKey: config.apiKey,
      model: config.models[0],
    },
    llmMessages,
    agentId
  )

  // Yield chunks as they come in
  let resolve: ((value: string | null) => void) | null = null
  let buffer: string[] = []
  let done = false

  const unsubChunk = window.electronAPI.onStreamChunk((data) => {
    if (data.agentId === agentId) {
      if (resolve) {
        resolve(data.chunk)
        resolve = null
      } else {
        buffer.push(data.chunk)
      }
    }
  })

  const unsubEnd = window.electronAPI.onStreamEnd((data) => {
    if (data.agentId === agentId) {
      done = true
      if (resolve) {
        resolve(null)
        resolve = null
      }
    }
  })

  const unsubError = window.electronAPI.onStreamError((data) => {
    if (data.agentId === agentId) {
      done = true
      if (resolve) {
        resolve(null)
        resolve = null
      }
    }
  })

  try {
    while (!done) {
      if (buffer.length > 0) {
        yield buffer.shift()!
      } else {
        const chunk = await new Promise<string | null>((r) => {
          resolve = r
        })
        if (chunk === null) break
        yield chunk
      }
    }
    // Flush remaining buffer
    while (buffer.length > 0) {
      yield buffer.shift()!
    }
  } finally {
    unsubChunk()
    unsubEnd()
    unsubError()
  }
}
