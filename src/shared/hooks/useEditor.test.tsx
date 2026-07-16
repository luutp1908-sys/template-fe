import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useEditor } from './useEditor'
import type { EditorObject } from '../types/editor'

const initialObjects = [
  {
    id: 1,
    type: 'rect',
    x: 100,
    y: 120,
    width: 180,
    height: 100,
    rotate: 0,
    color: '#0066cc',
  },
  {
    id: 2,
    type: 'text',
    x: 240,
    y: 280,
    width: 200,
    height: 60,
    rotate: 0,
    text: 'Hello',
  },
]

describe('useEditor', () => {
  it('initializes with provided objects and selected id', () => {
    const { result } = renderHook(() => useEditor(initialObjects))

    expect(result.current.objects).toHaveLength(2)
    expect(result.current.selectedId).toBe(1)
    expect(result.current.selectedObject?.id).toBe(1)
  })

  it('updates object properties by id', () => {
    const { result } = renderHook(() => useEditor(initialObjects))

    act(() => {
      result.current.updateObject(2, { x: 300, rotate: 25 })
    })

    const updated = result.current.objects.find((obj) => obj.id === 2)
    expect(updated?.x).toBe(300)
    expect(updated?.rotate).toBe(25)
  })

  it('adds a new object and selects it', () => {
    const { result } = renderHook(() => useEditor(initialObjects))

    let newObject: EditorObject
    act(() => {
      newObject = result.current.addObject('rect', { color: '#ff0000' })
    })

    expect(result.current.objects).toHaveLength(3)
    expect(result.current.selectedId).toBe(newObject.id)
    expect(newObject.type).toBe('rect')
    expect(newObject.color).toBe('#ff0000')
  })

  it('deletes selected object and falls back to first remaining object', () => {
    const { result } = renderHook(() => useEditor(initialObjects))

    act(() => {
      result.current.deleteObject(1)
    })

    expect(result.current.objects).toHaveLength(1)
    expect(result.current.selectedId).toBe(2)
    expect(result.current.selectedObject?.id).toBe(2)
  })

  it('clears selected id when deleting the last object', () => {
    const { result } = renderHook(() => useEditor([
      {
        id: 1,
        type: 'rect',
        x: 0,
        y: 0,
        width: 50,
        height: 50,
        rotate: 0,
      },
    ]))

    act(() => {
      result.current.deleteSelected()
    })

    expect(result.current.objects).toHaveLength(0)
    expect(result.current.selectedId).toBeNull()
    expect(result.current.selectedObject).toBeUndefined()
  })

  it('changes active tool', () => {
    const { result } = renderHook(() => useEditor(initialObjects))

    act(() => {
      result.current.setActiveTool('text')
    })

    expect(result.current.activeTool).toBe('text')
  })

  it('adds text with base layer defaults', () => {
    const { result } = renderHook(() => useEditor([]))

    act(() => {
      result.current.addObject('text')
    })

    const created = result.current.objects[0]
    expect(created.type).toBe('text')
    expect(created.visible).toBe(true)
    expect(created.locked).toBe(false)
    if (created.type === 'text') {
      expect(created.text).toBe('New text')
      expect(created.fontSize).toBe(32)
      expect(created.fontWeight).toBe('normal')
      expect(created.textAlign).toBe('left')
      expect(created.wrapMode).toBe('fixed')
    }
  })

  it('does not change objects when updating a missing id', () => {
    const { result } = renderHook(() => useEditor(initialObjects))
    const before = result.current.objects

    act(() => {
      result.current.updateObject(999999, { x: 999, y: 999 })
    })

    expect(result.current.objects).toEqual(before)
    expect(result.current.selectedId).toBe(1)
  })

  it('does not change objects or selection when deleting a missing id', () => {
    const { result } = renderHook(() => useEditor(initialObjects))

    act(() => {
      result.current.deleteObject(999999)
    })

    expect(result.current.objects).toHaveLength(2)
    expect(result.current.selectedId).toBe(1)
    expect(result.current.selectedObject?.id).toBe(1)
  })

  it('initializes with null selection when starting from an empty list', () => {
    const { result } = renderHook(() => useEditor([]))

    expect(result.current.objects).toHaveLength(0)
    expect(result.current.selectedId).toBeNull()
    expect(result.current.selectedObject).toBeUndefined()
  })

  it('can add object from empty state and select the new object', () => {
    const { result } = renderHook(() => useEditor([]))

    let created: EditorObject
    act(() => {
      created = result.current.addObject('text', { text: 'First' })
    })

    expect(result.current.objects).toHaveLength(1)
    expect(result.current.selectedId).toBe(created.id)
    expect(result.current.selectedObject?.id).toBe(created.id)
    expect(result.current.selectedObject?.text).toBe('First')
  })
})
