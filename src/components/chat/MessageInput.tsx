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
  onSend, characters, selectedSpeakerId, onSelectSpeaker, isGM, isGenerating,
}: MessageInputProps) {
  const [content, setContent] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    handleResize()
  }, [content])

  const handleResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
    }
  }

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
    <div className="px-4 pb-4 pt-2">
      <div className="rounded-[var(--radius-xl)] bg-[var(--color-bg-elevated)] border border-[var(--color-border)] shadow-[var(--shadow-input)] overflow-hidden">
        {/* Speaker chips */}
        <div className="flex items-center gap-1.5 px-4 pt-3 overflow-x-auto">
          <span className="text-[10px] text-[var(--color-text-muted)] shrink-0 font-medium tracking-wide uppercase">发言</span>
          {isGM ? (
            <span className="px-3 py-1 text-[11px] rounded-[var(--radius-full)] bg-[var(--color-gm-soft)] text-[var(--color-gm)] font-semibold border border-[rgba(244,114,182,0.15)]">
              GM
            </span>
          ) : (
            <>
              <button
                onClick={() => onSelectSpeaker('user')}
                className="px-3 py-1 text-[11px] rounded-[var(--radius-full)] font-medium transition-all duration-150 border"
                style={{
                  backgroundColor: selectedSpeakerId === 'user' ? 'var(--color-accent)' : 'transparent',
                  color: selectedSpeakerId === 'user' ? '#fff' : 'var(--color-text-muted)',
                  borderColor: selectedSpeakerId === 'user' ? 'var(--color-accent)' : 'var(--color-border)',
                }}
              >
                用户
              </button>
              {characters.map((char) => (
                <button
                  key={char.id}
                  onClick={() => onSelectSpeaker(char.id)}
                  className="px-3 py-1 text-[11px] rounded-[var(--radius-full)] font-medium transition-all duration-150 border"
                  style={{
                    backgroundColor: selectedSpeakerId === char.id ? 'var(--color-accent)' : 'transparent',
                    color: selectedSpeakerId === char.id ? '#fff' : 'var(--color-text-muted)',
                    borderColor: selectedSpeakerId === char.id ? 'var(--color-accent)' : 'var(--color-border)',
                  }}
                >
                  {char.name}
                </button>
              ))}
            </>
          )}
        </div>

        {/* Input row */}
        <div className="flex items-end gap-2 p-3">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isGM ? '输入 GM 叙述...' : '输入消息 (Enter 发送, Shift+Enter 换行)'}
            className="flex-1 px-1 py-2 text-sm resize-none outline-none bg-transparent text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]"
            rows={1}
            disabled={isGenerating}
          />
          <Button
            onClick={handleSend}
            disabled={!content.trim() || isGenerating}
            className="h-[36px] w-[36px] p-0 rounded-full"
          >
            <Send size={15} />
          </Button>
        </div>
      </div>
    </div>
  )
}
