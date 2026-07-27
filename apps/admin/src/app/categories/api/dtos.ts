// DTOs and TypeScript models for Category Management API

export interface CategoryDTO {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  parentId?: string | null;
  editorTypeId: number;
  templateCount: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  version?: number;
}

export interface EditorTypeDTO {
  id: number;
  name: string;
}

export interface TemplateSummaryDTO {
  id: string;
  title: string;
  thumbnailUrl?: string | null;
  published: boolean;
}

export interface ReorderMoveDTO {
  id: string;
  parentId?: string | null;
  sortOrder: number;
}

export interface ApiErrorDTO {
  code: string;
  message: string;
  details?: any;
}

// API request/response shapes
export interface CreateCategoryRequest {
  name: string;
  slug?: string;
  description?: string | null;
  parentId?: string | null;
  editorTypeId: number;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string | null;
  parentId?: string | null;
  version?: number;
}

export interface ReorderRequest {
  moves: ReorderMoveDTO[];
}

export interface SearchParams {
  q?: string;
  editorTypeId?: number;
  limit?: number;
}

export interface CreateTemplateRequest {
  title: string;
  slug: string;
  editorTypeId: number;
  categoryId: string;
  status?: 'draft' | 'published' | 'archived';
}

export interface TemplateDTO {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  categoryId: string;
  editorTypeId: number;
  createdAt: string;
  updatedAt: string;
}
