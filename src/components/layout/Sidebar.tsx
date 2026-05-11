import React, { useEffect, useState } from 'react'
import { useSessionStore } from '@/stores/sessionStore'
import { useCharacterStore } from '@/stores/characterStore'
import { useChatStore } from '@/stores/chatStore'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Avatar from '@/components/ui/Avatar'
import CharacterEditor from '@/components/character/CharacterEditor'
import SettingsModal from '@/components/settings/SettingsModal'
import { MessageSquare, Users, Settings, Plus, Trash2 } from 'lucide-react'

type SidebarTab = 'sessions' | 'characters'

const TABS: { id: SidebarTab; label: string; icon: React.ReactNode }[] = [
  { id: 'sessions', label: '会话', icon: <MessageSquare size={15} /> },
  { id: 'characters', label: '角色', icon: <Users size={15} /> },
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
  const [editingCharId, setEditingCharId] = useState<string | undefined>(undefined)
  const [showSettings, setShowSettings] = useState(false)
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
    <div className="w-64 flex flex-col bg-[var(--color-bg-secondary)] border-r border-[var(--color-border-subtle)]">
      {/* Title */}
      <div className="title-bar-drag h-13 flex items-center px-5 border-b border-[var(--color-border-subtle)]">
        <div className="title-bar-no-drag flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[var(--radius-lg)] bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-char-3)] flex items-center justify-center shadow-[var(--shadow-accent)]">
            <span className="text-white text-xs font-bold">AI</span>
          </div>
          <span className="text-sm font-semibold tracking-tight">RolePlay</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-2 pt-2 gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-[var(--radius-md)] transition-all duration-150"
            style={{
              backgroundColor: activeTab === tab.id ? 'var(--color-bg-active)' : 'transparent',
              color: activeTab === tab.id ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
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
                className="group flex items-center justify-between p-2.5 rounded-[var(--radius-lg)] cursor-pointer transition-all duration-150 hover:bg-[var(--color-bg-hover)]"
                style={{
                  backgroundColor: currentSession?.id === session.id ? 'var(--color-bg-active)' : undefined,
                  border: currentSession?.id === session.id ? '1px solid var(--color-accent-soft)' : '1px solid transparent',
                }}
                onClick={() => handleLoadSession(session.id)}
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
              <div className="flex flex-col items-center py-12">
                <MessageSquare size={24} className="text-[var(--color-text-muted)] opacity-40 mb-2" />
                <div className="text-sm text-[var(--color-text-muted)]">暂无会话</div>
                <div className="text-[11px] text-[var(--color-text-muted)] opacity-60 mt-0.5">点击右上角按钮创建</div>
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
                className="group flex items-center justify-between p-2.5 rounded-[var(--radius-lg)] transition-all duration-150 hover:bg-[var(--color-bg-hover)] cursor-pointer"
                onClick={() => setEditingCharId(char.id)}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <Avatar name={char.name} size="sm" />
                  <span className="text-sm truncate">{char.name}</span>
                </div>
                <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                  {currentSession && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        const updated = [...currentSession.characters.filter(c => c.id !== char.id), char]
                        useSessionStore.getState().updateSession({ characters: updated })
                      }}
                      className="px-2 py-0.5 text-[10px] rounded-[var(--radius-full)] bg-[var(--color-accent-soft)] text-[var(--color-accent)] font-medium"
                    >
                      加入会话
                    </button>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); removeCharacter(char.id) }}
                    className="p-1.5 rounded-[var(--radius-sm)] hover:bg-[rgba(248,113,113,0.12)]"
                  >
                    <Trash2 size={13} className="text-[var(--color-error)]" />
                  </button>
                </div>
              </div>
            ))}
            {characters.length === 0 && (
              <div className="flex flex-col items-center py-12">
                <Users size={24} className="text-[var(--color-text-muted)] opacity-40 mb-2" />
                <div className="text-sm text-[var(--color-text-muted)]">暂无角色</div>
                <div className="text-[11px] text-[var(--color-text-muted)] opacity-60 mt-0.5">点击右上角按钮添加</div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom settings button */}
      <div className="border-t border-[var(--color-border-subtle)] p-2">
        <button
          onClick={() => setShowSettings(true)}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)] text-sm font-medium transition-all duration-150 hover:bg-[var(--color-bg-hover)]"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <Settings size={15} />
          设置
        </button>
      </div>

      {editingCharId !== undefined && (
        <CharacterEditor characterId={editingCharId} onClose={() => setEditingCharId(undefined)} />
      )}
      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}
    </div>
  )
}
