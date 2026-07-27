import React from 'react'
import CategoryTree from './CategoryTree'

export default function CategoryTreePanel() {
  return (
    <div style={{ padding: 8 }}>
      <div style={{ padding: 8, color: '#666' }}>Category Tree</div>
      <CategoryTree />
    </div>
  )
}
