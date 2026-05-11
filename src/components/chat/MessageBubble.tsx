import React from 'react'
import { Message } from '@/types/message'
import ReactMarkdown from 'react-markdown'
import Avatar from '@/components/ui/Avatar'

interface MessageBubbleProps {
  message: Message
}

const CHAR_COLORS = [
  'var(--color-char-1)', 'var(--color-char-2)', 'var(--color-char-3)',
  'var(--color-char-4)', 'var(--color-char-5)', 'var(--color-char-6)',
  'var(--color-char-7)', 'var(--color-char-8)',
]

function getCharacterColor(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0
  return CHAR_COLORS[Math.abs(hash) % CHAR_COLORS.length]
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.characterId === 'user'
  const isGM = message.characterId === 'gm'
  const isSystem = message.type === 'system'
  const isNarration = message.type === 'narration'
  const color = isUser ? 'var(--color-accent)' : isGM ? 'var(--color-gm)' : getCharacterColor(message.characterId)

  if (isSystem) {
    return (
      <div className="flex justify-center my-3" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
        <span className="text-[11px] px-3 py-1 rounded-[var(--radius-full)] bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] border border-[var(--color-border)]">
          {message.content}
        </span>
      </div>
    )
  }

  if (isNarration) {
    return (
      <div className="my-3" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
        <div className="p-4 rounded-[var(--radius-lg)] border-l-[3px] bg-[var(--color-gm-soft)] border-[var(--color-gm)]">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-xs font-semibold text-[var(--color-gm)]">GM</span>
            <span className="text-[11px] text-[var(--color-text-muted)]">· 叙述</span>
          </div>
          <div className="text-sm leading-relaxed markdown-body">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`flex gap-3 my-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      style={{ animation: 'fadeInUp 0.3s ease-out' }}
    >
      <Avatar name={message.characterName} size="md" color={color} />

      <div className={`max-w-[70%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className="text-[11px] mb-1 px-1 font-semibold" style={{ color }}>
          {message.characterName}
        </div>
        <div
          className="px-4 py-3 text-sm leading-relaxed markdown-body"
          style={{
            backgroundColor: isUser ? 'var(--color-accent-hover)' : 'var(--color-bg-elevated)',
            color: isUser ? '#fff' : 'var(--color-text-primary)',
            borderRadius: isUser
              ? 'var(--radius-lg) var(--radius-lg) 4px var(--radius-lg)'
              : 'var(--radius-lg) var(--radius-lg) var(--radius-lg) 4px',
            boxShadow: isUser ? 'var(--shadow-accent)' : 'var(--shadow-sm)',
          }}
        >
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>

        {message.isStreaming && (
          <div className="flex gap-1.5 mt-2 px-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: color, animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
