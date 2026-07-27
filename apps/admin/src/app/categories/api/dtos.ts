// DTOs and TypeScript models for Category Management API

export interface CategoryDTO {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  parentId?: string | null;
  editorTypeId: string;
  templateCount: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  version?: number;
}

export interface EditorTypeDTO {
  id: string;
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
  description?: string | null;
  parentId?: string | null;
  editorTypeId: string;
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
  editorTypeId?: string;
  limit?: number;
}
