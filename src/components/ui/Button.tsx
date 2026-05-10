import React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

const variantStyles: Record<string, string> = {
  default: 'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] shadow-[var(--shadow-accent)] active:scale-[0.97]',
  secondary: 'bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-text-muted)]',
  ghost: 'bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]',
  danger: 'bg-transparent text-[var(--color-error)] hover:bg-[rgba(248,113,113,0.12)]',
}

const sizeStyles: Record<string, string> = {
  sm: 'h-7 px-2.5 text-xs gap-1',
  md: 'h-8 px-3 text-sm gap-1.5',
  lg: 'h-10 px-4 text-sm gap-2',
}

export default function Button({
  variant = 'default',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-[var(--radius-md)] font-medium transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none cursor-pointer',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
