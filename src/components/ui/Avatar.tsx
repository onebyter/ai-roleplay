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

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center text-white font-medium shrink-0',
        sizeStyles[size],
        className
      )}
      style={{ backgroundColor: color || 'var(--color-accent)' }}
    >
      {initial}
    </div>
  )
}
