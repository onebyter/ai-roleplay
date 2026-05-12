import React, { useState } from 'react'
import { useSettingsStore } from '@/stores/settingsStore'
import { APIConfig } from '@/types/agent'
import { v4 as uuidv4 } from 'uuid'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Plus, Trash2, Download, Wifi, Loader2, X } from 'lucide-react'

export default function ApiConfigPanel() {
  const { apiConfigs, selectedConfigId, addAPIConfig, updateAPIConfig, removeAPIConfig, setSelectedConfig } = useSettingsStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', baseURL: '', apiKey: '', models: [] as string[] })
  const [newModel, setNewModel] = useState('')
  const [fetchingModels, setFetchingModels] = useState(false)
  const [testingConn, setTestingConn] = useState<string | null>(null)
  const [statusMsg, setStatusMsg] = useState('')
  const [statusType, setStatusType] = useState<'success' | 'error' | ''>('')
  const showStatus = (msg: string, type: 'success' | 'error') => { setStatusMsg(msg); setStatusType(type) }
  const selectedConfig = apiConfigs.find(c => c.id === selectedConfigId)

  const startAdd = () => {
    setForm({ name: '', baseURL: '', apiKey: '', models: [] })
    setEditingId('__new__')
    setStatusMsg(''); setStatusType('')
    setNewModel('')
  }

  const selectOrEdit = (config: APIConfig) => {
    setSelectedConfig(config.id)
    setForm({ name: config.name, baseURL: config.baseURL, apiKey: config.apiKey, models: [...config.models] })
    setEditingId(config.id)
    setStatusMsg(''); setStatusType('')
    setNewModel('')
  }

  const handleSave = () => {
    if (editingId === '__new__') {
      addAPIConfig({ id: uuidv4(), name: form.name, baseURL: form.baseURL, apiKey: form.apiKey, models: form.models })
    } else if (editingId) {
      updateAPIConfig(editingId, { name: form.name, baseURL: form.baseURL, apiKey: form.apiKey, models: form.models })
    }
    setEditingId(null)
  }

  const handleCancel = () => {
    setEditingId(null)
    setStatusMsg(''); setStatusType('')
  }

  const addModel = () => {
    const m = newModel.trim()
    if (m && !form.models.includes(m)) {
      setForm({ ...form, models: [...form.models, m] })
      setNewModel('')
    }
  }

  const removeModel = (model: string) => {
    setForm({ ...form, models: form.models.filter(m => m !== model) })
  }

  const handleFetchModels = async () => {
    if (!form.baseURL || !form.apiKey) {
      showStatus('请先填写 Base URL 和 API Key', 'error')
      return
    }
    setFetchingModels(true)
    setStatusMsg(''); setStatusType('')
    try {
      const result = await window.electronAPI.llm.fetchModels({
        baseURL: form.baseURL.replace(/\/+$/, ''),
        apiKey: form.apiKey,
      })
      if (result.success && result.models) {
        setForm({ ...form, models: result.models })
        showStatus(`获取成功，${result.models.length} 个模型`, 'success')
      } else {
        showStatus(`获取失败: ${result.error}`, 'error')
      }
    } catch (err: any) {
      showStatus(`获取失败: ${err.message}`, 'error')
    }
    setFetchingModels(false)
  }

  const handleTestConnection = async () => {
    if (!form.baseURL || !form.apiKey || form.models.length === 0) {
      showStatus('请填写 Base URL、API Key 和至少一个模型', 'error')
      return
    }
    setTestingConn(editingId || '__test__')
    setStatusMsg(''); setStatusType('')
    try {
      const result = await window.electronAPI.llm.testConnection({
        baseURL: form.baseURL.replace(/\/+$/, ''),
        apiKey: form.apiKey,
        model: form.models[0],
      })
      if (result.success) {
        showStatus('连接成功', 'success')
      } else {
        showStatus(`连接失败: ${result.error}`, 'error')
      }
    } catch (err: any) {
      showStatus(`连接失败: ${err.message}`, 'error')
    }
    setTestingConn(null)
  }

  const isEditing = editingId !== null

  return (
    <div className="flex gap-0 h-full">
      {/* Left: config list */}
      <div className="w-48 shrink-0 border-r border-[var(--color-border-subtle)] p-3 space-y-1 overflow-y-auto">
        <Button size="sm" className="w-full mb-2" onClick={startAdd}>
          <Plus size={14} /> 添加配置
        </Button>
        {apiConfigs.map((config) => (
          <button
            key={config.id}
            onClick={() => selectOrEdit(config)}
            className="w-full text-left px-3 py-2 rounded-[var(--radius-md)] text-sm transition-all duration-150"
            style={{
              backgroundColor: selectedConfigId === config.id ? 'var(--color-bg-active)' : 'transparent',
              color: selectedConfigId === config.id ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
            }}
          >
            <div className="font-medium truncate">{config.name}</div>
            <div className="text-[10px] text-[var(--color-text-muted)] truncate">{config.models.length} 个模型</div>
          </button>
        ))}
        {apiConfigs.length === 0 && (
          <div className="text-center py-8 text-xs text-[var(--color-text-muted)]">暂无配置</div>
        )}
      </div>

      {/* Right: detail / edit form */}
      <div className="flex-1 p-4 overflow-y-auto">
        {!isEditing && selectedConfig && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">{selectedConfig.name}</h4>
              <div className="flex gap-1">
                <button onClick={() => handleTestConnection()}
                  disabled={testingConn === selectedConfig.id}
                  className="p-1.5 rounded-[var(--radius-sm)] hover:bg-[var(--color-bg-hover)] transition-colors"
                  title="测试连接">
                  {testingConn === selectedConfig.id ? <Loader2 size={14} className="animate-spin" /> : <Wifi size={14} />}
                </button>
                <button onClick={() => { selectOrEdit(selectedConfig); }}
                  className="text-xs px-2 py-1 rounded-[var(--radius-sm)] hover:bg-[var(--color-bg-hover)]">
                  编辑
                </button>
                <button onClick={() => { removeAPIConfig(selectedConfig.id); setEditingId(null); }}
                  className="p-1.5 rounded-[var(--radius-sm)] hover:bg-[rgba(248,113,113,0.12)]">
                  <Trash2 size={14} className="text-[var(--color-error)]" />
                </button>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div><span className="text-[var(--color-text-muted)]">Base URL:</span> {selectedConfig.baseURL}</div>
              <div><span className="text-[var(--color-text-muted)]">API Key:</span> {selectedConfig.apiKey ? '●●●●●●●●' : '未设置'}</div>
              <div>
                <span className="text-[var(--color-text-muted)]">模型 ({selectedConfig.models.length}):</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedConfig.models.map(m => (
                    <span key={m} className="px-2 py-0.5 text-xs rounded-[var(--radius-full)] bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">{m}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {isEditing && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">{editingId === '__new__' ? '新建配置' : '编辑配置'}</h4>
              <button onClick={handleCancel} className="p-1.5 rounded-[var(--radius-sm)] hover:bg-[var(--color-bg-hover)]">
                <X size={14} />
              </button>
            </div>

            {statusMsg && (
              <div className="px-3 py-2 rounded-[var(--radius-md)] text-xs font-medium" style={{
                backgroundColor: statusType === 'success' ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
                color: statusType === 'success' ? 'var(--color-success)' : 'var(--color-error)',
              }}>{statusMsg}</div>
            )}

            <div>
              <label className="text-[11px] text-[var(--color-text-muted)] mb-1 block">名称</label>
              <Input placeholder="如：DeepSeek" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="text-[11px] text-[var(--color-text-muted)] mb-1 block">Base URL</label>
              <Input placeholder="https://api.deepseek.com" value={form.baseURL} onChange={e => setForm({ ...form, baseURL: e.target.value })} />
            </div>
            <div>
              <label className="text-[11px] text-[var(--color-text-muted)] mb-1 block">API Key</label>
              <Input placeholder="sk-..." type="password" value={form.apiKey} onChange={e => setForm({ ...form, apiKey: e.target.value })} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] text-[var(--color-text-muted)]">模型列表</label>
                <div className="flex gap-1">
                  <Button size="sm" variant="secondary" onClick={handleFetchModels} disabled={fetchingModels}>
                    {fetchingModels ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                    <span className="text-[11px]">获取</span>
                  </Button>
                  <Button size="sm" variant="secondary" onClick={handleTestConnection} disabled={testingConn === editingId || form.models.length === 0}>
                    {testingConn === editingId ? <Loader2 size={12} className="animate-spin" /> : <Wifi size={12} />}
                    <span className="text-[11px]">测试</span>
                  </Button>
                </div>
              </div>
              <div className="space-y-1 mb-2">
                {form.models.map(m => (
                  <div key={m} className="flex items-center gap-1 px-2.5 py-1 rounded-[var(--radius-md)] bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">
                    <span className="text-xs flex-1 truncate">{m}</span>
                    <button onClick={() => removeModel(m)} className="p-0.5 rounded hover:bg-[rgba(248,113,113,0.12)]">
                      <X size={12} className="text-[var(--color-text-muted)]" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-1.5">
                <Input placeholder="输入模型名" value={newModel} onChange={e => setNewModel(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addModel() } }} />
                <Button size="sm" variant="secondary" onClick={addModel}>添加</Button>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button className="flex-1" onClick={handleSave}>保存</Button>
              <Button variant="secondary" className="flex-1" onClick={handleCancel}>取消</Button>
            </div>
          </div>
        )}

        {!isEditing && !selectedConfig && (
          <div className="flex items-center justify-center h-full text-sm text-[var(--color-text-muted)]">
            选择一个配置或添加新配置
          </div>
        )}
      </div>
    </div>
  )
}
