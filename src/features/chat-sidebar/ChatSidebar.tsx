import { type ReactNode, useEffect, useMemo, useState } from 'react'

import clsx from 'clsx'

import { getFilteredChats, useChatStore } from '@/entities/chat/store'
import { Button } from '@/shared/ui/Button'
import { Modal } from '@/shared/ui/Modal'

interface ChatSidebarProps {
  onOpenSettings: () => void
  onChatSelected?: () => void
  mobileMode?: boolean
  onCloseMobile?: () => void
}

export function ChatSidebar({
  onOpenSettings,
  onChatSelected,
  mobileMode = false,
  onCloseMobile,
}: ChatSidebarProps): ReactNode {
  const chats = useChatStore((s) => s.chats)
  const currentChatId = useChatStore((s) => s.currentChatId)
  const searchQuery = useChatStore((s) => s.searchQuery)
  const setSearchQuery = useChatStore((s) => s.setSearchQuery)
  const createChat = useChatStore((s) => s.createChat)
  const selectChat = useChatStore((s) => s.selectChat)
  const renameChat = useChatStore((s) => s.renameChat)
  const deleteChat = useChatStore((s) => s.deleteChat)

  const filtered = useMemo(
    () => getFilteredChats(chats, searchQuery),
    [chats, searchQuery]
  )

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [compact, setCompact] = useState(false)
  const [menu, setMenu] = useState<{ chatId: string; x: number; y: number } | null>(
    null
  )

  useEffect(() => {
    if (!menu) return
    const closeMenu = () => setMenu(null)
    window.addEventListener('click', closeMenu)
    window.addEventListener('keydown', closeMenu)
    return () => {
      window.removeEventListener('click', closeMenu)
      window.removeEventListener('keydown', closeMenu)
    }
  }, [menu])

  return (
    <>
      <aside
        className={clsx(
          'flex h-full shrink-0 flex-col border-r border-zinc-200 bg-[#f2f3f5] transition-all',
          mobileMode
            ? 'w-[82vw] max-w-[280px]'
            : compact
              ? 'w-[68px]'
              : 'w-[82vw] max-w-[280px] md:w-[260px] md:max-w-[260px]'
        )}
      >
        <div className="flex items-center justify-end px-3 pt-3">
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-lg leading-none text-zinc-700 hover:bg-zinc-200"
            aria-label={
              mobileMode
                ? 'Закрыть меню'
                : compact
                  ? 'Развернуть меню'
                  : 'Свернуть меню'
            }
            onClick={() => {
              if (mobileMode) {
                onCloseMobile?.()
                return
              }
              setCompact((v) => !v)
            }}
          >
            {mobileMode ? '×' : compact ? '»' : '«'}
          </button>
        </div>

        {(!compact || mobileMode) && (
          <>
            <div className="px-3 pb-3 pt-1">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по чатам…"
                className="w-full rounded-xl border border-zinc-300 bg-[#eceef3] px-4 py-3 text-sm text-zinc-700 placeholder:text-zinc-500 focus:border-zinc-400 focus:outline-none"
              />
              <button
                type="button"
                className="mt-2 w-full rounded-xl border-0 bg-transparent px-4 py-2.5 text-left text-sm font-medium text-zinc-800 shadow-none outline-none ring-0 hover:bg-[#e4e7ef] focus:outline-none focus:ring-0"
                onClick={() => {
                  createChat()
                  onChatSelected?.()
                }}
              >
                Новый чат
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-2 pb-4">
              {filtered.length === 0 && (
                <p className="px-2 py-4 text-center text-sm text-zinc-500">
                  Ничего не найдено
                </p>
              )}
              <ul className="space-y-1">
                {filtered.map((c) => (
                  <li key={c.id}>
                    <div
                      className={clsx(
                        'flex items-start gap-1 rounded-xl px-3 py-3 text-left transition-colors',
                        currentChatId === c.id ? 'bg-[#e1e4ec]' : 'hover:bg-[#e8ebf2]'
                      )}
                      onContextMenu={(e) => {
                        e.preventDefault()
                        setMenu({ chatId: c.id, x: e.clientX, y: e.clientY })
                      }}
                    >
                      <button
                        type="button"
                        className="min-w-0 flex-1 text-left"
                        onClick={() => {
                          selectChat(c.id)
                          onChatSelected?.()
                        }}
                      >
                        {editingId === c.id ? (
                          <input
                            autoFocus
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onBlur={() => {
                              renameChat(c.id, editTitle)
                              setEditingId(null)
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                renameChat(c.id, editTitle)
                                setEditingId(null)
                              }
                              if (e.key === 'Escape') setEditingId(null)
                            }}
                            className="w-full rounded border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-800"
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <span className="line-clamp-2 text-[14px] font-medium text-zinc-800">
                            {c.title}
                          </span>
                        )}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="border-t border-zinc-200 p-3 pt-2">
              <Button
                variant="ghost"
                className="h-9 w-full justify-start rounded-xl text-zinc-700 hover:bg-zinc-200"
                onClick={onOpenSettings}
              >
                Настройки
              </Button>
              <button
                type="button"
                className="mt-1 h-9 w-full rounded-xl px-3 text-left text-sm text-zinc-700 hover:bg-zinc-200"
              >
                Справка
              </button>
            </div>
          </>
        )}

      </aside>

      {menu && (
        <div
          className="fixed z-50 min-w-[170px] rounded-lg border border-zinc-200 bg-white p-1 shadow-lg"
          style={{ left: menu.x, top: menu.y }}
        >
          <button
            type="button"
            className="flex w-full items-center rounded-md px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100"
            onClick={() => {
              const target = chats.find((chat) => chat.id === menu.chatId)
              if (!target) return
              setEditingId(target.id)
              setEditTitle(target.title)
              setMenu(null)
            }}
          >
            Переименовать
          </button>
          <button
            type="button"
            className="flex w-full items-center rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
            onClick={() => {
              setDeleteId(menu.chatId)
              setMenu(null)
            }}
          >
            Удалить
          </button>
        </div>
      )}

      <Modal
        open={deleteId !== null}
        title="Удалить чат?"
        onClose={() => setDeleteId(null)}
      >
        <p className="text-sm text-zinc-600">
          История этого диалога будет удалена без возможности восстановления.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>
            Отмена
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              if (deleteId) deleteChat(deleteId)
              setDeleteId(null)
            }}
          >
            Удалить
          </Button>
        </div>
      </Modal>
    </>
  )
}
