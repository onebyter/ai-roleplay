import React, { useState, useRef, useEffect } from 'react'
import { Character } from '@/types/character'

interface MessageInputProps {
  onSend: (content: string) => void
  characters: Character[]
  selectedSpeakerId: string
  onSelectSpeaker: (id: string) => void
  isGM: boolean
  isGenerating: boolean
}

export default function MessageInput({
  onSend,
  characters,
  selectedSpeakerId,
  onSelectSpeaker,
  isGM,
  isGenerating,
}: MessageInputProps) {
  const [content, setContent] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px'
    }
  }, [content])

  const handleSend = () => {
    if (content.trim() && !isGenerating) {
      onSend(content)
      setContent('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t p-3" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
      {/* Speaker Selector */}
      <div className="flex items-center gap-2 mb-2 overflow-x-auto pb-1">
        <span className="text-xs shrink-0" style={{ color: 'var(--text-secondary)' }}>发言身份：</span>
        {isGM ? (
          <button
            className="px-2 py-0.5 text-xs rounded shrink-0"
            style={{ backgroundColor: '#e91e63', color: '#fff' }}
          >
            GM
          </button>
        ) : (
          <>
            <button
              onClick={() => onSelectSpeaker('user')}
              className="px-2 py-0.5 text-xs rounded shrink-0 transition-colors"
              style={{
                backgroundColor: selectedSpeakerId === 'user' ? 'var(--accent)' : 'var(--bg-tertiary)',
                color: selectedSpeakerId === 'user' ? '#fff' : 'var(--text-secondary)',
              }}
            >
              用户
            </button>
            {characters.map((char) => (
              <button
                key={char.id}
                onClick={() => onSelectSpeaker(char.id)}
                className="px-2 py-0.5 text-xs rounded shrink-0 transition-colors"
                style={{
                  backgroundColor: selectedSpeakerId === char.id ? 'var(--accent)' : 'var(--bg-tertiary)',
                  color: selectedSpeakerId === char.id ? '#fff' : 'var(--text-secondary)',
                }}
              >
                {char.name}
              </button>
            ))}
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="flex gap-2 items-end">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isGM ? '输入 GM 叙述...' : '输入消息...'}
          className="flex-1 px-3 py-2 rounded-lg text-sm resize-none outline-none"
          style={{
            backgroundColor: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
          }}
          rows={1}
          disabled={isGenerating}
        />
        <button
          onClick={handleSend}
          disabled={!content.trim() || isGenerating}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
        >
          发送
        </button>
      </div>
    </div>
  )
}
