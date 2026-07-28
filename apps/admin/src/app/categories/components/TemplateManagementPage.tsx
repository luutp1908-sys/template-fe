import React, { useCallback, useEffect, useMemo, useState } from 'react'
import CreateTemplateModal from './CreateTemplateModal'
import { fetchTemplates } from '../api/templates.api'
import { TemplateDTO } from '../api/dtos'

const editorTypeLabel: Record<number, string> = {
  0: 'Graphic',
  1: 'Document',
  2: 'Whiteboard',
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export default function TemplateManagementPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [templates, setTemplates] = useState<TemplateDTO[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published' | 'archived'>('all')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [total, setTotal] = useState(0)

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize])
  const draftCount = useMemo(() => templates.filter((item) => item.status === 'draft').length, [templates])
  const publishedCount = useMemo(() => templates.filter((item) => item.status === 'published').length, [templates])
  const archivedCount = useMemo(() => templates.filter((item) => item.status === 'archived').length, [templates])

  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await fetchTemplates({
        page,
        pageSize,
        sortBy: 'updatedAt',
        sortOrder: 'desc',
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: search.trim() || undefined,
      })
      setTemplates(result.items)
      setTotal(result.total)
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load templates')
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, search, statusFilter])

  useEffect(() => {
    void loadTemplates()
  }, [loadTemplates])

  useEffect(() => {
    setPage(1)
  }, [search, statusFilter])

  return (
    <section className="template-page">
      <div className="template-card">
        <div className="template-headline">
          <div>
            <div className="template-eyebrow">Content Studio</div>
            <h2>Template Management</h2>
            <p>
              Curate your template library with searchable metadata and fast creation flows.
            </p>
          </div>

          <button
            type="button"
            className="primary-btn template-create-btn"
            onClick={() => {
              setSuccessMessage(null)
              setIsModalOpen(true)
            }}
          >
            Create Template
          </button>
        </div>

        {successMessage ? <div className="form-success">{successMessage}</div> : null}

        <div className="template-stats-grid">
          <div className="template-stat-card">
            <span className="template-stat-label">Total Templates</span>
            <strong className="template-stat-value">{total}</strong>
          </div>
          <div className="template-stat-card">
            <span className="template-stat-label">Published On This Page</span>
            <strong className="template-stat-value">{publishedCount}</strong>
          </div>
          <div className="template-stat-card">
            <span className="template-stat-label">Draft On This Page</span>
            <strong className="template-stat-value">{draftCount}</strong>
          </div>
          <div className="template-stat-card">
            <span className="template-stat-label">Archived On This Page</span>
            <strong className="template-stat-value">{archivedCount}</strong>
          </div>
        </div>

        <div className="template-toolbar">
          <input
            type="text"
            className="category-search-input template-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search template title"
            aria-label="Search templates"
          />
          <select
            className="field-input template-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'draft' | 'published' | 'archived')}
            aria-label="Filter by status"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {error ? <div className="form-error">{error}</div> : null}

        <div className="template-table-wrap" aria-live="polite">
          <table className="template-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Slug</th>
                <th>Category</th>
                <th>Editor Type</th>
                <th>Status</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="template-table-state">Loading templates...</td>
                </tr>
              ) : templates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="template-table-state">No templates found.</td>
                </tr>
              ) : (
                templates.map((item) => (
                  <tr key={item.id}>
                    <td>{item.title}</td>
                    <td>{item.slug}</td>
                    <td>{item.categoryName || item.categoryId}</td>
                    <td>{item.editorTypeName || editorTypeLabel[item.editorTypeId] || '-'}</td>
                    <td>
                      <span className={`status-chip status-${item.status}`}>{item.status}</span>
                    </td>
                    <td>{formatDate(item.updatedAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="template-pagination">
          <span className="template-results-meta">
            Showing {templates.length} of {total} templates
          </span>
          <button
            type="button"
            className="ghost-btn"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={loading || page <= 1}
          >
            Prev
          </button>
          <span>
            Page {page} / {totalPages}
          </span>
          <button
            type="button"
            className="ghost-btn"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={loading || page >= totalPages}
          >
            Next
          </button>
        </div>
      </div>

      <CreateTemplateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={(createdTitle) => {
          setSuccessMessage(`Template \"${createdTitle}\" created successfully.`)
          void loadTemplates()
        }}
      />
    </section>
  )
}
