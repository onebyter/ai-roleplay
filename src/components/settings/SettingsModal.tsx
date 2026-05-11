import React, { useState, useEffect } from 'react'
import { useSettingsStore } from '@/stores/settingsStore'
import ApiConfigPanel from './ApiConfigPanel'
import Button from '@/components/ui/Button'
import { X, Palette, Server } from 'lucide-react'

interface SettingsModalProps {
  onClose: () => void
}

type SettingsNav = 'appearance' | 'api'

const NAV_ITEMS: { id: SettingsNav; label: string; icon: React.ReactNode }[] = [
  { id: 'appearance', label: '外观', icon: <Palette size={15} /> },
  { id: 'api', label: 'API 配置', icon: <Server size={15} /> },
]

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const [activeNav, setActiveNav] = useState<SettingsNav>('appearance')
  const theme = useSettingsStore((s) => s.theme)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
      <div
        className="w-[760px] h-[520px] flex rounded-[var(--radius-xl)] bg-[var(--color-bg-secondary)] border border-[var(--color-border)] shadow-[var(--shadow-lg)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left nav */}
        <div className="w-44 shrink-0 flex flex-col bg-[var(--color-bg-primary)] border-r border-[var(--color-border-subtle)]">
          <div className="h-13 flex items-center px-4 border-b border-[var(--color-border-subtle)]">
            <h2 className="text-sm font-semibold">设置</h2>
          </div>
          <nav className="flex-1 p-2 space-y-0.5">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-md)] text-sm font-medium transition-all duration-150"
                style={{
                  backgroundColor: activeNav === item.id ? 'var(--color-bg-active)' : 'transparent',
                  color: activeNav === item.id ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                }}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
          <div className="p-2 border-t border-[var(--color-border-subtle)]">
            <Button variant="ghost" size="sm" className="w-full" onClick={onClose}>
              <X size={14} /> 关闭
            </Button>
          </div>
        </div>

        {/* Right content */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="h-13 flex items-center px-5 border-b border-[var(--color-border-subtle)]">
            <span className="text-sm font-semibold">
              {NAV_ITEMS.find((n) => n.id === activeNav)?.label}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            {activeNav === 'appearance' && (
              <section>
                <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">主题模式</h3>
                <div className="flex gap-3">
                  {(['dark', 'light'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => useSettingsStore.getState().setTheme(t)}
                      className="flex-1 p-4 rounded-[var(--radius-lg)] border-2 transition-all duration-150"
                      style={{
                        backgroundColor: t === 'dark' ? '#16161e' : '#f5f5f7',
                        borderColor: theme === t ? 'var(--color-accent)' : 'var(--color-border)',
                        boxShadow: theme === t ? 'var(--shadow-accent)' : 'none',
                      }}
                    >
                      <div className="text-xs font-medium mb-2" style={{ color: t === 'dark' ? '#f0f0f5' : '#1b1b1f' }}>
                        {t === 'dark' ? '深色模式' : '浅色模式'}
                      </div>
                      <div className="flex gap-1.5">
                        <div className="w-8 h-6 rounded-sm" style={{ backgroundColor: t === 'dark' ? '#1e1e2a' : '#e8e8ed' }} />
                        <div className="w-8 h-6 rounded-sm" style={{ backgroundColor: t === 'dark' ? '#252533' : '#fafafa' }} />
                        <div className="w-8 h-6 rounded-sm" style={{ backgroundColor: 'var(--color-accent)', opacity: 0.6 }} />
                      </div>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-[var(--color-text-muted)] mt-3">
                  当前: {theme === 'dark' ? '深色模式' : '浅色模式'}
                </p>
              </section>
            )}
            {activeNav === 'api' && (
              <section>
                <ApiConfigPanel />
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
