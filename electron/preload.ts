import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  // Database operations
  db: {
    query: (sql: string, params?: any[]) => ipcRenderer.invoke('db:query', sql, params),
    run: (sql: string, params?: any[]) => ipcRenderer.invoke('db:run', sql, params),
    saveSession: (session: any) => ipcRenderer.invoke('db:saveSession', session),
    loadSession: (id: string) => ipcRenderer.invoke('db:loadSession', id),
    listSessions: () => ipcRenderer.invoke('db:listSessions'),
    deleteSession: (id: string) => ipcRenderer.invoke('db:deleteSession', id),
  },

  // LLM operations
  llm: {
    streamChat: (config: any, messages: any[], agentId: string) =>
      ipcRenderer.invoke('llm:streamChat', config, messages, agentId),
    stopStream: (agentId: string) => ipcRenderer.invoke('llm:stopStream', agentId),
    fetchModels: (config: any) => ipcRenderer.invoke('llm:fetchModels', config),
    testConnection: (config: any) => ipcRenderer.invoke('llm:testConnection', config),
  },

  // File operations
  file: {
    readTxt: (filePath: string) => ipcRenderer.invoke('file:readTxt', filePath),
    openFile: () => ipcRenderer.invoke('file:openFile'),
    saveFile: (content: string, defaultName?: string) =>
      ipcRenderer.invoke('file:saveFile', content, defaultName),
  },

  // Stream events
  onStreamChunk: (callback: (data: { agentId: string; chunk: string }) => void) => {
    const handler = (_: any, data: { agentId: string; chunk: string }) => callback(data)
    ipcRenderer.on('llm:streamChunk', handler)
    return () => ipcRenderer.removeListener('llm:streamChunk', handler)
  },
  onStreamEnd: (callback: (data: { agentId: string }) => void) => {
    const handler = (_: any, data: { agentId: string }) => callback(data)
    ipcRenderer.on('llm:streamEnd', handler)
    return () => ipcRenderer.removeListener('llm:streamEnd', handler)
  },
  onStreamError: (callback: (data: { agentId: string; error: string }) => void) => {
    const handler = (_: any, data: { agentId: string; error: string }) => callback(data)
    ipcRenderer.on('llm:streamError', handler)
    return () => ipcRenderer.removeListener('llm:streamError', handler)
  },
})
