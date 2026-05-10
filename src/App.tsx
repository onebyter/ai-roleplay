import React, { useState } from 'react'
import Sidebar from './components/layout/Sidebar'
import ChatArea from './components/layout/ChatArea'
import RightPanel from './components/layout/RightPanel'

export default function App() {
  const [rightPanelOpen, setRightPanelOpen] = useState(true)

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
