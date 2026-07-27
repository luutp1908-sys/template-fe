import React from 'react'
import Toolbar from './Toolbar'
import CategoryTreePanel from './CategoryTreePanel'
import CategoryDetailPanel from './CategoryDetailPanel'

export default function CategoryManagementPage() {
  return (
    <div style={{ display: 'flex', height: '100vh', gap: 16, padding: 16 }}>
      <div style={{ width: 360, borderRight: '1px solid #e6e6e6', overflow: 'auto' }}>
        <Toolbar />
        <CategoryTreePanel />
      </div>
      <div style={{ flex: 1, overflow: 'auto', paddingLeft: 16 }}>
        <CategoryDetailPanel />
      </div>
    </div>
  )
}
