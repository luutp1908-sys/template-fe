import { useEffect, useRef, useState } from 'react'
import type { EditorObject } from '../../shared/types/editor'

export type ImageLoadStatus = 'idle' | 'loading' | 'loaded' | 'error'

type UseCanvasImageLifecycleInput = {
  objects: EditorObject[]
  onImageLoaded: () => void
}

export const useCanvasImageLifecycle = ({
  objects,
  onImageLoaded,
}: UseCanvasImageLifecycleInput) => {
  const [imageLoadStates, setImageLoadStates] = useState<Record<number, ImageLoadStatus>>({})
  const [imageRetryTokens, setImageRetryTokens] = useState<Record<number, number>>({})
  const previousImageSrcRef = useRef<Record<number, string>>({})

  useEffect(() => {
    const currentImageSrc: Record<number, string> = {}

    for (const obj of objects) {
      if (obj.type !== 'image') continue
      const src = obj.imageConfig?.url ?? ''
      currentImageSrc[obj.id] = src

      const previousSrc = previousImageSrcRef.current[obj.id]
      if (previousSrc === src) continue

      if (previousSrc && previousSrc.startsWith('blob:')) {
        URL.revokeObjectURL(previousSrc)
      }

      setImageLoadStates((current) => ({
        ...current,
        [obj.id]: src ? 'loading' : 'idle',
      }))
    }

    for (const [idText, previousSrc] of Object.entries(previousImageSrcRef.current)) {
      const id = Number(idText)
      if (id in currentImageSrc) continue
      if (previousSrc.startsWith('blob:')) {
        URL.revokeObjectURL(previousSrc)
      }
      setImageLoadStates((current) => {
        const next = { ...current }
        delete next[id]
        return next
      })
      setImageRetryTokens((current) => {
        const next = { ...current }
        delete next[id]
        return next
      })
    }

    previousImageSrcRef.current = currentImageSrc
  }, [objects])

  useEffect(() => {
    return () => {
      for (const src of Object.values(previousImageSrcRef.current)) {
        if (src.startsWith('blob:')) {
          URL.revokeObjectURL(src)
        }
      }
    }
  }, [])

  const handleImageLoad = (id: number) => {
    setImageLoadStates((current) => ({ ...current, [id]: 'loaded' }))
    onImageLoaded()
  }

  const handleImageError = (id: number) => {
    setImageLoadStates((current) => ({ ...current, [id]: 'error' }))
  }

  const handleRetry = (id: number) => {
    setImageLoadStates((current) => ({ ...current, [id]: 'loading' }))
    setImageRetryTokens((current) => ({
      ...current,
      [id]: (current[id] ?? 0) + 1,
    }))
  }

  return {
    imageLoadStates,
    imageRetryTokens,
    handleImageLoad,
    handleImageError,
    handleRetry,
  }
}