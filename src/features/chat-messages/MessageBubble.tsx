import { type ReactNode, useCallback, useState } from 'react'

import { MarkdownContent } from '@/features/markdown-content/MarkdownContent'
import { TypingIndicator } from '@/features/chat-messages/TypingIndicator'
import type { ChatMessage } from '@/entities/chat/types'

interface MessageBubbleProps {
  message: ChatMessage
  isStreamingAssistant: boolean
  isSearchMatch?: boolean
}

export function MessageBubble({
  message,
  isStreamingAssistant,
  isSearchMatch = false,
}: MessageBubbleProps): ReactNode {
  const isUser = message.role === 'user'
  const rowClassName = isUser ? 'justify-end' : 'justify-start'
  const [copied, setCopied] = useState(false)

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1200)
    } catch {}
  }, [message.content])

  const editInInput = useCallback(() => {
    window.dispatchEvent(
      new CustomEvent('chat:prefill-input', {
        detail: { text: message.content },
      })
    )
  }, [message.content])

  return (
    <div className={`mx-auto flex w-full max-w-[864px] ${rowClassName}`}>
      <div
        className={`${
          isUser
            ? 'ml-auto w-fit max-w-[85%] text-black sm:max-w-[70%]'
            : 'w-full pl-1 pr-0 py-0 text-black sm:pl-[10px]'
        }`}
      >
        {isUser ? (
          <div className="space-y-1">
            <div
              className={`rounded-2xl bg-[#ececec] px-3 py-2 whitespace-pre-wrap text-[14px] leading-relaxed sm:px-4 ${
                isSearchMatch ? 'ring-2 ring-zinc-300' : ''
              }`}
            >
              {message.images?.map((img) => (
                <img
                  key={img.dataUrl.slice(0, 80)}
                  src={img.dataUrl}
                  alt={img.name}
                  className="max-h-64 max-w-full rounded-lg object-contain"
                />
              ))}
              {message.content}
            </div>
            <div className="flex justify-end gap-1">
              <button
                type="button"
                className="inline-flex h-7 w-7 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-200 hover:text-zinc-700"
                aria-label="Копировать текст сообщения"
                onClick={() => void copy()}
              >
                {copied ? '✓' : '⧉'}
              </button>
              <button
                type="button"
                className="inline-flex h-7 w-7 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-200 hover:text-zinc-700"
                aria-label="Редактировать сообщение"
                onClick={editInInput}
              >
                ✎
              </button>
            </div>
          </div>
        ) : (
          <div className={`space-y-1 ${isSearchMatch ? 'rounded-lg ring-2 ring-zinc-300' : ''}`}>
            {isStreamingAssistant && !message.content.trim() ? (
              <TypingIndicator />
            ) : (
              <MarkdownContent text={message.content || ' '} />
            )}
            {message.content.trim().length > 0 && !isStreamingAssistant && (
              <div className="flex justify-start gap-1">
                <button
                  type="button"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-200 hover:text-zinc-700"
                  aria-label="Копировать ответ ассистента"
                  onClick={() => void copy()}
                >
                  {copied ? '✓' : '⧉'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
