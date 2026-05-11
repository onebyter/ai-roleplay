import { describe, it, expect, beforeEach } from 'vitest'
import { useSettingsStore } from '../stores/settingsStore'

describe('settingsStore', () => {
  beforeEach(() => {
    useSettingsStore.setState({
      theme: 'dark',
      apiConfigs: [
        { id: 'ds', name: 'DeepSeek', baseURL: 'https://api.deepseek.com', apiKey: '', models: ['deepseek-chat'] },
        { id: 'oa', name: 'OpenAI', baseURL: 'https://api.openai.com/v1', apiKey: '', models: ['gpt-4o'] },
      ],
      selectedConfigId: 'ds',
    })
  })

  it('默认主题为 dark', () => {
    expect(useSettingsStore.getState().theme).toBe('dark')
  })

  it('setTheme 切换主题', () => {
    useSettingsStore.getState().setTheme('light')
    expect(useSettingsStore.getState().theme).toBe('light')
  })

  it('addAPIConfig 添加新配置', () => {
    useSettingsStore.getState().addAPIConfig({
      id: 'test', name: 'Test', baseURL: 'https://test.com', apiKey: 'sk-123', models: ['m1'],
    })
    expect(useSettingsStore.getState().apiConfigs).toHaveLength(3)
  })

  it('removeAPIConfig 删除配置', () => {
    useSettingsStore.getState().removeAPIConfig('ds')
    expect(useSettingsStore.getState().apiConfigs).toHaveLength(1)
    expect(useSettingsStore.getState().apiConfigs[0].id).toBe('oa')
  })

  it('setSelectedConfig 切换选中', () => {
    useSettingsStore.getState().setSelectedConfig('oa')
    expect(useSettingsStore.getState().selectedConfigId).toBe('oa')
  })
})
