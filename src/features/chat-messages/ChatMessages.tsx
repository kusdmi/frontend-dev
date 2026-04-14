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
  const isStreaming = useChatStore((s) => s.isStreaming)
  const lastContent = messages.at(-1)?.content

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

  return (
    <div ref={containerRef} className="h-full overflow-y-auto px-4 pb-40 pt-4">
      <div className="flex flex-col gap-5">
        {messages.map((m, i) => {
          const isLastAssistant =
            m.role === 'assistant' && i === messages.length - 1
          const isStreamingAssistant =
            Boolean(isStreaming && isLastAssistant && !m.content.trim())
          return (
            <MessageBubble
              key={m.id}
              message={m}
              isStreamingAssistant={isStreamingAssistant}
            />
          )
        })}
        <div
          ref={bottomRef}
          className="h-px shrink-0 scroll-mb-32 md:scroll-mb-40"
          aria-hidden
        />
      </div>
    </div>
  )
}
