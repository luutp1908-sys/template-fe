import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'

export type EditorBridgeUser = {
  id: string
  email: string
  displayName: string | null
  roles?: string[]
  permissions?: string[]
}

export type EditorAuthBridge = {
  user: EditorBridgeUser | null
  accessToken: string | null
  isLoading?: boolean
}

export type EditorCallbacksBridge = {
  onRequestLogin?: () => void
  onLogout?: () => Promise<void> | void
}

export type EditorHostBridgeValue = {
  isEmbedded: boolean
  auth: EditorAuthBridge | null
  callbacks: EditorCallbacksBridge | null
}

const EditorHostBridgeContext = createContext<EditorHostBridgeValue | null>(null)

export function EditorHostBridgeProvider({
  value,
  children,
}: {
  value: EditorHostBridgeValue
  children: ReactNode
}) {
  return <EditorHostBridgeContext.Provider value={value}>{children}</EditorHostBridgeContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useEditorHostBridge() {
  return useContext(EditorHostBridgeContext)
}
