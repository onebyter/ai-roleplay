import React, { useState, useEffect, useRef } from 'react'
import { useSettingsStore } from '@/stores/settingsStore'
import Sidebar from './components/layout/Sidebar'
import ChatArea from './components/layout/ChatArea'
import RightPanel from './components/layout/RightPanel'

export default function App() {
  const [rightPanelOpen, setRightPanelOpen] = useState(true)
  const theme = useSettingsStore((s) => s.theme)
  const setTheme = useSettingsStore((s) => s.setTheme)
  const initRef = useRef(false)

  useEffect(() => {
    // 首次渲染后 data-theme 已设置（store 从 localStorage 读取了初始值），
    // 标记初始化完成，后续用户切换才写 localStorage
    document.documentElement.setAttribute('data-theme', theme)
    initRef.current = true
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    if (!initRef.current) {
      localStorage.setItem('theme', theme)
    }
  }, [theme])

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar />
      <ChatArea
        onToggleRightPanel={() => setRightPanelOpen(!rightPanelOpen)}
        rightPanelOpen={rightPanelOpen}
      />
      {rightPanelOpen && <RightPanel />}
    </div>
  )
}
