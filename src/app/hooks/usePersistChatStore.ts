import { useEffect } from 'react'

import { useChatStore } from '@/entities/chat/store'
import { debounce } from '@/shared/lib/debounce'
import { loadSnapshot, saveSnapshot } from '@/shared/lib/persistence'

export function usePersistChatStore(): void {
  useEffect(() => {
    let cancelled = false
    void (async () => {
      const snap = await loadSnapshot()
      if (cancelled) return
      if (snap) {
        const current = useChatStore.getState()
        useChatStore.setState({
          chats: snap.chats,
          currentChatId: snap.currentChatId,
          settings: { ...current.settings, ...snap.settings },
        })
      }
      useChatStore.getState().setHydrated(true)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const save = debounce(() => {
      const s = useChatStore.getState()
      if (!s.hydrated) return
      void saveSnapshot({
        chats: s.chats,
        currentChatId: s.currentChatId,
        settings: s.settings,
      })
    }, 400)

    return useChatStore.subscribe(save)
  }, [])
}
