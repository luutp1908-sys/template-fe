import type {
  EditorObject,
  EditorObjectType,
  Page,
  PageBackground,
} from '../types/editor'

export type AddObjectCommand = {
  type: 'addObject'
  objectType: EditorObjectType
  defaults?: Partial<EditorObject>
}

export type UpdateObjectCommand = {
  type: 'updateObject'
  id: number
  updates: Partial<EditorObject>
}

export type DeleteObjectCommand = {
  type: 'deleteObject'
  id: number
}

export type DuplicateObjectCommand = {
  type: 'duplicateObject'
  id: number
}

export type ToggleObjectLockCommand = {
  type: 'toggleObjectLock'
  id: number
}

export type AddPageCommand = {
  type: 'addPage'
  page?: Partial<Page>
}

export type SetCurrentPageIndexCommand = {
  type: 'setCurrentPageIndex'
  index: number
}

export type SetPageBackgroundCommand = {
  type: 'setPageBackground'
  background: PageBackground
}

export type EditorCommand =
  | AddObjectCommand
  | UpdateObjectCommand
  | DeleteObjectCommand
  | DuplicateObjectCommand
  | ToggleObjectLockCommand
  | AddPageCommand
  | SetCurrentPageIndexCommand
  | SetPageBackgroundCommand
