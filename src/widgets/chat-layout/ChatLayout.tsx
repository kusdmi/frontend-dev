import { type ReactNode, useEffect, useState } from 'react'

import { ChatInput } from '@/features/chat-input/ChatInput'
import { ChatMessages } from '@/features/chat-messages/ChatMessages'
import { ChatSidebar } from '@/features/chat-sidebar/ChatSidebar'
import { SettingsPanel } from '@/features/settings-panel/SettingsPanel'
import { useChatStore } from '@/entities/chat/store'
import { usePersistChatStore } from '@/app/hooks/usePersistChatStore'
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary'

export function ChatLayout(): ReactNode {
  usePersistChatStore()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const hydrated = useChatStore((s) => s.hydrated)
  const sidebarOpen = useChatStore((s) => s.sidebarOpen)
  const lastError = useChatStore((s) => s.lastError)
  const theme = useChatStore((s) => s.settings.theme)
  const currentChat = useChatStore((s) =>
    s.chats.find((chat) => chat.id === s.currentChatId)
  )

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const applyTheme = () => {
      const isDark = theme === 'dark' || (theme === 'system' && media.matches)
      document.documentElement.classList.toggle('theme-dark', isDark)
    }
    applyTheme()
    media.addEventListener('change', applyTheme)
    return () => media.removeEventListener('change', applyTheme)
  }, [theme])

  if (!hydrated) {
    return (
      <div className="flex h-full items-center justify-center text-zinc-500">
        Загрузка…
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#f7f7f8] md:flex-row">
      <div
        className={`${
          sidebarOpen ? 'flex' : 'hidden'
        } min-h-0 md:flex md:min-h-0`}
      >
        <ErrorBoundary>
          <ChatSidebar onOpenSettings={() => setSettingsOpen(true)} />
        </ErrorBoundary>
      </div>

      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white">
        <div className="pointer-events-none absolute left-6 top-4 z-20 hidden sm:block">
          <span className="pointer-events-auto text-[14px] font-medium text-zinc-800">
            GigaChat
          </span>
        </div>

        {lastError && (
          <div className="shrink-0 border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
            {lastError}
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-hidden">
          <ErrorBoundary>
            <ChatMessages messages={currentChat?.messages ?? []} />
          </ErrorBoundary>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-28 bg-gradient-to-t from-white via-white/95 to-transparent" />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30">
          <div className="pointer-events-auto">
            <ErrorBoundary>
              <ChatInput />
            </ErrorBoundary>
          </div>
        </div>
      </div>

      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  )
}
