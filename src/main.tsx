import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import './index.css'
import App from './App'
import { initAuth, initAuthClient } from './shared/auth/tokenStore'
import * as apiClient from './shared/api/client'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,       // 1 min before refetch
      retry: 1,
      refetchOnWindowFocus: false, // avoid surprise refetches
    },
  },
})

async function boot() {
  try {
    // attempt silent auth refresh before rendering so components have access token
    await initAuth()
    // wire tokenStore -> api client so requests can read access token immediately
    try {
      initAuthClient(apiClient)
    } catch {
      // ignore
    }
  } catch {
    // ignore
  }

  createRoot(document.getElementById('root') as HTMLElement).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </StrictMode>,
  )
}

void boot()
