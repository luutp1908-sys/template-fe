declare module '*.css'
declare module '*.png'
declare module '*.jpg'
declare module '*.jpeg'
declare module '*.svg'

interface ImportMetaEnv {
  readonly VITE_BE_API_BASE?: string
  readonly VITE_CATEGORY_WORKSPACE_ID?: string
  readonly VITE_CATEGORY_EDITOR_TYPE_ID?: string
  readonly MODE?: string
  readonly DEV?: boolean
  readonly PROD?: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
