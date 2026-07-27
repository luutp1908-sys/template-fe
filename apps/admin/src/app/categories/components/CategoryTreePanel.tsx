import React from 'react'
import { useAppSelector } from '../../store/hooks'
import { selectTreeRootsForEditor } from '../store/selectors'

export default function CategoryTreePanel() {
  // TODO: pass editorTypeId
  const roots = useAppSelector((s) => selectTreeRootsForEditor(s, ''))

  return (
    <div style={{ padding: 8 }}>
      <div style={{ padding: 8, color: '#666' }}>Category Tree</div>
      <ul>
        {roots.length === 0 && <li style={{ color: '#999' }}>No categories loaded</li>}
        {roots.map((r) => (
          <li key={r.id}>{r.name}</li>
        ))}
      </ul>
    </div>
  )
}
