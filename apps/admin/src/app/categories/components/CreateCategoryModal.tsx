import React, { FormEvent, useMemo, useState } from 'react'
import { createCategory } from '../api/categories.api'
import { useAppSelector } from '../../store/hooks'

type CreateCategoryModalProps = {
  isOpen: boolean
  onClose: () => void
  onCreated: () => void
}

const DEFAULT_EDITOR_TYPE_ID =
  Number(import.meta.env.VITE_CATEGORY_EDITOR_TYPE_ID ?? 0)

export default function CreateCategoryModal({ isOpen, onClose, onCreated }: CreateCategoryModalProps) {
  const categories = useAppSelector((s) =>
    Object.values(s.categories.byId).sort((a, b) => a.name.localeCompare(b.name))
  )

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [editorTypeId, setEditorTypeId] = useState<number>(DEFAULT_EDITOR_TYPE_ID)
  const [parentId, setParentId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = useMemo(
    () => name.trim().length > 0 && [0, 1, 2].includes(editorTypeId) && !submitting,
    [name, editorTypeId, submitting]
  )

  if (!isOpen) return null

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    try {
      setSubmitting(true)
      setError(null)

      await createCategory({
        name: name.trim(),
        slug: slug.trim() || undefined,
        parentId: parentId || null,
        editorTypeId,
      })

      setName('')
      setSlug('')
      setParentId('')
      onCreated()
      onClose()
    } catch (err: any) {
      setError(err?.message ?? 'Failed to create category')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Create category">
      <div className="modal-card">
        <div className="modal-header">
          <h3>Create Category</h3>
          <button type="button" className="ghost-btn" onClick={onClose} aria-label="Close create category modal">
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <label className="field-label" htmlFor="category-name">Category Name *</label>
          <input
            id="category-name"
            className="field-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Business Templates"
            required
          />

          <label className="field-label" htmlFor="category-slug">Slug (optional)</label>
          <input
            id="category-slug"
            className="field-input"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="e.g. business-templates"
          />

          <label className="field-label" htmlFor="category-editor-type">Editor Type *</label>
          <select
            id="category-editor-type"
            className="field-input"
            value={editorTypeId}
            onChange={(e) => setEditorTypeId(Number(e.target.value))}
            required
          >
            <option value={0}>Graphic</option>
            <option value={1}>Document</option>
            <option value={2}>Whiteboard</option>
          </select>

          <label className="field-label" htmlFor="category-parent">Parent Category (optional)</label>
          <select
            id="category-parent"
            className="field-input"
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
          >
            <option value="">No parent (root)</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {error ? <div className="form-error">{error}</div> : null}

          <div className="modal-actions">
            <button type="button" className="ghost-btn" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="primary-btn" disabled={!canSubmit}>
              {submitting ? 'Creating...' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
