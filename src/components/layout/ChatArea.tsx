import React, { useRef, useEffect, useState } from 'react'
import { useChatStore } from '@/stores/chatStore'
import { useSessionStore } from '@/stores/sessionStore'
import { useCharacterStore } from '@/stores/characterStore'
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
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [selectedSpeakerId, setSelectedSpeakerId] = useState<string>('user')

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  useEffect(() => {
    if (currentSession && messages.length > 0) {
      useSessionStore.getState().updateSession({ messages })
    }
  }, [messages])

  const handleSendMessage = (content: string) => {
    if (!content.trim()) return
    const speakerId = currentSession?.userRole === 'gm' ? 'gm' : selectedSpeakerId
    const speakerName = speakerId === 'gm'
      ? 'GM'
      : speakerId === 'user'
        ? '用户'
        : characters.find(c => c.id === speakerId)?.name || '未知'

    addMessage({
      sessionId: currentSession?.id || '',
      characterId: speakerId,
      characterName: speakerName,
      content: content.trim(),
      type: speakerId === 'gm' ? 'narration' : 'dialogue',
      metadata: {
        isGM: speakerId === 'gm',
        turnNumber: messages.length + 1,
      },
    })
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
