import React from 'react'
import { useAppSelector } from '../../store/hooks'
import {
  selectSelectedId,
  selectCategoryById,
  selectBreadcrumbs,
  selectChildren,
  selectDescendants,
} from '../store/selectors'
import { EDITOR_TYPE_LABELS } from '../constants/editorTypes'

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
      </div>
    </section>
  )
}
