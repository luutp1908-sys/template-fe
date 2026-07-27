declare module '*.css'
declare module '*.png'
declare module '*.jpg'
declare module '*.jpeg'
declare module '*.svg'

interface ImportMetaEnv {
  readonly VITE_API_BASE?: string
  readonly VITE_API_ORIGIN?: string
  readonly MODE?: string
  readonly DEV?: boolean
  readonly PROD?: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}