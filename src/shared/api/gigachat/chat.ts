import { getApiBaseUrl } from './config'
import { parseGigaChatSseStream } from './stream'
import type { ChatCompletionRequest } from './types'

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
}

export async function fetchChatCompletionStream(
  accessToken: string,
  request: ChatCompletionRequest,
  signal?: AbortSignal
): Promise<ReadableStream<Uint8Array>> {
  const base = getApiBaseUrl()
  const res = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ ...request, stream: true }),
    signal,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`chat/completions ${res.status}: ${text}`)
  }

  if (!res.body) {
    throw new Error('Пустой body ответа')
  }

  return res.body
}

export async function* streamChatCompletionTokens(
  accessToken: string,
  request: ChatCompletionRequest,
  signal?: AbortSignal
): AsyncGenerator<string, void, undefined> {
  const body = await fetchChatCompletionStream(
    accessToken,
    { ...request, stream: true },
    signal
  )
  yield* parseGigaChatSseStream(body, signal)
}

function extractResponseText(data: ChatCompletionResponse): string {
  return data.choices?.[0]?.message?.content ?? ''
}

export async function fetchChatCompletion(
  accessToken: string,
  request: ChatCompletionRequest,
  signal?: AbortSignal
): Promise<string> {
  const base = getApiBaseUrl()
  const res = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ ...request, stream: false }),
    signal,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`chat/completions ${res.status}: ${text}`)
  }

  const data = (await res.json()) as ChatCompletionResponse
  return extractResponseText(data)
}

export async function* streamChatCompletionTokensWithFallback(
  accessToken: string,
  request: ChatCompletionRequest,
  signal?: AbortSignal
): AsyncGenerator<string, void, undefined> {
  try {
    yield* streamChatCompletionTokens(accessToken, request, signal)
    return
  } catch (e) {
    const aborted =
      signal?.aborted ||
      (e instanceof DOMException && e.name === 'AbortError') ||
      (e instanceof Error && e.name === 'AbortError')
    if (aborted) throw e
  }

  const text = await fetchChatCompletion(accessToken, request, signal)
  if (text) {
    yield text
  }
}
