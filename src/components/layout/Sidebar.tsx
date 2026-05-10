import React, { useEffect, useState } from 'react'
import { useSessionStore } from '@/stores/sessionStore'
import { useCharacterStore } from '@/stores/characterStore'
import { useChatStore } from '@/stores/chatStore'

type SidebarTab = 'sessions' | 'characters' | 'settings'

export default function Sidebar() {
  const [activeTab, setActiveTab] = useState<SidebarTab>('sessions')
  const {
    currentSession, sessions,
    createSession, loadSession, deleteSession,
    loadSessionList,
  } = useSessionStore()
  const { characters, addCharacter, removeCharacter, loadCharacters } = useCharacterStore()
  const { setMessages } = useChatStore()
  const [showNewSession, setShowNewSession] = useState(false)
  const [newSessionName, setNewSessionName] = useState('')

  // Load data on mount
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
    // Load messages into chat store
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
    <div className="w-64 flex flex-col border-r"
      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
      {/* Title Bar */}
      <div className="title-bar-drag h-12 flex items-center px-4 border-b"
        style={{ borderColor: 'var(--border)' }}>
        <span className="text-lg font-bold title-bar-no-drag">AI RolePlay</span>
      </div>

      {/* Tab Buttons */}
      <div className="flex border-b" style={{ borderColor: 'var(--border)' }}>
        {(['sessions', 'characters', 'settings'] as SidebarTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex-1 py-2 text-sm transition-colors"
            style={{
              backgroundColor: activeTab === tab ? 'var(--bg-tertiary)' : 'transparent',
              color: activeTab === tab ? 'var(--accent)' : 'var(--text-secondary)',
              borderBottom: activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent',
            }}
          >
            {tab === 'sessions' ? '会话' : tab === 'characters' ? '角色' : '设置'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === 'sessions' && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>会话列表</span>
              <button
                onClick={() => setShowNewSession(true)}
                className="px-2 py-1 text-xs rounded"
                style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
              >
                + 新建
              </button>
            </div>

            {showNewSession && (
              <div className="mb-3 p-2 rounded" style={{ backgroundColor: 'var(--bg-primary)' }}>
                <input
                  value={newSessionName}
                  onChange={(e) => setNewSessionName(e.target.value)}
                  placeholder="会话名称"
                  className="w-full px-2 py-1 text-sm rounded mb-2 outline-none"
                  style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateSession()}
                  autoFocus
                />
                <div className="flex gap-1">
                  <button
                    onClick={handleCreateSession}
                    className="flex-1 py-1 text-xs rounded"
                    style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
                  >
                    创建
                  </button>
                  <button
                    onClick={() => setShowNewSession(false)}
                    className="flex-1 py-1 text-xs rounded"
                    style={{ backgroundColor: 'var(--border)', color: 'var(--text-secondary)' }}
                  >
                    取消
                  </button>
                </div>
              </div>
            )}

            {/* Session list */}
            {sessions.map((session) => (
              <div
                key={session.id}
                className="p-2 rounded mb-1 cursor-pointer group"
                style={{
                  backgroundColor: currentSession?.id === session.id ? 'var(--bg-tertiary)' : 'var(--bg-primary)',
                }}
                onClick={() => handleLoadSession(session.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium truncate flex-1">{session.name}</div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteSession(session.id) }}
                    className="text-xs opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                    style={{ color: 'var(--error)' }}
                  >
                    删除
                  </button>
                </div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  {new Date(session.updatedAt).toLocaleString('zh-CN')}
                </div>
              </div>
            ))}

            {sessions.length === 0 && (
              <div className="text-center py-8 text-sm" style={{ color: 'var(--text-secondary)' }}>
                暂无会话，点击"+ 新建"创建
              </div>
            )}
          </div>
        )}

        {activeTab === 'characters' && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>角色库</span>
              <button
                onClick={handleAddCharacter}
                className="px-2 py-1 text-xs rounded"
                style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
              >
                + 添加
              </button>
            </div>
            {characters.map((char) => (
              <div key={char.id} className="flex items-center justify-between p-2 rounded mb-1 hover:opacity-80"
                style={{ backgroundColor: 'var(--bg-primary)' }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                    style={{ backgroundColor: 'var(--accent)' }}>
                    {char.name[0]}
                  </div>
                  <span className="text-sm">{char.name}</span>
                </div>
                <button
                  onClick={() => removeCharacter(char.id)}
                  className="text-xs opacity-50 hover:opacity-100"
                  style={{ color: 'var(--error)' }}
                >
                  删除
                </button>
              </div>
            ))}
            {characters.length === 0 && (
              <div className="text-center py-8 text-sm" style={{ color: 'var(--text-secondary)' }}>
                暂无角色，点击"添加"创建
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <div className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>API 配置</div>
            <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-primary)' }}>
              <div className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
                配置将在后续版本中完善
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
