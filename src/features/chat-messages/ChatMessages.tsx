import { type ReactNode, useEffect, useRef } from 'react'

import { MessageBubble } from './MessageBubble'
import type { ChatMessage } from '@/entities/chat/types'
import { useChatStore } from '@/entities/chat/store'

interface ChatMessagesProps {
  messages: ChatMessage[]
}

export function ChatMessages({ messages }: ChatMessagesProps): ReactNode {
  const containerRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const firstMatchRef = useRef<HTMLDivElement>(null)
  const isStreaming = useChatStore((s) => s.isStreaming)
  const searchQuery = useChatStore((s) => s.searchQuery)
  const lastContent = messages.at(-1)?.content

  const normalizedQuery = searchQuery.trim().toLowerCase()
  const firstMatchedId =
    normalizedQuery.length > 0
      ? messages.find((m) => m.content.toLowerCase().includes(normalizedQuery))?.id ?? null
      : null

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const scrollToBottom = () => {
      container.scrollTop = container.scrollHeight
      bottomRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' })
    }
    scrollToBottom()
    requestAnimationFrame(scrollToBottom)
    if (isStreaming) {
      setTimeout(scrollToBottom, 20)
      setTimeout(scrollToBottom, 80)
    }
  }, [messages.length, lastContent, isStreaming])

  useEffect(() => {
    if (!normalizedQuery) return
    firstMatchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [normalizedQuery, firstMatchedId])

  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-auto px-2 pb-36 pt-2 sm:px-4 sm:pb-40 sm:pt-4"
    >
      <div className="flex flex-col gap-5">
        {messages.map((m, i) => {
          const isLastAssistant =
            m.role === 'assistant' && i === messages.length - 1
          const isStreamingAssistant =
            Boolean(isStreaming && isLastAssistant && !m.content.trim())
          const isSearchMatch =
            normalizedQuery.length > 0 &&
            m.content.toLowerCase().includes(normalizedQuery)
          return (
            <div
              key={m.id}
              ref={m.id === firstMatchedId ? firstMatchRef : undefined}
            >
              <MessageBubble
                message={m}
                isStreamingAssistant={isStreamingAssistant}
                isSearchMatch={isSearchMatch}
              />
            </div>
          )
        })}
        <div
          ref={bottomRef}
          className="h-px shrink-0 scroll-mb-28 sm:scroll-mb-32 md:scroll-mb-40"
          aria-hidden
        />
      </div>
    </div>
  )
}
