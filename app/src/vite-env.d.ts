/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_VOICE_WORKER_URL: string
  readonly VITE_AGORA_APP_ID: string
  readonly VITE_OPENROUTER_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
