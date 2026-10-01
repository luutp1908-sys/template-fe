/** @vitest-environment jsdom */

import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { EditorObject, Page } from '../types/editor'
import { useEditor } from '../hooks/useEditor'
import { createYjsEditorDocument, syncPagesToYjsDocument, toPlainPagesFromYjsDocument } from './yjsEditorDocument'

describe('yjsEditorDocument', () => {
  it('creates a Yjs document from editor pages and preserves nested layer data', () => {
    const pages: Page[] = [
      {
        id: 'page-1',
        width: 1024,
        height: 768,
        background: { color: '#ffffff' },
        layers: [
          {
            id: 1,
            type: 'text',
            x: 120,
            y: 180,
            width: 240,
            height: 80,
            rotate: 0,
            text: 'Hello Yjs',
            textColor: '#111827',
          },
        ],
      },
    ]

    const doc = createYjsEditorDocument(pages)
    const nextPages = toPlainPagesFromYjsDocument(doc)

    expect(nextPages).toHaveLength(1)
    expect(nextPages[0].id).toBe('page-1')
    expect(nextPages[0].layers[0].type).toBe('text')

    if (nextPages[0].layers[0].type === 'text') {
      expect(nextPages[0].layers[0].text).toBe('Hello Yjs')
    }
  })

  it('syncs remote document changes back into the plain page model', () => {
    const original: Page[] = [
      {
        id: 'page-1',
        width: 1024,
        height: 768,
        background: { color: '#ffffff' },
        layers: [
          {
            id: 1,
            type: 'rect',
            x: 50,
            y: 60,
            width: 100,
            height: 70,
            rotate: 0,
            color: '#0066cc',
          },
        ],
      },
    ]

    const updated: Page[] = [
      {
        id: 'page-1',
        width: 1024,
        height: 768,
        background: { color: '#dfeafc' },
        layers: [
          {
            id: 1,
            type: 'rect',
            x: 90,
            y: 90,
            width: 140,
            height: 90,
            rotate: 12,
            color: '#ff0000',
          },
        ],
      },
    ]

    const doc = createYjsEditorDocument(original)
    syncPagesToYjsDocument(doc, updated)

    expect(toPlainPagesFromYjsDocument(doc)).toEqual(updated)
  })

  it('keeps the live editor state synced to the Yjs document', () => {
    const initial: EditorObject[] = [
      {
        id: 1,
        type: 'text',
        x: 10,
        y: 20,
        width: 120,
        height: 40,
        rotate: 0,
        text: 'before',
        textColor: '#111827',
      },
    ]

    const { result } = renderHook(() => useEditor(initial))

    expect(result.current.yjsDoc).toBeTruthy()
    expect(toPlainPagesFromYjsDocument(result.current.yjsDoc)).toEqual(result.current.pages)

    act(() => {
      result.current.updateObject(1, { x: 120, y: 180 })
    })

    expect(toPlainPagesFromYjsDocument(result.current.yjsDoc)).toEqual(result.current.pages)
  })
})
