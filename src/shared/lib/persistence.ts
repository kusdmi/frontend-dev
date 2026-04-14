import { get, set } from 'idb-keyval'

import type { ChatSession, ChatSettings } from '@/entities/chat/types'

const STORAGE_KEY = 'gigachat-app-state-v1'

export interface PersistedSnapshot {
  chats: ChatSession[]
  currentChatId: string | null
  settings: ChatSettings
}

export async function loadSnapshot(): Promise<PersistedSnapshot | null> {
  try {
    const raw = await get<string>(STORAGE_KEY)
    if (!raw || typeof raw !== 'string') return null
    return JSON.parse(raw) as PersistedSnapshot
  } catch {
    return null
  }
}

export async function saveSnapshot(snapshot: PersistedSnapshot): Promise<void> {
  await set(STORAGE_KEY, JSON.stringify(snapshot))
}
