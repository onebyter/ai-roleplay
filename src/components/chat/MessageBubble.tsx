import React from 'react'
import { Message } from '@/types/message'
import ReactMarkdown from 'react-markdown'

interface MessageBubbleProps {
  message: Message
}

const CHARACTER_COLORS: Record<string, string> = {}
const COLOR_PALETTE = ['#6c63ff', '#e91e63', '#00bcd4', '#ff9800', '#4caf50', '#9c27b0', '#f44336', '#2196f3']

function getCharacterColor(id: string): string {
  if (!CHARACTER_COLORS[id]) {
    const index = Object.keys(CHARACTER_COLORS).length % COLOR_PALETTE.length
    CHARACTER_COLORS[id] = COLOR_PALETTE[index]
  }
  return CHARACTER_COLORS[id]
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.characterId === 'user'
  const isGM = message.characterId === 'gm'
  const isSystem = message.type === 'system'
  const isNarration = message.type === 'narration'
  const color = isUser ? 'var(--accent)' : isGM ? '#e91e63' : getCharacterColor(message.characterId)

  if (isSystem) {
    return (
      <div className="flex justify-center my-2">
        <div className="text-xs px-3 py-1 rounded-full"
          style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
          {message.content}
        </div>
      </div>
    )
  }

  if (isNarration) {
    return (
      <div className="my-3 px-4">
        <div className="text-sm italic p-3 rounded-lg border-l-4"
          style={{
            backgroundColor: 'rgba(233, 30, 99, 0.08)',
            borderColor: '#e91e63',
            color: 'var(--text-primary)',
          }}>
          <div className="text-xs mb-1 font-medium" style={{ color: '#e91e63' }}>
            GM · 叙述
          </div>
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex gap-3 my-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm shrink-0"
        style={{ backgroundColor: color }}
      >
        {message.characterName[0]}
      </div>

      {/* Message Content */}
      <div className={`max-w-[70%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Name */}
        <div className="text-xs mb-1 px-1" style={{ color }}>
          {message.characterName}
        </div>

        {/* Bubble */}
        <div
          className="px-3 py-2 rounded-2xl text-sm"
          style={{
            backgroundColor: isUser ? 'var(--accent)' : 'var(--bg-tertiary)',
            color: isUser ? '#fff' : 'var(--text-primary)',
            borderBottomRightRadius: isUser ? '4px' : '16px',
            borderBottomLeftRadius: isUser ? '16px' : '4px',
          }}
        >
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>

        {/* Streaming indicator */}
        {message.isStreaming && (
          <div className="flex gap-1 mt-1 px-1">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: color }} />
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: color, animationDelay: '0.2s' }} />
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: color, animationDelay: '0.4s' }} />
          </div>
        )}
      </div>
    </div>
  )
}
