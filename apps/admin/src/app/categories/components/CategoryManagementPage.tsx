import React, { useCallback, useEffect, useRef, useState } from 'react'
import Toolbar from './Toolbar'
import CategoryTreePanel from './CategoryTreePanel'
import CategoryDetailPanel from './CategoryDetailPanel'
import { fetchCategories } from '../api/categories.api'
import { useAppDispatch } from '../../store/hooks'
import { setCategories, setError } from '../store/categories.slice'

const DEFAULT_EDITOR_TYPE_ID = import.meta.env.VITE_CATEGORY_EDITOR_TYPE_ID ?? '22222222-2222-2222-2222-222222222222'

export default function CategoryManagementPage() {
  const dispatch = useAppDispatch()
  const [searchValue, setSearchValue] = useState('')
  const searchDebounceRef = useRef<number | null>(null)

  const loadCategories = useCallback(async (search: string) => {
    try {
      const rows = await fetchCategories({
        editorTypeId: DEFAULT_EDITOR_TYPE_ID,
        search: search || undefined,
      })
      dispatch(setCategories(rows))
      dispatch(setError(null))
    } catch (err: any) {
      dispatch(setError(err?.message ?? 'Failed to load categories'))
    }
  }, [dispatch])

  useEffect(() => {
    if (searchDebounceRef.current) {
      window.clearTimeout(searchDebounceRef.current)
    }

    searchDebounceRef.current = window.setTimeout(() => {
      void loadCategories(searchValue)
    }, 250)

    return () => {
      if (searchDebounceRef.current) {
        window.clearTimeout(searchDebounceRef.current)
      }
    }
  }, [loadCategories, searchValue])

  return (
    <div className="category-page-layout">
      <div className="category-left-panel">
        <Toolbar
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          onCategoryCreated={() => {
            void loadCategories(searchValue)
          }}
        />
        <CategoryTreePanel />
      </div>
      <div className="category-right-panel">
        <CategoryDetailPanel />
      </div>
    </div>
  )
}
