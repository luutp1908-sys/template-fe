import React, { useEffect, useState } from 'react'
import { CategoryManagementPage, TemplateManagementPage } from './app/categories/components'
import Login from './app/auth/Login'
import { fetchCurrentUser } from './app/auth/useAuth'

export default function App() {
  const [activeView, setActiveView] = useState<'categories' | 'templates'>('categories')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // ensure backend base defaults to localhost:4000 when not provided via env
    // fetchCurrentUser uses VITE_BE_API_BASE fallback
    fetchCurrentUser()
      .then((user) => {
        if (!user || !user.roles || !user.roles.includes('admin')) {
          if (window.location.pathname !== '/login') window.location.pathname = '/login'
          return
        }

        // already authenticated admin: leave login page
        if (window.location.pathname === '/login') {
          window.location.pathname = '/'
        }
      })
      .catch(() => {
        if (window.location.pathname !== '/login') window.location.pathname = '/login'
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="admin-shell">Checking authentication...</div>
  }

  // If path is /login render the login page
  if (window.location.pathname === '/login') {
    return <Login />
  }

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div className="admin-brand">Admin Portal</div>
        <div className="admin-header-actions" role="tablist" aria-label="Admin sections">
          <button
            type="button"
            role="tab"
            aria-selected={activeView === 'categories'}
            className={`header-tab-btn ${activeView === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveView('categories')}
          >
            Categories
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeView === 'templates'}
            className={`header-tab-btn ${activeView === 'templates' ? 'active' : ''}`}
            onClick={() => setActiveView('templates')}
          >
            Templates
          </button>
        </div>
      </header>

      <main className="admin-main" role="tabpanel" aria-live="polite">
        {activeView === 'categories' ? <CategoryManagementPage /> : <TemplateManagementPage />}
      </main>
    </div>
  )
}
