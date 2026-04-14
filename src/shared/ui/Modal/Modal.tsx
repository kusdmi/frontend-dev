import { type ReactNode, useEffect } from 'react'

import clsx from 'clsx'

interface ModalProps {
  open: boolean
  title: string
  children: ReactNode
  onClose: () => void
  className?: string
}

export function Modal({
  open,
  title,
  children,
  onClose,
  className,
}: ModalProps): ReactNode {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"
        aria-label="Закрыть"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={clsx(
          'relative z-10 w-full max-w-md rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] p-6 shadow-2xl',
          className
        )}
      >
        <h2 id="modal-title" className="text-lg font-semibold text-zinc-800">
          {title}
        </h2>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  )
}
