import React from 'react'
import { cn } from '@/lib/utils'

interface AvatarProps {
  name: string
  src?: string
  size?: 'sm' | 'md' | 'lg'
  color?: string
  className?: string
}

const sizeStyles: Record<string, string> = {
  sm: 'w-6 h-6 text-[10px]',
  md: 'w-8 h-8 text-xs',
  lg: 'w-10 h-10 text-sm',
}

function isLightColor(hex: string): boolean {
  if (!hex || hex.startsWith('var(')) return false
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) > 150
}

export default function Avatar({ name, src, size = 'md', color, className }: AvatarProps) {
  const initial = name?.[0] || '?'

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn('rounded-full object-cover shrink-0', sizeStyles[size], className)}
      />
    )
  }

  const bgColor = color || 'var(--color-accent)'
  const textColor = isLightColor(bgColor) ? '#1b1b1f' : '#fff'

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-medium shrink-0',
        sizeStyles[size],
        className
      )}
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {initial}
    </div>
  )
}
