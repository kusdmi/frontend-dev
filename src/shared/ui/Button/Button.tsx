import { type ButtonHTMLAttributes, forwardRef } from 'react'

import clsx from 'clsx'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ className, variant = 'secondary', ...props }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        className={clsx(
          'inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:opacity-40',
          variant === 'primary' &&
            'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]',
          variant === 'secondary' &&
            'border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] text-zinc-700 hover:bg-zinc-100',
          variant === 'ghost' && 'text-zinc-600 hover:bg-zinc-100',
          variant === 'danger' &&
            'border border-red-200 bg-red-50 text-red-700 hover:bg-red-100',
          className
        )}
        {...props}
      />
    )
  }
)
