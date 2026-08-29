import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from '../App'
import {
  EditorHostBridgeProvider,
  type EditorAuthBridge,
  type EditorCallbacksBridge,
} from './EditorHostBridge'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export type EditorRemoteEntryProps = {
  isEmbedded?: boolean
  auth?: EditorAuthBridge | null
  callbacks?: EditorCallbacksBridge | null
}

export default function EditorRemoteEntry({
  isEmbedded = true,
  auth = null,
  callbacks = null,
}: EditorRemoteEntryProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <EditorHostBridgeProvider value={{ isEmbedded, auth, callbacks }}>
        <App />
      </EditorHostBridgeProvider>
    </QueryClientProvider>
  )
}
