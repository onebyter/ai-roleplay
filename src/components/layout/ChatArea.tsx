import React, { useRef, useEffect, useState } from 'react'
import { useChatStore } from '@/stores/chatStore'
import { useSessionStore } from '@/stores/sessionStore'
import { useCharacterStore } from '@/stores/characterStore'
import MessageBubble from '../chat/MessageBubble'
import MessageInput from '../chat/MessageInput'
import { v4 as uuidv4 } from 'uuid'

interface ChatAreaProps {
  onToggleRightPanel: () => void
}

export default function ChatArea({ onToggleRightPanel }: ChatAreaProps) {
  const { messages, isGenerating, streamingContent, generatingAgentId, addMessage, setStreaming, appendToStreaming } = useChatStore()
  const { currentSession, setMode, setUserRole } = useSessionStore()
  const { characters } = useCharacterStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [selectedSpeakerId, setSelectedSpeakerId] = useState<string>('user')

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

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
      setMode(currentSession.mode === 'gm-led' ? 'free-chat' : 'gm-led')
    }
  }

  const handleRoleToggle = () => {
    if (currentSession) {
      setUserRole(currentSession.userRole === 'gm' ? 'player' : 'gm')
    }
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Header */}
      <div className="title-bar-drag h-12 flex items-center justify-between px-4 border-b"
        style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3 title-bar-no-drag">
          <span className="font-medium">
            {currentSession?.name || '未命名会话'}
          </span>
          {currentSession && (
            <span className="text-xs px-2 py-0.5 rounded"
              style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
              {currentSession.mode === 'gm-led' ? 'GM 主导' : '自由群聊'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 title-bar-no-drag">
          <button
            onClick={handleModeToggle}
            className="px-3 py-1 text-xs rounded"
            style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
          >
            {currentSession?.mode === 'gm-led' ? '切换自由模式' : '切换GM模式'}
          </button>
          <button
            onClick={handleRoleToggle}
            className="px-3 py-1 text-xs rounded"
            style={{
              backgroundColor: currentSession?.userRole === 'gm' ? 'var(--accent)' : 'var(--bg-tertiary)',
              color: currentSession?.userRole === 'gm' ? '#fff' : 'var(--text-secondary)',
            }}
          >
            {currentSession?.userRole === 'gm' ? 'GM 模式' : '玩家模式'}
          </button>
          <button
            onClick={onToggleRightPanel}
            className="px-2 py-1 text-xs rounded"
            style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
          >
            面板
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
        {messages.length === 0 && !isGenerating && (
          <div className="flex flex-col items-center justify-center h-full opacity-50">
            <div className="text-4xl mb-4">🎭</div>
            <div className="text-lg mb-2">开始你的故事</div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
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
