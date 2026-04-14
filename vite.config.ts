import path from 'node:path'
import { fileURLToPath } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const oauthTarget =
    env.VITE_GIGACHAT_OAUTH_TARGET || 'https://ngw.devices.sberbank.ru:9443'
  const apiTarget =
    env.VITE_GIGACHAT_API_TARGET || 'https://gigachat.devices.sberbank.ru'

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        '/__gigachat_oauth': {
          target: oauthTarget,
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/__gigachat_oauth/, '/api/v2/oauth'),
          secure: false,
        },
        '/__gigachat_api': {
          target: apiTarget,
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/__gigachat_api/, '/api/v1'),
          secure: false,
        },
      },
    },
  }
})
