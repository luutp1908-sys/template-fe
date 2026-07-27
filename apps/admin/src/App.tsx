import React, { useState } from 'react'
import { CategoryManagementPage, TemplateManagementPage } from './app/categories/components'

export default function App() {
  const [activeView, setActiveView] = useState<'categories' | 'templates'>('categories')

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
