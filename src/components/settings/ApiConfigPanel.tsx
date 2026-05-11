import React, { useState } from 'react'
import { useSettingsStore } from '@/stores/settingsStore'
import { APIConfig } from '@/types/agent'
import { v4 as uuidv4 } from 'uuid'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Plus, Trash2, Check, Download, Wifi, Loader2 } from 'lucide-react'

export default function ApiConfigPanel() {
  const { apiConfigs, selectedConfigId, addAPIConfig, updateAPIConfig, removeAPIConfig, setSelectedConfig } = useSettingsStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', baseURL: '', apiKey: '', models: '' })
  const [fetchingModels, setFetchingModels] = useState(false)
  const [testingConn, setTestingConn] = useState<string | null>(null)
  const [statusMsg, setStatusMsg] = useState('')

  const startAdd = () => {
    setForm({ name: '', baseURL: '', apiKey: '', models: '' })
    setEditingId('__new__')
    setStatusMsg('')
  }

  const startEdit = (config: APIConfig) => {
    setForm({ name: config.name, baseURL: config.baseURL, apiKey: config.apiKey, models: config.models.join(', ') })
    setEditingId(config.id)
    setStatusMsg('')
  }

  const handleSave = () => {
    const models = form.models.split(',').map((m) => m.trim()).filter(Boolean)
    if (editingId === '__new__') {
      addAPIConfig({ id: uuidv4(), name: form.name, baseURL: form.baseURL, apiKey: form.apiKey, models })
    } else if (editingId) {
      updateAPIConfig(editingId, { name: form.name, baseURL: form.baseURL, apiKey: form.apiKey, models })
    }
    setEditingId(null)
  }

  const handleFetchModels = async () => {
    if (!form.baseURL || !form.apiKey) {
      setStatusMsg('请先填写 Base URL 和 API Key')
      return
    }
    setFetchingModels(true)
    setStatusMsg('')
    try {
      const result = await window.electronAPI.llm.fetchModels({
        baseURL: form.baseURL.replace(/\/+$/, ''),
        apiKey: form.apiKey,
      })
      if (result.success && result.models) {
        setForm({ ...form, models: result.models.join(', ') })
        setStatusMsg(`获取成功，${result.models.length} 个模型`)
      } else {
        setStatusMsg(`获取失败: ${result.error}`)
      }
    } catch (err: any) {
      setStatusMsg(`获取失败: ${err.message}`)
    }
    setFetchingModels(false)
  }

  const handleTestConnection = async (config: APIConfig) => {
    setTestingConn(config.id)
    setStatusMsg('')
    try {
      const result = await window.electronAPI.llm.testConnection({
        baseURL: config.baseURL.replace(/\/+$/, ''),
        apiKey: config.apiKey,
        model: config.models[0] || 'gpt-3.5-turbo',
      })
      if (result.success) {
        setStatusMsg(`${config.name} 连接成功`)
      } else {
        setStatusMsg(`连接失败: ${result.error}`)
      }
    } catch (err: any) {
      setStatusMsg(`连接失败: ${err.message}`)
    }
    setTestingConn(null)
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center px-1">
        <Button size="sm" onClick={startAdd}><Plus size={14} /> 添加配置</Button>
      </div>

      {statusMsg && (
        <div className="px-3 py-2 rounded-[var(--radius-md)] text-xs font-medium" style={{
          backgroundColor: statusMsg.includes('成功') ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
          color: statusMsg.includes('成功') ? 'var(--color-success)' : 'var(--color-error)',
        }}>
          {statusMsg}
        </div>
      )}

      {editingId && (
        <div className="p-3 rounded-[var(--radius-lg)] bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] space-y-2.5">
          <Input placeholder="配置名称（如 DeepSeek）" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input placeholder="Base URL（如 https://api.deepseek.com）" value={form.baseURL} onChange={(e) => setForm({ ...form, baseURL: e.target.value })} />
          <Input placeholder="API Key" type="password" value={form.apiKey} onChange={(e) => setForm({ ...form, apiKey: e.target.value })} />
          <div className="flex gap-2">
            <div className="flex-1">
              <Input placeholder="模型列表，逗号分隔" value={form.models} onChange={(e) => setForm({ ...form, models: e.target.value })} />
            </div>
            <Button size="sm" variant="secondary" onClick={handleFetchModels} disabled={fetchingModels}>
              {fetchingModels ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            </Button>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="flex-1" onClick={handleSave}><Check size={14} /> 保存</Button>
            <Button size="sm" variant="secondary" className="flex-1" onClick={() => { setEditingId(null); setStatusMsg('') }}>取消</Button>
          </div>
        </div>
      )}

      {apiConfigs.map((config) => (
        <div
          key={config.id}
          className="group flex items-center gap-2 p-2.5 rounded-[var(--radius-lg)] transition-all duration-150 hover:bg-[var(--color-bg-hover)]"
          style={{
            backgroundColor: selectedConfigId === config.id ? 'var(--color-bg-active)' : undefined,
            border: selectedConfigId === config.id ? '1px solid var(--color-accent-soft)' : '1px solid transparent',
          }}
        >
          <button className="min-w-0 flex-1 text-left" onClick={() => setSelectedConfig(config.id)} onDoubleClick={() => startEdit(config)}>
            <div className="text-sm font-medium truncate">{config.name}</div>
            <div className="text-[11px] text-[var(--color-text-muted)] truncate">{config.baseURL} · {config.models.length} 个模型</div>
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); handleTestConnection(config) }}
              disabled={testingConn === config.id}
              className="p-1.5 rounded-[var(--radius-sm)] hover:bg-[rgba(124,108,255,0.12)] transition-colors"
              title="测试连接"
            >
              {testingConn === config.id ? <Loader2 size={13} className="animate-spin" /> : <Wifi size={13} className="text-[var(--color-text-muted)]" />}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); removeAPIConfig(config.id) }}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-[var(--radius-sm)] hover:bg-[rgba(248,113,113,0.12)]"
            >
              <Trash2 size={13} className="text-[var(--color-error)]" />
            </button>
          </div>
        </div>
      ))}

      {apiConfigs.length === 0 && !editingId && (
        <div className="text-center py-8 text-sm text-[var(--color-text-muted)]">暂无 API 配置，点击上方按钮添加</div>
      )}
    </div>
  )
}
