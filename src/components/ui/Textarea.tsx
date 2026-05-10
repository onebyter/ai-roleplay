import React from 'react'
import { cn } from '@/lib/utils'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export default function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        'w-full rounded-[var(--radius-md)] bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] transition-all duration-150 focus:border-[var(--color-accent)] focus:shadow-[var(--shadow-accent)] focus:outline-none resize-none',
        className
      )}
      {...props}
    />
  )
}
