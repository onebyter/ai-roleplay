import { describe, it, expect } from 'vitest'
import { buildCharacterPrompt, buildMessagesForAgent } from '../utils/llm-client'
import { Character } from '@/types/character'
import { Message } from '@/types/message'

const char: Character = {
  id: '1', name: 'Alice', avatar: '', description: 'A brave warrior',
  personality: 'Brave', speakingStyle: 'Direct', systemPrompt: 'Always be brave',
  exampleDialogue: 'For honor!', firstMessage: '', tags: [],
  createdAt: 0, agentConfig: { provider: 'ds', model: 'deepseek-chat', temperature: 0.8, maxTokens: 2048 },
}

describe('buildCharacterPrompt', () => {
  it('包含角色名称和性格', () => {
    const prompt = buildCharacterPrompt(char, 'A fantasy world')
    expect(prompt).toContain('Alice')
    expect(prompt).toContain('Brave')
    expect(prompt).toContain('A fantasy world')
  })

  it('包含示例对话', () => {
    const prompt = buildCharacterPrompt(char, 'world')
    expect(prompt).toContain('For honor!')
  })

  it('包含角色必须遵守的规则', () => {
    const prompt = buildCharacterPrompt(char, 'world')
    expect(prompt).toContain('以 Alice 的身份发言')
    expect(prompt).toContain('使用中文回复')
  })

  it('包含用户自定义的系统提示词', () => {
    const prompt = buildCharacterPrompt(char, 'world')
    expect(prompt).toContain('Always be brave')
    expect(prompt).toContain('核心指令')
  })
})

describe('buildMessagesForAgent', () => {
  it('限制消息数量到指定值', () => {
    const msgs: Message[] = Array.from({ length: 30 }, (_, i) => ({
      id: String(i), sessionId: 's1', characterId: 'c1',
      characterName: `Char${i}`, content: `msg${i}`,
      timestamp: i, type: 'dialogue' as const,
    }))
    const result = buildMessagesForAgent(msgs, 10)
    expect(result).toHaveLength(10)
  })

  it('用户消息映射为 user role', () => {
    const msgs: Message[] = [{
      id: '1', sessionId: 's1', characterId: 'user',
      characterName: '用户', content: 'hello',
      timestamp: 1, type: 'dialogue',
    }]
    const result = buildMessagesForAgent(msgs)
    expect(result[0].role).toBe('user')
    expect(result[0].content).toBe('hello')
  })

  it('其他角色消息映射为 assistant role', () => {
    const msgs: Message[] = [{
      id: '1', sessionId: 's1', characterId: 'alice',
      characterName: 'Alice', content: 'hi',
      timestamp: 1, type: 'dialogue',
    }]
    const result = buildMessagesForAgent(msgs)
    expect(result[0].role).toBe('assistant')
    expect(result[0].content).toBe('hi')
  })
})
