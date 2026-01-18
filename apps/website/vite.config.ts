import { defineConfig, loadEnv } from 'vite'
import solid from 'vite-plugin-solid'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const base = env.VITE_BASE_PATH || (mode === 'production' ? './' : '/')

  return {
    base,
    plugins: [
      solid(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3001,
      host: '0.0.0.0',
    },
    build: {
      target: 'esnext',
    },
  }
})
