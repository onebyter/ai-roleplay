import React, { useState } from 'react'
import { useSessionStore } from '@/stores/sessionStore'
import { useCharacterStore } from '@/stores/characterStore'

type RightTab = 'world' | 'characters' | 'info'

export default function RightPanel() {
  const [activeTab, setActiveTab] = useState<RightTab>('world')
  const { currentSession, updateWorldState } = useSessionStore()
  const { characters } = useCharacterStore()

  return (
    <div className="w-72 flex flex-col border-l"
      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
      {/* Tabs */}
      <div className="flex border-b" style={{ borderColor: 'var(--border)' }}>
        {(['world', 'characters', 'info'] as RightTab[]).map((tab) => (
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
            {tab === 'world' ? '世界' : tab === 'characters' ? '角色' : '信息'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === 'world' && currentSession && (
          <div>
            <h3 className="text-sm font-medium mb-3">世界设定</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--text-secondary)' }}>世界名称</label>
                <div className="text-sm p-2 rounded" style={{ backgroundColor: 'var(--bg-primary)' }}>
                  {currentSession.worldSetting.name}
                </div>
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--text-secondary)' }}>世界描述</label>
                <div className="text-sm p-2 rounded" style={{ backgroundColor: 'var(--bg-primary)' }}>
                  {currentSession.worldSetting.description}
                </div>
              </div>

              <h3 className="text-sm font-medium mb-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                当前状态
              </h3>
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--text-secondary)' }}>时间</label>
                <input
                  value={currentSession.worldState.currentTime}
                  onChange={(e) => updateWorldState({ currentTime: e.target.value })}
                  className="w-full text-sm p-2 rounded outline-none"
                  style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--text-secondary)' }}>地点</label>
                <input
                  value={currentSession.worldState.location}
                  onChange={(e) => updateWorldState({ location: e.target.value })}
                  className="w-full text-sm p-2 rounded outline-none"
                  style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--text-secondary)' }}>环境</label>
                <textarea
                  value={currentSession.worldState.environment}
                  onChange={(e) => updateWorldState({ environment: e.target.value })}
                  className="w-full text-sm p-2 rounded outline-none resize-none"
                  rows={3}
                  style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'characters' && (
          <div>
            <h3 className="text-sm font-medium mb-3">参与角色</h3>
            {currentSession?.characters.map((char) => (
              <div key={char.id} className="p-2 rounded mb-2" style={{ backgroundColor: 'var(--bg-primary)' }}>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                    style={{ backgroundColor: 'var(--accent)' }}>
                    {char.name[0]}
                  </div>
                  <span className="text-sm font-medium">{char.name}</span>
                </div>
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {char.personality}
                </div>
              </div>
            ))}
            {(!currentSession || currentSession.characters.length === 0) && (
              <div className="text-center py-8 text-sm" style={{ color: 'var(--text-secondary)' }}>
                暂无参与角色
              </div>
            )}
          </div>
        )}

        {activeTab === 'info' && currentSession && (
          <div>
            <h3 className="text-sm font-medium mb-3">会话信息</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--text-secondary)' }}>模式</span>
                <span>{currentSession.mode === 'gm-led' ? 'GM 主导' : '自由群聊'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--text-secondary)' }}>用户角色</span>
                <span>{currentSession.userRole === 'gm' ? 'GM' : '玩家'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--text-secondary)' }}>消息数</span>
                <span>{currentSession.messages.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--text-secondary)' }}>角色数</span>
                <span>{currentSession.characters.length}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
