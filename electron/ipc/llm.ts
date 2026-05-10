import { ipcMain, BrowserWindow } from 'electron'
import OpenAI from 'openai'

const activeStreams = new Map<string, AbortController>()

export function setupLLMIPC() {
  ipcMain.handle('llm:streamChat', async (_event, config: any, messages: any[], agentId: string) => {
    const client = new OpenAI({
      baseURL: config.baseURL,
      apiKey: config.apiKey,
    })

    const controller = new AbortController()
    activeStreams.set(agentId, controller)

    try {
      const stream = await client.chat.completions.create(
        {
          model: config.model,
          messages,
          stream: true,
          temperature: config.temperature ?? 0.8,
          max_tokens: config.maxTokens ?? 2048,
        },
        { signal: controller.signal }
      )

      const win = BrowserWindow.getFocusedWindow()
      let fullContent = ''

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || ''
        if (content) {
          fullContent += content
          win?.webContents.send('llm:streamChunk', { agentId, chunk: content })
        }
      }

      win?.webContents.send('llm:streamEnd', { agentId })
      return { success: true, content: fullContent }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return { success: false, aborted: true }
      }
      const win = BrowserWindow.getFocusedWindow()
      win?.webContents.send('llm:streamError', { agentId, error: error.message })
      return { success: false, error: error.message }
    } finally {
      activeStreams.delete(agentId)
    }
  })

  ipcMain.handle('llm:stopStream', async (_event, agentId: string) => {
    const controller = activeStreams.get(agentId)
    if (controller) {
      controller.abort()
      activeStreams.delete(agentId)
      return { success: true }
    }
    return { success: false, error: 'No active stream found' }
  })
}
