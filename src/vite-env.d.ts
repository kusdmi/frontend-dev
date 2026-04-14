import 'vite/client'

interface ImportMetaEnv {
  readonly VITE_GIGACHAT_CLIENT_ID: string
  readonly VITE_GIGACHAT_CLIENT_SECRET: string
  readonly VITE_GIGACHAT_SCOPE: string
  readonly VITE_GIGACHAT_API_BASE: string
  readonly VITE_GIGACHAT_OAUTH_URL: string
  readonly VITE_GIGACHAT_USE_DEV_PROXY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
