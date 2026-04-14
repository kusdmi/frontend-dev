import { nanoid } from 'nanoid'
import { create } from 'zustand'

import type { ChatMessage, ChatSession, ChatSettings } from './types'
import { buildUserContent } from './types'
import { titleFromFirstMessage } from '@/shared/lib/titleFromMessage'
import {
  getAccessToken,
  streamChatCompletionTokens,
} from '@/shared/api/gigachat'
import type { ChatMessagePayload } from '@/shared/api/gigachat'

const defaultSettings: ChatSettings = {
  model: 'GigaChat',
  theme: 'system',
  temperature: 1,
  topP: 0.9,
  maxTokens: 2048,
  repetitionPenalty: 1.1,
  systemPrompt: 'Ты полезный ассистент. Отвечай ясно и по делу.',
}

function messageToPayload(m: ChatMessage): ChatMessagePayload | null {
  if (m.role === 'user') {
    return {
      role: 'user',
      content: buildUserContent(m.content, m.images),
    }
  }
  if (m.role === 'assistant') {
    if (!m.content.trim()) return null
    return { role: 'assistant', content: m.content }
  }
  if (m.role === 'system') {
    return { role: 'system', content: m.content }
  }
  return null
}

function buildCompletionMessages(
  systemPrompt: string,
  history: ChatMessage[]
): ChatMessagePayload[] {
  const out: ChatMessagePayload[] = []
  if (systemPrompt.trim()) {
    out.push({ role: 'system', content: systemPrompt.trim() })
  }
  for (const m of history) {
    const p = messageToPayload(m)
    if (p) out.push(p)
  }
  return out
}

interface ChatStoreState {
  chats: ChatSession[]
  currentChatId: string | null
  settings: ChatSettings
  hydrated: boolean
  sidebarOpen: boolean
  searchQuery: string

  isStreaming: boolean
  lastError: string | null
  abortController: AbortController | null

  setHydrated: (v: boolean) => void
  setSidebarOpen: (v: boolean) => void
  setSearchQuery: (q: string) => void
  setSettings: (partial: Partial<ChatSettings>) => void

  createChat: () => string
  selectChat: (id: string | null) => void
  renameChat: (id: string, title: string) => void
  deleteChat: (id: string) => void
  updateMessageContent: (chatId: string, messageId: string, content: string) => void

  sendMessage: (text: string, images?: ChatMessage['images']) => Promise<void>
  abortGeneration: () => void
}

export const useChatStore = create<ChatStoreState>((set, get) => ({
  chats: [],
  currentChatId: null,
  settings: defaultSettings,
  hydrated: false,
  sidebarOpen: true,
  searchQuery: '',

  isStreaming: false,
  lastError: null,
  abortController: null,

  setHydrated: (v) => set({ hydrated: v }),
  setSidebarOpen: (v) => set({ sidebarOpen: v }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setSettings: (partial) =>
    set((s) => ({ settings: { ...s.settings, ...partial } })),

  createChat: () => {
    const id = nanoid()
    const session: ChatSession = {
      id,
      title: 'Новый чат',
      messages: [],
      updatedAt: Date.now(),
    }
    set((s) => ({
      chats: [session, ...s.chats],
      currentChatId: id,
    }))
    return id
  },

  selectChat: (id) => set({ currentChatId: id }),

  renameChat: (id, title) => {
    const t = title.trim() || 'Без названия'
    set((s) => ({
      chats: s.chats.map((c) =>
        c.id === id ? { ...c, title: t, updatedAt: Date.now() } : c
      ),
    }))
  },

  deleteChat: (id) => {
    set((s) => {
      const chats = s.chats.filter((c) => c.id !== id)
      let currentChatId = s.currentChatId
      if (currentChatId === id) {
        currentChatId = chats[0]?.id ?? null
      }
      return { chats, currentChatId }
    })
  },

  updateMessageContent: (chatId, messageId, content) => {
    set((s) => ({
      chats: s.chats.map((c) => {
        if (c.id !== chatId) return c
        return {
          ...c,
          updatedAt: Date.now(),
          messages: c.messages.map((m) =>
            m.id === messageId ? { ...m, content } : m
          ),
        }
      }),
    }))
  },

  sendMessage: async (text, images) => {
    const state = get()
    let chatId = state.currentChatId
    if (!chatId) {
      chatId = get().createChat()
    }

    const userMsg: ChatMessage = {
      id: nanoid(),
      role: 'user',
      content: text,
      createdAt: Date.now(),
      images: images?.length ? images : undefined,
    }

    const assistantId = nanoid()

    set((s) => {
      const chats = s.chats.map((c) => {
        if (c.id !== chatId) return c
        const isFirstUser =
          c.messages.filter((m) => m.role === 'user').length === 0
        const title =
          isFirstUser && (c.title === 'Новый чат' || !c.title.trim())
            ? titleFromFirstMessage(text)
            : c.title
        return {
          ...c,
          title,
          updatedAt: Date.now(),
          messages: [
            ...c.messages,
            userMsg,
            {
              id: assistantId,
              role: 'assistant' as const,
              content: '',
              createdAt: Date.now(),
            },
          ],
        }
      })
      return {
        chats,
        isStreaming: true,
        lastError: null,
        abortController: new AbortController(),
      }
    })

    const ac = get().abortController
    if (!ac) return

    try {
      const token = await getAccessToken()
      const { settings } = get()
      const chat = get().chats.find((c) => c.id === chatId)
      if (!chat) return

      const historyForApi = chat.messages.filter(
        (m) => !(m.role === 'assistant' && m.id === assistantId)
      )

      const messagesPayload = buildCompletionMessages(
        settings.systemPrompt,
        historyForApi
      )

      let acc = ''
      for await (const chunk of streamChatCompletionTokens(
        token,
        {
          model: settings.model,
          messages: messagesPayload,
          temperature: settings.temperature,
          top_p: settings.topP,
          max_tokens: settings.maxTokens,
          repetition_penalty: settings.repetitionPenalty,
          stream: true,
        },
        ac.signal
      )) {
        acc += chunk
        get().updateMessageContent(chatId!, assistantId, acc)
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      const aborted =
        ac.signal.aborted ||
        (e instanceof DOMException && e.name === 'AbortError') ||
        (e instanceof Error && e.name === 'AbortError')

      if (aborted) {
        const cur =
          get()
            .chats.find((c) => c.id === chatId)
            ?.messages.find((m) => m.id === assistantId)?.content ?? ''
        const suffix = '\n\n_[Генерация остановлена]_'
        get().updateMessageContent(
          chatId!,
          assistantId,
          cur.endsWith('_[Генерация остановлена]_') ? cur : cur + suffix
        )
      } else {
        set({ lastError: msg })
        get().updateMessageContent(
          chatId!,
          assistantId,
          `**Ошибка:** ${msg}`
        )
      }
    } finally {
      set({
        isStreaming: false,
        abortController: null,
      })
    }
  },

  abortGeneration: () => {
    const { abortController } = get()
    abortController?.abort()
  },
}))

export function getFilteredChats(
  chats: ChatSession[],
  query: string
): ChatSession[] {
  const q = query.trim().toLowerCase()
  if (!q) return chats
  return chats.filter((c) => {
    if (c.title.toLowerCase().includes(q)) return true
    return c.messages.some((m) => m.content.toLowerCase().includes(q))
  })
}
