import { CategoryDTO, CreateCategoryRequest } from './dtos';

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export interface CategoryListQuery {
  editorTypeId?: string;
  search?: string;
}

const API_BASE = import.meta.env.VITE_BE_API_BASE ?? 'http://localhost:4000/api/v1';

function toCategoryDTO(item: any, sortOrder: number): CategoryDTO {
  return {
    id: item.id,
    name: item.name,
    slug: item.slug,
    parentId: item.parentId ?? null,
    editorTypeId: item.editorTypeId,
    templateCount: item.templateCount ?? 0,
    sortOrder,
    createdAt: typeof item.createdAt === 'string' ? item.createdAt : new Date(item.createdAt).toISOString(),
    updatedAt: typeof item.updatedAt === 'string' ? item.updatedAt : new Date(item.updatedAt).toISOString(),
    description: item.description ?? null,
  };
}

export async function fetchCategories(query: CategoryListQuery): Promise<CategoryDTO[]> {
  const params = new URLSearchParams();
  if (query.editorTypeId) params.set('editorTypeId', query.editorTypeId);
  if (query.search) params.set('search', query.search);

  const response = await fetch(`${API_BASE}/category?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.status}`);
  }

  const json = (await response.json()) as ApiEnvelope<any[]>;
  const rows = Array.isArray(json?.data) ? json.data : [];
  return rows.map((item, index) => toCategoryDTO(item, item.sortOrder ?? index));
}

export async function createCategory(payload: CreateCategoryRequest): Promise<CategoryDTO> {
  const response = await fetch(`${API_BASE}/category`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const msg = await response.text();
    throw new Error(`Failed to create category (${response.status}): ${msg}`);
  }

  const json = (await response.json()) as ApiEnvelope<any>;
  return toCategoryDTO(json.data, json.data?.sortOrder ?? 0);
}
