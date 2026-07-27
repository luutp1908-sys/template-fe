import { CreateTemplateRequest, TemplateDTO } from './dtos'

interface ApiEnvelope<T> {
  success: boolean
  data: T
  timestamp: string
}

const API_BASE = import.meta.env.VITE_BE_API_BASE ?? 'http://localhost:4000/api/v1'

function toTemplateDTO(item: any): TemplateDTO {
  return {
    id: item.id,
    title: item.title,
    slug: item.slug,
    status: item.status ?? 'draft',
    categoryId: item.category?.id ?? item.categoryId ?? '',
    editorTypeId: Number(item.editorType?.id ?? item.editorTypeId ?? 0),
    createdAt: typeof item.createdAt === 'string' ? item.createdAt : new Date(item.createdAt).toISOString(),
    updatedAt: typeof item.updatedAt === 'string' ? item.updatedAt : new Date(item.updatedAt).toISOString(),
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
