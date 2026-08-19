import React, { useEffect, useState } from 'react'
import { useAppSelector } from '../../store/hooks'
import {
  selectSelectedId,
  selectCategoryById,
  selectBreadcrumbs,
  selectChildren,
  selectDescendants,
} from '../store/selectors'
import { EDITOR_TYPE_LABELS } from '../constants/editorTypes'
import { fetchCategoryTemplates } from '../api/templates.api'
import { TemplateDTO } from '../api/dtos'

function formatDate(value: string | undefined) {
  if (!value) return '-'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '-'
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsed)
}

export default function CategoryDetailPanel() {
  const selectedId = useAppSelector(selectSelectedId as any)
  const category = useAppSelector((s) => selectCategoryById(s, selectedId as any))
  const breadcrumbs = useAppSelector((s) => selectBreadcrumbs(s, selectedId as any))
  const children = useAppSelector((s) => selectChildren(s, selectedId as any))
  const descendants = useAppSelector((s) => selectDescendants(s, selectedId as any))
  const [templates, setTemplates] = useState<TemplateDTO[]>([])
  const [loadingTemplates, setLoadingTemplates] = useState(false)
  const [templatesError, setTemplatesError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadTemplates(categoryId: string) {
      try {
        setLoadingTemplates(true)
        setTemplatesError(null)
        const rows = await fetchCategoryTemplates(categoryId)
        if (!active) return
        setTemplates(rows)
      } catch (error: any) {
        if (!active) return
        setTemplates([])
        setTemplatesError(error?.message ?? 'Failed to load category templates')
      } finally {
        if (active) {
          setLoadingTemplates(false)
        }
      }
    }

    if (!category?.id) {
      setTemplates([])
      setTemplatesError(null)
      setLoadingTemplates(false)
      return () => {
        active = false
      }
    }

    void loadTemplates(category.id)

    return () => {
      active = false
    }
  }, [category?.id])

  if (!category) {
    return (
      <section className="category-detail-empty" aria-live="polite">
        <div className="category-detail-empty-badge">Category Detail</div>
        <h3 className="category-detail-empty-title">Select a category</h3>
        <p className="category-detail-empty-copy">
          Pick a node from the left tree to view hierarchy, metadata, and template statistics.
        </p>
      </section>
    )
  }

  const description = category.description?.trim() || 'No description has been added for this category yet.'

  return (
    <section className="category-detail-panel" aria-live="polite">
      <div className="category-detail-headline">
        <div>
          <div className="category-detail-eyebrow">Category Insight</div>
          <h2>{category.name}</h2>
          <p className="category-detail-breadcrumbs" aria-label="Category breadcrumb">
            {breadcrumbs.map((item) => item.name).join(' / ')}
          </p>
        </div>
        <span className="category-detail-editor-chip">
          {EDITOR_TYPE_LABELS[category.editorTypeId] ?? `Type ${category.editorTypeId}`}
        </span>
      </div>

      <p className="category-detail-description">{description}</p>

      <div className="category-detail-stats-grid">
        <article className="category-detail-stat-card">
          <span className="category-detail-stat-label">Templates</span>
          <strong className="category-detail-stat-value">{category.templateCount ?? 0}</strong>
        </article>
        <article className="category-detail-stat-card">
          <span className="category-detail-stat-label">Direct Children</span>
          <strong className="category-detail-stat-value">{children.length}</strong>
        </article>
        <article className="category-detail-stat-card">
          <span className="category-detail-stat-label">All Descendants</span>
          <strong className="category-detail-stat-value">{descendants.length}</strong>
        </article>
      </div>

      <div className="category-detail-templates">
        <div className="category-detail-template-list-head">
          <div>
            <div className="category-detail-eyebrow">Templates in Category</div>
            <h3>Category Templates</h3>
          </div>
          <span className="category-detail-editor-chip">{templates.length} loaded</span>
        </div>

        {loadingTemplates ? (
          <div className="template-table-state">Loading templates...</div>
        ) : templatesError ? (
          <div className="form-error">{templatesError}</div>
        ) : templates.length === 0 ? (
          <div className="template-table-state">No templates found for this category.</div>
        ) : (
          <div className="template-table-wrap">
            <table className="template-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Slug</th>
                  <th>Status</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((item) => (
                  <tr key={item.id}>
                    <td>{item.title}</td>
                    <td>{item.slug}</td>
                    <td>
                      <span className={`status-chip status-${item.status}`}>{item.status}</span>
                    </td>
                    <td>{formatDate(item.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
{/* 
      <div className="category-detail-meta-grid">
        <div className="category-detail-meta-item">
          <span className="category-detail-meta-key">Slug</span>
          <span className="category-detail-meta-value">{category.slug}</span>
        </div>
        <div className="category-detail-meta-item">
          <span className="category-detail-meta-key">Category ID</span>
          <span className="category-detail-meta-value category-detail-mono">{category.id}</span>
        </div>
        <div className="category-detail-meta-item">
          <span className="category-detail-meta-key">Parent ID</span>
          <span className="category-detail-meta-value category-detail-mono">{category.parentId ?? 'Root Category'}</span>
        </div>
        <div className="category-detail-meta-item">
          <span className="category-detail-meta-key">Sort Order</span>
          <span className="category-detail-meta-value">{category.sortOrder}</span>
        </div>
        <div className="category-detail-meta-item">
          <span className="category-detail-meta-key">Created At</span>
          <span className="category-detail-meta-value">{formatDate(category.createdAt)}</span>
        </div>
        <div className="category-detail-meta-item">
          <span className="category-detail-meta-key">Updated At</span>
          <span className="category-detail-meta-value">{formatDate(category.updatedAt)}</span>
        </div>
      </div> */}
    </section>
  )
}
