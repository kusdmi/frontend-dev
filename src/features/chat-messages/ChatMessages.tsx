import { type ReactNode, useEffect, useRef } from 'react'

import { MessageBubble } from './MessageBubble'
import type { ChatMessage } from '@/entities/chat/types'
import { useChatStore } from '@/entities/chat/store'

interface ChatMessagesProps {
  messages: ChatMessage[]
}

export function ChatMessages({ messages }: ChatMessagesProps): ReactNode {
  const bottomRef = useRef<HTMLDivElement>(null)
  const isStreaming = useChatStore((s) => s.isStreaming)
  const lastContent = messages.at(-1)?.content
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages.length, lastContent, isStreaming])

  return (
    <div className="h-full overflow-y-auto px-4 pb-36 pt-4">
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
        <div ref={bottomRef} className="h-px shrink-0" aria-hidden />
      </div>
    </div>
  )
}
