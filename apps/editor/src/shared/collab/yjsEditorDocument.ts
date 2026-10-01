import * as Y from 'yjs'
import type { Page } from '../types/editor'

const ROOT_KEY = 'editor-document'

const cloneSerializable = <T>(value: T): T => JSON.parse(JSON.stringify(value))

export const createYjsEditorDocument = (pages: Page[] = []): Y.Doc => {
  const doc = new Y.Doc()
  syncPagesToYjsDocument(doc, pages)
  return doc
}

export const syncPagesToYjsDocument = (doc: Y.Doc, pages: Page[]) => {
  const root = doc.getMap(ROOT_KEY)
  root.set('pages', JSON.stringify(cloneSerializable(pages)))
}

export const toPlainPagesFromYjsDocument = (doc: Y.Doc): Page[] => {
  const root = doc.getMap(ROOT_KEY)
  const raw = root.get('pages')

  if (typeof raw !== 'string') {
    return []
  }

  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? cloneSerializable(parsed as Page[]) : []
  } catch {
    return []
  }
}

export const patchYjsEditorDocument = (doc: Y.Doc, nextPages: Page[]) => {
  syncPagesToYjsDocument(doc, nextPages)
}
