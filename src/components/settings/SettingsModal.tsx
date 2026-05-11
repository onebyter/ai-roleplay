import React, { useEffect } from 'react'
import { useSettingsStore } from '@/stores/settingsStore'
import ApiConfigPanel from './ApiConfigPanel'
import Button from '@/components/ui/Button'
import { X } from 'lucide-react'

interface SettingsModalProps {
  onClose: () => void
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const theme = useSettingsStore((s) => s.theme)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
      <div
        className="w-[560px] max-h-[80vh] overflow-y-auto rounded-[var(--radius-xl)] bg-[var(--color-bg-secondary)] border border-[var(--color-border)] shadow-[var(--shadow-lg)] p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">设置</h2>
          <Button variant="ghost" size="sm" onClick={onClose}><X size={16} /></Button>
        </div>

        {/* 主题 */}
        <section>
          <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2.5">主题</h3>
          <div className="flex gap-2">
            {(['dark', 'light'] as const).map((t) => (
              <button
                key={t}
                onClick={() => useSettingsStore.getState().setTheme(t)}
                className="flex-1 px-4 py-2 text-sm rounded-[var(--radius-md)] font-medium transition-all duration-150 border"
                style={{
                  backgroundColor: theme === t ? 'var(--color-accent-soft)' : 'var(--color-bg-tertiary)',
                  color: theme === t ? 'var(--color-accent)' : 'var(--color-text-muted)',
                  borderColor: theme === t ? 'var(--color-accent)' : 'var(--color-border)',
                }}
              >
                {t === 'dark' ? '深色' : '浅色'}
              </button>
            ))}
          </div>
        </section>

        {/* API 配置 */}
        <section>
          <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2.5">API 配置</h3>
          <ApiConfigPanel />
        </section>
      </div>
    </div>
  )
}
