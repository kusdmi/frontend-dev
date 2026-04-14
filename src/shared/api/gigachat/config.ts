const useProxy = import.meta.env.VITE_GIGACHAT_USE_DEV_PROXY === 'true'

export function getApiBaseUrl(): string {
  if (useProxy && import.meta.env.DEV) {
    return '/__gigachat_api'
  }
  return (
    import.meta.env.VITE_GIGACHAT_API_BASE ||
    'https://gigachat.devices.sberbank.ru/api/v1'
  )
}

export function getOAuthUrl(): string {
  if (useProxy && import.meta.env.DEV) {
    return '/__gigachat_oauth'
  }
  return (
    import.meta.env.VITE_GIGACHAT_OAUTH_URL ||
    'https://ngw.devices.sberbank.ru:9443/api/v2/oauth'
  )
}

export function getCredentials(): { id: string; secret: string; scope: string } {
  const secret =
    import.meta.env.VITE_GIGACHAT_CLIENT_SECRET ||
    import.meta.env.VITE_GIGACHAT_AUTHORIZATION_KEY ||
    ''
  return {
    id: import.meta.env.VITE_GIGACHAT_CLIENT_ID || '',
    secret,
    scope: import.meta.env.VITE_GIGACHAT_SCOPE || 'GIGACHAT_API_PERS',
  }
}
