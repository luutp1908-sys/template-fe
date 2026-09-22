import { useCallback, useState } from 'react'
import type { Page } from '../types/editor'

export type EditorDomainState = {
  pages: Page[]
  currentPageIndex: number
  selectedId: number | null
}

type EditorHistoryState = {
  past: EditorDomainState[]
  present: EditorDomainState
  future: EditorDomainState[]
}

type UpdatePresentOptions = {
  trackHistory?: boolean
}

const createHistoryState = (present: EditorDomainState): EditorHistoryState => ({
  past: [],
  present,
  future: [],
})

export const useEditorHistory = (initialPresent: EditorDomainState) => {
  const [history, setHistory] = useState<EditorHistoryState>(() => createHistoryState(initialPresent))

  const updatePresent = useCallback(
    (
      updater: (current: EditorDomainState) => EditorDomainState,
      options: UpdatePresentOptions = {},
    ) => {
      const { trackHistory = true } = options

      setHistory((current) => {
        const nextPresent = updater(current.present)
        if (nextPresent === current.present) {
          return current
        }

        if (!trackHistory) {
          return {
            ...current,
            present: nextPresent,
          }
        }

        return {
          past: [...current.past, current.present],
          present: nextPresent,
          future: [],
        }
      })
    },
    [],
  )

  const resetHistory = useCallback((present: EditorDomainState) => {
    setHistory(createHistoryState(present))
  }, [])

  const undo = useCallback(() => {
    setHistory((current) => {
      if (current.past.length === 0) {
        return current
      }

      const previous = current.past[current.past.length - 1]
      return {
        past: current.past.slice(0, -1),
        present: previous,
        future: [current.present, ...current.future],
      }
    })
  }, [])

  const redo = useCallback(() => {
    setHistory((current) => {
      if (current.future.length === 0) {
        return current
      }

      const [next, ...remainingFuture] = current.future
      return {
        past: [...current.past, current.present],
        present: next,
        future: remainingFuture,
      }
    })
  }, [])

  return {
    history,
    present: history.present,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    updatePresent,
    resetHistory,
    undo,
    redo,
  }
}

export default useEditorHistory