import { CreateTemplateRequest, TemplateDTO } from './dtos'

interface ApiEnvelope<T> {
  success: boolean
  data: T
  timestamp: string
}

const API_BASE = import.meta.env.VITE_BE_API_BASE ?? 'http://localhost:4000/api/v1'

export interface TemplateListQuery {
  page?: number
  pageSize?: number
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'status'
  sortOrder?: 'asc' | 'desc'
  status?: 'draft' | 'published' | 'archived'
  search?: string
}

export interface TemplateListResult {
  items: TemplateDTO[]
  total: number
  page: number
  pageSize: number
}

function parseEditorTypeId(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const trimmed = value.trim().toLowerCase()
    if (trimmed === 'graphic') return 0
    if (trimmed === 'document') return 1
    if (trimmed === 'whiteboard') return 2
    const n = Number(trimmed)
    if (Number.isFinite(n)) return n
  }
  return 0
}

function toTemplateDTO(item: any): TemplateDTO {
  return {
    id: item.id,
    title: item.title,
    slug: item.slug,
    status: item.status ?? 'draft',
    categoryId: item.category?.id ?? item.categoryId ?? '',
    editorTypeId: parseEditorTypeId(item.editorType?.id ?? item.editorTypeId ?? 0),
    categoryName: item.category?.name ?? '',
    editorTypeName: item.editorType?.name ?? '',
    createdAt: typeof item.createdAt === 'string' ? item.createdAt : new Date(item.createdAt).toISOString(),
    updatedAt: typeof item.updatedAt === 'string' ? item.updatedAt : new Date(item.updatedAt).toISOString(),
  }
}

export async function fetchTemplates(query: TemplateListQuery): Promise<TemplateListResult> {
  const params = new URLSearchParams()
  if (query.page) params.set('page', String(query.page))
  if (query.pageSize) params.set('pageSize', String(query.pageSize))
  if (query.sortBy) params.set('sortBy', query.sortBy)
  if (query.sortOrder) params.set('sortOrder', query.sortOrder)
  if (query.status) params.set('status', query.status)
  if (query.search) params.set('search', query.search)

  const response = await fetch(`${API_BASE}/template?${params.toString()}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch templates: ${response.status}`)
  }

  const json = (await response.json()) as ApiEnvelope<any>
  const data = json?.data ?? {}
  const items = Array.isArray(data.items) ? data.items.map(toTemplateDTO) : []

  return {
    items,
    total: Number(data.total ?? 0),
    page: Number(data.page ?? query.page ?? 1),
    pageSize: Number(data.pageSize ?? query.pageSize ?? 10),
  }
}

export async function createTemplate(payload: CreateTemplateRequest): Promise<TemplateDTO> {
  const response = await fetch(`${API_BASE}/template`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const msg = await response.text()
    throw new Error(`Failed to create template (${response.status}): ${msg}`)
  }

  const json = (await response.json()) as ApiEnvelope<any>
  return toTemplateDTO(json.data)
}
