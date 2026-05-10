import React from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'error' | 'gm'
  className?: string
}

const variantStyles: Record<string, string> = {
  default: 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]',
  accent: 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]',
  success: 'bg-[rgba(74,222,128,0.12)] text-[var(--color-success)]',
  warning: 'bg-[rgba(251,191,36,0.12)] text-[var(--color-warning)]',
  error: 'bg-[rgba(248,113,113,0.12)] text-[var(--color-error)]',
  gm: 'bg-[var(--color-gm-soft)] text-[var(--color-gm)]',
}

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-[var(--radius-full)] px-2 py-0.5 text-xs font-medium',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
