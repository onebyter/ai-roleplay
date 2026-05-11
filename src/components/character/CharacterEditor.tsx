import React, { useState } from 'react'
import { useCharacterStore } from '@/stores/characterStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { DEFAULT_CHARACTER } from '@/types/character'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import { X, Save } from 'lucide-react'

interface CharacterEditorProps {
  characterId?: string
  onClose: () => void
}

export default function CharacterEditor({ characterId, onClose }: CharacterEditorProps) {
  const { characters, addCharacter, updateCharacter } = useCharacterStore()
  const existing = characterId ? characters.find((c) => c.id === characterId) : null
  const { apiConfigs, selectedConfigId } = useSettingsStore()
  const [form, setForm] = useState(existing || { ...DEFAULT_CHARACTER })

  const handleSave = () => {
    if (characterId && existing) {
      updateCharacter(characterId, form)
    } else {
      addCharacter(form)
    }
    onClose()
  }

  const updateField = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-overlay)', animation: 'fadeIn 0.15s ease-out' }}>
      <div className="w-[520px] max-h-[85vh] overflow-y-auto rounded-[var(--radius-xl)] bg-[var(--color-bg-secondary)] border border-[var(--color-border)] shadow-[var(--shadow-lg)] p-5 space-y-4" style={{ animation: 'slideInUp 0.25s ease-out' }}>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">{characterId ? '编辑角色' : '新建角色'}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}><X size={16} /></Button>
        </div>

        <Input placeholder="角色名称" value={form.name} onChange={(e) => updateField('name', e.target.value)} />

        <div>
          <label className="text-[11px] text-[var(--color-text-muted)] mb-1 block">角色描述</label>
          <Textarea rows={2} placeholder="外貌、背景等" value={form.description} onChange={(e) => updateField('description', e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] text-[var(--color-text-muted)] mb-1 block">性格</label>
            <Input placeholder="如：开朗、机智" value={form.personality} onChange={(e) => updateField('personality', e.target.value)} />
          </div>
          <div>
            <label className="text-[11px] text-[var(--color-text-muted)] mb-1 block">说话风格</label>
            <Input placeholder="如：随意、带方言" value={form.speakingStyle} onChange={(e) => updateField('speakingStyle', e.target.value)} />
          </div>
        </div>

        <div>
          <label className="text-[11px] text-[var(--color-text-muted)] mb-1 block">系统提示词</label>
          <Textarea rows={3} placeholder="角色行为的核心指令" value={form.systemPrompt} onChange={(e) => updateField('systemPrompt', e.target.value)} />
        </div>

        <div>
          <label className="text-[11px] text-[var(--color-text-muted)] mb-1 block">示例对话</label>
          <Textarea rows={2} placeholder="展示角色说话风格的示例" value={form.exampleDialogue} onChange={(e) => updateField('exampleDialogue', e.target.value)} />
        </div>

        <div>
          <label className="text-[11px] text-[var(--color-text-muted)] mb-1 block">开场白（AI 首条消息）</label>
          <Textarea rows={2} placeholder="角色主动说的第一句话" value={form.firstMessage} onChange={(e) => updateField('firstMessage', e.target.value)} />
        </div>

        <div>
          <label className="text-[11px] text-[var(--color-text-muted)] mb-1 block">标签</label>
          <div className="flex flex-wrap gap-1 mb-1.5">
            {(form.tags || []).map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-[var(--radius-full)] bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">
                {tag}
                <button
                  onClick={() => updateField('tags', (form.tags || []).filter((t: string) => t !== tag))}
                  className="hover:text-[var(--color-error)] transition-colors"
                >×</button>
              </span>
            ))}
          </div>
          <Input
            placeholder="输入标签后按 Enter 添加"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                const val = (e.target as HTMLInputElement).value.trim()
                if (val && !(form.tags || []).includes(val)) {
                  updateField('tags', [...(form.tags || []), val]);
                  (e.target as HTMLInputElement).value = ''
                }
              }
            }}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] text-[var(--color-text-muted)] mb-1 block">API 提供商</label>
            <select
              value={form.agentConfig?.provider || ''}
              onChange={(e) => updateField('agentConfig', { ...form.agentConfig, provider: e.target.value })}
              className="h-8 w-full rounded-[var(--radius-md)] bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] px-3 text-sm text-[var(--color-text-primary)] transition-all duration-150 focus:border-[var(--color-accent)] focus:shadow-[var(--shadow-accent)] focus:outline-none cursor-pointer"
            >
              <option value="">使用全局默认</option>
              {apiConfigs.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] text-[var(--color-text-muted)] mb-1 block">模型</label>
            <Input placeholder="如：deepseek-chat" value={form.agentConfig?.model || ''} onChange={(e) => updateField('agentConfig', { ...form.agentConfig, model: e.target.value })} />
          </div>
          <div>
            <label className="text-[11px] text-[var(--color-text-muted)] mb-1 block">Temperature</label>
            <Input type="number" step="0.1" min="0" max="2" value={String(form.agentConfig?.temperature ?? 0.8)} onChange={(e) => updateField('agentConfig', { ...form.agentConfig, temperature: parseFloat(e.target.value) || 0.8 })} />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button className="flex-1" onClick={handleSave}><Save size={14} /> 保存</Button>
          <Button variant="secondary" className="flex-1" onClick={onClose}>取消</Button>
        </div>
      </div>
    </div>
  )
}
