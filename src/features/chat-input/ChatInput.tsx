import {
  type FormEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import type { MessageImage } from '@/entities/chat/types'
import { useChatStore } from '@/entities/chat/store'
import { Button } from '@/shared/ui/Button'

function readFilesAsImages(files: FileList | null): Promise<MessageImage[]> {
  if (!files?.length) return Promise.resolve([])
  const list = Array.from(files).filter((f) => f.type.startsWith('image/'))
  return Promise.all(
    list.map(
      (file) =>
        new Promise<MessageImage>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => {
            resolve({
              name: file.name,
              dataUrl: String(reader.result),
            })
          }
          reader.onerror = () => reject(reader.error)
          reader.readAsDataURL(file)
        })
    )
  )
}

export function ChatInput(): ReactNode {
  const [value, setValue] = useState('')
  const [images, setImages] = useState<MessageImage[]>([])
  const fileRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isStreaming = useChatStore((s) => s.isStreaming)
  const sendMessage = useChatStore((s) => s.sendMessage)
  const abortGeneration = useChatStore((s) => s.abortGeneration)

  const submit = useCallback(async () => {
    const t = value.trim()
    if ((!t && images.length === 0) || isStreaming) return
    setValue('')
    const imgs = [...images]
    setImages([])
    await sendMessage(t || ' ', imgs.length ? imgs : undefined)
  }, [value, images, isStreaming, sendMessage])

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    void submit()
  }

  const onPickFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const imgs = await readFilesAsImages(e.target.files)
    setImages((prev) => [...prev, ...imgs])
    e.target.value = ''
  }

  useEffect(() => {
    const onPrefillInput = (event: Event) => {
      const customEvent = event as CustomEvent<{ text?: string }>
      const text = customEvent.detail?.text ?? ''
      setValue(text)
      requestAnimationFrame(() => {
        textareaRef.current?.focus()
        const len = textareaRef.current?.value.length ?? 0
        textareaRef.current?.setSelectionRange(len, len)
      })
    }

    window.addEventListener('chat:prefill-input', onPrefillInput as EventListener)
    return () =>
      window.removeEventListener(
        'chat:prefill-input',
        onPrefillInput as EventListener
      )
  }, [])

  return (
    <div className="shrink-0 !bg-transparent px-4 pb-4 pt-2">
      {images.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {images.map((img) => (
            <div
              key={img.dataUrl.slice(0, 48)}
              className="relative inline-block"
            >
              <img
                src={img.dataUrl}
                alt=""
                className="h-16 w-16 rounded-lg object-cover ring-1 ring-zinc-300"
              />
              <button
                type="button"
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-300 text-xs text-zinc-700 hover:bg-zinc-400"
                onClick={() =>
                  setImages((prev) => prev.filter((x) => x !== img))
                }
                aria-label="Удалить изображение"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      <form
        onSubmit={onSubmit}
        className="mx-auto flex w-full max-w-[864px] items-center gap-3 rounded-[30px] border border-zinc-200 !bg-white px-4 py-3 shadow-sm"
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={onPickFiles}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={isStreaming}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[34px] leading-none text-zinc-700 hover:bg-zinc-100 disabled:opacity-40"
          aria-label="Прикрепить изображение"
        >
          +
        </button>

        <div className="flex min-w-0 flex-1 items-center !bg-white">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                void submit()
              }
            }}
            placeholder="Спросите GigaGPT"
            rows={1}
            disabled={isStreaming}
            className="h-8 max-h-32 min-h-0 w-full resize-none border-0 !bg-white px-0 py-0 text-[14px] leading-8 text-zinc-900 placeholder:text-zinc-400 focus:outline-none disabled:opacity-50"
          />
        </div>
        {isStreaming ? (
          <Button
            type="button"
            variant="danger"
            className="h-11 shrink-0 rounded-full px-4"
            onClick={() => abortGeneration()}
          >
            Остановить
          </Button>
        ) : (
          <button
            type="submit"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-black bg-black p-0 text-[24px] text-white hover:bg-black disabled:border-black disabled:bg-black disabled:text-white"
            disabled={!value.trim() && images.length === 0}
            aria-label="Отправить сообщение"
          >
            ↑
          </button>
        )}
      </form>
    </div>
  )
}
