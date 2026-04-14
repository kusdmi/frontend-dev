import { type ReactNode } from 'react'

export function TypingIndicator(): ReactNode {
  return (
    <div
      className="flex items-center gap-1.5 px-1 py-2"
      aria-label="Ассистент печатает"
    >
      <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.2s]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.1s]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-400" />
    </div>
  )
}
