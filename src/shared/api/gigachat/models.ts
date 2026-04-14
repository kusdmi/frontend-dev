import { getApiBaseUrl } from './config'
import type { ModelsResponse } from './types'

export async function fetchModels(accessToken: string): Promise<string[]> {
  const base = getApiBaseUrl()
  const res = await fetch(`${base}/models`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`models ${res.status}: ${text}`)
  }

  const data = (await res.json()) as ModelsResponse
  const ids = (data.data ?? []).map((m) => m.id).filter(Boolean)
  return ids.length > 0 ? ids : ['GigaChat']
}
