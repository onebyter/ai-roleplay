import React, { useState } from 'react'
import { useSettingsStore } from '@/stores/settingsStore'
import { APIConfig } from '@/types/agent'
import { v4 as uuidv4 } from 'uuid'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Plus, Trash2, Check } from 'lucide-react'

export default function ApiConfigPanel() {
  const { apiConfigs, selectedConfigId, addAPIConfig, updateAPIConfig, removeAPIConfig, setSelectedConfig } = useSettingsStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', baseURL: '', apiKey: '', models: '' })

  const startAdd = () => {
    setForm({ name: '', baseURL: '', apiKey: '', models: '' })
    setEditingId('__new__')
  }

  const startEdit = (config: APIConfig) => {
    setForm({ name: config.name, baseURL: config.baseURL, apiKey: config.apiKey, models: config.models.join(', ') })
    setEditingId(config.id)
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

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center px-1">
        <span className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">API 配置</span>
        <Button size="sm" onClick={startAdd}><Plus size={14} /> 添加</Button>
      </div>

      {editingId && (
        <div className="p-3 rounded-[var(--radius-lg)] bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] space-y-2.5">
          <Input placeholder="配置名称（如 DeepSeek）" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input placeholder="Base URL（如 https://api.deepseek.com）" value={form.baseURL} onChange={(e) => setForm({ ...form, baseURL: e.target.value })} />
          <Input placeholder="API Key" type="password" value={form.apiKey} onChange={(e) => setForm({ ...form, apiKey: e.target.value })} />
          <Input placeholder="模型列表，逗号分隔（如 deepseek-chat, deepseek-reasoner）" value={form.models} onChange={(e) => setForm({ ...form, models: e.target.value })} />
          <div className="flex gap-2">
            <Button size="sm" className="flex-1" onClick={handleSave}><Check size={14} /> 保存</Button>
            <Button size="sm" variant="secondary" className="flex-1" onClick={() => setEditingId(null)}>取消</Button>
          </div>
        </div>
      )}

      {apiConfigs.map((config) => (
        <div
          key={config.id}
          className="group flex items-center justify-between p-2.5 rounded-[var(--radius-lg)] transition-all duration-150 hover:bg-[var(--color-bg-hover)] cursor-pointer"
          style={{
            backgroundColor: selectedConfigId === config.id ? 'var(--color-bg-active)' : undefined,
            border: selectedConfigId === config.id ? '1px solid var(--color-accent-soft)' : '1px solid transparent',
          }}
          onClick={() => setSelectedConfig(config.id)}
          onDoubleClick={() => startEdit(config)}
        >
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium truncate">{config.name}</div>
            <div className="text-[11px] text-[var(--color-text-muted)] truncate">{config.baseURL}</div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); removeAPIConfig(config.id) }}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-[var(--radius-sm)] hover:bg-[rgba(248,113,113,0.12)]"
          >
            <Trash2 size={13} className="text-[var(--color-error)]" />
          </button>
        </div>
      ))}

      {apiConfigs.length === 0 && !editingId && (
        <div className="text-center py-8 text-sm text-[var(--color-text-muted)]">暂无 API 配置</div>
      )}
    </div>
  )
}
