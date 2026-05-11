import React, { useRef, useEffect, useState } from 'react'
import { useChatStore } from '@/stores/chatStore'
import { useSessionStore } from '@/stores/sessionStore'
import { useCharacterStore } from '@/stores/characterStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { streamChat, buildCharacterPrompt, buildMessagesForAgent } from '@/utils/llm-client'
import MessageBubble from '../chat/MessageBubble'
import MessageInput from '../chat/MessageInput'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { PanelRightOpen, PanelRightClose } from 'lucide-react'

interface ChatAreaProps {
  onToggleRightPanel: () => void
  rightPanelOpen: boolean
}

export default function ChatArea({ onToggleRightPanel, rightPanelOpen }: ChatAreaProps) {
  const { messages, isGenerating, streamingContent, generatingAgentId, addMessage } = useChatStore()
  const { currentSession, setMode, setUserRole } = useSessionStore()
  const { characters } = useCharacterStore()
  const { apiConfigs, selectedConfigId } = useSettingsStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const sessionIdRef = useRef<string | undefined>(currentSession?.id)
  const isMessageLoadingRef = useRef(false)
  const [selectedSpeakerId, setSelectedSpeakerId] = useState<string>('user')

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  // 会话切换时标记为加载状态，跳过自动保存避免无操作更新 updatedAt
  useEffect(() => {
    if (currentSession?.id !== sessionIdRef.current) {
      sessionIdRef.current = currentSession?.id
      isMessageLoadingRef.current = true
    }
  }, [currentSession?.id])

  useEffect(() => {
    if (isMessageLoadingRef.current) {
      isMessageLoadingRef.current = false
      return
    }
    if (currentSession && messages.length > 0) {
      useSessionStore.getState().updateSession({ messages })
    }
  }, [messages])

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !currentSession) return
    const speakerId = currentSession.userRole === 'gm' ? 'gm' : selectedSpeakerId
    const speakerName = speakerId === 'gm'
      ? 'GM'
      : speakerId === 'user'
        ? '用户'
        : characters.find(c => c.id === speakerId)?.name || '未知'

    addMessage({
      sessionId: currentSession.id,
      characterId: speakerId,
      characterName: speakerName,
      content: content.trim(),
      type: speakerId === 'gm' ? 'narration' : 'dialogue',
      metadata: {
        isGM: speakerId === 'gm',
        turnNumber: messages.length + 1,
      },
    })

    // 触发会话中的 AI 角色回复
    const sessionChars = currentSession.characters
    const respondingChars = sessionChars.filter(c => c.id !== speakerId && c.id !== 'user')
    for (const char of respondingChars) {
      const providerId = (char.agentConfig?.provider && char.agentConfig.provider !== 'default')
        ? char.agentConfig.provider
        : selectedConfigId
      const apiConfig = apiConfigs.find(c => c.id === providerId)
      console.log('[ChatArea] checking char:', char.name, 'providerId:', providerId, 'found:', !!apiConfig, 'hasKey:', !!apiConfig?.apiKey)
      if (!apiConfig || !apiConfig.apiKey) {
        if (!apiConfig) {
          addMessage({
            sessionId: currentSession.id,
            characterId: 'system',
            characterName: '系统',
            content: `无法找到 ${char.name} 的 API 配置 (${providerId})，请在设置中添加对应的 API 配置。`,
            type: 'system',
          })
        } else if (!apiConfig.apiKey) {
          addMessage({
            sessionId: currentSession.id,
            characterId: 'system',
            characterName: '系统',
            content: `${char.name} 的 API 配置 (${apiConfig.name}) 缺少 API Key，请在设置中填写。`,
            type: 'system',
          })
        }
        continue
      }

      const model = char.agentConfig?.model || apiConfig.models[0]
      const chatConfig = { ...apiConfig, models: [model] }

      useChatStore.getState().setStreaming(true, char.id)

      try {
        const systemPrompt = buildCharacterPrompt(char, currentSession.worldSetting.description)
        const history = buildMessagesForAgent(useChatStore.getState().messages, 20)
        let fullContent = ''

        for await (const chunk of streamChat(chatConfig, systemPrompt, history, char.id)) {
          fullContent += chunk
          useChatStore.getState().appendToStreaming(chunk)
        }

        if (fullContent) {
          useChatStore.getState().finishStreaming(char.id, fullContent)
        } else {
          useChatStore.getState().setStreaming(false)
          addMessage({
            sessionId: currentSession.id,
            characterId: 'system',
            characterName: '系统',
            content: `${char.name} 没有回复，请检查 API 配置和网络连接。`,
            type: 'system',
          })
        }
      } catch (err: any) {
        useChatStore.getState().setStreaming(false)
        addMessage({
          sessionId: currentSession.id,
          characterId: 'system',
          characterName: '系统',
          content: `AI 回复失败: ${err.message || '未知错误'}。请检查 API Key 和 Base URL 是否正确。`,
          type: 'system',
        })
      }
    }
  }

  const handleModeToggle = () => {
    if (currentSession) {
      const newMode = currentSession.mode === 'gm-led' ? 'free-chat' : 'gm-led'
      setMode(newMode)
      if (newMode === 'free-chat') {
        setUserRole('player')
      } else {
        setUserRole('gm')
      }
    }
  }

  const handleRoleToggle = () => {
    if (currentSession) {
      const newRole = currentSession.userRole === 'gm' ? 'player' : 'gm'
      setUserRole(newRole)
      if (newRole === 'gm' && currentSession.mode !== 'gm-led') {
        setMode('gm-led')
      }
    }
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[var(--color-bg-primary)]">
      {/* Header */}
      <div className="title-bar-drag h-13 flex items-center justify-between px-4 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
        <div className="flex items-center gap-2.5 title-bar-no-drag">
          <span className="font-semibold text-sm">
            {currentSession?.name || '未命名会话'}
          </span>
          {currentSession && (
            <Badge variant={currentSession.mode === 'gm-led' ? 'gm' : 'accent'}>
              {currentSession.mode === 'gm-led' ? 'GM 主导' : '自由群聊'}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1.5 title-bar-no-drag">
          <Button size="sm" variant="secondary" onClick={handleModeToggle}>
            {currentSession?.mode === 'gm-led' ? '自由模式' : 'GM模式'}
          </Button>
          <Button
            size="sm"
            variant={currentSession?.userRole === 'gm' ? 'default' : 'secondary'}
            onClick={handleRoleToggle}
          >
            {currentSession?.userRole === 'gm' ? 'GM' : '玩家'}
          </Button>
          <div className="w-px h-5 bg-[var(--color-border)] mx-1" />
          <Button size="sm" variant="ghost" onClick={onToggleRightPanel}>
            {rightPanelOpen ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {messages.length === 0 && !isGenerating && (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-16 h-16 rounded-[var(--radius-xl)] bg-[var(--color-accent-soft)] flex items-center justify-center mb-4">
              <span className="text-3xl">🎭</span>
            </div>
            <div className="text-lg font-semibold mb-1">开始你的故事</div>
            <div className="text-sm text-[var(--color-text-muted)]">
              {currentSession ? '发送消息开始对话' : '请先创建一个会话'}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {isGenerating && streamingContent && (
          <MessageBubble
            message={{
              id: 'streaming',
              sessionId: '',
              characterId: generatingAgentId || '',
              characterName: characters.find(c => c.id === generatingAgentId)?.name || 'AI',
              content: streamingContent,
              timestamp: Date.now(),
              type: 'dialogue',
              isStreaming: true,
            }}
          />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MessageInput
        onSend={handleSendMessage}
        characters={characters}
        selectedSpeakerId={selectedSpeakerId}
        onSelectSpeaker={setSelectedSpeakerId}
        isGM={currentSession?.userRole === 'gm'}
        isGenerating={isGenerating}
      />
    </div>
  )
}
