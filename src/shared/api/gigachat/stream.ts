export async function* parseGigaChatSseStream(
  body: ReadableStream<Uint8Array> | null,
  signal?: AbortSignal
): AsyncGenerator<string, void, undefined> {
  if (!body) return

  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      if (signal?.aborted) {
        await reader.cancel()
        return
      }
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const parts = buffer.split(/\r?\n/)
      buffer = parts.pop() ?? ''

      for (const line of parts) {
        const trimmed = line.trim()
        if (!trimmed.startsWith('data:')) continue
        const payload = trimmed.slice(5).trim()
        if (payload === '[DONE]') return

        try {
          const json = JSON.parse(payload) as {
            choices?: Array<{ delta?: { content?: string; role?: string } }>
          }
          const chunk = json.choices?.[0]?.delta?.content
          if (typeof chunk === 'string' && chunk.length > 0) {
            yield chunk
          }
        } catch {}
      }
    }
  } finally {
    reader.releaseLock()
  }
}
