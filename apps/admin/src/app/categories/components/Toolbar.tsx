import React from 'react'
import { createCategory } from '../api/categories.api'

const DEFAULT_EDITOR_TYPE_ID = import.meta.env.VITE_CATEGORY_EDITOR_TYPE_ID ?? '22222222-2222-2222-2222-222222222222'

type ToolbarProps = {
  searchValue: string
  onSearchChange: (value: string) => void
  onCategoryCreated: () => void
}

export default function Toolbar({ searchValue, onSearchChange, onCategoryCreated }: ToolbarProps) {
  async function handleCreateCategory() {
    const name = window.prompt('Category name')?.trim()

    if (!name) return

    await createCategory({
      name,
      editorTypeId: DEFAULT_EDITOR_TYPE_ID,
    })

    onCategoryCreated()
  }

  return (
    <div className="category-toolbar">
      <input
        aria-label="Search categories"
        placeholder="Search categories"
        className="category-search-input"
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <button className="primary-btn" type="button" onClick={handleCreateCategory}>
        Create Category
      </button>
    </div>
  )
}
