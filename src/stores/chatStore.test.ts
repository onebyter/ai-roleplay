import { describe, it, expect, beforeEach } from 'vitest'
import { useChatStore } from '../stores/chatStore'

describe('chatStore', () => {
  beforeEach(() => {
    useChatStore.setState({
      messages: [],
      isGenerating: false,
      generatingAgentId: null,
      streamingContent: '',
    })
  })

  it('addMessage 创建带 id 和时间戳的消息', () => {
    const msg = useChatStore.getState().addMessage({
      sessionId: 's1',
      characterId: 'gm',
      characterName: 'GM',
      content: 'Hello world',
      type: 'narration',
    })

    expect(msg.id).toBeDefined()
    expect(msg.timestamp).toBeGreaterThan(0)
    expect(msg.content).toBe('Hello world')
    expect(useChatStore.getState().messages).toHaveLength(1)
  })

  it('setStreaming 设置生成状态并清空流式内容', () => {
    useChatStore.getState().setStreaming(true, 'agent-1')

    expect(useChatStore.getState().isGenerating).toBe(true)
    expect(useChatStore.getState().generatingAgentId).toBe('agent-1')
    expect(useChatStore.getState().streamingContent).toBe('')
  })

  it('appendToStreaming 追加流式内容', () => {
    useChatStore.getState().appendToStreaming('Hello')
    useChatStore.getState().appendToStreaming(' World')

    expect(useChatStore.getState().streamingContent).toBe('Hello World')
  })

  it('finishStreaming 将流式内容转为最终消息', () => {
    useChatStore.getState().appendToStreaming('Final message')
    useChatStore.getState().finishStreaming('agent-1', 'Final message')

    const state = useChatStore.getState()
    expect(state.isGenerating).toBe(false)
    expect(state.messages).toHaveLength(1)
    expect(state.messages[0].content).toBe('Final message')
    expect(state.messages[0].characterId).toBe('agent-1')
  })

  it('clearMessages 清空消息和流式内容', () => {
    useChatStore.getState().addMessage({
      sessionId: 's1',
      characterId: 'user',
      characterName: 'User',
      content: 'test',
      type: 'dialogue',
    })
    useChatStore.getState().appendToStreaming('streaming...')

    useChatStore.getState().clearMessages()

    expect(useChatStore.getState().messages).toHaveLength(0)
    expect(useChatStore.getState().streamingContent).toBe('')
  })
})
