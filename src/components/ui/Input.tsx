import React from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export default function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'h-8 w-full rounded-[var(--radius-md)] bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] px-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] transition-all duration-150 focus:border-[var(--color-accent)] focus:shadow-[var(--shadow-accent)] focus:outline-none',
        className
      )}
      {...props}
    />
  )
}
