import type { ChatContent } from '@/shared/api/gigachat'

export interface MessageImage {
  dataUrl: string
  name: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt: number
  images?: MessageImage[]
}

export interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  updatedAt: number
}

export interface ChatSettings {
  model: string
  theme: 'system' | 'light' | 'dark'
  temperature: number
  topP: number
  maxTokens: number
  repetitionPenalty: number
  systemPrompt: string
}

export function buildUserContent(
  text: string,
  images?: MessageImage[]
): ChatContent {
  if (!images?.length) return text.trim() || ' '
  const parts: ChatContent = []
  parts.push({ type: 'text', text: text.trim() || ' ' })
  for (const img of images) {
    parts.push({
      type: 'image_url',
      image_url: { url: img.dataUrl },
    })
  }
  return parts
}
