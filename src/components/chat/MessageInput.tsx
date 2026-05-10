import React, { useState, useRef, useEffect } from 'react'
import { Character } from '@/types/character'
import Button from '@/components/ui/Button'
import { Send } from 'lucide-react'

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
    <div className="border-t border-[var(--color-border)] p-3 bg-[var(--color-bg-secondary)]">
      {/* Speaker chips */}
      <div className="flex items-center gap-1.5 mb-2.5 overflow-x-auto pb-0.5">
        <span className="text-[11px] text-[var(--color-text-muted)] shrink-0 px-1 font-medium">发言身份</span>
        {isGM ? (
          <span className="px-2.5 py-0.5 text-[11px] rounded-[var(--radius-full)] bg-[var(--color-gm-soft)] text-[var(--color-gm)] font-semibold border border-[rgba(244,114,182,0.2)]">
            GM
          </span>
        ) : (
          <>
            <button
              onClick={() => onSelectSpeaker('user')}
              className="px-2.5 py-0.5 text-[11px] rounded-[var(--radius-full)] font-medium transition-all duration-150 border"
              style={{
                backgroundColor: selectedSpeakerId === 'user' ? 'var(--color-accent-soft)' : 'var(--color-bg-elevated)',
                color: selectedSpeakerId === 'user' ? 'var(--color-accent)' : 'var(--color-text-muted)',
                borderColor: selectedSpeakerId === 'user' ? 'rgba(124,108,255,0.3)' : 'var(--color-border)',
              }}
            >
              用户
            </button>
            {characters.map((char) => (
              <button
                key={char.id}
                onClick={() => onSelectSpeaker(char.id)}
                className="px-2.5 py-0.5 text-[11px] rounded-[var(--radius-full)] font-medium transition-all duration-150 border"
                style={{
                  backgroundColor: selectedSpeakerId === char.id ? 'var(--color-accent-soft)' : 'var(--color-bg-elevated)',
                  color: selectedSpeakerId === char.id ? 'var(--color-accent)' : 'var(--color-text-muted)',
                  borderColor: selectedSpeakerId === char.id ? 'rgba(124,108,255,0.3)' : 'var(--color-border)',
                }}
              >
                {char.name}
              </button>
            ))}
          </>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2 items-end">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isGM ? '输入 GM 叙述...' : '输入消息...'}
          className="flex-1 px-4 py-2.5 rounded-[var(--radius-lg)] text-sm resize-none outline-none bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] border border-[var(--color-border)] transition-all duration-150 focus:border-[var(--color-accent)] focus:shadow-[var(--shadow-accent)]"
          rows={1}
          disabled={isGenerating}
        />
        <Button
          onClick={handleSend}
          disabled={!content.trim() || isGenerating}
          className="h-[40px] px-4"
        >
          <Send size={16} />
        </Button>
      </div>
    </div>
  )
}
