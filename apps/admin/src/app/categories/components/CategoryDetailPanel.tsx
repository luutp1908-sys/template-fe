import React from 'react'
import { useAppSelector } from '../../store/hooks'
import { selectSelectedId, selectCategoryById } from '../store/selectors'

export default function CategoryDetailPanel() {
  const selectedId = useAppSelector(selectSelectedId as any)
  const category = useAppSelector((s) => selectCategoryById(s, selectedId as any))

  if (!category) {
    return <div style={{ padding: 16 }}>Select a category to see details.</div>
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>{category.name}</h2>
      <p>{category.description}</p>
      <div>Templates: {category.templateCount}</div>
    </div>
  )
}
