import { getApiBaseUrl } from './config'
import { parseGigaChatSseStream } from './stream'
import type { ChatCompletionRequest } from './types'

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
