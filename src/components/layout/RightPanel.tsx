import React, { useState } from 'react'
import { useSessionStore } from '@/stores/sessionStore'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import { Globe, Users, Info, X } from 'lucide-react'

type RightTab = 'world' | 'characters' | 'info'

const TABS: { id: RightTab; label: string; icon: React.ReactNode }[] = [
  { id: 'world', label: '世界', icon: <Globe size={14} /> },
  { id: 'characters', label: '角色', icon: <Users size={14} /> },
  { id: 'info', label: '信息', icon: <Info size={14} /> },
]

export default function RightPanel() {
  const [activeTab, setActiveTab] = useState<RightTab>('world')
  const { currentSession, updateWorldState } = useSessionStore()

  return (
    <div className="w-72 flex flex-col bg-[var(--color-bg-secondary)] border-l border-[var(--color-border)]">
      {/* Tabs */}
      <div className="flex border-b border-[var(--color-border)] px-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors relative"
            style={{
              color: activeTab === tab.id ? 'var(--color-accent)' : 'var(--color-text-muted)',
            }}
          >
            {tab.icon}
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-[var(--color-accent)] rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === 'world' && currentSession && (
          <div className="space-y-5">
            <div>
              <h3 className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2.5 px-1">世界设定</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] text-[var(--color-text-muted)] mb-1.5 block px-1">世界名称</label>
                  <div className="text-sm px-3 py-2 rounded-[var(--radius-md)] bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]">
                    {currentSession.worldSetting.name}
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-[var(--color-text-muted)] mb-1.5 block px-1">世界描述</label>
                  <div className="text-sm px-3 py-2 rounded-[var(--radius-md)] bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] leading-relaxed">
                    {currentSession.worldSetting.description}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2.5 px-1">当前状态</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] text-[var(--color-text-muted)] mb-1.5 block px-1">时间</label>
                  <Input
                    value={currentSession.worldState.currentTime}
                    onChange={(e) => updateWorldState({ currentTime: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[var(--color-text-muted)] mb-1.5 block px-1">地点</label>
                  <Input
                    value={currentSession.worldState.location}
                    onChange={(e) => updateWorldState({ location: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[var(--color-text-muted)] mb-1.5 block px-1">环境</label>
                  <Textarea
                    value={currentSession.worldState.environment}
                    onChange={(e) => updateWorldState({ environment: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'characters' && (
          <div>
            <h3 className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2.5 px-1">参与角色</h3>
            <div className="space-y-2">
              {currentSession?.characters.map((char) => (
                <div key={char.id} className="group flex items-center gap-2.5 p-2.5 rounded-[var(--radius-lg)] bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]">
                  <Avatar name={char.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{char.name}</div>
                    <div className="text-[11px] text-[var(--color-text-muted)] truncate">{char.personality}</div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => {
                      const updated = currentSession.characters.filter(c => c.id !== char.id)
                      useSessionStore.getState().updateSession({ characters: updated })
                    }}
                  >
                    <X size={13} />
                  </Button>
                </div>
              ))}
              {(!currentSession || currentSession.characters.length === 0) && (
                <div className="text-center py-12 text-sm text-[var(--color-text-muted)]">
                  暂无参与角色
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'info' && currentSession && (
          <div>
            <h3 className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3 px-1">会话信息</h3>
            <div className="space-y-3 text-sm">
              {[
                ['模式', currentSession.mode === 'gm-led' ? 'GM 主导' : '自由群聊'],
                ['用户角色', currentSession.userRole === 'gm' ? 'GM' : '玩家'],
                ['消息数', String(currentSession.messages.length)],
                ['角色数', String(currentSession.characters.length)],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between px-1 py-1.5 rounded-[var(--radius-sm)] bg-[var(--color-bg-tertiary)] px-2.5">
                  <span className="text-[var(--color-text-muted)]">{label}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
