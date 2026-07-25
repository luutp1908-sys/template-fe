import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { initAuth } from './shared/auth/tokenStore'

async function boot() {
  try {
    // attempt silent auth refresh before rendering so components have access token
    await initAuth()
  } catch {
    // ignore
  }

  createRoot(document.getElementById('root') as HTMLElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

void boot()
