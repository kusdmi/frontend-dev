import { type ReactNode, useEffect } from 'react'

import { useChatStore } from '@/entities/chat/store'

interface SettingsPanelProps {
  open: boolean
  onClose: () => void
}

export function SettingsPanel({ open, onClose }: SettingsPanelProps): ReactNode {
  const theme = useChatStore((s) => s.settings.theme)
  const setSettings = useChatStore((s) => s.setSettings)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"
        aria-label="Закрыть настройки"
        onClick={onClose}
      />
      <div className="relative z-10 w-[min(92vw,700px)] overflow-hidden rounded-2xl border border-zinc-200 bg-[#f7f7f8] shadow-2xl">
        <div className="flex h-[320px]">
          <div className="w-[220px] shrink-0 border-r border-zinc-200 bg-[#f5f5f6] p-3">
            <button
              type="button"
              className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-md text-lg text-zinc-700 hover:bg-zinc-200"
              onClick={onClose}
              aria-label="Закрыть настройки"
            >
              ×
            </button>
            <div className="space-y-1">
              <button
                type="button"
                className="flex h-10 w-full items-center rounded-lg bg-zinc-200 px-3 text-left text-sm text-zinc-900"
              >
                ⚙ Общее
              </button>
            </div>
          </div>

          <div className="min-w-0 flex-1 overflow-y-auto bg-[#f7f7f8]">
            <div className="border-b border-zinc-200 px-5 py-3 text-[16px] font-medium text-zinc-900">
              Общее
            </div>
            <div className="space-y-0">
              <div className="flex items-center justify-between gap-4 border-b border-zinc-200 px-5 py-4">
                <span className="text-[13px] text-zinc-900">Внешний вид</span>
                <label className="shrink-0">
                  <span className="sr-only">Выбрать тему</span>
                  <select
                    value={theme}
                    onChange={(e) =>
                      setSettings({
                        theme: e.target.value as 'system' | 'light' | 'dark',
                      })
                    }
                    className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-[13px] text-zinc-900 outline-none"
                  >
                    <option value="system">Системная</option>
                    <option value="light">Светлая</option>
                    <option value="dark">Тёмная</option>
                  </select>
                </label>
              </div>
              <div className="flex items-center justify-between gap-4 border-b border-zinc-200 px-5 py-4">
                <span className="text-[13px] text-zinc-900">Язык</span>
                <span className="max-w-[65%] truncate text-right text-[13px] text-zinc-900">
                  Автоматически определять ▾
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
