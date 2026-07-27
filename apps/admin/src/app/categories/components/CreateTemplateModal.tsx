import React, { FormEvent, useEffect, useMemo, useState } from 'react'
import { CategoryDTO } from '../api/dtos'
import { fetchCategories } from '../api/categories.api'
import { createTemplate } from '../api/templates.api'

type CreateTemplateModalProps = {
  isOpen: boolean
  onClose: () => void
  onCreated: (createdTitle: string) => void
}

const editorTypeName: Record<number, string> = {
  0: 'Graphic',
  1: 'Document',
  2: 'Whiteboard',
}

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export default function CreateTemplateModal({ isOpen, onClose, onCreated }: CreateTemplateModalProps) {
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [categories, setCategories] = useState<CategoryDTO[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return

    let cancelled = false
    setLoadingCategories(true)
    setError(null)

    void fetchCategories({})
      .then((rows) => {
        if (cancelled) return
        const sorted = [...rows].sort((a, b) => a.name.localeCompare(b.name))
        setCategories(sorted)
      })
      .catch((err: any) => {
        if (cancelled) return
        setError(err?.message ?? 'Failed to load categories')
      })
      .finally(() => {
        if (cancelled) return
        setLoadingCategories(false)
      })

    return () => {
      cancelled = true
    }
  }, [isOpen])

  const canSubmit = useMemo(() => {
    return title.trim().length > 0 && categoryId.length > 0 && !loadingCategories && !submitting
  }, [title, categoryId, loadingCategories, submitting])

  if (!isOpen) return null

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    const selectedCategory = categories.find((item) => item.id === categoryId)
    if (!selectedCategory) {
      setError('Please choose a valid category')
      return
    }

    const normalizedSlug = toSlug(slug.trim() || title.trim())
    if (!normalizedSlug) {
      setError('Slug cannot be empty after normalization')
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      await createTemplate({
        title: title.trim(),
        slug: normalizedSlug,
        categoryId: selectedCategory.id,
        editorTypeId: selectedCategory.editorTypeId,
      })

      setTitle('')
      setSlug('')
      setCategoryId('')
      onCreated(title.trim())
      onClose()
    } catch (err: any) {
      setError(err?.message ?? 'Failed to create template')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Create template">
      <div className="modal-card">
        <div className="modal-header">
          <h3>Create Template</h3>
          <button type="button" className="ghost-btn" onClick={onClose} aria-label="Close create template modal">
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <label className="field-label" htmlFor="template-title">Template Title *</label>
          <input
            id="template-title"
            className="field-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Quarterly Report"
            required
          />

          <label className="field-label" htmlFor="template-slug">Slug (optional)</label>
          <input
            id="template-slug"
            className="field-input"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="e.g. quarterly-report"
          />
          <small className="field-hint">
            If empty, slug is generated from title.
          </small>

          <label className="field-label" htmlFor="template-category">Category *</label>
          <select
            id="template-category"
            className="field-input"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            disabled={loadingCategories}
            required
          >
            <option value="">{loadingCategories ? 'Loading categories...' : 'Select a category'}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name} ({editorTypeName[category.editorTypeId] ?? `Type ${category.editorTypeId}`})
              </option>
            ))}
          </select>

          {!loadingCategories && categories.length === 0 ? (
            <div className="form-error">No categories available. Create a category first.</div>
          ) : null}

          {error ? <div className="form-error">{error}</div> : null}

          <div className="modal-actions">
            <button type="button" className="ghost-btn" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="primary-btn" disabled={!canSubmit}>
              {submitting ? 'Creating...' : 'Create Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
