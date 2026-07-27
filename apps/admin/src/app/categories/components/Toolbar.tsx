import React from 'react'

export default function Toolbar() {
  return (
    <div style={{ padding: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
      <input aria-label="Search categories" placeholder="Search categories" style={{ flex: 1, padding: 8 }} />
      <button style={{ padding: '8px 12px' }}>Create Category</button>
    </div>
  )
}
