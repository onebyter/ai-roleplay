import React, { useEffect, useState } from 'react'
import { useSessionStore } from '@/stores/sessionStore'
import { useCharacterStore } from '@/stores/characterStore'
import { useChatStore } from '@/stores/chatStore'
import { useSettingsStore } from '@/stores/settingsStore'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Avatar from '@/components/ui/Avatar'
import { MessageSquare, Users, Settings, Plus, Trash2 } from 'lucide-react'

type SidebarTab = 'sessions' | 'characters' | 'settings'

const TABS: { id: SidebarTab; label: string; icon: React.ReactNode }[] = [
  { id: 'sessions', label: '会话', icon: <MessageSquare size={15} /> },
  { id: 'characters', label: '角色', icon: <Users size={15} /> },
  { id: 'settings', label: '设置', icon: <Settings size={15} /> },
]

export default function Sidebar() {
  const [activeTab, setActiveTab] = useState<SidebarTab>('sessions')
  const {
    currentSession, sessions,
    createSession, loadSession, deleteSession,
    loadSessionList,
  } = useSessionStore()
  const { characters, addCharacter, removeCharacter, loadCharacters } = useCharacterStore()
  const { setMessages } = useChatStore()
  const theme = useSettingsStore((s) => s.theme)
  const [showNewSession, setShowNewSession] = useState(false)
  const [newSessionName, setNewSessionName] = useState('')

  useEffect(() => {
    loadSessionList()
    loadCharacters()
  }, [])

  const handleCreateSession = () => {
    if (newSessionName.trim()) {
      createSession(newSessionName.trim())
      setNewSessionName('')
      setShowNewSession(false)
    }
  }

  const handleLoadSession = async (id: string) => {
    await loadSession(id)
    const session = useSessionStore.getState().currentSession
    if (session) {
      setMessages(session.messages)
    }
  }

  const handleDeleteSession = async (id: string) => {
    if (confirm('确定删除这个会话吗？')) {
      await deleteSession(id)
    }
  }

  const handleAddCharacter = () => {
    addCharacter({
      name: `角色 ${characters.length + 1}`,
      avatar: '',
      description: '一个新角色',
      personality: '友好',
      speakingStyle: '自然',
      systemPrompt: '',
      exampleDialogue: '',
      firstMessage: '',
      tags: [],
      source: 'manual',
      agentConfig: {
        provider: 'default',
        model: 'deepseek-chat',
        temperature: 0.8,
        maxTokens: 2048,
      },
    })
  }

  return (
    <div className="w-64 flex flex-col bg-[var(--color-bg-secondary)] border-r border-[var(--color-border)]">
      {/* Title */}
      <div className="title-bar-drag h-13 flex items-center px-4 border-b border-[var(--color-border)]">
        <div className="title-bar-no-drag flex items-center gap-2">
          <div className="w-7 h-7 rounded-[var(--radius-md)] bg-[var(--color-accent)] flex items-center justify-center shadow-[var(--shadow-accent)]">
            <span className="text-white text-xs font-bold">AI</span>
          </div>
          <span className="text-sm font-bold tracking-tight">RolePlay</span>
        </div>
      </div>

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
      <div className="flex-1 overflow-y-auto p-2.5 space-y-1">
        {activeTab === 'sessions' && (
          <>
            <div className="flex justify-between items-center mb-2 px-1.5">
              <span className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">会话列表</span>
              <Button size="sm" onClick={() => setShowNewSession(true)}>
                <Plus size={14} /> 新建
              </Button>
            </div>

            {showNewSession && (
              <div className="mb-2 p-3 rounded-[var(--radius-lg)] bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]">
                <Input
                  value={newSessionName}
                  onChange={(e) => setNewSessionName(e.target.value)}
                  placeholder="会话名称"
                  className="mb-2"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateSession()}
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1" onClick={handleCreateSession}>创建</Button>
                  <Button size="sm" variant="secondary" className="flex-1" onClick={() => setShowNewSession(false)}>取消</Button>
                </div>
              </div>
            )}

            {sessions.map((session) => (
              <div
                key={session.id}
                className="group flex items-center justify-between p-2.5 rounded-[var(--radius-lg)] cursor-pointer transition-all duration-150"
                style={{
                  backgroundColor: currentSession?.id === session.id ? 'var(--color-bg-active)' : undefined,
                  border: currentSession?.id === session.id ? '1px solid var(--color-accent-soft)' : '1px solid transparent',
                }}
                onClick={() => handleLoadSession(session.id)}
                onMouseEnter={(e) => { if (currentSession?.id !== session.id) e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)' }}
                onMouseLeave={(e) => { if (currentSession?.id !== session.id) e.currentTarget.style.backgroundColor = '' }}
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{session.name}</div>
                  <div className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                    {new Date(session.updatedAt).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteSession(session.id) }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-[var(--radius-sm)] hover:bg-[rgba(248,113,113,0.12)]"
                >
                  <Trash2 size={13} className="text-[var(--color-error)]" />
                </button>
              </div>
            ))}

            {sessions.length === 0 && (
              <div className="text-center py-12 text-sm text-[var(--color-text-muted)]">
                暂无会话
              </div>
            )}
          </>
        )}

        {activeTab === 'characters' && (
          <>
            <div className="flex justify-between items-center mb-2 px-1.5">
              <span className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">角色库</span>
              <Button size="sm" onClick={handleAddCharacter}>
                <Plus size={14} /> 添加
              </Button>
            </div>
            {characters.map((char) => (
              <div
                key={char.id}
                className="group flex items-center justify-between p-2.5 rounded-[var(--radius-lg)] transition-all duration-150 hover:bg-[var(--color-bg-hover)]"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar name={char.name} size="sm" />
                  <span className="text-sm truncate">{char.name}</span>
                </div>
                <button
                  onClick={() => removeCharacter(char.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-[var(--radius-sm)] hover:bg-[rgba(248,113,113,0.12)]"
                >
                  <Trash2 size={13} className="text-[var(--color-error)]" />
                </button>
              </div>
            ))}
            {characters.length === 0 && (
              <div className="text-center py-12 text-sm text-[var(--color-text-muted)]">
                暂无角色
              </div>
            )}
          </>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-3">
            <div className="p-3 rounded-[var(--radius-lg)] bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]">
              <div className="text-xs font-medium mb-2">主题</div>
              <div className="flex gap-1.5">
                {(['dark', 'light'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => useSettingsStore.getState().setTheme(t)}
                    className="flex-1 px-3 py-1.5 text-xs rounded-[var(--radius-md)] font-medium transition-all duration-150 border"
                    style={{
                      backgroundColor: theme === t ? 'var(--color-accent-soft)' : 'var(--color-bg-elevated)',
                      color: theme === t ? 'var(--color-accent)' : 'var(--color-text-muted)',
                      borderColor: theme === t ? 'rgba(124,108,255,0.3)' : 'var(--color-border)',
                    }}
                  >
                    {t === 'dark' ? '深色' : '浅色'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
