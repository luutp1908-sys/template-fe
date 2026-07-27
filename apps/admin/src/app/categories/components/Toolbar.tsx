import React from 'react'
import CreateCategoryModal from './CreateCategoryModal'

type ToolbarProps = {
  searchValue: string
  onSearchChange: (value: string) => void
  onCategoryCreated: () => void
}

export default function Toolbar({ searchValue, onSearchChange, onCategoryCreated }: ToolbarProps) {
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)

  return (
    <>
      <div className="category-toolbar">
        <input
          aria-label="Search categories"
          placeholder="Search categories"
          className="category-search-input"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <button className="primary-btn" type="button" onClick={() => setIsCreateOpen(true)}>
          Create Category
        </button>
      </div>

      <CreateCategoryModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={onCategoryCreated}
      />
    </>
  )
}
