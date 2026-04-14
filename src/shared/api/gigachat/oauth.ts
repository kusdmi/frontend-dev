import { getCredentials, getOAuthUrl } from './config'
import type { OAuthTokenResponse } from './types'

let cached: { token: string; expiresAt: number } | null = null

function basicAuthHeader(id: string, secret: string): string {
  try {
    const decoded = atob(secret)
    if (decoded.includes(':')) {
      return `Basic ${secret}`
    }
  } catch {}
  const raw = `${id}:${secret}`
  const b64 = btoa(raw)
  return `Basic ${b64}`
}

export async function getAccessToken(): Promise<string> {
  const { id, secret, scope } = getCredentials()
  if (!id || !secret) {
    throw new Error(
      'Укажите VITE_GIGACHAT_CLIENT_ID и VITE_GIGACHAT_CLIENT_SECRET в .env'
    )
  }

  const now = Date.now() / 1000
  if (cached && cached.expiresAt - 60 > now) {
    return cached.token
  }

  const url = getOAuthUrl()
  const body = new URLSearchParams({
    scope,
    grant_type: 'client_credentials',
  })

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: basicAuthHeader(id, secret),
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
      'RqUID': crypto.randomUUID(),
    },
    body: body.toString(),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`OAuth ${res.status}: ${text}`)
  }

  const data = (await res.json()) as OAuthTokenResponse
  if (!data.access_token) {
    throw new Error('OAuth: нет access_token в ответе')
  }

  const expiresIn = data.expires_in ?? 1800
  cached = {
    token: data.access_token,
    expiresAt: now + expiresIn,
  }
  return data.access_token
}

export function clearTokenCache(): void {
  cached = null
}
